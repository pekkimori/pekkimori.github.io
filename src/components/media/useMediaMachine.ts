import { useEffect, useRef, useState } from "react";

export type MachinePhase = "empty" | "ready" | "inserting" | "loaded";

/** Keep playback unmounted until the physical loading sequence completes. */
export function useMediaMachine() {
  const [selected, setSelected] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<number | null>(null);
  const [phase, setPhase] = useState<MachinePhase>("empty");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancel, []);

  const choose = (index: number) => {
    if (selected === index && phase !== "empty") return;
    cancel();
    setSelected(index);
    setLoaded(null);
    setPhase("ready");
  };
  const insert = (index = selected) => {
    if (index === null || (selected === index && phase === "loaded")) return;
    cancel();
    setSelected(index);
    setLoaded(null);
    setPhase("inserting");
    timer.current = setTimeout(
      () => {
        timer.current = null;
        setLoaded(index);
        setPhase("loaded");
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650
    );
  };
  const eject = () => {
    cancel();
    setLoaded(null);
    setSelected(null);
    setPhase("empty");
  };
  return { selected, loaded, phase, choose, insert, eject };
}

export type MediaMachineState = ReturnType<typeof useMediaMachine>;
