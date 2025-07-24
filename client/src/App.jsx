import LandingPage from "./components/landingPage";
import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "@/components/mode-toggle";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../login/page";
import Navbar from "@/components/ui/navbar";
import SignUpPage from "../login/signup";
import { NavMenu } from "@/components/navmenu";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Navbar />
      {/* <ModeToggle /> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
