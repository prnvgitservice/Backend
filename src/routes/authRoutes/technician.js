import { Router } from "express";
import {
  deleteTechnicianByIdController,
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
  adminMiddleware,
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
router.delete(
  "/deleteTechnician/:technicianId",
  deleteTechnicianByIdController
);
router.delete(
  "/deleteTechnicianByAdmin/:technicianId",
  requireSignIn,
  adminMiddleware,
  deleteTechnicianByIdController
);

export default router;
