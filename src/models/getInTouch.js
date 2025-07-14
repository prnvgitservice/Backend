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
  },

  status:{
    type: String,
    enum:["pending", "completed", "declined"],
    default:"pending"
  }
},{ timestamps: true }
);

export default mongoose.model('GetInTouch', GetInTouchSchema);
