import { getCodeAndAreaNamesService, getAllPincodesService, createPincodeService, updatePincodeService, deletePincodeService  } from "../services/pincodes.service.js";

export const getPincodeAreaNames = async (req, res) => {
  try {
    const data = await getCodeAndAreaNamesService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pincode area names:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllPincodes = async (req, res) => {
  try {
    const data = await getAllPincodesService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pincodes", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createPincode = async (req, res) => {
  try {
    const pincodeData = req.body;
    console.log(pincodeData,"pincodeData")

    if (!pincodeData?.code || !pincodeData.areas?.length) {
      return res.status(400).json({ success: false, message: 'Pincode and areas are required' });
    }

    const result = await createPincodeService(pincodeData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating pincode:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updatePincode = async (req, res) => {
  try {
    const result = await updatePincodeService(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating pincode:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePincode = async (req, res) => {
  try {
    const result = await deletePincodeService(req.body);
    res.status(200).json({ success: true, message: 'Pincode deleted', data: result });
  } catch (error) {
    console.error('Error deleting pincode:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};