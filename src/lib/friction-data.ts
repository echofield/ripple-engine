// Pre-loaded friction reports from deep research

export const FRICTION_REPORTS = {
  'march-14-2026': {
    label: 'March 14-15, 2026',
    summary: 'Rugby Match + Fashion Week Teardown + RER Closures',
    data: `PARIS URBAN FRICTION REPORT - March 14-15, 2026

CRITICAL EVENTS:

FRANCE vs ENGLAND RUGBY - Stade de France
- Saturday March 14, Kickoff: 21:10
- 80,000+ spectators
- Egress crisis: 22:50-01:30 (MAXIMUM FRICTION)

FASHION WEEK TEARDOWN - Le Marais (3rd/4th arr.)
- Streets blocked: Rue de Turenne, Rue Chapon, Rue des Tournelles
- Heavy trucks 08:00-19:00 daily through March 16

TRANSIT CLOSURES:

RER C CLOSED:
- Invalides ↔ Juvisy: Until Sun 17:00
- Invalides ↔ Massy-Palaiseau: All weekend
- Replacement buses blocking 7th arrondissement

RER D SUSPENDED:
- Creil ↔ Stade de France: Northern suburbs cut off

RER B FRAGILE:
- Extreme overcrowding post-match
- Last train to CDG: 00:20

METRO LINE 14: FULLY OPERATIONAL
- Primary stadium extraction route
- Use Mairie de Saint-Ouen station

WEATHER (10th Arr.):
- 10°C with rain showers
- Slick cobblestones, pedestrians seeking cover
- Gare du Nord/Est forecourts hostile

FRICTION POINTS:

ALPHA: Saint-Denis (Sat 22:30-01:30)
- Ave du Président Wilson, La Plaine, Porte de Paris
- TOTAL GRIDLOCK from 80K egress
- Stage at Front Populaire or Line 14 instead

BETA: Invalides (Sat-Sun until 17:00)
- RER C dead, buses blocking Quai d'Orsay
- Approach from Right Bank only

GAMMA: Le Marais (08:00-19:00 daily)
- Fashion trucks blocking Rue de Turenne area
- Use Beaumarchais/Sébastopol boundaries

DELTA: Gare du Nord/Est (during rain)
- Zero buffer at station exits
- Curbside staging only

SURGE ZONES:
- Line 14 exits post-match (23:00-01:00)
- Front Populaire (people walking from stadium)
- Le Marais boundaries (terrace dining)

DEAD ZONES:
- Stadium precinct (zero velocity)
- Deep Le Marais (truck blockades)
- 7th Arr interior (bus staging)`
  }
};

export type FrictionReportKey = keyof typeof FRICTION_REPORTS;
