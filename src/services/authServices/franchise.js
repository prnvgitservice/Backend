import Franchise from "../../models/authModels/franchise.js";
import FranchiseSubscription from "../../models/franchase/franchiseSubscriptions.js";
import { generateToken } from "../../utils/generateToken.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { addFranchiseSubscriptionPlan } from "../franchase/franchiseSubscriptionDetails.js";

export const registerFranchise = async ({
  franchiseId,
  username,
  phoneNumber,
  password,
  role = "franchise",
  buildingName,
  areaName,
  city,
  state,
  pincode,
}) => {
  const errors = [];

  if (
    !franchiseId ||
    !username ||
    !phoneNumber ||
    !password ||
    !buildingName ||
    !areaName ||
    !role ||
    !city ||
    !state ||
    !pincode
  ) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["All fields are required."];
    throw err;
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    errors.push("Phone number must be exactly 10 digits.");
  }

  if (password?.length < 6 || password?.length > 20) {
    errors.push("Password must be between 6 and 20 characters.");
  }

  const phoneExists = await Franchise.findOne({ phoneNumber });
  if (phoneExists) {
    errors.push("Phone number already exists.");
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const franchiseSubscription = await FranchiseSubscription.find();
  console.log("franchiseSubscription", franchiseSubscription);

  if (!franchiseSubscription.length) {
    const err = new Error("Franchise Subscription not found");
    err.statusCode = 404;
    err.errors = ["Franchise Subscription list is empty."];
    throw err;
  }
  const firstPlanId = franchiseSubscription[0]._id.toString();

  const franchise = new Franchise({
    franchiseId,
    username,
    phoneNumber,
    password,
    role,
    buildingName,
    areaName,
    city,
    state,
    pincode,
  });
  await franchise.save();

  const addFranchisePlan = await addFranchiseSubscriptionPlan({
    franchiseId: franchise._id.toString(),
    franchiseSubscriptionId: firstPlanId,
  });

  return {
    id: franchise._id,
    franchiseId: franchise.franchiseId,
    username: franchise.username,
    phoneNumber: franchise.phoneNumber,
    role: franchise.role,
    buildingName: franchise.buildingName,
    areaName: franchise.areaName,
    city: franchise.city,
    state: franchise.state,
    pincode: franchise.pincode,
    plan: addFranchisePlan || null,
  };
};

export const loginFranchise = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }

  const errors = [];

  const franchise = await Franchise.findOne({ phoneNumber }).select(
    "+password"
  );
  if (!franchise) {
    errors.push("franchise not found with this phone number.");
  }

  let isMatch = false;
  if (franchise) {
    isMatch = await franchise.isPasswordMatch(password);
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

  const token = generateToken(franchise);

  return {
    id: franchise._id,
    username: franchise.username,
    franchiseId: franchise.franchiseId,
    phoneNumber: franchise.phoneNumber,
    role: franchise.role,
    buildingName: franchise.buildingName,
    areaName: franchise.areaName,
    city: franchise.city,
    state: franchise.state,
    pincode: franchise.pincode,
    token,
  };
};

export const updateFranchise = async ({
  franchiseId,
  username,
  password,
  buildingName,
  areaName,
  city,
  state,
  pincode,
  description,
  files,
}) => {
  const errors = [];
  if (!franchiseId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Franchise Id are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
    const err = new Error("Franchise ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Franchise ID is not valid."];
    throw err;
  }

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID Not Found."];
    throw err;
  }

  if (files.profileImage?.[0]) {
    const filePath = files.profileImage[0].path;

    const oldUrl = franchise.profileImage;
    if (oldUrl) {
      const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `FranchaseProfiles/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "FranchaseProfiles",
    });
    fs.unlinkSync(filePath);

    franchise.profileImage = uploadResult.secure_url;
  }

  if (username) franchise.username = username;
  if (password) franchise.password = password;
  if (buildingName) franchise.buildingName = buildingName;
  if (areaName) franchise.areaName = areaName;
  if (city) franchise.city = city;
  if (state) franchise.state = state;
  if (pincode) franchise.pincode = pincode;
  if (description) franchise.description = description;

  await franchise.save();

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  return {
    id: franchise._id,
    username: franchise.username,
    franchiseId: franchise.franchiseId,
    phoneNumber: franchise.phoneNumber,
    role: franchise.role,
    buildingName: franchise.buildingName,
    areaName: franchise.areaName,
    city: franchise.city,
    state: franchise.state,
    pincode: franchise.pincode,
    description: franchise.description,
    profileImage: franchise.profileImage,
  };
};

export const getFranchiseProfile = async (franchiseId) => {
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

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found.");
    err.statusCode = 404;
    err.errors = ["Franchise not found."];
    throw err;
  }

  return {
    id: franchise._id,
    username: franchise.username,
    franchiseId: franchise.franchiseId,
    phoneNumber: franchise.phoneNumber,
    role: franchise.role,
    buildingName: franchise.buildingName,
    areaName: franchise.areaName,
    city: franchise.city,
    state: franchise.state,
    pincode: franchise.pincode,
    description: franchise.description,
    profileImage: franchise.profileImage,
  };
};

export const deleteFranchise = async (franchiseId) => {
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

  const franchise = await Franchise.findById(franchiseId);
  if (!franchise) {
    const err = new Error("Franchise not found");
    err.statusCode = 404;
    err.errors = ["Franchise ID not found."];
    throw err;
  }

  const oldUrl = franchise.profileImage;
  if (oldUrl) {
    const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `FranchaseProfiles/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  await franchise.deleteOne();

  return {
    id: franchise._id,
  };
};
