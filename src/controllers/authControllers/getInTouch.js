import * as getInTouch from "../../services/authServices/getInTouch.js";


export const addGetintouchForm = async (req, res, next) => {
  try {
    const result = await getInTouch.addGetintouch(req.body);
      res.status(201).json({
      success: true,
      message: "Guest Booking Created successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const getInTouchForm = async (req, res, next) => {
  try {
    const result = await getInTouch.getInTouchDetails();
     res.status(201).json({
      success: true,
      message: "Guest Booking fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  };
}