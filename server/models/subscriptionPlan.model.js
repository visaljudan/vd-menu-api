import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    feature: {
      type: [String],
      required: true,
    },
    maxBusiness: {
      type: Number,
      required: true,
      min: 1,
    },
    maxCategory: {
      type: Number,
      required: true,
      min: 1,
    },
    maxItem: {
      type: Number,
      required: true,
      min: 1,
    },
    analysisType: {
      type: String,
      enum: ["basic", "advanced"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default SubscriptionPlan;
