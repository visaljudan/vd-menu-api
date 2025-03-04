import OrderItem from "../models/orderItem.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @swagger
 * /api/v1/order-items/{orderId}:
 *   get:
 *     summary: Retrieve all order items for a specific order
 *     tags: [Order Items]
 *     description: This endpoint returns all items associated with a particular order using the `orderId` parameter.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         description: The ID of the order for which the items are being fetched.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   price:
 *                     type: number
 *                     format: float
 *                   subtotal:
 *                     type: number
 *                     format: float
 *       404:
 *         description: No order items found for the given orderId
 *       500:
 *         description: Internal server error
 */

export const getOrderItemsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderItems = await OrderItem.find({ order: orderId });

    if (!orderItems || orderItems.length === 0) {
      return sendError(res, "No order items found", 404);
    }

    return sendSuccess(res, "Order items retrieved successfully", orderItems);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
