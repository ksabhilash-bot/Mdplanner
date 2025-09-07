import dotenv from "dotenv";
import app from "./src/app.js";
import connectToDb from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to db
    console.log("Connecting to MongoDB...");
    await connectToDb();
    console.log("MongoDB connected");
    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();
