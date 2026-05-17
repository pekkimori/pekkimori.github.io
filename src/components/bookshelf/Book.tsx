// src/components/bookshelf/Book.tsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";

const SPINE_WIDTH_DESKTOP = 32;
const SPINE_WIDTH_MOBILE = 24;
const COVER_HEIGHT_DESKTOP = 240;
const COVER_HEIGHT_MOBILE = 180;
const COVER_WIDTH_DESKTOP = 160;
const COVER_WIDTH_MOBILE = 110;

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  showRating: boolean;
  isLifted: boolean;
  hasHover: boolean;
  isMobile: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
  onFocus: () => void;
  onBlur: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
};

export default function Book({
  book,
  lang,
  showRating,
  isLifted,
  hasHover,
  isMobile,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onFocus,
  onBlur,
  registerRef,
}: Props) {
  const inner3DRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const spineWidth = isMobile ? SPINE_WIDTH_MOBILE : SPINE_WIDTH_DESKTOP;
  const coverWidth = isMobile ? COVER_WIDTH_MOBILE : COVER_WIDTH_DESKTOP;
  const coverHeight = isMobile ? COVER_HEIGHT_MOBILE : COVER_HEIGHT_DESKTOP;
  const spineOffsetX = (coverWidth - spineWidth) / 2;

  // Create the GSAP timeline once. It runs forward on lift, reverses on settle.
  useEffect(() => {
    if (!inner3DRef.current) return;
    const tl = gsap.timeline({ paused: true });
    tl.to(inner3DRef.current, {
      rotateY: 0,
      z: 40,
      y: -12,
      duration: 0.42,
      ease: "power3.out",
    }).to(
      inner3DRef.current,
      { scale: 1.04, duration: 0.18, ease: "power2.out" },
      "-=0.12"
    );
    timelineRef.current = tl;
    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, []);

  // Drive the timeline based on lifted state.
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (isLifted) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.3).reverse();
    }
  }, [isLifted]);

  const tinted = book.spineColor ?? "var(--accent)";
  // Spine background uses spineColor at full strength so printed text reads white.
  const spineBg = book.spineColor ?? "color-mix(in srgb, var(--accent) 70%, var(--background))";

  const orient = lang === "ja" ? "vertical-ja" : "vertical-en";

  const ariaLabel = `${book.title} by ${book.author}${
    book.status === "reading" ? " (currently reading)" : ""
  }`;

  // The slot reserves space at spine-width. The .book-3d inner div is absolutely
  // positioned at the full cover dimensions, anchored to the slot's right edge so
  // when it rotates to face the viewer, it grows leftward without overlapping the
  // next book unless lifted (which we want — it visually pops over neighbors).
  return (
    <div className="flex flex-col items-center">
      <div
        className="book-slot"
        style={{
          width: spineWidth,
          height: coverHeight,
          opacity: book.status === "want-to-read" ? 0.6 : 1,
          // CSS custom props consumed by bookshelf.css faces.
          ["--spine-thickness" as never]: `${spineWidth}px`,
          ["--spine-offset-x" as never]: `${spineOffsetX}px`,
        }}
      >
        <div
          ref={el => {
            inner3DRef.current = el;
            registerRef(el);
          }}
          className="book-3d"
          style={{
            width: coverWidth,
            height: coverHeight,
            // Anchor the inner block to the slot's right edge so the spine face
            // (which sits on the +X side of the inner block after the rotateY(-90deg))
            // visually lines up with the slot.
            right: 0,
            left: "auto",
            transformOrigin: `calc(100% - ${spineWidth / 2}px) 50%`,
          }}
          aria-hidden={true}
        >
          {/* Front face (cover) */}
          <div
            className="book-face book-face-front"
            style={{
              background: tinted,
              border: "1px solid var(--border)",
            }}
          >
            {book.cover ? (
              <img
                src={book.cover.src}
                srcSet={book.cover.srcSet}
                width={book.cover.width}
                height={book.cover.height}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center font-mono"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                <span className="text-xs leading-snug">{book.title}</span>
                <span className="text-[10px] opacity-80">// {book.author}</span>
              </div>
            )}
            {book.status === "reading" && (
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-accent"
              />
            )}
          </div>

          {/* Back face */}
          <div className="book-face book-face-back" />

          {/* Top + bottom slivers */}
          <div className="book-face book-face-top" />
          <div className="book-face book-face-bottom" />

          {/* Spine face */}
          <div
            className="book-face book-face-spine"
            style={{
              background: spineBg,
              borderTop: "1px solid rgba(0,0,0,0.25)",
              borderBottom: "1px solid rgba(0,0,0,0.25)",
            }}
          >
            <div className="book-spine-label" data-orient={orient}>
              <span className="font-semibold">{book.title}</span>
              <span className="opacity-80">{book.author}</span>
            </div>
            {book.status === "reading" && (
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-accent"
              />
            )}
          </div>
        </div>

        {/* The interactive button overlays the slot. Keeps semantics simple. */}
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
              {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
