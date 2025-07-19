import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const featureSchema = new Schema({
  name: { type: String, required: true },
  included: { type: Boolean, default: false }
}, { _id: false });

const fullFeatureSchema = new Schema({
  text: { type: String, required: true }
}, { _id: false });

const subscriptionSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    unique: true,
    trim: true
  },
  originalPrice: {
    type: Number,
    default: null
  },
  discount: {
    type: String,
  },
  discountPercentage: {
    type: Number,
    default: null
  },
    price: {
    type: Number,
    required: true,
    min: 0
  },
  gstPercentage: {
    type: Number,
    required: true,
    min: 0
  },
  gst: {
    type: Number,
    required: true,
    min: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  validity: {
     type: Number,
  },
  leads: {
     type: Number,
  },
  features: {
    type: [featureSchema],
    required: true
  },
  fullFeatures: {
    type: [fullFeatureSchema],
    default: []
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default model('Subscription', subscriptionSchema);