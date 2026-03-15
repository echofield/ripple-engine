from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class LedgerToken(BaseModel):
    token_id: str = Field(default_factory=lambda: str(uuid4()))
    signal_type: str
    lat: float
    lng: float
    intensity: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=utc_now_iso)


class FeedEvent(BaseModel):
    type: Literal["TOKEN_MINTED", "NARRATION", "SESSION_STATE", "ERROR"]
    payload: dict[str, Any]
    created_at: str = Field(default_factory=utc_now_iso)


class RealtimeInput(BaseModel):
    audio: str | None = None
    image: str | None = None
    text: str | None = None
    mime_type: str | None = None
    image_mime_type: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class LiveClientMessage(BaseModel):
    type: Literal["realtime_input", "text", "control", "audio", "image"]
    session_id: str | None = None
    data: str | None = None
    mime_type: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    realtime_input: RealtimeInput | None = None


class RunnerOutput(BaseModel):
    audio_chunks: list[bytes] = Field(default_factory=list)
    text_chunks: list[str] = Field(default_factory=list)
    tool_calls: list[dict[str, Any]] = Field(default_factory=list)
    function_responses: list[dict[str, Any]] = Field(default_factory=list)
    state_updates: list[dict[str, Any]] = Field(default_factory=list)
