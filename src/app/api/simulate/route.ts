import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROFESSION_CONTEXT: Record<string, string> = {
  VTC_DRIVER: `VTC/Uber driver priorities: surge pricing, traffic patterns, passenger demand, airport runs, event pickups, parking, earnings optimization.`,
  WAITER: `Restaurant worker priorities: table turnover, tourist foot traffic, terrace weather, nearby events, tip patterns, rush hours.`,
  DELIVERY: `Delivery courier priorities: order density, route optimization, weather demand spikes, restaurant wait times, surge zones.`,
  RETAIL: `Retail worker priorities: foot traffic, tourist shopping hours, weather driving people indoors, event-driven sales.`,
  TOURIST: `Tourist priorities: crowd levels, weather for outdoor activities, transport status, local events, restaurant availability.`,
};

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

      // Build context-aware prompt
      const frictionData = frictionContext ? `
CURRENT URBAN FRICTION REPORT (REAL DATA):
${frictionContext}

Use this REAL data to ground your analysis. Reference specific events, times, and locations from this report.
` : '';

      const systemInstruction = `
You are the RIPPLE CAUSAL KERNEL - an urban intelligence system for Paris.
Today is March 14, 2026.

${PROFESSION_CONTEXT[profession]}

${frictionData}

Apply the IRA Framework (Intent-Action-Ramification) to analyze the urban signal for a ${profession.replace('_', ' ')}.

${frictionContext ? 'IMPORTANT: Your analysis MUST reference the real friction data provided above. Be specific about transit closures, events, and weather conditions mentioned.' : ''}

RULES:
1. Generate 4-6 RippleNodes with SPECIFIC Paris locations
2. Each ripple = WHERE to go, avoid, or wait
3. Coordinates within Paris (lat: 48.82-48.90, lng: 2.25-2.42)
4. Intensity 0.0-1.0 = impact strength on this profession
5. Impact: STAY (opportunity), MOVE (relocate), WAIT (timing)
6. "why" must be actionable advice

JSON Response:
{
  "signal": "<signal>",
  "ira_trace": {
    "intent": "<what this means for ${profession.replace('_', ' ')}>",
    "action": "<specific action to take NOW>",
    "ramification": "<72-hour downstream effect>"
  },
  "ripples": [
    {
      "id": "r1",
      "lat": <number>,
      "lng": <number>,
      "profession": "${profession}",
      "label": "<SURGE|DEAD_ZONE|HOTSPOT|AVOID|OPPORTUNITY|FRICTION>",
      "intensity": <0.0-1.0>,
      "impact": "<STAY|MOVE|WAIT>",
      "why": "<specific actionable advice>"
    }
  ],
  "sources": ["<list friction sources used>"]
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
    version: '0.5.0',
    mode: hasKey ? 'live' : 'demo',
    features: ['profession-lens', 'friction-context', 'ira-framework']
  });
}
