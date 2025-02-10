import mongoose from "mongoose";
import Role from "../models/role.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitRoleEvent } from "../utils/socketioFunctions.js";

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role with the given name, description, and status.
 *     operationId: createRole
 *     tags:
 *       - Roles
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
 *                 description: The name of the role
 *                 example: "Admin"
 *               description:
 *                 type: string
 *                 description: A brief description of the role
 *                 example: "Administrator with full access"
 *               status:
 *                 type: string
 *                 description: The status of the role (active or inactive)
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role created successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Admin"
 *                     slug:
 *                       type: string
 *                       example: "admin"
 *                     description:
 *                       type: string
 *                       example: "Administrator with full access"
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
 *                   example: "Name is required to create a role"
 *       409:
 *         description: Conflict due to role name or slug already existing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role name already exists"
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

export const createRole = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return sendError(res, 400, "Name is required to create a role");
    }
    const existingName = await Role.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingName) {
      return sendError(res, 409, "Role name already exists");
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existingSlug = await Role.findOne({
      slug: { $regex: new RegExp(`^${slug}$`, "i") },
    });
    if (existingSlug) {
      return sendError(res, 409, "Role slug already exists");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    const newRoleStatus = status || "active";

    const role = new Role({
      name,
      slug,
      description,
      status: newRoleStatus,
    });
    await role.save();

    emitRoleEvent("roleCreated", role);

    return sendSuccess(res, 201, "Role created successfully", role);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Retrieve a list of roles
 *     description: Fetch all roles with optional pagination, sorting, and search capabilities.
 *     operationId: getRoles
 *     tags:
 *       - Roles
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
 *         description: Number of roles per page
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
 *           example: admin
 *         description: Search string to filter roles by name, slug, or description
 *     responses:
 *       '200':
 *         description: Roles fetched successfully
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
 *                   example: "Roles fetched successfully"
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
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 */

export const getRoles = async (req, res, next) => {
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

    const roles = await Role.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Role.countDocuments(query);

    return sendSuccess(res, 200, "Roles fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Fetch a role by its ID
 *     description: Fetches the role details based on the given role ID.
 *     operationId: getRole
 *     tags:
 *       - Roles
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique ID of the role
 *         required: true
 *         type: string
 *         format: objectId
 *         example: "60d0fe4f5311236168a109ca"  # Example of a valid ObjectId
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role fetched successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "Admin"
 *                     slug:
 *                       type: string
 *                       example: "admin"
 *                     description:
 *                       type: string
 *                       example: "Administrator with full access"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Invalid role ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid role ID format"
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role not found"
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

export const getRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid role ID format");
    }

    const role = await Role.findById(id);
    if (!role) {
      return sendError(res, 404, "Role not found");
    }

    return sendSuccess(res, 200, "Role fetched successfully", role);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   patch:
 *     summary: "Update a role by its ID"
 *     description: "Updates the role details based on the given role ID."
 *     operationId: updateRole
 *     tags:
 *       - "Roles"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the role"
 *         required: true
 *         type: string
 *         format: objectId
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
 *                 example: "Editor"
 *               description:
 *                 type: string
 *                 example: "Role with editing privileges"
 *               status:
 *                 type: string
 *                 enum:
 *                   - "active"
 *                   - "inactive"
 *                 example: "active"
 *     responses:
 *       200:
 *         description: "Role updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "Editor"
 *                     slug:
 *                       type: string
 *                       example: "editor"
 *                     description:
 *                       type: string
 *                       example: "Role with editing privileges"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: "Invalid role ID format or invalid status"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid role ID format"
 *       404:
 *         description: "Role not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role not found"
 *       409:
 *         description: "Role name already exists"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role name already exists"
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

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid role ID format");
    }

    const role = await Role.findById(id);
    if (!role) {
      return sendError(res, 404, "Role not found");
    }

    if (status && !["active", "inactive"].includes(status)) {
      return sendError(res, 400, "Status must be 'active' or 'inactive'");
    }

    if (name && name !== role.name) {
      const existingName = await Role.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (existingName) {
        return sendError(res, 409, "Role name already exists");
      }
      role.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (status) role.status = status;

    await role.save();

    emitRoleEvent("roleUpdated", role);

    return sendSuccess(res, 200, "Role updated successfully", role);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: "Delete a role by its ID"
 *     description: "Deletes the role with the specified ID."
 *     operationId: deleteRole
 *     tags:
 *       - "Roles"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the role to be deleted"
 *         required: true
 *         type: string
 *         format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: "Role deleted successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role deleted successfully"
 *       400:
 *         description: "Invalid role ID format"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid role ID format"
 *       404:
 *         description: "Role not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role not found"
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

export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid role ID format");
    }
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return sendError(res, 404, "Role not found");
    }

    emitRoleEvent("roleDeleted", id);

    return sendSuccess(res, 200, "Role deleted successfully");
  } catch (error) {
    next(error);
  }
};
