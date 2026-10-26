import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  ANIME,
  ATLAS,
  FAVORITE_ARTISTS,
  FAVORITE_SONGS,
  IDENTITY,
  MAL_URL,
  PINNED_GAMES,
  SPOTIFY_URL,
  STEAM_PROFILE_URL,
} from "@/data/about";
import { ANIME_PT, ATLAS_PT } from "@/data/about-pt";
import {
  DESKTOP_FOLDERS,
  PUBLIC_COMMANDS,
  type AppId,
} from "@/data/about-commands";
import GlobeCard from "./GlobeCard";
import DesktopTerminal from "./DesktopTerminal";
import "./retro-desktop.css";

type WindowState = {
  id: AppId;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
};
type Lang = "en" | "pt";
const DISCOVERY_KEY = "pekkimori-discoveries-v1";
const STARTING_APPS: AppId[] = ["terminal", "commands"];
const NAMES: Record<Lang, Record<AppId, string>> = {
  en: {
    about: "About me",
    games: "Games",
    bookshelf: "Bookshelf",
    music: "Music",
    anime: "Anime",
    languages: "Languages",
    atlas: "Atlas",
    commands: "commands.txt",
    terminal: "Terminal",
  },
  pt: {
    about: "Sobre mim",
    games: "Jogos",
    bookshelf: "Estante",
    music: "Música",
    anime: "Anime",
    languages: "Idiomas",
    atlas: "Atlas",
    commands: "commands.txt",
    terminal: "Terminal",
  },
};

function Icon({ id, small = false }: { id: AppId; small?: boolean }) {
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
      ) : id === "commands" ? (
        <>
          <path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h6" />
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

export default function RetroDesktop({ lang = "en" }: { lang?: Lang }) {
  const pt = lang === "pt";
  const names = NAMES[lang];
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "terminal", x: 128, y: 8, minimized: false, maximized: false },
  ]);
  const [discovered, setDiscovered] = useState<AppId[]>(STARTING_APPS);
  const [discoveryReady, setDiscoveryReady] = useState(false);
  const [wallpaper, setWallpaper] = useState("site");
  const [startOpen, setStartOpen] = useState(false);
  const [catVisible, setCatVisible] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const catTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{
    id: AppId;
    x: number;
    y: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const active = windows.filter(w => !w.minimized).at(-1)?.id;
  const showCat = () => {
    setCatVisible(true);
    if (catTimer.current) clearTimeout(catTimer.current);
    catTimer.current = setTimeout(() => setCatVisible(false), 6000);
  };
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        sessionStorage.getItem(DISCOVERY_KEY) ?? "[]"
      );
      if (Array.isArray(stored)) {
        const allowed: string[] = [...DESKTOP_FOLDERS, ...STARTING_APPS];
        setDiscovered([
          ...new Set([
            ...STARTING_APPS,
            ...stored.filter(
              (id): id is AppId =>
                typeof id === "string" && allowed.includes(id)
            ),
          ]),
        ]);
      }
    } catch {
      /* Discovery still works when browser storage is unavailable. */
    }
    setDiscoveryReady(true);
    return () => {
      if (catTimer.current) clearTimeout(catTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!discoveryReady) return;
    try {
      sessionStorage.setItem(DISCOVERY_KEY, JSON.stringify(discovered));
    } catch {
      /* Keep discoveries for this visit. */
    }
  }, [discovered, discoveryReady]);
  const discover = (id: AppId) =>
    setDiscovered(previous =>
      previous.includes(id) ? previous : [...previous, id]
    );
  const focus = (id: AppId) =>
    setWindows(previous => {
      const item = previous.find(w => w.id === id);
      return item ? [...previous.filter(w => w.id !== id), item] : previous;
    });
  const open = (id: AppId) => {
    discover(id);
    setStartOpen(false);
    setWindows(previous => {
      const item = previous.find(w => w.id === id);
      const n = previous.length;
      return [
        ...previous.filter(w => w.id !== id),
        item
          ? { ...item, minimized: false }
          : {
              id,
              x: Math.min(
                128 + n * 24,
                Math.max(8, (desktopRef.current?.clientWidth ?? 1000) - 590)
              ),
              y: 8 + (n % 4) * 24,
              minimized: false,
              maximized: false,
            },
      ];
    });
    requestAnimationFrame(() => {
      const target = document.getElementById(
        id === "terminal" ? "retro-command" : `window-${id}`
      );
      target?.focus({ preventScroll: true });
    });
  };
  const close = (id: AppId) => {
    setWindows(previous => previous.filter(w => w.id !== id));
    requestAnimationFrame(() =>
      document.getElementById(`desktop-${id}`)?.focus({ preventScroll: true })
    );
  };
  const update = (id: AppId, change: Partial<WindowState>) =>
    setWindows(previous =>
      previous.map(w => (w.id === id ? { ...w, ...change } : w))
    );
  const atlas = pt ? ATLAS_PT : ATLAS;
  const link = (href: string, text: string) => (
    <a
      className="retro-link"
      href={href}
      {...(href.startsWith("https:")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {text} ↗
    </a>
  );
  const content = (id: AppId): ReactNode => {
    switch (id) {
      case "about":
        return (
          <div className="retro-about">
            <div className="retro-welcome">
              <div>
                <span className="retro-eyebrow">/home/user</span>
                <h1>
                  Rafael Mori<span>aka. pekkimori</span>
                </h1>
                <p>
                  {pt
                    ? "construindo sistemas, explorando cérebros."
                    : "building systems, exploring brains."}
                </p>
              </div>
              <img
                src="/gifs/about/hero-cat.gif"
                alt={pt ? "Um gato contente" : "A contented cat"}
                width="120"
                height="120"
              />
            </div>
            <div className="retro-paper">
              <p className="retro-intro">
                {pt
                  ? "Polímata. Curioso por natureza. Humano em construção."
                  : "Polymath. Curious by nature. Human in progress."}
              </p>
              <p>
                {pt
                  ? "Engenheiro, linguista, otimista teimoso. Construo coisas com um toque humano. Leio demais, durmo de menos e acredito que o melhor software tem senso de humor."
                  : `${IDENTITY.oneLiner} ${IDENTITY.prose}`}
              </p>
              <div className="retro-values">
                {(pt
                  ? ["verdade", "energia", "amor", "ofício", "brincar"]
                  : IDENTITY.values
                ).map(v => (
                  <span key={v}>✦ {v}</span>
                ))}
              </div>
            </div>
            <p className="retro-tip">
              {pt
                ? "Abra as pastas para conhecer meu pequeno universo."
                : "Open the folders to explore my little corner of the universe."}
            </p>
            <div className="retro-actions">
              <button className="retro-button" onClick={() => open("commands")}>
                {pt ? "Leia-me primeiro" : "Read me first"}
              </button>
              <button className="retro-button" onClick={() => open("terminal")}>
                {pt ? "Abrir terminal" : "Launch terminal"}
              </button>
            </div>
          </div>
        );
      case "commands":
        return (
          <div className="retro-notepad">
            <p>
              {pt
                ? "Comece no terminal: ls mostra as pastas, cd entra nelas, cat lê arquivos e open abre janelas. Cada descoberta revela um ícone. Você pode arrastar, minimizar e reabrir as janelas descobertas."
                : "Start in the terminal: ls lists folders, cd enters them, cat reads files, and open opens windows. Each discovery reveals an icon. Discovered windows can be dragged, minimized, and reopened."}
            </p>
            <p>
              {pt
                ? "O terminal explora um pequeno sistema de arquivos virtual. Experimente:"
                : "The terminal explores a small virtual filesystem. Try:"}
            </p>
            <pre>
              ls{"\n"}cd music{"\n"}cat favorites.txt{"\n"}open ~/atlas{"\n"}ls
              /site{"\n"}go posts
            </pre>
            <hr />
            {PUBLIC_COMMANDS.map(row => (
              <div className="retro-command-row" key={row[0]}>
                <code>{row[0]}</code>
                <span>{row[pt ? 2 : 1]}</span>
              </div>
            ))}
            <hr />
            <p>
              {pt
                ? "Seus comandos secretos são salvos só neste navegador. Exemplo:"
                : "Your custom secret commands are saved only in this browser. Example:"}
            </p>
            <pre>
              secret add hello{" "}
              {pt ? "Bem-vindo ao meu universo" : "Welcome to my universe"}
              {"\n"}hello
            </pre>
            <p>
              {pt
                ? "Psst... arquivos ocultos às vezes dão boas pistas."
                : "Psst… hidden files sometimes leave good clues."}
            </p>
            <button className="retro-button" onClick={() => open("terminal")}>
              {pt ? "Abrir terminal" : "Launch terminal"}
            </button>
          </div>
        );
      case "terminal":
        return (
          <DesktopTerminal
            lang={lang}
            open={open}
            discover={discover}
            close={() => close("terminal")}
            theme={setWallpaper}
            cat={showCat}
          />
        );
      case "games":
        return (
          <>
            <h2>{pt ? "Jogos que ficam comigo" : "Games that stay with me"}</h2>
            {link(STEAM_PROFILE_URL, "pekkimori / Steam")}
            <img
              className="retro-game-gif"
              src="/gifs/about/transport_stag_example.gif"
              alt={
                pt
                  ? "O besouro de transporte de Hollow Knight"
                  : "The Stag from Hollow Knight"
              }
              loading="lazy"
            />
            <ul className="retro-list">
              {PINNED_GAMES.map(g => (
                <li key={g.title}>
                  <strong>{g.title}</strong>
                  <span>{g.label}</span>
                  {g.completion !== undefined && (
                    <label className="retro-progress">
                      {g.completion}%<progress value={g.completion} max="100" />
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </>
        );
      case "bookshelf":
        return (
          <div className="retro-books">
            <div aria-hidden="true" className="retro-book-spines">
              {["φ", "文学", "ψ", "∞", "A"].map((s, i) => (
                <span key={s} style={{ height: `${100 + (i % 3) * 20}px` }}>
                  {s}
                </span>
              ))}
            </div>
            <h2>{pt ? "Uma vida entre páginas" : "A life between pages"}</h2>
            <p>
              {pt
                ? "Filosofia, histórias e ideias que continuam comigo depois da última página."
                : "Philosophy, stories, and ideas that linger after the last page."}
            </p>
            {link(
              `/${lang}/bookshelf`,
              pt ? "Ver estante completa" : "Browse the full bookshelf"
            )}
          </div>
        );
      case "music":
        return (
          <>
            <h2>{pt ? "A trilha sonora" : "The soundtrack"}</h2>
            {link(SPOTIFY_URL, "pekkimori / Spotify")}
            <ol className="retro-tracklist">
              {FAVORITE_SONGS.map((s, i) => (
                <li key={s.title}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <small>{s.artist}</small>
                  </div>
                  <span aria-hidden="true">♫</span>
                </li>
              ))}
            </ol>
            <h3>{pt ? "Artistas favoritos" : "Favorite artists"}</h3>
            <p>{FAVORITE_ARTISTS.join(" · ")}</p>
          </>
        );
      case "anime":
        return (
          <>
            <h2>{pt ? "Histórias que ficam" : "Stories that stay"}</h2>
            {link(MAL_URL, "PEKKIMORI_ / MyAnimeList")}
            <ul className="retro-list">
              {(pt ? ANIME_PT : ANIME).map(a => (
                <li key={a.title}>
                  <strong>{a.title}</strong>
                  {[a.tagline].flat().map(q => (
                    <blockquote key={q}>{q}</blockquote>
                  ))}
                </li>
              ))}
            </ul>
          </>
        );
      case "languages":
        return (
          <>
            <h2>
              {pt
                ? "Mais de uma forma de dizer amor"
                : "More than one way to say love"}
            </h2>
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
      case "atlas":
        return (
          <>
            <h2>
              {pt ? "Um pequeno atlas pessoal" : "A small personal atlas"}
            </h2>
            <div className="retro-globe">
              <GlobeCard places={atlas.places} lang={lang} />
            </div>
            <ul className="retro-places">
              {atlas.places.map(p => (
                <li key={p.city}>
                  <strong>{p.city}</strong>
                  <span className={`retro-place-${p.kind}`}>
                    {pt
                      ? {
                          lived: "morei",
                          visited: "visitei",
                          future: "futuro",
                        }[p.kind]
                      : p.kind}
                  </span>
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
      className={`retro-desktop wallpaper-${wallpaper}`}
      ref={desktopRef}
      aria-label={pt ? "Explore pelo terminal" : "Explore through the terminal"}
    >
      <nav
        className="retro-desktop-icons"
        aria-label={pt ? "Aplicativos" : "Desktop applications"}
      >
        {discovered.map(id => (
          <button
            id={`desktop-${id}`}
            className="retro-shortcut"
            key={id}
            onClick={() => open(id)}
          >
            <Icon id={id} />
            <span>{names[id]}</span>
          </button>
        ))}
      </nav>
      {windows.map((w, i) => (
        <div
          id={`window-${w.id}`}
          key={w.id}
          role="region"
          aria-labelledby={`title-${w.id}`}
          tabIndex={-1}
          hidden={w.minimized}
          className={`retro-window ${active === w.id ? "is-active" : ""} ${w.maximized ? "is-maximized" : ""} ${w.id === "terminal" ? "is-terminal" : ""}`}
          style={{
            left: `clamp(8px, ${w.x}px, calc(100% - ${w.id === "terminal" ? 688 : 568}px))`,
            top: w.y,
            zIndex: i + 2,
          }}
          onPointerDown={() => focus(w.id)}
          onFocusCapture={() => {
            if (active !== w.id) focus(w.id);
          }}
          onKeyDown={e => {
            if (e.key === "Escape") {
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
              const width = desktopRef.current?.clientWidth ?? 1000;
              const height = desktopRef.current?.clientHeight ?? 700;
              const windowWidth =
                e.currentTarget.parentElement?.offsetWidth ?? 560;
              const windowHeight =
                e.currentTarget.parentElement?.offsetHeight ?? 520;
              update(w.id, {
                x: Math.max(
                  0,
                  Math.min(width - windowWidth, d.initialX + e.clientX - d.x)
                ),
                y: Math.max(
                  8,
                  Math.min(
                    height - windowHeight - 64,
                    d.initialY + e.clientY - d.y
                  )
                ),
              });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onDoubleClick={e => {
              if (!(e.target as HTMLElement).closest("button"))
                update(w.id, { maximized: !w.maximized });
            }}
          >
            <Icon id={w.id} small />
            <span id={`title-${w.id}`}>
              {names[w.id]}
              {w.id === "about" ? " — pekkimori" : ""}
            </span>
            <div className="retro-window-controls">
              <button
                aria-label={`${pt ? "Minimizar" : "Minimize"} ${names[w.id]}`}
                onClick={() => {
                  update(w.id, { minimized: true });
                  document.getElementById(`task-${w.id}`)?.focus();
                }}
              >
                _
              </button>
              <button
                aria-label={`${w.maximized ? (pt ? "Restaurar" : "Restore") : pt ? "Maximizar" : "Maximize"} ${names[w.id]}`}
                onClick={() => update(w.id, { maximized: !w.maximized })}
              >
                {w.maximized ? "❐" : "□"}
              </button>
              <button
                aria-label={`${pt ? "Fechar" : "Close"} ${names[w.id]}`}
                onClick={() => close(w.id)}
              >
                ×
              </button>
            </div>
          </div>
          {w.id !== "terminal" && w.id !== "commands" && (
            <div className="retro-address">
              <code>/home/user/{w.id}</code>
            </div>
          )}
          <div
            className={`retro-window-body ${w.id === "terminal" ? "terminal-body" : ""}`}
            data-lenis-prevent
          >
            {content(w.id)}
          </div>
        </div>
      ))}
      {catVisible && (
        <img
          className="retro-secret-cat"
          src="/gifs/about/konami-cat.gif"
          alt={
            pt ? "Você encontrou o gato secreto!" : "You found the secret cat!"
          }
        />
      )}
      {startOpen && (
        <>
          <button
            className="retro-menu-dismiss"
            aria-label={pt ? "Fechar menu" : "Close menu"}
            onClick={() => setStartOpen(false)}
          />
          <nav
            className="retro-start-menu"
            aria-label={pt ? "Menu iniciar" : "Start menu"}
          >
            <div>
              {discovered.map(id => (
                <button key={id} onClick={() => open(id)}>
                  <Icon id={id} small />
                  {names[id]}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
      <div className="retro-taskbar">
        <button
          className="retro-button retro-start"
          aria-label={
            pt ? "Aplicativos descobertos" : "Discovered applications"
          }
          aria-expanded={startOpen}
          onClick={() => setStartOpen(!startOpen)}
          onKeyDown={e => {
            if (e.key === "Escape") setStartOpen(false);
          }}
        >
          <span aria-hidden="true">⊞</span>
        </button>
        <div className="retro-tasks">
          {windows.map(w => (
            <button
              id={`task-${w.id}`}
              key={w.id}
              className={`retro-button ${active === w.id ? "is-selected" : ""}`}
              aria-pressed={active === w.id}
              onClick={() => {
                if (active === w.id) update(w.id, { minimized: true });
                else open(w.id);
              }}
            >
              <Icon id={w.id} small />
              <span>{names[w.id]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
