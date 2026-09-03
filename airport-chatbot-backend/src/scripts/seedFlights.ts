import mongoose from 'mongoose';
import { env } from '../config/env';
import { Flight } from '../models/Flight';

// Source: Flightradar24 flight summary API (get_flight_summary_light) for Paramaribo Zanderij
// International Airport (PBM/SMJP), queried for 2026-09-01T00:00Z-2026-09-02T23:59Z and captured
// 2026-09-02. Real flight numbers/routes/aircraft/actual takeoff+landing times. Two in-progress
// flights (KL713, PY993) had no landing time yet at capture time; their arrival is estimated from
// the typical AMS<->PBM block time (~9h45m) observed on the completed KL714 leg.
//
// FR24 does not publish scheduled (as opposed to actual) times or gate assignments, so those are
// deliberately left unset here rather than invented — scheduledDepartureTime/scheduledArrivalTime
// stay null (see models/Flight.ts) and gateId stays unassigned until an admin sets one via the
// Flight/Gate CRUD, exactly as a flight seen for the first time via fr24Sync.ts would land.
const DAY1 = '2026-09-01';
const DAY2 = '2026-09-02';

interface SeedFlight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Departed' | 'Arrived';
  aircraft: string;
}

const FLIGHTS: SeedFlight[] = [
  // -- DAY1 (2026-09-01), all completed --
  { flightNumber: 'CM318', airline: 'Copa Airlines', origin: 'PTY', destination: 'PBM', departureTime: `${DAY1}T15:55:11Z`, arrivalTime: `${DAY1}T19:17:12Z`, status: 'Arrived', aircraft: 'B39M' },
  { flightNumber: 'M6820', airline: 'Amerijet International', origin: 'PBM', destination: 'MIA', departureTime: `${DAY1}T15:36:58Z`, arrivalTime: `${DAY1}T19:55:21Z`, status: 'Arrived', aircraft: 'B763' },
  { flightNumber: 'KL714', airline: 'KLM', origin: 'PBM', destination: 'AMS', departureTime: `${DAY1}T20:25:53Z`, arrivalTime: `${DAY2}T03:33:54Z`, status: 'Arrived', aircraft: 'B772' },
  { flightNumber: 'CM319', airline: 'Copa Airlines', origin: 'PBM', destination: 'PTY', departureTime: `${DAY1}T20:32:20Z`, arrivalTime: `${DAY2}T00:10:56Z`, status: 'Arrived', aircraft: 'B39M' },
  // -- DAY2 (2026-09-02), completed legs --
  { flightNumber: 'G3-7472', airline: 'GOL', origin: 'BEL', destination: 'PBM', departureTime: `${DAY2}T03:11:04Z`, arrivalTime: `${DAY2}T04:48:24Z`, status: 'Arrived', aircraft: 'B38M' },
  { flightNumber: 'BW883', airline: 'Caribbean Airlines', origin: 'POS', destination: 'PBM', departureTime: `${DAY2}T03:24:02Z`, arrivalTime: `${DAY2}T04:39:48Z`, status: 'Arrived', aircraft: 'B38M' },
  { flightNumber: 'W8263', airline: 'Cargojet Airways', origin: 'GEO', destination: 'PBM', departureTime: `${DAY2}T04:20:09Z`, arrivalTime: `${DAY2}T05:02:00Z`, status: 'Arrived', aircraft: 'B763' },
  { flightNumber: 'G3-7473', airline: 'GOL', origin: 'PBM', destination: 'BEL', departureTime: `${DAY2}T06:24:31Z`, arrivalTime: `${DAY2}T07:52:35Z`, status: 'Arrived', aircraft: 'B38M' },
  { flightNumber: 'W8264', airline: 'Cargojet Airways', origin: 'PBM', destination: 'MIA', departureTime: `${DAY2}T07:02:01Z`, arrivalTime: `${DAY2}T11:15:21Z`, status: 'Arrived', aircraft: 'B763' },
  { flightNumber: 'BW884', airline: 'Caribbean Airlines', origin: 'PBM', destination: 'POS', departureTime: `${DAY2}T07:47:11Z`, arrivalTime: `${DAY2}T09:04:34Z`, status: 'Arrived', aircraft: 'B38M' },
  // -- DAY2 (2026-09-02), still airborne at capture time; arrival estimated from the ~9h45m
  // AMS<->PBM block time observed on KL714 above --
  { flightNumber: 'KL713', airline: 'KLM', origin: 'AMS', destination: 'PBM', departureTime: `${DAY2}T08:39:19Z`, arrivalTime: `${DAY2}T18:24:00Z`, status: 'Departed', aircraft: 'B772' },
  { flightNumber: 'PY993', airline: 'Surinam Airways', origin: 'AMS', destination: 'PBM', departureTime: `${DAY2}T08:50:24Z`, arrivalTime: `${DAY2}T18:35:00Z`, status: 'Departed', aircraft: 'A346' },
];

const run = async () => {
  if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');
  await mongoose.connect(env.mongodbUri);

  for (const f of FLIGHTS) {
    await Flight.findOneAndUpdate(
      { flightNumber: f.flightNumber },
      {
        flightNumber: f.flightNumber,
        airline: f.airline,
        origin: f.origin,
        destination: f.destination,
        departureTime: new Date(f.departureTime),
        arrivalTime: new Date(f.arrivalTime),
        scheduledDepartureTime: null,
        scheduledArrivalTime: null,
        status: f.status,
        aircraft: f.aircraft,
        gateId: null,
      },
      { upsert: true, new: true }
    );

    console.log(`Upserted ${f.flightNumber}: ${f.origin} -> ${f.destination}`);
  }

  console.log(`\nDone. ${FLIGHTS.length} flights upserted.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
