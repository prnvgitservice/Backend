// models/Account.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AccountSchema = new Schema(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Account", AccountSchema);
