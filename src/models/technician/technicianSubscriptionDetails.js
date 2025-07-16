const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const SubscriptionEntrySchema = new Schema({
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
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

module.exports = model('TechSubscriptionsDetail', TechSubscriptionsDetailSchema);
