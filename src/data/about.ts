export type Book = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};

export type PinnedGame = {
  title: string;
  label: string;
  completion?: number; // 0–100
};

export type Anime = {
  title: string;
  tagline: string;
};

export type NowEntry = {
  title: string;
  meta: string;
  progress?: { value: number; max: number };
};

export type MusicTasteRow = {
  label: string;
  value: string;
};

export type AtlasLanguage = {
  code: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4;
};

export type AtlasPlace = {
  code: string;
  city: string;
  note: string;
  kind: "lived" | "visited";
};

export type Identity = {
  oneLiner: string;
  values: string[];
  prose: string;
};

export const BOOKS: Book[] = [
  {
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    quote:
      "Your task as a student of human nature is to transform yourself into a calm and patient observer.",
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

export const PINNED_GAMES: PinnedGame[] = [
  { title: "Hollow Knight", label: "GOTY every year", completion: 98 },
  { title: "NieR: Automata", label: "existential crisis simulator", completion: 73 },
  { title: "League of Legends", label: "don't ask", completion: undefined },
];

export const ANIME: Anime[] = [
  { title: "Fullmetal Alchemist", tagline: "equivalent exchange, emotional devastation." },
  { title: "Steins;Gate", tagline: "el psy kongroo." },
  { title: "Bakemonogatari", tagline: "dialogue as architecture." },
];

export const NOW: {
  playing: NowEntry;
  reading: NowEntry;
  listening: NowEntry;
  watching: NowEntry;
} = {
  playing: { title: "Hollow Knight", meta: "true ending run", progress: { value: 84, max: 112 } },
  reading: { title: "The Laws of Human Nature", meta: "R. Greene", progress: { value: 142, max: 331 } },
  listening: { title: "liminal lo-fi", meta: "for long coding nights" },
  watching: { title: "Frieren: Beyond Journey's End", meta: "ep 14", progress: { value: 14, max: 28 } },
};

export const MUSIC_TASTE: MusicTasteRow[] = [
  { label: "2am", value: "Mitski, Sufjan Stevens, Phoebe Bridgers" },
  { label: "focus", value: "boards of canada, fishmans, Arca" },
  { label: "forever", value: "Radiohead, Björk, Nine Inch Nails" },
  { label: "guilty", value: "city pop, eurobeat, nightcore" },
];

export const ATLAS: {
  languages: AtlasLanguage[];
  places: AtlasPlace[];
} = {
  languages: [
    { code: "pt", name: "Portuguese", level: 4 },
    { code: "en", name: "English", level: 4 },
    { code: "es", name: "Spanish", level: 4 },
    { code: "ja", name: "Japanese", level: 2 },
    { code: "ru", name: "Russian", level: 1 },
    { code: "zh", name: "Chinese", level: 1 },
    { code: "de", name: "German", level: 1 },
  ],
  places: [
    { code: "br", city: "São Paulo", note: "home base", kind: "lived" },
    { code: "pa", city: "Panama City", note: "", kind: "visited" },
    { code: "us", city: "San Francisco", note: "", kind: "lived" },
    { code: "co", city: "Bogotá", note: "", kind: "visited" },
    { code: "qa", city: "Doha", note: "", kind: "visited" },
    { code: "jp", city: "Tokyo", note: "", kind: "lived" },
    { code: "au", city: "Melbourne", note: "", kind: "visited" },
    { code: "cl", city: "Santiago", note: "", kind: "visited" },
    { code: "ar", city: "Buenos Aires", note: "", kind: "lived" },
    { code: "de", city: "Berlin", note: "", kind: "lived" },
  ],
};

export const IDENTITY: Identity = {
  oneLiner: "Engineer, linguist, stubborn optimist.",
  values: ["truth", "energy", "love", "craft", "play"],
  prose:
    "I build things that feel like they were made by a person. I read too much, sleep too little, and believe the best software has a sense of humor about itself.",
};

export const STEAM_PROFILE_URL = "https://steamcommunity.com/id/pekkimori/";
export const MAL_URL = "https://myanimelist.net/animelist/PEKKIMORI_";
