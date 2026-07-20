import mongoose from 'mongoose';
import { env } from '../config/env';
import { Gate } from '../models/Gate';

// Standalone gate inventory for Johann Adolf Pengel Airport (PBM). seedFlights also creates
// PBM-G1..G14 and marks them Occupied by assigning a flight; this script owns the full gate
// list independently, including spare gates not tied to any flight, so the gate board can be
// seeded without touching flights.
//
// Idempotent: status/terminal are only set on first insert ($setOnInsert), so re-running — or
// running this AFTER seedFlights — never resets a gate that a flight has already occupied back
// to Available. New gates get the status defined here.
interface SeedGate {
  gateNumber: string;
  terminal: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
}

const GATES: SeedGate[] = [
  // Flight-serving gates (seedFlights assigns flights to G1..G14; here they seed as Available
  // and are promoted to Occupied by seedFlights when a flight is attached).
  ...Array.from({ length: 14 }, (_, i) => ({
    gateNumber: `PBM-G${i + 1}`,
    terminal: 'Main Terminal',
    status: 'Available' as const,
  })),
  // Spare / non-flight gates so the board isn't 100% occupied.
  { gateNumber: 'PBM-G15', terminal: 'Main Terminal', status: 'Available' },
  { gateNumber: 'PBM-G16', terminal: 'Main Terminal', status: 'Available' },
  { gateNumber: 'PBM-R1', terminal: 'Regional Terminal', status: 'Available' },
  { gateNumber: 'PBM-R2', terminal: 'Regional Terminal', status: 'Maintenance' },
];

const run = async () => {
  if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');
  await mongoose.connect(env.mongodbUri);

  for (const g of GATES) {
    await Gate.findOneAndUpdate(
      { gateNumber: g.gateNumber },
      { $setOnInsert: { gateNumber: g.gateNumber, terminal: g.terminal, status: g.status } },
      { upsert: true, new: true }
    );
    console.log(`Upserted gate ${g.gateNumber} (${g.terminal})`);
  }

  console.log(`\nDone. ${GATES.length} gates ensured.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
