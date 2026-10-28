import type { Book, Lang, LocalizedBook } from "@/components/bookshelf/types";
import lawsCover from "@/assets/books/humannaturelaws_cover.jpg";
import kingCover from "@/assets/books/thekinginyellow_cover.jpg";
import motesCover from "@/assets/books/motesandbeams_cover.jpg";

export const BOOKS: Book[] = [
  {
    slug: "laws-of-human-nature",
    cover: lawsCover,
    rating: 4,
    yearRead: 2024,
    originalYear: 2018,
    pageCount: 624,
    status: "read",
    spineColor: "#8f2f35",
    i18n: {
      en: {
        title: "The Laws of Human Nature",
        author: "Robert Greene",
        theme: "philosophy",
        review:
          "A field manual disguised as a self-help book. Greene catalogs the recurring patterns of human behavior — narcissism, envy, grandiosity, conformity — and the result is less prescriptive than diagnostic.\n\nNot every chapter lands, but the through-line is sharp: you become less reactive when you stop expecting other people to be other than what they are.",
        quote:
          "Not to become someone else, but to be more thoroughly yourself.",
      },
      pt: {
        title: "As Leis da Natureza Humana",
        author: "Robert Greene",
        theme: "filosofia",
        review:
          "Um manual de campo disfarçado de livro de autoajuda. Greene cataloga os padrões recorrentes do comportamento humano — narcisismo, inveja, grandiosidade, conformidade — e o resultado é menos prescritivo do que diagnóstico.\n\nNem todo capítulo acerta, mas o fio condutor é nítido: você se torna menos reativo quando deixa de esperar que as pessoas sejam outra coisa além do que são.",
        quote:
          "Não para se tornar outra pessoa, mas para ser mais plenamente você mesmo.",
      },
    },
  },
  {
    slug: "king-in-yellow",
    cover: kingCover,
    rating: 5,
    yearRead: 2023,
    originalYear: 1895,
    pageCount: 316,
    status: "read",
    spineColor: "#c59a35",
    i18n: {
      en: {
        title: "The King in Yellow",
        author: "Robert W. Chambers",
        theme: "horror",
        review:
          "A collection of stories haunted by a forbidden play that drives its readers to madness. The conceit is that you never see the worst pages — only the wreckage left behind by people who did.\n\nChambers wrote this in 1895 and the dread still hums. Half of weird fiction since (Lovecraft especially) owes him an apology.",
        quote:
          "His mind is a wonder chamber, from which he can extract treasures that you and I would give years of our life to acquire.",
      },
      pt: {
        title: "O Rei de Amarelo",
        author: "Robert W. Chambers",
        theme: "horror",
        review:
          "Uma coletânea de contos assombrados por uma peça proibida que enlouquece quem a lê. O truque é que você nunca vê as piores páginas — só os destroços deixados por quem viu.\n\nChambers escreveu isso em 1895 e o pavor ainda zumbe. Boa parte da literatura estranha desde então (Lovecraft em especial) lhe deve um pedido de desculpas.",
        quote:
          "Sua mente é uma câmara de maravilhas, da qual ele extrai tesouros que você e eu daríamos anos de vida para adquirir.",
      },
    },
  },
  {
    slug: "motes-and-beams",
    cover: motesCover,
    rating: 5,
    yearRead: 2024,
    originalYear: 1895,
    pageCount: 186,
    status: "read",
    spineColor: "#59402f",
    i18n: {
      en: {
        title: "Motes and Beams",
        author: "Michael Pierce",
        theme: "psychology",
        review:
          "A dense but lucid map of Jungian personality theory. It reads less like a test and more like a taxonomy, with careful definitions and a steady emphasis on nuance.",
        quote: "A map, not a verdict.",
      },
      pt: {
        title: "Motes and Beams",
        author: "Michael Pierce",
        theme: "psychology",
        review:
          "Um mapa denso, mas claro, da teoria junguiana da personalidade. Menos diagnóstico, mais cartografia, com conceitos bem definidos e foco na nuance.",
        quote: "Um mapa, não um veredito.",
      },
    },
  },
];

export function getBooksForLocale(lang: Lang): Omit<LocalizedBook, "cover">[] {
  return BOOKS.map(({ i18n, cover: _cover, ...rest }) => ({
    ...rest,
    ...i18n[lang],
  }));
}
