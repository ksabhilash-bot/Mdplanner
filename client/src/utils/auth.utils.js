export function handlePostLoginRedirect(user, navigate) {
  const role = user?.role;
  if (role == "admin") {
    navigate("/admindashboard");
  } else if (!user.isProfileComplete) {
    navigate("/user/profilesetup"); //redirect on success
  } else {
    navigate("user/userdashboard");
  }
}
