import * as technician from "../../services/authServices/technician.js";
import { generateToken } from "../../utils/generateToken.js";
import formidable from "formidable";

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

export const registerTechnicianController = async (req, res, next) => {
  try {
    // Initialize formidable with safe limits
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 3 * 1024 * 1024, // 3 MB per file
    });

    // Parse form-data (async/await wrapper)
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Convert formidable field arrays into plain key:value
    const parsedFields = {};
    for (const key in fields) {
      parsedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }

    // Map nested keys for authorized persons
    const mappedFields = { ...parsedFields };
    if (parsedFields["authorizedPersons[0][phone]"]) {
      mappedFields.authorized1Phone = parsedFields["authorizedPersons[0][phone]"];
    }
    if (parsedFields["authorizedPersons[1][phone]"]) {
      mappedFields.authorized2Phone = parsedFields["authorizedPersons[1][phone]"];
    }

    // Clean up unwanted nested keys
    delete mappedFields["authorizedPersons[0][phone]"];
    delete mappedFields["authorizedPersons[1][phone]"];

    // Prepare technician data
    const technicianData = {
      ...mappedFields,
      userId: generateSequrityCode(), 
      files,
    };


    // Call service to register technician
    const result = await technician.addTechnician(technicianData);

    // Success response
    res.status(201).json({
      success: true,
      message: "Technician registered successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const registerTechnicianByAdminController = async (req, res, next) => {
  try {
    // Initialize formidable with safe limits
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 3 * 1024 * 1024, // 3 MB per file
    });

    // Parse form-data (async/await wrapper)
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Convert formidable field arrays into plain key:value
    const parsedFields = {};
    for (const key in fields) {
      parsedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }

    // Map nested keys for authorized persons
    const mappedFields = { ...parsedFields };
    if (parsedFields["authorizedPersons[0][phone]"]) {
      mappedFields.authorized1Phone = parsedFields["authorizedPersons[0][phone]"];
    }
    if (parsedFields["authorizedPersons[1][phone]"]) {
      mappedFields.authorized2Phone = parsedFields["authorizedPersons[1][phone]"];
    }

    // Clean up unwanted nested keys
    delete mappedFields["authorizedPersons[0][phone]"];
    delete mappedFields["authorizedPersons[1][phone]"];

    // Prepare technician data
    const technicianData = {
      ...mappedFields,
      userId: generateSequrityCode(), // Generate a unique technician code
      files,
    };


    // Call service to register technician
    const result = await technician.registerTechnicianByAdmin(technicianData);

    // Success response
    res.status(201).json({
      success: true,
      message: "Technician registered By Admin successfully.",
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
export const registerTechnicianByExecutiveController = async (
  req,
  res,
  next
) => {
  try {
    const technicianData = {
      ...req.body,
      userId: generateSequrityCode(),
    };
    const result = await technician.registerTechnicianByExecutive(
      technicianData
    );
    res.status(201).json({
      success: true,
      message: "Technician Registered By Executive successfully.",
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
    res.status(200).json({
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

export const updateTechByAdminCon = async (req, res, next) => {
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
    const result = await technician.updateTechByAdmin(technicianData);
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
    res.status(200).json({
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
    res.status(200).json({
      success: true,
      message: "Technicians profile fetched by Franchise successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};
export const getTechnicianProfilesByExecutiveIdCont = async (
  req,
  res,
  next
) => {
  try {
    const { executiveId } = req.params;
    const result = await technician.getTechnicianProfilesByExecutiveId(
      executiveId
    );
    res.status(200).json({
      success: true,
      message: "Technicians profile fetched by Executive successfully.",
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

export const getAllTechRequestController = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;
    const result = await technician.getAllTechRequest({offset , limit});
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export const updateTechnicianStatusCont = async (req, res, next) => {
  const { technicianId, status } = req.params; // or req.body if you prefer
  try {
    const updated = await technician.updateTechnicianStatusService(technicianId, status);
    return res.status(200).json({
      success: true,
      message: `Technician status updated to "${updated.status}".`,
      data: updated,
    });
  } catch (err) {
    // ensure we propagate typed status codes if set in service
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
};


export const changeServiceStatusController = async (req, res, next) => {
  try {
    const result = await technician.changeServiceStatus(req.body);
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
