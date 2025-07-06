import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// @route   POST /api/categories
// @desc    Create a new category
router.post('/', createCategory);

// @route   GET /api/categories
// @desc    Get all categories
router.get('/', getAllCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
router.get('/:id', getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update category by ID
router.put('/:id', updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category by ID
router.delete('/:id', deleteCategory);

export default router;
