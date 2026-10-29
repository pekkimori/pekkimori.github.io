import { EGGS } from "@/data/easter-eggs";

export const RIDDLE_STORAGE_KEY = "pekkimori-os-riddles-v2";

// Each trail occupies one ordinary-looking hidden note. Its contents change
// after a solution, so listing or completing paths never exposes later puzzles.
export const RIDDLE_TRAILS = [
  { id: "sky", path: "atlas/.signal" },
  { id: "cat", path: "about/.scrap" },
  { id: "machine", path: "portfolio/.trace" },
  { id: "garden", path: "bookshelf/.leaf" },
] as const;
export type TrailId = (typeof RIDDLE_TRAILS)[number]["id"];
export type RiddleProgress = Record<TrailId, number>;

export function currentRiddle(trail: TrailId, progress: RiddleProgress) {
  return EGGS.filter(egg => egg.trail === trail)[progress[trail]];
}

export function parseRiddleProgress(value: unknown): RiddleProgress {
  const stored =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    RIDDLE_TRAILS.map(({ id }) => {
      const step = stored[id];
      const length = EGGS.filter(egg => egg.trail === id).length;
      return [
        id,
        typeof step === "number" && Number.isInteger(step) && step >= 0
          ? Math.min(step, length)
          : 0,
      ];
    })
  ) as RiddleProgress;
}

export function normalizeAnswer(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function riddleNote(
  trail: TrailId,
  progress: RiddleProgress,
  lang: "en" | "pt"
) {
  const egg = currentRiddle(trail, progress);
  if (!egg)
    return lang === "pt"
      ? "Todas as oito notas foram recuperadas. Esta trilha está completa.\nOutras pastas ainda podem guardar notas nas margens."
      : "All eight notes have been recovered. This trail is complete.\nOther folders may still keep notes in their margins.";
  return [
    `${lang === "pt" ? "NOTA" : "NOTE"} ${progress[trail] + 1} / 8`,
    egg.riddle[lang],
    lang === "pt"
      ? "Responda em inglês: answer <resposta>\nPara uma pista extra: hint\nA próxima nota aparece aqui depois de uma resposta correta."
      : "Reply in English: answer <answer>\nFor an optional hint: hint\nThe next note appears here after a correct answer.",
  ].join("\n\n");
}
