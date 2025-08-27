import mongoose from "mongoose";
import Blog from "../models/blog.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const createBlog = async ({ name, title, description, tags, files }) => {
  console.log("file", files)
  if (!name) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Name is required."];
    throw err;
  }

  let image = "";
  if (files?.blog_image?.[0]) {
    const filePath = files.blog_image[0].path;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "BlogImages",
    });
    fs.unlinkSync(filePath);
    image = uploadResult.secure_url;
  }

  const newBlog = new Blog({
    name,
    title,
    description,
    tags,
    image,
  });

  await newBlog.save();

  return {
    id: newBlog._id,
    name: newBlog.name,
    title: newBlog.title,
    description: newBlog.description,
    tags: newBlog.tags,
    image: newBlog.image,
  };
};

export const updateBlog = async ({ blogId, name, title, description, tags, files }) => {
  if (!blogId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Blog Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    const err = new Error("Invalid Blog ID format");
    err.statusCode = 400;
    err.errors = ["Provided Blog ID is not valid."];
    throw err;
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    const err = new Error("Blog not found");
    err.statusCode = 404;
    throw err;
  }

  if (files?.blog_image?.[0]) {
    const filePath = files.blog_image[0].path;

    const oldUrl = blog.image;
    if (oldUrl) {
      const match = oldUrl.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `BlogImages/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "BlogImages",
    });
    fs.unlinkSync(filePath);

    blog.image = uploadResult.secure_url;
  }

  if (name) blog.name = name;
  if (title) blog.title = title;
  if (description) blog.description = description;
  if (tags) blog.tags = tags;

  await blog.save();

  return {
    id: blog._id,
    name: blog.name,
    title: blog.title,
    description: blog.description,
    tags: blog.tags,
    image: blog.image,
  };
};

export const deleteBlogById = async (blogId) => {
  if (!blogId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Blog ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    const err = new Error("Invalid Blog ID format");
    err.statusCode = 400;
    err.errors = ["Provided Blog ID is not valid."];
    throw err;
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    const err = new Error("Blog not found");
    err.statusCode = 404;
    throw err;
  }

  if (blog.image) {
    const match = blog.image.match(/\/([^/]+)\.[a-z]+$/i);
    const publicId = match ? `BlogImages/${match[1]}` : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  await Blog.deleteOne({ _id: blogId });

  return {
    message: "Blog deleted successfully.",
    deletedBlogId: blogId,
  };
};

export const deleteAllBlogs = async () => {
  const blogs = await Blog.find();

  if (!blogs || blogs.length === 0) {
    const err = new Error("No blogs found");
    err.statusCode = 404;
    throw err;
  }

  for (const blog of blogs) {
    if (blog.image) {
      const match = blog.image.match(/\/([^/]+)\.[a-z]+$/i);
      const publicId = match ? `BlogImages/${match[1]}` : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
  }

  await Blog.deleteMany();

  return {
    message: "All blogs deleted successfully.",
    deletedCount: blogs.length,
  };
};

export const getBlogById = async (blogId) => {
  if (!blogId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Blog ID is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    const err = new Error("Invalid Blog ID format");
    err.statusCode = 400;
    err.errors = ["Provided Blog ID is not valid."];
    throw err;
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    const err = new Error("Blog not found");
    err.statusCode = 404;
    throw err;
  }

  return blog;
};

export const getAllBlogs = async () => {
  const blogs = await Blog.find().sort({ createdAt: -1 });

  if (!blogs || blogs.length === 0) {
    const err = new Error("No blogs found");
    err.statusCode = 404;
    throw err;
  }

  return blogs;
};
