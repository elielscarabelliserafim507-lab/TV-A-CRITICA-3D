import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.getElementById('game');
const loading = document.getElementById('loading');
const startPanel = document.getElementById('startPanel');
const startButton = document.getElementById('startButton');
const locationLabel = document.getElementById('location');
const mobileControls = document.getElementById('mobileControls');
const joystick = document.getElementById('joystick');
const joystickKnob = document.getElementById('joystickKnob');
const lookPad = document.getElementById('lookPad');
const runButton = document.getElementById('runButton');

window.addEventListener('error', e => {
  loading.style.display = 'grid';
  loading.textContent = 'Erro ao carregar o jogo: ' + (e.message || 'erro desconhecido');
});

const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 130, 460);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 900);
camera.position.set(0, 1.75, 45);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.25 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !isTouch;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

let yaw = 0, pitch = 0, locked = false, mobileActive = false, running = false, joyX = 0, joyY = 0;
let currentMode = { type: 'full', restrictOtherStudios: false };

function applyLook(dx, dy, factor = 0.0022) {
  yaw -= dx * factor;
  pitch -= dy * factor;
  pitch = Math.max(-1.42, Math.min(1.42, pitch));
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

if (isTouch) {
  document.body.classList.add('mobile');
  mobileControls.style.display = 'block';
  startButton.addEventListener('click', () => { mobileActive = true; startPanel.style.display = 'none'; });
} else {
  startButton.addEventListener('click', () => canvas.requestPointerLock());
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas;
    startPanel.style.display = locked ? 'none' : 'flex';
  });
  document.addEventListener('mousemove', e => { if (locked) applyLook(e.movementX, e.movementY); });
}

function setupTouch() {
  let joyId = null;
  const radius = 42;
  joystick.addEventListener('pointerdown', e => { joyId = e.pointerId; joystick.setPointerCapture(e.pointerId); moveJoy(e); });
  joystick.addEventListener('pointermove', e => { if (e.pointerId === joyId) moveJoy(e); });
  function resetJoy(){ joyId=null; joyX=0; joyY=0; joystickKnob.style.transform='translate(0,0)'; }
  joystick.addEventListener('pointerup', resetJoy); joystick.addEventListener('pointercancel', resetJoy);
  function moveJoy(e){ const r=joystick.getBoundingClientRect(); let dx=e.clientX-r.left-r.width/2, dy=e.clientY-r.top-r.height/2; const len=Math.hypot(dx,dy); if(len>radius){dx=dx/len*radius;dy=dy/len*radius;} joyX=dx/radius;joyY=dy/radius;joystickKnob.style.transform=`translate(${dx}px,${dy}px)`; }

  let lookId=null,lastX=0,lastY=0;
  lookPad.addEventListener('pointerdown',e=>{lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;lookPad.setPointerCapture(e.pointerId);});
  lookPad.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||!mobileActive)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;applyLook(dx,dy,.0042);});
  const stopLook=()=>lookId=null; lookPad.addEventListener('pointerup',stopLook);lookPad.addEventListener('pointercancel',stopLook);
  runButton.addEventListener('pointerdown',()=>{running=true;runButton.classList.add('active');});
  const stopRun=()=>{running=false;runButton.classList.remove('active');}; runButton.addEventListener('pointerup',stopRun);runButton.addEventListener('pointercancel',stopRun);
}
if(isTouch) setupTouch();

const hemi = new THREE.HemisphereLight(0xbad9ff,0x17202c,1.3); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff,2.1); sun.position.set(-45,65,35); sun.castShadow=!isTouch; scene.add(sun);

const MAT={
  white:new THREE.MeshStandardMaterial({color:0xf3f6f9,roughness:.5}),
  dark:new THREE.MeshStandardMaterial({color:0x101825,roughness:.42}),
  black:new THREE.MeshStandardMaterial({color:0x050810,roughness:.35}),
  blue:new THREE.MeshStandardMaterial({color:0x0b58c7,roughness:.3}),
  glass:new THREE.MeshPhysicalMaterial({color:0x183b57,transparent:true,opacity:.46,roughness:.08}),
  wood:new THREE.MeshStandardMaterial({color:0x7b5639,roughness:.62}),
  glossyBlue:new THREE.MeshPhysicalMaterial({color:0x061b3e,roughness:.1,metalness:.3,clearcoat:1,clearcoatRoughness:.08}),
  silver:new THREE.MeshStandardMaterial({color:0xb8c5d3,metalness:.55,roughness:.25})
};

function box(name,size,pos,material,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);m.castShadow=!isTouch;m.receiveShadow=true;parent.add(m);return m;}
function led(size,pos,color=0x1bb7ff,parent=scene){const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2.7,roughness:.12});return box('LED',size,pos,mat,parent);}
function point(pos,color=0xffffff,intensity=18,parent=scene,range=22){const l=new THREE.PointLight(color,intensity,range,2);l.position.set(...pos);parent.add(l);return l;}

function textTexture(text,bg='#063b93',fg='#fff'){const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.font='bold 82px Arial';const lines=text.split('\n');lines.forEach((line,i)=>x.fillText(line,c.width/2,c.height/2+(i-(lines.length-1)/2)*92));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function sign(text,w,h,pos,rotY=0,bg='#063b93',parent=scene){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,bg),side:THREE.DoubleSide}));m.position.set(...pos);m.rotation.y=rotY;parent.add(m);return m;}

// Textura animada do NOVO ALERTA: fundo azul com linhas em movimento + marca central.
const alertCanvas=document.createElement('canvas'); alertCanvas.width=1536; alertCanvas.height=768;
const actx=alertCanvas.getContext('2d');
const alertTexture=new THREE.CanvasTexture(alertCanvas); alertTexture.colorSpace=THREE.SRGBColorSpace;
function drawAlertTexture(time=0){
  const w=alertCanvas.width,h=alertCanvas.height;
  const g=actx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#03256b');g.addColorStop(.45,'#0b8ee6');g.addColorStop(1,'#0235a5');actx.fillStyle=g;actx.fillRect(0,0,w,h);
  actx.save(); actx.globalCompositeOperation='screen';
  for(let i=0;i<34;i++){
    const y=(i*29+(time*.08+i*17)%h)%h; const xoff=((time*.22+i*93)%(w+500))-250;
    actx.strokeStyle=`rgba(80,210,255,${.14+(i%4)*.05})`;actx.lineWidth=1+(i%3);
    actx.beginPath();actx.moveTo(-220+xoff*.12,y);actx.lineTo(w+260,y-110+(i%7)*22);actx.stroke();
  }
  for(let i=0;i<12;i++){actx.strokeStyle='rgba(100,230,255,.12)';actx.beginPath();actx.arc(w*.55,h*.55,160+i*42,Math.PI*1.05+time*.00015,Math.PI*1.78+time*.00015);actx.stroke();}
  actx.restore();
  const glow=actx.createRadialGradient(w*.5,h*.48,20,w*.5,h*.48,520);glow.addColorStop(0,'rgba(135,235,255,.55)');glow.addColorStop(1,'rgba(0,80,255,0)');actx.fillStyle=glow;actx.fillRect(0,0,w,h);
  // NOVO
  actx.save();actx.translate(w*.23,h*.31);actx.transform(1,0,-.12,1,0,0);actx.fillStyle='#e30b19';actx.fillRect(0,0,305,92);actx.strokeStyle='#e8eef5';actx.lineWidth=7;actx.strokeRect(0,0,305,92);actx.fillStyle='#fff';actx.font='italic 700 67px Arial';actx.textAlign='center';actx.textBaseline='middle';actx.fillText('NOVO',150,47);actx.fillStyle='#e30b19';actx.fillRect(320,0,18,92);actx.fillRect(350,0,18,92);actx.restore();
  // ALERTA
  actx.save();actx.textAlign='center';actx.textBaseline='middle';actx.font='900 215px Arial Black, Arial';actx.lineWidth=12;actx.strokeStyle='#01256e';actx.strokeText('ALERTA',w*.52,h*.56);const tg=actx.createLinearGradient(0,h*.4,0,h*.7);tg.addColorStop(0,'#1ca8ff');tg.addColorStop(.52,'#0b63ee');tg.addColorStop(1,'#0131a1');actx.fillStyle=tg;actx.fillText('ALERTA',w*.52,h*.56);actx.restore();
  actx.fillStyle='rgba(10,20,40,.82)';actx.font='italic 48px Arial';actx.textAlign='right';actx.fillText('com Sikêra Jr.',w*.83,h*.72);
  alertTexture.needsUpdate=true;
}

drawAlertTexture(0);

function createFacade(){
  const g=new THREE.Group();g.name='Fachada';scene.add(g);
  box('Ground',[125,1,90],[0,-.5,10],new THREE.MeshStandardMaterial({color:0x3a4148,roughness:1}),g);
  box('Building',[94,16,28],[0,8,-4],MAT.white,g);box('BlueBand',[94,6.5,.7],[0,10.5,10.35],MAT.blue,g);
  for(let i=-5;i<=3;i++)box('Window',[7.2,5.5,.3],[i*8.2,6.1,10.72],MAT.glass,g);
  box('EntranceTower',[18,18,4],[35,9,11.7],MAT.blue,g);box('Door',[10.5,8,.35],[35,4.2,13.9],MAT.glass,g);sign('TV A CRÍTICA',13,4.5,[35,13.2,13.94],0,'#0757bb',g);
}

function createReception(){
  const g=new THREE.Group();g.name='Recepcao';g.position.set(0,0,-33);scene.add(g);
  box('Floor',[58,.5,34],[0,.25,0],new THREE.MeshStandardMaterial({color:0x8a9098,roughness:.22}),g);box('BackWall',[58,14,.5],[0,7,-17],MAT.white,g);
  box('ReceptionDesk',[18,4.5,5.5],[17,2.25,5],MAT.blue,g);sign('TV A CRÍTICA',14,5.2,[17,8.7,-16.72],0,'#0757bb',g);sign('TELÃO DA RECEPÇÃO',19,9,[-15,7.5,-16.72],0,'#06173d',g);
  box('SofaBase',[20,2.2,5.5],[-8,1.1,7],new THREE.MeshStandardMaterial({color:0xd9d5cf,roughness:.9}),g);box('SofaBack',[20,5,1.3],[-8,3.5,9],new THREE.MeshStandardMaterial({color:0xd9d5cf,roughness:.9}),g);box('CoffeeTable',[7,1.3,4],[-8,.9,0],MAT.wood,g);led([42,.15,.15],[0,12.8,-16.4],0x1c9fff,g);point([0,11,-4],0xeef7ff,isTouch?14:22,g);
}

function createCorridor(){const g=new THREE.Group();g.name='Corredor';g.position.set(0,0,-68);scene.add(g);box('Floor',[18,.4,80],[0,.2,-30],new THREE.MeshStandardMaterial({color:0x777e86,roughness:.25}),g);box('WallL',[.5,13,80],[-9,6.5,-30],MAT.white,g);box('WallR',[.5,13,80],[9,6.5,-30],MAT.white,g);led([.16,.16,76],[-8.65,11.7,-30],0x128cff,g);led([.16,.16,76],[8.65,11.7,-30],0x128cff,g);}

function createAlerta(){
  const g=new THREE.Group();g.name='Estudio Novo Alerta';g.position.set(-28,0,-104);scene.add(g);
  // dimensões e composição baseadas diretamente na imagem de referência: piso escuro brilhante, faixa branca à esquerda, painel principal em L e telão vertical à direita.
  box('Piso',[48,.55,34],[0,.28,0],MAT.glossyBlue,g);box('FaixaBrancaPiso',[11,.08,33],[-18.5,.59,0],MAT.white,g);
  box('ParedeFundo',[48,16,.6],[0,8,-17],MAT.black,g);box('ParedeEsq',[.6,16,34],[-24,8,0],MAT.white,g);box('ParedeDir',[.6,16,34],[24,8,0],MAT.dark,g);box('Teto',[48,.6,34],[0,16.1,0],MAT.black,g);
  box('VigaBrancaTop',[41,.8,.9],[-1,14.5,-15.7],MAT.white,g);box('VigaBrancaEsq',[.9,13,.9],[-20.8,8,-15.7],MAT.white,g);
  led([40,.18,.18],[-1,13.95,-15.1],0x169dff,g);led([40,.14,.14],[-1,.78,-15.2],0x169dff,g);
  // Telão principal frontal
  const screenMat=new THREE.MeshBasicMaterial({map:alertTexture,side:THREE.DoubleSide,toneMapped:false});
  const main=new THREE.Mesh(new THREE.PlaneGeometry(29,11.8),screenMat);main.position.set(-5.3,8.1,-16.62);g.add(main);
  // continuação lateral em L
  const side=new THREE.Mesh(new THREE.PlaneGeometry(10.5,11.8),screenMat.clone());side.position.set(14.45,8.1,-11.4);side.rotation.y=-Math.PI/2;g.add(side);
  // telão vertical direito
  const vertical=new THREE.Mesh(new THREE.PlaneGeometry(10.5,13.2),screenMat.clone());vertical.position.set(20.8,8.4,1.8);vertical.rotation.y=-.15;g.add(vertical);
  // molduras escuras
  box('MoldTop',[31,.55,.7],[-5.3,14.25,-16.25],MAT.black,g);box('MoldBottom',[31,.55,.7],[-5.3,1.95,-16.25],MAT.black,g);box('MoldLeft',[.65,12.8,.7],[-20.8,8.1,-16.25],MAT.black,g);
  // colunas azuis e brancas entre os painéis, como na referência
  for(let i=0;i<5;i++){box('ColunaAzul',[1.15,13,1.4],[10.4+i*2.3,8,-15],MAT.blue,g);led([.14,11.8,.12],[9.85+i*2.3,8,-14.2],0x27a8ff,g);}
  for(let i=0;i<8;i++)box('RipaEsq',[.35,11.5,.5],[-22.9,7.6,-12.5+i*1.8],MAT.white,g);
  for(let i=0;i<6;i++)box('PainelDir',[.42,12.5,1.2],[23.2,8,-11+i*4.2],MAT.dark,g);
  // refletores de teto visíveis
  const spots=[[-15,15.35,0],[-5,15.35,2],[7,15.35,1],[16,15.35,-2]];
  spots.forEach((p,i)=>{box('Refletor'+i,[2.2,.55,1.8],p,MAT.black,g);point([p[0],13.8,p[2]],0xe8f6ff,isTouch?11:20,g,18);});
  point([12,7,-4],0x178cff,isTouch?9:16,g,20);
}

createFacade();createReception();createCorridor();createAlerta();

window.addEventListener('tvacritica:start',e=>{
  currentMode=e.detail||{type:'full'};
  if(currentMode.type==='program') camera.position.set(0,1.75,-28);
  else camera.position.set(0,1.75,45);
  if(isTouch){mobileActive=true;startPanel.style.display='none';}
  else { startPanel.style.display='flex'; startButton.textContent='ENTRAR'; }
});

const keys=new Set();addEventListener('keydown',e=>keys.add(e.code));addEventListener('keyup',e=>keys.delete(e.code));const clock=new THREE.Clock();
function updateMovement(dt){
  if(!(locked||mobileActive))return;
  let dx=0,dz=0;if(isTouch){dx=joyX;dz=joyY;}else{if(keys.has('KeyW'))dz=-1;if(keys.has('KeyS'))dz=1;if(keys.has('KeyA'))dx=-1;if(keys.has('KeyD'))dx=1;}
  const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const speed=(running||keys.has('ShiftLeft'))?12:7;
  const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));camera.position.addScaledVector(f,-dz*speed*dt);camera.position.addScaledVector(r,dx*speed*dt);camera.position.y=1.75;
  const z=camera.position.z;if(z>10)locationLabel.textContent='Fachada';else if(z>-55)locationLabel.textContent='Recepção';else if(z>-100)locationLabel.textContent='Corredores';else locationLabel.textContent=currentMode.type==='program'?'Estúdio '+(currentMode.programName||'selecionado'):'Estúdios';
}

function animate(t=0){requestAnimationFrame(animate);drawAlertTexture(t);updateMovement(Math.min(clock.getDelta(),.05));renderer.render(scene,camera);} 
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
loading.style.display='none';animate();
