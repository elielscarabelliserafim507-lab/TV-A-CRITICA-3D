import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTimeCycle } from './time-cycle.js';
import { createProgramMenu } from './program-menu.js';

const canvas=document.getElementById('game');
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x69c7ff,85,210);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
camera.position.set(48,20,52);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.055;controls.minDistance=5;controls.maxDistance=145;controls.maxPolarAngle=Math.PI*.49;controls.target.set(2,5,0);
const timeCycle=createTimeCycle(scene,renderer);

const mats={
  blue:new THREE.MeshStandardMaterial({color:0x062f92,roughness:.64,metalness:.04}),
  blue2:new THREE.MeshStandardMaterial({color:0x0b4dc5,roughness:.58}),
  cyan:new THREE.MeshStandardMaterial({color:0x15c8ef,emissive:0x007cb9,emissiveIntensity:.35,roughness:.35}),
  white:new THREE.MeshStandardMaterial({color:0xf4f6fa,roughness:.72}),
  dark:new THREE.MeshStandardMaterial({color:0x111722,roughness:.42,metalness:.25}),
  glass:new THREE.MeshStandardMaterial({color:0x102b49,roughness:.12,metalness:.25,transparent:true,opacity:.74}),
  concrete:new THREE.MeshStandardMaterial({color:0xd6d8d7,roughness:.92}),
  road:new THREE.MeshStandardMaterial({color:0x303238,roughness:1}),
  brick:new THREE.MeshStandardMaterial({color:0xa45e43,roughness:.92}),
  green:new THREE.MeshStandardMaterial({color:0x2e7b27,roughness:.9}),
  leaf:new THREE.MeshStandardMaterial({color:0x31851f,roughness:.85}),
  trunk:new THREE.MeshStandardMaterial({color:0x5b3a26,roughness:1}),
  metal:new THREE.MeshStandardMaterial({color:0x9ea8b3,roughness:.35,metalness:.8}),
  tire:new THREE.MeshStandardMaterial({color:0x111111,roughness:.85}),
  red:new THREE.MeshStandardMaterial({color:0xc82525,roughness:.55})
};
function box(name,size,pos,mat=mats.white,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m;}
function cyl(name,r1,r2,h,pos,mat=mats.white,segments=16){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
function plane(name,size,pos,mat,rot=[-Math.PI/2,0,0]){const m=new THREE.Mesh(new THREE.PlaneGeometry(...size),mat);m.name=name;m.position.set(...pos);m.rotation.set(...rot);m.receiveShadow=true;scene.add(m);return m;}
function label(text,w=768,h=220){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.clearRect(0,0,w,h);x.shadowColor='#16dfff';x.shadowBlur=30;x.fillStyle='#73ecff';x.font='900 120px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});}
function logoDisc(scale,pos){const g=new THREE.Group();const disc=new THREE.Mesh(new THREE.CylinderGeometry(scale,scale,.28,48),new THREE.MeshStandardMaterial({color:0x0eb7e8,emissive:0x0869cc,emissiveIntensity:.8,metalness:.25,roughness:.3}));disc.rotation.x=Math.PI/2;g.add(disc);[-.42,0,.42].forEach((x,i)=>{const head=new THREE.Mesh(new THREE.SphereGeometry(scale*.15,16,12),mats.white);head.position.set(x*scale,scale*.13,.19);g.add(head);const body=new THREE.Mesh(new THREE.CylinderGeometry(scale*.09,scale*.18,scale*.54,8),mats.white);body.position.set(x*scale,-scale*.18,.19);g.add(body)});g.position.set(...pos);scene.add(g);return g;}
function lamp(x,z,h=1.2){box('luminaria',[.34,.34,.34],[x,h,z],new THREE.MeshStandardMaterial({color:0xf6f1d1,emissive:0xffd878,emissiveIntensity:.25}),false).userData.emissiveNight=true;box('poste',[.12,h,.12],[x,h/2,z],mats.dark,false);const p=new THREE.PointLight(0xffdca1,12,8,2);p.position.set(x,h+0.2,z);p.userData.nightLight=true;p.visible=false;scene.add(p)}

// Terreno, estacionamento e caminho principal
plane('gramado',[145,110],[0,-.05,0],new THREE.MeshStandardMaterial({color:0x4f8b32,roughness:1}));
box('estacionamento',[75,.18,40],[-16,.04,17],mats.road,false);box('calcada-frontal',[82,.22,12],[7,.12,2],mats.brick,false);box('base-predio',[88,.35,32],[4,.18,-15],mats.concrete,false);
for(let i=0;i<9;i++){box('faixa-vaga',[.16,.025,12],[-47+i*8,.17,19],mats.white,false);box('limitador',[3,.28,.35],[-44+i*8,.32,11.7],mats.white,false)}
for(let z=5;z<34;z+=7)for(const x of [-54,20])lamp(x,z,.7);

// Corpo principal da emissora
box('predio-principal',[82,11,24],[5,5.65,-16],mats.blue);
box('ala-esquerda',[18,16,20],[-37,8,-18],mats.blue);
box('torre-fachada',[22,19,18],[39,9.6,-17],mats.blue);
box('piso-superior',[54,6.5,16],[-4,14.25,-19],mats.white);
box('coroamento-superior',[56,2,18],[-5,18.5,-19],mats.blue);

// Faixa branca e janelas
box('faixa-branca',[80,1.5,.7],[5,7.1,-3.7],mats.white);
for(let x=-31;x<=29;x+=10){box('janela',[7.2,4.3,.38],[x,4.45,-3.25],mats.glass);box('pilastra',[1.0,5.2,.8],[x+4.3,4.8,-3.55],mats.blue2)}
for(let x=-25;x<=15;x+=10){box('janela-superior',[7.2,3,.35],[x,13.8,-10.8],mats.glass)}

// Entrada principal
box('portal',[17,8,.9],[39,5.4,-6.8],mats.blue2);box('marquise',[20,1.5,5.7],[39,9.25,-4.6],mats.white);box('degrau-1',[14,.45,3.3],[39,.4,-1.0],mats.concrete);box('degrau-2',[11,.4,2.4],[39,.72,-2.0],mats.cyan);box('porta',[9.4,6,.35],[39,4,-3.2],mats.glass);box('divisor-porta',[.18,6,.46],[39,4,-3.0],mats.dark);box('puxador-e',[.13,1.4,.18],[38.35,4,-2.72],mats.metal);box('puxador-d',[.13,1.4,.18],[39.65,4,-2.72],mats.metal);
const title=new THREE.Mesh(new THREE.PlaneGeometry(16,4.6),label('acritica'));title.position.set(39,14.0,-7.35);scene.add(title);logoDisc(2.1,[39,17.5,-7.25]);
const smallTitle=new THREE.Mesh(new THREE.PlaneGeometry(9,2.5),label('acritica'));smallTitle.position.set(-25,8.3,-3.28);scene.add(smallTitle);logoDisc(.95,[-31.0,8.4,-3.15]);

// Floreiras e arbustos
function bush(x,z,s=1){cyl('arbusto',1.8*s,2.1*s,2.8*s,[x,1.45*s,z],mats.green,10);for(let i=0;i<10;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.11*s,8,6),new THREE.MeshStandardMaterial({color:0xe65e35}));f.position.set(x+(Math.random()-.5)*3*s,1.3*s+Math.random()*1.3*s,z+(Math.random()-.5)*2.2*s);scene.add(f)}}
[-39,-31,-23,-15].forEach(x=>bush(x,2.7,.82));box('canteiro',[46,.8,5],[-22,.35,2.5],mats.concrete,false);
for(const x of [33,45]){box('vaso',[2.4,2.2,2.4],[x,1.1,-2.5],mats.cyan);cyl('topiaria-tronco',.22,.25,2,[x,3,-2.5],mats.trunk,10);cyl('topiaria',1.25,1.45,2.5,[x,5,-2.5],mats.green,9)}

// Palmeiras em blocos, como nas referências
function palm(x,z,h=24){cyl('palmeira-tronco',.72,.9,h,[x,h/2,z],mats.trunk,10);for(let y=1;y<h-1;y+=1.3){const ring=new THREE.Mesh(new THREE.TorusGeometry(.76,.07,6,10),mats.dark);ring.position.set(x,y,z);ring.rotation.x=Math.PI/2;scene.add(ring)}for(let i=0;i<11;i++){const a=i/11*Math.PI*2;const frond=box('folha-palmeira',[1.2,.45,8],[x+Math.cos(a)*3.5,h+Math.sin(i)*.2,z+Math.sin(a)*3.5],mats.leaf);frond.rotation.y=-a;frond.rotation.z=(Math.random()-.5)*.12}}
palm(2,2,27);palm(10,1.5,29);palm(-49,-1,17);

// Totem azul/ciano
box('totem-base',[6,1,5],[15,.5,1.7],mats.concrete);box('totem-azul',[3.1,13,3.1],[15,7,1.7],mats.blue2);box('totem-ciano',[1.35,11,3.35],[14.45,6.5,1.4],mats.cyan);

// Torre de telecomunicações
function tower(x,z){for(let i=0;i<4;i++){const sx=i<2?-1:1,sz=i%2?-1:1;const leg=cyl('torre-perna',.14,.22,24,[x+sx*1.9,12,z+sz*1.9],mats.metal,8);leg.rotation.z=sx*.055}for(let y=2;y<24;y+=2){for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const b=box('travessa',[4.2,.12,.12],[x,y,z+sz*1.9],mats.metal,false);b.rotation.z=(y/2%2?1:-1)*.38;const c=box('travessa',[.12,.12,4.2],[x+sx*1.9,y,z],mats.metal,false);c.rotation.x=(y/2%2?1:-1)*.38}}cyl('mastro',.12,.12,5,[x,26,z],mats.metal,8);const beacon=new THREE.PointLight(0xff1a1a,25,20);beacon.position.set(x,28.2,z);beacon.userData.nightLight=true;beacon.visible=false;scene.add(beacon);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),new THREE.MeshStandardMaterial({color:0xff2222,emissive:0xff0000,emissiveIntensity:3}));bulb.position.set(x,28,z);scene.add(bulb);[-2,0,2].forEach(y=>{box('antena-painel',[.45,3,.25],[x-2.3,22+y,z],mats.white);box('antena-painel',[.45,3,.25],[x+2.3,22+y,z],mats.white)})}
tower(-58,-18);

// Antena parabólica no telhado
const dishStand=cyl('base-parabolica',.18,.25,2,[-12,13,-15],mats.metal,10);const dish=new THREE.Mesh(new THREE.SphereGeometry(2.4,24,12,0,Math.PI*2,0,.7),mats.metal);dish.scale.z=.28;dish.position.set(-12,15,-15);dish.rotation.z=-.8;scene.add(dish);box('braco-parabolica',[.12,.12,2.6],[-10.8,16.2,-15],mats.metal);

// Carros low-poly detalhados e leves
function car(x,z,color=0xffffff,scale=1){const g=new THREE.Group();const cm=new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.15});const body=new THREE.Mesh(new THREE.BoxGeometry(5*scale,1.4*scale,2.5*scale),cm);body.position.y=1.05*scale;body.castShadow=true;g.add(body);const cab=new THREE.Mesh(new THREE.BoxGeometry(2.8*scale,1.25*scale,2.25*scale),new THREE.MeshStandardMaterial({color,roughness:.4,metalness:.12}));cab.position.set(.3*scale,2.2*scale,0);g.add(cab);const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.55*scale,.75*scale,2.28*scale),mats.glass);windshield.position.set(-.45*scale,2.35*scale,0);g.add(windshield);for(const dx of [-1.65,1.65])for(const dz of [-1.25,1.25]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.48*scale,.48*scale,.34*scale,12),mats.tire);w.rotation.x=Math.PI/2;w.position.set(dx*scale,.62*scale,dz*scale);g.add(w)}g.position.set(x,.2,z);scene.add(g);return g}
car(-44,16,0x101216,1.15);car(-34,28,0xffffff,.95);car(-25,28,0x19a8c4,.92);car(-16,28,0xf4f4ef,.94);car(-7,28,0x345b34,.88);car(-50,29,0xececec,.95);

// Iluminação arquitetural noturna
for(let x=-34;x<=45;x+=8){const p=new THREE.PointLight(0x19cfff,15,9,2);p.position.set(x,7,-2.6);p.userData.nightLight=true;p.visible=false;scene.add(p);const s=box('arandela',[.35,.7,.22],[x,7,-2.8],new THREE.MeshStandardMaterial({color:0x66edff,emissive:0x00a8ff,emissiveIntensity:.3}),false);s.userData.emissiveNight=true}
for(const x of [34,44]){const p=new THREE.PointLight(0xbaf7ff,18,12,2);p.position.set(x,8.8,-2);p.userData.nightLight=true;p.visible=false;scene.add(p)}

// Pontos de câmera
const views={front:{p:[48,16,49],t:[8,6,-12]},parking:{p:[-42,11,48],t:[-20,4,8]},tower:{p:[-75,24,12],t:[-56,14,-16]},aerial:{p:[65,55,75],t:[0,3,-10]}};
let tween=null,tour=false,tourIndex=0,tourTimer=0;
function goView(id){const v=views[id]||views.front;tween={fromP:camera.position.clone(),toP:new THREE.Vector3(...v.p),fromT:controls.target.clone(),toT:new THREE.Vector3(...v.t),t:0};}
createProgramMenu(goView);
document.getElementById('btnHome').onclick=()=>goView('front');
document.getElementById('btnDay').onclick=()=>{const day=timeCycle.toggle();document.getElementById('btnDay').textContent=day?'☀':'☾'};
document.getElementById('btnTour').onclick=e=>{tour=!tour;e.currentTarget.classList.toggle('active',tour);e.currentTarget.textContent=tour?'❚❚':'▶';tourTimer=0};
let qualityHigh=true;document.getElementById('btnQuality').onclick=e=>{qualityHigh=!qualityHigh;renderer.setPixelRatio(Math.min(devicePixelRatio,qualityHigh?1.75:1));renderer.shadowMap.enabled=qualityHigh;e.currentTarget.textContent=qualityHigh?'HD':'ECO'};

// WASD para deslocamento da câmera
const keys={};addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function moveCamera(dt){const speed=15*dt;const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();const delta=new THREE.Vector3();if(keys.w)delta.addScaledVector(forward,speed);if(keys.s)delta.addScaledVector(forward,-speed);if(keys.a)delta.addScaledVector(right,speed);if(keys.d)delta.addScaledVector(right,-speed);if(delta.lengthSq()){camera.position.add(delta);controls.target.add(delta)}}

const clock3=new THREE.Clock();let frames=0,fpsTimer=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock3.getDelta(),.05);frames++;fpsTimer+=dt;if(fpsTimer>1){document.getElementById('fps').textContent=`${Math.round(frames/fpsTimer)} FPS`;frames=0;fpsTimer=0}moveCamera(dt);if(tween){tween.t=Math.min(1,tween.t+dt*.8);const k=1-Math.pow(1-tween.t,3);camera.position.lerpVectors(tween.fromP,tween.toP,k);controls.target.lerpVectors(tween.fromT,tween.toT,k);if(tween.t>=1)tween=null}if(tour){tourTimer+=dt;if(tourTimer>7){tourTimer=0;tourIndex=(tourIndex+1)%4;goView(Object.keys(views)[tourIndex])}}controls.update();renderer.render(scene,camera)}

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
setInterval(()=>{const d=new Date();document.getElementById('clock').textContent=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})},1000);
goView('front');animate();
setTimeout(()=>{const l=document.getElementById('loading');l.style.opacity='0';l.style.visibility='hidden'},850);