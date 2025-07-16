import mongoose from 'mongoose';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const BookingServiceSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
servicePrice: {
    type: Number,
    required: true,
  },
  gst:{
     type: Number,
    required: true,
  },
  totalPrice:{
     type: Number,
    required: true,
  },
  status:{
    type: String,
    enum: ["upcoming", "cancelled", "declined", "accepted", "started", "completed"],
    default: "upcoming"
  },
 otp: {
    type: Number,
    default: generateOTP,
  },

}, { timestamps: true });


export default mongoose.model('BookingService', BookingServiceSchema);
