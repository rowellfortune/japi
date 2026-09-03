import { env } from '../config/env';
import { syncFlightsFromFr24 } from './fr24Sync';
import { logger } from '../utils/logger';

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

// Local-dev equivalent of the `Fr24Sync` SST Cron (src/handlers/fr24Sync.ts), which only runs
// once deployed. Keeps `npm run dev` showing live Arrivals/Departures too. No-ops without
// FR24_API_TOKEN so the rest of the app still runs for anyone without an FR24 subscription.
export const startFr24SyncScheduler = (): void => {
  if (!env.fr24ApiToken) {
    logger.warn('FR24_API_TOKEN not set — live Arrivals/Departures sync disabled');
    return;
  }

  const tick = async () => {
    try {
      const result = await syncFlightsFromFr24();
      logger.info(`FR24 sync: upserted ${result.upserted} of ${result.fetched} flights`);
    } catch (error) {
      logger.error('FR24 sync failed:', error);
    }
  };

  void tick();
  setInterval(tick, SYNC_INTERVAL_MS);
};
