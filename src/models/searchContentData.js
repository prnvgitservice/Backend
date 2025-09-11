import mongoose from "mongoose";
const { Schema, model } = mongoose;

const dataSchema = new Schema({
  meta_title: {
    type: String,
    default: "",
    required: true,
  },
  meta_description: {
    type: String,
    default: "",
    required: true,
  },
});

const searchContentDataSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    areaName: { type: String },
    subAreaName: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String},
    meta_title: {
      type: String,
      default: "",
      required: true,
    },
    meta_description: {
      type: String,
      default: "",
      required: true,
    },
    seo_content: {
      type: String,
      default: "",
      required: true,
    }
  },
  { timestamps: true }
);

export default model("SEOContent", searchContentDataSchema);
