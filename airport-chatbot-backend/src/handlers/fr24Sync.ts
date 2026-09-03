import { db } from '../lib/db';
import { syncFlightsFromFr24 } from '../jobs/fr24Sync';
import { logger } from '../utils/logger';

// Invoked on a schedule by the `Fr24Sync` SST Cron (see sst.config.ts), not through API Gateway
// — a plain scheduled-event handler, so no ApiEvent/json response shape needed.
export const run = async (): Promise<void> => {
  await db();
  const result = await syncFlightsFromFr24();
  logger.info(`FR24 sync: upserted ${result.upserted} of ${result.fetched} flights`);
};
