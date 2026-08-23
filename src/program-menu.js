// Menu inicial de seleção — TV A Crítica 3D

const menu = document.getElementById('programMenu');
const menuGrid = document.getElementById('programGrid');
const menuTitle = document.getElementById('programMenuTitle');

const programs = [
  { id: 'alerta', name: 'Novo Alerta', destination: { x: -28, y: 1.75, z: -90 } },
  { id: 'acritica-brasil', name: 'A Crítica Brasil' },
  { id: 'alerta-amazonas', name: 'Alerta Amazonas' },
  { id: 'alo-cidade', name: 'Alô Cidade' },
  { id: 'magazine', name: 'Magazine' },
  { id: 'manha-do-ar', name: 'Jornal Manhã do Ar' },
  { id: 'debate-eleitoral', name: 'Debate Eleitoral' },
  { id: 'a-bordo', name: 'A Bordo' },
  { id: 'the-box', name: 'The Box' },
  { id: 'acritica-news', name: 'A Crítica News Madrugada e Tarde' },
  { id: 'nosso-encontro', name: 'Nosso Encontro' }
];

function createAnimatedAlertaLogo(host) {
  const c = document.createElement('canvas');
  c.width = 720; c.height = 320;
  c.className = 'program-logo-canvas';
  host.appendChild(c);
  const x = c.getContext('2d');
  let raf = 0;
  function draw(t=0){
    const w=c.width,h=c.height;
    const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#03256b');g.addColorStop(.45,'#0b8ee6');g.addColorStop(1,'#0235a5');x.fillStyle=g;x.fillRect(0,0,w,h);
    x.save();x.globalCompositeOperation='screen';
    for(let i=0;i<22;i++){const y=(i*18+(t*.05+i*13)%h)%h;const off=((t*.15+i*47)%(w+220))-110;x.strokeStyle='rgba(120,225,255,.22)';x.lineWidth=1+(i%2);x.beginPath();x.moveTo(-100+off*.08,y);x.lineTo(w+100,y-60+(i%5)*15);x.stroke();}
    x.restore();
    x.save();x.translate(w*.16,h*.16);x.transform(1,0,-.12,1,0,0);x.fillStyle='#e30b19';x.fillRect(0,0,165,50);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(0,0,165,50);x.fillStyle='#fff';x.font='italic 700 34px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('NOVO',81,25);x.fillStyle='#e30b19';x.fillRect(174,0,10,50);x.fillRect(190,0,10,50);x.restore();
    x.textAlign='center';x.textBaseline='middle';x.font='900 104px Arial Black, Arial';x.lineWidth=6;x.strokeStyle='#01256e';x.strokeText('ALERTA',w*.52,h*.58);const tg=x.createLinearGradient(0,h*.36,0,h*.72);tg.addColorStop(0,'#1ca8ff');tg.addColorStop(.5,'#0b63ee');tg.addColorStop(1,'#0131a1');x.fillStyle=tg;x.fillText('ALERTA',w*.52,h*.58);x.fillStyle='rgba(10,20,40,.82)';x.font='italic 25px Arial';x.textAlign='right';x.fillText('com Sikêra Jr.',w*.84,h*.78);
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}

function makeCard(program) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'program-card';
  button.dataset.program = program.id;
  const logo = document.createElement('span');
  logo.className = 'program-logo-placeholder';
  if(program.id === 'alerta') createAnimatedAlertaLogo(logo); else logo.textContent = 'LOGO';
  const strong=document.createElement('strong');strong.textContent=program.name;
  const small=document.createElement('small');small.textContent='Entrar pela recepção';
  button.append(logo,strong,small);
  button.addEventListener('click', () => chooseProgram(program));
  return button;
}

function chooseProgram(program) {
  window.TVACRITICA_GAME_MODE = {
    type: 'program',
    programId: program.id,
    programName: program.name,
    receptionStart: { x: 0, y: 1.75, z: -28 },
    destination: program.destination || null,
    restrictOtherStudios: true
  };
  menu.style.display = 'none';
  window.dispatchEvent(new CustomEvent('tvacritica:start', { detail: window.TVACRITICA_GAME_MODE }));
}

function chooseFullStation() {
  window.TVACRITICA_GAME_MODE = { type: 'full', programId: null, programName: 'Emissora completa', restrictOtherStudios: false };
  menu.style.display = 'none';
  window.dispatchEvent(new CustomEvent('tvacritica:start', { detail: window.TVACRITICA_GAME_MODE }));
}

programs.forEach(program => menuGrid.appendChild(makeCard(program)));
document.getElementById('fullStationButton').addEventListener('click', chooseFullStation);
menuTitle.textContent = 'TV A CRÍTICA';
menu.style.display = 'flex';
