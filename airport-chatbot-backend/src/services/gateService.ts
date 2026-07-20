import { Gate, IGate } from '../models/Gate';

export const gateService = {
  async list(): Promise<IGate[]> {
    return Gate.find().populate('currentFlightId').sort({ gateNumber: 1 });
  },

  async getByGateNumber(gateNumber: string): Promise<IGate | null> {
    return Gate.findOne({ gateNumber }).populate('currentFlightId');
  },

  async create(data: Partial<IGate>): Promise<IGate> {
    return Gate.create(data);
  },

  async update(gateNumber: string, updates: Partial<IGate>): Promise<IGate | null> {
    return Gate.findOneAndUpdate({ gateNumber }, updates, { new: true }).populate('currentFlightId');
  },

  async remove(gateNumber: string): Promise<boolean> {
    const result = await Gate.deleteOne({ gateNumber });
    return result.deletedCount === 1;
  },
};
