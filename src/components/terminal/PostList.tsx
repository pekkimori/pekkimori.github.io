import type { TerminalPost } from "./types";

export default function PostList({
  posts,
  lang,
}: {
  posts: TerminalPost[];
  lang: "en" | "pt";
}) {
  const formatter = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  return (
    <ul className="terminal-post-list">
      {posts.map(post => (
        <li key={post.href}>
          <a href={post.href}>
            <h3>{post.title}</h3>
          </a>
          <time dateTime={post.date}>
            {formatter.format(new Date(post.date))}
          </time>
          <p>{post.description}</p>
        </li>
      ))}
    </ul>
  );
}
