import * as THREE from 'three';
export function createFirstPerson(camera,canvas){
 const mobile=matchMedia('(pointer:coarse)').matches; const keys={}; let yaw=0,pitch=0,active=false,run=false; const velocity=new THREE.Vector3(); const clock=new THREE.Clock();
 camera.position.set(42,1.72,16); camera.rotation.order='YXZ';
 const applyLook=(dx,dy)=>{yaw-=dx*.0026;pitch-=dy*.0023;pitch=Math.max(-1.42,Math.min(1.42,pitch));camera.rotation.set(pitch,yaw,0)};
 addEventListener('keydown',e=>keys[e.code]=true);addEventListener('keyup',e=>keys[e.code]=false);
 canvas.addEventListener('click',()=>{if(!mobile&&active)canvas.requestPointerLock?.()});addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas)applyLook(e.movementX,e.movementY)});
 const joy=document.getElementById('joystick'),stick=document.getElementById('stick'),look=document.getElementById('lookZone'),runBtn=document.getElementById('runBtn');let jx=0,jy=0,jid=null,lid=null,lx=0,ly=0;
 function joyMove(e){const r=joy.getBoundingClientRect(),t=[...e.changedTouches].find(t=>t.identifier===jid);if(!t)return;let x=t.clientX-(r.left+r.width/2),y=t.clientY-(r.top+r.height/2);const d=Math.hypot(x,y),m=42;if(d>m){x=x/d*m;y=y/d*m}jx=x/m;jy=y/m;stick.style.transform=`translate(${x}px,${y}px)`}
 joy?.addEventListener('touchstart',e=>{jid=e.changedTouches[0].identifier;joyMove(e)},{passive:false});joy?.addEventListener('touchmove',e=>{e.preventDefault();joyMove(e)},{passive:false});joy?.addEventListener('touchend',()=>{jid=null;jx=jy=0;stick.style.transform='translate(0,0)'},{passive:false});
 look?.addEventListener('touchstart',e=>{const t=e.changedTouches[0];lid=t.identifier;lx=t.clientX;ly=t.clientY},{passive:false});look?.addEventListener('touchmove',e=>{e.preventDefault();const t=[...e.changedTouches].find(t=>t.identifier===lid);if(!t)return;applyLook(t.clientX-lx,t.clientY-ly);lx=t.clientX;ly=t.clientY},{passive:false});look?.addEventListener('touchend',()=>lid=null,{passive:false});
 runBtn?.addEventListener('touchstart',e=>{e.preventDefault();run=true},{passive:false});runBtn?.addEventListener('touchend',()=>run=false,{passive:false});
 function update(){if(!active)return;const dt=Math.min(clock.getDelta(),.04),speed=(keys.ShiftLeft||keys.ShiftRight||run?10:5.3);let f=(keys.KeyW?1:0)-(keys.KeyS?1:0)-jy,r=(keys.KeyD?1:0)-(keys.KeyA?1:0)+jx;const n=Math.hypot(f,r);if(n>1){f/=n;r/=n}const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));velocity.copy(forward).multiplyScalar(f).addScaledVector(right,r).multiplyScalar(speed*dt);camera.position.add(velocity);camera.position.y=1.72;camera.position.x=Math.max(-68,Math.min(68,camera.position.x));camera.position.z=Math.max(-48,Math.min(50,camera.position.z))}
 return{update,start(){active=true;document.body.classList.add('playing');if(!mobile)canvas.requestPointerLock?.()},home(){camera.position.set(42,1.72,16);yaw=0;pitch=0;camera.rotation.set(0,0,0)}}
}
