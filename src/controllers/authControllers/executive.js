import { loginExecutive, registerExecutive } from "../../services/authServices/executive.js";


const generatedSequrityCodes = new Set();

const generateSequrityCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sequrityCode;
  let numberOfNumbers = 0;
  do {
    sequrityCode = 'PRNV-E';
    numberOfNumbers = 0;
    for (let i = 0; i < 5; i++) {
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

export const registerExecutiveController = async (req, res, next) => {
  try {
     const executiveData = {
      ...req.body,
      executiveId: generateSequrityCode(),
    };
    const result = await registerExecutive(executiveData);
    res.status(201).json({
      success: true,
      message: "Executive Registered successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};

export const loginExecutiveController = async (req, res, next) => {
  try {
    const result = await loginExecutive(req.body);
    res.status(201).json({
      success: true,
      message: "Executive Login successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateFranchiseControl = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const franchiseData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const result = await franchise.updateFranchise(franchiseData);
    res.status(201).json({
      success: true,
      message: "Franchise profile updated successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};


export const getFranchiseProfileControl = async (req, res, next) => {
  try {
    const {franchiseId} = req.params;

    const result = await franchise.getFranchiseProfile(franchiseId);
    res.status(201).json({
      success: true,
      message: "Franchise profile fetched successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};

export const deleteFranchiseProfileControl = async (req, res, next) => {
  try {
    const {franchiseId} = req.params;

    const result = await franchise.deleteFranchise(franchiseId);
    res.status(201).json({
      success: true,
      message: "Franchise Profile Deleted Successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};

export const getAllFranchisesController = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;
    const result = await franchise.getAllFranchises({ offset, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
