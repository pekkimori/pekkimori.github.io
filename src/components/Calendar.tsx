import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
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

  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const scrollDirectionRef = useRef<"forward" | "backward">("forward");
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const animateScroll = useCallback((direction: "forward" | "backward") => {
    const scrollContainer = calendarContainerRef.current?.querySelector(
      ".react-activity-calendar__scroll-container"
    ) as HTMLDivElement | null;

    if (!scrollContainer) {
      isAnimatingRef.current = false;
      return;
    }

    // Hide scrollbar when animation starts
    scrollContainer.style.scrollbarWidth = "none"; // Firefox

    // Create style element for Webkit browsers
    const styleId = "calendar-scrollbar-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .react-activity-calendar__scroll-container::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }

    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    if (maxScroll <= 0) {
      isAnimatingRef.current = false;
      return;
    }

    isAnimatingRef.current = true;
    const target = direction === "forward" ? maxScroll : 0;

    gsap.to(scrollContainer, {
      scrollLeft: target,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        isAnimatingRef.current = false;
        // Wait 1 second, then animate in the opposite direction
        animationTimeoutRef.current = setTimeout(() => {
          scrollDirectionRef.current =
            direction === "forward" ? "backward" : "forward";
          animateScroll(scrollDirectionRef.current);
        }, 1000);
      },
    });
  }, []);

  const startScrollAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    scrollDirectionRef.current = "forward";
    animateScroll("forward");
  }, [animateScroll]);

  const stopScrollAnimation = useCallback(() => {
    const scrollContainer = calendarContainerRef.current?.querySelector(
      ".react-activity-calendar__scroll-container"
    ) as HTMLDivElement | null;
    gsap.killTweensOf(scrollContainer);
    isAnimatingRef.current = false;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Stop any existing animation when component re-renders
    stopScrollAnimation();

    // Use MutationObserver to detect when the scroll container is added to the DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if the added node contains the scroll container
            if (
              element.querySelector?.(
                ".react-activity-calendar__scroll-container"
              ) ||
              element.classList?.contains(
                "react-activity-calendar__scroll-container"
              )
            ) {
              // Delay to allow the calendar to fully render
              setTimeout(startScrollAnimation, 100);
            }
          }
        });
      });
    });

    if (calendarContainerRef.current) {
      observer.observe(calendarContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      stopScrollAnimation();
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  return (
    <div className="mt-8" ref={calendarContainerRef}>
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
