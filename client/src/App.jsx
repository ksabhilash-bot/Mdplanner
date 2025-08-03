import { ThemeProvider } from "@/components/common/ThemeProvider";
import AppRouter from "./router/AppRouter"; // 👈 move routes here
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { FullPageSpinner } from "./components/full-page-spinner";

export default function App() {
  const { checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading)
    return (
      <div>
        <FullPageSpinner />
      </div>
    ); // ⏳ Show spinner or blank
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRouter />
    </ThemeProvider>
  );
}
