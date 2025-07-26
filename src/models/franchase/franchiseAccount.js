import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AccountsSchema = new Schema({
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: "Technician",
    required: true,
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  subscriptionName: {
    type: String
  },
  amount: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const FranchiseAccountsSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    accounts: [AccountsSchema],
  },
  {
    timestamps: true,
  }
);

export default model("FranchiseAccount", FranchiseAccountsSchema);
