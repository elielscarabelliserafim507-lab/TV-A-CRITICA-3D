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
scene.background=new THREE.Color(0x07111d);
scene.fog=new THREE.Fog(0x07111d,120,330);
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,420);
camera.position.set(0,1.7,-28);
camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowPower,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?.78:1.3));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=false;

let yaw=0,pitch=0,locked=false,mobileActive=false,running=false,joyX=0,joyY=0,currentMode={type:'full'};
function applyLook(dx,dy,f=.0022){yaw-=dx*f;pitch=Math.max(-1.25,Math.min(1.25,pitch-dy*f));camera.rotation.y=yaw;camera.rotation.x=pitch}
if(isTouch){mobileControls.style.display='block';startButton.onclick=()=>{mobileActive=true;startPanel.style.display='none'}}else{startButton.onclick=()=>canvas.requestPointerLock();document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;startPanel.style.display=locked?'none':'flex'});document.addEventListener('mousemove',e=>{if(locked)applyLook(e.movementX,e.movementY)})}
if(isTouch){let jid=null,lid=null,lx=0,ly=0;const radius=42;const updateJoy=e=>{const r=joystick.getBoundingClientRect();let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,l=Math.hypot(dx,dy);if(l>radius){dx=dx/l*radius;dy=dy/l*radius}joyX=dx/radius;joyY=dy/radius;joystickKnob.style.transform=`translate(${dx}px,${dy}px)`};joystick.onpointerdown=e=>{jid=e.pointerId;joystick.setPointerCapture(jid);updateJoy(e)};joystick.onpointermove=e=>{if(e.pointerId===jid)updateJoy(e)};joystick.onpointerup=joystick.onpointercancel=()=>{jid=null;joyX=joyY=0;joystickKnob.style.transform='translate(0,0)'};lookPad.onpointerdown=e=>{lid=e.pointerId;lx=e.clientX;ly=e.clientY;lookPad.setPointerCapture(lid)};lookPad.onpointermove=e=>{if(e.pointerId===lid&&mobileActive){applyLook(e.clientX-lx,e.clientY-ly,.004);lx=e.clientX;ly=e.clientY}};lookPad.onpointerup=lookPad.onpointercancel=()=>lid=null;runButton.onpointerdown=()=>running=true;runButton.onpointerup=runButton.onpointercancel=()=>running=false}

scene.add(new THREE.HemisphereLight(0xd5e8ff,0x0a111c,1.18));
const key=new THREE.DirectionalLight(0xffffff,.75);key.position.set(-25,35,20);scene.add(key);

const M={
 white:new THREE.MeshStandardMaterial({color:0xf2f5f8,roughness:.5}),
 off:new THREE.MeshStandardMaterial({color:0xd9e0e7,roughness:.6}),
 navy:new THREE.MeshStandardMaterial({color:0x071426,roughness:.36}),
 black:new THREE.MeshStandardMaterial({color:0x03070c,roughness:.3}),
 blue:new THREE.MeshStandardMaterial({color:0x0a55ba,roughness:.26}),
 blue2:new THREE.MeshStandardMaterial({color:0x116ed0,roughness:.24}),
 silver:new THREE.MeshStandardMaterial({color:0x8697aa,metalness:.16,roughness:.38}),
 floor:new THREE.MeshStandardMaterial({color:0x04162d,metalness:.2,roughness:.14}),
 glowBlue:new THREE.MeshBasicMaterial({color:0x32bfff,toneMapped:false}),
 glowWhite:new THREE.MeshBasicMaterial({color:0xeafcff,toneMapped:false})
};
function box(n,s,p,m,parent=scene,ry=0){const q=new THREE.Mesh(new THREE.BoxGeometry(...s),m);q.name=n;q.position.set(...p);q.rotation.y=ry;parent.add(q);return q}
function plane(n,w,h,p,m,parent=scene,ry=0){const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);q.name=n;q.position.set(...p);q.rotation.y=ry;parent.add(q);return q}
function signTexture(text,bg='#064b9f'){const c=document.createElement('canvas');c.width=640;c.height=220;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,640,220);x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.font='800 50px Arial';x.fillText(text,320,110);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function sign(text,w,h,p,ry=0,bg='#064b9f',parent=scene){return plane('Sign',w,h,p,new THREE.MeshBasicMaterial({map:signTexture(text,bg),side:THREE.DoubleSide,toneMapped:false}),parent,ry)}

const alertCanvas=document.createElement('canvas');alertCanvas.width=lowPower?640:960;alertCanvas.height=lowPower?320:480;const ax=alertCanvas.getContext('2d');const alertTexture=new THREE.CanvasTexture(alertCanvas);alertTexture.colorSpace=THREE.SRGBColorSpace;
function drawAlert(t=0){const w=alertCanvas.width,h=alertCanvas.height;const g=ax.createLinearGradient(0,0,w,h);g.addColorStop(0,'#073a82');g.addColorStop(.5,'#16a6ee');g.addColorStop(1,'#0744b4');ax.fillStyle=g;ax.fillRect(0,0,w,h);ax.save();ax.globalCompositeOperation='screen';for(let i=0;i<(lowPower?7:12);i++){const y=(i*h/10+t*.017+i*23)%h;ax.strokeStyle='rgba(165,240,255,.18)';ax.beginPath();ax.moveTo(-10,y);ax.lineTo(w+10,y-42);ax.stroke()}ax.restore();ax.save();ax.translate(w*.27,h*.25);ax.transform(1,0,-.12,1,0,0);ax.fillStyle='#e31923';ax.fillRect(0,0,w*.17,h*.1);ax.strokeStyle='#fff';ax.lineWidth=3;ax.strokeRect(0,0,w*.17,h*.1);ax.fillStyle='#fff';ax.font=`italic 700 ${h*.07}px Arial`;ax.textAlign='center';ax.textBaseline='middle';ax.fillText('NOVO',w*.085,h*.05);ax.restore();ax.textAlign='center';ax.font=`900 ${h*.27}px Arial Black,Arial`;ax.lineWidth=5;ax.strokeStyle='#062660';ax.strokeText('ALERTA',w*.53,h*.59);const tg=ax.createLinearGradient(0,h*.4,0,h*.72);tg.addColorStop(0,'#36c6ff');tg.addColorStop(.52,'#176ceb');tg.addColorStop(1,'#093c9d');ax.fillStyle=tg;ax.fillText('ALERTA',w*.53,h*.59);ax.font=`italic ${h*.045}px Arial`;ax.fillStyle='#14243c';ax.textAlign='right';ax.fillText('com Sikêra Jr.',w*.82,h*.75);alertTexture.needsUpdate=true}
drawAlert();
const screenMat=new THREE.MeshBasicMaterial({map:alertTexture,side:THREE.DoubleSide,toneMapped:false});

function createPublic(){
 const g=new THREE.Group();scene.add(g);g.name='Áreas Públicas';
 box('RecFloor',[42,.3,28],[0,.15,-30],M.silver,g);box('RecCeil',[42,.35,28],[0,10.9,-30],M.black,g);box('RecBack',[42,10.6,.45],[0,5.3,-44],M.white,g);box('RecL',[.45,10.6,28],[-21,5.3,-30],M.off,g);box('RecR',[.45,10.6,28],[21,5.3,-30],M.off,g);
 box('CorrFloor',[14,.3,64],[0,.15,-76],M.silver,g);box('CorrCeil',[14,.35,64],[0,10.7,-76],M.black,g);box('CorrL',[.45,10.4,64],[-7,5.2,-76],M.off,g);box('CorrR',[.45,10.4,64],[7,5.2,-76],M.off,g);box('LedL',[.1,.1,58],[-6.65,9.8,-76],M.glowBlue,g);box('LedR',[.1,.1,58],[6.65,9.8,-76],M.glowBlue,g);
 // hall lateral que leva à porta do estúdio
 box('HallFloor',[34,.3,12],[-17,.15,-107],M.silver,g);box('HallCeil',[34,.35,12],[-17,10.7,-107],M.black,g);box('HallBack',[34,10.4,.45],[-17,5.2,-113],M.off,g);box('HallFront',[34,10.4,.45],[-17,5.2,-101],M.off,g);box('HallEnd',[.45,10.4,12],[-34,5.2,-107],M.off,g);box('HallLed',[30,.1,.1],[-17,9.75,-112.55],M.glowBlue,g);sign('ESTÚDIO NOVO ALERTA',10.5,2,[-17,8.7,-112.72],0,'#0757bb',g);
}

function createStudio(){
 const g=new THREE.Group();scene.add(g);g.name='Estúdio Novo Alerta';g.position.set(-44,0,-126);
 const H=12.6,HY=H/2,frontZ=17,backZ=-17;
 box('Floor',[48,.38,34],[0,.19,0],M.floor,g);box('Ceil',[48,.42,34],[0,H,0],M.black,g);box('Back',[48,H,.5],[0,HY,backZ],M.black,g);box('Left',[.5,H,34],[-24,HY,0],M.white,g);box('Right',[.5,H,34],[24,HY,0],M.navy,g);
 // frente fechada, SEM porta nos fundos
 box('Front',[48,H,.5],[0,HY,frontZ],M.navy,g);
 // porta lateral esquerda, conectada ao hall
 box('SideDoorTop',[.55,3.5,7],[-24,10.85,7.5],M.navy,g);
 box('SideDoorBack',[.55,9,5],[-24,4.5,13],M.navy,g);
 box('DoorFrameA',[.9,9,.55],[-23.55,4.5,3.9],M.blue,g);
 box('DoorFrameB',[.9,9,.55],[-23.55,4.5,11.1],M.blue,g);
 box('DoorFrameTop',[.9,.7,7.8],[-23.55,9,7.5],M.blue,g);
 box('DoorLight',[.25,.12,6.9],[-23.02,8.62,7.5],M.glowBlue,g);
 sign('NOVO ALERTA',5.7,1.5,[-23.0,10.1,7.5],Math.PI/2,'#0757bb',g);
 // piso branco largo e proporcional
 box('WhiteFloor',[13,.055,34],[-17.5,.43,0],M.white,g,-.025);
 // moldura em L fica FORA da área dos telões
 box('LColumn',[1.05,10.8,1],[-20.7,6.6,-15.9],M.white,g);
 box('LTop',[37,1,1],[-2.2,11.2,-15.9],M.white,g);
 box('LBlueV',[.16,9.6,.14],[-20.1,6.5,-15.3],M.glowWhite,g);
 box('LBlueH',[35,.14,.14],[-2.2,10.62,-15.3],M.glowWhite,g);
 box('InnerBlue',[31,.12,.12],[-1.5,10.1,-14.45],M.glowBlue,g);
 // telão principal recuado: não toca nem atravessa a moldura de luz
 box('MainRecess',[29.6,9.5,.65],[-5.2,6.3,-16.55],M.navy,g);
 plane('MainScreen',28.3,8.7,[-5.2,6.3,-16.18],screenMat,g,0);
 // retorno em L menor, mantendo folga da iluminação
 box('ReturnRecess',[.65,9.5,7.2],[9.95,6.3,-12.95],M.navy,g);
 plane('ReturnScreen',6.4,8.7,[9.58,6.3,-12.95],screenMat.clone(),g,-Math.PI/2);
 // coluna técnica separa retorno do telão direito
 for(let i=0;i<3;i++){box('TechCol',[.9,9.5,1.05],[10.7+i*1.9,6.3,-14.9],i%2?M.blue2:M.blue,g);box('TechLed',[.08,8.3,.08],[10.28+i*1.9,6.3,-14.28],M.glowBlue,g)}
 // telão direito mais para dentro e mais baixo
 box('RightPanel',[10.5,10.8,.65],[17.8,6.4,-2.4],M.navy,g,-.06);
 plane('RightScreen',7.5,8.6,[17.55,6.4,-2.02],screenMat.clone(),g,-.06);
 // ripas do lado esquerdo
 for(let i=0;i<7;i++)box('Slat',[.25,8.8,.4],[-22.45,5.8,-11.5+i*1.55],M.off,g);
 // refletores baixos, próximos ao teto como na referência
 const spots=[[-13,11.7,0],[-4,11.7,2],[6,11.7,1],[14,11.7,-2]];
 spots.forEach(p=>{box('Spot',[1.8,.42,1.35],p,M.black,g);box('SpotFace',[1.15,.06,.82],[p[0],11.46,p[2]-.03],M.glowWhite,g)});
 // câmeras leves
 [[-11,0,5],[5,0,7],[13,0,9]].forEach(p=>{const c=new THREE.Group();c.position.set(...p);g.add(c);box('Tripod',[.22,2.5,.22],[0,1.25,0],M.silver,c);box('Cam',[1.8,1.15,2.1],[0,2.8,0],M.black,c);box('Lens',[.55,.55,.65],[0,2.8,-1.35],M.silver,c)});
}

createPublic();createStudio();

const walkZones=[
 {x1:-19,x2:19,z1:-42,z2:-18,label:'Recepção'},
 {x1:-6.2,x2:6.2,z1:-103,z2:-43,label:'Corredor Principal'},
 {x1:-33,x2:6.2,z1:-112.5,z2:-101.5,label:'Corredor Principal'},
 // passagem pela porta lateral e interior do estúdio
 {x1:-48,x2:-40,z1:-123,z2:-111,label:'Entrada Novo Alerta'},
 {x1:-66,x2:-22,z1:-142,z2:-112,label:'Estúdio Novo Alerta'}
];
function zoneAt(x,z){return walkZones.find(q=>x>=q.x1&&x<=q.x2&&z>=q.z1&&z<=q.z2)}

window.addEventListener('tvacritica:start',e=>{currentMode=e.detail||{type:'full'};camera.position.set(0,1.7,-28);if(isTouch){mobileActive=true;startPanel.style.display='none'}else{startPanel.style.display='flex';startButton.textContent='ENTRAR'}});
const keys=new Set();addEventListener('keydown',e=>keys.add(e.code));addEventListener('keyup',e=>keys.delete(e.code));const clock=new THREE.Clock();
function move(dt){if(!(locked||mobileActive))return;let dx=0,dz=0;if(isTouch){dx=joyX;dz=joyY}else{if(keys.has('KeyW'))dz=-1;if(keys.has('KeyS'))dz=1;if(keys.has('KeyA'))dx=-1;if(keys.has('KeyD'))dx=1}const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const sp=(running||keys.has('ShiftLeft'))?11.5:7.2;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const old=camera.position.clone();camera.position.addScaledVector(f,-dz*sp*dt);camera.position.addScaledVector(r,dx*sp*dt);const z=zoneAt(camera.position.x,camera.position.z);if(!z)camera.position.copy(old);else locationLabel.textContent=z.label;camera.position.y=1.7}
let last=0;const interval=lowPower?135:75;function animate(t=0){requestAnimationFrame(animate);if(t-last>interval){drawAlert(t);last=t}move(Math.min(clock.getDelta(),.033));renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?.78:1.3));renderer.setSize(innerWidth,innerHeight,false)});
loading.style.display='none';animate();