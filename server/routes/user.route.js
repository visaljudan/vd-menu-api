import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { admin, auth } from "../utils/verify.js";

const userRouter = express.Router();

userRouter.get("/", auth, admin, getUsers);
userRouter.delete("/:id", auth, admin, deleteUser);
userRouter.get("/:id", auth, getUser);
userRouter.patch("/:id", auth, updateUser);

export default userRouter;
