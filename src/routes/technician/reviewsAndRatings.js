import { Router } from 'express';
import { addReviewByUser } from '../../controllers/technician/reviewsAndRatings.js';

const router = Router();


router.post('/addReviewByUser', addReviewByUser);

export default router;
