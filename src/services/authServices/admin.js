import Admin from "../../models/authModels/admin.js";
import { generateToken } from "../../utils/generateToken.js";
import mongoose from 'mongoose';

export const adminRegister = async ({
  username,
  phoneNumber,
  password,
  role = 'admin',
}) => {
  const errors = [];

  if (
    !username ||
    !phoneNumber ||
    !password 
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

  const usernameExists = await Admin.findOne({ username });
  if (usernameExists) {
    errors.push("User Name already exists.");
  }
  const phoneExists = await Admin.findOne({ phoneNumber });
  if (phoneExists) {
    errors.push("Phone number already exists.");
  }

if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const admin = new Admin({
    username,
    phoneNumber,
    password,
    role,
  });

  await admin.save();

  return {
    id: admin._id,
    username: admin.username,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
  };
};

export const adminLogin = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) 
     {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }
   const errors = [];
  const admin = await Admin.findOne({ phoneNumber }).select('+password');

  if (!admin) {
    errors.push("Admin not found with this phone number.");
  }

    let isMatch = false;

     if (admin) {
    isMatch = await admin.isPasswordMatch(password);
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

  const token = generateToken(admin);

  return {
    id: admin._id,
    username: admin.username,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
    token,
  };
};

export const getAdminProfile = async (adminId) => {
  if (!adminId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Admin ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    const err = new Error("Invalid Admin ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Admin ID is not valid."];
    throw err;
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    const err = new Error("Admin not found.");
    err.statusCode = 404;
    err.errors = ["Admin not found."];
    throw err;
  }

  return {
    id: admin._id,
    username: admin.username,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
  };
};



 export const editAdminProfile = async (updateData) => {
  const errors = [];

  const {
    id,
    username,
    password,
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

  const admin = await Admin.findById(id);
  if (!admin) {
    const err = new Error("Admin not found.");
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

  if (username) admin.username = username;
  if (password) admin.password = password;

  await admin.save();

  return {
    id: admin._id,
    username: admin.username,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
  };
};
