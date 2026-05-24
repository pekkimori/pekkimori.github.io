import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Book3D, { getBookMetrics } from "./Book3D";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";
import HoverTooltip from "./HoverTooltip";

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  showRating: boolean;
  isHovered: boolean;
  isClicked: boolean;
  isGhosted: boolean;
  nudgeX: number;
  hasHover: boolean;
  isMobile: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
  onFocus: () => void;
  onBlur: () => void;
  registerSlotRef: (el: HTMLDivElement | null) => void;
  registerInnerRef: (el: HTMLDivElement | null) => void;
};

export default function Book({
  book,
  lang,
  showRating,
  isHovered,
  isClicked,
  isGhosted,
  nudgeX,
  hasHover,
  isMobile,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onFocus,
  onBlur,
  registerSlotRef,
  registerInnerRef,
}: Props) {
  const inner3DRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const hoverTLRef = useRef<gsap.core.Timeline | null>(null);
  const metrics = getBookMetrics(isMobile);

  // Hover timeline: tiny lift, no rotation. The book stays spine-on.
  useEffect(() => {
    if (!inner3DRef.current) return;
    const el = inner3DRef.current;
    const tl = gsap.timeline({ paused: true });
    tl.to(el, {
      y: -14,
      z: 8,
      scale: 1.02,
      duration: 0.28,
      ease: "power2.out",
    });
    hoverTLRef.current = tl;
    return () => {
      tl.kill();
      hoverTLRef.current = null;
    };
  }, []);

  // Drive hover state. Suppressed when the book is in flight.
  useEffect(() => {
    const tl = hoverTLRef.current;
    if (!tl) return;
    if (isHovered && !isClicked) tl.timeScale(1).play();
    else tl.timeScale(1.3).reverse();
  }, [isHovered, isClicked]);

  // Sibling nudge: slide the slot horizontally when a neighbor is hovered/clicked.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    gsap.to(slot, {
      x: nudgeX,
      duration: 0.28,
      ease: "power2.out",
    });
  }, [nudgeX]);

  const ariaLabel = `${book.title} by ${book.author}${
    book.status === "reading" ? " (currently reading)" : ""
  }`;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        opacity: isGhosted ? 0 : 1,
        pointerEvents: isGhosted ? "none" : "auto",
      }}
    >
      <HoverTooltip
        title={book.title}
        author={book.author}
        visible={isHovered && !isClicked}
      />

      <div
        ref={el => {
          slotRef.current = el;
          registerSlotRef(el);
        }}
        className="book-slot"
        style={{
          width: metrics.spineWidth,
          height: metrics.coverHeight,
          opacity: book.status === "want-to-read" ? 0.6 : 1,
          zIndex: isClicked ? 60 : isHovered ? 5 : 1,
        }}
      >
        <Book3D
          book={book}
          lang={lang}
          metrics={metrics}
          innerRef={el => {
            inner3DRef.current = el;
            registerInnerRef(el);
          }}
        />

        <button
          type="button"
          aria-label={ariaLabel}
          onMouseEnter={hasHover ? onPointerEnter : undefined}
          onMouseLeave={hasHover ? onPointerLeave : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent outline-offset-2 outline-accent focus-visible:outline-2 focus-visible:outline-dashed"
        />
      </div>

      {showRating && (
        <div className="mt-2 font-mono text-[10px] text-accent">
          <span aria-label={`${book.rating} out of 5 stars`}>
            <span aria-hidden="true">
              {"★".repeat(book.rating)}
              {"☆".repeat(5 - book.rating)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
