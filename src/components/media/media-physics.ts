import * as THREE from "three";
import { makeMediaObject, disposeMediaScene } from "./media-objects";
import type { MediaKind, PhysicalMedia } from "./media-catalog";
import type { MachinePhase } from "./useMediaMachine";

export type PhysicsState = {
  selected: number | null;
  phase: MachinePhase;
  insert: (index: number) => void;
  choose: (index: number) => void;
};
type Body = {
  item: PhysicalMedia;
  mesh: THREE.Group;
  button: HTMLButtonElement;
  anchor: HTMLElement;
  w: number;
  h: number;
  d: number;
  scale: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  rz: number;
  spin: number;
  mode: "shelf" | "free" | "held" | "docking" | "hidden" | "returning";
  time: number;
  startX: number;
  startY: number;
  startScale: number;
  startRX: number;
  startRY: number;
  startRZ: number;
};
type Grab = {
  body: Body;
  pointer: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  rotate: boolean;
  moved: boolean;
};
const clamp = THREE.MathUtils.clamp;
export function createMediaPhysics({
  canvas,
  onReady,
  anchors,
  buttons,
  items,
  kind,
  dock,
  state,
}: {
  canvas: HTMLCanvasElement;
  onReady: () => void;
  anchors: HTMLElement[];
  buttons: HTMLButtonElement[];
  items: PhysicalMedia[];
  kind: MediaKind;
  dock: () => HTMLElement | null;
  state: () => PhysicsState;
}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  // One rendered pixel spans two CSS pixels, including on Retina displays.
  renderer.setPixelRatio(0.5);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  camera.position.z = 1400;
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-300, 600, 900);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdd6f4, 1.2);
  rim.position.set(450, -100, 450);
  scene.add(rim);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Cartridges enter by their contact edge; tapes and discs feed face-down.
  const insertionTilt = kind === "games" ? Math.PI / 2 : -Math.PI / 2;
  let width = 0,
    height = 0,
    frame = 0,
    last = 0,
    grab: Grab | null = null,
    disposed = false,
    lastPhase = state().phase,
    lastSelected = state().selected;
  const listeners: (() => void)[] = [];
  let dirty = true;
  let revealed = false;
  let previousClip = "";
  const bodies: Body[] = items.map((item, i) => {
    const { group, dimensions } = makeMediaObject(kind, item, undefined, () => {
      dirty = true;
    });
    scene.add(group);
    return {
      item,
      mesh: group,
      button: buttons[i],
      anchor: anchors[i],
      w: dimensions.w,
      h: dimensions.h,
      d: dimensions.d,
      scale: 1,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rx: -0.12,
      ry: -0.32,
      rz: ((i % 3) - 1) * 0.08,
      spin: 0,
      mode: "shelf",
      time: 0,
      startX: 0,
      startY: 0,
      startScale: 1,
      startRX: 0,
      startRY: 0,
      startRZ: 0,
    };
  });
  const themeObserver = new MutationObserver(() => {
    for (const body of bodies) {
      scene.remove(body.mesh);
      disposeMediaScene(body.mesh);
      body.mesh = makeMediaObject(kind, body.item, undefined, () => {
        dirty = true;
      }).group;
      scene.add(body.mesh);
    }
    dirty = true;
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "style"],
  });
  const size = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.near = 0.1;
    camera.far = 3000;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  size();
  window.addEventListener("resize", size);
  const nearDock = (x: number, y: number, body: Body) => {
    const rect = dock()?.getBoundingClientRect();
    return (
      !!rect &&
      x > rect.left - 24 &&
      x < rect.right + 24 &&
      y > rect.top - 35 - body.h * body.scale * 0.2 &&
      y < rect.bottom + 35
    );
  };
  const highlight = (over: boolean) => {
    const el = dock();
    if (el) el.dataset.over = String(over);
  };
  const animateDock = (body: Body) => {
    body.mode = "docking";
    body.time = performance.now();
    body.startX = body.x;
    body.startY = body.y;
    body.startScale = body.scale;
    body.startRX = body.rx;
    body.startRY = body.ry;
    body.startRZ = body.rz;
    body.vx = body.vy = 0;
    highlight(false);
    dirty = true;
  };
  const attach = (body: Body) => {
    if (state().phase === "inserting") return;
    animateDock(body);
    state().insert(body.item.index);
  };
  const release = (cancelled = false) => {
    if (!grab) return;
    const g = grab;
    grab = null;
    g.body.button.classList.remove("is-held");
    if (
      !cancelled &&
      !g.rotate &&
      g.moved &&
      nearDock(g.body.x, g.body.y, g.body)
    )
      attach(g.body);
    else {
      g.body.mode = "free";
      if (cancelled || !g.moved) g.body.vx = g.body.vy = 0;
      if (!cancelled && !g.moved) state().choose(g.body.item.index);
    }
    highlight(false);
    dirty = true;
  };
  for (const body of bodies) {
    const button = body.button;
    let suppressClick = false;
    const down = (event: PointerEvent) => {
      if (
        (event.button !== 0 && event.button !== 2) ||
        grab ||
        body.mode === "docking" ||
        body.mode === "hidden"
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      button.focus({ preventScroll: true });
      button.setPointerCapture(event.pointerId);
      body.mode = "held";
      body.vx = body.vy = 0;
      button.classList.add("is-held");
      grab = {
        body,
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        ox: body.x - event.clientX,
        oy: body.y - event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: performance.now(),
        rotate: event.shiftKey || event.button === 2,
        moved: false,
      };
      dirty = true;
    };
    const move = (event: PointerEvent) => {
      if (!grab || grab.pointer !== event.pointerId) return;
      const g = grab,
        now = performance.now(),
        dt = Math.max(8, now - g.lastTime) / 1000;
      g.moved ||=
        Math.hypot(event.clientX - g.startX, event.clientY - g.startY) > 5;
      if (g.rotate) {
        body.ry += (event.clientX - g.lastX) * 0.012;
        body.rx += (event.clientY - g.lastY) * 0.012;
        body.spin = (event.clientX - g.lastX) * 0.012;
      } else {
        g.x = event.clientX;
        g.y = event.clientY;
        body.vx = clamp((event.clientX - g.lastX) / dt, -1600, 1600);
        body.vy = clamp((event.clientY - g.lastY) / dt, -1600, 1600);
        highlight(nearDock(event.clientX + g.ox, event.clientY + g.oy, body));
      }
      g.lastX = event.clientX;
      g.lastY = event.clientY;
      g.lastTime = now;
      dirty = true;
    };
    const up = (event: PointerEvent) => {
      if (grab?.pointer !== event.pointerId) return;
      // Use the actual release point, even when the spring is still catching up.
      if (!grab.rotate) {
        body.x = event.clientX + grab.ox;
        body.y = event.clientY + grab.oy;
      }
      suppressClick = true;
      release(event.type !== "pointerup");
      if (button.hasPointerCapture(event.pointerId))
        button.releasePointerCapture(event.pointerId);
    };
    const click = (event: MouseEvent) => {
      if (suppressClick && event.detail > 0) {
        suppressClick = false;
        event.preventDefault();
        return;
      }
      suppressClick = false;
      state().choose(body.item.index);
    };
    const keys = (event: KeyboardEvent) => {
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "r",
          "R",
          "Escape",
        ].includes(event.key)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      dirty = true;
      if (event.key === "Escape") {
        body.mode = "shelf";
        body.vx = body.vy = 0;
        body.rx = -0.12;
        body.ry = -0.32;
        return;
      }
      if (event.key.toLowerCase() === "r") {
        body.ry += Math.PI / 4;
        return;
      }
      body.mode = "free";
      body.vx = body.vy = 0;
      if (event.shiftKey) {
        body.ry +=
          event.key === "ArrowLeft"
            ? -0.25
            : event.key === "ArrowRight"
              ? 0.25
              : 0;
        body.rx +=
          event.key === "ArrowUp"
            ? -0.25
            : event.key === "ArrowDown"
              ? 0.25
              : 0;
      } else {
        body.x +=
          event.key === "ArrowLeft" ? -24 : event.key === "ArrowRight" ? 24 : 0;
        body.y +=
          event.key === "ArrowUp" ? -24 : event.key === "ArrowDown" ? 24 : 0;
      }
    };
    const menu = (event: Event) => event.preventDefault();
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
    button.addEventListener("lostpointercapture", up);
    button.addEventListener("click", click);
    button.addEventListener("keydown", keys);
    button.addEventListener("contextmenu", menu);
    listeners.push(() => {
      button.removeEventListener("pointerdown", down);
      button.removeEventListener("pointermove", move);
      button.removeEventListener("pointerup", up);
      button.removeEventListener("pointercancel", up);
      button.removeEventListener("lostpointercapture", up);
      button.removeEventListener("click", click);
      button.removeEventListener("keydown", keys);
      button.removeEventListener("contextmenu", menu);
    });
  }
  const reset = () => {
    release(true);
    for (const body of bodies) {
      body.mode = "shelf";
      body.vx = body.vy = body.spin = 0;
      body.rx = -0.12;
      body.ry = -0.32;
      body.rz = ((body.item.index % 3) - 1) * 0.08;
    }
    dirty = true;
  };
  const blur = () => release(true);
  window.addEventListener("blur", blur);
  function tick(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - (last || now)) / 1000, 0.025);
    last = now;
    if (document.hidden) return;
    // Resting objects belong to their scrollable page, even though dragging
    // uses a viewport canvas so an object can reach the floating slot.
    const page = anchors[0]?.closest<HTMLElement>(".retro-window-body");
    const pageBounds = page?.getBoundingClientRect();
    const resizeInset = page?.parentElement
      ?.querySelector(".retro-window-resize")
      ?.getClientRects().length
      ? 6
      : 0;
    const clip = {
      left: Math.max(
        0,
        (pageBounds?.left ?? 0) + (page?.clientLeft ?? 0) + resizeInset
      ),
      top: Math.max(0, (pageBounds?.top ?? 0) + (page?.clientTop ?? 0)),
      right: Math.min(
        width,
        pageBounds
          ? pageBounds.left + page!.clientLeft + page!.clientWidth - resizeInset
          : width
      ),
      bottom: Math.min(
        height,
        pageBounds
          ? pageBounds.top + page!.clientTop + page!.clientHeight - resizeInset
          : height
      ),
    };
    const clipKey = Object.values(clip).join();
    if (clipKey !== previousClip) dirty = true;
    previousClip = clipKey;
    const current = state();
    const slot = dock();
    const fittingBody =
      grab?.body ??
      bodies.find(body => body.item.index === current.selected) ??
      bodies[0];
    if (slot && fittingBody) {
      const anchor = fittingBody.anchor.getBoundingClientRect();
      const scale = Math.min(
        kind === "music" ? 1.15 : 1.2,
        (anchor.width - 14) / fittingBody.w,
        (anchor.height - 12) / fittingBody.h
      );
      slot.style.setProperty(
        "--slot-fit-width",
        `${fittingBody.w * scale + 12}px`
      );
      slot.style.setProperty(
        "--slot-fit-height",
        `${fittingBody.d * scale + (kind === "music" ? 2 : 6)}px`
      );
    }
    const rect = slot?.getBoundingClientRect();
    const floor = height - 20;
    if (
      lastSelected !== null &&
      (current.selected !== lastSelected || current.phase === "empty") &&
      (lastPhase === "loaded" || lastPhase === "inserting")
    ) {
      const body = bodies.find(b => b.item.index === lastSelected);
      if (body) {
        body.mode = "returning";
        body.x = rect ? rect.left + rect.width / 2 : width / 2;
        body.y = rect ? rect.top + rect.height / 2 : height - 40;
        body.scale = rect ? (rect.width - 12) / body.w : 1;
        body.vx = body.vy = body.spin = 0;
        body.rx = insertionTilt;
        body.ry = body.rz = 0;
        body.time = now;
        body.startX = body.x;
        body.startY = body.y;
        body.startScale = body.scale;
        dirty = true;
      }
    }
    lastSelected = current.selected;
    lastPhase = current.phase;
    for (const body of bodies) {
      if (
        current.phase === "inserting" &&
        current.selected === body.item.index &&
        body.mode !== "docking"
      )
        animateDock(body);
      const before = [
        body.x,
        body.y,
        body.rx,
        body.ry,
        body.rz,
        body.scale,
        body.mesh.visible,
      ].join();
      const anchor = body.anchor.getBoundingClientRect();
      const baseScale = Math.min(
        kind === "music" ? 1.15 : 1.2,
        (anchor.width - 14) / body.w,
        (anchor.height - 12) / body.h
      );
      if (body.mode === "shelf") {
        body.scale = baseScale;
        body.x = anchor.left + anchor.width / 2;
        body.y = anchor.top + anchor.height / 2;
        body.mesh.visible =
          anchor.bottom > clip.top &&
          anchor.top < clip.bottom &&
          anchor.right > clip.left &&
          anchor.left < clip.right &&
          anchor.width > 0;
      } else if (body.mode === "held" && grab?.body === body && !grab.rotate) {
        const follow = reduced.matches ? 1 : 1 - Math.exp(-28 * dt);
        body.x += (grab.x + grab.ox - body.x) * follow;
        body.y += (grab.y + grab.oy - body.y) * follow;
        body.scale += (baseScale * 1.08 - body.scale) * follow;
        if (!reduced.matches) {
          body.rx +=
            (-0.15 + clamp(body.vy * 0.00025, -0.6, 0.6) - body.rx) * follow;
          body.ry +=
            (-0.3 + clamp(body.vx * 0.0003, -0.65, 0.65) - body.ry) * follow;
          body.rz += (clamp(body.vx * 0.00008, -0.2, 0.2) - body.rz) * follow;
        }
        body.mesh.visible = true;
      } else if (body.mode === "docking") {
        const t = clamp((now - body.time) / 620, 0, 1),
          ease = 1 - Math.pow(1 - t, 3);
        const tx = rect ? rect.left + rect.width / 2 : width / 2,
          ty = rect ? rect.top + rect.height / 2 : height - 40;
        body.x = THREE.MathUtils.lerp(body.startX, tx, ease);
        body.rx = THREE.MathUtils.lerp(body.startRX, insertionTilt, ease);
        body.ry = THREE.MathUtils.lerp(body.startRY, 0, ease);
        body.rz = THREE.MathUtils.lerp(body.startRZ, 0, ease);
        const fitScale = rect ? (rect.width - 12) / body.w : body.startScale;
        body.scale =
          THREE.MathUtils.lerp(body.startScale, fitScale, ease) *
          (t > 0.82 ? (1 - t) / 0.18 : 1);
        const contactOffset =
          kind === "games" ? (body.h * body.scale * Math.cos(body.rx)) / 2 : 0;
        body.y = THREE.MathUtils.lerp(body.startY, ty - contactOffset, ease);
        body.mesh.visible = t < 1;
      } else if (body.mode === "returning") {
        const t = reduced.matches ? 1 : clamp((now - body.time) / 900, 0, 1);
        const ease = t * t * (3 - 2 * t);
        body.x = THREE.MathUtils.lerp(
          body.startX,
          anchor.left + anchor.width / 2,
          ease
        );
        body.y =
          THREE.MathUtils.lerp(
            body.startY,
            anchor.top + anchor.height / 2,
            ease
          ) -
          Math.sin(Math.PI * t) * 50;
        body.scale = THREE.MathUtils.lerp(body.startScale, baseScale, ease);
        body.rx = THREE.MathUtils.lerp(insertionTilt, -0.12, ease);
        body.ry = THREE.MathUtils.lerp(0, -0.32, ease);
        body.rz = THREE.MathUtils.lerp(
          0,
          ((body.item.index % 3) - 1) * 0.08,
          ease
        );
        body.mesh.visible = true;
        if (t === 1) body.mode = "shelf";
      } else if (body.mode === "free") {
        body.vy += (reduced.matches ? 0 : 1100) * dt;
        body.vx *= Math.exp(-1.4 * dt);
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.rz += body.spin * dt;
        body.spin *= Math.exp(-2 * dt);
        const halfW = body.w * body.scale * 0.48,
          halfH = body.h * body.scale * 0.48;
        if (body.x < halfW + 8) {
          body.x = halfW + 8;
          body.vx = Math.abs(body.vx) * 0.45;
          body.spin += 0.3;
        }
        if (body.x > width - halfW - 8) {
          body.x = width - halfW - 8;
          body.vx = -Math.abs(body.vx) * 0.45;
          body.spin -= 0.3;
        }
        if (body.y < halfH + 55) {
          body.y = halfH + 55;
          body.vy = Math.abs(body.vy) * 0.4;
        }
        if (body.y > floor - halfH) {
          body.y = floor - halfH;
          body.vy =
            Math.abs(body.vy) < 45
              ? 0
              : -Math.abs(body.vy) * (reduced.matches ? 0 : 0.38);
          body.vx *= 0.94;
          body.spin *= 0.8;
          body.rz *= Math.exp(-4 * dt);
          if (Math.abs(body.vx) < 0.25) body.vx = 0;
          if (Math.abs(body.spin) < 0.001) body.spin = 0;
          if (Math.abs(body.rz) < 0.001) body.rz = 0;
        }
        body.mesh.visible = true;
      }
      if (current.selected === body.item.index && current.phase === "loaded") {
        body.mode = "hidden";
        body.mesh.visible = false;
      }
      body.mesh.position.set(
        body.x - width / 2,
        height / 2 - body.y,
        body.mode === "held" ? 65 : 0
      );
      body.mesh.rotation.set(body.rx, body.ry, body.rz);
      body.mesh.scale.setScalar(body.scale);
      body.button.style.width = `${body.w * body.scale}px`;
      body.button.style.height = `${body.h * body.scale}px`;
      body.button.style.transform = `translate3d(${body.x - (body.w * body.scale) / 2}px,${body.y - (body.h * body.scale) / 2}px,0) rotate(${-body.rz}rad)`;
      body.button.style.visibility =
        body.mesh.visible && body.mode !== "docking" ? "visible" : "hidden";
      if (body.mode === "shelf") {
        const cos = Math.cos(-body.rz),
          sin = Math.sin(-body.rz);
        const points = [
          [clip.left, clip.top],
          [clip.right, clip.top],
          [clip.right, clip.bottom],
          [clip.left, clip.bottom],
        ].map(([x, y]) => {
          const dx = x - body.x,
            dy = y - body.y;
          return `${dx * cos + dy * sin + (body.w * body.scale) / 2}px ${dy * cos - dx * sin + (body.h * body.scale) / 2}px`;
        });
        body.button.style.clipPath = `polygon(${points.join(",")})`;
      } else body.button.style.clipPath = "none";
      body.button.setAttribute(
        "aria-pressed",
        String(current.selected === body.item.index)
      );
      body.button.dataset.motion = body.mode;
      if (
        before !==
        [
          body.x,
          body.y,
          body.rx,
          body.ry,
          body.rz,
          body.scale,
          body.mesh.visible,
        ].join()
      )
        dirty = true;
    }
    // Separate tossed objects and exchange momentum on contact.
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i],
          b = bodies[j];
        if (a.mode !== "free" || b.mode !== "free") continue;
        const dx = b.x - a.x,
          dy = b.y - a.y,
          rx = (a.w * a.scale + b.w * b.scale) * 0.43,
          ry = (a.h * a.scale + b.h * b.scale) * 0.43;
        if (Math.abs(dx) < rx && Math.abs(dy) < ry) {
          const overlap = rx - Math.abs(dx),
            sign = dx < 0 ? -1 : 1;
          a.x -= sign * overlap * 0.5;
          b.x += sign * overlap * 0.5;
          const v = a.vx;
          a.vx = b.vx * 0.65 - sign * 15;
          b.vx = v * 0.65 + sign * 15;
          dirty = true;
        }
      }
    if (dirty) {
      const visible = bodies.map(body => body.mesh.visible);
      renderer.autoClear = false;
      renderer.setScissorTest(false);
      renderer.clear();
      if (clip.right > clip.left && clip.bottom > clip.top) {
        bodies.forEach((body, i) => {
          body.mesh.visible = visible[i] && body.mode === "shelf";
        });
        renderer.setScissor(
          clip.left,
          height - clip.bottom,
          clip.right - clip.left,
          clip.bottom - clip.top
        );
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
      }
      bodies.forEach((body, i) => {
        body.mesh.visible = visible[i] && body.mode !== "shelf";
      });
      renderer.setScissorTest(false);
      renderer.clearDepth();
      renderer.render(scene, camera);
      bodies.forEach((body, i) => {
        body.mesh.visible = visible[i];
      });
      dirty = false;
      if (!revealed) {
        revealed = true;
        onReady();
      }
    }
  }
  frame = requestAnimationFrame(tick);
  return {
    reset,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", size);
      window.removeEventListener("blur", blur);
      listeners.forEach(fn => fn());
      themeObserver.disconnect();
      highlight(false);
      disposeMediaScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
