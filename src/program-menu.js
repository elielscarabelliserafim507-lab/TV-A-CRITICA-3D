// Menu inicial de seleção — TV A Crítica 3D
// As logos oficiais serão adicionadas depois, sem inventar artes.

const menu = document.getElementById('programMenu');
const menuGrid = document.getElementById('programGrid');
const menuTitle = document.getElementById('programMenuTitle');

const programs = [
  { id: 'alerta', name: 'Alerta', target: { x: 0, y: 1.75, z: -33 }, destination: { x: -28, y: 1.75, z: -76 } },
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

function makeCard(program) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'program-card';
  button.dataset.program = program.id;
  button.innerHTML = `<span class="program-logo-placeholder">LOGO</span><strong>${program.name}</strong><small>Entrar pela recepção</small>`;
  button.addEventListener('click', () => chooseProgram(program));
  return button;
}

function chooseProgram(program) {
  // O modo de programa começa SEMPRE na recepção, nunca na fachada.
  window.TVACRITICA_GAME_MODE = {
    type: 'program',
    programId: program.id,
    programName: program.name,
    receptionStart: { x: 0, y: 1.75, z: -33 },
    destination: program.destination || null,
    restrictOtherStudios: true
  };
  menu.style.display = 'none';
  window.dispatchEvent(new CustomEvent('tvacritica:start', { detail: window.TVACRITICA_GAME_MODE }));
}

function chooseFullStation() {
  window.TVACRITICA_GAME_MODE = {
    type: 'full',
    programId: null,
    programName: 'Emissora completa',
    restrictOtherStudios: false
  };
  menu.style.display = 'none';
  window.dispatchEvent(new CustomEvent('tvacritica:start', { detail: window.TVACRITICA_GAME_MODE }));
}

programs.forEach(program => menuGrid.appendChild(makeCard(program)));

document.getElementById('fullStationButton').addEventListener('click', chooseFullStation);

menuTitle.textContent = 'TV A CRÍTICA';
menu.style.display = 'flex';
