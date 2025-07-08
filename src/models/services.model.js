import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const photoSchema = new Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const serviceSchema = new Schema({
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  businessProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'TechnicianProfile',
  },
  name: {
    type: String,
   required: true,
  },
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  bookingCount: {
    type: Number,
    default: 0,
  },
  photos: [photoSchema], // optional, remove if photo is not service-specific

}, {
  timestamps: true,
});

export default model('services', serviceSchema);
