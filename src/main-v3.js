import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.getElementById('game');
const loading = document.getElementById('loading');
const startPanel = document.getElementById('startPanel');
const startButton = document.getElementById('startButton');
const locationLabel = document.getElementById('location');

window.addEventListener('error', (e) => {
  loading.style.display = 'grid';
  loading.textContent = 'Erro ao carregar o jogo: ' + (e.message || 'erro desconhecido');
});
window.addEventListener('unhandledrejection', (e) => {
  loading.style.display = 'grid';
  loading.textContent = 'Erro ao carregar o jogo: ' + (e.reason?.message || e.reason || 'erro desconhecido');
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 120, 420);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 900);
camera.position.set(0, 1.75, 45);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

let yaw = 0;
let pitch = 0;
let locked = false;

startButton.addEventListener('click', () => canvas.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  startPanel.style.display = locked ? 'none' : 'flex';
});
document.addEventListener('mousemove', (e) => {
  if (!locked) return;
  yaw -= e.movementX * 0.0022;
  pitch -= e.movementY * 0.0022;
  pitch = Math.max(-1.45, Math.min(1.45, pitch));
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});

scene.add(new THREE.HemisphereLight(0xbad9ff, 0x17202c, 1.3));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(-45, 65, 35);
sun.castShadow = true;
scene.add(sun);

const MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xf3f6f9, roughness: 0.55 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x101825, roughness: 0.45 }),
  black: new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.4 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x0b58c7, roughness: 0.34 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x183b57, transparent: true, opacity: 0.46, roughness: 0.08 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7b5639, roughness: 0.62 }),
  glossyBlue: new THREE.MeshPhysicalMaterial({ color: 0x071d3e, roughness: 0.12, metalness: 0.22, clearcoat: 1 }),
};

function box(name, size, pos, material, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function textTexture(text, bg = '#063b93', fg = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 82px Arial';
  const lines = text.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * 92));
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function sign(text, w, h, pos, rotY = 0, bg = '#063b93', parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: textTexture(text, bg), side: THREE.DoubleSide })
  );
  mesh.position.set(...pos);
  mesh.rotation.y = rotY;
  parent.add(mesh);
  return mesh;
}

function led(size, pos, color = 0x1bb7ff, parent = scene) {
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.8, roughness: 0.15 });
  return box('LED', size, pos, mat, parent);
}

function light(pos, color = 0xffffff, intensity = 20, parent = scene) {
  const l = new THREE.PointLight(color, intensity, 22, 2);
  l.position.set(...pos);
  parent.add(l);
  return l;
}

function createFacade() {
  const g = new THREE.Group(); g.name = 'Fachada'; scene.add(g);
  box('Ground', [125, 1, 90], [0, -0.5, 10], new THREE.MeshStandardMaterial({ color: 0x3a4148, roughness: 1 }), g);
  box('Building', [94, 16, 28], [0, 8, -4], MAT.white, g);
  box('BlueBand', [94, 6.5, 0.7], [0, 10.5, 10.35], MAT.blue, g);
  for (let i = -5; i <= 3; i++) box('Window', [7.2, 5.5, 0.3], [i * 8.2, 6.1, 10.72], MAT.glass, g);
  box('EntranceTower', [18, 18, 4], [35, 9, 11.7], MAT.blue, g);
  box('Door', [10.5, 8, 0.35], [35, 4.2, 13.9], MAT.glass, g);
  sign('TV A CRÍTICA', 13, 4.5, [35, 13.2, 13.94], 0, '#0757bb', g);
  for (const x of [-35, -23, -11]) {
    box('PalmTrunk', [0.8, 12, 0.8], [x, 6, 12], MAT.wood, g);
    for (let a = 0; a < 6; a++) {
      const leaf = box('PalmLeaf', [7, 0.25, 1.1], [x, 12, 12], new THREE.MeshStandardMaterial({ color: 0x2b9b51 }), g);
      leaf.rotation.y = a * Math.PI / 3;
      leaf.rotation.z = -0.18;
    }
  }
}

function createReception() {
  const g = new THREE.Group(); g.name = 'Recepcao'; g.position.set(0, 0, -33); scene.add(g);
  box('Floor', [58, 0.5, 34], [0, 0.25, 0], new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.22 }), g);
  box('BackWall', [58, 14, 0.5], [0, 7, -17], MAT.white, g);
  box('ReceptionDesk', [18, 4.5, 5.5], [17, 2.25, 5], MAT.blue, g);
  sign('TV A CRÍTICA', 14, 5.2, [17, 8.7, -16.72], 0, '#0757bb', g);
  sign('TELÃO DA RECEPÇÃO', 19, 9, [-15, 7.5, -16.72], 0, '#06173d', g);
  box('SofaBase', [20, 2.2, 5.5], [-8, 1.1, 7], new THREE.MeshStandardMaterial({ color: 0xd9d5cf, roughness: 0.9 }), g);
  box('SofaBack', [20, 5, 1.3], [-8, 3.5, 9], new THREE.MeshStandardMaterial({ color: 0xd9d5cf, roughness: 0.9 }), g);
  box('CoffeeTable', [7, 1.3, 4], [-8, 0.9, 0], MAT.wood, g);
  led([42, 0.15, 0.15], [0, 12.8, -16.4], 0x1c9fff, g);
  light([0, 11, -4], 0xeef7ff, 24, g);
}

function createAlerta() {
  const g = new THREE.Group(); g.name = 'Estudio Alerta'; g.position.set(-28, 0, -90); scene.add(g);
  box('Floor', [44, 0.5, 30], [0, 0.25, 0], MAT.glossyBlue, g);
  box('Back', [44, 15, 0.5], [0, 7.5, -15], MAT.black, g);
  box('Left', [0.5, 15, 30], [-22, 7.5, 0], MAT.white, g);
  box('Right', [0.5, 15, 30], [22, 7.5, 0], MAT.dark, g);
  box('WhiteFloorStrip', [8, 0.08, 27], [-18, 0.55, 0], MAT.white, g);
  sign('NOVO\nALERTA', 27, 11, [-4, 7.8, -14.7], 0, '#18aef1', g);
  sign('NOVO\nALERTA', 10, 12, [18.5, 7.8, -1], -0.16, '#18aef1', g);
  box('TopBeam', [35, 0.8, 0.8], [-2, 13.2, -14], MAT.white, g);
  box('LeftBeam', [0.8, 12, 0.8], [-19, 7, -14], MAT.white, g);
  for (let i = 0; i < 5; i++) {
    box('BluePillar', [1.2, 12, 1.2], [10 + i * 2.2, 7, -13], MAT.blue, g);
    led([0.18, 11, 0.18], [9.5 + i * 2.2, 7, -12.3], 0x159dff, g);
  }
  for (const x of [-13, -3, 7, 16]) light([x, 13, 1], 0xdff4ff, 24, g);
  led([32, 0.15, 0.15], [-2, 12.5, -13.5], 0x179fff, g);
  led([32, 0.15, 0.15], [-2, 0.72, -13.5], 0x179fff, g);
}

function createCorridor() {
  const g = new THREE.Group(); g.name = 'Corredor'; g.position.set(0, 0, -68); scene.add(g);
  box('Floor', [18, 0.4, 80], [0, 0.2, -30], new THREE.MeshStandardMaterial({ color: 0x777e86, roughness: 0.25 }), g);
  box('WallL', [0.5, 13, 80], [-9, 6.5, -30], MAT.white, g);
  box('WallR', [0.5, 13, 80], [9, 6.5, -30], MAT.white, g);
  led([0.16, 0.16, 76], [-8.65, 11.7, -30], 0x128cff, g);
  led([0.16, 0.16, 76], [8.65, 11.7, -30], 0x128cff, g);
}

createFacade();
createReception();
createCorridor();
createAlerta();

const keys = new Set();
addEventListener('keydown', e => keys.add(e.code));
addEventListener('keyup', e => keys.delete(e.code));
const clock = new THREE.Clock();

function updateMovement(dt) {
  if (!locked) return;
  const speed = keys.has('ShiftLeft') ? 12 : 7;
  let dx = 0, dz = 0;
  if (keys.has('KeyW')) dz -= 1;
  if (keys.has('KeyS')) dz += 1;
  if (keys.has('KeyA')) dx -= 1;
  if (keys.has('KeyD')) dx += 1;
  const len = Math.hypot(dx, dz) || 1;
  dx /= len; dz /= len;

  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  camera.position.addScaledVector(forward, (-dz) * speed * dt);
  camera.position.addScaledVector(right, dx * speed * dt);
  camera.position.y = 1.75;

  const z = camera.position.z;
  if (z > 10) locationLabel.textContent = 'Fachada';
  else if (z > -55) locationLabel.textContent = 'Recepção';
  else if (z > -100) locationLabel.textContent = 'Corredores';
  else locationLabel.textContent = 'Estúdios';
}

function animate() {
  requestAnimationFrame(animate);
  updateMovement(Math.min(clock.getDelta(), 0.05));
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

loading.style.display = 'none';
animate();
