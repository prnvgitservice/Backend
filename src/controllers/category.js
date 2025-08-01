import * as CategoryService from "../services/category.js";

export const createCategory = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const categoryData = {
    ...req.body,
    files: filesMap,
  };
  try {
    const category = await CategoryService.createCategory(categoryData);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const categoryData = {
    ...req.body,
    files: filesMap,
  };
  try {
    const updated = await CategoryService.updateCategory(categoryData);
    res.status(200).json({
      success: true,
      message: "Category Updated Successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategoryStatus = async (req, res, next) => {
  const { status, categoryId } = req.params;
  try {
    const updated = await CategoryService.updateCategoryStatus({
      status,
      categoryId,
    });
    res.status(200).json({
      success: true,
      message: "Category Status Updated Successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    const deleted = await CategoryService.deleteCategory(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deleted,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const getCategoriesByStatus = async (req, res, next) => {
  try {
    const result = await CategoryService.getCategoriesByStatus(
      req.params.status
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getCategoriesByViews = async (req, res, next) => {
  try {
    const views = req.query.min || 0;
    const result = await CategoryService.getCategoriesByViews(views);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getCategoriesByRatings = async (req, res, next) => {
  try {
    const rating = req.query.min || 0;
    const result = await CategoryService.getCategoriesByRatings(rating);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
