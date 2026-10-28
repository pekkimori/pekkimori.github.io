import { useRef, useState } from "react";
import { ArrowUpFromLine as Eject, Gamepad2 } from "lucide-react";
import { PINNED_GAMES, STEAM_PROFILE_URL } from "@/data/about";
import { MediaHeader, MediaObject, ShelfLabel, type Lang } from "./MediaShelf";
import { Minesweeper, Snake, Tetris } from "./ArcadeGames";
const CARTRIDGES = [
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
export default function GameArchive({
  lang,
  active,
}: {
  lang: Lang;
  active: boolean;
}) {
  const pt = lang === "pt";
  const [selected, setSelected] = useState<number | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const cartridge = selected === null ? null : CARTRIDGES[selected];
  return (
    <div className="media-archive game-archive">
      <MediaHeader
        path="games"
        title={pt ? "Só mais uma partida." : "Just one more game."}
        description={
          pt
            ? "Três cartuchos, nenhum save obrigatório. Escolha um e fique à vontade."
            : "Three cartridges, no save file required. Pick one and make yourself at home."
        }
        count={3}
        unit={pt ? "cartuchos" : "cartridges"}
        href={STEAM_PROFILE_URL}
        profile="Steam"
      />
      <ShelfLabel count={3}>
        {pt ? "01 / Escolha seu cartucho" : "01 / Pick your cartridge"}
      </ShelfLabel>
      <div className="media-shelf cartridge-shelf">
        {CARTRIDGES.map((c, i) => (
          <MediaObject
            key={c.id}
            kind="cartridge"
            title={c.title}
            subtitle={pt ? c.subtitlePt : c.subtitle}
            index={i}
            motif={c.motif}
            selected={selected === i}
            onClick={() => {
              setSelected(i);
              requestAnimationFrame(() =>
                deckRef.current?.scrollIntoView({
                  block: "start",
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches
                    ? "instant"
                    : "smooth",
                })
              );
            }}
          />
        ))}
      </div>
      <div className="media-deck console-deck" ref={deckRef}>
        <div className="deck-topline">
          <span>
            <i className={`status-light ${cartridge ? "is-on" : ""}`} />
            PEKKI / POCKET
          </span>
          <span>{cartridge?.title ?? "INSERT CARTRIDGE"}</span>
        </div>
        {cartridge ? (
          <div key={cartridge.id} className="console-loaded">
            {cartridge.id === "tetris" ? (
              <Tetris lang={lang} active={active} />
            ) : cartridge.id === "snake" ? (
              <Snake lang={lang} active={active} />
            ) : (
              <Minesweeper lang={lang} active={active} />
            )}
          </div>
        ) : (
          <div className="console-idle deck-idle">
            <Gamepad2 size={42} strokeWidth={1} aria-hidden="true" />
            <strong>{pt ? "Insira um cartucho" : "Insert a cartridge"}</strong>
            <p>
              {pt
                ? "As melhores tardes começam assim."
                : "The best afternoons start like this."}
            </p>
            <span className="console-slot" />
          </div>
        )}
        {cartridge && (
          <div className="deck-bottomline">
            <span>
              {pt ? "PAUSA AUTOMÁTICA AO SAIR" : "AUTO-PAUSES WHILE AWAY"}
            </span>
            <button className="media-button" onClick={() => setSelected(null)}>
              <Eject size={12} />
              {pt ? "Ejetar" : "Eject"}
            </button>
          </div>
        )}
      </div>
      <section className="game-favorites">
        <ShelfLabel count={PINNED_GAMES.length}>
          {pt ? "02 / Jogos que ficam comigo" : "02 / Games that stay with me"}
        </ShelfLabel>
        {PINNED_GAMES.map((game, i) => (
          <div className="game-favorite" key={game.title}>
            <span className="media-eyebrow">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <strong>{game.title}</strong>
              <small>{game.label}</small>
            </div>
            {game.completion !== undefined && (
              <label>
                <span>{game.completion}%</span>
                <progress
                  aria-label={`${game.title} ${pt ? "concluído" : "completion"}`}
                  value={game.completion}
                  max={100}
                />
              </label>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
