import Category from "../models/category.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const createCategory = async ({
  category_name,
  category_slug,
  meta_title,
  meta_description,
  seo_content,
  status,
  totalviews,
  ratings,
  files,
}) => {
  if (!category_name || !category_slug) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category Name and Slug are required."];
    throw err;
  }

  let imageUrl = null;

  if (files?.category_image?.[0]) {
    const filePath = files.category_image[0].path;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "CategoryImages",
    });
    fs.unlinkSync(filePath);
    imageUrl = uploadResult.secure_url;
  }

  const data = {
    category_name,
    category_slug,
    meta_title,
    meta_description,
    seo_content,
    status,
    totalviews,
    ratings,
    category_image: imageUrl,
  };

  return await Category.create(data);
};

export const updateCategory = async ({
  categoryId,
  category_name,
  category_slug,
  meta_title,
  meta_description,
  seo_content,
  status,
  totalviews,
  ratings,
  files,
}) => {
  if (!categoryId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  let imageUrl = category.category_image;

  if (files?.category_image?.[0]) {
    const filePath = files.category_image[0].path;

    if (imageUrl) {
      const match = imageUrl.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `CategoryImages/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "CategoryImages",
    });
    fs.unlinkSync(filePath);
    imageUrl = uploadResult.secure_url;
  }

  const updates = {
    category_name,
    category_slug,
    meta_title,
    meta_description,
    seo_content,
    status,
    totalviews,
    ratings,
    category_image: imageUrl,
  };

  return await Category.findByIdAndUpdate(categoryId, updates, { new: true });
};

export const deleteCategory = async (categoryId) => {
  if (!categoryId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  const imageUrl = category.category_image;

  if (imageUrl) {
    const match = imageUrl.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `CategoryImages/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  return await Category.findByIdAndDelete(categoryId);
};

export const updateCategoryStatus = async ({ categoryId, status }) => {
  if (!categoryId || typeof status === "undefined") {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Category ID and Status are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid."];
    throw err;
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  category.status = Number(status); 
  await category.save();

  return category;
};

export const getAllCategories = async (
  filter = {},
  sort = { createdAt: -1 }
) => {
  return await Category.find(filter).sort(sort);
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const getCategoryBySlug = async (slug) => {
  return await Category.findOne({ category_slug: slug });
};

export const getCategoriesByStatus = async (status) => {
  return await Category.find({ status: Number(status) });
};

export const getCategoriesByViews = async (minViews = 0) => {
  return await Category.find({ totalviews: { $gte: Number(minViews) } });
};

export const getCategoriesByRatings = async (minRating = 0) => {
  return await Category.find({ ratings: { $gte: Number(minRating) } });
};
