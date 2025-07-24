import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { Schema, model } = mongoose;

const franchiseSchema = new Schema({
 franchiseId: {
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
    default: "franchise",
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
  profileImage: {
    type: String
  },
  buildingName: { type: String, required: true },
  areaName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
}, { timestamps: true });

franchiseSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

franchiseSchema.methods.isPasswordMatch = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model('Franchise', franchiseSchema);
