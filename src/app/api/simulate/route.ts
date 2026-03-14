import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { signal } = await request.json();

    if (!signal || typeof signal !== 'string') {
      return NextResponse.json(
        { error: 'Invalid signal input' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `
You are the RIPPLE CAUSAL KERNEL for Paris. Apply the IRA Framework (Intent-Action-Ramification).
Given an urban signal/disruption, generate a structured JSON response.

RULES:
1. Generate 3-5 RippleNodes representing spatial effects in Paris
2. Each node MUST have a specific profession (e.g., VTC_DRIVER, WAITER, DELIVERY_COURIER, RETAIL_STAFF, TOURIST, COMMUTER)
3. Coordinates must be within Paris (lat: 48.82-48.90, lng: 2.25-2.42)
4. Intensity is 0.0 to 1.0
5. Impact must be: STAY, MOVE, or WAIT
6. Provide clear causal reasoning in the IRA trace

Respond ONLY with valid JSON in this exact format:
{
  "signal": "<echo the user signal>",
  "ira_trace": {
    "intent": "<what the disruption intends or causes>",
    "action": "<immediate actions taken by affected parties>",
    "ramification": "<downstream effects and consequences>"
  },
  "ripples": [
    {
      "id": "<unique_id>",
      "lat": <latitude>,
      "lng": <longitude>,
      "profession": "<PROFESSION_TYPE>",
      "label": "<UPPERCASE_TAG like SURGE, DEAD_ZONE, OVERFLOW>",
      "intensity": <0.0-1.0>,
      "impact": "<STAY|MOVE|WAIT>",
      "why": "<brief explanation>"
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Signal: ${signal}` }],
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
  return NextResponse.json({ status: 'KERNEL_ONLINE' });
}
