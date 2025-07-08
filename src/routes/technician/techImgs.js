import { Router } from 'express';
import { uploadWithValidation } from '../../middleware/uploads.js';
import { createTechImagesControl, getTechImagesByTechIdControl } from '../../controllers/technician/techImgs.js';

const router = Router();

router.post('/createTechImagesControl', uploadWithValidation, createTechImagesControl);
// router.put('/updateServiceControl', uploadWithValidation, updateServiceControl);
router.get('/getTechImagesByTechId/:technicianId', getTechImagesByTechIdControl);

export default router;
