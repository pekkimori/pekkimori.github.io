import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` (or `/pt/posts`) in return value
 * @param language - optional language code; "pt" posts are served under /pt/posts
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true,
  language?: string
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .filter(path => !["en", "pt", "ja"].includes(path)) // language dirs are already reflected in basePath
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  const basePath = includeBase
    ? language === "pt"
      ? "/pt/posts"
      : language === "en"
        ? "/en/posts"
        : language === "ja"
          ? "/ja/posts"
          : "/posts"
    : "";

  // Making sure `id` does not contain the directory
  const blogId = id.split("/");
  const slug = blogId.length > 0 ? blogId.slice(-1) : blogId;

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    return [basePath, slug].join("/");
  }

  return [basePath, ...pathSegments, slug].join("/");
}
