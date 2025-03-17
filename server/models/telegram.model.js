import mongoose from "mongoose";

const TelegramSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Telegram = mongoose.model("Telegram", TelegramSchema);

export default Telegram;
