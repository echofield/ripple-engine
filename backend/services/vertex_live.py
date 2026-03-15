from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import uuid
from dataclasses import dataclass
from typing import Any

from .schemas import LiveClientMessage, RunnerOutput

logger = logging.getLogger(__name__)


try:
    from google.adk.runners import Runner  # type: ignore
    from google.adk.agents.live_request_queue import LiveRequestQueue  # type: ignore
    from google.adk.agents.run_config import RunConfig, StreamingMode  # type: ignore
    from google.adk.sessions import InMemorySessionService  # type: ignore
    from google.genai import types as genai_types  # type: ignore
    ADK_AVAILABLE = True
except ImportError:  # pragma: no cover - local scaffold fallback
    Runner = None  # type: ignore
    LiveRequestQueue = None  # type: ignore
    RunConfig = None  # type: ignore
    StreamingMode = None  # type: ignore
    InMemorySessionService = None  # type: ignore
    genai_types = None  # type: ignore
    ADK_AVAILABLE = False


@dataclass
class LiveRuntime:
    session_id: str
    queue: Any
    events_task: asyncio.Task[Any]


class VertexLiveSession:
    """ADK live-session adapter for Vertex AI."""

    def __init__(self, agent: Any) -> None:
        self._agent = agent
        self._opened = False
        self._runtime: LiveRuntime | None = None
        self._event_queue: asyncio.Queue[Any] = asyncio.Queue()
        self._app_name = os.getenv("ADK_APP_NAME", "ripple-kernel")
        self._user_id = os.getenv("ADK_USER_ID", "collective")
        self._native_audio = "native-audio" in str(getattr(agent, "model", "")).lower()
        self._response_modality = os.getenv("VERTEX_RESPONSE_MODALITY", "TEXT").upper()

        if ADK_AVAILABLE:
            self._session_service = InMemorySessionService()
            self._runner = Runner(
                app_name=self._app_name,
                agent=self._agent,
                session_service=self._session_service,
            )
        else:
            self._session_service = None
            self._runner = None

    async def open(self) -> None:
        self._opened = True
        if ADK_AVAILABLE:
            await self._start_runtime()

    async def close(self) -> None:
        self._opened = False
        if self._runtime:
            self._runtime.queue.close()
            self._runtime.events_task.cancel()
            self._runtime = None

    async def send_input(self, message: LiveClientMessage) -> RunnerOutput:
        if not self._opened:
            raise RuntimeError("Vertex live session has not been opened.")

        if ADK_AVAILABLE and self._runtime:
            await self._send_to_adk(message)
            return await self._drain_adk_events(*self._timeouts_for_message(message))

        if message.type == "control":
            return RunnerOutput(
                state_updates=[{"status": "READY", "agent": getattr(self._agent, "name", "unknown")}]
            )

        if message.type == "realtime_input" and message.realtime_input:
            return self._handle_realtime_packet(
                message.realtime_input.audio,
                message.realtime_input.image,
                message.realtime_input.text,
                message.realtime_input.mime_type,
                message.realtime_input.image_mime_type,
                message.realtime_input.metadata,
            )

        if message.type == "text" and message.data:
            return self._handle_text(message.data, message.metadata)

        if message.type == "image" and message.data:
            return self._handle_image(message.data, message.mime_type)

        if message.type == "audio" and message.data:
            return self._handle_audio(message.data, message.mime_type)

        logger.info("Unhandled live message: %s", message.type)
        return RunnerOutput()

    def _timeouts_for_message(self, message: LiveClientMessage) -> tuple[float, float]:
        if message.type == "text":
            return (8.0, 0.75)
        if message.type == "control":
            return (1.0, 0.25)
        if message.type == "realtime_input" and message.realtime_input and message.realtime_input.text:
            return (8.0, 0.75)
        return (0.6, 0.25)

    async def _start_runtime(self) -> None:
        session_id = str(uuid.uuid4())
        session = await self._session_service.create_session(
            app_name=self._app_name,
            user_id=self._user_id,
            session_id=session_id,
        )
        run_config = RunConfig(
            response_modalities=[self._response_modality],
            streaming_mode=StreamingMode.BIDI,
            save_input_blobs_as_artifacts=True,
        )
        live_request_queue = LiveRequestQueue()
        live_events = self._runner.run_live(
            session=session,
            live_request_queue=live_request_queue,
            run_config=run_config,
        )
        task = asyncio.create_task(self._collect_live_events(live_events))
        self._runtime = LiveRuntime(session_id=session.id, queue=live_request_queue, events_task=task)

    async def _collect_live_events(self, live_events: Any) -> None:
        try:
            async for event in live_events:
                await self._event_queue.put(event)
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # pragma: no cover - transport-dependent
            logger.exception("ADK live event stream failed: %s", exc)
            await self._event_queue.put(exc)

    async def _send_to_adk(self, message: LiveClientMessage) -> None:
        if not self._runtime:
            return

        if message.type == "control":
            return

        if message.type == "text" and message.data:
            self._runtime.queue.send_content(
                genai_types.Content(role="user", parts=[genai_types.Part(text=message.data)])
            )
            return

        if message.type == "audio" and message.data:
            self._runtime.queue.send_realtime(
                genai_types.Blob(
                    data=base64.b64decode(message.data),
                    mime_type=message.mime_type or "audio/pcm;rate=16000",
                )
            )
            return

        if message.type == "image" and message.data:
            self._runtime.queue.send_realtime(
                genai_types.Blob(
                    data=base64.b64decode(message.data),
                    mime_type=message.mime_type or "image/jpeg",
                )
            )
            return

        if message.type == "realtime_input" and message.realtime_input:
            packet = message.realtime_input
            if packet.text:
                self._runtime.queue.send_content(
                    genai_types.Content(role="user", parts=[genai_types.Part(text=packet.text)])
                )
            if packet.audio:
                self._runtime.queue.send_realtime(
                    genai_types.Blob(
                        data=base64.b64decode(packet.audio),
                        mime_type=packet.mime_type or "audio/pcm;rate=16000",
                    )
                )
            if packet.image:
                self._runtime.queue.send_realtime(
                    genai_types.Blob(
                        data=base64.b64decode(packet.image),
                        mime_type=packet.image_mime_type or "image/jpeg",
                    )
                )

    async def _drain_adk_events(self, initial_timeout: float, idle_timeout: float) -> RunnerOutput:
        output = RunnerOutput()
        deadline = initial_timeout

        while True:
            try:
                event = await asyncio.wait_for(self._event_queue.get(), timeout=deadline)
            except asyncio.TimeoutError:
                break

            if isinstance(event, Exception):
                raise event

            deadline = idle_timeout
            event_payload = self._serialize_event(event)
            if event_payload:
                output.state_updates.append(event_payload)

            output.text_chunks.extend(self._extract_text(event))
            output.audio_chunks.extend(self._extract_audio(event))
            output.tool_calls.extend(self._extract_tool_calls(event))
            output.function_responses.extend(self._extract_function_responses(event))

        return output

    def _serialize_event(self, event: Any) -> dict[str, Any] | None:
        if hasattr(event, "model_dump"):
            return event.model_dump(exclude_none=True, by_alias=True)
        if hasattr(event, "dict"):
            return event.dict()
        return {"event": str(event)}

    def _extract_text(self, event: Any) -> list[str]:
        chunks: list[str] = []
        content = getattr(event, "content", None)
        if content and getattr(content, "parts", None):
            for part in content.parts:
                text = getattr(part, "text", None)
                if text:
                    chunks.append(text)
        actions = getattr(event, "actions", None)
        if actions and getattr(actions, "state_delta", None):
            chunks.append(json.dumps(actions.state_delta))
        return chunks

    def _extract_audio(self, event: Any) -> list[bytes]:
        chunks: list[bytes] = []
        content = getattr(event, "content", None)
        if content and getattr(content, "parts", None):
            for part in content.parts:
                inline_data = getattr(part, "inline_data", None)
                data = getattr(inline_data, "data", None) if inline_data else None
                if data:
                    chunks.append(data)
        return chunks

    def _extract_tool_calls(self, event: Any) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        if hasattr(event, "get_function_calls"):
            for function_call in event.get_function_calls() or []:
                results.append(
                    {
                        "tool_name": getattr(function_call, "name", None),
                        "arguments": getattr(function_call, "args", {}) or {},
                    }
                )
        return results

    def _extract_function_responses(self, event: Any) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        content = getattr(event, "content", None)
        if not content or not getattr(content, "parts", None):
            return results

        for part in content.parts:
            function_response = getattr(part, "function_response", None)
            if function_response:
                results.append(
                    {
                        "tool_name": getattr(function_response, "name", None),
                        "response": getattr(function_response, "response", {}) or {},
                    }
                )
        return results

    def _handle_realtime_packet(
        self,
        audio: str | None,
        image: str | None,
        text: str | None,
        mime_type: str | None,
        image_mime_type: str | None,
        metadata: dict[str, Any],
    ) -> RunnerOutput:
        state_updates: list[dict[str, Any]] = []
        text_chunks: list[str] = []
        function_responses: list[dict[str, Any]] = []

        if audio:
            state_updates.extend(self._handle_audio(audio, mime_type).state_updates)
        if image:
            state_updates.extend(self._handle_image(image, image_mime_type).state_updates)

        prompt = text or metadata.get("transcript") or metadata.get("caption") or ""
        if prompt:
            text_output = self._handle_text(prompt, metadata)
            text_chunks.extend(text_output.text_chunks)
            function_responses.extend(text_output.function_responses)

        if not prompt and (audio or image):
            text_chunks.append("Realtime packet ingested. Kernel monitoring for a causal shift.")

        return RunnerOutput(
            text_chunks=text_chunks,
            function_responses=function_responses,
            state_updates=state_updates,
        )

    def _handle_text(self, text: str, metadata: dict[str, Any] | None = None) -> RunnerOutput:
        lower = text.lower()
        metadata = metadata or {}
        if "line 4" in lower or "metro" in lower or "station" in lower:
            token = {
                "token_id": str(uuid.uuid4()),
                "signal_type": "TRANSIT_DISRUPTION",
                "lat": 48.8809,
                "lng": 2.3553,
                "intensity": 0.78,
                "confidence": 0.91,
                "metadata": {
                    "source": metadata.get("source", "realtime_input"),
                    "excerpt": text,
                },
            }
            return RunnerOutput(
                text_chunks=["IRA identifies a transit disturbance with downstream pedestrian spillover."],
                function_responses=[
                    {
                        "tool_name": "mint_truth_token",
                        "response": {
                            "status": "SUCCESS",
                            "token": token,
                        },
                    }
                ],
            )
        if "rain" in lower or "flood" in lower or "weather" in lower:
            token = {
                "token_id": str(uuid.uuid4()),
                "signal_type": "WEATHER_FRICTION",
                "lat": 48.8566,
                "lng": 2.3522,
                "intensity": 0.64,
                "confidence": 0.82,
                "metadata": {
                    "source": metadata.get("source", "realtime_input"),
                    "excerpt": text,
                },
            }
            return RunnerOutput(
                text_chunks=["IRA detects a weather-driven friction event building across the corridor."],
                function_responses=[
                    {
                        "tool_name": "mint_truth_token",
                        "response": {
                            "status": "SUCCESS",
                            "token": token,
                        },
                    }
                ],
            )
        return RunnerOutput(text_chunks=["Signal received. Monitoring for a verified disturbance."])

    def _handle_image(self, image_data: str, image_mime_type: str | None = None) -> RunnerOutput:
        size_hint = len(image_data)
        return RunnerOutput(
            state_updates=[
                {
                    "status": "FRAME_INGESTED",
                    "bytes_base64": size_hint,
                    "mime_type": image_mime_type or "image/jpeg",
                }
            ]
        )

    def _handle_audio(self, audio_data: str, mime_type: str | None = None) -> RunnerOutput:
        raw_size = len(base64.b64decode(audio_data))
        return RunnerOutput(
            state_updates=[
                {
                    "status": "AUDIO_INGESTED",
                    "bytes_pcm16": raw_size,
                    "mime_type": mime_type or "audio/pcm;rate=16000",
                }
            ]
        )
