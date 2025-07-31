import { Router } from 'express';
import { uploadWithValidation } from '../../middleware/uploads.js';
import { deleteFranchiseProfileControl, getAllFranchisesController, getFranchiseProfileControl, loginFranchiseController, registerFranchiseController, updateFranchiseControl } from '../../controllers/authControllers/franchise.js';
import { adminMiddleware, requireSignIn } from '../../utils/generateToken.js';

const router = Router();

router.post('/register', registerFranchiseController);
router.post('/registerFranchiseByAdmin', registerFranchiseController);
router.post('/login', loginFranchiseController);
router.put('/updateFranchise', uploadWithValidation, updateFranchiseControl);
router.get('/getFranchiseProfile/:franchiseId', getFranchiseProfileControl);
router.get('/getAllFranchises', getAllFranchisesController);
router.delete('/deleteFranchiseProfile/:franchiseId',  deleteFranchiseProfileControl);
router.delete('/deleteFranchiseProfileByAdmin/:franchiseId', requireSignIn, adminMiddleware, deleteFranchiseProfileControl);

export default router;
