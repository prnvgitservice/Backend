import express from 'express';
import { getAllActivePlans, getSubPlanById } from '../controllers/subscription.controller.js';

const router = express.Router();

router.get('/plans', getAllActivePlans);
router.get('/plan/:id', getSubPlanById);

export default router;
