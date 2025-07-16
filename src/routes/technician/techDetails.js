import { Router } from 'express';
import { getAllTechByAddCont, getAllTechniciansByCateIdCont, getTechAllDetailsCont } from '../../controllers/technician/techDetails.js';

const router = Router();

router.get('/getTechAllDetails/:technicianId', getTechAllDetailsCont);
router.get('/getAllTechniciansByCateId/:categoryId', getAllTechniciansByCateIdCont);
router.get('/getAllTechByAddress', getAllTechByAddCont);

export default router;
