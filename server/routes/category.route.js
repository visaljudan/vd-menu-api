import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { auth, admin } from "../utils/verify.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategory);

categoryRouter.post("/", createCategory);
categoryRouter.patch("/:id", updateCategory);
categoryRouter.delete("/:id", auth, admin, deleteCategory);

export default categoryRouter;
