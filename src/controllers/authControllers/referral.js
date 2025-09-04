import { getTReferralsByExeId, registerReferral, registerReferralByExecutive } from "../../services/authServices/referral.js";

const generatedSequrityCodes = new Set();

const generateSequrityCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sequrityCode;
  let numberOfNumbers = 0;
  do {
    sequrityCode = "PRNV-R";
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

export const registerRefByExeController = async (
  req,
  res,
  next
) => {
  try {
    const referralData = {
      ...req.body,
      referralId: generateSequrityCode(),
    };
    const result = await registerReferralByExecutive(
      referralData
    );
    res.status(201).json({
      success: true,
      message: "Referral Registered By Executive successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const registerReferralController = async (req, res, next) => {
  try {
    const referralData = {
      ...req.body,
      referralId: generateSequrityCode(),
    };
    const result = await registerReferral(referralData);
    res.status(201).json({
      success: true,
      message: "Referral Registered successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

// export const registerTechnicianController = async (req, res, next) => {
//   try {
//     const technicianData = {
//       ...req.body,
//       userId: generateSequrityCode(),
//     };
//     const result = await technician.registerTechnicianByAdmin(technicianData);
//     res.status(201).json({
//       success: true,
//       message: "Technician Registered successfully.",
//       result,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const loginReferralController = async (req, res, next) => {
  try {
    const result = await loginReferral(req.body);
    res.status(201).json({
      success: true,
      message: "Referral Login successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getReferralsByExeIdCont = async (
  req,
  res,
  next
) => {
  try {
    const { executiveId } = req.params;
    const result = await getTReferralsByExeId(
      executiveId
    );
    res.status(201).json({
      success: true,
      message: "Referrals fetched by Executive successfully.",
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


export const getAllTechnicianController = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;
    const result = await technician.getAllTechnicians({ offset, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const deleteTechnicianByIdController = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const result = await technician.deleteTechnicianById(technicianId);
    res.status(200).json({
      success: true,
      message: "Technician Deleted Successfully",
      result,
    });
  } catch (err) {
    next(err);
  }
};
