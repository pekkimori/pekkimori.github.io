import { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
import { ANIME, ATLAS, FAVORITE_SONGS, PINNED_GAMES } from "@/data/about";
import { ANIME_PT, ATLAS_PT } from "@/data/about-pt";
import {
  DESKTOP_FOLDERS,
  PUBLIC_COMMANDS,
  SECRET_COMMANDS,
  WEBSITE_PAGES,
  websiteDestination,
  type AppId,
} from "@/data/about-commands";

type Props = {
  lang: "en" | "pt";
  open: (id: AppId) => void;
  theme: (value: string) => void;
  cat: () => void;
};
const HOME = "/home/user";
const STORAGE_KEY = "pekkimori-os-secrets-v1";
const COMMANDS = [
  "help",
  "ls",
  "dir",
  "cd",
  "pwd",
  "cat",
  "open",
  "go",
  "whoami",
  "date",
  "echo",
  "history",
  "clear",
  "cls",
  "theme",
  "secret",
];

export default function DesktopTerminal({ lang, open, theme, cat }: Props) {
  const pt = lang === "pt";
  const [lines, setLines] = useState<string[]>([]);
  const [welcome, setWelcome] = useState(true);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState(HOME);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [storageReady, setStorageReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const help = PUBLIC_COMMANDS.map(
    row => `${row[0]}\n  ${row[pt ? 2 : 1]}`
  ).join("\n");
  const intro = pt
    ? "rafael mori\npolímata · INTJ 145 · verdade · energia · amor\nconstruindo sistemas, explorando cérebros."
    : "rafael mori\npolymath · INTJ 145 · truth · energy · love\nbuilding systems, exploring brains.";
  const files: Record<string, string> = {
    [`${HOME}/about/intro.txt`]: intro,
    [`${HOME}/commands.txt`]: help,
    [`${HOME}/.hint`]: pt
      ? "Alguns arquivos ficam ocultos. Alguns comandos também.\nO gato tem algo a dizer: meow"
      : "Some files are hidden. Some commands are too.\nThe cat has something to say: meow",
    [`${HOME}/games/favorites.txt`]: PINNED_GAMES.map(
      g => `${g.title} — ${g.label}`
    ).join("\n"),
    [`${HOME}/bookshelf/readme.txt`]: pt
      ? "Histórias, filosofia e ideias.\nPara visitar a estante completa: go bookshelf"
      : "Stories, philosophy, and ideas.\nTo visit the full bookshelf: go bookshelf",
    [`${HOME}/music/favorites.txt`]: FAVORITE_SONGS.map(
      s => `${s.title} — ${s.artist}`
    ).join("\n"),
    [`${HOME}/anime/favorites.txt`]: (pt ? ANIME_PT : ANIME)
      .map(a => `${a.title}\n${[a.tagline].flat().join("\n")}`)
      .join("\n\n"),
    [`${HOME}/languages/languages.txt`]: (pt ? ATLAS_PT : ATLAS).languages
      .map(l => `${l.name}: ${l.love.join(" · ")}`)
      .join("\n"),
    [`${HOME}/atlas/places.txt`]: (pt ? ATLAS_PT : ATLAS).places
      .map(p => `${p.city} [${p.kind}]`)
      .join("\n"),
    ...Object.fromEntries(
      WEBSITE_PAGES.map(page => [
        `/site/${page}.url`,
        websiteDestination(page, lang)!,
      ])
    ),
  };
  const directories = [
    "/",
    "/home",
    HOME,
    "/site",
    ...DESKTOP_FOLDERS.map(f => `${HOME}/${f}`),
  ];
  const resolve = (raw: string) => {
    let path = raw.replace(/^~(?=\/|$)/, HOME);
    if (!path.startsWith("/")) path = `${cwd}/${path}`;
    const parts: string[] = [];
    path.split("/").forEach(p => {
      if (p === "..") parts.pop();
      else if (p && p !== ".") parts.push(p);
    });
    return `/${parts.join("/")}`;
  };
  const folderFor = (path: string): AppId | null => {
    if (!path.startsWith(`${HOME}/`)) return null;
    const folder = path.slice(HOME.length + 1).split("/")[0];
    return (DESKTOP_FOLDERS as readonly string[]).includes(folder)
      ? (folder as AppId)
      : null;
  };
  const visit = (destination: string) => {
    void navigate(destination).catch(() =>
      setLines(previous => [
        ...previous,
        pt
          ? "Não foi possível abrir essa página. Tente novamente."
          : "Could not open that page. Please try again.",
      ])
    );
  };
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "{}"
      );
      if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        setSecrets(
          Object.fromEntries(
            Object.entries(stored).filter(
              ([k, v]) =>
                /^[a-z][a-z0-9_-]{0,31}$/.test(k) &&
                typeof v === "string" &&
                v.length <= 2000
            )
          )
        );
      }
    } catch {
      /* Commands remain available for this visit if storage is blocked. */
    }
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (storageReady && window.matchMedia("(min-width: 641px)").matches)
      inputRef.current?.focus({ preventScroll: true });
  }, [storageReady]);
  useEffect(() => {
    if (lines.length)
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);
  const saveSecrets = (next: Record<string, string>) => {
    setSecrets(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return pt ? "Salvo neste navegador." : "Saved in this browser.";
    } catch {
      return pt
        ? "Disponível nesta sessão; armazenamento indisponível."
        : "Available this session; browser storage is unavailable.";
    }
  };
  const run = (value = input) => {
    const raw = value.trim();
    if (!raw) return;
    setInput("");
    setHistory(previous => [...previous, raw]);
    setHistoryIndex(history.length + 1);
    setDraft("");
    let output = "";
    const [command, ...args] = raw.split(/\s+/);
    const arg = args.join(" ").replace(/^(["'])(.*)\1$/, "$2");
    const secret = SECRET_COMMANDS.find(s => s.name === raw.toLowerCase());
    if (secret) {
      output = secret.output[lang];
      if (secret.effect === "cat") cat();
      if (secret.effect === "night") theme("dark");
    } else if (
      Object.hasOwn(secrets, raw.toLowerCase()) &&
      !COMMANDS.includes(command.toLowerCase())
    )
      output = secrets[raw.toLowerCase()];
    else
      switch (command.toLowerCase()) {
        case "help":
          output = help;
          break;
        case "whoami":
          output = intro;
          break;
        case "pwd":
          output = cwd;
          break;
        case "date":
          output = new Date().toLocaleString(pt ? "pt-BR" : "en-GB");
          break;
        case "echo":
          output = arg;
          break;
        case "history":
          output = [...history, raw].map((h, i) => `${i + 1}  ${h}`).join("\n");
          break;
        case "clear":
        case "cls":
          setLines([]);
          setWelcome(false);
          return;
        case "theme":
          if (["light", "dark"].includes(arg)) {
            theme(arg);
            output = `${pt ? "Tema" : "Theme"}: ${arg}`;
          } else output = "theme <light | dark>";
          break;
        case "ls":
        case "dir": {
          const path = resolve(args.filter(a => a !== "-a").join(" ") || ".");
          if (!directories.includes(path)) {
            output = `ls: ${arg}: ${pt ? "pasta não encontrada" : "directory not found"}`;
            break;
          }
          const parent = path === "/" ? "" : path;
          output = [
            ...directories
              .filter(
                p => p !== path && p.slice(0, p.lastIndexOf("/")) === parent
              )
              .map(p => `${p.split("/").pop()}/`),
            ...Object.keys(files)
              .filter(
                p =>
                  p.slice(0, p.lastIndexOf("/")) === path &&
                  (args.includes("-a") || !p.split("/").pop()?.startsWith("."))
              )
              .map(p => p.split("/").pop()),
          ].join("  ");
          if (path === HOME)
            output += pt
              ? "\n\nAbra uma pasta com open <nome>. Para o restante do site: ls /site"
              : "\n\nReveal a folder with open <name>. For the rest of the website: ls /site";
          break;
        }
        case "cd": {
          const path = resolve(arg || "~");
          if (directories.includes(path)) {
            setCwd(path);
          } else
            output = `cd: ${arg}: ${pt ? "pasta não encontrada" : "directory not found"}`;
          break;
        }
        case "cat": {
          const path = resolve(arg);
          if (Object.hasOwn(files, path)) {
            output = files[path];
          } else
            output = `cat: ${arg}: ${pt ? "arquivo não encontrado" : "file not found"}`;
          break;
        }
        case "go": {
          const destination =
            websiteDestination(arg, lang) ??
            (resolve(arg).startsWith("/site/")
              ? websiteDestination(resolve(arg), lang)
              : null);
          if (destination) {
            visit(destination);
            output = `→ ${destination}`;
          } else
            output =
              (pt ? "Páginas disponíveis: " : "Available pages: ") +
              WEBSITE_PAGES.join(", ") +
              "\n" +
              (pt
                ? "Exemplo: go posts ou go /pt/bookshelf"
                : "Try: go posts or go /en/bookshelf");
          break;
        }
        case "open": {
          const path = resolve(arg);
          const sitePath =
            path.startsWith("/site/") && Object.hasOwn(files, path)
              ? websiteDestination(path, lang)
              : null;
          const explicitPath =
            arg.startsWith("/") || arg.startsWith("website/")
              ? websiteDestination(arg, lang)
              : null;
          if (sitePath || explicitPath) {
            visit((sitePath ?? explicitPath)!);
            output = `→ ${sitePath ?? explicitPath}`;
            break;
          }
          if (path === `${HOME}/commands.txt` || arg === "commands")
            open("commands");
          else if (arg === "terminal") open("terminal");
          else if (
            (directories.includes(path) || Object.hasOwn(files, path)) &&
            folderFor(path)
          )
            open(folderFor(path)!);
          else
            output = `open: ${arg}: ${pt ? "item não encontrado. Experimente ls ou ls /site." : "item not found. Try ls or ls /site."}`;
          break;
        }
        case "secret": {
          const [action, name, ...message] = args;
          if (action === "list")
            output =
              Object.keys(secrets).join("\n") ||
              (pt ? "Nenhum segredo local ainda." : "No local secrets yet.");
          else if (
            action === "add" &&
            name &&
            /^[a-z][a-z0-9_-]{0,31}$/.test(name) &&
            message.length &&
            message.join(" ").length <= 2000
          ) {
            output = [
              ...COMMANDS,
              ...SECRET_COMMANDS.map(s => s.name),
            ].includes(name)
              ? pt
                ? "Esse nome já está em uso."
                : "That name is already in use."
              : saveSecrets({ ...secrets, [name]: message.join(" ") });
          } else if (
            action === "remove" &&
            name &&
            Object.hasOwn(secrets, name)
          ) {
            const next = { ...secrets };
            delete next[name];
            output = saveSecrets(next);
          } else
            output =
              "secret add <name> <message>\nsecret list\nsecret remove <name>\n" +
              (pt
                ? "Nome em minúsculas; mensagem com até 2000 caracteres."
                : "Use a lowercase name; message up to 2000 characters.");
          break;
        }
        default:
          output = `${command}: ${pt ? 'comando não encontrado. Digite "help".' : 'command not found. Type "help".'}`;
      }
    setLines(previous =>
      [
        ...previous,
        `user@pekkimori:${cwd.replace(HOME, "~")}$ ${raw}`,
        ...(output ? [output] : []),
      ].slice(-250)
    );
  };
  return (
    <div
      className="retro-terminal"
      onClick={event => {
        if (
          !(event.target as HTMLElement).closest("input, button, a") &&
          !window.getSelection()?.toString()
        )
          inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <div className="retro-terminal-scroll" ref={scrollRef} data-lenis-prevent>
        {welcome && (
          <div className="retro-terminal-welcome">
            <div className="retro-terminal-hero">
              <div>
                <h2>
                  pekkimori<span aria-hidden="true">_</span>
                </h2>
              </div>
            </div>
            <p className="retro-terminal-greeting">
              {pt
                ? "Bem-vindo ao meu pequeno canto da internet."
                : "Welcome to my little corner of the internet."}
            </p>
            <div className="retro-directory-heading">
              <span>
                ~/ {pt ? "EXPLORE O DIRETÓRIO" : "EXPLORE THE DIRECTORY"}
              </span>
              <span>{pt ? "CLIQUE OU DIGITE" : "CLICK OR TYPE"} ↵</span>
            </div>
            <nav
              className="retro-terminal-directory"
              aria-label={pt ? "Explorar pastas" : "Explore folders"}
            >
              {DESKTOP_FOLDERS.map((folder, i) => (
                <button key={folder} onClick={() => run(`open ~/${folder}`)}>
                  <span className="retro-directory-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{folder}/</span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
              <button onClick={() => run("help")}>
                <span className="retro-directory-index">?</span>
                <span>help</span>
                <span aria-hidden="true">↗</span>
              </button>
            </nav>
            <p className="retro-terminal-hint">
              {pt ? "Digite" : "Type"}{" "}
              <button onClick={() => run("ls")}>ls</button>{" "}
              {pt ? "para explorar," : "to look around,"}{" "}
              <button onClick={() => run("help")}>help</button>{" "}
              {pt
                ? "para se orientar. Há segredos por aqui."
                : "to find your way. There are secrets here, too."}
            </p>
          </div>
        )}
        <div className="retro-terminal-output" role="log" aria-live="polite">
          {lines.map((line, i) => (
            <pre
              key={i}
              className={
                line.startsWith("user@pekkimori:") ? "retro-command-echo" : ""
              }
            >
              {line || " "}
            </pre>
          ))}
        </div>
      </div>
      <form
        className="retro-prompt"
        onSubmit={event => {
          event.preventDefault();
          run();
        }}
      >
        <label htmlFor="retro-command">
          user@pekkimori:{cwd.replace(HOME, "~")}$
        </label>
        <input
          id="retro-command"
          ref={inputRef}
          value={input}
          disabled={!storageReady}
          maxLength={4000}
          onChange={event => setInput(event.target.value)}
          aria-label={pt ? "Comando do terminal" : "Terminal command"}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onKeyDown={event => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              if (historyIndex === history.length) setDraft(input);
              const next = Math.max(
                0,
                Math.min(
                  history.length,
                  historyIndex + (event.key === "ArrowUp" ? -1 : 1)
                )
              );
              setHistoryIndex(next);
              setInput(history[next] ?? draft);
            }
            if (event.key === "Tab" && !event.shiftKey && input) {
              const parts = input.split(" ");
              const last = parts.pop() ?? "";
              const directory = last.includes("/")
                ? last.slice(0, last.lastIndexOf("/") + 1)
                : "";
              const prefix = last.slice(directory.length);
              const at = resolve(directory || ".");
              const candidates =
                parts[0] === "go" && !directory
                  ? [...WEBSITE_PAGES]
                  : [
                      ...directories
                        .filter(
                          p => p !== at && p.slice(0, p.lastIndexOf("/")) === at
                        )
                        .map(p => p.split("/").pop()!),
                      ...Object.keys(files)
                        .filter(p => p.slice(0, p.lastIndexOf("/")) === at)
                        .map(p => p.split("/").pop()!),
                    ];
              const options = parts.length ? candidates : COMMANDS;
              const matches = [...new Set(options)].filter(option =>
                option.startsWith(prefix)
              );
              if (matches.length === 1) {
                event.preventDefault();
                setInput([...parts, `${directory}${matches[0]}`].join(" "));
              }
            }
            if (event.ctrlKey && event.key === "l") {
              event.preventDefault();
              setLines([]);
              setWelcome(false);
            }
            if (event.ctrlKey && event.key === "c") {
              event.preventDefault();
              setLines(previous => [...previous, `$ ${input}^C`]);
              setInput("");
            }
          }}
        />
      </form>
    </div>
  );
}
