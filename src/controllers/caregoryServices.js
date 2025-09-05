import * as caregoryServices from "../services/caregoryServices.js";

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
    const result = await caregoryServices.createService(serviceData);
    res.status(201).json({
      success: true,
      message: "Category Services Created successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};

export const updateServiceControl = async (req, res, next) => {

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
    const result = await caregoryServices.updateService(serviceData);
  res.status(201).json({
      success: true,
      message: "Category Services Updated successfully.",
     result,
    });
  } catch (err) {

    next(err);
  }
};



export const getServicesByCateIdControl = async (req, res, next) => {
  try {
    const {categoryId} = req.params;
    const result = await caregoryServices.getServicesByCategoryId({categoryId});
    res.status(201).json({
      success: true,
      message: "Category Services By Techinicians fetched successfully.",
     result: result?.service,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteAllServicesControl = async (req, res, next) => {
  try {
    const {categoryId} = req.params;
    const result = await caregoryServices.deleteAllServices(categoryId);
    res.status(201).json({
      success: true,
      message: "Category Services Deleted successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteServicesControl = async (req, res, next) => {
  try {
    const {serviceId} = req.params;
    const result = await caregoryServices.deleteServicesById(serviceId);
    res.status(201).json({
      success: true,
      message: "Category Services Deleted successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};



