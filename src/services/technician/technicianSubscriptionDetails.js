import techSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import bookingServices from "../../models/bookingServices.js";
import technician from "../../models/authModels/technician.js";
import SubscriptionPlan from "../../models/subscription.js";
import mongoose from "mongoose";

function computeEndDateForNewPlan(startDate, plan) {
  const start = new Date(startDate).getTime();
  const hasLeads = plan.leads != null;
  const hasAmountCap = plan.endUpPrice != null;
  const hasValidityDays = plan.validity != null;
  const days = hasValidityDays
    ? plan.validity
    : !hasLeads && !hasAmountCap
    ? 30
    : null;
  return days ? new Date(start + days * 24 * 60 * 60 * 1000) : null;
}

async function calculatePlanUsage(technicianId, startDate) {
  if (!startDate || isNaN(new Date(startDate).getTime())) {
    return { ordersCount: 0, earnAmount: 0 };
  }
  const start = new Date(startDate);
  const match = {
    technicianId: new mongoose.Types.ObjectId(technicianId),
    bookingDate: { $gte: start },
  };

  const ordersCount = await bookingServices.countDocuments(match);
  const earnedAgg = await bookingServices.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const earnAmount = earnedAgg?.[0]?.total || 0;
  return { ordersCount, earnAmount };
}

function isPlanExpiredNow({
  leads,
  endUpPrice,
  endDate,
  ordersCount,
  earnAmount,
}) {
  const now = new Date();
  if (leads != null && ordersCount >= leads) return true;
  if (endUpPrice != null && earnAmount >= endUpPrice) return true;
  if (endDate && now > new Date(endDate)) return true;
  return false;
}

function makeDisplayBlock(entry) {
  const {
    subscriptionName,
    startDate,
    endDate,
    leads = null,
    ordersCount = 0,
    endUpPrice = null,
    earnAmount = 0,
  } = entry || {};

  if (!entry) {
    return {
      subscriptionName: null,
      startDate: null,
      endDate: null,
      leads: null,
      ordersCount: 0,
      endUpPrice: null,
      earnAmount: 0,
      expired: true,
    };
  }

  const expired = isPlanExpiredNow({
    leads,
    endUpPrice,
    endDate,
    ordersCount,
    earnAmount,
  });

  let expiryReason = null;
  if (expired) {
    if (leads != null && ordersCount >= leads) expiryReason = "LEADS_REACHED";
    else if (endUpPrice != null && earnAmount >= endUpPrice)
      expiryReason = "AMOUNT_REACHED";
    else if (endDate && new Date() > new Date(endDate))
      expiryReason = "TIME_EXPIRED";
    else expiryReason = "UNKNOWN";
  }

  return {
    subscriptionName,
    startDate,
    endDate: endDate || null,
    leads,
    ordersCount,
    endUpPrice,
    earnAmount,
    expired,
    expiryReason,
  };
}

async function getLatestSubEntry(technicianId) {
  const doc = await techSubscriptionsDetail.findOne({ technicianId });
  if (
    !doc ||
    !Array.isArray(doc.subscriptions) ||
    doc.subscriptions.length === 0
  )
    return null;
  return doc.subscriptions[doc.subscriptions.length - 1];
}

async function writeBackUsageCounters(
  technicianId,
  { ordersCount, earnAmount }
) {
  const doc = await techSubscriptionsDetail.findOne({ technicianId });
  if (!doc || !doc.subscriptions?.length) return;
  const latestIdx = doc.subscriptions.length - 1;
  if (!doc.subscriptions[latestIdx]) return;
  doc.subscriptions[latestIdx].ordersCount = Number(ordersCount || 0);
  doc.subscriptions[latestIdx].earnAmount = Number(earnAmount || 0);
  await doc.save();
}

export async function ensureTechPlanActiveOrThrow(technicianId) {
  const latest = await getLatestSubEntry(technicianId);
  if (!latest) {
    const err = new Error("No active subscription. Please contact support.");
    err.statusCode = 403;
    throw err;
  }
  if (!latest.startDate || isNaN(new Date(latest.startDate).getTime())) {
    const err = new Error("Subscription start date is missing or invalid.");
    err.statusCode = 500;
    throw err;
  }
  const usage = await calculatePlanUsage(technicianId, latest.startDate);
  await writeBackUsageCounters(technicianId, usage);
  const expired = isPlanExpiredNow({
    leads: latest.leads ?? null,
    endUpPrice: latest.endUpPrice ?? null,
    endDate: latest.endDate ?? null,
    ordersCount: usage.ordersCount,
    earnAmount: usage.earnAmount,
  });
  if (expired) {
    const err = new Error(
      "Your plan has expired. New bookings are blocked. Contact support."
    );
    err.statusCode = 403;
    throw err;
  }
}

export async function addTechSubscriptionPlan({
  technicianId,
  subscriptionId,
}) {
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
  const techDoc = await technician.findById(technicianId);
  if (!techDoc) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID Not Found"];
    throw err;
  }
  const plan = await SubscriptionPlan.findById(subscriptionId);
  if (!plan) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID Not Found"];
    throw err;
  }
  const existing = await techSubscriptionsDetail.findOne({ technicianId });
  if (existing?.subscriptions?.length) {
    const err = new Error(
      "Renewal not allowed. Technician already has a subscription history."
    );
    err.statusCode = 409;
    err.errors = ["Per policy, renewals/new plans are disabled."];
    throw err;
  }
  const now = new Date();
  const entry = {
    subscriptionId: plan._id,
    subscriptionName: plan.name,
    startDate: now,
    endDate: computeEndDateForNewPlan(now, {
      validity: plan.validity ?? null,
      leads: plan.leads ?? null,
      endUpPrice: plan.endUpPrice ?? null,
    }),
    leads: plan.leads ?? null,
    ordersCount: 0,
    endUpPrice: plan.endUpPrice ?? null,
    earnAmount: 0,
  };
  if (existing) {
    existing.subscriptions.push(entry);
    await existing.save();
  } else {
    const doc = new techSubscriptionsDetail({
      technicianId,
      subscriptions: [entry],
    });
    await doc.save();
  }
  const display = makeDisplayBlock(entry);
  return {
    success: true,
    message: "Subscription plan added successfully",
    subscription: entry,
    display,
  };
}

export async function getTechSubscriptionPlan(technicianId) {
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

  const techSubDetails = await techSubscriptionsDetail.findOne({
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
    lastSub
  };
}

export async function updateTechSubscriptionPlan({
  technicianId,
  subscriptionId,
}) {
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
  const techDoc = await technician.findById(technicianId);
  if (!techDoc) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID Not Found"];
    throw err;
  }
  const requestedPlan = await SubscriptionPlan.findById(subscriptionId);
  if (!requestedPlan) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID Not Found"];
    throw err;
  }
  const requestedPrice = requestedPlan.finalPrice || 0;

  const techSubDoc = await techSubscriptionsDetail.findOne({ technicianId });
  if (!techSubDoc || !techSubDoc.subscriptions?.length) {
    const err = new Error("No current subscription found");
    err.statusCode = 404;
    err.errors = ["Technician has no active or previous subscription."];
    throw err;
  }

  const latest = techSubDoc.subscriptions[techSubDoc.subscriptions.length - 1];
  const usage = await calculatePlanUsage(technicianId, latest.startDate);
  await writeBackUsageCounters(technicianId, usage);

  const expired = isPlanExpiredNow({
    leads: latest.leads ?? null,
    endUpPrice: latest.endUpPrice ?? null,
    endDate: latest.endDate ?? null,
    ordersCount: usage.ordersCount,
    earnAmount: usage.earnAmount,
  });

  const currentPlan = await SubscriptionPlan.findById(latest.subscriptionId);
  if (!currentPlan) {
    const err = new Error("Current subscription plan not found");
    err.statusCode = 404;
    err.errors = ["Current subscription plan ID is invalid."];
    throw err;
  }
  const currentPrice = currentPlan.finalPrice || 0;

  if (latest.subscriptionId.toString() === subscriptionId.toString()) {
    const display = makeDisplayBlock({
      ...latest,
      ordersCount: usage.ordersCount,
      earnAmount: usage.earnAmount,
    });
    return {
      success: true,
      message: "Same plan selected. No update performed.",
      subscription: latest,
    };
  }

  let canUpdate = false;
  let updateMessage = "Subscription updated successfully";

  if (expired) {
    if (requestedPrice === 0) {
      const err = new Error("Cannot update to free plan when current plan is expired.");
      err.statusCode = 403;
      err.errors = ["Free plan not allowed on expired subscriptions."];
      throw err;
    }
    canUpdate = true;
  } else {
    if (currentPrice === 0) {
      canUpdate = true;
    } else if (currentPrice < requestedPrice) {
      canUpdate = true;
    } else {
      const err = new Error("Cannot update to a plan with equal or lower price.");
      err.statusCode = 403;
      err.errors = ["Downgrades or same-price updates are not allowed."];
      throw err;
    }
  }

  if (!canUpdate) {
    const err = new Error("Update not allowed based on current plan status.");
    err.statusCode = 403;
    err.errors = ["Update criteria not met."];
    throw err;
  }

  const now = new Date();
  const entry = {
    subscriptionId: requestedPlan._id,
    subscriptionName: requestedPlan.name,
    startDate: now,
    endDate: computeEndDateForNewPlan(now, {
      validity: requestedPlan.validity ?? null,
      leads: requestedPlan.leads ?? null,
      endUpPrice: requestedPlan.endUpPrice ?? null,
    }),
    leads: requestedPlan.leads ?? null,
    ordersCount: 0,
    endUpPrice: requestedPlan.endUpPrice ?? null,
    earnAmount: 0,
  };

  techSubDoc.subscriptions.push(entry);
  await techSubDoc.save();

  const display = makeDisplayBlock(entry);
  return {
    success: true,
    message: updateMessage,
    subscription: entry,
    display,
  };
}

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
