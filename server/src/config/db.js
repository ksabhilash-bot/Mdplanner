import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    console.log("⛳ MONGO_URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Connection error:", err);
  }
};

export default connectToDb;
