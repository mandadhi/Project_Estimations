import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";


function ThemeToggle({ size = 16 }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="h-8 w-8 rounded-md flex items-center justify-center transition-colors border"
      style={{
        color: "var(--ink-subtle)",
        borderColor: "var(--hairline)",
        backgroundColor: "var(--surface-1)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-subtle)"; }}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}

export default ThemeToggle;
