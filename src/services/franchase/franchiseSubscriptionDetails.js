import FranchiseSubscriptionsDetail from "../../models/franchase/franchiseSubscriptionDetails.js";
import FranchiseSubscriptionPlan from "../../models/franchase/franchiseSubscriptions.js";
import Franchise from "../../models/authModels/franchise.js";
import mongoose from "mongoose";

export const addFranchiseSubscriptionPlan = async ({
  franchiseId,
  franchiseSubscriptionId,
}) => {
  console.log(
    "franchiseId, franchiseSubscriptionId",
    franchiseId,
    franchiseSubscriptionId
  );
  if (!franchiseId || !franchiseSubscriptionId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Franchise Id and Franchise Subscription Id are required."];
    throw err;
  }

  if (
    !mongoose.Types.ObjectId.isValid(franchiseId) ||
    !mongoose.Types.ObjectId.isValid(franchiseSubscriptionId)
  ) {
    const err = new Error("Invalid Franchise or Subscription ID format");
    err.statusCode = 400;
    err.errors = ["Provided Franchise or Subscription ID is not valid."];
    throw err;
  }

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID Not Found"];
    throw err;
  }
  const subscription = await FranchiseSubscriptionPlan.findById(
    franchiseSubscriptionId
  );
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID Not Found"];
    throw err;
  }

  const now = new Date();
  const newSubscription = {
    franchiseSubscriptionId: subscription._id,
    subscriptionName: subscription.name,
    startDate: now,
    endDate: null,
  };

  if (subscription.validity) {
    newSubscription.endDate = new Date(
      now.getTime() + subscription.validity * 24 * 60 * 60 * 1000
    );
  }

  let techSubscriptionDetail = await FranchiseSubscriptionsDetail.findOne({
    franchiseId,
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

    techSubscriptionDetail.subscriptions.push(newSubscription);
    await techSubscriptionDetail.save();
  } else {
    const newTechSubDetail = new FranchiseSubscriptionsDetail({
      franchiseId,
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

export const getFranchiseSubscriptionPlan = async (franchiseId) => {
  if (!franchiseId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Franchise Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
    const err = new Error("Invalid Franchise ID format");
    err.statusCode = 400;
    err.errors = ["Provided Franchise ID is not valid."];
    throw err;
  }

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    throw err;
  }

  const techSubDetails = await FranchiseSubscriptionsDetail.findOne({
    franchiseId,
  });
  if (!techSubDetails || !techSubDetails.subscriptions?.length) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["No subscription found for the franchise."];
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
