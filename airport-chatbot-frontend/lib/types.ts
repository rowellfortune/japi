// A flight summary the assistant attaches to its reply for a "list all flights" request, so the
// frontend can render a card list instead of relying on the model to format one (see the
// backend's SYSTEM_PROMPT).
export interface ChatFlightSummary {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  gate: string | null;
  terminal: string | null;
}

// A single flight's detail the assistant attaches to its reply for a "tell me about flight X"
// request, so the frontend can render a rich detail card instead of relying on the model to
// describe it in prose (see the backend's SYSTEM_PROMPT).
export interface ChatFlightDetail {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  scheduledDepartureTime: string | null;
  scheduledArrivalTime: string | null;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  gate: string | null;
  terminal: string | null;
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  flights?: ChatFlightSummary[];
  flight?: ChatFlightDetail;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
}

export interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  scheduledDepartureTime: string | null;
  scheduledArrivalTime: string | null;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  gateId: Gate | string | null;
  aircraft: string;
}

export interface Gate {
  _id: string;
  gateNumber: string;
  terminal: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  currentFlightId: string | null;
}

export interface PublicFlight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  scheduledDepartureTime: string | null;
  scheduledArrivalTime: string | null;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  aircraft: string;
  gateNumber: string | null;
}

// Raw FR24 enrichment data (see the backend's models/Flight.ts IFlightFr24Data) — only present on
// flights that came through the FR24 sync, not ones an admin created by hand.
export interface FlightFr24Data {
  fr24Id: string;
  callsign: string | null;
  registration: string | null;
  destIcaoActual: string | null;
  destIataActual: string | null;
  runwayTakeoff: string | null;
  runwayLanded: string | null;
  flightTimeSeconds: number | null;
  actualDistanceKm: number | null;
  circleDistanceKm: number | null;
  category: string | null;
  hex: string | null;
  firstSeen: string | null;
  lastSeen: string | null;
  flightEnded: boolean;
}

export interface PublicFlightDetail {
  flightNumber: string;
  airline: string;
  origin: string;
  originName: string | null;
  destination: string;
  destinationName: string | null;
  departureTime: string;
  arrivalTime: string;
  scheduledDepartureTime: string | null;
  scheduledArrivalTime: string | null;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  aircraft: string;
  gateNumber: string | null;
  terminal: string | null;
  fr24: FlightFr24Data | null;
  updatedAt: string;
}

export interface PublicGate {
  gateNumber: string;
  terminal: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  currentFlightNumber: string | null;
}

export interface Baggage {
  _id: string;
  tagId: string;
  flightNumber: string;
  passengerName: string;
  passengerEmail?: string;
  destination: string;
  status: 'Checked In' | 'Loaded' | 'In Transit' | 'Arrived' | 'Unclaimed' | 'Lost';
  weight?: number;
}
