import * as services from "../../services/technician/services.js";

export const createServiceControl = async (req, res, next) => {
    const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const serviceData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const result = await services.createService(serviceData);
    res.status(201).json({
      success: true,
      message: "Services Created successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};

export const updateServiceControl = async (req, res, next) => {

      console.log("files", req.files)
    const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const serviceData = {
    ...req.body,
    files: filesMap,
  };

  console.log("req.body", req.body)

  try {
    const result = await services.updateService(serviceData);
  res.status(201).json({
      success: true,
      message: "Services Updated successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};



export const getServicesByTechIdControl = async (req, res, next) => {
  try {
    const {technicianId} = req.params;
    const result = await services.getServicesByTechId({technicianId});
    res.status(201).json({
      success: true,
      message: "Services By Techinicians fetched successfully.",
     result: result?.service,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteAllServicesControl = async (req, res, next) => {
  try {
    const {technicianId} = req.params;
    const result = await services.deleteAllServices(technicianId);
    res.status(201).json({
      success: true,
      message: "Services Deleted successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteServicesControl = async (req, res, next) => {
  try {
    const {serviceId} = req.params;
    console.log("serviceId", serviceId)
    const result = await services.deleteServicesById(serviceId);
    res.status(201).json({
      success: true,
      message: "Services Deleted successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};



