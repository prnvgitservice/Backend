import * as companyReview from '../services/companyReview.model.js';

export const createReviewComp = async (req, res, next) => {
  try {

    const result = await companyReview.createReview(req.body);
        res.json({
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
   res.json({
          success: true,
          message: "Review Created Successfully",
         result,
        });
  } catch (err) {
    next(err);
  }
};
