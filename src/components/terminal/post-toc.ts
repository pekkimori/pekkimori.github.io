// Register from the reader bundle so fetched posts get the same behaviour as
// server-rendered posts. All headings and scroll listeners belong to one tab.
export function registerPostToc() {
  if (typeof window === "undefined" || customElements.get("post-toc")) return;
  let nextId = 0;

  class PostToc extends HTMLElement {
    private dock: HTMLElement | null = null;
    private cleanup: (() => void) | undefined;

    connectedCallback() {
      this.cleanup?.();
      this.cleanup = undefined;
      // The reader signals after its React commit. Astro's island can remove
      // its SSR flag before React's deferred hydration has actually completed.
      const reader = this.closest<HTMLElement>(".terminal-post-reader");
      if (!reader) return;
      if (reader.dataset.tocReady !== "true") {
        const hydration = new MutationObserver(() => {
          if (reader.dataset.tocReady === "true") {
            hydration.disconnect();
            this.connectedCallback();
          }
        });
        hydration.observe(reader, {
          attributes: true,
          attributeFilter: ["data-toc-ready"],
        });
        this.cleanup = () => hydration.disconnect();
        return;
      }
      const root = this.closest<HTMLElement>("[data-terminal-article]");
      const article = root?.querySelector<HTMLElement>("article");
      const scrollport = this.closest<HTMLElement>(".retro-window-body");
      const postWindow = this.closest<HTMLElement>(".retro-window");
      if (!article || !scrollport || !postWindow) return;
      this.dock ??= this.querySelector<HTMLElement>("[data-toc-dock]");
      const dock = this.dock;
      const button =
        dock?.querySelector<HTMLButtonElement>("[data-toc-toggle]");
      const popup = dock?.querySelector<HTMLElement>("[data-toc-popup]");
      if (!dock || !button || !popup) return;
      popup.hidden = true;
      button.setAttribute("aria-expanded", "false");
      // Keep the floating controls outside the article's scrolling area and
      // inside their own terminal window, including when that window restores.
      postWindow.append(dock);
      popup.id = `post-toc-popup-${++nextId}`;
      button.setAttribute("aria-controls", popup.id);
      const headings = [
        ...article.querySelectorAll<HTMLElement>(
          "h2[id], h3[id], h4[id], h5[id], h6[id]"
        ),
      ];
      const navs = [
        this.querySelector<HTMLElement>(".post-toc-desktop")!,
        popup,
      ];
      const links = navs.flatMap(nav => [
        ...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
      ]);
      const controller = new AbortController();
      const { signal } = controller;
      let frame = 0;
      let open = false;
      let disposed = false;

      const setOpen = (value: boolean, restoreFocus = false) => {
        open = value;
        popup.hidden = !value;
        button.setAttribute("aria-expanded", String(value));
        if (value)
          popup
            .querySelector<HTMLAnchorElement>('a[aria-current="location"], a')
            ?.focus({ preventScroll: true });
        else if (restoreFocus) button.focus({ preventScroll: true });
      };
      const expand = (link: HTMLAnchorElement, value: boolean) => {
        const children = link
          .closest("li")
          ?.querySelector<HTMLElement>(":scope > .toc-children");
        if (!children) return;
        children.classList.toggle("expanded", value);
        link.querySelector(".toc-chevron")?.classList.toggle("rotated", value);
        link.setAttribute("aria-expanded", String(value));
      };
      const update = () => {
        frame = 0;
        if (
          disposed ||
          postWindow.hidden ||
          !postWindow.classList.contains("is-active")
        )
          return;
        const bounds = scrollport.getBoundingClientRect();
        const top = scrollport.scrollTop;
        const bottom = top + scrollport.clientHeight;
        const positions = headings.map(
          heading => heading.getBoundingClientRect().top - bounds.top + top
        );
        const articleEnd =
          article.getBoundingClientRect().bottom - bounds.top + top;
        const states = new Map(
          headings.map((heading, index) => {
            const start = positions[index];
            const end = positions[index + 1] ?? articleEnd;
            return [
              heading.id,
              {
                visible: start < bottom && end > top,
                progress: Math.max(
                  0,
                  Math.min(1, (bottom - start) / Math.max(1, end - start))
                ),
              },
            ];
          })
        );
        this.style.setProperty(
          "--toc-height",
          `${Math.max(100, scrollport.clientHeight - 32)}px`
        );
        dock.style.setProperty(
          "--toc-height",
          `${Math.max(100, scrollport.clientHeight - 96)}px`
        );
        for (const nav of navs) {
          const navLinks = [
            ...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
          ];
          navLinks.forEach((link, index) => {
            const state = states.get(decodeURIComponent(link.hash.slice(1)));
            if (!state) return;
            const bar = link.previousElementSibling as HTMLElement | null;
            link.classList.toggle("highlight", state.visible);
            link.classList.toggle("highlight-bg-translucent", state.visible);
            const previous = states.get(
              decodeURIComponent(navLinks[index - 1]?.hash.slice(1) ?? "")
            );
            const next = states.get(
              decodeURIComponent(navLinks[index + 1]?.hash.slice(1) ?? "")
            );
            link.classList.toggle(
              "rounded-t-2xl",
              state.visible && !previous?.visible
            );
            link.classList.toggle(
              "rounded-b-2xl",
              state.visible && !next?.visible
            );
            if (state.visible) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
            bar?.classList.toggle(
              "is-read",
              !state.visible && state.progress === 1
            );
            bar?.classList.toggle("highlight-bg", state.visible);
            bar?.style.setProperty("height", `${state.progress * 90}%`);
            if (link.dataset.hasChildren) {
              const descendants = [
                ...(link
                  .closest("li")
                  ?.querySelectorAll<HTMLAnchorElement>(
                    ":scope > .toc-children a"
                  ) ?? []),
              ];
              expand(
                link,
                state.visible ||
                  descendants.some(
                    child =>
                      states.get(decodeURIComponent(child.hash.slice(1)))
                        ?.visible
                  )
              );
            }
          });
        }
        const total = scrollport.scrollHeight - scrollport.clientHeight;
        const visible = total <= 0 || top / total > 0.1;
        dock.classList.toggle("is-visible", visible);
        if (!visible && open) setOpen(false);
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      button.addEventListener(
        "click",
        () => {
          update();
          setOpen(!open);
        },
        { signal }
      );
      links.forEach(link =>
        link.addEventListener(
          "click",
          event => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            const heading = headings.find(
              item => item.id === decodeURIComponent(link.hash.slice(1))
            );
            if (!heading) return;
            event.preventDefault();
            event.stopPropagation();
            if (link.dataset.hasChildren)
              expand(link, link.getAttribute("aria-expanded") !== "true");
            scrollport.scrollTo({
              top:
                heading.getBoundingClientRect().top -
                scrollport.getBoundingClientRect().top +
                scrollport.scrollTop -
                12,
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            });
            history.replaceState(
              history.state,
              "",
              location.pathname + location.search + link.hash
            );
            if (popup.contains(link)) setOpen(false, true);
            schedule();
          },
          { signal }
        )
      );
      scrollport.addEventListener("scroll", schedule, {
        passive: true,
        signal,
      });
      document.addEventListener(
        "pointerdown",
        event => {
          if (open && !dock.contains(event.target as Node)) setOpen(false);
        },
        { signal }
      );
      document.addEventListener(
        "keydown",
        event => {
          if (open && event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false, true);
          }
        },
        { capture: true, signal }
      );
      const resize = new ResizeObserver(schedule);
      resize.observe(scrollport);
      resize.observe(article);
      const visibility = new MutationObserver(() => {
        if (!postWindow.classList.contains("is-active")) setOpen(false);
        schedule();
      });
      visibility.observe(postWindow, {
        attributes: true,
        attributeFilter: ["class", "hidden"],
      });
      schedule();
      this.cleanup = () => {
        disposed = true;
        controller.abort();
        resize.disconnect();
        visibility.disconnect();
        cancelAnimationFrame(frame);
        dock.remove();
      };
    }

    disconnectedCallback() {
      this.cleanup?.();
      this.cleanup = undefined;
    }
  }

  customElements.define("post-toc", PostToc);
}
