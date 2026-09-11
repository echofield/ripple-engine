import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const LENSES = ["FLEET_OPS", "SUPPLY_CHAIN", "REAL_ESTATE", "GRID_CONTROL", "GOV_POLICY"] as const;
type Lens = (typeof LENSES)[number];

const MITIGATIONS: Record<string, { reduction: number; label: string }> = {
  surge_cap: { reduction: 0.15, label: "demand cap applied" }, reroute_fleet: { reduction: 0.25, label: "fleet rerouted" }, deploy_reserves: { reduction: 0.3, label: "reserve capacity deployed" },
  reroute_couriers: { reduction: 0.2, label: "couriers rerouted" }, activate_hub: { reduction: 0.28, label: "backup hub activated" }, delay_orders: { reduction: 0.15, label: "non-priority orders delayed" },
  dynamic_pricing: { reduction: 0.1, label: "pricing adjustment applied" }, tenant_alert: { reduction: 0.12, label: "tenant alert issued" }, insurance_claim: { reduction: 0.18, label: "contingency process started" },
  load_shedding: { reduction: 0.3, label: "non-critical load reduced" }, backup_gen: { reduction: 0.35, label: "backup capacity activated" }, demand_response: { reduction: 0.25, label: "demand response activated" },
  crowd_diversion: { reduction: 0.28, label: "flow diversion opened" }, deploy_units: { reduction: 0.22, label: "response resources deployed" }, evac_corridor: { reduction: 0.35, label: "alternate corridor opened" },
  generic_response: { reduction: 0.2, label: "response activated" }, generic_reroute: { reduction: 0.18, label: "assets rerouted" }, generic_alert: { reduction: 0.1, label: "alert issued" },
};

function demoResponse(signal: string, lens: Lens, mitigation?: string) {
  const intervention = mitigation ? MITIGATIONS[mitigation] : undefined;
  const friction = Math.max(0.2, 0.76 - (intervention?.reduction ?? 0));
  return {
    signal,
    field_state: { friction_index: friction, density_pressure: friction > 0.65 ? "high" : "medium", summary: `Synthetic scenario: ${intervention?.label ?? "monitoring only"}.` },
    flow_dynamics: { primary_flow: "Demand shifts from the waterfront corridor to inland routes.", secondary_flow: "Reserve capacity moves toward the North District.", choke_points: ["Harbor Gate", "North Bridge", "Market Square"] },
    causal_chain: [{ node: "WEATHER_EVENT", type: "trigger", value: "reduced corridor capacity", leads_to: "FLOW_SHIFT" }, { node: "FLOW_SHIFT", type: "amplifier", value: "higher demand on alternate routes", leads_to: "SERVICE_PRESSURE" }, { node: "SERVICE_PRESSURE", type: "outcome", value: "response plan required", leads_to: null }],
    sovereign_decision: { action: intervention ? "MITIGATE" : "MONITOR", target: intervention ? "North District reserve corridor" : "Harbor Gate and North Bridge", logic: `Illustrative ${lens.replace("_", " ").toLowerCase()} analysis only.`, confidence: intervention ? 0.82 : 0.68 },
    ripples: [{ id: "r1", lat: 37.781, lng: -122.405, label: "SURGE", intensity: friction, impact: "STAGE", why: "Synthetic demand shift" }, { id: "r2", lat: 37.771, lng: -122.418, label: "HOTSPOT", intensity: Math.max(0.2, friction - 0.1), impact: "MONITOR", why: "Synthetic route constraint" }, { id: "r3", lat: 37.789, lng: -122.43, label: "BUFFER", intensity: 0.45, impact: "HOLD", why: "Synthetic reserve area" }],
    optimal_position: { lat: 37.781, lng: -122.405, reason: "Illustrative location used only for the public demo." },
    macro_strain: { index: friction, primary_factor: "Synthetic corridor capacity" },
    sources: ["Synthetic demo model"], _mode: "demo", _mitigation: mitigation ?? null, _demo: true, _timestamp: new Date().toISOString(),
  };
}

function prompt(signalType: string, location: string, context: string, lens: string) {
  return `Return strict JSON for a fictional-city causal-analysis demo. Do not claim live data or real places. Lens: ${lens}; signal: ${signalType}; demo label: ${location}; context: ${context}. Use the keys field_state, flow_dynamics, causal_chain, sovereign_decision, ripples, optimal_position, and macro_strain. Use only fictional labels and the sample coordinates 37.781, -122.405.`;
}

export async function POST(request: NextRequest) {
  try {
    const { signal_type, location, context = "", profession_lens, mitigation } = await request.json();
    if (!signal_type || !location || !LENSES.includes(profession_lens)) return NextResponse.json({ error: "Invalid simulation payload" }, { status: 400 });
    const signal = `${signal_type} @ ${location}`;
    const fallback = demoResponse(signal, profession_lens, mitigation);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") return NextResponse.json(fallback);
    try {
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt(signal_type, location, context, profession_lens) }] }], generationConfig: { responseMimeType: "application/json" } });
      return NextResponse.json({ ...fallback, ...JSON.parse(result.response.text()), signal, sources: ["Generated fictional demo"], _demo: true });
    } catch { return NextResponse.json(fallback); }
  } catch { return NextResponse.json({ error: "Failed to process simulation" }, { status: 500 }); }
}

export async function GET() {
  return NextResponse.json({ status: "ONLINE", mode: "fictional-demo", features: ["causal-pipeline", "counterfactuals"] });
}
