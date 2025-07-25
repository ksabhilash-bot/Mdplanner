import { ThemeProvider } from "@/components/common/ThemeProvider";
import Navbar from "@/components/ui/navbar";
import AppRouter from "./router/AppRouter"; // 👈 move routes here

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Navbar />
      <AppRouter />
    </ThemeProvider>
  );
}
