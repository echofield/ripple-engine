import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const PROFESSION_CONTEXT: Record<string, string> = {
  VTC_DRIVER: `You are advising a VTC/Uber driver in Paris. Consider: surge pricing opportunities, traffic patterns, passenger demand zones, airport runs, event pickups, parking availability, and earnings optimization. They care about: maximizing fares, avoiding dead zones, finding high-demand areas.`,

  WAITER: `You are advising a waiter/restaurant worker in Paris. Consider: table turnover, tourist foot traffic, terrace weather conditions, nearby events driving customers, tip patterns, rush hours. They care about: busy shifts for tips, customer flow, weather affecting outdoor seating.`,

  DELIVERY: `You are advising a delivery courier (Uber Eats, Deliveroo) in Paris. Consider: restaurant preparation times, delivery zones, traffic for bikes/scooters, surge areas, weather affecting demand, parking for pickups. They care about: order density, fast deliveries, staying dry, maximizing deliveries per hour.`,

  RETAIL: `You are advising a retail shop worker in Paris. Consider: foot traffic patterns, tourist shopping hours, nearby events, weather driving people indoors, lunch rush, competitor activity. They care about: customer flow, busy periods, sales opportunities.`,

  TOURIST: `You are advising a tourist visiting Paris. Consider: crowd levels at attractions, weather for outdoor activities, transport strikes, local events, restaurant wait times, photo opportunities. They care about: avoiding crowds, best times to visit places, local tips, authentic experiences.`,
};

export async function POST(request: NextRequest) {
  try {
    const { signal, profession } = await request.json();

    if (!signal || typeof signal !== 'string') {
      return NextResponse.json(
        { error: 'Invalid signal input' },
        { status: 400 }
      );
    }

    if (!profession || !PROFESSION_CONTEXT[profession]) {
      return NextResponse.json(
        { error: 'Invalid profession selected' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const professionGuide = PROFESSION_CONTEXT[profession];

    const systemInstruction = `
You are the RIPPLE CAUSAL KERNEL - an urban intelligence system for Paris.

${professionGuide}

Apply the IRA Framework (Intent-Action-Ramification) to analyze how the given urban signal affects THIS SPECIFIC profession.

RULES:
1. Generate 3-5 RippleNodes showing spatial impacts RELEVANT to the ${profession.replace('_', ' ')}
2. Each ripple must show WHERE this person should go, avoid, or wait
3. Coordinates must be within Paris (lat: 48.82-48.90, lng: 2.25-2.42)
4. Intensity 0.0-1.0 represents how strongly this affects the profession
5. Impact: STAY (opportunity here), MOVE (go elsewhere), WAIT (timing matters)
6. The "why" must explain the causal logic specific to their profession
7. IRA trace must be profession-specific advice, not generic observations

Respond ONLY with valid JSON:
{
  "signal": "<echo the signal>",
  "ira_trace": {
    "intent": "<what this signal means for a ${profession.replace('_', ' ')}>",
    "action": "<what they should DO right now>",
    "ramification": "<the downstream effect on their work/earnings/experience>"
  },
  "ripples": [
    {
      "id": "<unique_id>",
      "lat": <latitude>,
      "lng": <longitude>,
      "profession": "${profession}",
      "label": "<SURGE|DEAD_ZONE|HOTSPOT|AVOID|OPPORTUNITY|WAIT>",
      "intensity": <0.0-1.0>,
      "impact": "<STAY|MOVE|WAIT>",
      "why": "<specific advice for this profession>"
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUrban Signal: "${signal}"` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Failed to process signal' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'KERNEL_ONLINE',
    version: '0.4.0',
    mode: 'profession-contextual'
  });
}
