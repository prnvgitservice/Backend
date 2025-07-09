import * as review from "../../services/technician/reviewsAndRatings.js";

export const addReviewByUser = async (req, res, next) => {
  try {
    const result = await review.userAddReview(req.body);
     console.log("result", result)
    res.status(201).json({
      success: true,
      message: "User Added Review successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};