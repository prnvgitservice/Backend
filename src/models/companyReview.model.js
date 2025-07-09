import mongoose from 'mongoose';

const companyReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
    role: {
    type: String,
    required: true,
    default: "user",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 1000,
    trim: true,
  },
}, {
  timestamps: true,
});

companyReviewSchema.index({userId: 1 }, { unique: true });

export default mongoose.model('CompanyReview', companyReviewSchema);
