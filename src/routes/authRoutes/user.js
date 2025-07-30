import { Router } from "express";
import {
  login,
  register,
  getProfile,
  editProfile,
  getAllUsersController,
} from "../../controllers/authControllers/user.js";
import { uploadWithValidation } from "../../middleware/uploads.js";

const router = Router();

router.post("/register", register);
router.post("/registerUserByAdmin", register);
router.post("/login", login);
router.get("/profile/:id", getProfile);
router.put("/editProfile", uploadWithValidation, editProfile);
router.get("/getAllUsers", uploadWithValidation, getAllUsersController);

export default router;
