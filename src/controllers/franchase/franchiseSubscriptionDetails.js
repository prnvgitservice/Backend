import * as FranchiseSubscriptionDetails from "../../services/franchase/franchiseSubscriptionDetails.js";

export const addFranchiseSubscriptionPlanCont = async (req, res, next) => {
  try {
    const result = await FranchiseSubscriptionDetails.addFranchiseSubscriptionPlan(
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Subcription Created Successfully",
      result: result.subscription,
    });
  } catch (err) {
    next(err);
  }
};

export const getFranchiseSubscriptionPlanCot = async (req, res, next) => {
  const { franchiseId } = req.params;
  try {
    const result = await FranchiseSubscriptionDetails.getFranchiseSubscriptionPlan(
      franchiseId
    );
    res.status(201).json({
      success: true,
      message: "Subcription Fetched Successfully",
      result: result.subscription,
    });
  } catch (err) {
    next(err);
  }
};
