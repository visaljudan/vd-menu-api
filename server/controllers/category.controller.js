import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Business from "../models/business.model.js";
import { emitCategoryEvent } from "../utils/socketioFunctions.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createCategory = async (req, res, next) => {
  try {
    const { businessId, name, description, status } = req.body;
    const currentUser = req.user;

    //Check business id
    if (!businessId) {
      return sendError(res, 400, "Business ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return sendError(res, 400, "Invalid Business ID format");
    }
    const business = await Business.findById(businessId);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    if (!name) {
      return sendError(res, 400, "Name is required to create a category");
    }

    // Check if the category name exists for the same user
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      businessId,
    });

    if (existingCategory) {
      return sendError(res, 409, "Category name already exists for this user");
    }

    // Generate a unique slug (unique across all users)
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existingSlug = await Category.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
      businessId,
    });

    if (existingSlug) {
      return sendError(res, 409, "Category slug already exists");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    // Ensure telegram.userId matches the logged-in user
    if (business.userId.toString() !== currentUser._id.toString()) {
      return sendError(res, 403, "You are not allowed to use this Business ID");
    }

    const newCategory = new Category({
      businessId,
      name,
      slug,
      description,
      status: status || "active",
    });

    await newCategory.save();

    const populatedCategory = await Category.findById(newCategory._id).populate(
      {
        path: "businessId",
        select: "userId telegramId name description",
        populate: [
          {
            path: "userId",
            select: "name",
          },
          {
            path: "telegramId",
            select: "name username phoneNumber",
          },
        ],
      }
    );

    emitCategoryEvent("categoryCreated", populatedCategory);

    return sendSuccess(
      res,
      201,
      "Category created successfully",
      populatedCategory
    );
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      businessId,
      status,
      userId,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (businessId && !mongoose.Types.ObjectId.isValid(businessId)) {
      return sendError(res, 400, "Invalid Business ID format.");
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid User ID format.");
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { slug: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (businessId) {
      query.businessId = businessId;
    }

    if (status) {
      query.status = status;
    }

    if (userId) {
      const userBusinesses = await Business.find({ userId }).select("_id");

      const businessUserFilterIds = userBusinesses.map((b) => b._id.toString());

      if (businessId && !businessUserFilterIds.includes(businessId)) {
        return res.status(404).json({
          success: false,
          message: "No category found for given businessId and userId.",
        });
      }

      if (!businessId) {
        query.businessId = { $in: businessUserFilterIds };
      }
    }

    const categories = await Category.find(query)
      .populate({
        path: "businessId",
        select: "name description userId telegramId",
        populate: [
          { path: "userId", select: "name" },
          { path: "telegramId", select: "name username phoneNumber" },
        ],
      })
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    return sendSuccess(res, 200, "Categories fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Category ID format");
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    const populatedCategory = await Category.findById(category._id).populate({
      path: "businessId",
      select: "userId telegramId name description",
      populate: [
        {
          path: "userId",
          select: "name",
        },
        {
          path: "telegramId",
          select: "name username phoneNumber",
        },
      ],
    });

    return sendSuccess(
      res,
      200,
      "Category fetched successfully",
      populatedCategory
    );
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { businessId, name, description, status } = req.body;
    const currentUser = req.user;

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid category ID format");
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    // Check permission to update category: Only the owner or admin
    const currentBusiness = await Business.findById(category.businessId);
    if (
      currentUser._id.toString() !== currentBusiness.userId.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can update this category."
      );
    }

    // Validate businessId format and ownership if provided
    if (businessId) {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        return sendError(res, 400, "Invalid Business ID format");
      }

      const newBusiness = await Business.findById(businessId);
      if (!newBusiness) {
        return sendError(res, 404, "Business not found");
      }

      if (
        newBusiness.userId.toString() !== currentUser._id.toString() &&
        currentUser.roleId.slug !== "admin"
      ) {
        return sendError(
          res,
          403,
          "You are not allowed to use this Business ID"
        );
      }

      category.businessId = businessId;
    }

    // Validate status
    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    // Check for duplicate name (only if name is changed)
    if (name && name !== category.name) {
      const existingName = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        businessId: category.businessId,
        _id: { $ne: id },
      });
      if (existingName) {
        return sendError(
          res,
          409,
          "Category name already exists for this business"
        );
      }

      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const existingSlug = await Category.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, "i") },
        businessId: category.businessId,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return sendError(
          res,
          409,
          "Category slug already exists for this business"
        );
      }

      category.name = name;
      category.slug = slug;
    }

    if (description) category.description = description;
    if (status) category.status = status;

    await category.save();

    const populatedCategory = await Category.findById(category._id).populate({
      path: "businessId",
      select: "userId telegramId name description",
      populate: [
        { path: "userId", select: "name" },
        { path: "telegramId", select: "name username phoneNumber" },
      ],
    });

    emitCategoryEvent("categoryUpdated", populatedCategory);

    return sendSuccess(
      res,
      200,
      "Category updated successfully",
      populatedCategory
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid category ID format");
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    // Check permission: Only owner or admin can proceed
    const business = await Business.findById(category.businessId);
    if (
      currentUser._id.toString() !== business.userId.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can perform this action."
      );
    }

    await Category.findByIdAndDelete(id);

    emitCategoryEvent("categoryDeleted", id);

    return sendSuccess(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};
