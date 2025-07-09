import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const guestSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
   category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
 
}, { timestamps: true });

export default model("Guest", guestSchema);
