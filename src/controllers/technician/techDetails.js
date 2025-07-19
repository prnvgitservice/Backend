import * as techDetails from "../../services/technician/techDetails.js";

export const getTechAllDetailsCont = async (req, res, next) => {
  try {
    const {technicianId} = req.params;
    const result = await techDetails.getTechAllDetails(technicianId);
    res.status(201).json({
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
    const result = await techDetails.getAllTechniciansByCateId(categoryId);
    res.status(201).json({
      success: true,
      message: "Technicians fetched by category successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};

export const getAllTechByAddCont = async (req, res, next) => {
  try {
console.log("hitting")
    const result = await techDetails.getAllTechByAdd(req.body);
    res.status(201).json({
      success: true,
      message: "Technicians fetched by category and address successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};