"use client";
import { cn } from "@/utils/stars";
import React, {
  useState,
  useEffect,
  useRef,
  type RefObject,
  useCallback,
} from "react";

const SPRING = 0.04;
const DAMPING = 0.88;
const RIPPLE_RADIUS = 120;
const RIPPLE_FORCE = 3;
const GRAB_RADIUS = 20;

interface StarProps {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
}

interface StarBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const [stars, setStars] = useState<StarProps[]>([]);
  const canvasRef: RefObject<HTMLCanvasElement | null> =
    useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<StarProps[]>([]);
  const dragIndexRef = useRef<number>(-1);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          radius: Math.random() * 0.05 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        };
      });
    },
    [
      starDensity,
      allStarsTwinkle,
      twinkleProbability,
      minTwinkleSpeed,
      maxTwinkleSpeed,
    ]
  );

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        const generated = generateStars(width, height);
        starsRef.current = generated;
        setStars(generated);
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
    generateStars,
  ]);

  // Drag interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof TouchEvent) {
        const t = e.touches[0] || e.changedTouches[0];
        return { cx: t.clientX - rect.left, cy: t.clientY - rect.top };
      }
      return {
        cx: (e as MouseEvent).clientX - rect.left,
        cy: (e as MouseEvent).clientY - rect.top,
      };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      const { cx, cy } = getPos(e);
      const list = starsRef.current;
      let best = -1;
      let bestDist = GRAB_RADIUS * GRAB_RADIUS;
      for (let i = 0; i < list.length; i++) {
        const dx = list[i].x - cx;
        const dy = list[i].y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist) {
          bestDist = d2;
          best = i;
        }
      }
      if (best !== -1) {
        dragIndexRef.current = best;
        dragOffsetRef.current = {
          dx: list[best].x - cx,
          dy: list[best].y - cy,
        };
        list[best].vx = 0;
        list[best].vy = 0;
        canvas.style.cursor = "grabbing";
        e.preventDefault();
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (dragIndexRef.current === -1) return;
      e.preventDefault();
      const { cx, cy } = getPos(e);
      const star = starsRef.current[dragIndexRef.current];
      star.x = cx + dragOffsetRef.current.dx;
      star.y = cy + dragOffsetRef.current.dy;
      star.vx = 0;
      star.vy = 0;
    };

    const onUp = () => {
      if (dragIndexRef.current === -1) return;
      const idx = dragIndexRef.current;
      dragIndexRef.current = -1;
      canvas.style.cursor = "grab";

      // Ripple: push nearby stars away from the released position
      const released = starsRef.current[idx];
      for (let i = 0; i < starsRef.current.length; i++) {
        if (i === idx) continue;
        const s = starsRef.current[i];
        const dx = s.x - released.x;
        const dy = s.y - released.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RIPPLE_RADIUS && dist > 0) {
          const force = RIPPLE_FORCE * (1 - dist / RIPPLE_RADIUS);
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
      }
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [stars]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = starsRef.current;
      const time = Date.now() * 0.001;

      for (let i = 0; i < list.length; i++) {
        const star = list[i];
        const isDragged = dragIndexRef.current === i;

        if (!isDragged) {
          // Spring toward origin (accumulate force, then damp velocity)
          star.vx += (star.originX - star.x) * SPRING;
          star.vy += (star.originY - star.y) * SPRING;
          star.vx *= DAMPING;
          star.vy *= DAMPING;
          star.x += star.vx;
          star.y += star.vy;
        }

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 + Math.abs(Math.sin(time / star.twinkleSpeed) * 0.5);
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
};
