import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "../ui";

type Theme = "dark" | "light";

export function Header() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111827" : "#f8fafc");
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <BrandMark />
          <span className="app-header__descriptor">
            Intelligent Java Code Review
          </span>
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${nextTheme} theme`}
          aria-pressed={theme === "light"}
          onClick={() => setTheme(nextTheme)}
        >
          {theme === "dark" ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} aria-hidden="true" />
          )}
          <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
        </button>
      </div>
    </header>
  );
}
