import { Router } from 'express';
import { getAllTechniciansByCateIdCont, getTechAllDetailsCont } from '../../controllers/technician/techDetails.js';

const router = Router();

router.get('/getTechAllDetails/:technicianId', getTechAllDetailsCont);
router.get('/getAllTechniciansByCateId/:categoryId', getAllTechniciansByCateIdCont);

export default router;
