
import { generateToken } from "../../utils/generateToken.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import Executive from "../../models/authModels/executive.js";

export const registerExecutive = async ({
  executiveId,
  executivename,
  phoneNumber,
  password,
  role = "trainee marketing executive",
  buildingName,
  areaName,
  city,
  state,
  pincode,
}) => {
  const errors = [];

  if (
    !executiveId ||
    !executivename ||
    !phoneNumber ||
    !password ||
    !role ||
    !buildingName ||
    !areaName ||
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

  const phoneExists = await Executive.findOne({ phoneNumber });
  if (phoneExists) {
 const err = new Error("Phone number already registered");
    err.statusCode = 400;
    throw err;
    // errors.push("Phone number already exists.");
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const executive = new Executive({
    executiveId,
    executivename,
    phoneNumber,
    password,
    role,
    buildingName,
    areaName,
    city,
    state,
    pincode,
  });
  await executive.save();
};

export const loginExecutive = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) {
    const err = new Error("VAlidation Failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }

  const errors = [];

  const executive = await Executive.findOne({ phoneNumber }).select(
    "+password"
  );
  if (!executive) {
    errors.push("Executive not found with this phone number.");
  }

  let isMatch = false;
  if (executive) {
    isMatch = await executive.isPasswordMatch(password);
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

  const token = generateToken(executive);

  return {
    id: executive._id,
    executivename: executive.executivename,
    executiveId: executive.executiveId,
    phoneNumber: executive.phoneNumber,
    role: executive.role,
    buildingName: executive.buildingName,
    areaName: executive.areaName,
    city: executive.city,
    state: executive.state,
    pincode: executive.pincode,
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

  const franchiseSubDetails = await FranchiseSubscription.findOne({
    franchiseId,
  });

  let lastSubscription = null;
  if (
    franchiseSubDetails &&
    Array.isArray(franchiseSubDetails.subscriptions) &&
    franchiseSubDetails.subscriptions.length > 0
  ) {
    lastSubscription =
      franchiseSubDetails.subscriptions[
        franchiseSubDetails.subscriptions.length - 1
      ];
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
    lastSubscription: lastSubscription,
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

export const getAllFranchises = async ({ offset = 0, limit = 10 }) => {
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const totalFranchises = await Franchise.countDocuments({});
  const franchises = await Franchise.find({})
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return {
    total: totalFranchises,
    offset: skip,
    limit: pageSize,
    franchises: franchises.map((franchise) => ({
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
      description: franchise.description,
      profileImage: franchise.profileImage,
    })),
  };
};
