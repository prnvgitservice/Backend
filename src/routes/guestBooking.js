import express from 'express';
import { addGuestBookingCont, getAllGuestBookingCont } from '../controllers/guestBooking.js';

const router = express.Router();

router.post('/addGuestBooking', addGuestBookingCont);
router.get('/getAllGuestBooking', getAllGuestBookingCont);


export default router;
