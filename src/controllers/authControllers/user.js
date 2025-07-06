import * as authService from "../../services/authServices/user.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
     console.log("result", result)
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
    res.json({
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
    res.json({
      success: true,
      message: "User profile fetched successfully.",
      user: result,
    });
  } catch (err) {

    next(err);
  }
};

export const editProfile = async (req, res, next) => {
  try {
    const userId = req.params.id; 
    const result = await authService.editProfile(userId, req.body);
    res.json({
      success: true,
      message: req.body.newPassword ? "Password updated successfully." : "User profile updated successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};