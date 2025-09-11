import SearchContentData from "../models/searchContentData.js";
import Category from "../models/category.js";
import mongoose from "mongoose";

export const addCagegorySearchDetails = async ({
  categoryId,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  meta_title,
  meta_description,
  seo_content,
}) => {
  if (
    !categoryId ||
    // !areaName ||
    // !subAreaName ||
    !city ||
    !state ||
    // !pincode ||
    !meta_title ||
    !meta_description ||
    !seo_content
  ) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = [
      "CategoryId, City, State and Data fields are all required.",
    ];
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
    err.errors = ["Category ID Not Found"];
    throw err;
  }

  const existingSearch = await SearchContentData.findOne({
    categoryId,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
  });

  if (existingSearch) {
    const err = new Error("Duplicate search data");
    err.statusCode = 409;
    err.errors = ["SearchContentData with the same details already exists."];
    throw err;
  }

  const searchData = new SearchContentData({
    categoryId,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
    meta_title,
    meta_description,
    seo_content,
  });

  await searchData.save();

  return {
    id: searchData._id,
    categoryId: searchData.categoryId,
    areaName: searchData.areaName,
    subAreaName: searchData.subAreaName,
    city: searchData.city,
    state: searchData.state,
    pincode: searchData.pincode,
    meta_title: searchData.meta_title,
    meta_description: searchData.meta_description,
    seo_content: searchData.seo_content,
    createdAt: searchData.createdAt,
    updatedAt: searchData.updatedAt,
  };
};

export const getSearchContentByLocation = async ({
  categoryId,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
}) => {
  if (!categoryId || !city || !state) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = [
      "All location parameters (categoryId, city, state) are required",
    ];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("Invalid Category ID format");
    err.statusCode = 400;
    err.errors = ["Provided Category ID is not valid"];
    throw err;
  }

  const searchContent = await SearchContentData.findOne({
    categoryId,
    areaName,
    subAreaName,
    city,
    state,
    pincode,
  });

  if (!searchContent) {
    const err = new Error("Search content not found");
    err.statusCode = 404;
    err.errors = ["No content found for the specified location and category"];
    throw err;
  }

  return {
    id: searchContent._id,
    categoryId: searchContent.categoryId,
    areaName: searchContent.areaName,
    subAreaName: searchContent.subAreaName,
    city: searchContent.city,
    state: searchContent.state,
    pincode: searchContent.pincode,
    meta_title: searchContent.meta_title,
    meta_description: searchContent.meta_description,
    seo_content: searchContent.seo_content,
    createdAt: searchContent.createdAt,
    updatedAt: searchContent.updatedAt,
  };
};


export const updateCagegorySearchDetails = async ({
  searchContentDataId,
  categoryId,
  areaName,
  subAreaName,
  city,
  state,
  pincode,
  meta_title,
  meta_description,
  seo_content,
}) => {
  if (!searchContentDataId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Search Content Data Id field is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(searchContentDataId)) {
    const err = new Error("Invalid SearchContentData ID format");
    err.statusCode = 400;
    err.errors = ["Provided SearchContentData ID is not valid."];
    throw err;
  }

  const existingData = await SearchContentData.findById(searchContentDataId);
  if (!existingData) {
    const err = new Error("SearchContentData not found");
    err.statusCode = 404;
    err.errors = ["SearchContentData ID Not Found"];
    throw err;
  }

  if (categoryId) existingData.categoryId = categoryId;
  if (areaName) existingData.areaName = areaName;
  if (subAreaName) existingData.subAreaName = subAreaName;
  if (city) existingData.city = city;
  if (state) existingData.state = state;
  if (pincode) existingData.pincode = pincode;
  if (meta_title) existingData.meta_title = meta_title;
  if (meta_description) existingData.meta_description = meta_description;
  if (seo_content) existingData.seo_content = seo_content;


  await existingData.save();

  return {
    id: existingData._id,
    categoryId: existingData.categoryId,
    areaName: existingData.areaName,
    subAreaName: existingData.subAreaName,
    city: existingData.city,
    state: existingData.state,
    pincode: existingData.pincode,
    meta_title: existingData.meta_title,
    meta_description: existingData.meta_description,
    seo_content: existingData.seo_content,
    createdAt: existingData.createdAt,
    updatedAt: existingData.updatedAt,
  };
};

export const deleteCategorySearchDetails = async ({ searchContentDataId }) => {
  if (!searchContentDataId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Search Content Data Id field is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(searchContentDataId)) {
    const err = new Error("Invalid SearchContentData ID format");
    err.statusCode = 400;
    err.errors = ["Provided SearchContentData ID is not valid."];
    throw err;
  }

  const existingData = await SearchContentData.findById(searchContentDataId);
  if (!existingData) {
    const err = new Error("SearchContentData not found");
    err.statusCode = 404;
    err.errors = ["SearchContentData ID Not Found"];
    throw err;
  }

  await SearchContentData.deleteOne({ _id: searchContentDataId });

  return {
    id: searchContentDataId,
  };
};

export const getAllSearchContents = async ({ offset = 0, limit = 10 }) => {
  const skip = parseInt(offset, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(skip) || isNaN(pageSize) || skip < 0 || pageSize <= 0) {
    const err = new Error("Invalid pagination parameters");
    err.statusCode = 400;
    err.errors = ["Offset and limit must be valid positive integers"];
    throw err;
  }

  const total = await SearchContentData.countDocuments({});
  const data = await SearchContentData.find({})
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate("categoryId", "category_name"); // Optional: populate category name

  return {
    total,
    offset: skip,
    limit: pageSize,
    results: data.map((item) => ({
      id: item._id,
      categoryId: item.categoryId?._id || null,
      categoryName: item.categoryId?.category_name || null,
      areaName: item.areaName,
      subAreaName: item.subAreaName,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      seo_content: item.seo_content,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
};

