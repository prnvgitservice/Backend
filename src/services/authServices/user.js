import User from "../../models/authModels/user.js";
import { generateToken } from "../../utils/generateToken.js";

export const register = async ({ username, phoneNumber, password, role = 'user', category, buildingName, areaName, city, state, pincode  }) => {

  if (!username || !phoneNumber || !password || !buildingName || !areaName || !city || !state || !pincode) {
    throw new Error("All fields are required.");
  }


  if (!['user', 'technician'].includes(role)) {
    throw new Error("Role must be either 'user' or 'technician'.");
  }


  if (role === 'technician' && !category) {
    throw new Error("Category is required for technicians.");
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new Error("Username already exists.");
  }

  const phoneExists = await User.findOne({ phoneNumber });
  if (phoneExists) {
    throw new Error("Phone number already exists.");
  }
   
  const user = new User({ username, phoneNumber, password, role, category, buildingName, areaName, city, state, pincode });
  await user.save();
    
  const returnData = {
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
  
 
  return returnData;
};

export const login = async ({ username, password }) => {

  if (!username || !password) {
    throw new Error("Username & Password are required.");
  }

  const user = await User.findOne({
    username
  }).select('+password');

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  return {id: user._id, username: user.username,
    token
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
    category: user.category,
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
