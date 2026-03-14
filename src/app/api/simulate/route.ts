import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROFESSION_CONTEXT: Record<string, string> = {
  FLEET_OPS: `Fleet Operations Commander: Managing 5,000+ autonomous or human drivers across Paris. Optimize staging, dispatch timing, surge positioning. Key metrics: utilization rate, dead-mile ratio, surge capture rate. Concerns: ZFE enforcement zones, traffic incidents, mass event extraction.`,
  SUPPLY_CHAIN: `Supply Chain Director: Last-mile logistics network with 200+ ghost kitchens and dark stores. Optimize delivery corridors, staging hubs, demand forecasting. Key metrics: order density heat, delivery time variance, spoilage risk. Concerns: traffic chokes, weather demand spikes, labor availability.`,
  REAL_ESTATE: `Real Estate Intelligence: Dynamic commercial pricing and yield optimization across 50+ retail/office assets. Track foot traffic correlation, tenant performance, neighborhood drift. Key metrics: rent elasticity, vacancy risk, neighborhood premiums. Concerns: transit access changes, demographic shifts, competitor movements.`,
  GRID_CONTROL: `Grid Control Operator: Energy load management across Paris infrastructure. Balance demand peaks, manage rolling blackout sequences, coordinate with transit. Key metrics: load variance, cascade risk, backup capacity. Concerns: mass event draws, weather extremes, transit electrification load.`,
  GOV_POLICY: `Government Policy Analyst: Emergency response, riot control, transit routing optimization. Model crowd dynamics, evacuation corridors, resource deployment. Key metrics: crowd density thresholds, response time corridors, escalation probability. Concerns: protest movements, mass casualty scenarios, infrastructure failures.`,
};

// Truncate friction data - reduced limit
function truncateFrictionData(data: string, maxChars: number = 2000): string {
  if (data.length <= maxChars) return data;
  const lines = data.split('\n');
  let result = '';
  for (const line of lines) {
    if (result.length + line.length > maxChars) break;
    result += line + '\n';
  }
  return result;
}

// Demo responses per profession
const DEMO_RESPONSES: Record<string, any> = {
  FLEET_OPS: {
    field_state: {
      friction_index: 0.82,
      density_pressure: "critical",
      summary: "Mass egress event creating 80K pedestrian surge. Transit overload cascading to surface streets. Fleet repositioning window: 12 minutes."
    },
    flow_dynamics: {
      primary_flow: "Metro Line 14 absorbing stadium extraction - Saint-Ouen saturated",
      secondary_flow: "Overflow pedestrians seeking alternative transport on Rue de la Chapelle",
      choke_points: ["Porte de Paris", "Saint-Denis Pleyel", "Gare du Nord forecourt"]
    },
    causal_chain: [
      { node: "MASS_EGRESS", type: "trigger", value: "+80K pedestrians", leads_to: "TRANSIT_SATURATION" },
      { node: "TRANSIT_SATURATION", type: "amplifier", value: "RER B at 94% capacity", leads_to: "SURFACE_OVERFLOW" },
      { node: "SURFACE_OVERFLOW", type: "outcome", value: "+340% ride demand", leads_to: null }
    ],
    sovereign_decision: {
      action: "STAGE",
      target: "Deploy 200 vehicles to Mairie de Saint-Ouen (Line 14 terminus)",
      logic: "Intercept Line 14 extraction flow. 87% probability of 3.2x surge capture within 18-minute window.",
      confidence: 0.91
    },
    ripples: [
      { id: "r1", lat: 48.9122, lng: 2.3342, label: "SURGE", intensity: 0.95, impact: "STAGE", why: "Line 14 terminus - maximum extraction demand" },
      { id: "r2", lat: 48.8975, lng: 2.3583, label: "DEAD_ZONE", intensity: 0.9, impact: "AVOID", why: "Stadium precinct gridlock - zero vehicle velocity" },
      { id: "r3", lat: 48.8809, lng: 2.3553, label: "OPPORTUNITY", intensity: 0.75, impact: "SECONDARY", why: "Front Populaire - spillover pickup zone" },
      { id: "r4", lat: 48.8566, lng: 2.3522, label: "AVOID", intensity: 0.6, impact: "WITHDRAW", why: "Gare du Nord - police cordons active" }
    ],
    optimal_position: { lat: 48.9122, lng: 2.3342, reason: "Line 14 terminus captures 80K extraction flow" }
  },
  SUPPLY_CHAIN: {
    field_state: {
      friction_index: 0.71,
      density_pressure: "high",
      summary: "Weather event driving indoor ordering spike. Delivery corridor congestion at 3 critical nodes. Spoilage risk elevated in Zone 4."
    },
    flow_dynamics: {
      primary_flow: "Order density shifting from 10ème terraces to 11ème residential",
      secondary_flow: "Courier pooling at Bastille hub exceeding capacity",
      choke_points: ["République", "Bastille Hub", "Canal Saint-Martin bridges"]
    },
    causal_chain: [
      { node: "WEATHER_SHIFT", type: "trigger", value: "Rain onset 18:30", leads_to: "DEMAND_MIGRATION" },
      { node: "DEMAND_MIGRATION", type: "amplifier", value: "+180% residential orders", leads_to: "CORRIDOR_SATURATION" },
      { node: "CORRIDOR_SATURATION", type: "outcome", value: "+8min avg delivery time", leads_to: null }
    ],
    sovereign_decision: {
      action: "RELOCATE",
      target: "Shift 40 couriers from Bastille to Belleville staging",
      logic: "Belleville corridor under-served. 23% faster delivery times achievable with rebalancing.",
      confidence: 0.84
    },
    ripples: [
      { id: "r1", lat: 48.8680, lng: 2.3850, label: "SURGE", intensity: 0.88, impact: "STAGE", why: "Belleville residential - order density spike" },
      { id: "r2", lat: 48.8534, lng: 2.3688, label: "DEAD_ZONE", intensity: 0.7, impact: "REDUCE", why: "Bastille oversupplied - courier idle time high" },
      { id: "r3", lat: 48.8614, lng: 2.3736, label: "HOTSPOT", intensity: 0.8, impact: "MONITOR", why: "République - corridor chokepoint" }
    ],
    optimal_position: { lat: 48.8680, lng: 2.3850, reason: "Belleville hub positioning captures residential surge" }
  },
  REAL_ESTATE: {
    field_state: {
      friction_index: 0.56,
      density_pressure: "medium",
      summary: "Transit disruption creating temporary foot traffic redistribution. Opportunity window for ground-floor retail repricing."
    },
    flow_dynamics: {
      primary_flow: "Pedestrian overflow from Gare du Nord to surrounding retail corridors",
      secondary_flow: "Magenta corridor seeing 40% traffic increase",
      choke_points: ["Gare du Nord main hall", "Rue de Dunkerque"]
    },
    causal_chain: [
      { node: "TRANSIT_DISRUPTION", type: "trigger", value: "Line 4 suspended", leads_to: "PEDESTRIAN_OVERFLOW" },
      { node: "PEDESTRIAN_OVERFLOW", type: "amplifier", value: "+40% foot traffic on Magenta", leads_to: "RETAIL_OPPORTUNITY" },
      { node: "RETAIL_OPPORTUNITY", type: "outcome", value: "€2.3K/m² premium justified", leads_to: null }
    ],
    sovereign_decision: {
      action: "HOLD",
      target: "Maintain asking price on 45 Rue Magenta ground floor",
      logic: "Transit disruption pattern recurring. Location proves resilient to metro outages with spillover benefit.",
      confidence: 0.78
    },
    ripples: [
      { id: "r1", lat: 48.8809, lng: 2.3553, label: "OPPORTUNITY", intensity: 0.82, impact: "PREMIUM", why: "Magenta corridor - transit-resilient foot traffic" },
      { id: "r2", lat: 48.8785, lng: 2.3588, label: "HOTSPOT", intensity: 0.7, impact: "MONITOR", why: "Gare du Nord adjacency - volatile but high volume" }
    ],
    optimal_position: { lat: 48.8809, lng: 2.3553, reason: "Magenta corridor maximizes transit-disruption resilience premium" }
  },
  GRID_CONTROL: {
    field_state: {
      friction_index: 0.89,
      density_pressure: "critical",
      summary: "Morning peak coinciding with metro system draw. Load variance exceeding threshold in La Défense sector. Cascade risk: ELEVATED."
    },
    flow_dynamics: {
      primary_flow: "Commercial district draw peaking at 08:15",
      secondary_flow: "RER A traction load adding 340MW to western grid",
      choke_points: ["La Défense substation", "Neuilly transformer", "Courbevoie residential"]
    },
    causal_chain: [
      { node: "PEAK_LOAD", type: "trigger", value: "08:00 commercial activation", leads_to: "GRID_STRESS" },
      { node: "GRID_STRESS", type: "amplifier", value: "Western sector at 94% capacity", leads_to: "CASCADE_RISK" },
      { node: "CASCADE_RISK", type: "outcome", value: "Rolling blackout probability 34%", leads_to: null }
    ],
    sovereign_decision: {
      action: "SHED",
      target: "Initiate demand response protocol for La Défense commercial HVAC",
      logic: "15% HVAC reduction across 12 towers buys 45-minute buffer. Zero cascade probability with intervention.",
      confidence: 0.93
    },
    ripples: [
      { id: "r1", lat: 48.8920, lng: 2.2370, label: "CRITICAL", intensity: 0.95, impact: "SHED", why: "La Défense - load epicenter" },
      { id: "r2", lat: 48.8848, lng: 2.2590, label: "AT_RISK", intensity: 0.8, impact: "MONITOR", why: "Neuilly - cascade first-impact zone" },
      { id: "r3", lat: 48.8966, lng: 2.2520, label: "BUFFER", intensity: 0.6, impact: "STANDBY", why: "Courbevoie residential - load shed candidate" }
    ],
    optimal_position: { lat: 48.8920, lng: 2.2370, reason: "La Défense substation - intervention point for cascade prevention" }
  },
  GOV_POLICY: {
    field_state: {
      friction_index: 0.86,
      density_pressure: "critical",
      summary: "Unplanned protest converging with match egress. Crowd density approaching threshold at 3 nodes. Escalation probability: MODERATE."
    },
    flow_dynamics: {
      primary_flow: "Match egress 80K moving south on Line 14",
      secondary_flow: "Protest movement 5K approaching from Place de la République",
      choke_points: ["Gare du Nord forecourt", "Canal Saint-Martin", "Stalingrad junction"]
    },
    causal_chain: [
      { node: "DUAL_CROWD_EVENT", type: "trigger", value: "Match + Protest convergence", leads_to: "DENSITY_SPIKE" },
      { node: "DENSITY_SPIKE", type: "amplifier", value: "4.2 persons/m² at Stalingrad", leads_to: "ESCALATION_RISK" },
      { node: "ESCALATION_RISK", type: "outcome", value: "38% probability of crowd crush scenario", leads_to: null }
    ],
    sovereign_decision: {
      action: "DIVERT",
      target: "Activate Corridor B evacuation route via Canal Saint-Martin",
      logic: "Separating flows reduces density to 2.1 persons/m². Escalation probability drops to 4%.",
      confidence: 0.89
    },
    ripples: [
      { id: "r1", lat: 48.8842, lng: 2.3656, label: "CRITICAL", intensity: 0.95, impact: "DEPLOY", why: "Stalingrad - crowd convergence point" },
      { id: "r2", lat: 48.8731, lng: 2.3651, label: "CORRIDOR", intensity: 0.7, impact: "ACTIVATE", why: "Canal Saint-Martin - evacuation route" },
      { id: "r3", lat: 48.8566, lng: 2.3522, label: "MONITOR", intensity: 0.6, impact: "STANDBY", why: "Gare du Nord - secondary convergence risk" }
    ],
    optimal_position: { lat: 48.8842, lng: 2.3656, reason: "Stalingrad junction - command post for flow separation" }
  }
};

// Mitigation effects - reduce severity
const MITIGATION_EFFECTS: Record<string, { frictionReduction: number; confidenceBoost: number; label: string }> = {
  bus_shuttles: { frictionReduction: 0.25, confidenceBoost: 0.08, label: 'Extra Bus Shuttles deployed' },
  load_shedding: { frictionReduction: 0.30, confidenceBoost: 0.10, label: 'Demand Response protocol activated' },
  crowd_diversion: { frictionReduction: 0.20, confidenceBoost: 0.12, label: 'Crowd Diversion corridors opened' },
};

// Demo fallback when API fails
function getDemoResponse(signal: string, profession: string, hasContext: boolean, mitigation?: string) {
  const baseResponse = DEMO_RESPONSES[profession] || DEMO_RESPONSES.FLEET_OPS;
  const mitigationEffect = mitigation ? MITIGATION_EFFECTS[mitigation] : null;

  // Apply mitigation effects
  let modifiedResponse = { ...baseResponse };

  if (mitigationEffect) {
    // Reduce friction
    modifiedResponse.field_state = {
      ...baseResponse.field_state,
      friction_index: Math.max(0.2, baseResponse.field_state.friction_index - mitigationEffect.frictionReduction),
      density_pressure: baseResponse.field_state.density_pressure === 'critical' ? 'high' :
                        baseResponse.field_state.density_pressure === 'high' ? 'medium' : 'low',
      summary: baseResponse.field_state.summary + ` [MITIGATED: ${mitigationEffect.label}]`
    };

    // Boost confidence
    modifiedResponse.sovereign_decision = {
      ...baseResponse.sovereign_decision,
      confidence: Math.min(0.98, baseResponse.sovereign_decision.confidence + mitigationEffect.confidenceBoost),
      logic: baseResponse.sovereign_decision.logic + ` Mitigation reduces risk by ${Math.round(mitigationEffect.frictionReduction * 100)}%.`
    };

    // Reduce ripple intensities
    modifiedResponse.ripples = baseResponse.ripples.map((r: any) => ({
      ...r,
      intensity: Math.max(0.2, r.intensity - mitigationEffect.frictionReduction * 0.5),
      label: r.label === 'CRITICAL' ? 'AT_RISK' : r.label === 'DEAD_ZONE' ? 'HOTSPOT' : r.label
    }));

    // Update causal chain to show mitigation effect
    modifiedResponse.causal_chain = [
      ...baseResponse.causal_chain.slice(0, -1),
      {
        ...baseResponse.causal_chain[baseResponse.causal_chain.length - 1],
        value: `${baseResponse.causal_chain[baseResponse.causal_chain.length - 1].value} → MITIGATED`
      }
    ];
  }

  return {
    signal,
    ...modifiedResponse,
    ripples: modifiedResponse.ripples.map((r: any) => ({ ...r, profession })),
    macro_strain: {
      index: mitigationEffect ? 0.72 - mitigationEffect.frictionReduction : 0.72,
      primary_factor: mitigationEffect ? `Mitigated: ${mitigationEffect.label}` : "Infrastructure Stress Index Q1 2026"
    },
    sources: ["Real-time Transit Feed", "Weather Service", "Crowd Analytics", "Grid Telemetry"],
    _mode: hasContext ? 'grounded' : 'predictive',
    _mitigation: mitigation || null,
    _demo: true,
    _timestamp: new Date().toISOString()
  };
}

export async function POST(request: NextRequest) {
  try {
    const { signal, profession, frictionContext, mitigation } = await request.json();

    if (!signal || typeof signal !== 'string') {
      return NextResponse.json({ error: 'Invalid signal input' }, { status: 400 });
    }

    if (!profession || !PROFESSION_CONTEXT[profession]) {
      return NextResponse.json({ error: 'Invalid profession selected' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const hasContext = !!frictionContext?.trim();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Return demo response if no API key
      return NextResponse.json(getDemoResponse(signal, profession, hasContext, mitigation));
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const truncatedContext = frictionContext ? truncateFrictionData(frictionContext) : '';

      const prompt = `You are a Paris urban dynamics engine. Today: March 14, 2026.
${PROFESSION_CONTEXT[profession]}
${truncatedContext ? `FRICTION DATA:\n${truncatedContext}` : ''}

Analyze this signal for a ${profession.replace('_', ' ')}: "${signal}"

Return JSON with these exact fields:
- signal: string
- field_state: {friction_index: 0-1, density_pressure: "low|medium|high|critical", summary: string}
- flow_dynamics: {primary_flow: string, secondary_flow: string, choke_points: string[]}
- causal_chain: [{node: string, type: "trigger|amplifier|outcome", value: string, leads_to: string|null}]
- sovereign_decision: {action: "ABANDON|STAGE|RELOCATE|HOLD", target: string, logic: string, confidence: 0-1}
- ripples: [{id: string, lat: 48.82-48.90, lng: 2.25-2.42, profession: string, label: "SURGE|DEAD_ZONE|HOTSPOT|AVOID|OPPORTUNITY", intensity: 0-1, impact: "STAY|MOVE|WAIT", why: string}]
- optimal_position: {lat: number, lng: number, reason: string}
- macro_strain: {index: 0-1, primary_factor: string}
- sources: string[]`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const responseText = result.response.text();
      const data = JSON.parse(responseText);

      return NextResponse.json({
        ...data,
        _mode: hasContext ? 'grounded' : 'predictive',
        _timestamp: new Date().toISOString()
      });

    } catch (aiError: any) {
      console.error('AI error, using demo fallback:', aiError.message);
      // Return demo response on AI failure
      return NextResponse.json(getDemoResponse(signal, profession, hasContext, mitigation));
    }

  } catch (error: any) {
    console.error('Request error:', error.message);
    return NextResponse.json({ error: 'Failed to process', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  return NextResponse.json({
    status: 'KERNEL_ONLINE',
    version: '1.0.0',
    mode: hasKey ? 'sovereign' : 'demo',
    features: ['causal-pipeline', 'flow-dynamics', 'sovereign-decision']
  });
}
