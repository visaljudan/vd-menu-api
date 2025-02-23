import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import Telegram from "../models/telegram.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import mongoose from "mongoose";

/**
 * @swagger
 * /businesses:
 *   post:
 *     summary: Create a new business
 *     tags: [Business]
 *     description: Create a new business with provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       201:
 *         description: Business created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       400:
 *         description: Bad request (e.g., missing or invalid data)
 */

export const createBusiness = async (req, res, next) => {
  try {
    const {
      userId,
      telegramId,
      name,
      description,
      location,
      logo,
      image,
      status,
    } = req.body;

    if (!userId) {
      return sendError(res, 400, "User Id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user ID format");
    }
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (!mongoose.Types.ObjectId.isValid(telegramId)) {
      return sendError(res, 400, "Invalid telegram ID format");
    }
    const telegram = await Telegram.findById(telegramId);
    if (!telegram) {
      return sendError(res, 404, "Telegram Id not found");
    }

    const newBusiness = new Business({
      userId,
      telegramId,
      name,
      description,
      location,
      logo,
      image,
      status,
    });

    await newBusiness.save();

    return sendSuccess(res, 201, "Business created successfully", newBusiness);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/businesses:
 *   get:
 *     summary: Get a list of businesses
 *     tags: [Business]
 *     description: Fetches businesses with pagination, sorting, and search options.
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of businesses per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: Search businesses by name, description, or location
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of businesses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Business'
 */

export const getBusinesses = async (req, res, next) => {
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
        { description: { $regex: new RegExp(search, "i") } },
        { location: { $regex: new RegExp(search, "i") } },
      ];
    }

    const businesses = await Business.find(query)
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

/**
 * @swagger
 * /businesses/{id}:
 *   get:
 *     summary: Get a specific business by ID
 *     tags: [Business]
 *     description: Fetches a single business by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the business to fetch
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The business details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */

export const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) return sendError(res, 404, "Business not found");

    return sendSuccess(res, 200, "Business fetched successfully", business);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/businesses/{id}:
 *   patch:
 *     summary: Update a business by ID
 *     tags: [Business]
 *     description: Updates the details of an existing business by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the business to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       200:
 *         description: Business updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 *       400:
 *         description: Bad request (e.g., missing or invalid data)
 */

export const updateBusiness = async (req, res, next) => {
  try {
    const { name, description, location, logo, image, status, telegramId } =
      req.body;

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      { name, description, location, logo, image, status, telegramId },
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) return sendError(res, 404, "Business not found");

    return sendSuccess(
      res,
      200,
      "Business updated successfully",
      updatedBusiness
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/businesses/{id}:
 *   delete:
 *     summary: Delete a business by ID
 *     tags: [Business]
 *     description: Deletes a business by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the business to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business deleted successfully
 *       404:
 *         description: Business not found
 */

export const deleteBusiness = async (req, res, next) => {
  try {
    const deletedBusiness = await Business.findByIdAndDelete(req.params.id);

    if (!deletedBusiness) return sendError(res, 404, "Business not found");

    return sendSuccess(res, 200, "Business deleted successfully");
  } catch (error) {
    next(error);
  }
};
