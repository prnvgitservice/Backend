import Review from '../models/reviews.model.js';

export const createReview = async ({ serviceId, userId, rating, comment }) => {
  const existing = await Review.findOne({ serviceId, userId });
  if (existing) {
    throw new Error('You have already reviewed this service.');
  }
  return await Review.create({ serviceId, userId, rating, comment });
};

export const getServiceReviews = async (technicianId) => {
  return await Review.find({ technicianId }).populate('userId', 'username').sort({ createdAt: -1 });
};

export const getAverageRating = async (technicianId) => {
  const result = await Review.aggregate([
    { $match: { technicianId: new mongoose.Types.ObjectId(technicianId) } },
    {
      $group: {
        _id: '$technicianId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

export const updateReview = async (reviewId, userId, updates) => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    { $set: updates },
    { new: true }
  );
  if (!review) throw new Error('Review not found or unauthorized');
  return review;
};

export const deleteReview = async (reviewId, userId) => {
  const result = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!result) throw new Error('Review not found or unauthorized');
  return result;
};