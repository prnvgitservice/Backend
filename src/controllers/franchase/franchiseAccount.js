import * as FranchaseAccounts from "../../services/franchase/franchiseAccount.js";

export const getFranchiseAccountCont = async (req, res, next) => {
  const { franchiseId } = req.params;
  try {
    const result = await FranchaseAccounts.getFranchiseAccount(franchiseId);
    res.status(201).json({
      success: true,
      message: "Franchase Accounts fetched successfully.",
      result: result.franchiseAccountsDetails,
    });
  } catch (err) {
    next(err);
  }
};

export const getFranchiseAccountValuesCont = async (req, res, next) => {
  const { franchiseId } = req.params;
  try {
    const result = await FranchaseAccounts.getFranchiseAccountValues(franchiseId);
    res.status(201).json({
      success: true,
      message: "Franchase Accounts fetched successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};
