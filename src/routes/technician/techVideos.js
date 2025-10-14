import { Router } from 'express';
import { uploadVideoWithValidation } from '../../middleware/uploadVideo.js';
import {
    createTechVideoControl,
    getTechVideosByTechIdControl,
    deleteSingleTechnicianVideoControl,
    deleteAllVideosByTechnId,
} from '../../controllers/technician/techVideos.js';


const router = Router();


router.post('/createTechVideoControl', uploadVideoWithValidation, createTechVideoControl);
router.get('/getTechVideosByTechId/:technicianId', getTechVideosByTechIdControl);
router.delete('/deleteAllVideosByTechnId/:technicianId', deleteAllVideosByTechnId);
router.delete('/deleteSingleTechVideo', deleteSingleTechnicianVideoControl);


export default router;