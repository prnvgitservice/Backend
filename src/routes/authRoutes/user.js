import { Router } from 'express';
import { login, register, getProfile, editProfile } from '../../controllers/authControllers/user.js';

const router = Router();
      
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', getProfile); //api/auth/profile/:id
router.put('/editProfile', editProfile); //api/auth/profile/:id
export default router;