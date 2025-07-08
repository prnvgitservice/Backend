import { Router } from 'express';
import { getTechProfileControl, loginTechnicianController, registerTechnicianController, updateTechnicianControl } from '../../controllers/authControllers/technician.js';
import { uploadWithValidation } from '../../middleware/uploads.js';

const router = Router();

router.post('/register', registerTechnicianController);
router.post('/login', loginTechnicianController);
router.put('/updateTechnicianControl', uploadWithValidation, updateTechnicianControl);
router.get('/getTechProfile/:technicianId', uploadWithValidation, getTechProfileControl);

export default router;
