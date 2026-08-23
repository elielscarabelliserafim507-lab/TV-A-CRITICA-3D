export function createProgramMenu(onSelect){
  const root=document.getElementById('programMenu');
  const spots=[
    ['Fachada principal','Entrada e logomarca','front'],
    ['Estacionamento','Veículos e paisagismo','parking'],
    ['Torre de transmissão','Antenas e comunicação','tower'],
    ['Vista aérea','Complexo completo','aerial']
  ];
  root.innerHTML='<h3>Explorar emissora</h3>'+spots.map(([a,b,id])=>`<button data-spot="${id}"><b>${a}</b><small>${b}</small></button>`).join('');
  root.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>onSelect(btn.dataset.spot)));
}