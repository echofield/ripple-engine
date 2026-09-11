export const FRICTION_REPORTS = {
  "harbor-storm": {
    label: "Harbor storm",
    summary: "Synthetic weather and transit disruption",
    tier: "realtime",
    data: `FICTIONAL CITY DEMO ? HARBOR STORM

Heavy rainfall has reduced ferry frequency and slowed the waterfront transit corridor.
Two event venues are releasing visitors over a ninety-minute window.
Use this fabricated scenario only to explore the causal-analysis interface.`,
  },
  "district-baseline": {
    label: "District baseline",
    summary: "Synthetic infrastructure conditions",
    tier: "structural",
    data: `FICTIONAL CITY DEMO ? DISTRICT BASELINE

The North District has a constrained bridge crossing, a mixed-use employment zone,
and two alternative transit corridors. These values are illustrative and are not
derived from a real city, organisation, or operational system.`,
  },
} as const;
