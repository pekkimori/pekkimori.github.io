import type { CSSProperties } from "react";

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
const comets = Array.from({ length: 4 }, (_, index) => ({
  left: `${12 + random() * 70}%`,
  top: `${5 + random() * 48}%`,
  duration: `${9 + random() * 7}s`,
  delay: `${index * 2.7}s`,
  angle: `${25 + random() * 25}deg`,
}));

export default function TerminalSky() {
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
      {comets.map((comet, index) => (
        <span
          key={index}
          className="terminal-sky-comet-path"
          style={
            {
              left: comet.left,
              top: comet.top,
              transform: `rotate(${comet.angle})`,
              "--comet-duration": comet.duration,
              "--comet-delay": comet.delay,
            } as CSSProperties
          }
        >
          <span className="terminal-sky-comet" />
        </span>
      ))}
    </div>
  );
}
