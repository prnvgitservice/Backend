import Technician from "../../models/authModels/technician.js";
import SubscriptionPlan from "../../models/subscription.js";
import { generateToken } from "../../utils/generateToken.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { addTechSubscriptionPlan, getTechSubscriptionPlan, updateTechSubscriptionPlan } from "../technician/technicianSubscriptionDetails.js";
import TechSubscriptionsDetail from "../../models/technician/technicianSubscriptionDetails.js";
import Franchise from "../../models/authModels/franchise.js";
import Executive from "../../models/authModels/executive.js";
import { addFranchiseAccount } from "../franchase/franchiseAccount.js";
import CaregoryServices from "../../models/caregoryServices.js";
import { getServicesByCategoryIdForTech } from "../caregoryServices.js";
import { addExecutiveAccount } from "../executive/executiveAccount.js";
import { addReferralsAccount } from "../referrals/referralsAccounts.js";
import category from "../../models/category.js";
import Review from '../../models/technician/reviewsAndRatings.js';


// export const registerTechnician = async ({
//   userId,
//   username,
//   phoneNumber,
//   password,
//   role = "technician",
//   category,
//   buildingName,
//   areaName,
//   subAreaName,
//   city,
//   state,
//   pincode,
//   subscriptionId,
// }) => {
//   const errors = [];

//   if (
//     !userId ||
//     !username ||
//     !phoneNumber ||
//     !password ||
//     !buildingName ||
//     !areaName ||
//     !role ||
//     !category ||
//     !city ||
//     !state ||
//     !subscriptionId ||
//     !pincode
//   ) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["All Fields Required."];
//     throw err;
//   }
//   if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
//     const err = new Error("Invalid Subscription ID format.");
//     err.statusCode = 400;
//     err.errors = ["Provided Subscription ID is not valid."];
//     throw err;
//   }

//   const subscription = await SubscriptionPlan.findById(subscriptionId);
//   if (!subscription) {
//     const err = new Error("Subscription not found");
//     err.statusCode = 404;
//     err.errors = ["Subscription ID not found."];
//     throw err;
//   }

//   if (!/^\d{10}$/.test(phoneNumber)) {
//     errors.push("Phone number must be exactly 10 digits.");
//   }

//   if (password?.length < 6 || password?.length > 20) {
//     errors.push("Password must be between 6 and 20 characters.");
//   }

//   const phoneExists = await Technician.findOne({ phoneNumber });
//   if (phoneExists) {
//     errors.push("Phone number already exists.");
//   }

//   if (errors.length > 0) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = errors;
//     throw err;
//   }

//   let caregoryServices = [];
//   if (category) {
//     caregoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
//   }

//   const technician = new Technician({
//     userId,
//     username,
//     phoneNumber,
//     password,
//     role,
//     category,
//     buildingName,
//     areaName,
//     subAreaName,
//     city,
//     state,
//     pincode,
//   });

//   if (caregoryServices?.service?.length > 0) {
//     technician.categoryServices = caregoryServices.service.map((srv) => ({
//       categoryServiceId: srv._id,
//       status: true,
//     }));
//   }

//   await technician.save();

//   // const subscription = await SubscriptionPlan.findOne({ name: "Free Plan" });

//   let result = null;
//   if (subscription) {
//     result = await addTechSubscriptionPlan({
//       technicianId: technician._id,
//       subscriptionId: subscription._id,
//     });
//   }

//   return {
//     id: technician._id,
//     userId: technician.userId,
//     username: technician.username,
//     phoneNumber: technician.phoneNumber,
//     role: technician.role,
//     category: technician.category,
//     buildingName: technician.buildingName,
//     areaName: technician.areaName,
//     subAreaName: technician.subAreaName,
//     city: technician.city,
//     state: technician.state,
//     pincode: technician.pincode,
//     plan: subscription?._id || null,
//     categoryServices: technician.categoryServices,
//     result: result.subscription,
//   };
// };

export const addTechnician = async ({
  userId,
  username,
  phoneNumber,
  password,
  role = "technician",
  category,
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  franchiseId,
  subscriptionId,
  authorized1Phone,
  authorized2Phone,
  description,
  service,
  files,
}) => {
  const errors = [];

  // Basic Validation
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
    !pincode ||
    !subscriptionId ||
    !authorized1Phone ||
    !authorized2Phone
  ) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All Fields Required."];
    throw err;
  }

  // Phone & Password Validation
  if (!/^\d{10}$/.test(phoneNumber))
    errors.push("Phone number must be exactly 10 digits.");

  if (!/^\d{10}$/.test(authorized1Phone))
    errors.push("Authorized person 1 phone number must be exactly 10 digits.");

  if (!/^\d{10}$/.test(authorized2Phone))
    errors.push("Authorized person 2 phone number must be exactly 10 digits.");

  if (password?.length < 6 || password?.length > 20)
    errors.push("Password must be between 6 and 20 characters.");

  // Ensure files exist
  if (!files?.aadharFront?.[0]) errors.push("Aadhar front image is required.");
  if (!files?.aadharBack?.[0]) errors.push("Aadhar back image is required.");
  if (!files?.panCard?.[0] && !files?.voterCard?.[0])
    errors.push("PAN card image or Voter card image is required.");
  if (!files?.auth1Photo?.[0])
    errors.push("Authorized person 1 photo is required.");
  if (!files?.auth2Photo?.[0])
    errors.push("Authorized person 2 photo is required.");

  // Check for duplicate phone number
  const phoneExists = await Technician.findOne({ phoneNumber });
  if (phoneExists) errors.push("Phone number already exists.");

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }

  // Validate Franchise (optional)
  if (franchiseId) {
    if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
      const err = new Error("Invalid Franchise ID format.");
      err.statusCode = 400;
      err.errors = ["Provided Franchise ID is not valid."];
      throw err;
    }

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      const err = new Error("Franchise not found");
      err.statusCode = 404;
      err.errors = ["Franchise ID not found."];
      throw err;
    }
  }

  // Validate Subscription
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const err = new Error("Invalid Subscription ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Subscription ID is not valid."];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  // Fetch Category Services
  let categoryServices = [];
  if (category) {
    categoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
  }

  // Initialize Technician
  const technician = new Technician({
    franchiseId: franchiseId || null,
    userId,
    username,
    phoneNumber,
    password,
    role,
    category,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
    description: description || "",
    service: service || "",
  });

  if (categoryServices?.service?.length > 0) {
    technician.categoryServices = categoryServices.service.map((srv) => ({
      categoryServiceId: srv._id,
      status: true,
    }));
  }

  // Helper function for safe file extraction
  const getFilePath = (fileObj) => fileObj?.filepath || fileObj?.path;

  // Helper for upload
  const uploadToCloudinary = async (fileObj, folder) => {
    const filePath = getFilePath(fileObj);
    if (!filePath) throw new Error(`Missing file path for ${folder}`);
    const upload = await cloudinary.uploader.upload(filePath, { folder });
    fs.unlinkSync(filePath);
    return upload.secure_url;
  };

  // Upload documents
  if (files?.profileImage?.[0])
    technician.profileImage = await uploadToCloudinary(files.profileImage[0], "TechProfiles");

  if (files?.aadharFront?.[0])
    technician.aadharFront = await uploadToCloudinary(files.aadharFront[0], "TechProofs/AadharFront");

  if (files?.aadharBack?.[0])
    technician.aadharBack = await uploadToCloudinary(files.aadharBack[0], "TechProofs/AadharBack");

  if (files?.panCard?.[0])
    technician.panCard = await uploadToCloudinary(files.panCard[0], "TechProofs/PanCard");

  if (files?.voterCard?.[0])
    technician.voterCard = await uploadToCloudinary(files.voterCard[0], "TechProofs/VoterCard");

  // Authorized Persons
  technician.authorizedPersons = [];

  if (files?.auth1Photo?.[0]) {
    const url = await uploadToCloudinary(files.auth1Photo[0], "TechProofs/AuthorizedPersons");
    technician.authorizedPersons.push({ phone: authorized1Phone, photo: url });
  }

  if (files?.auth2Photo?.[0]) {
    const url = await uploadToCloudinary(files.auth2Photo[0], "TechProofs/AuthorizedPersons");
    technician.authorizedPersons.push({ phone: authorized2Phone, photo: url });
  }

  await technician.save();

  // Add subscription plan
  const result = await addTechSubscriptionPlan({
    technicianId: technician._id,
    subscriptionId: subscription._id,
  });

  // Optional franchise account
  let franchiseAccount = null;
  if (result && franchiseId) {
    franchiseAccount = await addFranchiseAccount({
      franchiseId,
      technicianId: technician._id.toString(),
      subscriptionId,
    });
  }

  // Return formatted response
  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    profileImage: technician.profileImage || null,
    plan: subscription?._id || null,
    categoryServices: technician.categoryServices,
    aadharFront: technician.aadharFront || null,
    aadharBack: technician.aadharBack || null,
    panCard: technician.panCard || null,
    voterCard: technician.voterCard || null,
    authorizedPersons: technician.authorizedPersons,
    result: result?.subscription || null,
    status: technician.status,
    franchiseAccount: franchiseAccount?.newAccountDetails || null,
  };
};

export const registerTechnicianByFranchaise = async ({
  userId,
  username,
  phoneNumber,
  password,
  role = "technician",
  category,
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  franchiseId,
  subscriptionId,
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
    !pincode ||
    !franchiseId ||
    !subscriptionId
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

  if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
    const err = new Error("Invalid Franchise ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Franchise ID is not valid."];
    throw err;
  }

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID not found."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const err = new Error("Invalid Subscription ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Subscription ID is not valid."];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  let caregoryServices = [];
  if (category) {
    caregoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
  }

  const technician = new Technician({
    franchiseId,
    userId,
    username,
    phoneNumber,
    password,
    role,
    category,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
  });

  if (caregoryServices?.service?.length > 0) {
    technician.categoryServices = caregoryServices.service.map((srv) => ({
      categoryServiceId: srv._id,
      status: true,
    }));
  }

  await technician.save();

  let result = null;
  if (subscription) {
    result = await addTechSubscriptionPlan({
      technicianId: technician._id,
      subscriptionId: subscription._id,
    });
  }

  let franhiseAccount = null;
  if (result) {
    franhiseAccount = await addFranchiseAccount({
      franchiseId,
      technicianId: technician._id.toString(),
      subscriptionId,
    });
  }

  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    userId: technician.userId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    plan: subscription?._id || null,
    categoryServices: technician.categoryServices,
    result: result.subscription,
    franhiseAccount: franhiseAccount.newAccountDetails,
  };
};

export const registerTechnicianByExecutive = async ({
  userId,
  username,
  phoneNumber,
  password,
  role = "technician",
  category,
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  executiveId,
  subscriptionId,
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
    !pincode ||
    !executiveId ||
    !subscriptionId
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

  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    const err = new Error("Invalid ExecutiveId ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Executive ID is not valid."];
    throw err;
  }

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    err.errors = ["Executive ID not found."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const err = new Error("Invalid Subscription ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Subscription ID is not valid."];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  let caregoryServices = [];
  if (category) {
    caregoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
  }

  const technician = new Technician({
    executiveId,
    userId,
    username,
    phoneNumber,
    password,
    role,
    category,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
  });

  if (caregoryServices?.service?.length > 0) {
    technician.categoryServices = caregoryServices.service.map((srv) => ({
      categoryServiceId: srv._id,
      status: true,
    }));
  }

  await technician.save();

  let result = null;
  if (subscription) {
    result = await addTechSubscriptionPlan({
      technicianId: technician._id,
      subscriptionId: subscription._id,
    });
  }

  let executiveAccount = null;
  if (result) {
    executiveAccount = await addExecutiveAccount({
      executiveId,
      technicianId: technician._id.toString(),
      subscriptionId,
    });
  }

  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    userId: technician.userId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    plan: subscription?._id || null,
    categoryServices: technician.categoryServices,
    result: result.subscription,
    executiveAccount: executiveAccount.newAccountDetails,
  };
};

export const registerTechnicianByReferrals = async ({
  userId,
  username,
  phoneNumber,
  password,
  role = "technician",
  category,
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  referralsId,
  subscriptionId,
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
    !pincode ||
    !referralsId ||
    !subscriptionId
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

  if (!mongoose.Types.ObjectId.isValid(referralsId)) {
    const err = new Error("Invalid Referrals ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Referrals ID is not valid."];
    throw err;
  }

  const referrals = await Referrals.findById(referralsId);
  if (!referrals) {
    const err = new Error("Referrals not found");
    err.statusCode = 404;
    err.errors = ["Referrals ID not found."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const err = new Error("Invalid Subscription ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Subscription ID is not valid."];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  let caregoryServices = [];
  if (category) {
    caregoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
  }

  const technician = new Technician({
    referralsId,
    userId,
    username,
    phoneNumber,
    password,
    role,
    category,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
  });

  if (caregoryServices?.service?.length > 0) {
    technician.categoryServices = caregoryServices.service.map((srv) => ({
      categoryServiceId: srv._id,
      status: true,
    }));
  }

  await technician.save();

  let result = null;
  if (subscription) {
    result = await addTechSubscriptionPlan({
      technicianId: technician._id,
      subscriptionId: subscription._id,
    });
  }

  let referralsAccount = null;
  if (result) {
    Account = await addReferralsAccount({
      referralsId,
      technicianId: technician._id.toString(),
      subscriptionId,
    });
  }

  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    userId: technician.userId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    plan: subscription?._id || null,
    categoryServices: technician.categoryServices,
    result: result.subscription,
    referralsAccount: referralsAccount.newAccountDetails,
  };
};

export const registerTechnicianByAdmin = async ({
  userId,
  username,
  phoneNumber,
  password,
  role = "technician",
  category,
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  franchiseId,
  subscriptionId,
  authorized1Phone,
  authorized2Phone,
  description,
  service,
  files,
}) => {
  const errors = [];

  // Basic Validation
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
    !pincode ||
    !subscriptionId ||
    !authorized1Phone ||
    !authorized2Phone
  ) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All Fields Required."];
    throw err;
  }

  // Phone & Password Validation
  if (!/^\d{10}$/.test(phoneNumber))
    errors.push("Phone number must be exactly 10 digits.");

  if (!/^\d{10}$/.test(authorized1Phone))
    errors.push("Authorized person 1 phone number must be exactly 10 digits.");

  if (!/^\d{10}$/.test(authorized2Phone))
    errors.push("Authorized person 2 phone number must be exactly 10 digits.");

  if (password?.length < 6 || password?.length > 20)
    errors.push("Password must be between 6 and 20 characters.");

  // Ensure files exist
  if (!files?.aadharFront?.[0]) errors.push("Aadhar front image is required.");
  if (!files?.aadharBack?.[0]) errors.push("Aadhar back image is required.");
  if (!files?.panCard?.[0] && !files?.voterCard?.[0])
    errors.push("PAN card image or Voter card image is required.");
  if (!files?.auth1Photo?.[0])
    errors.push("Authorized person 1 photo is required.");
  if (!files?.auth2Photo?.[0])
    errors.push("Authorized person 2 photo is required.");

  // Check for duplicate phone number
  const phoneExists = await Technician.findOne({ phoneNumber });
  if (phoneExists) errors.push("Phone number already exists.");

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }

  // Validate Franchise (optional)
  if (franchiseId) {
    if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
      const err = new Error("Invalid Franchise ID format.");
      err.statusCode = 400;
      err.errors = ["Provided Franchise ID is not valid."];
      throw err;
    }

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      const err = new Error("Franchise not found");
      err.statusCode = 404;
      err.errors = ["Franchise ID not found."];
      throw err;
    }
  }

  // Validate Subscription
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const err = new Error("Invalid Subscription ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Subscription ID is not valid."];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  // Fetch Category Services
  let categoryServices = [];
  if (category) {
    categoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
  }

  // Initialize Technician
  const technician = new Technician({
    franchiseId: franchiseId || null,
    userId,
    username,
    phoneNumber,
    password,
    role,
    category,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
    description: description || "",
    service: service || "",
    admin: true,
    status: "registered"
  });

  if (categoryServices?.service?.length > 0) {
    technician.categoryServices = categoryServices.service.map((srv) => ({
      categoryServiceId: srv._id,
      status: true,
    }));
  }

  // Helper function for safe file extraction
  const getFilePath = (fileObj) => fileObj?.filepath || fileObj?.path;


  // Helper for upload
  const uploadToCloudinary = async (fileObj, folder) => {
    const filePath = getFilePath(fileObj);
    if (!filePath) throw new Error(`Missing file path for ${folder}`);
    const upload = await cloudinary.uploader.upload(filePath, { folder });
    fs.unlinkSync(filePath);
    return upload.secure_url;
  };

  // Upload documents
  if (files?.profileImage?.[0])
    technician.profileImage = await uploadToCloudinary(files.profileImage[0], "TechProfiles");

  if (files?.aadharFront?.[0])
    technician.aadharFront = await uploadToCloudinary(files.aadharFront[0], "TechProofs/AadharFront");

  if (files?.aadharBack?.[0])
    technician.aadharBack = await uploadToCloudinary(files.aadharBack[0], "TechProofs/AadharBack");

  if (files?.panCard?.[0])
    technician.panCard = await uploadToCloudinary(files.panCard[0], "TechProofs/PanCard");

  if (files?.voterCard?.[0])
    technician.voterCard = await uploadToCloudinary(files.voterCard[0], "TechProofs/VoterCard");

  // Authorized Persons
  technician.authorizedPersons = [];

  if (files?.auth1Photo?.[0]) {
    const url = await uploadToCloudinary(files.auth1Photo[0], "TechProofs/AuthorizedPersons");
    technician.authorizedPersons.push({ phone: authorized1Phone, photo: url });
  }

  if (files?.auth2Photo?.[0]) {
    const url = await uploadToCloudinary(files.auth2Photo[0], "TechProofs/AuthorizedPersons");
    technician.authorizedPersons.push({ phone: authorized2Phone, photo: url });
  }

  await technician.save();

  // Add subscription plan
  const result = await addTechSubscriptionPlan({
    technicianId: technician._id,
    subscriptionId: subscription._id,
  });

  // Optional franchise account
  let franchiseAccount = null;
  if (result && franchiseId) {
    franchiseAccount = await addFranchiseAccount({
      franchiseId,
      technicianId: technician._id.toString(),
      subscriptionId,
    });
  }

  // Return formatted response
  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    userId: technician.userId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    admin: technician.admin,
    status: technician.status,
    profileImage: technician.profileImage || null,
    plan: subscription?._id || null,
    categoryServices: technician.categoryServices,
    aadharFront: technician.aadharFront || null,
    aadharBack: technician.aadharBack || null,
    panCard: technician.panCard || null,
    voterCard: technician.voterCard || null,
    authorizedPersons: technician.authorizedPersons,
    result: result?.subscription || null,
    franchiseAccount: franchiseAccount?.newAccountDetails || null,
  };
};

// export const registerTechnicianByAdmin = async ({
//   userId,
//   username,
//   phoneNumber,
//   password,
//   role = "technician",
//   category,
//   buildingName,
//   areaName,
//   subAreaName,
//   city,
//   state,
//   pincode,
//   franchiseId,
//   subscriptionId,
// }) => {
//   const errors = [];

//   if (
//     !userId ||
//     !username ||
//     !phoneNumber ||
//     !password ||
//     !buildingName ||
//     !areaName ||
//     !role ||
//     !category ||
//     !city ||
//     !state ||
//     !pincode ||
//     !subscriptionId
//   ) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["All Fields Required."];
//     throw err;
//   }

//   if (!/^\d{10}$/.test(phoneNumber)) {
//     errors.push("Phone number must be exactly 10 digits.");
//   }

//   if (password?.length < 6 || password?.length > 20) {
//     errors.push("Password must be between 6 and 20 characters.");
//   }

//   const phoneExists = await Technician.findOne({ phoneNumber });
//   if (phoneExists) {
//     errors.push("Phone number already exists.");
//   }

//   if (franchiseId) {
//     if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
//       const err = new Error("Invalid Franchise ID format.");
//       err.statusCode = 400;
//       err.errors = ["Provided Franchise ID is not valid."];
//       throw err;
//     }

//     const franchise = await Franchise.findById(franchiseId);
//     if (!franchise) {
//       const err = new Error("Franchise not found");
//       err.statusCode = 404;
//       err.errors = ["Franchise ID not found."];
//       throw err;
//     }
//   }

//   if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
//     const err = new Error("Invalid Subscription ID format.");
//     err.statusCode = 400;
//     err.errors = ["Provided Subscription ID is not valid."];
//     throw err;
//   }

//   const subscription = await SubscriptionPlan.findById(subscriptionId);
//   if (!subscription) {
//     const err = new Error("Subscription not found");
//     err.statusCode = 404;
//     err.errors = ["Subscription ID not found."];
//     throw err;
//   }

//   let caregoryServices = [];
//   if (category) {
//     caregoryServices = await getServicesByCategoryIdForTech({ categoryId: category });
//   }

//   const technician = new Technician({
//     franchiseId: franchiseId || null,
//     userId,
//     username,
//     phoneNumber,
//     password,
//     role,
//     category,
//     buildingName,
//     areaName,
//     subAreaName,
//     city,
//     state,
//     pincode,
//     admin: true,
//   });

//   if (caregoryServices?.service?.length > 0) {
//     technician.categoryServices = caregoryServices.service.map((srv) => ({
//       categoryServiceId: srv._id,
//       status: true,
//     }));
//   }

//   await technician.save();

//   let result = null;
//   if (subscription) {
//     result = await addTechSubscriptionPlan({
//       technicianId: technician._id,
//       subscriptionId: subscription._id,
//     });
//   }

//   let franhiseAccount = null;
//   if (result && franchiseId) {
//     franhiseAccount = await addFranchiseAccount({
//       franchiseId,
//       technicianId: technician._id.toString(),
//       subscriptionId,
//     });
//   }

//   return {
//     id: technician._id,
//     franchiseId: technician.franchiseId,
//     userId: technician.userId,
//     username: technician.username,
//     phoneNumber: technician.phoneNumber,
//     role: technician.role,
//     category: technician.category,
//     buildingName: technician.buildingName,
//     areaName: technician.areaName,
//     subAreaName: technician.subAreaName,
//     city: technician.city,
//     state: technician.state,
//     pincode: technician.pincode,
//     admin: technician.admin,
//     plan: subscription?._id || null,
//     categoryServices: technician.categoryServices,
//     result: result?.subscription || null,
//     franhiseAccount: franhiseAccount?.newAccountDetails || null,
//   };
// };

export const renewTechnicianByFranchaise = async ({
  technicianId,
  franchiseId,
  subscriptionId,
}) => {
  const errors = [];

  if (!technicianId || !franchiseId || !subscriptionId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All Fields Required."];
    throw err;
  }

  if (
    !mongoose.Types.ObjectId.isValid(technicianId) ||
    !mongoose.Types.ObjectId.isValid(franchiseId) ||
    !mongoose.Types.ObjectId.isValid(subscriptionId)
  ) {
    const err = new Error(
      "Invalid Technician or Franchise or Subscription ID format"
    );
    err.statusCode = 400;
    err.errors = [
      "Provided Technician or Franchise or Subscription ID is not valid.",
    ];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    err.errors = ["Technician ID not found."];
    throw err;
  }

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID not found."];
    throw err;
  }

  const subscription = await SubscriptionPlan.findById(subscriptionId);
  if (!subscription) {
    const err = new Error("Subscription not found");
    err.statusCode = 404;
    err.errors = ["Subscription ID not found."];
    throw err;
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  let result = null;
  if (subscription) {
    result = await addTechSubscriptionPlan({
      technicianId: technician._id,
      subscriptionId: subscription._id,
    });
  }

  let franhiseAccount = null;
  if (result) {
    franhiseAccount = await addFranchiseAccount({
      franchiseId,
      technicianId: technician._id.toString(),
      subscriptionId,
    });
  }

  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    userId: technician.userId,
    username: technician.username,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    plan: subscription?._id || null,
    result: result.subscription,
    franhiseAccount: franhiseAccount.newAccountDetails,
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

  const technician = await Technician.find({status : "registered"}).findOne({ phoneNumber }).select(
    "+password"
  );
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

  const techSubDetails = await TechSubscriptionsDetail.findOne({
    technicianId: technician._id,
  });
  let planDetails = null;

  if (
    techSubDetails &&
    Array.isArray(techSubDetails.subscriptions) &&
    techSubDetails.subscriptions.length > 0
  ) {
    const lastSub =
      techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];

    const expired =
      new Date(lastSub.endDate) < new Date() ||
      (lastSub.leads != null &&
        lastSub.ordersCount != null &&
        lastSub.leads === lastSub.ordersCount);

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
    franchiseId: technician.franchiseId,
    username: technician.username,
    userId: technician.userId,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
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
  subAreaName,
  city,
  state,
  pincode,
  description,
  service,
  files,
}) => {
  const errors = [];
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
  if (subAreaName) technician.subAreaName = subAreaName;
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
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    profileImage: technician.profileImage,
  };
};

export const updateTechByAdmin = async ({
  technicianId,
  username,
  password,
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  description,
  subscriptionId,
  service,
  files,
}) => {
  const errors = [];
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

  let subscriptionDetail;

  if(!subscriptionId){
    subscriptionDetail = null;
    return;
  }else{
    subscriptionDetail = await updateTechSubscriptionPlan({
     technicianId: technician._id,
     subscriptionId,
   });
   if (subscriptionDetail && subscriptionDetail.error) {
     errors.push(subscriptionDetail.error);
   }
  }

  if (username) technician.username = username;
  if (password) technician.password = password;
  if (buildingName) technician.buildingName = buildingName;
  if (areaName) technician.areaName = areaName;
  if (subAreaName) technician.subAreaName = subAreaName;
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
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    profileImage: technician.profileImage,
    subscriptionDetail: subscriptionDetail || null,
    };
};

export const getTechnicianProfile = async (technicianId) => {
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

   const categories = await category.findById(technician.category)
  if (!categories) {
    const err = new Error("category not found");
    err.statusCode = 404;
    err.errors = ["category ID Not Found."];
    throw err;
  }

  const techSubDetails = await TechSubscriptionsDetail.findOne({
    technicianId,
  });

    const ratings = await Review.find({ technicianId });
  

  let lastSubscription = null;
  if (
    techSubDetails &&
    Array.isArray(techSubDetails.subscriptions) &&
    techSubDetails.subscriptions.length > 0
  ) {
    lastSubscription =
      techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];
  }

  return {
    id: technician._id,
    franchiseId: technician.franchiseId,
    username: technician.username,
    userId: technician.userId,
    phoneNumber: technician.phoneNumber,
    role: technician.role,
    category: technician.category,
    categoryName: categories.category_name,
    buildingName: technician.buildingName,
    areaName: technician.areaName,
    subAreaName: technician.subAreaName,
    city: technician.city,
    state: technician.state,
    pincode: technician.pincode,
    description: technician.description,
    service: technician.service,
    profileImage: technician.profileImage,
    subscription: lastSubscription || null,
    admin: technician.admin,
    ratings: ratings,
    categoryServices: technician.categoryServices,
  };
};

export const getTechnicianProfilesByFranchiseId = async (franchiseId) => {
  if (!franchiseId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Franchise ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
    const err = new Error("Invalid Franchise ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Franchise ID is not valid."];
    throw err;
  }

  const technicians = await Technician.find({ franchiseId });

  if (!technicians || technicians.length === 0) {
    const err = new Error("No technicians found for this franchise.");
    err.statusCode = 404;
    err.errors = ["No technician profiles associated with this Franchise ID."];
    throw err;
  }

  const results = await Promise.all(
    technicians.map(async (technician) => {
      const techSubDetails = await TechSubscriptionsDetail.findOne({
        technicianId: technician._id,
      });

      let lastSubscription = null;
      if (
        techSubDetails &&
        Array.isArray(techSubDetails.subscriptions) &&
        techSubDetails.subscriptions.length > 0
      ) {
        lastSubscription =
          techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];
      }

      return {
        id: technician._id,
        franchiseId: technician.franchiseId,
        username: technician.username,
        userId: technician.userId,
        phoneNumber: technician.phoneNumber,
        role: technician.role,
        category: technician.category,
        buildingName: technician.buildingName,
        areaName: technician.areaName,
        subAreaName: technician.subAreaName,
        city: technician.city,
        state: technician.state,
        pincode: technician.pincode,
        description: technician.description,
        service: technician.service,
        profileImage: technician.profileImage,
        subscription: lastSubscription || null,
        admin: technician.admin,
        categoryServices: technician.categoryServices,
      };
    })
  );

  return results;
};

export const getTechnicianProfilesByExecutiveId = async (executiveId) => {
  if (!executiveId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Executive ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    const err = new Error("Invalid Executive ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Executive ID is not valid."];
    throw err;
  }

  const technicians = await Technician.find({ executiveId });

  if (!technicians || technicians.length === 0) {
    const err = new Error("No technicians found for this executive.");
    err.statusCode = 404;
    err.errors = ["No technician profiles associated with this Executive ID."];
    throw err;
  }

  const results = await Promise.all(
    technicians.map(async (technician) => {
      const techSubDetails = await TechSubscriptionsDetail.findOne({
        technicianId: technician._id,
      });

      let lastSubscription = null;
      if (
        techSubDetails &&
        Array.isArray(techSubDetails.subscriptions) &&
        techSubDetails.subscriptions.length > 0
      ) {
        lastSubscription =
          techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];
      }

      return {
        id: technician._id,
        executiveId: technician.executiveId,
        username: technician.username,
        userId: technician.userId,
        phoneNumber: technician.phoneNumber,
        role: technician.role,
        category: technician.category,
        buildingName: technician.buildingName,
        areaName: technician.areaName,
        subAreaName: technician.subAreaName,
        city: technician.city,
        state: technician.state,
        pincode: technician.pincode,
        description: technician.description,
        service: technician.service,
        profileImage: technician.profileImage,
        subscription: lastSubscription || null,
        admin: technician.admin,
        categoryServices: technician.categoryServices,
      };
    })
  );

  return results;
};

// export const getAllTechnicians = async ({ offset = 0, limit = 10 }) => {
//   const skip = parseInt(offset, 10);
//   const pageSize = parseInt(limit, 10);

//   if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
//     const err = new Error("Invalid pagination parameters");
//     err.statusCode = 400;
//     err.errors = ["Offset and limit must be valid positive integers"];
//     throw err;
//   }

//   const totalTechnicians = await Technician.countDocuments({});
//   const technicians = await Technician.find({})
//     .skip(skip)
//     .limit(pageSize)
//     .sort({ createdAt: -1 });

//   return {
//     total: totalTechnicians,
//     offset: skip,
//     limit: pageSize,
//     technicians: technicians.map((technician) => ({
//       id: technician._id,
//       username: technician.username,
//       phoneNumber: technician.phoneNumber,
//       role: technician.role,
//       buildingName: technician.buildingName,
//       areaName: technician.areaName,
//       subAreaName: technician.subAreaName,
//       city: technician.city,
//       state: technician.state,
//       pincode: technician.pincode,
//       profileImage: technician.profileImage,
//       admin: technician.admin,
//       categoryServices: technician.categoryServices,
//     })),
//   };
// };

export const getAllTechnicians = async ({ offset = 0, limit = 10 }) => {
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const allowedStatus = ["registered", "requested", "declined"]

  const totalTechnicians = await Technician.find({status : allowedStatus}).countDocuments({});
  const technicians = await Technician.find({ status : "registered"})
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

const techDetails = await Promise.all(
    technicians.map(async (technician) => {
      const categoryDoc = await category.findById(technician.category); // Assuming model is 'Category' (capitalized)
      const techSubDetails = await getTechSubscriptionPlan(technician._id);
      return {
        categoryName: categoryDoc ? categoryDoc.category_name : null,
        planDetails: techSubDetails.lastSub || null,
      };
    })
  );
  return {
    total: totalTechnicians,
    offset: skip,
    limit: pageSize,
    technicians: technicians.map((technician) => ({
      id: technician._id,
      username: technician.username,
      phoneNumber: technician.phoneNumber,
      role: technician.role,
      userId: technician.userId,
      category: technician.category,
      buildingName: technician.buildingName,
      areaName: technician.areaName,
      subAreaName: technician.subAreaName,
      city: technician.city,
      state: technician.state,
      pincode: technician.pincode,
      profileImage: technician.profileImage,
      admin: technician.admin,
      status: technician.status,
      description: technician.description,
      categoryServices: technician.categoryServices,
      createdAt: technician.createdAt,
      techDetails: techDetails[technicians.indexOf(technician)],
    })),
  };
};

export const getAllTechRequest = async ({offset , limit}) =>{

  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const allowedStatus = ["requested", "declined"]

  const technicians = await Technician.find({status : allowedStatus})
  .skip(skip)
  .limit(pageSize)
  .sort({ createdAt: -1 });
  
  // const totalTechnicians = (await Technician.find({status : allowedStatus})).length;
  const totalTechnicians = await Technician.find({status : allowedStatus}).countDocuments({});


  const techDetails = await Promise.all(
    technicians.map(async (technician) => {
      const categoryDoc = await category.findById(technician.category); // Assuming model is 'Category' (capitalized)
      const techSubDetails = await getTechSubscriptionPlan(technician._id);
      return {
        categoryName: categoryDoc ? categoryDoc.category_name : null,
        planDetails: techSubDetails.lastSub || null,
      };
    })
  );

   return {
    total: totalTechnicians,
    offset: skip,
    limit: pageSize,
    technicians: technicians.map((technician) => ({
      id: technician._id,
      username: technician.username,
      phoneNumber: technician.phoneNumber,
      role: technician.role,
      userId: technician.userId,
      category: technician.category,
      buildingName: technician.buildingName,
      areaName: technician.areaName,
      subAreaName: technician.subAreaName,
      city: technician.city,
      state: technician.state,
      pincode: technician.pincode,
      profileImage: technician.profileImage,
      admin: technician.admin,
      status: technician.status,
      authorizedPersons: technician.authorizedPersons,
      aadharBack: technician.aadharBack,
      aadharFront: technician.aadharFront,
      voterCard: technician.voterCard || null,
      panCard: technician.panCard || null,
      description: technician.description,
      categoryServices: technician.categoryServices,
      createdAt: technician.createdAt,
      techDetails: techDetails[technicians.indexOf(technician)],
    })),
  };  
}

export const updateTechnicianStatusService = async (technicianId, newStatus) => {
  if (!['registered', 'declined'].includes(newStatus)) {
    throw new Error('Invalid status. Must be "registered" or "declined".');
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    throw new Error('Technician not found.');
  }

  if (technician.status !== 'requested') {
    throw new Error('Can only update status from "requested" to "registered" or "declined".');
  }

  const allowedStatuses = ["registered", "declined"];
  const normalizedStatus = newStatus.toLowerCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    const err = new Error("Invalid status value");
    err.statusCode = 400;
    err.errors = [`Status must be one of: ${allowedStatuses.join(", ")}`];
    throw err;
  }

  technician.status = newStatus;
  await technician.save();

  return technician;
};


export const changeServiceStatus = async ({
  technicianId,
  categoryServiceId,
}) => {
  if (!technicianId || !categoryServiceId) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = ["TechnicianId and CategoryServiceId are required"];
    throw err;
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    const err = new Error("Technician not found");
    err.statusCode = 404;
    throw err;
  }

  const service = technician.categoryServices.find(
    (s) => s.categoryServiceId.toString() === categoryServiceId.toString()
  );

  if (!service) {
    const err = new Error("Service not found for this technician");
    err.statusCode = 404;
    throw err;
  }
  service.status = !service.status;

  await technician.save();

  return {
    technicianId: technician._id,
    categoryServiceId: service.categoryServiceId,
    status: service.status,
  };
};

export const deleteTechnicianById = async (technicianId) => {
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

  if (technician.profileImage) {
    const match = technician.profileImage.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `TechProfiles/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  await Technician.findByIdAndDelete(technicianId);

  return {
    id: technicianId,
  };
};
