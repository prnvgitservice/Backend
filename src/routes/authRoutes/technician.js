import { Router } from "express";
import {
  changeServiceStatusController,
  deleteTechnicianByIdController,
  getAllTechnicianController,
  getTechnicianProfilesByFranchiseIdCont,
  getTechProfileControl,
  loginTechnicianController,
  registerTechnicianByExecutiveController,
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
router.post("/registerByExecutive", registerTechnicianByExecutiveController);

router.post("/login", loginTechnicianController);

router.put(
  "/updateTechnicianControl",
  uploadWithValidation,
  updateTechnicianControl
);
router.put(
  "/updateTechByFranchaise",
  //   requireSignIn
  //   franchaiseMiddleware,
  uploadWithValidation,
  updateTechnicianControl
);

router.put(
  "/renewTechnicianByFranchaise",
  renewTechnicianByFranchaiseController
);
router.put(
  "/changeServiceStatus",
  //   requireSignIn
  //   franchaiseMiddleware,
  changeServiceStatusController
);

router.get("/getTechProfile/:technicianId", getTechProfileControl);
router.get("/getAllTechnicians", getAllTechnicianController);
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
