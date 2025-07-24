import * as franchise from "../../services/authServices/franchise.js";

const generatedSequrityCodes = new Set();

const generateSequrityCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sequrityCode;
  let numberOfNumbers = 0;
  do {
    sequrityCode = 'PRNV-F';
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

export const registerFranchiseController = async (req, res, next) => {
  try {
     const franchiseData = {
      ...req.body,
      franchiseId: generateSequrityCode(),
    };
    const result = await franchise.registerFranchise(franchiseData);
    res.status(201).json({
      success: true,
      message: "Franchise Registered successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};

export const loginFranchiseController = async (req, res, next) => {
  try {
    const result = await franchise.loginFranchise(req.body);
    res.status(201).json({
      success: true,
      message: "Franchise Login successfully.",
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