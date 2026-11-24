import {
  BackSide,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  Fog,
  FrontSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { drawLabel, drawPrint } from './artwork.js';

// Curved corridor between two concentric walls. Units are metres.
const R = 18;
const RIN = 12.2;
const H = 6.2;
const PY = 1.95;
const PW = 1.36;
const PH = 1.83;
const OUTER_SLOTS = 36;
const INNER_SLOTS = 24;
const STEP = (2 * Math.PI) / OUTER_SLOTS;
const GLIDE_MS = 950;
const SMOOTH_S = 0.36;

const isPortrait = () => window.innerHeight > window.innerWidth;
const isSmall = () =>
  window.matchMedia('(max-width: 819px), (orientation: portrait) and (max-width: 1100px), (orientation: landscape) and (max-height: 500px)')
    .matches;

const walkPose = (th) =>
  isPortrait() ? { th, r: 15.4, yaw: -0.42, y: 1.9, pitch: -0.1 } : { th, r: 15.6, yaw: -0.3, y: 1.92, pitch: -0.12 };

function focusPose(slot) {
  const off = isPortrait() ? 5.2 : 4.26;
  const y = PY - (isPortrait() ? 1.05 : 0.52);
  return slot.wall === 'outer'
    ? { th: slot.angle, r: R - off, yaw: Math.PI / 2, y, pitch: 0 }
    : { th: slot.angle, r: RIN + off, yaw: -Math.PI / 2, y, pitch: 0 };
}

const easeQuart = (t) => 1 - (1 - t) ** 4;
const easeQuad = (t) => 1 - (1 - t) ** 2;
const easeCubic = (t) => 1 - (1 - t) ** 3;
const easeExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
const lerp = (a, b, t) => a + (b - a) * t;

function texture(canvas, renderer) {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

function buildFrame({ printTex, labelTex, labelSide }) {
  const g = new Group();
  const halo = new Mesh(
    new PlaneGeometry(PW + 0.5, PH + 0.5),
    new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false }),
  );
  // Lift off the wall: the outer wall curves inward by x²/2R at the edges of a flat frame.
  halo.position.z = 0.028;
  const shadow = new Mesh(
    new PlaneGeometry(PW + 0.1, PH + 0.1),
    new MeshBasicMaterial({ color: 0x3a3550, transparent: true, opacity: 0.1, depthWrite: false }),
  );
  shadow.position.set(0.05, -0.07, 0.03);
  const frame = new Mesh(new BoxGeometry(PW + 0.08, PH + 0.08, 0.05), new MeshBasicMaterial({ color: 0xd3aa72 }));
  frame.position.z = 0.03;
  const print = new Mesh(new PlaneGeometry(PW, PH), new MeshBasicMaterial({ map: printTex }));
  print.position.z = 0.057;
  const label = new Mesh(new PlaneGeometry(0.88, 0.3575), new MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false }));
  label.position.set(labelSide * (PW / 2 + 0.62), -PH / 2 + 0.18, 0.075);
  g.add(halo, shadow, frame, print, label);
  return { group: g, print };
}

/**
 * Creates the gallery. Returns controls; call dispose() on unmount.
 * Callbacks: onHover(itemIndex|null), onFocus(itemIndex|null), onOpen(itemIndex, DOMRect of the print on screen).
 */
export function createGallery({ canvas, items, reducedMotion = false, onHover, onFocus, onOpen }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  scene.background = new Color(0xfff9ec);
  scene.fog = new Fog(0xfff9ec, 10, 46);
  const camera = new PerspectiveCamera(56, 1, 0.05, 80);

  // Architecture
  const outerWall = new Mesh(new CylinderGeometry(R, R, H, 160, 1, true), new MeshBasicMaterial({ color: 0xfff9ec, side: BackSide }));
  outerWall.position.y = H / 2;
  const innerWall = new Mesh(new CylinderGeometry(RIN, RIN, H, 120, 1, true), new MeshBasicMaterial({ color: 0xfbf3e4, side: FrontSide }));
  innerWall.position.y = H / 2;
  const floor = new Mesh(new RingGeometry(RIN, R, 160, 1), new MeshBasicMaterial({ color: 0xf1e6d2, side: DoubleSide }));
  floor.rotation.x = -Math.PI / 2;
  const ceiling = new Mesh(new RingGeometry(RIN, R, 160, 1), new MeshBasicMaterial({ color: 0xfffcf4, side: DoubleSide }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = H;
  const skirtOuter = new Mesh(
    new CylinderGeometry(R - 0.01, R - 0.01, 0.14, 160, 1, true),
    new MeshBasicMaterial({ color: 0xe9dcc4, side: BackSide }),
  );
  skirtOuter.position.y = 0.07;
  const skirtInner = new Mesh(new CylinderGeometry(RIN + 0.01, RIN + 0.01, 0.14, 120, 1, true), new MeshBasicMaterial({ color: 0xe9dcc4 }));
  skirtInner.position.y = 0.07;
  scene.add(outerWall, innerWall, floor, ceiling, skirtOuter, skirtInner);

  // Prints: one texture pair per item, shared by every slot that shows it.
  const textures = items.map((item) => ({ printTex: texture(drawPrint(item), renderer), labelTex: texture(drawLabel(item), renderer) }));
  const slots = [];
  const pickables = [];
  const addSlot = (wall, angle, radius, itemIndex) => {
    const { group, print } = buildFrame({ ...textures[itemIndex], labelSide: wall === 'outer' ? 1 : -1 });
    const pos = new Vector3(radius * Math.cos(angle), PY, radius * Math.sin(angle));
    group.position.copy(pos);
    group.lookAt(wall === 'outer' ? new Vector3(0, PY, 0) : pos.clone().multiplyScalar(2).setY(PY));
    const slot = { wall, angle, itemIndex, print, index: slots.length };
    print.userData.slot = slot;
    slots.push(slot);
    pickables.push(print);
    scene.add(group);
  };
  for (let s = 0; s < OUTER_SLOTS; s++) addSlot('outer', s * STEP, R - 0.02, s % items.length);
  for (let k = 0; k < INNER_SLOTS; k++) addSlot('inner', ((k + 0.5) * 2 * Math.PI) / INNER_SLOTS, RIN + 0.02, (k + 4) % items.length);

  // Camera state
  let targetTh = Math.PI * 0.5;
  let pose = walkPose(targetTh);
  let glide = null;
  let focused = null;
  const intro = reducedMotion ? null : { start: performance.now(), from: { ...pose, th: pose.th + 0.16, r: pose.r - 0.35 }, ms: 1400 };
  if (intro) pose = { ...intro.from };

  const dir = new Vector3();
  const look = new Vector3();
  function applyPose(p) {
    camera.position.set(p.r * Math.cos(p.th), p.y, p.r * Math.sin(p.th));
    const tx = Math.sin(p.th);
    const tz = -Math.cos(p.th);
    const nx = Math.cos(p.th);
    const nz = Math.sin(p.th);
    const cp = Math.cos(p.pitch);
    dir.set((Math.cos(p.yaw) * tx + Math.sin(p.yaw) * nx) * cp, Math.sin(p.pitch), (Math.cos(p.yaw) * tz + Math.sin(p.yaw) * nz) * cp);
    look.copy(camera.position).add(dir);
    camera.lookAt(look);
  }

  function startGlide(to) {
    if (reducedMotion) {
      pose = { ...to };
      glide = null;
      return;
    }
    glide = { from: { ...pose }, to, start: performance.now() };
  }

  function focusSlot(slot) {
    focused = slot;
    startGlide(focusPose(slot));
    onFocus?.(slot.itemIndex);
  }

  function stepBack() {
    if (!focused) return;
    // Stand a little before the print so it stays in view as you walk on.
    targetTh = focused.angle + (isPortrait() ? 0.14 + 0.9 * STEP : 0.14);
    focused = null;
    startGlide(walkPose(targetTh));
    onFocus?.(null);
  }

  function neighbour(delta) {
    const same = slots.filter((s) => s.wall === focused.wall);
    const i = same.indexOf(focused);
    return same[(i + delta + same.length) % same.length];
  }

  const next = () => (focused ? focusSlot(neighbour(1)) : ((targetTh -= STEP), glide && (glide = null)));
  const prev = () => (focused ? focusSlot(neighbour(-1)) : ((targetTh += STEP), glide && (glide = null)));

  // Input
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const pick = (e) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit && hit.distance < 32 ? hit.object.userData.slot : null;
  };

  function printRect(slot) {
    const rect = canvas.getBoundingClientRect();
    slot.print.geometry.computeBoundingBox();
    const bb = slot.print.geometry.boundingBox;
    const pts = [
      [bb.min.x, bb.min.y],
      [bb.max.x, bb.min.y],
      [bb.min.x, bb.max.y],
      [bb.max.x, bb.max.y],
    ].map(([x, y]) => new Vector3(x, y, 0).applyMatrix4(slot.print.matrixWorld).project(camera));
    const xs = pts.map((p) => rect.left + ((p.x + 1) / 2) * rect.width);
    const ys = pts.map((p) => rect.top + ((1 - p.y) / 2) * rect.height);
    return new DOMRect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  }

  let drag = null;
  let hovered = null;
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, last: e.clientX, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e) => {
    if (drag && e.pointerId === drag.id) {
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
        drag.moved = true;
        canvas.setPointerCapture(e.pointerId);
        if (focused) stepBack();
      }
      if (drag.moved) {
        targetTh += (e.clientX - drag.last) * (isSmall() ? 0.0042 : 0.0022);
        drag.last = e.clientX;
        glide = null;
      }
      return;
    }
    if (e.pointerType !== 'mouse') return;
    const slot = pick(e);
    const idx = slot ? slot.itemIndex : null;
    canvas.style.cursor = slot ? 'pointer' : 'grab';
    if (idx !== hovered) {
      hovered = idx;
      onHover?.(idx);
    }
  };
  const onPointerUp = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasDrag = drag.moved;
    drag = null;
    if (wasDrag) return;
    const slot = pick(e);
    if (!slot) return stepBack();
    if (focused === slot && !glide) onOpen?.(slot.itemIndex, printRect(slot));
    else focusSlot(slot);
  };
  const onWheel = (e) => {
    e.preventDefault();
    if (focused) stepBack();
    targetTh += -e.deltaY * 0.0016;
    glide = null;
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', () => (drag = null));
  canvas.addEventListener('wheel', onWheel, { passive: false });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = isPortrait() ? 70 : 56;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Loop
  let raf = 0;
  let paused = false;
  let last = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (paused || document.hidden) return;

    if (intro && !intro.done) {
      const t = Math.min(1, (now - intro.start) / intro.ms);
      const k = easeExpo(t);
      const to = walkPose(targetTh);
      pose = { th: lerp(intro.from.th, to.th, k), r: lerp(intro.from.r, to.r, k), yaw: to.yaw, y: to.y, pitch: to.pitch };
      if (t >= 1) intro.done = true;
    } else if (glide) {
      const t = Math.min(1, (now - glide.start) / GLIDE_MS);
      const { from, to } = glide;
      pose = {
        th: lerp(from.th, to.th, easeQuart(t)),
        yaw: lerp(from.yaw, to.yaw, easeQuad(t)),
        r: lerp(from.r, to.r, easeCubic(t)),
        y: lerp(from.y, to.y, easeCubic(t)),
        pitch: lerp(from.pitch, to.pitch, easeCubic(t)),
      };
      if (t >= 1) {
        glide = null;
        if (!focused) targetTh = pose.th;
      }
    } else if (!focused) {
      const k = reducedMotion ? 1 : 1 - Math.exp(-dt / SMOOTH_S);
      const to = walkPose(targetTh);
      pose = {
        th: lerp(pose.th, to.th, k),
        r: lerp(pose.r, to.r, k),
        yaw: lerp(pose.yaw, to.yaw, k),
        y: lerp(pose.y, to.y, k),
        pitch: lerp(pose.pitch, to.pitch, k),
      };
    }
    applyPose(pose);
    renderer.render(scene, camera);
  }
  applyPose(pose);
  raf = requestAnimationFrame(frame);

  return {
    next,
    prev,
    stepBack,
    isFocused: () => Boolean(focused),
    /** Walks to the nearest outer-wall frame showing this item and focuses it. */
    focusItem(itemIndex) {
      const candidates = slots.filter((s) => s.wall === 'outer' && s.itemIndex === itemIndex);
      const near = candidates.reduce((a, b) => (Math.abs(b.angle - pose.th) < Math.abs(a.angle - pose.th) ? b : a));
      focusSlot(near);
    },
    rectOfFocused: () => (focused ? printRect(focused) : null),
    setPaused(v) {
      paused = v;
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
