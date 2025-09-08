import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./cron/reminder.cron.js"; // load cron jobs when server starts


// Import routes
import authRoutes from "../src/routes/auth.routes.js";
import userRoutes from "../src/routes/user.rotues.js";
import adminRoutes from "../src/routes/admin.routes.js"

const app = express();

app.use(
  cors({
    origin: "https://mdplanner-frontend.onrender.com", // your frontend dev origin
    credentials: true, // only if you're using cookies
  })
);

app.use(cookieParser());
app.use(express.json());

// Example route
app.get("/", (req, res) => res.json({ message: "Hello from backend!" }));

// Use routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

export default app;
