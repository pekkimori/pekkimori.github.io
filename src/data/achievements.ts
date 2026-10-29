import { EGGS } from "./easter-eggs";

export const ACHIEVEMENT_GROUPS = [
  { id: "sky", en: "The observatory", pt: "O observatório", mark: "01" },
  { id: "cat", en: "The resident", pt: "O morador", mark: "02" },
  { id: "machine", en: "The workshop", pt: "A oficina", mark: "03" },
  { id: "garden", en: "The garden", pt: "O jardim", mark: "04" },
  { id: "elsewhere", en: "Off the path", pt: "Fora da trilha", mark: "05" },
] as const;
export type AchievementGroup = (typeof ACHIEVEMENT_GROUPS)[number]["id"];
export type Achievement = {
  id: string;
  model: string;
  group: AchievementGroup;
  title: { en: string; pt: string };
  description: { en: string; pt: string };
};
const PORTUGUESE_NAMES = [
  "Lua",
  "Telescópio",
  "Órbita",
  "Cometa",
  "Nebulosa",
  "Pulsar",
  "Supernova",
  "Horizonte de eventos",
  "Ronrom",
  "Bigodes",
  "Erva de gato",
  "Papelão",
  "Novelo",
  "Raio de sol",
  "Nove vidas",
  "Cheshire",
  "Raiz",
  "Olá, mundo",
  "Pato de borracha",
  "Falha de segmentação",
  "Café",
  "Localhost",
  "42",
  "Xyzzy",
  "Semente",
  "Musgo",
  "Vaga-lume",
  "Micélio",
  "Ecos",
  "Aurora",
  "Serendipidade",
  "Lar, doce lar",
];
export const ACHIEVEMENTS: Achievement[] = [
  ...EGGS.map((egg, i) => ({
    id: egg.id,
    model: egg.answer,
    group: egg.trail,
    title: {
      en: egg.answer.charAt(0).toUpperCase() + egg.answer.slice(1),
      pt: PORTUGUESE_NAMES[i],
    },
    description: egg.reward,
  })),
  {
    id: "resident-cat",
    model: "cat",
    group: "elsewhere",
    title: { en: "An unexpected roommate", pt: "Um morador inesperado" },
    description: {
      en: "You said hello in the resident cat’s language.",
      pt: "Você deu olá no idioma do gato da casa.",
    },
  },
  {
    id: "bottled-stardust",
    model: "stardust",
    group: "elsewhere",
    title: { en: "A little bit of cosmos", pt: "Um pedacinho do cosmos" },
    description: {
      en: "You found a word that turns the lights down and the stars up.",
      pt: "Você encontrou uma palavra que apaga as luzes e acende as estrelas.",
    },
  },
  {
    id: "small-lunch",
    model: "sandwich",
    group: "elsewhere",
    title: { en: "With great power…", pt: "Com grandes poderes…" },
    description: {
      en: "…comes a very small lunch. Your request was granted.",
      pt: "…vem um almoço bem pequeno. Seu pedido foi atendido.",
    },
  },
  {
    id: "wandering-cat",
    model: "keycaps",
    group: "elsewhere",
    title: { en: "Three little keystrokes", pt: "Três pequenas tecladas" },
    description: {
      en: "A wandering cat answered your secret keyboard greeting.",
      pt: "Um gato viajante respondeu à sua saudação secreta no teclado.",
    },
  },
];
