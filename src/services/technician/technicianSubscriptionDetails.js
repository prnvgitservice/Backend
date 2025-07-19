import TechSubscriptionsDetail from '../../models/technician/technicianSubscriptionDetails.js';
import SubscriptionPlan from '../../models/subscription.model.js';
import Technician from '../../models/authModels/technician.js';
import mongoose from 'mongoose';

export const addTechSubscriptionPlan = async ({ technicianId, subscriptionId }) => {
  if (!technicianId || !subscriptionId) {
    const err = new Error('Validation failed');
    err.statusCode = 401;
    err.errors = ['TechnicianId and SubscriptionId are required.'];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId) || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const err = new Error('Invalid Technician or Subscription ID format');
    err.statusCode = 400;
    err.errors = ['Provided Technician or Subscription ID is not valid.'];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error('Technician not found');
    err.statusCode = 404;
    err.errors = ['Technician ID Not Found'];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error('Subscription not found');
    err.statusCode = 404;
    err.errors = ['Subscription ID Not Found'];
    throw err;
  }

  const now = new Date();
  const newSubscription = {
    subscriptionId: subscription._id,
    subscriptionName: subscription.name,
    startDate: now,
    endDate: null,
    leads: null,
    ordersCount: 0,
  };

  if (subscription.validity) {
    newSubscription.endDate = new Date(now.getTime() + subscription.validity * 24 * 60 * 60 * 1000); 
  }

  if (subscription.leads != null) {
    newSubscription.leads = subscription.leads;
  }

  let techSubscriptionDetail = await TechSubscriptionsDetail.findOne({ technicianId });

  if (techSubscriptionDetail) {
    const lastSub = techSubscriptionDetail.subscriptions?.[techSubscriptionDetail.subscriptions.length - 1];

    let isExpired = false;

    if (lastSub?.endDate && new Date(lastSub.endDate) < now) {
      isExpired = true;
    }

    let isLeadsExhausted = false;

    if (lastSub?.leads != null && lastSub.ordersCount >= lastSub.leads) {
      isLeadsExhausted = true;
    }

    if (!isExpired && !isLeadsExhausted) {
      const err = new Error('Technician already has an active subscription');
      err.statusCode = 409;
      err.errors = ['Current plan is still valid or leads not yet exhausted.'];
      throw err;
    }

    // Add new subscription
    techSubscriptionDetail.subscriptions.push(newSubscription);
    await techSubscriptionDetail.save();
  } else {
    // Create new subscription detail
    
    const newTechSubDetail = new TechSubscriptionsDetail({
      technicianId,
      subscriptions: [newSubscription],
    });
    await newTechSubDetail.save();
  }

  return {
    success: true,
    message: 'Subscription plan added successfully',
    subscription: newSubscription,
  };
};
