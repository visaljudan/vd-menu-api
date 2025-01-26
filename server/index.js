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

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const mongo = process.env.MONGO;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
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
// app.use("/api/roles", roleRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/users", userRouter);
// app.use("/api/categories", categoryRouter);
// app.use("/api/services", serviceRouter);
// app.use("/api/reviews", reviewRouter);
// app.use("/api/category_request", categoryRequestRouter);
// app.use("/api/jobs", jobRouter);
// app.use("/api/notifications", notificationRouter);
// app.use("/api/messages", messageRouter);
// app.use("/api/favorites", favoriteRouter);

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
