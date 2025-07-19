import mongoose from "mongoose";
import Cart from '../models/cart.model.js';
import Services from '../models/technician/services.js';
import User from "../models/authModels/user.js";
import Technician from "../models/authModels/technician.js";
import BookingService from "../models/bookingServices.js";


export const createBookService = async (bookings) => {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = ["At least one booking is required."];
    throw err;
  }

  const createdBookings = [];

  for (const bookingData of bookings) {
    const {
      userId,
      serviceId,
      technicianId,
      quantity,
      bookingDate,
      servicePrice,
      gst,
      totalPrice
    } = bookingData;

    if (!serviceId || !userId || !technicianId || !quantity || !bookingDate || !servicePrice || !gst || !totalPrice) {
      const err = new Error("Validation failed");
      err.statusCode = 401;
      err.errors = ["All fields are required for each booking."];
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      const err = new Error("Invalid Service ID format");
      err.statusCode = 400;
      err.errors = ["Provided Service ID is not valid."];
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid User ID format");
      err.statusCode = 400;
      err.errors = ["Provided User ID is not valid."];
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      const err = new Error("Invalid Technician ID format");
      err.statusCode = 400;
      err.errors = ["Provided Technician ID is not valid."];
      throw err;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);

    if (booking < today) {
      const err = new Error("Date Error");
      err.statusCode = 400;
      err.errors = ["Booking date can't be in the past"];
      throw err;
    }

    const service = await Services.findById(serviceId);
    if (!service) {
      const err = new Error("Service not found");
      err.statusCode = 404;
      err.errors = ["Service ID Not Found"];
      throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      err.errors = ["User ID Not Found"];
      throw err;
    }
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      const err = new Error("Technician not found");
      err.statusCode = 404;
      err.errors = ["Technician ID Not Found"];
      throw err;
    }

    const bookingService = new BookingService({
      userId,
      serviceId,
      technicianId,
      quantity,
      bookingDate,
      servicePrice,
      gst,
      totalPrice
    });

    await bookingService.save();

    createdBookings.push({
      id: bookingService._id,
      userId: bookingService.userId,
      serviceId: bookingService.serviceId,
      technicianId: bookingService.technicianId,
      quantity: bookingService.quantity,
      bookingDate: bookingService.bookingDate,
      totalPrice: bookingService.totalPrice,
    });
  }
const bookedServiceIds = bookings.map(b => b.serviceId.toString());

await Cart.updateOne(
  { userId: bookings[0].userId },
  {
    $pull: {
      items: {
        serviceId: { $in: bookedServiceIds }
      }
    }
  }
);

  return createdBookings;
};



export const getBookServiceByUserId = async ({ userId }) => {
  if (!userId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["User Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid User ID format");
    err.statusCode = 400;
    err.errors = ["Provided User ID is not valid."];
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    err.errors = ["User ID Not Found"];
    throw err;
  }

  const bookings = await BookingService.find({ userId });
  if (!bookings || bookings.length === 0) {
    const err = new Error("Bookings not found");
    err.statusCode = 404;
    err.errors = ["Bookings Not Found For This User Id"];
    throw err;
  }

  const detailedBookings = await Promise.all(
    bookings.map(async (booking) => {
      const technician = await Technician.findById(booking.technicianId);
      const service = await Services.findById(booking.serviceId);

      return {
        booking,
        user,
        technician: technician || null,
        service: service || null
      };
    })
  );

  return {
    bookings: detailedBookings
  };
};


export const getBookServiceByTechnicianId = async ({ technicianId }) => {
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID Not Found"];
    throw err;
  }

  const bookings = await BookingService.find({ technicianId });
  if (!bookings || bookings.length === 0) {
    const err = new Error("Bookings not found");
    err.statusCode = 404;
    err.errors = ["Bookings Not Found For This Technician ID"];
    throw err;
  }

  const detailedBookings = await Promise.all(
    bookings.map(async (booking) => {
      const user = await User.findById(booking.userId);
      const service = await Services.findById(booking.serviceId);
      // const { otp, ...filteredService } = service || {};
return {
  booking,
  user: user || null,
  service: service || null,
  technician
};

      
    })
  );

  return {
    bookings: detailedBookings
  };
};


export const BookingCancleByUser = async ({ userId, orderId }) => {
  if (!userId || !orderId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["User Id and Order Id are required."];
    throw err;
  }

  const booking = await BookingService.findById(orderId);

  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    err.errors = ["Booking not found for this order ID"];
    throw err;
  }

  if (booking.userId.toString() !== userId.toString()) {
    const err = new Error("Unauthorized cancellation");
    err.statusCode = 403;
    err.errors = ["This booking does not belong to the user"];
    throw err;
  }

  if (booking.status === "cancelled") {
    return {
      booking,
    };
  }

  booking.status = "cancelled";
  await booking.save();

  return {
    booking,
  };
};

export const BookingStatusByTechnician = async ({ technicianId, orderId, status, otp }) => {
  if (!technicianId || !orderId || !status) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician ID, Order ID, and Status are required."];
    throw err;
  }

  const allowedStatuses = ["declined", "accepted", "completed", "started"];
  const normalizedStatus = status.toLowerCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    const err = new Error("Invalid status value");
    err.statusCode = 400;
    err.errors = [`Status must be one of: ${allowedStatuses.join(", ")}`];
    throw err;
  }

  const booking = await BookingService.findById(orderId);

  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    err.errors = ["Booking not found for this order ID"];
    throw err;
  }

  if (booking.technicianId.toString() !== technicianId.toString()) {
    const err = new Error("Unauthorized action");
    err.statusCode = 403;
    err.errors = ["This booking is not assigned to the technician"];
    throw err;
  }

  if (booking.status === "cancelled") {
    const err = new Error("Unauthorized action");
    err.statusCode = 403;
    err.errors = ["Booking has already been cancelled."];
    throw err;
  }

  if (booking.status === "completed") {
    const err = new Error("Unauthorized action");
    err.statusCode = 403;
    err.errors = ["Booking has already been completed."];
    throw err;
  }

  if (booking.status === normalizedStatus) {
    const err = new Error("Unauthorized action");
    err.statusCode = 403;
    err.errors = [`Booking is already ${status}`];
    throw err;
  }

  if (normalizedStatus === "started") {
    if (!otp) {
      const err = new Error("OTP required");
      err.statusCode = 400;
      err.errors = ["OTP is required to start the booking."];
      throw err;
    }
    if (booking.otp !== otp) {
      const err = new Error("Invalid OTP");
      err.statusCode = 401;
      err.errors = ["Provided OTP does not match."];
      throw err;
    }
  }

  booking.status = normalizedStatus;
  await booking.save();

  return {
    message: `Booking status successfully updated to ${status}.`,
    booking,
  };
};


