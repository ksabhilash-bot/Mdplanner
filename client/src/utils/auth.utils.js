export function handlePostLoginRedirect(user, navigate) {
  console.log("hello", user.role);
  console.log("uuu", user);
  const role = user?.role;
  if (role == "admin") {
    navigate("/admin/admindashboard");
  } else if (!user.isProfileComplete) {
    navigate("/user/profilesetup"); //redirect on success
  } else {
    navigate("/user/userdashboard");
  }
}
