import Giscus, { type Theme } from "@giscus/react";
import { GISCUS } from "@/constants";
import { useTheme } from "@/utils/useTheme";

interface CommentsProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
  discussionNumber?: number;
  discussionPath?: string;
  id?: string;
}

export default function Comments({
  lightTheme = "catppuccin_latte",
  darkTheme = "catppuccin_mocha",
  discussionNumber,
  discussionPath,
  id,
}: CommentsProps) {
  const theme = useTheme();

  return (
    <div className="mt-8">
      <Giscus
        {...GISCUS}
        id={id}
        mapping={
          discussionNumber
            ? "number"
            : discussionPath
              ? "specific"
              : GISCUS.mapping
        }
        term={discussionNumber ? String(discussionNumber) : discussionPath}
        theme={theme === "light" ? lightTheme : darkTheme}
      />
    </div>
  );
}
