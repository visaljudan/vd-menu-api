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
      unique: false,
      trim: true,
    },
    username: {
      type: String,
      unique: false,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: false,
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
