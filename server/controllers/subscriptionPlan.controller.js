import mongoose from "mongoose";
import SubscriptionPlan from "../models/subscriptionPlan.model.js";
import { sendError, sendSuccess } from "../utils/response.js";

/**
 * @swagger
 * /api/v1/subscription-plans:
 *   post:
 *     summary: Create a new subscription plan
 *     description: Adds a new subscription plan with name, price, duration, features, and other properties.
 *     tags:
 *       - Subscription Plans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *               - feature
 *               - maxBusiness
 *               - maxCategory
 *               - maxItem
 *               - analysisType
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Plan"
 *               price:
 *                 type: number
 *                 example: 29.99
 *               duration:
 *                 type: integer
 *                 example: 30
 *               feature:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Advanced Analytics", "Priority Support"]
 *               maxBusiness:
 *                 type: integer
 *                 example: 5
 *               maxCategory:
 *                 type: integer
 *                 example: 10
 *               maxItem:
 *                 type: integer
 *                 example: 100
 *               analysisType:
 *                 type: string
 *                 enum: ["basic", "advanced"]
 *                 example: "advanced"
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Subscription plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription plan created successfully"
 *                 plan:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65a1234567b89c0123d45678"
 *                     name:
 *                       type: string
 *                       example: "Premium Plan"
 *                     price:
 *                       type: number
 *                       example: 29.99
 *                     duration:
 *                       type: integer
 *                       example: 30
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Validation error or missing fields
 *       409:
 *         description: Subscription plan with the same name or slug already exists
 *       500:
 *         description: Server error
 */

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

    // Validate required fields
    if (
      !name ||
      !price ||
      !duration ||
      !feature ||
      !maxBusiness ||
      !maxCategory ||
      !maxItem ||
      !analysisType
    ) {
      return sendError(res, 400, "All required fields must be provided.");
    }

    // Check if plan name already exists
    const existingPlan = await SubscriptionPlan.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingPlan) {
      return sendError(res, 409, "Subscription plan name already exists.");
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existingSlug = await SubscriptionPlan.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    });
    if (existingSlug) {
      return sendError(res, 409, "Subscription plan slug already exists.");
    }

    // Validate status
    const validStatus = status || "active";
    if (!["active", "inactive"].includes(validStatus)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'.");
    }

    // Create new subscription plan
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
      status: validStatus,
    });

    await plan.save();

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

/**
 * @swagger
 * /api/v1/subscription-plans:
 *   get:
 *     summary: Get a list of subscription plans
 *     description: Retrieve a paginated list of subscription plans with sorting and search functionality.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number (default = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of plans per page (default = 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (default = createdAt)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (default = desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or slug
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65a1234567b89c0123d45678"
 *                       name:
 *                         type: string
 *                         example: "Premium Plan"
 *                       slug:
 *                         type: string
 *                         example: "premium-plan"
 *                       price:
 *                         type: number
 *                         example: 29.99
 *                       duration:
 *                         type: integer
 *                         example: 30
 *                       feature:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Advanced Analytics", "Priority Support"]
 *                       maxBusiness:
 *                         type: integer
 *                         example: 5
 *                       maxCategory:
 *                         type: integer
 *                         example: 10
 *                       maxItem:
 *                         type: integer
 *                         example: 100
 *                       analysisType:
 *                         type: string
 *                         example: "advanced"
 *                       status:
 *                         type: string
 *                         example: "active"
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   get:
 *     summary: Get a subscription plan by ID
 *     description: Retrieve details of a specific subscription plan using its ID.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the subscription plan.
 *     responses:
 *       200:
 *         description: Subscription plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription plan fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65a1234567b89c0123d45678"
 *                     name:
 *                       type: string
 *                       example: "Premium Plan"
 *                     price:
 *                       type: number
 *                       example: 29.99
 *                     duration:
 *                       type: integer
 *                       example: 30
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Invalid subscription plan ID format
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   patch:
 *     summary: Update a subscription plan
 *     description: Update the details of a subscription plan by its ID.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the subscription plan to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Plan"
 *               price:
 *                 type: number
 *                 example: 29.99
 *               duration:
 *                 type: integer
 *                 example: 30
 *               feature:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Feature1", "Feature2"]
 *               maxBusiness:
 *                 type: integer
 *                 example: 10
 *               maxCategory:
 *                 type: integer
 *                 example: 5
 *               maxItem:
 *                 type: integer
 *                 example: 100
 *               analysisType:
 *                 type: string
 *                 enum: ["basic", "advanced"]
 *                 example: "basic"
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription plan updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65a1234567b89c0123d45678"
 *                     name:
 *                       type: string
 *                       example: "Premium Plan"
 *                     price:
 *                       type: number
 *                       example: 29.99
 *                     duration:
 *                       type: integer
 *                       example: 30
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Invalid subscription plan ID format or missing required fields
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */

export const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid subscription plan ID format");
    }

    // Destructure body fields
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

    // Find and update the subscription plan by ID
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        name,
        price,
        duration,
        feature,
        maxBusiness,
        maxCategory,
        maxItem,
        analysisType,
        status,
      },
      { new: true, runValidators: true } // Return the updated document and validate
    );

    if (!plan) {
      return sendError(res, 404, "Subscription plan not found");
    }

    return sendSuccess(
      res,
      200,
      "Subscription plan updated successfully",
      plan
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan
 *     description: Deletes a subscription plan by its ID.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the subscription plan to delete.
 *     responses:
 *       200:
 *         description: Subscription plan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription plan deleted successfully"
 *       400:
 *         description: Invalid subscription plan ID format
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */

export const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid subscription plan ID format");
    }

    // Find and delete the subscription plan
    const plan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!plan) {
      return sendError(res, 404, "Subscription plan not found");
    }

    return sendSuccess(res, 200, "Subscription plan deleted successfully");
  } catch (error) {
    next(error);
  }
};
