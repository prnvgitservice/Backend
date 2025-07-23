import { Router } from 'express';
import { adminLoginCont, adminRegisterCont, editAdminProfileCont, getAdminProfileCont } from '../../controllers/authControllers/admin.js';
import { adminMiddleware, requireSignIn, userMiddleware } from '../../utils/generateToken.js';

const router = Router();
      
router.post('/adminRegister', adminRegisterCont);
router.post('/adminLogin', adminLoginCont);
router.get('/getAdminProfile/:id', requireSignIn, adminMiddleware, getAdminProfileCont);
router.put('/editAdminProfile', requireSignIn, adminMiddleware, editAdminProfileCont);
export default router;