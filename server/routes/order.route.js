import express from "express";
import {
  createOrder,
  getOrdersByUser,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/user/:userId", getOrdersByUser);
orderRouter.put("/:orderId", updateOrderStatus);

export default orderRouter;
