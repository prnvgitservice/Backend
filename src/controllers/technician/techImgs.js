import * as techImgs from "../../services/technician/techImgs.js";

export const createTechImagesControl = async (req, res, next) => {
    const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const techImgData = {
    ...req.body,
    files: filesMap,
  };


  try {
    const result = await techImgs.createTechImages(techImgData);
    res.status(201).json({
      success: true,
      message: "Technician Images Created successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};

export const getTechImagesByTechIdControl = async (req, res, next) => {
  try {
    const {technicianId} = req.params;

    const result = await techImgs.getTechImagesByTechId(technicianId);
    res.status(201).json({
      success: true,
      message: "Technician Images fetched successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};
export const deleteAllImgsByTechnId = async (req, res, next) => {
  try {
    const {technicianId} = req.params;
    const result = await techImgs.deleteAllTechnicianImages(technicianId);
    res.status(201).json({
      success: true,
      message: "Technician Images deleted successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteSingleTechnicianImageControl = async (req, res, next) => {
  try {

    const result = await techImgs.deleteSingleTechnicianImage(req.body);
    res.status(201).json({
      success: true,
      message: "Technician Image deleted successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

