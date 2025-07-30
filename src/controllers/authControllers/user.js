import * as authService from "../../services/authServices/user.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User Registered successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(201).json({
      success: true,
      message: "User Login successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await authService.getProfile(userId);
    res.status(201).json({
      success: true,
      message: "User profile fetched successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const editProfile = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const userData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const result = await authService.editProfile(userData);
    res.status(201).json({
      success: true,
      message: req.body.newPassword
        ? "Password updated successfully."
        : "User profile updated successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersController = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;
    const result = await authService.getAllUsers({ offset, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
