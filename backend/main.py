from __future__ import annotations

import logging
from contextlib import suppress
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

load_dotenv(Path(__file__).with_name('.env'))

from .agent import ira_agent  # noqa: E402
from .services.event_bus import EventBus  # noqa: E402
from .services.ledger_store import LedgerStore  # noqa: E402
from .services.schemas import FeedEvent, LiveClientMessage  # noqa: E402
from .services.vertex_live import VertexLiveSession  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ripple Kernel Control Plane", version="0.3.0")
event_bus = EventBus()
ledger_store = LedgerStore()


async def handle_function_response(function_response: dict) -> dict:
    if function_response.get("tool_name") != "mint_truth_token":
        return {
            "status": "IGNORED",
            "reason": f"Unsupported tool {function_response.get('tool_name')}",
        }

    response_payload = function_response.get("response", {}) or {}
    token = response_payload.get("token") or {}
    if not token:
        return {"status": "IGNORED", "reason": "Missing token payload"}

    event = FeedEvent(
        type="TOKEN_MINTED",
        payload={
            "token_id": token.get("token_id"),
            "signal_type": token.get("signal_type"),
            "lat": token.get("lat"),
            "lng": token.get("lng"),
            "intensity": token.get("intensity"),
            "confidence": token.get("confidence"),
            "metadata": token.get("metadata", {}),
            "tag": f"TOKEN_MINTED: [{token.get('signal_type')}] // CONFIDENCE: {float(token.get('confidence', 0)):.2f}",
        },
    )
    await event_bus.publish(event.model_dump_json())
    return {"status": response_payload.get("status", "SUCCESS"), "token_id": token.get("token_id")}


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "active"}


@app.get("/ledger/recent")
async def recent_ledger() -> list[dict]:
    tokens = await ledger_store.list_recent_tokens()
    return [token.model_dump() for token in tokens]


@app.websocket("/ws/feed")
async def feed_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        async for message in event_bus.subscribe():
            await websocket.send_text(message)
    except WebSocketDisconnect:
        logger.info("Feed client disconnected.")


@app.websocket("/ws/live")
async def live_kernel_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    session = VertexLiveSession(agent=ira_agent)
    await session.open()

    try:
        await websocket.send_text(
            FeedEvent(
                type="SESSION_STATE",
                payload={"status": "READY", "agent": getattr(ira_agent, "name", "Ripple")},
            ).model_dump_json()
        )

        while True:
            raw_message = await websocket.receive_text()
            client_message = LiveClientMessage.model_validate_json(raw_message)
            output = await session.send_input(client_message)

            for function_response in output.function_responses:
                tool_result = await handle_function_response(function_response)
                await websocket.send_text(
                    FeedEvent(type="SESSION_STATE", payload={"tool_result": tool_result}).model_dump_json()
                )

            for state_update in output.state_updates:
                await websocket.send_text(
                    FeedEvent(
                        type="SESSION_STATE",
                        payload=state_update,
                    ).model_dump_json()
                )

            for text_chunk in output.text_chunks:
                event = FeedEvent(
                    type="NARRATION",
                    payload={"text": text_chunk},
                )
                await websocket.send_text(event.model_dump_json())

            for audio_chunk in output.audio_chunks:
                await websocket.send_bytes(audio_chunk)

    except WebSocketDisconnect:
        logger.info("Live client disconnected.")
    finally:
        with suppress(Exception):
            await session.close()
