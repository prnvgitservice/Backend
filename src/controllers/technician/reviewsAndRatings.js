import * as review from "../../services/technician/reviewsAndRatings.js";

export const addReviewByUser = async (req, res, next) => {
  try {
    const result = await review.userAddReview(req.body);
    res.status(201).json({
      success: true,
      message: "User Added Review successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};

export const getTechReviewsByIdCont = async (req, res, next) => {
  const {technicianId} = req.params;
  try {
    const result = await review.getTechReviewsById({technicianId});
    res.status(201).json({
      success: true,
      message: "User Added Review successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};