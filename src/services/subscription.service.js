import plans from '../models/subscription.model.js';

export const getAllActivePlansService = async () => {
  return await plans.find({ isActive: true });
};

export const getPlanById = async (id) => {
  const plan = await plans.findById(id);
  if (!plan) {
    throw createError(404, 'Subscription plan not found');
  }
  return plan;
};
