import * as technician from "../../services/authServices/technician.js";
import { generateToken } from "../../utils/generateToken.js";


const generatedSequrityCodes = new Set();

const generateSequrityCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sequrityCode;
  let numberOfNumbers = 0;
  do {
    sequrityCode = 'PRNV-';
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
     console.log("result", result)
    res.status(201).json({
      success: true,
      message: "Technician Registered successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};

export const loginTechnicianController = async (req, res, next) => {
  try {
    const result = await technician.loginTechnician(req.body);
    res.json({
      success: true,
      message: "Technician Login successfully.",
      result,
    });

  } catch (err) {
    next(err);
  }
};