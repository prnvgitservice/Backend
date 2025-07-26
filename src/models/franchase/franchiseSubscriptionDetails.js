import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SubscriptionEntrySchema = new Schema({
  franchiseSubscriptionId: {
    type: Schema.Types.ObjectId,
    ref: "FranchiseSubscription",
    required: true,
  },
  subscriptionName: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const FranchiseSubscriptionsDetailSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    subscriptions: [SubscriptionEntrySchema],
  },
  {
    timestamps: true,
  }
);

export default model(
  "FranchiseSubscriptionsDetails",
  FranchiseSubscriptionsDetailSchema
);
