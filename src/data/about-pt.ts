import { ATLAS, type Anime } from "./about";

export const ANIME_PT: Anime[] = [
  {
    title: "Fullmetal Alchemist",
    tagline: [
      "Uma lição sem dor não tem sentido. Não se pode ganhar nada sem sacrificar algo em troca, mas, quando você superar isso e fizer dessa lição parte de si... ganhará um coração de aço insubstituível.",
      "É um mundo cruel e aleatório, mas o caos é tão belo.",
    ],
  },
  {
    title: "Steins;Gate",
    tagline: [
      "Ninguém sabe o que o futuro reserva. É por isso que seu potencial é infinito.",
      "O tempo está passando tão rápido. Neste momento, tenho vontade de reclamar com Einstein. Se o tempo passa devagar ou depressa depende da percepção. A teoria da relatividade é tão romântica. E tão triste.",
    ],
  },
  {
    title: "Monogatari Series",
    tagline: [
      "Eu não sei tudo, só sei o que sei.",
      "As pessoas precisam salvar a si mesmas. Uma pessoa salvar outra é impossível.",
      "Nenhum personagem parece o mesmo de todos os ângulos.",
      "A imitação tem muito mais valor. Na tentativa deliberada de ser real, ela é mais real do que o original.",
    ],
  },
];

const languageNames: Record<string, string> = {
  pt: "Português",
  en: "Inglês",
  es: "Espanhol",
  ja: "Japonês",
  ru: "Russo",
  zh: "Chinês",
  de: "Alemão",
};

const cityNames: Record<string, string> = {
  "Panama City": "Cidade do Panamá",
  "San Francisco": "São Francisco",
  Tokyo: "Tóquio",
  "Buenos Aires": "Buenos Aires",
  Berlin: "Berlim",
};

export const ATLAS_PT = {
  languages: ATLAS.languages.map(language => ({
    ...language,
    name: languageNames[language.code] ?? language.name,
  })),
  places: ATLAS.places.map(place => ({
    ...place,
    city: cityNames[place.city] ?? place.city,
    note: place.note === "home base" ? "minha base" : place.note,
  })),
};
