import { Router } from 'express';
import { uploadWithValidation } from '../../middleware/uploads.js';
import { adminMiddleware, requireSignIn } from '../../utils/generateToken.js';
import { deleteExecutiveProfileControl, getAllExecutivesController, getExecutiveProfileControl, loginExecutiveController, registerExecutiveController, updateExecutiveControl } from '../../controllers/authControllers/executive.js';

const router = Router();

router.post('/registerExecutiveByAdmin', registerExecutiveController,adminMiddleware,requireSignIn);
router.post('/loginExecutive', loginExecutiveController);
router.get('/getExecutiveProfile/:id', getExecutiveProfileControl);
router.get('/getAllExecutives', getAllExecutivesController);
router.put('/updateExecutive', uploadWithValidation, updateExecutiveControl);
router.delete('/deleteExecutiveProfile/:id', deleteExecutiveProfileControl, requireSignIn, adminMiddleware);

export default router;