import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const techImgsSchema = new Schema({
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  imageUrl: [{
    type: String,
  }],
}, {
  timestamps: true,
});


techImgsSchema.pre('save', function (next) {
  if (this.imageUrl.length > 5) {
    const err = new Error("Images Error");
    err.statusCode = 400;
    err.errors = ["You can upload a maximum of 5 images."];
    return next(err);
  }
  next();
});

export default model('TechImgs', techImgsSchema);
