import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const franchiseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
   phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
   message: {
    type: String,
    required: true,
    trim: true
  },
  franchiseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  economy: {
    type: Number,
    required: true,
    min: 0
  },
  gold: {
    type: Number,
    required: true,
    min: 0
  },
  platinum: {
    type: Number,
    required: true,
    min: 0
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check 30-day validity from createdAt
franchiseSchema.virtual('status').get(function () {
  const createdAt = this.createdAt;
  const now = new Date();
  const diffMs = now - createdAt;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 30 ? 'active' : 'suspended';
});

export default model('Franchise', franchiseSchema);
