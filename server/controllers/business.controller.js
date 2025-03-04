import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import Telegram from "../models/telegram.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/v1/businesses:
 *   post:
 *     summary: Create a new business
 *     tags: [Business]
 *     description: This endpoint allows a user to create a new business by providing necessary details such as user ID, telegram ID, business name, description, location, logo, and status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID of the person creating the business.
 *               telegramId:
 *                 type: string
 *                 description: The telegram ID associated with the business.
 *               name:
 *                 type: string
 *                 description: The name of the business.
 *               description:
 *                 type: string
 *                 description: A description of the business.
 *               location:
 *                 type: string
 *                 description: The location of the business.
 *               logo:
 *                 type: string
 *                 description: The logo of the business.
 *               image:
 *                 type: string
 *                 description: An image representing the business.
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: The status of the business.
 *     responses:
 *       201:
 *         description: Business created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 telegramId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 location:
 *                   type: string
 *                 logo:
 *                   type: string
 *                 image:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad request, missing or invalid fields (e.g., user ID, telegram ID)
 *       404:
 *         description: User or Telegram not found
 *       500:
 *         description: Server error
 */

export const createBusiness = async (req, res, next) => {
  try {
    const { telegramId, name, description, location, logo, image, status } =
      req.body;
    const userId = req.user._id;

    //Request field
    if (!userId) {
      return sendError(res, 400, "User Id is required");
    }
    if (!name) {
      return sendError(res, 400, "Name is required");
    }
    if (!description) {
      return sendError(res, 400, "Description is required");
    }
    if (!location) {
      return sendError(res, 400, "Location is required");
    }
    if (!logo) {
      return sendError(res, 400, "Logo is required");
    }
    if (!image) {
      return sendError(res, 400, "Image is required");
    }

    //Check User
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user ID format");
    }
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    //Check Telegram
    if (!mongoose.Types.ObjectId.isValid(telegramId)) {
      return sendError(res, 400, "Invalid telegram ID format");
    }
    const telegram = await Telegram.findById(telegramId);
    if (!telegram) {
      return sendError(res, 404, "Telegram Id not found");
    }

    //Add into business database
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

    //Populated business
    const populationBusiness = await Business.findById(
      newBusiness._id
    ).populate("userId", "name ");

    return sendSuccess(
      res,
      201,
      "Business created successfully",
      populationBusiness
    );
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
      .populate("userId", "name")
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
    const { id } = req.params;

    //Check business id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Business Id format");
    }

    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    const populationBusiness = await Business.findById(business._id).populate(
      "userId",
      "name "
    );

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
    const { id } = req.params;
    const { name, description, location, logo, image, status, telegramId } =
      req.body;
    const userId = req.user._id;
    const userRole = req.user.roleId?.slug;

    //Check business id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Business Id format");
    }
    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, "Business not found");
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
      userId.toString() !== business.userId.toString() &&
      userRole !== "admin"
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
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.roleId?.slug;

    // Check business ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Business ID format");
    }

    // Fetch business first to verify ownership
    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, "Business not found");
    }

    // Check permission before deleting
    if (
      userId.toString() !== business.userId.toString() &&
      userRole !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can perform this action."
      );
    }

    // Delete the business after permission check
    await Business.findByIdAndDelete(id);

    return sendSuccess(res, 200, "Business deleted successfully");
  } catch (error) {
    next(error);
  }
};
