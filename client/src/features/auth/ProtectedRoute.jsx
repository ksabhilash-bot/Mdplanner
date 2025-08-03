import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { FullPageSpinner } from "@/components/full-page-spinner";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (adminOnly && user?.role !== "admin") {
        navigate("/login", { replace: true });
      } else if (
        !adminOnly &&
        user?.role == "user" &&
        !user?.isProfileComplete
      ) {
        navigate("/user/profilesetup", { replace: true });
      }
    }
  }, [user, isAuthenticated, loading, adminOnly]);

  if (loading) return <FullPageSpinner />; // or a nice spinner component

  return children;
}
