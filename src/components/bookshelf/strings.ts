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
};
