import type { APIRoute } from "astro";

// A breadcrumb, not a public catalogue of puzzles or their solutions.
export const GET: APIRoute = () =>
  new Response(
    `THE OBSERVATORY / O OBSERVATÓRIO

An old receiver is still listening.
In the website terminal: cat ~/atlas/.signal
Read the note before replying. The receiver reveals one message at a time.

Um receptor antigo ainda está ouvindo.
No terminal do site: cat ~/atlas/.signal
Leia a nota antes de responder. O receptor revela uma mensagem de cada vez.
`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    }
  );
