import mongoose from 'mongoose';
import TechProfile from '../../models/authModels/techProfile.js';
import Technician from '../../models/authModels/technician.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const createTechProfile = async (req) => {
  const {
    technicianId,
    description,
    services = [],
  } = req.body;

  const errors = [];

  if (!technicianId || !description) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["technicianId and description are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Technician ID is not valid."];
    throw err;
  }

  
  const filesMap = req.files?.reduce((acc, file) => {
    if (!acc[file.fieldname]) acc[file.fieldname] = [];
    acc[file.fieldname].push(file);
    return acc;
  }, {}) || {};

  
  const findTechnician = await Technician.findById(technicianId);
  if (!findTechnician) {
    errors.push("Technician not found.");
  }

  
  const findTechnicianProfile = await TechProfile.findOne({ technicianId });
  if (findTechnicianProfile) {
    errors.push("Technician Already Created.");
  }

  
  if (errors.length > 0) {
    Object.values(filesMap).flat().forEach(file => {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }

  console.log("Uploaded files:");
  console.dir(req.files, { depth: null });

  let profileImageUrl = "";
  if (filesMap.profileImage?.[0]) {
    const filePath = filesMap.profileImage[0].path;
    console.log(`Uploading profile image: ${filePath}`);
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "TechProfiles",
    });
    profileImageUrl = uploadResult.secure_url;
    console.log("Profile image uploaded:", profileImageUrl);
    fs.unlinkSync(filePath);
  }

  
  const uploadedPhotos = [];
  if (filesMap.photos?.length > 5) {
    errors.push("A maximum of 5 photos are allowed.");
  }

  if (filesMap.photos?.length) {
    for (const photo of filesMap.photos) {
      const upload = await cloudinary.uploader.upload(photo.path, {
        folder: "TechUploadedPhotos",
      });
      uploadedPhotos.push({ imageUrl: upload.secure_url });
      console.log("Uploaded photo:", upload.secure_url);
      fs.unlinkSync(photo.path);
    }
  }

  
  const structuredServices = [];
  for (let i = 0; i < services.length; i++) {
    let service;
    try {
      service = JSON.parse(services[i]);
    } catch (e) {
      errors.push(`Service at index ${i} is not valid JSON`);
      continue;
    }

    let serviceImgUrl = "";
    const fileKey = `serviceImg_${i}`;
    if (filesMap[fileKey]?.[0]) {
      const filePath = filesMap[fileKey][0].path;
      console.log(`Uploading service image for index ${i}: ${filePath}`);
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "TechServiceImages",
      });
      serviceImgUrl = uploadResult.secure_url;
      console.log(`Service image uploaded for index ${i}:`, serviceImgUrl);
      fs.unlinkSync(filePath);
    }

    if (!service.serviceName || typeof service.serviceName !== "string") {
      errors.push(`Service at index ${i} missing or invalid 'serviceName'`);
    }

    if (typeof service.servicePrice !== "number" || service.servicePrice < 0) {
      errors.push(`Service at index ${i} has invalid 'servicePrice'`);
    }

    structuredServices.push({
      serviceName: service.serviceName,
      servicePrice: service.servicePrice,
      serviceImg: serviceImgUrl,
    });
  }

  
  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const techProfile = new TechProfile({
    technicianId,
    description,
    profileImage: profileImageUrl,
    photos: uploadedPhotos,
    services: structuredServices,
  });

  await techProfile.save();

  return techProfile;
};



export const getTechProfile = async (technicianId) => {
   const errors = [];
  if (!technicianId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Technician ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    const err = new Error("Invalid Technician ID format.");
    err.statusCode = 400;
    err.errors = ["Provided TechnicianId ID is not valid."];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    errors.push("Technician not found.");
  }

  
  const technicianProfile = await TechProfile.findOne({ technicianId });
  if (!technicianProfile) {
    errors.push("Technician Profile Not Found.");
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  return {
    technician,
    technicianProfile
  };
};

export const getTechAllProfile = async () => {
  const errors = [];

  const technicians = await Technician.find();
  if (!technicians || technicians.length === 0) {
    errors.push("No technicians found.");
  }

  const technicianProfiles = await Promise.all(
    technicians.map(async (tech) => {
      const profile = await TechProfile.findOne({ technicianId: tech._id });
      return {
        technician: tech,
        profile: profile || null,
      };
    })
  );

  
  const allProfilesMissing = technicianProfiles.every(tp => tp.profile === null);
  if (allProfilesMissing) {
    errors.push("No technician profiles found.");
  }

  
  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 404;
    err.errors = errors;
    throw err;
  }

  return technicianProfiles;
};


