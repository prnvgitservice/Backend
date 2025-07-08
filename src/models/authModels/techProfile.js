import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const serviceSchema = new Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  serviceImg: {
    type: String,
  },
  servicePrice: {
    type: Number,
    required: true,
    min: 0,
  }
}, {
  timestamps: true,
});

const photoSchema = new Schema({
  imageUrl: {
    type: String
  }
}, {
  timestamps: true,
});

const techProfileSchema = new Schema({
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  profileImage: {
    type: String
  },
  photos: {
    type: [photoSchema],
    validate: {
      validator: function (val) {
        return val.length <= 5;
      },
      message: 'A maximum of 5 photos are allowed.',
    }
  },
  services: [serviceSchema],
}, {
  timestamps: true,
});

export default model('TechProfile', techProfileSchema);
