import type { Lang, LocalizedBook } from "./types";
import { STRINGS } from "./strings";
import Book3D, { getBookMetrics } from "./Book3D";
import "./bookshelf.css";

export default function BookReview({
  book,
  lang,
  coverHidden = false,
}: {
  book: LocalizedBook;
  lang: Lang;
  coverHidden?: boolean;
}) {
  const s = STRINGS[lang];
  const reviewParagraphs = book.review
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const ratingStars = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
  return (
    <div className="book-review">
      <div
        id={`book-review-${book.slug}`}
        data-book-cover={book.slug}
        className="book-review-cover mx-auto aspect-[2/3] w-28 shrink-0 md:w-[200px]"
        style={{ opacity: coverHidden ? 0 : 1 }}
        role="img"
        aria-label={
          lang === "pt"
            ? `Livro: ${book.title}, ${book.author}, ${book.originalYear}`
            : `Book: ${book.title}, ${book.author}, ${book.originalYear}`
        }
      >
        <Book3D
          book={book}
          lang={lang}
          metrics={getBookMetrics(false, book.slug, book.pageCount)}
          style={{
            width: "100%",
            height: "100%",
            transform: "rotateY(16deg) rotateX(-3deg)",
          }}
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
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
            {book.pageCount} {s.pagesSuffix}
          </span>
          <span>{book.theme}</span>
        </div>
        {book.quote && (
          <figure className="my-6 border-l-2 border-accent/40 pl-4">
            <blockquote className="book-review-quote text-foreground/90">
              “{book.quote}”
            </blockquote>
            <figcaption className="mt-2 font-mono text-xs text-muted">
              — {book.title}
            </figcaption>
          </figure>
        )}
        <div className="mt-6">
          <h3 className="font-mono text-xs tracking-wider text-accent uppercase">
            {s.reviewLabel}
          </h3>
          <div className="book-review-text mt-3 space-y-3">
            {reviewParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
