import type { Lang } from "./types";

export type Strings = {
  sortLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  viewLabel: string;
  spines: string;
  covers: string;
  noMatches: string;
  sortAZ: string;
  sortTheme: string;
  sortRating: string;
  empty: string;
  reviewLabel: string;
  pagesSuffix: string;
  firstPublished: (year: number) => string;
  themeMarker: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    sortLabel: "Sort",
    searchLabel: "Find a book",
    searchPlaceholder: "Title, author, or theme…",
    clearSearch: "Clear search",
    viewLabel: "Shelf view",
    spines: "Spines",
    covers: "Covers",
    noMatches: "No matching books.",
    sortAZ: "A–Z",
    sortTheme: "by theme",
    sortRating: "by rating",
    empty: "# shelf empty",
    reviewLabel: "review:",
    pagesSuffix: "pp",
    firstPublished: y => `first published ${y}`,
    themeMarker: "//",
  },
  pt: {
    sortLabel: "Ordenar",
    searchLabel: "Encontrar um livro",
    searchPlaceholder: "Título, autor ou tema…",
    clearSearch: "Limpar busca",
    viewLabel: "Visualização da estante",
    spines: "Lombadas",
    covers: "Capas",
    noMatches: "Nenhum livro encontrado.",
    sortAZ: "A–Z",
    sortTheme: "por tema",
    sortRating: "por nota",
    empty: "# estante vazia",
    reviewLabel: "resenha:",
    pagesSuffix: "pp",
    firstPublished: y => `publicado em ${y}`,
    themeMarker: "//",
  },
};
