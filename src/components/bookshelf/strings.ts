import type { Lang } from "./types";

export type Strings = {
  prompt: string;
  countsSuffix: (n: number, reading: number) => string;
  sortAZ: string;
  sortTheme: string;
  sortRating: string;
  empty: string;
  footerHover: string;
  footerTouch: string;
  modalClose: string;
  modalReviewLabel: string;
  modalPagesSuffix: string;
  modalFirstPublished: (year: number) => string;
  themeMarker: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    prompt: "$ cat ~/bookshelf/*",
    countsSuffix: (n, r) => `${n} books · ${r} currently reading`,
    sortAZ: "A–Z",
    sortTheme: "by theme",
    sortRating: "by rating",
    empty: "# shelf empty",
    footerHover: "# hover a spine to see the cover · click for review",
    footerTouch: "# tap once to lift · tap again for review",
    modalClose: "Close",
    modalReviewLabel: "review:",
    modalPagesSuffix: "pp",
    modalFirstPublished: y => `first published ${y}`,
    themeMarker: "//",
  },
  pt: {
    prompt: "$ cat ~/estante/*",
    countsSuffix: (n, r) => `${n} livros · ${r} lendo agora`,
    sortAZ: "A–Z",
    sortTheme: "por tema",
    sortRating: "por nota",
    empty: "# estante vazia",
    footerHover: "# passe sobre uma lombada · clique para a resenha",
    footerTouch: "# toque para girar · toque de novo para a resenha",
    modalClose: "Fechar",
    modalReviewLabel: "resenha:",
    modalPagesSuffix: "pp",
    modalFirstPublished: y => `publicado em ${y}`,
    themeMarker: "//",
  },
  ja: {
    prompt: "$ cat ~/本棚/*",
    countsSuffix: (n, r) => `${n}冊 · ${r}冊読書中`,
    sortAZ: "A–Z",
    sortTheme: "テーマ別",
    sortRating: "評価別",
    empty: "# 本棚は空です",
    footerHover: "# 背表紙にカーソルを合わせる · クリックで感想",
    footerTouch: "# タップで持ち上げる · もう一度で感想",
    modalClose: "閉じる",
    modalReviewLabel: "感想:",
    modalPagesSuffix: "ページ",
    modalFirstPublished: y => `初版 ${y}`,
    themeMarker: "//",
  },
};
