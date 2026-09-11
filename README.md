# Ripple Engine

Ripple Engine is a public interactive prototype for explaining causal-analysis interfaces. It turns a fictional disruption into a visible chain of pressure, flow, response, and downstream effects.

The repository deliberately contains **synthetic scenarios only**. It does not include live feeds, real operational data, customer information, or production forecasts.

## What it demonstrates

- A Next.js and TypeScript visual interface
- Map-based ripple and causal-chain visualisation
- Counterfactual controls for comparing responses
- A FastAPI/WebSocket companion service for optional multimodal experiments
- An optional Gemini route that is constrained to fictional demo output

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The frontend works without an API key, using its built-in fictional demo data. To try the optional generated mode, add a `GEMINI_API_KEY` to `.env.local`.

## Demo model

The examples use a fictional waterfront district with invented names such as Harbor Gate, North Bridge, and Market Square. Map coordinates are visual anchors for the interface; they are not operational recommendations.

## Backend companion

The `backend/` folder contains an optional FastAPI and WebSocket service for experimentation with event streaming. Its configuration files use placeholders and should be populated only in local or deployed environment settings.

## License

[MIT](./LICENSE)
