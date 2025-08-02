import express from "express";
import {
  addGuestBookingCont,
  getAllGuestBookingCont,
  updateGuestBookingStatusCont,
} from "../controllers/guestBooking.js";

const router = express.Router();

router.post("/addGuestBooking", addGuestBookingCont);
router.get("/getAllGuestBooking", getAllGuestBookingCont);
router.put("/updateStaus/:bookingId/:status", updateGuestBookingStatusCont);

export default router;
