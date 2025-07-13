import express from 'express';
import { BookingCancleByUserCont, BookingStatusByTechnicianCont, createBookServiceCont, getBookServiceByTechnicianIdCont, getBookServiceByUserIdCont } from '../controllers/bookingServices.js';


const router = express.Router();

router.post('/createBookService', createBookServiceCont);
router.get('/getBookServiceByUserId/:userId', getBookServiceByUserIdCont);
router.get('/getBookServiceByTechnicianId/:technicianId', getBookServiceByTechnicianIdCont);
router.put('/BookingCancleByUser', BookingCancleByUserCont);
router.put('/BookingStatusByTechnician', BookingStatusByTechnicianCont);


export default router;
