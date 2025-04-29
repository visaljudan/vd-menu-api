import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Item from "../models/item.model.js";
import Business from "../models/business.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitItemEvent } from "../utils/socketioFunctions.js";

export const createItem = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, image, meta, tags, status } =
      req.body;

    // Validate category
    if (!categoryId) {
      return sendError(res, 400, "Category ID is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendError(res, 400, "Invalid Category ID format.");
    }
    const category = await Category.findById(categoryId);
    if (!category) return sendError(res, 400, "Invalid category ID");

    // Name
    if (!name) {
      return sendError(res, 400, "Name is required.");
    }

    // price
    if (!price) {
      return sendError(res, 400, "Price is required.");
    }

    // image
    if (!image) {
      return sendError(res, 400, "Image is required.");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    // Extract businessId from category
    const businessId = category.businessId._id;

    const newItem = await Item.create({
      businessId,
      categoryId,
      name,
      description,
      price,
      image,
      meta,
      tags,
      status: status || "active",
    });

    const populatedItem = await Item.findById(newItem._id)
      .populate("categoryId")
      .populate("businessId");

    emitItemEvent("itemCreated", populatedItem);

    return sendSuccess(res, 201, "Item created successfully", populatedItem);
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      userId,
      businessId,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Step 1: If userId is provided, find all businessIds owned by this user
    if (userId) {
      const businesses = await Business.find({ userId }).select("_id");
      const businessIds = businesses.map((b) => b._id);
      query.businessId = { $in: businessIds };
    }

    if (businessId) {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        return sendError(res, 400, "Invalid Business ID format.");
      }
      query.businessId = businessId;
    }

    // Step 2: Add search condition
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const items = await Item.find(query)
      .populate("categoryId")
      .populate("businessId")
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);

    return sendSuccess(res, 200, "Items fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Item ID format.");
    }
    const item = await Item.findById(id);
    if (!item) return sendError(res, 400, "Invalid Item ID.");

    const populatedItem = await Item.findById(item._id)
      .populate("categoryId")
      .populate("businessId");

    return sendSuccess(res, 200, "Item fetched successfully", populatedItem);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, image, meta, tags, status } =
      req.body;
    const userId = req.user._id;
    const userRole = req.user.roleId?.slug;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Item ID format.");
    }
    const item = await Item.findById(id);
    if (!item) return sendError(res, 404, "Item not found");

    // Validate category if it's being changed
    let businessId = item.businessId;
    if (categoryId && categoryId !== item.categoryId.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) return sendError(res, 400, "Invalid category ID");
      businessId = category.businessId;
    }

    // Check permission: Only the business owner or an admin can update
    const business = await Business.findById(businessId);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    if (
      userId.toString() !== business.userId.toString() &&
      userRole !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the business owner or an admin can update this item."
      );
    }

    // Update item fields
    item.categoryId = categoryId || item.categoryId;
    item.businessId = businessId;
    if (name) item.name = name;
    if (description) item.description = description;
    if (price) item.price = price;
    if (image) item.image = image;
    if (meta) item.meta = meta;
    if (tags) item.tags = tags;
    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return sendError(res, 400, "Status must be 'active' or 'inactive'");
      }
      item.status = status;
    }

    await item.save();

    const populatedItem = await Item.findById(item._id)
      .populate("categoryId")
      .populate("businessId");

    emitItemEvent("itemUpdated", populatedItem);

    return sendSuccess(res, 200, "Item updated successfully", item);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.roleId?.slug;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid item ID format");
    }

    const item = await Item.findById(id);
    if (!item) {
      return sendError(res, 404, "Item not found");
    }

    // Fetch business to check ownership
    const business = await Business.findById(item.businessId);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    // Permission check: Only the business owner or an admin can delete the item
    if (
      userId.toString() !== business.userId.toString() &&
      userRole !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the business owner or an admin can delete this item."
      );
    }

    await Item.findByIdAndDelete(id);

    emitItemEvent("itemDeleted", id);

    return sendSuccess(res, 200, "Item deleted successfully");
  } catch (error) {
    next(error);
  }
};
