import { ThemeProvider } from "@/components/common/ThemeProvider";
import AppRouter from "./router/AppRouter"; // 👈 move routes here

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRouter />
    </ThemeProvider>
  );
}
