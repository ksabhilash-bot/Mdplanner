import User from "../models/User.js";

export const markProfileComplete = async (userId) => {
  try {
    // console.log(userId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isProfileComplete: true,
      },
      { new: true }
    );

    console.log(updatedUser);

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: updatedUser };
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
