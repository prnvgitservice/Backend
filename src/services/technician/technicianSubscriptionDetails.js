// services/technician/technicianSubscriptionService.js
import mongoose from "mongoose";
import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import SubscriptionPlan from "../../models/subscription.js";
import BookingService from "../../models/bookingServices.js";
import Technician from "../../models/authModels/technician.js";

async function calculateUsage(technicianId, startDate) {
  if (!startDate) return { ordersCount: 0, earnAmount: 0 };

  // startDate from the subscription is already a Date (ISO string stored in DB)
  const start = new Date(startDate);               // ← proper Date object
  // make sure we count bookings that start **on or after** the subscription start
  const match = {
    technicianId: new mongoose.Types.ObjectId(technicianId),
    bookingDate: { $gte: start },                  // ← Date → Date comparison
  };

  const ordersCount = await BookingService.countDocuments(match);

  const earnedAgg = await BookingService.aggregate([
    { $match: { ...match, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  const earnAmount = earnedAgg?.[0]?.total ?? 0;
  return { ordersCount, earnAmount };
}

function isPlanExpired({ leads, ordersCount, endUpPrice, earnAmount, endDate }) {
  const now = new Date();
  if (leads != null && ordersCount >= leads) return true;
  if (endUpPrice != null && earnAmount >= endUpPrice) return true;
  if (endDate && now > new Date(endDate)) return true;
  return false;
}

/**
 * Add subscription to technician by technicianId and subscriptionId
 */
// addTechSubscriptionPlan: accepts either (technicianId, subscriptionId) or ({ technicianId, subscriptionId })
export const addTechSubscriptionPlan = async (...args) => {
  let technicianId;
  let subscriptionId;
  if (args.length === 1 && typeof args[0] === "object") {
    technicianId = args[0].technicianId;
    subscriptionId = args[0].subscriptionId;
  } else {
    [technicianId, subscriptionId] = args;
  }

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

  const plan = await SubscriptionPlan.findById(subscriptionId);
  if (!plan) {
    const err = new Error("Subscription plan not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID Not Found"];
    throw err;
  }

  const now = new Date();
  const endDate = plan.validity
    ? new Date(now.getTime() + plan.validity * 24 * 60 * 60 * 1000)
    : null;

  const newSubscription = {
    subscriptionId: plan._id,
    subscriptionName: plan.name,
    startDate: now,
    endDate,
    leads: plan.leads ?? null,
    ordersCount: 0,
    endUpPrice: plan.endUpPrice ?? null,
    earnAmount: 0,
  };

  const techData = await TechSubscriptionsDetail.findOne({ technicianId });

  if (techData && techData.subscriptions?.length) {
    const lastSub = techData.subscriptions[techData.subscriptions.length - 1];

    const isFreePlan = lastSub.subscriptionName?.toLowerCase() === "free plan";
    const tryingFreePlan = plan.name?.toLowerCase() === "free plan";

    if (isFreePlan && tryingFreePlan) {
      const err = new Error("Free Plan already activated");
      err.statusCode = 409;
      err.errors = ["Cannot subscribe to Free Plan again."];
      throw err;
    }

    const isExpired = lastSub.endDate ? new Date(lastSub.endDate) < now : true;
    const leadsExhausted =
      lastSub.leads != null && lastSub.ordersCount >= lastSub.leads;

    const hasActivePaid = !isFreePlan && !isExpired && !leadsExhausted;

    if (hasActivePaid) {
      const err = new Error("Technician already has an active paid subscription");
      err.statusCode = 409;
      err.errors = ["Paid plan is still valid or leads not yet exhausted."];
      throw err;
    }
  }

  let savedEntry;
  if (!techData) {
    const newDoc = await TechSubscriptionsDetail.create({
      technicianId,
      subscriptions: [newSubscription],
    });
    savedEntry = newDoc.subscriptions[0];
  } else {
    techData.subscriptions.push(newSubscription);
    await techData.save();
    savedEntry = techData.subscriptions[techData.subscriptions.length - 1];
  }

  return {
    success: true,
    message: "Subscription plan added successfully",
    subscription: savedEntry,
  };
};

/**
 * Get subscription details for a technician (auto-updates usage counts and computes expiry)
 */
export const getTechSubscriptionPlan = async (technicianId) => {
  // … validation unchanged …

  const doc = await TechSubscriptionsDetail.findOne({ technicianId }).lean();
  if (!doc || !Array.isArray(doc.subscriptions) || doc.subscriptions.length === 0) {
    return { activePlan: null, history: [] };
  }

  const latestIndex = doc.subscriptions.length - 1;
  const latest = { ...doc.subscriptions[latestIndex] };

  // ── usage now uses the corrected helper ──
  const usage = await calculateUsage(technicianId, latest.startDate);

  // persist counters (unchanged)
  await TechSubscriptionsDetail.updateOne(
    { technicianId, [`subscriptions.${latestIndex}.subscriptionId`]: latest.subscriptionId },
    {
      $set: {
        [`subscriptions.${latestIndex}.ordersCount`]: usage.ordersCount,
        [`subscriptions.${latestIndex}.earnAmount`]: usage.earnAmount,
      },
    }
  );

  const expired = isPlanExpired({
    leads: latest.leads,
    ordersCount: usage.ordersCount,
    endUpPrice: latest.endUpPrice,
    earnAmount: usage.earnAmount,
    endDate: latest.endDate,
  });

  return {
    activePlan: {
      ...latest,
      ordersCount: usage.ordersCount,
      earnAmount: usage.earnAmount,
      expired,
    },
    history: doc.subscriptions,
  };
};

// export const getTechSubscriptionPlan = async (technicianId) => {
//     if (!technicianId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["TechnicianId is required."];
//     throw err;
//   }
//   if (
//     !mongoose.Types.ObjectId.isValid(technicianId)
//   ) {
//     const err = new Error("Invalid Technician format");
//     err.statusCode = 400;
//     err.errors = ["Provided Technician ID is not valid."];
//     throw err;
//   }

//   const doc = await TechSubscriptionsDetail.findOne({ technicianId }).lean();
//   if (!doc || !Array.isArray(doc.subscriptions) || doc.subscriptions.length === 0) {
//     return { activePlan: null, history: [] };
//   }

//   // Work on the latest subscription entry (last array item)

//   const latestIndex = doc.subscriptions.length - 1;
//   const latest = { ...doc.subscriptions[latestIndex] };

//   // calculate live usage from bookings since subscription start
//   const usage = await calculateUsage(technicianId, latest.startDate);

//   // persist the counters back to DB (so other parts can rely on stored values)
//   await TechSubscriptionsDetail.updateOne(
//     { technicianId, [`subscriptions.${latestIndex}.subscriptionId`]: latest.subscriptionId },
//     {
//       $set: {
//         [`subscriptions.${latestIndex}.ordersCount`]: usage.ordersCount,
//         [`subscriptions.${latestIndex}.earnAmount`]: usage.earnAmount,
//       },
//     }
//   );

//   // compute expiry dynamically
//   const expired = isPlanExpired({
//     leads: latest.leads,
//     ordersCount: usage.ordersCount,
//     endUpPrice: latest.endUpPrice,
//     earnAmount: usage.earnAmount,
//     endDate: latest.endDate,
//   });

//   return {
//     activePlan: {
//       ...latest,
//       ordersCount: usage.ordersCount,
//       earnAmount: usage.earnAmount,
//       expired,
//     },
//     history: doc.subscriptions,
//   };
// };


export const updateTechSubscriptionPlan = async (technicianId, subscriptionId) => {
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
  const doc = await TechSubscriptionsDetail.findOne({ technicianId });
  if (!doc) {
    const err = new Error("Technician subscription record not found");
    err.statusCode = 404;
    throw err;
  }

  const idx = doc.subscriptions.findIndex((s) => String(s.subscriptionId) === String(subscriptionId));
  if (idx === -1) {
    const err = new Error("Subscription entry not found for this technician");
    err.statusCode = 404;
    throw err;
  }

  // Only allow certain fields to be updated safely
  const allowed = ["startDate", "endDate", "leads", "endUpPrice", "subscriptionName"];
  for (const k of Object.keys(updates)) {
    if (!allowed.includes(k)) continue;
    doc.subscriptions[idx][k] = updates[k];
  }

  // Recalculate usage and expiry after update
  const usage = await calculateUsage(technicianId, doc.subscriptions[idx].startDate);
  doc.subscriptions[idx].ordersCount = usage.ordersCount;
  doc.subscriptions[idx].earnAmount = usage.earnAmount;

  await doc.save();

  const expired = isPlanExpired({
    leads: doc.subscriptions[idx].leads,
    ordersCount: doc.subscriptions[idx].ordersCount,
    endUpPrice: doc.subscriptions[idx].endUpPrice,
    earnAmount: doc.subscriptions[idx].earnAmount,
    endDate: doc.subscriptions[idx].endDate,
  });

  return { ...doc.subscriptions[idx].toObject ? doc.subscriptions[idx].toObject() : doc.subscriptions[idx], expired };
};


export const ensureTechPlanActiveOrThrow = async (technicianId) => {
   if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["TechnicianId is required."];
    throw err;
  }
  if (
    !mongoose.Types.ObjectId.isValid(technicianId)
  ) {
    const err = new Error("Invalid Technician format");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const doc = await TechSubscriptionsDetail.findOne({ technicianId });
  if (!doc || !doc.subscriptions?.length) {
    const err = new Error("No active subscription. Please contact support.");
    err.statusCode = 403;
    throw err;
  }

  const latest = doc.subscriptions[doc.subscriptions.length - 1];
  if (!latest.startDate) {
    const err = new Error("Subscription start date missing or invalid.");
    err.statusCode = 500;
    throw err;
  }

  const usage = await calculateUsage(technicianId, latest.startDate);

  // write back live counters
  latest.ordersCount = usage.ordersCount;
  latest.earnAmount = usage.earnAmount;
  await doc.save();

  const expired = isPlanExpired({
    leads: latest.leads,
    ordersCount: latest.ordersCount,
    endUpPrice: latest.endUpPrice,
    earnAmount: latest.earnAmount,
    endDate: latest.endDate,
  });

  if (expired) {
    const err = new Error("Your plan has expired. New bookings are blocked.");
    err.statusCode = 403;
    throw err;
  }

  return true;
};

//     techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];
  
//   return {
//     lastSub
//   };
// }

// export async function updateTechSubscriptionPlan({
//   technicianId,
//   subscriptionId,
// }) {
  // if (!technicianId || !subscriptionId) {
  //   const err = new Error("Validation failed");
  //   err.statusCode = 401;
  //   err.errors = ["TechnicianId and SubscriptionId are required."];
  //   throw err;
  // }
  // if (
  //   !mongoose.Types.ObjectId.isValid(technicianId) ||
  //   !mongoose.Types.ObjectId.isValid(subscriptionId)
  // ) {
  //   const err = new Error("Invalid Technician or Subscription ID format");
  //   err.statusCode = 400;
  //   err.errors = ["Provided Technician or Subscription ID is not valid."];
  //   throw err;
  // }
//   const techDoc = await technician.findById(technicianId);
//   if (!techDoc) {
//     const err = new Error("Technician not found");
//     err.statusCode = 404;
//     err.errors = ["Technician ID Not Found"];
//     throw err;
//   }
//   const requestedPlan = await SubscriptionPlan.findById(subscriptionId);
//   if (!requestedPlan) {
//     const err = new Error("Subscription not found");
//     err.statusCode = 404;
//     err.errors = ["Subscription ID Not Found"];
//     throw err;
//   }
//   const requestedPrice = requestedPlan.finalPrice || 0;

//   const techSubDoc = await techSubscriptionsDetail.findOne({ technicianId });
//   if (!techSubDoc || !techSubDoc.subscriptions?.length) {
//     const err = new Error("No current subscription found");
//     err.statusCode = 404;
//     err.errors = ["Technician has no active or previous subscription."];
//     throw err;
//   }

//   const latest = techSubDoc.subscriptions[techSubDoc.subscriptions.length - 1];
//   const usage = await calculatePlanUsage(technicianId, latest.startDate);
//   await writeBackUsageCounters(technicianId, usage);

//   const expired = isPlanExpiredNow({
//     leads: latest.leads ?? null,
//     endUpPrice: latest.endUpPrice ?? null,
//     endDate: latest.endDate ?? null,
//     ordersCount: usage.ordersCount,
//     earnAmount: usage.earnAmount,
//   });

//   const currentPlan = await SubscriptionPlan.findById(latest.subscriptionId);
//   if (!currentPlan) {
//     const err = new Error("Current subscription plan not found");
//     err.statusCode = 404;
//     err.errors = ["Current subscription plan ID is invalid."];
//     throw err;
//   }
//   const currentPrice = currentPlan.finalPrice || 0;

//   if (latest.subscriptionId.toString() === subscriptionId.toString()) {
//     const display = makeDisplayBlock({
//       ...latest,
//       ordersCount: usage.ordersCount,
//       earnAmount: usage.earnAmount,
//     });
//     return {
//       success: true,
//       message: "Same plan selected. No update performed.",
//       subscription: latest,
//     };
//   }

//   let canUpdate = false;
//   let updateMessage = "Subscription updated successfully";

//   if (expired) {
//     if (requestedPrice === 0) {
//       const err = new Error("Cannot update to free plan when current plan is expired.");
//       err.statusCode = 403;
//       err.errors = ["Free plan not allowed on expired subscriptions."];
//       throw err;
//     }
//     canUpdate = true;
//   } else {
//     if (currentPrice === 0) {
//       canUpdate = true;
//     } else if (currentPrice < requestedPrice) {
//       canUpdate = true;
//     } else {
//       const err = new Error("Cannot update to a plan with equal or lower price.");
//       err.statusCode = 403;
//       err.errors = ["Downgrades or same-price updates are not allowed."];
//       throw err;
//     }
//   }

//   if (!canUpdate) {
//     const err = new Error("Update not allowed based on current plan status.");
//     err.statusCode = 403;
//     err.errors = ["Update criteria not met."];
//     throw err;
//   }

//   const now = new Date();
//   const entry = {
//     subscriptionId: requestedPlan._id,
//     subscriptionName: requestedPlan.name,
//     startDate: now,
//     endDate: computeEndDateForNewPlan(now, {
//       validity: requestedPlan.validity ?? null,
//       leads: requestedPlan.leads ?? null,
//       endUpPrice: requestedPlan.endUpPrice ?? null,
//     }),
//     leads: requestedPlan.leads ?? null,
//     ordersCount: 0,
//     endUpPrice: requestedPlan.endUpPrice ?? null,
//     earnAmount: 0,
//   };

//   techSubDoc.subscriptions.push(entry);
//   await techSubDoc.save();

//   const display = makeDisplayBlock(entry);
//   return {
//     success: true,
//     message: updateMessage,
//     subscription: entry,
//     display,
//   };
// }

// import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
// import SubscriptionPlan from "../../models/subscription.js";
// import Technician from "../../models/authModels/technician.js";
// import mongoose from "mongoose";

// export const addTechSubscriptionPlan = async ({
//   technicianId,
//   subscriptionId,
// }) => {
//   if (!technicianId || !subscriptionId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["TechnicianId and SubscriptionId are required."];
//     throw err;
//   }

//   if (
//     !mongoose.Types.ObjectId.isValid(technicianId) ||
//     !mongoose.Types.ObjectId.isValid(subscriptionId)
//   ) {
//     const err = new Error("Invalid Technician or Subscription ID format");
//     err.statusCode = 400;
//     err.errors = ["Provided Technician or Subscription ID is not valid."];
//     throw err;
//   }

//   const technician = await Technician.findById(technicianId);
//   if (!technician) {
//     const err = new Error("Technician not found");
//     err.statusCode = 404;
//     err.errors = ["Technician ID Not Found"];
//     throw err;
//   }

//   const subscription = await SubscriptionPlan.findById(subscriptionId);
//   if (!subscription) {
//     const err = new Error("Subscription not found");
//     err.statusCode = 404;
//     err.errors = ["Subscription ID Not Found"];
//     throw err;
//   }

//   const now = new Date();
//   const newSubscription = {
//     subscriptionId: subscription._id,
//     subscriptionName: subscription.name,
//     startDate: now,
//     endDate: null,
//     leads: null,
//     ordersCount: 0,
//     endUpPrice: subscription.endUpPrice,
//     earnAmount: 0,
//   };

//   if (subscription.validity) {
//     newSubscription.endDate = new Date(
//       now.getTime() + subscription.validity * 24 * 60 * 60 * 1000
//     );
//   }

//   if (subscription.leads != null) {
//     newSubscription.leads = subscription.leads;
//   }

//   let techSubscriptionDetail = await TechSubscriptionsDetail.findOne({
//     technicianId,
//   });

//   if (techSubscriptionDetail) {
//     const lastSub =
//       techSubscriptionDetail.subscriptions?.[
//         techSubscriptionDetail.subscriptions.length - 1
//       ];

//     let isExpired = false;
//     if (lastSub?.endDate && new Date(lastSub.endDate) < now) {
//       isExpired = true;
//     }

//     let isLeadsExhausted = false;
//     if (lastSub?.leads != null && lastSub.ordersCount >= lastSub.leads) {
//       isLeadsExhausted = true;
//     }

//     const isFreePlan = lastSub?.subscriptionName?.toLowerCase() === "free plan";
//     const isTryingToBuyFreePlan =
//       subscription.name?.toLowerCase() === "free plan";

//     if (isFreePlan && isTryingToBuyFreePlan) {
//       const err = new Error("Free Plan already activated");
//       err.statusCode = 409;
//       err.errors = ["Cannot subscribe to Free Plan again."];
//       throw err;
//     }

//     if (!isFreePlan && !isExpired && !isLeadsExhausted) {
//       const err = new Error(
//         "Technician already has an active paid subscription"
//       );
//       err.statusCode = 409;
//       err.errors = ["Paid plan is still valid or leads not yet exhausted."];
//       throw err;
//     }

//     techSubscriptionDetail.subscriptions.push(newSubscription);
//     await techSubscriptionDetail.save();
//   } else {
//     const newTechSubDetail = new TechSubscriptionsDetail({
//       technicianId,
//       subscriptions: [newSubscription],
//     });
//     await newTechSubDetail.save();
//   }

//   return {
//     success: true,
//     message: "Subscription plan added successfully",
//     subscription: newSubscription,
//   };
// };

// export const getTechSubscriptionPlan = async (technicianId) => {
//   if (!technicianId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["Technician Id is required."];
//     throw err;
//   }

//   if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//     const err = new Error("Invalid Technician ID format");
//     err.statusCode = 400;
//     err.errors = ["Provided Technician ID is not valid."];
//     throw err;
//   }

//   const technician = await Technician.findById(technicianId);
//   if (!technician) {
//     const err = new Error("Technician not found");
//     err.statusCode = 404;
//     throw err;
//   }

  // const techSubDetails = await TechSubscriptionsDetail.findOne({
  //   technicianId,
  // });
  // if (!techSubDetails || !techSubDetails.subscriptions?.length) {
  //   const err = new Error("Subscription not found");
  //   err.statusCode = 404;
  //   err.errors = ["No subscription found for the technician."];
  //   throw err;
  // }

  // const lastSub =
  //   techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

//   return {
//     success: true,
//     message: "Latest subscription plan fetched successfully",
//     subscription: lastSub,
//   };
// };
