import Category from '../../models/category.js';
import mongoose from "mongoose";
import getInTouch from '../../models/authModels/getInTouch.js';

export const addGetintouch = async ({ name, phoneNumber, categoryId }) => {
  if (!name || !phoneNumber || !categoryId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Name, Phone Number, and categoryId are all required."];
    throw err;
  }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        const err = new Error("Invalid Category ID format");
        err.statusCode = 400;
        err.errors = ["Provided Category ID is not valid."];
        throw err;
      }
    
      const category = await Category.findById(categoryId);
      if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        err.errors = ["Category ID Not Found"];
        throw err;
      }

  const newGetInTouch = new getInTouch({
    categoryId,
    name,
    phoneNumber,
  });

  const savedEnquiry = await newGetInTouch.save();

  return {
    id: savedEnquiry._id,
    name: savedEnquiry.name,
    phoneNumber: savedEnquiry.phoneNumber,
    categoryId: savedEnquiry.categoryId,
  };
};


export const getInTouchDetails = async () => {
  try {
    const touch = await getInTouch.find().sort({ createdAt: -1 });
    return touch;
  } catch (err) {
    err.statusCode = 500;
    err.errors = ["Failed to fetch franchise enquiries."];
    throw err;
  }
};