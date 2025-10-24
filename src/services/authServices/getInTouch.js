import Category from "../../models/category.js";
import mongoose from "mongoose";
import getInTouch from "../../models/authModels/getInTouch.js";

export const addGetintouch = async ({
  name,
  phoneNumber,
  categoryId,
  categoryName,
  message,
}) => {
  if (!name || !phoneNumber || !categoryId || !message) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = [
      "Name, Phone Number, categoryId and message are all required.",
    ];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    err.errors = ["Category ID Not Found"];
    throw err;
  }

  const newGetInTouch = new getInTouch({
    categoryId,
    name,
    phoneNumber,
    message,
    categoryName,
  });

  const savedEnquiry = await newGetInTouch.save();

  return {
    id: savedEnquiry._id,
    name: savedEnquiry.name,
    phoneNumber: savedEnquiry.phoneNumber,
    categoryId: savedEnquiry.categoryId,
    message: savedEnquiry.message,
    categoryName: savedEnquiry.categoryName,
  };
};

export const getInTouchDetails = async ({ offset, limit }) => {
  try {
    const skip = parseInt(offset, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
      const err = new Error("Invalid pagination parameters");
      err.statusCode = 400;
      err.errors = ["Offset and limit must be valid positive integers"];
      throw err;
    }

    const touch = await getInTouch
      .find()
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
    const totalTouch = (await getInTouch.find()).length;

    return {
      totalTouch,
      offset: skip,
      limit: pageSize,
      touchs: touch.map((t)=>{
        return{
        _id: t._id,
        categoryId: t.categoryId,
        name: t.name,
        phoneNumber: t.phoneNumber,
        message: t.message,
        categoryName: t.categoryName,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        __v: t.__v,
        }
      }),
    };
  } catch (err) {
    err.statusCode = 500;
    err.errors = ["Failed to fetch franchise enquiries."];
    throw err;
  }
};

export const updateGetInTouchStatus = async ({ bookingId, status }) => {
  if (!bookingId || !status) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Booking ID and status are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const err = new Error("Invalid Booking ID format");
    err.statusCode = 400;
    err.errors = ["Provided Booking ID is not valid."];
    throw err;
  }

  const allowedStatuses = ["pending", "completed", "declined"];
  const normalizedStatus = status.toLowerCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    const err = new Error("Invalid status value");
    err.statusCode = 400;
    err.errors = [`Status must be one of: ${allowedStatuses.join(", ")}`];
    throw err;
  }

  const booking = await getInTouch.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    err.errors = ["Booking not found for the provided ID"];
    throw err;
  }

  if (booking.status === normalizedStatus) {
    return {
      message: `Booking is already marked as '${status}'`,
      booking,
    };
  }

  booking.status = normalizedStatus;
  await booking.save();

  return {
    message: `Guest booking status updated to '${status}' successfully.`,
    booking,
  };
};
