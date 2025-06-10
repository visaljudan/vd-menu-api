import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder,
} from "../controllers/order.controller.js";
import { auth } from "../utils/verify.js";

const orderRouter = express.Router();

orderRouter.post("/", auth, createOrder);

orderRouter.get("/", auth, getOrders);

orderRouter.get("/:id", auth, getOrder);

orderRouter.delete("/:id", auth, deleteOrder);

export default orderRouter;
