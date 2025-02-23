import express from "express";

import { auth, admin } from "../utils/verify.js";

const itemsRouter = express.Router();

// itemsRouter.get("/", getCategories);
// itemsRouter.get("/:id", getCategory);

// itemsRouter.post("/", createCategory);
// itemsRouter.patch("/:id", updateCategory);
// itemsRouter.delete("/:id", auth, admin, deleteCategory);

export default itemsRouter;
