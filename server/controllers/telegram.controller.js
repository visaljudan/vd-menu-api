import mongoose from "mongoose";
import Telegram from "../models/telegram.model.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { emitTelegramEvent } from "../utils/socketioFunctions.js";

export const createTelegram = async (req, res, next) => {
  try {
    const { name, username, phoneNumber, status } = req.body;
    const currentUser = req.user;

    if (!currentUser._id) {
      return sendError(res, 400, "User id is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(currentUser._id)) {
      return sendError(res, 400, "Invalid user ID format");
    }

    if (!phoneNumber) {
      return sendError(res, 400, "Phone number is required.");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    const newTelegram = new Telegram({
      userId: currentUser._id,
      name,
      username,
      phoneNumber,
      status: status || "active",
    });

    await newTelegram.save();

    const populatedTelegram = await Telegram.findById(newTelegram._id).populate(
      "userId",
      "name"
    );

    emitTelegramEvent("telegramCreated", populatedTelegram);

    return sendSuccess(
      res,
      201,
      "Telegram entry created successfully",
      populatedTelegram
    );
  } catch (error) {
    next(error);
  }
};

export const getTelegrams = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      userId,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};
    const currentUser = req.user;

    // Normal User: only see their own businesses
    if (currentUser?.roleId?.slug !== "admin") {
      query.userId = currentUser?._id;
    }

    // Admin can filter by any userId
    if (currentUser?.roleId?.slug === "admin" && userId) {
      query.userId = userId;
    }

    // Prevent normal users from filtering by userId (optional double-check)
    if (
      currentUser?.roleId?.slug !== "admin" &&
      userId &&
      userId !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to filter by userId.",
      });
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { username: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const telegrams = await Telegram.find(query)
      .populate("userId", "name")
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Telegram.countDocuments(query);

    return sendSuccess(res, 200, "Telegrams fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: telegrams,
    });
  } catch (error) {
    next(error);
  }
};

export const getTelegram = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Telegram Id format");
    }

    const telegram = await Telegram.findById(id);
    if (!telegram) {
      return sendError(res, 404, "Telegram not found");
    }

    const populatedTelegram = await Telegram.findById(telegram._id).populate(
      "userId",
      "name"
    );

    return sendSuccess(
      res,
      200,
      "Telegram fetched successfully",
      populatedTelegram
    );
  } catch (error) {
    next(error);
  }
};

export const updateTelegram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, username, phoneNumber, status } = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Telegram Id format");
    }
    const telegram = await Telegram.findById(id);
    if (!telegram) {
      return sendError(res, 404, "Telegram not found");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'.");
    }

    // Check permission: Only owner or admin can proceed
    if (
      currentUser._id.toString() !== telegram.userId.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can update this business."
      );
    }

    const updatedTelegram = await Telegram.findByIdAndUpdate(
      id,
      { name, username, phoneNumber, status },
      { new: true, runValidators: true }
    );

    const populatedTelegram = await Telegram.findById(
      updatedTelegram._id
    ).populate("userId", "name");

    emitTelegramEvent("telegramUpdated", populatedTelegram);

    return sendSuccess(
      res,
      200,
      "Telegram updated successfully",
      populatedTelegram
    );
  } catch (error) {
    next(error);
  }
};

export const deleteTelegram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Telegram ID format");
    }

    const telegram = await Telegram.findById(id);
    if (!telegram) {
      return sendError(res, 404, "Telegram not found");
    }

    // Check permission before deleting
    if (
      currentUser._id.toString() !== telegram.userId.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can perform this action."
      );
    }

    await Telegram.findByIdAndDelete(id);

    emitTelegramEvent("telegramDeleted", id);

    return sendSuccess(res, 200, "Telegram deleted successfully");
  } catch (error) {
    next(error);
  }
};
