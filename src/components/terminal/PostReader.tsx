import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { registerPostToc } from "./post-toc";
import "./post-toc.css";
import type { TerminalPost } from "./types";

const Comments = lazy(() => import("../Comments"));
const articles = new Map<string, string>();
// Keep the static article DOM intact when window focus or other tabs change.
const ArticleHtml = memo(function ArticleHtml({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});

export default function PostReader({
  post,
  initialContent,
  active,
  lang,
}: {
  post: TerminalPost;
  initialContent?: ReactNode;
  active: boolean;
  lang: "en" | "pt";
}) {
  const [html, setHtml] = useState(articles.get(post.href) ?? "");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mounted, setMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setMounted(true);
    registerPostToc();
  }, []);
  useEffect(() => {
    if (initialContent || articles.has(post.href)) return;
    const controller = new AbortController();
    setError(false);
    void fetch(post.href, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Article unavailable");
        const document = new DOMParser().parseFromString(
          await response.text(),
          "text/html"
        );
        const article = document.querySelector("[data-terminal-article]");
        if (!article) throw new Error("Article content missing");
        if (controller.signal.aborted) return;
        articles.set(post.href, article.outerHTML);
        setHtml(article.outerHTML);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [post.href, initialContent, attempt]);
  useEffect(() => {
    if (!active) return;
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id)
        root.current
          ?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`)
          ?.scrollIntoView({ block: "start" });
    };
    const timer = requestAnimationFrame(scrollToHash);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [active, html, initialContent]);
  return (
    <div
      className="terminal-post-reader"
      ref={root}
      data-post-path={post.href}
      data-toc-ready={mounted || undefined}
      onClick={event => {
        const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
          "a[href]"
        );
        if (
          !anchor ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const url = new URL(anchor.href);
        if (
          url.origin === window.location.origin &&
          url.pathname.replace(/\/$/, "") === post.href.replace(/\/$/, "") &&
          url.hash
        ) {
          event.preventDefault();
          event.stopPropagation();
          const id = decodeURIComponent(url.hash.slice(1));
          root.current
            ?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`)
            ?.scrollIntoView({
              block: "start",
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
          history.replaceState(history.state, "", post.href + url.hash);
        }
      }}
    >
      {initialContent ||
        (html ? (
          <ArticleHtml html={html} />
        ) : error ? (
          <div role="alert">
            <p>
              {lang === "pt"
                ? "Não foi possível carregar o artigo."
                : "The article could not load."}
            </p>
            <button
              className="retro-button"
              onClick={() => setAttempt(n => n + 1)}
            >
              {lang === "pt" ? "Tentar novamente" : "Try again"}
            </button>
          </div>
        ) : (
          <p role="status">
            {lang === "pt" ? "Carregando artigo…" : "Loading article…"}
          </p>
        ))}
      {(initialContent || html) && mounted && (
        <div className="terminal-article-comments" data-pagefind-ignore>
          <h2>{lang === "pt" ? "Comentários" : "Comments"}</h2>
          <Suspense fallback={null}>
            <Comments
              id={`comments-${post.href.replace(/[^a-z0-9]/gi, "-")}`}
              discussionNumber={post.commentDiscussion}
              discussionPath={`${post.href.replace(/^\//, "")}/`}
            />
          </Suspense>
          {post.earlierVersions?.map(version => (
            <details key={version.href}>
              <summary>
                {lang === "pt"
                  ? "Comentários de uma versão anterior"
                  : "Comments from an earlier version"}
                : {version.title}
              </summary>
              <a className="retro-link" href={version.href}>
                {lang === "pt" ? "Leia esta versão" : "Read this version"} →
              </a>
              <Suspense fallback={null}>
                <Comments
                  id={`comments-${version.href.replace(/[^a-z0-9]/gi, "-")}`}
                  discussionNumber={version.commentDiscussion}
                  discussionPath={`${version.href.replace(/^\//, "")}/`}
                />
              </Suspense>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
