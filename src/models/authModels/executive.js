import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { Schema, model } = mongoose;

const ExecutiveSchema = new Schema({
  executiveId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  executivename: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["trainee marketing executive", "junior marketing executive", "senior marketing executive"],
    default: "trainee marketing executive",
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

ExecutiveSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

ExecutiveSchema.methods.isPasswordMatch = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model('Executive', ExecutiveSchema);
