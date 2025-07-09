import express from 'express';
import { getAllActivePlans } from '../controllers/subscription.controller.js';

const router = express.Router();

router.get('/plans', getAllActivePlans);

export default router;
