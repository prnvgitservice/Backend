import * as BlogService from "../services/blog.js";

export const createBlog = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const blogData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const blog = await BlogService.createBlog(blogData);
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  const filesArray = req.files || [];
  const filesMap = {};

  filesArray.forEach((file) => {
    if (!filesMap[file.fieldname]) {
      filesMap[file.fieldname] = [];
    }
    filesMap[file.fieldname].push(file);
  });

  const blogData = {
    ...req.body,
    files: filesMap,
  };

  try {
    const updated = await BlogService.updateBlog(blogData);
    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  const { blogId } = req.params;
  try {
    const deleted = await BlogService.deleteBlogById(blogId);
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      deleted,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAllBlogs = async (req, res, next) => {
  try {
    const deleted = await BlogService.deleteAllBlogs();
    res.status(200).json({
      success: true,
      message: "All blogs deleted successfully",
      deleted,
    });
  } catch (err) {
    next(err);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await BlogService.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};
export const getAllBlogs = async (req, res, next) => {
  try {
    const blog = await BlogService.getAllBlogs();
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};
