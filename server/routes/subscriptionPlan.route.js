import express from "express";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
} from "../controllers/subscriptionPlan.controller.js";
import { auth, admin } from "../utils/verify.js";

const subscriptionPlanRouter = express.Router();

subscriptionPlanRouter.post("/", auth, admin, createSubscriptionPlan);
subscriptionPlanRouter.get("/", getSubscriptionPlans);
subscriptionPlanRouter.get("/:id", getSubscriptionPlan);
subscriptionPlanRouter.patch("/:id", auth, admin, updateSubscriptionPlan);
subscriptionPlanRouter.delete("/:id", auth, admin, deleteSubscriptionPlan);

export default subscriptionPlanRouter;
