import Order from "../models/order.model.js";
import OrderItem from "../models/order.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     description: Create a new order by providing buyer information, business, and order items.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buyer:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phone
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   telegram:
 *                     type: string
 *               business:
 *                 type: string
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

export const createOrder = async (req, res, next) => {
  try {
    const { buyer, business, orderItems } = req.body;

    if (!buyer || !business || !orderItems || orderItems.length === 0) {
      return sendError(res, 400, "Missing required fields");
    }

    let totalAmount = 0;
    const orderItemDocs = [];

    for (const item of orderItems) {
      const { itemId, quantity, price } = item;
      const subtotal = quantity * price;
      totalAmount += subtotal;

      const orderItem = await OrderItem.create({
        item: itemId,
        quantity,
        price,
        subtotal,
      });
      orderItemDocs.push(orderItem._id);
    }

    const order = await Order.create({
      buyer,
      business,
      orderItems: orderItemDocs,
      totalAmount,
    });

    return sendSuccess(res, 201, "Order created successfully", order);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/orders/user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Orders]
 *     description: Retrieve a list of orders based on the buyer's user ID.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The ID of the user whose orders are being fetched.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       400:
 *         description: No orders found
 *       404:
 *         description: User not found
 */

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ buyer: userId }).populate("orderItems");

    if (!orders || orders.length === 0) {
      return sendError(res, 400, "No orders found");
    }

    return sendSuccess(res, 200, "Orders retrieved successfully", orders);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/orders/{orderId}:
 *   put:
 *     summary: Update the status of an order
 *     tags: [Orders]
 *     description: Change the status of an order by providing the new status.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         description: The ID of the order whose status needs to be updated.
 *         required: true
 *         schema:
 *           type: string
 *       - name: status
 *         in: body
 *         description: The new status of the order.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [pending, processing, shipped, completed, canceled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status or missing fields
 *       404:
 *         description: Order not found
 */

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "completed",
      "canceled",
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "Invalid status");
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    return sendSuccess(res, 200, "Order status updated successfully", order);
  } catch (error) {
    next(error);
  }
};
