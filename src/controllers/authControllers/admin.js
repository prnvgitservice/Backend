import * as adminService from "../../services/authServices/admin.js";

export const adminRegisterCont = async (req, res, next) => {
  try {
    const result = await adminService.adminRegister(req.body);
    res.status(201).json({
      success: true,
      message: "Admin Registered successfully.",
      result,
    });
  } catch (err) {
   next(err);
  }
};

export const adminLoginCont = async (req, res, next) => {
  try {
    const result = await adminService.adminLogin(req.body);
    res.status(201).json({
      success: true,
      message: "Admin Login successfully.",
      result,
    });

  } catch (err) {
    next(err);
  }
};

export const getAdminProfileCont = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const result = await adminService.getAdminProfile(adminId);
    res.status(201).json({
      success: true,
      message: "Admin profile fetched successfully.",
      result,
    });
  } catch (err) {

    next(err);
  }
};

export const editAdminProfileCont = async (req, res, next) => {
  try {
    const result = await adminService.editAdminProfile(req.body);
    res.status(201).json({
      success: true,
      message: req.body.newPassword ? "Password updated successfully." : "Admin profile updated successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};