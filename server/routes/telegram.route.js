import express from "express";
import {
  createTelegram,
  deleteTelegram,
  getTelegram,
  getTelegrams,
  updateTelegram,
} from "../controllers/telegram.controller.js";
import { auth } from "../utils/verify.js";

const telegramRouter = express.Router();

telegramRouter.post("/", auth, createTelegram);
telegramRouter.get("/", auth, getTelegrams);
telegramRouter.get("/:id", auth, getTelegram);
telegramRouter.patch("/:id", auth, updateTelegram);
telegramRouter.delete("/:id", auth, deleteTelegram);

export default telegramRouter;
