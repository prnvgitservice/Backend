import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BlogSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    tags: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default model("Blog", BlogSchema);
