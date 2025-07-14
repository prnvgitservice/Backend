import mongoose from 'mongoose';
import { activeAndInActiveSubscription, addSubscription, deleteSubscription, getAllActivePlansService, getPlanById, updateSubscription } from '../services/subscription.service.js';

export const addSubscriptionCont = async (req, res, next) => {
  try {
    const result = await addSubscription(req.body);
    res.status(201).json({
      success: true,
      message: "Subscription Added successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};

export const getAllActivePlans = async (req, res,next) => {
  try {
    const plans = await getAllActivePlansService();
    res.status(200).json({ success: true, data: plans ,message: "Subscription Plans Fetched Successfully"});
  } catch (error) {
    console.error('Error fetching plans:', error);
    next(err)
  }
};

export const getSubPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, 'Invalid plan ID');
    }
    const result = await getPlanById(id);
    res.status(200).json({ success: true, message: "Subscription Plan Fetched Successfully", result});
  } catch (err) {
    next(err);
  }
};

export const updateSubscriptionCont = async (req, res, next) => {
  try {
    const result = await updateSubscription(req.body);
    res.status(200).json({ success: true, message: "Subscription Plan Fetched Successfully", result});
  } catch (err) {
    next(err);
  }
};
export const deleteSubscriptionCont = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await deleteSubscription(id);
    res.status(200).json({ success: true, message: "Subscription Plan Fetched Successfully", result});
  } catch (err) {
    next(err);
  }
};
export const activeAndInActiveSubscriptionCont = async (req, res, next) => {
  try {
    const result = await activeAndInActiveSubscription(req.body);
    res.status(200).json({ success: true, message: "Subscription Plan Fetched Successfully", result});
  } catch (err) {
    next(err);
  }
};
