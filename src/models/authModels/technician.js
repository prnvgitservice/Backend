import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const technicianSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "technician",
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  password: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
   description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  profileImage: {
    type: String
  },
   service: {
    type: String,
  },
  buildingName: { type: String, required: true },
  areaName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
}, { timestamps: true });

technicianSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

technicianSchema.methods.isPasswordMatch = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model('Technician', technicianSchema);
