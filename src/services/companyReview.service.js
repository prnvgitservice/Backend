import CompanyReview from '../models/companyReview.model.js';

export const createReview = async ({ userId, technicianId, role, rating, comment }) => {

  if (!role || rating == null || !comment) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Role, rating, and comment are required."];
    throw err;
  }

  let reviewerField;
  let reviewerId;

  if (role === "user") {
    reviewerField = "userId";
    reviewerId = userId;
  } else if (role === "technician") {
    reviewerField = "technicianId";
    reviewerId = technicianId;
  } else {
    const err = new Error("Invalid role");
    err.statusCode = 400;
    err.errors = ["Role must be either 'user' or 'technician'."];
    throw err;
  }

  const existing = await CompanyReview.findOne({ [reviewerField]: reviewerId });

  if (existing) {
    const err = new Error("Duplicate Error");
    err.statusCode = 400;
    err.errors = ["You have already submitted a review."];
    throw err;
  }

  return await CompanyReview.create({
    userId,
    technicianId,
    role,
    rating,
    comment,
  });
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
  return reviews;
};


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