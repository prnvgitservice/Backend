import { Router } from 'express';
import { loginTechnicianController, registerTechnicianController } from '../../controllers/authControllers/technician.js';

const router = Router();

router.post('/register', registerTechnicianController);
router.post('/login', loginTechnicianController);

export default router;
