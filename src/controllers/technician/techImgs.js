import * as techImgs from "../../services/technician/techImgs.js";

export const createTechImagesControl = async (req, res, next) => {

      console.log("files", req.files)
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

  console.log("req.body", req.body)

  try {
    const result = await techImgs.createTechImages(techImgData);
    res.json({
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

    console.log("technicianIdtechnicianId", technicianId)
    const result = await techImgs.getTechImagesByTechId(technicianId);
    res.json({
      success: true,
      message: "Technician Images fetched successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};