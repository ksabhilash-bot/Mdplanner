import User from "../models/User.js";

export const profileSetup = async (req, res) => {
  try {
    console.log(req.body);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
