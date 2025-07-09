import express from 'express';
import { createReviewComp, getCompanyReviewsComp } from '../controllers/companyReview.model.js';


const router = express.Router();

router.post('/createReview', createReviewComp);
router.get('/getCompanyReviews', getCompanyReviewsComp);


export default router;
