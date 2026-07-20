import mongoose from 'mongoose';

// Register every model's schema on the default connection. Each handler bundles only the
// models it imports directly, so a populate() across a ref (e.g. gateService populating
// 'currentFlightId' -> Flight) throws MissingSchemaError in a bundle that never imported the
// referenced model. Importing all models here guarantees every handler that calls db() has the
// full schema registry, regardless of which services it uses. Side-effect imports — the
// modules run mongoose.model(...) at load — kept from tree-shaking by referencing them below.
import { User } from '../models/User';
import { Flight } from '../models/Flight';
import { Gate } from '../models/Gate';
import { Baggage } from '../models/Baggage';
import { ChatHistory } from '../models/ChatHistory';

// Touch each model so esbuild cannot tree-shake the imports away.
void [User, Flight, Gate, Baggage, ChatHistory];

// Lambda reuses a warm execution environment across invocations, so we connect once per
// container and cache the promise on module scope. Subsequent invocations reuse the open
// socket instead of reconnecting (the mistake config/database.ts makes on every boot), and
// we never call process.exit — throwing lets the handler return a 500 while keeping the
// container alive for the next request.
let conn: Promise<typeof mongoose> | null = null;

export const db = (): Promise<typeof mongoose> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  if (!conn) {
    // bufferCommands:false makes queries fail fast if the connection drops rather than
    // queueing. serverSelectionTimeoutMS caps how long we wait to reach Atlas — without it,
    // an unreachable cluster (e.g. IP not allow-listed) hangs until the Lambda's own timeout,
    // producing a bare API Gateway 500 instead of a diagnosable MongooseServerSelectionError.
    conn = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    }).catch((e) => {
      // Reset so the next invocation retries instead of reusing a rejected promise forever.
      conn = null;
      throw e;
    });
  }
  return conn;
};
