import mongoose from 'mongoose';
import { getAllActivePlansService, getPlanById } from '../services/subscription.service.js';

export const getAllActivePlans = async (req, res,next) => {
  try {
    const plans = await getAllActivePlansService();
    res.status(200).json({ success: true, data: plans ,message: "Subscription Plans Fetched Successfully"});
  } catch (error) {
    console.error('Error fetching plans:', error);
    next(err)
    // res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getSubPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, 'Invalid plan ID');
    }
    const plan = await getPlanById(id);
    res.status(200).json({ success: true, data: plan ,message: "Subscription Plan Fetched Successfully"});
  } catch (err) {
    next(err);
  }
};
