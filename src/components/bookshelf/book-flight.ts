import { gsap } from "gsap";

export type BookPose = {
  rect: { top: number; left: number; width: number; height: number };
  rotateX: number;
  rotateY: number;
  thickness: number;
  opacity: number;
  perspectiveOrigin: { x: number; y: number };
};

export type BookFlight = {
  id: number;
  slug: string;
  from: BookPose;
  destination: "shelf" | "review";
};

export function getBookPose(
  slug: string,
  location: "shelf" | "review" | "flight"
): BookPose | null {
  const element = document.getElementById(`book-${location}-${slug}`);
  if (!element || !element.getClientRects().length) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const inner = element.querySelector<HTMLElement>(".book-3d");
  const surface = inner ?? element;
  const styles = getComputedStyle(surface);
  const width = inner ? inner.offsetWidth : rect.width;
  const height = inner ? inner.offsetHeight : rect.height;
  const perspective = getComputedStyle(element).perspectiveOrigin.split(" ");
  const shelf = location === "shelf";
  // Preserve the projection center when moving out of a narrow shelf slot,
  // including the offset of a raised, hovered book.
  const offsetX = inner
    ? inner.offsetLeft + Number(gsap.getProperty(inner, "x"))
    : 0;
  const offsetY = inner
    ? inner.offsetTop + Number(gsap.getProperty(inner, "y"))
    : 0;
  return {
    rect: {
      top: rect.top + offsetY,
      left: rect.left + offsetX,
      width,
      height,
    },
    rotateX: inner ? Number(gsap.getProperty(inner, "rotationX")) : 0,
    rotateY: inner ? Number(gsap.getProperty(inner, "rotationY")) : 0,
    thickness: inner
      ? parseFloat(styles.getPropertyValue("--spine-thickness"))
      : 0,
    // Hidden endpoints still describe the opacity of the book at rest.
    opacity: shelf
      ? Number(getComputedStyle(element).opacity)
      : location === "flight"
        ? Number(getComputedStyle(element).opacity)
        : 1,
    perspectiveOrigin: {
      x: ((parseFloat(perspective[0]) - offsetX) / width) * 100,
      y: ((parseFloat(perspective[1]) - offsetY) / height) * 100,
    },
  };
}
