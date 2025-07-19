import mongoose from 'mongoose';
import Technician from '../../models/authModels/technician.js';
import TechnicianImages from '../../models/technician/techImgs.js';
import Services from '../../models/technician/services.js';
import RatingsAndReviews from '../../models/technician/reviewsAndRatings.js';
import Category from '../../models/category.model.js';
import TechSubscriptionsDetail from '../../models/technician/technicianSubscriptionDetails.js';

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

   const validTechnicians = [];

  for (const technician of technicians) {
    const techSubDetails = await TechSubscriptionsDetail.findOne({ technicianId: technician._id });

    let isExpired = true;

    if (techSubDetails && Array.isArray(techSubDetails.subscriptions) && techSubDetails.subscriptions.length > 0) {
      const lastSub = techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

      const expired =
        new Date(lastSub.endDate) < new Date() ||
        (lastSub.leads != null && lastSub.ordersCount != null && lastSub.leads === lastSub.ordersCount);

      isExpired = expired;
    }

    if (!isExpired) {
      const services = await Services.find({ technicianId: technician._id });
      const technicianImages = await TechnicianImages.findOne({ technicianId: technician._id });
      const ratings = await RatingsAndReviews.findOne({ technicianId: technician._id });

      validTechnicians.push({
        technician,
        services,
        technicianImages,
        ratings
      });
    }
  }

  return validTechnicians;
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


 const validTechnicians = [];

  for (const technician of technicians) {
    const techSubDetails = await TechSubscriptionsDetail.findOne({ technicianId: technician._id });

    let isExpired = true;

    if (
      techSubDetails &&
      Array.isArray(techSubDetails.subscriptions) &&
      techSubDetails.subscriptions.length > 0
    ) {
      const lastSub = techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

      isExpired =
        new Date(lastSub.endDate) < new Date() ||
        (lastSub.leads != null &&
          lastSub.ordersCount != null &&
          lastSub.leads === lastSub.ordersCount);
    }

    if (!isExpired) {
      const services = await Services.find({ technicianId: technician._id });
      const technicianImages = await TechnicianImages.findOne({ technicianId: technician._id });
      const ratings = await RatingsAndReviews.findOne({ technicianId: technician._id });

      validTechnicians.push({
        technician,
        services,
        technicianImages,
        ratings
      });
    }
  }

  return validTechnicians;
};