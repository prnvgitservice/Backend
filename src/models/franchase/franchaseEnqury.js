import mongoose from 'mongoose';

const FranchaseEnquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
     unique: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  message: {
     type: String,
    maxlength: 1000,
    trim: true,
  },
  status:{
    type: String,
    enum:["pending", "completed", "declined"],
    default:"pending"
  }
},{ timestamps: true }
);

export default mongoose.model('FranchaseEnquiry', FranchaseEnquirySchema);
