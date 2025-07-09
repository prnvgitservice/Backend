import getInTouch from "../../models/authModels/getInTouch";

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


  const technician = new Guest({
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