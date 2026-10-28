import { useEffect, useRef, useState } from "react";
import "@pagefind/default-ui/css/ui.css";
import PostList from "./PostList";
import type { PostsView, TerminalPost } from "./types";

function Search({
  lang,
  onQuery,
}: {
  lang: "en" | "pt";
  onQuery: (query: string) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let search:
      | { destroy: () => void; triggerSearch: (term: string) => void }
      | undefined;
    const init = async () => {
      try {
        // @ts-expect-error Pagefind's UI package has no TypeScript declaration.
        const { PagefindUI } = await import("@pagefind/default-ui");
        if (cancelled || !element.current) return;
        search = new PagefindUI({
          element: element.current,
          showSubResults: true,
          showImages: false,
          bundlePath: "/pagefind/",
          translations:
            lang === "pt"
              ? {
                  placeholder: "Buscar artigos",
                  zero_results: "Nenhum resultado para [SEARCH_TERM]",
                  search_label: "Buscar artigos",
                  clear_search: "Limpar",
                }
              : {},
          processTerm: (term: string) => {
            onQuery(term);
            const url = new URL(window.location.href);
            if (term) url.searchParams.set("q", term);
            else url.searchParams.delete("q");
            history.replaceState(history.state, "", url);
            sessionStorage.setItem("backUrl", url.pathname + url.search);
            return term;
          },
        });
        const query = new URLSearchParams(window.location.search).get("q");
        if (query) search?.triggerSearch(query);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    const restoreQuery = () => {
      if (window.location.pathname.replace(/\/$/, "").endsWith("/search"))
        search?.triggerSearch(
          new URLSearchParams(window.location.search).get("q") ?? ""
        );
    };
    window.addEventListener("popstate", restoreQuery);
    void init();
    return () => {
      window.removeEventListener("popstate", restoreQuery);
      cancelled = true;
      search?.destroy();
    };
  }, [lang, onQuery]);
  return (
    <>
      <p>
        {lang === "pt"
          ? "Busque no texto completo dos artigos."
          : "Search the full text of every article."}
      </p>
      <div ref={element} className="terminal-search" />
      {error && (
        <p role="alert">
          {lang === "pt"
            ? "A busca não carregou. Recarregue a página para tentar novamente."
            : "Search could not load. Reload the page to try again."}
        </p>
      )}
    </>
  );
}

export default function PostsPanel({
  lang,
  posts,
  view,
  tag,
  navigate,
  onQuery,
}: {
  lang: "en" | "pt";
  posts: TerminalPost[];
  view: PostsView;
  tag: string;
  navigate: (view: PostsView, tag?: string) => void;
  onQuery: (query: string) => void;
}) {
  const pt = lang === "pt";
  const tags = [
    ...new Map(posts.flatMap(post => post.tags).map(t => [t.slug, t])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, lang));
  const filtered = tag
    ? posts.filter(post => post.tags.some(t => t.slug === tag))
    : posts;
  const years = [...new Set(filtered.map(p => p.date.slice(0, 4)))];
  return (
    <div className="terminal-posts">
      <nav
        className="terminal-subnav"
        aria-label={pt ? "Navegar nas publicações" : "Browse posts"}
      >
        {(
          [
            ["posts", pt ? "Publicações" : "Posts"],
            ["tags", pt ? "Marcadores" : "Tags"],
            ["search", pt ? "Buscar" : "Search"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => navigate(id)}
          >
            {label}
          </button>
        ))}
        <a href="/rss.xml" aria-label="RSS feed">
          RSS ↗
        </a>
      </nav>
      {view === "search" ? (
        <Search lang={lang} onQuery={onQuery} />
      ) : (
        <>
          {view === "tags" && (
            <div className="terminal-tag-list">
              <button aria-pressed={!tag} onClick={() => navigate("tags")}>
                {pt ? "Todos" : "All"} ({posts.length})
              </button>
              {tags.map(t => (
                <button
                  key={t.slug}
                  aria-pressed={tag === t.slug}
                  onClick={() => navigate("tags", t.slug)}
                >
                  {t.name} (
                  {
                    posts.filter(p => p.tags.some(item => item.slug === t.slug))
                      .length
                  }
                  )
                </button>
              ))}
            </div>
          )}
          {tag && <h3>{tags.find(t => t.slug === tag)?.name ?? tag}</h3>}
          {years.map(year => (
            <div key={year} className="terminal-post-year">
              <h3>
                {year}{" "}
                <small>
                  ({filtered.filter(p => p.date.startsWith(year)).length})
                </small>
              </h3>
              <PostList
                posts={filtered.filter(p => p.date.startsWith(year))}
                lang={lang}
              />
            </div>
          ))}
          {!filtered.length && (
            <p>
              {pt ? "Nenhuma publicação por aqui ainda." : "No posts here yet."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
