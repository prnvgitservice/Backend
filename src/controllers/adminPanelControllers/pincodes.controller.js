import { getCodeAndAreaNamesService, getAllPincodesService, createPincodeService, updatePincodeService, deletePincodeService  } from "../../services/adminPanelServices/pincodes.service.js";

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

    if (!pincodeData.code || !pincodeData.areas?.length) {
      return res.status(400).json({ success: false, message: 'Code and areas are required' });
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
    const { code } = req.params;
    const updatedData = req.body;

    if (!code || !updatedData) {
      return res.status(400).json({ success: false, message: 'Code and data required' });
    }

    const result = await updatePincodeService(code, updatedData);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating pincode:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePincode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Pincode code is required' });
    }

    const result = await deletePincodeService(code);
    res.status(200).json({ success: true, message: 'Pincode deleted', data: result });
  } catch (error) {
    console.error('Error deleting pincode:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};