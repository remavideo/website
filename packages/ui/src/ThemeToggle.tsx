import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext.js";

/** Light/dark switch shared by the website nav and the dashboard header. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      onPress={toggleTheme}
      className="text-default-500 hover:text-foreground"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}
