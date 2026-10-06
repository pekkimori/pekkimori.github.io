import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";
import { STRINGS } from "./strings";

type Props = {
  book: (LocalizedBook & { cover: ResolvedCover }) | null;
  lang: Lang;
  onClose: () => void;
  coverHidden?: boolean;
};

export default function BookModal({
  book,
  lang,
  onClose,
  coverHidden = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "bookshelf-modal-title";
  const s = STRINGS[lang];
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!book) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    const prevRootOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    // Defer focus to the close button so the flying book starts unhindered.
    const focusTimer = window.setTimeout(
      () => closeBtnRef.current?.focus(),
      50
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
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
      document.documentElement.style.overflow = prevRootOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [book]);

  if (!book || typeof document === "undefined") return null;

  const reviewParagraphs = book.review
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const ratingStars = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-sm"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ animation: "bookModalFade 240ms ease-out" }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={s.modalClose}
          className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-md border border-border bg-background font-mono text-xl text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-dashed"
        >
          &times;
        </button>
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-5 sm:p-8">
          <div className="grid items-start gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
            <div
              data-book-cover
              className="mx-auto aspect-[2/3] w-28 shrink-0 md:w-[200px]"
              style={{ opacity: coverHidden ? 0 : 1 }}
            >
              {book.cover ? (
                <img
                  src={book.cover.src}
                  srcSet={book.cover.srcSet}
                  sizes="(min-width: 768px) 200px, 112px"
                  width={book.cover.width}
                  height={book.cover.height}
                  alt={
                    lang === "pt"
                      ? `Capa de ${book.title}`
                      : `Cover of ${book.title}`
                  }
                  className="h-full w-full rounded-sm object-contain shadow-lg"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-sm border border-border bg-accent/10 p-4 text-center font-serif text-accent">
                  {book.title}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="pr-10 font-serif text-2xl leading-tight font-semibold text-foreground"
              >
                {book.title}
              </h2>
              <p className="mt-2 font-mono text-sm text-muted">{book.author}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span
                  aria-label={
                    lang === "pt"
                      ? `${book.rating} de 5 estrelas`
                      : `${book.rating} out of 5 stars`
                  }
                >
                  <span aria-hidden="true" className="text-accent">
                    {ratingStars}
                  </span>
                </span>
                <span>{book.yearRead}</span>
                <span>
                  {book.pageCount} {s.modalPagesSuffix}
                </span>
                <span>{book.theme}</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted">
                {s.modalFirstPublished(book.originalYear)}
              </p>
              {book.quote && (
                <figure className="my-6 border-l-2 border-accent/40 pl-4">
                  <blockquote className="font-serif text-sm leading-relaxed text-foreground/90 italic">
                    “{book.quote}”
                  </blockquote>
                  <figcaption className="mt-2 font-mono text-xs text-muted">
                    — {book.title}
                  </figcaption>
                </figure>
              )}
              <section className="mt-6">
                <h3 className="font-mono text-xs tracking-wider text-accent uppercase">
                  {s.modalReviewLabel}
                </h3>
                <div className="mt-3 space-y-3 font-serif text-sm leading-relaxed">
                  {reviewParagraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
