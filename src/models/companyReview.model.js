import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const companyReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
   technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
  },
    role: {
    type: String,
    required: true,
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
