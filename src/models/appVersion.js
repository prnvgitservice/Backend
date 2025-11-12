import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    stagingUrl: {
      type: String,
      trim: true,
    },
    productionUrl: {
      type: String,
      required: true,
      trim: true,
    },
    playStoreLink: {
        type: String,
        trim:true,
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Version = mongoose.model("Version", versionSchema);

export default Version;
