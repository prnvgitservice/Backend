import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import SubscriptionPlan from "../../models/subscription.js";
import Technician from "../../models/authModels/technician.js";
import Executive from "../../models/authModels/executive.js";
import ExecutiveAccount from "../../models/executive/executiveAccount.js";
import mongoose from "mongoose";
import moment from "moment";

export const addExecutiveAccount = async ({
  executiveId,
  technicianId,
  subscriptionId,
}) => {

  console.log("===>",executiveId,
  technicianId,
  subscriptionId)
  const errors = [];

  if (!executiveId) {
    errors.push("ExecutiveId is required.");
  }

  if (!technicianId) {
    errors.push("TechnicianId  must be provided.");
  }

  if (technicianId && !subscriptionId) {
    errors.push("SubscriptionId is required when TechnicianId is provided.");
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const idErrors = [];
  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    idErrors.push("Invalid ExecutiveId format.");
  }
  if (technicianId && !mongoose.Types.ObjectId.isValid(technicianId)) {
    idErrors.push("Invalid TechnicianId format.");
  }
  if (subscriptionId && !mongoose.Types.ObjectId.isValid(subscriptionId)) {
    idErrors.push("Invalid SubscriptionId format.");
  }

  if (idErrors.length > 0) {
    const err = new Error("Invalid ID format");
    err.statusCode = 400;
    err.errors = idErrors;
    throw err;
  }

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    err.errors = ["Executive ID not found."];
    throw err;
  }

  let planId = null;
  let amount = null;

  if (technicianId) {
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      const err = new Error("Technician not found");
      err.statusCode = 404;
      err.errors = ["Technician ID not found."];
      throw err;
    }

    const subscription = await SubscriptionPlan.findById(subscriptionId);
    if (!subscription) {
      const err = new Error("Subscription not found");
      err.statusCode = 404;
      err.errors = ["Subscription ID not found."];
      throw err;
    }

    const techSubscriptionDetail = await TechSubscriptionsDetail.findOne({
      technicianId,
    });
    if (techSubscriptionDetail?.subscriptions?.length > 0) {
      const lastSub =
        techSubscriptionDetail.subscriptions[
          techSubscriptionDetail.subscriptions.length - 1
        ];
      planId = lastSub?._id?.toString();
    }

    amount = subscription?.executiveCommissionAmount;
  }

  if (amount != 0 || amount != null) {
    const newAccount = new ExecutiveAccount({
      executiveId,
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
  } else {
    return {
      success: true,
      message: "No Commition for this Subscription",
    };
  }
};

export const getExecutiveAccount = async (executiveId) => {
  if (!executiveId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Executive Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    const err = new Error("Invalid Executive ID format");
    err.statusCode = 400;
    err.errors = ["Provided Executive ID is not valid."];
    throw err;
  }

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    throw err;
  }

  const executiveAccountsDetails = await ExecutiveAccount.find({ executiveId });
  if (!executiveAccountsDetails || !executiveAccountsDetails.length) {
    const err = new Error("Executive Accounts not found");
    err.statusCode = 404;
    err.errors = ["No Executive Accounts found for the Executive."];
    throw err;
  }

  const enhancedAccounts = await Promise.all(
    executiveAccountsDetails.map(async (account) => {
      const technician = await Technician.findById(account.technicianId).select(
        "username"
      );
      const subscription = await SubscriptionPlan.findById(
        account.subscriptionId
      ).select("name");

      return {
        ...account._doc,
        technicianName: technician?.username || "N/A",
        subscriptionName: subscription?.name || "N/A",
      };
    })
  );

  return {
    executiveAccountsDetails: enhancedAccounts,
  };
};

export const getExecutiveAccountValues = async (executiveId) => {
  if (!executiveId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Executive Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    const err = new Error("Invalid Executive ID format");
    err.statusCode = 400;
    err.errors = ["Provided Executive ID is not valid."];
    throw err;
  }

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    throw err;
  }

  const executiveAccountsDetails = await ExecutiveAccount.find({ executiveId });
  if (!executiveAccountsDetails || !executiveAccountsDetails.length) {
    const err = new Error("executive Accounts not found");
    err.statusCode = 404;
    err.errors = ["No Executive Accounts found for the Executive."];
    throw err;
  }

  const totalEarnings = executiveAccountsDetails.reduce(
    (sum, acc) => sum + (acc.amount || 0),
    0
  );

  const currentMonth = moment().month();
  const currentYear = moment().year();
  const totalThisMonthEarnings = executiveAccountsDetails.reduce((sum, acc) => {
    const date = moment(acc.createdAt);
    if (date.month() === currentMonth && date.year() === currentYear) {
      return sum + (acc.amount || 0);
    }
    return sum;
  }, 0);

  const monthlyEarnings = Array(12).fill(0);
  executiveAccountsDetails.forEach((acc) => {
    const date = moment(acc.createdAt);
    if (date.year() === currentYear) {
      monthlyEarnings[date.month()] += acc.amount || 0;
    }
  });

  const technicianIds = new Set(
    executiveAccountsDetails.map((acc) => acc.technicianId?.toString())
  );
  const totalNoOfTechnicians = technicianIds.size;

  const totalNoOfSubscriptions = executiveAccountsDetails.reduce(
    (count, acc) => {
      return acc.subscriptionId ? count + 1 : count;
    },
    0
  );

  return {
    totalEarnings,
    totalThisMonthEarnings,
    earningsByMonth: monthlyEarnings,
    totalNoOfTechnicians,
    totalNoOfSubscriptions,
  };
};
