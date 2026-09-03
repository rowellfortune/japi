import fr24sdk, { type Client as Fr24Client } from '@flightradar24/fr24sdk';
const { Client } = fr24sdk;
import { env } from './env';

// IATA codes of every FR24-tracked airport in Suriname — the live sync tracks movements into/out
// of any of these. PBM (Zanderij) is the international gateway; ORG (Zorg en Hoop) is the
// domestic/interior hub. Suriname's small interior airstrips (Kabalebo, Botopasi, etc.) aren't
// meaningfully covered by FR24 (uncontrolled, often unpaved) and are excluded.
export const HOME_AIRPORTS = ['PBM'] as const;
export type HomeAirport = (typeof HOME_AIRPORTS)[number];

let client: Fr24Client | null = null;

// Lazy singleton: importing this module must not throw when FR24_API_TOKEN is unset (most of
// the app doesn't need it). The error only surfaces when something actually tries to call FR24.
export const getFr24Client = (): Fr24Client => {
  if (!env.fr24ApiToken) {
    throw new Error('FR24_API_TOKEN environment variable is not set — cannot sync live flight data');
  }
  if (!client) {
    client = new Client({ apiToken: env.fr24ApiToken });
  }
  return client;
};
