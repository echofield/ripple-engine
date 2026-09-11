export interface RippleNode {
  id: string;
  lat: number;
  lng: number;
  profession: string;
  label: string;
  intensity: number;
  impact: string;
  why: string;
}

export interface IRATrace {
  intent: string;
  action: string;
  ramification: string;
}

export interface SimulationResponse {
  signal: string;
  ira_trace: IRATrace;
  ripples: RippleNode[];
}

export interface SimulationRequest {
  signal: string;
}
