import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: "Create a new user account"
 *     description: "Registers a new user with the provided details."
 *     operationId: signup
 *     tags:
 *       - "Auth"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Visal Judan"
 *               username:
 *                 type: string
 *                 example: "visal"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "visal@vdmenu.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: "User created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     roleId:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109cb"
 *                     role:
 *                       type: object
 *                       properties:
 *                         roleId:
 *                           type: string
 *                           example: "60d0fe4f5311236168a109cb"
 *                         name:
 *                           type: string
 *                           example: "user"
 *                         slug:
 *                           type: string
 *                           example: "user"
 *                 token:
 *                   type: string
 *                   example: "jwtTokenHere"
 *       400:
 *         description: "Missing required fields or invalid input"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name is required."
 *       409:
 *         description: "Conflict with existing data (e.g., username, email, or phone number already exists)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username already exists."
 *       404:
 *         description: "Role not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role not found."
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

export const signup = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name) {
      return sendError(res, 400, "Name is required.");
    }

    if (!username) {
      return sendError(res, 400, "Username is required.");
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return sendError(res, 409, "Username already exists.");
    }

    if (!email) {
      return sendError(res, 400, "Email is required.");
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return sendError(res, 409, "Email already exists.");
    }

    if (!password) {
      return sendError(res, 400, "Password is required.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await Role.findOne({ slug: "user" });
    if (!role) {
      return sendError(res, 404, "Role not found.");
    }

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      roleId: role._id,
    });

    await newUser.save();
    const populatedUser = await User.findOne({
      roleId: newUser.roleId,
    }).populate("roleId", "name slug");

    const token = jwt.sign(
      { user: newUser._id, username: newUser.username },
      process.env.JWT_SECRET
    );

    emitUserEvent("userCreated", populatedUser);

    return sendSuccess(res, 201, "User created successfully", {
      user: populatedUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /api/v1/auth/signin:
 *     post:
 *       summary: User Sign-in
 *       description: Allows a user to sign in using their username, email, or phone number and password.
 *       operationId: signin
 *       tags:
 *         - "Auth"
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usernameOrEmail:
 *                   type: string
 *                   description: The username, email, or phone number of the user.
 *                   example: john_doe
 *                 password:
 *                   type: string
 *                   description: The password of the user.
 *                   example: "password123"
 *               required:
 *                 - usernameOrEmail
 *                 - password
 *       responses:
 *         '200':
 *           description: User successfully signed in.
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
 *                       username:
 *                         type: string
 *                         description: The username of the user.
 *                         example: "john_doe"
 *                       email:
 *                         type: string
 *                         description: The email of the user.
 *                         example: "john.doe@example.com"
 *                   token:
 *                     type: string
 *                     description: JWT token for the authenticated user.
 *                     example: "jwt_token_string"
 *         '400':
 *           description: Missing required fields or incorrect data.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Username/Email/Phone Number and Password are required."
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
 *           description: Incorrect password.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Invalid password."
 */

export const signin = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail) {
      return sendError(res, 400, "Username/Email is required.");
    }
    if (!password) {
      return sendError(res, 400, "Password is required.");
    }

    let user;
    if (usernameOrEmail.includes("@")) {
      user = await User.findOne({ email: usernameOrEmail });
    } else {
      user = await User.findOne({ username: usernameOrEmail });
    }

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 409, "Invalid password.");
    }

    const token = jwt.sign(
      { user: user._id, username: user.username },
      process.env.JWT_SECRET
    );

    const populatedUser = await User.findById(user._id).populate(
      "roleId",
      "name slug"
    );

    emitUserEvent("userSignedIn", populatedUser);

    return sendSuccess(res, 200, "User signed in successfully", {
      user: populatedUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};
