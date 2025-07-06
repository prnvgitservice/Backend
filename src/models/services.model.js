import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const photoSchema = new Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const serviceSchema = new Schema({
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  businessProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'TechnicianProfile',
  },
  name: {
    type: String,
   required: true,
  },
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  bookingCount: {
    type: Number,
    default: 0,
  },
  photos: [photoSchema], 
//   {
//   "technicianId": "66498ae85e123456789abcd1",
//   "businessName": "BMR Services",
//   "name": "BMR Services",
//   "category": "AC Repair",
//   "location": {
//     "city": "Hyderabad",
//     "state": "Telangana",
//     "addressLine": "SR Nagar",
//     "fullAddress": "SR Nagar, Hyderabad, Telangana"
//   },
//   "phoneNumber": "9876543212",
//   "experienceYears": 5,
//   "rating": {
//     "average": 4.8,
//     "count": 84
//   },
//   "photos": [
//     { "url": "https://example.com/photo1.jpg" },
//     { "url": "https://example.com/photo2.jpg" }
//   ],
//   "servicesOffered": [
//     { "title": "AC Installation", "description": "Fast and reliable", "price": 999 }
//   ],
//   "reviews": [
//     {
//       "customerId": "664a71239a3d51234567bcd2",
//       "comment": "Excellent service!",
//       "rating": 5
//     }
//   ],
//   "faqs": [
//     {
//       "question": "Do you provide emergency service?",
//       "answer": "Yes, within 2 hours in Hyderabad."
//     }
//   ]
// }
}, {
  timestamps: true,
});

export default model('Service', serviceSchema);
