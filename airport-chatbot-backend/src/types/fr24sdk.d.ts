// @flightradar24/fr24sdk ships no type declarations (no "types" field, dist/ is a bundled
// .cjs/.mjs pair). This is a minimal ambient shim covering only what fr24Service.ts uses —
// widen it if other resources (live, historic, flightTracks, usage) get used later.
declare module '@flightradar24/fr24sdk' {
  export interface Fr24ClientOptions {
    apiToken: string;
    apiVersion?: string;
    timeout?: number;
  }

  export interface Fr24FlightSummary {
    fr24_id: string;
    flight: string | null;
    callsign: string | null;
    operating_as: string | null;
    painted_as: string | null;
    // full-only fields — always undefined on the /light response this service now uses.
    type?: string | null;
    reg?: string | null;
    orig_icao: string | null;
    orig_iata?: string | null;
    dest_icao: string | null;
    dest_iata?: string | null;
    dest_icao_actual?: string | null;
    dest_iata_actual?: string | null;
    datetime_takeoff: string | null;
    runway_takeoff?: string | null;
    datetime_landed: string | null;
    runway_landed?: string | null;
    flight_time?: number | null;
    actual_distance?: number | null;
    circle_distance?: number | null;
    category?: string | null;
    hex?: string | null;
    first_seen?: string | null;
    last_seen?: string | null;
    flight_ended?: boolean;
    [key: string]: unknown;
  }

  export interface Fr24AirportLight {
    name: string;
    iata: string;
    icao: string;
  }

  export interface Fr24AirlineLight {
    name: string;
    iata: string | null;
    icao: string;
  }

  // /live/flight-positions/light — real-time ADS-B telemetry for an airborne aircraft. Only
  // present while it's actually transmitting; gone once it lands and drops off live tracking.
  // `flight`/`type`/`reg`/`eta` are full-only and always undefined on this response.
  export interface Fr24LivePosition {
    fr24_id: string;
    flight?: string | null;
    callsign: string | null;
    lat: number;
    lon: number;
    track: number;
    alt: number;
    gspeed: number;
    vspeed: number;
    squawk?: string | null;
    timestamp: string;
    source?: string | null;
    hex?: string | null;
    type?: string | null;
    reg?: string | null;
    eta?: string | null;
    [key: string]: unknown;
  }

  export class Client {
    constructor(options: Fr24ClientOptions);
    flightSummary: {
      getLight(params: Record<string, unknown>): Promise<{ data: Fr24FlightSummary[] }>;
    };
    live: {
      getLight(params: Record<string, unknown>): Promise<Fr24LivePosition[]>;
    };
    airports: {
      getLight(code: string): Promise<Fr24AirportLight>;
    };
    airlines: {
      getLight(icao: string): Promise<Fr24AirlineLight>;
    };
    close(): void;
  }

  // The package's actual ESM build only exposes a default export (an object holding `Client`
  // as a property) — named `import { Client }` resolves at the type level but throws at
  // runtime. Consumers must `import fr24sdk from ...; const { Client } = fr24sdk`.
  const fr24sdk: { Client: typeof Client };
  export default fr24sdk;
}
