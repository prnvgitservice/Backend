import CompanyReview from '../models/companyReview.model.js';
import User from "../models/authModels/user.js";
import Technician from "../models/authModels/technician.js";

// export const createReview = async ({ userId, technicianId, role, rating, comment }) => {

//   if (!role || rating == null || !comment) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["Role, rating, and comment are required."];
//     throw err;
//   }

//   let reviewerField;
//   let reviewerId;

//   if (role === "user") {
//     reviewerField = "userId";
//     reviewerId = userId;
//   } else if (role === "technician") {
//     reviewerField = "technicianId";
//     reviewerId = technicianId;
//   } else {
//     const err = new Error("Invalid role");
//     err.statusCode = 400;
//     err.errors = ["Role must be either 'user' or 'technician'."];
//     throw err;
//   }

//   const existing = await CompanyReview.findOne({ [reviewerField]: reviewerId });

//   if (existing) {
//     const err = new Error("Duplicate Error");
//     err.statusCode = 400;
//     err.errors = ["You have already submitted a review."];
//     throw err;
//   }

//   return await CompanyReview.create({
//     userId,
//     technicianId,
//     role,
//     rating,
//     comment,
//   });
// };

export const createReview = async ({ role, userId, technicianId, rating, comment }) => {
  if (!["user", "technician"].includes(role)) {
    throw createError("Invalid role", 400, ["Role must be either 'user' or 'technician'."]);
  }

  if (rating == null || !comment || comment.trim() === "") {
    throw createError("Validation failed", 422, ["Rating and comment are required."]);
  }

  const isUser = role === "user";
  const reviewerId = isUser ? userId : technicianId;
  const reviewerField = isUser ? "userId" : "technicianId";

  if (!reviewerId) {
    throw createError("Missing ID", 400, [`${reviewerField} is required for role '${role}'.`]);
  }

  const existing = await CompanyReview.findOne({ [reviewerField]: reviewerId });
  if (existing) {
    throw createError("Duplicate review", 409, ["You have already submitted a review."]);
  }

  const review = new CompanyReview({
    role,
    rating,
    comment,
    [reviewerField]: reviewerId,
  });

  await review.save();
  return review;
};

function createError(message, statusCode, errors = []) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.errors = errors;
  return err;
}



export const getCompanyReviews = async () => {
  const reviews = await CompanyReview.find()
    .sort({ rating: -1, createdAt: -1 })
    .limit(15);

  if (!reviews || reviews.length === 0) {
    const err = new Error("No Reviews Found");
    err.statusCode = 400;
    err.errors = ["No reviews found."];
    throw err;
  }

  // Enrich reviews with user/technician details
  const enrichedReviews = await Promise.all(
    reviews.map(async (review) => {
      let reviewerDetails = null;

      if (review.userId) {
        reviewerDetails = await User.findById(review.userId)
      } else if (review.technicianId) {
        reviewerDetails = await Technician.findById(review.technicianId)
      }

      return {
        ...review.toObject(),
        reviewer: reviewerDetails, 
      };
    })
  );

  return enrichedReviews;
};


// export const getCompanyReviews = async () => {
//   const reviews = await CompanyReview.find({ rating: { $in: [4, 5] } });

//   if (!reviews || reviews.length === 0) {
//     const err = new Error("No Reviews Found");
//     err.statusCode = 400;
//     err.errors = ["No reviews with rating 4 or 5 found."];
//     throw err;
//   }

//   return reviews;
// };

// export const getAverageRating = async (technicianId) => {
//   const result = await Review.aggregate([
//     { $match: { technicianId: new mongoose.Types.ObjectId(technicianId) } },
//     {
//       $group: {
//         _id: '$technicianId',
//         averageRating: { $avg: '$rating' },
//         totalReviews: { $sum: 1 }
//       }
//     }
//   ]);
//   return result[0] || { averageRating: 0, totalReviews: 0 };
// };

// export const updateReview = async (reviewId, userId, updates) => {
//   const review = await Review.findOneAndUpdate(
//     { _id: reviewId, userId },
//     { $set: updates },
//     { new: true }
//   );
//   if (!review) throw new Error('Review not found or unauthorized');
//   return review;
// };

// export const deleteReview = async (reviewId, userId) => {
//   const result = await Review.findOneAndDelete({ _id: reviewId, userId });
//   if (!result) throw new Error('Review not found or unauthorized');
//   return result;
// };