import Pincodes from '../models/pincodes.model.js';

export const getCodeAndAreaNamesService = async () => {
  try {
    const result = await Pincodes.aggregate([
      { $unwind: "$areas" },
      { $unwind: "$areas.subAreas" },
      {
        $project: {
          _id: 0,
          code: 1,
          area: "$areas.name",
          subArea: "$areas.subAreas.name"
        }
      }
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getAllPincodesService = async () => {
    try{
        const result = await Pincodes.find();
        return result;
    } catch (error) {
        throw error;
    }
};

export const createPincodeService = async (pincodeData) => {
  try {
    // Check if pincode already exists
    const existing = await Pincode.findOne({ code: pincodeData.code });
    if (existing) {
      throw new Error(`Pincode ${pincodeData.code} already exists`);
    }

    const newPincode = new Pincode(pincodeData);
    const saved = await newPincode.save();
    return saved;
  } catch (error) {
    throw error;
  }
};

export const updatePincodeService = async (code, updatedData) => {
  try {
    const existing = await Pincode.findOne({ code });
    if (!existing) {
      throw new Error(`Pincode ${code} not found`);
    }

    // Merge new data into existing document
    Object.assign(existing, updatedData);
    const saved = await existing.save();
    return saved;
  } catch (error) {
    throw error;
  }
};

export const deletePincodeService = async (code) => {
  try {
    const result = await Pincode.findOneAndDelete({ code });
    if (!result) {
      throw new Error(`Pincode with code ${code} not found`);
    }
    return result;
  } catch (error) {
    throw error;
  }
};