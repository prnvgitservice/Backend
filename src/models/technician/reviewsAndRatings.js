import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const techReviewAndRatingsSchema = new Schema({
    technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  review: {
    type: String,
    trim: true,
    max: 100,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    max: 100,
  }
}, {
  timestamps: true,
});

export default model('TechReview', techReviewAndRatingsSchema);