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
    spineColor: "#e80928",
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
      ja: {
        title: "人間性の法則",
        author: "ロバート・グリーン",
        theme: "哲学",
        review:
          "自己啓発書を装った実務マニュアル。グリーンはナルシシズム、嫉妬、誇大妄想、同調といった人間の反復するパターンを目録化していく。処方箋というより診断書だ。\n\n章ごとの当たり外れはあるが、貫かれている軸は鋭い：他人が他人であることをやめないと諦めたとき、人は反射的に反応しなくなる。",
        quote: "他の誰かになるのではなく、より徹底的に自分自身であること。",
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
    spineColor: "#f7bb03",
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
      ja: {
        title: "黄衣の王",
        author: "ロバート・W・チェンバース",
        theme: "ホラー",
        review:
          "読み手を狂気へと駆り立てる禁断の戯曲に取り憑かれた短篇集。仕掛けは、最悪のページは決して見せず、それを読んでしまった人々が残した残骸だけを描くことにある。\n\nチェンバースは一八九五年にこれを書き、いまだに恐怖の通奏低音が鳴り止まない。ラヴクラフトを含むその後の奇想文学の半分は、彼に詫びを入れるべきだ。",
        quote:
          "彼の精神は驚異の小部屋であり、そこから彼は、あなたや私が数年の人生を差し出してでも手に入れたい宝を取り出してみせる。",
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
    spineColor: "#5d3e12",
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
      ja: {
        title: "Motes and Beams",
        author: "Michael Pierce",
        theme: "psychology",
        review:
          "ユング的な性格理論を丁寧に整理した一冊。診断というより地図としての視点が強く、概念の輪郭が分かりやすい。",
        quote: "判決ではなく、地図だ。",
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

export function getBookCounts(): { total: number; reading: number } {
  return {
    total: BOOKS.length,
    reading: BOOKS.filter(b => b.status === "reading").length,
  };
}
