import { Flight, IFlight } from '../models/Flight';
import { Gate } from '../models/Gate';

export const flightService = {
  async list(filter: { status?: string; airline?: string; destination?: string }): Promise<IFlight[]> {
    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;
    if (filter.airline) query.airline = filter.airline;
    if (filter.destination) query.destination = filter.destination;
    return Flight.find(query).populate('gateId').sort({ departureTime: 1 });
  },

  async getByFlightNumber(flightNumber: string): Promise<IFlight | null> {
    return Flight.findOne({ flightNumber: flightNumber.toUpperCase() }).populate('gateId');
  },

  async create(data: Partial<IFlight>): Promise<IFlight> {
    if (data.flightNumber) data.flightNumber = data.flightNumber.toUpperCase();
    return Flight.create(data);
  },

  async update(flightNumber: string, updates: Partial<IFlight>): Promise<IFlight | null> {
    const previous = 'gateId' in updates ? await Flight.findOne({ flightNumber: flightNumber.toUpperCase() }) : null;
    const previousGateId = previous?.gateId ? String(previous.gateId) : null;

    const flight = await Flight.findOneAndUpdate(
      { flightNumber: flightNumber.toUpperCase() },
      updates,
      { new: true }
    ).populate('gateId');

    if (flight && 'gateId' in updates) {
      const newGateId = updates.gateId ? String(updates.gateId) : null;

      // Free the previously assigned gate whenever the flight moves off it (reassigned or unassigned),
      // so it doesn't stay stuck 'Occupied' with a stale currentFlightId.
      if (previousGateId && previousGateId !== newGateId) {
        await Gate.findByIdAndUpdate(previousGateId, {
          currentFlightId: null,
          status: 'Available',
          assignedAt: null,
        });
      }

      if (newGateId) {
        await Gate.findByIdAndUpdate(newGateId, {
          currentFlightId: flight._id,
          status: 'Occupied',
          assignedAt: new Date(),
        });
      }
    }

    return flight;
  },

  async remove(flightNumber: string): Promise<boolean> {
    const result = await Flight.deleteOne({ flightNumber: flightNumber.toUpperCase() });
    return result.deletedCount === 1;
  },
};
