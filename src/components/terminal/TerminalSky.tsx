import { useEffect, useState, type CSSProperties } from "react";

// A stable seed keeps server rendering and hydration in agreement, without tiles.
let seed = 48271;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const stars = Array.from({ length: 180 }, () => ({
  left: `${random() * 100}%`,
  top: `${random() * 100}%`,
  size: `${0.8 + random() * 1.8}px`,
  duration: `${2 + random() * 5}s`,
  delay: `${-random() * 10}s`,
  brightness: 0.45 + random() * 0.55,
}));
interface Comet {
  id: number;
  style: CSSProperties;
}

export default function TerminalSky() {
  const [comet, setComet] = useState<Comet | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      clearTimeout(timeout);
      setComet(null);
      if (document.hidden || reducedMotion.matches) return;

      // Quiet intervals apply on arrival too, so a meteor feels like a chance sighting.
      timeout = setTimeout(
        () => {
          setComet({
            id: Date.now(),
            style: {
              left: `${15 + Math.random() * 70}%`,
              top: `${12 + Math.random() * 65}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              "--comet-duration": `${0.6 + Math.random() * 0.4}s`,
              "--comet-length": `${26 + Math.random() * 30}px`,
              "--comet-distance": `${100 + Math.random() * 130}px`,
              "--comet-brightness": 0.18 + Math.random() * 0.14,
            } as CSSProperties,
          });
          timeout = setTimeout(schedule, 1000);
        },
        35000 + Math.random() * 60000
      );
    };

    schedule();
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div className="terminal-sky" aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className="terminal-sky-star"
          style={
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              "--twinkle-duration": star.duration,
              "--twinkle-delay": star.delay,
              "--star-brightness": star.brightness,
            } as CSSProperties
          }
        />
      ))}
      {comet && (
        <span
          key={comet.id}
          className="terminal-sky-comet-path"
          style={comet.style}
        >
          <span className="terminal-sky-comet" />
        </span>
      )}
    </div>
  );
}
