import { useEffect, useRef } from "react";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";
import { STRINGS } from "./strings";

type Props = {
  book: (LocalizedBook & { cover: ResolvedCover }) | null;
  lang: Lang;
  onClose: () => void;
};

export default function BookModal({ book, lang, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "bookshelf-modal-title";
  const s = STRINGS[lang];

  useEffect(() => {
    if (!book) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Defer focus to the close button so the flying book starts unhindered.
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          "button, [href], input, [tabindex]:not([tabindex='-1'])"
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [book, onClose]);

  if (!book) return null;

  const reviewParagraphs = book.review
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const ratingStars = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);

  // The flying book is sized 160 * 1.6 = 256 wide × 240 * 1.6 = 384 tall and
  // lands at viewport center. Floating panels are anchored to viewport coords
  // so they sit cleanly above and below it. (Mobile gets a smaller landing
  // zone of 110 * 1.6 = 176 × 180 * 1.6 = 288.)
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-40"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        background: "color-mix(in srgb, var(--background) 82%, transparent)",
        backdropFilter: "blur(4px)",
        animation: "bookModalFade 240ms ease-out",
      }}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label={s.modalClose}
        className="fixed top-4 right-4 z-50 size-10 rounded-md border border-border bg-background/60 font-mono text-base text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-accent"
      >
        &times;
      </button>

      {/* Title panel — sits ABOVE the centered flying book. */}
      <div
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 w-[min(520px,calc(100vw-32px))] text-center"
        style={{
          top: "calc(50vh - 220px - 96px)",
        }}
      >
        <div className="pointer-events-auto rounded-md border border-border bg-background/70 px-4 py-3 font-mono">
          <h2 id={titleId} className="text-sm font-semibold tracking-wide text-foreground">
            {book.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{book.author}</p>
          <div className="mt-2 text-[11px] text-foreground/80">
            <span aria-label={`${book.rating} out of 5 stars`}>
              <span aria-hidden="true" className="text-accent">
                {ratingStars}
              </span>
            </span>
            <span className="mx-2 text-muted">·</span>
            <span>{book.yearRead}</span>
            <span className="mx-2 text-muted">·</span>
            <span>
              {book.pageCount}
              {s.modalPagesSuffix}
            </span>
            <span className="mx-2 text-muted">·</span>
            <span>{book.theme}</span>
          </div>
          <p className="mt-1 text-[10px] text-muted">
            {s.modalFirstPublished(book.originalYear)}
          </p>
        </div>
      </div>

      {/* Quote + review panel — sits BELOW the centered flying book. */}
      <div
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 w-[min(560px,calc(100vw-32px))]"
        style={{
          top: "calc(50vh + 200px)",
          maxHeight: "calc(50vh - 220px)",
        }}
      >
        <div className="pointer-events-auto flex max-h-[calc(50vh-220px)] flex-col gap-3 overflow-y-auto rounded-md border border-border bg-background/70 px-4 py-3">
          {book.quote && (
            <figure className="text-center">
              <blockquote className="font-mono text-xs italic text-foreground/90">
                {'"'}
                {book.quote}
                {'"'}
              </blockquote>
              <figcaption className="mt-1 font-mono text-[10px] text-muted">
                &mdash; {book.title}
              </figcaption>
            </figure>
          )}

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {s.modalReviewLabel}
            </h3>
            <div className="mt-1.5 space-y-2 font-serif text-[13px] leading-relaxed">
              {reviewParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
