import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROFESSION_CONTEXT: Record<string, string> = {
  VTC_DRIVER: `You are advising a VTC/Uber driver in Paris. Consider: surge pricing opportunities, traffic patterns, passenger demand zones, airport runs, event pickups, parking availability, and earnings optimization.`,
  WAITER: `You are advising a waiter/restaurant worker in Paris. Consider: table turnover, tourist foot traffic, terrace weather conditions, nearby events driving customers, tip patterns, rush hours.`,
  DELIVERY: `You are advising a delivery courier (Uber Eats, Deliveroo) in Paris. Consider: restaurant preparation times, delivery zones, traffic for bikes/scooters, surge areas, weather affecting demand.`,
  RETAIL: `You are advising a retail shop worker in Paris. Consider: foot traffic patterns, tourist shopping hours, nearby events, weather driving people indoors, lunch rush.`,
  TOURIST: `You are advising a tourist visiting Paris. Consider: crowd levels at attractions, weather for outdoor activities, transport strikes, local events, restaurant wait times.`,
};

// Demo responses for when API fails
const DEMO_RESPONSES: Record<string, any> = {
  VTC_DRIVER: {
    ira_trace: {
      intent: "Rain creates immediate surge demand as pedestrians seek rides instead of walking or waiting for buses.",
      action: "Position near major metro exits in the 10ème (Gare du Nord, République) where commuters emerge unprepared for weather.",
      ramification: "Expect 1.5-2x surge pricing for the next 2 hours. Avoid peripheral zones - demand concentrates in central arrondissements during rain."
    },
    ripples: [
      { id: "r1", lat: 48.8809, lng: 2.3553, profession: "VTC_DRIVER", label: "SURGE", intensity: 0.9, impact: "STAY", why: "Gare du Nord exit - high pickup demand, travelers avoiding rain" },
      { id: "r2", lat: 48.8675, lng: 2.3637, profession: "VTC_DRIVER", label: "HOTSPOT", intensity: 0.8, impact: "MOVE", why: "République - office workers leaving early, surge active" },
      { id: "r3", lat: 48.8566, lng: 2.3522, profession: "VTC_DRIVER", label: "OPPORTUNITY", intensity: 0.7, impact: "STAY", why: "Châtelet area - tourists stranded, premium fares likely" },
      { id: "r4", lat: 48.8738, lng: 2.2950, profession: "VTC_DRIVER", label: "DEAD_ZONE", intensity: 0.3, impact: "AVOID", why: "16ème residential - low demand, long empty returns" }
    ]
  },
  WAITER: {
    ira_trace: {
      intent: "Rain drives foot traffic indoors, increasing seated dining demand but killing terrace revenue.",
      action: "Prepare for indoor rush - clear terrace quickly, maximize indoor table turnover.",
      ramification: "Tips may decrease as rushed customers order less. Focus on hot drinks and comfort food upsells."
    },
    ripples: [
      { id: "r1", lat: 48.8530, lng: 2.3499, profession: "WAITER", label: "OVERFLOW", intensity: 0.85, impact: "STAY", why: "Saint-Germain cafés - tourists seeking shelter, high cover potential" },
      { id: "r2", lat: 48.8606, lng: 2.3376, profession: "WAITER", label: "HOTSPOT", intensity: 0.75, impact: "STAY", why: "Louvre area - museum visitors exiting need warm drinks" },
      { id: "r3", lat: 48.8867, lng: 2.3431, profession: "WAITER", label: "DEAD_ZONE", intensity: 0.4, impact: "WAIT", why: "Montmartre terraces - empty until rain stops" }
    ]
  },
  DELIVERY: {
    ira_trace: {
      intent: "Rain spikes food delivery orders as people avoid going out. Surge pricing activates.",
      action: "Accept orders in covered pickup zones. Prioritize restaurants with indoor waiting areas.",
      ramification: "Earnings up 30-40% but slower delivery times. Waterproof gear essential. Focus on dense residential areas."
    },
    ripples: [
      { id: "r1", lat: 48.8650, lng: 2.3800, profession: "DELIVERY", label: "SURGE", intensity: 0.95, impact: "STAY", why: "Belleville - high order density, short delivery distances" },
      { id: "r2", lat: 48.8530, lng: 2.3780, profession: "DELIVERY", label: "HOTSPOT", intensity: 0.8, impact: "MOVE", why: "Bastille restaurants - quick pickup, residential delivery nearby" },
      { id: "r3", lat: 48.8400, lng: 2.3200, profession: "DELIVERY", label: "AVOID", intensity: 0.3, impact: "AVOID", why: "Montparnasse tower area - long waits, spread out deliveries" }
    ]
  },
  RETAIL: {
    ira_trace: {
      intent: "Rain drives spontaneous foot traffic into shops as pedestrians seek shelter.",
      action: "Position sale items near entrance. Offer umbrella bags. Extend browsing welcome.",
      ramification: "Conversion rates increase for impulse purchases. Weather-related items (scarves, umbrellas) see spike."
    },
    ripples: [
      { id: "r1", lat: 48.8738, lng: 2.2950, profession: "RETAIL", label: "OPPORTUNITY", intensity: 0.8, impact: "STAY", why: "Covered passages - shoppers linger longer, high conversion" },
      { id: "r2", lat: 48.8620, lng: 2.2870, profession: "RETAIL", label: "HOTSPOT", intensity: 0.7, impact: "STAY", why: "Champs-Élysées - tourists ducking into stores" }
    ]
  },
  TOURIST: {
    ira_trace: {
      intent: "Rain disrupts outdoor sightseeing plans but creates museum and café opportunities.",
      action: "Head to covered attractions: Louvre, Orsay, covered passages. Book restaurant for extended lunch.",
      ramification: "Museums will be crowded near entrances. Go deep into collections. Evening may clear for golden hour photos."
    },
    ripples: [
      { id: "r1", lat: 48.8606, lng: 2.3376, profession: "TOURIST", label: "OPPORTUNITY", intensity: 0.9, impact: "MOVE", why: "Louvre - perfect rain activity, less crowded in Richelieu wing" },
      { id: "r2", lat: 48.8600, lng: 2.3266, profession: "TOURIST", label: "HOTSPOT", intensity: 0.75, impact: "STAY", why: "Covered Passages (Galerie Vivienne) - authentic Paris, stay dry" },
      { id: "r3", lat: 48.8584, lng: 2.2945, profession: "TOURIST", label: "AVOID", intensity: 0.2, impact: "WAIT", why: "Eiffel Tower - miserable in rain, wait for clearing" }
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { signal, profession } = await request.json();

    if (!signal || typeof signal !== 'string') {
      return NextResponse.json({ error: 'Invalid signal input' }, { status: 400 });
    }

    if (!profession || !PROFESSION_CONTEXT[profession]) {
      return NextResponse.json({ error: 'Invalid profession selected' }, { status: 400 });
    }

    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Return demo response
      console.log('No API key - returning demo response');
      const demo = DEMO_RESPONSES[profession];
      return NextResponse.json({
        signal,
        ira_trace: demo.ira_trace,
        ripples: demo.ripples,
        _demo: true
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemInstruction = `
You are the RIPPLE CAUSAL KERNEL - an urban intelligence system for Paris.

${PROFESSION_CONTEXT[profession]}

Apply the IRA Framework (Intent-Action-Ramification) to analyze how the given urban signal affects THIS SPECIFIC profession.

RULES:
1. Generate 3-5 RippleNodes showing spatial impacts RELEVANT to the ${profession.replace('_', ' ')}
2. Each ripple must show WHERE this person should go, avoid, or wait
3. Coordinates must be within Paris (lat: 48.82-48.90, lng: 2.25-2.42)
4. Intensity 0.0-1.0 represents how strongly this affects the profession
5. Impact: STAY (opportunity here), MOVE (go elsewhere), WAIT (timing matters)
6. The "why" must explain the causal logic specific to their profession

Respond ONLY with valid JSON:
{
  "signal": "${signal}",
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
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUrban Signal: "${signal}"` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const responseText = result.response.text();
      const data = JSON.parse(responseText);
      return NextResponse.json(data);

    } catch (aiError: any) {
      console.error('Gemini API error:', aiError.message);
      // Fallback to demo on AI error
      const demo = DEMO_RESPONSES[profession];
      return NextResponse.json({
        signal,
        ira_trace: demo.ira_trace,
        ripples: demo.ripples,
        _demo: true,
        _fallback: true
      });
    }

  } catch (error: any) {
    console.error('Request error:', error.message);
    return NextResponse.json({ error: 'Failed to process signal', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  return NextResponse.json({
    status: 'KERNEL_ONLINE',
    version: '0.4.1',
    mode: hasKey ? 'live' : 'demo',
    apiConfigured: hasKey
  });
}
