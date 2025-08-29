import mongoose from "mongoose";
import CaregoryServices from "../models/caregoryServices.js";
import Technician from "../models/authModels/technician.js";
import Category from "../models/category.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const createService = async ({
  categoryId,
  serviceName,
  servicePrice,
  files,
}) => {
  if (!categoryId || !serviceName || !servicePrice) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All fields are required."];
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
    throw err;
  }

  let serviceImg = "";

  if (files?.serviceImg?.[0]) {
    const filePath = files.serviceImg[0].path;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "TechServiceImages",
    });
    fs.unlinkSync(filePath);
    serviceImg = uploadResult.secure_url;
  }

  const newService = new CaregoryServices({
    categoryId,
    serviceName,
    servicePrice,
    serviceImg,
  });

  await newService.save();

  const technicians = await Technician.find({ category: categoryId });

  const updatePromises = technicians.map((technician) =>
    Technician.findByIdAndUpdate(technician._id, {
      $push: {
        categoryServices: {
          categoryServiceId: newService._id,
          status: true,
        },
      },
    })
  );

  await Promise.all(updatePromises);

  return {
    id: newService._id,
    serviceName: newService.serviceName,
    servicePrice: newService.servicePrice,
    serviceImg: newService.serviceImg,
  };
};

export const updateService = async ({
  serviceId,
  serviceName,
  servicePrice,
  files,
}) => {
  if (!serviceId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Service Id Is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const err = new Error("Invalid Service ID format");
    err.statusCode = 400;
    err.errors = ["Provided Setvice ID is not valid."];
    throw err;
  }

  const service = await CaregoryServices.findById(serviceId);
  if (!service) {
    const err = new Error("Service not found");
    err.statusCode = 404;
    throw err;
  }

  if (files.serviceImg?.[0]) {
    const filePath = files.serviceImg[0].path;

    const oldUrl = service.serviceImg;
    if (oldUrl) {
      const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `TechServiceImages/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "TechServiceImages",
    });
    fs.unlinkSync(filePath);

    service.serviceImg = uploadResult.secure_url;
  }

  if (serviceName) service.serviceName = serviceName;
  if (servicePrice) service.servicePrice = servicePrice;

  await service.save();

  return {
    id: service._id,
    serviceName: service.serviceName,
    servicePrice: service.servicePrice,
    serviceImg: service.serviceImg,
  };
};

export const deleteAllServices = async (categoryId) => {
  if (!categoryId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const services = await CaregoryServices.find({ categoryId });

  if (!services || services.length === 0) {
    const err = new Error("No services found for this Category");
    err.statusCode = 404;
    throw err;
  }

  for (const service of services) {
    if (service.serviceImg) {
      const match = service.serviceImg.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `TechServiceImages/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
  }

  await CaregoryServices.deleteMany({ categoryId });

  return {
    message: "All services deleted for the Category.",
    deletedCount: services.length,
  };
};

export const deleteServicesById = async (serviceId) => {
  if (!serviceId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Service ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const err = new Error("Invalid Service ID format");
    err.statusCode = 400;
    err.errors = ["Provided Service ID is not valid."];
    throw err;
  }

  const service = await CaregoryServices.findById(serviceId);
  if (!service) {
    const err = new Error("Service not found");
    err.statusCode = 404;
    throw err;
  }

  if (service.serviceImg) {
    const match = service.serviceImg.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `TechServiceImages/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  await Technician.updateMany(
    { "categoryServices.categoryServiceId": serviceId },
    { $pull: { categoryServices: { categoryServiceId: serviceId } } }
  );

  await CaregoryServices.deleteOne({ _id: serviceId });

  return {
    message: "Service deleted successfully.",
    deletedServiceId: serviceId,
  };
};


export const getServicesByTechId = async ({ categoryId }) => {
  if (!categoryId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category Id field is required."];
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
    throw err;
  }

  const service = await CaregoryServices.find({ categoryId });
  if (!service || service.length === 0) {
    const err = new Error("Service not found For this Category Id");
    err.statusCode = 404;
    throw err;
  }

  return {
    service,
  };
};
