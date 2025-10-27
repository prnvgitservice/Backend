// models/technician/technicianSubscriptionDetails.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SubscriptionEntrySchema = new Schema(
  {
    subscriptionId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    subscriptionName: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }, // will be calculated dynamically
    leads: { type: Number }, // max allowed bookings
    ordersCount: { type: Number, default: 0 }, // live usage
    endUpPrice: { type: Number }, // earning limit
    earnAmount: { type: Number, default: 0 }, // total earned
  },
  { _id: false }
);

const TechSubscriptionsDetailSchema = new Schema(
  {
    technicianId: { type: Schema.Types.ObjectId, ref: "Technician", required: true },
    subscriptions: [SubscriptionEntrySchema], // only latest plan matters
  },
  { timestamps: true }
);

export default model("TechSubscriptionsDetail", TechSubscriptionsDetailSchema);


// import mongoose from "mongoose";
// import { type } from "os";
// const { Schema, model } = mongoose;

// const SubscriptionEntrySchema = new Schema({
//   subscriptionId: {
//     type: Schema.Types.ObjectId,
//     ref: "SubscriptionPlan",
//     required: true,
//   },
//   subscriptionName: {
//     type: String,
//   },
//   startDate: {
//     type: Date,
//   },
//   endDate: {
//     type: Date,
//   },
//   leads: {
//     type: Number,
//   },
//   ordersCount: {
//     type: Number,
//   },
//   endUpPrice: {
//     type: Number,
//   },
//   earnAmount: {
//     type: Number,
//   }
// });

// const TechSubscriptionsDetailSchema = new Schema(
//   {
//     technicianId: {
//       type: Schema.Types.ObjectId,
//       ref: "Technician",
//       required: true,
//     },
//     subscriptions: [SubscriptionEntrySchema],
//   },
//   {
//     timestamps: true,
//   }
// );

// export default model("TechSubscriptionsDetail", TechSubscriptionsDetailSchema);
