import { memo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import Book3D, { getShelfBookMetrics, getShelfSlotWidth } from "./Book3D";
import type { Lang, LocalizedBook, ShelfView } from "./types";

type Props = {
  book: LocalizedBook;
  lang: Lang;
  view: ShelfView;
  showRating: boolean;
  isHovered: boolean;
  isGhosted: boolean;
  hasHover: boolean;
  small: boolean;
  onHoverChange: (slug: string | null) => void;
  onOpenBook: (book: LocalizedBook) => void;
};

export default memo(function Book({
  book,
  lang,
  view,
  showRating,
  isHovered,
  isGhosted,
  hasHover,
  small,
  onHoverChange,
  onOpenBook,
}: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const previous = useRef({ view, hovered: false });
  const metrics = getShelfBookMetrics(small, book.slug, book.pageCount, view);
  const restRotation = view === "spines" ? 90 : 24;
  const selected = isHovered && !isGhosted;
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const changedView = previous.current.view !== view;
    const wasHovered = previous.current.hovered;
    previous.current = { view, hovered: selected };
    // Idle books use CSS, without allocating a paused animation per book.
    if (!changedView && !selected && !wasHovered) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const animation = gsap.to(inner, {
      y: selected && !reduced ? -8 : 0,
      rotateY:
        selected && !reduced ? (view === "spines" ? 75 : 0) : restRotation,
      rotateX: selected && view === "covers" && !reduced ? -4 : 0,
      // Hidden shelf books must settle before a returning flight measures them.
      duration: reduced || changedView || isGhosted ? 0 : 0.25,
      ease: "power2.out",
      overwrite: true,
    });
    return () => {
      animation.kill();
    };
  }, [selected, view, restRotation, isGhosted]);

  const ariaLabel =
    lang === "pt"
      ? `${book.title}, de ${book.author}`
      : `${book.title} by ${book.author}`;
  return (
    <div
      className="book-object"
      data-selected={selected}
      data-book-slug={book.slug}
      data-unavailable={isGhosted}
      inert={isGhosted}
      aria-hidden={isGhosted || undefined}
      style={{
        opacity: isGhosted ? 0 : 1,
        pointerEvents: isGhosted ? "none" : "auto",
        width: getShelfSlotWidth(metrics, view),
        zIndex: selected ? 5 : 1,
      }}
    >
      <div
        id={`book-shelf-${book.slug}`}
        className="book-slot"
        style={{
          width: getShelfSlotWidth(metrics, view),
          height: metrics.coverHeight,
          opacity: book.status === "want-to-read" ? 0.6 : 1,
        }}
      >
        <Book3D
          book={book}
          lang={lang}
          metrics={metrics}
          innerRef={innerRef}
          style={{
            left:
              view === "spines"
                ? -(metrics.coverWidth - metrics.spineWidth) / 2
                : 0,
            transform: `rotateY(${restRotation}deg)`,
          }}
        />
        <button
          type="button"
          aria-label={ariaLabel}
          title={`${book.title} — ${book.author}`}
          onMouseEnter={hasHover ? () => onHoverChange(book.slug) : undefined}
          onMouseLeave={hasHover ? () => onHoverChange(null) : undefined}
          onFocus={() => onHoverChange(book.slug)}
          onBlur={() => onHoverChange(null)}
          onClick={() => {
            onOpenBook(book);
            onHoverChange(null);
          }}
          className="book-hitbox absolute inset-0 z-10 cursor-pointer bg-transparent outline-offset-2 outline-accent focus-visible:outline-2 focus-visible:outline-dashed"
        />
      </div>
      <div className="book-caption" aria-hidden="true">
        <span className="book-caption-title">{book.title}</span>
        <span className="book-caption-author">{book.author}</span>
      </div>
      {showRating && view === "covers" && (
        <span
          className="book-rating"
          aria-label={
            lang === "pt"
              ? `${book.rating} de 5 estrelas`
              : `${book.rating} out of 5 stars`
          }
        >
          <span aria-hidden="true">
            {"★".repeat(book.rating)}
            {"☆".repeat(5 - book.rating)}
          </span>
        </span>
      )}
    </div>
  );
});
