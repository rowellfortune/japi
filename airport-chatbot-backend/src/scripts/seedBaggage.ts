import mongoose from 'mongoose';
import { env } from '../config/env';
import { Baggage } from '../models/Baggage';
import { Flight } from '../models/Flight';

// Demo baggage for Johann Adolf Pengel Airport (PBM). Each item references a flightNumber that
// seedFlights creates. The destination is NOT hardcoded here — it is looked up from the actual
// Flight at seed time, so the Baggage -> Flight destination can never drift out of sync (the
// chatbot follows the Baggage -> Flight -> Gate chain, so this correspondence must hold). A bag
// whose flightNumber has no matching flight is skipped with a warning rather than seeded as an
// orphan. Statuses span the full enum for realistic variety. Idempotent: upserted by tagId.
interface SeedBag {
  tagId: string;
  flightNumber: string;
  passengerName: string;
  passengerEmail?: string;
  status: 'Checked In' | 'Loaded' | 'In Transit' | 'Arrived' | 'Unclaimed' | 'Lost';
  weight: number;
}

const BAGS: SeedBag[] = [
  // Departures out of PBM
  { tagId: 'PBM-BG1001', flightNumber: 'KL714', passengerName: 'Anisha Ramdin', passengerEmail: 'anisha.ramdin@example.com', status: 'Loaded', weight: 23.4 },
  { tagId: 'PBM-BG1002', flightNumber: 'KL714', passengerName: 'Marlon Vieira', passengerEmail: 'marlon.vieira@example.com', status: 'Checked In', weight: 19.8 },
  { tagId: 'PBM-BG1003', flightNumber: 'PY994', passengerName: 'Sunita Kalloe', passengerEmail: 'sunita.kalloe@example.com', status: 'In Transit', weight: 27.1 },
  { tagId: 'PBM-BG1004', flightNumber: 'PY9915', passengerName: 'Rakesh Bhola', passengerEmail: 'rakesh.bhola@example.com', status: 'Loaded', weight: 21.0 },
  { tagId: 'PBM-BG1005', flightNumber: 'G3-7473', passengerName: 'Fabiana Costa', passengerEmail: 'fabiana.costa@example.com', status: 'Checked In', weight: 18.5 },
  { tagId: 'PBM-BG1006', flightNumber: 'PY331', passengerName: 'Devendra Pertab', passengerEmail: 'devendra.pertab@example.com', status: 'Loaded', weight: 24.9 },
  { tagId: 'PBM-BG1007', flightNumber: 'CM319', passengerName: 'Gloria Mendez', passengerEmail: 'gloria.mendez@example.com', status: 'In Transit', weight: 20.2 },

  // Arrivals into PBM
  { tagId: 'PBM-BG2001', flightNumber: 'KL713', passengerName: 'Wendell Abendanon', passengerEmail: 'wendell.abendanon@example.com', status: 'Arrived', weight: 22.6 },
  { tagId: 'PBM-BG2002', flightNumber: 'PY993', passengerName: 'Chandra Mohan', passengerEmail: 'chandra.mohan@example.com', status: 'Arrived', weight: 26.3 },
  { tagId: 'PBM-BG2003', flightNumber: 'PY422', passengerName: 'Imro Pinas', passengerEmail: 'imro.pinas@example.com', status: 'Unclaimed', weight: 17.7 },
  { tagId: 'PBM-BG2004', flightNumber: 'CM318', passengerName: 'Priya Jagernath', passengerEmail: 'priya.jagernath@example.com', status: 'Arrived', weight: 30.0 },

  // A lost bag, for the "report lost baggage" path
  { tagId: 'PBM-BG9001', flightNumber: '8W726', passengerName: 'Ricardo Sedney', passengerEmail: 'ricardo.sedney@example.com', status: 'Lost', weight: 15.2 },
];

const run = async () => {
  if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');
  await mongoose.connect(env.mongodbUri);

  let seeded = 0;
  let skipped = 0;
  for (const b of BAGS) {
    const flightNumber = b.flightNumber.toUpperCase();
    const flight = await Flight.findOne({ flightNumber });
    if (!flight) {
      console.warn(`SKIP ${b.tagId}: no flight ${flightNumber} in the database (run seedFlights first)`);
      skipped++;
      continue;
    }

    // Destination is taken from the flight so baggage and flight always agree.
    await Baggage.findOneAndUpdate(
      { tagId: b.tagId },
      {
        tagId: b.tagId,
        flightNumber,
        passengerName: b.passengerName,
        passengerEmail: b.passengerEmail,
        destination: flight.destination,
        status: b.status,
        weight: b.weight,
      },
      { upsert: true, new: true }
    );
    console.log(`Upserted baggage ${b.tagId} (${flightNumber} -> ${flight.destination}, ${b.status})`);
    seeded++;
  }

  console.log(`\nDone. ${seeded} baggage items upserted${skipped ? `, ${skipped} skipped (missing flight)` : ''}.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
