import express from 'express';
import dotenv from 'dotenv';

import authUserRoutes from './routes/authRoutes/user.js';
import authTechRoutes from './routes/authRoutes/technician.js';
import categoryRoutes from './routes/category.route.js';
import reviewRoutes from './routes/reviews.route.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import serviceRoutes from './routes/technician/services.js';
import techImagesRoutes from './routes/technician/techImgs.js';
import techReviewRoutes from './routes/technician/reviewsAndRatings.js';
import techDetailsRoutes from './routes/technician/techDetails.js';
import pincodeRoutes from './routes/pincodes.route.js';
import companyReviewRoutes from './routes/companyReview.model.js';
import techProfileRoutes from './routes/authRoutes/techProfile.js';
import cartRoutes from './routes/cart.route.js';
import subscriptionRoutes from './routes/subscription.route.js';

import cors from 'cors';

dotenv.config();
connectDB()

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/userAuth', authUserRoutes);
app.use('/api/techAuth', authTechRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/techImages', techImagesRoutes);
app.use('/api/techProfile', techProfileRoutes);
app.use('/api/techReview', techReviewRoutes);
app.use('/api/techDetails', techDetailsRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/companyReview', companyReviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.use(errorHandler)

export default app;