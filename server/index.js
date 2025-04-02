import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { sendError, sendSuccess } from "./utils/response.js";

import swaggerRouter from "./utils/swagger.js";
import roleRouter from "./routes/role.route.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import subscriptionPlanRouter from "./routes/subscriptionPlan.route.js";
import userSubscriptionPlanRouter from "./routes/userSubscriptionPlan.route.js";
import categoryRouter from "./routes/category.route.js";
import telegramRouter from "./routes/telegram.route.js";
import itemRouter from "./routes/item.route.js";
import businessRouter from "./routes/business.route.js";
import orderRouter from "./routes/order.route.js";
import orderItemRouter from "./routes/orderItem.route.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const mongo = process.env.MONGO;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.json());

mongoose
  .connect(mongo)
  .then(() => {
    console.log("Connected to Mongo DB!");
  })
  .catch((err) => {
    console.log(err);
  });

// Route for rendering the index view
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
  res.render("homepage", { message: "Welcome to VD Menu Managements API" });
});

// Use Swagger documentation router
app.use("/", swaggerRouter);

// Route Middleware
app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscription-plans", subscriptionPlanRouter);
app.use("/api/v1/user-subscription-plans", userSubscriptionPlanRouter);
app.use("/api/v1/telegrams", telegramRouter);
app.use("/api/v1/businesses", businessRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/order-items", orderItemRouter);

app.get("/socket-io", (req, res) => {
  sendSuccess(res, 200, "Socket.IO Server is running");
});

io.on("connection", (socket) => {
  console.log("socket connected");

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  sendError(res, 500, "An unexpected error occurred", err);
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
