// src/assets/scripts/lenisSmoothScroll.js
import "@/styles/lenis.css";
import Lenis from "lenis";

// Store the lenis instance globally to manage it properly
let lenis;
let rafId;

function initLenis() {
  // Destroy existing instance if it exists
  if (lenis) {
    lenis.destroy();
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  // Create new instance
  lenis = new Lenis();

  function raf(time) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
}

// Initialize on first load
initLenis();

// Reinitialize on page transitions
document.addEventListener("astro:after-swap", () => {
  initLenis();
});
