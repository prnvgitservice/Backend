import mongoose from 'mongoose';
import Services from '../../models/technician/services.js';
import Technician from '../../models/authModels/technician.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import services from '../../models/technician/services.js';

export const createService = async ({
  technicianId,
  serviceName,
  servicePrice,
  files,
}) => {
  console.log("files", files);

  if (!technicianId || !serviceName || !servicePrice) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All fields are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
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
    console.log("uploadResult", uploadResult);
    serviceImg = uploadResult.secure_url;
  }

  const newService = new Services({
    technicianId,
    serviceName,
    servicePrice,
    serviceImg,
  });

  await newService.save();

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

  const service = await Services.findById(serviceId);
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
}
}


export const deleteAllServices = async (technicianId ) => {
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const services = await Services.find({ technicianId });

  if (!services || services.length === 0) {
    const err = new Error("No services found for this technician");
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

  await Services.deleteMany({ technicianId });

  return {
    message: "All services deleted for the technician.",
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

  const service = await Services.findById(serviceId);

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

  await Services.deleteOne({ _id: serviceId });

  return {
    message: "Service deleted successfully.",
    deletedServiceId: serviceId,
  };
};


export const getServicesByTechId = async ({
  technicianId,
}) => {
  console.log("hello", technicianId)
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician Id field is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    throw err;
  }

    const service = await Services.find({technicianId});
    if (!service || service.length === 0) {
    const err = new Error("Service not found For this Technician Id");
    err.statusCode = 404;
    throw err;
  }

  return {
   service
  };
};

