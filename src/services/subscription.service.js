import plans from '../models/subscriptionPlan.model.js';

export const getAllActivePlansService = async () => {
  return await plans.find({ isActive: true });
};
