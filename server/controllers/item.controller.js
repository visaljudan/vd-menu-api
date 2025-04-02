import mongoose from "mongoose";
import Category from "../models/category.model.js";
// import Item from "../models/item.model.js";
import { sendError, sendSuccess } from "../utils/response.js";

// export const createItem = async (req, res, next) => {
//   try {
//     const { categoryId, name, description, price, image, meta, tags, status } =
//       req.body;

//     // Validate category
//     if (!categoryId) {
//       return sendError(res, 400, "Category ID is required.");
//     }

//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//       return sendError(res, 400, "Invalid Category ID format.");
//     }
//     const category = await Category.findById(categoryId);
//     if (!category) return sendError(res, 400, "Invalid category ID");

//     // Extract businessId from category
//     const businessId = category.businessId;

//     const newItem = await Item.create({
//       businessId,
//       categoryId,
//       name,
//       description,
//       price,
//       image,
//       meta,
//       tags,
//       status,
//     });

//     return sendSuccess(res, 201, "Item created successfully", newItem);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @swagger
//  * /api/v1/items:
//  *   get:
//  *     summary: Get a list of items
//  *     tags: [Items]
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *         description: Page number
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         description: Number of items per page
//  *       - in: query
//  *         name: search
//  *         schema:
//  *           type: string
//  *         description: Search term for item name or description
//  *     responses:
//  *       200:
//  *         description: List of items fetched successfully
//  *       500:
//  *         description: Server error
//  */
// export const getItems = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;
//     const skip = (page - 1) * limit;

//     const query = {};
//     if (search) {
//       query.$or = [
//         { name: { $regex: new RegExp(search, "i") } },
//         { description: { $regex: new RegExp(search, "i") } },
//       ];
//     }

//     const items = await Item.find(query).skip(skip).limit(Number(limit));
//     const total = await Item.countDocuments(query);

//     return sendSuccess(res, 200, "Items fetched successfully", {
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       data: items,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @swagger
//  * /api/v1/items/{id}:
//  *   get:
//  *     summary: Get a single item by ID
//  *     tags: [Items]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The item ID
//  *     responses:
//  *       200:
//  *         description: Item fetched successfully
//  *       404:
//  *         description: Item not found
//  *       500:
//  *         description: Server error
//  */

// export const getItem = async (req, res, next) => {
//   try {
//     const item = await Item.findById(req.params.id);
//     if (!item) return sendError(res, 404, "Item not found");

//     return sendSuccess(res, 200, "Item fetched successfully", item);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @swagger
//  * /api/v1/items/{id}:
//  *   put:
//  *     summary: Update an item by ID
//  *     tags: [Items]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The item ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               price:
//  *                 type: number
//  *               image:
//  *                 type: string
//  *               meta:
//  *                 type: object
//  *               tags:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *               status:
//  *                 type: string
//  *                 enum: [active, inactive]
//  *     responses:
//  *       200:
//  *         description: Item updated successfully
//  *       404:
//  *         description: Item not found
//  *       500:
//  *         description: Server error
//  */
// export const updateItem = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { categoryId, name, description, price, image, meta, tags, status } =
//       req.body;
//     const userId = req.user._id;
//     const userRole = req.user.roleId?.slug;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendError(res, 400, "Invalid item ID format");
//     }

//     const item = await Item.findById(id);
//     if (!item) {
//       return sendError(res, 404, "Item not found");
//     }

//     // Validate category if it's being changed
//     let businessId = item.businessId;
//     if (categoryId && categoryId !== item.categoryId.toString()) {
//       const category = await Category.findById(categoryId);
//       if (!category) return sendError(res, 400, "Invalid category ID");
//       businessId = category.businessId;
//     }

//     // Check permission: Only the business owner or an admin can update
//     const business = await Business.findById(businessId);
//     if (!business) {
//       return sendError(res, 404, "Business not found");
//     }

//     if (
//       userId.toString() !== business.userId.toString() &&
//       userRole !== "admin"
//     ) {
//       return sendError(
//         res,
//         403,
//         "Permission denied: Only the business owner or an admin can update this item."
//       );
//     }

//     // Update item fields
//     item.categoryId = categoryId || item.categoryId;
//     item.businessId = businessId;
//     if (name) item.name = name;
//     if (description) item.description = description;
//     if (price) item.price = price;
//     if (image) item.image = image;
//     if (meta) item.meta = meta;
//     if (tags) item.tags = tags;
//     if (status) {
//       if (!["active", "inactive"].includes(status)) {
//         return sendError(res, 400, "Status must be 'active' or 'inactive'");
//       }
//       item.status = status;
//     }

//     await item.save();

//     return sendSuccess(res, 200, "Item updated successfully", item);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @swagger
//  * /api/v1/items/{id}:
//  *   delete:
//  *     summary: Delete an item by ID
//  *     tags: [Items]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The item ID
//  *     responses:
//  *       200:
//  *         description: Item deleted successfully
//  *       404:
//  *         description: Item not found
//  *       500:
//  *         description: Server error
//  */
// export const deleteItem = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;
//     const userRole = req.user.roleId?.slug;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendError(res, 400, "Invalid item ID format");
//     }

//     const item = await Item.findById(id);
//     if (!item) {
//       return sendError(res, 404, "Item not found");
//     }

//     // Fetch business to check ownership
//     const business = await Business.findById(item.businessId);
//     if (!business) {
//       return sendError(res, 404, "Business not found");
//     }

//     // Permission check: Only the business owner or an admin can delete the item
//     if (
//       userId.toString() !== business.userId.toString() &&
//       userRole !== "admin"
//     ) {
//       return sendError(
//         res,
//         403,
//         "Permission denied: Only the business owner or an admin can delete this item."
//       );
//     }

//     await Item.findByIdAndDelete(id);

//     emitItemEvent("itemDeleted", id);

//     return sendSuccess(res, 200, "Item deleted successfully");
//   } catch (error) {
//     next(error);
//   }
// };
