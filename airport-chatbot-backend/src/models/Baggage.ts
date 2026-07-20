import mongoose, { Schema, Document } from 'mongoose';

export interface IBaggage extends Document {
  tagId: string;
  flightNumber: string;
  passengerName: string;
  passengerEmail?: string;
  destination: string;
  status: 'Checked In' | 'Loaded' | 'In Transit' | 'Arrived' | 'Unclaimed' | 'Lost';
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
}

const baggageSchema = new Schema<IBaggage>(
  {
    tagId: { type: String, required: true, unique: true },
    flightNumber: { type: String, required: true },
    passengerName: { type: String, required: true },
    passengerEmail: { type: String },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ['Checked In', 'Loaded', 'In Transit', 'Arrived', 'Unclaimed', 'Lost'],
      default: 'Checked In',
    },
    weight: { type: Number },
  },
  { timestamps: true }
);

baggageSchema.index({ passengerName: 'text', tagId: 'text', flightNumber: 'text' });

export const Baggage = mongoose.model<IBaggage>('Baggage', baggageSchema);
