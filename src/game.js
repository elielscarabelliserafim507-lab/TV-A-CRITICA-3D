import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#game');
const isMobile=matchMedia('(pointer:coarse)').matches||innerWidth<850;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x91cfee);
scene.fog=new THREE.Fog(0x91cfee,170,470);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.08,650);
const renderer=new THREE.WebGLRenderer({canvas,antialias:!isMobile,powerPreference:'high-performance',alpha:false,stencil:false});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1:1.35));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
scene.add(new THREE.HemisphereLight(0xe9f8ff,0x52634a,2));
const sun=new THREE.DirectionalLight(0xfff2da,3.5);sun.position.set(-70,90,45);sun.castShadow=true;sun.shadow.mapSize.set(isMobile?1024:1536,isMobile?1024:1536);sun.shadow.camera.left=-115;sun.shadow.camera.right=115;sun.shadow.camera.top=125;sun.shadow.camera.bottom=-155;sun.shadow.camera.near=.5;sun.shadow.camera.far=260;sun.shadow.bias=-.00015;scene.add(sun);

const mk=(c,r=.65,m=.03)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const M={white:mk(0xf2f3f1),blue:mk(0x063c96,.4,.12),dark:mk(0x06172b,.35,.2),glass:new THREE.MeshPhysicalMaterial({color:0x17334b,roughness:.1,transparent:true,opacity:.7,transmission:isMobile?0:.1,clearcoat:isMobile?0:1}),floor:mk(0xbfc4c5,.32,.05),road:mk(0x2a2f33,.95),grass:mk(0x3e7e31,1),wood:mk(0x7a5035,.78),metal:mk(0x22282e,.3,.8),red:new THREE.MeshStandardMaterial({color:0xd4202f,emissive:0x74000b,emissiveIntensity:.45}),cyan:new THREE.MeshStandardMaterial({color:0x20d7ee,emissive:0x087f9b,emissiveIntensity:1}),yellow:new THREE.MeshStandardMaterial({color:0xf2c423,emissive:0x8a6400,emissiveIntensity:.35}),pink:mk(0xd98bc6,.4),screen:mk(0x0b1733,.18,.15)};
const solids=[];
function box(s,p,m=M.white,solid=false){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);o.castShadow=solid||(!isMobile&&s[1]>.7);o.receiveShadow=true;scene.add(o);if(solid)solids.push(new THREE.Box3().setFromObject(o));return o}
function cyl(r,h,p,m=M.metal){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,isMobile?10:16),m);o.position.set(...p);o.castShadow=!isMobile;o.receiveShadow=true;scene.add(o);return o}
function sign(t,w=14,h=2,c='#fff',f=90){const cv=document.createElement('canvas');cv.width=isMobile?512:1024;cv.height=isMobile?128:256;const x=cv.getContext('2d');x.fillStyle=c;x.font=`900 ${isMobile?Math.round(f/2):f}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(t,cv.width/2,cv.height/2);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.generateMipmaps=!isMobile;tx.minFilter=isMobile?THREE.LinearFilter:THREE.LinearMipmapLinearFilter;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide}));scene.add(o);return o}
function wallX(x,z,len){return box([.35,5.4,len],[x,2.7,z],M.white,true)}
function wallZ(x,z,len){return box([len,5.4,.35],[x,2.7,z],M.white,true)}
const lightMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xe9f8ff,emissiveIntensity:isMobile?1.25:2});
function lightPanel(x,y,z,sx=5,sz=1.2){box([sx,.08,sz],[x,y,z],lightMat);if(!isMobile){const l=new THREE.PointLight(0xeaf7ff,1.35,14,2);l.position.set(x,y-.25,z);scene.add(l)}}

// EXTERIOR
box([210,.3,205],[0,-.2,-35],M.grass);box([210,.2,22],[0,.02,68],M.road);box([132,.18,65],[0,.04,29],M.road);
for(let x=-55;x<=55;x+=10){box([.12,.03,15],[x,.15,20],M.white);box([.12,.03,14],[x,.15,42],M.white)}
box([104,.25,155],[5,.1,-62],M.floor);wallX(-47,-62,155);wallX(57,-62,155);wallZ(5,-139,104);
wallZ(-25,16,44);wallZ(40,16,34);box([104,1.6,.7],[5,9.8,16],M.blue);box([26,18,5],[38,9,-134],M.blue);const logo=sign('TV A CRÍTICA',25,3,'#67eaff',120);logo.position.set(5,8.2,16.3);
box([1.1,6,.5],[-3,3,16],M.blue);box([1.1,6,.5],[13,3,16],M.blue);box([7.2,5.2,.12],[.8,2.7,16.2],M.glass);box([7.2,5.2,.12],[9.2,2.7,16.2],M.glass);
for(let x=-96;x<=96;x+=3)box([.11,4,.11],[x,2,59],M.metal);box([210,.25,.25],[0,.5,59],M.metal);box([210,.25,.25],[0,3.7,59],M.metal);box([28,5,.8],[0,2.5,59],M.blue);const gs=sign('TV A CRÍTICA',20,2,'#fff',90);gs.position.set(0,5.1,58.5);gs.rotation.y=Math.PI;

// RECEPÇÃO
box([80,.2,28],[5,.12,2],M.floor);box([80,.2,28],[5,5.45,2],M.dark);wallX(-35,2,28);wallX(45,2,28);box([25,4.8,.5],[-20,3,-11.5],M.wood);box([20,3.8,.25],[-20,3,-11.2],M.screen);const tv=sign('TV A CRÍTICA',17,2.5,'#fff',95);tv.position.set(-20,3,-11);box([17,1.2,4],[29,1,3],M.blue);box([17,.22,4],[29,1.72,3],M.white);const rec=sign('RECEPÇÃO',11,1.5,'#fff',80);rec.position.set(29,1.1,5.05);box([17,1.3,3],[-11,.8,3],M.white);box([5,1.3,3],[3,.8,3],M.white);box([8,.55,4],[-4,.45,-3],M.wood);wallZ(-25,-12,20);wallZ(35,-12,20);const cs=sign('ACESSO AOS ESTÚDIOS',20,1.5,'#55eaff',75);cs.position.set(5,4.6,-11.75);

// CORREDOR CENTRAL FECHADO, ÚNICO E CONTÍNUO
box([14,.18,122],[5,.12,-73],M.floor);box([14,.18,122],[5,5.42,-73],M.dark);wallX(-2,-73,122);wallX(12,-73,122);for(let z=-18;z>-135;z-=9)lightPanel(5,5.28,z);
function portal(side,z,name,color='#fff'){const x=side==='L'?-2:12;box([.45,5.4,3],[x,2.7,z-3.5],M.white,true);box([.45,5.4,3],[x,2.7,z+3.5],M.white,true);box([.5,.65,4],[x,5.05,z],M.blue,true);const s=sign(name,10,1.05,color,56);s.position.set(x+(side==='L'?.25:-.25),4.35,z);s.rotation.y=side==='L'?Math.PI/2:-Math.PI/2}
function room(side,z,name,accent){const left=side==='L',cx=left?-22:32,w=26,d=16;box([w,.18,d],[cx,.1,z],M.floor);box([w,.18,d],[cx,5.4,z],M.dark);wallZ(cx,z-d/2,w);wallZ(cx,z+d/2,w);wallX(left?-35:45,z,d);portal(side,z,name,accent);const backX=left?-34.6:44.6;box([.3,4.4,10],[backX,2.5,z],M.screen);const scr=sign(name,10,2.4,accent,66);scr.position.set(backX+(left?.2:-.2),3,z);scr.rotation.y=left?Math.PI/2:-Math.PI/2;return{cx,z,left}}

const na=room('L',-22,'NOVO ALERTA','#55a8ff');box([10,.3,6],[na.cx,.22,na.z],M.blue);box([8,3,.25],[-34,2.5,-22],M.screen);const novo=sign('NOVO',5,1.1,'#ffffff',70);novo.position.set(-33.8,3.7,-25);novo.rotation.y=Math.PI/2;box([2.6,.55,.25],[-33.6,3.7,-25],M.red);for(let i=-2;i<=2;i++)box([.12,4,6],[-29+i*2,2.3,-22],i%2?M.cyan:M.blue);
const a=room('R',-22,'A CRÍTICA BRASIL','#63dfff');box([8,.8,3],[a.cx,.55,a.z],M.blue);
const b=room('L',-42,'ALERTA AMAZONAS','#ff3448');box([9,.35,5],[b.cx,.25,b.z],M.red);
const c=room('R',-42,'ALÔ CIDADE','#ff3348');box([7,3,.3],[43,2.2,-42],M.glass);box([5,.25,7],[32,.25,-42],M.red);
const d=room('L',-62,'MAGAZINE','#f4a4dc');box([10,1.2,3],[-22,.8,-60],M.white);box([6,1,3],[-18,.7,-65],M.wood);
const e=room('R',-62,'JORNAL MANHÃ DO AR','#ffd42a');box([6,1.1,3],[32,.75,-62],M.yellow);box([5,3,.25],[43,2.3,-59],M.screen);
const f=room('L',-82,'DEBATE ELEITORAL','#62baff');for(const zz of [-86,-82,-78])box([.25,4,5],[-33,2.2,zz],M.glass);
const g=room('R',-82,'A BORDO','#53d9ff');box([10,1.4,4],[32,1,-82],M.wood);for(let i=-1;i<=1;i++)box([.25,3,4],[43,2.5,-82+i*4],M.glass);
const h=room('L',-102,'NOSSO ENCONTRO','#f4c34d');box([5,1.3,3],[-26,.8,-102],M.white);box([5,1.3,3],[-18,.8,-102],M.white);cyl(2,.5,[-22,.35,-102],M.wood);
const i=room('R',-102,'THE BOX','#ffffff');box([12,1,5],[32,.7,-102],M.dark);for(let x=27;x<=37;x+=5)box([3,2.2,3],[x,1.3,-102],M.white);
const j=room('L',-122,'A CRÍTICA NEWS','#5eeaff');box([10,.9,3],[-22,.6,-122],M.blue);box([8,3,.2],[-34,2.5,-122],M.screen);
const res=room('R',-122,'ESTÚDIO RESERVA','#a8c8ff');box([8,.5,5],[32,.35,-122],M.dark);

// SWITCHER MASTER
box([70,.18,18],[5,.1,-138],M.floor);box([70,.18,18],[5,5.4,-138],M.dark);wallX(-30,-138,18);wallX(40,-138,18);wallZ(5,-147,70);wallZ(-17,-129,26);wallZ(27,-129,26);const sw=sign('SWITCHER MASTER',24,2,'#67eaff',90);sw.position.set(5,4.5,-146.7);box([30,3,.4],[5,3,-146.5],M.dark);for(let x=-7;x<=17;x+=6)for(let y=2;y<=4;y+=2)box([5,1.5,.15],[x,y,-146.25],y===4?M.blue:M.red);box([30,1,5],[5,.75,-138],M.dark);

// CONTROLES DE JOGO
const orbit=new OrbitControls(camera,canvas);orbit.enabled=false;orbit.enableDamping=true;orbit.dampingFactor=.07;orbit.target.set(5,3,-65);let mode='free',playing=false,yaw=Math.PI,pitch=0,runHeld=false;const keys={};addEventListener('keydown',e=>keys[e.code]=true);addEventListener('keyup',e=>keys[e.code]=false);function lookBy(dx,dy){yaw-=dx*.0027;pitch=Math.max(-1.35,Math.min(1.35,pitch-dy*.0024));camera.rotation.set(pitch,yaw,0,'YXZ')}addEventListener('mousemove',e=>{if(mode==='first'&&document.pointerLockElement===canvas)lookBy(e.movementX,e.movementY)});canvas.onclick=()=>{if(playing&&mode==='first'&&!isMobile)canvas.requestPointerLock?.()};
const joy=document.querySelector('#joy'),stick=document.querySelector('#stick'),look=document.querySelector('#look'),run=document.querySelector('#run');let jx=0,jy=0,jid=null,lid=null,lx=0,ly=0;function jm(e){const t=[...e.changedTouches].find(v=>v.identifier===jid);if(!t)return;const r=joy.getBoundingClientRect();let x=t.clientX-r.left-r.width/2,y=t.clientY-r.top-r.height/2,d=Math.hypot(x,y),m=42;if(d>m){x=x/d*m;y=y/d*m}jx=x/m;jy=y/m;stick.style.transform=`translate(${x}px,${y}px)`}joy?.addEventListener('touchstart',e=>{e.preventDefault();jid=e.changedTouches[0].identifier;jm(e)},{passive:false});joy?.addEventListener('touchmove',e=>{e.preventDefault();jm(e)},{passive:false});joy?.addEventListener('touchend',()=>{jx=jy=0;jid=null;stick.style.transform='translate(0,0)'},{passive:false});look?.addEventListener('touchstart',e=>{const t=e.changedTouches[0];lid=t.identifier;lx=t.clientX;ly=t.clientY},{passive:false});look?.addEventListener('touchmove',e=>{e.preventDefault();const t=[...e.changedTouches].find(v=>v.identifier===lid);if(t){lookBy(t.clientX-lx,t.clientY-ly);lx=t.clientX;ly=t.clientY}},{passive:false});run?.addEventListener('touchstart',()=>runHeld=true);run?.addEventListener('touchend',()=>runHeld=false);
function setMode(n){mode=n;playing=true;document.body.classList.add('playing');document.body.classList.toggle('first',n==='first');document.querySelector('#menu').classList.add('hidden');if(n==='first'){orbit.enabled=false;camera.position.set(5,1.72,51);yaw=Math.PI;pitch=0;camera.rotation.set(0,yaw,0,'YXZ');if(!isMobile)canvas.requestPointerLock?.()}else{document.exitPointerLock?.();camera.position.set(95,65,115);orbit.target.set(5,2,-65);orbit.enabled=true;orbit.update()}}
document.querySelector('#playFirst').onclick=()=>setMode('first');document.querySelector('#playFree').onclick=()=>setMode('free');document.querySelector('#home').onclick=()=>setMode(mode);document.querySelector('#menuBtn').onclick=()=>{playing=false;orbit.enabled=false;document.exitPointerLock?.();document.body.classList.remove('playing','first');document.querySelector('#menu').classList.remove('hidden')};let night=false;document.querySelector('#day').onclick=()=>{night=!night;scene.background.set(night?0x071326:0x91cfee);scene.fog.color.copy(scene.background);sun.intensity=night?.3:3.5};
const playerSphere=new THREE.Sphere(new THREE.Vector3(),.42),fw=new THREE.Vector3(),rt=new THREE.Vector3(),next=new THREE.Vector3();function collision(p){playerSphere.center.set(p.x,1.7,p.z);for(let k=0;k<solids.length;k++)if(solids[k].intersectsSphere(playerSphere))return true;return false}
const clock=new THREE.Clock();let firstFrame=true,visible=true;document.addEventListener('visibilitychange',()=>visible=!document.hidden);function animate(){requestAnimationFrame(animate);if(!visible)return;const dt=Math.min(clock.getDelta(),.04);if(playing&&mode==='first'){let f=(keys.KeyW?1:0)-(keys.KeyS?1:0)-jy,r=(keys.KeyD?1:0)-(keys.KeyA?1:0)+jx,n=Math.hypot(f,r);if(n>1){f/=n;r/=n}const sp=(keys.ShiftLeft||runHeld)?9:5.2;fw.set(-Math.sin(yaw),0,-Math.cos(yaw));rt.set(Math.cos(yaw),0,-Math.sin(yaw));next.copy(camera.position).addScaledVector(fw,f*sp*dt).addScaledVector(rt,r*sp*dt);next.y=1.72;if(!collision(next))camera.position.copy(next)}if(orbit.enabled)orbit.update();renderer.render(scene,camera);if(firstFrame){firstFrame=false;renderer.shadowMap.autoUpdate=false;window.dispatchEvent(new Event('game-ready'))}}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1:1.35));renderer.setSize(innerWidth,innerHeight)});