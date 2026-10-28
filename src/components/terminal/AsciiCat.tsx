import { useEffect, useState } from "react";

const CATS = [
  "₍^. .^₎⟆",
  "/ᐠ - ˕ -マ",
  "(=◉ᆽ◉=)",
  "/ᐠ｡ꞈ｡ᐟ\\",
  "ฅ^•ﻌ•^ฅ",
  "(=^-ω-^=)",
];

export default function AsciiCat() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      if (!preference.matches)
        timer = setInterval(() => setIndex(i => (i + 1) % CATS.length), 3000);
    };
    update();
    preference.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", update);
    };
  }, []);
  return (
    <span className="retro-ascii-cat" role="img" aria-label="ASCII cat">
      <span aria-hidden="true">{CATS[index]}</span>
    </span>
  );
}
