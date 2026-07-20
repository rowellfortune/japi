import mongoose, { Schema, Document } from 'mongoose';

export interface IFlight extends Document {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  status: 'Scheduled' | 'Boarding' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  gateId: mongoose.Types.ObjectId | null;
  aircraft: string;
  createdAt: Date;
  updatedAt: Date;
}

const flightSchema = new Schema<IFlight>(
  {
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Boarding', 'Delayed', 'Departed', 'Arrived', 'Cancelled'],
      default: 'Scheduled',
    },
    gateId: { type: Schema.Types.ObjectId, ref: 'Gate', default: null },
    aircraft: { type: String },
  },
  { timestamps: true }
);

export const Flight = mongoose.model<IFlight>('Flight', flightSchema);
