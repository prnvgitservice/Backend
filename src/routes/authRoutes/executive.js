import { Router } from 'express';
import { uploadWithValidation } from '../../middleware/uploads.js';
import { adminMiddleware, requireSignIn } from '../../utils/generateToken.js';
import { getExecutiveProfileControl, loginExecutiveController, registerExecutiveController } from '../../controllers/authControllers/executive.js';

const router = Router();

router.post('/registerExecutiveByAdmin', registerExecutiveController,adminMiddleware,requireSignIn);
router.post('/loginExecutive', loginExecutiveController);
router.get('/getExecutiveProfile/:id', getExecutiveProfileControl);

export default router;

// router.put('/updateFranchise', uploadWithValidation, updateFranchiseControl);

// router.get('/getAllFranchises', getAllFranchisesController);
// router.delete('/deleteFranchiseProfile/:franchiseId',  deleteFranchiseProfileControl);
// router.delete('/deleteFranchiseProfileByAdmin/:franchiseId', requireSignIn, adminMiddleware, deleteFranchiseProfileControl);


