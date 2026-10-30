import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { LayoutGrid, Rows3, Search, X } from "lucide-react";
import "./bookshelf.css";
import Book from "./Book";
import { getShelfBookMetrics, getShelfSlotWidth } from "./Book3D";
import { STRINGS } from "./strings";
import type { Lang, LocalizedBook, ShelfView, SortMode } from "./types";

type BookForRender = LocalizedBook;
type Props = {
  lang: Lang;
  books: LocalizedBook[];
  active?: boolean;
  unavailableSlugs: string[];
  revealSlug?: string;
  onOpenBook: (book: LocalizedBook) => void;
};

function normalizeSearch(value: string, lang: Lang) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(lang);
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

export default function Bookshelf({
  lang,
  books,
  active = true,
  unavailableSlugs,
  revealSlug,
  onOpenBook,
}: Props) {
  const s = STRINGS[lang];
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [sort, setSort] = useState<SortMode>("alpha");
  const [view, setView] = useState<ShelfView>("spines");
  const [query, setQuery] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [hasHover, setHasHover] = useState(true);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (root.clientWidth > 0) setWidth(Math.floor(root.clientWidth));
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0)
        setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(root);
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    if (!active) setHoveredSlug(null);
  }, [active]);
  // A checked-out book can return even if the shelf was filtered meanwhile.
  useEffect(() => {
    if (revealSlug) {
      setQuery("");
      setHoveredSlug(null);
    }
  }, [revealSlug]);
  const small = width < 600;
  const collator = useMemo(
    () => new Intl.Collator(lang, { sensitivity: "base" }),
    [lang]
  );
  const searchIndex = useMemo(
    () =>
      new Map(
        books.map(book => [
          book.slug,
          normalizeSearch(`${book.title} ${book.author} ${book.theme}`, lang),
        ])
      ),
    [books, lang]
  );
  const matches = useMemo(() => {
    const terms = normalizeSearch(query, lang)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return terms.length
      ? books.filter(book =>
          terms.every(term => searchIndex.get(book.slug)?.includes(term))
        )
      : books;
  }, [books, query, lang, searchIndex]);
  const unavailable = useMemo(
    () => new Set(unavailableSlugs),
    [unavailableSlugs]
  );
  const shelves = useMemo(() => {
    const groups =
      sort === "theme"
        ? groupByTheme(matches, collator)
        : [
            {
              theme: "",
              items:
                sort === "rating"
                  ? sortRating(matches, collator)
                  : sortAlpha(matches, collator),
            },
          ];
    const rows: Array<{
      key: string;
      theme?: string;
      items: LocalizedBook[];
      height: number;
    }> = [];
    const budget = Math.max(40, width - 48);
    const gap = view === "spines" ? 3 : 16;
    for (const group of groups) {
      let items: LocalizedBook[] = [];
      let used = 0;
      let first = true;
      const flush = () => {
        if (!items.length) return;
        const tallest = Math.max(
          ...items.map(
            book =>
              getShelfBookMetrics(small, book.slug, book.pageCount, view)
                .coverHeight
          )
        );
        rows.push({
          key: `${group.theme}:${items[0].slug}`,
          theme: first ? group.theme : undefined,
          items,
          height:
            tallest +
            52 +
            (view === "covers" ? 64 + (sort === "rating" ? 18 : 0) : 0) +
            (first && group.theme ? 26 : 0),
        });
        first = false;
        items = [];
        used = 0;
      };
      for (const book of partitionByStatus(group.items)) {
        const bookWidth = getShelfSlotWidth(
          getShelfBookMetrics(small, book.slug, book.pageCount, view),
          view
        );
        if (items.length && used + gap + bookWidth > budget) flush();
        used += (items.length ? gap : 0) + bookWidth;
        items.push(book);
      }
      flush();
    }
    return rows;
  }, [matches, collator, sort, view, width, small]);
  const modes: SortMode[] = ["alpha", "theme", "rating"];
  const labels: Record<SortMode, string> = {
    alpha: s.sortAZ,
    theme: s.sortTheme,
    rating: s.sortRating,
  };
  return (
    <div ref={rootRef} className="bookshelf-archive" data-view={view}>
      <div className="bookshelf-toolbar">
        <label className="bookshelf-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            aria-label={s.searchLabel}
            placeholder={s.searchPlaceholder}
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setHoveredSlug(null);
            }}
          />
          {query && (
            <button
              type="button"
              aria-label={s.clearSearch}
              onClick={() => setQuery("")}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>
        <div className="bookshelf-views" role="group" aria-label={s.viewLabel}>
          <button
            type="button"
            aria-pressed={view === "spines"}
            onClick={() => {
              setView("spines");
              setHoveredSlug(null);
            }}
          >
            <Rows3 size={13} aria-hidden="true" />
            {s.spines}
          </button>
          <button
            type="button"
            aria-pressed={view === "covers"}
            onClick={() => {
              setView("covers");
              setHoveredSlug(null);
            }}
          >
            <LayoutGrid size={13} aria-hidden="true" />
            {s.covers}
          </button>
        </div>
      </div>
      <div
        role="group"
        aria-label={s.sortLabel}
        className="bookshelf-controls"
        onKeyDown={event => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const next =
            modes[
              (modes.indexOf(sort) + (event.key === "ArrowRight" ? 1 : 2)) % 3
            ];
          setSort(next);
          event.currentTarget
            .querySelector<HTMLButtonElement>(`[data-sort="${next}"]`)
            ?.focus();
        }}
      >
        <span className="bookshelf-sort-label">{s.sortLabel}</span>
        {modes.map(mode => (
          <button
            key={mode}
            data-sort={mode}
            type="button"
            aria-pressed={sort === mode}
            onClick={() => setSort(mode)}
            className="bookshelf-sort"
          >
            {labels[mode]}
          </button>
        ))}
      </div>
      <div className="bookshelf-bays">
        {!matches.length && (
          <p className="bookshelf-empty" role="status">
            {books.length ? s.noMatches : s.empty}
          </p>
        )}
        {shelves.map(shelf => (
          <section
            key={shelf.key}
            className="bookshelf-bay"
            style={
              { "--shelf-bay-height": `${shelf.height}px` } as CSSProperties
            }
          >
            {shelf.theme && (
              <h2 className="bookshelf-theme">
                {s.themeMarker} {shelf.theme}
              </h2>
            )}
            <div className="bookshelf-row">
              {shelf.items.map(book => (
                <Book
                  key={book.slug}
                  book={book}
                  lang={lang}
                  view={view}
                  showRating={sort === "rating"}
                  isHovered={hoveredSlug === book.slug}
                  isGhosted={unavailable.has(book.slug)}
                  hasHover={hasHover}
                  small={small}
                  onHoverChange={setHoveredSlug}
                  onOpenBook={onOpenBook}
                />
              ))}
            </div>
            <div className="shelf-baseline" aria-hidden="true" />
          </section>
        ))}
      </div>
    </div>
  );
}
