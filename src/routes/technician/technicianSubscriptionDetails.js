import { Router } from 'express';
import { addTechSubscriptionPlanCont, getTechSubscriptionPlanComp } from '../../controllers/technician/technicianSubscriptionDetails.js';

const router = Router();

router.post('/addTechSubscriptionPlan', addTechSubscriptionPlanCont);
// router.put('/updateServiceControl', uploadWithValidation, updateServiceControl);
router.get('/getTechSubscriptionPlan/:technicianId', getTechSubscriptionPlanComp);
// router.delete('/deleteAllImgsByTechnId/:technicianId', deleteAllImgsByTechnId);
// router.delete('/deleteSingletechImg', deleteSingleTechnicianImageControl);

export default router;