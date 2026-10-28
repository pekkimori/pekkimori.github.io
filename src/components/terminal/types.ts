export type TerminalPost = {
  title: string;
  description: string;
  href: string;
  date: string;
  featured: boolean;
  commentDiscussion?: number;
  translations?: { lang: string; href: string }[];
  earlierVersions?: {
    title: string;
    href: string;
    commentDiscussion?: number;
  }[];
  tags: { slug: string; name: string }[];
};
export type PostsView = "posts" | "tags" | "search";
