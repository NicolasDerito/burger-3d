import * as THREE from 'three';

const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  document.getElementById('fallback').hidden = false;
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0a09);
scene.fog = new THREE.Fog(0x0c0a09, 16, 36);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 200);

scene.add(new THREE.HemisphereLight(0xffe8cc, 0x201509, 1.15));
const keyL = new THREE.DirectionalLight(0xffffff, 2.5); keyL.position.set(6, 11, 8); scene.add(keyL);
const fillL = new THREE.DirectionalLight(0xff8a3d, 0.85); fillL.position.set(-8, 4, -6); scene.add(fillL);
const rimL = new THREE.PointLight(0xff5a00, 90, 50); rimL.position.set(-5, 7, -7); scene.add(rimL);

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (color, opts) => new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.6, metalness: 0.05 }, opts || {}));

const burger = new THREE.Group();
scene.add(burger);
const parts = [];

function addPart(obj, from, exploded, toBox, opts) {
  opts = opts || {};
  obj.position.copy(from);
  burger.add(obj);
  parts.push({
    obj: obj,
    from: from.clone(),
    exploded: exploded.clone(),
    toBox: toBox.clone(),
    baseRot: obj.rotation.clone(),
    baseScale: obj.scale.clone(),
    boxScale: opts.boxScale || 0.4,
    spin: opts.spin === undefined ? 0.5 : opts.spin
  });
  return obj;
}

const bunBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.04, 0.42, 48), M(0xd79a54, { roughness: 0.85 }));
addPart(bunBottom, V(0, 0.9, 0), V(0, 0.35, 0), V(2.8, -0.72, 0.05));

const patty = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.22, 0.4, 48), M(0x4b2c17, { roughness: 0.95 }));
addPart(patty, V(0, 1.34, 0), V(0.25, 1.7, 0), V(2.8, -0.5, 0.05));

const cheese = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 2.0), M(0xf0a92b, { roughness: 0.5 }));
cheese.rotation.y = Math.PI / 4;
addPart(cheese, V(0, 1.62, 0), V(-0.25, 2.6, 0.1), V(2.8, -0.34, 0.05));

const bacon = new THREE.Group();
for (let i = 0; i < 2; i++) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.07, 0.5), M(0xb5462f, { roughness: 0.7 }));
  b.position.z = i === 0 ? -0.32 : 0.32;
  b.rotation.y = i === 0 ? 0.12 : -0.12;
  bacon.add(b);
}
addPart(bacon, V(0, 1.78, 0), V(0.25, 3.4, 0.2), V(2.8, -0.18, 0.05));

const tomato = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.14, 48), M(0xcf3a2e, { roughness: 0.55 }));
addPart(tomato, V(0, 1.96, 0), V(-0.25, 4.2, 0.1), V(2.8, -0.02, 0.05));

const lettuce = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.16, 10, 42), M(0x65a83a, { roughness: 0.85 }));
lettuce.rotation.x = Math.PI / 2;
addPart(lettuce, V(0, 2.12, 0), V(0.25, 5.0, 0.15), V(2.8, 0.16, 0.05));

const bunTop = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2), M(0xe0a75f, { roughness: 0.75 }));
bunTop.scale.set(1, 0.9, 1);
for (let i = 0; i < 26; i++) {
  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), M(0xf7e2b8, { roughness: 0.6 }));
  const t = Math.random() * Math.PI * 2;
  const u = Math.random() * 0.55;
  const r = Math.sin(u * Math.PI / 2) * 1.2;
  seed.position.set(Math.cos(t) * r, Math.cos(u * Math.PI / 2) * 1.2 * 0.9, Math.sin(t) * r);
  bunTop.add(seed);
}
addPart(bunTop, V(0, 2.5, 0), V(0, 6.1, 0), V(2.8, 0.48, 0.05));

const boxGroup = new THREE.Group();
boxGroup.position.set(2.8, -0.85, 0);
scene.add(boxGroup);
const cardboard = M(0xc79a63, { roughness: 0.95 });
const baseW = 3.1, baseD = 2.1, wallH = 1.25, th = 0.09;
const boxBase = new THREE.Mesh(new THREE.BoxGeometry(baseW, th, baseD), cardboard);
boxGroup.add(boxBase);
const wallF = new THREE.Mesh(new THREE.BoxGeometry(baseW, wallH, th), cardboard);
wallF.position.set(0, wallH / 2, baseD / 2); boxGroup.add(wallF);
const wallB = wallF.clone(); wallB.position.z = -baseD / 2; boxGroup.add(wallB);
const wallL = new THREE.Mesh(new THREE.BoxGeometry(th, wallH, baseD), cardboard);
wallL.position.set(-baseW / 2, wallH / 2, 0); boxGroup.add(wallL);
const wallR = wallL.clone(); wallR.position.x = baseW / 2; boxGroup.add(wallR);
boxGroup.scale.setScalar(0.001);
boxGroup.visible = false;

const sides = new THREE.Group();
scene.add(sides);
const fries = new THREE.Group();
const carton = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.05, 0.7), M(0xd23b2e, { roughness: 0.6 }));
carton.position.y = 0.52; fries.add(carton);
for (let i = 0; i < 14; i++) {
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.25, 0.11), M(0xf3c445, { roughness: 0.7 }));
  f.position.set((Math.random() - 0.5) * 0.6, 1.15, (Math.random() - 0.5) * 0.45);
  f.rotation.z = (Math.random() - 0.5) * 0.4;
  f.rotation.x = (Math.random() - 0.5) * 0.25;
  fries.add(f);
}
fries.position.set(1.4, -0.85, 0.75);
sides.add(fries);
const soda = new THREE.Group();
const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 1.5, 32), M(0xf2f2f2, { roughness: 0.4 }));
cup.position.y = 0.75; soda.add(cup);
const band = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.46, 0.5, 32), M(0xe23b2e, { roughness: 0.5 }));
band.position.y = 0.7; soda.add(band);
const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.12, 32), M(0xe23b2e, { roughness: 0.5 }));
lid.position.y = 1.55; soda.add(lid);
const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 12), M(0xf7f7f7, { roughness: 0.4 }));
straw.position.set(0.18, 1.9, 0); straw.rotation.z = -0.18; soda.add(straw);
soda.position.set(4.6, -0.85, -0.2);
sides.add(soda);
sides.scale.setScalar(0.001);
sides.visible = false;

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const camTargetA = V(0, 2.0, 0);
const camTargetB = V(1.6, 1.2, 0);
const camPosA = V(0, 2.8, 10.5);
const camPosB = V(1.4, 2.2, 9.2);
const tmp = new THREE.Vector3();
const camTarget = new THREE.Vector3();
const progressBar = document.querySelector('.progress span');

let scrollP = 0;
function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollP = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}
window.addEventListener('scroll', readScroll, { passive: true });

let mx = 0, my = 0;
window.addEventListener('pointermove', (e) => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  readScroll();
});

const params = new URLSearchParams(location.search);
if (params.has('p')) scrollP = Math.min(1, Math.max(0, parseFloat(params.get('p'))));
readScroll();
if (params.has('p')) scrollP = Math.min(1, Math.max(0, parseFloat(params.get('p'))));

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  const p = scrollP;

  const tExplode = smoothstep(0.08, 0.42, p);
  const tBoxIn = smoothstep(0.40, 0.58, p);
  const tToBox = smoothstep(0.58, 0.88, p);
  const tSides = smoothstep(0.84, 1.0, p);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    tmp.copy(part.from).lerp(part.exploded, tExplode);
    tmp.lerp(part.toBox, tToBox);
    const s = 1 + (part.boxScale - 1) * tToBox;
    part.obj.position.copy(tmp);
    part.obj.scale.set(part.baseScale.x * s, part.baseScale.y * s, part.baseScale.z * s);
    const spin = part.spin * (0.7 * tExplode) + part.spin * 0.5 * Math.sin(time * 0.6) * (1 - tToBox);
    part.obj.rotation.set(part.baseRot.x, part.baseRot.y + spin, part.baseRot.z);
  }

  boxGroup.visible = tBoxIn > 0.001;
  const bs = 0.001 + (1 - 0.001) * tBoxIn;
  boxGroup.scale.setScalar(bs);
  boxGroup.position.y = -0.85 - (1 - tBoxIn) * 1.6;

  sides.visible = tSides > 0.001;
  const ss = 0.001 + (1 - 0.001) * tSides;
  sides.scale.setScalar(ss);

  camTarget.copy(camTargetA).lerp(camTargetB, tToBox);
  camera.position.copy(camPosA).lerp(camPosB, tToBox);
  camera.position.x += mx * 0.35;
  camera.position.y += -my * 0.25;
  camera.lookAt(camTarget);

  burger.position.y = Math.sin(time * 0.8) * 0.06 * (1 - tExplode);
  burger.rotation.y = mx * 0.15 * (1 - tToBox);

  if (progressBar) progressBar.style.height = (p * 100).toFixed(1) + '%';

  renderer.render(scene, camera);
}
animate();
