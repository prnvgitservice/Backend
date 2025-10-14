import mongoose from "mongoose";
const { Schema, model } = mongoose;

const techVideoSchema = new mongoose.Schema(
  {
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    videoUrls: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

techVideoSchema.pre("save", function (next) {
  if (this.videoUrls.length > 2) {
    return next(new Error("Only 2 videos allowed."));
  }
  next();
});

export default model('TechVids', techVideoSchema);
