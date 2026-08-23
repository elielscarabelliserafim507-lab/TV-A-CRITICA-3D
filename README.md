# TV A CRÍTICA 3D

Jogo/experiência 3D web da TV A Crítica, construído com Three.js para rodar diretamente no navegador e ser compatível com GitHub Pages.

## Construção atual — Fachada detalhada

A primeira etapa foi refeita com base nas três referências visuais da área externa. O cenário agora inclui:

- prédio principal em azul e branco com volumes independentes;
- torre frontal da entrada e marquise branca;
- portas de vidro, puxadores, degraus e faixa azul;
- logomarca 3D estilizada e letreiros `acritica`;
- sequência de janelas, pilastras e pavimento superior;
- estacionamento com vagas, faixas e limitadores;
- vários carros 3D low-poly otimizados;
- calçadas e piso frontal;
- canteiros, floreiras, arbustos, flores e topiarias;
- palmeiras modeladas em blocos com folhas individuais;
- totem azul/ciano iluminado;
- torre de telecomunicações com travessas, painéis e luz de topo;
- antena parabólica no telhado;
- postes e luminárias de jardim;
- iluminação arquitetural noturna;
- sombras suaves, neblina atmosférica e tone mapping;
- ciclo manual dia/noite;
- câmera livre, zoom e navegação WASD;
- pontos rápidos de câmera: fachada, estacionamento, torre e vista aérea;
- tour automático;
- modo HD/ECO para equilibrar qualidade e desempenho;
- interface adaptada para computador e celular.

## Estrutura

- `index.html` — tela do jogo e HUD.
- `styles.css` — interface responsiva.
- `src/main.js` — construção procedural de todo o cenário 3D externo.
- `src/time-cycle.js` — sistema de iluminação dia/noite.
- `src/program-menu.js` — navegação entre os pontos da emissora.

## Controles

- Arrastar: girar a câmera.
- Roda/pinça: aproximar e afastar.
- `W`, `A`, `S`, `D`: caminhar pelo terreno.
- Botão `⌂`: fachada principal.
- Botão `☀/☾`: dia/noite.
- Botão `▶`: tour automático.
- Botão `HD/ECO`: qualidade gráfica.

## Próxima etapa

A área externa já possui uma base detalhada construída por geometria real, sem depender de uma foto plana como cenário. A próxima fase é ampliar o complexo e construir o interior cômodo por cômodo (recepção, corredores, redação, estúdios, switcher/master, camarins, áreas técnicas e demais ambientes) conforme novas referências forem aprovadas.
