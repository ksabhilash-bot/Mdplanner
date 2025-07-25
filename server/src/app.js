import express from "express";
import cors from "cors";

// Import routes
import authRoutes from "../src/routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend dev origin
    credentials: true, // only if you're using cookies
  })
);

app.use(express.json());

// Example route
app.get("/", (req, res) => res.json({ message: "Hello from backend!" }));

// Use routes
app.use("/auth", authRoutes);

export default app;
