import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    default: "admin",
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

}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.isPasswordMatch = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model('Admin', adminSchema);
