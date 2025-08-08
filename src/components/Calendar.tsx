import { useEffect, useState } from "react";
import GitHubCalendar from "react-github-calendar";

interface Theme {
  light: string[];
  dark: string[];
}

interface CalendarProps {
  themeScheme?: Theme;
}

export default function Calendar({
  themeScheme = {
    light: ["#eff1f5", "#1e66f5"],
    dark: ["#24273a", "#eed49f"],
  },
}: CalendarProps) {
  const [theme, setTheme] = useState(() => {
    const currentTheme = localStorage.getItem("theme");
    const browserTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    return currentTheme || browserTheme;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = ({ matches }: MediaQueryListEvent) => {
      setTheme(matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const themeButton = document.querySelector("#theme-btn");
    const handleClick = () => {
      setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
    };

    themeButton?.addEventListener("click", handleClick);

    return () => themeButton?.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="mt-8">
      <GitHubCalendar
        username="pekkimori"
        theme={themeScheme}
        blockRadius={2}
        blockSize={12}
        blockMargin={4}
        colorScheme={theme === "light" ? "light" : "dark"}
      />
    </div>
  );
}
