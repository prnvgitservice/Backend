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


 export const editProfile = async (userId, updateData) => {
  const errors = [];

  const {
    id,
    username,
    password,
    buildingName,
    areaName,
    city,
    state,
    pincode,
    phoneNumber,
    role, 
  } = updateData;
 if (phoneNumber || role) 
     {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number cant be Updated."];
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

  if (password) {
    if (password.length < 6 || password.length > 20) {
      errors.push("Password must be between 6 and 20 characters.");
    }
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
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
};
