import * as THREE from 'three';

export function createTimeCycle(scene, renderer){
  let isDay=true;
  const hemi=new THREE.HemisphereLight(0xbfe9ff,0x24310e,2.25);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff2cf,4.5);sun.position.set(-35,48,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);
  const nightAmbient=new THREE.AmbientLight(0x1a2a78,.15);scene.add(nightAmbient);
  const dayColor=new THREE.Color(0x69c7ff),nightColor=new THREE.Color(0x06112f);
  scene.background=dayColor.clone();scene.fog=new THREE.Fog(dayColor,85,210);
  function apply(day){
    isDay=day;
    const bg=day?dayColor:nightColor;scene.background.copy(bg);scene.fog.color.copy(bg);
    hemi.intensity=day?2.25:.32;hemi.color.set(day?0xbfe9ff:0x253775);hemi.groundColor.set(day?0x24310e:0x090d19);
    sun.intensity=day?4.5:.2;sun.color.set(day?0xfff2cf:0x5572bb);nightAmbient.intensity=day?.12:.62;
    renderer.toneMappingExposure=day?1.05:.78;
    scene.traverse(o=>{if(o.userData.nightLight){o.visible=!day;}if(o.userData.emissiveNight&&o.material){o.material.emissiveIntensity=day?.25:2.2;}});
  }
  function toggle(){apply(!isDay);return isDay;}
  return {toggle,apply,get isDay(){return isDay;}};
}