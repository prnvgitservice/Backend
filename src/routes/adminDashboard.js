import express from "express";
import * as adminControl from '../controllers/adminDashboard.js';

const router = express.Router();

router.get('/stats', adminControl.getStats)
router.get('/categoriesDetails', adminControl.getCategorydetails);
router.get('/monthRevenue/:year', adminControl.getMonthlyBookings);
router.get('/recentBookings', adminControl.getRecentBookingsController);
router.get('/recentGuest', adminControl.getRecentGuestBooking);
router.get('/recentGetInTouch', adminControl.getRecentGetInTouch);

export default router;