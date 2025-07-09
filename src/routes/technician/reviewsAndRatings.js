import { Router } from 'express';
import { addReviewByUser, getTechReviewsByIdCont } from '../../controllers/technician/reviewsAndRatings.js';

const router = Router();


router.post('/addReviewByUser', addReviewByUser);
router.get('/getTechReviewsById/:technicianId', getTechReviewsByIdCont);

export default router;
