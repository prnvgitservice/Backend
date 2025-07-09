import plans from '../models/subscription.model.js';

export const getAllActivePlansService = async () => {
  return await plans.find({ isActive: true });
};
