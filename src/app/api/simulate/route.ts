import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROFESSION_CONTEXT: Record<string, string> = {
  VTC_DRIVER: `VTC/Uber driver priorities: surge pricing, traffic patterns, passenger demand, airport runs, event pickups, parking, earnings optimization.`,
  WAITER: `Restaurant worker priorities: table turnover, tourist foot traffic, terrace weather, nearby events, tip patterns, rush hours.`,
  DELIVERY: `Delivery courier priorities: order density, route optimization, weather demand spikes, restaurant wait times, surge zones.`,
  RETAIL: `Retail worker priorities: foot traffic, tourist shopping hours, weather driving people indoors, event-driven sales.`,
  TOURIST: `Tourist priorities: crowd levels, weather for outdoor activities, transport status, local events, restaurant availability.`,
};

// Truncate friction data to avoid API token limits
function truncateFrictionData(data: string, maxChars: number = 4000): string {
  if (data.length <= maxChars) return data;
  // Keep first section (most important) and truncate
  const lines = data.split('\n');
  let result = '';
  for (const line of lines) {
    if (result.length + line.length > maxChars) break;
    result += line + '\n';
  }
  return result + '\n[...truncated for processing]';
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

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build context-aware prompt with truncation for API limits
      const truncatedContext = frictionContext ? truncateFrictionData(frictionContext) : '';
      const frictionData = truncatedContext ? `
CURRENT URBAN FRICTION REPORT (REAL DATA):
${truncatedContext}

Use this REAL data to ground your analysis. Reference specific events, times, and locations from this report.
` : '';

      const systemInstruction = `
You are the RIPPLE CAUSAL KERNEL - a Sovereign Decision Engine for Paris urban dynamics.
Today is March 14, 2026.

${PROFESSION_CONTEXT[profession]}

${frictionData}

You model the city as a DYNAMIC FIELD OF FRICTION. Apply the CAUSAL PIPELINE:
Signal → Field State → Flow Dynamics → Ripple Effect

${frictionContext ? 'CRITICAL: Ground ALL analysis in the real friction data provided. Reference specific events, times, transit states, and locations.' : ''}

RULES:
1. Generate 4-6 RippleNodes with SPECIFIC Paris locations
2. Coordinates within Paris (lat: 48.82-48.90, lng: 2.25-2.42)
3. Intensity 0.0-1.0 = impact strength
4. The SOVEREIGN_DECISION must be a SINGLE bold command - no hedging

JSON Response:
{
  "signal": "<the raw disturbance>",
  "field_state": {
    "friction_index": <0.0-1.0>,
    "density_pressure": "<low|medium|high|critical>",
    "summary": "<2-line current field state>"
  },
  "flow_dynamics": {
    "primary_flow": "<main agent movement pattern, e.g. 'Metro entry spikes at Saint-Denis'>",
    "secondary_flow": "<counter-flow or spillover>",
    "choke_points": ["<location 1>", "<location 2>"]
  },
  "causal_chain": [
    {
      "node": "<EVENT_NAME>",
      "type": "<trigger|amplifier|outcome>",
      "value": "<quantified: '+80K egress', '-30% mobility'>",
      "leads_to": "<next node or null>"
    }
  ],
  "sovereign_decision": {
    "action": "<IMPERATIVE VERB: ABANDON|STAGE|RELOCATE|HOLD|ACQUIRE>",
    "target": "<specific location or zone>",
    "logic": "<one-line causal reasoning>",
    "confidence": <0.0-1.0>
  },
  "delta": {
    "status_quo": "<baseline for ${profession.replace('_', ' ')}>",
    "post_signal": "<projected state>",
    "change_percent": <-100 to +100>,
    "risk_level": <0.0-1.0>
  },
  "ripples": [
    {
      "id": "r1",
      "lat": <number>,
      "lng": <number>,
      "profession": "${profession}",
      "label": "<SURGE|DEAD_ZONE|HOTSPOT|AVOID|OPPORTUNITY>",
      "intensity": <0.0-1.0>,
      "impact": "<STAY|MOVE|WAIT>",
      "why": "<actionable advice>"
    }
  ],
  "optimal_position": {
    "lat": <number>,
    "lng": <number>,
    "reason": "<why this exact spot>"
  },
  "macro_strain": {
    "index": <0.0-1.0>,
    "primary_factor": "<e.g. 'GPE Construction', 'ZFE Deadline', 'Energy Choke'>"
  },
  "sources": ["<friction sources used>"]
}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUrban Signal: "${signal}"` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const responseText = result.response.text();
      const data = JSON.parse(responseText);

      return NextResponse.json({
        ...data,
        _mode: frictionContext ? 'grounded' : 'predictive',
        _timestamp: new Date().toISOString()
      });

    } catch (aiError: any) {
      console.error('Gemini API error:', aiError.message);
      return NextResponse.json({
        error: 'AI processing failed',
        details: aiError.message
      }, { status: 500 });
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
    features: ['causal-pipeline', 'flow-dynamics', 'sovereign-decision', 'multi-scale-fusion']
  });
}
