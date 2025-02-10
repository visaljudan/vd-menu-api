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

roleRouter.get("/", auth, getRoles);
roleRouter.get("/:id", auth, getRole);

roleRouter.post("/", auth, admin, createRole);
roleRouter.patch("/:id", auth, admin, updateRole);
roleRouter.delete("/:id", auth, admin, deleteRole);

export default roleRouter;
