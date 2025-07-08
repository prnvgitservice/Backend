import {Router} from 'express';
import * as CategoryController from '.././controllers/category.controller.js';

const router = Router();

router.post('/create', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);
router.get('/get', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.get('/status/:status', CategoryController.getCategoriesByStatus);
router.get('/views', CategoryController.getCategoriesByViews);    
router.get('/ratings', CategoryController.getCategoriesByRatings); 

export default router;
