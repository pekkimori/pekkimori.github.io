import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

type Post = CollectionEntry<"blog">;

export function getPostVersions(post: Post, posts: Post[]) {
  const current = post.data.versionOf
    ? posts.find(candidate => candidate.id === post.data.versionOf)
    : post;

  if (
    !current ||
    current.data.versionOf ||
    current.data.language !== post.data.language
  ) {
    throw new Error(`Invalid versionOf for blog post "${post.id}"`);
  }

  const published = (candidate: Post) =>
    !candidate.data.draft &&
    (import.meta.env.DEV ||
      Date.now() >
        candidate.data.pubDatetime.getTime() - SITE.scheduledPostMargin);

  if (post.data.versionOf && !published(current)) {
    throw new Error(`Current version of "${post.id}" must be published`);
  }

  const earlier = posts
    .filter(
      candidate =>
        candidate.data.versionOf === current.id && published(candidate)
    )
    .sort(
      (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
    );

  if (
    earlier.some(candidate => candidate.data.language !== current.data.language)
  ) {
    throw new Error(`Versions of "${current.id}" must use the same language`);
  }

  return { current, versions: [current, ...earlier] };
}
