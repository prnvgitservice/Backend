import Pincodes from '../../models/adminPanelModels/pincodes.model.js';

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
