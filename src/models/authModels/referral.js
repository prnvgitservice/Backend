import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const referralSchema = new Schema(
  {
    executiveId: {
      type: Schema.Types.ObjectId,
      ref: "Executive",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    referralId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    referralName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    password: {
      type: String,
      required: true,
    },
  
    profileImage: {
      type: String,
    },
  
    buildingName: { type: String, required: true },
    areaName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true , match: [/^\d{6}$/, "Pincode must be 6 digits"],},
    bankName: { type: String, },
    accountNumber: {
      type: String,
    //   required: true,
      match: [/^\d+$/, "Account number must be numeric"],
    },
    ifscCode: {
      type: String,
    //   required: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"],
    },
    branchName: { type: String, },
  },
  { timestamps: true }
);

referralSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

referralSchema.methods.isPasswordMatch = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model("Referral", referralSchema);
