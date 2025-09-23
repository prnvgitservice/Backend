import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Services from "../models/technician/services.js";
import CaregoryServices from "../models/caregoryServices.js";
import User from "../models/authModels/user.js";
import Technician from "../models/authModels/technician.js";
import BookingService from "../models/bookingServices.js";
import TechSubscriptionsDetail from "../models/technician/technicianSubscriptionDetails.js";

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
      totalPrice,
    } = bookingData;

    if (
      !serviceId ||
      !userId ||
      !technicianId ||
      !quantity ||
      !bookingDate ||
      !servicePrice ||
      !gst ||
      !totalPrice
    ) {
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

    const service = await CaregoryServices.findById(serviceId);
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
      totalPrice,
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
  const bookedServiceIds = bookings.map((b) => b.serviceId.toString());

  await Cart.updateOne(
    { userId: bookings[0].userId },
    {
      $pull: {
        items: {
          serviceId: { $in: bookedServiceIds },
        },
      },
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
      const service = await CaregoryServices.findById(booking.serviceId);

      return {
        booking,
        user,
        technician: technician || null,
        service: service || null,
      };
    })
  );

  return {
    bookings: detailedBookings,
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
      const service = await CaregoryServices.findById(booking.serviceId);
      // const { otp, ...filteredService } = service || {};
      return {
        booking,
        user: user || null,
        service: service || null,
        technician,
      };
    })
  );

  return {
    bookings: detailedBookings,
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

export const BookingStatusByTechnician = async ({
  technicianId,
  orderId,
  status,
  otp,
}) => {
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
      err.booking = booking; 
    throw err;
  }

  if (booking.status === normalizedStatus) {
    const err = new Error("Unauthorized action");
    err.statusCode = 403;
    err.errors = [`Booking is already ${status}`];
     err.booking = booking; 
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

  let updatedSubInfo = null;

  if (normalizedStatus === "completed") {
    const techSubDetails = await TechSubscriptionsDetail.findOne({
      technicianId,
    });
    if (!techSubDetails || !techSubDetails.subscriptions?.length) {
      const err = new Error("Subscription not found");
      err.statusCode = 404;
      err.errors = ["No subscription found for the technician."];
      throw err;
    }

    const lastSub =
      techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

  //   if (lastSub.endDate && !lastSub.leads) {
  //     return;
  //   }

  //   if (lastSub.leads && !lastSub.endDate) {
  //     const allBookings = await BookingService.find({
  //       technicianId,
  //       createdAt: { $gte: new Date(lastSub.startDate) },
  //     });

  //     const completedOrStartedBookings = allBookings.filter((b) =>
  //       ["completed", "started"].includes(b.status)
  //     );

  //     const currentCount = completedOrStartedBookings.length;

  //     if (currentCount >= lastSub.leads) {
  //       const err = new Error("Lead limit exceeded");
  //       err.statusCode = 403;
  //       err.errors = [
  //         `Lead limit of ${lastSub.leads} exceeded. Cannot complete more bookings.`,
  //       ];
  //       throw err;
  //     }

  //     lastSub.ordersCount = currentCount + 1;
  //     await techSubDetails.save();

  //     updatedSubInfo = lastSub;
  //   }
  // }
  // If subscription ended with no leads, do nothing but still return success response
    if (!(lastSub.endDate && !lastSub.leads)) {
      if (lastSub.leads && !lastSub.endDate) {
        const allBookings = await BookingService.find({
          technicianId,
          createdAt: { $gte: new Date(lastSub.startDate) },
        });

        const completedOrStartedBookings = allBookings.filter((b) =>
          ["completed", "started"].includes(b.status)
        );

        const currentCount = completedOrStartedBookings.length;

        if (currentCount >= lastSub.leads) {
          const err = new Error("Lead limit exceeded");
          err.statusCode = 403;
          err.errors = [
            `Lead limit of ${lastSub.leads} exceeded. Cannot complete more bookings.`,
          ];
          throw err;
        }

        lastSub.ordersCount = currentCount + 1;
        await techSubDetails.save();

        updatedSubInfo = lastSub;
      }
    }
  }

  booking.status = normalizedStatus;
  await booking.save();

  return {
    message: `Booking status successfully updated to ${status}.`,
    booking,
    updatedSubscription: updatedSubInfo,
  };
};

export const getAllBookings = async ({ offset = 0, limit = 10 }) => {
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const totalBookings = await BookingService.countDocuments({});
  const bookings = await BookingService.find({})
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  const detailedBookings = await Promise.all(
    bookings.map(async (booking) => {
      const user = await User.findById(booking.userId);
      const technician = await Technician.findById(booking.technicianId);
      const service = await CaregoryServices.findById(booking.serviceId);

      return {
        id: booking._id,
        user: user
          ? {
              id: user._id,
              username: user.username,
              phoneNumber: user.phoneNumber,
            }
          : null,
        technician: technician
          ? {
              id: technician._id,
              name: technician.username,
              phoneNumber: technician.phoneNumber,
            }
          : null,
        service: service
          ? {
              id: service._id,
              serviceName: service.serviceName,
            }
          : null,
        quantity: booking.quantity,
        bookingDate: booking.bookingDate,
        status: booking.status,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
      };
    })
  );

  return {
    total: totalBookings,
    offset: skip,
    limit: pageSize,
    bookings: detailedBookings,
  };
};

export const getBookServiceByTechnicianIdDashboard = async ({
  technicianId,
}) => {
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
  // if (!bookings || bookings.length === 0) {
  //   const err = new Error("Bookings not found");
  //   err.statusCode = 404;
  //   err.errors = ["Bookings Not Found For This Technician ID"];
  //   throw err;
  // }

  // Calculate stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalCompleted = completedBookings.length;
  const totalEarns = completedBookings.reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0
  );

  // Populate booking details with user + service
  const detailedBookings = await Promise.all(
    bookings.map(async (booking) => {
      const user = await User.findById(booking.userId);
      const service = await CaregoryServices.findById(booking.serviceId);

      return {
        booking,
        user: user || null,
        service: service || null,
        technician,
      };
    })
  );

  return {
    technician,
    totalBookings,
    totalCompleted,
    totalEarns,
    bookings: detailedBookings,
  };
};

export const getMonthlyEarningsByTechnicianId = async ({
  technicianId,
  year
}) => {
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

  const bookings = await BookingService.find({
    technicianId,
    status: "completed",
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`)
    }
  });

  const monthlyEarnings = Array(12).fill(0).map((_, index) => ({
    month: index + 1,
    monthName: new Date(year, index, 1).toLocaleString('default', { month: 'long' }),
    totalEarnings: 0,
    bookingCount: 0
  }));

  bookings.forEach(booking => {
    const month = new Date(booking.createdAt).getMonth();
    monthlyEarnings[month].totalEarnings += booking.totalPrice || 0;
    monthlyEarnings[month].bookingCount += 1;
  });

  const totalEarnings = monthlyEarnings.reduce((sum, month) => sum + month.totalEarnings, 0);
  const totalBookings = monthlyEarnings.reduce((sum, month) => sum + month.bookingCount, 0);
  const averageEarningsPerMonth = totalBookings > 0 ? totalEarnings / 12 : 0;
  const averageBookingsPerMonth = totalBookings > 0 ? totalBookings / 12 : 0;

  return {
    technician,
    year,
    monthlyEarnings,
    totalEarnings,
    totalBookings,
    averageEarningsPerMonth: Math.round(averageEarningsPerMonth * 100) / 100,
    averageBookingsPerMonth: Math.round(averageBookingsPerMonth * 100) / 100
  };
};

export const getTodaysBookingsByTechnicianId = async ({
  technicianId
}) => {
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

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todaysBookings = await BookingService.find({
    technicianId,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ createdAt: -1 });

  if (!todaysBookings || todaysBookings.length === 0) {
    return {
      technician,
      todaysBookings: [],
      totalBookings: 0,
      message: "No bookings found for today"
    };
  }

  const detailedBookings = await Promise.all(
    todaysBookings.map(async (booking) => {
      const user = await User.findById(booking.userId);
      const service = await CaregoryServices.findById(booking.serviceId);

      return {
        booking,
        user: user || null,
        service: service || null,
        technician
      };
    })
  );

  const totalBookings = todaysBookings.length;
  const completedBookings = todaysBookings.filter(b => b.status === "completed");
  const pendingBookings = todaysBookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const cancelledBookings = todaysBookings.filter(b => b.status === "cancelled");

  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0
  );

  return {
    technician,
    todaysBookings: detailedBookings,
    totalBookings,
    completedBookings: completedBookings.length,
    pendingBookings: pendingBookings.length,
    cancelledBookings: cancelledBookings.length,
    totalEarnings
  };
};