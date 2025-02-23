import mongoose from "mongoose";
import Telegram from "../models/telegram.model.js";
import { sendSuccess, sendError } from "../utils/response.js";
/**
 * @swagger
 * /api/v1/telegrams:
 *  post:
 *     summary: Create a new Telegram entry
 *     description: Adds a new Telegram entry to the database.
 *     tags:
 *       - Telegrams
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe123"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Telegram entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Telegram entry created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "12345"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "johndoe123"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Bad request due to missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: userId and phoneNumber are required
 *       500:
 *         description: Internal server error
 */

export const createTelegram = async (req, res, next) => {
  try {
    const { name, username, phoneNumber, status } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return sendError(res, 400, "User id is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user ID format");
    }

    if (!phoneNumber) {
      return sendError(res, 400, "Phone number is required.");
    }

    const newTelegram = new Telegram({
      userId,
      name,
      username,
      phoneNumber,
      status,
    });

    await newTelegram.save();

    return sendSuccess(
      res,
      201,
      "Telegram entry created successfully",
      newTelegram
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/telegrams:
 *   get:
 *     summary: Get a list of telegrams
 *     description: Fetch telegrams with pagination, sorting, and optional filtering by userId and search term.
 *     tags:
 *       - Telegrams
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (default is 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of records per page (default is 10)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sort
 *         in: query
 *         description: Field to sort by (default is "createdAt")
 *         required: false
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - name: order
 *         in: query
 *         description: Sort order (either "asc" or "desc", default is "desc")
 *         required: false
 *         schema:
 *           type: string
 *           default: "desc"
 *       - name: search
 *         in: query
 *         description: Search term to filter by name, username, or phoneNumber
 *         required: false
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         description: Filter telegrams by userId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of telegrams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Telegrams fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "id1"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           username:
 *                             type: string
 *                             example: "john_doe"
 *                           phoneNumber:
 *                             type: string
 *                             example: "123456789"
 *                           createdAt:
 *                             type: string
 *                             example: "2025-02-22T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 */

export const getTelegrams = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      userId,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { username: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (userId) {
      query.userId = userId;
    }

    const telegrams = await Telegram.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Telegram.countDocuments(query);

    return sendSuccess(res, 200, "Telegrams fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: telegrams,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/telegrams/{id}:
 *   get:
 *     summary: Get a specific telegram by ID
 *     description: Fetch a single telegram using its unique ID.
 *     tags:
 *       - Telegrams
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the telegram to retrieve
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b8f5f1b2c001f1d1a2b"
 *     responses:
 *       200:
 *         description: The requested telegram was found and returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Telegram fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b8f5f1b2c001f1d1a2b"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     phoneNumber:
 *                       type: string
 *                       example: "1234567890"
 *                     userId:
 *                       type: string
 *                       example: "607c72b8f5f1b2c001f1d1a3d"
 *                     createdAt:
 *                       type: string
 *                       example: "2025-02-22T00:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       example: "2025-02-22T00:00:00.000Z"
 *       404:
 *         description: Telegram with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Telegram not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

export const getTelegram = async (req, res, next) => {
  try {
    const telegram = await Telegram.findById(req.params.id);
    if (!telegram) return sendError(res, 404, "Telegram not found");

    return sendSuccess(res, 200, "Telegram fetched successfully", telegram);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/telegrams/{id}:
 *   put:
 *     summary: Update a specific telegram by ID
 *     description: Update a telegram's details such as name, username, phone number, and status.
 *     tags:
 *       - Telegrams
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the telegram to update
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b8f5f1b2c001f1d1a2b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       200:
 *         description: The telegram was updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Telegram updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b8f5f1b2c001f1d1a2b"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     phoneNumber:
 *                       type: string
 *                       example: "1234567890"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     updatedAt:
 *                       type: string
 *                       example: "2025-02-22T00:00:00.000Z"
 *       404:
 *         description: Telegram with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Telegram not found
 *       400:
 *         description: Invalid data or request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid request data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

export const updateTelegram = async (req, res, next) => {
  try {
    const { name, username, phoneNumber, status } = req.body;

    const updatedTelegram = await Telegram.findByIdAndUpdate(
      req.params.id,
      { name, username, phoneNumber, status },
      { new: true, runValidators: true }
    );

    if (!updatedTelegram) return sendError(res, 404, "Telegram not found");

    return sendSuccess(
      res,
      200,
      "Telegram updated successfully",
      updatedTelegram
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/telegrams/{id}:
 *   delete:
 *     summary: Delete a specific telegram by ID
 *     description: Delete a telegram using its unique ID.
 *     tags:
 *       - Telegrams
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the telegram to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b8f5f1b2c001f1d1a2b"
 *     responses:
 *       200:
 *         description: The telegram was deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Telegram deleted successfully
 *       404:
 *         description: Telegram with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Telegram not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

export const deleteTelegram = async (req, res, next) => {
  try {
    const deletedTelegram = await Telegram.findByIdAndDelete(req.params.id);
    if (!deletedTelegram) return sendError(res, 404, "Telegram not found");

    return sendSuccess(res, 200, "Telegram deleted successfully");
  } catch (error) {
    next(error);
  }
};
