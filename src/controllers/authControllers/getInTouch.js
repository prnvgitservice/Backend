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
    const { offset, limit } = req.query;
    const result = await getInTouch.getInTouchDetails({offset , limit});
     res.status(201).json({
      success: true,
      message: "Guest Booking fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  };
}

export const updateGetInTouchStatusCont = async (req, res, next) => {
  const { bookingId, status } = req.params;
  try {
    const result = await getInTouch.updateGetInTouchStatus({
      bookingId,
      status,
    });
    res.status(201).json({
      success: true,
      message: result.message,
      result: result.booking,
    });
  } catch (err) {
    next(err);
  }
};