import { getExecutiveAccount, getExecutiveAccountValues } from "../../services/executive/executiveAccount.js";

export const getExecutiveAccountController = async (req, res, next) => {
  try {
    const { executiveId } = req.params;

    const data = await getExecutiveAccount(executiveId);

    res.status(200).json({
      success: true,
      message: "Executive accounts fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


export const getExecutiveAccountValuesCont = async (req, res, next) => {
  const { executiveId } = req.params;
  try {
    const result = await getExecutiveAccountValues(executiveId);
    res.status(201).json({
      success: true,
      message: "Executive Accounts fetched successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};