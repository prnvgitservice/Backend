import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import SubscriptionPlan from "../../models/subscription.js";
import Technician from "../../models/authModels/technician.js";
import Referrals from "../../models/authModels/referral.js";
import ReferralsAccount from "../../models/referrals/referralsAccount.js";
import ExecutiveAccount from "../../models/executive/executiveAccount.js";
import mongoose from "mongoose";
import moment from "moment";

export const addReferralsAccount = async ({
  referralsId,
  technicianId,
  subscriptionId,
}) => {
  const errors = [];

  if (!referralsId) errors.push("Referrals Id is required.");
  if (!technicianId) errors.push("TechnicianId must be provided.");
  if (technicianId && !subscriptionId)
    errors.push("SubscriptionId is required when TechnicianId is provided.");

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  // ID validation
  const idErrors = [];
  if (!mongoose.Types.ObjectId.isValid(referralsId))
    idErrors.push("Invalid Referrals Id format.");
  if (technicianId && !mongoose.Types.ObjectId.isValid(technicianId))
    idErrors.push("Invalid TechnicianId format.");
  if (subscriptionId && !mongoose.Types.ObjectId.isValid(subscriptionId))
    idErrors.push("Invalid SubscriptionId format.");

  if (idErrors.length > 0) {
    const err = new Error("Invalid ID format");
    err.statusCode = 400;
    err.errors = idErrors;
    throw err;
  }

  // Fetch referrals
  const referrals = await Referrals.findById(referralsId);
  if (!referrals) {
    const err = new Error("Referrals not found");
    err.statusCode = 404;
    err.errors = ["Referrals ID not found."];
    throw err;
  }

  const executiveId = referrals?.executiveId;
  let planId = null;
  let amount = 0;
  let executiveAmount = 0;

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

    // last planId
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

    amount = subscription?.referalCommisionAmount ?? 0;
    executiveAmount = subscription?.refExecutiveCommisionAmount ?? 0;
  }

  const createdAccounts = [];

  // Referrals Account
  if (amount && amount !== 0) {
    const existingReferral = await ReferralsAccount.findOne({
      technicianId,
      subscriptionId,
      planId,
    });
    if (!existingReferral) {
      const newReferralAccount = new ReferralsAccount({
        technicianId,
        subscriptionId,
        planId,
        amount,
      });
      await newReferralAccount.save();
      createdAccounts.push({ type: "referral", account: newReferralAccount });
    }
  }

  // Executive Account
  if (executiveAmount && executiveAmount !== 0 && executiveId) {
    const existingExecutive = await ExecutiveAccount.findOne({
      executiveId,
      subscriptionId,
      planId,
    });
    if (!existingExecutive) {
      const newExecutiveAccount = new ExecutiveAccount({
        technicianId,
        subscriptionId,
        executiveId,
        planId,
        amount: executiveAmount,
      });
      await newExecutiveAccount.save();
      createdAccounts.push({ type: "executive", account: newExecutiveAccount });
    }
  }

  return {
    success: true,
    message: createdAccounts.length
      ? "Accounts created successfully"
      : "No Commission accounts created for this Subscription",
    accounts: createdAccounts,
  };
};

export const getReferralsAccount = async (referralsId) => {
  if (!referralsId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Referrals Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(referralsId)) {
    const err = new Error("Invalid Referrals ID format");
    err.statusCode = 400;
    err.errors = ["Provided Referrals ID is not valid."];
    throw err;
  }

  const referrals = await Referrals.findById(referralsId);
  if (!referrals) {
    const err = new Error("Referrals not found");
    err.statusCode = 404;
    throw err;
  }

  const referralsAccountsDetails = await ReferralsAccount.find({ referralsId });
  if (!referralsAccountsDetails || !referralsAccountsDetails.length) {
    const err = new Error("Referrals Accounts not found");
    err.statusCode = 404;
    err.errors = ["No Referrals Accounts found for the Referrals."];
    throw err;
  }

  const enhancedAccounts = await Promise.all(
    referralsAccountsDetails.map(async (account) => {
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
    referralsAccountsDetails: enhancedAccounts,
  };
};

export const getReferralsAccountValues = async (referralsId) => {
  if (!referralsId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Referrals Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(referralsId)) {
    const err = new Error("Invalid Referrals ID format");
    err.statusCode = 400;
    err.errors = ["Provided Referrals ID is not valid."];
    throw err;
  }

  const referrals = await ReferralsAccounteferrals.findById(referralsId);
  if (!referrals) {
    const err = new Error("Referrals not found");
    err.statusCode = 404;
    throw err;
  }

  const referralsAccountsDetails = await ReferralsAccount.find({ referralsId });
  if (!referralsAccountsDetails || !referralsAccountsDetails.length) {
    const err = new Error("referrals Accounts not found");
    err.statusCode = 404;
    err.errors = ["No Referrals Accounts found for the Referrals."];
    throw err;
  }

  const totalEarnings = referralsAccountsDetails.reduce(
    (sum, acc) => sum + (acc.amount || 0),
    0
  );

  const currentMonth = moment().month();
  const currentYear = moment().year();
  const totalThisMonthEarnings = referralsAccountsDetails.reduce((sum, acc) => {
    const date = moment(acc.createdAt);
    if (date.month() === currentMonth && date.year() === currentYear) {
      return sum + (acc.amount || 0);
    }
    return sum;
  }, 0);

  const monthlyEarnings = Array(12).fill(0);
  referralsAccountsDetails.forEach((acc) => {
    const date = moment(acc.createdAt);
    if (date.year() === currentYear) {
      monthlyEarnings[date.month()] += acc.amount || 0;
    }
  });

  const technicianIds = new Set(
    referralsAccountsDetails.map((acc) => acc.technicianId?.toString())
  );
  const totalNoOfTechnicians = technicianIds.size;

  const totalNoOfSubscriptions = referralsAccountsDetails.reduce(
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
