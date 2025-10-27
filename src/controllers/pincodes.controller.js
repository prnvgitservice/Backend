// pincodes.controller.js
import { 
  getAllPincodesService, 
  getPincodeByCodeService, 
  createPincodeService, 
  updatePincodeService, 
  deletePincodeService 
} from "../services/pincodes.service.js";

export const getAllPincodes = async (req, res) => {
  try {
    const data = await getAllPincodesService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching all pincodes:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getPincodeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const data = await getPincodeByCodeService(code);
    if (!data) {
      return res.status(404).json({ success: false, message: "Pincode not found" });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pincode:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const createPincode = async (req, res) => {
  try {
    const pincodeData = req.body;

    if (!pincodeData?.code || !pincodeData.areas?.length) {
      return res.status(400).json({ success: false, message: 'Pincode code and areas are required' });
    }

    const result = await createPincodeService(pincodeData);
    if (result.notFound) {
      return res.status(404).json({ success: false, ...result });
    }
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('Error creating pincode:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updatePincode = async (req, res) => {
  try {
    const updateData = { ...req.body }; // Ensure code is included
    const result = await updatePincodeService(updateData);
    if (result.notFound) {
      return res.status(404).json({ success: false, ...result });
    }
    if (result.noChanges) {
      return res.status(200).json({ success: true, ...result });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error updating pincode:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const deletePincode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await deletePincodeService(code);
    if (result.notFound) {
      return res.status(404).json({ success: false, ...result });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error deleting pincode:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// import { getCodeAndAreaNamesService, getAllPincodesService, createPincodeService, updatePincodeService, deletePincodeService  } from "../services/pincodes.service.js";

// export const getPincodeAreaNames = async (req, res) => {
//   try {
//     const data = await getCodeAndAreaNamesService();
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching pincode area names:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// export const getAllPincodes = async (req, res) => {
//   try {
//     const data = await getAllPincodesService();
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching pincodes", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// export const createPincode = async (req, res) => {
//   try {
//     const pincodeData = req.body;
//     console.log(pincodeData,"pincodeData")

//     if (!pincodeData?.code || !pincodeData.areas?.length) {
//       return res.status(400).json({ success: false, message: 'Pincode and areas are required' });
//     }

//     const result = await createPincodeService(pincodeData);
//     res.status(201).json({ success: true, data: result });
//   } catch (error) {
//     console.error('Error creating pincode:', error.message);
//     res.status(500).json({ success: false, message: error.message || 'Server Error' });
//   }
// };

// export const updatePincode = async (req, res) => {
//   try {
//     const result = await updatePincodeService(req.body);
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     console.error('Error updating pincode:', error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deletePincode = async (req, res) => {
//   try {
//     const result = await deletePincodeService(req.body);
//     res.status(200).json({ success: true, message: 'Pincode deleted', data: result });
//   } catch (error) {
//     console.error('Error deleting pincode:', error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };