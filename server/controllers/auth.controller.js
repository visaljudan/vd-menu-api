import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";

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

    const populatedUser = await User.findById(newUser._id).populate(
      "roleId",
      "name slug"
    );

    const token = jwt.sign({ user: newUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = populatedUser._doc;

    emitUserEvent("userCreated", populatedUser);

    return sendSuccess(res, 201, "User created successfully", {
      user: rest,
      token,
    });
  } catch (error) {
    next(error);
  }
};

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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

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

export const google = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return sendError(res, 400, "Email and username are required.");
    }

    const user = await User.findOne({ email });

    // If user already exists, sign in
    if (user) {
      const { password: pass, ...rest } = user._doc;
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return sendSuccess(res, 200, "User signed in successfully", {
        user: rest,
        token,
      });
    }

    // New user sign up
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

    let baseUsername = username
      .trim()
      .toLowerCase()
      .replace(/[\d\W]+/g, "");

    // Ensure unique username
    let finalUsername;
    let isUnique = false;
    while (!isUnique) {
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      finalUsername = `${baseUsername}${randomNumber}`;
      const existingUser = await User.findOne({ username: finalUsername });
      if (!existingUser) {
        isUnique = true;
      }
    }

    const finalName = username.replace(/[\d\W]+/g, " ");

    const role = await Role.findOne({ slug: "user" });
    if (!role) {
      return sendError(res, 404, "Role not found.");
    }

    const newUser = new User({
      name: finalName,
      username: finalUsername,
      email,
      password: hashedPassword,
      roleId: role._id,
    });

    await newUser.save();

    // Populate role details in user object
    const populatedUser = await User.findById(newUser._id).populate(
      "roleId",
      "name slug"
    );

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = populatedUser._doc;

    emitUserEvent("userCreated", populatedUser);

    return sendSuccess(res, 201, "User signed up successfully", {
      user: rest,
      token,
    });
  } catch (error) {
    next(error);
  }
};
