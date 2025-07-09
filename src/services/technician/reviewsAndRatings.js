import mongoose from 'mongoose';
import Services from '../../models/technician/services.js';
import Technician from '../../models/authModels/technician.js';
import Review from '../../models/technician/reviewsAndRatings.js';
import User from "../../models/authModels/user.js";

export const userAddReview = async ({
  technicianId,
  serviceId,
  userId,
   review,
  rating
}) => {
  const errors = []; 
  if (!technicianId || !serviceId || !review || !rating ||!userId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All fields are required."];
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
    throw err;
  }
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  const service = await Services.findById(serviceId);
  if (!service) {
    const err = new Error("Service not found");
    err.statusCode = 404;
    throw err;
  }

  const existing = await Review.findOne({ serviceId, userId });
   if (existing) {
     throw new Error('You have already reviewed this service.');
   }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }


  const newReview = new Review({
    technicianId,
  serviceId,
  userId,
   review,
  rating
  });

  await newReview.save();

  return {
 id: newReview._id,
    technicianId: newReview.technicianId,
    serviceId: newReview.serviceId,
    userId: newReview.userId,
    review: newReview.review,
    rating: newReview.rating,
  };
};


export const getTechReviewsById = async ({technicianId}) => {
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId );
  if(!technician){
      const err = new Error("Not Fond");
    err.statusCode = 401;
    err.errors = ["Technician Not Found."];
    throw err;
  }

  const ratings = await Review.findOne({ technicianId });

  return {
    technician,
    ratings
  };
};