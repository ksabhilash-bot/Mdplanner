export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Not logged in" });
  }

  try {
    const user
  } catch{
    
  }
};
