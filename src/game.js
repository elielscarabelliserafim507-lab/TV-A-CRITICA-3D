import * as THREE from 'three';

const canvas=document.getElementById('game');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x78cfff);scene.fog=new THREE.Fog(0x78cfff,90,190);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,300);camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xdff4ff,0x526733,1.8));const sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const M={blue:new THREE.MeshStandardMaterial({color:0x07369d,roughness:.6}),blue2:new THREE.MeshStandardMaterial({color:0x0b56c7,roughness:.55}),cyan:new THREE.MeshStandardMaterial({color:0x23ccec,emissive:0x0786a8,emissiveIntensity:.2}),white:new THREE.MeshStandardMaterial({color:0xf4f6f8,roughness:.8}),glass:new THREE.MeshStandardMaterial({color:0x18334a,transparent:true,opacity:.56,roughness:.12,metalness:.2}),dark:new THREE.MeshStandardMaterial({color:0x121820,roughness:.7}),road:new THREE.MeshStandardMaterial({color:0x34373c,roughness:1}),brick:new THREE.MeshStandardMaterial({color:0xad6b53,roughness:.9}),green:new THREE.MeshStandardMaterial({color:0x3c8c2f,roughness:1}),trunk:new THREE.MeshStandardMaterial({color:0x6a442a,roughness:1}),metal:new THREE.MeshStandardMaterial({color:0xaab3bd,metalness:.7,roughness:.35})};
const colliders=[];function box(size,pos,mat=M.white,collide=false){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;scene.add(o);if(collide)colliders.push(new THREE.Box3().setFromObject(o));return o}function cyl(r,h,pos,mat=M.white,n=14){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),mat);o.position.set(...pos);o.castShadow=true;scene.add(o);return o}

// mundo externo
box([150,.25,120],[0,-.15,0],M.green);box([82,.2,42],[-15,.05,19],M.road);box([95,.25,12],[6,.14,0],M.brick);
for(let i=0;i<10;i++) box([.13,.03,12],[-52+i*8,.18,20],M.white);
// prédio com entrada real aberta
box([82,11,22],[3,5.5,-17],M.blue,true);box([18,16,20],[-37,8,-18],M.blue,true);box([22,19,18],[39,9.5,-18],M.blue,true);box([50,6.5,16],[-5,14.3,-20],M.white,true);box([54,2,17],[-5,18.4,-20],M.blue,true);
for(let x=-31;x<=27;x+=10){box([7.2,4.2,.32],[x,4.4,-5.85],M.glass);box([1,5,.7],[x+4.1,4.7,-5.9],M.blue2)}
box([20,1.4,5.4],[39,9.1,-5],M.white);box([6,.45,4],[39,.25,-1.3],M.cyan);box([12,.35,5.5],[39,.16,-2.6],M.white);
// corredor de entrada aberto no centro da torre
box([4.2,7,.55],[33.2,4,-6.0],M.blue,true);box([4.2,7,.55],[44.8,4,-6.0],M.blue,true);box([12,.45,.6],[39,8.2,-6.0],M.blue,true);
// portas de vidro abertas para os lados
const dl=box([3.6,6,.25],[35.4,3.5,-5.72],M.glass);dl.rotation.y=-.35;const dr=box([3.6,6,.25],[42.6,3.5,-5.72],M.glass);dr.rotation.y=.35;
// lobby interno jogável
box([18,.25,18],[39,.02,-15],M.white);box([18,8,.35],[39,4,-23.8],M.white,true);box([.35,8,18],[30.2,4,-15],M.white,true);box([.35,8,18],[47.8,4,-15],M.white,true);box([18,.35,18],[39,8,-15],M.white,true);
box([8,1.2,2],[39,.75,-18.8],M.blue2,true);box([7.2,2.6,.35],[39,2.45,-19.7],M.cyan);box([3,1.1,1.2],[34.2,.7,-12],M.dark,true);box([3,1.1,1.2],[43.8,.7,-12],M.dark,true);
// porta interna para futura expansão
box([4.8,6,.3],[39,3,-23.55],M.glass);
// logo textual
function textSprite(text){const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.fillStyle='#6eeaff';x.shadowColor='#00aaff';x.shadowBlur=24;x.font='900 150px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Mesh(new THREE.PlaneGeometry(15,3.8),new THREE.MeshBasicMaterial({map:t,transparent:true}));return s}const sign=textSprite('acritica');sign.position.set(39,14,-8.7);scene.add(sign);const lobbySign=textSprite('TV A CRÍTICA');lobbySign.scale.set(.65,.65,.65);lobbySign.position.set(39,5.6,-23.55);scene.add(lobbySign);
// palmeiras e totem
for(const [x,z,h] of [[2,3,26],[10,2,29],[-48,-1,17]]){cyl(.7,h,[x,h/2,z],M.trunk);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const f=box([1,.35,7],[x+Math.cos(a)*3.1,h,z+Math.sin(a)*3.1],M.green);f.rotation.y=-a}}
box([3.2,13,3],[15,6.5,2],M.blue2);box([1.2,11,3.2],[14.5,6,1.8],M.cyan);
// carros simples
for(const [x,z,c] of [[-45,16,0x111111],[-34,28,0xffffff],[-25,28,0x22aeca],[-16,28,0xeeeeee],[-7,28,0x39633b]]){const mat=new THREE.MeshStandardMaterial({color:c,roughness:.5});box([5,1.4,2.5],[x,1,z],mat,true);box([2.8,1.2,2.2],[x+.2,2,z],mat)}

// primeira pessoa
let yaw=Math.PI,pitch=0,playing=false,run=false;const keys={};camera.position.set(39,1.72,13);camera.rotation.set(0,yaw,0);
function look(dx,dy){yaw-=dx*.0028;pitch=Math.max(-1.45,Math.min(1.45,pitch-dy*.0025));camera.rotation.set(pitch,yaw,0)}
addEventListener('keydown',e=>keys[e.code]=true);addEventListener('keyup',e=>keys[e.code]=false);addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas)look(e.movementX,e.movementY)});canvas.addEventListener('click',()=>{if(playing&&!matchMedia('(pointer:coarse)').matches)canvas.requestPointerLock?.()});
function blocked(next){const p=new THREE.Vector3(next.x,1.2,next.z),r=.42;for(const b of colliders){if(p.x>b.min.x-r&&p.x<b.max.x+r&&p.z>b.min.z-r&&p.z<b.max.z+r&&p.y>b.min.y-.5&&p.y<b.max.y+.5)return true}return false}
const joy=document.getElementById('joystick'),stick=document.getElementById('stick'),lookZone=document.getElementById('lookZone'),runBtn=document.getElementById('runBtn');let jx=0,jy=0,jid=null,lid=null,lx=0,ly=0;
function joyMove(e){const t=[...e.changedTouches].find(t=>t.identifier===jid);if(!t)return;const r=joy.getBoundingClientRect();let x=t.clientX-r.left-r.width/2,y=t.clientY-r.top-r.height/2,d=Math.hypot(x,y),m=42;if(d>m){x=x/d*m;y=y/d*m}jx=x/m;jy=y/m;stick.style.transform=`translate(${x}px,${y}px)`}
joy.addEventListener('touchstart',e=>{e.preventDefault();jid=e.changedTouches[0].identifier;joyMove(e)},{passive:false});joy.addEventListener('touchmove',e=>{e.preventDefault();joyMove(e)},{passive:false});joy.addEventListener('touchend',e=>{e.preventDefault();jid=null;jx=jy=0;stick.style.transform='translate(0,0)'},{passive:false});
lookZone.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];lid=t.identifier;lx=t.clientX;ly=t.clientY},{passive:false});lookZone.addEventListener('touchmove',e=>{e.preventDefault();const t=[...e.changedTouches].find(t=>t.identifier===lid);if(!t)return;look(t.clientX-lx,t.clientY-ly);lx=t.clientX;ly=t.clientY},{passive:false});lookZone.addEventListener('touchend',()=>lid=null,{passive:false});runBtn.addEventListener('touchstart',e=>{e.preventDefault();run=true},{passive:false});runBtn.addEventListener('touchend',()=>run=false,{passive:false});

document.getElementById('startGame').onclick=()=>{playing=true;document.body.classList.add('playing');camera.position.set(39,1.72,13);yaw=Math.PI;pitch=0;camera.rotation.set(0,yaw,0);if(!matchMedia('(pointer:coarse)').matches)canvas.requestPointerLock?.()};document.getElementById('btnHome').onclick=()=>{camera.position.set(39,1.72,13);yaw=Math.PI;pitch=0;camera.rotation.set(0,yaw,0)};
let night=false;document.getElementById('btnDay').onclick=()=>{night=!night;scene.background=new THREE.Color(night?0x071733:0x78cfff);scene.fog.color.copy(scene.background);sun.intensity=night?.15:2.3};document.getElementById('btnTour').style.display='none';

const clock=new THREE.Clock();let frames=0,ft=0;function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);frames++;ft+=dt;if(ft>1){document.getElementById('fps').textContent=Math.round(frames/ft)+' FPS';frames=0;ft=0}if(playing){let f=(keys.KeyW?1:0)-(keys.KeyS?1:0)-jy,r=(keys.KeyD?1:0)-(keys.KeyA?1:0)+jx,n=Math.hypot(f,r);if(n>1){f/=n;r/=n}const sp=(keys.ShiftLeft||keys.ShiftRight||run)?9:5;const fw=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),rt=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const delta=fw.multiplyScalar(f).add(rt.multiplyScalar(r)).multiplyScalar(sp*dt);const nx=camera.position.clone();nx.x+=delta.x;if(!blocked(nx))camera.position.x=nx.x;const nz=camera.position.clone();nz.z+=delta.z;if(!blocked(nz))camera.position.z=nz.z;camera.position.y=1.72}renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});setInterval(()=>document.getElementById('clock').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),1000);setTimeout(()=>{const l=document.getElementById('loading');l.style.opacity='0';setTimeout(()=>l.remove(),450)},500);
