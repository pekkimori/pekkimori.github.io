import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Book3D, { getBookMetrics } from "./Book3D";
import { getBookPose, type BookFlight } from "./book-flight";
import type { Lang, LocalizedBook } from "./types";

export default function FlyingBook({
  book,
  lang,
  flight,
  onRest,
}: {
  book: LocalizedBook;
  lang: Lang;
  flight: BookFlight;
  onRest: (flight: BookFlight) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const metrics = getBookMetrics(false, book.slug, book.pageCount);
  const { from } = flight;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;
    let frame = 0;
    let attempts = 0;
    let timeline: gsap.core.Timeline | undefined;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onRest(flight);
    };
    gsap.set(root, {
      x: 0,
      y: 0,
      width: from.rect.width,
      height: from.rect.height,
      opacity: from.opacity,
      perspectiveOrigin: `${from.perspectiveOrigin.x}% ${from.perspectiveOrigin.y}%`,
    });
    gsap.set(inner, {
      rotateX: from.rotateX,
      rotateY: from.rotateY,
      "--spine-thickness": `${from.thickness}px`,
    });
    const launch = () => {
      const targetElement = document.getElementById(
        `book-${flight.destination}-${book.slug}`
      );
      // A closed or minimized bookshelf is restored before measuring its slot.
      targetElement?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      const target = getBookPose(book.slug, flight.destination);
      if (!target) {
        if (++attempts < 30) frame = requestAnimationFrame(launch);
        else finish();
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }
      timeline = gsap.timeline({
        defaults: { duration: 0.9, ease: "sine.inOut" },
        onComplete: finish,
      });
      timeline
        .to(
          root,
          {
            x: target.rect.left - from.rect.left,
            y: target.rect.top - from.rect.top,
            width: target.rect.width,
            height: target.rect.height,
            opacity: target.opacity,
            perspectiveOrigin: `${target.perspectiveOrigin.x}% ${target.perspectiveOrigin.y}%`,
          },
          0
        )
        .to(
          inner,
          {
            rotateX: target.rotateX,
            rotateY: target.rotateY,
            "--spine-thickness": `${target.thickness}px`,
          },
          0
        );
    };
    // Let restored shelves finish their responsive layout before measuring.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(launch);
    });
    // End at the live destination if the layout changes during a flight.
    window.addEventListener("resize", finish, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      timeline?.kill();
      window.removeEventListener("resize", finish);
    };
  }, [
    book.slug,
    flight,
    metrics.coverWidth,
    metrics.coverHeight,
    from,
    onRest,
  ]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      id={`book-flight-${book.slug}`}
      ref={rootRef}
      className="book-flight"
      aria-hidden="true"
      style={{
        top: from.rect.top,
        left: from.rect.left,
        width: from.rect.width,
        height: from.rect.height,
        transformOrigin: "0 0",
        perspective: 700,
        perspectiveOrigin: "50% 40%",
        zIndex: 80,
      }}
    >
      <Book3D
        book={book}
        lang={lang}
        metrics={metrics}
        innerRef={innerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>,
    document.body
  );
}
