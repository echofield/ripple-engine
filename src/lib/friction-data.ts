// Pre-loaded friction reports from deep research
// Two-tier system: Real-time friction + Structural baselines

export const FRICTION_REPORTS = {
  'march-14-2026': {
    label: 'March 14-15, 2026',
    summary: 'Rugby Match + Fashion Week + RER Closures',
    tier: 'realtime',
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
  },

  'baseline-q1-2026': {
    label: 'Q1 2026 Baseline',
    summary: 'GPE + ZTL/ZFE + Market Dynamics',
    tier: 'structural',
    data: `PARIS STRUCTURAL BASELINE - Q1 2026

═══════════════════════════════════════════════════════════════
MACRO-ECONOMIC CLIMATE
═══════════════════════════════════════════════════════════════

GDP GROWTH: +0.9% to +1.2% (sluggish but stable)
INFLATION: ~1.6% (below ECB 2% target)
MORTGAGE RATES: 3.13% - 3.50% (stabilized from 2024 peaks)
CRE INVESTMENT: €2.4B/quarter Greater Paris (158% YoY increase)
MARKET PHASE: Stabilization - income-driven returns, not yield compression

═══════════════════════════════════════════════════════════════
GRAND PARIS EXPRESS - 2026 INAUGURATIONS
═══════════════════════════════════════════════════════════════

LINE 15 SOUTH: Pont de Sèvres ↔ Noisy-Champs (39 min)
- Status: Dynamic testing, Summer 2026 opening
- Impact: PRIMARY SOUTHERN RAPID LOOP, bypasses central Paris
- Stations: Villejuif Gustave Roussy critical node

LINE 16: Saint-Denis Pleyel ↔ Clichy-Montfermeil (18 min)
- Status: Civil engineering complete, transitioning to operations
- Impact: CRITICAL for Seine-Saint-Denis urban renewal

LINE 17: Saint-Denis Pleyel ↔ Le Bourget Aéroport (7 min)
- Status: Initial segment operational
- Impact: Foundation for future CDG connectivity (2030)

LINE 18: Massy-Palaiseau ↔ CEA Saint-Aubin (9 min)
- Status: Track laying complete, fit-outs concluding
- Impact: Connects Paris-Saclay "French Silicon Valley"

THE 800-METER RADIUS EFFECT:
- 68 new stations = 68 gentrification epicenters
- 10-15 minute pedestrian catchment zones
- 32 million m² total development potential
- TOD mandates: 60% housing, 380K m² office/logistics
- Sustainability: 70% bio-sourced materials, 50% wood construction
- DISPLACEMENT RISK: Seine-Saint-Denis low-income tracts at EXTREME risk
- Municipalities enforcing 30-40% affordable housing quotas

═══════════════════════════════════════════════════════════════
MOBILITY RESTRICTIONS - ZTL & ZFE
═══════════════════════════════════════════════════════════════

ZONE À TRAFIC LIMITÉ (ZTL) - Hypercenter
- Active Zone: 1st, 2nd, 3rd, 4th arrondissements
- Status: PEDAGOGICAL PHASE - Fines postponed until late 2026
- Fine: €135 (€90 reduced, €375 delayed payment)
- Enforcement: ANPR cameras + municipal police
- Result: 8% traffic reduction already achieved
- RETAIL IMPACT: Mass-market declining, luxury flagships expanding
- Champs-Élysées prime rents: €20,500/m²/year

ZONE À FAIBLES ÉMISSIONS (ZFE) - 77 Municipalities
- CRIT'AIR 3 BAN GRACE PERIOD: Extended to December 31, 2026
- 24-hour ZFE Pass: 24 free days/year for Crit'Air 3 vehicles
- Total legal days with weekends/holidays: 139 days annually
- Fleet transition subsidy: Up to €10,000 (€6,000 from MGP)
- ABSOLUTE DEADLINE: January 1, 2027 - full enforcement begins
- LOGISTICS IMPACT: Last-mile hubs on ZTL/ZFE periphery = PREMIUM assets
- High-capacity EV charging infrastructure = competitive advantage

PÉRIPHÉRIQUE CARPOOL LANE:
- Active since March 2025, fines since May 2025
- Left lane: 2+ occupants, taxis, public transport only
- Fine: €135 via video-verbalization

═══════════════════════════════════════════════════════════════
COMMERCIAL REAL ESTATE BY ARRONDISSEMENT
═══════════════════════════════════════════════════════════════

8TH ARRONDISSEMENT - "Fortress of Capital Preservation"
- Price: €11,765 - €12,100/m²
- Growth: +0.9% YoY (stable plateau)
- Profile: Traditional CBD, luxury HQ, Champs-Élysées
- Yields: Sub-4.25% prime (ultra-low risk)
- Strategy: Safe haven, inflation-protected capital preservation

9TH ARRONDISSEMENT - "Silicon Sentier Ascension"
- Price: €10,522 - €10,800/m²
- Growth: +3.2% YoY (STRONGEST in Paris)
- Profile: Tech hub, creative agencies, flex-office
- Zones: SoPi, Nouvelle Athènes, Grands Boulevards
- Strategy: Core-plus, ESG retrofits, "phygital" workspaces
- Driver: French "Start-up Nation" + VC influx

10TH ARRONDISSEMENT - "Value-Add Repositioning"
- Price: €9,219 - €9,600/m²
- Growth: +2.8% YoY
- Profile: Canal Saint-Martin, Gare du Nord/Est corridor
- Strategy: Acquire "brown discount" assets, green retrofit, premium lease
- Risk: Street-by-street pricing variance up to 30%
- Opportunity: Tech spillover from 9th seeking affordable space

═══════════════════════════════════════════════════════════════
LMNP TAX REFORM - HOSPITALITY DEATH SPIRAL
═══════════════════════════════════════════════════════════════

DEPRECIATION REINTEGRATION (2026 Finance Act):
- OLD RULE: Depreciation ignored on sale → tax-free income for decades
- NEW RULE: Depreciation reintegrated into capital gains calculation
- Example: €500K purchase, €100K depreciation, €600K sale
  - OLD: €100K taxable gain
  - NEW: €200K taxable gain (base reduced to €400K)
- IMPACT: Short-term "flip" strategies MATHEMATICALLY OBSOLETE
- Required hold: 15-22+ years for duration-based allowances

MICRO-BIC ALLOWANCE CUTS:
- Unclassified rentals: 50% → 30% allowance
- Revenue ceiling: €77,700 → €15,000
- Classified rentals: 50% retained up to €77,700
- IMPACT: Casual Airbnb operations severely degraded

MUNICIPAL POWERS:
- Max rental days: 120 → 90 days/year
- Fine: €15,000 per violation
- Co-ownership veto: 2/3 majority can ban tourist rentals
- Registration deadline: May 20, 2026 (national portal)
- No registration: €10,000 fine
- False declaration: €20,000 fine

DPE ENERGY MANDATES:
- G-rated: BANNED from rental market (Jan 2025)
- F-rated: Banned 2028
- E-rated: Banned 2034
- Tourist rentals in tense zones: Must be A-E immediately, A-D by 2034
- Non-compliance: €100/day + €5,000 immediate penalty
- STRATEGY: "Brown discount" acquisition → green retrofit → long-term lease

═══════════════════════════════════════════════════════════════
DATA CENTER BOOM
═══════════════════════════════════════════════════════════════

- 750MW capacity being added across Europe in 2026
- Paris vacancy: Sub-5% (record compression)
- Drivers: AI explosion, cloud computing surge
- Constraints: Land supply, regional power grid limitations
- HIGHEST-GROWTH alternative asset class
- Advantage: Grid connection expertise + on-site renewable generation

═══════════════════════════════════════════════════════════════
CAUSAL BASELINES - STRATEGIC IMPLICATIONS
═══════════════════════════════════════════════════════════════

1. INFRASTRUCTURAL DIVIDEND: GPE 800m radii = capital sinks
   - BUT: Gentrification risk requires ESG/social alignment
   - Partner with TOD projects meeting 30-40% affordable mandates

2. ZTL/ZFE BIFURCATION: Core luxury thrives, periphery logistics premium
   - Dec 31, 2026 = enforcement cliff for Crit'Air 3
   - Last-mile hubs with EV capacity = maximum alpha

3. HOSPITALITY OBSOLESCENCE: LMNP reforms kill short-term speculation
   - Pivot to "brown discount" → green retrofit → long-term BTR
   - Align with state's energy efficiency mandate

4. FLIGHT TO QUALITY: ESG-compliant assets command premiums
   - "Brown discounts" of 10-15% on non-compliant buildings
   - Tech sector agglomeration in 9th driving rental growth`
  }
};

export type FrictionReportKey = keyof typeof FRICTION_REPORTS;
