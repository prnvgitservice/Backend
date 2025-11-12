// routes/versionRoutes.js
import express from "express";
import {
  createVersionController,
  getAllVersionsController,
  getVersionByIdController,
  updateVersionController,
  deleteVersionController,
} from "../controllers/appVersion.js";

const router = express.Router();

router.post("/create", createVersionController);
router.get("/getAll", getAllVersionsController);
router.get("/get/:id", getVersionByIdController);
router.put("/update", updateVersionController);
router.delete("/delete/:id", deleteVersionController);

export default router;
