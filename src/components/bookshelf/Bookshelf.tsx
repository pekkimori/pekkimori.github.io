// src/components/bookshelf/Bookshelf.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./bookshelf.css";
import Book from "./Book";
import BookModal from "./BookModal";
import FlyingBook from "./FlyingBook";
import { getBookMetrics } from "./Book3D";
import { STRINGS } from "./strings";
import type {
  Lang,
  LocalizedBook,
  ResolvedCover,
  SortMode,
} from "./types";

type BookForRender = LocalizedBook & { cover: ResolvedCover };

type Rect = { top: number; left: number; width: number; height: number };

type BookAnchor = {
  slot: HTMLDivElement | null;
  inner: HTMLDivElement | null;
};

type Props = {
  lang: Lang;
  books: BookForRender[];
};

function useHoverCapable(): boolean {
  const [hover, setHover] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return hover;
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

function groupByTheme(
  books: BookForRender[],
  collator: Intl.Collator
): Array<{ theme: string; items: BookForRender[] }> {
  const map = new Map<string, BookForRender[]>();
  for (const b of books) {
    const list = map.get(b.theme) ?? [];
    list.push(b);
    map.set(b.theme, list);
  }
  const themes = [...map.keys()].sort(collator.compare);
  return themes.map(theme => ({
    theme,
    items: [...(map.get(theme) ?? [])].sort((a, b) =>
      collator.compare(a.title, b.title)
    ),
  }));
}

function sortAlpha(books: BookForRender[], collator: Intl.Collator) {
  return [...books].sort((a, b) => collator.compare(a.title, b.title));
}

function sortRating(books: BookForRender[], collator: Intl.Collator) {
  return [...books].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.yearRead !== a.yearRead) return b.yearRead - a.yearRead;
    return collator.compare(a.title, b.title);
  });
}

function partitionByStatus(books: BookForRender[]): BookForRender[] {
  // Put "want-to-read" at the end of the array regardless of sort.
  const main = books.filter(b => b.status !== "want-to-read");
  const tail = books.filter(b => b.status === "want-to-read");
  return [...main, ...tail];
}

export default function Bookshelf({ lang, books }: Props) {
  const s = STRINGS[lang];
  const [sort, setSort] = useState<SortMode>("alpha");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [clickedSlug, setClickedSlug] = useState<string | null>(null);
  const [flightBook, setFlightBook] = useState<BookForRender | null>(null);
  const [flightFrom, setFlightFrom] = useState<Rect | null>(null);
  const [flightOpen, setFlightOpen] = useState(false);
  const bookRefs = useRef<Map<string, BookAnchor>>(new Map());

  const hasHover = useHoverCapable();
  const isMobile = useIsMobile();
  const flightMetrics = useMemo(() => getBookMetrics(isMobile), [isMobile]);

  const collator = useMemo(
    () => new Intl.Collator(lang, { sensitivity: "base" }),
    [lang]
  );

  const counts = useMemo(
    () => ({
      total: books.length,
      reading: books.filter(b => b.status === "reading").length,
    }),
    [books]
  );

  const shelves = useMemo<
    Array<{ theme?: string; items: BookForRender[] }>
  >(() => {
    if (sort === "theme") {
      return groupByTheme(books, collator).map(g => ({
        theme: g.theme,
        items: partitionByStatus(g.items),
      }));
    }
    if (sort === "rating") {
      return [{ items: partitionByStatus(sortRating(books, collator)) }];
    }
    return [{ items: partitionByStatus(sortAlpha(books, collator)) }];
  }, [books, collator, sort]);

  const clickedBook = useMemo(
    () => books.find(b => b.slug === clickedSlug) ?? null,
    [books, clickedSlug]
  );

  const setBookAnchor = (
    slug: string,
    next: Partial<BookAnchor>
  ) => {
    const current = bookRefs.current.get(slug) ?? { slot: null, inner: null };
    const updated = { ...current, ...next };
    if (!updated.slot && !updated.inner) bookRefs.current.delete(slug);
    else bookRefs.current.set(slug, updated);
  };

  const registerSlotRef = (slug: string, el: HTMLDivElement | null) => {
    setBookAnchor(slug, { slot: el });
  };

  const registerInnerRef = (slug: string, el: HTMLDivElement | null) => {
    setBookAnchor(slug, { inner: el });
  };

  const getBookRect = (slug: string): Rect | null => {
    const anchor = bookRefs.current.get(slug);
    const slot = anchor?.slot ?? null;
    const inner = anchor?.inner ?? null;
    if (!slot && !inner) return null;
    const slotRect = slot?.getBoundingClientRect() ?? null;
    const innerRect = inner?.getBoundingClientRect() ?? null;
    const top = innerRect?.top ?? slotRect?.top ?? null;
    const left = slotRect?.left ?? innerRect?.left ?? null;
    if (top === null || left === null) return null;
    return {
      top,
      left,
      width: flightMetrics.coverWidth,
      height: flightMetrics.coverHeight,
    };
  };

  const startFlight = (book: BookForRender) => {
    const rect = getBookRect(book.slug);
    if (rect) {
      setFlightBook(book);
      setFlightFrom(rect);
      setFlightOpen(true);
    } else {
      setFlightBook(null);
      setFlightFrom(null);
      setFlightOpen(false);
    }
    setClickedSlug(book.slug);
  };

  const handleFlightRest = useCallback(() => {
    setFlightBook(null);
    setFlightFrom(null);
  }, []);

  const handleBookClick = (book: BookForRender) => {
    if (hasHover) {
      startFlight(book);
      return;
    }
    // Touch: first tap hovers, second tap launches the flight + modal.
    if (hoveredSlug === book.slug) {
      startFlight(book);
    } else {
      setHoveredSlug(book.slug);
    }
  };

  const handleSortKey = (
    e: React.KeyboardEvent<HTMLDivElement>,
    modes: SortMode[]
  ) => {
    const idx = modes.indexOf(sort);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setSort(modes[(idx + 1) % modes.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSort(modes[(idx - 1 + modes.length) % modes.length]);
    }
  };

  const modes: SortMode[] = ["alpha", "theme", "rating"];
  const sortLabels: Record<SortMode, string> = {
    alpha: s.sortAZ,
    theme: s.sortTheme,
    rating: s.sortRating,
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="font-mono text-xs uppercase tracking-wider text-accent">
          {s.prompt}
        </div>
        <div className="font-mono text-sm text-muted">
          {s.countsSuffix(counts.total, counts.reading)}
        </div>
      </header>

      <div
        role="group"
        aria-label={s.sortAZ}
        onKeyDown={e => handleSortKey(e, modes)}
        className="flex flex-wrap items-center gap-2 font-mono text-xs"
      >
        {modes.map(m => {
          const active = sort === m;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              onClick={() => setSort(m)}
              className={[
                "rounded-md border px-3 py-1 transition-colors",
                active
                  ? "border-accent text-accent font-semibold underline underline-offset-4"
                  : "border-border text-muted hover:text-foreground",
              ].join(" ")}
            >
              {sortLabels[m]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8">
        {books.length === 0 ? (
          <p className="font-mono text-sm text-muted">{s.empty}</p>
        ) : (
          shelves.map((shelf, i) => (
            <section key={shelf.theme ?? `shelf-${i}`} className="flex flex-col gap-3">
              {shelf.theme && (
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
                  {s.themeMarker} {shelf.theme}
                </h2>
              )}
              <div className="bookshelf-row flex flex-wrap items-end gap-[6px] sm:gap-[6px]">
                {(() => {
                  const anchorSlug = clickedSlug ?? hoveredSlug;
                  const anchorIdx = shelf.items.findIndex(
                    b => b.slug === anchorSlug
                  );
                  return shelf.items.map((book, idx) => {
                    let nudgeX = 0;
                    if (anchorIdx >= 0 && idx !== anchorIdx) {
                      const delta = idx - anchorIdx;
                      const dir = Math.sign(delta);
                      const abs = Math.abs(delta);
                      if (abs === 1) nudgeX = dir * 8;
                      else if (abs === 2) nudgeX = dir * 3;
                    }
                    return (
                      <Book
                        key={book.slug}
                        book={book}
                        lang={lang}
                        showRating={sort === "rating"}
                        isHovered={hoveredSlug === book.slug}
                        isClicked={clickedSlug === book.slug}
                        isGhosted={flightBook?.slug === book.slug}
                        nudgeX={nudgeX}
                        hasHover={hasHover}
                        isMobile={isMobile}
                        onPointerEnter={() => {
                          if (clickedSlug === null) setHoveredSlug(book.slug);
                        }}
                        onPointerLeave={() => {
                          if (hoveredSlug === book.slug) setHoveredSlug(null);
                        }}
                        onFocus={() => {
                          if (clickedSlug === null) setHoveredSlug(book.slug);
                        }}
                        onBlur={() => {
                          if (hoveredSlug === book.slug) setHoveredSlug(null);
                        }}
                        onClick={() => handleBookClick(book)}
                        registerSlotRef={el => registerSlotRef(book.slug, el)}
                        registerInnerRef={el => registerInnerRef(book.slug, el)}
                      />
                    );
                  });
                })()}
              </div>
              <div className="shelf-baseline" aria-hidden="true" />
            </section>
          ))
        )}
      </div>

      <p
        aria-hidden="true"
        className="font-mono text-[10px] text-muted text-center"
      >
        {hasHover ? s.footerHover : s.footerTouch}
      </p>

      {flightBook && flightFrom && (
        <FlyingBook
          book={flightBook}
          lang={lang}
          isMobile={isMobile}
          fromRect={flightFrom}
          open={flightOpen}
          onRest={handleFlightRest}
        />
      )}

      <BookModal
        book={clickedBook}
        lang={lang}
        onClose={() => {
          if (clickedSlug) {
            const rect = getBookRect(clickedSlug);
            if (rect) setFlightFrom(rect);
          }
          setClickedSlug(null);
          setFlightOpen(false);
        }}
      />
    </div>
  );
}
