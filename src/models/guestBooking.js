import mongoose from 'mongoose';

const GuestBookingSchema = new mongoose.Schema({
      categoryId: {
     type: mongoose.Schema.Types.ObjectId,
    maxlength: 1000,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    default: 1,
  },
  message: {
    type: String,
    required: true,
  },
  categoryName:{
      type: String,
    required: true,
  },

  status:{
    type: String,
    enum:["pending", "completed", "declined"],
    default:"pending"
  }
},{ timestamps: true }
);

export default mongoose.model('GuestBooking', GuestBookingSchema);
