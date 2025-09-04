import express from "express";
import { getExecutiveAccountController } from "../../controllers/executive/executiveAccount.js";

const router = express.Router();

router.get("/:executiveId", getExecutiveAccountController);

export default router;