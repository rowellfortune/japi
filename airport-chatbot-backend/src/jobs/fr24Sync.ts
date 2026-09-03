import { Flight } from '../models/Flight';
import { Airport } from '../models/Airport';
import { fetchLiveBoard } from '../services/fr24Service';

export interface Fr24SyncResult {
  fetched: number;
  upserted: number;
}

// Upserts the current FR24 board into the Flight collection, and any airports it touched into
// the Airport collection (see models/Airport.ts). Deliberately never touches gateId: FR24 has no
// concept of gates, so a synced flight keeps whatever gate an admin assigned (or the schema
// default of null on first insert) until someone changes it via the existing Flight CRUD.
export async function syncFlightsFromFr24(): Promise<Fr24SyncResult> {
  const { board, airports } = await fetchLiveBoard();

  for (const f of board) {
    await Flight.findOneAndUpdate(
      { flightNumber: f.flightNumber },
      {
        $set: {
          airline: f.airline,
          origin: f.origin,
          destination: f.destination,
          departureTime: f.departureTime,
          arrivalTime: f.arrivalTime,
          status: f.status,
          aircraft: f.aircraft,
          fr24: f.fr24,
        },
        // Only fills in on the very first sighting of a flight — if an admin already entered it
        // ahead of time with a scheduled time, that baseline survives every later sync so the
        // eventual actual departureTime/arrivalTime above can be compared against it to show a
        // delay (see models/Flight.ts). A flight FR24 sees before we ever knew about it just gets
        // its own actual time as the baseline, i.e. no delay to report — which is correct, since
        // we never had a schedule for it to be late against.
        $setOnInsert: {
          scheduledDepartureTime: f.departureTime,
          scheduledArrivalTime: f.arrivalTime,
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  for (const a of airports) {
    await Airport.findOneAndUpdate(
      { iata: a.iata },
      { $set: { icao: a.icao, name: a.name } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  return { fetched: board.length, upserted: board.length };
}
