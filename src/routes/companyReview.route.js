import express from 'express';
import * as reviewController from '../controllers/reviews.controller.js';
import authMiddleware from '../middleware/userMiddleware.js'; 

const router = express.Router();

router.post('/add', authMiddleware, reviewController.createReview);
router.get('/getall/:technicianId', reviewController.getServiceReviews);
router.get('/avg/:technicianId/stats', reviewController.getAverageRating);

router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

export default router;
