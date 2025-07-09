import express from 'express';
import { getPincodeAreaNames, updatePincode, createPincode, getAllPincodes, deletePincode } from '.././controllers/pincodes.controller.js';

const router = express.Router();

router.get('/areas', getPincodeAreaNames);
router.put('/:code', updatePincode);
router.post('/create', createPincode);
router.get('/allAreas', getAllPincodes);
router.delete('/:code', deletePincode);

export default router;
