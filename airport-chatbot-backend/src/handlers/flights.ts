import { db } from '../lib/db';
import { handler, json, parseBody, pathParam, queryParam, type ApiEvent } from '../lib/http';
import { requireAdmin } from '../lib/auth';
import { flightService } from '../services/flightService';

// All flight routes are admin-only (routes/flights.ts did router.use(authMiddleware, requireAdmin)).
// Each handler checks requireAdmin first, then delegates to the unchanged flightService.

export const list = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const flights = await flightService.list({
    status: queryParam(event, 'status'),
    airline: queryParam(event, 'airline'),
    destination: queryParam(event, 'destination'),
  });
  return json(200, { flights });
});

export const get = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const flight = await flightService.getByFlightNumber(pathParam(event, 'flightNumber'));
  if (!flight) return json(404, { error: 'Flight not found' });
  return json(200, { flight });
});

export const create = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  try {
    const flight = await flightService.create(parseBody(event));
    return json(201, { flight });
  } catch (error: any) {
    if (error?.code === 11000) return json(409, { error: 'Flight number already exists' });
    throw error;
  }
});

export const update = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const flight = await flightService.update(pathParam(event, 'flightNumber'), parseBody(event));
  if (!flight) return json(404, { error: 'Flight not found' });
  return json(200, { flight });
});

export const remove = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const deleted = await flightService.remove(pathParam(event, 'flightNumber'));
  if (!deleted) return json(404, { error: 'Flight not found' });
  return json(200, { success: true });
});
