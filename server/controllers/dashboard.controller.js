import mongoose from "mongoose";
import { sendError, sendSuccess } from "../utils/response.js";
import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import Category from "../models/category.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const { userId, businessId } = req.query;

    const userFilter = {};
    const businessFilter = {};
    const categoryFilter = {};
    const itemFilter = {};
    const orderFilter = {};

    if (businessId && !mongoose.Types.ObjectId.isValid(businessId)) {
      return sendError(res, 400, "Invalid Business ID format.");
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid User ID format.");
    }

    if (userId) {
      // If filtering by userId, only include businesses owned by this user
      businessFilter.userId = userId;

      // Find businesses owned by this user
      const userBusinesses = await Business.find({ userId }).select("_id");

      const businessIds = userBusinesses.map((b) => b._id.toString());

      if (businessId && !businessIds.includes(businessId)) {
        return sendError(
          res,
          404,
          "No business found for given userId and businessId."
        );
      }

      if (businessId) {
        businessFilter._id = businessId;
        categoryFilter.businessId = businessId;
        itemFilter.businessId = businessId;
        orderFilter.businessId = businessId;
      } else {
        categoryFilter.businessId = { $in: businessIds };
        itemFilter.businessId = { $in: businessIds };
        orderFilter.businessId = { $in: businessIds };
      }
    } else if (businessId) {
      businessFilter._id = businessId;
      categoryFilter.businessId = businessId;
      itemFilter.businessId = businessId;
      orderFilter.businessId = businessId;
    }

    const [
      totalUsers,
      totalBusinesses,
      totalCategories,
      totalItems,
      totalOrders,
    ] = await Promise.all([
      User.countDocuments(userFilter),
      Business.countDocuments(businessFilter),
      Category.countDocuments(categoryFilter),
      Item.countDocuments(itemFilter),
      Order.countDocuments(orderFilter),
    ]);

    return sendSuccess(res, 200, "Dashboard stats fetched successfully", {
      totalUsers,
      totalBusinesses,
      totalCategories,
      totalItems,
      totalOrders,
    });
  } catch (error) {
    next(error);
  }
};
