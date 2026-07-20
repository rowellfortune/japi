export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  aircraft: string;
  gateNumber: string | null;
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
