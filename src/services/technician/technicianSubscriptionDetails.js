import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import SubscriptionPlan from "../../models/subscription.js";
import Technician from "../../models/authModels/technician.js";
import mongoose from "mongoose";

export const addTechSubscriptionPlan = async ({
  technicianId,
  subscriptionId,
}) => {
  if (!technicianId || !subscriptionId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["TechnicianId and SubscriptionId are required."];
    throw err;
  }

  if (
    !mongoose.Types.ObjectId.isValid(technicianId) ||
    !mongoose.Types.ObjectId.isValid(subscriptionId)
  ) {
    const err = new Error("Invalid Technician or Subscription ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician or Subscription ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID Not Found"];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID Not Found"];
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
    newSubscription.endDate = new Date(
      now.getTime() + subscription.validity * 24 * 60 * 60 * 1000
    );
  }

  if (subscription.leads != null) {
    newSubscription.leads = subscription.leads;
  }

  let techSubscriptionDetail = await TechSubscriptionsDetail.findOne({
    technicianId,
  });

  if (techSubscriptionDetail) {
    const lastSub =
      techSubscriptionDetail.subscriptions?.[
        techSubscriptionDetail.subscriptions.length - 1
      ];

    let isExpired = false;
    if (lastSub?.endDate && new Date(lastSub.endDate) < now) {
      isExpired = true;
    }

    let isLeadsExhausted = false;
    if (lastSub?.leads != null && lastSub.ordersCount >= lastSub.leads) {
      isLeadsExhausted = true;
    }

    const isFreePlan = lastSub?.subscriptionName?.toLowerCase() === "free plan";
    const isTryingToBuyFreePlan =
      subscription.name?.toLowerCase() === "free plan";

    if (isFreePlan && isTryingToBuyFreePlan) {
      const err = new Error("Free Plan already activated");
      err.statusCode = 409;
      err.errors = ["Cannot subscribe to Free Plan again."];
      throw err;
    }

    if (!isFreePlan && !isExpired && !isLeadsExhausted) {
      const err = new Error(
        "Technician already has an active paid subscription"
      );
      err.statusCode = 409;
      err.errors = ["Paid plan is still valid or leads not yet exhausted."];
      throw err;
    }

    techSubscriptionDetail.subscriptions.push(newSubscription);
    await techSubscriptionDetail.save();
  } else {
    const newTechSubDetail = new TechSubscriptionsDetail({
      technicianId,
      subscriptions: [newSubscription],
    });
    await newTechSubDetail.save();
  }

  return {
    success: true,
    message: "Subscription plan added successfully",
    subscription: newSubscription,
  };
};


export const updateSubscriptionPlan = async ({
  technicianId,
  subscriptionId,
}) => {
  if (!technicianId || !subscriptionId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["TechnicianId and SubscriptionId are required."];
    throw err;
  }

  if (
    !mongoose.Types.ObjectId.isValid(technicianId) ||
    !mongoose.Types.ObjectId.isValid(subscriptionId)
  ) {
    const err = new Error("Invalid Technician or Subscription ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician or Subscription ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID Not Found"];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID Not Found"];
    throw err;
  }

  const now = new Date();
  const updatedSubscriptionData = {
    subscriptionId: subscription._id,
    subscriptionName: subscription.name,
    startDate: now,
    endDate: null,
    leads: null,
    ordersCount: 0,
  };

  if (subscription.validity) {
    updatedSubscriptionData.endDate = new Date(
      now.getTime() + subscription.validity * 24 * 60 * 60 * 1000
    );
  }

  if (subscription.leads != null) {
    updatedSubscriptionData.leads = subscription.leads;
  }

  const techSubscriptionDetail = await TechSubscriptionsDetail.findOne({
    technicianId,
  });

  if (!techSubscriptionDetail || !techSubscriptionDetail.subscriptions?.length) {
    const err = new Error("No existing subscription to update");
    err.statusCode = 404;
    err.errors = ["Technician has no subscriptions."];
    throw err;
  }

  const lastSub =
    techSubscriptionDetail.subscriptions[
      techSubscriptionDetail.subscriptions.length - 1
    ];

  // Enforce: Only update if current (last) subscription is a Free Plan
  // (Prevent updates for paid plans; allow upgrades/renewals from Free only)
  if (lastSub?.subscriptionName?.toLowerCase() !== "free plan") {
    const err = new Error("Cannot update paid plan");
    err.statusCode = 409;
    err.errors = ["Updates are only allowed for current Free Plan."];
    throw err;
  }

  // Update the last subscription with new data (upgrade/renewal to any plan)
  // This overwrites in-place for simplicity; future changes to plans are fetched dynamically
  Object.assign(lastSub, updatedSubscriptionData);
  await techSubscriptionDetail.save();

  return {
    success: true,
    message: "Subscription plan updated successfully",
    subscription: lastSub,
  };
};


export const getTechSubscriptionPlan = async (technicianId) => {
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    throw err;
  }

  const techSubDetails = await TechSubscriptionsDetail.findOne({
    technicianId,
  });
  if (!techSubDetails || !techSubDetails.subscriptions?.length) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["No subscription found for the technician."];
    throw err;
  }

  const lastSub =
    techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

  return {
    success: true,
    message: "Latest subscription plan fetched successfully",
    subscription: lastSub,
  };
};
