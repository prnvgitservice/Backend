import Technician from '../../models/authModels/technician.js'
import { generateToken } from '../../utils/generateToken.js';

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
}
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
  };
};

