import express from "express";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
} from "../controllers/subscriptionPlan.controller.js";

const subscriptionPlanRouter = express.Router();

subscriptionPlanRouter.post("/", createSubscriptionPlan);
subscriptionPlanRouter.get("/", getSubscriptionPlans);
subscriptionPlanRouter.get("/:id", getSubscriptionPlan);
subscriptionPlanRouter.patch("/:id", updateSubscriptionPlan);
subscriptionPlanRouter.delete("/:id", deleteSubscriptionPlan);

export default subscriptionPlanRouter;
