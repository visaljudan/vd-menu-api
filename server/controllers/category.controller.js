import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitCategoryEvent } from "../utils/socketioFunctions.js";

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with the given name, description, and status.
 *     operationId: createCategory
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the category
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 description: A brief description of the category
 *                 example: "Category for electronic products"
 *               status:
 *                 type: string
 *                 description: The status of the category (active or inactive)
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     slug:
 *                       type: string
 *                       example: "electronics"
 *                     description:
 *                       type: string
 *                       example: "Category for electronic products"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Bad request due to missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name is required to create a category"
 *       409:
 *         description: Conflict due to category name or slug already existing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category name already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return sendError(res, 400, "Name is required to create a category");
    }

    const existingName = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingName) {
      return sendError(res, 409, "Category name already exists");
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existingSlug = await Category.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    });

    if (existingSlug) {
      return sendError(res, 409, "Category slug already exists");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    const newCategoryStatus = status || "active";

    const category = new Category({
      name,
      slug,
      description,
      status: newCategoryStatus,
    });

    await category.save();

    emitCategoryEvent("categoryCreated", category);

    return sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Retrieve a list of categories
 *     description: Fetch all categories with optional pagination, sorting, and search capabilities.
 *     operationId: getCategories
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of categories per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: name
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *         description: Order of sorting
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: electronics
 *         description: Search string to filter categories by name, slug, or description
 *     responses:
 *       '200':
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Categories fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 */

export const getCategories = async (req, res, next) => {
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
        { description: { $regex: new RegExp(search, "i") } },
      ];
    }

    const categories = await Category.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    return sendSuccess(res, 200, "Categories fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Fetch a category by its ID
 *     description: Fetches the category details based on the given category ID.
 *     operationId: getCategory
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique ID of the category
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category fetched successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     slug:
 *                       type: string
 *                       example: "electronics"
 *                     description:
 *                       type: string
 *                       example: "Category for electronic products"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Invalid category ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid category ID format"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid category ID format");
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    return sendSuccess(res, 200, "Category fetched successfully", category);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: "Update a category by its ID"
 *     description: "Updates the category details based on the given category ID."
 *     operationId: updateCategory
 *     tags:
 *       - "Categories"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the category"
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 example: "Category for electronic products"
 *               status:
 *                 type: string
 *                 enum:
 *                   - "active"
 *                   - "inactive"
 *                 example: "active"
 *     responses:
 *       200:
 *         description: "Category updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     slug:
 *                       type: string
 *                       example: "electronics"
 *                     description:
 *                       type: string
 *                       example: "Category for electronic products"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: "Invalid category ID format or invalid status"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid category ID format"
 *       404:
 *         description: "Category not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       409:
 *         description: "Category name already exists"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category name already exists"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid category ID format");
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    if (name && name !== category.name) {
      const existingName = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (existingName) {
        return sendError(res, 409, "Category name already exists");
      }
      category.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (status) category.status = status;

    await category.save();

    emitCategoryEvent("categoryUpdated", category);

    return sendSuccess(res, 200, "Category updated successfully", category);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: "Delete a category by its ID"
 *     description: "Deletes the category with the specified ID."
 *     operationId: deleteCategory
 *     tags:
 *       - "Categories"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the category to be deleted"
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: "Category deleted successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       400:
 *         description: "Invalid category ID format"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid category ID format"
 *       404:
 *         description: "Category not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid category ID format");
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    emitCategoryEvent("categoryDeleted", id);

    return sendSuccess(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};
