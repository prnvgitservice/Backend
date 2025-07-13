import * as GuestBooking from "../services/guestBooking.js";

export const addGuestBookingCont = async (req, res, next) => {
  try {
    const result = await GuestBooking.addGuestBooking(req.body);
      res.status(201).json({
      success: true,
      message: "Guest Booking Created successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllGuestBookingCont = async (req, res, next) => {
  try {
    const result = await GuestBooking.getAllGuestBooking();
     res.status(201).json({
      success: true,
      message: "Guest Booking fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  };
}