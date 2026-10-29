// Puzzle answers are checked only against the note currently being read.
// This is a static-site game: these are discoveries, not security credentials.
export const EGGS = [
  {
    id: "note-01",
    answer: "moon",
    glyph: "☾",
    trail: "sky",
    riddle: {
      en: "First lights:\nMidnight keeps a borrowed glow.\nOnly the tide replies below.\nOver the roofs, a silver seam.\nNight folds the edge of every dream.\n\nFour lines; one name.",
      pt: "Primeiras luzes:\nMidnight keeps a borrowed glow.\nOnly the tide replies below.\nOver the roofs, a silver seam.\nNight folds the edge of every dream.\n\nQuatro versos; um nome.",
    },
    hint: {
      en: "Read the first letter of each line, from top to bottom.",
      pt: "Leia a primeira letra de cada verso, de cima para baixo.",
    },
    reward: {
      en: "A quiet lunar garden blooms here.",
      pt: "Um jardim lunar silencioso floresce aqui.",
    },
  },
  {
    id: "note-02",
    answer: "telescope",
    glyph: "🔭",
    trail: "sky",
    riddle: {
      en: "The observatory lens reverses its label:\n\nEPOCSELET\n\nRead it from the other side.",
      pt: "A lente do observatório inverte sua etiqueta:\n\nEPOCSELET\n\nLeia do outro lado.",
    },
    hint: {
      en: "Start at the right-hand end of the label.",
      pt: "Comece pela ponta direita da etiqueta.",
    },
    reward: {
      en: "You found an observatory above the clouds.",
      pt: "Você encontrou um observatório acima das nuvens.",
    },
  },
  {
    id: "note-03",
    answer: "orbit",
    glyph: "◎",
    trail: "sky",
    riddle: {
      en: "I am the journey, not the traveler.\nA satellite repeats me without retracing a road.\nGravity bends me into a loop.\nWhat five-letter path am I?",
      pt: "Sou o percurso, não o viajante.\nUm satélite me repete sem seguir uma estrada.\nA gravidade me curva em um laço.\nQue percurso de cinco letras sou, em inglês?",
    },
    hint: {
      en: "Name the path a satellite follows around a planet.",
      pt: "Dê o nome em inglês do percurso de um satélite ao redor de um planeta.",
    },
    reward: {
      en: "Your tiny satellite has a stable home.",
      pt: "Seu pequeno satélite encontrou um lar estável.",
    },
  },
  {
    id: "note-04",
    answer: "comet",
    glyph: "☄",
    trail: "sky",
    riddle: {
      en: "A traveler is assembled from two pieces:\n\nAn invitation to approach (4 letters)\n+ the last letter of NIGHT.\n\nName the traveler.",
      pt: "Um viajante é montado com duas peças:\n\nUm convite em inglês para se aproximar (4 letras)\n+ a última letra de NIGHT.\n\nDê o nome do viajante.",
    },
    hint: {
      en: "The invitation is a verb. Append one letter; do not rearrange it.",
      pt: "O convite é um verbo. Acrescente uma letra, sem mudar a ordem.",
    },
    reward: {
      en: "A comet left a postcard: wish you were here.",
      pt: "Um cometa deixou um cartão: queria você aqui.",
    },
  },
  {
    id: "note-05",
    answer: "nebula",
    glyph: "✧",
    trail: "sky",
    riddle: {
      en: "A damaged transmission repeats every character twice:\n\nNNEEBBUULLAA\n\nRecover the original six-letter signal.",
      pt: "Uma transmissão danificada repete cada caractere duas vezes:\n\nNNEEBBUULLAA\n\nRecupere o sinal original de seis letras.",
    },
    hint: {
      en: "Keep one character from each adjacent pair.",
      pt: "Guarde um caractere de cada par vizinho.",
    },
    reward: {
      en: "A new star lights up the recovered chart.",
      pt: "Uma nova estrela ilumina o mapa recuperado.",
    },
  },
  {
    id: "note-06",
    answer: "pulsar",
    glyph: "✺",
    trail: "sky",
    riddle: {
      en: "The receiver alternates signal and static.\nIt starts with signal:\n\nPxUxLxSxAxR\n\nWhat did it receive?",
      pt: "O receptor alterna sinal e ruído.\nEle começa pelo sinal:\n\nPxUxLxSxAxR\n\nO que ele recebeu?",
    },
    hint: {
      en: "Read positions 1, 3, 5, and so on.",
      pt: "Leia as posições 1, 3, 5 e assim por diante.",
    },
    reward: {
      en: "Signal received: someone out there is listening.",
      pt: "Sinal recebido: alguém lá fora está ouvindo.",
    },
  },
  {
    id: "note-07",
    answer: "supernova",
    glyph: "✹",
    trail: "sky",
    riddle: {
      en: "The alarm is one letter ahead of itself:\n\nTVQFSOPWB\n\nMove each letter one place backward in the alphabet\nto identify the explosion.",
      pt: "O alarme está uma letra adiantado:\n\nTVQFSOPWB\n\nRecue cada letra uma posição no alfabeto\npara identificar a explosão, em inglês.",
    },
    hint: {
      en: "T becomes S, V becomes U. Apply the same rule to every letter.",
      pt: "T vira S, V vira U. Aplique a mesma regra a todas as letras.",
    },
    reward: {
      en: "Even endings can make new elements.",
      pt: "Até finais podem criar novos elementos.",
    },
  },
  {
    id: "note-08",
    answer: "event horizon",
    glyph: "◉",
    trail: "sky",
    riddle: {
      en: "The last transmission uses alphabet positions (A=1, Z=26).\nA slash separates words:\n\n5 22 5 14 20 / 8 15 18 9 26 15 14\n\nDecode the boundary.",
      pt: "A última transmissão usa posições no alfabeto (A=1, Z=26).\nUma barra separa palavras:\n\n5 22 5 14 20 / 8 15 18 9 26 15 14\n\nDecifre a fronteira.",
    },
    hint: {
      en: "Replace each number with its letter; preserve the word break.",
      pt: "Troque cada número pela letra correspondente; preserve o espaço entre palavras.",
    },
    reward: {
      en: "You reached the edge. The universe waves back.",
      pt: "Você chegou à borda. O universo acena de volta.",
    },
  },
  {
    id: "note-09",
    answer: "purr",
    glyph: "🐾",
    trail: "cat",
    riddle: {
      en: "A note beneath a paw print:\n\nOne P, one U, then twice the eighteenth letter.\nFour letters. No vowels left to add.",
      pt: "Uma nota sob uma pegada:\n\nUm P, um U, depois duas vezes a décima oitava letra.\nQuatro letras. Nenhuma outra vogal.",
    },
    hint: {
      en: "The eighteenth letter of the alphabet is R.",
      pt: "A décima oitava letra do alfabeto é R.",
    },
    reward: {
      en: "Purrrrr. You have been adopted.",
      pt: "Purrrrr. Você foi adotado.",
    },
  },
  {
    id: "note-10",
    answer: "whiskers",
    glyph: "≋",
    trail: "cat",
    riddle: {
      en: "The cat walked across a typewriter.\nKeep only the capital letters:\n\nwWaHnIdSeKrEiRnSg\n\nWhat did its face leave behind?",
      pt: "O gato passou pela máquina de escrever.\nGuarde apenas as letras maiúsculas:\n\nwWaHnIdSeKrEiRnSg\n\nO que o rosto dele deixou para trás?",
    },
    hint: {
      en: "Ignore every lowercase letter and keep the original order.",
      pt: "Ignore as minúsculas e preserve a ordem original.",
    },
    reward: {
      en: "The doorway inspector approves this website.",
      pt: "O inspetor de passagens aprovou este site.",
    },
  },
  {
    id: "note-11",
    answer: "catnip",
    glyph: "♧",
    trail: "cat",
    riddle: {
      en: "The gardener left two labels:\n\nCAT + PIN\n\nThe second label faces backward.\nFix it, then join the labels to name the plant.",
      pt: "O jardineiro deixou duas etiquetas:\n\nCAT + PIN\n\nA segunda está ao contrário.\nCorrija-a e junte as etiquetas para dar nome à planta.",
    },
    hint: {
      en: "Reverse only PIN before attaching it to CAT.",
      pt: "Inverta apenas PIN antes de juntá-lo a CAT.",
    },
    reward: {
      en: "The resident cat has entered airplane mode.",
      pt: "O gato residente entrou em modo avião.",
    },
  },
  {
    id: "note-12",
    answer: "cardboard",
    glyph: "▣",
    trail: "cat",
    riddle: {
      en: "Build a box from two words:\n\nA playing ___ (4 letters)\nA chess___ (5 letters)\n\nJoin the missing pieces, in order.",
      pt: "Monte uma caixa com duas palavras inglesas:\n\nUma carta de baralho: playing ___ (4 letras)\nUm tabuleiro de xadrez: chess___ (5 letras)\n\nJunte as peças que faltam, em ordem.",
    },
    hint: {
      en: "Both blanks name flat objects. Keep both complete words.",
      pt: "As duas lacunas nomeiam objetos planos. Preserve as duas palavras completas.",
    },
    reward: {
      en: "Luxury apartment acquired. Rent: one chin scratch.",
      pt: "Apartamento de luxo adquirido. Aluguel: carinho no queixo.",
    },
  },
  {
    id: "note-13",
    answer: "yarn",
    glyph: "🧶",
    trail: "cat",
    riddle: {
      en: "An unfinished sweater left four loose ends.\nUntangle these letters into the thread it needs:\n\nN R A Y\n\nUse every letter once.",
      pt: "Um suéter inacabado deixou quatro pontas soltas.\nDesembaralhe as letras para achar o fio de que ele precisa, em inglês:\n\nN R A Y\n\nUse cada letra uma vez.",
    },
    hint: {
      en: "The word starts with Y and names knitting material.",
      pt: "A palavra começa com Y e nomeia um material de tricô.",
    },
    reward: {
      en: "You untangled one thought. Keep going.",
      pt: "Você desembaraçou um pensamento. Continue.",
    },
  },
  {
    id: "note-14",
    answer: "sunbeam",
    glyph: "☀",
    trail: "cat",
    riddle: {
      en: "I enter through glass without opening it.\nDust makes my path visible.\nA cat follows my warm stripe across the floor.\nName me in seven letters.",
      pt: "Entro pelo vidro sem abri-lo.\nA poeira torna meu caminho visível.\nUm gato segue minha faixa quente pelo chão.\nDê meu nome em inglês, com sete letras.",
    },
    hint: {
      en: "Combine the name of our star with a word for a ray of light.",
      pt: "Junte o nome inglês da nossa estrela a uma palavra inglesa para raio de luz.",
    },
    reward: {
      en: "The best seat in the house is yours.",
      pt: "O melhor lugar da casa é seu.",
    },
  },
  {
    id: "note-15",
    answer: "nine lives",
    glyph: "♡",
    trail: "cat",
    riddle: {
      en: "The cat keeps a ledger:\n\nStarted with 12 chances.\nSpent 3.\nStill alive.\n\nWrite the remainder as an English word,\nthen add the plural of LIFE.",
      pt: "O gato mantém um registro:\n\nComeçou com 12 chances.\nGastou 3.\nContinua vivo.\n\nEscreva o restante por extenso em inglês\ne acrescente o plural de LIFE.",
    },
    hint: {
      en: "Subtract first. LIFE changes its F to V in the plural.",
      pt: "Subtraia primeiro. LIFE troca o F por V no plural.",
    },
    reward: {
      en: "Extra life granted. Use it for something kind.",
      pt: "Vida extra concedida. Use para algo gentil.",
    },
  },
  {
    id: "note-16",
    answer: "cheshire",
    glyph: "😸",
    trail: "cat",
    riddle: {
      en: "The last note has almost vanished. Its grin remains:\n\nCH _ SH _ R _\n\nFill the three gaps with E, E, and I.\nThe I goes between H and R. Read the name.",
      pt: "A última nota quase desapareceu. Seu sorriso permanece:\n\nCH _ SH _ R _\n\nPreencha com E, E e I.\nO I fica entre H e R. Leia o nome.",
    },
    hint: {
      en: "The first and last gaps receive the same vowel.",
      pt: "A primeira e a última lacuna recebem a mesma vogal.",
    },
    reward: {
      en: "Only the smile remains. You finished the cat trail.",
      pt: "Só o sorriso ficou. Você terminou a trilha dos gatos.",
    },
  },
  {
    id: "note-17",
    answer: "root",
    glyph: "⌘",
    trail: "machine",
    riddle: {
      en: "A filesystem is drawn as a tree.\nIts very top shares a name with a tree’s hidden bottom.\nWhat four-letter word belongs at both ends?",
      pt: "Um sistema de arquivos é desenhado como uma árvore.\nSeu topo tem o mesmo nome que a parte escondida sob a árvore.\nQue palavra inglesa de quatro letras serve para os dois?",
    },
    hint: {
      en: "Think of the part of a plant that anchors it underground.",
      pt: "Pense na parte da planta que a prende ao solo.",
    },
    reward: {
      en: "You have root access to your own curiosity.",
      pt: "Você tem acesso root à própria curiosidade.",
    },
  },
  {
    id: "note-18",
    answer: "hello world",
    glyph: "👋",
    trail: "machine",
    riddle: {
      en: "Recover the first message.\nEach word is reversed, but their order is intact:\n\nOLLEH DLROW",
      pt: "Recupere a primeira mensagem.\nCada palavra está invertida, mas a ordem foi preservada:\n\nOLLEH DLROW",
    },
    hint: {
      en: "Reverse the letters inside each word separately.",
      pt: "Inverta as letras de cada palavra separadamente.",
    },
    reward: {
      en: "Hello, curious human. The world says hello back.",
      pt: "Olá, humano curioso. O mundo responde olá.",
    },
  },
  {
    id: "note-19",
    answer: "rubber duck",
    glyph: "🦆",
    trail: "machine",
    riddle: {
      en: "The debugging desk has a label with its vowels missing:\n\nR_BB_R D_CK\n\nRestore U, E, U, in that order.\nKeep the space.",
      pt: "A mesa de depuração tem uma etiqueta sem as vogais:\n\nR_BB_R D_CK\n\nRestaure U, E, U, nessa ordem.\nPreserve o espaço.",
    },
    hint: {
      en: "Fill the blanks from left to right.",
      pt: "Preencha as lacunas da esquerda para a direita.",
    },
    reward: {
      en: "Quack. Have you tried explaining it out loud?",
      pt: "Quack. Já tentou explicar em voz alta?",
    },
  },
  {
    id: "note-20",
    answer: "segfault",
    glyph: "⚡",
    trail: "machine",
    riddle: {
      en: "A crash report must fit in eight characters.\n\nSEGMENTATION FAULT\n\nKeep the first three letters of the first word,\nthen the entire second word. Remove the space.",
      pt: "O relatório de falha precisa caber em oito caracteres.\n\nSEGMENTATION FAULT\n\nGuarde as três primeiras letras da primeira palavra\ne toda a segunda palavra. Remova o espaço.",
    },
    hint: {
      en: "Three letters plus five letters make the shortened crash name.",
      pt: "Três letras mais cinco formam o nome abreviado da falha.",
    },
    reward: {
      en: "A pretend crash. Your curiosity is still running.",
      pt: "Uma falha de mentirinha. Sua curiosidade continua rodando.",
    },
  },
  {
    id: "note-21",
    answer: "coffee",
    glyph: "☕",
    trail: "machine",
    riddle: {
      en: "The night shift left a six-character receipt:\n\n3 15 6 6 5 5\n\nA=1, B=2, …, Z=26.\nWhat was ordered?",
      pt: "O turno da noite deixou um recibo de seis caracteres:\n\n3 15 6 6 5 5\n\nA=1, B=2, …, Z=26.\nO que foi pedido?",
    },
    hint: {
      en: "The repeated numbers become repeated letters.",
      pt: "Os números repetidos viram letras repetidas.",
    },
    reward: {
      en: "Compilation complete. Hydration reminder included.",
      pt: "Compilação concluída. Lembrete de hidratação incluído.",
    },
  },
  {
    id: "note-22",
    answer: "localhost",
    glyph: "⌂",
    trail: "machine",
    riddle: {
      en: "Join two missing words from the network log:\n\nA ___ train stops at every station. (5 letters)\nA ___ welcomes guests. (4 letters)\n\nTogether they name the machine talking to itself.",
      pt: "Junte duas palavras inglesas que faltam no registro de rede:\n\nUm trem que para em todas as estações é um ___ train. (5 letras)\nQuem recebe convidados é um ___. (4 letras)\n\nJuntas, nomeiam a máquina conversando consigo mesma.",
    },
    hint: {
      en: "The first word is the opposite of express; the second is the opposite of guest.",
      pt: "A primeira é o oposto de express; a segunda é o oposto de guest.",
    },
    reward: {
      en: "There is no place like 127.0.0.1.",
      pt: "Não há lugar como 127.0.0.1.",
    },
  },
  {
    id: "note-23",
    answer: "42",
    glyph: "✳",
    trail: "machine",
    riddle: {
      en: "A tiny program leaves one value:\n\nx = 6\nx = x * 7\nprint(x)\n\nAnswer with digits.",
      pt: "Um pequeno programa deixa um valor:\n\nx = 6\nx = x * 7\nprint(x)\n\nResponda com algarismos.",
    },
    hint: {
      en: "The asterisk means multiplication.",
      pt: "O asterisco significa multiplicação.",
    },
    reward: {
      en: "Now we just need the right question.",
      pt: "Agora só precisamos da pergunta certa.",
    },
  },
  {
    id: "note-24",
    answer: "xyzzy",
    glyph: "◇",
    trail: "machine",
    riddle: {
      en: "The last lock uses a circular alphabet: after Z comes A.\n\nStart three letters before A.\nMove forward one letter.\nMove forward once more.\nStay on the same letter.\nMove backward one letter.\n\nRecord a letter at each of the five steps.",
      pt: "A última fechadura usa um alfabeto circular: depois de Z vem A.\n\nComece três letras antes de A.\nAvance uma letra.\nAvance mais uma vez.\nFique na mesma letra.\nRecue uma letra.\n\nAnote uma letra em cada uma das cinco etapas.",
    },
    hint: {
      en: "Moving backward from A wraps through Z, then Y, then X.",
      pt: "Recuar a partir de A passa por Z, depois Y e depois X.",
    },
    reward: {
      en: "A hollow voice says: you belong here.",
      pt: "Uma voz distante diz: seu lugar é aqui.",
    },
  },
  {
    id: "note-25",
    answer: "seed",
    glyph: "🌱",
    trail: "garden",
    riddle: {
      en: "Four packets in the greenhouse:\n\nStone\nEarth\nEmber\nDew\n\nTheir initials name what belongs in the soil.",
      pt: "Quatro pacotes na estufa:\n\nStone\nEarth\nEmber\nDew\n\nAs iniciais dão o nome inglês do que vai para a terra.",
    },
    hint: {
      en: "Read one first letter per line, from top to bottom.",
      pt: "Leia uma inicial por linha, de cima para baixo.",
    },
    reward: {
      en: "A tiny idea has taken root.",
      pt: "Uma pequena ideia criou raízes.",
    },
  },
  {
    id: "note-26",
    answer: "moss",
    glyph: "♧",
    trail: "garden",
    riddle: {
      en: "A damp stone carries a reversed inscription:\n\nSSOM\n\nTurn it around to find its green covering.",
      pt: "Uma pedra úmida tem uma inscrição invertida:\n\nSSOM\n\nVire-a para descobrir sua cobertura verde, em inglês.",
    },
    hint: {
      en: "Read the inscription from right to left.",
      pt: "Leia a inscrição da direita para a esquerda.",
    },
    reward: {
      en: "Slow growth is still growth.",
      pt: "Crescer devagar ainda é crescer.",
    },
  },
  {
    id: "note-27",
    answer: "firefly",
    glyph: "✦",
    trail: "garden",
    riddle: {
      en: "Two small words light the path:\n\nWhat burns in a hearth? (4 letters)\nWhat can a bird do? (3 letters)\n\nJoin the answers to name a living lantern.",
      pt: "Duas palavras inglesas iluminam o caminho:\n\nO que queima numa lareira? (4 letras)\nO que um pássaro pode fazer? (3 letras)\n\nJunte as respostas para nomear uma lanterna viva.",
    },
    hint: {
      en: "The second answer is a verb. Keep the hearth word first.",
      pt: "A segunda resposta é um verbo. Mantenha a palavra da lareira primeiro.",
    },
    reward: {
      en: "One small light is enough to begin.",
      pt: "Uma pequena luz basta para começar.",
    },
  },
  {
    id: "note-28",
    answer: "mycelium",
    glyph: "⌁",
    trail: "garden",
    riddle: {
      en: "The underground label has been cut into four tiles:\n\nLI | MY | UM | CE\n\nRestore the order: 2 → 4 → 1 → 3.\nRead the network’s name.",
      pt: "A etiqueta subterrânea foi cortada em quatro peças:\n\nLI | MY | UM | CE\n\nRestaure a ordem: 2 → 4 → 1 → 3.\nLeia o nome da rede.",
    },
    hint: {
      en: "Number the printed tiles from left to right before rearranging them.",
      pt: "Numere as peças da esquerda para a direita antes de reorganizá-las.",
    },
    reward: {
      en: "Invisible connections keep us alive.",
      pt: "Conexões invisíveis nos mantêm vivos.",
    },
  },
  {
    id: "note-29",
    answer: "echoes",
    glyph: "↺",
    trail: "garden",
    riddle: {
      en: "The canyon returns the ends of these six words:\n\nlakE lilaC patH radiO treE glasS\n\nKeep only the final letter of each word.",
      pt: "O cânion devolve o fim destas seis palavras:\n\nlakE lilaC patH radiO treE glasS\n\nGuarde apenas a última letra de cada palavra.",
    },
    hint: {
      en: "Six word endings produce a plural English word.",
      pt: "As seis terminações formam uma palavra inglesa no plural.",
    },
    reward: {
      en: "Hello… hello… hello… someone heard you.",
      pt: "Olá… olá… olá… alguém ouviu você.",
    },
  },
  {
    id: "note-30",
    answer: "aurora",
    glyph: "〰",
    trail: "garden",
    riddle: {
      en: "The sky wrote in a mirror alphabet:\nA ↔ Z, B ↔ Y, C ↔ X, and so on.\n\nZFILIZ\n\nReflect each letter to name its ribbon of light.",
      pt: "O céu escreveu num alfabeto espelhado:\nA ↔ Z, B ↔ Y, C ↔ X e assim por diante.\n\nZFILIZ\n\nReflita cada letra para nomear sua fita de luz.",
    },
    hint: {
      en: "Write A–Z above Z–A and substitute using the paired letters.",
      pt: "Escreva A–Z sobre Z–A e troque cada letra pelo seu par.",
    },
    reward: {
      en: "The sky painted this just for your visit.",
      pt: "O céu pintou isto para sua visita.",
    },
  },
  {
    id: "note-31",
    answer: "serendipity",
    glyph: "✿",
    trail: "garden",
    riddle: {
      en: "The garden hid a word in three numbered scraps:\n\n(3) PITY\n(1) SER\n(2) ENDI\n\nPut them in numerical order.\nA happy accidental discovery should result.",
      pt: "O jardim escondeu uma palavra em três recortes numerados:\n\n(3) PITY\n(1) SER\n(2) ENDI\n\nColoque-os em ordem numérica.\nO resultado nomeia uma descoberta feliz por acaso, em inglês.",
    },
    hint: {
      en: "The numbers order whole scraps, not individual letters.",
      pt: "Os números ordenam recortes inteiros, não letras individuais.",
    },
    reward: {
      en: "You came looking for a secret and found a little joy.",
      pt: "Você procurou um segredo e encontrou uma alegria.",
    },
  },
  {
    id: "note-32",
    answer: "home sweet home",
    glyph: "⌂",
    trail: "garden",
    riddle: {
      en: "The last gate keeps a three-word sign:\n\nHOME\n\nOne word is missing after it.\nThat word is the opposite of BITTER.\nThe third word repeats the first.\n\nRebuild the sign.",
      pt: "O último portão guarda uma placa de três palavras:\n\nHOME\n\nFalta uma palavra depois dela.\nEssa palavra é o oposto de BITTER, em inglês.\nA terceira repete a primeira.\n\nReconstrua a placa.",
    },
    hint: {
      en: "Keep HOME at both ends. Put the taste word between them.",
      pt: "Mantenha HOME nas duas pontas. Coloque a palavra de sabor no meio.",
    },
    reward: {
      en: "The final door was open all along. Welcome home.",
      pt: "A última porta sempre esteve aberta. Bem-vindo a casa.",
    },
  },
] as const;
