import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js';

const canvas = document.getElementById('game');
const loading = document.getElementById('loading');
const startPanel = document.getElementById('startPanel');
const startButton = document.getElementById('startButton');
const locationLabel = document.getElementById('location');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 120, 420);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 800);
camera.position.set(0, 1.75, 45);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const controls = new PointerLockControls(camera, document.body);
startButton.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => { startPanel.style.display = 'none'; });
controls.addEventListener('unlock', () => { startPanel.style.display = 'flex'; });

scene.add(new THREE.HemisphereLight(0xbad9ff, 0x17202c, 1.25));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(-45, 65, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xf3f6f9, roughness: 0.55 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x101825, roughness: 0.45 }),
  black: new THREE.MeshStandardMaterial({ color: 0x060a12, roughness: 0.42 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x0b58c7, roughness: 0.34 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x20c9ff, roughness: 0.22, emissive: 0x06384c, emissiveIntensity: 0.8 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x183b57, transparent: true, opacity: 0.46, roughness: 0.08, metalness: 0.05 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x3b4149, roughness: 0.72 }),
  glossyBlue: new THREE.MeshPhysicalMaterial({ color: 0x071d3e, roughness: 0.12, metalness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7b5639, roughness: 0.62 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc9202e, roughness: 0.38 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xe9b236, roughness: 0.42 }),
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

function led(size, pos, color = 0x1bb7ff, parent = scene, rotY = 0) {
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.7, roughness: 0.15 });
  const m = box('LED', size, pos, mat, parent);
  m.rotation.y = rotY;
  return m;
}

function ceilingLight(pos, color = 0xffffff, intensity = 18, parent = scene) {
  const light = new THREE.PointLight(color, intensity, 20, 2);
  light.position.set(...pos);
  parent.add(light);
  box('Luminaria', [1.8, 0.18, 1.8], [pos[0], pos[1] + 0.15, pos[2]], new THREE.MeshBasicMaterial({ color }), parent);
  return light;
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
  for (let x = -48; x <= 48; x += 12) box('ParkingLine', [0.14, 0.02, 14], [x, 0.03, 34], MAT.white, g);
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
  box('SideWallL', [0.5, 14, 34], [-29, 7, 0], MAT.white, g);
  box('SideWallR', [0.5, 14, 34], [29, 7, 0], MAT.white, g);
  box('ReceptionDesk', [18, 4.5, 5.5], [17, 2.25, 5], MAT.blue, g);
  sign('RECEPÇÃO', 10, 2.6, [17, 2.6, 2.18], 0, '#0757bb', g);
  sign('TV A CRÍTICA', 14, 5.2, [17, 8.7, -16.72], 0, '#0757bb', g);
  sign('TV A CRÍTICA\nA SUA TV', 19, 9, [-15, 7.5, -16.72], 0, '#06173d', g);
  box('SofaBase', [20, 2.2, 5.5], [-8, 1.1, 7], new THREE.MeshStandardMaterial({ color: 0xd9d5cf, roughness: 0.9 }), g);
  box('SofaBack', [20, 5, 1.3], [-8, 3.5, 9], new THREE.MeshStandardMaterial({ color: 0xd9d5cf, roughness: 0.9 }), g);
  box('CoffeeTable', [7, 1.3, 4], [-8, 0.9, 0], MAT.wood, g);
  led([42, 0.15, 0.15], [0, 12.8, -16.4], 0x1c9fff, g);
  for (const p of [[-24, 11, -4], [0, 11, -4], [24, 11, -4]]) ceilingLight(p, 0xeef7ff, 20, g);
}

const studioNames = ['ALERTA','A CRÍTICA BRASIL','ALERTA AMAZONAS','ALÔ CIDADE','MAGAZINE','JORNAL MANHÃ DO AR','ARENA DOS BUMBÁS','DEBATE ELEITORAL','A BORDO','THE BOX','A CRÍTICA NEWS','NOSSO ENCONTRO'];

function createDetailedAlerta(parent, x, z) {
  const room = new THREE.Group();
  room.name = 'ALERTA_DETALHADO';
  parent.add(room);

  const cyanScreen = new THREE.MeshBasicMaterial({ map: textTexture('NOVO\nALERTA', '#18aef1'), side: THREE.DoubleSide });

  box('StudioFloor', [42, 0.5, 26], [x, 0.25, z], MAT.glossyBlue, room);
  box('BackWall', [42, 14, 0.5], [x, 7, z - 12.7], MAT.black, room);
  box('OuterWall', [0.5, 14, 26], [x - 21, 7, z], MAT.white, room);
  box('InnerWall', [0.5, 14, 26], [x + 21, 7, z], MAT.dark, room);

  box('WhiteFloorStrip', [7.5, 0.08, 24], [x - 16.5, 0.55, z], MAT.white, room);
  box('TopWhiteBeam', [34, 0.8, 0.8], [x - 1, 12.4, z - 11.6], MAT.white, room);
  box('LeftWhiteBeam', [0.8, 11, 0.8], [x - 18, 6.4, z - 11.6], MAT.white, room);

  const mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(25, 10.5), cyanScreen.clone());
  mainScreen.position.set(x - 4.2, 7.2, z - 12.38);
  room.add(mainScreen);

  const sideScreen = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 10.5), cyanScreen.clone());
  sideScreen.position.set(x + 10.8, 7.2, z - 8.6);
  sideScreen.rotation.y = -Math.PI / 2;
  room.add(sideScreen);

  const verticalScreen = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 11.5), cyanScreen.clone());
  verticalScreen.position.set(x + 18.8, 7.4, z + 1.2);
  verticalScreen.rotation.y = -0.16;
  room.add(verticalScreen);

  box('MainScreenFrameTop', [27, 0.7, 0.7], [x - 4, 12.6, z - 12], MAT.black, room);
  box('MainScreenFrameBottom', [27, 0.7, 0.7], [x - 4, 1.7, z - 12], MAT.black, room);
  box('MainScreenFrameLeft', [0.7, 11, 0.7], [x - 17.6, 7.1, z - 12], MAT.black, room);

  for (let i = 0; i < 5; i++) {
    box('BluePillar', [1.2, 11.5, 1.2], [x + 10.5 + i * 2.2, 6.7, z - 10.8], MAT.blue, room);
    led([0.18, 10.7, 0.18], [x + 9.9 + i * 2.2, 6.7, z - 10.2], 0x159dff, room);
  }

  for (let i = 0; i < 9; i++) {
    box('LeftSlat', [0.35, 10.2, 0.55], [x - 20.1, 6.1, z - 10 + i * 1.8], MAT.white, room);
  }

  for (let i = 0; i < 6; i++) {
    box('RightPanel', [0.45, 11.2, 1.1], [x + 20.2, 6.6, z - 9 + i * 3.3], MAT.dark, room);
  }

  led([31, 0.13, 0.13], [x - 1.5, 11.7, z - 11.2], 0x179fff, room);
  led([31, 0.13, 0.13], [x - 2, 0.72, z - 11.2], 0x179fff, room);
  led([0.13, 0.13, 19], [x + 15.4, 0.72, z - 1.5], 0x179fff, room);

  for (const dx of [-13, -3, 7, 16]) ceilingLight([x + dx, 12, z], 0xdff4ff, 22, room);
  const blueFill = new THREE.PointLight(0x159dff, 18, 22, 2);
  blueFill.position.set(x + 11, 5, z - 3);
  room.add(blueFill);

  const doorX = -9.2;
  box('Door', [0.45, 8, 5], [doorX, 4, z], MAT.glass, room);
  sign('ESTÚDIO ALERTA', 8.5, 2.4, [doorX + 0.28, 9.2, z], Math.PI / 2, '#063b93', room);
}

function createCorridorAndRooms() {
  const g = new THREE.Group(); g.name = 'Corredores'; g.position.set(0, 0, -72); scene.add(g);
  box('Floor', [18, 0.4, 165], [0, 0.2, -65], new THREE.MeshStandardMaterial({ color: 0x777e86, roughness: 0.25 }), g);
  box('WallL', [0.5, 13, 165], [-9, 6.5, -65], MAT.white, g);
  box('WallR', [0.5, 13, 165], [9, 6.5, -65], MAT.white, g);
  led([0.16, 0.16, 160], [-8.65, 11.7, -65], 0x128cff, g);
  led([0.16, 0.16, 160], [8.65, 11.7, -65], 0x128cff, g);

  studioNames.forEach((name, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -8 - Math.floor(i / 2) * 24;
    const x = side * 28;

    if (name === 'ALERTA') {
      createDetailedAlerta(g, x, z);
      return;
    }

    const room = new THREE.Group(); room.name = name; g.add(room);
    box('StudioFloor', [34, 0.35, 21], [x, 0.18, z], MAT.dark, room);
    box('Back', [34, 12, 0.5], [x, 6, z - 10.3], MAT.dark, room);
    box('Outer', [0.5, 12, 21], [x + side * 17, 6, z], MAT.white, room);
    box('Inner', [0.5, 12, 21], [x - side * 17, 6, z], MAT.white, room);
    const doorX = side * 9.2;
    box('Door', [0.45, 8, 5], [doorX, 4, z], MAT.glass, room);
    sign(name, 8.5, 2.4, [doorX - side * 0.28, 9.2, z], side > 0 ? -Math.PI / 2 : Math.PI / 2, i === 2 ? '#b0162b' : '#063b93', room);
    const screen = sign(name.replace(' ', '\n'), 18, 8, [x, 6, z - 9.98], 0, '#073e91', room);
    if (name === 'MAGAZINE') screen.material.map = textTexture('MAGAZINE', '#b51f75');
    if (name === 'JORNAL MANHÃ DO AR') screen.material.map = textTexture('JORNAL\nMANHÃ DO AR', '#d69c1b');
    if (name === 'THE BOX') screen.material.map = textTexture('THE BOX', '#7b2719');
    if (name === 'ALERTA AMAZONAS') screen.material.map = textTexture('ALERTA\nAMAZONAS', '#a60e2a');
    led([24, 0.12, 0.12], [x, 10.8, z - 9.7], name === 'MAGAZINE' ? 0xef4d9a : 0x1499ff, room);
    ceilingLight([x, 10, z], 0xffffff, 16, room);
  });
}

function createSwitcher() {
  const g = new THREE.Group(); g.name = 'Switcher Master'; g.position.set(-62, 0, -120); scene.add(g);
  box('Floor', [52, 0.5, 36], [0, 0.25, 0], MAT.dark, g);
  box('BackWall', [52, 14, 0.5], [0, 7, -18], MAT.dark, g);
  box('Desk', [40, 3.2, 8], [0, 1.6, 7], new THREE.MeshStandardMaterial({ color: 0x222a35, metalness: .35, roughness: .35 }), g);
  sign('SWITCHER MASTER', 22, 3.5, [0, 11.3, -17.72], 0, '#064ca8', g);
  studioNames.forEach((name, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    sign(name, 10, 4.2, [-16.5 + col * 11, 7.8 - row * 4.7, -17.7], 0, '#05285c', g);
  });
  for (let i = 0; i < 5; i++) sign('CAM ' + (i + 1), 6.5, 3.2, [-14 + i * 7, 4.2, 2.8], 0, '#07162d', g);
  ['BLACKOUT', 'TELÕES', 'LUZES', 'NO AR'].forEach((t, i) => sign(t, 6.2, 2.3, [-10 + i * 7, 2.6, 2.8], 0, i === 0 ? '#7f0b14' : i === 3 ? '#b30c1c' : '#0757bb', g));
  for (const p of [[-18, 12, 2], [0, 12, 2], [18, 12, 2]]) ceilingLight(p, 0xcce9ff, 18, g);
}

createFacade();
createReception();
createCorridorAndRooms();
createSwitcher();

const floorZones = [
  { name: 'Fachada', minZ: 10 },
  { name: 'Recepção', minZ: -50 },
  { name: 'Corredores e Estúdios', minZ: -190 },
  { name: 'Área técnica', minZ: -999 }
];

const keys = new Set();
addEventListener('keydown', e => keys.add(e.code));
addEventListener('keyup', e => keys.delete(e.code));

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

function updateMovement(dt) {
  if (!controls.isLocked) return;
  const speed = keys.has('ShiftLeft') ? 12 : 7;
  direction.set(0, 0, 0);
  if (keys.has('KeyW')) direction.z -= 1;
  if (keys.has('KeyS')) direction.z += 1;
  if (keys.has('KeyA')) direction.x -= 1;
  if (keys.has('KeyD')) direction.x += 1;
  if (direction.lengthSq() > 0) direction.normalize();
  velocity.x = direction.x * speed * dt;
  velocity.z = direction.z * speed * dt;
  controls.moveRight(velocity.x);
  controls.moveForward(-velocity.z);
  camera.position.y = 1.75;
  const z = camera.position.z;
  const zone = floorZones.find(v => z >= v.minZ) || floorZones[floorZones.length - 1];
  locationLabel.textContent = zone.name;
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
