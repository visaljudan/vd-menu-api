import mongoose from "mongoose";
import SubscriptionPlan from "../models/subscriptionPlan.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitSubscriptionPlan } from "../utils/socketioFunctions.js";

export const createSubscriptionPlan = async (req, res, next) => {
  try {
    const {
      name,
      price,
      duration,
      feature,
      maxBusiness,
      maxCategory,
      maxItem,
      analysisType,
      status,
    } = req.body;

    if (!name) {
      return sendError(res, 400, "Package name is required.");
    }
    if (!price) {
      return sendError(res, 400, "Package price is required.");
    }
    if (!duration) {
      return sendError(res, 400, "Package duration is required.");
    }
    if (!feature) {
      return sendError(res, 400, "Package feature is required.");
    }
    if (!maxBusiness) {
      return sendError(res, 400, "Maximum business count is required.");
    }
    if (!maxCategory) {
      return sendError(res, 400, "Maximum category count is required.");
    }
    if (!maxItem) {
      return sendError(res, 400, "Maximum item count is required.");
    }
    if (!analysisType) {
      return sendError(res, 400, "Analysis type is required.");
    }

    const existingPlan = await SubscriptionPlan.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingPlan) {
      return sendError(res, 409, "Subscription plan name already exists.");
    }

    const slug = name?.toLowerCase().replace(/\s+/g, "-");
    const existingSlug = await SubscriptionPlan.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    });
    if (existingSlug) {
      return sendError(res, 409, "Subscription plan slug already exists.");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    const plan = new SubscriptionPlan({
      name,
      slug,
      price,
      duration,
      feature,
      maxBusiness,
      maxCategory,
      maxItem,
      analysisType,
      status: status || "active",
    });

    await plan.save();

    emitSubscriptionPlan("subscriptionPlanCreated", plan);

    return sendSuccess(
      res,
      201,
      "Subscription plan created successfully",
      plan
    );
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionPlans = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
    } = req.query;

    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { slug: { $regex: new RegExp(search, "i") } },
      ];
    }

    const plans = await SubscriptionPlan.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SubscriptionPlan.countDocuments(query);

    return sendSuccess(res, 200, "Subscription plans fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid subscription plan ID format");
    }

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return sendError(res, 404, "Subscription plan not found");
    }

    return sendSuccess(
      res,
      200,
      "Subscription plan fetched successfully",
      plan
    );
  } catch (error) {
    next(error);
  }
};

export const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      duration,
      feature,
      maxBusiness,
      maxCategory,
      maxItem,
      analysisType,
      status,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Subscription Plan ID format");
    }

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return sendError(res, 404, "Subscription plan not found");
    }

    const existingPlan = await SubscriptionPlan.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingPlan) {
      return sendError(res, 409, "Subscription plan name already exists.");
    }

    const slug = name?.toLowerCase().replace(/\s+/g, "-");
    const existingSlug = await SubscriptionPlan.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    });
    if (existingSlug) {
      return sendError(res, 409, "Subscription plan slug already exists.");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        price,
        duration,
        feature,
        maxBusiness,
        maxCategory,
        maxItem,
        analysisType,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    emitSubscriptionPlan("subscriptionPlanUpdated", updatedPlan);

    return sendSuccess(
      res,
      200,
      "Subscription plan updated successfully",
      updatedPlan
    );
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid subscription plan ID format");
    }

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return sendError(res, 404, "Subscription Plan not found");
    }

    await SubscriptionPlan.findByIdAndDelete(id);

    emitSubscriptionPlan("subscriptionPlanDeleted", id);

    return sendSuccess(res, 200, "Subscription plan deleted successfully");
  } catch (error) {
    next(error);
  }
};
