import * as searchContentData from "../services/searchContentData.js";

export const addCagegorySearchDetailsCont = async (req, res, next) => {
  try {
    const result = await searchContentData.addCagegorySearchDetails(req.body);
    res.status(201).json({
      success: true,
      message: "Search Content Data Created Successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSearchContentByLocationCont = async (req, res, next) => {
  try {
    const result = await searchContentData.getSearchContentByLocation(req.body);
    res.status(201).json({
      success: true,
      message: "Search Content Data Fetched Successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCagegorySearchDetailsCont = async (req, res, next) => {
  try {
    const result = await searchContentData.updateCagegorySearchDetails(
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Search Content Data Updated Successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategorySearchDetailsCont = async (req, res, next) => {
  try {
    const { searchContentDataId } = req.params;
    const result = await searchContentData.deleteCategorySearchDetails({
      searchContentDataId,
    });
    res.status(201).json({
      success: true,
      message: "Search Content Data Deleted Successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSearchContentsController = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;
    const result = await searchContentData.getAllSearchContents({
      offset,
      limit,
    });
    res.status(201).json({
      success: true,
      message: "Search Content Data Fetched Successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSeoContentsByCategoryIdCont = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { offset, limit } = req.query;

    const result = await searchContentData.getSeoContentsByCategoryId({
      categoryId,
      offset,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "SEO Contents fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

