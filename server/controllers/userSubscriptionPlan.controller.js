import mongoose from "mongoose";
import User from "../models/user.model.js";
import SubscriptionPlan from "../models/subscriptionPlan.model.js";
import UserSubscriptionPlan from "../models/userSubscriptionPlan.model.js";
import { sendError, sendSuccess } from "../utils/response.js";

/**
 * @swagger
 * /api/v1/user-subscription-plans:
 *   post:
 *     tags:
 *       - User Subscription Plans
 *     summary: Create a new user subscription plan
 *     description: Allows a user to subscribe to a plan, automatically calculating the end date based on the plan's duration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - subscriptionPlanId
 *               - startDate
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user subscribing to the plan.
 *                 example: "65a0e4e2f4b3c4a1d9a12b34"
 *               subscriptionPlanId:
 *                 type: string
 *                 description: The ID of the subscription plan.
 *                 example: "65a1e4e2f4b3c4a1d9a12b45"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the subscription (YYYY-MM-DD).
 *                 example: "2025-02-01"
 *               status:
 *                 type: string
 *                 enum: [active, pending, canceled]
 *                 description: The status of the subscription. Defaults to "active".
 *                 example: "active"
 *     responses:
 *       201:
 *         description: User subscription plan created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User subscription plan created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65a1f4e2f4b3c4a1d9a12b78"
 *                     userId:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "65a0e4e2f4b3c4a1d9a12b34"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         username:
 *                           type: string
 *                           example: "johndoe123"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                     subscriptionPlanId:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "65a1e4e2f4b3c4a1d9a12b45"
 *                         name:
 *                           type: string
 *                           example: "Premium Plan"
 *                         price:
 *                           type: number
 *                           example: 19.99
 *                         duration:
 *                           type: integer
 *                           example: 3
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-01"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-05-01"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User ID is required."
 *       404:
 *         description: User or subscription plan not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found."
 *       409:
 *         description: Conflict - user already has an active subscription.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User already has an active subscription plan."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

export const createUserSubscriptionPlan = async (req, res, next) => {
  try {
    const { userId, subscriptionPlanId, startDate, status } = req.body;

    if (!userId) {
      return sendError(res, 400, "User ID is required.");
    }
    if (!subscriptionPlanId) {
      return sendError(res, 400, "Subscription Plan ID is required.");
    }
    if (!startDate) {
      return sendError(res, 400, "Start Date is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user ID format");
    }
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    if (!mongoose.Types.ObjectId.isValid(subscriptionPlanId)) {
      return sendError(res, 400, "Invalid subscription plan ID format");
    }
    const plan = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!plan) {
      return sendError(res, 404, "Subscription Plan not found.");
    }

    if (!plan.duration || plan.duration <= 0) {
      return sendError(res, 400, "Invalid subscription plan duration.");
    }

    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const existingSubscription = await UserSubscriptionPlan.findOne({
      userId,
      status: "active",
    });

    if (existingSubscription) {
      return sendError(
        res,
        409,
        "User already has an active subscription plan."
      );
    }

    const newSubscription = new UserSubscriptionPlan({
      userId,
      subscriptionPlanId,
      startDate,
      endDate,
      status: status || "active",
    });

    await newSubscription.save();

    const populatedUserSubscriptionPlan = await UserSubscriptionPlan.findById(
      newSubscription._id
    )
      .populate("userId", "name username email")
      .populate("subscriptionPlanId", "name price duration");

    return sendSuccess(
      res,
      201,
      "User subscription plan created successfully",
      populatedUserSubscriptionPlan
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/user-subscription-plans:
 *   get:
 *     tags:
 *       - User Subscription Plans
 *     summary: Retrieve all user subscription plans with pagination and sorting
 *     description: Fetch a list of User Subscription Plans with pagination, sorting, and optional filtering by user or plan.
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (default is 1).
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of userSubscriptionPlans per page (default is 10).
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: sort
 *         in: query
 *         description: Field to sort by (default is createdAt).
 *         schema:
 *           type: string
 *           example: subscription_start_date
 *       - name: order
 *         in: query
 *         description: Sorting order, either asc or desc (default is desc).
 *         schema:
 *           type: string
 *           example: desc
 *       - name: userId
 *         in: query
 *         description: Filter by user ID.
 *         schema:
 *           type: string
 *           example: 63f1072e98a92e05e4d21d1b
 *       - name: planId
 *         in: query
 *         description: Filter by subscription plan ID.
 *         schema:
 *           type: string
 *           example: 63f1084b7b92d72f10c21e4f
 *     responses:
 *       200:
 *         description: List of user subscription plans retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User Subscription Plans retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: sub1674859347845
 *                       userId:
 *                         type: string
 *                         example: 63f1072e98a92e05e4d21d1b
 *                       subscriptionPlan:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 63f1084b7b92d72f10c21e4f
 *                           name:
 *                             type: string
 *                             example: Premium Plan
 *                           price:
 *                             type: number
 *                             example: 10.99
 *                       subscription_status:
 *                         type: string
 *                         example: active
 *                       subscription_start_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T12:00:00Z"
 *                       subscription_end_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-31T12:00:00Z"
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unable to retrieve User Subscription Plans.
 */

export const getUserSubscriptionPlans = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "subscription_start_date",
      order = "desc",
      userId,
      planId,
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};
    if (userId) query.userId = userId;
    if (planId) query.subscriptionPlanId = planId;

    const [userSubscriptionPlans, total] = await Promise.all([
      UserSubscriptionPlan.find(query)
        .populate("userId", "name username email")
        .populate("subscriptionPlanId", "name price duration")
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limitNumber),
      UserSubscriptionPlan.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      "User Subscription Plans retrieved successfully",
      {
        total,
        page: pageNumber,
        limit: limitNumber,
        data: userSubscriptionPlans,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/user-subscription-plans/{id}:
 *   get:
 *     summary: Get user subscription plan
 *     description: Fetches a user's subscription plan by ID.
 *     tags:
 *       - User Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the user subscription plan to fetch.
 *     responses:
 *       200:
 *         description: Successfully fetched the user subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User subscription plan fetched successfully"
 *                 userSubscriptionPlan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65a1234567b89c0123d45678"
 *                     userId:
 *                       type: string
 *                       example: "65a9876543b21c0987d65432"
 *                     subscriptionPlanId:
 *                       type: string
 *                       example: "65a5678901b23c0456d78901"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T23:59:59.999Z"
 *                     status:
 *                       type: string
 *                       enum: ["active", "expired", "cancelled"]
 *                       example: "active"
 *       400:
 *         description: Invalid subscription plan ID format
 *       404:
 *         description: User subscription plan not found
 *       500:
 *         description: Server error
 */

export const getUserSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user subscription plan ID format");
    }

    const userSubscriptionPlan = await UserSubscriptionPlan.findById(id)
      .populate("userId", "name email")
      .populate("subscriptionPlanId", "name price duration");

    if (!userSubscriptionPlan) {
      return sendError(res, 404, "User subscription plan not found");
    }

    return sendSuccess(
      res,
      200,
      "User subscription plan fetched successfully",
      userSubscriptionPlan
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/user-subscription-plans/{id}:
 *   patch:
 *     summary: Update User Subscription Plan
 *     description: Update a user's subscription plan details.
 *     tags:
 *       - User Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user subscription plan to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *               subscriptionPlanId:
 *                 type: string
 *                 description: The ID of the subscription plan.
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date of the subscription.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date of the subscription.
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: The status of the subscription plan.
 *     responses:
 *       200:
 *         description: User Subscription Plan updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     subscriptionPlanId:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *       400:
 *         description: Invalid request parameters.
 *       404:
 *         description: User Subscription Plan not found.
 */

export const updateUserSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, subscriptionPlanId, startDate, endDate, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid User Subscription Plan ID format");
    }

    const userSubscriptionPlan = await UserSubscriptionPlan.findById(id);
    if (!userSubscriptionPlan) {
      return sendError(res, 404, "User Subscription Plan not found");
    }

    if (userId) userSubscriptionPlan.userId = userId;
    if (subscriptionPlanId)
      userSubscriptionPlan.subscriptionPlanId = subscriptionPlanId;
    if (startDate) userSubscriptionPlan.startDate = startDate;
    if (endDate) userSubscriptionPlan.endDate = endDate;
    if (status) userSubscriptionPlan.status = status;

    await userSubscriptionPlan.save();

    return sendSuccess(
      res,
      200,
      "User Subscription Plan updated successfully",
      userSubscriptionPlan
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/user-subscription-plans/{id}:
 *   delete:
 *     summary: Delete User Subscription Plan
 *     description: Deletes a user's subscription plan by ID.
 *     tags:
 *       - User Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user subscription plan to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User Subscription Plan deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User subscription plan deleted successfully."
 *       400:
 *         description: Bad request (missing or invalid ID).
 *       404:
 *         description: User Subscription Plan not found.
 */

export const deleteUserSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, "Subscription plan ID is required.");
    }

    const userSubscriptionPlan = await UserSubscriptionPlan.findById(id);
    if (!userSubscriptionPlan) {
      return sendError(res, 404, "User subscription plan not found.");
    }

    await UserSubscriptionPlan.findByIdAndDelete(id);

    return sendSuccess(
      res,
      200,
      "User subscription plan deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};
