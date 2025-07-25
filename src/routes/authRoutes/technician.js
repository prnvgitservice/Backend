import { Router } from "express";
import {
  getTechnicianProfilesByFranchiseIdCont,
  getTechProfileControl,
  loginTechnicianController,
  registerTechnicianByFranchaiseController,
  registerTechnicianController,
  updateTechnicianControl,
} from "../../controllers/authControllers/technician.js";
import { uploadWithValidation } from "../../middleware/uploads.js";
import {
  franchaiseMiddleware,
  requireSignIn,
} from "../../utils/generateToken.js";

const router = Router();

router.post("/register", registerTechnicianController);
router.post("/registerByFranchise", registerTechnicianByFranchaiseController);
router.post("/login", loginTechnicianController);
router.put(
  "/updateTechnicianControl",
  uploadWithValidation,
  updateTechnicianControl
);
router.get("/getTechProfile/:technicianId", getTechProfileControl);
router.get(
  "/getTechProfileByFranchise/:technicianId",
  //   requireSignIn
  //   franchaiseMiddleware,
  getTechProfileControl
);
router.get(
  "/getTechProfilesByFranchiseId/:franchiseId",
  //   requireSignIn
  //   franchaiseMiddleware,
  getTechnicianProfilesByFranchiseIdCont
);
router.put(
  "/updateTechByFranchaise",
  //   requireSignIn
  //   franchaiseMiddleware,
  uploadWithValidation,
  updateTechnicianControl
);

export default router;
