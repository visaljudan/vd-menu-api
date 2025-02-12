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

roleRouter.get("/", getRoles);
roleRouter.get("/:id", getRole);

roleRouter.post("/", createRole);
roleRouter.patch("/:id", updateRole);
roleRouter.delete("/:id", deleteRole);

export default roleRouter;
