import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import FranchiseAccount from "../../models/franchase/franchiseAccount.js";
import SubscriptionPlan from "../../models/subscription.model.js";
import Technician from "../../models/authModels/technician.js";
import Franchise from "../../models/authModels/franchise.js";
import mongoose from "mongoose";

export const addFranchiseAccount = async ({
  franchiseId,
  technicianId,
  subscriptionId,
}) => {
  if (!franchiseId || !technicianId || !subscriptionId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["FranchiseId, TechnicianId, and SubscriptionId are required."];
    throw err;
  }

  // Validate ObjectId formats
  if (
    !mongoose.Types.ObjectId.isValid(franchiseId) ||
    !mongoose.Types.ObjectId.isValid(technicianId) ||
    !mongoose.Types.ObjectId.isValid(subscriptionId)
  ) {
    const err = new Error("Invalid ID format");
    err.statusCode = 400;
    err.errors = ["FranchiseId, TechnicianId, or SubscriptionId is not valid."];
    throw err;
  }

  // Check for franchise existence
  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID not found."];
    throw err;
  }

  // Check for technician existence
  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID not found."];
    throw err;
  }

  // Check for subscription existence
  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  // Get the last subscription detail for the technician
  const techSubscriptionDetail = await TechSubscriptionsDetail.findOne({ technicianId });
  let planId = null;
  if (techSubscriptionDetail?.subscriptions?.length > 0) {
    const lastSub = techSubscriptionDetail.subscriptions[techSubscriptionDetail.subscriptions.length - 1];
    planId = lastSub?._id?.toString();
  }

  // Calculate amount based on subscription name
  let amount = null;
  switch (subscription.name) {
    case "Economy Plan":
      amount = 100;
      break;
    case "Gold Plan":
      amount = 300;
      break;
    case "Platinum Plan":
      amount = 1000;
      break;
  }

  // Create new account document
  const newAccount = new Account({
    franchiseId,
    technicianId,
    subscriptionId,
    planId,
    amount,
  });

  await newAccount.save();

  return {
    success: true,
    message: "Account created successfully",
    newAccountDetails: newAccount,
  };
};


export const getFranchiseAccount = async (franchiseId) => {
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

  const techSubDetails = await TechSubscriptionsDetail.findOne({
    franchiseId,
  });
  if (!techSubDetails || !techSubDetails.subscriptions?.length) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["No subscription found for the Franchise."];
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
