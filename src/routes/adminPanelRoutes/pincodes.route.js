import express from 'express';
import { getPincodeAreaNames } from '../../controllers/adminPanelControllers/pincodes.controller.js';

const router = express.Router();

router.get('/areas', getPincodeAreaNames);

export default router;
