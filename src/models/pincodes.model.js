import mongoose from 'mongoose';

const SubAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const AreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subAreas: [SubAreaSchema],
});

const PincodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  city: { type: String },
  state: { type: String },
  areas: [AreaSchema],
}, { timestamps: true });

export default mongoose.model('pincodes', PincodeSchema);