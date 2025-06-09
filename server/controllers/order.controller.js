import mongoose from "mongoose";
import Order from "../models/Order.js";
import Business from "../models/Business.js";
import Item from "../models/Item.js";
import { sendError, sendSuccess } from "../utils/responseHelpers.js";
import { emitOrderEvent } from "../utils/eventEmitters.js";

// Create Order
export const createOrder = async (req, res, next) => {
  try {
    const { name, phone, address, businessId, items, note } = req.body;
    const currentUser = req.user;

    // Validate required fields
    if (
      !name ||
      !phone ||
      !address ||
      !businessId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return sendError(res, 400, "Missing required fields or empty items.");
    }

    // Validate businessId
    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return sendError(res, 400, "Invalid Business ID format.");
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return sendError(res, 404, "Business not found.");
    }

    // Ensure user owns the business
    if (
      business.userId.toString() !== currentUser._id.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "You are not allowed to use this Business ID."
      );
    }

    // Prepare order items and calculate total
    let orderItems = [];
    let total = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
        return sendError(res, 400, "Invalid Item ID format.");
      }

      const dbItem = await Item.findById(item.itemId);
      if (!dbItem) {
        return sendError(res, 404, `Item not found: ${item.itemId}`);
      }

      const unitPrice = item.unitPrice ?? dbItem.price; // Use provided price or Item price
      const quantity = item.quantity ?? 1;
      const itemTotal = unitPrice * quantity;

      orderItems.push({
        itemId: item.itemId,
        unitPrice,
        quantity,
        total: itemTotal,
      });

      total += itemTotal;
    }

    // Create and save the order
    const newOrder = new Order({
      name,
      phone,
      address,
      business: businessId,
      items: orderItems,
      total,
      note: note || "",
      status: "pending",
    });

    await newOrder.save();

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("business", "name description")
      .populate("items.itemId", "name price");

    emitOrderEvent("orderCreated", populatedOrder);

    return sendSuccess(res, 201, "Order created successfully", populatedOrder);
  } catch (error) {
    next(error);
  }
};

// Get Orders (with pagination, sorting, search)
export const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      businessId,
      userId,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (businessId) {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        return sendError(res, 400, "Invalid Business ID format.");
      }
      query.business = businessId;
    }

    if (userId) {
      const userBusinesses = await Business.find({ userId }).select("_id");
      const businessUserFilterIds = userBusinesses.map((b) => b._id.toString());

      if (businessId && !businessUserFilterIds.includes(businessId)) {
        return sendError(
          res,
          404,
          "No orders found for given businessId and userId."
        );
      }

      if (!businessId) {
        query.business = { $in: businessUserFilterIds };
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { phone: { $regex: new RegExp(search, "i") } },
        { address: { $regex: new RegExp(search, "i") } },
      ];
    }

    const orders = await Order.find(query)
      .populate("business", "name description")
      .populate("items.itemId", "name price")
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    return sendSuccess(res, 200, "Orders fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get single Order
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Order ID format.");
    }

    const order = await Order.findById(id)
      .populate("business", "name description")
      .populate("items.itemId", "name price");

    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    return sendSuccess(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

// Delete Order
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Order ID format.");
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    const business = await Business.findById(order.business);
    if (
      currentUser._id.toString() !== business.userId.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can delete this order."
      );
    }

    await Order.findByIdAndDelete(id);

    emitOrderEvent("orderDeleted", id);

    return sendSuccess(res, 200, "Order deleted successfully");
  } catch (error) {
    next(error);
  }
};
