import { db } from '../lib/db';
import { handler, json, parseBody, pathParam, type ApiEvent } from '../lib/http';
import { requireAdmin, isAdminRequest } from '../lib/auth';
import { baggageService } from '../services/baggageService';

// Public lookups must not leak other passengers' PII; admins get the full record. Mirrors
// baggageController.toPublicView.
const toPublicView = (baggage: any) => ({
  tagId: baggage.tagId,
  flightNumber: baggage.flightNumber,
  destination: baggage.destination,
  status: baggage.status,
});

// Public: a passenger holding the physical tag checks their own bag (routes/baggage.ts
// GET /:tagId). Admins hitting the same route see the full record.
export const getByTag = handler(async (event: ApiEvent) => {
  await db();
  const baggage = await baggageService.getByTagId(pathParam(event, 'tagId'));
  if (!baggage) return json(404, { error: 'Baggage not found' });
  return json(200, { baggage: isAdminRequest(event) ? baggage : toPublicView(baggage) });
});

// Admin-only: lists every passenger's baggage on a flight.
export const getByFlight = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const baggage = await baggageService.getByFlightNumber(pathParam(event, 'flightNumber'));
  return json(200, { baggage });
});

export const create = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  try {
    const baggage = await baggageService.create(parseBody(event));
    return json(201, { baggage });
  } catch (error: any) {
    if (error?.code === 11000) return json(409, { error: 'Tag ID already exists' });
    throw error;
  }
});

export const update = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const baggage = await baggageService.update(pathParam(event, 'tagId'), parseBody(event));
  if (!baggage) return json(404, { error: 'Baggage not found' });
  return json(200, { baggage });
});

export const remove = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const deleted = await baggageService.remove(pathParam(event, 'tagId'));
  if (!deleted) return json(404, { error: 'Baggage not found' });
  return json(200, { success: true });
});
