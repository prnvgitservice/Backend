import express from "express";
import { getExecutiveAccountController, getExecutiveAccountValuesCont } from "../../controllers/executive/executiveAccount.js";

const router = express.Router();

router.get("/:executiveId", getExecutiveAccountController);
router.get(
  "/getExecutiveAccountValues/:executiveId",
  getExecutiveAccountValuesCont
);

export default router;