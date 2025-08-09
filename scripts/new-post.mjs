import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper function to create a slug from a string
const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const main = () => {
  const args = process.argv.slice(2);
  const title = args[0];
  const description = args[1];

  if (!title) {
    process.stderr.write("Error: Post title is required.\n");
    process.stdout.write(
      "Usage: pnpm new-post \"<title>\" \"<description>\"\n"
    );
    process.exit(1);
  }

  if (!description) {
    process.stderr.write("Error: Post description is required.\n");
    process.stdout.write(
      "Usage: pnpm new-post \"<title>\" \"<description>\"\n"
    );
    process.exit(1);
  }

  const slug = slugify(title);
  const pubDatetime = new Date().toISOString();

  // --- Frontmatter definition ---
  const frontmatter = `---
author: Rafael Mori
pubDatetime: ${pubDatetime}
title: ${title}
slug: ${slug}
featured: false
draft: false
tags:
  - others
description: ${description}
---

## Table of contents
`;

  // Resolve __dirname for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Path to the blog directory
  const blogDir = path.resolve(__dirname, "../src/data/blog");

  // Create blog directory if it doesn't exist
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  const filePath = path.join(blogDir, `${slug}.mdx`);

  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    process.stderr.write(
      `Error: Blog post with slug "${slug}" already exists at ${filePath}\n`
    );
    process.exit(1);
  }

  // Write the new blog post file
  fs.writeFileSync(filePath, frontmatter);

  process.stdout.write(
    `Successfully created new blog post at: ${filePath}\n`
  );
};

main();
