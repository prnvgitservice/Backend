import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import FranchiseAccount from "../../models/franchase/franchiseAccount.js";
import SubscriptionPlan from "../../models/subscription.js";
import Technician from "../../models/authModels/technician.js";
import Franchise from "../../models/authModels/franchise.js";
import mongoose from "mongoose";
import moment from "moment";

export const addFranchiseAccount = async ({
  franchiseId,
  technicianId,
  subscriptionId,
}) => {
  if (!franchiseId || !technicianId || !subscriptionId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = [
      "FranchiseId, TechnicianId, and SubscriptionId are required.",
    ];
    throw err;
  }

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

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID not found."];
    throw err;
  }

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
  let planId = null;
  if (techSubscriptionDetail?.subscriptions?.length > 0) {
    const lastSub =
      techSubscriptionDetail.subscriptions[
        techSubscriptionDetail.subscriptions.length - 1
      ];
    planId = lastSub?._id?.toString();
  }

  const amount = subscription?.commisionAmount;

  if (amount != 0 || amount != null) {
    const newAccount = new FranchiseAccount({
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
  } else {
    return {
      success: true,
      message: "No Commision found for this Subscription",
    };
  }
};

// export const addFranchiseAccount = async ({
//   franchiseId,
//   technicianId,
//   subscriptionId,
// }) => {
//   if (!franchiseId || !technicianId || !subscriptionId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = [
//       "FranchiseId, TechnicianId, and SubscriptionId are required.",
//     ];
//     throw err;
//   }

//   if (
//     !mongoose.Types.ObjectId.isValid(franchiseId) ||
//     !mongoose.Types.ObjectId.isValid(technicianId) ||
//     !mongoose.Types.ObjectId.isValid(subscriptionId)
//   ) {
//     const err = new Error("Invalid ID format");
//     err.statusCode = 400;
//     err.errors = ["FranchiseId, TechnicianId, or SubscriptionId is not valid."];
//     throw err;
//   }

//   const franchise = await Franchise.findById(franchiseId);
//   if (!franchise) {
//     const err = new Error("Franchise not found");
//     err.statusCode = 404;
//     err.errors = ["Franchise ID not found."];
//     throw err;
//   }

//   const technician = await Technician.findById(technicianId);
//   if (!technician) {
//     const err = new Error("Technician not found");
//     err.statusCode = 404;
//     err.errors = ["Technician ID not found."];
//     throw err;
//   }

//   const subscription = await SubscriptionPlan.findById(subscriptionId);
//   if (!subscription) {
//     const err = new Error("Subscription not found");
//     err.statusCode = 404;
//     err.errors = ["Subscription ID not found."];
//     throw err;
//   }

//   const techSubscriptionDetail = await TechSubscriptionsDetail.findOne({
//     technicianId,
//   });
//   let planId = null;
//   if (techSubscriptionDetail?.subscriptions?.length > 0) {
//     const lastSub =
//       techSubscriptionDetail.subscriptions[
//         techSubscriptionDetail.subscriptions.length - 1
//       ];
//     planId = lastSub?._id?.toString();
//   }

//   let amount = null;
//   switch (subscription.name) {
//     case "Economy Plan":
//       amount = 300;
//       break;
//     case "Gold Plan":
//       amount = 300;
//       break;
//     case "Platinum Plan":
//       amount = 1000;
//       break;
//   }
//   const newAccount = new FranchiseAccount({
//     franchiseId,
//     technicianId,
//     subscriptionId,
//     planId,
//     amount,
//   });

//   await newAccount.save();

//   return {
//     success: true,
//     message: "Account created successfully",
//     newAccountDetails: newAccount,
//   };
// };

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

  const franchiseAccountsDetails = await FranchiseAccount.find({ franchiseId });
  if (!franchiseAccountsDetails || !franchiseAccountsDetails.length) {
    const err = new Error("Franchise Accounts not found");
    err.statusCode = 404;
    err.errors = ["No Franchise Accounts found for the Franchise."];
    throw err;
  }

  const enhancedAccounts = await Promise.all(
    franchiseAccountsDetails.map(async (account) => {
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
    franchiseAccountsDetails: enhancedAccounts,
  };
};

export const getFranchiseAccountValues = async (franchiseId) => {
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

  const franchiseAccountsDetails = await FranchiseAccount.find({ franchiseId });
  if (!franchiseAccountsDetails || !franchiseAccountsDetails.length) {
    const err = new Error("Franchise Accounts not found");
    err.statusCode = 404;
    err.errors = ["No Franchise Accounts found for the Franchise."];
    throw err;
  }

  const totalEarnings = franchiseAccountsDetails.reduce(
    (sum, acc) => sum + (acc.amount || 0),
    0
  );

  const currentMonth = moment().month();
  const currentYear = moment().year();
  const totalThisMonthEarnings = franchiseAccountsDetails.reduce((sum, acc) => {
    const date = moment(acc.createdAt);
    if (date.month() === currentMonth && date.year() === currentYear) {
      return sum + (acc.amount || 0);
    }
    return sum;
  }, 0);

  const monthlyEarnings = Array(12).fill(0);
  franchiseAccountsDetails.forEach((acc) => {
    const date = moment(acc.createdAt);
    if (date.year() === currentYear) {
      monthlyEarnings[date.month()] += acc.amount || 0;
    }
  });

  const technicianIds = new Set(
    franchiseAccountsDetails.map((acc) => acc.technicianId?.toString())
  );
  const totalNoOfTechnicians = technicianIds.size;

  const totalNoOfSubscriptions = franchiseAccountsDetails.reduce(
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
