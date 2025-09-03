
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


export const updateExecutive = async ({
  executiveId,
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
  if (!executiveId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Executive Id are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    const err = new Error("Executive ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Executive ID is not valid."];
    throw err;
  }

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    err.errors = ["Executive ID Not Found."];
    throw err;
  }

  if (files.profileImage?.[0]) {
    const filePath = files.profileImage[0].path;

    const oldUrl = executive.profileImage;
    if (oldUrl) {
      const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `ExecutiveProfiles/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "FranchaseProfiles",
    });
    fs.unlinkSync(filePath);

    executive.profileImage = uploadResult.secure_url;
  }

  if (username) executive.username = username;
  if (password) executive.password = password;
  if (buildingName) executive.buildingName = buildingName;
  if (areaName) executive.areaName = areaName;
  if (city) executive.city = city;
  if (state) executive.state = state;
  if (pincode) executive.pincode = pincode;
  if (description) executive.description = description;

  await executive.save();

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  return {
    id: executive._id,
    username: executive.username,
    executiveId: executive.executiveId,
    phoneNumber: executive.phoneNumber,
    role: executive.role,
    buildingName: executive.buildingName,
    areaName: executive.areaName,
    city: executive.city,
    state: executive.state,
    pincode: executive.pincode,
    description: executive.description,
    profileImage: executive.profileImage,
  };
};

export const getExecutiveProfile = async (executiveId) => {
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

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found.");
    err.statusCode = 404;
    err.errors = ["Executive not found."];
    throw err;
  }

  const executiveSubDetails = await ExecutiveSubscription.findOne({
    executiveId,
  });

  let lastSubscription = null;
  if (
    executiveSubDetails &&
    Array.isArray(executiveSubDetails.subscriptions) &&
    executiveSubDetails.subscriptions.length > 0
  ) {
    lastSubscription =
      executiveSubDetails.subscriptions[
      executiveSubDetails.subscriptions.length - 1
      ];
  }

  return {
    id: executive._id,
    username: executive.username,
    executiveId: executive.executiveId,
    phoneNumber: executive.phoneNumber,
    role: executive.role,
    buildingName: executive.buildingName,
    areaName: executive.areaName,
    city: executive.city,
    state: executive.state,
    pincode: executive.pincode,
    description: executive.description,
    profileImage: executive.profileImage,
    lastSubscription: lastSubscription,
  };
};

export const deleteExecutive = async (executiveId) => {
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

  const executive = await Executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    err.errors = ["Executive ID not found."];
    throw err;
  }

  const oldUrl = executive.profileImage;
  if (oldUrl) {
    const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `ExecutiveProfiles/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  await executive.deleteOne();

  return {
    id: executive._id,
  };
};

export const getAllExecutives = async ({ offset = 0, limit = 10 }) => {
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const totalExecutives = await Executive.countDocuments({});
  const executives = await Executive.find({})
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return {
    total: totalExecutives,
    offset: skip,
    limit: pageSize,
    executives: executives.map((executive) => ({
      id: executive._id,
      executiveId: executive.executiveId,
      username: executive.username,
      phoneNumber: executive.phoneNumber,
      role: executive.role,
      buildingName: executive.buildingName,
      areaName: executive.areaName,
      city: executive.city,
      state: executive.state,
      pincode: executive.pincode,
      description: executive.description,
      profileImage: executive.profileImage,
    })),
  };
};
