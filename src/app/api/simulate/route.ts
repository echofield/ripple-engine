import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROFESSION_CONTEXT: Record<string, string> = {
  VTC_DRIVER: `VTC driver: surge pricing, traffic, passenger demand, airport runs, event pickups.`,
  WAITER: `Restaurant worker: table turnover, tourist foot traffic, terrace weather, tip patterns.`,
  DELIVERY: `Delivery courier: order density, route optimization, weather demand, surge zones.`,
  RETAIL: `Retail worker: foot traffic, tourist shopping, weather driving people indoors.`,
  TOURIST: `Tourist: crowd levels, weather, transport status, local events, restaurants.`,
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

// Demo fallback when API fails
function getDemoResponse(signal: string, profession: string, hasContext: boolean) {
  return {
    signal,
    field_state: {
      friction_index: 0.78,
      density_pressure: "high",
      summary: "Rugby egress creating 80K pedestrian surge. RER C suspended, replacement buses blocking 7th arr."
    },
    flow_dynamics: {
      primary_flow: "Metro Line 14 absorbing stadium extraction - Saint-Ouen saturated",
      secondary_flow: "Terrace abandonment in 10ème due to rain",
      choke_points: ["Porte de Paris", "Saint-Denis Pleyel", "Gare du Nord forecourt"]
    },
    causal_chain: [
      { node: "RUGBY_EGRESS", type: "trigger", value: "+80K pedestrians", leads_to: "TRANSIT_OVERLOAD" },
      { node: "TRANSIT_OVERLOAD", type: "amplifier", value: "RER B at 94% capacity", leads_to: "SURGE_DEMAND" },
      { node: "SURGE_DEMAND", type: "outcome", value: "+2.4x VTC pricing", leads_to: null }
    ],
    sovereign_decision: {
      action: "STAGE",
      target: "Mairie de Saint-Ouen (Line 14)",
      logic: "Intercept Line 14 extraction flow before gridlock reaches stadium precinct",
      confidence: 0.87
    },
    ripples: [
      { id: "r1", lat: 48.9122, lng: 2.3342, profession, label: "SURGE", intensity: 0.95, impact: "STAY", why: "Line 14 exit point - maximum extraction demand" },
      { id: "r2", lat: 48.8975, lng: 2.3583, profession, label: "DEAD_ZONE", intensity: 0.9, impact: "MOVE", why: "Stadium precinct gridlock - zero velocity" },
      { id: "r3", lat: 48.8809, lng: 2.3553, profession, label: "OPPORTUNITY", intensity: 0.7, impact: "WAIT", why: "Front Populaire - pedestrians walking clear" },
      { id: "r4", lat: 48.8566, lng: 2.3522, profession, label: "AVOID", intensity: 0.6, impact: "MOVE", why: "Gare du Nord chaos during rain" }
    ],
    optimal_position: {
      lat: 48.9122,
      lng: 2.3342,
      reason: "Mairie de Saint-Ouen - Line 14 terminus captures 80K extraction"
    },
    macro_strain: {
      index: 0.72,
      primary_factor: "ZFE Enforcement Cliff Dec 2026"
    },
    sources: ["Rugby Match Data", "RER Status", "Weather Feed"],
    _mode: hasContext ? 'grounded' : 'predictive',
    _demo: true,
    _timestamp: new Date().toISOString()
  };
}

export async function POST(request: NextRequest) {
  try {
    const { signal, profession, frictionContext } = await request.json();

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
      return NextResponse.json(getDemoResponse(signal, profession, hasContext));
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
      return NextResponse.json(getDemoResponse(signal, profession, hasContext));
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
