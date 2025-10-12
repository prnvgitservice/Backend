import { Router } from "express";
import {
  changeServiceStatusController,
  deleteTechnicianByIdController,
  getAllTechnicianController,
  getAllTechRequestController,
  getTechnicianProfilesByExecutiveIdCont,
  getTechnicianProfilesByFranchiseIdCont,
  getTechProfileControl,
  loginTechnicianController,
  registerTechnicianByAdminController,
  registerTechnicianByExecutiveController,
  registerTechnicianByFranchaiseController,
  registerTechnicianController,
  renewTechnicianByFranchaiseController,
  updateTechnicianControl,
  updateTechnicianStatusCont,
} from "../../controllers/authControllers/technician.js";
import { uploadWithValidation } from "../../middleware/uploads.js";
import {
  adminMiddleware,
  franchaiseMiddleware,
  requireSignIn,
} from "../../utils/generateToken.js";

const router = Router();

router.post("/register", registerTechnicianController);
router.post("/registerByAdmin", registerTechnicianByAdminController);
router.post("/registerByFranchise", registerTechnicianByFranchaiseController);
router.post("/registerByExecutive", registerTechnicianByExecutiveController);

router.put('/updateStaus/:technicianId/:status', updateTechnicianStatusCont);

router.post("/login", loginTechnicianController);

router.put(
  "/updateTechnicianControl",
  uploadWithValidation,
  updateTechnicianControl
);

router.put(
  "/updateTechByAdmin",
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
router.get("/getAllTechRequest", getAllTechRequestController)
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
router.get(
  "/getTechProfilesByExecutiveId/:executiveId",
  //   requireSignIn
  //   franchaiseMiddleware,
  getTechnicianProfilesByExecutiveIdCont
);

router.delete(
  "/deleteTechnician/:technicianId",
  deleteTechnicianByIdController
);
router.delete(
  "/deleteTechnicianByAdmin/:technicianId",
  // requireSignIn,
  // adminMiddleware,
  deleteTechnicianByIdController
);

export default router;
