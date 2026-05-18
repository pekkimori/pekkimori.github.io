import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";
import HoverTooltip from "./HoverTooltip";

const SPINE_WIDTH_DESKTOP = 32;
const SPINE_WIDTH_MOBILE = 24;
const COVER_HEIGHT_DESKTOP = 240;
const COVER_HEIGHT_MOBILE = 180;
const COVER_WIDTH_DESKTOP = 160;
const COVER_WIDTH_MOBILE = 110;

const FLIGHT_SCALE = 1.6;

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  showRating: boolean;
  isHovered: boolean;
  isClicked: boolean;
  nudgeX: number;
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
  isHovered,
  isClicked,
  nudgeX,
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
  const slotRef = useRef<HTMLDivElement | null>(null);
  const hoverTLRef = useRef<gsap.core.Timeline | null>(null);
  const flightTLRef = useRef<gsap.core.Timeline | null>(null);
  const savedRectRef = useRef<{ top: number; left: number; width: number; height: number } | null>(null);

  const spineWidth = isMobile ? SPINE_WIDTH_MOBILE : SPINE_WIDTH_DESKTOP;
  const coverWidth = isMobile ? COVER_WIDTH_MOBILE : COVER_WIDTH_DESKTOP;
  const coverHeight = isMobile ? COVER_HEIGHT_MOBILE : COVER_HEIGHT_DESKTOP;
  const spineOffsetX = (coverWidth - spineWidth) / 2;

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

  // Click flight: book detaches via position:fixed, animates to viewport center
  // while rotating from spine to cover, scaling up, with a soft drop shadow.
  useEffect(() => {
    const el = inner3DRef.current;
    if (!el) return;

    if (isClicked) {
      // Stop any running flight tween and snapshot the current rect.
      flightTLRef.current?.kill();

      // First reset any hover transforms so we start from a clean state.
      gsap.set(el, { y: 0, z: 0, scale: 1 });

      const rect = el.getBoundingClientRect();
      savedRectRef.current = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };

      // Anchor the element at its current viewport position, then animate to center.
      gsap.set(el, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        right: "auto",
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 60,
        // Re-establish perspective on the flying element since it's now positioned
        // independently of the .bookshelf-row that originally provided it.
        perspective: 1200,
        transformOrigin: `${rect.width / 2}px ${rect.height / 2}px`,
      });

      const endWidth = rect.width * FLIGHT_SCALE;
      const endHeight = rect.height * FLIGHT_SCALE;
      const endLeft = window.innerWidth / 2 - endWidth / 2;
      const endTop = window.innerHeight / 2 - endHeight / 2;

      const tl = gsap.timeline();
      tl.to(el, {
        top: endTop,
        left: endLeft,
        width: endWidth,
        height: endHeight,
        rotateY: 0,
        rotateX: -6,
        duration: 0.7,
        ease: "power2.inOut",
      }).to(
        el,
        {
          filter: "drop-shadow(-12px 22px 36px rgba(0,0,0,0.45))",
          duration: 0.5,
          ease: "power1.out",
        },
        0.1
      );
      flightTLRef.current = tl;
    } else if (savedRectRef.current) {
      // Return flight: animate back to original viewport rect, then clear the
      // inline overrides so the book settles into its shelf flow again.
      flightTLRef.current?.kill();
      const home = savedRectRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(el, {
            clearProps:
              "position,top,left,right,width,height,margin,zIndex,perspective,transformOrigin,filter,rotateX,rotateY,scale,x,y,z",
          });
          savedRectRef.current = null;
        },
      });
      tl.to(el, {
        top: home.top,
        left: home.left,
        width: home.width,
        height: home.height,
        rotateY: -90,
        rotateX: 0,
        filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
        duration: 0.55,
        ease: "power2.inOut",
      });
      flightTLRef.current = tl;
    }
    return () => {
      // Don't kill on cleanup mid-flight — that strands the inline styles.
    };
  }, [isClicked]);

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

  const tinted = book.spineColor ?? "var(--accent)";
  const spineBg =
    book.spineColor ?? "color-mix(in srgb, var(--accent) 70%, var(--background))";

  const orient = lang === "ja" ? "vertical-ja" : "vertical-en";

  const ariaLabel = `${book.title} by ${book.author}${
    book.status === "reading" ? " (currently reading)" : ""
  }`;

  return (
    <div className="relative flex flex-col items-center">
      <HoverTooltip
        title={book.title}
        author={book.author}
        visible={isHovered && !isClicked}
      />

      <div
        ref={slotRef}
        className="book-slot"
        style={{
          width: spineWidth,
          height: coverHeight,
          opacity: book.status === "want-to-read" ? 0.6 : 1,
          zIndex: isClicked ? 60 : isHovered ? 5 : 1,
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
            right: 0,
            left: "auto",
            transformOrigin: `calc(100% - ${spineWidth / 2}px) 50%`,
          }}
          aria-hidden={true}
        >
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

          <div className="book-face book-face-back" />
          <div className="book-face book-face-top" />
          <div className="book-face book-face-bottom" />

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
