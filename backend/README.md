# Ripple Kernel Backend

This backend turns Ripple Engine into a standalone control plane:

- `backend/main.py`: FastAPI app with `/ws/live`, `/ws/feed`, `/healthz`
- `backend/agent.py`: ADK multi-agent graph with `root_agent`, `VisionSentry`, and `RippleAnalyst`
- `backend/services/ledger_store.py`: Firestore-backed urban ledger
- `backend/services/event_bus.py`: fanout for real-time HUD/map updates
- `backend/services/vertex_live.py`: ADK Runner + Vertex live session adapter
- `backend/service.yaml`: Cloud Run service definition
- `backend/architecture.svg`: submission architecture diagram

## Vertex AI setup

Use the Python 3.11 virtualenv created at `backend/.venv`.

```bash
backend\.venv\Scripts\activate
pip install -r backend\requirements.txt
gcloud auth application-default login
```

Required environment variables:

```bash
GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=europe-west9
VERTEX_MODEL=gemini-live-2.5-flash-preview-native-audio-09-2025
ADK_APP_NAME=ripple-kernel
ADK_USER_ID=collective
FIRESTORE_COLLECTION=urban_ledger
```

## Live input contract

`/ws/live` accepts JSON messages like:

```json
{
  "type": "realtime_input",
  "session_id": "demo",
  "realtime_input": {
    "audio": "<base64-pcm16>",
    "image": "<base64-jpeg>",
    "text": "Metro Line 4 closed at Saint-Lazare",
    "mime_type": "audio/pcm;rate=16000",
    "image_mime_type": "image/jpeg",
    "metadata": {
      "source": "browser",
      "transcript": "Metro Line 4 closed at Saint-Lazare"
    }
  }
}
```

## Feed contract

`/ws/feed` emits JSON events shaped like:

```json
{
  "type": "TOKEN_MINTED",
  "payload": {
    "lat": 48.8809,
    "lng": 2.3553,
    "intensity": 0.78,
    "confidence": 0.91,
    "tag": "TOKEN_MINTED: [TRANSIT_DISRUPTION] // CONFIDENCE: 0.91"
  },
  "created_at": "2026-03-14T16:00:00Z"
}
```

## Local run

```bash
backend\.venv\Scripts\python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8080
```

## Cloud Run

Build and deploy your image, then apply:

```bash
gcloud run services replace backend/service.yaml
```

The service account needs:

- `roles/aiplatform.user`
- `roles/datastore.user`
