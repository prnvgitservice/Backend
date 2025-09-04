import { getExecutiveAccount } from "../../services/executive/executiveAccount";

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