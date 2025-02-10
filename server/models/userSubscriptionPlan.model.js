import mongoose from "mongoose";

const userSubscriptionPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const UserSubscriptionPlan = mongoose.model(
  "UserSubscriptionPlan",
  userSubscriptionPlanSchema
);

export default UserSubscriptionPlan;
