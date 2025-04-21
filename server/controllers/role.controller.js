import mongoose from "mongoose";
import Role from "../models/role.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitRoleEvent } from "../utils/socketioFunctions.js";

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

    const role = new Role({
      name,
      slug,
      description,
      status: status || "active",
    });

    await role.save();
    emitRoleEvent("roleCreated", role);

    return sendSuccess(res, 201, "Role created successfully", role);
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      status,
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

    if (status) {
      query.status = status;
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
