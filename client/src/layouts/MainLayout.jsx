import Navbar from "@/components/ui/navbar";
import { useAuthStore } from "@/features/auth/auth.store";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
