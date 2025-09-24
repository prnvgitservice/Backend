import mongoose, { Types } from "mongoose";
import Technician from "../../models/authModels/technician.js";
import TechnicianImages from "../../models/technician/techImgs.js";
import Services from "../../models/technician/services.js";
import RatingsAndReviews from "../../models/technician/reviewsAndRatings.js";
import Category from "../../models/category.js";
import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import CategoryServices from "../../models/caregoryServices.js";
import user from "../../models/authModels/user.js";

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

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Not Found");
    err.statusCode = 404;
    err.errors = ["Technician Not Found."];
    throw err;
  }

  const categoryServiceIds = technician.categoryServices.map(
    (cs) => cs.categoryServiceId
  );

  const categoryServices = await CategoryServices.find({
    _id: { $in: categoryServiceIds },
  }).lean();

  const populatedCategoryServices = technician.categoryServices.map((cs) => {
    const serviceDetails = categoryServices.find(
      (svc) => svc._id.toString() === cs.categoryServiceId.toString()
    );
    return {
      ...cs.toObject(),
      details: serviceDetails || null,
    };
  });

  const services = await Services.find({ technicianId });
  const technicianImages = await TechnicianImages.findOne({ technicianId });
  const ratings = await RatingsAndReviews.find({ technicianId });

  const userIds = ratings.map((rating) => rating.userId);
  const users = await user.find(
    { _id: { $in: userIds } },
    "username profileImage"
  ).lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));
  const populatedRatings = ratings.map((rating) => {
    const user = userMap.get(rating.userId.toString());
    return {
      _id: rating._id,
      technicianId:rating.technicianId ,
      userId: rating.userId ,
      serviceId:rating.serviceId,
      review: rating.review,
      rating: rating.rating,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      __v: rating.__v,
      username: user ? user.username : null,
      profileImage: user ? user.profileImage || "" : String,
    };
  });

  return {
    technician: {
      ...technician.toObject(),
      categoryServices: populatedCategoryServices,
    },
    services,
    technicianImages,
    ratings: populatedRatings,
  };
};

export const getAllTechniciansByCateId = async ({
  categoryId,
  offset = 0,
  limit = 10,
}) => {
  // Validate pagination parameters
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

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

  // Get all technicians for the category first
  const technicians = await Technician.find({ category: categoryId });

  const validTechnicians = [];
  const allTechniciansWithDetails = [];

  // First, collect all valid technicians with their details
  for (const technician of technicians) {
    const techSubDetails = await TechSubscriptionsDetail.findOne({
      technicianId: technician._id,
    });

    let isExpired = true;

    if (
      techSubDetails &&
      Array.isArray(techSubDetails.subscriptions) &&
      techSubDetails.subscriptions.length > 0
    ) {
      const lastSub =
        techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

      if (lastSub.endDate !== null && lastSub.leads === null) {
        isExpired = new Date(lastSub.endDate) < new Date();
      } else if (lastSub.endDate === null && lastSub.leads !== null) {
        const currentOrders = lastSub.ordersCount || 0;
        isExpired = currentOrders >= lastSub.leads;
      } else {
        isExpired = true;
      }
    }

    if (!isExpired) {
      const services = await Services.find({ technicianId: technician._id });
      const technicianImages = await TechnicianImages.findOne({
        technicianId: technician._id,
      });
      const ratings = await RatingsAndReviews.find({
        technicianId: technician._id,
      });

      allTechniciansWithDetails.push({
        technician,
        services,
        technicianImages,
        techSubDetails,
        ratings,
      });
    }
  }

  // Apply pagination to the filtered results
  const totalValidTechnicians = allTechniciansWithDetails.length;
  const paginatedTechnicians = allTechniciansWithDetails.slice(
    skip,
    skip + pageSize
  );

  return {
    total: totalValidTechnicians,
    offset: skip,
    limit: pageSize,
    technicians: paginatedTechnicians,
  };
};

export const getAllTechByAdd = async ({
  pincode,
  areaName,
  subAreaName,
  categoryId,
  city,
}) => {
  if (!categoryId || !city) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category ID and City fields are required."];
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

  // const technicians = await Technician.find({
  //   category: categoryId,
  //   pincode: pincode,
  //   areaName: areaName,
  //   subAreaName: subAreaName,
  //   city: city,
  // });

  const query = { category: categoryId, city };

  if (pincode) query.pincode = String(pincode);
  if (areaName) query.areaName = areaName;
  if (subAreaName) query.subAreaName = subAreaName;

  const technicians = await Technician.find(query);

  const validTechnicians = [];

  for (const technician of technicians) {
    const techSubDetails = await TechSubscriptionsDetail.findOne({
      technicianId: technician._id,
    });

    let isExpired = true;

    if (
      techSubDetails &&
      Array.isArray(techSubDetails.subscriptions) &&
      techSubDetails.subscriptions.length > 0
    ) {
      const lastSub =
        techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

      isExpired =
        new Date(lastSub.endDate) < new Date() ||
        (lastSub.leads != null &&
          lastSub.ordersCount != null &&
          lastSub.leads === lastSub.ordersCount);
    }

    if (!isExpired) {
      const services = await Services.find({ technicianId: technician._id });
      const technicianImages = await TechnicianImages.findOne({
        technicianId: technician._id,
      });
      const ratings = await RatingsAndReviews.find({
        technicianId: technician._id,
      });

      validTechnicians.push({
        technician,
        services,
        technicianImages,
        ratings,
      });
    }
  }

  return validTechnicians;
};

export const getCategoryServicesByTechId = async (technicianId) => {
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

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Not Found");
    err.statusCode = 404;
    err.errors = ["Technician Not Found."];
    throw err;
  }

  const categoryServiceIds = technician.categoryServices.map(
    (cs) => cs.categoryServiceId
  );

  const categoryServices = await CategoryServices.find({
    _id: { $in: categoryServiceIds },
  }).lean();

  return technician.categoryServices.map((cs) => {
    const serviceDetails = categoryServices.find(
      (svc) => svc._id.toString() === cs.categoryServiceId.toString()
    );
    return {
      ...cs.toObject(),
      details: serviceDetails || null,
    };
  });
};
