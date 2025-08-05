import User from "../models/User.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBZNbCee_ngv7ZtGk6XeMAmOuCo3snyKWE",
});

export const profileSetup = async (req, res) => {
  try {
    console.log(req.body);
    console.log("🤖 AI is generating response...");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Generate a 3 day meal plan kerala style",
    });
    console.log(response.text);
    res.status(200).json({ message: response });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
