// src/components/bookshelf/BookModal.tsx
import { useEffect, useRef } from "react";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";
import { STRINGS } from "./strings";

type Props = {
  book: (LocalizedBook & { cover: ResolvedCover }) | null;
  lang: Lang;
  onClose: () => void;
};

export default function BookModal({ book, lang, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "bookshelf-modal-title";
  const s = STRINGS[lang];

  // Scroll lock + focus management
  useEffect(() => {
    if (!book) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const root = dialogRef.current;
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
      document.body.style.overflow = prevOverflow;
    };
  }, [book, onClose]);

  if (!book) return null;

  const reviewParagraphs = book.review.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  return (
    <div
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(4px)" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[80vh] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
        style={{ animation: "bookModalIn 180ms ease-out" }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={s.modalClose}
          className="absolute top-3 right-3 size-8 font-mono text-lg text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-accent"
        >
          &times;
        </button>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div
            className="shrink-0 self-center sm:self-start"
            style={{
              width: 120,
              height: 180,
              background: book.spineColor ?? "var(--accent)",
              borderRadius: 4,
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {book.cover ? (
              <img
                src={book.cover.src}
                srcSet={book.cover.srcSet}
                width={book.cover.width}
                height={book.cover.height}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center font-mono"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                <span className="text-xs leading-snug">{book.title}</span>
                <span className="text-[10px] opacity-80">// {book.author}</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 id={titleId} className="text-xl font-semibold leading-tight">
              {book.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{book.author}</p>
            <div className="mt-3 font-mono text-xs text-foreground/80">
              <span aria-label={`${book.rating} out of 5 stars`}>
                <span aria-hidden="true" className="text-accent">
                  {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
                </span>
              </span>
              <span className="mx-2 text-muted">·</span>
              <span>{book.yearRead}</span>
              <span className="mx-2 text-muted">·</span>
              <span>{book.pageCount}{s.modalPagesSuffix}</span>
              <span className="mx-2 text-muted">·</span>
              <span>{book.theme}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted">
              {s.modalFirstPublished(book.originalYear)}
            </p>
          </div>
        </div>

        {book.quote && (
          <>
            <hr className="my-5 border-border" />
            <figure className="text-center">
              <blockquote className="font-mono text-sm italic">
                {'"'}{book.quote}{'"'}
              </blockquote>
              <figcaption className="mt-2 font-mono text-xs text-muted">
                &mdash; {book.title}
              </figcaption>
            </figure>
          </>
        )}

        <hr className="my-5 border-border" />

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
            {s.modalReviewLabel}
          </h3>
          <div className="mt-2 space-y-3 font-serif text-sm leading-relaxed">
            {reviewParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
