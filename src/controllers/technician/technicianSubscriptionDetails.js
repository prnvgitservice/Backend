import * as TechnicianSubscriptionDetails from '../../services/technician/technicianSubscriptionDetails.js';

export const addTechSubscriptionPlanCont = async (req, res, next) => {
  try {

    const result = await TechnicianSubscriptionDetails.addTechSubscriptionPlan(req.body);
      res.status(201).json({
          success: true,
          message: "Subcription Created Successfully",
         result: result.subscription,
        });

  } catch (err) {
    next(err);
  }
};

export const getTechSubscriptionPlanComp = async (req, res, next) => {
  const {technicianId} = req.params;
  try {
    const result = await TechnicianSubscriptionDetails.getTechSubscriptionPlan(technicianId);
   res.status(201).json({
          success: true,
          message: "Subcription Fetched Successfully",
         result: result.subscription,
        });
  } catch (err) {
    next(err);
  }
};
