import { Router } from 'express';
import { getAllTechByAddCont, getAllTechniciansByCateIdCont, getCategoryServicesByTechIdCont, getTechAllDetailsCont } from '../../controllers/technician/techDetails.js';

const router = Router();

router.get('/getTechAllDetails/:technicianId', getTechAllDetailsCont);
router.get('/getCategoryServicesByTechId/:technicianId', getCategoryServicesByTechIdCont);
router.get('/getAllTechniciansByCateId/:categoryId', getAllTechniciansByCateIdCont);
router.post('/getAllTechByAddress', getAllTechByAddCont);

export default router;
