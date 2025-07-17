import SearchContentData from '../models/searchContentData.js';
import Category from '../models/category.model.js';
import mongoose from "mongoose";

export const addCagegorySearchDetails = async ({
  categoryId,
  areaName,
  city,
  state,
  pincode,
  data
}) => {
  if (!categoryId || !areaName || !city || !state || !pincode || !data) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["CategoryId, Area, City, State, Pincode and Data fields are all required."];
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
    city,
    state,
    pincode
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
    city,
    state,
    pincode,
    data
  });

  await searchData.save();

  return {
    id: searchData._id,
    categoryId: searchData.categoryId,
    areaName: searchData.areaName,
    city: searchData.city,
    state: searchData.state,
    pincode: searchData.pincode,
    data: searchData.data,
    createdAt: searchData.createdAt,
    updatedAt: searchData.updatedAt
  };
};


export const getSearchContentByLocation = async ({
  categoryId,
  areaName,
  city,
  state,
  pincode
}) => {
  if (!categoryId || !areaName || !city || !state || !pincode) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.errors = ["All location parameters (categoryId, areaName, city, state, pincode) are required"];
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
      city, 
      state,
      pincode
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
      city: searchContent.city,
      state: searchContent.state,
      pincode: searchContent.pincode,
      data: searchContent.data,
      createdAt: searchContent.createdAt,
      updatedAt: searchContent.updatedAt
    };
  
};

export const updateCagegorySearchDetails = async ({
  searchContentDataId,
  categoryId,
  areaName,
  city,
  state,
  pincode,
  data
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
  if (city) existingData.city = city;
  if (state) existingData.state = state;
  if (pincode) existingData.pincode = pincode;
  if (data) existingData.data = data;

  await existingData.save();

  return {
    id: existingData._id,
    categoryId: existingData.categoryId,
    areaName: existingData.areaName,
    city: existingData.city,
    state: existingData.state,
    pincode: existingData.pincode,
    data: existingData.data,
    createdAt: existingData.createdAt,
    updatedAt: existingData.updatedAt
  };
};

export const deleteCategorySearchDetails = async ({searchContentDataId}) => {
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
    id: searchContentDataId
  };
};
