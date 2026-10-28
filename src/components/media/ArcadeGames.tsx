import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Flag,
  Pause,
  Play,
  RotateCw,
} from "lucide-react";
import {
  blankMines,
  collides,
  emptyBoard,
  lockPiece,
  newPiece,
  plantMines,
  revealMines,
  rotatePiece,
  snakeFood,
  type Point,
} from "./game-engine";
import type { Lang } from "./MediaShelf";

type Phase = "ready" | "running" | "paused" | "over" | "won";
function useAutoPause(active: boolean, pause: () => void) {
  const callback = useRef(pause);
  callback.current = pause;
  useEffect(() => {
    if (!active) callback.current();
  }, [active]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) callback.current();
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);
}
function useBest(id: string, score: number) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    try {
      const value = Number(localStorage.getItem(`pekki-arcade-${id}`));
      if (Number.isFinite(value)) setBest(value);
    } catch {
      /* Session scores still work. */
    }
  }, [id]);
  useEffect(() => {
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem(`pekki-arcade-${id}`, String(score));
      } catch {
        /* Storage is optional. */
      }
    }
  }, [score, best, id]);
  return best;
}
function Overlay({
  phase,
  lang,
  start,
}: {
  phase: Phase;
  lang: Lang;
  start: () => void;
}) {
  if (phase === "running") return null;
  const labels =
    lang === "pt"
      ? {
          ready: "Pronto para jogar?",
          paused: "Pausado",
          over: "Fim de jogo",
          won: "Você ganhou!",
        }
      : {
          ready: "Ready, player one?",
          paused: "Paused",
          over: "Game over",
          won: "You win!",
        };
  return (
    <div className="game-overlay">
      <strong>{labels[phase]}</strong>
      <button className="media-button" onClick={start}>
        <Play size={13} />
        {phase === "paused"
          ? lang === "pt"
            ? "Continuar"
            : "Resume"
          : lang === "pt"
            ? "Jogar"
            : "Play"}
      </button>
    </div>
  );
}
function GameActions({
  phase,
  toggle,
  reset,
  lang,
  children,
}: {
  phase: Phase;
  toggle: () => void;
  reset: () => void;
  lang: Lang;
  children?: ReactNode;
}) {
  return (
    <div className="game-actions">
      <button
        className="media-button"
        onClick={toggle}
        disabled={phase === "ready" || phase === "over" || phase === "won"}
      >
        {phase === "running" ? <Pause size={13} /> : <Play size={13} />}
        {phase === "running"
          ? lang === "pt"
            ? "Pausar"
            : "Pause"
          : lang === "pt"
            ? "Continuar"
            : "Resume"}
      </button>
      <button className="media-button" onClick={reset}>
        <RotateCw size={13} />
        {lang === "pt" ? "Reiniciar" : "Restart"}
      </button>
      {children}
    </div>
  );
}
const DIRECTIONS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};
function DirectionPad({
  move,
  rotate,
  lang,
}: {
  move: (key: string) => void;
  rotate?: boolean;
  lang: Lang;
}) {
  return (
    <div
      className="game-dpad"
      aria-label={lang === "pt" ? "Controles" : "Game controls"}
    >
      {[
        ["ArrowLeft", ArrowLeft],
        ["ArrowUp", rotate ? RotateCw : ArrowUp],
        ["ArrowDown", ArrowDown],
        ["ArrowRight", ArrowRight],
      ].map(([key, Icon]) => {
        const K = Icon as typeof ArrowUp;
        return (
          <button
            className="media-button"
            key={key as string}
            aria-label={
              key === "ArrowUp" && rotate
                ? lang === "pt"
                  ? "Girar"
                  : "Rotate"
                : (lang === "pt" ? "Mover " : "Move ") +
                  {
                    ArrowLeft: lang === "pt" ? "esquerda" : "left",
                    ArrowUp: lang === "pt" ? "cima" : "up",
                    ArrowDown: lang === "pt" ? "baixo" : "down",
                    ArrowRight: lang === "pt" ? "direita" : "right",
                  }[key as string]
            }
            onClick={() => move(key as string)}
          >
            <K size={18} />
          </button>
        );
      })}
    </div>
  );
}
export function Snake({ lang, active }: { lang: Lang; active: boolean }) {
  const [snake, setSnake] = useState<Point[]>([
    { x: 6, y: 8 },
    { x: 5, y: 8 },
    { x: 4, y: 8 },
  ]);
  const [food, setFood] = useState<Point | null>({ x: 11, y: 8 });
  const [phase, setPhase] = useState<Phase>("ready");
  const direction = useRef<Point>({ x: 1, y: 0 }),
    pending = useRef<Point>({ x: 1, y: 0 });
  const root = useRef<HTMLDivElement>(null);
  const score = (snake.length - 3) * 10,
    best = useBest("snake", score);
  useAutoPause(active, () => setPhase(p => (p === "running" ? "paused" : p)));
  const reset = () => {
    const body = [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
    ];
    setSnake(body);
    setFood(snakeFood(body));
    direction.current = pending.current = { x: 1, y: 0 };
    setPhase("ready");
  };
  const move = (key: string) => {
    const next = DIRECTIONS[key];
    if (
      next &&
      !(next.x === -direction.current.x && next.y === -direction.current.y)
    )
      pending.current = next;
  };
  useEffect(() => {
    if (phase !== "running" || !active) return;
    const timer = window.setInterval(
      () => {
        direction.current = pending.current;
        const head = {
          x: snake[0].x + direction.current.x,
          y: snake[0].y + direction.current.y,
        };
        const eat = head.x === food?.x && head.y === food?.y;
        if (
          head.x < 0 ||
          head.x >= 16 ||
          head.y < 0 ||
          head.y >= 16 ||
          (eat ? snake : snake.slice(0, -1)).some(
            p => p.x === head.x && p.y === head.y
          )
        ) {
          setPhase("over");
          return;
        }
        const next = [head, ...snake];
        if (!eat) next.pop();
        setSnake(next);
        if (eat) {
          const nextFood = snakeFood(next);
          setFood(nextFood);
          if (!nextFood) setPhase("won");
        }
      },
      Math.max(75, 180 - score)
    );
    return () => clearInterval(timer);
  }, [phase, snake, food, score, active]);
  const toggle = () =>
    setPhase(p =>
      p === "running" ? "paused" : p === "paused" ? "running" : p
    );
  const start = () => {
    if (phase === "over" || phase === "won") reset();
    setPhase("running");
    root.current?.focus({ preventScroll: true });
  };
  return (
    <div
      className="arcade-game"
      ref={root}
      tabIndex={0}
      role="group"
      aria-label="Snake"
      onKeyDown={e => {
        if (DIRECTIONS[e.key] || ["p", " "].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          if (DIRECTIONS[e.key]) move(e.key);
          else toggle();
        }
      }}
    >
      <div className="game-scoreboard">
        <span>
          {lang === "pt" ? "PONTOS" : "SCORE"}{" "}
          <b>{String(score).padStart(4, "0")}</b>
        </span>
        <span>
          {lang === "pt" ? "RECORDE" : "BEST"}{" "}
          <b>{String(best).padStart(4, "0")}</b>
        </span>
      </div>
      <div className="game-screen snake-screen">
        <div
          className="snake-grid"
          role="img"
          aria-label={`${lang === "pt" ? "Cobra com" : "Snake with"} ${snake.length} ${lang === "pt" ? "segmentos" : "segments"}`}
        >
          {Array.from({ length: 256 }, (_, i) => {
            const x = i % 16,
              y = Math.floor(i / 16),
              part = snake.findIndex(p => p.x === x && p.y === y);
            return (
              <span
                key={i}
                className={
                  part === 0
                    ? "snake-head"
                    : part > 0
                      ? "snake-body"
                      : x === food?.x && y === food?.y
                        ? "snake-food"
                        : ""
                }
              />
            );
          })}
        </div>
        <Overlay phase={phase} lang={lang} start={start} />
      </div>
      <GameActions phase={phase} toggle={toggle} reset={reset} lang={lang} />
      <DirectionPad move={move} lang={lang} />
      <p className="game-help">
        {lang === "pt"
          ? "Setas / WASD para mover · P para pausar. Coma, cresça, não bata."
          : "Arrows / WASD to move · P to pause. Eat, grow, don’t hit the wall."}
      </p>
    </div>
  );
}
export function Tetris({ lang, active }: { lang: Lang; active: boolean }) {
  const [state, setState] = useState(() => ({
    board: emptyBoard(),
    piece: newPiece(),
    next: newPiece(),
    score: 0,
    lines: 0,
    phase: "ready" as Phase,
  }));
  const root = useRef<HTMLDivElement>(null);
  const best = useBest("tetris", state.score),
    level = 1 + Math.floor(state.lines / 10);
  useAutoPause(active, () =>
    setState(s => (s.phase === "running" ? { ...s, phase: "paused" } : s))
  );
  const reset = () =>
    setState({
      board: emptyBoard(),
      piece: newPiece(),
      next: newPiece(),
      score: 0,
      lines: 0,
      phase: "ready",
    });
  const move = (key: string) =>
    setState(s => {
      if (s.phase !== "running") return s;
      const piece = { ...s.piece };
      if (key === "ArrowUp")
        return { ...s, piece: rotatePiece(s.board, piece) };
      if (key === "ArrowLeft" || key === "ArrowRight") {
        piece.x += key === "ArrowLeft" ? -1 : 1;
        return collides(s.board, piece) ? s : { ...s, piece };
      }
      let drop = 0;
      if (key === " ") {
        while (!collides(s.board, { ...piece, y: piece.y + 1 })) {
          piece.y++;
          drop += 2;
        }
      } else {
        piece.y++;
        if (!collides(s.board, piece))
          return { ...s, piece, score: s.score + (key === "soft" ? 1 : 0) };
        piece.y--;
      }
      const locked = lockPiece(s.board, piece),
        next = s.next;
      return {
        board: locked.board,
        piece: next,
        next: newPiece(),
        score:
          s.score +
          [0, 100, 300, 500, 800][locked.lines] *
            (1 + Math.floor(s.lines / 10)) +
          drop,
        lines: s.lines + locked.lines,
        phase: collides(locked.board, next) ? "over" : "running",
      };
    });
  useEffect(() => {
    if (state.phase !== "running" || !active) return;
    const timer = window.setInterval(
      () => move("tick"),
      Math.max(100, 650 - (level - 1) * 60)
    );
    return () => clearInterval(timer);
  }, [state.phase, level, active]);
  const toggle = () =>
    setState(s => ({
      ...s,
      phase:
        s.phase === "running"
          ? "paused"
          : s.phase === "paused"
            ? "running"
            : s.phase,
    }));
  const display = state.board.map(row => [...row]);
  let ghost = { ...state.piece };
  while (!collides(state.board, { ...ghost, y: ghost.y + 1 }))
    ghost = { ...ghost, y: ghost.y + 1 };
  const cells = (piece: typeof ghost, color: number) =>
    piece.shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (
          v &&
          piece.y + y >= 0 &&
          piece.y + y < 20 &&
          piece.x + x >= 0 &&
          piece.x + x < 10
        )
          display[piece.y + y][piece.x + x] = color;
      })
    );
  cells(ghost, -1);
  cells(state.piece, state.piece.color);
  return (
    <div
      className="arcade-game"
      ref={root}
      tabIndex={0}
      role="group"
      aria-label="Tetris"
      onKeyDown={e => {
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            " ",
            "p",
          ].includes(e.key)
        ) {
          e.preventDefault();
          e.stopPropagation();
          if (e.key === "p") toggle();
          else move(e.key === "ArrowDown" ? "soft" : e.key);
        }
      }}
    >
      <div className="game-scoreboard">
        <span>
          {lang === "pt" ? "PONTOS" : "SCORE"}{" "}
          <b>{String(state.score).padStart(5, "0")}</b>
        </span>
        <span>
          {lang === "pt" ? "RECORDE" : "BEST"} <b>{best}</b>
        </span>
      </div>
      <div className="tetris-layout">
        <div className="game-screen tetris-screen">
          <div
            className="tetris-grid"
            role="img"
            aria-label={lang === "pt" ? "Tabuleiro de Tetris" : "Tetris board"}
          >
            {display.flat().map((v, i) => (
              <span
                key={i}
                className={
                  v === -1 ? "tetromino ghost" : v ? `tetromino block-${v}` : ""
                }
              />
            ))}
          </div>
          <Overlay
            phase={state.phase}
            lang={lang}
            start={() => {
              if (state.phase === "over") reset();
              setState(s => ({ ...s, phase: "running" }));
              root.current?.focus({ preventScroll: true });
            }}
          />
        </div>
        <aside className="tetris-stats">
          <span>{lang === "pt" ? "PRÓXIMA" : "NEXT"}</span>
          <div className="next-piece">
            {state.next.shape.map((row, y) => (
              <div key={y}>
                {row.map((v, x) => (
                  <i key={x} className={v ? `block-${state.next.color}` : ""} />
                ))}
              </div>
            ))}
          </div>
          <span>
            {lang === "pt" ? "LINHAS" : "LINES"}
            <b>{state.lines}</b>
          </span>
          <span>
            {lang === "pt" ? "NÍVEL" : "LEVEL"}
            <b>{level}</b>
          </span>
        </aside>
      </div>
      <GameActions
        phase={state.phase}
        toggle={toggle}
        reset={reset}
        lang={lang}
      />
      <DirectionPad
        move={key => move(key === "ArrowDown" ? "soft" : key)}
        rotate
        lang={lang}
      />
      <button className="media-button game-drop" onClick={() => move(" ")}>
        {lang === "pt" ? "Soltar peça ↓" : "Drop piece ↓"}
      </button>
      <p className="game-help">
        {lang === "pt"
          ? "← → mover · ↑ girar · ↓ descer · Espaço soltar · P pausar"
          : "← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause"}
      </p>
    </div>
  );
}
export function Minesweeper({ lang, active }: { lang: Lang; active: boolean }) {
  const [cells, setCells] = useState(blankMines),
    [phase, setPhase] = useState<Phase>("ready"),
    [flagMode, setFlagMode] = useState(false),
    [seconds, setSeconds] = useState(0);
  useAutoPause(active, () => setPhase(p => (p === "running" ? "paused" : p)));
  useEffect(() => {
    if (phase !== "running" || !active) return;
    const timer = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase, active]);
  const reset = () => {
    setCells(blankMines());
    setPhase("ready");
    setSeconds(0);
  };
  const reveal = (i: number) => {
    if (
      ["over", "won", "paused"].includes(phase) ||
      cells[i].flag ||
      cells[i].open
    )
      return;
    const board = phase === "ready" ? plantMines(cells, i) : cells;
    if (board[i].mine) {
      setCells(board.map(c => ({ ...c, open: c.mine || c.open })));
      setPhase("over");
      return;
    }
    const next = revealMines(board, i);
    setCells(next);
    setPhase(next.every(c => c.mine || c.open) ? "won" : "running");
  };
  const flag = (i: number) => {
    if (["over", "won", "paused"].includes(phase) || cells[i].open) return;
    if (!cells[i].flag && cells.filter(c => c.flag).length >= 10) return;
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };
  const flags = cells.filter(c => c.flag).length;
  return (
    <div className="arcade-game">
      <div className="game-scoreboard">
        <span>
          {lang === "pt" ? "MINAS" : "MINES"}{" "}
          <b>{String(10 - flags).padStart(2, "0")}</b>
        </span>
        <span>
          {lang === "pt" ? "TEMPO" : "TIME"}{" "}
          <b>{String(seconds).padStart(3, "0")}s</b>
        </span>
      </div>
      <div className="game-screen mines-screen">
        <div
          className="mines-grid"
          role="group"
          aria-label={
            lang === "pt" ? "Campo minado, 9 por 9" : "Minesweeper, 9 by 9"
          }
        >
          {cells.map((cell, i) => (
            <button
              key={i}
              className={`mine-cell ${cell.open ? "is-open" : ""} ${cell.open && cell.mine ? "is-mine" : ""}`}
              data-count={cell.count}
              aria-label={`${lang === "pt" ? "Linha" : "Row"} ${Math.floor(i / 9) + 1}, ${lang === "pt" ? "coluna" : "column"} ${(i % 9) + 1}: ${cell.flag ? (lang === "pt" ? "bandeira" : "flagged") : !cell.open ? (lang === "pt" ? "fechada" : "unopened") : cell.mine ? (lang === "pt" ? "mina" : "mine") : cell.count}`}
              aria-disabled={cell.open || phase === "over" || phase === "won"}
              onClick={() => (flagMode ? flag(i) : reveal(i))}
              onContextMenu={e => {
                e.preventDefault();
                flag(i);
              }}
              onKeyDown={e => {
                if (e.key.toLowerCase() === "f") {
                  e.preventDefault();
                  flag(i);
                }
                if (e.key.startsWith("Arrow")) {
                  e.preventDefault();
                  const delta =
                    { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[
                      e.key
                    ] ?? 0;
                  const next = i + delta;
                  if (
                    next >= 0 &&
                    next < 81 &&
                    (Math.abs(delta) === 9 ||
                      Math.floor(next / 9) === Math.floor(i / 9))
                  )
                    (
                      e.currentTarget.parentElement?.children[
                        next
                      ] as HTMLElement
                    )?.focus();
                }
              }}
            >
              {cell.open ? (
                cell.mine ? (
                  "✳"
                ) : (
                  cell.count || ""
                )
              ) : cell.flag ? (
                <Flag size={12} />
              ) : (
                ""
              )}
            </button>
          ))}
        </div>
        {phase !== "running" && phase !== "ready" && (
          <Overlay
            phase={phase}
            lang={lang}
            start={() => (phase === "paused" ? setPhase("running") : reset())}
          />
        )}
      </div>
      <GameActions
        phase={phase}
        lang={lang}
        toggle={() => setPhase(p => (p === "running" ? "paused" : "running"))}
        reset={reset}
      >
        <button
          className="media-button"
          aria-pressed={flagMode}
          onClick={() => setFlagMode(v => !v)}
        >
          <Flag size={13} />
          {lang === "pt" ? "Marcar" : "Flag mode"}
        </button>
      </GameActions>
      <p className="game-help" role="status">
        {phase === "ready"
          ? lang === "pt"
            ? "Abra uma casa para começar. O primeiro clique é seguro."
            : "Open a square to begin. Your first click is safe."
          : lang === "pt"
            ? "Encontre as 10 minas. Botão direito / F para marcar, ou use o modo de bandeira."
            : "Find all 10 mines. Right-click / F to flag, or use flag mode."}
      </p>
    </div>
  );
}
