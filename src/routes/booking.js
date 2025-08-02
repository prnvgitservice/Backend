import express from 'express';
import { BookingCancleByUserCont, BookingStatusByTechnicianCont, createBookServiceCont, getAllBookingsController, getBookServiceByTechnicianIdCont, getBookServiceByUserIdCont } from '../controllers/booking.js';


const router = express.Router();

router.post('/createBookService', createBookServiceCont);
router.get('/getBookServiceByUserId/:userId', getBookServiceByUserIdCont);
router.get('/getBookServiceByTechnicianId/:technicianId', getBookServiceByTechnicianIdCont);
router.put('/BookingCancleByUser', BookingCancleByUserCont);
router.put('/BookingStatusByTechnician', BookingStatusByTechnicianCont);
router.get('/getAllBookings', getAllBookingsController);


export default router;
