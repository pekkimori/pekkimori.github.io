export type Point = { x: number; y: number };
export const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];
export type Piece = { shape: number[][]; x: number; y: number; color: number };
export const emptyBoard = () =>
  Array.from({ length: 20 }, () => Array<number>(10).fill(0));
export function newPiece(): Piece {
  const i = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[i].map(row => [...row]), x: 3, y: 0, color: i + 1 };
}
export function collides(board: number[][], piece: Piece) {
  return piece.shape.some((row, y) =>
    row.some(
      (v, x) =>
        v &&
        (piece.x + x < 0 ||
          piece.x + x >= 10 ||
          piece.y + y >= 20 ||
          (piece.y + y >= 0 && board[piece.y + y][piece.x + x] !== 0))
    )
  );
}
export function rotatePiece(board: number[][], piece: Piece): Piece {
  const shape = piece.shape[0].map((_, x) =>
    piece.shape.map(row => row[x]).reverse()
  );
  for (const offset of [0, -1, 1, -2, 2]) {
    const candidate = { ...piece, shape, x: piece.x + offset };
    if (!collides(board, candidate)) return candidate;
  }
  return piece;
}
export function lockPiece(board: number[][], piece: Piece) {
  const next = board.map(row => [...row]);
  piece.shape.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v && piece.y + y >= 0 && piece.y + y < 20)
        next[piece.y + y][piece.x + x] = piece.color;
    })
  );
  const remaining = next.filter(row => row.some(v => !v));
  const lines = 20 - remaining.length;
  return {
    board: [
      ...Array.from({ length: lines }, () => Array<number>(10).fill(0)),
      ...remaining,
    ],
    lines,
  };
}
export function snakeFood(snake: Point[], size = 16): Point | null {
  const free: Point[] = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (!snake.some(p => p.x === x && p.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? null;
}
export type MineCell = {
  mine: boolean;
  count: number;
  open: boolean;
  flag: boolean;
};
export function neighbors(i: number, size = 9) {
  const result: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const x = (i % size) + dx,
        y = Math.floor(i / size) + dy;
      if ((dx || dy) && x >= 0 && x < size && y >= 0 && y < size)
        result.push(y * size + x);
    }
  return result;
}
export const blankMines = (): MineCell[] =>
  Array.from({ length: 81 }, () => ({
    mine: false,
    count: 0,
    open: false,
    flag: false,
  }));
export function plantMines(cells: MineCell[], first: number) {
  const next = cells.map(cell => ({ ...cell }));
  const safe = new Set([first, ...neighbors(first)]);
  const candidates = next.map((_, i) => i).filter(i => !safe.has(i));
  for (let n = 0; n < 10; n++) {
    const index = Math.floor(Math.random() * candidates.length);
    next[candidates.splice(index, 1)[0]].mine = true;
  }
  next.forEach((cell, i) => {
    cell.count = neighbors(i).filter(j => next[j].mine).length;
  });
  return next;
}
export function revealMines(cells: MineCell[], index: number) {
  const next = cells.map(cell => ({ ...cell }));
  const queue = [index];
  while (queue.length) {
    const i = queue.pop()!,
      cell = next[i];
    if (cell.open || cell.flag || cell.mine) continue;
    cell.open = true;
    if (!cell.count) queue.push(...neighbors(i).filter(j => !next[j].open));
  }
  return next;
}
