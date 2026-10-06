# Post versions

Keep the current post as a regular blog entry. Preserve an older version at its
original filename and URL, and add these frontmatter fields:

```yaml
versionOf: en/magnum-opus
versionLabel: Original preface and premises
commentDiscussion: 5
```

`versionOf` is the collection ID of the current post (language directory plus
filename, without its extension). All earlier versions point directly to that
current post and use the same language. `versionLabel` is optional.

`commentDiscussion` is an optional GitHub discussion number. Set it to pin the
original conversation even if a title or URL changes. Without it, the older
comments section searches using the version’s original URL path. The current
page continues using its existing pathname mapping unless a discussion number
is supplied.

Version links appear above the text. Earlier versions remain readable at their
original URLs but are excluded from home pages, post lists, tags, RSS, and search.
Their comments also appear in separate expandable sections on the current post.
No discussions or comments are moved, copied, or deleted.

The Portuguese Preface and Premises remains a standalone post because there is
no Portuguese Magnum Opus yet. When one exists, link the Portuguese version to
its own current post rather than the English one.

The English Preface and Premises is currently saved as a draft, and its old URL
redirects to Magnum Opus. Magnum Opus uses `commentDiscussion: 5` to display the
original conversation as its main comments section. Keep that GitHub discussion
intact; no comment needs to be copied or recreated.
