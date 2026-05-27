// src/components/about/Bookshelf.tsx
import { useState } from "react";

type AsciiBook = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};

const ASCII_BOOKS: AsciiBook[] = [
  {
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    quote: "Not to become someone else, but to be more thoroughly yourself.",
    asciiCover: [
      "╔═════════════╗",
      "║             ║",
      "║  THE LAWS   ║",
      "║     OF      ║",
      "║   HUMAN     ║",
      "║   NATURE    ║",
      "║             ║",
      "╠═════════════╣",
      "║  R. GREENE  ║",
      "╚═════════════╝",
    ].join("\n"),
  },
  {
    title: "The King in Yellow",
    author: "Robert W. Chambers",
    quote:
      "His mind is a wonder chamber, from which he can extract treasures that you and I would give years of our life to acquire.",
    asciiCover: [
      "╔═════════════╗",
      "║ * * * * * * ║",
      "║             ║",
      "║  THE KING   ║",
      "║     IN      ║",
      "║   YELLOW    ║",
      "║             ║",
      "╠═════════════╣",
      "║  CHAMBERS   ║",
      "╚═════════════╝",
    ].join("\n"),
  },
  {
    title: "Rich Dad, Poor Dad",
    author: "Robert T. Kiyosaki",
    quote:
      "Winners are not afraid of losing. But losers are. Failure is part of the process of success. People who avoid failure also avoid success.",
    asciiCover: [
      "╔═════════════╗",
      "║  RICH DAD   ║",
      "║  POOR DAD   ║",
      "║             ║",
      "║  $ . . . $  ║",
      "║             ║",
      "║   what is   ║",
      "╠═════════════╣",
      "║ R. KIYOSAKI ║",
      "╚═════════════╝",
    ].join("\n"),
  },
];

export default function Bookshelf() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {ASCII_BOOKS.map((book, i) => {
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
        className="overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none text-border"
      >
        {"=".repeat(200)}
      </div>

      <p className="font-mono text-[10px] text-muted text-center">
        # three books. three roberts. it was very intentional.
      </p>

      <div className="min-h-[3rem] text-center">
        {activeIndex !== null ? (
          <figure>
            <blockquote className="font-mono text-sm italic">
              "{ASCII_BOOKS[activeIndex].quote}"
            </blockquote>
            <figcaption className="mt-1 font-mono text-xs text-muted">
              — {ASCII_BOOKS[activeIndex].title}, {ASCII_BOOKS[activeIndex].author}
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
