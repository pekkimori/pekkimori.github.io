import { ACHIEVEMENTS } from "@/data/achievements";
import { EGGS } from "@/data/easter-eggs";
import { parseRiddleProgress, RIDDLE_STORAGE_KEY } from "./riddles";

export const ACHIEVEMENT_STORAGE_KEY = "pekkimori-keepsakes-v1";
export const ACHIEVEMENT_EVENT = "pekkimori:achievement";
export type AchievementArrival = { id: string; foundAt: number };
export type UnlockedAchievements = Record<string, number>;
const known = new Set(ACHIEVEMENTS.map(item => item.id));
let sessionUnlocks: UnlockedAchievements = {};

export function readAchievements(): UnlockedAchievements {
  const unlocked = { ...sessionUnlocks };
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(ACHIEVEMENT_STORAGE_KEY) ?? "{}"
    );
    if (stored && typeof stored === "object" && !Array.isArray(stored))
      for (const [id, foundAt] of Object.entries(stored))
        if (
          known.has(id) &&
          typeof foundAt === "number" &&
          Number.isFinite(foundAt) &&
          foundAt > 0
        )
          unlocked[id] = foundAt;
  } catch {
    /* Discoveries remain available in memory when storage is blocked. */
  }
  try {
    // Bring existing puzzle progress onto the shelf without replaying old arrivals.
    const progress = parseRiddleProgress(
      JSON.parse(localStorage.getItem(RIDDLE_STORAGE_KEY) ?? "null")
    );
    for (const trail of Object.keys(progress) as (keyof typeof progress)[])
      EGGS.filter(egg => egg.trail === trail)
        .slice(0, progress[trail])
        .forEach(egg => {
          // 1 denotes a recovered discovery whose original date is unknown.
          unlocked[egg.id] ??= 1;
        });
  } catch {
    /* A malformed save should not hide other collected objects. */
  }
  return unlocked;
}

export function unlockAchievement(id: string): boolean {
  if (!known.has(id) || typeof window === "undefined") return false;
  const unlocked = readAchievements();
  if (Object.hasOwn(unlocked, id)) return false;
  const foundAt = Date.now();
  sessionUnlocks = { ...unlocked, [id]: foundAt };
  try {
    localStorage.setItem(
      ACHIEVEMENT_STORAGE_KEY,
      JSON.stringify(sessionUnlocks)
    );
  } catch {
    /* The shelf still works for this visit. */
  }
  window.dispatchEvent(
    new CustomEvent<AchievementArrival>(ACHIEVEMENT_EVENT, {
      detail: { id, foundAt },
    })
  );
  return true;
}
