import { Router } from 'express';
import { creatingTechProfile, getTechAllProfileData, getTechProfileData } from '../../controllers/authControllers/techProfile.js';
import { uploadWithValidation } from '../../middleware/uploads.js';

const router = Router();

router.post("/creatingTechProfile", uploadWithValidation, creatingTechProfile);
router.get("/getTechProfileData/:id", getTechProfileData);
router.get("/getTechAllProfileData", getTechAllProfileData);

export default router;
