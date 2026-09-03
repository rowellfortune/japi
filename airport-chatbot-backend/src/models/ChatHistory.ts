import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // Structured flight-list payload for a "list all flights" assistant reply, so the frontend can
  // re-render the card list after a page reload instead of just the model's plain-text intro.
  flights?: unknown[];
  // Structured single-flight payload for a "tell me about flight X" assistant reply, so the
  // frontend can re-render the detail card after a page reload.
  flight?: unknown;
}

export interface IChatHistory extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        flights: { type: [Schema.Types.Mixed], default: undefined },
        flight: { type: Schema.Types.Mixed, default: undefined },
      },
    ],
    expiresAt: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

chatHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
