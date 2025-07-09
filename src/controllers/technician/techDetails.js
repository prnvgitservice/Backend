import * as techDetails from "../../services/technician/techDetails.js";

export const getTechAllDetailsCont = async (req, res, next) => {
  try {
    const {technicianId} = req.params;

    console.log("technicianIdtechnicianId", technicianId)
    const result = await techDetails.getTechAllDetails(technicianId);
    res.json({
      success: true,
      message: "Technician Images fetched successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};
export const getAllTechniciansByCateIdCont = async (req, res, next) => {
  try {
    const {categoryId} = req.params;

    console.log("technicianIdtechnicianId", categoryId)
    const result = await techDetails.getAllTechniciansByCateId(categoryId);
    res.json({
      success: true,
      message: "Technician Images fetched successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};