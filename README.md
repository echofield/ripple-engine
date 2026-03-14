# THE RIPPLE ENGINE
**A Sovereign Causal Radar for Urban Disruptions. Built for Paris 2026.**

> Standard navigation apps show operators the present (a red line for traffic, a closed icon for a station). The Ripple Engine uses causal AI to map the "Invisible Strings" of the city, showing operators the *future*.

![Ripple Engine Dashboard](./docs/screenshot.png)

---

## The Vision
In high-stakes urban environments—where millions of euros and public safety are on the line—operators do not need chatbots. They need **Deterministic Spatial Intelligence**.

The Ripple Engine is a predictive instrument built for Tier-1 decision-makers. By utilizing the **I.R.A. Framework (Intent, Action, Ramification)**, the engine digests structural strains (like energy grid loads) and moving frictions (like flash floods or protests) to calculate the precise downstream impact on the city.

## The I.R.A. Causal Intelligence
Instead of using AI to generate text, we use **Google Gemini** as a causal compiler. When an urban signal is injected, the kernel calculates:
1. **INTENT:** The human behavioral shift (e.g., *Commuters abandon RER B for surface transport*).
2. **ACTION:** The physical world consequence (e.g., *Massive pedestrian bottleneck at Rue de Dunkerque*).
3. **RAMIFICATION:** The specific operational/financial impact.

### Contextual "Lenses"
A transit failure means something different to a police chief than it does to a hedge fund manager. The Ripple Engine dynamically recalculates the causal graph based on the selected operator lens:

| Lens | Focus |
|------|-------|
| **FLEET_OPS** | VTC/Autonomous vehicle surge pricing and routing bottlenecks |
| **SUPPLY_CHAIN** | Ghost kitchen extraction delays and last-mile friction |
| **REAL_ESTATE** | Intra-day commercial yield drops based on footfall diversion |
| **GRID_CONTROL** | HVAC load spikes resulting from transit shutdowns |
| **GOV_POLICY** | Crowd density escalation and crush risks |

---

## Architecture

High-stakes operators require **Zero-Latency**. To achieve this, we made a crucial architectural pivot: we moved from a vulnerable "Live Prompt" system to a **Pre-Computed Sovereign Kernel**.

We utilized Gemini's deep reasoning capabilities to pre-generate highly specific, deterministic urban heuristics for maximum-probability crisis scenarios. This data is fed into a high-speed Next.js pipeline, resulting in instant rendering of our "Emerald Ripple" spatial logic.

```
SIGNAL (Exogenous Event)
    |
    v
FRICTION (Infrastructure Stress)
    |
    v
FLOW (Population Dynamics)
    |
    v
RIPPLE (Economic Consequence)
```

### Tech Stack
- **AI Reasoning:** Google Gemini (Flash)
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Spatial Animation:** Framer Motion, Mapbox GL
- **Deployment:** Vercel

---

## Running the Kernel Locally

1. **Clone the repository:**
```bash
git clone https://github.com/echofield/ripple-engine.git
cd ripple-engine
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environment:**
```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY and NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

4. **Run Development Server:**
```bash
npm run dev
```

5. **Open:** [http://localhost:3000](http://localhost:3000)

---

## Signal Injections

Pre-configured crisis scenarios for demonstration:

| Inject | Time | Location | Event |
|--------|------|----------|-------|
| TRANSIT CASCADE | 18:30 | Gare du Nord | Heavy Rain + Line 4 Suspension |
| MASS EGRESS | 21:00 | Stade de France | Post-Match + Protest Convergence |
| GRID FAILURE | 08:00 | La Defense | Rolling Blackout + Peak Load |

---

## Counterfactual Engine

The system supports "What If?" interventions:

- **+ EXTRA BUS SHUTTLES** - Reduces transit friction by 25%
- **~ DEMAND RESPONSE** - Activates grid load shedding protocol
- **> CROWD DIVERSION** - Opens alternative evacuation corridors

Each counterfactual recalculates the causal graph in real-time, proving the intervention's impact on the risk profile.

---

## Team

Built by **Martial Foe** for the Google AI Hackathon (March 2026).

---

## License

MIT
