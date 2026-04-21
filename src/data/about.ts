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
  tagline: string | string[];
};

export type NowEntry = {
  title: string;
  meta: string;
  progress?: { value: number; max: number };
  unknownProgress?: boolean;
};

export type MusicTasteRow = {
  label: string;
  value: string;
};

export type FavoriteSong = {
  title: string;
  artist: string;
};

export type AtlasLanguage = {
  code: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4;
  love: string[];
};

export type AtlasPlace = {
  code: string;
  city: string;
  note: string;
  kind: "lived" | "visited";
  lng: number;
  lat: number;
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
      "Not to become someone else, but to be more thoroughly yourself.",
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

export const PINNED_GAMES: PinnedGame[] = [
  { title: "Hollow Knight", label: "GOTY every year", completion: 98 },
  { title: "NieR: Automata", label: "existential crisis simulator", completion: 73 },
  { title: "League of Legends", label: "don't ask", completion: undefined },
];

export const ANIME: Anime[] = [
  { title: "Fullmetal Alchemist", tagline: ["A lesson without pain is meaningless. For you cannot gain anything without sacrificing something else in return, but once you have overcome it and made it your own...you will gain an irreplaceable fullmetal heart.", "It's a cruel and random world, but the chaos is all so beautiful."] },
  { title: "Steins;Gate", tagline: ["No-one knows what the future holds. That's why its potential is infinite.", "Time is passing so quickly. Right now, I feel like complaining to Einstein. Whether time is slow or fast depends on perception. Relativity theory is so romantic. And so sad."] },
  { title: "Monogatari Series", tagline: [
    "I don't know everything, I just know what I know.",
    "People have to save themselves. One person saving another is impossible.",
    "No character looks the same from all angles.",
    "The fake is of far greater value. In its deliberate attempt to be real, it's more real than the real thing.",
  ] },
];

export const NOW: {
  playing: NowEntry;
  reading: NowEntry;
  listening: NowEntry;
  watching: NowEntry;
} = {
  playing: { title: "osu!", meta: "global #93756 · send help", unknownProgress: true },
  reading: { title: "Thus Spoke Zarathustra", meta: "Nietzsche · pt. III", progress: { value: 3, max: 4 } },
  listening: { title: "rock n roll", meta: "volume: 11/10", progress: { value: 11, max: 10 } },
  watching: { title: "Frieren: Beyond Journey's End", meta: "ep 14", progress: { value: 14, max: 28 } },
};

export const MUSIC_TASTE: MusicTasteRow[] = [
  { label: "2am", value: "Mitski, Sufjan Stevens, Phoebe Bridgers" },
  { label: "focus", value: "boards of canada, fishmans, Arca" },
  { label: "forever", value: "Radiohead, Björk, Nine Inch Nails" },
  { label: "guilty", value: "city pop, eurobeat, nightcore" },
];

export const FAVORITE_SONGS: FavoriteSong[] = [
  { title: "Aos Olhos de uma Criança", artist: "Emicida" },
  { title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { title: "Dried Flowers", artist: "Ado" },
  { title: "Sirens", artist: "Pearl Jam" },
  { title: "Jane Doe", artist: "Kenshi Yonezu" },
  { title: "The Pretender", artist: "Foo Fighters" },
  { title: "Everything Goes On", artist: "Porter Robinson" },
  { title: "Weight of the World", artist: "NieR: Automata OST" },
  { title: "I Guess It's Not Too Late", artist: "Noa Mal" },
  { title: "Conselho", artist: "Samba Raiz" },
];

export const ATLAS: {
  languages: AtlasLanguage[];
  places: AtlasPlace[];
} = {
  languages: [
    { code: "pt", name: "Portuguese", level: 4, love: ["amor", "saudade", "carinho", "paixão"] },
    { code: "en", name: "English", level: 4, love: ["love", "longing", "fondness", "devotion"] },
    { code: "es", name: "Spanish", level: 4, love: ["amor", "cariño", "querer", "ternura"] },
    { code: "ja", name: "Japanese", level: 2, love: ["愛 (ai)", "恋 (koi)", "好き (suki)", "慕情 (bojō)"] },
    { code: "ru", name: "Russian", level: 1, love: ["любовь", "нежность", "страсть", "тоска"] },
    { code: "zh", name: "Chinese", level: 1, love: ["爱 (ài)", "情 (qíng)", "思念 (sīniàn)"] },
    { code: "de", name: "German", level: 1, love: ["Liebe", "Sehnsucht", "Zuneigung", "Innigkeit"] },
  ],
  places: [
    { code: "br", city: "São Paulo", note: "home base", kind: "lived", lng: -46.63, lat: -23.55 },
    { code: "pa", city: "Panama City", note: "", kind: "visited", lng: -79.52, lat: 8.99 },
    { code: "us", city: "San Francisco", note: "", kind: "lived", lng: -122.42, lat: 37.77 },
    { code: "co", city: "Bogotá", note: "", kind: "visited", lng: -74.07, lat: 4.71 },
    { code: "qa", city: "Doha", note: "", kind: "visited", lng: 51.53, lat: 25.29 },
    { code: "jp", city: "Tokyo", note: "", kind: "lived", lng: 139.65, lat: 35.68 },
    { code: "au", city: "Melbourne", note: "", kind: "visited", lng: 144.96, lat: -37.81 },
    { code: "cl", city: "Santiago", note: "", kind: "visited", lng: -70.67, lat: -33.45 },
    { code: "ar", city: "Buenos Aires", note: "", kind: "lived", lng: -58.38, lat: -34.60 },
    { code: "de", city: "Berlin", note: "", kind: "lived", lng: 13.41, lat: 52.52 },
  ],
};

export const IDENTITY: Identity = {
  oneLiner: "Engineer, linguist, stubborn optimist.",
  values: ["truth", "energy", "love", "craft", "play"],
  prose:
    "I build things that feel like they were made by a person. I read too much, sleep too little, and believe the best software has a sense of humor about itself.",
};

export const FAVORITE_ARTISTS: string[] = [
  "AC/DC", "Ado", "Aimer", "Aimyon", "ANAVITÓRIA", "Arctic Monkeys",
  "beabadoobee", "Billie Eilish", "Bon Jovi", "Bruno Mars",
  "Clairo", "Creed",
  "Emicida", "Eminem", "Elvis Presley", "Eve",
  "Foo Fighters", "Frank Sinatra", "Fuji Kaze",
  "Gorillaz", "Green Day",
  "Kenshi Yonezu", "King Gnu",
  "Legião Urbana", "Linkin Park",
  "Mamonas Assassinas", "Men I Trust", "Mitski", "My Chemical Romance",
  "Nando Reis",
  "Paramore", "Pearl Jam", "Pentakill", "Pitty",
  "Queen",
  "Roberta Campos",
  "Saucy Dog", "Skank",
  "Titãs", "Twenty One Pilots",
  "Vaundy",
  "YUI",
];

export const STEAM_PROFILE_URL = "https://steamcommunity.com/id/pekkimori/";
export const MAL_URL = "https://myanimelist.net/animelist/PEKKIMORI_";
export const SPOTIFY_URL = "https://open.spotify.com/user/ihf9rp07w73vzy9efl6mrk04p";
export const GOODREADS_URL = "https://www.goodreads.com/review/list/181219238";
