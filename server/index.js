import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDb from "./config/connection.js";
import Meal from "./models/Meal.js"; // Assuming you have a Meal model defined

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Example route
app.get("/", (req, res) => res.json({ message: "Hello from backend!" }));

const startServer = async () => {
  try {
    // Connect to db
    // await connectToDb();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:5000`);
    });
  } catch (error) {
    console.error("Failed to connect to DB, exiting...", error);
    process.exit(1);
  }
};

const addMeal = async () => {
  try {
    const meal = new Meal({
      name: "Sample Meal",
      calories: 500,
      type: "Lunch",
    });
    await meal.save();
    console.log("Meal added:", meal);
  } catch (error) {
    console.error("Error adding meal:", error);
  }
};

await startServer();
// addMeal(); // Call the function to add a meal
