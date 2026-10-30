import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { MediaKind, PhysicalMedia } from "./media-catalog";

const COLORS = ["#f5c2e7", "#89b4fa", "#cba6f7", "#f9e2af", "#94e2d5"];
export function mediaPalette() {
  const style = getComputedStyle(document.documentElement);
  const background = new THREE.Color(
    style.getPropertyValue("--background").trim()
  );
  const foreground = new THREE.Color(
    style.getPropertyValue("--foreground").trim()
  );
  const mix = (amount: number) =>
    background.clone().lerp(foreground, amount).getStyle();
  return {
    shell: mix(0.12),
    raised: mix(0.19),
    recess: background.clone().multiplyScalar(0.5).getStyle(),
    edge: mix(0.36),
    trim: foreground.getStyle(),
    ink: "#303446",
  };
}
function labelCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  line: number
) {
  let row = "";
  for (const word of text.split(" ")) {
    if (ctx.measureText(`${row} ${word}`).width > maxWidth && row) {
      ctx.fillText(row, x, y);
      y += line;
      row = word;
    } else row = row ? `${row} ${word}` : word;
  }
  ctx.fillText(row, x, y);
  return y;
}
function texture(canvas: HTMLCanvasElement) {
  const scale = Math.min(1, 256 / Math.max(canvas.width, canvas.height));
  const reduced = labelCanvas(
    Math.max(1, Math.round(canvas.width * scale)),
    Math.max(1, Math.round(canvas.height * scale))
  );
  reduced.ctx.drawImage(
    canvas,
    0,
    0,
    reduced.canvas.width,
    reduced.canvas.height
  );
  const map = new THREE.CanvasTexture(reduced.canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.generateMipmaps = false;
  return map;
}
const thumbnails = new Map<string, Promise<HTMLImageElement | null>>();
function loadThumbnail(url: string) {
  const cached = thumbnails.get(url);
  if (cached) return cached;
  const loading = new Promise<HTMLImageElement | null>(resolve => {
    const image = new Image();
    // Canvas/WebGL textures need a CORS-enabled image, even for public URLs.
    image.crossOrigin = "anonymous";
    const timeout = window.setTimeout(() => {
      image.onload = null;
      image.onerror = null;
      resolve(null);
    }, 8000);
    image.onload = () => {
      window.clearTimeout(timeout);
      // YouTube can return a small placeholder for an unavailable thumbnail.
      if (image.naturalWidth > 120) resolve(image);
      else {
        resolve(null);
      }
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    image.src = url;
  });
  thumbnails.set(url, loading);
  return loading;
}
/** Settle artwork before the scene's first visible frame, including failures. */
export async function prepareMediaArtwork(items: PhysicalMedia[]) {
  await Promise.all(
    items.map(item => (item.thumbnail ? loadThumbnail(item.thumbnail) : null))
  );
}
function artworkTexture(
  item: PhysicalMedia,
  width: number,
  height: number,
  onLoad?: () => void
) {
  const { canvas, ctx } = labelCanvas(width, height);
  // A quiet paper label remains usable while loading or if artwork is missing.
  ctx.fillStyle = "#ede6cc";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#303446";
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.round(width / 15)}px monospace`;
  wrap(ctx, item.title, width / 2, height * 0.42, width * 0.75, width / 12);
  const map = texture(canvas);
  if (!item.thumbnail) return map;
  let disposed = false;
  map.addEventListener("dispose", () => {
    disposed = true;
  });
  void loadThumbnail(item.thumbnail).then(image => {
    if (!image || disposed) return;
    const target = map.image as HTMLCanvasElement;
    const context = target.getContext("2d")!;
    // Cover the label without stretching; ring geometry clips the disc labels.
    const scale = Math.max(
      target.width / image.naturalWidth,
      target.height / image.naturalHeight
    );
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    context.drawImage(
      image,
      (target.width - w) / 2,
      (target.height - h) / 2,
      w,
      h
    );
    map.needsUpdate = true;
    onLoad?.();
  });
  return map;
}
function box(
  group: THREE.Group,
  w: number,
  h: number,
  d: number,
  color: string,
  x = 0,
  y = 0,
  z = 0,
  radius = 2
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, d / 3)),
    new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.1 })
  );
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}
function face(
  group: THREE.Group,
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  z: number,
  y = 0
) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      map: texture(canvas),
      roughness: 0.85,
      metalness: 0,
    })
  );
  mesh.position.set(0, y, z);
  group.add(mesh);
}
function roundedRectangle(
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: [number, number, number, number]
) {
  const shape = new THREE.Shape();
  shape.moveTo(x + bl, y);
  shape.lineTo(x + w - br, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + br);
  shape.lineTo(x + w, y + h - tr);
  shape.quadraticCurveTo(x + w, y + h, x + w - tr, y + h);
  shape.lineTo(x + tl, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - tl);
  shape.lineTo(x, y + bl);
  shape.quadraticCurveTo(x, y, x + bl, y);
  return shape;
}
function makeVhs(
  group: THREE.Group,
  item: PhysicalMedia,
  onTextureLoad?: () => void
) {
  // Keep the physical black plastic consistent across site themes.
  box(group, 180, 100, 22, "#17191b", 0, 0, 0, 4);
  box(group, 179, 9, 24, "#252729", 0, 45, 0, 1.5);
  box(group, 176, 1.3, 1, "#08090a", 0, 39.5, 11.3, 0.2);

  const grip = labelCanvas(256, 128);
  grip.ctx.fillStyle = "#1d1f21";
  grip.ctx.fillRect(0, 0, 256, 128);
  for (let x = 0; x < 256; x += 3)
    for (let y = 0; y < 128; y += 3) {
      grip.ctx.fillStyle = "#222426";
      grip.ctx.fillRect(x, y, 2, 2);
      grip.ctx.fillStyle = "#26282a";
      grip.ctx.fillRect(x, y, 2, 1);
    }
  const gripMap = texture(grip.canvas);
  gripMap.magFilter = THREE.LinearFilter;
  gripMap.minFilter = THREE.LinearFilter;
  const front = roundedRectangle(-88, -48, 176, 86, [2, 2, 4, 4]);
  const windows = [-1, 1].map(side =>
    roundedRectangle(
      side < 0 ? -85 : 43,
      -28,
      42,
      47,
      side < 0 ? [14, 3, 3, 17] : [3, 14, 17, 3]
    )
  );
  front.holes.push(...windows);
  const panelGeometry = new THREE.ExtrudeGeometry(front, {
    depth: 1,
    bevelEnabled: true,
    bevelSize: 0.35,
    bevelThickness: 0.3,
    bevelSegments: 1,
    curveSegments: 12,
    steps: 1,
  });
  const positions = panelGeometry.getAttribute("position");
  const uv = panelGeometry.getAttribute("uv");
  for (let i = 0; i < uv.count; i++)
    uv.setXY(i, (positions.getX(i) + 88) / 176, (positions.getY(i) + 48) / 86);
  const panel = new THREE.Mesh(panelGeometry, [
    new THREE.MeshStandardMaterial({
      map: gripMap,
      bumpMap: gripMap,
      bumpScale: 0.035,
      roughness: 0.95,
      metalness: 0,
    }),
    new THREE.MeshStandardMaterial({ color: "#343638", roughness: 0.8 }),
  ]);
  panel.position.z = 11.4;
  group.add(panel);

  for (const [i, side] of [-1, 1].entries()) {
    const reel = new THREE.Group();
    reel.position.set(side * 48, -4, 11.6);
    const spool = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({
        color: side < 0 ? "#191719" : "#aaa9a3",
        roughness: 0.55,
      })
    );
    reel.add(spool);
    // Wound tape on the left; the pale take-up spool on the right.
    const rings: number[] = [];
    for (let radius = 11; radius < 30; radius += side < 0 ? 1 : 5)
      for (let step = 0; step < 64; step++) {
        const a = (step / 64) * Math.PI * 2;
        const b = ((step + 1) / 64) * Math.PI * 2;
        rings.push(
          Math.cos(a) * radius,
          Math.sin(a) * radius,
          0.1,
          Math.cos(b) * radius,
          Math.sin(b) * radius,
          0.1
        );
      }
    const ringGeometry = new THREE.BufferGeometry();
    ringGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(rings, 3)
    );
    reel.add(
      new THREE.LineSegments(
        ringGeometry,
        new THREE.LineBasicMaterial({ color: side < 0 ? "#363135" : "#cecdc5" })
      )
    );
    const hub = new THREE.Mesh(
      new THREE.RingGeometry(3.4, 10, 48),
      new THREE.MeshStandardMaterial({ color: "#d3d1c6", roughness: 0.5 })
    );
    hub.position.z = 0.25;
    reel.add(hub);
    for (let spoke = 0; spoke < 6; spoke++) {
      const angle = (spoke * Math.PI) / 3;
      const rib = box(reel, 1.8, 7, 0.4, "#e0ddd3", 0, 0, 0.5, 0.1);
      rib.position.set(Math.sin(angle) * 6.5, Math.cos(angle) * 6.5, 0.5);
      rib.rotation.z = -angle;
    }
    group.add(reel);
    const glass = new THREE.Mesh(
      new THREE.ShapeGeometry(windows[i], 12),
      new THREE.MeshPhysicalMaterial({
        color: "#a3aeb6",
        transparent: true,
        opacity: 0.1,
        roughness: 0.15,
        clearcoat: 0.8,
        depthWrite: false,
      })
    );
    glass.position.z = 12.8;
    group.add(glass);
    for (let tick = 0; tick < 8; tick++)
      box(
        group,
        0.5,
        tick % 2 ? 1.8 : 2.8,
        0.2,
        "#b6b7b0",
        side * 64 - 14 + tick * 4,
        -9,
        12.85,
        0.05
      );
  }

  // The central label has its own molded rim and never overlaps the windows.
  box(group, 81, 49, 1.2, "#08090a", 0, -4, 12.6, 1.5);
  box(group, 78.5, 46.5, 0.8, "#3b3e40", 0, -4, 13.1, 1);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(76, 43),
    new THREE.MeshStandardMaterial({
      map: artworkTexture(item, 512, 288, onTextureLoad),
      roughness: 0.9,
    })
  );
  label.position.set(0, -4, 13.55);
  group.add(label);

  const markings = labelCanvas(1024, 48);
  markings.ctx.fillStyle = "#252729";
  markings.ctx.fillRect(0, 0, 1024, 48);
  markings.ctx.fillStyle = "#111315";
  markings.ctx.font = "bold 25px monospace";
  markings.ctx.fillText(
    "INSERT THIS SIDE     ▲     DO NOT TOUCH THE TAPE",
    100,
    33
  );
  markings.ctx.strokeStyle = "#111315";
  markings.ctx.strokeRect(905, 8, 70, 32);
  markings.ctx.fillText("VHS", 916, 33);
  face(group, markings.canvas, 171, 5, 12.1, 45);

  const rear = new THREE.Group();
  rear.rotation.y = Math.PI;
  rear.position.z = -11.1;
  box(rear, 171, 85, 1, "#202224", 0, -3, 0, 2);
  box(rear, 76, 43, 0.6, "#16181a", 0, -4, 0.7, 1);
  for (const x of [-48, 48]) {
    const socket = new THREE.Mesh(
      new THREE.RingGeometry(4, 11, 32),
      new THREE.MeshStandardMaterial({ color: "#090a0b", roughness: 0.8 })
    );
    socket.position.set(x, -4, 0.8);
    rear.add(socket);
  }
  for (const target of [group, rear])
    for (const [x, y] of [
      [-82, -41],
      [82, -41],
      [0, -33],
    ]) {
      const screw = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 12),
        new THREE.MeshStandardMaterial({
          color: "#101214",
          metalness: 0.3,
          roughness: 0.6,
        })
      );
      screw.position.set(x, y, target === group ? 12.8 : 0.8);
      target.add(screw);
    }
  group.add(rear);
}
export function makeMediaObject(
  kind: MediaKind,
  item: PhysicalMedia,
  palette = mediaPalette(),
  onTextureLoad?: () => void
) {
  const group = new THREE.Group();
  const color = COLORS[item.index % COLORS.length];
  const dimensions =
    kind === "anime"
      ? { w: 180, h: 100, d: 24 }
      : kind === "games"
        ? { w: 112, h: 138, d: 22 }
        : { w: 150, h: 150, d: 2 };
  if (kind === "anime") {
    makeVhs(group, item, onTextureLoad);
  } else if (kind === "games") {
    box(group, 112, 138, 22, palette.shell, 0, 0, 0, 3);
    box(group, 98, 105, 2, palette.recess, 0, 5, 11, 2);
    for (let i = 0; i < 5; i++)
      box(group, 4, 94, 2, palette.edge, -50 + i * 3, 4, 12, 0.5);
    box(group, 76, 13, 5, palette.recess, 0, -64, 0, 0.5);
    for (let i = 0; i < 12; i++)
      box(group, 3.5, 9, 1, "#c9a761", -29 + i * 5.2, -65, 3, 0.2);
    const { canvas, ctx } = labelCanvas(400, 440);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 400, 440);
    ctx.fillStyle = "#efe9d0";
    ctx.font = "16px monospace";
    ctx.fillText(
      `PEKKI / SOFT                       0${item.index + 1}`,
      20,
      35
    );
    ctx.fillStyle = palette.ink;
    ctx.fillRect(20, 58, 360, 230);
    const px = 26;
    ctx.fillStyle = "#cdd6f4";
    if (item.motif === "blocks") {
      for (const [x, y] of [
        [2, 4],
        [3, 4],
        [3, 3],
        [4, 3],
        [5, 3],
        [5, 2],
        [6, 2],
        [6, 4],
        [7, 4],
        [7, 3],
      ])
        ctx.fillRect(32 + x * px, 70 + y * px, px - 3, px - 3);
    } else if (item.motif === "snake") {
      for (const [x, y] of [
        [2, 5],
        [2, 4],
        [2, 3],
        [3, 3],
        [4, 3],
        [5, 3],
        [5, 2],
        [5, 1],
        [6, 1],
      ])
        ctx.fillRect(35 + x * px, 70 + y * px, px - 3, px - 3);
      ctx.fillStyle = "#d4a17c";
      ctx.fillRect(245, 210, 22, 22);
    } else {
      ctx.fillStyle = "#a6adc8";
      for (let x = 0; x < 8; x++)
        for (let y = 0; y < 5; y++)
          ctx.fillRect(42 + x * 39, 81 + y * 39, 34, 34);
      ctx.fillStyle = "#edc2a0";
      ctx.font = "bold 80px monospace";
      ctx.fillText("⚑", 160, 235);
    }
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 34px monospace";
    wrap(ctx, item.title, 20, 337, 360, 36);
    ctx.font = "16px monospace";
    ctx.fillText(item.subtitle, 20, 413);
    face(group, canvas, 81, 95, 12.2, 8);
    for (let i = 0; i < 6; i++)
      box(group, 80, 3, 2, palette.edge, 0, -43 - i * 3, 11.5, 0.4);
  } else {
    const spindleRadius = 1.8;
    const labelRadius = 25;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 75, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, spindleRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const disc = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 1.6,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0.15,
        bevelThickness: 0.15,
        curveSegments: 64,
      }),
      new THREE.MeshStandardMaterial({
        color: "#111113",
        metalness: 0,
        roughness: 0.35,
      })
    );
    disc.position.z = -0.8;
    group.add(disc);

    const grooves = labelCanvas(1024, 1024);
    grooves.ctx.fillStyle = "#171719";
    grooves.ctx.fillRect(0, 0, 1024, 1024);
    // Fine concentric grooves, with wider bands between the recorded tracks.
    for (let radius = 184; radius < 502; radius += 2.6) {
      grooves.ctx.strokeStyle =
        Math.floor((radius - 184) / 62) % 2 ? "#2b2b2e" : "#252528";
      grooves.ctx.lineWidth = 0.8;
      grooves.ctx.beginPath();
      grooves.ctx.arc(512, 512, radius, 0, Math.PI * 2);
      grooves.ctx.stroke();
    }
    for (const radius of [180, 246, 310, 374, 438, 502]) {
      grooves.ctx.strokeStyle = "#101012";
      grooves.ctx.lineWidth = 2;
      grooves.ctx.beginPath();
      grooves.ctx.arc(512, 512, radius, 0, Math.PI * 2);
      grooves.ctx.stroke();
    }
    const sheen = grooves.ctx.createConicGradient(0.4, 512, 512);
    [0, 0.5, 1].forEach(stop => sheen.addColorStop(stop, "#ffffff00"));
    [0.12, 0.62].forEach(stop => sheen.addColorStop(stop, "#ffffff12"));
    [0.24, 0.74].forEach(stop => sheen.addColorStop(stop, "#ffffff00"));
    grooves.ctx.fillStyle = sheen;
    grooves.ctx.fillRect(0, 0, 1024, 1024);
    const grooveMap = texture(grooves.canvas);
    const artwork = artworkTexture(item, 512, 512, onTextureLoad);

    for (const direction of [1, -1]) {
      const surface = new THREE.Mesh(
        new THREE.RingGeometry(spindleRadius, 75, 128),
        new THREE.MeshPhysicalMaterial({
          map: grooveMap,
          metalness: 0,
          roughness: 0.38,
          clearcoat: 0.25,
          clearcoatRoughness: 0.3,
        })
      );
      surface.rotation.y = direction < 0 ? Math.PI : 0;
      surface.position.z = direction * 0.97;
      group.add(surface);

      const label = new THREE.Mesh(
        new THREE.RingGeometry(spindleRadius, labelRadius, 96),
        new THREE.MeshStandardMaterial({
          map: artwork,
          metalness: 0,
          roughness: 0.9,
        })
      );
      label.rotation.y = surface.rotation.y;
      label.position.z = direction * 1.01;
      group.add(label);
    }
  }
  // Facet the lighting without changing the underlying model geometry.
  group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (material instanceof THREE.MeshStandardMaterial)
        material.flatShading = true;
    }
  });
  return { group, dimensions };
}
export function disposeMediaScene(scene: THREE.Object3D) {
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.LineSegments))
      return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) value.dispose();
      material.dispose();
    }
  });
}
