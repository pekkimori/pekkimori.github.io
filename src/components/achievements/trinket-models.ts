import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const INK = "#292c39",
  GOLD = "#d1a769",
  PAPER = "#eee0bc",
  BLUE = "#89b4ce",
  GREEN = "#8da78c",
  PINK = "#d9a2b0",
  PURPLE = "#a498ca",
  ORANGE = "#d68e64";
const material = (color: string, metalness = 0.12) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.58,
    metalness,
    flatShading: true,
  });
function add(
  parent: THREE.Group,
  geometry: THREE.BufferGeometry,
  color: string,
  x = 0,
  y = 0,
  z = 0
) {
  const mesh = new THREE.Mesh(geometry, material(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function ball(
  parent: THREE.Group,
  color: string,
  radius: number,
  x = 0,
  y = 0,
  z = 0
) {
  return add(parent, new THREE.SphereGeometry(radius, 12, 8), color, x, y, z);
}
function box(
  parent: THREE.Group,
  color: string,
  w: number,
  h: number,
  d: number,
  x = 0,
  y = 0,
  z = 0
) {
  return add(
    parent,
    new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.15),
    color,
    x,
    y,
    z
  );
}
function cylinder(
  parent: THREE.Group,
  color: string,
  top: number,
  bottom: number,
  h: number,
  x = 0,
  y = 0,
  z = 0
) {
  return add(
    parent,
    new THREE.CylinderGeometry(top, bottom, h, 20),
    color,
    x,
    y,
    z
  );
}
function ring(
  parent: THREE.Group,
  color: string,
  r: number,
  tube: number,
  x = 0,
  y = 0,
  z = 0
) {
  return add(parent, new THREE.TorusGeometry(r, tube, 6, 40), color, x, y, z);
}
function rod(
  parent: THREE.Group,
  color: string,
  from: number[],
  to: number[],
  radius = 0.035
) {
  const a = new THREE.Vector3(...from),
    b = new THREE.Vector3(...to);
  const mesh = cylinder(parent, color, radius, radius, a.distanceTo(b));
  mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.sub(a).normalize()
  );
  return mesh;
}
function star(
  parent: THREE.Group,
  color: string,
  r: number,
  x = 0,
  y = 0,
  z = 0,
  points = 5
) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / points,
      rad = i % 2 ? r * 0.45 : r;
    const px = Math.cos(a) * rad,
      py = Math.sin(a) * rad;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  shape.closePath();
  return add(
    parent,
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 1,
    }),
    color,
    x,
    y,
    z
  );
}
function label(
  parent: THREE.Group,
  text: string,
  w: number,
  h: number,
  x = 0,
  y = 0,
  z = 0,
  color = INK
) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = color;
  ctx.font = `bold ${text.length > 5 ? 30 : 65}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 67, 230);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map, roughness: 0.85 })
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
}
function leaf(
  parent: THREE.Group,
  color: string,
  x: number,
  y: number,
  z: number,
  angle = 0
) {
  const mesh = ball(parent, color, 0.22, x, y, z);
  mesh.scale.set(0.5, 1.8, 0.25);
  mesh.rotation.z = angle;
  return mesh;
}
function plant(parent: THREE.Group, flowers = false) {
  cylinder(parent, ORANGE, 0.4, 0.28, 0.5, 0, 0.25);
  cylinder(parent, "#5b493d", 0.35, 0.35, 0.025, 0, 0.51);
  rod(parent, GREEN, [0, 0.5, 0], [0, 1.35, 0], 0.035);
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1;
    leaf(parent, GREEN, side * 0.15, 0.65 + i * 0.15, 0, -side * 0.8);
  }
  if (flowers)
    for (let i = 0; i < 5; i++)
      ball(parent, PURPLE, 0.09, Math.sin(i) * 0.1, 1.35 + i * 0.045, 0);
}
function cat(parent: THREE.Group, smile = false, sleeping = false) {
  if (!smile) {
    const body = ball(parent, PAPER, 0.48, 0, 0.45);
    body.scale.set(0.85, 1.15, 0.8);
    const tail = ring(parent, PAPER, 0.34, 0.09, 0.28, 0.35, -0.1);
    tail.rotation.y = 0.7;
  }
  const head = ball(
    parent,
    smile ? PURPLE : PAPER,
    0.4,
    0,
    smile ? 0.75 : 1.05,
    0.03
  );
  const hy = head.position.y;
  for (const side of [-1, 1]) {
    const ear = add(
      parent,
      new THREE.ConeGeometry(0.2, 0.4, 3),
      smile ? PURPLE : PAPER,
      side * 0.25,
      hy + 0.32,
      0
    );
    ear.rotation.z = -side * 0.2;
    if (sleeping)
      rod(
        parent,
        INK,
        [side * 0.15 - 0.055, hy + 0.02, 0.4],
        [side * 0.15 + 0.055, hy + 0.02, 0.4],
        0.018
      );
    else ball(parent, INK, 0.038, side * 0.15, hy + 0.03, 0.39);
    for (let i = 0; i < 3; i++)
      rod(
        parent,
        INK,
        [side * 0.22, hy - 0.08, 0.35],
        [side * 0.59, hy - 0.09 + (i - 1) * 0.095, 0.35],
        0.009
      );
  }
  ball(parent, PINK, 0.045, 0, hy - 0.07, 0.43);
  if (smile) {
    const grin = ring(parent, PAPER, 0.21, 0.065, 0, hy - 0.08, 0.35);
    grin.scale.y = 0.55;
    box(parent, PURPLE, 0.5, 0.13, 0.14, 0, hy + 0.01, 0.4);
  }
}
function house(parent: THREE.Group, antenna = false) {
  box(parent, PAPER, 0.95, 0.85, 0.7, 0, 0.45);
  const roof = add(
    parent,
    new THREE.ConeGeometry(0.8, 0.55, 4),
    ORANGE,
    0,
    1.12
  );
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.85;
  box(parent, GOLD, 0.22, 0.42, 0.04, 0, 0.25, 0.38);
  for (const side of [-1, 1])
    box(parent, BLUE, 0.17, 0.2, 0.04, side * 0.3, 0.6, 0.38);
  if (antenna) {
    rod(parent, INK, [0.3, 1.2, 0], [0.3, 1.7, 0]);
    ball(parent, GOLD, 0.08, 0.3, 1.7);
  } else box(parent, ORANGE, 0.15, 0.45, 0.2, 0.3, 1.25, -0.2);
}

// The same faceted geometry, paper labels, brass details and small physical
// imperfections as the site's tapes, cartridges and records. No remote assets.
export function makeTrinket(model: string) {
  const group = new THREE.Group();
  switch (model) {
    case "moon": {
      const s = new THREE.Shape();
      s.moveTo(0.45, 0.75);
      s.bezierCurveTo(-0.95, 1, -1, -0.8, 0.45, -0.75);
      s.bezierCurveTo(-0.3, -0.45, -0.3, 0.45, 0.45, 0.75);
      add(
        group,
        new THREE.ExtrudeGeometry(s, {
          depth: 0.22,
          bevelEnabled: true,
          bevelSize: 0.04,
          bevelThickness: 0.04,
          bevelSegments: 2,
        }),
        PAPER,
        0,
        0.85
      );
      for (const [x, y, r] of [
        [-0.5, 0.9, 0.09],
        [-0.48, 0.55, 0.06],
        [-0.3, 1.3, 0.055],
      ])
        ball(group, "#bdb59d", r, x, y, 0.23);
      break;
    }
    case "telescope": {
      const scope = new THREE.Group();
      scope.position.y = 1.1;
      scope.rotation.z = -0.65;
      group.add(scope);
      cylinder(scope, BLUE, 0.17, 0.22, 1.2);
      cylinder(scope, GOLD, 0.24, 0.24, 0.1, 0, -0.57);
      cylinder(scope, INK, 0.19, 0.19, 0.025, 0, -0.63);
      cylinder(scope, GOLD, 0.12, 0.12, 0.2, 0, 0.7);
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        rod(
          group,
          GOLD,
          [0, 0.8, 0],
          [Math.cos(a) * 0.55, 0.05, Math.sin(a) * 0.55],
          0.035
        );
      }
      break;
    }
    case "orbit": {
      ball(group, BLUE, 0.4, 0, 0.85);
      const orbit = ring(group, GOLD, 0.8, 0.025, 0, 0.85);
      orbit.rotation.x = 0.9;
      orbit.rotation.y = -0.3;
      ball(group, PAPER, 0.12, 0.72, 1.1, 0.2);
      rod(group, GOLD, [0, 0, 0], [0, 0.45, 0]);
      break;
    }
    case "comet": {
      add(
        group,
        new THREE.IcosahedronGeometry(0.35, 0),
        PAPER,
        -0.3,
        0.5,
        0.15
      );
      for (let i = 0; i < 5; i++) {
        const tail = add(
          group,
          new THREE.ConeGeometry(0.12, 1.15, 5),
          i % 2 ? GOLD : BLUE,
          0.15 + i * 0.06,
          1 + i * 0.02,
          -0.08 + i * 0.06
        );
        tail.rotation.z = -0.65;
      }
      break;
    }
    case "nebula": {
      for (let i = 0; i < 9; i++) {
        const b = ball(
          group,
          i % 2 ? PINK : PURPLE,
          0.25,
          Math.sin(i * 2) * 0.48,
          0.7 + Math.cos(i * 1.4) * 0.3,
          Math.cos(i) * 0.2
        );
        b.scale.x = 1.3;
      }
      star(group, PAPER, 0.3, 0, 0.9, 0.4);
      rod(group, GOLD, [0, 0, 0], [0, 0.4, 0]);
      break;
    }
    case "pulsar": {
      ball(group, BLUE, 0.3, 0, 0.9);
      rod(group, PAPER, [0, 0.1, 0], [0, 1.7, 0], 0.025);
      const r = ring(group, GOLD, 0.5, 0.025, 0, 0.9);
      r.rotation.x = 1.1;
      for (const side of [-1, 1]) {
        const cone = add(
          group,
          new THREE.ConeGeometry(0.3, 0.6, 8, 1, true),
          BLUE,
          0,
          0.9 + side * 0.7
        );
        cone.rotation.z = side < 0 ? 0 : Math.PI;
      }
      break;
    }
    case "supernova": {
      star(group, GOLD, 0.8, 0, 0.9, 0, 8);
      star(group, ORANGE, 0.48, 0, 0.9, 0.16, 8);
      ball(group, PAPER, 0.25, 0, 0.9, 0.28);
      break;
    }
    case "event horizon": {
      ball(group, INK, 0.48, 0, 0.8);
      const accretion = ring(group, ORANGE, 0.68, 0.12, 0, 0.8);
      accretion.rotation.x = 1.2;
      const outer = ring(group, GOLD, 0.86, 0.04, 0, 0.8);
      outer.rotation.x = 1.2;
      break;
    }
    case "purr":
      cat(group, false, true);
      break;
    case "whiskers":
      cat(group);
      break;
    case "catnip":
      plant(group, true);
      break;
    case "cardboard": {
      box(group, "#b98d61", 1, 0.7, 0.8, 0, 0.4);
      box(group, "#75583e", 0.8, 0.04, 0.6, 0, 0.77);
      for (const side of [-1, 1]) {
        const flap = box(group, "#c9a478", 0.5, 0.035, 0.8, side * 0.67, 0.81);
        flap.rotation.z = side * 0.25;
      }
      label(group, "FRAGILE", 0.7, 0.25, 0, 0.4, 0.405);
      break;
    }
    case "yarn": {
      ball(group, PINK, 0.6, 0, 0.63);
      for (let i = 0; i < 10; i++) {
        const loop = ring(
          group,
          i % 2 ? "#e4bcc5" : "#bb8395",
          0.59,
          0.025,
          0,
          0.63
        );
        loop.rotation.set(i * 0.4, i * 0.7, 0);
      }
      rod(group, GOLD, [-0.75, 0.1, 0.25], [0.65, 1.35, 0.1], 0.025);
      ball(group, GOLD, 0.055, 0.65, 1.35, 0.1);
      break;
    }
    case "sunbeam": {
      ball(group, GOLD, 0.38, 0, 0.95);
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5;
        rod(
          group,
          GOLD,
          [Math.cos(a) * 0.5, 0.95 + Math.sin(a) * 0.5, 0],
          [Math.cos(a) * 0.72, 0.95 + Math.sin(a) * 0.72, 0],
          0.035
        );
      }
      rod(group, GOLD, [0, 0, 0], [0, 0.4, 0]);
      break;
    }
    case "nine lives": {
      for (let i = 0; i < 9; i++) {
        const x = ((i % 3) - 1) * 0.4,
          y = 0.3 + Math.floor(i / 3) * 0.43;
        const gem = add(
          group,
          new THREE.OctahedronGeometry(0.21),
          i % 2 ? PINK : GOLD,
          x,
          y
        );
        gem.scale.y = 1.2;
      }
      break;
    }
    case "cheshire":
      cat(group, true);
      break;
    case "root": {
      rod(group, "#967356", [0, 0.3, 0], [0, 1.25, 0], 0.1);
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        rod(
          group,
          "#967356",
          [0, 0.45, 0],
          [Math.cos(a) * 0.58, 0.08, Math.sin(a) * 0.45],
          0.055
        );
        ball(
          group,
          GREEN,
          0.35,
          Math.cos(a) * 0.3,
          1.1 + Math.sin(a) * 0.2,
          Math.sin(a) * 0.2
        );
      }
      break;
    }
    case "hello world": {
      box(group, BLUE, 1.2, 0.9, 0.5, 0, 0.85);
      box(group, INK, 1, 0.65, 0.04, 0, 0.88, 0.27);
      label(group, "HELLO!", 0.85, 0.48, 0, 0.88, 0.295, GREEN);
      box(group, PAPER, 0.22, 0.3, 0.22, 0, 0.3);
      box(group, BLUE, 0.9, 0.12, 0.6, 0, 0.1);
      break;
    }
    case "rubber duck": {
      const body = ball(group, GOLD, 0.48, 0, 0.52);
      body.scale.set(1, 0.8, 1.3);
      ball(group, GOLD, 0.31, 0, 0.97, 0.28);
      box(group, ORANGE, 0.34, 0.12, 0.25, 0, 0.93, 0.55);
      for (const s of [-1, 1]) ball(group, INK, 0.035, s * 0.17, 1.04, 0.52);
      leaf(group, "#e6bd75", 0.32, 0.57, 0.15, -1);
      break;
    }
    case "segfault": {
      for (const side of [-1, 1]) {
        const chip = box(group, INK, 0.45, 0.72, 0.17, side * 0.29, 0.6);
        chip.rotation.z = side * 0.1;
        for (let i = 0; i < 4; i++)
          box(group, GOLD, 0.2, 0.035, 0.04, side * 0.62, 0.32 + i * 0.17);
      }
      star(group, ORANGE, 0.24, 0.04, 0.7, 0.13, 4);
      break;
    }
    case "coffee": {
      cylinder(group, PAPER, 0.43, 0.32, 0.72, 0, 0.5);
      cylinder(group, "#52372d", 0.38, 0.38, 0.025, 0, 0.87);
      ring(group, PAPER, 0.25, 0.085, 0.46, 0.55);
      cylinder(group, PAPER, 0.58, 0.58, 0.06, 0, 0.1);
      for (let i = 0; i < 2; i++)
        rod(
          group,
          "#b5b3ac",
          [-0.12 + i * 0.2, 1, 0],
          [-0.08 + i * 0.2, 1.25, 0],
          0.018
        );
      break;
    }
    case "localhost":
      house(group, true);
      break;
    case "42": {
      box(group, GOLD, 1.05, 1.2, 0.22, 0, 0.7);
      label(group, "42", 0.9, 0.85, 0, 0.75, 0.12);
      star(group, GOLD, 0.18, 0, 1.46);
      break;
    }
    case "xyzzy": {
      const key = new THREE.Group();
      key.rotation.z = -0.6;
      key.position.y = 0.65;
      group.add(key);
      ring(key, GOLD, 0.3, 0.08, 0, 0.5);
      rod(key, GOLD, [0, 0.2, 0], [0, -0.6, 0], 0.065);
      box(key, GOLD, 0.3, 0.13, 0.13, 0.12, -0.5);
      box(key, GOLD, 0.22, 0.12, 0.13, 0.08, -0.26);
      star(key, PAPER, 0.14, 0, 0.5, 0.04);
      break;
    }
    case "seed":
      plant(group);
      break;
    case "moss": {
      const rock = add(
        group,
        new THREE.IcosahedronGeometry(0.65, 1),
        "#8d9291",
        0,
        0.45
      );
      rock.scale.set(1, 0.65, 0.8);
      for (let i = 0; i < 8; i++)
        ball(
          group,
          i % 2 ? GREEN : "#728663",
          0.18,
          Math.sin(i * 2) * 0.4,
          0.7 + Math.cos(i) * 0.05,
          Math.cos(i * 2) * 0.27
        );
      break;
    }
    case "firefly": {
      const body = ball(group, INK, 0.25, 0, 0.75);
      body.scale.y = 1.5;
      ball(group, GOLD, 0.23, 0, 0.48, 0.05);
      ball(group, INK, 0.18, 0, 1.13);
      for (const s of [-1, 1]) {
        const wing = leaf(group, PAPER, s * 0.32, 0.9, 0.1, -s * 0.8);
        wing.scale.y = 1.5;
        rod(group, INK, [s * 0.07, 1.2, 0], [s * 0.22, 1.4, 0]);
      }
      rod(group, GOLD, [0, 0, 0], [0, 0.3, 0], 0.025);
      break;
    }
    case "mycelium": {
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * 0.42,
          y = i === 1 ? 0.9 : 0.55;
        cylinder(group, PAPER, 0.07, 0.11, y, x, y / 2);
        const cap = ball(group, i === 1 ? ORANGE : PINK, 0.3, x, y);
        cap.scale.y = 0.5;
        for (let j = 0; j < 3; j++)
          rod(
            group,
            PAPER,
            [x, 0.1, 0],
            [x + Math.sin(j * 2) * 0.3, 0.02, Math.cos(j * 2) * 0.3],
            0.015
          );
      }
      break;
    }
    case "echoes": {
      rod(group, GOLD, [-0.16, 0.3, 0], [-0.16, 1.25, 0], 0.055);
      rod(group, GOLD, [0.16, 0.3, 0], [0.16, 1.25, 0], 0.055);
      rod(group, GOLD, [-0.16, 0.3, 0], [0.16, 0.3, 0], 0.055);
      rod(group, GOLD, [0, 0, 0], [0, 0.3, 0]);
      for (let i = 0; i < 3; i++) {
        const r = ring(
          group,
          BLUE,
          0.2 + i * 0.14,
          0.018,
          0,
          0.9,
          -0.1 - i * 0.2
        );
        r.scale.x = 1.4;
      }
      break;
    }
    case "aurora": {
      for (let band = 0; band < 3; band++) {
        const points = [];
        for (let i = 0; i < 12; i++)
          points.push(
            new THREE.Vector3(
              (i / 11 - 0.5) * 1.4,
              0.65 + band * 0.2 + Math.sin(i * 0.65 + band) * 0.2,
              Math.cos(i * 0.6) * 0.14
            )
          );
        const curve = new THREE.CatmullRomCurve3(points);
        add(
          group,
          new THREE.TubeGeometry(curve, 32, 0.085, 5, false),
          [GREEN, BLUE, PURPLE][band]
        );
      }
      rod(group, GOLD, [-0.55, 0, 0], [-0.55, 0.6, 0]);
      rod(group, GOLD, [0.55, 0, 0], [0.55, 0.65, 0]);
      break;
    }
    case "serendipity": {
      rod(group, GREEN, [0, 0, 0], [0, 0.9, 0], 0.035);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const petal = ball(
          group,
          GREEN,
          0.27,
          Math.cos(a) * 0.24,
          0.95 + Math.sin(a) * 0.24
        );
        petal.scale.z = 0.35;
      }
      ball(group, GOLD, 0.08, 0, 0.95, 0.15);
      break;
    }
    case "home sweet home":
      house(group);
      break;
    case "cat":
      cat(group);
      star(group, GOLD, 0.18, 0.4, 1.5);
      break;
    case "stardust": {
      cylinder(group, BLUE, 0.32, 0.4, 0.85, 0, 0.5);
      cylinder(group, BLUE, 0.17, 0.32, 0.25, 0, 1.05);
      cylinder(group, GOLD, 0.19, 0.19, 0.17, 0, 1.25);
      star(group, PAPER, 0.26, 0, 0.6, 0.4);
      for (let i = 0; i < 5; i++)
        ball(group, GOLD, 0.035, Math.sin(i * 3) * 0.27, 0.3 + i * 0.12, 0.37);
      break;
    }
    case "sandwich": {
      const shape = new THREE.Shape();
      shape.moveTo(-0.65, 0);
      shape.lineTo(0.65, 0);
      shape.lineTo(-0.65, 1);
      shape.closePath();
      for (const [i, color] of [PAPER, GREEN, ORANGE, PAPER].entries()) {
        const slice = add(
          group,
          new THREE.ExtrudeGeometry(shape, {
            depth: 0.1,
            bevelEnabled: true,
            bevelSize: 0.025,
            bevelThickness: 0.025,
            bevelSegments: 1,
          }),
          color,
          0,
          0.12,
          -0.15 + i * 0.12
        );
        slice.rotation.x = -0.12;
      }
      break;
    }
    case "keycaps": {
      for (let i = 0; i < 3; i++) {
        box(
          group,
          [PINK, BLUE, PAPER][i],
          0.5,
          0.32,
          0.5,
          (i - 1) * 0.55,
          0.3 + i * 0.06
        );
        label(
          group,
          "CAT"[i],
          0.35,
          0.24,
          (i - 1) * 0.55,
          0.31 + i * 0.06,
          0.26
        );
      }
      break;
    }
  }
  cylinder(group, "#716451", 0.62, 0.67, 0.09, 0, -0.055);
  const bounds = new THREE.Box3().setFromObject(group),
    size = bounds.getSize(new THREE.Vector3());
  group.position.set(
    -(bounds.min.x + bounds.max.x) / 2,
    -bounds.min.y,
    -(bounds.min.z + bounds.max.z) / 2
  );
  const normalized = new THREE.Group();
  normalized.add(group);
  normalized.scale.setScalar(90 / Math.max(size.x, size.y, size.z));
  const root = new THREE.Group();
  root.add(normalized);
  return root;
}
