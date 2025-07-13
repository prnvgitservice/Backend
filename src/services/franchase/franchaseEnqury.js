import FranchaseEnquiry from "../../models/franchase/franchaseEnqury.js";

export const addFranchaseEnquiry = async ({ name, phoneNumber, message }) => {
  if (!name || !phoneNumber || !message) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Name, Phone Number, and Message are all required."];
    throw err;
  }

   const phoneExists = await FranchaseEnquiry.findOne({ phoneNumber });
    if (phoneExists) {
        const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number already exists."];
    throw err;
    }

  const newEnquiry = new FranchaseEnquiry({
    name,
    phoneNumber,
    message,
  });

  const savedEnquiry = await newEnquiry.save();

  return {
    id: savedEnquiry._id,
    name: savedEnquiry.name,
    phoneNumber: savedEnquiry.phoneNumber,
    message: savedEnquiry.message,
  };
};


export const getAllFranchaseEnquiries = async () => {
  try {
    const enquiries = await FranchaseEnquiry.find().sort({ createdAt: -1 });
    return enquiries;
  } catch (err) {
    err.statusCode = 500;
    err.errors = ["Failed to fetch franchise enquiries."];
    throw err;
  }
};