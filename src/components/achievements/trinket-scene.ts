import * as THREE from "three";
import { makeTrinket } from "./trinket-models";
import { disposeMediaScene } from "../media/media-objects";
import type { Achievement } from "@/data/achievements";

type Trinket = {
  id: string;
  mesh: THREE.Group;
  anchor: HTMLElement;
  angle: number;
};
export function createTrinketScene({
  canvas,
  panel,
  items,
  anchors,
}: {
  canvas: HTMLCanvasElement;
  panel: HTMLElement;
  items: Achievement[];
  anchors: Map<string, HTMLElement>;
}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0, 0);
  renderer.autoClear = false;
  const scene = new THREE.Scene(),
    flying = new THREE.Scene();
  for (const target of [scene, flying]) {
    target.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xffe9ca, 2.5);
    key.position.set(-300, 500, 800);
    target.add(key);
    const fill = new THREE.DirectionalLight(0xb1c9e7, 1.4);
    fill.position.set(400, 100, 500);
    target.add(fill);
  }
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
  camera.position.z = 1400;
  const bodies: Trinket[] = [];
  for (const item of items) {
    const anchor = anchors.get(item.id);
    if (!anchor) continue;
    const mesh = makeTrinket(item.model);
    mesh.rotation.set(0.08, -0.35, 0);
    scene.add(mesh);
    bodies.push({ id: item.id, mesh, anchor, angle: -0.35 });
  }
  let width = 0,
    height = 0,
    frame = 0,
    disposed = false,
    dirty = true,
    selected: string | null = null;
  let flight: { body: Trinket; start: number; finish: () => void } | null =
    null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const markDirty = () => {
    dirty = true;
  };
  const resize = new ResizeObserver(markDirty);
  resize.observe(panel);
  // Moving the window changes anchor positions without resizing the panel.
  const cabinet = panel.closest(".retro-window");
  const windowPosition = new MutationObserver(markDirty);
  if (cabinet)
    windowPosition.observe(cabinet, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  window.addEventListener("resize", markDirty);
  window.addEventListener("scroll", markDirty, true);
  const theme = new MutationObserver(markDirty);
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const pose = (body: Trinket) => {
    const rect = body.anchor.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - width / 2,
      y: height / 2 - rect.bottom + 14,
      scale: Math.min(1.12, rect.width / 110),
    };
  };
  const render = (now: number) => {
    if (disposed) return;
    if (width !== window.innerWidth || height !== window.innerHeight) {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      dirty = true;
    }
    if (flight || dirty) {
      for (const body of bodies) {
        if (body === flight?.body) continue;
        const target = pose(body);
        body.mesh.position.set(target.x, target.y, 0);
        body.mesh.scale.setScalar(target.scale);
        body.mesh.rotation.y = body.angle;
        body.mesh.rotation.x = body.id === selected ? -0.04 : 0.08;
      }
      if (flight) {
        const { body, start, finish } = flight,
          target = pose(body),
          t = Math.min(1, (now - start) / 1750);
        const travel = THREE.MathUtils.smootherstep(t, 0.18, 0.92),
          arc = Math.sin(travel * Math.PI);
        // A moment in the light, a broad arc, then a soft little landing.
        const startX = width * 0.16,
          startY = height * 0.04;
        body.mesh.position.set(
          THREE.MathUtils.lerp(startX, target.x, travel),
          THREE.MathUtils.lerp(startY, target.y, travel) + arc * 95,
          240 * (1 - travel)
        );
        body.mesh.scale.setScalar(
          THREE.MathUtils.lerp(2.5, target.scale, travel)
        );
        body.mesh.rotation.set(
          0.08 + Math.sin(travel * Math.PI) * 0.4,
          -0.35 + (1 - travel) * Math.PI * 2,
          Math.sin(travel * Math.PI * 2) * 0.14
        );
        if (t === 1) {
          scene.add(body.mesh);
          body.mesh.position.set(target.x, target.y, 0);
          body.mesh.rotation.set(0.08, body.angle, 0);
          flight = null;
          finish();
        }
      }
      renderer.setScissorTest(false);
      renderer.clear();
      const rect = panel.getBoundingClientRect();
      // Keep resting objects inside the scrolling window; the arriving object
      // has its own foreground pass so it can fly over the cabinet edge.
      const scrollport = panel.closest<HTMLElement>(".retro-window-body");
      const port = scrollport?.getBoundingClientRect() ?? rect;
      const left = Math.max(0, rect.left, port.left),
        right = Math.min(width, rect.right, port.right);
      const top = Math.max(0, rect.top, port.top),
        bottom = Math.min(height, rect.bottom, port.bottom);
      if (right > left && bottom > top) {
        renderer.setScissor(left, height - bottom, right - left, bottom - top);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
      }
      renderer.setScissorTest(false);
      renderer.clearDepth();
      if (flight) renderer.render(flying, camera);
      dirty = false;
    }
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);
  return {
    arrive(id: string, finish: () => void) {
      const body = bodies.find(body => body.id === id);
      if (!body) return false;
      if (reduced.matches) {
        finish();
        return true;
      }
      if (flight) {
        scene.add(flight.body.mesh);
        flight.finish();
      }
      flying.add(body.mesh);
      flight = { body, start: performance.now(), finish };
      dirty = true;
      return true;
    },
    select(id: string | null) {
      selected = id;
      dirty = true;
    },
    turn(id: string, angle: number) {
      const body = bodies.find(body => body.id === id);
      if (body) {
        body.angle += angle;
        dirty = true;
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      windowPosition.disconnect();
      theme.disconnect();
      window.removeEventListener("resize", markDirty);
      window.removeEventListener("scroll", markDirty, true);
      disposeMediaScene(scene);
      disposeMediaScene(flying);
      renderer.dispose();
      if (!canvas.isConnected) renderer.forceContextLoss();
    },
  };
}
