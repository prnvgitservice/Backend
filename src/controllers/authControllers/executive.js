import { deleteExecutive, getAllExecutives, getExecutiveProfile, loginExecutive, registerExecutive, updateExecutive } from "../../services/authServices/executive.js";


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

export const getExecutiveProfileControl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getExecutiveProfile(id);
    res.status(200).json({
      success: true,
      message: "Executive profile fetched successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateExecutiveControl = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const executiveData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const result = await updateExecutive(executiveData);
    res.status(201).json({
      success: true,
      message: "Executive profile updated successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

// export const updateExecutiveControl = async (req, res, next) => {
//   try {
//     const filesMap = (req.files || []).reduce((acc, file) => {
//       acc[file.fieldname] = [...(acc[file.fieldname] || []), file];
//       return acc;
//     }, {});

//     const result = await updateExecutive({
//       id: req.params.id,
//       ...req.body,
//       files: filesMap,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Executive profile updated successfully",
//       result
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const getAllExecutivesController = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;
    const result = await getAllExecutives({ offset, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};


export const deleteExecutiveProfileControl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await deleteExecutive(id);
    res.status(201).json({
      success: true,
      message: "Executive Profile Deleted Successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};

