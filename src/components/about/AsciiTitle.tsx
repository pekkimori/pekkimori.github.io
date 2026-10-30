import { useEffect, useRef } from "react";
import "./ascii-title.css";

const CHARACTERS = ".:-=+*#%@";
const READABLE_CHARACTERS = "=+*#%@";
const COLUMNS = 220;
const ROWS = 48;

export default function AsciiTitle({
  text = "PORTFOLIO",
  blinkCursor = false,
  align = "center",
  readable = false,
}: {
  text?: string;
  blinkCursor?: boolean;
  align?: "start" | "center";
  readable?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Sample a solid word once; each sample becomes a moving ASCII character.
    const mask = document.createElement("canvas");
    mask.width = COLUMNS;
    mask.height = ROWS;
    const maskContext = mask.getContext("2d", { willReadFrequently: true });
    if (!maskContext) return;
    maskContext.font = "900 40px sans-serif";
    const fontSize = Math.min(
      36,
      (40 * (COLUMNS - 24)) / maskContext.measureText(text).width
    );
    maskContext.font = `900 ${fontSize}px sans-serif`;
    maskContext.textAlign = "left";
    maskContext.textBaseline = "middle";
    const hasCursor = blinkCursor && text.endsWith("_");
    const label = hasCursor ? text.slice(0, -1) : text;
    const left =
      align === "start"
        ? 1
        : (COLUMNS - maskContext.measureText(text).width) / 2;
    const points: {
      x: number;
      y: number;
      strength: number;
      cursor: boolean;
    }[] = [];
    const sample = (value: string, offset: number, cursor: boolean) => {
      maskContext.clearRect(0, 0, COLUMNS, ROWS);
      maskContext.fillText(value, offset, ROWS / 2);
      const pixels = maskContext.getImageData(0, 0, COLUMNS, ROWS).data;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLUMNS; x++) {
          const strength = pixels[(y * COLUMNS + x) * 4 + 3] / 255;
          if (strength > 0.15) points.push({ x, y, strength, cursor });
        }
      }
    };
    sample(label, left, false);
    if (hasCursor) {
      sample("_", left + maskContext.measureText(label).width, true);
    }

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let previousTime = -Infinity;
    let visible = true;
    const startedAt = performance.now();

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const color = getComputedStyle(canvas).color;
      const cellWidth = width / COLUMNS;
      const cellHeight = height / ROWS;
      context.fillStyle = color;
      context.font = `${readable ? "600 " : ""}${cellHeight * 1.2}px monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const t = preference.matches ? 0 : time / 1000;
      const cursorHidden =
        !preference.matches && (time - startedAt) % 1200 >= 600;
      const characters = readable ? READABLE_CHARACTERS : CHARACTERS;
      for (const { x, y, strength, cursor } of points) {
        if (cursorHidden && cursor) continue;
        const wave = Math.sin(x * 0.055 + y * 0.09 - t * 1.4);
        const flow = Math.sin(x * 0.09 - y * 0.16 + t * 0.8);
        const density = (wave + flow + 2) / 4;
        const character =
          characters[
            Math.min(
              characters.length - 1,
              Math.floor(density * characters.length)
            )
          ];
        // Keep the word's strokes visible even in the darkest part of a wave.
        context.globalAlpha =
          strength * (readable ? 0.82 + density * 0.18 : 0.38 + density * 0.62);
        const offsetX = preference.matches
          ? 0
          : flow * cellWidth * (readable ? 0.35 : 0.7);
        const offsetY = preference.matches
          ? 0
          : wave * cellHeight * (readable ? 0.85 : 1.8);
        context.fillText(
          character,
          (x + 0.5) * cellWidth + offsetX,
          (y + 0.5) * cellHeight + offsetY
        );
      }
      context.globalAlpha = 1;
    };
    const animate = (time: number) => {
      if (time - previousTime >= 1000 / 30) {
        draw(time);
        previousTime = time;
      }
      frame = requestAnimationFrame(animate);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      draw(performance.now());
      if (visible && !preference.matches && !document.hidden) {
        frame = requestAnimationFrame(animate);
      }
    };
    const resize = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      restart();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    resize.observe(canvas);
    intersection.observe(canvas);
    preference.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      preference.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [text, blinkCursor, align, readable]);

  return (
    <h2 className="ascii-title" aria-label={text}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </h2>
  );
}
