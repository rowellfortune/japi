import mongoose from 'mongoose';
import { env } from '../config/env';
import { Flight } from '../models/Flight';
import { Gate } from '../models/Gate';

// Source: Flightradar24 scheduled arrivals/departures for Paramaribo Zanderij International
// Airport (PBM/SMJP), captured 2026-07-18. Real flight numbers/routes/aircraft; the missing
// half of each leg's timing (the airport only lists one side of arrival/departure) is estimated
// from typical route duration. Gate numbers are NOT published by Flightradar24 and are made up
// here purely so the demo data exercises the Flight<->Gate relationship.
const TODAY = '2026-07-18';
const TOMORROW = '2026-07-19';

// Prefixed to guarantee no collision with pre-existing gate numbers (e.g. a real "A5" already
// existed from earlier manual testing) — one dedicated gate per flight keeps the Flight<->Gate
// relationship a clean one-to-one instead of several flights fighting over a handful of gates.
const GATE_PREFIX = 'PBM-G';

interface SeedFlight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Scheduled' | 'Delayed';
  aircraft: string;
}

const FLIGHTS: SeedFlight[] = [
  { flightNumber: '8W726', airline: 'Fly AllWays', origin: 'GEO', destination: 'PBM', departureTime: `${TODAY}T17:00`, arrivalTime: `${TODAY}T18:15`, status: 'Scheduled', aircraft: 'F70' },
  { flightNumber: 'PY422', airline: 'Surinam Airways', origin: 'GEO', destination: 'PBM', departureTime: `${TODAY}T19:00`, arrivalTime: `${TODAY}T20:15`, status: 'Scheduled', aircraft: '738' },
  { flightNumber: 'G3-7472', airline: 'GOL', origin: 'BEL', destination: 'PBM', departureTime: `${TODAY}T18:30`, arrivalTime: `${TODAY}T20:30`, status: 'Scheduled', aircraft: '7M8' },
  { flightNumber: 'PY9916', airline: 'Surinam Airways', origin: 'BEL', destination: 'PBM', departureTime: `${TOMORROW}T00:15`, arrivalTime: `${TOMORROW}T02:15`, status: 'Scheduled', aircraft: '738' },
  { flightNumber: 'KL713', airline: 'KLM', origin: 'AMS', destination: 'PBM', departureTime: `${TODAY}T03:30`, arrivalTime: `${TODAY}T13:15`, status: 'Scheduled', aircraft: '77W' },
  { flightNumber: 'PY332', airline: 'Surinam Airways', origin: 'GEO', destination: 'PBM', departureTime: `${TODAY}T12:15`, arrivalTime: `${TODAY}T13:30`, status: 'Scheduled', aircraft: '738' },
  { flightNumber: 'PY993', airline: 'Surinam Airways', origin: 'AMS', destination: 'PBM', departureTime: `${TODAY}T05:05`, arrivalTime: `${TODAY}T14:50`, status: 'Scheduled', aircraft: 'A346' },
  { flightNumber: 'CM318', airline: 'Copa Airlines', origin: 'PTY', destination: 'PBM', departureTime: `${TODAY}T12:37`, arrivalTime: `${TODAY}T16:37`, status: 'Scheduled', aircraft: '738' },
  { flightNumber: 'KL714', airline: 'KLM', origin: 'PBM', destination: 'AMS', departureTime: `${TODAY}T18:10`, arrivalTime: `${TOMORROW}T03:55`, status: 'Delayed', aircraft: 'B77W' },
  { flightNumber: 'PY9915', airline: 'Surinam Airways', origin: 'PBM', destination: 'BEL', departureTime: `${TODAY}T21:45`, arrivalTime: `${TODAY}T23:45`, status: 'Scheduled', aircraft: '738' },
  { flightNumber: 'G3-7473', airline: 'GOL', origin: 'PBM', destination: 'BEL', departureTime: `${TODAY}T22:15`, arrivalTime: `${TOMORROW}T00:15`, status: 'Scheduled', aircraft: '7M8' },
  { flightNumber: 'PY331', airline: 'Surinam Airways', origin: 'PBM', destination: 'GEO', departureTime: `${TODAY}T07:00`, arrivalTime: `${TODAY}T08:15`, status: 'Scheduled', aircraft: '738' },
  { flightNumber: 'CM319', airline: 'Copa Airlines', origin: 'PBM', destination: 'PTY', departureTime: `${TODAY}T17:34`, arrivalTime: `${TODAY}T21:34`, status: 'Delayed', aircraft: '738' },
  { flightNumber: 'PY994', airline: 'Surinam Airways', origin: 'PBM', destination: 'AMS', departureTime: `${TODAY}T21:00`, arrivalTime: `${TOMORROW}T06:45`, status: 'Scheduled', aircraft: '346' },
];

const run = async () => {
  if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');
  await mongoose.connect(env.mongodbUri);

  for (const [i, f] of FLIGHTS.entries()) {
    const gateNumber = `${GATE_PREFIX}${i + 1}`;
    const gate = await Gate.findOneAndUpdate(
      { gateNumber },
      { $setOnInsert: { gateNumber, terminal: 'Main Terminal' } },
      { upsert: true, new: true }
    );

    const flight = await Flight.findOneAndUpdate(
      { flightNumber: f.flightNumber },
      {
        flightNumber: f.flightNumber,
        airline: f.airline,
        origin: f.origin,
        destination: f.destination,
        departureTime: new Date(f.departureTime),
        arrivalTime: new Date(f.arrivalTime),
        status: f.status,
        aircraft: f.aircraft,
        gateId: gate._id,
      },
      { upsert: true, new: true }
    );

    // Keep the relationship consistent both ways: the gate should agree it's holding this flight.
    await Gate.findByIdAndUpdate(gate._id, {
      currentFlightId: flight._id,
      status: 'Occupied',
      assignedAt: new Date(),
    });

    console.log(`Upserted ${f.flightNumber}: ${f.origin} -> ${f.destination} (gate ${gateNumber})`);
  }

  console.log(`\nDone. ${FLIGHTS.length} flights and gates upserted (1:1).`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
