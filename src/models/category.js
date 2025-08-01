import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CategorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: true,
      trim: true,
    },
    category_image: {
      type: String,
    },
    category_slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    meta_title: {
      type: String,
      default: "",
    },
    meta_description: {
      type: String,
      default: "",
    },
    status: {
      type: Number,
      default: 1,
      enum: [0, 1],
    },
    totalviews: {
      type: Number,
    },
    ratings: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Category", CategorySchema);
