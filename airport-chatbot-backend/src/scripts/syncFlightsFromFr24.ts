import mongoose from 'mongoose';
import { env } from '../config/env';
import { syncFlightsFromFr24 } from '../jobs/fr24Sync';

// One-shot manual/local run of the same sync the `Fr24Sync` SST Cron runs on a schedule in
// production (src/handlers/fr24Sync.ts). Usage: npm run sync:fr24 (requires MONGODB_URI and
// FR24_API_TOKEN in the environment).
const run = async () => {
  if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');
  await mongoose.connect(env.mongodbUri);

  const result = await syncFlightsFromFr24();
  console.log(`FR24 sync: upserted ${result.upserted} of ${result.fetched} flights`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('FR24 sync failed:', error);
  process.exit(1);
});
