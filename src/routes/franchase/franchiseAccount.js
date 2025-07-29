import express from "express";
import {
  getFranchiseAccountCont,
  getFranchiseAccountValuesCont,
} from "../../controllers/franchase/franchiseAccount.js";

const router = express.Router();

router.get("/getFranchiseAccount/:franchiseId", getFranchiseAccountCont);
router.get(
  "/getFranchiseAccountValues/:franchiseId",
  getFranchiseAccountValuesCont
);

export default router;
