import { Router } from 'express';
import { uploadWithValidation } from '../../middleware/uploads.js';
import { deleteFranchiseProfileControl, getAllFranchisesController, getFranchiseProfileControl, loginFranchiseController, registerFranchiseController, updateFranchiseControl } from '../../controllers/authControllers/franchise.js';

const router = Router();

router.post('/register', registerFranchiseController);
router.post('/registerFranchiseByAdmin', registerFranchiseController);
router.post('/login', loginFranchiseController);
router.put('/updateFranchise', uploadWithValidation, updateFranchiseControl);
router.get('/getFranchiseProfile/:franchiseId', getFranchiseProfileControl);
router.get('/getAllFranchises', getAllFranchisesController);
router.delete('/deleteFranchiseProfile/:franchiseId', deleteFranchiseProfileControl);

export default router;
