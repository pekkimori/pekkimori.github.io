// Hidden from help and commands.txt. Add a command here to publish an Easter egg.
// These are playful discoveries, not passwords: browser source is public.
export type SecretCommand = {
  name: string;
  output: { en: string; pt: string };
  effect?: "cat" | "night";
};

export const SECRET_COMMANDS: SecretCommand[] = [
  {
    name: "meow",
    output: {
      en: " /\\_/\\\n( o.o )  You found the resident cat.\n > ^ <",
      pt: " /\\_/\\\n( o.o )  Você encontrou o gato residente.\n > ^ <",
    },
    effect: "cat",
  },
  {
    name: "stardust",
    output: {
      en: "We are a way for the cosmos to know itself.\nNight mode unlocked.",
      pt: "Somos uma maneira de o cosmos conhecer a si mesmo.\nModo noturno desbloqueado.",
    },
    effect: "night",
  },
  {
    name: "sudo make me a sandwich",
    output: {
      en: "Okay. 🥪\nWith great power comes a very small lunch.",
      pt: "Claro. 🥪\nCom grandes poderes vem um pequeno almoço.",
    },
  },
];

export const DESKTOP_FOLDERS = [
  "about",
  "games",
  "bookshelf",
  "music",
  "anime",
  "languages",
  "atlas",
] as const;
export type FolderId = (typeof DESKTOP_FOLDERS)[number];
export type AppId = FolderId | "commands" | "terminal";

export const PUBLIC_COMMANDS = [
  ["help", "Show this command guide", "Mostrar este guia"],
  [
    "ls [ -a | folder ]",
    "List files; -a also shows hidden files",
    "Listar arquivos; -a inclui ocultos",
  ],
  ["cd <folder> / cd ..", "Move between folders", "Navegar entre pastas"],
  ["pwd", "Print the current directory", "Mostrar a pasta atual"],
  ["cat <file>", "Read a text file", "Ler um arquivo de texto"],
  [
    "open <folder | file>",
    "Reveal a folder and open its window",
    "Revelar uma pasta e abrir sua janela",
  ],
  [
    "go <page | /path>",
    "Visit a page: home, posts, bookshelf, portfolio, tags, search, about",
    "Visitar uma página: home, posts, bookshelf, portfolio, tags, search, about",
  ],
  [
    "ls /site",
    "Find shortcuts to the rest of the website",
    "Encontrar atalhos para o restante do site",
  ],
  ["whoami", "A small introduction", "Uma pequena apresentação"],
  ["date", "Print the current date", "Mostrar a data atual"],
  ["echo <text>", "Print something", "Escrever algo"],
  ["history", "Show this session’s commands", "Ver comandos desta sessão"],
  ["clear / cls", "Clear the terminal", "Limpar o terminal"],
  [
    "theme <site | night | teal>",
    "Change the workspace tint",
    "Trocar o tom da área de trabalho",
  ],
  [
    "secret add <name> <message>",
    "Create a secret on this browser",
    "Criar um segredo neste navegador",
  ],
  [
    "secret list / secret remove <name>",
    "Manage your browser’s secrets",
    "Gerenciar os segredos deste navegador",
  ],
  ["exit", "Close the terminal", "Fechar o terminal"],
] as const;

export const WEBSITE_PAGES = [
  "home",
  "posts",
  "bookshelf",
  "portfolio",
  "tags",
  "search",
  "about",
] as const;

// Keep terminal navigation inside the site's supported language trees.
export function websiteDestination(
  raw: string,
  lang: "en" | "pt"
): string | null {
  let target = raw.trim();
  if (target !== "/") target = target.replace(/\/$/, "");
  if (
    !target ||
    target.includes(":") ||
    target.includes("\\") ||
    target.startsWith("//")
  )
    return null;
  target = target.replace(/^(?:website\/|\/site\/)/, "").replace(/\.url$/, "");
  const aliases: Record<string, string> = {
    "/": "home",
    blog: "posts",
    projects: "portfolio",
    index: "home",
  };
  target = aliases[target] ?? target;
  if (!target.startsWith("/")) {
    if (!(WEBSITE_PAGES as readonly string[]).includes(target)) return null;
    return target === "home" ? `/${lang}/` : `/${lang}/${target}`;
  }
  if (target === "/en" || target === "/pt") return `${target}/`;
  if (
    /^\/(?:en|pt)\/(?:posts|tags|about|bookshelf|portfolio|search)(?:[?][^#\s]*)?$/.test(
      target
    ) ||
    /^\/(?:en|pt)\/(?:posts|tags)\/[a-z0-9/_-]+(?:[?][^#\s]*)?$/.test(target)
  )
    return target;
  if (
    /^\/(?:posts|tags|about|bookshelf|portfolio|search)(?:[?][^#\s]*)?$/.test(
      target
    )
  )
    return `/${lang}${target}`;
  return null;
}
