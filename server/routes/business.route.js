import express from "express";
import {
  updateBusiness,
  createBusiness,
  getBusiness,
  deleteBusiness,
  getBusinesses,
} from "../controllers/business.controller.js";
import { auth, admin } from "../utils/verify.js";

const businessRouter = express.Router();

businessRouter.get("/", getBusinesses);
businessRouter.get("/:id", getBusiness);

businessRouter.post("/", auth, createBusiness);
businessRouter.patch("/:id", auth, updateBusiness);
businessRouter.delete("/:id", auth, deleteBusiness);

export default businessRouter;
