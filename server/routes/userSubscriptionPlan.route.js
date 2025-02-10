import express from "express";
import {
  createUserSubscriptionPlan,
  deleteUserSubscriptionPlan,
  getUserSubscriptionPlan,
  getUserSubscriptionPlans,
  updateUserSubscriptionPlan,
} from "../controllers/userSubscriptionPlan.controller.js";

const userSubscriptionPlanRouter = express.Router();

userSubscriptionPlanRouter.post("/", createUserSubscriptionPlan);
userSubscriptionPlanRouter.get("/", getUserSubscriptionPlans);
userSubscriptionPlanRouter.get("/:id", getUserSubscriptionPlan);
userSubscriptionPlanRouter.patch("/:id", updateUserSubscriptionPlan);
userSubscriptionPlanRouter.delete("/:id", deleteUserSubscriptionPlan);

export default userSubscriptionPlanRouter;
