import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const serviceSchema = new Schema({
    technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  serviceImg: {
    type: String,
    required: true,
  },
  servicePrice: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

export default model('Service', serviceSchema);