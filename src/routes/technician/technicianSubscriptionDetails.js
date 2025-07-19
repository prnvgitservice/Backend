import { Router } from 'express';
import { addTechSubscriptionPlanCont } from '../../controllers/technician/technicianSubscriptionDetails.js';

const router = Router();

router.post('/addTechSubscriptionPlan', addTechSubscriptionPlanCont);
// router.put('/updateServiceControl', uploadWithValidation, updateServiceControl);
// router.get('/getTechImagesByTechId/:technicianId', getTechImagesByTechIdControl);
// router.delete('/deleteAllImgsByTechnId/:technicianId', deleteAllImgsByTechnId);
// router.delete('/deleteSingletechImg', deleteSingleTechnicianImageControl);

export default router;