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
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
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
export function makeMediaObject(
  kind: MediaKind,
  item: PhysicalMedia,
  palette = mediaPalette()
) {
  const group = new THREE.Group();
  const color = COLORS[item.index % COLORS.length];
  const dimensions =
    kind === "anime"
      ? { w: 180, h: 108, d: 24 }
      : kind === "games"
        ? { w: 112, h: 138, d: 22 }
        : { w: 150, h: 150, d: 4 };
  if (kind === "anime") {
    box(group, 180, 108, 24, palette.shell, 0, 0, 0, 3);
    box(group, 168, 95, 2, palette.raised, 0, 0, 12, 1);
    box(group, 156, 34, 3, palette.recess, 0, 18, 14, 1);
    for (const x of [-52, 52]) {
      const reel = new THREE.Group();
      reel.position.set(x, 18, 17);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(12, 2.5, 8, 32),
        new THREE.MeshStandardMaterial({ color: palette.trim, roughness: 0.5 })
      );
      reel.add(ring);
      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(2, 20, 1),
          new THREE.MeshStandardMaterial({ color: palette.trim })
        );
        spoke.rotation.z = (i * Math.PI) / 3;
        reel.add(spoke);
      }
      const hub = new THREE.Mesh(
        new THREE.CircleGeometry(4, 16),
        new THREE.MeshStandardMaterial({ color: palette.recess })
      );
      hub.position.z = 1;
      reel.add(hub);
      group.add(reel);
    }
    for (const x of [-83, 83])
      for (const y of [-46, 46]) {
        const screw = new THREE.Mesh(
          new THREE.CircleGeometry(1.7, 12),
          new THREE.MeshStandardMaterial({
            color: palette.edge,
            metalness: 0.8,
            roughness: 0.4,
          })
        );
        screw.position.set(x, y, 14);
        group.add(screw);
      }
    for (let i = 0; i < 8; i++)
      box(group, 4, 68, 2, palette.recess, -79 + i * 2.1, 0, -12, 0.3);
    const { canvas, ctx } = labelCanvas(720, 180);
    ctx.fillStyle = "#ede6cc";
    ctx.fillRect(0, 0, 720, 180);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 720, 18);
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 36px monospace";
    wrap(ctx, item.title, 24, 66, 672, 40);
    ctx.font = "17px monospace";
    ctx.fillText(item.subtitle.slice(0, 53), 24, 151);
    face(group, canvas, 150, 37, 14.2, -22);
    const back = labelCanvas(512, 256);
    back.ctx.fillStyle = palette.shell;
    back.ctx.fillRect(0, 0, 512, 256);
    back.ctx.strokeStyle = palette.edge;
    back.ctx.strokeRect(12, 12, 488, 232);
    back.ctx.fillStyle = palette.trim;
    back.ctx.font = "18px monospace";
    back.ctx.fillText("VHS · HI-FI · 120", 110, 130);
    const rear = new THREE.Mesh(
      new THREE.PlaneGeometry(164, 85),
      new THREE.MeshStandardMaterial({ map: texture(back.canvas) })
    );
    rear.rotation.y = Math.PI;
    rear.position.z = -12.1;
    group.add(rear);
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
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 75, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 9, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const disc = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 3,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0.4,
        bevelThickness: 0.4,
        curveSegments: 64,
      }),
      new THREE.MeshPhysicalMaterial({
        color: "#bac2de",
        metalness: 0.55,
        roughness: 0.28,
        iridescence: 1,
        side: THREE.DoubleSide,
      })
    );
    disc.position.z = -1.5;
    group.add(disc);
    const { canvas, ctx } = labelCanvas(768, 768);
    const sheen = ctx.createConicGradient(0.4, 384, 384);
    [
      "#b4c4bf",
      "#e4d6ec",
      "#a0c4cd",
      "#f3e5bc",
      "#a7c8a6",
      "#e9c7d4",
      "#b4c4bf",
    ].forEach((c, i) => sheen.addColorStop(i / 6, c));
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, 768, 768);
    for (let i = 115; i < 380; i += 3) {
      ctx.strokeStyle = i % 2 ? "#ffffff35" : "#58666124";
      ctx.beginPath();
      ctx.arc(384, 384, i, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(384, 384, 145, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.textAlign = "center";
    ctx.font = "bold 37px monospace";
    wrap(ctx, item.title, 384, 140, 600, 42);
    ctx.font = "24px monospace";
    ctx.fillText(item.subtitle, 384, 610);
    ctx.font = "14px monospace";
    ctx.fillText(
      `PEKKI AUDIO / ${String(item.index + 1).padStart(2, "0")}`,
      384,
      646
    );
    const front = new THREE.Mesh(
      new THREE.RingGeometry(9, 75, 128),
      new THREE.MeshPhysicalMaterial({
        map: texture(canvas),
        metalness: 0.15,
        roughness: 0.4,
        iridescence: 0.6,
        side: THREE.DoubleSide,
      })
    );
    front.position.z = 2;
    group.add(front);
    const hub = new THREE.Mesh(
      new THREE.RingGeometry(9, 16, 64),
      new THREE.MeshStandardMaterial({
        color: "#bac2de",
        metalness: 0.7,
        roughness: 0.3,
        side: THREE.DoubleSide,
      })
    );
    hub.position.z = 2.2;
    group.add(hub);
  }
  return { group, dimensions };
}
export function disposeMediaScene(scene: THREE.Object3D) {
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
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
