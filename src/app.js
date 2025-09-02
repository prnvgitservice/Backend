import express from 'express';
import dotenv from 'dotenv';

import authUserRoutes from './routes/authRoutes/user.js';
import authAdminRoutes from './routes/authRoutes/admin.js';
import authTechRoutes from './routes/authRoutes/technician.js';
import authFranchiseRoutes from './routes/authRoutes/franchise.js';
import authExecutiveRoutes from './routes/authRoutes/executive.js';
import categoryRoutes from './routes/category.js';
import categoryServicesRoutes from './routes/caregoryServices.js';
import reviewRoutes from './routes/reviews.route.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import serviceRoutes from './routes/technician/services.js';
import techImagesRoutes from './routes/technician/techImgs.js';
import techReviewRoutes from './routes/technician/reviewsAndRatings.js';
import techDetailsRoutes from './routes/technician/techDetails.js';
import franchaseRoutes from './routes/franchase/franchaseEnqury.js';
import franchiseSubscriptionRoutes from './routes/franchase/franchiseSubscription.js';
import franchiseAccountsRoutes from './routes/franchase/franchiseAccount.js';
import franchiseSubscriptionDetailsRoutes from './routes/franchase/franchiseSubscriptionDetails.js';
import pincodeRoutes from './routes/pincodes.route.js';
import companyReviewRoutes from './routes/companyReview.route.js';
import techProfileRoutes from './routes/authRoutes/techProfile.js';
import cartRoutes from './routes/cart.route.js';
import bookingServicesRoutes from './routes/booking.js';
import guestBookingRoutes from './routes/guestBooking.js';
import subscriptionRoutes from './routes/subscription.js';
import blogRoutes from './routes/blog.js';
import getInTouchRoutes from './routes/authRoutes/getInTouch.js';
import searchContentDataRoutes from './routes/searchContentData.js';
import technicianSubscriptionRoutes from './routes/technician/technicianSubscriptionDetails.js';

import cors from 'cors';

dotenv.config();
connectDB()

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/userAuth', authUserRoutes);
app.use('/api/adminAuth', authAdminRoutes);
app.use('/api/techAuth', authTechRoutes);
app.use('/api/franchiseAuth', authFranchiseRoutes);
app.use('/api/executiveAuth', authExecutiveRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cateServices', categoryServicesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/techImages', techImagesRoutes);
app.use('/api/techProfile', techProfileRoutes);
app.use('/api/techReview', techReviewRoutes);
app.use('/api/techDetails', techDetailsRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/companyReview', companyReviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/bookingServices', bookingServicesRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/franchaseEnquiry', franchaseRoutes);
app.use('/api/guestBooking', guestBookingRoutes);
app.use('/api/getInTouch', getInTouchRoutes);
app.use('/api/searchContentData', searchContentDataRoutes);
app.use('/api/technicianSubscription', technicianSubscriptionRoutes);
app.use('/api/franchiseSubscription', franchiseSubscriptionRoutes);
app.use('/api/franchiseSubscriptionDetails', franchiseSubscriptionDetailsRoutes);
app.use('/api/franchiseAccounts', franchiseAccountsRoutes);

app.use(errorHandler)

export default app;