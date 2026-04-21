import { useEffect, useState } from "react";

const SEQUENCE = ["c", "a", "t"];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function KonamiCat() {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let firedOnce = false;
    let cursor = 0;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (firedOnce) return;

      const key = e.key.toLowerCase();
      if (key === SEQUENCE[cursor]) {
        cursor += 1;
        if (cursor === SEQUENCE.length) {
          firedOnce = true;
          setTriggered(true);
        }
      } else {
        cursor = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!triggered) return null;

  return (
    <img
      src="/gifs/about/konami-cat.gif"
      alt=""
      aria-hidden="true"
      onAnimationEnd={() => setTriggered(false)}
      className="pointer-events-none fixed bottom-4 left-0 z-50 h-24 w-24 animate-[konami-walk_6s_linear_forwards]"
      style={{
        ["--konami-end" as string]: "calc(100vw + 10rem)",
      }}
    />
  );
}
