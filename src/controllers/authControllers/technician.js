import * as technician from "../../services/authServices/technician.js";
import { generateToken } from "../../utils/generateToken.js";

const generatedSequrityCodes = new Set();

const generateSequrityCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sequrityCode;
  let numberOfNumbers = 0;
  do {
    sequrityCode = "PRNV-";
    numberOfNumbers = 0;
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomChar = characters[randomIndex];
      if (/\d/.test(randomChar)) {
        numberOfNumbers++;
      }
      sequrityCode += randomChar;
    }
  } while (generatedSequrityCodes.has(sequrityCode) || numberOfNumbers < 3);
  generatedSequrityCodes.add(sequrityCode);
  return sequrityCode;
};

export const registerTechnicianController = async (req, res, next) => {
  try {
    const technicianData = {
      ...req.body,
      userId: generateSequrityCode(),
    };
    const result = await technician.registerTechnician(technicianData);
    res.status(201).json({
      success: true,
      message: "Technician Registered successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};
export const registerTechnicianByFranchaiseController = async (
  req,
  res,
  next
) => {
  try {
    const technicianData = {
      ...req.body,
      userId: generateSequrityCode(),
    };
    const result = await technician.registerTechnicianByFranchaise(
      technicianData
    );
    res.status(201).json({
      success: true,
      message: "Technician Registered By Franchaise successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const renewTechnicianByFranchaiseController = async (req, res, next) => {
  try {
    const result = await technician.renewTechnicianByFranchaise(req.body);
    res.status(201).json({
      success: true,
      message: "Technician Rwnewed By Franchaise successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const loginTechnicianController = async (req, res, next) => {
  try {
    const result = await technician.loginTechnician(req.body);
    res.status(201).json({
      success: true,
      message: "Technician Login successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTechnicianControl = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const technicianData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const result = await technician.updateTechnician(technicianData);
    res.status(201).json({
      success: true,
      message: "Technician profile updated successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getTechProfileControl = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const result = await technician.getTechnicianProfile(technicianId);
    res.status(201).json({
      success: true,
      message: "Technician profile fetched successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getTechnicianProfilesByFranchiseIdCont = async (
  req,
  res,
  next
) => {
  try {
    const { franchiseId } = req.params;
    const result = await technician.getTechnicianProfilesByFranchiseId(
      franchiseId
    );
    res.status(201).json({
      success: true,
      message: "Technicians profile fetched by Franchise successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};
