import { Router } from "express";

import { uploadWithValidation } from "../../middleware/uploads.js";
import {
  adminMiddleware,
  franchaiseMiddleware,
  requireSignIn,
} from "../../utils/generateToken.js";
import { getReferralsByExeIdCont, loginReferralController, registerRefByExeController, registerReferralController } from "../../controllers/authControllers/referral.js";

const router = Router();

router.post("/registerRefByExecutive", registerRefByExeController);
router.post("/registerReferral", registerReferralController);
router.post("/loginReferral", loginReferralController);
router.get("/getReferralsByExeId/:executiveId", getReferralsByExeIdCont);

export default router;