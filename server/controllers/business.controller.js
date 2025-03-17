import mongoose from "mongoose";
import Business from "../models/business.model.js";
import Telegram from "../models/telegram.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitBusinessEvent } from "../utils/socketioFunctions.js";

export const createBusiness = async (req, res, next) => {
  try {
    const { telegramId, name, description, location, logo, image, status } =
      req.body;
    const currentUser = req.user;

    // Check required fields
    if (!currentUser._id) {
      return sendError(res, 400, "User ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(currentUser._id)) {
      return sendError(res, 400, "Invalid User ID format");
    }

    // Validate telegramId
    if (!telegramId) {
      return sendError(res, 400, "Telegram ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(telegramId)) {
      return sendError(res, 400, "Invalid telegram ID format");
    }

    const telegram = await Telegram.findById(telegramId);
    if (!telegram) {
      return sendError(res, 404, "Telegram ID not found");
    }

    if (!name) return sendError(res, 400, "Name is required");
    if (!description) return sendError(res, 400, "Description is required");
    if (!location) return sendError(res, 400, "Location is required");
    if (!logo) return sendError(res, 400, "Logo is required");
    if (!image) return sendError(res, 400, "Image is required");

    if (status && !["active", "inactive", "pending"].includes(status)) {
      return sendError(
        res,
        400,
        "Status must be 'active' or 'inactive' or 'pending'"
      );
    }

    // Ensure telegram.userId matches the logged-in user
    if (telegram.userId.toString() !== currentUser._id.toString()) {
      return sendError(res, 403, "You are not allowed to use this Telegram ID");
    }

    const newBusiness = new Business({
      userId: currentUser._id,
      telegramId,
      name,
      description,
      location,
      logo, 
      image,
      status: status || "active",
    });

    await newBusiness.save();

    const populatedBusiness = await Business.findById(newBusiness._id)
      .populate("userId", "name")
      .populate("telegramId", "name username phoneNumber");

    emitBusinessEvent("businessCreated", populatedBusiness);

    return sendSuccess(
      res,
      201,
      "Business created successfully",
      populatedBusiness
    );
  } catch (error) {
    next(error);
  }
};

export const getBusinesses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      userId,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};
    const currentUser = req.user;

    // Normal User: only see their own businesses
    if (currentUser?.roleId?.slug !== "admin") {
      query.userId = currentUser?._id;
    }

    // Admin can filter by any userId
    if (currentUser?.roleId?.slug === "admin" && userId) {
      query.userId = userId;
    }

    // Prevent normal users from filtering by userId (optional double-check)
    if (
      currentUser?.roleId?.slug !== "admin" &&
      userId &&
      userId !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to filter by userId.",
      });
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { location: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const businesses = await Business.find(query)
      .populate("userId", "name")
      .populate("telegramId", "name username phoneNumber")
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Business.countDocuments(query);

    return sendSuccess(res, 200, "Businesses fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: businesses,
    });
  } catch (error) {
    next(error);
  }
};

export const getBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Business Id format");
    }

    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    const populationBusiness = await Business.findById(business._id)
      .populate("userId", "name")
      .populate("telegramId", "name username phoneNumber");

    return sendSuccess(
      res,
      200,
      "Business fetched successfully",
      populationBusiness
    );
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, location, logo, image, status, telegramId } =
      req.body;
    const currentUser = req.user;

    //Check business id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Business Id format");
    }
    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    //Check telegram id
    if (!mongoose.Types.ObjectId.isValid(telegramId)) {
      return sendError(res, 400, "Invalid Telegram Id format");
    }
    const telegram = await Telegram.findById(telegramId);
    if (!telegram) {
      return sendError(res, 404, "Telegram not found");
    }

    // Ensure telegram.userId matches the logged-in user
    if (telegram.userId.toString() !== currentUser._id.toString()) {
      return sendError(res, 403, "You are not allowed to use this Telegram ID");
    }

    //Check status
    if (status && !["active", "inactive", "pending "].includes(status)) {
      return sendError(
        res,
        400,
        "Status must be 'active' or 'inactive' or 'pending"
      );
    }

    // Check permission: Only owner or admin can proceed
    if (
      currentUser._id.toString() !== business.userId.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can update this business."
      );
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { name, description, location, logo, image, status, telegramId },
      { new: true, runValidators: true }
    );

    const populatedBusiness = await Business.findById(updatedBusiness._id)
      .populate("userId", "name")
      .populate("telegramId", "name username phoneNumber");

    emitBusinessEvent("businessUpdated", populatedBusiness);

    return sendSuccess(
      res,
      200,
      "Business updated successfully",
      populatedBusiness
    );
  } catch (error) {
    next(error);
  }
};

export const deleteBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Business ID format");
    }

    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    // Check permission before deleting
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

    await Business.findByIdAndDelete(id);

    emitBusinessEvent("businessDeleted", id);

    return sendSuccess(res, 200, "Business deleted successfully");
  } catch (error) {
    next(error);
  }
};
