import express from 'express';
import {
  createService,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  getTopRatedServices,
  getMostPopularServices,
  getServicesByCompanyId,
  getAllFilters
} from '../controllers/services.controller.js';

import authMiddleware from '../middleware/userMiddleware.js';

const router = express.Router();

// 🔐 Technician-only routes
router.post('/', authMiddleware, createService);                       // Create service
router.get('/my', authMiddleware, getMyServices);                      // Get all services by this technician
router.patch('/:id', authMiddleware, updateService);                   // Update service by ID
router.delete('/:id', authMiddleware, deleteService);                  // Delete service by ID

// 🌐 Public access
 router.get('/top-rated', getTopRatedServices);               // Get top rated services
router.get('/popular', getMostPopularServices);              // Get most popular services
router.get('/:id', getServiceById);                          // Get service by ID (public view)
router.get('/:company/services', getServicesByCompanyId);
router.get('/filter', getAllFilters);



export default router;
