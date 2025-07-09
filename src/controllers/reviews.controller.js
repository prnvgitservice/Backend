import * as reviewService from '../services/reviews.service.js';

export const createReview = async (req, res, next) => {
  try {
 const { serviceId, userId, rating, comment } = req.body;

    if (!serviceId || !userId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const review = await reviewService.createReview({ serviceId, userId, rating, comment });

    // const userId = req.user._id;
    // const review = await reviewService.createReview({ ...req.body, userId });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getServiceReviews = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const reviews = await reviewService.getServiceReviews(technicianId);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const getAverageRating = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const stats = await reviewService.getAverageRating(technicianId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};


export const updateReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    const review = await reviewService.updateReview(reviewId, userId, req.body);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId, userId);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
};

