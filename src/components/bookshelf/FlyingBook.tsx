import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Book3D, { getBookMetrics } from "./Book3D";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";

type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  isMobile: boolean;
  fromRect: Rect;
  open: boolean;
  onRest: () => void;
};

const FLIGHT_SCALE = 1.6;

export default function FlyingBook({
  book,
  lang,
  isMobile,
  fromRect,
  open,
  onRest,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const metrics = useMemo(() => getBookMetrics(isMobile), [isMobile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner || !fromRect) return;

    tlRef.current?.kill();

    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const centerX = viewportLeft + viewportWidth / 2;
    const centerY = viewportTop + viewportHeight / 2;
    const startCenterX = fromRect.left + fromRect.width / 2;
    const startCenterY = fromRect.top + fromRect.height / 2;
    const deltaX = centerX - startCenterX;
    const deltaY = centerY - startCenterY;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap.set(root, {
      position: "fixed",
      top: fromRect.top,
      left: fromRect.left,
      width: fromRect.width,
      height: fromRect.height,
      zIndex: 60,
      pointerEvents: "none",
      perspective: 1200,
      perspectiveOrigin: "50% 60%",
      transformOrigin: "50% 50%",
    });

    if (reducedMotion) {
      if (open) {
        gsap.set(root, {
          x: deltaX,
          y: deltaY,
          scale: FLIGHT_SCALE,
          filter: "drop-shadow(-12px 22px 36px rgba(0,0,0,0.45))",
        });
        gsap.set(inner, { rotateY: 0, rotateX: -6 });
      } else {
        onRest();
      }
      return;
    }

    if (open) {
      gsap.set(root, {
        x: 0,
        y: 0,
        scale: 1,
        filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
      });
      gsap.set(inner, {
        rotateY: 90,
        rotateX: 0,
      });

      const tl = gsap.timeline();
      tl.to(
        root,
        {
          x: deltaX,
          y: deltaY,
          scale: FLIGHT_SCALE,
          duration: 0.7,
          ease: "power2.inOut",
        },
        0
      ).to(
        inner,
        {
          rotateY: 0,
          rotateX: -6,
          duration: 0.7,
          ease: "power2.inOut",
        },
        0
      ).to(
        root,
        {
          filter: "drop-shadow(-12px 22px 36px rgba(0,0,0,0.45))",
          duration: 0.5,
          ease: "power1.out",
        },
        0.1
      );
      tlRef.current = tl;
      return;
    }

    const tl = gsap.timeline({ onComplete: onRest });
    gsap.set(root, {
      x: deltaX,
      y: deltaY,
      scale: FLIGHT_SCALE,
      filter: "drop-shadow(-12px 22px 36px rgba(0,0,0,0.45))",
    });
    gsap.set(inner, {
      rotateY: 0,
      rotateX: -6,
    });
    tl.to(
      root,
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "power2.inOut",
      },
      0
    ).to(
      inner,
      {
        rotateY: 90,
        rotateX: 0,
        duration: 0.55,
        ease: "power2.inOut",
      },
      0
    ).to(
      root,
      {
        filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
        duration: 0.3,
        ease: "power1.out",
      },
      0
    );
    tlRef.current = tl;
  }, [fromRect, metrics, mounted, onRest, open]);

  useEffect(() => () => tlRef.current?.kill(), []);

  if (!mounted || !fromRect) return null;

  return createPortal(
    <div ref={rootRef} className="book-flight" aria-hidden={true}>
      <Book3D book={book} lang={lang} metrics={metrics} innerRef={innerRef} />
    </div>,
    document.body
  );
}
