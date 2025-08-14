import { Router } from 'express';
import { createServiceControl, deleteAllServicesControl, deleteServicesControl, getServicesByCateIdControl, updateServiceControl } from '../controllers/caregoryServices.js';
import { uploadWithValidation } from '../middleware/uploads.js';

const router = Router();

router.post('/createServiceControl', uploadWithValidation, createServiceControl);
router.put('/updateServiceControl', uploadWithValidation, updateServiceControl);
router.get('/getServicesByCateId/:categoryId', getServicesByCateIdControl);
router.delete('/deleteAllServices/:technicianId', deleteAllServicesControl);
router.delete('/deleteServiceById/:serviceId', deleteServicesControl);

export default router;
