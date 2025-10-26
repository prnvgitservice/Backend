// pincodes.routes.js
import express from 'express';
import { 
  getAllPincodes, 
  getPincodeByCode, 
  createPincode, 
  updatePincode, 
  deletePincode 
} from '../controllers/pincodes.controller.js';

const router = express.Router();

// GET /api/pincodes - Get all pincodes
router.get('/allAreas', getAllPincodes);

// GET /api/pincodes/:code - Get a specific pincode
router.get('/:code', getPincodeByCode);

// POST /api/pincodes - Create new pincode or add areas/subareas if exists
router.post('/create', createPincode);

// PUT /api/pincodes/:code - Update pincode (city, state, and/or replace entire areas array)
router.put('/update', updatePincode);

// DELETE /api/pincodes/:code - Delete entire pincode
router.delete('/delete/:code', deletePincode);

export default router;
// import express from 'express';
// import { getPincodeAreaNames, updatePincode, createPincode, getAllPincodes, deletePincode } from '.././controllers/pincodes.controller.js';

// const router = express.Router();

// router.get('/areas', getPincodeAreaNames);
// router.put('/:code', updatePincode);
// router.post('/create', createPincode);
// router.get('/allAreas', getAllPincodes);
// router.delete('/delete', deletePincode);

// export default router;
