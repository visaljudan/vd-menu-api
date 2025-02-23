import Item from "../models/Item.js";
import { sendError, sendSuccess } from "../utils/responseHandler.js";

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *               - price
 *               - image
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: ID of the category
 *               name:
 *                 type: string
 *                 description: Name of the item
 *               description:
 *                 type: string
 *                 description: Description of the item
 *               price:
 *                 type: number
 *                 description: Price of the item
 *               image:
 *                 type: string
 *                 description: Image URL of the item
 *               meta:
 *                 type: object
 *                 description: Additional metadata
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the item
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Status of the item
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Invalid category ID
 *       500:
 *         description: Server error
 */
export const createItem = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, image, meta, tags, status } =
      req.body;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) return sendError(res, 400, "Invalid category ID");

    const newItem = await Item.create({
      categoryId,
      name,
      description,
      price,
      image,
      meta,
      tags,
      status,
    });

    return sendSuccess(res, 201, "Item created successfully", newItem);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get a list of items
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for item name or description
 *     responses:
 *       200:
 *         description: List of items fetched successfully
 *       500:
 *         description: Server error
 */
export const getItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ];
    }

    const items = await Item.find(query).skip(skip).limit(Number(limit));
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

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Item fetched successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */

export const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return sendError(res, 404, "Item not found");

    return sendSuccess(res, 200, "Item fetched successfully", item);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               meta:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
export const updateItem = async (req, res, next) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) return sendError(res, 404, "Item not found");

    return sendSuccess(res, 200, "Item updated successfully", updatedItem);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
export const deleteItem = async (req, res, next) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return sendError(res, 404, "Item not found");

    return sendSuccess(res, 200, "Item deleted successfully");
  } catch (error) {
    next(error);
  }
};
