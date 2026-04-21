import { useState } from "react";
import { BOOKS } from "@/data/about";

export default function Bookshelf() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {BOOKS.map((book, i) => {
          const isActive = activeIndex === i;
          return (
            <button
              key={book.title}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
              onClick={() => setActiveIndex(isActive ? null : i)}
              aria-label={`${book.title} by ${book.author}`}
              className={[
                "origin-bottom font-mono text-[9px] leading-[1.1] whitespace-pre transition-transform duration-300",
                "hover:-translate-y-1 hover:-rotate-[4deg] focus:-translate-y-1 focus:-rotate-[4deg] focus:outline-none",
                "motion-reduce:transform-none motion-reduce:transition-none",
                isActive ? "text-accent" : "text-foreground/80",
              ].join(" ")}
            >
              <span aria-hidden="true">{book.asciiCover}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="font-mono text-[10px] leading-none text-border"
      >
        {"=".repeat(40)}
      </div>

      <div className="min-h-[3rem] text-center">
        {activeIndex !== null ? (
          <figure>
            <blockquote className="font-mono text-sm italic">
              "{BOOKS[activeIndex].quote}"
            </blockquote>
            <figcaption className="mt-1 font-mono text-xs text-muted">
              — {BOOKS[activeIndex].title}, {BOOKS[activeIndex].author}
            </figcaption>
          </figure>
        ) : (
          <p className="font-mono text-xs text-muted">
            hover a book to read a quote
          </p>
        )}
      </div>
    </div>
  );
}
