import express from "express";

import { auth, admin } from "../utils/verify.js";
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from "../controllers/item.controller.js";

const itemRouter = express.Router();

itemRouter.get("/", getItems);
itemRouter.get("/:id", auth, getItem);
itemRouter.post("/", auth, createItem);
itemRouter.patch("/:id", auth, updateItem);
itemRouter.delete("/:id", auth, deleteItem);

export default itemRouter;
