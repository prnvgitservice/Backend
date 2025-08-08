import { Router } from 'express';
import { createServiceControl, deleteAllServicesControl, deleteServicesControl, getServicesByTechIdControl, updateServiceControl } from '../controllers/caregoryServices.js';
import { uploadWithValidation } from '../middleware/uploads.js';

const router = Router();

router.post('/createServiceControl', uploadWithValidation, createServiceControl);
router.put('/updateServiceControl', uploadWithValidation, updateServiceControl);
router.get('/getServicesByTechId/:technicianId', getServicesByTechIdControl);
router.delete('/deleteAllServices/:technicianId', deleteAllServicesControl);
router.delete('/deleteServiceById/:serviceId', deleteServicesControl);

export default router;
