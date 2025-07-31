import { useAuthStore } from "@/features/auth/auth.store";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function AdminLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
