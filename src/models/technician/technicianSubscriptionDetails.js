import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const SubscriptionEntrySchema = new Schema({
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  subscriptionName: {
    type: String
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  leads: {
type:Number
  },
  ordersCount: {
type:Number
  }
});

const TechSubscriptionsDetailSchema = new Schema({
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  subscriptions: [SubscriptionEntrySchema]
}, {
  timestamps: true,
});

export default model('TechSubscriptionsDetail', TechSubscriptionsDetailSchema);