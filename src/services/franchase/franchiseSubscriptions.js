import mongoose from "mongoose";
import FranchiseSubscription from "../../models/franchase/franchiseSubscriptions.js";

export const addFranchiseSubscription = async ({
  name,
  originalPrice,
  discount,
  discountPercentage,
  price,
  gstPercentage,
  gst,
  finalPrice,
  validity,
  features,
  fullFeatures,
  isPopular,
  isActive,
}) => {
  if (
    !name ||
    originalPrice == null ||
    price == null ||
    gstPercentage == null ||
    gst == null ||
    finalPrice == null ||
    !Array.isArray(features)
  ) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = ["Required fields are missing or invalid"];
    throw err;
  }

  if (validity == null) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = ["Validity must be provided"];
    throw err;
  }

  for (const feature of features) {
    if (!feature.name) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.errors = ["Each feature must have a name"];
      throw err;
    }
  }

  const newPlan = new FranchiseSubscription({
    name,
    originalPrice: originalPrice ?? null,
    discountPercentage,
    discount: discount ?? null,
    price,
    gstPercentage,
    gst,
    finalPrice,
    validity: validity ?? null,
    features,
    fullFeatures: fullFeatures || [],
    isPopular: isPopular ?? false,
    isActive: isActive ?? true,
  });

  await newPlan.save();

  return {
    id: newPlan._id,
    name: newPlan.name,
    price: newPlan.price,
    finalPrice: newPlan.finalPrice,
    validity: newPlan.validity,
    isPopular: newPlan.isPopular,
    isActive: newPlan.isActive,
    createdAt: newPlan.createdAt,
  };
};

export const getAllActiveFranchisePlansService = async () => {
  return await FranchiseSubscription.find({ isActive: true });
};

export const getFranchisePlanById = async (id) => {
  const plan = await FranchiseSubscription.findById(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, "Invalid plan ID");
  }
  if (!plan) {
    const err = new Error("Not Found");
    err.statusCode = 400;
    err.errors = ["Franchise Subscription plan not found"];
    throw err;
  }
  return plan;
};

export const updateFranchiseSubscription = async (updateData) => {
  const { id } = updateData;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Not Found");
    err.statusCode = 400;
    err.errors = ["Invalid Franchise Subscription Plan ID"];
    throw err;
  }

  if (
    updateData.name === undefined ||
    updateData.price === undefined ||
    updateData.gstPercentage === undefined ||
    updateData.gst === undefined ||
    updateData.finalPrice === undefined ||
    updateData.validity === undefined ||
    !Array.isArray(updateData.features)
  ) {
    const err = new Error("Validation Error");
    err.statusCode = 400;
    err.errors = ["Required fields are missing or invalid"];
    throw err;
  }

  for (const feature of updateData.features) {
    if (!feature.name) {
      const err = new Error("Features Eroor");
      err.statusCode = 400;
      err.errors = ["Each feature must have a name"];
      throw err;
    }
  }

  const updatedPlan = await FranchiseSubscription.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!updatedPlan) {
    const err = new Error("Not Found");
    err.statusCode = 400;
    err.errors = ["Franchise Subscription plan not found"];
    throw err;
  }

  return {
    id: updatedPlan._id,
    name: updatedPlan.name,
    price: updatedPlan.price,
    finalPrice: updatedPlan.finalPrice,
    validity: updatedPlan.validity,
    isPopular: updatedPlan.isPopular,
    isActive: updatedPlan.isActive,
    updatedAt: updatedPlan.updatedAt,
  };
};

export const deleteFranchiseSubscription = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Id Not Found");
    err.statusCode = 400;
    err.errors = ["Id Error"];
    throw err;
  }

  const deletedPlan = await FranchiseSubscription.findByIdAndDelete(id);
  if (!deletedPlan) {
    err.statusCode = 400;
    err.errors = ["Franchise Subscription plan not found"];
    throw err;
  }

  return {
    id: deletedPlan._id,
  };
};

export const activeAndInActiveSubscription = async ({ id, status }) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid ID");
    err.statusCode = 400;
    err.errors = ["Invalid Franchise Subscription plan ID"];
    throw err;
  }

  const plan = await FranchiseSubscription.findById(id);
  if (!plan) {
    const err = new Error("Franchise Subscription plan not found");
    err.statusCode = 400;
    err.errors = ["Id Error"];
    throw err;
  }

  plan.isActive = status;
  await plan.save();

  return {
    id: plan._id,
    isActive: plan.isActive,
    message: `Franchise Subscription plan has been ${
      status ? "activated" : "deactivated"
    }`,
  };
};
