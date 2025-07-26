import express from "express";
import {
  activeAndInActiveFranchiseSubscriptionCont,
  addFranchiseSubscriptionCont,
  deleteFranchiseSubscriptionCont,
  getAllActiveFranchisePlansServiceCont,
  getFranchisePlanByIdCont,
  updateFranchiseSubscriptionCont,
} from "../../controllers/franchase/franchiseSubscriptions.js";

const router = express.Router();

router.post("/addFranchiseSubscription", addFranchiseSubscriptionCont);
router.get("/franchisePlans", getAllActiveFranchisePlansServiceCont);
router.get("/franchisePlan/:id", getFranchisePlanByIdCont);
router.put("/updateFranchiseSubscription", updateFranchiseSubscriptionCont);
router.delete(
  "/deleteFranchiseSubscription/:id",
  deleteFranchiseSubscriptionCont
);
router.put(
  "/activeAndInActiveFranchiseSubscription",
  activeAndInActiveFranchiseSubscriptionCont
);

export default router;
