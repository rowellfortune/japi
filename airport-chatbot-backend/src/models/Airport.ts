import mongoose, { Schema, Document } from 'mongoose';

// Populated opportunistically from FR24's airport lookup (see fr24Service.resolveAirportIata)
// whenever a flight touches an airport we haven't seen yet — not a curated reference table.
// FR24's plan tier only exposes name/iata/icao (no city/country breakdown), but `name` is
// typically already city-inclusive (e.g. "New York John F. Kennedy International Airport").
export interface IAirport extends Document {
  iata: string;
  icao: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const airportSchema = new Schema<IAirport>(
  {
    iata: { type: String, required: true, unique: true, uppercase: true },
    icao: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const Airport = mongoose.model<IAirport>('Airport', airportSchema);
