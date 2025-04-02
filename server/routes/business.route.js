import express from "express";
import {
  updateBusiness,
  createBusiness,
  getBusiness,
  deleteBusiness,
  getBusinesses,
} from "../controllers/business.controller.js";
import { auth } from "../utils/verify.js";

const businessRouter = express.Router();

businessRouter.post("/", auth, createBusiness);
businessRouter.get("/", auth, getBusinesses);
businessRouter.get("/:id", getBusiness);
businessRouter.patch("/:id", auth, updateBusiness);
businessRouter.delete("/:id", auth, deleteBusiness);

export default businessRouter;
