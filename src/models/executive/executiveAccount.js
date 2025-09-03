// models/Account.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ExecutiveAccountSchema = new Schema(
  {
    executiveId: {
      type: Schema.Types.ObjectId,
      ref: "Executive",
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
      required: false,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
      required: false,
    },
    fromExecutiveId: {
      type: Schema.Types.ObjectId,
      ref: "Executive",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("ExecutiveAccount", ExecutiveAccountSchema);
