import { Router } from 'express';
import { uploadWithValidation } from '../../middleware/uploads.js';
import { createTechImagesControl, deleteAllImgsByTechnId, deleteSingleTechnicianImageControl, getTechImagesByTechIdControl } from '../../controllers/technician/techImgs.js';

const router = Router();

router.post('/createTechImagesControl', uploadWithValidation, createTechImagesControl);
// router.put('/updateServiceControl', uploadWithValidation, updateServiceControl);
router.get('/getTechImagesByTechId/:technicianId', getTechImagesByTechIdControl);
router.delete('/deleteAllImgsByTechnId/:technicianId', deleteAllImgsByTechnId);
router.delete('/deleteSingletechImg', deleteSingleTechnicianImageControl);

export default router;
