import { Router } from "express";
import { uploadWithValidation } from "../middleware/uploads.js";
import {
  createBlog,
  updateBlog,
  deleteAllBlogs,
  deleteBlog,
  getBlogById,
  getAllBlogs,
} from "../controllers/blog.js";

const router = Router();

router.post("/create", uploadWithValidation, createBlog);
router.put("/update", uploadWithValidation, updateBlog);
router.delete("/delete", deleteAllBlogs);
router.delete("/delete/:blogId", deleteBlog);
router.get("/get/:id", getBlogById);
router.get("/getAllBlogs", getAllBlogs);

export default router;
