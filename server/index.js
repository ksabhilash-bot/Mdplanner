import dotenv from "dotenv";
import app from "./src/app.js";
import connectToDb from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to db
    await connectToDb();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();
