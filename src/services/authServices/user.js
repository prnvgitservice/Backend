import User from "../../models/authModels/user.js";
import { generateToken } from "../../utils/generateToken.js";
import mongoose from "mongoose";

export const register = async ({
  username,
  phoneNumber,
  password,
  role = "user",
  buildingName,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
}) => {
  const errors = [];

  if (
    !username ||
    !phoneNumber ||
    !password ||
    !buildingName ||
    !areaName ||
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

  const phoneExists = await User.findOne({ phoneNumber });
  if (phoneExists) {
    errors.push("Phone number already exists.");
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const user = new User({
    username,
    phoneNumber,
    password,
    role,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
  });

  await user.save();

  return {
    id: user._id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    buildingName: user.buildingName,
    areaName: user.areaName,
    subAreaName: user.subAreaName,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
};

export const login = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }
  const errors = [];
  const user = await User.findOne({ phoneNumber }).select("+password");

  if (!user) {
    errors.push("User not found with this phone number.");
  }

  let isMatch = false;

  if (user) {
    isMatch = await user.isPasswordMatch(password);
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

  const token = generateToken(user);

  return {
    id: user._id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    category: user.category,
    buildingName: user.buildingName,
    areaName: user.areaName,
    subAreaName: user.subAreaName,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    token,
  };
};

export const getProfile = async (userId) => {
  if (!userId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["User ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid User ID format.");
    err.statusCode = 400;
    err.errors = ["Provided user ID is not valid."];
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.errors = ["User not found."];
    throw err;
  }

  return {
    id: user._id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    buildingName: user.buildingName,
    areaName: user.areaName,
    subAreaName: user.subAreaName,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
};

export const editProfile = async (updateData) => {
  const errors = [];
  const {
    id,
    username,
    password,
    buildingName,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
    phoneNumber,
    role,
    files,
  } = updateData;

  if (phoneNumber) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number can't be updated."];
    throw err;
  }

  if (role) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Role can't be updated."];
    throw err;
  }

  if (!id) {
    const err = new Error("ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  if (username && typeof username !== "string") {
    errors.push("Username must be a string.");
  }

  if (password && (password.length < 6 || password.length > 20)) {
    errors.push("Password must be between 6 and 20 characters.");
  }

  if (files?.profileImage?.[0]) {
    const filePath = files.profileImage[0].path;

    const oldUrl = user.profileImage;
    if (oldUrl) {
      const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `UserProfiles/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "UserProfiles",
    });
    fs.unlinkSync(filePath);

    user.profileImage = uploadResult.secure_url;
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }

  if (username) user.username = username;
  if (password) user.password = password;
  if (buildingName) user.buildingName = buildingName;
  if (areaName) user.areaName = areaName;
  if (subAreaName) user.subAreaName = subAreaName;
  if (city) user.city = city;
  if (state) user.state = state;
  if (pincode) user.pincode = pincode;

  await user.save();

  return {
    id: user._id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    buildingName: user.buildingName,
    areaName: user.areaName,
    subAreaName: user.subAreaName,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    profileImage: user.profileImage,
  };
};


export const getAllUsers = async ({ offset = 0, limit = 10 }) => {
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const totalUsers = await User.countDocuments({});
  const users = await User.find({})
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return {
    total: totalUsers,
    offset: skip,
    limit: pageSize,
    users: users.map((user) => ({
      id: user._id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      role: user.role,
      buildingName: user.buildingName,
      areaName: user.areaName,
      subAreaName: user.subAreaName,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      profileImage: user.profileImage,
    })),
  };
};

export const deleteUserById = async (userId) => {
  if (!userId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["User ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid User ID format.");
    err.statusCode = 400;
    err.errors = ["Provided User ID is not valid."];
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.errors = ["User not found."];
    throw err;
  }

  if (user.profileImage) {
    const match = user.profileImage.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `UserProfiles/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  await User.findByIdAndDelete(userId);

  return {
    id: userId,
  };
};