import { ANIME, FAVORITE_SONGS } from "@/data/about";
import { ANIME_TAPES, RECORDS } from "@/data/media";

export type MediaKind = "anime" | "games" | "music";
export type PhysicalMedia = {
  index: number;
  title: string;
  subtitle: string;
  motif?: string;
  thumbnail?: string;
};
export const CARTRIDGES = [
  {
    id: "tetris",
    title: "Tetris",
    subtitle: "One more line",
    subtitlePt: "Só mais uma linha",
    motif: "blocks",
  },
  {
    id: "snake",
    title: "Snake",
    subtitle: "A little appetite",
    subtitlePt: "Um pouco de fome",
    motif: "snake",
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    subtitle: "Watch your step",
    subtitlePt: "Olhe onde pisa",
    motif: "mines",
  },
];
export function mediaCatalog(
  kind: MediaKind,
  lang: "en" | "pt"
): PhysicalMedia[] {
  const pt = lang === "pt";
  if (kind === "anime")
    return ANIME.map((item, index) => ({
      index,
      title: item.title,
      subtitle: pt ? ANIME_TAPES[index].scenePt : ANIME_TAPES[index].scene,
      thumbnail: `https://i.ytimg.com/vi/${ANIME_TAPES[index].videoId}/mqdefault.jpg`,
    }));
  if (kind === "games")
    return CARTRIDGES.map((item, index) => ({
      index,
      title: item.title,
      subtitle: pt ? item.subtitlePt : item.subtitle,
      motif: item.motif,
    }));
  return FAVORITE_SONGS.map((song, index) => ({
    index,
    title: song.title,
    subtitle: song.artist,
    thumbnail: `https://i.ytimg.com/vi/${RECORDS[index].videoId}/mqdefault.jpg`,
  }));
}
export function searchMedia(item: PhysicalMedia, query: string) {
  const normalize = (text: string) =>
    text
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const text = normalize(
    `${item.title} ${item.subtitle} ${RECORDS[item.index]?.album ?? ""}`
  );
  return normalize(query)
    .split(/\s+/)
    .every(term => text.includes(term));
}
