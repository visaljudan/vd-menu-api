import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";
import Role from "../models/role.model.js";

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve all users with pagination, sorting, and search
 *     description: Fetch a list of users with options for pagination, sorting, and searching.
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (default is 1).
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of users per page (default is 10).
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: sort
 *         in: query
 *         description: Field to sort by (default is createdAt).
 *         schema:
 *           type: string
 *           example: name
 *       - name: order
 *         in: query
 *         description: Sorting order, either asc or desc (default is asc).
 *         schema:
 *           type: string
 *           example: asc
 *       - name: search
 *         in: query
 *         description: Search term to filter users by name, username, or email.
 *         schema:
 *           type: string
 *           example: john
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
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
 *                   example: Users retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: user1674859347845
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       username:
 *                         type: string
 *                         example: johndoe123
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       phoneNumber:
 *                         type: string
 *                         example: 1234567890
 *                       roleId:
 *                         type: string
 *                         example: 63f1072e98a92e05e4d21d1b
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
 *                   example: Unable to retrieve users.
 */

export const getUsers = async (req, res, next) => {
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
        { username: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    const users = await User.find(query)
      .populate("roleId", "name slug")
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return sendSuccess(res, 200, "Users fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get User Details by ID
 *     description: Fetches the details of a user by their unique user ID.
 *     operationId: getUser
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the user to fetch
 *         required: true
 *         schema:
 *           type: string
 *           example: 60b8f5f8a9d8b82a9b8d37c1
 *     responses:
 *       '200':
 *         description: User details fetched successfully
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
 *                   example: User details fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: user1625647389000
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "+85595965191"
 *                     roleId:
 *                       type: string
 *                       example: 60b8f5f8a9d8b82a9b8d37c2
 *       '400':
 *         description: Invalid user ID format
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
 *                   example: Invalid user ID format
 *       '404':
 *         description: User not found
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
 *                   example: User not found
 *       '500':
 *         description: Internal server error
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
 *                   example: Internal server error
 */

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID format");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User details fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Update user information, including name, username, email, password, and roleId.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 description: Username of the user
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: New password for the user
 *                 example: newpassword123
 *               roleId:
 *                 type: string
 *                 description: Role ID to assign to the user
 *                 example: 64f8c1e6e8f57c002f78cabc
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f8c1e6e8f57c002f78c123
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     roleId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 64f8c1e6e8f57c002f78cabc
 *                         name:
 *                           type: string
 *                           example: Admin
 *                         slug:
 *                           type: string
 *                           example: admin
 *       400:
 *         description: Invalid input data
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
 *                   example: Invalid user ID format.
 *       404:
 *         description: User or role not found
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
 *                   example: User not found.
 *       409:
 *         description: Username or email already exists
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
 *                   example: Username already exists.
 *       500:
 *         description: Server error
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
 *                   example: An unexpected error occurred.
 */

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, username, email, password, roleId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID format.");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return sendError(res, 409, "Username already exists.");
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return sendError(res, 409, "Email already exists.");
      }
      user.email = email;
    }

    if (name && name !== user.name) {
      user.name = name;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (roleId && roleId !== user.roleId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        return sendError(res, 400, "Invalid role ID format.");
      }

      const role = await Role.findById(roleId);
      if (!role) {
        return sendError(res, 404, "Role not found.");
      }

      user.roleId = roleId;
    }

    await user.save();

    const populatedUser = await User.findById(user._id).populate(
      "roleId",
      "roleId name slug"
    );

    emitUserEvent("userUpdated", populatedUser);

    return sendSuccess(res, 200, "User updated successfully", populatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: "Delete a user"
 *     description: "Deletes a user from the system by their unique ID."
 *     tags:
 *       - "Users"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         description: "The ID of the user to delete. It should be a valid MongoDB ObjectId."
 *         schema:
 *           type: "string"
 *           example: "605c72ef1532073b6bffed13"
 *     responses:
 *       "200":
 *         description: "User deleted successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully."
 *                 id:
 *                   type: string
 *                   example: "user605c72ef1532073b6bffed13"
 *       "400":
 *         description: "Invalid ID format. The provided ID is not a valid MongoDB ObjectId."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid role ID format"
 *       "404":
 *         description: "User not found with the provided ID."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       "500":
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid role ID format");
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    emitUserEvent("userDeleted", id);

    return sendSuccess(res, 200, "User deleted successfully.");
  } catch (error) {
    next(error);
  }
};
