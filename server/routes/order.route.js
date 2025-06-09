import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { auth } from "../utils/verify.js";

const orderRouter = express.Router();

orderRouter.post("/", auth, createOrder);

orderRouter.get("/", auth, getOrders);

rouorderRouterter.get("/:id", auth, getOrder);

orderRouter.delete("/:id", auth, deleteOrder);

export default orderRouter;
