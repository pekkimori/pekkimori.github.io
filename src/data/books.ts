import type { Book, Lang, LocalizedBook } from "@/components/bookshelf/types";

export const BOOKS: Book[] = [
  {
    slug: "laws-of-human-nature",
    cover: null,
    rating: 4,
    yearRead: 2024,
    originalYear: 2018,
    pageCount: 624,
    status: "read",
    spineColor: "#3b2f2f",
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
    cover: null,
    rating: 5,
    yearRead: 2023,
    originalYear: 1895,
    pageCount: 316,
    status: "read",
    spineColor: "#7a6a1f",
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
    slug: "rich-dad-poor-dad",
    cover: null,
    rating: 3,
    yearRead: 2022,
    originalYear: 1997,
    pageCount: 207,
    status: "read",
    spineColor: "#2f4d3a",
    i18n: {
      en: {
        title: "Rich Dad, Poor Dad",
        author: "Robert T. Kiyosaki",
        theme: "finance",
        review:
          "More an attitude than a book. Kiyosaki's central reframe — assets put money in your pocket, liabilities take it out — is repeated until it sticks, and the parables are thin.\n\nWorth reading once, mostly as a vaccine against the specific kind of middle-class financial superstition it argues against. Don't read the sequels.",
        quote:
          "Winners are not afraid of losing. But losers are. Failure is part of the process of success.",
      },
      pt: {
        title: "Pai Rico, Pai Pobre",
        author: "Robert T. Kiyosaki",
        theme: "finanças",
        review:
          "Mais uma postura do que um livro. A virada central de Kiyosaki — ativos colocam dinheiro no seu bolso, passivos tiram — é repetida até grudar, e as parábolas são rasas.\n\nVale a leitura uma vez, sobretudo como vacina contra o tipo específico de superstição financeira de classe média que ele combate. Não leia as continuações.",
        quote:
          "Vencedores não têm medo de perder. Mas perdedores têm. O fracasso faz parte do processo de sucesso.",
      },
      ja: {
        title: "金持ち父さん 貧乏父さん",
        author: "ロバート・キヨサキ",
        theme: "ファイナンス",
        review:
          "本というより姿勢の話。資産は財布に金を入れ、負債は金を抜く——というキヨサキの中心的な言い換えは、頭に染み込むまで繰り返され、寓話は薄い。\n\n一度は読む価値がある。とくに、彼が批判する中産階級的な財政の迷信に対するワクチンとして。続編は読まなくていい。",
        quote:
          "勝者は負けることを恐れない。だが敗者は恐れる。失敗は成功の過程の一部だ。",
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
