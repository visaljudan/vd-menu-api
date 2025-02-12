import Telegram from "../models/telegram.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const createTelegram = async (req, res, next) => {
  try {
    const { userId, name, username, phoneNumber, status } = req.body;

    if (!userId || !phoneNumber) {
      return sendError(res, 400, "userId and phoneNumber are required");
    }

    const newTelegram = new Telegram({
      userId,
      name,
      username,
      phoneNumber,
      status,
    });

    await newTelegram.save();

    return sendSuccess(
      res,
      201,
      "Telegram entry created successfully",
      newTelegram
    );
  } catch (error) {
    next(error);
  }
};

// Get all telegrams with pagination, sorting, and search
export const getTelegrams = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { username: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    const telegrams = await Telegram.find(query)
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

// Get a single telegram by ID
export const getTelegram = async (req, res, next) => {
  try {
    const telegram = await Telegram.findById(req.params.id);
    if (!telegram) return sendError(res, 404, "Telegram not found");

    return sendSuccess(res, 200, "Telegram fetched successfully", telegram);
  } catch (error) {
    next(error);
  }
};

// Update a telegram by ID
export const updateTelegram = async (req, res, next) => {
  try {
    const { name, username, phoneNumber, status } = req.body;

    const updatedTelegram = await Telegram.findByIdAndUpdate(
      req.params.id,
      { name, username, phoneNumber, status },
      { new: true, runValidators: true }
    );

    if (!updatedTelegram) return sendError(res, 404, "Telegram not found");

    return sendSuccess(
      res,
      200,
      "Telegram updated successfully",
      updatedTelegram
    );
  } catch (error) {
    next(error);
  }
};

// Delete a telegram by ID
export const deleteTelegram = async (req, res, next) => {
  try {
    const deletedTelegram = await Telegram.findByIdAndDelete(req.params.id);
    if (!deletedTelegram) return sendError(res, 404, "Telegram not found");

    return sendSuccess(res, 200, "Telegram deleted successfully");
  } catch (error) {
    next(error);
  }
};
