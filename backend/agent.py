from __future__ import annotations

import json
import os
from typing import Any

from pydantic import BaseModel, Field

from .services.ledger_store import LedgerStore

try:
    from google.adk.agents import LlmAgent as AdkLlmAgent  # type: ignore
    from google.adk.tools import FunctionTool  # type: ignore
    ADK_AVAILABLE = True
except ImportError:  # pragma: no cover - local scaffold fallback
    from dataclasses import dataclass, field

    ADK_AVAILABLE = False

    @dataclass
    class AdkLlmAgent:  # type: ignore[override]
        name: str
        model: str
        instruction: str
        description: str | None = None
        tools: list[Any] = field(default_factory=list)
        sub_agents: list[Any] = field(default_factory=list)

    class FunctionTool:  # type: ignore[override]
        def __init__(self, func: Any) -> None:
            self.func = func
            self.name = getattr(func, "__name__", func.__class__.__name__)
            self.description = (getattr(func, "__doc__", "") or "").strip()


def _build_tool(func: Any) -> Any:
    return FunctionTool(func) if ADK_AVAILABLE else func


def _parse_metadata(metadata_json: str | None) -> dict[str, Any]:
    if not metadata_json:
        return {}
    try:
        value = json.loads(metadata_json)
    except json.JSONDecodeError:
        return {"raw": metadata_json}
    return value if isinstance(value, dict) else {"value": value}


def _bounded_float(value: Any, default: float = 0.5) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default
    if numeric > 1.0 and numeric <= 10.0:
        numeric = numeric / 10.0
    return max(0.0, min(1.0, numeric))


ledger_store = LedgerStore()


class TruthToken(BaseModel):
    signal_type: str = Field(..., description="Normalized disturbance type.")
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    intensity: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    metadata: dict[str, Any] = Field(default_factory=dict)


async def mint_truth_token(
    signal_type: str,
    lat: float,
    lng: float,
    intensity: float,
    confidence: float,
    metadata_json: str = "{}",
) -> dict[str, Any]:
    """Persist a verified urban token into the collective ledger. Pass metadata_json as a compact JSON object string."""
    token = await ledger_store.mint_token(
        TruthToken(
            signal_type=signal_type,
            lat=float(lat),
            lng=float(lng),
            intensity=_bounded_float(intensity),
            confidence=_bounded_float(confidence),
            metadata=_parse_metadata(metadata_json),
        ).model_dump()
    )
    return {
        "status": "SUCCESS",
        "token": token.model_dump(),
    }


mint_truth_token_tool = _build_tool(mint_truth_token)


def _default_model() -> str:
    return os.getenv("VERTEX_MODEL", "gemini-live-2.5-flash-native-audio")


sentry_agent = AdkLlmAgent(
    name="VisionSentry",
    model=_default_model(),
    description="Detects disruptions in voice and visual streams.",
    instruction=(
        "Watch incoming multimodal signals for urban disturbances such as transit outages, "
        "crowd formation, flooding, police cordons, and traffic lockups. "
        "When a disturbance is credible, call `mint_truth_token` with normalized fields. "
        "Use intensity and confidence on a 0 to 1 scale when possible. "
        "Encode any extra structured context into the `metadata_json` argument as a compact JSON string."
    ),
    tools=[mint_truth_token_tool],
)


analyst_agent = AdkLlmAgent(
    name="RippleAnalyst",
    model=_default_model(),
    description="Calculates downstream field and economic impact.",
    instruction=(
        "Given tokenized disturbances, apply the IRA framework. "
        "Explain intent, physical action, and ramification in operational terms for the urban field. "
        "Prefer concise, quantified impact statements over general commentary."
    ),
)


root_agent = AdkLlmAgent(
    name="RippleKernel",
    model=_default_model(),
    description="Coordinates urban sensing, tokenization, and ripple analysis.",
    instruction=(
        "You are the RIPPLE CAUSAL KERNEL. Coordinate specialist agents to transform live multimodal signals "
        "into verified truth tokens and concise causal narration. Route sensing work to VisionSentry, "
        "route impact analysis to RippleAnalyst, and maintain a structured collective ledger."
    ),
    tools=[mint_truth_token_tool],
    sub_agents=[sentry_agent, analyst_agent],
)


ira_agent = root_agent
LlmAgent = AdkLlmAgent
