import type { APIRoute, GetStaticPaths } from "astro";
import { EGGS } from "@/data/easter-eggs";

export const getStaticPaths: GetStaticPaths = () => [
  {
    params: { file: "observatory" },
    props: {
      text: "THE OBSERVATORY / O OBSERVATÓRIO\n\nFour doors: moon, purr, root, seed.\nQuatro portas: moon, purr, root, seed.\n\nVisit /secrets/moon.txt to begin. / Visite /secrets/moon.txt para começar.\nAnswers belong in the website terminal.\nResponda no terminal do site.\n",
    },
  },
  ...EGGS.map(egg => ({
    params: { file: egg.id },
    props: {
      text: `${egg.glyph}\n\n${egg.riddle.en}\n${egg.riddle.pt}\n\nSubmit your answer in the website terminal.\nResponda no terminal do site.\n${egg.next ? `\nNext file / Próximo arquivo: /secrets/${egg.next}.txt` : "\nEnd of trail / Fim da trilha. Other doors / Outras portas: moon, purr, root, seed."}\n`,
    },
  })),
];
export const GET: APIRoute = ({ props }) =>
  new Response(props.text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
