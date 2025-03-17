import express from "express";
import {
  createTelegram,
  deleteTelegram,
  getTelegram,
  getTelegrams,
  updateTelegram,
} from "../controllers/telegram.controller.js";
import { auth } from "../utils/verify.js";

const telegramRouter = express.Router();

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
 *       400:
 *         description: Bad request due to missing required fields
 *       500:
 *         description: Internal server error
 */

telegramRouter.post("/", auth, createTelegram);

/**
 * @swagger
 * /api/v1/telegrams:
 *   get:
 *     summary: Get a list of Telegrams with filtering, pagination, and sorting
 *     tags:
 *       - Telegrams
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default is 10)
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (default is createdAt)
 *         example: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *         example: desc
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for name, username, or phoneNumber
 *         example: john
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by specific user ID (only for admin)
 *         example: 65f5c080fe3cb9a123456789
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by telegram status (e.g., active, inactive)
 *         example: active
 *     responses:
 *       200:
 *         description: Telegrams fetched successfully
 *       403:
 *         description: Unauthorized filter attempt by non-admin user
 *       500:
 *         description: Internal server error
 */

telegramRouter.get("/", auth, getTelegrams);

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
 *       404:
 *         description: Telegram with the provided ID was not found.
 *       500:
 *         description: Internal server error
 */

telegramRouter.get("/:id", auth, getTelegram);

/**
 * @swagger
 * /api/v1/telegrams/{id}:
 *   patch:
 *     summary: Update a Telegram entry
 *     tags:
 *       - Telegrams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram ID to update
 *         example: 65f5c0a1fe3cb9a123456789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Telegram Bot Updated
 *               username:
 *                 type: string
 *                 example: updated_telegram_user
 *               phoneNumber:
 *                 type: string
 *                 example: +85598765432
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       200:
 *         description: Telegram updated successfully
 *       400:
 *         description: Invalid ID format or invalid status value
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Telegram not found
 *       500:
 *         description: Internal server error
 */

telegramRouter.patch("/:id", auth, updateTelegram);

/**
 * @swagger
 * /api/v1/telegrams/{id}:
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
 *         description: Telegram updated successfully
 *       400:
 *         description: Invalid ID format or invalid status value
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Telegram not found
 *       500:
 *         description: Internal server error
 */

telegramRouter.delete("/:id", auth, deleteTelegram);

export default telegramRouter;
