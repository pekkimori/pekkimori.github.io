import { useState, useEffect } from "react";

// The site theme script owns the preference. React views follow the same
// attribute whether it changes through the header, terminal, or system setting.
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document === "undefined"
      ? "light"
      : (document.documentElement.dataset.theme ?? "light")
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const value = root.dataset.theme ?? "light";
      setTheme(value);
      root.classList.toggle("dark", value === "dark");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
