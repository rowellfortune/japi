import { Baggage, IBaggage } from '../models/Baggage';

export const baggageService = {
  async getByTagId(tagId: string): Promise<IBaggage | null> {
    return Baggage.findOne({ tagId });
  },

  async getByFlightNumber(flightNumber: string): Promise<IBaggage[]> {
    return Baggage.find({ flightNumber: flightNumber.toUpperCase() });
  },

  async create(data: Partial<IBaggage>): Promise<IBaggage> {
    if (data.flightNumber) data.flightNumber = data.flightNumber.toUpperCase();
    return Baggage.create(data);
  },

  async update(tagId: string, updates: Partial<IBaggage>): Promise<IBaggage | null> {
    return Baggage.findOneAndUpdate({ tagId }, updates, { new: true });
  },

  async remove(tagId: string): Promise<boolean> {
    const result = await Baggage.deleteOne({ tagId });
    return result.deletedCount === 1;
  },
};
