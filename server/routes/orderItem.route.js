import express from "express";
import { getOrderItemsByOrder } from "../controllers/orderItem.controller.js";

const orderItemRouter = express.Router();

orderItemRouter.get("/:orderId", getOrderItemsByOrder);

export default orderItemRouter;
