import * as companyReview from '../services/companyReview.service.js';

export const createReviewComp = async (req, res, next) => {
  try {

    const result = await companyReview.createReview(req.body);
      res.status(201).json({
          success: true,
          message: "Review Created Successfully",
         result,
        });

  } catch (err) {
    next(err);
  }
};

export const getCompanyReviewsComp = async (req, res, next) => {
  try {
    const result = await companyReview.getCompanyReviews();
   res.status(201).json({
          success: true,
          message: "Fetched Reviews Successfully",
         result,
        });
  } catch (err) {
    next(err);
  }
};
