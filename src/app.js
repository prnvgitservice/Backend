import express from 'express';
import dotenv from 'dotenv';
import authUserRoutes from './routes/authRoutes/user.js';
import authTechRoutes from './routes/authRoutes/technician.js';
import categoryRoutes from './routes/category.route.js';
import reviewRoutes from './routes/customerReviews.route.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import serviceRoutes from './routes/services.route.js';
import planRoutes from './routes/subscriptionRoutes.js';
import pincodeRoutes from './routes/adminPanelRoutes/pincodes.route.js';
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
app.use('/api/serices', serviceRoutes);
app.use('/api/subscriptions', planRoutes);
app.use('/api/pincodes', pincodeRoutes);

app.use(errorHandler)

export default app;