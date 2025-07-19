import Technician from '../../models/authModels/technician.js'
import SubscriptionPlan from '../../models/subscription.model.js';
import { generateToken } from '../../utils/generateToken.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { addTechSubscriptionPlan } from '../technician/technicianSubscriptionDetails.js';
import TechSubscriptionsDetail from '../../models/technician/technicianSubscriptionDetails.js';

export const registerTechnician = async ({ 
  userId,
  username,
  phoneNumber,
  password,
  role = 'technician',
  category,
  buildingName,
  areaName,
  city,
  state,
  pincode,
}) => {
  const errors = [];

  if (
    !userId ||
    !username ||
    !phoneNumber ||
    !password ||
    !buildingName ||
    !areaName ||
    !role ||
    !category ||
    !city ||
    !state ||
    !pincode
  ) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All Fields Required."];
    throw err;
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    errors.push("Phone number must be exactly 10 digits.");
  }

  if (password?.length < 6 || password?.length > 20) {
    errors.push("Password must be between 6 and 20 characters.");
  }

  const phoneExists = await Technician.findOne({ phoneNumber });
  if (phoneExists) {
    errors.push("Phone number already exists.");
  }

if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }


  const technician = new Technician({
     userId,
  username,
  phoneNumber,
  password,
  role,
  category,
  buildingName,
  areaName,
  city,
  state,
  pincode 
});
  await technician.save();

  const subscription = await SubscriptionPlan.findOne({ name: "Trail Pack" });

  let result = null;
  if (subscription) {
    result = await addTechSubscriptionPlan({
      technicianId: technician._id,
      subscriptionId: subscription._id,
    });
    console.log("i resut", result)
  }
  
  return {
    id: technician._id,
    userId: technician.userId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    plan: subscription?._id || null
  };
};


export const loginTechnician = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }

  const errors = [];

  const technician = await Technician.findOne({ phoneNumber }).select('+password');
  if (!technician) {
    errors.push("Technician not found with this phone number.");
  }

  let isMatch = false;
  if (technician) {
    isMatch = await technician.isPasswordMatch(password);
    if (!isMatch) {
      errors.push("Invalid credentials.");
    }
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const token = generateToken(technician);

  const techSubDetails = await TechSubscriptionsDetail.findOne({ technicianId: technician._id });
  let planDetails = null;

  if (techSubDetails && Array.isArray(techSubDetails.subscriptions) && techSubDetails.subscriptions.length > 0) {
    const lastSub = techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

    const expired = new Date(lastSub.endDate) < new Date() || 
                    (lastSub.leads != null && lastSub.ordersCount != null && lastSub.leads === lastSub.ordersCount);

    planDetails = {
      subscriptionId: lastSub.subscriptionId,
      startDate: lastSub.startDate,
      endDate: lastSub.endDate,
      leads: lastSub.leads,
      ordersCount: lastSub.ordersCount,
      expired,
    };
  }

  return {
    id: technician._id,
    username: technician.username,
    userId: technician.userId,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    token,
    planDetails,
  };
};



export const updateTechnician = async ({ 
   technicianId,
    username,
    password,
    buildingName,
    areaName,
    city,
    state,
    pincode,
    description,
    service,
    files,
}) => {
   const errors = [];
  console.log("service", service)
    if (!technicianId) {
      const err = new Error("Validation failed");
      err.statusCode = 401;
      err.errors = ["technicianId are required."];
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
        const err = new Error("Technician ID format.");
        err.statusCode = 400;
        err.errors = ["Provided Technician ID is not valid."];
        throw err;
      }

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      const err = new Error("Technician not found");
      err.statusCode = 404;
      err.errors = ["Technician ID Not Found."];
      throw err;
    }

    if (files.profileImage?.[0]) {
      const filePath = files.profileImage[0].path;

      const oldUrl = technician.profileImage;
      if (oldUrl) {
        const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
        const publicId = match ? `TechProfiles/${match[1]}` : null;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "TechProfiles",
      });
      fs.unlinkSync(filePath);

      technician.profileImage = uploadResult.secure_url;
    }

    if (username) technician.username = username;
    if (password) technician.password = password;
    if (buildingName) technician.buildingName = buildingName;
    if (areaName) technician.areaName = areaName;
    if (city) technician.city = city;
    if (state) technician.state = state;
    if (pincode) technician.pincode = pincode;
    if (service) technician.service = service;
    if (description) technician.description = description;

    await technician.save();

     if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }


return {
   id: technician._id,
    username: technician.username,
    userId: technician.userId,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    profileImage: technician.profileImage,
}
};

export const getTechnicianProfile = async (technicianId) => {
  console.log("technicianId", technicianId)
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
    const err = new Error("Technician not found.");
    err.statusCode = 404;
    err.errors = ["Technician not found."];
    throw err;
  }

  return {
     id: technician._id,
    username: technician.username,
    userId: technician.userId,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    profileImage: technician.profileImage,
  };
};


