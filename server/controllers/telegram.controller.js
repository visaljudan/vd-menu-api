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
