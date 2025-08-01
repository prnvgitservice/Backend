import {Router} from 'express';
import * as CategoryController from '.././controllers/category.js';
import { uploadWithValidation } from '../middleware/uploads.js';

const router = Router();

router.post('/create', uploadWithValidation, CategoryController.createCategory);
router.put('/update', uploadWithValidation, CategoryController.updateCategory);
router.put('/updateStatus/:status/:categoryId', CategoryController.updateCategoryStatus);
router.delete('/delete/:categoryId', CategoryController.deleteCategory);
router.get('/get', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.get('/status/:status', CategoryController.getCategoriesByStatus);
router.get('/views', CategoryController.getCategoriesByViews);    
router.get('/ratings', CategoryController.getCategoriesByRatings); 

export default router;
