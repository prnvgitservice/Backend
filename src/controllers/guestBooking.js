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
  }
};

export const updateGuestBookingStatusCont = async (req, res, next) => {
  const { bookingId, status } = req.params;
  try {
    const result = await GuestBooking.updateGuestBookingStatus({
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
