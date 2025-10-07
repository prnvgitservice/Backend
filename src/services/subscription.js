import mongoose from "mongoose";
import SubscriptionPlan from "../models/subscription.js";
import createError from "http-errors";

// export const addSubscription = async ({
//   name,
//   originalPrice,
//   discount,
//   discountPercentage,
//   price,
//   gstPercentage,
//   gst,
//   finalPrice,
//   validity,
//   leads,
//   endUpPrice,
//   commisionAmount,
//   executiveCommissionAmount,
//   features,
//   fullFeatures,
//   isPopular,
//   isActive,
// }) => {
//   if (
//     !name ||
//     !commisionAmount ||
//     !executiveCommissionAmount ||
//     originalPrice == null ||
//     price == null ||
//     gstPercentage == null ||
//     gst == null ||
//     finalPrice == null ||
//     !Array.isArray(features)
//   ) {
//     const err = new Error("Validation failed");
//     err.statusCode = 400;
//     err.errors = ["Required fields are missing or invalid"];
//     throw err;
//   }

//   if (validity == null && leads == null) {
//     const err = new Error("Validation failed");
//     err.statusCode = 400;
//     err.errors = ["Either 'validity' or 'leads' must be provided"];
//     throw err;
//   }

//   for (const feature of features) {
//     if (!feature.name) {
//       const err = new Error("Validation failed");
//       err.statusCode = 400;
//       err.errors = ["Each feature must have a name"];
//       throw err;
//     }
//   }

//   const newPlan = new SubscriptionPlan({
//     name,
//     originalPrice: originalPrice ?? null,
//     discountPercentage,
//     discount: discount ?? null,
//     price,
//     gstPercentage,
//     gst,
//     finalPrice,
//     endUpPrice,
//     commisionAmount,
//     executiveCommissionAmount,
//     validity: validity ?? null,
//     leads: leads ?? null,
//     features,
//     fullFeatures: fullFeatures || [],
//     isPopular: isPopular ?? false,
//     isActive: isActive ?? true,
//   });

//   await newPlan.save();

//   return {
//     id: newPlan._id,
//     name: newPlan.name,
//     price: newPlan.price,
//     finalPrice: newPlan.finalPrice,
//     validity: newPlan.validity,
//     leads: newPlan.leads,
//     endUpPrice: newPlan.endUpPrice,
//     commisionAmount: newPlan.commisionAmount,
//     executiveCommissionAmount: newPlan.executiveCommissionAmount,
//     isPopular: newPlan.isPopular,
//     isActive: newPlan.isActive,
//     createdAt: newPlan.createdAt,
//   };
// };

export const addSubscription = async ({
  name,
  originalPrice,
  discount,
  discountPercentage,
  price,
  gstPercentage,
  gst,
  finalPrice,
  validity,
  leads,
  endUpPrice,
  commisionAmount,
  executiveCommissionAmount,
  referalCommisionAmount,        // ✅ Add this
  refExecutiveCommisionAmount,   // ✅ Add this
  features,
  fullFeatures,
  isPopular,
  isActive,
}) => {
  if (
    !name ||
    !commisionAmount ||
    !executiveCommissionAmount ||
    referalCommisionAmount == null ||       // ✅ Add this check
    refExecutiveCommisionAmount == null ||  // ✅ Add this check
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

  if (validity == null && leads == null) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = ["Either 'validity' or 'leads' must be provided"];
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

  const newPlan = new SubscriptionPlan({
    name,
    originalPrice: originalPrice ?? null,
    discountPercentage,
    discount: discount ?? null,
    price,
    gstPercentage,
    gst,
    finalPrice,
    endUpPrice,
    commisionAmount,
    executiveCommissionAmount,
    referalCommisionAmount,        // ✅ Pass this
    refExecutiveCommisionAmount,   // ✅ Pass this
    validity: validity ?? null,
    leads: leads ?? null,
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
    leads: newPlan.leads,
    endUpPrice: newPlan.endUpPrice,
    commisionAmount: newPlan.commisionAmount,
    executiveCommissionAmount: newPlan.executiveCommissionAmount,
    referalCommisionAmount: newPlan.referalCommisionAmount,         // ✅ include in response if needed
    refExecutiveCommisionAmount: newPlan.refExecutiveCommisionAmount, // ✅ include in response if needed
    isPopular: newPlan.isPopular,
    isActive: newPlan.isActive,
    createdAt: newPlan.createdAt,
  };
};

export const getAllActivePlansService = async () => {
  return await SubscriptionPlan.find({ isActive: true });
};

export const getPlanById = async (id) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) {
    const err = new Error("Not Found");
    err.statusCode = 400;
    err.errors = ["Subscription plan not found"];
    throw err;
  }
  return plan;
};

export const updateSubscription = async (updateData) => {
  const { id } = updateData;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Not Found");
    err.statusCode = 400;
    err.errors = ["Invalid Subscription Plan ID"];
    throw err;
  }

  if (
    updateData.name === undefined ||
    updateData.price === undefined ||
    updateData.gstPercentage === undefined ||
    updateData.gst === undefined ||
    updateData.finalPrice === undefined ||
    updateData.validity === undefined ||
    updateData.leads === undefined ||
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

  const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
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
    err.errors = ["Subscription plan not found"];
    throw err;
  }

  return {
    id: updatedPlan._id,
    name: updatedPlan.name,
    price: updatedPlan.price,
    finalPrice: updatedPlan.finalPrice,
    validity: updatedPlan.validity,
    leads: updatedPlan.leads,
    isPopular: updatedPlan.isPopular,
    isActive: updatedPlan.isActive,
    updatedAt: updatedPlan.updatedAt,
  };
};

export const deleteSubscription = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Id Not Found");
    err.statusCode = 400;
    err.errors = ["Id Error"];
    throw err;
  }

  const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
  if (!deletedPlan) {
    err.statusCode = 400;
    err.errors = ["Subscription plan not found"];
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
    err.errors = ["Invalid subscription plan ID"];
    throw err;
  }

  const plan = await SubscriptionPlan.findById(id);
  if (!plan) {
    throw createError(404, "Subscription plan not found");
  }

  plan.isActive = status;
  await plan.save();

  return {
    id: plan._id,
    isActive: plan.isActive,
    message: `Subscription plan has been ${
      status ? "activated" : "deactivated"
    }`,
  };
};
