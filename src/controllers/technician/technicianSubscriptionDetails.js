import * as TechnicianSubscriptionDetails from '../../services/technician/technicianSubscriptionDetails.js';

export const addTechSubscriptionPlanCont = async (req, res, next) => {
  try {

    const result = await TechnicianSubscriptionDetails.addTechSubscriptionPlan(req.body);
      res.status(201).json({
          success: true,
          message: "Subcription Created Successfully",
         result,
        });

  } catch (err) {
    next(err);
  }
};

// export const getCompanyReviewsComp = async (req, res, next) => {
//   try {
//     const result = await companyReview.getCompanyReviews();
//    res.status(201).json({
//           success: true,
//           message: "Fetched Reviews Successfully",
//          result,
//         });
//   } catch (err) {
//     next(err);
//   }
// };
