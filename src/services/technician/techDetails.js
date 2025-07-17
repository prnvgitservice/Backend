import mongoose from 'mongoose';
import Technician from '../../models/authModels/technician.js';
import TechnicianImages from '../../models/technician/techImgs.js';
import Services from '../../models/technician/services.js';
import RatingsAndReviews from '../../models/technician/reviewsAndRatings.js';
import Category from '../../models/category.model.js';

export const getTechAllDetails = async (technicianId) => {
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId );
  if(!technician){
      const err = new Error("Not Fond");
    err.statusCode = 401;
    err.errors = ["Technician Not Found."];
    throw err;
  }

  const services = await Services.find({ technicianId });
  const technicianImages = await TechnicianImages.findOne({ technicianId });
  const ratings = await RatingsAndReviews.findOne({ technicianId });
  

  return {
    technician,
    services,
    technicianImages,
    ratings
  };
};

export const getAllTechniciansByCateId = async (categoryId) => {
  if (!categoryId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error("Category Not Found");
    err.statusCode = 404;
    err.errors = ["Category Not Found."];
    throw err;
  }

  const technicians = await Technician.find({ category: categoryId });

  const technicianData = await Promise.all(
    technicians.map(async (technician) => {
      const services = await Services.find({ technicianId: technician._id });
      const technicianImages = await TechnicianImages.findOne({ technicianId: technician._id });
      const ratings = await RatingsAndReviews.findOne({ technicianId: technician._id });

      return {
        technician,
        services,
        technicianImages,
        ratings
      };
    })
  );

  return technicianData;
};

export const getAllTechByAdd = async ({ pincode, areaName, categoryId, city }) => {
  console.log("aadddasd",  pincode, areaName, categoryId, city)
  if (!categoryId || !pincode || !areaName || !city) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category ID, Pincode, City and Area fields are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error("Category Not Found");
    err.statusCode = 404;
    err.errors = ["Category Not Found."];
    throw err;
  }

  const technicians = await Technician.find({
    category: categoryId,
    pincode: pincode,
    areaName: areaName,
    city: city
  });

  const technicianData = await Promise.all(
    technicians.map(async (technician) => {
      const services = await Services.find({ technicianId: technician._id });
      const technicianImages = await TechnicianImages.findOne({ technicianId: technician._id });
      const ratings = await RatingsAndReviews.findOne({ technicianId: technician._id });

      return {
        technician,
        services,
        technicianImages,
        ratings
      };
    })
  );

  return technicianData;
};

