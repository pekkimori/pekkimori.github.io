export type Book = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};

export type LanguageRow = {
  code: string;
  name: string;
  level: "fluent" | "intermediate" | "queued";
  greeting: string;
};

export type PinnedGame = {
  title: string;
  comment: string;
};

export type Anime = {
  title: string;
  tagline: string;
};

export type Joy = {
  label: string;
  gifPath: string;
  alt: string;
};

export const BOOKS: Book[] = [
  {
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    quote: "Your task as a student of human nature is to transform yourself into a calm and patient observer.",
    asciiCover: [
      " _________________ ",
      "|  _____________  |",
      "| |             | |",
      "| |  THE LAWS   | |",
      "| |     OF      | |",
      "| |    HUMAN    | |",
      "| |   NATURE    | |",
      "| |             | |",
      "| |  R. GREENE  | |",
      "| |_____________| |",
      "|_________________|",
    ].join("\n"),
  },
  {
    title: "The King in Yellow",
    author: "Robert W. Chambers",
    quote: "Strange is the night where black stars rise.",
    asciiCover: [
      " _________________ ",
      "|  _____________  |",
      "| |             | |",
      "| |   THE KING  | |",
      "| |     IN      | |",
      "| |   YELLOW    | |",
      "| |             | |",
      "| |             | |",
      "| |  CHAMBERS   | |",
      "| |_____________| |",
      "|_________________|",
    ].join("\n"),
  },
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    quote: "Don't Panic.",
    asciiCover: [
      " _________________ ",
      "|  _____________  |",
      "| |             | |",
      "| |   DON'T     | |",
      "| |   PANIC     | |",
      "| |             | |",
      "| |   HGTTG     | |",
      "| |             | |",
      "| |  D. ADAMS   | |",
      "| |_____________| |",
      "|_________________|",
    ].join("\n"),
  },
];

export const LANGUAGES: LanguageRow[] = [
  { code: "pt", name: "Portuguese", level: "fluent", greeting: "Olá" },
  { code: "en", name: "English", level: "fluent", greeting: "Hello" },
  { code: "es", name: "Spanish", level: "fluent", greeting: "Hola" },
  { code: "ja", name: "Japanese", level: "intermediate", greeting: "こんにちは" },
  { code: "ru", name: "Russian", level: "queued", greeting: "Привет" },
  { code: "zh", name: "Chinese", level: "queued", greeting: "你好" },
  { code: "de", name: "German", level: "queued", greeting: "Hallo" },
];

export const PINNED_GAMES: PinnedGame[] = [
  { title: "Hollow Knight", comment: "every corner of Hallownest deserves a moment of silence." },
  { title: "NieR: Automata", comment: "makes you feel things about androids and the end of the world." },
  { title: "League of Legends", comment: "I know, I know. It's the cats of video games." },
];

export const ANIME: Anime[] = [
  { title: "Fullmetal Alchemist", tagline: "equivalent exchange, emotional devastation." },
  { title: "Steins;Gate", tagline: "el psy kongroo." },
  { title: "Bakemonogatari", tagline: "dialogue as architecture." },
];

export const OBSESSIONS: string[] = [
  "philosophy",
  "neuroscience",
  "mathematics",
  "coding",
  "ascii art",
];

export const STAMPED_COUNTRIES: { code: string; name: string }[] = [
  { code: "br", name: "Brazil" },
  { code: "pa", name: "Panama" },
  { code: "us", name: "United States" },
  { code: "co", name: "Colombia" },
  { code: "qa", name: "Qatar" },
  { code: "jp", name: "Japan" },
  { code: "au", name: "Australia" },
  { code: "cl", name: "Chile" },
  { code: "ar", name: "Argentina" },
  { code: "de", name: "Germany" },
];

export const NEXT_UP_COUNTRY_COUNT = 4;

export const JOYS: Joy[] = [
  { label: "cats", gifPath: "/gifs/about/joys/cats.gif", alt: "A cat looping gently." },
  { label: "ice cream", gifPath: "/gifs/about/joys/ice-cream.gif", alt: "An animated ice cream." },
  { label: "cheese", gifPath: "/gifs/about/joys/cheese.gif", alt: "Cheese, animated." },
  { label: "coffee", gifPath: "/gifs/about/joys/coffee.gif", alt: "A steaming coffee cup." },
  { label: "beer", gifPath: "/gifs/about/joys/beer.gif", alt: "A foaming beer mug." },
  { label: "silly", gifPath: "/gifs/about/joys/silly.gif", alt: "Something goofy happening." },
];

export const IDENTITY = {
  mbti: "INTJ",
  tritype: "1-4-5",
  core: "truth / energy / love",
};

export const LEARNING: { name: string; percent: number }[] = [
  { name: "styling", percent: 60 },
  { name: "crochet", percent: 10 },
];

export const SPOTIFY_PLAYLIST_ID = "5X9BtccLFJs3ophR6tL5br";

export const STEAM_PROFILE_URL = "https://steamcommunity.com/id/pekkimori/";
