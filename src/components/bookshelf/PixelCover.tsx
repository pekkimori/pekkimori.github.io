import { useLayoutEffect, useRef, useState } from "react";
import type { ResolvedCover } from "./types";

// Reuse small textures between a shelf, its flight, and the book's tab.
const textures = new Map<string, ImageData>();
const MAX_TEXTURES = 64;
const pending = new Map<Element, () => void>();
let observer: IntersectionObserver | undefined;
function whenNearViewport(element: Element, load: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    load();
    return () => {};
  }
  observer ??= new IntersectionObserver(
    entries => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          const callback = pending.get(entry.target);
          pending.delete(entry.target);
          observer?.unobserve(entry.target);
          callback?.();
        }
    },
    { rootMargin: "200px" }
  );
  pending.set(element, load);
  observer.observe(element);
  return () => {
    pending.delete(element);
    observer?.unobserve(element);
  };
}

/** Small, dithered textures; offscreen books do not fetch or process artwork. */
export default function PixelCover({
  cover,
  alt = "",
  eager = false,
}: {
  cover: NonNullable<ResolvedCover>;
  alt?: string;
  eager?: boolean;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useLayoutEffect(() => {
    let cancelled = false;
    let source: HTMLImageElement | null = null;
    setReady(false);
    setFailed(false);
    const load = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const paint = (pixels: ImageData) => {
        canvas.width = pixels.width;
        canvas.height = pixels.height;
        ctx.putImageData(pixels, 0, 0);
        setReady(true);
      };
      const cached = textures.get(cover.src);
      if (cached) {
        textures.delete(cover.src);
        textures.set(cover.src, cached);
        paint(cached);
        return;
      }
      source = new Image();
      source.onload = () => {
        if (cancelled || !source) return;
        canvas.width = 80;
        canvas.height = Math.round((source.height / source.width) * 80);
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        try {
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
          for (let i = 0; i < pixels.data.length; i += 4) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);
            const dither = (bayer[(y % 4) * 4 + (x % 4)] - 7.5) * 1.5;
            for (let channel = 0; channel < 3; channel++)
              pixels.data[i + channel] = Math.max(
                0,
                Math.min(
                  255,
                  Math.round((pixels.data[i + channel] + dither) / 32) * 32
                )
              );
          }
          textures.set(cover.src, pixels);
          if (textures.size > MAX_TEXTURES)
            textures.delete(textures.keys().next().value!);
          paint(pixels);
        } catch {
          setFailed(true);
        }
        source.onload = null;
        source.onerror = null;
        source = null;
      };
      source.onerror = () => {
        if (!cancelled) setFailed(true);
        source = null;
      };
      source.src = cover.src;
    };
    const stopObserving =
      !eager && rootRef.current
        ? whenNearViewport(rootRef.current, load)
        : (load(), () => {});
    return () => {
      cancelled = true;
      stopObserving();
      if (source) {
        source.onload = null;
        source.onerror = null;
        source = null;
      }
    };
  }, [cover.src, eager]);
  return (
    <span
      ref={rootRef}
      className="pixel-cover"
      data-ready={ready}
      data-failed={failed}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      {failed && (
        <img
          src={cover.src}
          width={cover.width}
          height={cover.height}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
      <canvas ref={canvasRef} aria-hidden="true" />
    </span>
  );
}
