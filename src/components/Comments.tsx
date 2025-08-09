import Giscus, { type Theme } from "@giscus/react";
import { GISCUS } from "@/constants";
import { useTheme } from "@/utils/useTheme";

interface CommentsProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
}

export default function Comments({
  lightTheme = "catppuccin_latte",
  darkTheme = "catppuccin_macchiato",
}: CommentsProps) {
  const theme = useTheme();

  return (
    <div className="mt-8">
      <Giscus theme={theme === "light" ? lightTheme : darkTheme} {...GISCUS} />
    </div>
  );
}
