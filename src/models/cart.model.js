import mongoose from 'mongoose';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const CartItemSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  // status: {
  //   type: String,
  //   enum: ['upcoming', 'completed', 'cancelled'],
  //   default: 'upcoming',
  // },
  otp: {
    type: Number,
    default: generateOTP,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Cart', CartSchema);
