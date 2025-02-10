import express from "express";

import { auth, admin } from "../utils/verify.js";
import { createTelegram } from "../controllers/telegram.controller.js";

const telegramRouter = express.Router();

// telegramRouter.get("/", auth, getRoles);
// telegramRouter.get("/:id", auth, getRole);

telegramRouter.post("/", createTelegram);
// telegramRouter.patch("/:id", auth, admin, updateRole);
// telegramRouter.delete("/:id", auth, admin, deleteRole);

export default telegramRouter;
