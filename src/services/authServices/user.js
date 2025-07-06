import User from "../../models/authModels/user.js";
import { generateToken } from "../../utils/generateToken.js";

export const register = async ({
  username,
  phoneNumber,
  password,
  role = 'user',
  buildingName,
  areaName,
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
  ) 
  {
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
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
};



export const login = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) 
     {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }
   const errors = [];
  const user = await User.findOne({ phoneNumber }).select('+password');

  if (!user) {
    errors.push("User not found with this phone number.");
  }
  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    errors.push("Invalid credentials.");
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
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    token,
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  return {
    id: user._id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    buildingName: user.buildingName,
    areaName: user.areaName,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
};



export const editProfile = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const { newPassword, confirmPassword, ...otherProfileData } = profileData;
  if (newPassword || confirmPassword) {
    if (!newPassword || !confirmPassword) {
      throw new Error("Both newPassword and confirmPassword are required to change password.");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirm password do not match.");
    }
    user.password = newPassword;
  }


  if (otherProfileData.role && !['user', 'technician'].includes(otherProfileData.role)) {
    throw new Error("Role must be either 'user' or 'technician'.");
  }


  if (otherProfileData.role === 'technician' && !otherProfileData.category) {
    throw new Error("Category is required for technicians.");
  }


  Object.assign(user, otherProfileData);
  await user.save();

  return {
    id: user._id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    category: user.category,
    buildingName: user.buildingName,
    areaName: user.areaName,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
};
