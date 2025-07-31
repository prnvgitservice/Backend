import { Router } from "express";
import {
  login,
  register,
  getProfile,
  editProfile,
  getAllUsersController,
  deleteUserByIdController,
} from "../../controllers/authControllers/user.js";
import { uploadWithValidation } from "../../middleware/uploads.js";
import { adminMiddleware, requireSignIn } from "../../utils/generateToken.js";

const router = Router();

router.post("/register", register);
router.post("/registerUserByAdmin", register);
router.post("/login", login);
router.get("/profile/:id", getProfile);
router.put("/editProfile", uploadWithValidation, editProfile);
router.get("/getAllUsers", uploadWithValidation, getAllUsersController);
router.delete("/deleteUserById/:userId", deleteUserByIdController);
router.delete(
  "/deleteUserByAdmin/:userId",
  // requireSignIn,
  // adminMiddleware,
  deleteUserByIdController
);

export default router;
