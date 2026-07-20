import mongoose, { Schema, Document } from 'mongoose';

export interface IGate extends Document {
  gateNumber: string;
  terminal: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  currentFlightId: mongoose.Types.ObjectId | null;
  assignedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const gateSchema = new Schema<IGate>(
  {
    gateNumber: { type: String, required: true, unique: true },
    terminal: { type: String, required: true },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance'],
      default: 'Available',
    },
    currentFlightId: { type: Schema.Types.ObjectId, ref: 'Flight', default: null },
    assignedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Gate = mongoose.model<IGate>('Gate', gateSchema);
