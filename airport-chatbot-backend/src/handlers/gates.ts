import { db } from '../lib/db';
import { handler, json, parseBody, pathParam, type ApiEvent } from '../lib/http';
import { requireAdmin } from '../lib/auth';
import { gateService } from '../services/gateService';

// All gate routes are admin-only (routes/gates.ts did router.use(authMiddleware, requireAdmin)).

export const list = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const gates = await gateService.list();
  return json(200, { gates });
});

export const get = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const gate = await gateService.getByGateNumber(pathParam(event, 'gateNumber'));
  if (!gate) return json(404, { error: 'Gate not found' });
  return json(200, { gate });
});

export const create = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  try {
    const gate = await gateService.create(parseBody(event));
    return json(201, { gate });
  } catch (error: any) {
    if (error?.code === 11000) return json(409, { error: 'Gate number already exists' });
    throw error;
  }
});

export const update = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const gate = await gateService.update(pathParam(event, 'gateNumber'), parseBody(event));
  if (!gate) return json(404, { error: 'Gate not found' });
  return json(200, { gate });
});

export const remove = handler(async (event: ApiEvent) => {
  const denied = requireAdmin(event);
  if (denied) return denied;
  await db();
  const deleted = await gateService.remove(pathParam(event, 'gateNumber'));
  if (!deleted) return json(404, { error: 'Gate not found' });
  return json(200, { success: true });
});
