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

const isTouch=matchMedia('(pointer: coarse)').matches||'ontouchstart' in window;
const lowPower=isTouch||Math.min(innerWidth,innerHeight)<700;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x06101f);
scene.fog=new THREE.Fog(0x06101f,130,360);
const camera=new THREE.PerspectiveCamera(66,innerWidth/innerHeight,.1,500);
camera.position.set(0,1.75,42);
camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowPower,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?.78:1.35));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=false;

window.addEventListener('error',e=>{loading.style.display='grid';loading.textContent='Erro ao carregar: '+(e.message||'erro desconhecido')});

let yaw=0,pitch=0,locked=false,mobileActive=false,running=false,joyX=0,joyY=0,currentMode={type:'full'};
function applyLook(dx,dy,f=.0022){yaw-=dx*f;pitch=Math.max(-1.35,Math.min(1.35,pitch-dy*f));camera.rotation.y=yaw;camera.rotation.x=pitch}
if(isTouch){mobileControls.style.display='block';startButton.onclick=()=>{mobileActive=true;startPanel.style.display='none'}}else{startButton.onclick=()=>canvas.requestPointerLock();document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;startPanel.style.display=locked?'none':'flex'});document.addEventListener('mousemove',e=>{if(locked)applyLook(e.movementX,e.movementY)})}
if(isTouch){let jid=null,lid=null,lx=0,ly=0;const radius=42;const updateJoy=e=>{const r=joystick.getBoundingClientRect();let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,l=Math.hypot(dx,dy);if(l>radius){dx=dx/l*radius;dy=dy/l*radius}joyX=dx/radius;joyY=dy/radius;joystickKnob.style.transform=`translate(${dx}px,${dy}px)`};joystick.onpointerdown=e=>{jid=e.pointerId;joystick.setPointerCapture(jid);updateJoy(e)};joystick.onpointermove=e=>{if(e.pointerId===jid)updateJoy(e)};joystick.onpointerup=joystick.onpointercancel=()=>{jid=null;joyX=joyY=0;joystickKnob.style.transform='translate(0,0)'};lookPad.onpointerdown=e=>{lid=e.pointerId;lx=e.clientX;ly=e.clientY;lookPad.setPointerCapture(lid)};lookPad.onpointermove=e=>{if(e.pointerId===lid&&mobileActive){applyLook(e.clientX-lx,e.clientY-ly,.004);lx=e.clientX;ly=e.clientY}};lookPad.onpointerup=lookPad.onpointercancel=()=>lid=null;runButton.onpointerdown=()=>running=true;runButton.onpointerup=runButton.onpointercancel=()=>running=false}

scene.add(new THREE.HemisphereLight(0xc8e2ff,0x0b1320,1.05));
const key=new THREE.DirectionalLight(0xffffff,.85);key.position.set(-30,45,20);scene.add(key);

const M={
 white:new THREE.MeshStandardMaterial({color:0xf0f3f6,roughness:.56}),
 off:new THREE.MeshStandardMaterial({color:0xdfe5eb,roughness:.62}),
 navy:new THREE.MeshStandardMaterial({color:0x07162c,roughness:.4}),
 black:new THREE.MeshStandardMaterial({color:0x03070d,roughness:.33}),
 blue:new THREE.MeshStandardMaterial({color:0x0a56bd,roughness:.28}),
 blue2:new THREE.MeshStandardMaterial({color:0x0d77db,roughness:.25}),
 silver:new THREE.MeshStandardMaterial({color:0x8e9cad,metalness:.18,roughness:.36}),
 floor:new THREE.MeshStandardMaterial({color:0x051b38,metalness:.28,roughness:.16}),
 glass:new THREE.MeshPhysicalMaterial({color:0x193c5e,transparent:true,opacity:.3,roughness:.08}),
 glowBlue:new THREE.MeshBasicMaterial({color:0x43c7ff,toneMapped:false}),
 glowWhite:new THREE.MeshBasicMaterial({color:0xe9fbff,toneMapped:false})
};
function box(n,s,p,m,parent=scene,ry=0){const q=new THREE.Mesh(new THREE.BoxGeometry(...s),m);q.name=n;q.position.set(...p);q.rotation.y=ry;parent.add(q);return q}
function plane(n,w,h,p,m,parent=scene,ry=0){const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);q.name=n;q.position.set(...p);q.rotation.y=ry;parent.add(q);return q}
function led(s,p,m,parent=scene,ry=0){return box('LED',s,p,m,parent,ry)}
function signTexture(text,bg='#064b9f'){const c=document.createElement('canvas');c.width=640;c.height=220;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.font='800 54px Arial';x.fillText(text,320,110);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function sign(text,w,h,p,ry=0,bg='#064b9f',parent=scene){return plane('Sign',w,h,p,new THREE.MeshBasicMaterial({map:signTexture(text,bg),side:THREE.DoubleSide,toneMapped:false}),parent,ry)}

const alertCanvas=document.createElement('canvas');alertCanvas.width=lowPower?640:960;alertCanvas.height=lowPower?320:480;const ax=alertCanvas.getContext('2d');const alertTexture=new THREE.CanvasTexture(alertCanvas);alertTexture.colorSpace=THREE.SRGBColorSpace;
function drawAlert(t=0){const w=alertCanvas.width,h=alertCanvas.height;const g=ax.createLinearGradient(0,0,w,h);g.addColorStop(0,'#06347c');g.addColorStop(.48,'#19a5ed');g.addColorStop(1,'#0643b6');ax.fillStyle=g;ax.fillRect(0,0,w,h);ax.save();ax.globalCompositeOperation='screen';for(let i=0;i<(lowPower?8:14);i++){const y=(i*h/12+t*.018+i*21)%h;ax.strokeStyle='rgba(150,235,255,.19)';ax.lineWidth=1;ax.beginPath();ax.moveTo(-20,y);ax.lineTo(w+20,y-45);ax.stroke()}ax.restore();ax.save();ax.translate(w*.26,h*.25);ax.transform(1,0,-.12,1,0,0);ax.fillStyle='#e01821';ax.fillRect(0,0,w*.18,h*.105);ax.strokeStyle='#fff';ax.lineWidth=3;ax.strokeRect(0,0,w*.18,h*.105);ax.fillStyle='#fff';ax.font=`italic 700 ${h*.074}px Arial`;ax.textAlign='center';ax.textBaseline='middle';ax.fillText('NOVO',w*.09,h*.052);ax.restore();ax.textAlign='center';ax.font=`900 ${h*.275}px Arial Black,Arial`;ax.lineWidth=6;ax.strokeStyle='#052766';ax.strokeText('ALERTA',w*.53,h*.59);const tg=ax.createLinearGradient(0,h*.38,0,h*.72);tg.addColorStop(0,'#31c0ff');tg.addColorStop(.52,'#176bec');tg.addColorStop(1,'#083b9f');ax.fillStyle=tg;ax.fillText('ALERTA',w*.53,h*.59);ax.font=`italic ${h*.05}px Arial`;ax.fillStyle='#152238';ax.textAlign='right';ax.fillText('com Sikêra Jr.',w*.83,h*.75);alertTexture.needsUpdate=true}
drawAlert();
const screenMat=new THREE.MeshBasicMaterial({map:alertTexture,side:THREE.DoubleSide,toneMapped:false});

function createPublicAreas(){
 const g=new THREE.Group();g.name='AreasPublicas';scene.add(g);
 // recepção simples provisória, mas totalmente fechada
 box('RecFloor',[44,.35,30],[0,.18,-30],M.silver,g);box('RecCeil',[44,.4,30],[0,12.8,-30],M.black,g);box('RecBack',[44,12.5,.5],[0,6.25,-45],M.white,g);box('RecLeft',[.5,12.5,30],[-22,6.25,-30],M.white,g);box('RecRight',[.5,12.5,30],[22,6.25,-30],M.white,g);
 box('Desk',[14,3.6,4.5],[12,1.8,-36],M.blue,g);sign('TV A CRÍTICA',12,3.3,[12,7.8,-44.7],0,'#0757bb',g);
 // corredor principal, fechado
 box('CFloor',[16,.35,70],[0,.18,-80],M.silver,g);box('CCeil',[16,.45,70],[0,12.6,-80],M.black,g);box('CLeft',[.5,12.3,70],[-8,6.15,-80],M.off,g);box('CRight',[.5,12.3,70],[8,6.15,-80],M.off,g);led([.11,.11,64],[-7.55,11.4,-80],M.glowBlue,g);led([.11,.11,64],[7.55,11.4,-80],M.glowBlue,g);
 // ramal para o Novo Alerta: um hall real, não uma parede solta
 box('HallFloor',[31,.35,14],[-15.5,.18,-111],M.silver,g);box('HallCeil',[31,.45,14],[-15.5,12.6,-111],M.black,g);box('HallNorth',[31,12.3,.5],[-15.5,6.15,-118],M.off,g);box('HallSouthL',[10,12.3,.5],[-26,6.15,-104],M.off,g);box('HallSouthR',[9,12.3,.5],[-3.5,6.15,-104],M.off,g);box('HallEnd',[.5,12.3,14],[-31,6.15,-111],M.off,g);led([27,.11,.11],[-15.5,11.35,-117.5],M.glowBlue,g);sign('ESTÚDIO NOVO ALERTA',11,2.3,[-15.5,9.8,-117.7],0,'#0757bb',g);
}

function createStudio(){
 const g=new THREE.Group();g.name='Estudio Novo Alerta';g.position.set(-43,0,-132);scene.add(g);
 // sala completa e fechada
 box('Floor',[52,.45,38],[0,.23,0],M.floor,g);box('Ceil',[52,.55,38],[0,16,0],M.black,g);box('Back',[52,16,.55],[0,8,-19],M.black,g);box('Left',[.55,16,38],[-26,8,0],M.white,g);box('Right',[.55,16,38],[26,8,0],M.navy,g);
 // parede de entrada com vão central real
 box('FrontL',[17,16,.55],[-17.5,8,19],M.navy,g);box('FrontR',[23,16,.55],[14.5,8,19],M.navy,g);box('FrontTop',[12,5,.55],[-3,13.5,19],M.navy,g);
 box('DoorFrameL',[.7,11,1],[-9,5.5,18.45],M.blue,g);box('DoorFrameR',[.7,11,1],[3,5.5,18.45],M.blue,g);box('DoorFrameT',[12.7,.7,1],[-3,11,18.45],M.blue,g);led([11.4,.13,.13],[-3,10.55,17.88],M.glowBlue,g);sign('NOVO ALERTA',9,2.1,[-3,13.3,18.4],Math.PI,'#0757bb',g);
 // piso branco largo da referência
 box('WhiteFloor',[15,.06,38],[-18.5,.5,0],M.white,g,-.035);
 // grande moldura em L branca com linha azul-clara
 box('LColumn',[1.2,14.2,1.1],[-22,8,-17.1],M.white,g);box('LTop',[42,1.1,1.1],[-1.6,14.7,-17.1],M.white,g);led([.22,12.8,.16],[-21.35,8,-16.48],M.glowWhite,g);led([39.7,.18,.16],[-1.6,14.05,-16.48],M.glowWhite,g);led([35,.14,.14],[-1,13.48,-15.2],M.glowBlue,g);
 // telão principal embutido e retorno em L
 box('ScreenRecess',[31,12.1,.7],[-5.6,8,-18.5],M.navy,g);plane('MainScreen',29.5,11.2,[-5.6,8,-18.08],screenMat,g,0);
 box('ReturnRecess',[.7,12.1,9],[13.55,8,-14.1],M.navy,g);plane('ReturnScreen',8.1,11.2,[13.18,8,-14.1],screenMat.clone(),g,-Math.PI/2);
 // coluna técnica entre os telões
 for(let i=0;i<4;i++){box('TechCol',[1.05,12.5,1.3],[10.4+i*2.05,8,-15.3],i%2?M.blue2:M.blue,g);led([.1,11.1,.1],[9.95+i*2.05,8,-14.55],M.glowBlue,g)}
 // telão direito menor, completamente encaixado
 box('RightPanel',[12.5,14,.8],[18.3,8,-2.2],M.navy,g,-.08);plane('RightScreen',8.6,10.7,[18.05,8,-1.72],screenMat.clone(),g,-.08);
 // ripas e acabamento esquerdo
 for(let i=0;i<8;i++)box('Slat',[.28,11,.45],[-24.15,7.5,-12.2+i*1.65],M.off,g);
 // refletores como objetos, sem luz dinâmica pesada
 const spots=[[-15,15.25,0],[-5,15.25,2.3],[6.5,15.25,1.5],[16,15.25,-2]];spots.forEach((p,i)=>{box('SpotBody',[2,.48,1.6],p,M.black,g);box('SpotFace',[1.4,.08,1.05],[p[0],14.98,p[2]-.05],M.glowWhite,g)});
 // câmeras estilizadas com silhueta real
 [[-13,0,6],[5,0,7],[14,0,10]].forEach((p,i)=>{const c=new THREE.Group();c.position.set(...p);g.add(c);box('TripodPole',[.25,3.1,.25],[0,1.55,0],M.silver,c);box('CamBody',[2.2,1.45,2.6],[0,3.35,0],M.black,c);box('Lens',[.72,.72,.85],[0,3.35,-1.62],M.silver,c);box('Handle',[1.3,.18,.18],[0,4.25,.4],M.silver,c)});
}
createPublicAreas();createStudio();

// corredores permitidos: isso impede atravessar paredes e ver o lado de fora
const walkZones=[
 {x1:-20,x2:20,z1:-43,z2:-15,label:'Recepção'},
 {x1:-7.2,x2:7.2,z1:-117,z2:-43,label:'Corredor Principal'},
 {x1:-30,x2:0,z1:-117,z2:-105,label:'Corredor do Novo Alerta'},
 {x1:-52,x2:-34,z1:-123,z2:-112,label:'Entrada Novo Alerta'},
 {x1:-67,x2:-18,z1:-150,z2:-113,label:'Estúdio Novo Alerta'}
];
function insideZone(x,z){return walkZones.find(q=>x>=q.x1&&x<=q.x2&&z>=q.z1&&z<=q.z2)}
window.addEventListener('tvacritica:start',e=>{currentMode=e.detail||{type:'full'};camera.position.set(0,1.75,currentMode.type==='program'?-28:42);yaw=0;pitch=0;if(isTouch){mobileActive=true;startPanel.style.display='none'}else{startPanel.style.display='flex';startButton.textContent='ENTRAR'}});
const keys=new Set();addEventListener('keydown',e=>keys.add(e.code));addEventListener('keyup',e=>keys.delete(e.code));const clock=new THREE.Clock();
function updateMovement(dt){if(!(locked||mobileActive))return;let dx=0,dz=0;if(isTouch){dx=joyX;dz=joyY}else{if(keys.has('KeyW'))dz=-1;if(keys.has('KeyS'))dz=1;if(keys.has('KeyA'))dx=-1;if(keys.has('KeyD'))dx=1}const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const sp=(running||keys.has('ShiftLeft'))?11:6.8;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const oldX=camera.position.x,oldZ=camera.position.z;camera.position.addScaledVector(f,-dz*sp*dt);camera.position.addScaledVector(r,dx*sp*dt);const zone=insideZone(camera.position.x,camera.position.z);if(!zone){camera.position.x=oldX;camera.position.z=oldZ}else locationLabel.textContent=zone.label;camera.position.y=1.75}
let last=0;const interval=lowPower?150:85;function animate(t=0){requestAnimationFrame(animate);if(t-last>interval){drawAlert(t);last=t}updateMovement(Math.min(clock.getDelta(),.033));renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?.78:1.35));renderer.setSize(innerWidth,innerHeight,false)});
loading.style.display='none';animate();