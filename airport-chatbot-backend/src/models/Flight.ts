import mongoose, { Schema, Document } from 'mongoose';

// Raw enrichment data from FR24's flight-summary/full response (see fr24Service.ts) — only
// present on flights that came through the FR24 sync, not ones an admin created by hand.
export interface IFlightFr24Data {
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
  firstSeen: Date | null;
  lastSeen: Date | null;
  flightEnded: boolean;
  // Live ADS-B telemetry from FR24's /live/flight-positions endpoint (see fr24Service.ts) —
  // only present while the aircraft is actually transmitting, i.e. currently airborne. Stops
  // updating (and goes stale) once the flight lands and drops off live tracking.
  liveLatitude: number | null;
  liveLongitude: number | null;
  liveAltitudeFt: number | null;
  liveGroundSpeedKts: number | null;
  liveVerticalSpeedFpm: number | null;
  liveTrackDeg: number | null;
  liveEta: Date | null;
  livePositionUpdatedAt: Date | null;
}

export interface IFlight extends Document {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  // Current best-known times — the actual takeoff/landing once FR24 has confirmed one, same as
  // before this field split existed.
  departureTime: Date;
  arrivalTime: Date;
  // The times first recorded for this flight (an admin's original entry, or whatever FR24 first
  // reported if the flight was never entered ahead of time). Set once on insert and never
  // touched again — see jobs/fr24Sync.ts and flightService.create — so departureTime/arrivalTime
  // can later be compared against these to detect and display a delay.
  scheduledDepartureTime: Date | null;
  scheduledArrivalTime: Date | null;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  gateId: mongoose.Types.ObjectId | null;
  aircraft: string;
  fr24: IFlightFr24Data | null;
  createdAt: Date;
  updatedAt: Date;
}

const fr24DataSchema = new Schema<IFlightFr24Data>(
  {
    fr24Id: { type: String, required: true },
    callsign: { type: String, default: null },
    registration: { type: String, default: null },
    destIcaoActual: { type: String, default: null },
    destIataActual: { type: String, default: null },
    runwayTakeoff: { type: String, default: null },
    runwayLanded: { type: String, default: null },
    flightTimeSeconds: { type: Number, default: null },
    actualDistanceKm: { type: Number, default: null },
    circleDistanceKm: { type: Number, default: null },
    category: { type: String, default: null },
    hex: { type: String, default: null },
    firstSeen: { type: Date, default: null },
    lastSeen: { type: Date, default: null },
    flightEnded: { type: Boolean, default: false },
    liveLatitude: { type: Number, default: null },
    liveLongitude: { type: Number, default: null },
    liveAltitudeFt: { type: Number, default: null },
    liveGroundSpeedKts: { type: Number, default: null },
    liveVerticalSpeedFpm: { type: Number, default: null },
    liveTrackDeg: { type: Number, default: null },
    liveEta: { type: Date, default: null },
    livePositionUpdatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const flightSchema = new Schema<IFlight>(
  {
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    // Nullable rather than required: existing flights from before this field existed have
    // neither — the frontend treats a missing scheduled time as "no delay baseline available"
    // and just shows the current time with no comparison, instead of a validation failure.
    scheduledDepartureTime: { type: Date, default: null },
    scheduledArrivalTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Scheduled', 'Boarding', 'Delayed', 'Departed', 'Arrived', 'Cancelled'],
      default: 'Scheduled',
    },
    gateId: { type: Schema.Types.ObjectId, ref: 'Gate', default: null },
    aircraft: { type: String },
    fr24: { type: fr24DataSchema, default: null },
  },
  { timestamps: true }
);

export const Flight = mongoose.model<IFlight>('Flight', flightSchema);
