import mongoose from "mongoose";
import User from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";

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
 * paths:
 *   /api/v1/users/{id}:
 *     patch:
 *       summary: Update user information
 *       description: Allows an admin or the user themselves to update user details such as name, email, phone number, and password.
 *       operationId: updateUser
 *       tags:
 *         - Users
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           description: The ID of the user to update.
 *           schema:
 *             type: string
 *             example: "605c72ef153207001f16fa4"
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the user.
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   description: The email address of the user.
 *                   example: "john.doe@example.com"
 *                 phoneNumber:
 *                   type: string
 *                   description: The phone number of the user (in international format).
 *                   example: "+1234567890"
 *                 password:
 *                   type: string
 *                   description: The new password for the user.
 *                   example: "newpassword123"
 *       responses:
 *         '200':
 *           description: User successfully updated.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The user ID.
 *                         example: "605c72ef153207001f16fa4"
 *                       name:
 *                         type: string
 *                         description: The name of the user.
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         description: The email of the user.
 *                         example: "john.doe@example.com"
 *                       phoneNumber:
 *                         type: string
 *                         description: The phone number of the user.
 *                         example: "+1234567890"
 *                       roleId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "roleId12345"
 *                           name:
 *                             type: string
 *                             example: "User"
 *                       slug:
 *                         type: string
 *                         description: The slug for the role.
 *                         example: "user"
 *         '400':
 *           description: Invalid request or data format.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Invalid phone number format."
 *         '404':
 *           description: User not found.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User not found."
 *         '409':
 *           description: Conflict, such as when email or phone number already exists.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Email already exists."
 */

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID format.");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return sendError(res, 409, "Email already exists.");
      }
      user.email = email;
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      if (!isValidPhoneNumber(phoneNumber)) {
        return sendError(res, 400, "Invalid phone number format.");
      }

      const phone = parsePhoneNumber(phoneNumber);
      const normalizedPhoneNumber = phone.formatInternational();

      const existingPhoneNumber = await User.findOne({ normalizedPhoneNumber });
      if (existingPhoneNumber) {
        return sendError(res, 409, "Phone number already exists.");
      }

      user.phoneNumber = normalizedPhoneNumber;
    }

    if (name && name !== user.name) {
      user.name = name;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
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
