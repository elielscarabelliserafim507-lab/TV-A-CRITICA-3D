import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.getElementById('game');
const loading=document.getElementById('loading');
const startPanel=document.getElementById('startPanel');
const startButton=document.getElementById('startButton');
const locationLabel=document.getElementById('location');
const mobileControls=document.getElementById('mobileControls');
const joystick=document.getElementById('joystick');
const joystickKnob=document.getElementById('joystickKnob');
const lookPad=document.getElementById('lookPad');
const runButton=document.getElementById('runButton');

window.addEventListener('error',e=>{loading.style.display='grid';loading.textContent='Erro ao carregar o jogo: '+(e.message||'erro desconhecido');});
window.addEventListener('unhandledrejection',e=>{loading.style.display='grid';loading.textContent='Erro ao carregar o jogo: '+(e.reason?.message||e.reason||'erro desconhecido');});

const isTouch=matchMedia('(pointer: coarse)').matches||'ontouchstart' in window;
const lowPower=isTouch||Math.min(innerWidth,innerHeight)<700;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x07111f);
scene.fog=new THREE.Fog(0x07111f,130,430);

const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,800);
camera.position.set(0,1.75,45);
camera.rotation.order='YXZ';

const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowPower,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?.95:1.55));
renderer.setSize(innerWidth,innerHeight,false);
renderer.shadowMap.enabled=!lowPower;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;

let yaw=0,pitch=0,locked=false,mobileActive=false,running=false,joyX=0,joyY=0;
let currentMode={type:'full',restrictOtherStudios:false};

function applyLook(dx,dy,factor=.0022){yaw-=dx*factor;pitch-=dy*factor;pitch=Math.max(-1.42,Math.min(1.42,pitch));camera.rotation.y=yaw;camera.rotation.x=pitch;}

if(isTouch){document.body.classList.add('mobile');mobileControls.style.display='block';startButton.addEventListener('click',()=>{mobileActive=true;startPanel.style.display='none';});}
else{startButton.addEventListener('click',()=>canvas.requestPointerLock());document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;startPanel.style.display=locked?'none':'flex';});document.addEventListener('mousemove',e=>{if(locked)applyLook(e.movementX,e.movementY);});}

function setupTouch(){let joyId=null;const radius=42;const moveJoy=e=>{const r=joystick.getBoundingClientRect();let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;const len=Math.hypot(dx,dy);if(len>radius){dx=dx/len*radius;dy=dy/len*radius;}joyX=dx/radius;joyY=dy/radius;joystickKnob.style.transform=`translate(${dx}px,${dy}px)`;};const resetJoy=()=>{joyId=null;joyX=0;joyY=0;joystickKnob.style.transform='translate(0,0)';};joystick.addEventListener('pointerdown',e=>{joyId=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoy(e);});joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyId)moveJoy(e);});joystick.addEventListener('pointerup',resetJoy);joystick.addEventListener('pointercancel',resetJoy);
let lookId=null,lastX=0,lastY=0;lookPad.addEventListener('pointerdown',e=>{lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;lookPad.setPointerCapture(e.pointerId);});lookPad.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||!mobileActive)return;applyLook(e.clientX-lastX,e.clientY-lastY,.004);lastX=e.clientX;lastY=e.clientY;});const stopLook=()=>lookId=null;lookPad.addEventListener('pointerup',stopLook);lookPad.addEventListener('pointercancel',stopLook);runButton.addEventListener('pointerdown',()=>{running=true;runButton.classList.add('active');});const stopRun=()=>{running=false;runButton.classList.remove('active');};runButton.addEventListener('pointerup',stopRun);runButton.addEventListener('pointercancel',stopRun);}
if(isTouch)setupTouch();

const hemi=new THREE.HemisphereLight(0xbad9ff,0x17202c,lowPower?.95:1.25);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,lowPower?1.35:1.85);sun.position.set(-45,65,35);sun.castShadow=!lowPower;scene.add(sun);

const MAT={
 white:new THREE.MeshStandardMaterial({color:0xf3f6f9,roughness:.5}),
 dark:new THREE.MeshStandardMaterial({color:0x101825,roughness:.42}),
 black:new THREE.MeshStandardMaterial({color:0x050810,roughness:.35}),
 blue:new THREE.MeshStandardMaterial({color:0x0b58c7,roughness:.3}),
 glass:new THREE.MeshPhysicalMaterial({color:0x183b57,transparent:true,opacity:.42,roughness:.1}),
 wood:new THREE.MeshStandardMaterial({color:0x7b5639,roughness:.62}),
 glossyBlue:new THREE.MeshPhysicalMaterial({color:0x061b3e,roughness:.12,metalness:.22,clearcoat:lowPower?.45:1,clearcoatRoughness:.1}),
 silver:new THREE.MeshStandardMaterial({color:0xb8c5d3,metalness:.45,roughness:.28})
};

function box(name,size,pos,material,parent=scene,rotY=0){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);m.rotation.y=rotY;m.castShadow=!lowPower;m.receiveShadow=!lowPower;parent.add(m);return m;}
function led(size,pos,color=0x1bb7ff,parent=scene,rotY=0){const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:lowPower?1.7:2.6,roughness:.14});return box('LED',size,pos,mat,parent,rotY);}
function point(pos,color=0xffffff,intensity=18,parent=scene,range=22){if(lowPower&&parent.name!=='Estudio Novo Alerta')return null;const l=new THREE.PointLight(color,lowPower?intensity*.55:intensity,range,2);l.position.set(...pos);parent.add(l);return l;}

function textTexture(text,bg='#063b93',fg='#fff'){const c=document.createElement('canvas');c.width=768;c.height=384;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.font='bold 62px Arial';const lines=text.split('\n');lines.forEach((line,i)=>x.fillText(line,c.width/2,c.height/2+(i-(lines.length-1)/2)*72));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function sign(text,w,h,pos,rotY=0,bg='#063b93',parent=scene){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,bg),side:THREE.DoubleSide,toneMapped:false}));m.position.set(...pos);m.rotation.y=rotY;parent.add(m);return m;}

const alertCanvas=document.createElement('canvas');alertCanvas.width=lowPower?896:1280;alertCanvas.height=lowPower?448:640;const actx=alertCanvas.getContext('2d');const alertTexture=new THREE.CanvasTexture(alertCanvas);alertTexture.colorSpace=THREE.SRGBColorSpace;
function drawAlertTexture(time=0){const w=alertCanvas.width,h=alertCanvas.height;const g=actx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#03256b');g.addColorStop(.45,'#12a6ee');g.addColorStop(1,'#0235a5');actx.fillStyle=g;actx.fillRect(0,0,w,h);actx.save();actx.globalCompositeOperation='screen';const count=lowPower?18:30;for(let i=0;i<count;i++){const y=(i*(h/count)+(time*.04+i*13)%h)%h;const xoff=((time*.1+i*77)%(w+300))-150;actx.strokeStyle=`rgba(95,220,255,${.12+(i%3)*.05})`;actx.lineWidth=1+(i%2);actx.beginPath();actx.moveTo(-160+xoff*.12,y);actx.lineTo(w+180,y-80+(i%6)*16);actx.stroke();}actx.restore();const glow=actx.createRadialGradient(w*.5,h*.46,10,w*.5,h*.46,w*.42);glow.addColorStop(0,'rgba(160,240,255,.5)');glow.addColorStop(1,'rgba(0,80,255,0)');actx.fillStyle=glow;actx.fillRect(0,0,w,h);
actx.save();actx.translate(w*.25,h*.28);actx.transform(1,0,-.12,1,0,0);actx.fillStyle='#e30b19';actx.fillRect(0,0,w*.2,h*.12);actx.strokeStyle='#eef4f8';actx.lineWidth=5;actx.strokeRect(0,0,w*.2,h*.12);actx.fillStyle='#fff';actx.font=`italic 700 ${Math.round(h*.09)}px Arial`;actx.textAlign='center';actx.textBaseline='middle';actx.fillText('NOVO',w*.1,h*.06);actx.fillStyle='#e30b19';actx.fillRect(w*.21,0,w*.012,h*.12);actx.fillRect(w*.23,0,w*.012,h*.12);actx.restore();
actx.save();actx.textAlign='center';actx.textBaseline='middle';actx.font=`900 ${Math.round(h*.28)}px Arial Black,Arial`;actx.lineWidth=8;actx.strokeStyle='#01256e';actx.strokeText('ALERTA',w*.52,h*.57);const tg=actx.createLinearGradient(0,h*.4,0,h*.72);tg.addColorStop(0,'#29b8ff');tg.addColorStop(.52,'#0b63ee');tg.addColorStop(1,'#0131a1');actx.fillStyle=tg;actx.fillText('ALERTA',w*.52,h*.57);actx.restore();actx.fillStyle='rgba(12,20,38,.85)';actx.font=`italic ${Math.round(h*.06)}px Arial`;actx.textAlign='right';actx.fillText('com Sikêra Jr.',w*.84,h*.74);alertTexture.needsUpdate=true;}
drawAlertTexture(0);

function createFacade(){const g=new THREE.Group();g.name='Fachada';scene.add(g);box('Ground',[125,1,90],[0,-.5,10],new THREE.MeshStandardMaterial({color:0x3a4148,roughness:1}),g);box('Building',[94,16,28],[0,8,-4],MAT.white,g);box('BlueBand',[94,6.5,.7],[0,10.5,10.35],MAT.blue,g);for(let i=-5;i<=3;i++)box('Window',[7.2,5.5,.3],[i*8.2,6.1,10.72],MAT.glass,g);box('EntranceTower',[18,18,4],[35,9,11.7],MAT.blue,g);box('Door',[10.5,8,.35],[35,4.2,13.9],MAT.glass,g);sign('TV A CRÍTICA',13,4.5,[35,13.2,13.94],0,'#0757bb',g);}

function createReception(){const g=new THREE.Group();g.name='Recepcao';g.position.set(0,0,-33);scene.add(g);box('Floor',[58,.5,34],[0,.25,0],new THREE.MeshStandardMaterial({color:0x8a9098,roughness:.22}),g);box('BackWall',[58,14,.5],[0,7,-17],MAT.white,g);box('ReceptionDesk',[18,4.5,5.5],[17,2.25,5],MAT.blue,g);sign('TV A CRÍTICA',14,5.2,[17,8.7,-16.72],0,'#0757bb',g);sign('TELÃO DA RECEPÇÃO',19,9,[-15,7.5,-16.72],0,'#06173d',g);box('SofaBase',[20,2.2,5.5],[-8,1.1,7],new THREE.MeshStandardMaterial({color:0xd9d5cf,roughness:.9}),g);box('SofaBack',[20,5,1.3],[-8,3.5,9],new THREE.MeshStandardMaterial({color:0xd9d5cf,roughness:.9}),g);box('CoffeeTable',[7,1.3,4],[-8,.9,0],MAT.wood,g);led([42,.15,.15],[0,12.8,-16.4],0x1c9fff,g);point([0,11,-4],0xeef7ff,18,g);}
function createCorridor(){const g=new THREE.Group();g.name='Corredor';g.position.set(0,0,-68);scene.add(g);box('Floor',[18,.4,80],[0,.2,-30],new THREE.MeshStandardMaterial({color:0x777e86,roughness:.25}),g);box('WallL',[.5,13,80],[-9,6.5,-30],MAT.white,g);box('WallR',[.5,13,80],[9,6.5,-30],MAT.white,g);led([.16,.16,76],[-8.65,11.7,-30],0x128cff,g);led([.16,.16,76],[8.65,11.7,-30],0x128cff,g);}

function createAlerta(){
 const g=new THREE.Group();g.name='Estudio Novo Alerta';g.position.set(-28,0,-104);scene.add(g);
 // piso principal escuro e brilhante, com área branca ampla do lado esquerdo como na referência
 box('PisoEscuro',[48,.55,34],[0,.28,0],MAT.glossyBlue,g);
 box('PisoBrancoAmplo',[14,.09,34],[-17,.6,0],MAT.white,g,-.04);
 // estrutura completa do estúdio
 box('ParedeFundo',[48,16,.6],[0,8,-17],MAT.black,g);box('ParedeEsq',[.6,16,34],[-24,8,0],MAT.white,g);box('ParedeDir',[.6,16,34],[24,8,0],MAT.dark,g);box('Teto',[48,.6,34],[0,16.1,0],MAT.black,g);
 // L branco grande: coluna sobe e vira no teto
 box('LuzL_Coluna',[1.05,14,.95],[-21,8,-15.7],MAT.white,g);
 box('LuzL_Teto',[40,.95,.95],[-1.45,14.55,-15.7],MAT.white,g);
 // linha azul-clara interna acompanhando o L
 led([.2,12.6,.18],[-20.45,8,-15.12],0x66d9ff,g);
 led([37.8,.18,.18],[-1.45,14,-15.12],0x66d9ff,g);
 // segunda linha azul no teto, mais para dentro
 led([34,.16,.16],[-1,13.5,-13.9],0x168dff,g);
 // telão principal + retorno lateral formando L real
 const screenMat=new THREE.MeshBasicMaterial({map:alertTexture,side:THREE.DoubleSide,toneMapped:false});
 const main=new THREE.Mesh(new THREE.PlaneGeometry(28.5,11.4),screenMat);main.position.set(-5.6,8.05,-16.63);g.add(main);
 const returnScreen=new THREE.Mesh(new THREE.PlaneGeometry(7.8,11.4),screenMat.clone());returnScreen.position.set(12.55,8.05,-12.75);returnScreen.rotation.y=-Math.PI/2;g.add(returnScreen);
 // moldura que acompanha o L do telão
 box('MolduraTopo',[30.2,.55,.65],[-5.55,14,-16.2],MAT.black,g);box('MolduraBaixo',[30.2,.55,.65],[-5.55,2.1,-16.2],MAT.black,g);box('MolduraEsq',[.6,12,.65],[-20.7,8.05,-16.2],MAT.black,g);
 box('MolduraRetornoTopo',[.65,.55,7.8],[12.75,14,-12.35],MAT.black,g);box('MolduraRetornoBaixo',[.65,.55,7.8],[12.75,2.1,-12.35],MAT.black,g);
 // telão vertical da direita: menor e totalmente dentro do cenário
 const vertical=new THREE.Mesh(new THREE.PlaneGeometry(8.4,11.8),screenMat.clone());vertical.position.set(19.2,8.2,-.8);vertical.rotation.y=-.1;g.add(vertical);
 box('MolduraVertical',[9.1,12.5,.65],[19.2,8.2,-1.15],MAT.black,g,-.1);
 // pilares e acabamento direito
 for(let i=0;i<4;i++){box('ColunaAzul',[1.05,12.7,1.25],[10.1+i*2.15,8,-14.85],MAT.blue,g);led([.12,11.5,.12],[9.62+i*2.15,8,-14.12],0x29a9ff,g);}
 for(let i=0;i<7;i++)box('RipaEsq',[.35,11.3,.5],[-22.8,7.55,-12.4+i*1.85],MAT.white,g);
 for(let i=0;i<5;i++)box('PainelDir',[.4,12.2,1.15],[23.1,8,-10+i*4.1],MAT.dark,g);
 // refletores visíveis; menos luzes dinâmicas no telefone, sem perder desenho
 const spots=[[-14.5,15.25,0],[-4.5,15.25,2],[6.5,15.25,1],[15,15.25,-1.5]];
 spots.forEach((p,i)=>{box('Refletor'+i,[2.1,.5,1.7],p,MAT.black,g);if(!lowPower||i<2)point([p[0],13.7,p[2]],0xe8f6ff,18,g,17);});
 if(!lowPower)point([10,7,-4],0x178cff,13,g,18);
}

createFacade();createReception();createCorridor();createAlerta();

window.addEventListener('tvacritica:start',e=>{currentMode=e.detail||{type:'full'};camera.position.set(0,1.75,currentMode.type==='program'?-28:45);if(isTouch){mobileActive=true;startPanel.style.display='none';}else{startPanel.style.display='flex';startButton.textContent='ENTRAR';}});

const keys=new Set();addEventListener('keydown',e=>keys.add(e.code));addEventListener('keyup',e=>keys.delete(e.code));const clock=new THREE.Clock();
function updateMovement(dt){if(!(locked||mobileActive))return;let dx=0,dz=0;if(isTouch){dx=joyX;dz=joyY;}else{if(keys.has('KeyW'))dz=-1;if(keys.has('KeyS'))dz=1;if(keys.has('KeyA'))dx=-1;if(keys.has('KeyD'))dx=1;}const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const speed=(running||keys.has('ShiftLeft'))?13:8;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));camera.position.addScaledVector(f,-dz*speed*dt);camera.position.addScaledVector(r,dx*speed*dt);camera.position.y=1.75;const z=camera.position.z;if(z>10)locationLabel.textContent='Fachada';else if(z>-55)locationLabel.textContent='Recepção';else if(z>-100)locationLabel.textContent='Corredores';else locationLabel.textContent=currentMode.type==='program'?'Estúdio '+(currentMode.programName||'selecionado'):'Estúdios';}

let lastAlertUpdate=-Infinity;const alertFrameMs=lowPower?90:55;
function animate(t=0){requestAnimationFrame(animate);if(t-lastAlertUpdate>=alertFrameMs){drawAlertTexture(t);lastAlertUpdate=t;}updateMovement(Math.min(clock.getDelta(),.033));renderer.render(scene,camera);}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?.95:1.55));renderer.setSize(innerWidth,innerHeight,false);});
loading.style.display='none';animate();
