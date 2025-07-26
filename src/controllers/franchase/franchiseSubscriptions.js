import * as FranchiseSubscription from "../../services/franchase/franchiseSubscriptions.js";

export const addFranchiseSubscriptionCont = async (req, res, next) => {
  try {
    const result = await FranchiseSubscription.addFranchiseSubscription(
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Franchise Subscription Added successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllActiveFranchisePlansServiceCont = async (req, res, next) => {
  try {
    const plans =
      await FranchiseSubscription.getAllActiveFranchisePlansService();
    res
      .status(200)
      .json({
        success: true,
        data: plans,
        message: "Franchise Subscription Plans Fetched Successfully",
      });
  } catch (error) {
    console.error("Error fetching plans:", error);
    next(err);
  }
};

export const getFranchisePlanByIdCont = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await FranchiseSubscription.getFranchisePlanById(id);
    res
      .status(200)
      .json({
        success: true,
        message: "Franchise Subscription Plan Fetched Successfully",
        result,
      });
  } catch (err) {
    next(err);
  }
};

export const updateFranchiseSubscriptionCont = async (req, res, next) => {
  try {
    const result = await FranchiseSubscription.updateFranchiseSubscription(
      req.body
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Franchise Subscription Plan Fetched Successfully",
        result,
      });
  } catch (err) {
    next(err);
  }
};

export const deleteFranchiseSubscriptionCont = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await FranchiseSubscription.deleteFranchiseSubscription(id);
    res
      .status(200)
      .json({
        success: true,
        message: "Franchise Subscription Plan Fetched Successfully",
        result,
      });
  } catch (err) {
    next(err);
  }
};
export const activeAndInActiveFranchiseSubscriptionCont = async (req, res, next) => {
  try {
    const result = await FranchiseSubscription.activeAndInActiveSubscription(
      req.body
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Franchise Subscription Plan Fetched Successfully",
        result,
      });
  } catch (err) {
    next(err);
  }
};
