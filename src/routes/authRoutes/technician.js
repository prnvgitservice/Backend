import { Router } from "express";
import {
  getAllTechnicianController,
  getTechnicianProfilesByFranchiseIdCont,
  getTechProfileControl,
  loginTechnicianController,
  registerTechnicianByFranchaiseController,
  registerTechnicianController,
  renewTechnicianByFranchaiseController,
  updateTechnicianControl,
} from "../../controllers/authControllers/technician.js";
import { uploadWithValidation } from "../../middleware/uploads.js";
import {
  franchaiseMiddleware,
  requireSignIn,
} from "../../utils/generateToken.js";

const router = Router();

router.post("/register", registerTechnicianController);
router.post("/registerByAdmin", registerTechnicianController);
router.post("/registerByFranchise", registerTechnicianByFranchaiseController);
router.put(
  "/renewTechnicianByFranchaise",
  renewTechnicianByFranchaiseController
);
router.post("/login", loginTechnicianController);
router.put(
  "/updateTechnicianControl",
  uploadWithValidation,
  updateTechnicianControl
);
router.get("/getAllTechnicians", getAllTechnicianController);
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
