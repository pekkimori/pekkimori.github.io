import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { ATLAS } from "@/data/about";
import { ATLAS_PT } from "@/data/about-pt";
import { DESKTOP_FOLDERS, type AppId } from "@/data/about-commands";
import GlobeCard from "./GlobeCard";
import DesktopTerminal from "./DesktopTerminal";
import { BookOpen, FileText, Moon, Sun, X } from "lucide-react";
import PostReader from "../terminal/PostReader";
import TerminalSky from "../terminal/TerminalSky";
import CRTScreenEffects from "../terminal/CRTScreenEffects";
import SocialIcon from "../terminal/SocialIcon";
import AsciiCat from "../terminal/AsciiCat";
import PostList from "../terminal/PostList";
import PostsPanel from "../terminal/PostsPanel";
import PanelErrorBoundary from "../terminal/PanelErrorBoundary";
import type { TerminalPost, PostsView } from "../terminal/types";
import type { LocalizedBook } from "../bookshelf/types";
import BookReview from "../bookshelf/BookReview";
import FlyingBook from "../bookshelf/FlyingBook";
import { getBookPose, type BookFlight } from "../bookshelf/book-flight";
import { useMediaMachine } from "../media/useMediaMachine";
import MediaDock from "../media/MediaDock";
import type { MediaKind } from "../media/media-catalog";
import "./about-terminal.css";
import "../terminal/crt-screen.css";

const AnimeArchive = lazy(() => import("../media/AnimeArchive"));
const GameArchive = lazy(() => import("../media/GameArchive"));
const MusicArchive = lazy(() => import("../media/MusicArchive"));
const MusicPlayer = lazy(() => import("../media/MusicPlayer"));
const MediaPlayback = lazy(() => import("../media/MediaPlayback"));
const Bookshelf = lazy(() => import("../bookshelf/Bookshelf"));
const Calendar = lazy(() => import("../Calendar"));
const ConstellationMap = lazy(() => import("../ConstellationMap"));
const TextPressure = lazy(() => import("../TextPressure"));

type WindowId =
  | Exclude<AppId, "terminal">
  | `post:${string}`
  | `book:${string}`;
const RESIZE_DIRECTIONS = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;
type ResizeDirection = (typeof RESIZE_DIRECTIONS)[number];
type WindowBounds = { x: number; y: number; width: number; height: number };
type WindowState = {
  id: WindowId;
  tabOrder: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  minimized: boolean;
  maximized: boolean;
};
type Lang = "en" | "pt";
const NAMES: Record<Lang, Record<AppId, string>> = {
  en: {
    about: "About me",
    games: "Games",
    bookshelf: "Bookshelf",
    music: "Music",
    anime: "Anime",
    atlas: "Atlas",
    portfolio: "Portfolio",
    posts: "Posts",
    terminal: "Terminal",
  },
  pt: {
    about: "Sobre mim",
    games: "Jogos",
    bookshelf: "Estante",
    music: "Música",
    anime: "Anime",
    atlas: "Atlas",
    portfolio: "Portfólio",
    posts: "Publicações",
    terminal: "Terminal",
  },
};

function Icon({
  id,
  small = false,
}: {
  id: WindowId | "terminal";
  small?: boolean;
}) {
  if (id.startsWith("book:"))
    return (
      <BookOpen
        className={`retro-icon ${small ? "is-small" : ""}`}
        aria-hidden="true"
      />
    );
  return (
    <svg
      className={`retro-icon ${small ? "is-small" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "terminal" ? (
        <>
          <rect x="2" y="3" width="20" height="18" rx="3" />
          <path d="m6 8 4 4-4 4m7 0h5" />
        </>
      ) : id === "about" ? (
        <>
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <path d="M8 21h8m-4-4v4M7 8h4m-4 4h10" />
        </>
      ) : (
        <path d="M3 6h6l2 3h10v11H3V6Zm0 3V4h7l2 2h8v3" />
      )}
    </svg>
  );
}

export default function AboutTerminal({
  lang = "en",
  version,
  books,
  posts,
  socials,
  postCatalog,
  initialPost,
  postContent,
  initialTab = "terminal",
  initialView = "posts",
  initialTag = "",
}: {
  lang?: Lang;
  version: string;
  books: LocalizedBook[];
  posts: TerminalPost[];
  socials: { name: string; href: string; title: string }[];
  postCatalog: TerminalPost[];
  initialPost?: TerminalPost;
  postContent?: ReactNode;
  initialTab?: AppId;
  initialView?: PostsView;
  initialTag?: string;
}) {
  const musicDeck = useMediaMachine();
  const animeDeck = useMediaMachine();
  const gameDeck = useMediaMachine();
  const mediaSlotRef = useRef<HTMLButtonElement>(null);
  const musicTrack = musicDeck.loaded;
  const [musicPauseSignal, setMusicPauseSignal] = useState(0);
  const [animePauseSignal, setAnimePauseSignal] = useState(0);
  const pauseMusic = useCallback(
    () => setMusicPauseSignal(value => value + 1),
    []
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // The calendar removes its injected head styles during cleanup. Unmount it
    // before Astro swaps the head so those style nodes still belong to it.
    const beforeSwap = () => flushSync(() => setMounted(false));
    document.addEventListener("astro:before-swap", beforeSwap);
    return () => document.removeEventListener("astro:before-swap", beforeSwap);
  }, []);
  const pt = lang === "pt";
  const names = NAMES[lang];
  const [windows, setWindows] = useState<WindowState[]>(
    initialPost
      ? [
          {
            id: `post:${initialPost.href}`,
            tabOrder: 0,
            x: 64,
            y: 12,
            minimized: false,
            maximized: false,
          },
        ]
      : initialTab === "terminal"
        ? []
        : [
            {
              id: initialTab,
              tabOrder: 0,
              x: 64,
              y: 12,
              minimized: false,
              maximized: false,
            },
          ]
  );
  const [postsView, setPostsView] = useState<PostsView>(initialView);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [searchQuery, setSearchQuery] = useState("");
  const [catVisible, setCatVisible] = useState(false);
  const [bookFlights, setBookFlights] = useState<BookFlight[]>([]);
  const nextBookFlightId = useRef(0);
  const screenRef = useRef<HTMLDivElement>(null);
  const catTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{
    id: WindowId;
    x: number;
    y: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const resizeGesture = useRef<{
    id: WindowId;
    direction: ResizeDirection;
    pointerX: number;
    pointerY: number;
    bounds: WindowBounds;
  } | null>(null);
  const postFor = (id: WindowId | "terminal") =>
    postCatalog.find(post => `post:${post.href}` === id);
  const bookFor = (id: WindowId | "terminal") =>
    books.find(book => `book:${book.slug}` === id);
  const windowName = (id: WindowId | "terminal") =>
    bookFor(id)?.title ?? postFor(id)?.title ?? names[id as AppId];
  const unavailableBookSlugs = [
    ...windows.filter(w => w.id.startsWith("book:")).map(w => w.id.slice(5)),
    ...bookFlights.map(flight => flight.slug),
  ];
  const finishBookFlight = useCallback((flight: BookFlight) => {
    setBookFlights(previous => previous.filter(item => item.id !== flight.id));
    if (flight.destination === "shelf")
      requestAnimationFrame(() => {
        document
          .getElementById(`book-shelf-${flight.slug}`)
          ?.querySelector("button")
          ?.focus({ preventScroll: true });
      });
  }, []);
  const active = windows.filter(w => !w.minimized).at(-1)?.id ?? "terminal";
  const mediaKind: MediaKind | null =
    active === "anime" || active === "games" || active === "music"
      ? active
      : null;
  const deckFor = (kind: MediaKind) =>
    kind === "anime" ? animeDeck : kind === "games" ? gameDeck : musicDeck;
  const insertMedia = (kind: MediaKind, index: number) => {
    deckFor(kind).insert(index);
    if (kind === "games") pauseMusic();
  };
  const ejectPlayback = () => {
    animeDeck.eject();
    gameDeck.eject();
    requestAnimationFrame(() =>
      mediaSlotRef.current?.focus({ preventScroll: true })
    );
  };
  // Full-size windows keep the sky visible, so hide the layers they cover
  // instead of letting their transparent surface show other window content.
  const coveringWindowIndex = windows.reduce(
    (index, w, i) => (!w.minimized && w.maximized ? i : index),
    -1
  );
  // Keep DOM order stable when focus changes; only the visual stacking changes.
  const windowLayers = windows
    .map((w, i) => ({ w, i }))
    .sort((a, b) => a.w.tabOrder - b.w.tabOrder);
  useEffect(() => {
    const revealTab = () =>
      document.getElementById(`tab-${active}`)?.parentElement?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    revealTab();
    window.addEventListener("resize", revealTab);
    return () => window.removeEventListener("resize", revealTab);
  }, [active]);
  const focusInput = () =>
    requestAnimationFrame(() =>
      document.getElementById("retro-command")?.focus({ preventScroll: true })
    );
  const routeTo = (
    id: WindowId | "terminal",
    view: PostsView = postsView,
    tag = selectedTag,
    query = searchQuery
  ) => {
    const path = id.startsWith("book:")
      ? `/${lang}/bookshelf#${encodeURIComponent(id.slice(5))}`
      : id.startsWith("post:")
        ? id.slice(5)
        : id === "terminal"
          ? `/${lang}/`
          : id === "posts" && view !== "posts"
            ? `/${lang}/${view}${view === "tags" && tag ? `/${tag}` : ""}`
            : `/${lang}/${id}`;
    const destination =
      path +
      (id === "posts" && view === "search" && query
        ? `?q=${encodeURIComponent(query)}`
        : "");
    if (
      window.location.pathname.replace(/\/$/, "") +
        window.location.search +
        window.location.hash !==
      destination.replace(/\/$/, "")
    )
      window.history.pushState(null, "", destination);
    sessionStorage.setItem("backUrl", destination);
  };
  const showTerminal = () => {
    routeTo("terminal");
    setWindows(previous => previous.map(w => ({ ...w, minimized: true })));
    focusInput();
  };
  const setSiteTheme = (value: string) => {
    if (document.documentElement.dataset.theme !== value)
      document.getElementById("theme-btn")?.click();
  };
  const showCat = () => {
    setCatVisible(true);
    if (catTimer.current) clearTimeout(catTimer.current);
    catTimer.current = setTimeout(() => setCatVisible(false), 6000);
  };
  useEffect(
    () => () => {
      if (catTimer.current) clearTimeout(catTimer.current);
    },
    []
  );
  const focus = (id: WindowId) => {
    if (id === active) return;
    routeTo(id);
    setWindows(previous => {
      const item = previous.find(w => w.id === id);
      return item ? [...previous.filter(w => w.id !== id), item] : previous;
    });
  };
  const open = (id: WindowId | "terminal") => {
    if (id === "terminal") {
      showTerminal();
      return;
    }
    routeTo(id);
    const element = document.getElementById(`window-${id}`);
    const titlebar = element
      ?.querySelector(".retro-titlebar")
      ?.getBoundingClientRect();
    const workspace = element?.parentElement?.getBoundingClientRect();
    const outOfReach =
      element &&
      !element.hidden &&
      titlebar &&
      workspace &&
      (titlebar.right <= workspace.left ||
        titlebar.left >= workspace.right ||
        titlebar.bottom <= workspace.top ||
        titlebar.top >= workspace.bottom);
    setWindows(previous => {
      const item = previous.find(w => w.id === id);
      const n = previous.length;
      return [
        ...previous.filter(w => w.id !== id),
        item
          ? {
              ...item,
              ...(outOfReach ? { x: 64, y: 12 } : {}),
              minimized: false,
            }
          : {
              id,
              tabOrder: Math.max(0, ...previous.map(w => w.tabOrder)) + 1,
              x: Math.min(
                64 + n * 24,
                Math.max(8, (screenRef.current?.clientWidth ?? 1000) - 590)
              ),
              y: 12 + (n % 4) * 24,
              minimized: false,
              maximized: false,
            },
      ];
    });
    requestAnimationFrame(() => {
      const target = document.getElementById(`window-${id}`);
      target?.focus({ preventScroll: true });
    });
  };
  const close = (id: WindowId) => {
    if (id === "anime") animeDeck.eject();
    if (id === "games") gameDeck.eject();
    if (id.startsWith("book:")) {
      const book = bookFor(id);
      if (!book) return;
      const from =
        getBookPose(book.slug, "flight") ?? getBookPose(book.slug, "review");
      const flight: BookFlight | null = from
        ? {
            id: ++nextBookFlightId.current,
            slug: book.slug,
            from,
            destination: "shelf",
          }
        : null;
      setBookFlights(previous => [
        ...previous.filter(flight => flight.slug !== book.slug),
        ...(flight ? [flight] : []),
      ]);
      routeTo("bookshelf");
      setWindows(previous => [
        ...previous.filter(w => w.id !== id && w.id !== "bookshelf"),
        {
          ...(previous.find(w => w.id === "bookshelf") ?? {
            id: "bookshelf" as const,
            tabOrder: Math.max(0, ...previous.map(w => w.tabOrder)) + 1,
            x: 64,
            y: 12,
            maximized: false,
          }),
          minimized: false,
        },
      ]);
      requestAnimationFrame(() => {
        document
          .getElementById("tab-bookshelf")
          ?.focus({ preventScroll: true });
      });
      return;
    }
    const next =
      id === active
        ? (windows.filter(w => w.id !== id && !w.minimized).at(-1)?.id ??
          "terminal")
        : active;
    if (id === active) routeTo(next);
    setWindows(previous => previous.filter(w => w.id !== id));
    requestAnimationFrame(() => {
      document.getElementById(`tab-${next}`)?.focus({ preventScroll: true });
    });
  };
  const openBook = (book: LocalizedBook) => {
    const id: WindowId = `book:${book.slug}`;
    if (!windows.some(w => w.id === id)) {
      const from =
        getBookPose(book.slug, "flight") ?? getBookPose(book.slug, "shelf");
      if (from) {
        const flight: BookFlight = {
          id: ++nextBookFlightId.current,
          slug: book.slug,
          from,
          destination: "review",
        };
        setBookFlights(previous => [
          ...previous.filter(flight => flight.slug !== book.slug),
          flight,
        ]);
      }
    }
    open(id);
  };
  const minimize = (id: WindowId) => {
    const next =
      id === active
        ? (windows.filter(w => w.id !== id && !w.minimized).at(-1)?.id ??
          "terminal")
        : active;
    if (id === active) routeTo(next);
    setWindows(previous =>
      previous.map(w => (w.id === id ? { ...w, minimized: true } : w))
    );
    if (next === "terminal") focusInput();
    else
      requestAnimationFrame(() => {
        document.getElementById(`tab-${next}`)?.focus({ preventScroll: true });
      });
  };
  const toggleMaximize = (id: WindowId) => {
    focus(id);
    setWindows(previous =>
      previous.map(w => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  };
  const update = (id: WindowId, change: Partial<WindowState>) =>
    setWindows(previous =>
      previous.map(w => (w.id === id ? { ...w, ...change } : w))
    );
  const resizeWindow = (
    id: WindowId,
    direction: ResizeDirection,
    bounds: WindowBounds,
    dx: number,
    dy: number
  ) => {
    const width = Math.max(
      320,
      bounds.width +
        (direction.includes("e") ? dx : direction.includes("w") ? -dx : 0)
    );
    const height = Math.max(
      180,
      bounds.height +
        (direction.includes("s") ? dy : direction.includes("n") ? -dy : 0)
    );
    update(id, {
      width,
      height,
      x: bounds.x + (direction.includes("w") ? bounds.width - width : 0),
      y: bounds.y + (direction.includes("n") ? bounds.height - height : 0),
    });
  };
  useEffect(() => {
    const restoreLocation = () => {
      const section = window.location.pathname.split("/")[2] ?? "";
      const restoredBook =
        section === "bookshelf"
          ? books.find(
              book =>
                `#${encodeURIComponent(book.slug)}` === window.location.hash
            )
          : undefined;
      const article =
        postCatalog.find(
          post =>
            post.href.replace(/\/$/, "") ===
            window.location.pathname.replace(/\/$/, "")
        ) ??
        (window.location.pathname.startsWith("/posts/")
          ? initialPost
          : undefined);
      const id: WindowId | "terminal" = restoredBook
        ? `book:${restoredBook.slug}`
        : article
          ? `post:${article.href}`
          : section === "tags" || section === "search"
            ? "posts"
            : (DESKTOP_FOLDERS as readonly string[]).includes(section)
              ? (section as AppId)
              : "terminal";
      if (section === "search")
        setSearchQuery(
          new URLSearchParams(window.location.search).get("q") ?? ""
        );
      setPostsView(
        section === "tags" || section === "search" ? section : "posts"
      );
      setSelectedTag(
        section === "tags" ? (window.location.pathname.split("/")[3] ?? "") : ""
      );
      setWindows(previous => {
        const other = previous
          .filter(w => w.id !== id)
          .map(w => ({ ...w, minimized: true }));
        if (id === "terminal") return other;
        const existing = previous.find(w => w.id === id);
        return [
          ...other,
          existing
            ? { ...existing, minimized: false }
            : {
                id,
                tabOrder: Math.max(0, ...previous.map(w => w.tabOrder)) + 1,
                x: 64,
                y: 12,
                minimized: false,
                maximized: false,
              },
        ];
      });
      sessionStorage.setItem(
        "backUrl",
        window.location.pathname + window.location.search + window.location.hash
      );
    };
    restoreLocation();
    window.addEventListener("popstate", restoreLocation);
    return () => window.removeEventListener("popstate", restoreLocation);
  }, []);
  useEffect(() => {
    document.title =
      active === "terminal"
        ? "pekkimori · Rafael Mori"
        : `${windowName(active)} · Rafael Mori`;
  }, [active, names, postCatalog]);
  const browsePosts = (view: PostsView, tag = "", query = searchQuery) => {
    setSearchQuery(query);
    setPostsView(view);
    setSelectedTag(tag);
    routeTo("posts", view, tag, query);
    // open() uses the previous view until React commits this update.
    setWindows(previous => [
      ...previous.filter(w => w.id !== "posts"),
      {
        ...(previous.find(w => w.id === "posts") ?? {
          id: "posts" as const,
          tabOrder: Math.max(0, ...previous.map(w => w.tabOrder)) + 1,
          x: 64,
          y: 12,
          maximized: false,
        }),
        minimized: false,
      },
    ]);
  };
  const visit = (destination: string) => {
    const url = new URL(destination, window.location.origin);
    const article = postCatalog.find(
      post => post.href.replace(/\/$/, "") === url.pathname.replace(/\/$/, "")
    );
    if (article) {
      open(`post:${article.href}`);
      if (url.hash) {
        history.replaceState(history.state, "", article.href + url.hash);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
      return true;
    }
    const [locale, section = "", tag = ""] = url.pathname
      .split("/")
      .filter(Boolean);
    if (
      locale !== lang ||
      url.pathname.split("/").filter(Boolean).length >
        (section === "tags" ? 3 : 2)
    )
      return false;
    if (section === "tags" || section === "search" || section === "posts")
      browsePosts(section, tag, url.searchParams.get("q") ?? searchQuery);
    else if (section === "bookshelf" && url.hash) {
      const book = books.find(
        book => `#${encodeURIComponent(book.slug)}` === url.hash
      );
      if (!book) return false;
      openBook(book);
    } else if (!section) showTerminal();
    else if ((DESKTOP_FOLDERS as readonly string[]).includes(section))
      open(section as AppId);
    else return false;
    return true;
  };
  const interceptLink = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      "a[href]"
    );
    if (
      !anchor ||
      anchor.target === "_blank" ||
      anchor.hasAttribute("download")
    )
      return;
    const url = new URL(anchor.href);
    if (
      url.origin === window.location.origin &&
      visit(url.pathname + url.search + url.hash)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const languageHref = (locale: Lang) => {
    const book = bookFor(active);
    if (book) return `/${locale}/bookshelf#${encodeURIComponent(book.slug)}`;
    const article = postFor(active);
    if (article)
      return (
        article.translations?.find(t => t.lang === locale)?.href ??
        `/${locale}/posts`
      );
    return `/${locale}/${active === "terminal" ? "" : active === "posts" && postsView !== "posts" ? postsView : active}`;
  };
  const atlas = pt ? ATLAS_PT : ATLAS;
  const content = (id: WindowId): ReactNode => {
    const book = bookFor(id);
    if (book)
      return (
        <BookReview
          book={book}
          lang={lang}
          coverHidden={bookFlights.some(
            flight =>
              flight.slug === book.slug && flight.destination === "review"
          )}
        />
      );
    const article = postFor(id);
    if (article)
      return (
        <PostReader
          post={article}
          lang={lang}
          active={active === id}
          initialContent={
            initialPost?.href === article.href ? postContent : undefined
          }
        />
      );
    switch (id) {
      case "about":
        return (
          <div className="retro-about">
            <div className="retro-welcome">
              <div>
                <h2>
                  {pt ? "Olá!" : "Hello!"}{" "}
                  <a
                    className="terminal-rss"
                    href="/rss.xml"
                    aria-label="RSS feed"
                  >
                    RSS ↗
                  </a>
                </h2>
                <AsciiCat />
              </div>
              <p>
                {pt ? (
                  <>
                    IA &amp; Neurociência @ Minerva ’28,
                    <br />
                    Aspirante a Engenheiro de Pesquisa,
                    <br />
                    Um Cometa Existencialista
                  </>
                ) : (
                  <>
                    AI &amp; Neuroscience @ Minerva ’28,
                    <br />
                    Aspiring Research Engineer,
                    <br />A Humanist Existentialist Comet
                  </>
                )}
              </p>
            </div>
            <div className="retro-paper">
              <p>
                {pt ? (
                  <>
                    Construindo sistemas, escrevendo poemas e explorando
                    cérebros.
                    <br />
                    Um polímata dedicado à pesquisa-engenharia com uma lente
                    filosófica.
                    <br />
                    Este blog é um espaço onde faço a ponte entre o conhecimento
                    técnico e minha experiência subjetiva.
                  </>
                ) : (
                  <>
                    Building systems, writing poems, and exploring brains.
                    <br />A polymath dedicated to research-engineering with a
                    philosophical lens.
                    <br />
                    This blog is a space where I bridge the gap between hard
                    knowledge and my subjective experience.
                  </>
                )}
              </p>
              <PanelErrorBoundary lang={lang}>
                <Suspense
                  fallback={
                    <p>{pt ? "Carregando atividade…" : "Loading activity…"}</p>
                  }
                >
                  {mounted && <Calendar />}
                </Suspense>
              </PanelErrorBoundary>
            </div>
            {posts.some(post => post.featured) && (
              <div className="terminal-featured">
                <h2>{pt ? "Destaques" : "Featured"}</h2>
                <PostList
                  posts={posts.filter(post => post.featured)}
                  lang={lang}
                />
              </div>
            )}
            <button
              className="retro-button"
              onClick={() => browsePosts("posts")}
            >
              {pt ? "Todos os posts" : "All posts"} →
            </button>
          </div>
        );
      case "posts":
        return (
          <PostsPanel
            lang={lang}
            posts={posts}
            view={postsView}
            tag={selectedTag}
            navigate={browsePosts}
            onQuery={setSearchQuery}
          />
        );
      case "portfolio":
        return (
          <Suspense
            fallback={
              <p>{pt ? "Carregando portfólio…" : "Loading portfolio…"}</p>
            }
          >
            <TextPressure
              text={pt ? "Meu Portfólio" : "My Portfolio"}
              flex
              alpha={false}
              width
              weight={false}
              italic
              minFontSize={36}
            />
            <ConstellationMap />
          </Suspense>
        );
      case "games":
        return (
          <Suspense
            fallback={
              <p>{pt ? "Carregando cartuchos…" : "Loading cartridges…"}</p>
            }
          >
            <GameArchive
              lang={lang}
              active={active === "games"}
              deck={gameDeck}
              dockRef={mediaSlotRef}
              onInsert={index => insertMedia("games", index)}
            />
          </Suspense>
        );
      case "bookshelf":
        return (
          <Suspense
            fallback={
              <p>{pt ? "Carregando estante…" : "Loading bookshelf…"}</p>
            }
          >
            <Bookshelf
              lang={lang}
              books={books}
              active={active === "bookshelf"}
              unavailableSlugs={unavailableBookSlugs}
              revealSlug={
                bookFlights.find(flight => flight.destination === "shelf")?.slug
              }
              onOpenBook={openBook}
            />
          </Suspense>
        );
      case "music":
        return (
          <Suspense
            fallback={<p>{pt ? "Carregando discos…" : "Loading records…"}</p>}
          >
            <MusicArchive
              lang={lang}
              active={active === "music"}
              deck={musicDeck}
              dockRef={mediaSlotRef}
              onInsert={index => insertMedia("music", index)}
            />
          </Suspense>
        );
      case "anime":
        return (
          <Suspense
            fallback={<p>{pt ? "Carregando fitas…" : "Loading tapes…"}</p>}
          >
            <AnimeArchive
              lang={lang}
              active={active === "anime"}
              deck={animeDeck}
              dockRef={mediaSlotRef}
              onInsert={index => insertMedia("anime", index)}
            />
          </Suspense>
        );
      case "atlas":
        return (
          <>
            <div className="retro-globe">
              <GlobeCard places={atlas.places} lang={lang} />
            </div>
            <ul className="retro-list">
              {atlas.languages.map(l => (
                <li key={l.code}>
                  <div className="retro-language">
                    <strong>{l.name}</strong>
                    <span aria-label={`${l.level}/4`}>
                      {"■".repeat(l.level)}
                      {"□".repeat(4 - l.level)}
                    </span>
                  </div>
                  <span>{l.love.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </>
        );
    }
  };
  const pointerDown = (e: PointerEvent<HTMLDivElement>, w: WindowState) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      w.maximized ||
      e.button !== 0 ||
      window.matchMedia("(max-width: 640px)").matches
    )
      return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      id: w.id,
      x: e.clientX,
      y: e.clientY,
      initialX: e.currentTarget.parentElement?.offsetLeft ?? w.x,
      initialY: e.currentTarget.parentElement?.offsetTop ?? w.y,
    };
    focus(w.id);
  };
  return (
    <div
      className={`retro-station ${mediaKind ? "has-media-slot" : ""}`}
      onClick={interceptLink}
    >
      {mounted && createPortal(<CRTScreenEffects viewport />, document.body)}
      <div
        className="retro-screen"
        ref={screenRef}
        aria-label={
          pt ? "Explore pelo terminal" : "Explore through the terminal"
        }
      >
        <TerminalSky />
        <div className="retro-screen-toolbar">
          <nav
            className="retro-tabs"
            aria-label={pt ? "Abas abertas" : "Open tabs"}
          >
            <div
              className={`retro-tab retro-tab-home ${active === "terminal" ? "is-selected" : ""}`}
            >
              <button
                id="tab-terminal"
                className="retro-tab-main"
                aria-pressed={active === "terminal"}
                onClick={showTerminal}
              >
                <Icon id="terminal" small />
                <span className="retro-tab-label">{names.terminal}</span>
              </button>
            </div>
            {[...windows]
              .sort((a, b) => a.tabOrder - b.tabOrder)
              .map(w => (
                <div
                  key={w.id}
                  className={`retro-tab ${active === w.id ? "is-selected" : ""}`}
                >
                  <button
                    id={`tab-${w.id}`}
                    className="retro-tab-main"
                    aria-pressed={active === w.id}
                    title={windowName(w.id)}
                    onClick={() => open(w.id)}
                  >
                    {w.id.startsWith("post:") ? (
                      <FileText size={14} aria-hidden="true" />
                    ) : (
                      <Icon id={w.id} small />
                    )}
                    <span className="retro-tab-label">{windowName(w.id)}</span>
                  </button>
                  <button
                    className="retro-tab-close"
                    aria-label={`${pt ? "Fechar" : "Close"} ${windowName(w.id)}`}
                    title={pt ? "Fechar aba" : "Close tab"}
                    onClick={() => close(w.id)}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
          </nav>
          <div className="terminal-utilities">
            <nav
              className="terminal-preferences"
              aria-label={pt ? "Idioma e tema" : "Language and theme"}
            >
              <a
                href={languageHref("en")}
                aria-current={!pt ? "page" : undefined}
                lang="en"
              >
                en
              </a>
              <a
                href={languageHref("pt")}
                aria-current={pt ? "page" : undefined}
                lang="pt"
              >
                pt
              </a>
              <button
                id="theme-btn"
                title={pt ? "Alternar tema" : "Toggle theme"}
                aria-label="auto"
                suppressHydrationWarning
              >
                <Sun className="terminal-sun" size={16} />
                <Moon className="terminal-moon" size={16} />
              </button>
            </nav>
            <nav
              className="terminal-socials"
              aria-label={pt ? "Redes sociais" : "Social links"}
            >
              {socials.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  title={social.title}
                  aria-label={social.name}
                  {...(social.href.startsWith("https:")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </nav>
          </div>
          <span
            className="retro-version"
            title={pt ? "Versão + número de commits" : "Version + commit count"}
          >
            {version}
          </span>
        </div>
        <div className="retro-workspace">
          <div
            className="retro-terminal-view"
            data-covered={coveringWindowIndex >= 0}
            inert={coveringWindowIndex >= 0}
            aria-hidden={coveringWindowIndex >= 0}
            role="region"
            aria-label={names.terminal}
          >
            <DesktopTerminal
              lang={lang}
              open={open}
              theme={setSiteTheme}
              cat={showCat}
              visitPage={visit}
            />
          </div>
          {windowLayers.map(({ w, i }) => (
            <div
              id={`window-${w.id}`}
              key={w.id}
              role="region"
              aria-labelledby={`title-${w.id}`}
              tabIndex={-1}
              hidden={w.minimized}
              data-covered={i < coveringWindowIndex}
              data-app={
                w.id.startsWith("book:")
                  ? "book"
                  : w.id.startsWith("post:")
                    ? "post"
                    : w.id
              }
              inert={w.minimized || i < coveringWindowIndex}
              className={`retro-window ${active === w.id ? "is-active" : ""} ${w.maximized ? "is-maximized" : ""} ${w.width !== undefined ? "is-resized" : ""}`}
              style={{
                left: w.x,
                top: w.y,
                width: w.maximized ? undefined : w.width,
                height: w.maximized ? undefined : w.height,
                zIndex: i + 2,
              }}
              onPointerDown={e => {
                if (
                  !(e.target as HTMLElement).closest(".retro-window-controls")
                )
                  focus(w.id);
              }}
              onFocusCapture={e => {
                if (
                  active !== w.id &&
                  !(e.target as HTMLElement).closest(".retro-window-controls")
                )
                  focus(w.id);
              }}
              onKeyDown={e => {
                if (
                  e.key === "Escape" &&
                  !document.querySelector("[aria-modal=true]")
                ) {
                  e.stopPropagation();
                  close(w.id);
                }
              }}
            >
              <div
                className="retro-titlebar"
                onPointerDown={e => pointerDown(e, w)}
                onPointerMove={e => {
                  const d = drag.current;
                  if (!d || d.id !== w.id) return;
                  update(w.id, {
                    x: d.initialX + e.clientX - d.x,
                    y: Math.max(0, d.initialY + e.clientY - d.y),
                  });
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onLostPointerCapture={() => {
                  drag.current = null;
                }}
                onDoubleClick={e => {
                  if (!(e.target as HTMLElement).closest("button"))
                    toggleMaximize(w.id);
                }}
              >
                <Icon id={w.id} small />
                <code
                  id={`title-${w.id}`}
                  title={
                    w.id.startsWith("book:")
                      ? `/home/user/bookshelf/${w.id.slice(5)}`
                      : w.id.startsWith("post:")
                        ? w.id.slice(5)
                        : `/home/user/${w.id}`
                  }
                >
                  {w.id.startsWith("book:")
                    ? `/home/user/bookshelf/${w.id.slice(5)}`
                    : w.id.startsWith("post:")
                      ? w.id.slice(5)
                      : `/home/user/${w.id}`}
                </code>
                <div className="retro-window-controls">
                  <button
                    aria-label={`${pt ? "Minimizar" : "Minimize"} ${windowName(w.id)}`}
                    onClick={() => minimize(w.id)}
                  >
                    _
                  </button>
                  <button
                    aria-label={`${w.maximized ? (pt ? "Restaurar" : "Restore") : pt ? "Maximizar" : "Maximize"} ${windowName(w.id)}`}
                    onClick={() => toggleMaximize(w.id)}
                  >
                    {w.maximized ? "❐" : "□"}
                  </button>
                  <button
                    aria-label={`${pt ? "Fechar" : "Close"} ${windowName(w.id)}`}
                    onClick={() => close(w.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="retro-window-body">
                <div className="retro-window-content">
                  <PanelErrorBoundary lang={lang}>
                    {content(w.id)}
                  </PanelErrorBoundary>
                </div>
              </div>
              {!w.maximized &&
                RESIZE_DIRECTIONS.map(direction => (
                  <button
                    key={direction}
                    className={`retro-window-resize resize-${direction}`}
                    aria-label={`${pt ? "Redimensionar" : "Resize"} ${windowName(w.id)} (${direction})`}
                    onPointerDown={e => {
                      if (e.button !== 0) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const element = e.currentTarget.parentElement!;
                      resizeGesture.current = {
                        id: w.id,
                        direction,
                        pointerX: e.clientX,
                        pointerY: e.clientY,
                        bounds: {
                          x: element.offsetLeft,
                          y: element.offsetTop,
                          width: element.offsetWidth,
                          height: element.offsetHeight,
                        },
                      };
                      e.currentTarget.setPointerCapture(e.pointerId);
                      focus(w.id);
                    }}
                    onPointerMove={e => {
                      const gesture = resizeGesture.current;
                      if (
                        !gesture ||
                        gesture.id !== w.id ||
                        gesture.direction !== direction
                      )
                        return;
                      resizeWindow(
                        w.id,
                        direction,
                        gesture.bounds,
                        e.clientX - gesture.pointerX,
                        e.clientY - gesture.pointerY
                      );
                    }}
                    onPointerUp={() => {
                      resizeGesture.current = null;
                    }}
                    onPointerCancel={() => {
                      resizeGesture.current = null;
                    }}
                    onLostPointerCapture={() => {
                      resizeGesture.current = null;
                    }}
                    onKeyDown={e => {
                      if (
                        ![
                          "ArrowLeft",
                          "ArrowRight",
                          "ArrowUp",
                          "ArrowDown",
                        ].includes(e.key)
                      )
                        return;
                      e.preventDefault();
                      e.stopPropagation();
                      const element = e.currentTarget.parentElement!;
                      const step = e.shiftKey ? 40 : 10;
                      resizeWindow(
                        w.id,
                        direction,
                        {
                          x: element.offsetLeft,
                          y: element.offsetTop,
                          width: element.offsetWidth,
                          height: element.offsetHeight,
                        },
                        e.key === "ArrowRight"
                          ? step
                          : e.key === "ArrowLeft"
                            ? -step
                            : 0,
                        e.key === "ArrowDown"
                          ? step
                          : e.key === "ArrowUp"
                            ? -step
                            : 0
                      );
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
        {musicTrack !== null && (
          <Suspense fallback={null}>
            <MusicPlayer
              lang={lang}
              selected={musicTrack}
              onSelect={index => {
                musicDeck.choose(index);
                open("music");
              }}
              onClose={musicDeck.eject}
              onOpenLibrary={() => open("music")}
              pauseSignal={musicPauseSignal}
              onPlay={() => setAnimePauseSignal(value => value + 1)}
            />
          </Suspense>
        )}
        {bookFlights.map(flight => {
          const book = books.find(book => book.slug === flight.slug);
          return (
            book && (
              <FlyingBook
                key={flight.id}
                book={book}
                lang={lang}
                flight={flight}
                onRest={finishBookFlight}
              />
            )
          );
        })}
        {catVisible && (
          <img
            className="retro-secret-cat"
            src="/gifs/about/hero-cat.gif"
            alt={
              pt
                ? "Você encontrou o gato secreto!"
                : "You found the secret cat!"
            }
          />
        )}
      </div>
      {mediaKind && (
        <MediaDock
          kind={mediaKind}
          lang={lang}
          deck={deckFor(mediaKind)}
          dockRef={mediaSlotRef}
          onInsert={index => insertMedia(mediaKind, index)}
          onEject={mediaKind === "music" ? musicDeck.eject : ejectPlayback}
        />
      )}
      {(animeDeck.loaded !== null || gameDeck.loaded !== null) && (
        <Suspense fallback={null}>
          <MediaPlayback
            kind={animeDeck.loaded !== null ? "anime" : "games"}
            index={animeDeck.loaded ?? gameDeck.loaded ?? 0}
            lang={lang}
            onClose={ejectPlayback}
            onPlay={pauseMusic}
            pauseSignal={animePauseSignal}
          />
        </Suspense>
      )}
    </div>
  );
}
