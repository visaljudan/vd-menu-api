import express from "express";
import {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { auth, admin } from "../utils/verify.js";

const roleRouter = express.Router();

roleRouter.post("/", auth, admin, createRole);
roleRouter.get("/", auth, admin, getRoles);
roleRouter.get("/:id", auth, admin, getRole);
roleRouter.patch("/:id", auth, admin, updateRole);
roleRouter.delete("/:id", auth, admin, deleteRole);

export default roleRouter;
