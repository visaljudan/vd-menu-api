import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";
import Role from "../models/role.model.js";

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

    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    return sendSuccess(res, 200, "Users fetched successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      data: sanitizedUsers,
    });
  } catch (error) {
    next(error);
  }
};

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

    const { password: pass, ...sanitizedUser } = user._doc;

    return sendSuccess(
      res,
      200,
      "User details fetched successfully",
      sanitizedUser
    );
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, username, email, password, roleId } = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID format.");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found.");
    }
    // console.log(currentUser._id);
    console.log("id", id);

    //Check permission: Only owner or admin can proceed
    if (
      currentUser._id.toString() !== id.toString() &&
      currentUser.roleId.slug !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Permission denied: Only the owner or an admin can update this account."
      );
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

    const { password: pass, ...rest } = populatedUser._doc;

    emitUserEvent("userUpdated", rest);

    return sendSuccess(res, 200, "User updated successfully", rest);
  } catch (error) {
    next(error);
  }
};

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
