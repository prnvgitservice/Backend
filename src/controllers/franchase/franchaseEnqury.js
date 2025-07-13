import * as FranchaseEnquiry from "../../services/franchase/franchaseEnqury.js";

export const addFranchaseEnquiryCont = async (req, res, next) => {
  try {
    const result = await FranchaseEnquiry.addFranchaseEnquiry(req.body);
      res.status(201).json({
      success: true,
      message: "Franchase Enquiry Created successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllFranchaseEnquiriesCont = async (req, res, next) => {
  try {
    const result = await FranchaseEnquiry.getAllFranchaseEnquiries();
     res.status(201).json({
      success: true,
      message: "Franchase Enquiries fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  };
}