from __future__ import annotations

import os
from typing import Any

from .schemas import LedgerToken


try:
    from google.cloud import firestore  # type: ignore
except ImportError:  # pragma: no cover - local scaffold fallback
    firestore = None


class LedgerStore:
    def __init__(self) -> None:
        self._project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self._collection_name = os.getenv("FIRESTORE_COLLECTION", "urban_ledger")
        self._memory_tokens: list[LedgerToken] = []
        self._client = None

    def _get_client(self):
        if not firestore:
            return None
        if self._client is None:
            try:
                self._client = firestore.Client(project=self._project_id) if self._project_id else firestore.Client()
            except Exception:
                self._client = False
        return self._client or None

    async def mint_token(self, token_input: dict[str, Any]) -> LedgerToken:
        token = LedgerToken(**token_input)
        self._memory_tokens.append(token)

        client = self._get_client()
        if client:
            client.collection(self._collection_name).document(token.token_id).set(
                token.model_dump()
            )

        return token

    async def list_recent_tokens(self, limit: int = 50) -> list[LedgerToken]:
        client = self._get_client()
        if client:
            docs = (
                client.collection(self._collection_name)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )
            return [LedgerToken(**doc.to_dict()) for doc in docs]

        return list(reversed(self._memory_tokens[-limit:]))
