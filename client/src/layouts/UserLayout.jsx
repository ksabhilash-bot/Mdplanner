import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useEffect } from "react";

export default function UserLayout() {
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
