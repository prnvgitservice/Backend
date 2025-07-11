import * as BookingService from "../services/bookingServices.js";

export const createBookServiceCont = async (req, res, next) => {
  try {
    const result = await BookingService.createBookService(req.body);
      res.status(201).json({
      success: true,
      message: "Booking Service Created successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookServiceByUserIdCont = async (req, res, next) => {
  try {
    const {userId} = req.params;

    const result = await BookingService.getBookServiceByUserId({userId});
     res.status(201).json({
      success: true,
      message: "Bookings fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookServiceByTechnicianIdCont = async (req, res, next) => {
  try {
    const {technicianId} = req.params;

    const result = await BookingService.getBookServiceByTechnicianId({technicianId});
     res.status(201).json({
      success: true,
      message: "Bookings fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const BookingCancleByUserCont = async (req, res, next) => {
  try {
    const result = await BookingService.BookingCancleByUser(req.body);
   res.status(201).json({
      success: true,
      message: "Bookings Cancelled Successfully.",
     result: result.booking,
    });
  } catch (err) {
    next(err);
  }
};

export const BookingStatusByTechnicianCont = async (req, res, next) => {
  try {
    const result = await BookingService.BookingStatusByTechnician(req.body);
   res.status(201).json({
      success: true,
      message: result.message,
     result: result.booking,
    });
  } catch (err) {
    next(err);
  }
};
