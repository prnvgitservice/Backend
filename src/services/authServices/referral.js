import executive from "../../models/authModels/executive.js";
import referral from "../../models/authModels/referral.js";
import executiveAccount from "../../models/executive/executiveAccount.js";

export const registerReferralByExecutive = async ({
  executiveId,
  referralId,
  referralName,
  phoneNumber,
  password,
  buildingName,
  areaName,
  city,
  state,
  pincode,
  bankName,
  accountNumber,
  ifscCode,
  branchName,
}) => {
  const errors = [];

  if (
    !executiveId ||
    !referralId ||
    !referralName ||
    !phoneNumber ||
    !password ||
    !buildingName ||
    !areaName ||
    !city ||
    !state ||
    !pincode ||
    !bankName ||
    !accountNumber ||
    !ifscCode ||
    !branchName
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

  const phoneExists = await referral.findOne({ phoneNumber });
  if (phoneExists) {
    // errors.push("Phone number already exists.");
    const err = new Error("Referral with this phone number already exists");
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(executiveId)) {
    const err = new Error("Invalid Executive ID format.");
    err.statusCode = 400;
    err.errors = ["Provided Executive ID is not valid."];
    throw err;
  }

  const executive = await executive.findById(executiveId);
  if (!executive) {
    const err = new Error("Executive not found");
    err.statusCode = 404;
    err.errors = ["Executive ID not found."];
    throw err;
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const referral = new Referral({
    executiveId,
    referralId,
    referralName,
    phoneNumber,
    password,
    buildingName,
    areaName,
    city,
    state,
    pincode,
    bankName,
    accountNumber,
    ifscCode,
    branchName,
  });

  await referral.save();
  return {
    id: referral._id,
    executiveId: referral.executiveId,
    referralId: referral.referralId,
    referralName: referral.referralName,
    phoneNumber: referral.phoneNumber,
    buildingName: referral.buildingName,
    areaName: referral.areaName,
    city: referral.city,
    state: referral.state,
    pincode: referral.pincode,
    bankName : referral.bankName,
    accountNumber: referral.accountNumber,
    ifscCode: referral.ifscCode,
    branchName: referral.branchName,
    executiveAccount: executiveAccount.newAccountDetails,
  };
};

export const registerReferral = async ({
  referralId,
  referralName,
  phoneNumber,
  password,
  buildingName,
  areaName,
  city,
  state,
  pincode,
  bankName,
  accountNumber,
  ifscCode,
  branchName,
}) => {
  const errors = [];

  if (
    !referralId ||
    !referralName ||
    !phoneNumber ||
    !password ||
    !buildingName ||
    !areaName ||
    !city ||
    !state ||
    !pincode ||
    !bankName ||
    !accountNumber ||
    !ifscCode ||
    !branchName
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

  const phoneExists = await Referral.findOne({ phoneNumber });
  if (phoneExists) {
    errors.push("Phone number already exists.");
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = errors;
    throw err;
  }

  const referral = new Referral({
    referralId,
    referralName,
    phoneNumber,
    password,
    buildingName,
    areaName,
    city,
    state,
    pincode,
    bankName,
    accountNumber,
    ifscCode,
    branchName,
  });
  await referral.save();
};

export const loginReferral = async ({ phoneNumber, password }) => {
  if (!phoneNumber || !password) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Phone number and password are required."];
    throw err;
  }

  const errors = [];

  const referral = await Referral.findOne({ phoneNumber }).select("+password");
  if (!referral) {
    errors.push("Referral not found with this phone number.");
  }

  let isMatch = false;
  if (referral) {
    isMatch = await referral.isPasswordMatch(password);
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

  const token = generateToken(referral);

  return {
    id: referral._id,
    referralId: referral.referralId,
    referralName: referral.referralName,
    phoneNumber: referral.phoneNumber,
    buildingName: referral.buildingName,
    areaName: referral.areaName,
    city: referral.city,
    state: referral.state,
    pincode: referral.pincode,
    bankName: referral.bankName,
    accountNumber: referral.accountNumber,
    ifscCode: referral.ifscCode,
    branchName: referral.branchName,
    token,
  };
};

// export const registerReferralByAdmin = async ({
//   userId,
//   username,
//   phoneNumber,
//   password,
//   role = "technician",
//   category,
//   buildingName,
//   areaName,
//   subAreaName,
//   city,
//   state,
//   pincode,
//   franchiseId,
//   subscriptionId,
// }) => {
//   const errors = [];

//   if (
//     !userId ||
//     !username ||
//     !phoneNumber ||
//     !password ||
//     !buildingName ||
//     !areaName ||
//     !role ||
//     !category ||
//     !city ||
//     !state ||
//     !pincode ||
//     !subscriptionId
//   ) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["All Fields Required."];
//     throw err;
//   }

//   if (!/^\d{10}$/.test(phoneNumber)) {
//     errors.push("Phone number must be exactly 10 digits.");
//   }

//   if (password?.length < 6 || password?.length > 20) {
//     errors.push("Password must be between 6 and 20 characters.");
//   }

//   const phoneExists = await Technician.findOne({ phoneNumber });
//   if (phoneExists) {
//     errors.push("Phone number already exists.");
//   }

//   if (franchiseId) {
//     if (!mongoose.Types.ObjectId.isValid(franchiseId)) {
//       const err = new Error("Invalid Franchise ID format.");
//       err.statusCode = 400;
//       err.errors = ["Provided Franchise ID is not valid."];
//       throw err;
//     }

//     const franchise = await Franchise.findById(franchiseId);
//     if (!franchise) {
//       const err = new Error("Franchise not found");
//       err.statusCode = 404;
//       err.errors = ["Franchise ID not found."];
//       throw err;
//     }
//   }

//   if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
//     const err = new Error("Invalid Subscription ID format.");
//     err.statusCode = 400;
//     err.errors = ["Provided Subscription ID is not valid."];
//     throw err;
//   }

//   const subscription = await SubscriptionPlan.findById(subscriptionId);
//   if (!subscription) {
//     const err = new Error("Subscription not found");
//     err.statusCode = 404;
//     err.errors = ["Subscription ID not found."];
//     throw err;
//   }

//   let caregoryServices = [];
//   if (category) {
//     caregoryServices = await getServicesByTechId({ categoryId: category });
//   }

//   if (errors.length > 0) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = errors;
//     throw err;
//   }

//   const technician = new Technician({
//     franchiseId: franchiseId || null,
//     userId,
//     username,
//     phoneNumber,
//     password,
//     role,
//     category,
//     buildingName,
//     areaName,
//     subAreaName,
//     city,
//     state,
//     pincode,
//     admin: true,
//   });

//   if (caregoryServices?.service?.length > 0) {
//     technician.categoryServices = caregoryServices.service.map((srv) => ({
//       categoryServiceId: srv._id,
//       status: true,
//     }));
//   }

//   await technician.save();

//   let result = null;
//   if (subscription) {
//     result = await addTechSubscriptionPlan({
//       technicianId: technician._id,
//       subscriptionId: subscription._id,
//     });
//   }

//   let franhiseAccount = null;
//   if (result && franchiseId) {
//     franhiseAccount = await addFranchiseAccount({
//       franchiseId,
//       technicianId: technician._id.toString(),
//       subscriptionId,
//     });
//   }

//   return {
//     id: technician._id,
//     franchiseId: technician.franchiseId,
//     userId: technician.userId,
//     username: technician.username,
//     phoneNumber: technician.phoneNumber,
//     role: technician.role,
//     category: technician.category,
//     buildingName: technician.buildingName,
//     areaName: technician.areaName,
//     subAreaName: technician.subAreaName,
//     city: technician.city,
//     state: technician.state,
//     pincode: technician.pincode,
//     admin: technician.admin,
//     plan: subscription?._id || null,
//     categoryServices: technician.categoryServices,
//     result: result?.subscription || null,
//     franhiseAccount: franhiseAccount?.newAccountDetails || null,
//   };
// };

export const getTReferralsByExeId = async (executiveId) => {
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

  const referrals = await Referral.find({ executiveId });

  if (!referrals || referrals.length === 0) {
    const err = new Error("No referrals found for this executive.");
    err.statusCode = 404;
    err.errors = ["No referrals associated with this Executive ID."];
    throw err;
  }

  return {
    id: referral._id,
    referralId: referral.referralId,
    referralName: referral.referralName,
    phoneNumber: referral.phoneNumber,
    buildingName: referral.buildingName,
    areaName: referral.areaName,
    city: referral.city,
    state: referral.state,
    pincode: referral.pincode,
    bankName: referral.bankName,
    accountNumber: referral.accountNumber,
    ifscCode: referral.ifscCode,
    branchName: referral.branchName,
    profileImage: referral.profileImage,
  };
};

// export const updateTechnician = async ({
//   technicianId,
//   username,
//   password,
//   buildingName,
//   areaName,
//   subAreaName,
//   city,
//   state,
//   pincode,
//   description,
//   service,
//   files,
// }) => {
//   const errors = [];
//   if (!technicianId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["technicianId are required."];
//     throw err;
//   }

//   if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//     const err = new Error("Technician ID format.");
//     err.statusCode = 400;
//     err.errors = ["Provided Technician ID is not valid."];
//     throw err;
//   }

//   const technician = await Technician.findById(technicianId);
//   if (!technician) {
//     const err = new Error("Technician not found");
//     err.statusCode = 404;
//     err.errors = ["Technician ID Not Found."];
//     throw err;
//   }

//   if (files.profileImage?.[0]) {
//     const filePath = files.profileImage[0].path;

//     const oldUrl = technician.profileImage;
//     if (oldUrl) {
//       const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
//       const publicId = match ? `TechProfiles/${match[1]}` : null;
//       if (publicId) {
//         await cloudinary.uploader.destroy(publicId);
//       }
//     }

//     const uploadResult = await cloudinary.uploader.upload(filePath, {
//       folder: "TechProfiles",
//     });
//     fs.unlinkSync(filePath);

//     technician.profileImage = uploadResult.secure_url;
//   }

//   if (username) technician.username = username;
//   if (password) technician.password = password;
//   if (buildingName) technician.buildingName = buildingName;
//   if (areaName) technician.areaName = areaName;
//   if (subAreaName) technician.subAreaName = subAreaName;
//   if (city) technician.city = city;
//   if (state) technician.state = state;
//   if (pincode) technician.pincode = pincode;
//   if (service) technician.service = service;
//   if (description) technician.description = description;

//   await technician.save();

//   if (errors.length > 0) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = errors;
//     throw err;
//   }

//   return {
//     id: technician._id,
//     username: technician.username,
//     userId: technician.userId,
//     phoneNumber: technician.phoneNumber,
//     role: technician.role,
//     category: technician.category,
//     buildingName: technician.buildingName,
//     areaName: technician.areaName,
//     subAreaName: technician.subAreaName,
//     city: technician.city,
//     state: technician.state,
//     pincode: technician.pincode,
//     description: technician.description,
//     service: technician.service,
//     profileImage: technician.profileImage,
//   };
// };

// export const getTechnicianProfile = async (technicianId) => {
//   if (!technicianId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["Technician ID is required."];
//     throw err;
//   }

//   if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//     const err = new Error("Invalid Technician ID format.");
//     err.statusCode = 400;
//     err.errors = ["Provided Technician ID is not valid."];
//     throw err;
//   }

//   const technician = await Technician.findById(technicianId);
//   if (!technician) {
//     const err = new Error("Technician not found.");
//     err.statusCode = 404;
//     err.errors = ["Technician not found."];
//     throw err;
//   }

//   const techSubDetails = await TechSubscriptionsDetail.findOne({
//     technicianId,
//   });

//   let lastSubscription = null;
//   if (
//     techSubDetails &&
//     Array.isArray(techSubDetails.subscriptions) &&
//     techSubDetails.subscriptions.length > 0
//   ) {
//     lastSubscription =
//       techSubDetails.subscriptions[techSubDetails.subscriptions.length - 1];
//   }

//   return {
//     id: technician._id,
//     franchiseId: technician.franchiseId,
//     username: technician.username,
//     userId: technician.userId,
//     phoneNumber: technician.phoneNumber,
//     role: technician.role,
//     category: technician.category,
//     buildingName: technician.buildingName,
//     areaName: technician.areaName,
//     subAreaName: technician.subAreaName,
//     city: technician.city,
//     state: technician.state,
//     pincode: technician.pincode,
//     description: technician.description,
//     service: technician.service,
//     profileImage: technician.profileImage,
//     subscription: lastSubscription || null,
//     admin: technician.admin,
//     categoryServices: technician.categoryServices,
//   };
// };

// export const getAllTechnicians = async ({ offset = 0, limit = 10 }) => {
//   const skip = parseInt(offset, 10);
//   const pageSize = parseInt(limit, 10);

//   if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
//     const err = new Error("Invalid pagination parameters");
//     err.statusCode = 400;
//     err.errors = ["Offset and limit must be valid positive integers"];
//     throw err;
//   }

//   const totalTechnicians = await Technician.countDocuments({});
//   const technicians = await Technician.find({})
//     .skip(skip)
//     .limit(pageSize)
//     .sort({ createdAt: -1 });

//   return {
//     total: totalTechnicians,
//     offset: skip,
//     limit: pageSize,
//     technicians: technicians.map((technician) => ({
//       id: technician._id,
//       username: technician.username,
//       phoneNumber: technician.phoneNumber,
//       role: technician.role,
//       buildingName: technician.buildingName,
//       areaName: technician.areaName,
//       subAreaName: technician.subAreaName,
//       city: technician.city,
//       state: technician.state,
//       pincode: technician.pincode,
//       profileImage: technician.profileImage,
//       admin: technician.admin,
//       categoryServices: technician.categoryServices,
//     })),
//   };
// };

// export const deleteTechnicianById = async (technicianId) => {
//   if (!technicianId) {
//     const err = new Error("Validation failed");
//     err.statusCode = 401;
//     err.errors = ["Technician ID is required."];
//     throw err;
//   }

//   if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//     const err = new Error("Invalid Technician ID format.");
//     err.statusCode = 400;
//     err.errors = ["Provided Technician ID is not valid."];
//     throw err;
//   }

//   const technician = await Technician.findById(technicianId);
//   if (!technician) {
//     const err = new Error("Technician not found.");
//     err.statusCode = 404;
//     err.errors = ["Technician not found."];
//     throw err;
//   }

//   if (technician.profileImage) {
//     const match = technician.profileImage.match(/\/([^/]+)\.[a-z]+$/i);
//     const publicId = match ? `TechProfiles/${match[1]}` : null;
//     if (publicId) {
//       await cloudinary.uploader.destroy(publicId);
//     }
//   }

//   await Technician.findByIdAndDelete(technicianId);

//   return {
//     id: technicianId,
//   };
// };
