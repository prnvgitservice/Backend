import mongoose from 'mongoose';

const GetInTouchSchema = new mongoose.Schema({
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
    // match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },

  categoryName: {
    type: String,
    maxlength: 1000,
    trim: true,
  },

  message: {
    type: String,
  },

  status:{
    type: String,
    enum:["pending", "completed", "declined"],
    default:"pending"
  }
},{ timestamps: true }
);

export default mongoose.model('GetInTouch', GetInTouchSchema);
