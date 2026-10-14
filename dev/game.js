
'use strict';
/* ============================================================
   Rats! — v0.5 · Roguelike: dungeons procedurais nv 1–10,
   baú de 30 slots, defesa por queijos, poderes e Rei Rato
   ============================================================ */

/* ---------------- CONFIG / PALETA ---------------- */
const TW = 64;
let pitch = .5, zoom = 4;                                   // pixels mais grossos por padrão
const TT = () => Math.round(TW * pitch / 2);
const WALLH = () => Math.round(TW * 1.1 * (1.38 - pitch));

const OUT = '#14151a';
const STONE = ['#39404d', '#434b59', '#333a46', '#3e4552'];
const MORTAR = '#22262e', STONE_LO = '#282d38';
const ICE_STONE = ['#2e4a74', '#385680', '#284168', '#334e78'];   // andares 21–30: gelo azul profundo
const ICE_MORTAR = '#1a2a48', ICE_LO = '#223650';
const SEW_STONE = ['#3c4836', '#465442', '#354031', '#41503b'];   // andares 31–40: esgoto real
const SEW_MORTAR = '#232c20', SEW_LO = '#2a3626';
const WOOD = ['#6b5138', '#755a40', '#614934', '#6f563c'];        // covil: casinha rústica de madeira
const WOOD_MORTAR = '#41301f', WOOD_LO = '#54402c';
const DARKP = ['#17171e', '#1b1b23', '#141419', '#191920'];       // lan house gamer: preto fosco
const DARK_MORTAR = '#0b0b10', DARK_LO = '#101016';
const WCH_STONE = ['#2c1a3e', '#341f47', '#241534', '#301d42'];   // andares 31–39: o Sabá das Bruxas
const WCH_MORTAR = '#150b1e', WCH_LO = '#1c1029';
const CRS_STONE = ['#2b1014', '#341419', '#210b0f', '#301217'];   // ANDAR MALDITO: pedra encharcada de vermelho
const CRS_MORTAR = '#120407', CRS_LO = '#1d090c';
// paleta do tema atual (piso/parede)
function themePal(){
  if (current.cursed) return [CRS_STONE, CRS_MORTAR, CRS_LO, '#5e1a20'];   // a maldição pinta tudo por cima
  if (current.dark) return [DARKP, DARK_MORTAR, DARK_LO, '#26262e'];
  if (current.wood) return [WOOD, WOOD_MORTAR, WOOD_LO, '#8a6c4a'];
  if (current.ice) return [ICE_STONE, ICE_MORTAR, ICE_LO, '#5a7eaa'];
  if (current.sewer) return [SEW_STONE, SEW_MORTAR, SEW_LO, '#586a50'];
  if (current.witch) return [WCH_STONE, WCH_MORTAR, WCH_LO, '#7a3f9e'];
  return [STONE, MORTAR, STONE_LO, '#4a5262'];
}
const CAPE = '#3f6b3a', CAPED = '#2c4f2b', CAPEDD = '#1d3a1e', GOLD = '#c9a23c';

const SKIN_HERO = {
  fur: '#7d848f', furD: '#565c66', furHi: '#9aa0a8', rim: '#8a7a5e',
  tail1: '#584b46', tail2: '#7d6a62', glint: '#c99a4a', nose: '#9a5a5a',
  cape: true, nick: true, brow: true, lashes: false, apron: false, bow: false,
};
const SKIN_ENEMY = {
  fur: '#6a5f52', furD: '#48413a', furHi: '#867a6a', rim: '#6e5a44',
  tail1: '#3e3833', tail2: '#5a4f46', glint: '#c94a3a', nose: '#6e4a44',
  cape: false, nick: true, brow: true, lashes: false, apron: false, bow: false,
};
const SKIN_SOLDIER = {   // rato soldado — pelagem ferrugem, mais rápido
  fur: '#7a4a3a', furD: '#54322a', furHi: '#9a6a52', rim: '#8a5a3a',
  tail1: '#42302a', tail2: '#5e463c', glint: '#e05a3a', nose: '#7a3a34',
  cape: false, nick: true, brow: true, lashes: false, apron: false, bow: false,
};
const SKIN_ARMORED = {   // rato couraçado — lento, tanque, elmo de aço
  fur: '#5a6270', furD: '#3a414d', furHi: '#7a838f', rim: '#8a929b',
  tail1: '#333a44', tail2: '#4a525e', glint: '#c9c94a', nose: '#5a5a6a',
  cape: false, nick: true, brow: true, lashes: false, apron: false, bow: false, helm: true,
};
const SKIN_SHADOW = {    // rato sombrio — veloz, enxerga longe
  fur: '#3a3444', furD: '#262230', furHi: '#544c62', rim: '#5a4a72',
  tail1: '#221e2c', tail2: '#38304a', glint: '#b06ae0', nose: '#4a3a54',
  cape: false, nick: true, brow: true, lashes: false, apron: false, bow: false,
};
const SKIN_KING = {      // o Rei Rato — chefe do nível 10
  fur: '#4a3f36', furD: '#322a24', furHi: '#6a5c4e', rim: '#c9a23c',
  tail1: '#2c2620', tail2: '#4a3f36', glint: '#e0b24a', nose: '#6a4a44',
  cape: false, nick: true, brow: true, lashes: false, apron: false, bow: false, crown: true,
};
const SKIN_CAT = { cat: true };                               // O GATO — chefão 2×2 do nível 10
const SKIN_PLAGUE = { plague: true };                         // Plague Doctor — alquimista de bico, rápido e enxerga longe
const SKIN_RATKING = { ratking: true };                       // Nó de Ratos (rat king) — 4 ratinhos amarrados pelas caudas
const SKIN_TOAD = { toad: true };                             // Sapo do Lodo — venenoso, saltitante
const SKIN_FROG = { frog: true };
const SKIN_SAPINHA = { frog: true, sapinha: true };             // a SAPINHA do covil: quem presenteia o jogador 2                             // Sapo Aventureiro — o JOGADOR 2, aliado
const SKIN_TOADBOSS = { toad: true, big: true };              // Sapo Real — chefe do nível 30
const SKIN_LEECH = { leech: true };                           // Sanguessuga Real — rasteja e drena
const SKIN_MOSQ = { mosq: true, fly: true };                  // Mosquito do Pântano — voa e pica
const SKIN_JACK = { jack: true };                             // Abóbora Saltitante — pula e ri
const SKIN_SCARE = { scare: true };                           // Espantalho de Palha — alto, lento e duro
const SKIN_CROW = { crow: true, fly: true };                  // Corvo Bruxo — voa, enxerga longe
const SKIN_CAULD = { cauld: true };                           // Caldeirão Vivo — cospe caldo
const SKIN_ICECUBE = { cube: true };                          // Cubo Vivo — gelo ambulante c/ peixe preso
const SKIN_FROSTMOTH = { moth: true, fly: true };             // Mariposa Boreal — asas de floco de neve
const SKIN_YETI = { yeti: true };                             // Yeti Filhote — tanque peludo
const SKIN_YETIBOSS = { yeti: true, big: true };              // Yeti Ancião — chefe do nível 20
const SKIN_SLIME = { blob: true };                            // Gosma do Arco-íris (aceno ao Rainbow Pong)
const SKIN_BAT = { bat: true, fly: true };                    // Morcego Flamejante — inflige queimadura
const SKIN_EYE = { eye: true, fly: true };                    // Observador — olho flutuante magenta
const SKIN_WISP = { wisp: true, fly: true };                  // Fogo-fátuo ciano
const SKIN_WAIFU = {                                          // pelo BRANQUINHO, igual ao retrato do aviso
  fur: '#e8e0d4', furD: '#c2b8a8', furHi: '#f6f2ea', rim: '#d9b87c', belly: '#f0cdc2',
  tail1: '#bfb2a4', tail2: '#ddd2c4', glint: '#c99a4a', nose: '#c97b8e',
  cape: false, nick: false, brow: false, lashes: true, apron: true, bow: true,
};

/* ---------------- CANVAS / CÂMERA ---------------- */
const cv = document.getElementById('game');
const cx = cv.getContext('2d');
const B = document.createElement('canvas');
let g = B.getContext('2d');                                 // alvo atual do desenho (trocado ao montar o cenário)
let SW = 0, SH = 0, VW = 0, VH = 0;
/* qualidade adaptativa: se o quadro engasgar, os desfoques de canvas caem fora.
   filter:'blur()' é o item mais caro do render no desktop — a versão leve mantém o brilho, só sem borrão */
let LOWFX = false, fxSamples = 0, fxSlow = 0, fxBlurs = 0;
// teto rígido de desfoques por quadro: com muitos itens/poças o custo explodia
const blurFx = px => { g.filter = (LOWFX || ++fxBlurs > 8) ? 'none' : `blur(${px}px)`; };
function fitBuffer(){
  VW = Math.ceil(SW / zoom) + 2;
  VH = Math.ceil(SH / zoom) + 2;
  if (B.width !== VW || B.height !== VH){ B.width = VW; B.height = VH; }
}
/* vinheta: gradiente do tamanho da tela — desenhá-lo por quadro custava caro no desktop.
   agora é assado uma vez por redimensionamento e só copiado */
const VG = document.createElement('canvas');
const vgx = VG.getContext('2d');
// quanto mais fundo o andar, mais a luz se fecha nas bordas. De leve: o miolo da tela não muda,
// só o canto escurece — masmorra funda tem que dar a sensação de lanterna curta.
let vgFundo = 0;
function bakeVignette(){
  VG.width = SW; VG.height = SH;
  const r0 = [.42, .39, .36, .34][vgFundo], al = [.55, .61, .66, .72][vgFundo];
  const cor = vgFundo === 3 ? '10,2,4' : '2,3,8';             // na fenda maldita o breu puxa pro sangue
  const vg = vgx.createRadialGradient(SW / 2, SH / 2, Math.min(SW, SH) * r0, SW / 2, SH / 2, Math.max(SW, SH) * .74);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(${cor},${al})`);
  vgx.clearRect(0, 0, SW, SH);
  vgx.fillStyle = vg; vgx.fillRect(0, 0, SW, SH);
}
function resize(){
  SW = innerWidth; SH = innerHeight;
  cv.width = SW; cv.height = SH;
  cx.imageSmoothingEnabled = false;
  fitBuffer();
  g.imageSmoothingEnabled = false;                            // o buffer é pixel art: nada de suavizar
  bakeVignette();
}
addEventListener('resize', resize); resize();
const cam = { x: 0, y: 0, init: false };
let offX = 0, offY = 0;
/* feedback de impacto: tranco de câmera, clarão vermelho e hit-stop */
let shakeT = 0, shakeDur = 1, shakeMag = 0, dmgFlash = 0, hitStop = 0, shkX = 0, shkY = 0;
function shake(m, d, dv){                                    // dv = direção do golpe: a câmera é empurrada pra lá
  shakeMag = m; shakeDur = d; shakeT = d;
  if (dv == null){ shkX = 0; shkY = 0; return; }
  const [ddx, ddy] = DIRV[w2s(dv)];
  shkX = (ddx - ddy) * .5; shkY = (ddx + ddy) * .25;
}

/* ---------------- HELPERS ---------------- */
let FLASHW = null;                                           // enquanto ligado, tudo que passa por P sai branco
let DARKW = 0;                                               // maldição: o bicho vira silhueta de breu com brasa
const darkCache = new Map();
// DUOTONE. Em vez de um véu vermelho por cima (que só deixava o bicho rosado), cada cor é
// remapeada pelo próprio BRILHO: rampa quase plana embaixo — tudo que já era médio ou escuro
// cai no preto — e um salto no topo, então só o que era claro (olho, brilho, metal) acende em
// brasa. Vale pra QUALQUER bicho sem tocar em nenhuma função de desenho.
function sombrio(c){
  let v = darkCache.get(c);
  if (v !== undefined) return v;
  let r = 0, vd = 0, b = 0, al = 1;
  if (c[0] === '#'){
    const h = c.length < 6 ? c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(1, 7);
    const n = parseInt(h, 16);
    r = n >> 16; vd = (n >> 8) & 255; b = n & 255;
  } else {
    const m = c.match(/[\d.]+/g);
    if (!m || m.length < 3) return c;                         // gradiente ou nome: deixa passar
    r = +m[0]; vd = +m[1]; b = +m[2]; if (m[3] !== undefined) al = +m[3];
  }
  const L = (r * .299 + vd * .587 + b * .114) / 255;
  // O corte alto (.86) deixava o bicho num breu tão fechado que sumia no chão maldito. O ponto
  // certo é o do observador: a criatura fica VERMELHA, escura no corpo e clara no que era claro —
  // dá pra ler a silhueta E o que é olho. Base linear no vermelho + um salto no topo.
  const k = L < .6 ? 0 : ((L - .6) / .4) ** .8;
  v = 'rgba(' + Math.round(26 + L * 86 + k * 106) + ',' + Math.round(6 + L * 13 + k * 34) +
      ',' + Math.round(10 + L * 17 + k * 34) + ',' + al + ')';
  if (darkCache.size > 600) darkCache.clear();                // cor com alfa interpolado é infinita: não deixa crescer
  darkCache.set(c, v);
  return v;
}
/* LOTE: com desfoque ligado, CADA fillRect roda o filtro inteiro sozinho — a fresta do baú (16
   colunas de 1px) e o halo do sol (13 fileiras) custavam 29 passadas de blur por quadro, e eram
   quase metade do quadro no covil num celular. Dentro de `lote()` os retângulos da mesma cor
   viram UM caminho só, pintado de uma vez: o filtro roda uma vez e o desenho é o mesmo. */
let LOTE = 0, loteCor = null;
const P = (x, y, w, h, c) => {
  const cor = FLASHW || (DARKW ? sombrio(c) : c);
  if (LOTE){ if (cor !== loteCor){ fechaLote(); loteCor = cor; } g.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); return; }
  g.fillStyle = cor; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
function fechaLote(){ if (loteCor !== null){ g.fillStyle = loteCor; g.fill(); } g.beginPath(); loteCor = null; }
function lote(fn){ g.beginPath(); loteCor = null; LOTE++; try { fn(); } finally { LOTE--; fechaLote(); } }
/* giro do mapa em quartos de volta: 2 toques de 45° = 1 quarto; aqui cada toque já gira o quarto inteiro */
let rot = 0;
function rotXY(x, y){                                        // mundo → coordenadas de vista
  const w = current.w - 1, h = current.h - 1;
  if (rot === 1) return [y, w - x];
  if (rot === 2) return [w - x, h - y];
  if (rot === 3) return [h - y, x];
  return [x, y];
}
function invRot(vx, vy){                                     // vista → mundo (p/ variação do piso)
  const w = current.w - 1, h = current.h - 1;
  if (rot === 1) return [w - vy, vx];
  if (rot === 2) return [w - vx, h - vy];
  if (rot === 3) return [vy, h - vx];
  return [vx, vy];
}
const w2s = d => (d + 4 - rot) % 4;                          // direção do mundo → direção na tela
const s2w = d => (d + rot) % 4;                              // direção na tela → direção do mundo
const vDepth = (x, y) => { const [vx, vy] = rotXY(x, y); return vx + vy; };
const gX = (x, y) => { const [vx, vy] = rotXY(x, y); return (vx - vy) * TW / 2; };
const gY = (x, y) => { const [vx, vy] = rotXY(x, y); return (vx + vy) * TT() + TT(); };
const tvTop = (x, y) => { const [vx, vy] = rotXY(x, y); return [(vx - vy) * TW / 2, (vx + vy) * TT()]; };  // [x, topo do losango]
function setRot(d){
  rot = (rot + d + 4) % 4;
  SFX.ui();
  toast('🔄');
}
function hash(x, y){
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177 | 0;
  return ((h ^ (h >> 16)) >>> 0) / 2147483647 % 1;            // h^(h>>16) preserva o sinal: faixa real é [0,2^31)
}
function E(cxp, cyp, a, b, c){
  for (let y = -b; y <= b; y++){
    const w = Math.round(a * Math.sqrt(Math.max(0, 1 - (y / b) ** 2)));
    if (w > 0) P(cxp - w, cyp + y, w * 2, 1, c);
  }
}
const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
function isoFaceR(x, y, a, h, c){ for (let i = 0; i < a * 2; i++) P(x + i, y + (i >> 1) - h + 1, 1, h, c); }
function isoFaceL(x, y, b, h, c){ for (let i = 1; i <= b * 2; i++) P(x - i, y + (i >> 1) - h + 1, 1, h, c); }
function isoTop(x, y, a, b, c){
  for (let i = -b * 2; i <= a * 2; i++){
    const yl = i >= 0 ? -i / 2 : i / 2;
    const yu = i <= a * 2 - b * 2 ? -b - (i + b * 2) / 2 : -a - (a * 2 - i) / 2;
    P(x + i, y + Math.round(yu), 1, Math.round(yl - yu) + 1, c);
  }
}
function isoBox(x, y, a, b, h, cT, cL, cR){
  isoFaceR(x, y, a, h, cR); isoFaceL(x, y, b, h, cL); isoTop(x, y - h, a, b, cT);
}
// caixa ASSENTADA no tile: âncora = vértice sul; faces seguem as arestas S→E e S→W do losango
function tbox(x, y, a, b, h, cT, cL, cR){
  for (let c = 0; c < a * 2; c++) P(x + c, y - h - (c >> 1), 1, h + 1, cR);
  for (let c = 1; c <= b * 2; c++) P(x - c, y - h - (c >> 1), 1, h + 1, cL);
  isoTop(x, y - h, a, b, cT);
}
// versões CONTORNADAS: silhueta preta 1px antes do corpo (estética unificada do jogo)
function tboxO(x, y, a, b, h, cT, cL, cR){
  tbox(x, y + 1, a + .5, b + .5, h + 2, OUT, OUT, OUT);
  tbox(x, y, a, b, h, cT, cL, cR);
}
function isoTopO(x, y, a, b, c){
  isoTop(x, y + 1, a + .5, b + .5, OUT);
  isoTop(x, y, a, b, c);
}
// vértice inferior (sul) do tile — âncora dos móveis
const pb = (i, j) => { const [vx, vy] = rotXY(i, j); return [(vx - vy) * TW / 2, (vx + vy + 2) * TT()]; };
const shadowE = (x, y, a) => E(x, y, a, Math.max(3, Math.round(a * pitch * .7)), 'rgba(4,5,10,.42)');

/* ---------------- PISO ---------------- */
const tileCache = new Map();
function floorTile(v){
  const thm = current.cursed ? 'x' : current.dark ? 'd' : current.wood ? 'w' : current.ice ? 'i' : current.sewer ? 's' : current.witch ? 'b' : '';
  const th = TT() * 2, key = th + '_' + v + '_' + thm;
  if (tileCache.has(key)) return tileCache.get(key);
  const t = document.createElement('canvas'); t.width = TW; t.height = th;
  const tc = t.getContext('2d');
  const [pal, mor] = themePal();
  for (let y = 0; y < th; y++){
    const half = y < th / 2 ? y : th - 1 - y;
    const w = Math.max(2, Math.round((half + 1) / (th / 2) * (TW / 2)) * 2);
    const x0 = TW / 2 - w / 2;
    tc.fillStyle = pal[v]; tc.fillRect(x0, y, w, 1);
    tc.fillStyle = mor; tc.fillRect(x0, y, 2, 1); tc.fillRect(x0 + w - 2, y, 2, 1);
    if (y > th - 4){ tc.fillStyle = 'rgba(8,10,16,.4)'; tc.fillRect(x0 + 2, y, w - 4, 1); }
  }
  tc.fillStyle = thm === 'i' ? 'rgba(210,236,250,.28)' : thm === 's' ? 'rgba(20,30,16,.7)' : thm === 'x' ? 'rgba(12,2,4,.8)' : 'rgba(16,18,26,.75)';
  const cr = [[[20,8],[24,11],[27,15]], [[38,10],[35,14]], [[30,6],[33,9],[38,12]], [[18,12],[22,15]]][v];
  if (thm !== 'w' && thm !== 'd')                             // madeira e lan: tábuas/placas limpas, sem riscos
    cr.forEach(([a, b]) => tc.fillRect(a, Math.min(th - 3, Math.round(b * th / 32)), 3, 1));
  if (thm === 'x'){                                           // veias em brasa correndo entre as pedras
    tc.fillStyle = 'rgba(190,30,26,.34)';
    tc.fillRect(TW / 2 - 11 + v * 3, Math.round(th * .3), 9, 1);
    tc.fillRect(TW / 2 - 3 - v * 2, Math.round(th * .46), 7, 1);
    tc.fillStyle = 'rgba(255,80,50,.2)';
    tc.fillRect(TW / 2 - 6 + v * 2, Math.round(th * .62), 5, 1);
    tc.fillStyle = 'rgba(0,0,0,.4)';                          // sujeira preta nos cantos
    tc.fillRect(10 + v * 3, th - 7, 4, 2); tc.fillRect(TW - 16 - v * 2, th - 9, 3, 2);
  }
  if (thm === 'd'){                                           // piso preto refletindo os neons
    tc.fillStyle = 'rgba(224,60,150,.12)';
    tc.fillRect(TW / 2 - 12, Math.round(th * .34), 10, 1);
    tc.fillStyle = 'rgba(60,200,230,.12)';
    tc.fillRect(TW / 2 + 2 - v * 2, Math.round(th * .52), 9, 1);
  } else if (thm === 'i'){                                    // placas de gelo polido, rachadas e espelhadas
    tc.fillStyle = 'rgba(180,220,250,.22)';
    tc.fillRect(TW / 2 - 10, Math.round(th * .28), 20, 2);
    tc.fillStyle = 'rgba(240,250,255,.45)';
    tc.fillRect(TW / 2 - 4 + v * 2, Math.round(th * .4), 6, 1);
    tc.fillStyle = 'rgba(140,190,235,.3)';                    // rachadura em zigue-zague
    tc.fillRect(TW / 2 - 8 + v * 3, Math.round(th * .5), 4, 1);
    tc.fillRect(TW / 2 - 4 + v * 3, Math.round(th * .56), 5, 1);
    tc.fillRect(TW / 2 + 1 + v * 3, Math.round(th * .62), 3, 1);
  } else if (thm === 's'){                                    // gosma escorrida e limo entre as pedras
    tc.fillStyle = 'rgba(110,180,80,.22)';
    tc.fillRect(TW / 2 - 10 + v * 3, Math.round(th * .32), 8, 2);
    tc.fillRect(TW / 2 - 2 - v * 2, Math.round(th * .55), 5, 1);
    tc.fillStyle = '#4a6a38';
    tc.fillRect(14 + v * 4, th - 8, 3, 2); tc.fillRect(18 + v * 3, th - 7, 2, 1);
  } else if (thm === 'c'){                                    // filete de latão embutido + rebites
    tc.fillStyle = 'rgba(220,180,90,.22)';
    tc.fillRect(TW / 2 - 12, Math.round(th * .38), 24, 1);
    tc.fillStyle = 'rgba(240,205,120,.4)';
    tc.fillRect(TW / 2 - 12, Math.round(th * .38), 2, 2); tc.fillRect(TW / 2 + 10, Math.round(th * .38), 2, 2);
  } else if (thm === 'b'){                                    // laje de bruxaria: giz de runa e cera pingada
    tc.fillStyle = 'rgba(196,120,232,.16)';
    tc.fillRect(TW / 2 - 9 + v * 2, Math.round(th * .3), 18 - v * 2, 1);
    tc.fillRect(TW / 2 - 9 + v * 2, Math.round(th * .3), 1, 5);
    tc.fillRect(TW / 2 + 8 - v * 2, Math.round(th * .3), 1, 5);
    tc.fillStyle = 'rgba(232,150,60,.22)';                    // pingo de vela e sarro alaranjado
    tc.fillRect(13 + v * 5, Math.round(th * .62), 3, 2);
    tc.fillStyle = 'rgba(120,60,160,.3)';
    tc.fillRect(TW - 20 - v * 3, Math.round(th * .46), 5, 1);
  } else if (v === 3){                                        // masmorra de pedra: laje limpa, só um respingo de brilho
    tc.fillStyle = 'rgba(122,134,152,.3)'; tc.fillRect(40, Math.round(6 * th / 32), 2, 2);
  }
  tileCache.set(key, t);
  return t;
}

/* ---------------- PAREDES ---------------- */
function wallSeg(vx, vy, dirRight, segIdx, salt){
  const th = TT(), WHh = WALLH();
  const [tpal, mor, tlo, thi] = themePal();                   // paleta uma vez por segmento, não por pixel
  for (let i = 0; i < TW / 2; i++){
    const x = dirRight ? vx + i : vx - i - 1;
    const by = vy + Math.round((i + 1) * th / (TW / 2));
    const u = segIdx * 32 + i;
    for (let r = 0; r * 12 < WHh; r++){
      const bh = Math.min(12, WHh - r * 12);
      const bIdx = Math.floor((u + (r % 2) * 8) / 16);
      const sh = hash(bIdx + salt, r);
      const col = sh < .3 ? tlo : (sh > .82 ? thi : tpal[(bIdx + r) % 4]);
      P(x, by - WHh + r * 12, 1, bh, dirRight ? col : shade(col, -14));
      P(x, by - WHh + r * 12, 1, 1, mor);
      if ((u + (r % 2) * 8) % 16 === 0) P(x, by - WHh + r * 12, 1, bh, mor);
    }
    P(x, by - WHh, 1, 2, '#1a1e26');
    if (current.ice){                                         // paredes do gelo: verniz vítreo + franja congelada
      if ((u % 11) < 2) P(x, by - WHh + 4 + (u % 4) * 7, 1, 9, 'rgba(190,230,255,.18)');
      if ((u % 23) === 0) P(x, by - WHh + 2, 1, WHh - 8, 'rgba(220,244,255,.1)');
      if ((u % 6) === 0) P(x, by - 8, 1, 5 + (u % 3) * 3, 'rgba(205,238,255,.5)');   // estalactites na base
      if ((u % 6) === 1) P(x, by - 7, 1, 4, 'rgba(160,210,245,.4)');
    }
    P(x, by - 6, 1, 6, 'rgba(5,6,12,.45)');
  }
}
/* ---------------- CENÁRIO ASSADO ---------------- */
// FOSSO: o buraco no chão. Só as bordas DE CIMA mostram parede interna — é o lado do poço
// que encara a câmera; as de baixo ficam escondidas atrás do lábio do chão da frente.
// mask: 1 = vizinho de cima-esquerda · 2 = cima-direita · 4 = baixo-direita · 8 = baixo-esquerda
const pitCache = new Map();
function pitTile(mask){
  const th = TT() * 2;
  const thm = current.cursed ? 'x' : current.ice ? 'i' : current.sewer ? 's' : current.witch ? 'b' : '';
  const key = th + '_' + mask + '_' + thm;
  if (pitCache.has(key)) return pitCache.get(key);
  const t = document.createElement('canvas'); t.width = TW; t.height = th;
  const tc = t.getContext('2d');
  const [pal, mor] = themePal();
  const vazio = thm === 'x' ? '#0a0003' : thm === 'i' ? '#010409' : thm === 's' ? '#020402' : thm === 'b' ? '#060010' : '#000103';
  const yTop = new Int16Array(TW).fill(-1), yBot = new Int16Array(TW).fill(-1);
  for (let y = 0; y < th; y++){                               // mesmo losango do floorTile, pintado de vazio
    const half = y < th / 2 ? y : th - 1 - y;
    const w2 = Math.max(2, Math.round((half + 1) / (th / 2) * (TW / 2)) * 2);
    const x0 = TW / 2 - w2 / 2;
    tc.fillStyle = vazio; tc.fillRect(x0, y, w2, 1);
    for (let x = x0; x < x0 + w2; x++){ if (yTop[x] < 0) yTop[x] = y; yBot[x] = y; }
  }
  // as BORDAS DE CIMA do poço viram parede interna: é o lado que encara a câmera.
  // a parede desce da RETA da borda (que atravessa o tile inteiro, inclusive fora do losango)
  // e não do losango — senão ela se corta em cada quina e o poço vira ameia de castelo.
  const Lul = x => (TW / 2 - x) * th / TW;                    // reta da borda cima-esquerda
  const Lur = x => (x - TW / 2) * th / TW;                    // reta da borda cima-direita
  const D = Math.max(8, Math.round(th * .62));                // fundura aparente da parede: poço, não valeta
  // AS DUAS FACES NÃO PODEM TER O MESMO TOM. wallSeg pinta a parede que corre pra baixo-esquerda
  // com shade(col,-14) e a que corre pra baixo-direita cheia — a borda cima-esquerda do poço corre
  // pra baixo-esquerda, então herda o escuro. Iguais, o canto do fundo some e o buraco lê como
  // chanfro (uma dobra no chão) em vez de dois planos verticais.
  const k1 = 2 + Math.round(D * .22), k2 = 2 + Math.round(D * .52);
  const FACE = [-10, 1];                                      // b=0 → cima-esquerda · b=1 → cima-direita
  const TOM = FACE.map(d => [shade(pal[1], 30 + d), shade(pal[2], -6 + d),
    shade(pal[2], -22 + d), shade(pal[2], -34 + d)]);
  const Lin = [Lul, Lur];
  for (let x = 0; x < TW; x++){
    const y0 = yTop[x], y1 = yBot[x];
    if (y0 < 0) continue;
    for (let b = 0; b < 2; b++){
      if (mask & (1 << b)) continue;                          // vizinho daquele lado também é fosso: vazio segue
      // CADA PAREDE MORA NA SUA METADE. A reta da borda vale o tile inteiro (é o que tirou os
      // "dentes" da v0.87), mas passando do vértice de cima ela invade a metade da OUTRA parede —
      // e como a de cima-direita é pintada depois, a face clara comia a escura num triângulo
      // grande em cima do vértice. Só pode invadir quando aquele lado não tem parede nenhuma.
      if (b ? x < TW / 2 && !(mask & 1) : x > TW / 2 && !(mask & 2)) continue;
      const [lip, b1, b2, b3] = TOM[b];
      const r = Math.round(Lin[b](x));
      // junta vertical da alvenaria a cada 16 colunas, no mesmo passo das paredes da sala.
      // o risco de pé é o que denuncia que a face é VERTICAL — sem ele o degradê vira bisel.
      const u = b ? x - TW / 2 : TW / 2 - x;
      const junta = (((u + 8) % 16) + 16) % 16 === 0;
      for (let y = Math.max(y0, r); y <= Math.min(y1, r + D); y++){
        const k = y - r;
        tc.fillStyle = k < 2 ? lip : junta ? shade(mor, k < k2 ? -2 : -14)
          : k < k1 ? b1 : k < k2 ? b2 : b3;                   // quina em luz, e a pedra some no breu
        tc.fillRect(x, y, 1, 1);
      }
    }
    if (!(mask & 3) && x === TW / 2)                          // quina do fundo: onde as duas faces se encontram
      for (let y = 0; y <= Math.min(y1, D); y++){ tc.fillStyle = shade(pal[2], -42); tc.fillRect(x, y, 1, 1); }
    for (let b = 0; b < 2; b++){                              // lábio da frente: o fio de chão que ainda pega luz
      if (mask & (b ? 4 : 8)) continue;
      const y = Math.round(th - Lin[b](x));
      if (y - 2 >= y0 && y <= y1 + 1){
        tc.fillStyle = shade(mor, -14); tc.fillRect(x, y - 2, 1, 1);
        tc.fillStyle = shade(pal[1], 12); tc.fillRect(x, y - 1, 1, 1);
      }
    }
  }
  pitCache.set(key, t);
  return t;
}

// PONTE: tábua atravessando o abismo. O losango é o mesmo do piso, mas pintado nas coordenadas
// isométricas (a = ao longo da travessia, b = através): assim a tábua acompanha a direção da
// passagem em qualquer giro do mapa, em vez de virar textura torta.
const bridgeCache = new Map();
function bridgeTile(eixoI, seed, viz, pos){
  const th = TT() * 2;
  const key = th + '_' + (eixoI ? 'i' : 'j') + '_' + seed + '_' + viz + '_' + pos;
  if (bridgeCache.has(key)) return bridgeCache.get(key);
  const t = document.createElement('canvas'); t.width = TW; t.height = th;
  const tc = t.getContext('2d');
  const VAZIO = '#05060a';
  const MAD = ['#553d23', '#61482b', '#4a3620', '#6b5030'];
  const APODRE = '#474334', VIGA = '#2c2013', LUZ = '#6d5433', JUNTA = '#120c07', CORDA = '#7a6743';
  // a tábua partida varia POR TILE (pos), senão a mesma quebra se repetia em todos e a ponte
  // virava uma fenda comprida em vez de estragos espalhados
  const quebrada = hash(seed * 7 + pos, 5) > .55 ? (seed + pos) % 3 : -1;
  const ladoQ = hash(seed + pos, 6) > .5 ? 1 : -1;
  for (let y = 0; y < th; y++){
    const half = y < th / 2 ? y : th - 1 - y;
    const w2 = Math.max(2, Math.round((half + 1) / (th / 2) * (TW / 2)) * 2);
    const x0 = TW / 2 - w2 / 2;
    for (let x = x0; x < x0 + w2; x++){
      const X = x - TW / 2 + .5, Y = y - th / 2 + .5;
      const aa = (X / (TW / 2) + Y / (th / 2)) / 2, bb = (Y / (th / 2) - X / (TW / 2)) / 2;
      const u = eixoI ? aa : bb, v = eixoI ? bb : aa;         // u = ao longo da travessia · v = através
      // 3 tábuas por tile: com 5 elas ficavam finas demais e a ponte lia como escada de mão
      const band = Math.min(2, Math.floor((u + .5) * 3)), fr = ((u + .5) * 3) % 1;
      const podre = hash(seed * 3 + band, 2) > .74;           // tábua carcomida: junta aberta e tom cinzento
      let c = fr < (podre ? .16 : .08) ? JUNTA : (podre ? APODRE : MAD[(band + seed) % 4]);
      if (fr > .9 && !podre) c = LUZ;                         // aresta de cima de cada tábua pegando luz
      if (band === quebrada){                                 // TÁBUA PARTIDA: a beira do rombo fica lascada
        const corte = .06 + hash(band * 5 + seed, 8) * .12;
        const lasca = (hash(Math.round((u + .5) * 30) + band * 9 + seed, 13) - .5) * .07;
        const d3 = (v * ladoQ) - (corte + lasca);
        if (d3 > 0) c = VAZIO;
        else if (d3 > -.035) c = '#8a6a3c';                   // farpa clara na quebra: madeira viva à mostra
        else if (d3 > -.06) c = '#2a1d10';                    // sombra caindo no vão
      }
      if (hash(Math.round((u + .5) * 34) + seed, band + 11) > .93) c = '#2a1e12';            // nó da madeira
      if (fr > .3 && fr < .42 && Math.abs(Math.abs(v) - .33) < .022) c = '#6a5c38';          // prego / amarração
      const temViz = v < 0 ? (viz & 1) : (viz & 2);           // do lado que continua, a tábua segue reta
      if (!temViz && Math.abs(v) > .40){
        const uu = Math.round((u + .5) * 44) + seed * 7;
        const rug = hash(uu, v < 0 ? 3 : 9);
        c = Math.abs(v) > .458 - rug * .058 ? VAZIO           // a beira comida pelo tempo
          : (Math.abs(v) > .432 && hash(uu, 21) > .55 ? CORDA : VIGA);   // corda torcida na longarina
      }
      tc.fillStyle = c; tc.fillRect(x, y, 1, 1);
    }
  }
  bridgeCache.set(key, t);
  return t;
}
// piso e paredes não mudam entre quadros: são desenhados uma vez num canvas próprio
// e daí em diante custam um único drawImage (antes eram ~20 mil fillRects por quadro)
const STG = document.createElement('canvas');
const stgx = STG.getContext('2d');
let stageKey = '', stageOX = 0, stageOY = 0, stageId = 0;
const stageDirty = () => { stageId++; };
function stageCanvas(vw2, vh2, th2){
  const WHh = WALLH();
  const key = [stageId, rot, th2, WHh, vw2, vh2].join('|');
  if (key === stageKey) return STG;
  stageKey = key;
  stageOX = (vh2 - 1) * TW / 2 + TW / 2 + 4;
  stageOY = WHh + 6;
  STG.width = stageOX + (vw2 - 1) * TW / 2 + TW / 2 + 8;
  STG.height = stageOY + (vw2 + vh2 - 2) * th2 + th2 * 2 + 8;
  const prev = g;
  g = stgx; FLASHW = null;
  g.clearRect(0, 0, STG.width, STG.height);
  g.save();
  g.translate(stageOX, stageOY);
  for (let j = 0; j < vh2; j++) wallSeg((0 - j) * TW / 2, j * th2, false, j, 500);
  for (let i = 0; i < vw2; i++) wallSeg(i * TW / 2, i * th2, true, i, current.safe ? 0 : 900);
  // a ponte conta como VAZIO pro fosso: senão o poço desenha um lábio de pedra encostado na tábua
  // e a passagem parece apoiada no chão em vez de pendurada sobre o abismo
  const buraco = (vx, vy) => {
    const [a, b] = invRot(vx, vy);
    return (current.holes.has(a + ',' + b) || current.bridge.has(a + ',' + b)) ? 1 : 0;
  };
  const r0 = rotXY(0, 0), r1 = rotXY(1, 0);                   // pra onde o +x do mundo aponta na vista
  const eixoPonte = Math.abs(r1[0] - r0[0]) > Math.abs(r1[1] - r0[1]);
  for (let j = 0; j < vh2; j++)
    for (let i = 0; i < vw2; i++){
      const [wx2, wy2] = invRot(i, j);                        // variação do piso estável em qualquer giro
      const sx2 = (i - j) * TW / 2 - TW / 2, sy2 = (i + j) * th2;
      const msk = buraco(i - 1, j) | buraco(i, j - 1) * 2 | buraco(i + 1, j) * 4 | buraco(i, j + 1) * 8;
      if (current.bridge.has(wx2 + ',' + wy2)){               // tábua da ponte
        g.drawImage(pitTile(msk), sx2, sy2);                  // o VAZIO passa por baixo: a ponte fica pendurada
        const pi = (vx, vy) => { const [a2, b2] = invRot(vx, vy); return current.bridge.has(a2 + ',' + b2) ? 1 : 0; };
        // o eixo vem do MUNDO (a travessia corre no x), não de quem é ponte do lado: numa ponte
        // de 2 tiles de largura os dois vizinhos são tábua e o palpite dava empate
        const viz = eixoPonte ? (pi(i, j - 1) | pi(i, j + 1) * 2) : (pi(i - 1, j) | pi(i + 1, j) * 2);
        g.drawImage(bridgeTile(eixoPonte, (current.abismo && current.abismo.seed) || 0, viz, (wx2 + wy2) & 3), sx2, sy2);
        continue;
      }
      if (current.holes.has(wx2 + ',' + wy2)){                // fosso: vizinhos em vista, pra o vazio emendar
        g.drawImage(pitTile(msk), sx2, sy2);
        continue;
      }
      g.drawImage(floorTile((hash(wx2, wy2) * 4) | 0), sx2, sy2);
    }
  g.restore();
  g = prev;
  return STG;
}
function shade(hex, d){
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.max(0, (n >> 16) + d)},${Math.max(0, ((n >> 8) & 255) + d)},${Math.max(0, (n & 255) + d)})`;
}
function drawTorch(sx, sy, time){
  P(sx - 1, sy + 2, 3, 10, '#3a3226');
  P(sx - 3, sy + 10, 7, 3, '#2a2f3a');
  P(sx - 2, sy, 5, 3, '#1a1e26');
  const f = ((time * 10) | 0) % 3;
  const [c0, c1, c2, c3] = current.ice                        // a chama muda de alma em cada reino
    ? ['#2a5a8e', '#4aa0d8', '#8ad8f8', '#e0f8ff']
    : current.sewer
    ? ['#1e5a2a', '#3aa04a', '#7ae08a', '#e6ffe8']
    : ['#c96a28', '#e8963c', '#f2c14e', '#faf0c8'];
  P(sx - 3, sy - 6, 7, 7, c0);
  if (f === 0){ P(sx - 2, sy - 10, 5, 5, c1); P(sx - 1, sy - 7, 3, 5, c2); }
  if (f === 1){ P(sx - 3, sy - 9, 5, 4, c1); P(sx - 2, sy - 7, 3, 5, c2); }
  if (f === 2){ P(sx - 1, sy - 11, 4, 6, c1); P(sx - 1, sy - 6, 3, 4, c2); }
  P(sx, sy - 4, 2, 3, c3);
}
function drawGear(sx, sy, r, time, spin){                     // engrenagem de latão girando na parede
  const a0 = time * .5 * spin;
  E(sx, sy, r, r, '#241e12');                                 // sombra de encaixe
  for (let i = 0; i < 8; i++){
    const an = a0 + i * Math.PI / 4;
    P(sx + Math.round(Math.cos(an) * r) - 2, sy + Math.round(Math.sin(an) * r) - 2, 4, 4, '#6a5a38');
  }
  E(sx, sy, r - 1, r - 1, '#584a30');
  E(sx, sy, r - 3, r - 3, '#3c3220');
  for (let i = 0; i < 4; i++){                                // raios internos
    const an = a0 + i * Math.PI / 2;
    P(sx + Math.round(Math.cos(an) * (r - 5)) - 1, sy + Math.round(Math.sin(an) * (r - 5)) - 1, 2, 2, '#6a5a38');
  }
  E(sx, sy, 3, 3, '#8a7648');
  P(sx - 1, sy - 1, 1, 1, '#c9a45a');
}
// pinturas em pixel art penduradas na parede, coluna a coluna seguindo a inclinação
function drawPainting(wallTop, pos, w, h, art){
  const th = TT();
  const sx = wallTop ? gX(pos, 0) : gX(0, pos);
  const base = c => Math.round((wallTop ? (sx + c) : -(sx + c)) * th / (TW / 2)) - Math.round(WALLH() * .55);
  for (let c = -w; c <= w; c++){
    const x = sx + c, b = base(c);
    if (Math.abs(c) === w){ P(x, b - h - 1, 1, h + 3, '#8a6c22'); continue; }   // moldura lateral
    P(x, b - h - 1, 1, 1, GOLD); P(x, b + 1, 1, 1, '#6b5636');                  // moldura sup/inf
    for (let r = 0; r < h; r++) P(x, b - h + r, 1, 1, art(c + w, r) || '#1a2030');
  }
}
const ART_CHEESE = (cx, r) => {                               // natureza-morta: o queijo sagrado
  if (r > 6 && cx > 1 && cx < 15) return '#5c4a30';
  if (r > 2 && r < 8 && cx > 4 && cx < 12) return r === 3 ? '#e8bc50' : '#d9a234';
  if ((cx === 7 && r === 5) || (cx === 10 && r === 6)) return '#a87a24';
  return '#232838';
};
const ART_HERO = (cx, r) => {                                 // retrato do herói de capa
  const mx = 7;
  if (r >= 8 && Math.abs(cx - mx) < 5) return CAPE;
  if (r >= 3 && r < 9 && Math.abs(cx - mx) < 3) return '#7d848f';
  if (r < 3 && (Math.abs(cx - mx - 2) < 2 || Math.abs(cx - mx + 2) < 2)) return '#7d848f';
  if (r === 5 && (cx === mx - 1 || cx === mx + 1)) return '#14151a';
  return '#2a2233';
};
const ART_SUN = (cx, r) => {                                  // paisagem: dia claro sobre as colinas
  if (r > 6) return '#4a8a3c';
  if ((cx - 4) * (cx - 4) + (r - 2) * (r - 2) < 4) return '#ffe9a0';
  if (r === 5 && cx > 8 && cx < 13) return '#f4f0e6';
  return '#8ecdea';
};

// janela de dia: céu, sol, colinas, nuvem e passarinho — em qualquer parede, coluna a coluna
/* A JANELA ASSADA: vidro, céu, colinas e moldura não mudam nunca — eram ~180 retângulos por
   janela, todo quadro. Agora saem UMA vez numa imagem e só são carimbados; nuvem, passarinho e o
   brilho do sol continuam ao vivo por cima. (Com clarão/maldição ligados desenha do jeito antigo.) */
const JANELAS = new Map();
function drawDayWindow(onTop, pos, W, time, sun){
  const th = TT();
  const sx = onTop ? gX(pos, 0) : gX(0, pos);
  const yB = c => Math.round((onTop ? (sx + c) : -(sx + c)) * th / (TW / 2)) - Math.round(WALLH() * .38);
  const H = 26;                                               // vidro alto pra contemplar
  if (!FLASHW && !DARKW){
    const chave = onTop + '|' + pos + '|' + W + '|' + th + '|' + WALLH() + '|' + sx;
    let j = JANELAS.get(chave);
    if (!j){
      const ys = [yB(-W), yB(W)];
      const x0 = Math.floor(sx - W) - 1, y0 = Math.min(...ys) - H - 3;
      const c2 = document.createElement('canvas');
      c2.width = W * 2 + 4; c2.height = Math.max(...ys) - y0 + 4;
      const prev = g; g = c2.getContext('2d');
      g.translate(-x0, -y0);
      janelaFixa(sx, yB, W, H);
      g = prev;
      j = { c2, x0, y0 };
      JANELAS.set(chave, j);
    }
    g.drawImage(j.c2, j.x0, j.y0);
  } else janelaFixa(sx, yB, W, H);
  janelaViva(sx, yB, W, H, pos, time, sun);
}
function janelaFixa(sx, yB, W, H){
  for (let c = -W; c <= W; c++){
    const x = sx + c, b = yB(c);
    if (Math.abs(c) === W){ P(x, b - H - 2, 1, H + 4, '#41301f'); continue; }   // moldura de madeira
    P(x, b - H, 1, H, '#7ec3e8');                             // céu de manhã
    P(x, b - H, 1, 7, '#a8ddf4');                             // topo mais claro
    P(x, b - 7, 1, 7, '#6db65a');                             // colinas verdes
    P(x, b - 7, 1, 1, '#8ed078');                             // luz batendo na relva
    if ((c + W) % 9 === 0) P(x, b - H, 1, H, '#54402c');      // caixilhos verticais
    P(x, b - Math.round(H * .45), 1, 1, 'rgba(84,64,44,.75)');// travessa horizontal
    P(x, b - H - 2, 1, 2, '#6b5138'); P(x, b, 1, 2, '#6b5138');
  }
}
function janelaViva(sx, yB, W, H, pos, time, sun){
  if (sun){                                                   // sol quentinho com halo
    const sc = -Math.round(W * .4);
    const sunX = sx + sc, sunY = yB(sc) - H + 7;
    E(sunX, sunY, 3, 3, '#ffe9a0'); E(sunX, sunY, 2, 2, '#fff6d0');
    g.save();
    g.globalCompositeOperation = 'lighter'; blurFx(2);
    lote(() => E(sunX, sunY, 7, 7, 'rgba(255,236,160,.4)'));
    g.restore();
  }
  const span = W * 2 - 8;                                     // nuvem cruzando devagar
  const cw = ((((time * 3 + pos * 7) | 0) % span) + span) % span - (W - 4);
  P(sx + cw - 2, yB(cw - 2) - H + 9, 6, 2, 'rgba(255,255,255,.85)');
  P(sx + cw, yB(cw) - H + 8, 3, 1, 'rgba(255,255,255,.65)');
  if (((time * .4 + pos) | 0) % 3 === 0){                     // passarinho de vez em quando
    const bc = Math.round(Math.sin(time * 1.1 + pos * 2) * (W - 7));
    const bw2 = ((time * 6) | 0) % 2;
    P(sx + bc - 2, yB(bc - 2) - H + 5 + bw2, 2, 1, '#33363e');
    P(sx + bc + 1, yB(bc + 1) - H + 5 + bw2, 2, 1, '#33363e');
  }
}
// samambaia pendurada: vasinho no gancho com frondes caindo em arco
function drawFern(onTop, pos, time){
  const th = TT();
  const sx = onTop ? gX(pos, 0) : gX(0, pos);
  const py = Math.round((onTop ? sx : -sx) * th / (TW / 2)) - Math.round(WALLH() * .62);
  P(sx - 1, py - 7, 2, 7, '#33281a');                        // corda no gancho
  P(sx - 2, py - 8, 4, 2, '#232833');
  for (let f = 0; f < 6; f++){                               // frondes caindo dos dois lados
    const dir = f % 2 ? 1 : -1;
    const spread = .7 + (f >> 1) * .5;
    for (let s = 0; s < 8; s++){
      const sway = s > 5 ? Math.round(Math.sin(time * 1.5 + f * 2 + pos) * 1) : 0;
      const fx = sx + dir * Math.round(s * spread) + sway;
      const fy = py + 3 + s * 2 + Math.round(s * s * .1);
      P(fx, fy, 2, 2, s % 2 ? '#4a7a34' : '#3f6b3a');
      if (s % 2 === 0) P(fx + dir * 2, fy, 2, 1, '#5f8f57'); // folíolos
    }
  }
  P(sx - 5, py - 1, 10, 2, '#a87048');                        // vasinho: boca LARGA em cima...
  P(sx - 4, py + 1, 8, 3, '#8a5a3a');
  P(sx - 3, py + 4, 6, 2, '#6e462c');                         // ...afunilando pra baixo
}
// viga de vinha: planta pendurada descendo a parede, com folhinhas e leve balanço
function drawVine(onTop, pos, len, time){
  const th = TT();
  const sx = onTop ? gX(pos, 0) : gX(0, pos);
  const top = Math.round((onTop ? sx : -sx) * th / (TW / 2)) - WALLH();
  for (let s = 0; s < len; s++){
    const sway = Math.round(Math.sin(time * 1.3 + s * .6 + pos) * (s / len) * 1.8);
    const x = sx + Math.round(Math.sin(s * .9 + pos * 3) * 1.5) + sway;
    const y = top + 2 + s * 3;
    P(x, y, 2, 3, s % 3 ? '#3f6b3a' : '#2c4f2b');             // caule
    if (s % 2 === 0) P(x - 3 + (s % 4) * 2, y + 1, 3, 2, '#4a7a34');   // folhinha
    if (s % 5 === 2) P(x + 2, y, 2, 2, '#5f8f57');
    if (s === len - 1) P(x, y + 3, 2, 2, '#6db65a');          // broto na ponta
  }
}
// porta de madeira em arco na parede esquerda, coluna a coluna seguindo a inclinação da parede
function drawDoor(j, glowWarm){
  const th = TT();
  const cx0 = gX(0, j + .5);
  const DH = Math.round(WALLH() * .82), DW = 13;
  const yB = c => Math.round(-(cx0 + c) * th / (TW / 2)) + 1; // base da parede naquela coluna
  for (let c = -DW - 2; c <= DW + 2; c++){
    const x = cx0 + c, b = yB(c);
    if (Math.abs(c) > DW){ P(x, b - DH - 2, 1, DH + 2, '#4a5262'); continue; }  // batente
    const arch = Math.abs(c) > DW - 6
      ? Math.round(6 - 6 * Math.sqrt(Math.max(0, 1 - ((Math.abs(c) - (DW - 6)) / 7) ** 2))) : 0;
    const hh = DH - arch;
    P(x, b - hh, 1, hh, (c + 100) % 5 === 0 ? '#33281a' : (c % 2 ? '#4a3a28' : '#453620'));   // madeira
    P(x, b - hh, 1, 2, '#33281a');                            // topo do arco
    P(x, b - Math.round(DH * .3), 1, 2, '#232833');           // bandas de ferro
    P(x, b - Math.round(DH * .72), 1, 2, '#232833');
    P(x, b, 1, 1, glowWarm ? 'rgba(240,180,90,.55)' : 'rgba(150,180,230,.45)'); // fresta
  }
  P(cx0 + 6, yB(6) - Math.round(DH * .45), 4, 4, '#232833');  // argola
  P(cx0 + 7, yB(7) - Math.round(DH * .45) + 1, 2, 2, glowWarm ? GOLD : '#4a5262');
}

/* ---------------- SPRITE DE RATO (paramétrico, 48x60) ---------------- */
// 64x66 com a âncora dos pés em (32,60): a folga é pra ARMA na mão e pro chapéu alto
const RS = document.createElement('canvas'); RS.width = 64; RS.height = 66;
const rg = RS.getContext('2d');
const GS = document.createElement('canvas'); GS.width = 64; GS.height = 66;   // eco do giro
const gsx = GS.getContext('2d');
function ghostSprite(col){                                    // recorta o frame atual do rato numa cor só
  gsx.globalCompositeOperation = 'source-over';
  gsx.clearRect(0, 0, 64, 66);
  gsx.drawImage(RS, 0, 0);
  gsx.globalCompositeOperation = 'source-in';                 // pinta só onde tem pixel: vira silhueta
  gsx.fillStyle = col; gsx.fillRect(0, 0, 64, 66);
  gsx.globalCompositeOperation = 'source-over';
  return GS;
}
/* ---------------- FANTASIAS INFLÁVEIS ----------------
   O ratinho entra DENTRO de um bicho de pano estufado: o corpo fica bem mais gordo que o dele,
   o capuz fecha por cima e desce pelos lados, e sobra uma janela no rosto — senão não dá pra ver
   quem está lá dentro, que é a graça da fantasia. Cada bicho ganha os enfeites dele por cima.   */
// `peca: true` = ACESSÓRIO, não roupa inteira: entra só o pedaço característico (rabo, asa,
// capacete, guelra, barbatana) por cima do ratinho pelado. Porco e caranguejo continuam infláveis.
const FANTASIAS = {
  dragao:     { peca: 1, cor: '#4f9440', luz: '#69b855', som: '#2a5222', barr: '#e8d86a' },
  porco:      { cor: '#f0a0b0', luz: '#ffc0cc', som: '#c06880', barr: '#ffd8e0' },
  caranguejo: { peca: 1, cor: '#e0503a', luz: '#f2755c', som: '#a02c20', barr: '#f8b090' },
  peixe:      { peca: 1, cor: '#4a9ad8', luz: '#7ac0e8', som: '#2a5e94', barr: '#cfe8fa' },
  fada:       { peca: 1, cor: '#c8a0e8', luz: '#e0c8f8', som: '#8a5ab2', barr: '#f4e8ff' },
  ciborgue:   { peca: 1, cor: '#8a929b', luz: '#b8c2cc', som: '#4a5262', barr: '#c8d4e4' },
  axolote:    { peca: 1, cor: '#f8b8c8', luz: '#ffd4de', som: '#d07890', barr: '#ffe8ee' },
  aranha:     { peca: 1, cor: '#c9302c', luz: '#e8564a', som: '#8f1f1c', barr: '#2a4a9c' },
  bob:        { peca: 1, cor: '#f2d33c', luz: '#ffe98a', som: '#c9a41e', barr: '#8a6a3c' },
};
function drawFantasia(q, kind, Y, wx, back, hue, fase){
  const F = FANTASIAS[kind];
  if (!F) return;
  const C = c => tinge(c, hue);
  const CO = C(F.cor), LU = C(F.luz), SO = C(F.som), BA = C(F.barr);
  const bal = Math.round(Math.sin(fase * 1.6) * 1.5);         // o pano balança de leve
  const lado = (sx, ox, y2, w2, h2, c) => {                   // desenha espelhado: 1 = lado da frente
    const x2 = sx > 0 ? ox : -ox - w2;
    q(x2 - 1, Y(y2) - 1, w2 + 2, h2 + 2, OUT);
    q(x2, Y(y2), w2, h2, c);
  };
  // peça de VÁRIAS fileiras: todo o contorno primeiro, depois todo o recheio. Fazendo fileira a
  // fileira, o contorno de uma comia o recheio da de cima e a peça saía listrada.
  const pecaLado = (sx, rows, cor) => {
    rows.forEach(([ox, y2, w2, h2]) => {
      const x2 = sx > 0 ? ox : -ox - w2;
      q(x2 - 1, Y(y2) - 1, w2 + 2, (h2 || 2) + 2, OUT);
    });
    rows.forEach(([ox, y2, w2, h2, c]) => {
      const x2 = sx > 0 ? ox : -ox - w2;
      q(x2, Y(y2), w2, h2 || 2, c || cor);
    });
  };
  const silhueta = (rows, cor, alt) => {                      // [y, x0, x1]: contorno inteiro, depois recheio
    const h2 = alt || 2;
    rows.forEach(([y2, a2, b2]) => q(a2 - 1, Y(y2) - 1, b2 - a2 + 2, h2 + 2, OUT));
    rows.forEach(([y2, a2, b2]) => q(a2, Y(y2), b2 - a2, h2, cor));
  };
  const pecaMeio = (rows, cor) => {                           // idem, mas centrada no corpo
    rows.forEach(([y2, w2, h2]) => q(-(w2 >> 1) - 1, Y(y2) - 1, w2 + 2, (h2 || 2) + 2, OUT));
    rows.forEach(([y2, w2, h2, c]) => q(-(w2 >> 1), Y(y2), w2, h2 || 2, c || cor));
  };
  if (kind === 'fada'){
    /* ASAS DE FADA — a primeira versão era um bloco branco opaco com contorno preto, do tamanho
       do ratinho; a segunda virou barra horizontal. Estas são FOLHAS: cada asa afina até uma
       ponta lá em cima e por fora, o corpo é véu translúcido, a borda é um fio claro (contorno
       duro nenhum) e as nervuras correm da raiz pra ponta, na diagonal. Duas de cada lado.     */
    // alfa baixo demais sobre o fundo escuro da dungeon vira CINZA, não véu: a asa saía de pedra.
    const VEU = 'rgba(232,222,255,.62)', VEU2 = 'rgba(206,230,255,.55)';
    const FIO = 'rgba(255,255,255,.95)', NERV = 'rgba(176,150,232,.55)';
    const asa = (sx, rows, veu) => {
      rows.forEach(([y2, a2, b2]) => {                         // o véu
        const x0 = sx > 0 ? a2 : -b2;
        q(x0, Y(y2 + bal), b2 - a2, 2, veu);
      });
      rows.forEach(([y2, a2, b2], i2) => {                     // o fio contornando a folha
        const xe = sx > 0 ? b2 - 1 : -b2;
        q(xe, Y(y2 + bal), 1, 2, FIO);
        if (i2 === 0 || i2 === rows.length - 1){
          const x0 = sx > 0 ? a2 : -b2;
          q(x0, Y(y2 + bal), b2 - a2, 1, FIO);
        }
      });
    };
    const CIMA = [                                             // folha grande: a borda da frente sobe na diagonal
      [-38, 16, 19], [-36, 14, 20], [-34, 12, 21], [-32, 10, 21],
      [-30, 10, 19], [-28, 10, 16], [-26, 10, 13],
    ];
    const BAIXO = [[-24, 10, 14], [-22, 10, 17], [-20, 11, 17], [-18, 13, 15]];   // e a menor, embaixo
    [-1, 1].forEach(sx => {
      asa(sx, CIMA, VEU);
      asa(sx, BAIXO, VEU2);
      [[11, -30], [13, -32], [15, -34], [17, -36]].forEach(([ox, y2]) =>   // nervura na diagonal
        q(sx > 0 ? ox : -ox - 2, Y(y2 + bal), 2, 1, NERV));
      [[11, -21], [13, -22], [15, -20]].forEach(([ox, y2]) =>
        q(sx > 0 ? ox : -ox - 2, Y(y2 + bal), 2, 1, NERV));
      if (Math.sin(fase * 2.3 + sx) > .3){                     // pó de fada: pisca devagar
        q(sx > 0 ? 19 : -20, Y(-35 + bal), 1, 1, '#ffffff');
        q(sx > 0 ? 15 : -16, Y(-19 + bal), 1, 1, 'rgba(255,255,255,.7)');
      }
    });
  }
  if (!F.peca){                                              // só as INTEIRAS montam corpo, barriga e capuz
  const CORPO = [                                             // corpo estufado, mas COLADO no rato: fantasia, não balão
    [-4, 10], [-6, 11], [-8, 12], [-10, 12], [-12, 12], [-14, 11],
    [-16, 10], [-18, 10], [-20, 10], [-22, 11], [-24, 11], [-26, 10],
  ];
  CORPO.forEach(([y2, hw]) => q(-hw - 1 - wx, Y(y2) - 1, (hw + 1 + wx) * 2, 4, OUT));
  CORPO.forEach(([y2, hw], i) => {
    q(-hw - wx, Y(y2), (hw + wx) * 2, 2, i > CORPO.length - 3 ? LU : CO);
    q(-hw - wx, Y(y2), 2, 2, SO);
    q(hw + wx - 2, Y(y2), 2, 2, LU);
  });
  if (!back)
    [[-6, 5], [-8, 6], [-10, 6], [-12, 6], [-14, 5], [-16, 4]].forEach(([y2, hw]) =>
      q(-hw, Y(y2), hw * 2, 2, BA));                          // barriga clara do bicho
  const TOPO = [[-47, 4], [-45, 7], [-43, 9], [-41, 10], [-39, 11], [-37, 11]];   // CAPUZ por cima, mais justo
  TOPO.forEach(([y2, hw]) => q(-hw - 1, Y(y2) - 1, hw * 2 + 2, 4, OUT));
  TOPO.forEach(([y2, hw], i) => q(-hw, Y(y2), hw * 2, 2, i < 2 ? LU : CO));
  const LADOS = [[-35, 10, 12], [-33, 10, 12], [-31, 10, 12], [-29, 10, 12], [-27, 10, 12], [-25, 10, 12]];
  if (back) LADOS.forEach(([y2]) => q(-10, Y(y2), 20, 2, CO));   // de costas o capuz é fechado
  LADOS.forEach(([y2, a2, b2]) => {
    q(-b2 - 1, Y(y2) - 1, b2 - a2 + 2, 4, OUT); q(a2 - 1, Y(y2) - 1, b2 - a2 + 2, 4, OUT);
  });
  LADOS.forEach(([y2, a2, b2]) => { q(-b2, Y(y2), b2 - a2, 2, SO); q(a2, Y(y2), b2 - a2, 2, CO); });
  }

  if (kind === 'dragao'){
    /* RABINHO — o antigo era uma tábua: saía reto do quadril e ia até 28px do corpo, grosso o
       tempo todo. Este é uma CORRENTE DE BLOCOS numa curva que desce e afina, metade do
       comprimento, com a ponta balançando mais que a raiz.                                    */
    const ES = C('#f2a03c');
    const SEG = [                                             // sai do QUADRIL, desce, e a ponta enrola pra cima
      [-9, -12, 4], [-12, -11, 4], [-15, -9, 4], [-18, -7, 3],
      [-20, -6, 3], [-22, -7, 3], [-23, -9, 2],
    ];
    const onda = i => Math.round(bal * (i + 1) / SEG.length);   // ANTECIPAÇÃO: a ponta chega atrasada
    // contorno de TODOS antes do recheio: bloco a bloco, o contorno de um comia o de trás e o
    // rabo saía em escadinha em vez de uma linha só.
    SEG.forEach(([ox, y2, w2], i) => q(ox - 1, Y(y2 + onda(i)) - 1, w2 + 2, w2 + 2, OUT));
    SEG.forEach(([ox, y2, w2], i) => {
      const s2 = onda(i);
      q(ox, Y(y2 + s2), w2, w2, CO);
      q(ox, Y(y2 + s2), w2, 1, LU);
    });
    { const s2 = bal;                                          // a paletinha da ponta, virada pra cima
      q(-26, Y(-13 + s2) - 1, 5, 6, OUT);
      q(-25, Y(-13 + s2), 3, 4, ES);
      q(-25, Y(-13 + s2), 3, 1, C('#ffd08a')); }
    [[-10, -14], [-13, -13], [-16, -11]].forEach(([ox, y2], i) => {   // três espinhos pequenos
      const s2 = Math.round(bal * (i + 1) / 7);
      q(ox - 1, Y(y2 + s2) - 1, 3, 3, OUT); q(ox, Y(y2 + s2), 1, 2, ES);
    });
  } else if (kind === 'porco'){                               // orelhonas caídas, focinho e rabo de rolha
    [-1, 1].forEach(sx => pecaLado(sx, [
      [10, -44, 6, 2, LU], [10, -42, 8, 2, LU], [11, -40, 8, 2, CO],
      [12, -38, 7, 2, CO], [13, -36, 6, 2, CO], [14, -34, 4, 2, SO],
    ]));
    [[-17, -19], [-20, -22], [-17, -25], [-14, -22], [-16, -19]].forEach(([y2, x2]) => {
      q(x2 - 1, Y(y2) - 1, 4, 4, OUT); q(x2, Y(y2), 2, 2, LU);   // rabinho enrolado
    });
    if (!back){                                                // focinho de porco por cima da boca do rato
      q(6, Y(-29) - 1, 11, 9, OUT);
      q(7, Y(-28), 9, 7, LU);
      q(7, Y(-28), 9, 2, C('#ffd8e0'));
      q(9, Y(-26), 2, 3, C('#a05068')); q(13, Y(-26), 2, 3, C('#a05068'));
    }
  } else if (kind === 'aranha'){                              // COLANTE DE TEIA: vermelho em cima, azul embaixo
    const AZ = BA, AZD = C('#1b3068'), TEIA = 'rgba(18,20,26,.8)';
    const CORPO2 = [                                          // as MESMAS fileiras do ratinho: colante é colado
      [-4, 9], [-6, 10], [-8, 10], [-10, 10], [-12, 10], [-14, 9], [-16, 9], [-18, 8], [-20, 8],
      [-22, 8], [-24, 8], [-26, 7], [-28, 8], [-30, 9], [-32, 9], [-34, 9], [-36, 8], [-38, 7], [-40, 5],
    ];
    CORPO2.forEach(([y2, hw]) => {
      const perna = y2 >= -14;                                // calça azul, tronco e máscara vermelhos
      const c2 = perna ? AZ : CO, cd = perna ? AZD : SO;
      q(-(hw + wx), Y(y2), (hw + wx) * 2, 2, c2);
      q(-(hw + wx), Y(y2), 2, 2, cd);
      q(hw + wx - 2, Y(y2), 2, 2, cd);
    });
    for (let y2 = -40; y2 <= -16; y2 += 2){                    // a TEIA: fios verticais e travessas
      const hw = (CORPO2.find(r => r[0] === y2) || [0, 8])[1] + wx - 1;
      [-6, -2, 2, 6].forEach(ox => { if (Math.abs(ox) < hw) q(ox, Y(y2), 1, 2, TEIA); });
    }
    [-38, -32, -26, -20].forEach(y2 => {
      const hw = (CORPO2.find(r => r[0] === y2) || [0, 8])[1] + wx - 2;
      q(-hw, Y(y2), hw * 2, 1, TEIA);
    });
    if (!back){
      q(-10, Y(-35), 8, 7, OUT); q(2, Y(-35), 8, 7, OUT);      // OLHOS da máscara: grandes, na altura do rosto
      q(-9, Y(-34), 6, 5, '#f4f8ff'); q(3, Y(-34), 6, 5, '#f4f8ff');
      q(-9, Y(-34), 6, 2, '#ffffff'); q(3, Y(-34), 6, 2, '#ffffff');
      q(-4, Y(-30), 1, 1, CO); q(3, Y(-30), 1, 1, CO);        // canto de dentro afunila
      q(-2, Y(-26), 4, 6, '#14151a');                          // a aranha do peito
      q(-1, Y(-28), 2, 2, '#14151a');
      [-25, -23].forEach(y2 => { q(-6, Y(y2), 4, 1, '#14151a'); q(2, Y(y2), 4, 1, '#14151a'); });
    }
  } else if (kind === 'bob'){
    /* BOB ESPONJA — antes era a fantasia inteira: dois retângulos que tampavam o ratinho da
       cabeça aos pés. Como ACESSÓRIO virou só a ROUPINHA dele — camisa amarela de esponja,
       colarinho, gravata vermelha e o cós da calça marrom. A cara do rato fica de fora.       */
    const PORO = C('#d9b62a'), MAR = BA, MARD = C('#5f4726');
    const CAMISA = [                                          // as fileiras do próprio rato: fica colada
      [-14, 9], [-16, 9], [-18, 8], [-20, 8], [-22, 8], [-24, 8], [-26, 7], [-28, 8],
    ];
    CAMISA.forEach(([y2, hw]) => {
      q(-(hw + wx), Y(y2), (hw + wx) * 2, 2, CO);
      q(-(hw + wx), Y(y2), 2, 2, SO);
      q(hw + wx - 2, Y(y2), 2, 2, SO);
    });
    q(-8, Y(-28), 16, 1, LU);                                 // luz no alto do peito
    if (!back){
      [[-7, -25, 3, 2], [4, -23, 3, 2], [-5, -19, 2, 2], [5, -18, 3, 2]]
        .forEach(([ox, y2, w2, h2]) => q(ox, Y(y2), w2, h2, PORO));   // poros
    }
    q(-9, Y(-13), 18, 3, MAR);                                // cós da calça marrom
    q(-9, Y(-13), 18, 1, C('#a8834a'));
    q(-9, Y(-11), 18, 1, MARD);
    q(-3, Y(-13), 5, 3, '#c9a23c');                           // fivela
    if (!back){
      q(-9, Y(-30), 18, 3, OUT);                              // colarinho branco
      q(-8, Y(-30), 16, 2, '#f4f2ea');
      q(-8, Y(-30), 16, 1, '#ffffff');
      q(-3, Y(-29), 6, 2, OUT); q(-2, Y(-29), 4, 1, '#c9302c');   // nó
      q(-3, Y(-27), 6, 9, OUT);                               // e a gravata caindo
      q(-2, Y(-27), 4, 8, '#c9302c');
      q(-2, Y(-27), 4, 1, '#e8564a');
      q(-2, Y(-20), 4, 1, '#8f1f1c');
    }
  } else if (kind === 'caranguejo'){
    /* CARANGUEJO — a versão inteira tinha garras de 10px e olhos em haste subindo acima da
       cabeça: virava chapéu. Ficaram só as GARRINHAS na altura das patas e uma casquinha
       vermelha nos ombros — o que a mão alcança, nada acima do crânio.                        */
    if (back){                                                // o casquinho fica nas COSTAS
      silhueta([[-27, -9, 9], [-25, -10, 10], [-23, -10, 10], [-21, -9, 9]], CO, 2);
      q(-8, Y(-27), 16, 1, LU);
      q(-6, Y(-24), 4, 1, SO); q(2, Y(-24), 4, 1, SO);         // duas ranhuras
    } else {                                                  // de frente só espia a beirada
      q(-11, Y(-25), 2, 5, CO); q(9, Y(-25), 2, 5, CO);
      q(-11, Y(-25), 2, 1, LU); q(9, Y(-25), 2, 1, LU);
    }
    [-1, 1].forEach(sx => {
      pecaLado(sx, [[10, -13, 3, 3, SO], [11, -18, 6, 7, CO]]);  // braço curtinho e a garra
      q(sx > 0 ? 12 : -16, Y(-17), 4, 1, LU);                  // luz em cima
      q(sx > 0 ? 14 : -17, Y(-14), 3, 2, '#14151a');           // a fenda que abre
      pecaLado(sx, [[14, -19, 3, 3, CO]]);                     // o dedo de cima
    });
  } else if (kind === 'peixe'){                               // dorsal, peitorais e cauda em leque
    const FI = C('#7ac0e8'), FID = C('#2a5e94');
    silhueta([[-52, -3, 3], [-50, -5, 4], [-48, -7, 5], [-46, -8, 6], [-44, -9, 7]], FI, 3);
    for (let i2 = 0; i2 < 3; i2++) q(-7 + i2 * 4, Y(-49), 1, 5, FID);   // raios da dorsal
    [-1, 1].forEach(sx => {
      pecaLado(sx, [[8, -19, 5, 3, FI], [8, -16, 7, 3, FI], [8, -13, 8, 3, FI],
                    [8, -10, 6, 3, FI], [8, -7, 4, 3, FI]]);
      for (let i2 = 0; i2 < 3; i2++) lado(sx, 10 + i2 * 2, -16 + i2, 1, 7, FID);
    });
    silhueta([                                               // cauda em V, aberta pra trás
      [-22, -25, -20], [-20, -24, -17], [-18, -22, -13], [-16, -20, -10], [-14, -19, -10],
      [-12, -19, -10], [-10, -20, -10], [-8, -22, -13], [-6, -24, -17], [-4, -25, -20],
    ], FI, 2);
    for (let i2 = 0; i2 < 3; i2++) q(-22 + i2 * 3, Y(-20 + i2 * 4), 1, 7, FID);
    if (!back) for (let i2 = 0; i2 < 5; i2++) q(-8 + i2 * 4, Y(-13 + (i2 % 2) * 3), 3, 2, SO);   // escaminhas
  } else if (kind === 'fada'){                                // SÓ AS ASAS (já saíram atrás) + purpurina
    const OU = C('#ffd34a');
    [[-30, 17], [-22, -19], [-12, 18], [-36, -16], [-8, -21]].forEach(([y2, x2], i2) =>
      q(x2, Y(y2) + (i2 % 2 ? bal : -bal), 2, 2, OU));
  } else if (kind === 'ciborgue'){                            // CAPACETE de aço: viseira cobrindo os olhos
    const ME = C('#8a929b'), ME2 = C('#c8d4e4'), MED = C('#4a5262');
    const VS = C('#20262e'), LZ = C('#e03830');
    const CAS = [[-47, 5], [-45, 9], [-43, 11], [-41, 12], [-39, 12], [-37, 12], [-35, 12], [-33, 12], [-31, 11]];
    CAS.forEach(([y2, hw]) => q(-hw - 1, Y(y2) - 1, hw * 2 + 2, 4, OUT));
    CAS.forEach(([y2, hw], i2) => q(-hw, Y(y2), hw * 2, 2, i2 < 3 ? ME2 : ME));
    q(-12, Y(-35) - 1, 24, 7, OUT);                           // VISEIRA atravessada, cobrindo os olhos
    q(-11, Y(-35), 22, 5, VS);
    q(-11, Y(-35), 22, 1, MED);
    q(-10, Y(-34), 7, 1, C('#7a8ca0'));                       // brilho correndo no vidro
    q(-2, Y(-47), 4, 3, MED);                                 // crista no alto
    q(-13, Y(-41), 3, 7, MED); q(10, Y(-41), 3, 7, MED);      // protetores de ouvido
    q(10, Y(-39), 2, 2, LZ);                                  // luzinha vermelha
    q(-1, Y(-30), 2, 2, MED);                                 // queixeira
  } else if (kind === 'axolote'){                             // SÓ AS GUELRAS emplumadas, três de cada lado
    const GU = C('#f06a90'), GU2 = C('#ff9ab4');
    [-1, 1].forEach(sx => {
      const rows = [];
      [-40, -33, -26].forEach((y2, i2) => {
        const sob = i2 === 1 ? bal : 0;
        const Y2 = y2 + sob;
        rows.push([8, Y2, 4, 2, GU]);                          // o talo saindo da cabeça
        [[11, -4, 4], [10, -2, 6], [10, 0, 7], [10, 2, 6], [11, 4, 4]]       // e a pluma, em folha
          .forEach(([ox, dy, w2]) => rows.push([ox, Y2 + dy, w2, 2, dy < 0 ? GU2 : GU]));
      });
      pecaLado(sx, rows);                                      // TUDO numa passada: contorno antes do recheio
    });
  }

}

/* ---- CHAPÉUS: virou função própria porque o SAPO também usa o guarda-roupa.
   Tudo aqui é relativo ao `hy` (linha da testa de quem está usando) e ao `cy` (topo do crânio,
   só a coroa). `q` é o pincel de quem chamou — o rato pinta no RS, o sapo pinta no mundo. ---- */
function drawChapeu(q, oc, hy, cy){
  if (!oc || !oc.hat || oc.hat === 'none') return;
  const bdayHue = (performance.now() / 22) % 360;             // o de aniversário troca de cor sozinho
  const HUE = oc.hat === 'bday' ? bdayHue : oc.hatHue;
  const T = c => tinge(c, HUE);
  // as tabelas herdadas do sprite do rato falam em "y do rato"; aqui viram offsets do hy de quem usa
  const Y = y2 => hy + y2 + 39, wy2 = 0;
  if (oc.hat === 'wig'){                                    // PERUCA CLÁSSICA: risca no meio e duas cortinas
    const L1 = T('#e8c46a'), L2 = T('#f0d488'), L3 = T('#c9a23c'), L4 = T('#fff6d0');
    // O corte é o de sempre: risca no centro, o cabelo abre em V pros dois lados e desce liso.
    // A coroa precisa passar de 11 de meia-largura, senão a ORELHA do rato aparece só pelo contorno
    // e vira dois riscos pretos soltos em cima do cabelo.
    const TOPO = [[-50, 4], [-48, 9], [-46, 12], [-44, 13], [-42, 13]];
    const CORT = [                                          // as duas cortinas abrindo a partir da risca
      [-40, 1, 13], [-38, 3, 13], [-36, 5, 14], [-34, 7, 14],
    ];
    const LADO = [                                          // e o comprimento caindo reto pelos ombros
      [-32, 9, 14], [-30, 9, 14], [-28, 9, 14], [-26, 10, 14], [-24, 10, 13], [-22, 11, 13],
    ];
    const abas = CORT.concat(LADO);
    TOPO.forEach(([y2, hw]) => q(-hw - 1, Y(y2) - 1, hw * 2 + 2, 4, OUT));
    abas.forEach(([y2, a2, b2]) => {
      q(-b2 - 1, Y(y2) - 1, b2 - a2 + 2, 4, OUT);
      q(a2 - 1, Y(y2) - 1, b2 - a2 + 2, 4, OUT);
    });
    TOPO.forEach(([y2, hw], i2) => q(-hw, Y(y2), hw * 2, 2, i2 < 2 ? L2 : L1));
    abas.forEach(([y2, a2, b2], i2) => {
      const c2 = i2 > abas.length - 3 ? L2 : L1;             // as pontas pegam mais luz
      q(-b2, Y(y2), b2 - a2, 2, c2); q(a2, Y(y2), b2 - a2, 2, c2);
    });
    // A RISCA: linha escura descendo do alto até onde as cortinas se abrem, com brilho dos dois lados
    q(0, Y(-50), 1, 11, L3);                                // o risco em si: 1px só, senão vira falha no cabelo
    q(-2, Y(-49), 2, 9, L4); q(1, Y(-49), 2, 9, L4);         // e o brilho de cada lado dele
    CORT.forEach(([y2, a2]) => { q(-a2 - 2, Y(y2), 2, 2, L4); q(a2, Y(y2), 2, 2, L4); });   // beirada da cortina
    LADO.forEach(([y2, a2], i2) => { if (i2 < 3) q(-a2 - 1, Y(y2), 1, 2, L3); });
    // MECHAS: fios de 1px correndo pelo comprimento. É o que faz ler CABELO em vez de bloco de cor.
    [[-9, -45, 4, L4], [7, -44, 4, L4], [-11, -43, 3, L3], [9, -42, 3, L3]]
      .forEach(([ox, y2, h2, c]) => q(ox, Y(y2), 1, h2 * 2, c));
    [[-13, -34, 6, L4], [11, -32, 6, L4], [-11, -30, 4, L3], [9, -28, 4, L3],
     [-12, -26, 3, L4], [11, -24, 3, L4]]
      .forEach(([ox, y2, h2, c]) => q(ox, Y(y2), 1, h2 * 2, c));
    q(-14, Y(-22), 3, 3, L2); q(11, Y(-22), 3, 3, L2);      // pontas viradas pra fora
  } else if (oc.hat === 'shroom'){                          // CHAPÉU DE COGUMELO: só o chapéu do cogumelo mesmo
    const CH = T('#c9342c'), CH2 = T('#e8564a'), CHD = T('#8a1a18'), PT = T('#f6efe0');
    const CUP = [[-38, 5], [-40, 9], [-42, 11], [-44, 12], [-46, 11], [-48, 8], [-50, 4]];
    CUP.forEach(([y2, hw]) => q(-hw - 1, Y(y2) - 1, hw * 2 + 2, 4, OUT));
    CUP.forEach(([y2, hw], i2) => q(-hw, Y(y2), hw * 2, 2, i2 > 3 ? CH2 : CH));
    q(-11, hy + (-1), 22, 2, CHD);                             // a lamela por baixo, mais escura
    q(-10, hy + (1), 20, 2, CHD);
    [[-7, -43, 4], [2, -45, 4], [-2, -47, 3], [6, -42, 3], [-10, -41, 3]].forEach(([ox, y2, w2]) =>
      q(ox, Y(y2), w2, 2, PT));                             // as pintinhas brancas
    q(-3, hy + (-10), 6, 2, CH2);
  } else if (oc.hat === 'bday'){                            // CHAPÉU DE ANIVERSÁRIO: cone que troca de cor sozinho
    const C1 = T('#a02038'), C2 = T('#ffd34a'), C3 = T('#5e1424'), BR = T('#fff3c8');
    q(-9, hy + 1, 18, 2, C3);                               // aba
    // CONE de verdade: uma fileira a cada 2px, afinando de 1 em 1. Em degraus de 3 ele virava um
    // bolo de andares — e as duas listras VERTICAIS escorriam do chapéu pro rosto do rato.
    const CONE = [];
    for (let dy = 0, hw = 9; hw >= 1; dy -= 2, hw -= 1) CONE.push([dy, hw]);
    CONE.forEach(([dy, hw]) => q(-hw - 1, hy + dy - 1, hw * 2 + 2, 4, OUT));
    CONE.forEach(([dy, hw], i2) => {
      q(-hw, hy + dy, hw * 2, 2, i2 % 2 ? C2 : C1);         // listras HORIZONTAIS, acompanhando o cone
      q(-hw, hy + dy, 2, 2, C3);                            // sombra na quina esquerda
    });
    const topo = hy - CONE.length * 2;
    q(-3, topo - 3, 6, 4, OUT); q(-2, topo - 2, 4, 3, BR);  // pompom ENCOSTADO no bico (o contorno comia a ponta)
    q(-1, topo - 2, 2, 1, '#ffffff');
  } else if (oc.hat === 'tophat'){
    q(-9, hy, 18, 2, T('#14151a'));
    q(-6, hy - 11, 12, 11, T('#1f2126')); q(-6, hy - 11, 2, 11, T('#33363e'));
    q(-6, hy - 3, 12, 2, T('#8a3038'));
  } else if (oc.hat === 'straw'){
    q(-11, hy + 1, 22, 2, T('#c9a668')); q(-11, hy + 3, 22, 1, T('#8a7442'));
    q(-6, hy - 4, 12, 5, T('#d9b878')); q(-6, hy - 4, 12, 1, T('#e8d098'));
  } else if (oc.hat === 'wizard'){
    q(-10, hy + 1, 20, 2, T('#5d3a7a'));
    q(-6, hy - 4, 12, 5, T('#6b4a8a')); q(-4, hy - 9, 8, 5, T('#5d3a7a'));
    q(-2, hy - 14, 4, 5, T('#6b4a8a')); q(0, hy - 16, 3, 3, T('#472c60'));
    q(-1, hy - 6, 2, 2, T(GOLD));
  } else if (oc.hat === 'crown'){                           // aro: descansa no alto do crânio, as orelhas passam do lado
    q(-5, cy + 1, 10, 3, T(GOLD));
    q(-5, cy - 2, 2, 3, T('#e0bc50')); q(-1, cy - 3, 2, 4, T('#e0bc50')); q(3, cy - 2, 2, 3, T('#e0bc50'));
    q(-1, cy + 2, 2, 1, T('#b23a3a'));
  } else if (oc.hat === 'nutshell'){                        // meia casca de noz como capacete
    q(-9, hy + 1, 18, 2, T('#5c4230'));                        // borda irregular
    q(-9, hy + 1, 2, 1, T('#42301f')); q(-3, hy + 2, 3, 1, T('#42301f')); q(4, hy + 1, 3, 1, T('#42301f'));
    q(-8, hy - 3, 16, 4, T('#7a5a3c'));                        // casco
    q(-6, hy - 6, 12, 3, T('#8a6844'));
    q(-3, hy - 8, 7, 2, T('#7a5a3c'));
    q(-6, hy - 5, 2, 7, T('#5c4230')); q(-1, hy - 7, 2, 9, T('#5c4230')); q(4, hy - 5, 2, 7, T('#5c4230'));  // sulcos da noz
    q(1, hy - 6, 3, 2, T('#a8845c'));                          // brilho
  } else if (oc.hat === 'paperboat'){                       // barquinho de papel de jornal
    q(-10, hy + 1, 20, 3, T('#e8e4da'));                       // casco
    q(-10, hy + 1, 20, 1, T('#f8f4ea'));
    q(-10, hy + 3, 20, 1, T('#c9c2b2'));
    q(-6, hy - 2, 12, 3, T('#f0ece2'));                        // dobra central
    q(-4, hy - 4, 8, 2, T('#f8f4ea'));
    q(-2, hy - 6, 4, 2, T('#ffffff'));
    q(-1, hy - 7, 2, 1, T('#c9c2b2'));                         // biquinho
    q(-7, hy + 2, 3, 1, T('#8a929b')); q(1, hy + 2, 4, 1, T('#8a929b'));        // letrinhas do jornal
    q(-3, hy - 3, 2, 1, T('#8a929b'));
  }

}
function drawRatSprite(back, p, skin, capePhase){
  rg.clearRect(0, 0, 64, 66);
  // pinta direto no rg (não passa por P), então o duotone da maldição tem que ser aplicado aqui também
  const q = (x, y, w, h, c) => { rg.fillStyle = DARKW ? sombrio(c) : c; rg.fillRect(32 + Math.round(x), 60 + Math.round(y), Math.round(w), Math.round(h)); };
  const [C0, C1, C2] = skin.capeCols || [CAPE, CAPED, CAPEDD];  // cores da capa (customizável)
  const k = 1 - p.crouch * .045 + p.stretch * .045;
  const wx = p.crouch >= 2 ? 1 : (p.stretch >= 2 ? -1 : 0);
  const Y = y => Math.round(y * k);

  const tail = () => {
    for (let i = 0; i < 12; i++){
      const tx = -(6 + i * 1.9);
      const ty = Y(-4) + Math.round(Math.sin(p.tail + i * .55) * (1 + i * .3)) + (i > 8 ? 1 : 0);
      q(tx, ty, 2, 2, i > 8 ? skin.tail2 : skin.tail1);
    }
  };
  if (!back) tail();

  // A CAPA: o ombro está preso, quem voa é a BARRA — o peso do balanço cresce de cima pra baixo
  // (estava invertido: a capa mexia colada no pescoço e a ponta ficava dura). A onda também
  // VIAJA do ombro pra ponta, com atraso, que é o que dá o pano em vez de uma placa.
  if (skin.cape && !back){
    for (let y = -26; y <= -4; y += 2){
      const w2 = Math.min(1, (y + 26) / 19);                  // 0 no ombro · 1 na barra
      const sway = Math.round(Math.sin(capePhase - (y + 26) * .22) * (.3 + w2 * 2.4) + p.capeLag * w2);
      const hw = 12 + Math.round((y + 26) * .12);
      const lag = Math.round(Math.abs(p.capeLag) * w2);
      q(-hw + sway - (p.capeLag < 0 ? lag : 0), y, hw * 2 + lag, 2, y > -8 ? C2 : (y > -16 ? C1 : C0));
    }
    const barra = Math.round(Math.sin(capePhase - 4.8) * 2.7 + p.capeLag);
    for (let i = -13; i < 13; i += 4) if (hash(i, 5) > .35) q(i + barra, -2, 3, 2, C2);   // barra recortada
  }

  const rows = [
    [-4, 9], [-6, 10], [-8, 10], [-10, 10], [-12, 10], [-14, 9], [-16, 9], [-18, 8], [-20, 8], [-22, 8], [-24, 8],
    [-26, 7], [-28, 8], [-30, 9], [-32, 9], [-34, 9], [-36, 8], [-38, 7], [-40, 5],
  ];
  const ear = (ex, nick, inner) => {
    const ey = Y(-48) + p.earY;
    q(ex + 1, ey, 6, 2, OUT); q(ex, ey + 2, 8, 6, OUT); q(ex + 1, ey + 8, 6, 2, OUT);
    q(ex + 1, ey + 2, 6, 6, skin.fur);
    q(ex + 2, ey + 3, 4, 4, inner);
    if (nick){ rg.clearRect(32 + ex + 5, 60 + ey, 3, 3); q(ex + 5, ey + 2, 2, 1, OUT); }
  };
  ear(-11 - wx, false, skin.lashes ? '#d8a8b8' : '#3a3d45');
  ear(3 + wx, skin.nick, skin.lashes ? '#d8a8b8' : '#3a3d45');
  if (skin.bow){ const ey = Y(-48) + p.earY; q(-13, ey - 2, 3, 3, '#c97b8e'); q(-9, ey - 2, 3, 3, '#c97b8e'); q(-10, ey - 1, 2, 2, '#a85a70'); }

  /* CORPO FATIADO — as fileiras ficam de 2 em 2 unidades e eram desenhadas com 2px de altura
     fixos. Só que `Y` multiplica por `k` (o squash & stretch do pulo) e ARREDONDA: esticado em
     1.09, duas fileiras vizinhas caíam a 3px de distância e sobrava uma linha VAZIA no meio —
     o ratinho aparecia fatiado enquanto andava. A altura de cada fileira agora é medida até a
     de baixo, então elas se encostam em qualquer k.                                            */
  const altR = i => (i > 0 ? Math.max(2, Y(rows[i - 1][0]) - Y(rows[i][0])) : 2);
  rows.forEach(([y, h2], i) => q(-(h2 + 1 + wx), Y(y), (h2 + 1 + wx) * 2, altR(i), OUT));
  q(-6, Y(-2), 12, 1, OUT); q(-6, Y(-41), 12, 2, OUT);
  for (let i = rows.length - 1; i >= 0; i--){
    const [y, h2] = rows[i], ah = altR(i);
    q(-(h2 + wx), Y(y), (h2 + wx) * 2, ah, skin.fur);
    q(-(h2 + wx), Y(y), 2, ah, skin.furD);
    q(h2 + wx - 2, Y(y), 2, ah, skin.rim);
  }
  if (skin.crown){                                            // coroa do Rei Rato
    q(-5, Y(-44), 10, 3, GOLD);
    q(-5, Y(-47), 2, 3, '#e0bc50'); q(-1, Y(-48), 2, 4, '#e0bc50'); q(3, Y(-47), 2, 3, '#e0bc50');
    q(-1, Y(-43), 2, 1, '#b23a3a');
  }
  if (skin.helm){                                             // elmo do couraçado
    q(-7, Y(-42), 14, 4, '#7a838f'); q(-7, Y(-42), 14, 1, '#9aa4b2');
    q(-8, Y(-39), 16, 2, '#5a6270');
  }
  if (!back){
    for (let y = -6; y >= -18; y -= 2) q(-4, Y(y), 8, 2, skin.belly || skin.furHi);
    if (skin.apron){                                          // avental bege de alcinha: a barriguinha rosada fica À MOSTRA
      [[-24, 3], [-22, 4], [-20, 4], [-18, 4], [-16, 4]].forEach(([y, hw]) =>
        q(-hw, Y(y), hw * 2, 2, skin.belly));                 // a barriga sobe até o peito, entre as alças
      q(-3, Y(-24), 4, 2, '#f6ded6');                         // luz no alto da barriga
      q(-4, Y(-22), 2, 7, '#dfb4a9');                          // sombra da lateral, pra ela arredondar
      for (let y = -4; y >= -14; y -= 2) q(-7, Y(y), 14, 2, '#d9c39a');   // saia
      q(-7, Y(-4), 14, 2, '#b99f70');                          // barra de baixo
      q(-7, Y(-14), 14, 2, '#f0e0ba');                         // dobra de cima pegando a luz
      q(-6, Y(-16), 12, 2, '#c2a878');                         // cós
      q(-6, Y(-24), 2, 9, '#d9c39a'); q(4, Y(-24), 2, 9, '#d9c39a');     // alcinhas
      q(-6, Y(-24), 2, 1, '#f0e0ba'); q(4, Y(-24), 2, 1, '#f0e0ba');
    }
    if (skin.cape){
      q(-9, Y(-25), 7, 3, C1); q(3, Y(-25), 7, 3, C1);
      q(-2, Y(-24), 4, 3, GOLD); q(-1, Y(-23), 2, 1, '#8a6c22');
    }
    const ey = Y(-33);
    if (skin.brow){ q(-4, ey - 2, 4, 1, '#3a3d45'); q(3, ey - 2, 4, 1, '#3a3d45'); }
    if (p.blink){ q(-3, ey, 3, 1, OUT); q(3, ey, 3, 1, OUT); }
    else {
      q(-3, ey, 3, 2, '#14151a'); q(3, ey, 3, 2, '#14151a');
      q(-2, ey, 1, 1, skin.glint); q(4, ey, 1, 1, skin.glint);
      if (skin.lashes){ q(-4, ey - 1, 1, 1, OUT); q(6, ey - 1, 1, 1, OUT); }
    }
    q(1, Y(-29), 8, 4, skin.fur); q(1, Y(-29), 8, 1, skin.furHi);
    q(8, Y(-28), 3, 3, skin.nose);
    q(10, Y(-27), 6, 1, 'rgba(200,200,210,.5)'); q(-14, Y(-27), 6, 1, 'rgba(200,200,210,.5)');
    q(-11, Y(-14), 3, 5, skin.furD); q(8, Y(-14), 3, 5, skin.furD);   // patinhas de toco, uma de cada lado
  } else {
    if (skin.cape){
      for (let y = -28; y <= -4; y += 2){
        const w2 = Math.min(1, (y + 28) / 21);                // de costas o pano é o rosto do bicho: idem
        const sway = Math.round(Math.sin(capePhase - (y + 28) * .22) * (.3 + w2 * 2.6) + p.capeLag * w2);
        const hw = 11 + Math.round((y + 28) * .11);
        q(-hw + sway, y, hw * 2, 2, y > -8 ? C2 : (y > -18 ? C1 : C0));
      }
      q(-7, Y(-30), 14, 4, C1); q(-6, Y(-32), 12, 3, C0);
      q(-2, Y(-38), 4, 3, skin.furD);
    } else {
      for (let y = -6; y >= -20; y -= 2) q(-4, Y(y), 8, 2, skin.furD);
    }
  }
  { const fnt = skin.acc && skin.acc.fant;                     // a fantasia entra por cima do corpo e da cabeça
    if (fnt && fnt !== 'none') drawFantasia(q, fnt, Y, wx, back, skin.acc.fantHue, capePhase); }
  const fy = p.air > 0 ? -4 : -2, fi = p.air > 0 ? 1 : 0;
  q(-8 + fi, fy, 6, 3, '#6a5a56'); q(3 - fi, fy, 6, 3, '#6a5a56');
  if (back) tail();
  const oc = skin.acc;                                        // guarda-roupa: adereços do jogador
  if (oc){
    // ADEREÇO DE CABEÇA: a aba assenta na TESTA, não em cima das orelhas — mesmo que tape a orelha.
    // A coroa é a exceção: aro que descansa no alto do crânio (foi o desenho que já estava certo).
    const hy = Y(-39) + p.earY;                               // linha da testa
    const cy = Y(-45) + p.earY;                               // topo do crânio (só a coroa usa)
    if (!back){
      const ey2 = Y(-33);
      if (oc.makeup){                                         // maquiagem de drag
        q(-4, ey2 - 1, 4, 1, '#b06ae0'); q(3, ey2 - 1, 4, 1, '#b06ae0');    // sombra roxa
        q(-9, Y(-30), 3, 2, 'rgba(240,120,150,.8)'); q(7, Y(-31), 3, 2, 'rgba(240,120,150,.8)');   // blush
        q(8, Y(-28), 3, 3, '#e0455e'); q(8, Y(-28), 2, 1, '#ff7a92');       // batom
      }
      if (oc.shades){                                         // óculos escuros
        q(-5, ey2, 12, 3, '#14151a');
        q(-4, ey2 + 1, 2, 1, '#4a5262'); q(3, ey2 + 1, 2, 1, '#4a5262');
      } else if (oc.monocle){                                 // monóculo de gentleman
        q(2, ey2 - 1, 5, 1, GOLD); q(2, ey2 + 3, 5, 1, GOLD);
        q(2, ey2, 1, 3, GOLD); q(6, ey2, 1, 3, GOLD);
        q(7, ey2 + 4, 1, 2, '#e0bc50'); q(8, ey2 + 6, 1, 2, '#e0bc50');     // corrente caindo
      }
      if (oc.mustache){                                       // bigode respeitável
        q(3, Y(-25), 4, 2, '#3a2c1e'); q(8, Y(-25), 4, 2, '#3a2c1e');
        q(2, Y(-26), 2, 1, '#3a2c1e'); q(12, Y(-26), 2, 1, '#3a2c1e');      // pontas viradas
      }
      if (oc.bowtie){                                         // gravata borboleta
        q(-5, Y(-24), 4, 3, '#c93a4a'); q(1, Y(-24), 4, 3, '#c93a4a');
        q(-1, Y(-23), 2, 2, '#8a2434'); q(-4, Y(-23), 1, 1, '#e05a6a');
      }
      if (oc.tie){                                            // gravatinha social
        q(-2, Y(-24), 4, 2, '#4a6ac0');
        q(-1, Y(-22), 3, 6, '#3a5aa8'); q(-1, Y(-16), 3, 2, '#2c4680');
      }
      if (oc.choker){ q(-5, Y(-24), 10, 2, '#1a1c22'); q(-1, Y(-24), 2, 2, '#c94a5a'); }
      if (oc.chain){
        q(-5, Y(-22), 10, 1, GOLD); q(-6, Y(-23), 2, 1, GOLD); q(4, Y(-23), 2, 1, GOLD);
        q(-1, Y(-20), 3, 3, GOLD); q(0, Y(-19), 1, 1, '#8a6c22');
      }
      if (oc.earring){ q(8, Y(-40) + p.earY, 2, 2, GOLD); q(8, Y(-38) + p.earY, 1, 1, '#e0bc50'); }
    }
    drawChapeu(q, oc, hy, cy);
  }
  if (p.flash > 0){                                          // clarão de dano: estoura branco e alivia
    rg.globalCompositeOperation = 'source-atop';
    rg.fillStyle = p.flash > .075 ? 'rgba(255,250,244,.95)' : 'rgba(255,240,230,.42)';
    rg.fillRect(0, 0, 64, 66);
    rg.globalCompositeOperation = 'source-over';
  }
}

/* ---------------- ATORES ---------------- */
const DIRV = [[1, 0], [0, 1], [-1, 0], [0, -1]];
function makeActor(tx, ty, skin, opts = {}){
  return Object.assign({
    tx, ty, x: tx, y: ty, dir: 1, skin,
    mode: 'idle', t: 0, from: null, to: null, chain: false,
    pose: { crouch: 0, stretch: 0, earY: 0, tail: 0, blink: false, air: 0, lean: 0, capeLag: 0, flash: 0, armP: -1 },
    tailPhase: 0, tailSpeed: 2, blinkAt: 2 + Math.random() * 2, breath: 0,
    capeLag: 0, capeVel: 0, capePhase: 0,
    hp: 3, maxHp: 3, invuln: 0, flash: 0, dead: false, sink: 0,
    recX: 0, recY: 0, recT: 0, frzT: 0,                       // tranco do impacto (só visual) e congelamento
    hopS: .23, atkS: .3, dmg: 1, hostile: false, isPlayer: false, npc: false,
    struck: false, cd: 0, aiAt: 1 + Math.random() * 2,
  }, opts);
}
const player = makeActor(5, 6, SKIN_HERO, { isPlayer: true, hp: 10, maxHp: 10, dmg: 1, dir: 0, atkS: .19 });
const pDead = () => player.dead || player.mode === 'dead';   // caído conta como morto pra qualquer ação

/* ---------------- 2 JOGADORES (mesa / navegador) ----------------
   Ao descer pra dungeon o jogo faz uma VARREDURA atrás de um segundo jogador: se aparecer um
   segundo controle, ou se alguém encostar nas teclas do P2, o SAPO entra em campo e ajuda o
   rato na quest. Ele NÃO é `isPlayer`, é `ally`: bate nos bichos e apanha deles, mas mochila,
   cartas, poderes e queijo continuam sendo do rato — senão metade do jogo teria que ser dobrada. */
const player2 = makeActor(5, 7, SKIN_FROG, {
  ally: true, hp: 10, maxHp: 10, dmg: 1, dir: 0, hopS: .21, atkS: .18, dead: true,
});
let p2On = false, p2Scan = 0, p2Down = 0;                     // em campo? · varredura · tempo caído
const p2KO = () => player2.dead || player2.mode === 'dead';
const alvos = () => {                                         // quem os bichos podem caçar neste instante
  const v = [];
  if (!pDead()) v.push(player);
  if (p2On && !p2KO()) v.push(player2);
  return v;
};

function recoil(a, dir, mag, up){                             // arremesso curto pra trás, na direção do golpe
  const [sdx, sdy] = DIRV[w2s(dir)];
  a.recX = (sdx - sdy) * mag * .5;
  a.recY = (sdx + sdy) * mag * .25 - (up || 0);               // up = também salta do chão
  a.recT = .22;
}
const hitsAt = (a, x, y) => a.big2                            // chefes 2×2 cobrem 4 tiles
  ? (x >= a.tx && x <= a.tx + 1 && y >= a.ty && y <= a.ty + 1)
  : (a.tx === x && a.ty === y);
function occupied(x, y, self){
  if (!player.dead && player !== self && player.tx === x && player.ty === y) return true;
  if (p2On && !player2.dead && player2 !== self && player2.tx === x && player2.ty === y) return true;
  return current.actors.some(a => a !== self && !a.dead && hitsAt(a, x, y));
}
function canWalk(x, y, self){
  if (self && self.big2){                                     // o gigante precisa dos 4 tiles livres
    for (let ox = 0; ox <= 1; ox++)
      for (let oy = 0; oy <= 1; oy++)
        if (!current.free(x + ox, y + oy) || occupied(x + ox, y + oy, self)) return false;
    return true;
  }
  return current.free(x, y) && !occupied(x, y, self);
}

// `diag` = passo DIAGONAL do tabuleiro (dois eixos de uma vez), que na tela aparece RETO.
// A direção que o bicho encara continua sendo uma das 4: golpe e mira não mudam.
/* ---------------- O COMPASSO ----------------------------------------------------------------
   O jogo inteiro anda em PASSOS de T segundos. Ninguém sai do lugar fora da batida do
   compasso: quando ela bate, TODO personagem que quer andar — rato, sapo, bicho, chefe — sai
   no mesmo instante, dá o pulo inteiro dentro do passo e espera parado a próxima batida.
   É isso que deixa a sala barata: o mundo só muda de casa na batida, então UM pacote por
   passo com a casa de cada um descreve tudo o que aconteceu no tabuleiro.
   O pulo é encaixado no passo (`cabeNoPasso`): quem é lento ocupa dois passos inteiros, quem
   é rápido aterrissa a tempo da batida seguinte. Golpe de chefe tem o telegrafo esticado até
   a batida (`alinhaPasso`), pra a investida e o salto também saírem no compasso.             */
const PASSO_T = .25;                                          // T: o intervalo entre dois passos
let passoAcc = 0, passoN = 0, batePasso = false, batidaMs = 0;   // batidaMs: quando foi a última, em tempo real
function compasso(dt){                                        // uma vez por quadro, com o tempo do MUNDO
  passoAcc += dt;
  batePasso = passoAcc >= PASSO_T - 1e-6;
  if (batePasso){ passoAcc = Math.max(0, passoAcc - PASSO_T); if (passoAcc > PASSO_T) passoAcc = 0; passoN++; batidaMs = performance.now(); }
}
const cabeNoPasso = s => Math.max(1, Math.round(s / PASSO_T)) * PASSO_T - 1 / 30;   // pousa 2 quadros antes da batida
const alinhaPasso = s => s + ((PASSO_T - ((passoAcc + s) % PASSO_T)) % PASSO_T) - 1e-5;
function startStep(a, d){
  a.dir = d;
  if (!batePasso) return;                                     // fora da batida: só encara, o passo espera
  const [dx, dy] = DIRV[d];
  const nx = a.tx + dx, ny = a.ty + dy;
  if (canWalk(nx, ny, a)){
    a.mode = 'hop'; a.t = 0; a.hopFit = cabeNoPasso(a.hopS); a.passoN = passoN;
    a.from = [a.tx, a.ty]; a.to = [nx, ny];
    a.tx = nx; a.ty = ny;
    if (a.isPlayer){
      trailAdd(a.from[0], a.from[1]); passoQuer = null;
      soaEm(nx, ny, passoDoChao(nx, ny));                     // rastro + buffer + som DA superfície
      if (iceTrailT > 0) addIce(a.from[0], a.from[1]);             // Trilha Congelada: pisou, congelou
    } else if (a.ally){
      passoQuer2 = null; remQuer = null;                       // o toque virou passo: não vale um segundo
      if (a === player2 && cliente()) mandaPos(a, 0);          // previsão: andei aqui, conto pro dono
      trailAdd(a.from[0], a.from[1]);                          // o sapo também marca o chão por onde passa
      if (B2.iceTrail > 0) addIce(a.from[0], a.from[1]);
    }
    puff(gX(a.from[0], a.from[1]), gY(a.from[0], a.from[1]), 2);
  } else { a.mode = 'bump'; a.t = 0; }
}
let burnFrom = false;                                        // o golpe atual vem de um morcego em chamas?
let frostFrom = false;                                       // ...ou de uma criatura do gelo?
let venomFrom = false;                                       // ...ou de um bicho peçonhento do esgoto?
const MISS_PCT = 5;                                           // 5% dos golpes INIMIGOS passam longe — o jogador nunca erra
function whiff(a, v){                                          // o golpe corta o ar ao lado do alvo
  missNum(v.tx, v.ty);
  SFX.whiff();
  const x = gX(v.tx, v.ty), y = gY(v.tx, v.ty) - 20;
  for (let i = 0; i < 5; i++)                                  // riscos de ar passando raspando
    dust.push({
      x: x + (hash(i, 81) - .5) * 26, y: y + (hash(i, 82) - .5) * 14,
      vx: (hash(i, 83) - .5) * 90, vy: -10 - hash(i, 84) * 22,
      life: .2 + hash(i, 85) * .12, kind: 'hit',
    });
  recoil(v, a.dir, 3);                                         // o alvo se desvia de leve: dá pra ler o erro
}
function baseDmg(){                                           // dano de UM golpe normal do jogador, com os buffs
  return (player.dmg + (stamT > 0 ? 1 : 0) + (hasCard('ccat') ? 2 : 0)) * (rageT > 0 ? 2 : 1);
}
function dealDamage(a){
  const [dx, dy] = DIRV[a.dir];
  const tx2 = a.tx + dx, ty2 = a.ty + dy;
  const nosso = a.isPlayer || a.ally;                          // rato e sapo batem no mesmo lado
  const victims = nosso
    ? current.actors.filter(v => v.hostile && !v.dead)
    : alvos();
  const missed = !nosso && Math.random() * 100 < MISS_PCT;     // curto-circuito: os nossos nem rolam o dado
  if (nosso) cartaDono = a.ally ? player2 : player;            // ANTES do golpe: o bicho morre DENTRO do applyHit
  if (a.isPlayer){
    smashProp(tx2, ty2);                                      // barril na frente também leva
    if (player.hp >= player.maxHp) fireBeam(a.dir);           // vida cheia: o golpe voa
  } else if (a.ally) smashProp(tx2, ty2);
  burnFrom = !nosso && !!a.skin.bat;
  frostFrom = !nosso && !!a.frost;
  venomFrom = !nosso && !!a.venom;
  const critical = nosso && Math.random() * 100 < critDe(a.ally ? player2 : player);   // a sorte dos nossos é o crítico
  let landed = null;
  victims.forEach(v => {
    let hit;
    if (a.big2){                                              // o gigante golpeia TUDO colado no corpo 2×2
      const ddx = v.tx < a.tx ? a.tx - v.tx : v.tx > a.tx + 1 ? v.tx - a.tx - 1 : 0;
      const ddy = v.ty < a.ty ? a.ty - v.ty : v.ty > a.ty + 1 ? v.ty - a.ty - 1 : 0;
      hit = ddx + ddy === 1;
    } else hit = hitsAt(v, tx2, ty2);                         // golpe do jogador pega qualquer tile do chefão
    if (hit && missed){ whiff(a, v); return; }                // errou feio: MISS na cara e o golpe passa reto
    if (hit){                                                 // stamina +1 · Corda Total +3
      const base = a.isPlayer ? baseDmg() : a.ally ? sapoDmg() : a.dmg;   // stamina +1 · Corda Total +3 · Fúria ×2
      const tot = critical ? base * (leBuf(a.ally ? player2 : player, 'edge') > 0 ? 3 : 2) : base;   // Fio Afiado: crítico triplica
      applyHit(v, tot, a.dir, nosso && (critical || tot > a.dmg));   // número dourado
      landed = v;
      if (nosso){                                            // as CARTAS são da lâmina de quem bateu: rato ou sapo
        const dono = a.ally ? player2 : player;
        if (cartaDe(dono, 'cbat')){ v.burnT = 4; v.burnTk = 0; }   // Carta do Morcego: o alvo pega fogo
        if (cartaDe(dono, 'cyetiB') && Math.random() < .2){    // Carta do Yeti Ancião: o sopro trava o bicho
          v.frzT = Math.max(v.frzT || 0, 2);
          SFX.absorb();
          for (let i = 0; i < 7; i++)
            dust.push({ x: gX(v.tx, v.ty) + (hash(i, 61) - .5) * 22, y: gY(v.tx, v.ty) - 14 - hash(i, 62) * 20,
              vx: (hash(i, 63) - .5) * 55, vy: -20 - hash(i, 64) * 22, life: .45, kind: 'iceP' });
        }
        if (cartaDe(dono, 'cleech')){                         // Carta da Sanguessuga: 3 acertos = 1 de vida
          const cheio = dono === player2 ? ++leechHits2 >= 3 : ++leechHits >= 3;
          if (cheio){
            if (dono === player2) leechHits2 = 0; else leechHits = 0;
            if (dono.hp < dono.maxHp){ dono.hp++; dmgNum(dono.tx, dono.ty, 1, 'green'); updateHUD(); }
          }
        }
      }
      if (a.isPlayer && leechT > 0 && player.hp < player.maxHp){   // sanguessuga: golpe rouba vida
        player.hp++; dmgNum(player.tx, player.ty, 1, 'green'); updateHUD();
      }
      if (a.ally && B2.leech > 0 && player2.hp < player2.maxHp){
        player2.hp++; dmgNum(player2.tx, player2.ty, 1, 'green'); updateHUD();
      }
    }
  });
  if (landed){
    recoil(a, (a.dir + 2) % 4, nosso ? 5 : 3);                // quem bate também é jogado pra trás
    if (critical) critFx(landed);
  }
  burnFrom = false; frostFrom = false; venomFrom = false;
}
function applyHit(v, dmg, dir, crit){
  if (v.invuln > 0 || v.dead) return;
  if ((v.isPlayer || v.ally) && dmg > 0) vibra(v, dmg);        // o controle de quem apanhou treme
  /* EM SALA, QUEM CONTA A VIDA É O DONO. Aqui no convidado o golpe existe só como teatro —
     faísca, número e tranco de câmera — e o estrago chega pelo fio no pacote do mundo. Sem
     isso as duas máquinas matavam o mesmo bicho duas vezes e o espólio saía dobrado. */
  if (cliente()){
    v.flash = .16;
    if (v.hostile) v.hpBarT = 2.6;
    dmgNum(v.tx, v.ty, dmg, v.isPlayer || v.ally ? 'red' : 'green', crit);
    if (v.isPlayer || v.ally) SFX.hurt(); else soaEm(v.tx, v.ty, SFX.hitEnemy);
    sparks.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty) - 20, t: 0, big: dmg >= 3 });
    recoil(v, dir, dmg >= 3 ? 9 : 6);                         // o corpo ainda é jogado pra trás: é só desenho
    shake(dmg > 0 ? 3 : 1.5, .2, dir);
    if (dmg > 0) hitStop = Math.max(hitStop, Math.min(.12, .045 + dmg * .014));
    return;
  }
  if (v.isPlayer && pDead()) return;                          // caído já era: ninguém bate em quem está no chão
  if (v.ally && p2KO()) return;                               // e o sapo caído também sai do alvo
  if (v.mode === 'burrow'){                                   // debaixo da terra ninguém alcança
    soilBurst(gX(v.x, v.y), gY(v.x, v.y), 3);
    return;
  }
  if ((v.isPlayer && aegisT > 0) || (v.ally && B2.aegis > 0)){   // Casaco de Gelo: nada atravessa
    SFX.absorb();
    missNum(v.tx, v.ty);
    for (let i = 0; i < 4; i++)
      dust.push({ x: gX(v.tx, v.ty) + (hash(i, 88) - .5) * 18, y: gY(v.tx, v.ty) - 14 - hash(i, 89) * 20, vy: -12, life: .35, kind: 'iceP' });
    return;
  }
  if ((v.isPlayer || v.ally) && cartaDe(v.ally ? player2 : player, 'cplague') && Math.random() < .15){  // Carta do Plague Doctor: o golpe atravessa a névoa
    SFX.whiff(); missNum(v.tx, v.ty);
    v.invuln = .35;
    recoil(v, dir, 4);
    for (let i = 0; i < 5; i++)
      dust.push({ x: gX(v.tx, v.ty) + (hash(i, 96) - .5) * 20, y: gY(v.tx, v.ty) - 18,
        vx: (hash(i, 97) - .5) * 80, vy: -14 - hash(i, 98) * 20, life: .24, kind: 'hit' });
    return;
  }
  if (!v.isPlayer && v.hexT > 0) dmg *= 2;                   // Praga da Bruxa: enquanto a marca arde, tudo dói o dobro
  if ((v.isPlayer || v.ally) && cartaDe(v.ally ? player2 : player, 'ccube') && dmg > 1) dmg--;   // Carta do Cubo: a casca de gelo apara um ponto
  if (v.frzT > 0 && dmg > 0){ dmg += 1; crit = true; }        // gelo deixa o corpo quebradiço
  if (v.boss && v.openT > 0 && dmg > 0){ dmg = Math.round(dmg * 1.6); crit = true; }   // guarda aberta: acerte AGORA
  v.hp -= dmg; v.flash = .16; v.invuln = v.isPlayer ? .9 : v.ally ? .8 : .3;
  if (dmg <= 0) missNum(v.tx, v.ty);                          // a defesa comeu o golpe inteiro
  else dmgNum(v.tx, v.ty, dmg, v.isPlayer || v.ally ? 'red' : 'green', crit);
  if (v.isPlayer || v.ally) (dmg > 0 ? SFX.hurt : SFX.absorb)();
  else soaEm(v.tx, v.ty, SFX.hitEnemy);
  if (v.isPlayer){
    dmgFlash = 1; shake(dmg > 0 ? 4 : 2, .32, dir);
    if (dmg > 0) breakCharge();                              // sangrou? perdeu o giro — tem que carregar limpo
    if (burnFrom){ burnT = 4.2; burnTk = 2; toast('🔥 queimando!'); }   // dois tiques de 1: 2 de vida no total
    if (frostFrom && !hasCard('cyeti')){ frozT = 4; toast('❄️ −25% · 4s'); }   // Carta do Yeti: o gelo não pega
    if (venomFrom && !hasCard('ctoad')){ poisT = 6; poisTk = 2; toast('☠️ veneno: recargas +3s'); }
  }
  if (v.isPlayer && (burnFrom || frostFrom || venomFrom)){   // letreirão: o status TEM que ser lido
    if (burnFrom) bannerNaFila('QUEIMANDO!', 'fogo', 1700);
    else if (frostFrom && !hasCard('cyeti')) bannerNaFila('CONGELADO!', 'frio', 1700);
    else if (venomFrom && !hasCard('ctoad')) bannerNaFila('ENVENENADO!', 'lodo', 1700);
  }
  if (v.ally){                                               // o sapo pega os mesmos status que o rato
    dmgFlash = Math.max(dmgFlash, .55); shake(dmg > 0 ? 3 : 1.5, .26, dir);
    if (burnFrom){ p2BurnT = 7.5; p2BurnTk = 1.5; toast('🐸 🔥 queimando!'); }
    if (frostFrom && !cartaDe(player2, 'cyeti')){ p2FrostT = 4; toast('🐸 ❄️ −25% · 4s'); }
    if (venomFrom && !cartaDe(player2, 'ctoad')){ p2PoisT = 6; p2PoisTk = 2; toast('🐸 ☠️ veneno!'); }
  }
  if (v.ally && dmg > 0 && p2AtkHold){                        // o sapo também perde a carga ao apanhar
    p2AtkHold = false; p2ChargeT = 0; p2ChargeRdy = false; p2ChargeLock = true;
    p2ChargeBreakT = .34;                                     // a luz dele também se parte
    SFX.fizzle();
  }
  if (v.boss && !v.rage && v.hp > 0 && v.hp <= v.maxHp * .5){   // SEGUNDA FASE: abaixo da metade ele enfurece
    v.rage = true;
    v.bossCd = (v.bossCd || .9) * .55;
    v.dmg++; v.range = (v.range || 14) + 4;
    shake(6, .6); chromaT = Math.max(chromaT, .5); hitStop = Math.max(hitStop, .12);
    SFX.quake(); bannerNaFila('FÚRIA!', '', 2400);
    rings.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty), t: 0, gold: true, wide: true });
    for (let i = 0; i < 26; i++){
      const an = i / 26 * 6.2832;
      dust.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty) - 24, vx: Math.cos(an) * 120, vy: Math.sin(an) * 60 - 30,
        life: .55, kind: 'rageP' });
    }
  }
  recoil(v, dir, dmg >= 3 ? 9 : 6);                          // TRANCO: o corpo é jogado pra trás
  if (!v.isPlayer && !v.ally){ v.hpBarT = 2.6; shake(1.5, .14, dir); }  // socar dói na câmera também
  sparks.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty) - 20, t: 0, big: dmg >= 3 });
  if (dmg > 0) hitStop = Math.max(hitStop, Math.min(.12, .045 + dmg * .014));   // golpe pesado congela mais
  for (let i = 0; i < 7; i++)                                // faíscas de impacto
    dust.push({
      x: gX(v.tx, v.ty) + (hash(i, 21) - .5) * 12,
      y: gY(v.tx, v.ty) - 22 + (hash(i, 31) - .5) * 10,
      vx: (hash(i, 41) - .5) * 70, vy: -15 - hash(i, 51) * 30,
      life: .28 + hash(i, 61) * .15, kind: 'hit',
    });
  const [dx, dy] = DIRV[dir];
  let bx = v.tx + dx, by = v.ty + dy;
  if (v.hp > 0 && !(v.frzT > 0) && canWalk(bx, by, v)){       // congelado não desliza: quebra no lugar
    v.mode = 'hurt'; v.t = 0;
    v.from = [v.tx, v.ty]; v.to = [bx, by];
    v.tx = bx; v.ty = by;
  }
  if (v.hp <= 0 && v.ally){                                   // SAPO CAÍDO: fica de bruços esperando socorro
    v.hp = 0; v.mode = 'dead'; v.t = 0; p2Down = 0; avisouPedra2 = false;
    pedraPassa(player2);
    SFX.die();
    avisoSapoCaiu();                                           // aviso GRANDE no meio da tela: dá pra perder de vista
    toast('🐸 o sapo caiu! chegue perto pra levantar');
    updateHUD();
    return;
  }
  if (v.hp <= 0){
    if (v.isPlayer){
      v.mode = 'dead'; v.t = 0; deadT = 0; avisouPedra = false; SFX.die();
      pedraPassa(player);                                     // morreu com a pedra: ela vai pro parceiro
      closeAsk(); closeInv(); closeChest(); closeLan(); closeWard(); closeChar(); closeHell(); closeLift();
      if (upOpen) closeUp();                                  // janela aberta na hora da morte prendia o renascimento
    }
    else {
      v.dead = true;
      soaEm(v.tx, v.ty, SFX.kill);
      puff(gX(v.tx, v.ty), gY(v.tx, v.ty), 8);
      if (cartaDe(cartaDono || player, 'cjack') && !v.estourou){   // Carta da Abóbora: o caído explode nos vizinhos
        v.estourou = true;
        rings.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty) - 8, t: 0, jack: true });
        current.actors.forEach(o => {
          if (o === v || o.dead || !o.hostile) return;
          if (Math.abs(o.tx - v.tx) + Math.abs(o.ty - v.ty) <= 1) applyHit(o, 3, o.dir);
        });
      }
      if (v.boss){                                            // chefe caído: fanfarra do contêiner de coração
        rings.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty), t: 0, gold: true });
        SFX.fanfare();
        toast('❤️ contêiner de coração!');
      }
      const roll = hash(v.tx * 13 + (performance.now() | 0) % 97, v.ty * 7);
      if (v.boss){
        // ESPÓLIO DO CHEFE — espalhado nos vizinhos: três coisas no mesmo tile viravam uma pilha
        // só e o jogador nem via o que tinha caído.
        const viz = [[0, 0]].concat(DIRV).map(([ox, oy]) => [v.tx + ox, v.ty + oy])
          .filter(([a2, b2]) => current.free(a2, b2));
        const poe = (kind, i) => {
          const p3 = viz[i % Math.max(1, viz.length)] || [v.tx, v.ty];
          current.pickups.push({ x: p3[0], y: p3[1], kind });
          return p3;
        };
        poe('cheese', 0); poe('heartmax', 1);
        if (v.card){                                          // a CARTA do chefe é a recompensa: sempre cai
          const p3 = poe(v.card, 2);
          largaCartaChefe(v.card, p3[0], p3[1]);
        }
      }
      /* A QUEDA DOS BICHOS era a torneira escondida: com ~10 bichos por andar, 13,5% de poção
         dava mais 1,3 poção POR ANDAR em cima do que já nascia no chão — daí as 30 guardadas no
         nível 20. Poção caiu pra 3,5% (uma a cada ~3 andares) e queijo pra 22%.               */
      else if (roll > .91) for (let d2 = 0; d2 < (current.cursed ? 2 : 1); d2++) current.pickups.push({
        x: v.tx, y: v.ty,
        kind: 'potion',                                       // 9%
      });
      else if (roll > .57) for (let d2 = 0; d2 < (current.cursed ? 2 : 1); d2++)
        current.pickups.push({ x: v.tx, y: v.ty, kind: 'cheese' });  // 34%
      if (!v.boss && v.card && hash(v.tx * 31 + v.ty, (performance.now() | 0) % 617)
          < .04 * (current.cursed ? 2 : 1))
        grantCard(v.card, v.tx, v.ty, cartaDono);             // bicho comum: vai direto pra mão de quem matou
    }
  }
  if (v.isPlayer) updateHUD();
}

const CSPIN_S = .62;                                          // o rodopio carregado dura mais que o golpe seco
const spinTurn = q => (1 - (1 - Math.max(0, Math.min(1, q))) ** 2.4) * Math.PI * 6;   // 3 voltas freando (base negativa vira NaN: travar em [0,1])
function stepActor(a, dt, time, ctrl){
  const p = a.pose;
  p.lean = 0;
  p.armP = -1;                                                // fase do golpe do braço: -1 = braço parado
  a.t += dt;
  if (a.spinAtk && a.mode !== 'attack'){                      // morreu/apanhou no meio do giro: desarma tudo
    a.spinAtk = false; a.spinLand = false; a.atkS = a.atkS0 || a.atkS;
  }
  a.invuln = Math.max(0, a.invuln - dt);
  a.flash = Math.max(0, a.flash - dt); p.flash = a.flash;
  if (a.hpBarT > 0) a.hpBarT = Math.max(0, a.hpBarT - dt);
  if (a.alertT > 0) a.alertT = Math.max(0, a.alertT - dt);
  if (a.recT > 0) a.recT = Math.max(0, a.recT - dt);
  a.cd = Math.max(0, a.cd - dt);
  a.tailSpeed += ((a.mode === 'hop' ? 8 : 1.8) - a.tailSpeed) * Math.min(1, dt * 4);
  a.tailPhase += a.tailSpeed * dt;
  p.tail = a.tailPhase;
  a.blinkAt -= dt;
  p.blink = a.blinkAt < 0;
  if (a.blinkAt < -.12) a.blinkAt = 2 + hash((time * 997 + a.tx) | 0, 3) * 3.5;

  if (a.mode === 'idle'){
    // PARADO: o corpo respira num ciclo de 3 passos (encolhe, solta, estica de leve) em vez do
    // liga/desliga de antes — e a orelha entra ATRASADA, que é o acompanhamento do movimento.
    a.breath += dt;
    const resp = Math.sin(a.breath * 2.1);
    p.crouch = resp > .72 ? 1 : 0;
    p.stretch = resp < -.86 ? 1 : 0;
    p.air = 0;
    const respO = Math.sin(a.breath * 2.1 - .75);             // atraso da orelha: overlapping action
    p.earY = respO > .78 ? 1 : (respO < -.9 ? -1 : 0);
    if (ctrl.attack && a.cd <= 0){ a.mode = 'attack'; a.t = 0; a.struck = false; if (a.isPlayer) SFX.swing(); }
    else if (ctrl.dir != null){
      if (ctrl.dir !== a.dir){
        if (a.isPlayer && !ctrl.turnOnly){ a.chain = false; startStep(a, ctrl.dir); }  // giro instantâneo
        else { a.dir = ctrl.dir; a.mode = 'turn'; a.t = 0; }
      }
      else if (!ctrl.turnOnly){ a.chain = false; startStep(a, ctrl.dir); }
    }
  } else if (a.mode === 'turn'){
    p.crouch = 1;
    if (a.t >= .07){
      a.mode = 'idle'; a.t = 0;
      if (ctrl.dir === a.dir && !ctrl.turnOnly){ a.chain = false; startStep(a, ctrl.dir); }
    }
  } else if (a.mode === 'burrow'){                            // A ESCAVAÇÃO: mergulha, corre sob a terra, irrompe
    const T = .54, t = Math.min(1, a.t / T);
    if (t < .13){                                             // ANTECIPAÇÃO: recua, agacha e cava com as patas
      const q2 = t / .13;
      a.sink = 0; p.air = 0;
      p.crouch = 1 + Math.round(q2 * 2);
      p.lean = -Math.round(ease(q2) * 5);                     // o corpo vai pra trás antes de ir pra frente
      p.earY = -1; p.stretch = 0;
      if (a.t - dt < .02) puff(gX(a.x, a.y), gY(a.x, a.y), 3);
    } else if (t < .28){                                      // mergulho: dispara pra frente e AFUNDA acelerando
      const q2 = (t - .13) / .15;
      a.sink = q2 * q2;                                       // ease-in: o corpo some de vez no fim
      p.crouch = 0; p.stretch = q2 < .6 ? 3 : 1;
      p.air = 0; p.earY = 2; p.lean = Math.round(4 - q2 * 4);
      if (a.t - dt < .13 * T + dt){                           // a terra pula na hora do mergulho
        soilBurst(gX(a.x, a.y), gY(a.x, a.y), 13);
        rings.push({ x: gX(a.x, a.y), y: gY(a.x, a.y), t: 0, soil: true });
        SFX.dig();
      }
    } else if (t < .76){                                      // viagem: só o montinho de terra corre no chão
      const q2 = (t - .28) / .48, e2 = ease(q2);
      a.sink = 1;
      a.x = a.from[0] + (a.to[0] - a.from[0]) * e2;
      a.y = a.from[1] + (a.to[1] - a.from[1]) * e2;
      const ft = Math.round(a.x) + ',' + Math.round(a.y);     // vai abrindo sulco tile a tile
      if (a.furT !== ft){
        a.furT = ft;
        furrow.push({ x: Math.round(a.x), y: Math.round(a.y), t: 0 });
      }
      if (((a.t * 60) | 0) % 2 === 0) soilBurst(gX(a.x, a.y), gY(a.x, a.y), 2);
      if ((a.isPlayer || a.ally) && leBuf(a, 'drill') > 0){   // Broca: quem está por cima do túnel se ferra
        const cx2 = Math.round(a.x), cy2 = Math.round(a.y), kk2 = cx2 + ',' + cy2;
        if (!a.bhit) a.bhit = {};
        if (!a.bhit[kk2]){
          a.bhit[kk2] = 1;
          current.actors.forEach(v => {
            if (v.hostile && !v.dead && hitsAt(v, cx2, cy2)){
              applyHit(v, 3, a.dir);
              soilBurst(gX(cx2, cy2), gY(cx2, cy2), 7);
            }
          });
        }
      }
    } else {                                                  // IRRUPÇÃO: estoura pra fora, passa do ponto e assenta
      const q2 = (t - .76) / .24;
      a.x = a.to[0]; a.y = a.to[1];
      a.sink = Math.max(0, 1 - q2 * 1.9);                     // desenterra num átimo; o resto é salto
      const arc = q2 < .6                                     // OVERSHOOT: sobe demais e volta
        ? Math.sin(q2 / .6 * Math.PI) * 15
        : Math.sin((q2 - .6) / .4 * Math.PI) * 4;             // e ainda dá um quique
      p.air = Math.round(arc);
      p.stretch = q2 < .3 ? 3 : (q2 < .52 ? 1 : 0);
      p.crouch = (q2 > .55 && q2 < .7) ? 3 : (q2 > .93 ? 1 : 0);   // ESMAGA ao tocar o chão
      p.lean = 0;
      p.earY = q2 < .5 ? -2 : 2;
      if (a.t - dt < T * .76) burrowOut(a);                   // um único estouro na saída
    }
    if (a.t >= T){
      a.mode = 'idle'; a.t = 0; a.breath = 0; a.sink = 0; a.furT = null;
      a.x = a.to[0]; a.y = a.to[1];
      puff(gX(a.x, a.y), gY(a.x, a.y), 4);
      if (a.isPlayer) onPlayerLand(); else if (a.ally) sapoPousou(); else if (a.hostile) pisouNaPlaca(a);
    }
  } else if (a.mode === 'hop'){
    const ANT = a.chain ? .09 : .2;
    const hopT = a.hopFit || a.hopS;
    const t = Math.min(1, a.t / hopT);
    if (t < ANT){ p.crouch = 1 + Math.round(t / ANT * 2); p.stretch = 0; p.air = 0; p.earY = 1; }
    else if (t < .84){
      const q2 = (t - ANT) / (.84 - ANT), e2 = ease(q2);
      a.x = a.from[0] + (a.to[0] - a.from[0]) * e2;
      a.y = a.from[1] + (a.to[1] - a.from[1]) * e2;
      p.air = (1 - (2 * q2 - 1) ** 2) * (a.airK || 12);       // arco parabólico · o SALTO do chefe sobe bem mais
      p.crouch = 0; p.stretch = q2 < .5 ? 2 : 1;
      p.earY = q2 < .5 ? 2 : -1;
    } else {
      a.x = a.to[0]; a.y = a.to[1];
      const q2 = (t - .84) / .16;
      p.air = 0; p.stretch = 0;
      p.crouch = Math.round((1 - q2) * 3);
      p.earY = 2;
      if (q2 < .2 && a.t - dt < hopT * .84) puff(gX(a.x, a.y), gY(a.x, a.y), 3);
    }
    if (a.t >= hopT){
      a.mode = 'idle'; a.t = 0; a.breath = 0;
      if (a.isPlayer) onPlayerLand();
      else if (a.hostile) pisouNaPlaca(a);
      else if (a.ally) sapoPousou();                          // o sapo cata, arma placa e desce de andar igual
      if (!a.dead && a.mode === 'idle' && !a.skin.fly){      // terreno perigoso fere quem pousa (voadores não)
        const armed = !current.witch || (time % 2) < 1.1;   // no sabá o espinho pulsa
        if (armed && current.traps && current.traps.some(t2 => t2.x === a.tx && t2.y === a.ty))
          applyHit(a, 1, a.dir);                             // espinhos
        if (current.lava && current.lava.some(t2 => t2.x === a.tx && t2.y === a.ty))
          applyHit(a, 2, a.dir);                             // lava queima mais
        if (!a.isPlayer && iceTiles.some(t2 => t2.x === a.tx && t2.y === a.ty)){
          a.frzT = 2; applyHit(a, 1, a.dir);                 // pisou na trilha congelada
          for (let k = 0; k < 5; k++)
            dust.push({ x: gX(a.tx, a.ty) + (hash(k, 77) - .5) * 16, y: gY(a.tx, a.ty) - 8, vy: -20, life: .4, kind: 'iceP' });
        }
        if (current.goo && current.goo.some(t2 => t2.x === a.tx && t2.y === a.ty)){
          applyHit(a, 1, a.dir);                             // lodo real: fere e envenena
          if (a.isPlayer){ poisT = 6; poisTk = 2; toast('☠️ veneno!'); }
        }
      }
      if (a.isPlayer && current.slick && a.mode === 'idle' && !a.dead
          && current.slick.some(t2 => t2.x === a.tx && t2.y === a.ty)){
        const [sdx, sdy] = DIRV[a.dir];                      // placa polida: aqui O RATINHO DESLIZA, sempre
        if (canWalk(a.tx + sdx, a.ty + sdy, a)){
          a.mode = 'hurt'; a.t = 0;                          // deslize rasteiro, sem pulo
          a.from = [a.tx, a.ty]; a.to = [a.tx + sdx, a.ty + sdy];
          a.tx += sdx; a.ty += sdy;
          trailAdd(a.from[0], a.from[1]);
          puff(gX(a.from[0], a.from[1]), gY(a.from[0], a.from[1]), 4);
          toast('🧊');
        }
      }
      if (a.mode === 'idle' && ctrl.dir != null && !ctrl.turnOnly){
        a.chain = true;
        if (ctrl.dir !== a.dir && !a.isPlayer){ a.dir = ctrl.dir; a.mode = 'turn'; a.t = 0; }
        else startStep(a, ctrl.dir);                          // jogador emenda a curva sem pausa
      } else a.chain = false;
    }
  } else if (a.mode === 'invest'){                             // INVESTIDA: recolhe, DISPARA em linha e freia
    const T = a.investT || .42, t = Math.min(1, a.t / T);
    const e3 = t < .16 ? (t / .16) * .06 : .06 + ease((t - .16) / .84) * .94;   // sai devagar e voa
    a.x = a.from[0] + (a.to[0] - a.from[0]) * e3;
    a.y = a.from[1] + (a.to[1] - a.from[1]) * e3;
    p.crouch = t < .16 ? 3 : 0;
    p.stretch = t < .16 ? 0 : 3;
    p.air = 0; p.earY = -2;
    p.lean = t < .16 ? -5 : 7;
    if (((a.t * 70) | 0) % 2 === 0) puff(gX(a.x, a.y), gY(a.x, a.y), 2);
    if (a.t >= T){
      a.mode = 'idle'; a.t = 0; a.breath = 0;
      a.x = a.to[0]; a.y = a.to[1];
      puff(gX(a.x, a.y), gY(a.x, a.y), 6);
    }
  } else if (a.mode === 'bump'){
    const t = Math.min(1, a.t / .24);
    if (t < .3) p.crouch = Math.round(t / .3 * 2);
    else { p.crouch = 0; p.lean = Math.round(Math.sin((t - .3) / .7 * Math.PI) * 4); }
    p.earY = t > .3 ? -1 : 1;
    if (a.t >= .24){ a.mode = 'idle'; a.t = 0; a.breath = 0; }
  } else if (a.mode === 'attack'){
    const t = Math.min(1, a.t / a.atkS);
    if (a.spinAtk){                                           // GIRO CARREGADO — a antecipação foi a própria carga
      if (t < .1){                                            // 1) estouro: estica e desgruda do chão
        p.crouch = 0; p.stretch = 2; p.lean = 0; p.earY = -1;
        p.armP = .5 + (t / .1) * .3;
        p.air = Math.round(2 + (t / .1) * 4);
      } else if (t < .7){                                     // 2) rodopio: 3 voltas freando, num arco no ar
        const q2 = (t - .1) / .6;
        p.crouch = 0; p.stretch = 1; p.lean = 0; p.earY = -1; p.armP = .8;   // lâmina esticada o giro inteiro
        p.air = Math.round(6 + Math.sin(q2 * Math.PI) * 5 - q2 * 6);
        a.dir = (a.spinDir0 + Math.round(spinTurn(q2) / 1.5708)) & 3;   // a silhueta troca de frente: é o giro
      } else if (t < .84){                                    // 3) pouso: esmaga, e a rotação passa do ponto
        const q2 = (t - .7) / .14;
        p.crouch = 3; p.stretch = 0; p.air = 0; p.earY = 2;
        a.dir = q2 < .5 ? (a.spinDir0 + 1) & 3 : a.spinDir0;  // overshoot de um quarto e volta
        if (!a.spinLand){ a.spinLand = true; spinLandFx(a); }
      } else {                                                // 4) assenta com um repique
        const q2 = (t - .84) / .16;
        p.crouch = q2 < .45 ? 1 : 0; p.stretch = (q2 >= .45 && q2 < .8) ? 1 : 0;
        p.air = 0; p.earY = q2 < .5 ? 1 : 0; a.dir = a.spinDir0;
      }
    } else if (t < .32){                                      // antecipação CURTA: o golpe tem que sair rápido
      const q2 = ease(t / .32);
      p.crouch = 1 + Math.round(q2 * 2); p.lean = -Math.round(q2 * 4); p.earY = 1;
      p.armP = q2 * .5;                                       // a fase do golpe (língua do sapo) acompanha
    } else if (t < .5){                                       // bote: estica no arremesso e sai do chão
      p.crouch = 0; p.stretch = 2; p.lean = 7; p.earY = -1; p.air = 3;
      p.armP = .5 + (t - .32) / .18 * .3;
      if (!a.struck){
        a.struck = true; dealDamage(a);
        slashes.push({ a, t: 0 });
        a.capeVel -= 150;                                     // a capa chicoteia atrás (overlap)
      }
    } else {                                                  // acompanhamento: passa do ponto e assenta em arco
      const q2 = (t - .5) / .5;
      p.stretch = q2 < .3 ? 1 : 0;
      p.armP = .8 + q2 * .2;                                  // acompanhamento
      p.air = q2 < .35 ? Math.round((1 - q2 / .35) * 3) : 0;  // desce do saltinho do bote
      p.lean = Math.round((1 - ease(q2)) * 7 - Math.sin(q2 * Math.PI) * 2.4);
      p.earY = q2 > .5 ? 1 : -1;
    }
    if (a.t >= a.atkS){
      if (a.spinAtk){ a.spinAtk = false; a.spinLand = false; a.dir = a.spinDir0; a.atkS = a.atkS0 || a.atkS; }
      a.mode = 'idle'; a.t = 0; a.breath = 0; a.cd = (a.isPlayer || a.ally) ? .04 : (a.bossCd || .9);
    }
  } else if (a.mode === 'hurt'){
    const q2 = Math.min(1, a.t / .16), t = 1 - (1 - q2) ** 3;  // arranca rápido e freia (ease-out)
    a.x = a.from[0] + (a.to[0] - a.from[0]) * t;
    a.y = a.from[1] + (a.to[1] - a.from[1]) * t;
    p.crouch = q2 < .5 ? 3 : 1; p.earY = 2; p.stretch = q2 < .35 ? 2 : 0;
    if (a.t >= .16){
      a.mode = 'idle'; a.t = 0; a.x = a.to[0]; a.y = a.to[1];
      puff(gX(a.x, a.y), gY(a.x, a.y), 2);                   // poeirinha ao frear
      if (a.isPlayer) onPlayerLand();                        // derrapada/empurrão pode terminar numa porta ou item
    }
  } else if (a.mode === 'dead'){
    p.crouch = 3; p.earY = 3;                                 // o renascimento é contado no loop, em tempo real
  }
  // CAPA (depois dos modos, pra enxergar o p.lean deste quadro): o pano é arrastado pelo corpo,
  // passa do ponto e volta oscilando. Freio menor = ele continua depois que o rato já parou.
  a.capePhase += dt * (a.mode === 'hop' ? 7 : a.mode === 'attack' ? 5 : 1.6);
  const capeTarget = (a.mode === 'hop' && p.air > 2) ? -5.5 : (p.lean > 2 ? -3.5 : p.lean < -1 ? 1.5 : 0);
  a.capeVel += (capeTarget - a.capeLag) * 105 * dt;
  a.capeVel *= Math.exp(-5.6 * dt);
  a.capeLag += a.capeVel * dt;
  p.capeLag = Math.round(Math.max(-7, Math.min(5, a.capeLag)));
  if (a.mode === 'attack' && a.mAnt !== 'attack') a.golpes = (a.golpes | 0) + 1;   // a paridade do golpe vai pelo fio
  a.mAnt = a.mode;
}

const SKINDRAW = [                                           // bicho → função de desenho
  ['frog', drawFrog], ['cat', drawCat], ['plague', drawPlague], ['ratking', drawRatKing], ['blob', drawBlob], ['bat', drawBat], ['eye', drawEye],
  ['cube', drawCube], ['moth', drawMoth], ['yeti', drawYeti], ['toad', drawToad], ['leech', drawLeech],
  ['mosq', drawMosq], ['wisp', drawWisp],
  ['jack', drawJack], ['scare', drawScare], ['crow', drawCrow], ['cauld', drawCauld],
];
let isca = null;                                             // ISCA DE QUEIJO: some sozinha e estoura
function estouraIsca(){
  if (!isca) return;
  const { x, y } = isca;
  isca = null;
  const gx2 = gX(x, y), gy2 = gY(x, y);
  rings.push({ x: gx2, y: gy2 - 8, t: 0, gold: true });
  SFX.burst(); shake(3, .3);
  for (let i = 0; i < 16; i++){                               // migalhas voando
    const an = i / 16 * 6.2832;
    dust.push({ x: gx2, y: gy2 - 10, vx: Math.cos(an) * (70 + hash(i, 88) * 60),
      vy: Math.sin(an) * 40 - 40, gv: 220, life: .45, kind: 'soil',
      ci: ['#d9a234', '#e8bc50', '#a87a24'][(hash(i, 89) * 3) | 0], sz: 2 });
  }
  current.actors.forEach(v => {
    if (!v.hostile || v.dead) return;
    if (Math.abs(v.tx - x) + Math.abs(v.ty - y) <= 1) applyHit(v, 5, v.dir);
  });
  if (Math.abs(player.tx - x) + Math.abs(player.ty - y) <= 1) applyHit(player, 2, player.dir);
}
function drawIsca(time){                                      // o queijo falso: gordo, dourado e piscando
  if (!isca) return;
  const x = gX(isca.x, isca.y), y0 = gY(isca.x, isca.y);
  const urg = isca.t < 2;
  const pisca = urg && ((time * (isca.t < 1 ? 12 : 6)) | 0) % 2 === 0;
  const bob = Math.round(Math.sin(time * 4) * 2);
  const y = y0 - 9 + bob;
  E(x, y0 + 2, 9, 4, 'rgba(4,5,10,.4)');
  glowOval(x, y0 + 1, 20, 9, '246,206,90', .3 + (urg ? .25 : 0));
  glowAt(x, y, 18, urg ? '255,120,60' : '246,206,90', .35 + Math.sin(time * 5) * .1);
  P(x - 10, y - 6, 20, 13, OUT);                              // cunha de queijo bem gorda
  P(x - 9, y - 5, 18, 11, pisca ? '#ffd9a0' : '#d9a234');
  P(x - 9, y - 5, 18, 4, pisca ? '#fff0cc' : '#e8bc50');
  P(x - 9, y + 4, 18, 2, '#a87a24');
  P(x - 5, y - 2, 3, 3, '#a87a24'); P(x + 3, y, 3, 3, '#a87a24'); P(x - 1, y - 4, 2, 2, '#a87a24');
  for (let i = 0; i < 3; i++){                                // cheirinho subindo: é o que chama os bichos
    const ph = ((time * .6 + i * .33) % 1);
    P(x - 4 + i * 4, y - 9 - Math.round(ph * 16), 2, 2, 'rgba(246,206,90,' + ((1 - ph) * .5).toFixed(2) + ')');
  }
  const q = isca.t / 7;                                       // pavio: o anel encolhe até estourar
  isoRing(x, y0, Math.round(10 + q * 22), urg ? 'rgba(255,110,60,.55)' : 'rgba(246,206,90,.35)', urg ? 2 : 1);
}
let suorT = 0;                                               // gota de suor: o alívio confuso, feito anime
function drawSuor(x, y){
  const q = 1 - Math.min(1, suorT / 2.6);
  const al = q < .1 ? q / .1 : q > .86 ? (1 - q) / .14 : 1;
  const gx3 = x + 14 + Math.round(Math.sin(q * 5) * 2);
  const gy3 = y - 50 + Math.round(q * q * 24) - Math.round(Math.sin(q * 9) * 2);
  const A = c => 'rgba(' + c + ',' + al.toFixed(2) + ')';
  glowAt(gx3, gy3 - 4, 14, '150,215,255', al * .3);
  const RS2 = [1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 4, 2];          // lágrima: bico em cima, bojo redondo embaixo
  RS2.forEach((hw, i) => P(gx3 - hw - 1, gy3 - 11 + i, hw * 2 + 2, 3, A('18,24,38')));
  RS2.forEach((hw, i) => P(gx3 - hw, gy3 - 11 + i, hw * 2, 1,
    i < 4 ? A('168,220,250') : i > 8 ? A('86,162,216') : A('120,196,240')));
  P(gx3 - 3, gy3 - 5, 3, 4, A('214,242,255'));               // brilho por dentro
  P(gx3 - 3, gy3 - 5, 2, 2, A('255,255,255'));
}
function drawWitchHat(x, y){                                 // chapéu de bruxa: cone tombado, aba larga e fivela
  const t = performance.now() / 1000;
  const tomb = Math.round(Math.sin(t * 1.1) * 1);
  const PANO = '#2f2140', PANO2 = '#43305c', ROXO = '#1e1430';
  for (let i = 0; i < 15; i++){                              // cone que tomba pra ponta
    const w2 = Math.max(1, 8 - Math.round(i * .55));
    const ox = Math.round((i / 14) ** 1.7 * 9) + tomb;
    P(x - w2 + ox - 1, y - 6 - i - 1, w2 * 2 + 2, 3, OUT);
  }
  for (let i = 0; i < 15; i++){
    const w2 = Math.max(1, 8 - Math.round(i * .55));
    const ox = Math.round((i / 14) ** 1.7 * 9) + tomb;
    P(x - w2 + ox, y - 6 - i, w2 * 2, 1, i < 4 ? ROXO : i % 4 === 0 ? PANO2 : PANO);
  }
  P(x + 9 + tomb, y - 21, 3, 3, OUT); P(x + 9 + tomb, y - 21, 2, 2, '#f2c14e');   // estrelinha na ponta
  P(x - 15, y - 7, 30, 5, OUT);                              // aba larga
  P(x - 14, y - 6, 28, 3, PANO2);
  P(x - 14, y - 6, 28, 1, '#57406f');
  P(x - 6, y - 11, 12, 4, OUT); P(x - 5, y - 10, 10, 2, '#231834');   // fita
  P(x - 2, y - 11, 5, 4, OUT); P(x - 1, y - 10, 3, 2, '#f2c14e');     // fivela dourada
  glowAt(x + 8, y - 22, 12, '242,193,78', .22 + Math.sin(t * 2.4) * .07);
}
function drawUpTag(x, y, n){                                  // em cima da ratinha: UMA seta subindo e descendo
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 2.4);
  const cy = Math.round(y + 12 - bob * 5);
  const cx = Math.round(x - (n > 1 ? 8 : 0));                 // com número do lado, a seta anda pra esquerda
  glowAt(cx, cy + 5, 20, '214,232,255', .15 + (bob + 1) * .05);
  // SETA POR LINHAS, igual a qualquer sprite do jogo: tabela [y, meia-largura], contorno de TODAS
  // as linhas e só depois o branco. Desenhar a mesma seta "mais gorda" por trás pra fingir contorno
  // dava espessura irregular e um degrau feio no ombro (onde a cabeça encontra a haste).
  const LIN = [];
  for (let i2 = 0; i2 < 7; i2++) LIN.push([i2, i2 * 2 + 1]);  // cabeça ÍMPAR: 1,3,5,…,13 — ponta de 1px
  for (let i2 = 7; i2 < 14; i2++) LIN.push([i2, 5]);          // haste de 5
  const mw = w2 => w2 >> 1;
  LIN.forEach(([dy, w2]) => P(cx - mw(w2) - 1, cy + dy - 1, w2 + 2, 3, '#14161c'));
  LIN.forEach(([dy, w2]) => P(cx - mw(w2), cy + dy, w2, 1,
    dy < 3 ? '#ffffff' : dy > 11 ? '#9fb0c4' : dy > 8 ? '#cfdcea' : '#eef4fa'));
  LIN.forEach(([dy, w2]) => P(cx - mw(w2), cy + dy, 1, 1, '#ffffff'));        // aresta esquerda em luz
  LIN.forEach(([dy, w2]) => P(cx + mw(w2), cy + dy, 1, 1, '#a9bacd'));        // aresta direita na sombra
  P(cx - 1, cy + 7, 3, 1, '#ffffff');                         // ombro pegando luz
  for (let i2 = 0; i2 < 3; i2++)                              // rastro: fiapo de luz por onde ela passou
    P(cx - 1, cy + 17 + i2 * 3, 2, 2, 'rgba(226,240,255,' + (.26 - i2 * .08).toFixed(2) + ')');
  if (n > 1){                                                 // ×N do lado, em pastilha escura
    // contorno pixel a pixel entope o vazio de dígito 3x5 e o número vira xadrez: precisa de PLACA
    const nx = cx + 11, ny = cy + 4, w2 = 12 + ('' + n).length * 4;
    P(nx, ny + 1, w2, 6, OUT); P(nx + 1, ny, w2 - 2, 8, OUT);
    P(nx + 1, ny + 2, w2 - 2, 4, 'rgba(18,22,30,.92)');
    P(nx + 2, ny + 1, w2 - 4, 6, 'rgba(18,22,30,.92)');
    const dx = nx + 4;
    P(dx, ny + 2, 1, 1, '#ff9ab0'); P(dx + 2, ny + 2, 1, 1, '#ff9ab0');
    P(dx + 1, ny + 3, 1, 1, '#ff9ab0');
    P(dx, ny + 4, 1, 1, '#ff9ab0'); P(dx + 2, ny + 4, 1, 1, '#ff9ab0');
    drawNum(dx + 4, ny + 2, n, '#eaf1f8');
  }
}
function drawTags(a, gx2, gy2){                              // etiquetas sobre o bicho: vida e susto
  if (a.npc && (a.skin === SKIN_WAIFU || a.skin === SKIN_SAPINHA)){
    const n2 = readyUps(a.skin === SKIN_SAPINHA ? 'sapo' : 'rato');
    if (n2 > 0 && !entrega) drawUpTag(gx2, gy2 - 68, n2);     // durante a cena quem ocupa o alto é o embrulho
  }
  if (a.isPlayer || !a.hostile) return;
  const top = gy2 - (a.big2 ? 62 : 46);
  if (a.hpBarT > 0 && !a.boss && a.hp > 0){                   // barrinha some sozinha depois do golpe
    const w = 20, k = Math.max(0, Math.min(1, a.hp / a.maxHp));
    const al = Math.min(1, a.hpBarT * 2).toFixed(2);
    P(gx2 - w / 2 - 1, top - 1, w + 2, 5, `rgba(10,12,18,${(al * .82).toFixed(2)})`);
    P(gx2 - w / 2, top, w, 3, `rgba(46,22,26,${al})`);
    const c = k > .5 ? '110,224,140' : k > .25 ? '242,193,78' : '232,96,96';
    const fw = Math.max(1, Math.round(w * k));
    P(gx2 - w / 2, top, fw, 3, `rgba(${c},${al})`);
    P(gx2 - w / 2, top, fw, 1, `rgba(255,255,255,${(al * .3).toFixed(2)})`);
  }
  if (a.alertT > 0) drawAlert(gx2, top - 9, a.alertT);
  /* O ÚLTIMO DO ANDAR. Só pra você não terminar o andar caçando um bicho perdido num canto —
     mas o anel pulsando era um holofote em cima dele, e holofote não combina com uma masmorra
     escura. Agora é AURA: o corpo respira um morno fraquíssimo e solta uma faísca de vez em
     quando. De perto nem se nota; do outro lado da sala é o único ponto morno do escuro, que é
     exatamente o quanto de ajuda isso merece. */
  if (ultimoFoes === 1 && !a.boss && !current.cleared && !LOWFX){
    const pu = .5 + Math.sin(performance.now() / 900) * .5;   // respiração lenta, não pisca-pisca
    glowAt(gx2, gy2 - 16, 26, '232,188,110', .035 + pu * .03);
    // UMA faísca a cada ~2s, e uma só: sem a trava de janela o mesmo sorteio valia pros 7 quadros
    // daquele intervalo e saía uma rajadinha — justo o contrário de discreto.
    const jan = (performance.now() / 120) | 0;
    if (a.auraJan !== jan && hash(jan, a.tx * 13 + a.ty) < .06){
      a.auraJan = jan;
      dust.push({ x: gx2 + (hash(jan, 9) - .5) * 18, y: gy2 - 8, vy: -11, life: .8, kind: 'aura' });
    }
  }
  if (a.boss){
    if (a.tellT > 0){                                         // o anel fecha: o golpe vem quando ele some
      const q = 1 - a.tellT / (a.rage ? .34 : .6);
      isoRing(gx2, gy2, Math.max(4, 48 - q * 32), `rgba(255,70,60,${(.3 + q * .5).toFixed(2)})`, 2 + q * 2);
      glowAt(gx2, gy2 - 26, 30, '255,60,50', .16 + q * .28);
    }
    if (a.openT > 0){                                         // guarda aberta: 1,6x de dano enquanto brilha
      const pu = .55 + Math.sin(performance.now() / 85) * .45;
      isoRing(gx2, gy2, 30, `rgba(255,236,150,${(.28 + pu * .42).toFixed(2)})`, 2);
      P(gx2 - 1, top - 16, 2, 7, `rgba(255,236,150,${pu.toFixed(2)})`);
      P(gx2 - 3, top - 12, 6, 2, `rgba(255,236,150,${pu.toFixed(2)})`);
    }
    if (a.rage) glowAt(gx2, gy2 - 30, 42, '224,60,50', .1 + Math.sin(performance.now() / 170) * .05);
  }
}
function drawAlert(x, y, t){                                 // balãozinho de susto: te viu!
  const k = Math.max(.25, Math.min(1, t > .95 ? (1.1 - t) / .15 : Math.min(1, t * 4)));
  const w = Math.max(5, Math.round(9 * k)), h = Math.max(6, Math.round(11 * k));
  P(x - w / 2 - 1, y - h - 1, w + 2, h + 2, OUT);
  P(x - w / 2, y - h, w, h, '#f4ecd8');
  P(x - w / 2, y - h, w, 1, '#fffaf0');
  P(x - 1, y - h + 2, 2, Math.max(2, h - 6), '#c03a3a');
  P(x - 1, y - 3, 2, 2, '#c03a3a');
  P(x - 1, y + 1, 3, 2, OUT);
}
const sparks = [];                                           // faísca em estrela no ponto do golpe
function drawSparks(dt){
  for (let i = sparks.length - 1; i >= 0; i--){
    const s2 = sparks[i];
    s2.t += dt;
    const T = .26;
    if (s2.t >= T){ sparks.splice(i, 1); continue; }
    const q = s2.t / T, al = (1 - q).toFixed(2);
    const r = (s2.big ? 13 : 9) * (.4 + q * .95);
    const cA = `rgba(255,250,230,${al})`, cB = `rgba(255,214,120,${((1 - q) * .8).toFixed(2)})`;
    P(s2.x - 1, s2.y - r, 2, r * 2, cB);                     // cruz de luz
    P(s2.x - r, s2.y - 1, r * 2, 2, cB);
    const d = r * .6;
    P(s2.x - d, s2.y - d, 2, 2, cA); P(s2.x + d - 2, s2.y - d, 2, 2, cA);
    P(s2.x - d, s2.y + d - 2, 2, 2, cA); P(s2.x + d - 2, s2.y + d - 2, 2, 2, cA);
    E(s2.x, s2.y, Math.max(1, 5 * (1 - q)), Math.max(1, 3 * (1 - q)), cA);
  }
}
function drawCurseAura(a, gx2, gy2){                           // POR TRÁS: poça preta, brasa e fumaça subindo
  const t = performance.now() / 1000;
  const pu = .7 + Math.sin(t * 2.3 + a.tx) * .3;
  glowOval(gx2, gy2, 22, 22 * pitch * .62, '0,0,0', .55);      // poça preta engolindo o chão
  glowOval(gx2, gy2, 16, 16 * pitch * .62, '190,20,20', .24 + pu * .14);
  glowAt(gx2, gy2 - 22, 24, '150,10,14', .14 + pu * .1);
  for (let k2 = 0; k2 < 9; k2++){                              // baforadas subindo e abrindo do corpo
    const ph = (t * .55 + k2 / 9 + a.tx * .13 + a.ty * .07) % 1;
    const wx = gx2 + Math.round(Math.sin(k2 * 2.1 + a.ty + t * 1.4) * (4 + ph * 13));
    const wy = gy2 - 4 - ph * 42;
    const s2 = 2 + Math.round(ph * 4);
    const al = (1 - ph) * (1 - ph) * .62;
    E(wx, wy, s2, Math.max(1, s2 - 1), 'rgba(120,8,14,' + al.toFixed(2) + ')');
    if (ph < .35) E(wx, wy, Math.max(1, s2 - 2), Math.max(1, s2 - 2), 'rgba(226,44,34,' + (al * .9).toFixed(2) + ')');
  }
}
function drawCurseVeil(a, gx2, gy2){                           // POR CIMA: a capa de fumaça cruza na frente do corpo
  const t = performance.now() / 1000;
  for (let k2 = 0; k2 < 5; k2++){
    const ph = (t * .42 + k2 / 5 + a.ty * .21) % 1;
    const wx = gx2 + Math.round(Math.cos(k2 * 1.7 + t * 1.1) * (7 + ph * 6));
    const wy = gy2 - 6 - ph * 34;
    const s2 = 3 + Math.round((1 - Math.abs(ph - .5) * 2) * 4);
    E(wx, wy, s2, Math.max(1, s2 - 2), 'rgba(96,6,12,' + ((1 - ph) * .3).toFixed(2) + ')');
  }
  glowAt(gx2, gy2 - 30, 16, '255,40,30', .22 + Math.sin(t * 3.4 + a.tx) * .07);   // o olhar aceso por dentro
}
function drawActor(a){
  if (a.dead) return;
  if (a.isPlayer && a.invuln > .05 && a.mode !== 'dead' && ((a.invuln * 10) | 0) % 2) return; // pisca nos i-frames
  const p = a.pose;
  const vd = w2s(a.dir);                                      // direção como aparece na tela (mapa girado)
  const back = vd === 2 || vd === 3;
  const flip = vd === 1 || vd === 2;
  const [ldx, ldy] = DIRV[vd];
  const off = a.big2 ? .5 : 0;                                // gigante 2×2: âncora no centro dos 4 tiles
  const rk = a.recT > 0 ? (a.recT / .22) ** 1.7 : 0;          // o tranco desacelera até parar
  const gx2 = Math.round(gX(a.x + off, a.y + off) + (ldx - ldy) * p.lean * .5 + a.recX * rk);
  const gy2 = Math.round(gY(a.x + off, a.y + off) + (ldx + ldy) * p.lean * .25 + a.recY * rk);
  const sink = a.sink || 0;                                   // 0 = na superfície · 1 = enterrado
  const sa = a.big2 ? 30 : Math.max(6, 12 - p.air);           // sombra do herói bem mais amena: o rastro brilha
  if (sink < .9)
    E(gx2, gy2 + 1, sa, Math.max(3, Math.round(sa * pitch * .7)),
      a.isPlayer ? `rgba(4,5,10,${(.24 * (1 - sink)).toFixed(2)})` : 'rgba(4,5,10,.5)');
  if (sink > 0) drawMound(gx2, gy2 + 1, sink, a.t);           // a terra se levanta por onde ele passa
  if (a.hostile && current.cursed && !LOWFX) drawCurseAura(a, gx2, gy2);
  const maldito = a.hostile && current.cursed;
  const sd = SKINDRAW.find(k => a.skin[k[0]]);
  if (sd){
    if (a.flash > .075) FLASHW = '#fff6ee';                   // impacto: a silhueta inteira vira luz
    DARKW = maldito ? 1 : 0;                                  // maldito nasce preto: nada de repintar por cima
    g.save();
    if (sink > 0){                                            // ESCAVAÇÃO: o corpo some DENTRO da terra.
      g.beginPath(); g.rect(gx2 - 44, gy2 - 96, 88, 96); g.clip();   // (faltava aqui: só o rato afundava)
      g.translate(0, Math.round(sink * 50));
    }
    sd[1](a, gx2, gy2, p);
    g.restore();
    DARKW = 0; FLASHW = null;
    if (maldito && !LOWFX) drawCurseVeil(a, gx2, gy2);
    drawTags(a, gx2, gy2);
    return;
  }
  DARKW = maldito ? 1 : 0;
  drawRatSprite(back, p, a.skin, a.capePhase);
  DARKW = 0;
  if (a.spinAtk && a.mode === 'attack' && !LOWFX){            // ECO: cópias azuis atrasadas na órbita do giro
    const sq = Math.min(1, a.t / a.atkS), gh = ghostSprite('#2f6f9e');
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let s2 = 4; s2 >= 1; s2--){
      const an = spinTurn(Math.max(0, (sq - .1) / .6 - s2 * .05));
      const r = 16 - s2 * 1.6;                                // órbita aberta: lê-se o rodopio, não vira bola de luz
      g.globalAlpha = Math.max(0, .2 - s2 * .04) * (1 - sq * .55);
      g.drawImage(gh, Math.round(gx2 + Math.cos(an) * r) - 32,
        Math.round(gy2 - p.air + Math.sin(an) * r * pitch * .62) - 60);
    }
    g.restore();
  }
  g.save();
  if (sink > 0){                                              // recorta no nível do chão: o corpo some na terra
    g.beginPath(); g.rect(gx2 - 36, gy2 - 84, 72, 84); g.clip();
  }
  g.translate(gx2, gy2 - Math.round(p.air) + Math.round(sink * 50));
  if (flip) g.scale(-1, 1);
  g.drawImage(RS, -32, -60);
  g.restore();
  if (maldito && !LOWFX) drawCurseVeil(a, gx2, gy2);
  if (a.bruxa) drawWitchHat(gx2, gy2 - Math.round(p.air) - 40);   // a ratinha do laboratório usa chapéu
  if (a.isPlayer && suorT > 0) drawSuor(gx2, gy2 - Math.round(p.air));
  drawTags(a, gx2, gy2);
  if (a.hostile && !back){                                    // olhar vermelho incandescente
    const eyy = gy2 - Math.round(p.air) - 33;
    const xl = flip ? gx2 - 6 : gx2 - 3, xr = flip ? gx2 : gx2 + 3;
    glowAt(gx2, eyy + 1, 9, '255,70,50', .4);
    P(xl, eyy, 3, 2, '#e03830'); P(xr, eyy, 3, 2, '#e03830');
    P(xl + 1, eyy, 1, 1, '#ff9a80'); P(xr + 1, eyy, 1, 1, '#ff9a80');
    if (a.mode === 'hop' || current.cursed){                  // eco do olhar; no andar maldito o rastro é constante
      const nowMs = performance.now();
      if (nowMs - (a.eyeEchoAt || 0) > (current.cursed ? 70 : 90) && eyeEchoes.length < (current.cursed ? 18 : 10) && !LOWFX){
        a.eyeEchoAt = nowMs;                                  // teto: com muitos bichos isso virava dezenas de desfoques
        eyeEchoes.push({ x: gx2, y: eyy, flip, t: 0 });
      }
    }
  }
}

/* ---- gosma do arco-íris (corpo redondo multicolorido) ---- */
const SLIME_COLS = ['#e05a5a', '#e09a4a', '#e0d84a', '#5ac06a', '#4a9ae0', '#9a6ae0'];
const SLIME_RGB = ['224,90,90', '224,154,74', '224,216,74', '90,192,106', '74,154,224', '154,106,224'];
function drawBlob(a, gx2, gy2, p){
  const t = a.tailPhase;
  const k = 1 - p.crouch * .07 + p.stretch * .07;             // squash & stretch gosmento
  const rx = Math.round(15 / Math.max(.6, Math.sqrt(k))), ry = Math.round(12 * k);
  const yy = gy2 - ry + 1 - Math.round(p.air);
  const ci = (t * .8) | 0;
  const rgb = SLIME_RGB[ci % 6];
  glowAt(gx2, gy2, 24, rgb, .34 + Math.sin(t * 2) * .08);     // brilho suave refletindo a cor no tile
  E(gx2, yy, rx + 1, ry + 1, OUT);
  E(gx2, yy, rx, ry, SLIME_COLS[ci % 6]);                     // camadas de cor girando
  E(gx2, yy + Math.round(ry * .15), Math.round(rx * .8), Math.round(ry * .7), SLIME_COLS[(ci + 1) % 6]);
  E(gx2, yy + Math.round(ry * .35), Math.round(rx * .55), Math.round(ry * .45), SLIME_COLS[(ci + 2) % 6]);
  E(gx2 - Math.round(rx * .4), yy - Math.round(ry * .35), 4, 3, 'rgba(255,255,255,.5)');  // brilho úmido
  P(gx2 - 5, yy - 2, 3, 3, OUT); P(gx2 + 3, yy - 2, 3, 3, OUT);            // olhos
  P(gx2 - 4, yy - 1, 1, 1, '#fff'); P(gx2 + 4, yy - 1, 1, 1, '#fff');
  if (((t * 2) | 0) % 5 === 0) P(gx2 - rx + 3, yy + ry - 3, 2, 3, SLIME_COLS[ci % 6]);    // gota escorrendo
  if (p.flash > 0) E(gx2, yy, rx, ry, 'rgba(255,240,230,.75)');
}

/* ---- morcego flamejante (voa e queima) ---- */
function drawBat(a, gx2, gy2, p){
  const t = a.tailPhase;
  const hov = Math.round(Math.sin(t * 2.5) * 3) + 16;         // paira acima do chão
  const by = gy2 - hov - Math.round(p.air * .4);
  const flap = ((t * 6) | 0) % 2;
  glowAt(gx2, gy2, 20, '240,140,50', .32);                    // brilho do fogo refletindo no chão
  const wy = by - 4 + (flap ? 2 : -2);                        // asas batendo (com contorno uniforme)
  for (let w2 = 0; w2 < 8; w2++){
    const dy = flap ? (w2 >> 1) : -(w2 >> 1);
    P(gx2 - 8 - w2, wy + dy - 1, 3, 5 - (w2 > 5 ? 1 : 0), OUT);
    P(gx2 + 4 + w2, wy + dy - 1, 3, 5 - (w2 > 5 ? 1 : 0), OUT);
  }
  for (let w2 = 0; w2 < 8; w2++){
    const dy = flap ? (w2 >> 1) : -(w2 >> 1);
    P(gx2 - 7 - w2, wy + dy, 2, 3 - (w2 > 5 ? 1 : 0), '#2c2630');
    P(gx2 + 5 + w2, wy + dy, 2, 3 - (w2 > 5 ? 1 : 0), '#2c2630');
  }
  E(gx2, by, 6, 5, OUT); E(gx2, by, 5, 4, '#3a3040');         // corpo
  P(gx2 - 4, by - 7, 2, 3, '#3a3040'); P(gx2 + 2, by - 7, 2, 3, '#3a3040'); // orelhas
  P(gx2 - 3, by - 1, 2, 2, '#e05a3a'); P(gx2 + 1, by - 1, 2, 2, '#e05a3a'); // olhos em brasa
  const f = ((t * 8) | 0) % 3;                                // chamas em 3 quadros
  P(gx2 - 5, by - 9, 4, 5, '#c96a28');
  P(gx2 + 1, by - 10 + f, 4, 5, '#e8963c');
  P(gx2 - 2, by - 13 + (f === 2 ? 2 : 0), 3, 6, '#f2c14e');
  P(gx2 - 1, by - 7, 2, 2, '#faf0c8');
  if (p.flash > 0) E(gx2, by, 6, 5, 'rgba(255,240,230,.8)');
}

/* ---- Observador: olho flutuante magenta ---- */
function drawEye(a, gx2, gy2, p){
  const t = a.tailPhase;
  const hov = Math.round(Math.sin(t * 2) * 4) + 18;
  const by = gy2 - hov - Math.round(p.air * .3);
  const pu = .8 + Math.sin(t * 2.6) * .2;                     // aura roxa INTENSA, pulsando
  glowAt(gx2, by, 27, '198,82,224', .62 * pu);
  g.save();
  E(gx2, gy2 + 1, 11, 4, `rgba(200,80,220,${.2 * pu})`);      // a luz roxa banha o tile
  g.restore();
  for (let k2 = 0; k2 < 6; k2++)                              // nervo pendurado balançando
    P(gx2 + Math.round(Math.sin(t * 3 + k2 * .8) * 2), by + 8 + k2 * 2, 1, 2, k2 % 2 ? '#c97b8e' : '#a85a70');
  E(gx2, by, 9, 8, OUT);
  E(gx2, by, 8, 7, '#ece8e0');                                // esclera
  P(gx2 - 6, by - 2, 2, 1, '#c94a5a'); P(gx2 + 4, by + 3, 3, 1, '#c94a5a');  // veias
  const [ddx, ddy] = DIRV[a.dir];
  const ix = gx2 + (ddx - ddy) * 2, iy = by + (ddx + ddy);    // íris olha pra onde vai
  E(ix, iy, 4, 4, '#c94ae0');
  E(ix, iy, 2, 2, '#14151a');
  P(ix - 1, iy - 2, 2, 1, '#fff');
  if (p.blink) E(gx2, by - 3, 8, 4, '#b8a894');               // pálpebra
  if (p.flash > 0) E(gx2, by, 8, 7, 'rgba(255,240,230,.8)');
}
/* ---- bloco de gelo sobre inimigo congelado pela Nova ---- */
function drawFrozen(a){
  const o = a.big2 ? .5 : 0;
  const x = gX(a.x + o, a.y + o), y = gY(a.x + o, a.y + o) - (a.big2 ? 26 : 16);
  g.save();
  g.globalAlpha = .5;
  E(x, y, 15, 21, '#7ab8e0');
  E(x - 2, y - 2, 12, 17, '#a8d8f0');
  g.globalAlpha = .8;
  P(x - 6, y - 10, 2, 5, '#e8f8ff'); P(x + 4, y + 2, 2, 3, '#e8f8ff');   // brilhos do cristal
  g.restore();
}
/* ---- Cubo Vivo: gelo ambulante com um peixe preso dentro ---- */
function drawCube(a, gx2, gy2, p){
  const t = a.tailPhase;
  const k = 1 - p.crouch * .06 + p.stretch * .06;
  const by = gy2 - Math.round(p.air);
  const H = Math.max(12, Math.round(28 * k)), W = Math.round(25 / Math.max(.75, k));
  const topo = by - H;
  glowAt(gx2, by - Math.round(H * .5), 21, '120,200,240', .3);
  // PERFIL: lado reto no miolo e ARCO DE CÍRCULO exato nas quatro quinas — a escada é a mesma
  // nas quatro e o bloco fica uniforme. Lascas saindo do flanco quebravam justo essa uniformidade,
  // então saíram: o "duro" agora vem do lado reto e da quina viva, não de apêndice.
  const R = Math.max(3, Math.round(H * .24));
  const hws = [];
  for (let i = 0; i < H; i++){
    const d2 = i < R ? R - i : (i >= H - R ? i - (H - 1 - R) : 0);
    const corte = d2 > 0 ? Math.round(R - Math.sqrt(Math.max(0, R * R - d2 * d2))) : 0;
    hws.push(Math.max(2, (W >> 1) - corte));
  }
  hws.forEach((w2, i) => P(gx2 - w2 - 1, topo + i - 1, w2 * 2 + 2, 3, OUT));
  hws.forEach((w2, i) => {                                    // gelo translúcido: o chão aparece por dentro
    const q = i / (H - 1);
    P(gx2 - w2, topo + i, w2 * 2, 1,
      q < .14 ? 'rgba(226,246,255,.9)' : q < .46 ? 'rgba(154,214,242,.86)'
      : q < .8 ? 'rgba(112,182,220,.86)' : 'rgba(62,118,158,.9)');
  });
  hws.forEach((w2, i) => {                                    // ARESTAS: fio de luz à esquerda, sombra à direita
    if (i < 1 || i > H - 2) return;
    P(gx2 - w2, topo + i, 1, 1, i < H * .62 ? 'rgba(232,250,255,.6)' : 'rgba(150,206,238,.5)');
    P(gx2 + w2 - 1, topo + i, 1, 1, 'rgba(44,92,128,.55)');
  });
  P(gx2 - hws[2] + 2, topo + 1, hws[2] * 2 - 4, 2, 'rgba(244,253,255,.85)');   // face de cima polida
  for (let j2 = 0; j2 < 5; j2++){                             // duas trincas curtas, longe da cara
    P(gx2 + 4 + j2, topo + Math.round(H * .2) + j2, 1, 1, 'rgba(232,250,255,.5)');
    if (j2 < 4) P(gx2 - 9 + j2, topo + Math.round(H * .76) - j2, 1, 1, 'rgba(232,250,255,.4)');
  }
  P(gx2 - hws[4] + 2, topo + 4, 2, Math.round(H * .42), 'rgba(240,252,255,.7)');   // reflexo vítreo comprido
  const oy = topo + Math.round(H * .36);                      // olhinhos congelados na superfície
  P(gx2 - 6, oy, 4, 5, OUT); P(gx2 + 2, oy, 4, 5, OUT);
  P(gx2 - 5, oy + 1, 2, 3, '#14151a'); P(gx2 + 3, oy + 1, 2, 3, '#14151a');
  P(gx2 - 5, oy + 1, 1, 1, '#c8f2ff'); P(gx2 + 3, oy + 1, 1, 1, '#c8f2ff');
  P(gx2 - 2, topo + Math.round(H * .53), 4, 1, 'rgba(30,62,90,.85)');            // boquinha gelada
  P(gx2 - 3, topo + Math.round(H * .53) - 1, 1, 1, 'rgba(30,62,90,.85)');
  P(gx2 + 2, topo + Math.round(H * .53) - 1, 1, 1, 'rgba(30,62,90,.85)');
  if (p.flash > 0) hws.forEach((w2, i) => P(gx2 - w2, topo + i, w2 * 2, 1, 'rgba(255,240,230,.7)'));
}
/* ---- Mariposa Boreal: asas pálidas com flocos de neve ---- */
function drawMoth(a, gx2, gy2, p){
  const t = a.tailPhase;
  const hov = Math.round(Math.sin(t * 2.2) * 3) + 16;
  const by = gy2 - hov - Math.round(p.air * .4);
  const flap = ((t * 5) | 0) % 2;
  glowAt(gx2, by, 19, '150,220,250', .3);
  for (let s2 = 0; s2 < 2; s2++){                             // pó gelado caindo das asas
    const sx = gx2 + Math.round(Math.sin(t * 1.6 + s2 * 3) * 9);
    P(sx, by + 6 + ((t * 8 + s2 * 5) % 10 | 0), 1, 1, 'rgba(200,240,255,.6)');
  }
  const wy = flap ? -2 : 1;
  E(gx2 - 8, by + wy, 8, 5, OUT); E(gx2 + 8, by + wy, 8, 5, OUT);          // asas
  E(gx2 - 8, by + wy, 7, 4, '#dceef8'); E(gx2 + 8, by + wy, 7, 4, '#dceef8');
  E(gx2 - 9, by + wy - 1, 4, 2, '#ffffff'); E(gx2 + 7, by + wy - 1, 4, 2, '#ffffff');
  P(gx2 - 9, by + wy, 2, 2, '#8ac4e8'); P(gx2 + 7, by + wy, 2, 2, '#8ac4e8');       // marcas de floco
  P(gx2 - 5, by + wy + 1, 1, 1, '#8ac4e8'); P(gx2 + 4, by + wy + 1, 1, 1, '#8ac4e8');
  P(gx2 - 2, by - 4, 4, 9, OUT);                              // corpo felpudo
  P(gx2 - 1, by - 3, 2, 7, '#b8ccd8');
  P(gx2 - 1, by - 3, 2, 2, '#e8f4fa');
  P(gx2 - 2, by - 6, 1, 3, '#b8ccd8'); P(gx2 + 1, by - 6, 1, 3, '#b8ccd8');         // antenas
  P(gx2 - 1, by - 2, 1, 1, '#2a6a8e'); P(gx2, by - 2, 1, 1, '#2a6a8e');             // olhos
  if (p.flash > 0) E(gx2, by, 9, 6, 'rgba(255,240,230,.75)');
}
/* ---- Yeti: peludo, troncudo; o Ancião (big) é o chefe do nv 20 ---- */
function drawYeti(a, gx2, gy2, p){
  const big = a.skin.big ? 2.2 : 1;
  const k = 1 - p.crouch * .05 + p.stretch * .05;
  const by = gy2 - Math.round(p.air);
  const t = a.tailPhase;
  const H = Math.max(14, Math.round(40 * big * k)), W = Math.round(30 * big / Math.max(.85, k));
  const R = n => Math.max(1, Math.round(n * big));
  const topo = by - H;
  const FUR = '#eef4f8', FUR2 = '#ffffff', FURD = '#c6d6de', FURDD = '#9db4c2';
  const GELO = '#8ac4e8', PELE = '#4e6c84', PELE2 = '#5f8098';
  if (a.skin.big) glowAt(gx2, by - Math.round(H * .5), Math.round(38 * big), '140,210,245', .3);
  const sway = Math.round(Math.sin(t * 1.5) * big);
  // ---- SILHUETA: cabeça e tronco num bicho só, feito gorila. Retângulo com dois pauzinhos de
  // braço não lia como bicho; o que faz o yeti é a massa em pera E o pelo espetado na borda.
  const PERF = [[0, .26], [.06, .40], [.15, .47], [.26, .47], [.34, .40], [.46, .50], [.64, .55], [.80, .53], [.92, .47], [1, .40]];
  const hw = u => {
    for (let i = 1; i < PERF.length; i++)
      if (u <= PERF[i][0]){
        const [u0, f0] = PERF[i - 1], [u1, f1] = PERF[i];
        return (f0 + (f1 - f0) * (u - u0) / (u1 - u0)) * W;
      }
    return PERF[PERF.length - 1][1] * W;
  };
  const hws = [];
  for (let i = 0; i < H; i++){
    const u = i / (H - 1);
    // tufo: o contorno ganha uns pixels a mais em linhas sorteadas — é o pelo espetado
    const tufo = hash(i * 3, 61) > .62 ? R(1.6) : 0;
    hws.push(Math.max(2, Math.round(hw(u)) + tufo));
  }
  // ---- BRAÇOS grossos, por trás do corpo, com garras de gelo ----
  const braco = (sx, dy) => {
    const bx = gx2 + sx * Math.round(W * .44), y0 = topo + Math.round(H * .3) + dy;
    const alt = Math.round(H * .58), w2 = R(9);
    for (let i = 0; i < alt; i++){
      const bulge = Math.round(Math.sin(i / alt * Math.PI) * R(1.6));
      P(bx - (w2 >> 1) - bulge - 1, y0 + i - 1, w2 + bulge * 2 + 2, 3, OUT);
    }
    for (let i = 0; i < alt; i++){
      const bulge = Math.round(Math.sin(i / alt * Math.PI) * R(1.6));
      P(bx - (w2 >> 1) - bulge, y0 + i, w2 + bulge * 2, 1, sx < 0 ? FUR : FURD);
      P(bx - (w2 >> 1) - bulge, y0 + i, 2, 1, sx < 0 ? FUR2 : FUR);
    }
    for (let c = 0; c < 3; c++)                               // garras cravadas no chão
      P(bx - (w2 >> 1) + 1 + c * R(3), y0 + alt - 1, R(1.6), R(4), c % 2 ? GELO : '#bfe4f8');
  };
  braco(-1, sway); braco(1, -sway);
  hws.forEach((w2, i) => P(gx2 - w2 - 1, topo + i - 1, w2 * 2 + 2, 3, OUT));
  hws.forEach((w2, i) => {
    const u = i / (H - 1);
    P(gx2 - w2, topo + i, w2 * 2, 1, u < .1 ? FUR2 : u > .86 ? FURDD : FUR);
    P(gx2 + w2 - 3, topo + i, 3, 1, u > .3 ? FURD : FUR);     // flanco direito na sombra
  });
  // ---- barrigão de gelo ----
  const byy = topo + Math.round(H * .68);
  E(gx2, byy, Math.round(W * .34), Math.round(H * .17), '#cfe4ee');
  E(gx2, byy, Math.round(W * .24), Math.round(H * .12), '#b0cede');
  E(gx2 - Math.round(W * .12), byy - Math.round(H * .05), R(3), R(2), 'rgba(255,255,255,.5)');
  // ---- CARA afundada: placa de pele azulada com sobrancelhão de pelo caído ----
  // a placa da cara é ALTA: baixa demais ela vira viseira de robô, com dois faróis dentro
  const fw = Math.round(W * .3), fy = topo + Math.round(H * .15), fh = Math.round(H * .28);
  P(gx2 - fw + 1, fy - 1, fw * 2 - 2, fh + 2, OUT);           // quinas chanfradas: cara, não caixa
  P(gx2 - fw - 1, fy + 1, fw * 2 + 2, fh - 2, OUT);
  P(gx2 - fw, fy + 1, fw * 2, fh - 2, PELE);
  P(gx2 - fw + 1, fy, fw * 2 - 2, fh, PELE);
  P(gx2 - fw + 1, fy, fw * 2 - 2, Math.max(1, R(2)), PELE2);
  P(gx2 - fw - 2, fy - R(4), fw * 2 + 4, R(4), FUR);          // sobrancelhão POR CIMA, sem comer a cara
  P(gx2 - fw - 2, fy - R(4), fw * 2 + 4, R(1.4), FUR2);
  P(gx2 - fw - 2, fy - R(.6), fw * 2 + 4, 1, FURDD);
  const ec = a.skin.big ? '#ff6a5a' : '#9adcf8';              // o olhar do Ancião é rubro
  for (const sx of [-1, 1]){
    const ex = gx2 + sx * R(4) - (sx < 0 ? R(3.4) : 0);
    P(ex, fy + R(2.4), R(3.4), R(3), '#0d141c');
    P(ex + (sx < 0 ? R(.4) : R(1)), fy + R(3), R(2), R(1.8), ec);
    P(ex + (sx < 0 ? R(.4) : R(1)), fy + R(3), R(1), R(1), '#ffffff');
  }
  glowAt(gx2, fy + R(3.4), Math.round(15 * big), a.skin.big ? '255,90,70' : '150,220,250', .3);
  const my = fy + R(7);                                       // FOCINHO claro: é o que separa cara de viseira
  P(gx2 - R(4.4) - 1, my - 1, R(8.8) + 2, R(5.4) + 2, OUT);
  P(gx2 - R(4.4), my, R(8.8), R(5.4), '#6b8a9e');
  P(gx2 - R(4.4), my, R(8.8), R(1.4), '#86a2b4');
  P(gx2 - R(1.6), my + R(.6), R(3.2), R(2), '#2b3d4c');       // narigão achatado
  P(gx2 - R(3.4), my + R(3.4), R(6.8), R(2), '#16212b');      // bocarra
  for (const sx of [-1, 1]){                                  // presas pra CIMA
    P(gx2 + sx * R(2.6) - (sx < 0 ? R(2) : 0), my + R(2), R(2), R(3.4), '#f2f8fc');
    P(gx2 + sx * R(2.6) - (sx < 0 ? R(2) : 0), my + R(2), R(2), 1, '#ffffff');
  }
  // ---- pés ----
  for (const sx of [-1, 1]){
    const px2 = gx2 + sx * Math.round(W * .26);
    P(px2 - R(5), by - R(4) - 1, R(10) + 2, R(5) + 2, OUT);
    P(px2 - R(4.5), by - R(4), R(9), R(4), sx < 0 ? FUR : FURD);
    for (let c = 0; c < 3; c++) P(px2 - R(3.4) + c * R(2.6), by - R(1.4), R(1.4), R(2), GELO);
  }
  if (a.skin.big){                                            // coroa de estalactites do Ancião
    for (let i2 = -2; i2 <= 2; i2++)
      P(gx2 + i2 * R(6) - R(1.4), topo - R(5) - (i2 % 2 === 0 ? R(3) : 0), R(3), R(7), i2 % 2 === 0 ? '#bfe4f8' : GELO);
    P(gx2 - R(13), topo - R(5), R(26), R(2), GELO);
  } else {
    P(gx2 - 3, topo - 3, 3, 4, FURD); P(gx2 + 1, topo - 4, 3, 5, FUR);   // topetinho arrepiado
  }
  if (((t * 1.4) | 0) % 4 === 0 && !LOWFX)                    // bafo gelado saindo da bocarra
    for (let i2 = 0; i2 < 3; i2++)
      P(gx2 + R(4) + i2 * R(3), fy + R(10) + ((t * 6 + i2 * 3) % 5 | 0) - 2, R(2), R(2), 'rgba(200,240,255,.4)');
  if (p.flash > 0) hws.forEach((w2, i) => P(gx2 - w2, topo + i, w2 * 2, 1, 'rgba(255,240,230,.75)'));
}
function drawToad(a, gx2, gy2, p){
  const big = a.skin.big ? 2.4 : 1;
  const k = 1 - p.crouch * .08 + p.stretch * .08;
  const by = gy2 - Math.round(p.air);
  const rx = Math.round(12 * big / Math.max(.8, k)), ry = Math.round(9 * big * k);
  const t = a.tailPhase;
  if (a.skin.big) glowAt(gx2, by - ry, 26, '130,210,90', .32);
  E(gx2 - rx + 2, by - 1, 4, 2, '#2a4a20'); E(gx2 + rx - 2, by - 1, 4, 2, '#2a4a20');  // patas
  E(gx2, by - ry, rx + 1, ry + 1, OUT);                       // corpanzil
  E(gx2, by - ry, rx, ry, '#4a7a34');
  E(gx2, by - ry + 2, Math.round(rx * .8), Math.round(ry * .6), '#5c9440');
  E(gx2, by - 3, Math.round(rx * .7), 3, '#6aa04a');          // papada
  const sac = 1 + Math.sin(t * 2.4) * .5;                     // papo inflando
  E(gx2, by - 2, Math.round(5 * big * sac), Math.round(3 * sac), '#94c070');
  P(gx2 - rx + 3, by - ry - 1, 2, 2, '#3a5c2a'); P(gx2 + 4, by - ry + 3, 2, 2, '#3a5c2a');  // verrugas
  P(gx2 - 2, by - ry + 5, 2, 1, '#3a5c2a');
  const ey = by - ry * 2 + 2;                                 // olhos saltados no topo
  E(gx2 - Math.round(5 * big), ey, 3, 3, OUT); E(gx2 + Math.round(5 * big), ey, 3, 3, OUT);
  E(gx2 - Math.round(5 * big), ey, 2, 2, '#d8c840'); E(gx2 + Math.round(5 * big), ey, 2, 2, '#d8c840');
  P(gx2 - Math.round(5 * big), ey, 1, 2, '#14151a'); P(gx2 + Math.round(5 * big), ey, 1, 2, '#14151a');
  P(gx2 - Math.round(rx * .5), by - ry - 1, Math.round(rx), 1, '#2a4a20');   // boca fechada
  if (a.skin.big){                                            // coroa do Sapo Real
    P(gx2 - 5, ey - 7, 10, 3, GOLD);
    P(gx2 - 5, ey - 10, 2, 3, '#e0bc50'); P(gx2 - 1, ey - 11, 2, 4, '#e0bc50'); P(gx2 + 3, ey - 10, 2, 3, '#e0bc50');
  }
  if (p.flash > 0) E(gx2, by - ry, rx, ry, 'rgba(255,240,230,.75)');
}

/* ---- SAPO AVENTUREIRO: o JOGADOR 2 ----
   Nada a ver com o Sapo do Lodo (aquele é um bolo agachado e hostil). Esse anda EM PÉ, usa
   bandana vermelha pra ninguém confundir com bicho, e bate de LÍNGUA — que é o gesto do sapo
   e não repete a lâmina do rato. Como não passa pelo RS, a virada é feita na mão com `sgn`.  */
function drawFrog(a, gx2, gy2, p){
  const vd = w2s(a.dir), sgn = (vd === 1 || vd === 2) ? -1 : 1, costas = vd >= 2;
  const by = gy2 - Math.round(p.air);
  const abaixado = a.mode === 'dead';
  const k = (1 - p.crouch * .07 + p.stretch * .07) * (abaixado ? .5 : 1);   // caído: espalha no chão
  const Y = yy => by + Math.round(yy * k);
  // A COR DO SAPO sai do mesmo template de capa, mas da ESCOLHA DELE — o guarda-roupa é separado.
  const fem = !!a.skin.sapinha;                               // a sapinha: verde-menta, laço, cílios e avental
  const CP = fem ? ['#7fd39a', '#5aa874', '#3f7d55'] : corSapo();
  const VD = CP[0], VD2 = shade(CP[0], 26), TOP = shade(CP[0], 60), ESC = CP[2];
  const BAR = shade(CP[0], 104), MAN = CP[1], VM = '#c9382f', VM2 = '#ef6a58';
  const PE = '#f2c14e', PE2 = '#ffe08a', PED = '#b8862a';     // pés amarelos de sapo
  const wx2 = (p.crouch >= 2 ? 1 : (p.stretch >= 2 ? -1 : 0)) + (abaixado ? 2 : 0);

  const perna = sx => {                                       // coxa aberta pro lado + PÉ AMARELO palmado
    P(gx2 + sx * 8 - 4, Y(-11) - 1, 9, 11, OUT);
    P(gx2 + sx * 8 - 3, Y(-10), 7, 9, VD);
    P(gx2 + sx * 8 - 3, Y(-10), 7, 2, VD2);
    P(gx2 + sx * 7 - 5, Y(-2) - 1, 11, 6, OUT);
    P(gx2 + sx * 7 - 4, Y(-2), 9, 4, PE);
    P(gx2 + sx * 7 - 4, Y(-2), 9, 1, PE2);
    P(gx2 + sx * 7 - 4, Y(1), 9, 1, PED);
    for (let i = -1; i <= 1; i++) P(gx2 + sx * 7 + i * 3 - 1, Y(-3), 2, 2, PED);   // dedinhos
  };
  perna(-1); perna(1);

  const CORPO = [                                             // tronco em pêra e a cabeça saindo dele, sem pescoço
    [-4, 6], [-6, 8], [-8, 9], [-10, 9], [-12, 8], [-14, 7], [-16, 7], [-18, 7],
    [-20, 8], [-22, 9], [-24, 9], [-26, 9], [-28, 8], [-30, 6],
  ];
  CORPO.forEach(([yy, hw]) => P(gx2 - hw - 1 - wx2, Y(yy) - 1, (hw + 1 + wx2) * 2, 4, OUT));
  for (let i = CORPO.length - 1; i >= 0; i--){
    const [yy, hw] = CORPO[i];
    P(gx2 - hw - wx2, Y(yy), (hw + wx2) * 2, 2, i > 10 ? TOP : VD);
    P(gx2 - hw - wx2, Y(yy), 2, 2, ESC);
    P(gx2 + hw + wx2 - 2, Y(yy), 2, 2, VD2);
  }
  [[-26, -6], [-22, 4], [-12, -7], [-8, 6]].forEach(([yy, xx]) => P(gx2 + xx, Y(yy), 3, 2, MAN));

  if (!costas)                                                // barriga clara só de frente
    [[-6, 4], [-8, 5], [-10, 5], [-12, 5], [-14, 4], [-16, 4], [-18, 4]]
      .forEach(([yy, hw]) => P(gx2 - hw, Y(yy), hw * 2, 2, BAR));

  if (fem){                                                   // AVENTAL branquinho com barra rosa, igual ao da ratinha
    if (!costas){
      [[-19, 5], [-17, 6], [-15, 6], [-13, 7], [-11, 7], [-9, 7], [-7, 6]].forEach(([yy, hw]) => {
        P(gx2 - hw - 1, Y(yy) - 1, hw * 2 + 2, 3, OUT);
      });
      [[-19, 5], [-17, 6], [-15, 6], [-13, 7], [-11, 7], [-9, 7], [-7, 6]].forEach(([yy, hw], i) =>
        P(gx2 - hw, Y(yy), hw * 2, 2, i > 4 ? '#ff9ab0' : '#f6f2ea'));
      P(gx2 - 2, Y(-14), 2, 2, '#ff7aa8'); P(gx2 + 1, Y(-14), 2, 2, '#ff7aa8'); P(gx2 - 1, Y(-12), 3, 1, '#ff7aa8');   // bolsinho de coração
    }
    P(gx2 - 9, Y(-21) - 1, 18, 3, OUT); P(gx2 - 8, Y(-21), 16, 1, '#ff9ab0');   // a fita do avental na cintura
  } else {
  P(gx2 - 10, Y(-21) - 1, 20, 5, OUT);                        // BANDANA: a marca do jogador 2
  P(gx2 - 9, Y(-21), 18, 3, VM);
  P(gx2 - 9, Y(-21), 18, 1, VM2);
  const flut = Math.round(Math.sin(a.tailPhase * 2.2) * 2);
  P(gx2 - sgn * 13 - 2, Y(-20) + flut - 1, 8, 4, OUT);        // as pontas do nó voam atrás
  P(gx2 - sgn * 13 - 1, Y(-20) + flut, 6, 2, VM);
  P(gx2 - sgn * 17 - 1, Y(-18) + flut, 5, 2, VM2);
  }

  const olho = ox => {                                        // olhões saltados no alto da cabeça
    const ex = gx2 + ox, ey = Y(-38);
    const CUP = [[0, 2], [1, 3], [2, 3], [3, 4], [4, 4], [5, 4], [6, 3], [7, 3]];   // cúpula redondinha
    CUP.forEach(([dy, hw]) => P(ex - hw - 1, ey + dy - 1, hw * 2 + 2, 3, OUT));
    CUP.forEach(([dy, hw], i) => P(ex - hw, ey + dy, hw * 2, 1, i < 2 ? TOP : VD2));
    if (costas) return;
    if (abaixado){ P(ex - 3, ey + 4, 6, 2, '#14151a'); return; }   // desmaiado: olho fechado
    // OLHO: branco grande, pupila cheia e uma PÁLPEBRA pesada por cima — a cara de entediado
    // continua, mas agora o olho tem brilho e contorno em vez de ser um risco dourado.
    P(ex - 4, ey + 2, 8, 6, OUT);
    P(ex - 3, ey + 3, 6, 4, '#fbf6e8');
    P(ex - 3, ey + 3, 6, 1, '#d8cfae');                      // sombra da pálpebra no branco
    const px3 = ex + (sgn > 0 ? 0 : -2);
    P(px3, ey + 3, 3, 4, '#241d24');                          // pupila cheia
    P(px3, ey + 3, 3, 1, '#4a3a52');
    P(px3 + (sgn > 0 ? 0 : 1), ey + 4, 1, 1, '#ffffff');      // brilho
    if (fem){                                                 // olho aberto e CÍLIOS no canto de fora
      const fx = ox > 0 ? ex + 3 : ex - 5;
      P(fx, ey + 1, 2, 1, OUT); P(ox > 0 ? fx + 2 : fx - 1, ey, 1, 1, OUT);
      return;
    }
    P(ex - 4, ey + 1, 8, 2, VD2);                             // pálpebra caída: o entediado mora aqui
    P(ex - 4, ey + 2, 8, 1, ESC);
  };
  olho(-5); olho(5);

  if (!costas && fem){                                        // sorrisinho e bochechas rosadas
    P(gx2 - 3, Y(-25), 6, 1, '#1e3c18'); P(gx2 - 4, Y(-26), 1, 1, '#1e3c18'); P(gx2 + 3, Y(-26), 1, 1, '#1e3c18');
    P(gx2 - 10, Y(-28), 3, 2, '#f58cae'); P(gx2 + 7, Y(-28), 3, 2, '#f58cae');
    P(gx2 - 4, Y(-29), 1, 1, ESC); P(gx2 + 3, Y(-29), 1, 1, ESC);
  } else if (!costas){
    P(gx2 - 8, Y(-26) - 1, 16, 4, OUT);                       // bocarra de sapo, de orelha a orelha
    P(gx2 - 7, Y(-26), 14, 2, '#1e3c18');
    P(gx2 - 7, Y(-24), 14, 1, VD2);                           // beiço de baixo pegando luz
    P(gx2 - 4, Y(-29), 2, 2, ESC); P(gx2 + 3, Y(-29), 2, 2, ESC);   // narinas
  }

  // A LÍNGUA: o golpe do sapo. Estica no bote e recolhe no acompanhamento.
  const armP = p.armP === undefined ? -1 : p.armP;
  if (armP >= .42 && !costas){
    // slow in / slow out: a língua ESTOURA pra fora e volta freando, em vez de ir e vir reto
    const u2 = armP < .72 ? (armP - .42) / .3 : 1 - (armP - .72) / .28;
    const L = Math.max(0, (armP < .72 ? 1 - (1 - u2) ** 3 : u2 * u2) * 30);
    const bx = gx2 + sgn * 8, byy = Y(-25), tip = Math.round(L);
    for (let i = 0; i < tip; i++)
      P(bx + sgn * i - 1, byy - 1 + Math.round(Math.sin(i * .25) * 1.6), 3, 4, OUT);
    for (let i = 0; i < tip; i++)
      P(bx + sgn * i, byy + Math.round(Math.sin(i * .25) * 1.6), 2, 2, i % 4 === 0 ? '#f08aa8' : '#d9628a');
    if (tip > 2){
      const ty = byy + Math.round(Math.sin(tip * .25) * 1.6);
      P(bx + sgn * tip - 3, ty - 3, 7, 7, OUT);
      P(bx + sgn * tip - 2, ty - 2, 5, 5, '#f08aa8');
      P(bx + sgn * tip - 1, ty - 1, 2, 2, '#ffc0d0');
    }
  }
  { const qf = (x2, y2, w2, h2, c) =>                          // pincel do sapo no mundo: o mesmo guarda-roupa serve
      P(gx2 + Math.round(x2), Math.round(y2), Math.round(w2), Math.round(h2), c);
    if (fem){                                                 // LAÇO rosa no alto da cabeça, entre os olhões
      const ly = Y(-44), bal = Math.round(Math.sin(a.tailPhase * 1.6) * .6);
      qf(-8, ly - 3 + bal, 7, 7, OUT); qf(1, ly - 3 - bal, 7, 7, OUT);
      qf(-7, ly - 2 + bal, 5, 5, '#ff7aa8'); qf(2, ly - 2 - bal, 5, 5, '#ff7aa8');
      qf(-7, ly - 2 + bal, 5, 1, '#ffb0cc'); qf(2, ly - 2 - bal, 5, 1, '#ffb0cc');
      qf(-2, ly - 2, 4, 5, OUT); qf(-1, ly - 1, 2, 3, '#e0527a');
    } else {
    if (outfit2.fant && outfit2.fant !== 'none')
      drawFantasia(qf, outfit2.fant, Y, 0, costas, outfit2.fantHue, a.tailPhase);
    drawChapeu(qf, outfit2, Y(-41), Y(-47)); } }
  if (abaixado) glowAt(gx2, Y(-14), 16, '240,90,90', .22);     // caído: pisca pedindo socorro
}
/* ---- Sanguessuga Real: segmentada, ondula rente ao chão ---- */
function drawLeech(a, gx2, gy2, p){
  const t = a.tailPhase;
  const by = gy2 - Math.round(p.air * .5);
  for (let i = 6; i >= 0; i--){                               // segmentos ondulando
    const sx = gx2 - 9 + i * 3;
    const sy = by - 4 - Math.round(Math.sin(t * 3 + i * .8) * 2) - Math.round(i * .4);
    const r = 4 - Math.round(i * .35);
    E(sx, sy, r + 1, r, OUT);
    E(sx, sy, r, r - 1, i % 2 ? '#6a2e3a' : '#7a3a44');
    P(sx - 1, sy - r + 1, 2, 1, '#a85a64');                   // lombo úmido
  }
  const hx = gx2 + 11, hy = by - 5 - Math.round(Math.sin(t * 3 + 7 * .8) * 2);
  E(hx, hy, 4, 4, OUT); E(hx, hy, 3, 3, '#8a3e4a');           // cabeça-ventosa
  E(hx + 2, hy, 2, 2, '#c86a7a');                             // boca circular
  P(hx + 2, hy, 1, 1, '#14151a');
  P(hx - 1, hy - 3, 1, 1, '#e0a0a8'); P(hx + 1, hy - 3, 1, 1, '#e0a0a8');
  if (p.flash > 0) E(gx2, by - 5, 12, 5, 'rgba(255,240,230,.7)');
}
/* ---- Mosquito do Pântano: zunindo com ferrão em riste ---- */
function drawMosq(a, gx2, gy2, p){
  const t = a.tailPhase;
  const hov = Math.round(Math.sin(t * 4) * 4) + 18;
  const by = gy2 - hov - Math.round(p.air * .4);
  glowAt(gx2, by, 13, '150,220,110', .22);
  const wf = ((t * 14) | 0) % 2;                              // asas em zumbido frenético
  E(gx2 - 5, by - 4 + (wf ? -1 : 1), 5, 2, 'rgba(220,235,220,.5)');
  E(gx2 + 5, by - 4 + (wf ? 1 : -1), 5, 2, 'rgba(220,235,220,.5)');
  E(gx2, by, 4, 3, OUT);                                      // tórax
  E(gx2, by, 3, 2, '#5c6a3a');
  E(gx2 - 4, by + 1, 4, 3, OUT);                              // abdômen caído (contornado)
  E(gx2 - 4, by + 1, 3, 2, '#4a5830');
  P(gx2 + 2, by - 2, 2, 2, '#8a1e28');                        // olhão vermelho
  P(gx2 + 4, by, 5, 1, '#c9d2dc');                            // ferrão-agulha
  for (let l2 = 0; l2 < 3; l2++)                              // perninhas penduradas
    P(gx2 - 2 + l2 * 2, by + 2, 1, 2 + (l2 % 2), '#2e3820');
  if (p.flash > 0) E(gx2, by, 5, 3, 'rgba(255,240,230,.8)');
}
/* ---- GOSMA-PLANTA: a gosma do arco-íris que criou raiz. Mesmo corpo elástico, mas
   coberto de musgo, com uma folha na cabeça e três espinhos na lombada. ---- */
/* ---- PLAGUE DOCTOR: alquimista de máscara de bico, chapéu de aba larga e bomba na mão ---- */
/* ---- NÓ DE RATOS (rat king): a versão v0.29, baixinha (~30x24) e fofinha — o Marcos pediu ela de volta
   (2026-09-18). Quatro ratinhos em roda com as caudas subindo pra um nó, olhos em brasa e a coroa
   torta do velho Rei Rato. Morre de vez: NÃO se desfaz em ratos soltos (o `split` ficou no passado). ---- */
function drawRatKing(a, gx2, gy2, p){
  const t = a.tailPhase;
  const by = gy2 - Math.round(p.air);
  glowAt(gx2, by - 12, 22, '224,90,90', .2);
  for (let i = 0; i < 7; i++){                                // nó central de caudas se retorcendo
    const an = t * .8 + i * .9;
    P(gx2 + Math.round(Math.cos(an) * 4) - 1, by - 16 + Math.round(Math.sin(an) * 2), 2, 2, i % 2 ? '#584b46' : '#42362f');
  }
  const bodies = [[-9, 1, 0], [9, 1, 1], [0, -3, 2], [-3, 5, 3]];   // [dx, dy, fase]
  bodies.forEach(([bx2, byo, ph], bi) => {
    const bob = Math.round(Math.sin(t * 2.2 + ph * 1.7) * 1.5);
    const cx2 = gx2 + bx2, cy2 = by + byo + bob;
    for (let k2 = 1; k2 < 5; k2++)                            // cauda de cada um subindo pro nó
      P(cx2 + Math.round((gx2 - cx2) * k2 / 5), cy2 - 9 - k2 + Math.round(Math.sin(t * 3 + k2 + ph)), 1, 2, '#584b46');
    E(cx2, cy2 - 5, 7, 6, OUT);
    E(cx2, cy2 - 6, 6, 5, bi % 2 ? '#6a5f52' : '#5a5046');    // corpo corcunda
    E(cx2, cy2 - 6, 3, 3, bi % 2 ? '#867a6a' : '#6e6355');    // lombo
    E(cx2, cy2 - 11, 4, 3, bi % 2 ? '#6a5f52' : '#5a5046');   // cabeça
    P(cx2 - 4, cy2 - 15, 3, 3, OUT); P(cx2 + 1, cy2 - 15, 3, 3, OUT);   // orelhas
    P(cx2 - 3, cy2 - 14, 2, 2, '#48413a'); P(cx2 + 2, cy2 - 14, 2, 2, '#48413a');
    P(cx2 - 2, cy2 - 11, 2, 1, '#e03830'); P(cx2 + 1, cy2 - 11, 2, 1, '#e03830'); // olhos em brasa
    P(cx2 - 1, cy2 - 9, 2, 1, '#6e4a44');                     // focinho
  });
  const bobC = Math.round(Math.sin(t * 2.2 + 2 * 1.7) * 1.5); // a coroa torta herdada do velho rei
  P(gx2 - 3, by - 19 + bobC, 6, 2, GOLD);
  P(gx2 - 3, by - 21 + bobC, 1, 2, '#e0bc50'); P(gx2, by - 22 + bobC, 1, 3, '#e0bc50'); P(gx2 + 2, by - 21 + bobC, 1, 2, '#e0bc50');
  if (((t * 1.6) | 0) % 5 === 0)                              // guincho coletivo: dentinhos
    bodies.forEach(([bx2]) => P(gx2 + bx2 - 1, by - 8, 1, 1, '#e8e4da'));
  if (p.flash > 0) E(gx2, by - 8, 15, 11, 'rgba(255,240,230,.7)');
}
function drawPlague(a, gx2, gy2, p){
  /* PLAGUE DOCTOR v4 (2026-09-18, 3º redesenho a pedido do Marcos): PRETO e BRANCO, e só.
     Capuz pontudo preto engolindo a cabeça, capa curta em sino com botões, botinhas — e a MÁSCARA
     DE OSSO em 3/4: placa arredondada nos olhos que AFUNILA num bico longo descendo pra frente
     (uma forma só, como a cabeça de um pássaro — não "bico grudado numa cara"). Dois furos pretos. */
  const t = a.tailPhase;
  const by = gy2 - Math.round(p.air);
  const k = 1 - p.crouch * .05 + p.stretch * .05;
  const Y = yy => by + Math.round(yy * k);
  const PRETO = '#262933', PRETO2 = '#383c49', PRETO3 = '#191b21', PRETO4 = '#4a4f5e';   // paleta 1: o breu
  const OSSO = '#e9e5db', OSSO2 = '#ffffff', OSSO3 = '#b9b3a6', OSSO4 = '#857f73';        // paleta 2: o osso
  const H = yy => Math.max(1, Y(yy + 1) - Y(yy));             // altura até a fileira de baixo: sem fresta no squash
  const fila = (yy, x0, x1, cor) => P(x0, Y(yy), x1 - x0 + 1, H(yy), cor);
  const forma = (cx, rows, cor) => {                          // contorno de TODAS as fileiras, depois o miolo
    rows.forEach(([yy, x0, x1]) => P(cx + x0 - 1, Y(yy) - 1, x1 - x0 + 3, H(yy) + 2, OUT));
    rows.forEach(([yy, x0, x1]) => fila(yy, cx + x0, cx + x1, typeof cor === 'function' ? cor(yy) : cor));
  };
  const atk = a.mode === 'attack';
  const inv = atk ? 2 : 0;                                    // no golpe a cabeça avança: o bico investe
  const fl = atk ? 1 : 0;                                     // e a capa abre um pouco
  // --- botinhas ---
  P(gx2 - 6, Y(-3), 5, 4, OUT); P(gx2 + 1, Y(-3), 5, 4, OUT);
  P(gx2 - 5, Y(-2), 3, 2, PRETO2); P(gx2 + 2, Y(-2), 3, 2, PRETO);
  // --- CAPA: sino curto dos ombros até a barra, fenda e botões na frente ---
  const CAPA = [];
  for (let yy = -16; yy <= -3; yy++){ const hw = Math.round(5 + (yy + 16) * (3 + fl) / 13); CAPA.push([yy, -hw, hw - 1]); }
  forma(gx2, CAPA, yy => yy <= -15 ? PRETO2 : yy >= -4 ? PRETO3 : PRETO);
  CAPA.forEach(([yy, x0, x1]) => { if (yy <= -5 && yy >= -13) fila(yy, gx2 + x1 - 1, gx2 + x1, PRETO2); });   // luz na lateral
  for (let yy = -14; yy <= -4; yy++) fila(yy, gx2 - 1, gx2, PRETO3);                                          // fenda
  [-13, -10, -7].forEach(yy => P(gx2 + 1, Y(yy), 1, 1, PRETO4));                                             // botões
  for (let i = 0; i < 6; i++){                                // barra balançando
    const x = gx2 - 8 - fl + i * 3 + (i > 2 ? fl * 2 : 0), w = Math.round(Math.sin(t * 2.2 + i * 1.9)) + 1;
    P(x - 1, Y(-3), 3, 3 + w, OUT);
    P(x, Y(-3), 1 + (i % 2), 2 + w, i % 2 ? PRETO : PRETO3);
  }
  // --- CAPUZ: pontudo, tombando pra trás; luz na direita, sombra na esquerda ---
  const hx = gx2 + (inv >> 1);
  const CAPUZ = [[-33, -3, -1], [-32, -5, 1], [-31, -6, 3], [-30, -7, 5], [-29, -8, 7], [-28, -9, 8], [-27, -9, 8],
    [-26, -9, 8], [-25, -9, 8], [-24, -9, 8], [-23, -9, 8], [-22, -9, 8], [-21, -9, 8], [-20, -8, 8], [-19, -8, 7], [-18, -7, 7], [-17, -6, 6]];
  forma(hx, CAPUZ, yy => yy <= -31 ? PRETO2 : yy >= -18 ? PRETO3 : PRETO);
  CAPUZ.forEach(([yy, x0, x1]) => { if (yy >= -30 && yy <= -20){ fila(yy, hx + x1 - 1, hx + x1, PRETO2); fila(yy, hx + x0, hx + x0, PRETO3); } });
  /* --- A ABERTURA e a MÁSCARA (3/4, rosto virado pra direita) --- */
  const mx = gx2 + 1 + inv;
  [[-29, -3, 3], [-28, -5, 5], [-27, -6, 6], [-26, -7, 7], [-25, -7, 7], [-24, -7, 7], [-23, -7, 7], [-22, -7, 7], [-21, -6, 7], [-20, -5, 7], [-19, -3, 7]]
    .forEach(([yy, x0, x1]) => fila(yy, mx + x0, mx + x1, PRETO3));   // o fundo escuro do capuz
  /* O BICO (2026-09-26): era um toco. A silhueta ia reta até a beirada e a ponta terminava num
     corte de 2px, que lê como bota, não como bico. Agora ele é um CONE CURVO: a crista sobe num
     arco, passa do ponto mais largo e TOMBA pra frente, a barriga fecha por baixo mais rápido que
     a crista, e a largura escorre 13→1 até UM pixel de ponta. Pontudo e arredondado, como o pedido. */
  const MASK = [[-28, -3, 2], [-27, -4, 4], [-26, -5, 5], [-25, -5, 5], [-24, -5, 5], [-23, -5, 6], [-22, -4, 8],
    [-21, -3, 10], [-20, -1, 12], [-19, 2, 13], [-18, 5, 14], [-17, 8, 14], [-16, 10, 13], [-15, 12, 13], [-14, 13, 13]];
  forma(mx, MASK, yy => yy <= -27 ? OSSO2 : yy >= -17 ? OSSO3 : OSSO);
  for (let yy = -26; yy <= -21; yy++) fila(yy, mx + MASK.find(r => r[0] === yy)[1], mx + MASK.find(r => r[0] === yy)[1], OSSO3);   // bochecha de longe na sombra
  // a luz corre a crista INTEIRA, até a ponta: é o fio que faz a curva ser lida como curva
  [[-22, 8], [-21, 10], [-20, 12], [-19, 13], [-18, 14], [-17, 14], [-16, 13], [-15, 13]]
    .forEach(([yy, x1]) => fila(yy, mx + x1 - 1, mx + x1, OSSO2));
  [[-21, -3], [-20, -1], [-19, 2], [-18, 5], [-17, 8], [-16, 10]]
    .forEach(([yy, x0]) => fila(yy, mx + x0, mx + x0 + 1, OSSO4));   // barriga do bico na sombra
  fila(-15, mx + 12, mx + 12, OSSO4);
  P(mx + 13, Y(-14), 1, 1, OSSO2);                            // a PONTA: um pixel claro, o brilho do osso
  fila(-26, mx - 3, mx - 2, OUT); fila(-25, mx - 3, mx - 2, OUT);   // FURO de longe (2 de largura)
  fila(-26, mx + 2, mx + 4, OUT); fila(-25, mx + 2, mx + 4, OUT);   // FURO de perto (3)
  P(mx + 9, Y(-18), 1, 1, OUT);                               // respiradouro
  // --- vapor da peste: fumacinha pálida saindo da ponta do bico ---
  for (let i = 0; i < 2; i++){
    const ph = ((t * .45 + i * .5) % 1);
    const s2 = 1 + Math.round(ph * 2);
    P(mx + 14 + Math.round(ph * 5 + Math.sin(t * 2 + i) * 1.2), Y(-14) - Math.round(ph * 10) - s2,
      s2, s2, 'rgba(210,235,205,' + ((1 - ph) * .35).toFixed(2) + ')');
  }
}
/* ---- SABÁ DAS BRUXAS (31-39) ---- */
function drawJack(a, gx2, gy2, p){                            // Abóbora Saltitante
  const t = a.tailPhase;
  const k = 1 - p.crouch * .08 + p.stretch * .08;             // a abóbora achata e estica no pulo
  const by = gy2 - Math.round(p.air);
  const H = Math.max(10, Math.round(23 * k)), W = Math.round(27 / Math.max(.7, k));
  const topo = by - H;
  const LARANJA = '#d9701c', CLARO = '#ef8b2c', VIVO = '#f7ac48', ESC = '#a34a0c', FOGO = '#ffe14a';
  glowAt(gx2, topo + Math.round(H * .62), 22, '255,150,40', .34 + Math.sin(t * 3) * .07);
  const hws = [];                                             // bojo: elipse achatada, bem gorda no meio
  for (let i = 0; i < H; i++){
    const v = (i - (H - 1) / 2) / ((H - 1) / 2);
    hws.push(Math.max(2, Math.round(W / 2 * Math.sqrt(Math.max(.02, 1 - v * v * .92)))));
  }
  P(gx2 - 1, topo - 5, 3, 6, OUT);                            // cabinho torto
  P(gx2 - 1, topo - 4, 2, 5, '#4a6a2c'); P(gx2, topo - 5, 2, 2, '#5f8a38');
  hws.forEach((w2, i) => P(gx2 - w2 - 1, topo + i - 1, w2 * 2 + 2, 3, OUT));
  hws.forEach((w2, i) => P(gx2 - w2, topo + i, w2 * 2, 1, i < H * .18 ? VIVO : i > H * .8 ? ESC : LARANJA));
  for (const gx3 of [-.62, -.22, .22, .62]){                  // gomos: risco escuro e realce ao lado
    hws.forEach((w2, i) => {
      const x = gx2 + Math.round(gx3 * w2 * 1.5);
      if (Math.abs(x - gx2) > w2 - 2) return;
      P(x, topo + i, 1, 1, ESC);
      P(x + 1, topo + i, 1, 1, i < H * .6 ? CLARO : LARANJA);
    });
  }
  const fy = topo + Math.round(H * .34);                      // CARA ENTALHADA, acesa por dentro
  glowAt(gx2, fy + 4, 15, '255,190,60', .3 + Math.sin(t * 5) * .1);
  for (let i = 0; i < 4; i++){                                // olhos em triângulo
    P(gx2 - 8 + i, fy + i, 4 - i, 1, '#2a0d06'); P(gx2 + 5 - i, fy + i, 4 - i, 1, '#2a0d06');
    P(gx2 - 7 + i, fy + i, Math.max(1, 3 - i), 1, i < 2 ? FOGO : '#ff9c1c');
    P(gx2 + 5 - i, fy + i, Math.max(1, 3 - i), 1, i < 2 ? FOGO : '#ff9c1c');
  }
  P(gx2 - 1, fy + 5, 3, 3, '#2a0d06'); P(gx2, fy + 6, 1, 2, FOGO);      // narizinho em cunha
  const bw = 13, bx = gx2 - (bw >> 1), byy = fy + 9;          // bocarra rasgada com dentes
  P(bx, byy, bw, 4, '#2a0d06');
  P(bx, byy, bw, 1, '#ff9c1c');
  for (let i = 0; i < 4; i++) P(bx + 1 + i * 3, byy + (i % 2), 2, 2, FOGO);
  P(bx + 2, byy + 3, bw - 4, 1, '#ff7a10');
  P(gx2 - 6, by - 2, 4, 3, OUT); P(gx2 + 2, by - 2, 4, 3, OUT);         // pernocas de cipó
  P(gx2 - 5, by - 2, 2, 2, '#4a6a2c'); P(gx2 + 3, by - 2, 2, 2, '#4a6a2c');
  if (p.flash > 0) hws.forEach((w2, i) => P(gx2 - w2, topo + i, w2 * 2, 1, 'rgba(255,240,230,.7)'));
}
function drawScare(a, gx2, gy2, p){                           // Espantalho de Palha
  const t = a.tailPhase;
  const k = 1 - p.crouch * .04 + p.stretch * .04;
  const by = gy2 - Math.round(p.air);
  const Y = yy => by + Math.round(yy * k);
  const PANO = '#a8925e', PANOD = '#7c6a40', CASACO = '#5e4568', CASACOD = '#41304c';
  const PALHA2 = '#e8cf7a', COSTURA = '#2a2230';
  glowAt(gx2, Y(-30), 20, '150,90,190', .16);
  const bal = Math.sin(t * 1.4) * 1.5;                        // balança devagar no vento
  P(gx2 - 2, Y(-46), 4, 46, OUT); P(gx2 - 1, Y(-45), 2, 44, '#4a3a24');   // a estaca
  const braco = sx => {                                       // travessa com palha saindo da manga
    const x0 = gx2 + sx * 4;
    P(x0 - (sx < 0 ? 14 : 0), Y(-34) - 1, 15, 5, OUT);
    P(x0 - (sx < 0 ? 13 : 0), Y(-34), 13, 3, sx < 0 ? CASACO : CASACOD);
    for (let i = 0; i < 5; i++)
      P(gx2 + sx * (15 + i), Y(-35) + ((i * 7 + (sx < 0 ? 0 : 3)) % 5) - 1, 3, 1, i % 2 ? PALHA2 : '#c9ad62');
  };
  braco(-1); braco(1);
  const rows = [[-38, 6], [-36, 8], [-34, 9], [-32, 9], [-30, 9], [-28, 8], [-26, 6], [-24, 4]];
  rows.forEach(([yy, hw]) => P(gx2 - hw - 1, Y(yy) - 1, hw * 2 + 2, 4, OUT));
  rows.forEach(([yy, hw], i) => P(gx2 - hw, Y(yy), hw * 2, 2, i < 2 ? CASACO : CASACOD));   // casaco esfarrapado
  for (let i = 0; i < 6; i++) P(gx2 - 8 + i * 3, Y(-25) + (i % 2) * 2, 2, 3, CASACOD);      // barra rasgada
  for (let i = 0; i < 5; i++) P(gx2 - 7 + i * 3, Y(-24) + (i % 2) * 2, 2, 3, i % 2 ? PALHA2 : '#c9ad62');
  const hy = Y(-52) + Math.round(bal);                        // SACO DE ESTOPA na cabeça
  const hr = [[0, 5], [2, 7], [4, 8], [6, 8], [8, 8], [10, 7], [12, 5]];
  hr.forEach(([o, hw]) => P(gx2 - hw - 1, hy + o - 1, hw * 2 + 2, 4, OUT));
  hr.forEach(([o, hw], i) => P(gx2 - hw, hy + o, hw * 2, 2, i < 2 ? PANO : PANOD));
  for (let i = 0; i < 5; i++) P(gx2 - 9 + i * 5, hy - 2, 3, 2, i % 2 ? PALHA2 : '#c9ad62');  // palha saindo por cima
  P(gx2 - 8, hy + 13, 16, 2, '#5a3c22');                      // corda amarrando o pescoço
  P(gx2 - 8, hy + 13, 16, 1, '#7a5430');
  for (const ox of [-5, 2]){                                  // OLHOS costurados em X, acesos de roxo
    P(ox + gx2, hy + 5, 4, 4, COSTURA);
    P(ox + gx2 + 1, hy + 6, 2, 2, '#b464f0');
    P(ox + gx2, hy + 4, 1, 1, COSTURA); P(ox + gx2 + 3, hy + 8, 1, 1, COSTURA);
  }
  glowAt(gx2, hy + 7, 13, '180,100,240', .28 + Math.sin(t * 2.6) * .08);
  P(gx2 - 5, hy + 11, 11, 1, COSTURA);                        // boca costurada
  for (let i = 0; i < 5; i++) P(gx2 - 4 + i * 2, hy + 10, 1, 3, COSTURA);
  if (p.flash > 0){ rows.forEach(([yy, hw]) => P(gx2 - hw, Y(yy), hw * 2, 2, 'rgba(255,240,230,.7)')); }
}
function drawCrow(a, gx2, gy2, p){                            // Corvo Bruxo
  const t = a.tailPhase;
  const hov = Math.round(Math.sin(t * 2.6) * 4) + 18;
  const by = gy2 - hov - Math.round(p.air * .4);
  const flap = ((t * 7) | 0) % 2;
  const PENA = '#1b1826', PENA2 = '#2e2740', BRILHO = '#5a3f7a', BICO = '#e8b03c';
  glowAt(gx2, gy2, 18, '120,60,180', .2);
  const wy = by - 3 + (flap ? 3 : -4);                        // ASAS: penas emendadas, não soltas
  for (const sx of [-1, 1]){                                  // contorno de toda a asa antes das penas
    for (let f = 0; f < 5; f++){
      const x = gx2 + sx * (4 + f * 3), yy = wy + (flap ? f : -f);
      P(x - (sx < 0 ? 5 : 0), yy - 1, 6, 9 - f, OUT);
    }
    for (let f = 0; f < 5; f++){
      const x = gx2 + sx * (4 + f * 3), yy = wy + (flap ? f : -f);
      P(x - (sx < 0 ? 4 : 0), yy, 4, 7 - f, f % 2 ? PENA : PENA2);
      P(x - (sx < 0 ? 4 : 0), yy, 4, 1, BRILHO);
    }
  }
  E(gx2, by + 2, 8, 9, OUT); E(gx2, by + 2, 7, 8, PENA);      // corpo
  E(gx2, by + 1, 5, 5, PENA2);
  P(gx2 - 3, by + 9, 7, 5, OUT); P(gx2 - 2, by + 9, 5, 4, PENA);        // rabo em cunha
  P(gx2 - 2, by + 12, 5, 1, PENA2);
  E(gx2, by - 7, 6, 6, OUT); E(gx2, by - 7, 5, 5, PENA);      // cabeça
  E(gx2, by - 9, 4, 2, BRILHO);
  P(gx2 + 4, by - 8, 7, 3, OUT); P(gx2 + 5, by - 7, 6, 2, BICO);        // bico comprido
  P(gx2 + 5, by - 7, 4, 1, '#f6cd6a');
  P(gx2 - 3, by - 9, 3, 3, OUT); P(gx2 + 1, by - 9, 3, 3, OUT);         // olhinhos brasa
  P(gx2 - 2, by - 8, 2, 2, '#c86af8'); P(gx2 + 2, by - 8, 2, 2, '#c86af8');
  P(gx2 - 2, by - 8, 1, 1, '#f0d0ff'); P(gx2 + 2, by - 8, 1, 1, '#f0d0ff');
  glowAt(gx2, by - 8, 11, '190,110,250', .3 + Math.sin(t * 4) * .08);
  if (((t * 1.5) | 0) % 4 === 0)                              // pena caindo
    P(gx2 - 6 + ((t * 9) % 12 | 0), by + 14 + ((t * 14) % 16 | 0), 2, 3, 'rgba(46,39,64,.7)');
  if (p.flash > 0) E(gx2, by + 2, 7, 8, 'rgba(255,240,230,.75)');
}
function drawCauld(a, gx2, gy2, p){                           // Caldeirão Vivo
  const t = a.tailPhase;
  const k = 1 - p.crouch * .05 + p.stretch * .05;
  const by = gy2 - Math.round(p.air);
  const H = Math.max(10, Math.round(22 * k)), W = Math.round(30 / Math.max(.75, k));
  const topo = by - H;
  const FERRO = '#2a2632', FERRO2 = '#3b3648', FERROD = '#191722', CALDO = '#66d84a', CALDO2 = '#a8f26a';
  glowAt(gx2, topo + 2, 24, '110,240,80', .3 + Math.sin(t * 2.4) * .08);
  for (const sx of [-1, 0, 1]){                               // pernas de ferro
    P(gx2 + sx * 9 - 2, by - 5, 5, 6, OUT);
    P(gx2 + sx * 9 - 1, by - 5, 3, 5, FERRO2);
  }
  const hws = [];                                             // bojo do panelão: mais largo em cima
  for (let i = 0; i < H; i++){
    const v = i / (H - 1);
    hws.push(Math.max(3, Math.round(W / 2 * (1 - v * v * .55))));
  }
  hws.forEach((w2, i) => P(gx2 - w2 - 1, topo + i - 1, w2 * 2 + 2, 3, OUT));
  hws.forEach((w2, i) => P(gx2 - w2, topo + i, w2 * 2, 1, i < 3 ? FERRO2 : i > H * .7 ? FERROD : FERRO));
  P(gx2 - hws[0] - 2, topo - 2, hws[0] * 2 + 4, 5, OUT);      // aro da boca
  P(gx2 - hws[0] - 1, topo - 1, hws[0] * 2 + 2, 3, FERRO2);
  P(gx2 - hws[0] - 1, topo - 1, hws[0] * 2 + 2, 1, '#565064');
  const cw = hws[0] - 1;                                      // CALDO borbulhando
  P(gx2 - cw, topo, cw * 2, 3, CALDO);
  P(gx2 - cw, topo, cw * 2, 1, CALDO2);
  for (let i = 0; i < 5; i++){                                // bolhas subindo e estourando
    const ph = ((t * .9 + i * .23) % 1);
    const bx = gx2 - cw + 2 + ((hash(i, 51) * (cw * 2 - 5)) | 0);
    const sz = 1 + Math.round(ph * 2);
    P(bx, topo - Math.round(ph * 9), sz, sz, 'rgba(168,242,106,' + ((1 - ph) * .85).toFixed(2) + ')');
  }
  for (const ox of [-6, 2]){                                  // dois olhinhos boiando no caldo
    P(gx2 + ox, topo, 4, 3, '#0e2a08');
    P(gx2 + ox + 1, topo, 2, 2, '#e8ffd0');
    P(gx2 + ox + 1, topo + 1, 1, 1, '#14151a');
  }
  P(gx2 + 6, topo - 12, 3, 14, OUT); P(gx2 + 7, topo - 11, 2, 13, '#6b4a28');   // colher de pau
  P(gx2 + 5, topo - 13, 6, 4, OUT); P(gx2 + 6, topo - 12, 4, 3, '#7c5931');
  if (p.flash > 0) hws.forEach((w2, i) => P(gx2 - w2, topo + i, w2 * 2, 1, 'rgba(255,240,230,.7)'));
}
function drawCat(a, gx2, gy2, p){
  const t = a.tailPhase;
  const k = 1 - p.crouch * .04 + p.stretch * .04;
  const by = gy2 - Math.round(p.air);
  const bh = Math.round(46 * k), bw = Math.round(24 / Math.max(.9, k));
  glowAt(gx2, by - bh + 10, 44, '130,240,120', .22);          // aura esverdeada do olhar
  for (let i = 0; i < 16; i++){                               // cauda chicoteando, impaciente
    const sx = gx2 + bw - 3 + i * 2;
    const sy = by - 6 - Math.round(Math.sin(t * 2.4 + i * .45) * (2 + i * .9));
    P(sx, sy, 3, 3, OUT);
    P(sx, sy, 2, 2, i > 12 ? '#14151a' : '#262a34');
  }
  P(gx2 - bw - 6, by - Math.round(bh * .38), 7, Math.round(bh * .36), OUT);    // patas dianteiras
  P(gx2 + bw - 1, by - Math.round(bh * .38), 7, Math.round(bh * .36), OUT);
  P(gx2 - bw - 5, by - Math.round(bh * .38) + 1, 5, Math.round(bh * .34), '#31353f');
  P(gx2 + bw, by - Math.round(bh * .38) + 1, 5, Math.round(bh * .34), '#22252d');
  for (let c2 = 0; c2 < 3; c2++){                             // garras à mostra
    P(gx2 - bw - 5 + c2 * 2, by - 2, 1, 3, '#e8e4da');
    P(gx2 + bw + c2 * 2, by - 2, 1, 3, '#e8e4da');
  }
  P(gx2 - bw, by - bh, bw * 2, bh, OUT);                      // corpanzil sentado
  P(gx2 - bw + 1, by - bh + 1, bw * 2 - 2, bh - 1, '#2c303a');
  P(gx2 - bw + 1, by - bh + 1, 5, bh - 1, '#1e212a');         // flanco na sombra
  P(gx2 + bw - 6, by - bh + 1, 5, bh - 1, '#3a3f4c');
  P(gx2 - 7, by - Math.round(bh * .52), 14, Math.round(bh * .5), '#4a4f5e');   // peito claro
  P(gx2 - 4, by - Math.round(bh * .48), 8, Math.round(bh * .44), '#5a6070');
  for (let s2 = 0; s2 < 4; s2++)                              // listras do pelo
    P(gx2 - bw + 4 + s2 * 3, by - bh + 4 + s2 * 6, 8, 2, '#1e212a');
  const hy = by - bh - 16;                                    // cabeçorra
  P(gx2 - 15, hy - 8, 8, 10, OUT); P(gx2 + 7, hy - 8, 8, 10, OUT);            // orelhas pontudas
  P(gx2 - 14, hy - 6, 6, 8, '#2c303a'); P(gx2 + 8, hy - 6, 6, 8, '#2c303a');
  P(gx2 - 12, hy - 4, 3, 5, '#8a4a5a'); P(gx2 + 9, hy - 4, 3, 5, '#8a4a5a');  // parte interna
  P(gx2 - 14, hy, 28, 18, OUT);
  P(gx2 - 13, hy + 1, 26, 16, '#31353f');
  P(gx2 - 13, hy + 1, 26, 3, '#3d4250');
  const blink2 = p.blink;
  if (blink2){ P(gx2 - 9, hy + 6, 7, 1, '#14151a'); P(gx2 + 3, hy + 6, 7, 1, '#14151a'); }
  else {                                                      // olhos de fenda, verdes e brilhantes
    glowAt(gx2, hy + 7, 15, '150,255,120', .4);
    P(gx2 - 10, hy + 4, 8, 5, '#9ae05a'); P(gx2 + 2, hy + 4, 8, 5, '#9ae05a');
    P(gx2 - 7, hy + 4, 2, 5, '#14151a'); P(gx2 + 5, hy + 4, 2, 5, '#14151a'); // pupilas verticais
    P(gx2 - 10, hy + 4, 2, 1, '#e0ffc0'); P(gx2 + 2, hy + 4, 2, 1, '#e0ffc0');
  }
  P(gx2 - 2, hy + 10, 4, 3, '#c97b8e');                       // focinho
  P(gx2 - 4, hy + 13, 8, 2, '#22252d');                       // boca
  const gr = ((t * 1.2) | 0) % 4 === 0;                       // rosnado: presas aparecem
  if (gr){ P(gx2 - 4, hy + 14, 2, 3, '#e8e4da'); P(gx2 + 2, hy + 14, 2, 3, '#e8e4da'); }
  for (let w2 = 0; w2 < 3; w2++){                             // bigodes
    P(gx2 - 26, hy + 9 + w2 * 2, 11, 1, 'rgba(220,224,230,.5)');
    P(gx2 + 15, hy + 9 + w2 * 2, 11, 1, 'rgba(220,224,230,.5)');
  }
  if (p.flash > 0){
    P(gx2 - bw + 1, by - bh + 1, bw * 2 - 2, bh - 1, 'rgba(255,240,230,.7)');
    P(gx2 - 13, hy + 1, 26, 16, 'rgba(255,240,230,.7)');
  }
}
/* ---- Fogo-fátuo ciano ---- */
function drawWisp(a, gx2, gy2, p){
  const t = a.tailPhase;
  const hov = Math.round(Math.sin(t * 3) * 3) + 14;
  const by = gy2 - hov;
  glowAt(gx2, by, 20, '110,220,230', .4);                     // brilho gélido
  for (let k2 = 0; k2 < 3; k2++){                             // caudas de chama fria
    const fx = gx2 - 4 + k2 * 4 + Math.round(Math.sin(t * 4 + k2 * 2) * 2);
    P(fx, by + 6 + ((t * 8 + k2 * 3) % 6), 2, 3, 'rgba(140,230,240,.5)');
  }
  E(gx2, by, 7, 8, 'rgba(120,215,230,.75)');                  // corpo etéreo
  E(gx2, by - 1, 4, 5, '#d8f8ff');
  P(gx2 - 3, by - 2, 2, 3, '#14343a'); P(gx2 + 1, by - 2, 2, 3, '#14343a'); // olhos fundos
  if (p.flash > 0) E(gx2, by, 7, 8, 'rgba(255,240,230,.8)');
}

/* ---- rastro do golpe ---- */
const slashes = [];
const SLASH_ANG = [Math.atan2(1, 2), Math.atan2(1, -2), -Math.atan2(1, -2), -Math.atan2(1, 2)];
function drawSlashes(dt){
  for (let i = slashes.length - 1; i >= 0; i--){
    const s = slashes[i];
    s.t += dt;
    const pr = s.t / .18;
    if (pr >= 1){ slashes.splice(i, 1); continue; }
    const a = s.a;
    const [dx, dy] = DIRV[a.dir];
    const cxp = gX(a.x + dx * .5, a.y + dy * .5);
    const cyp = gY(a.x + dx * .5, a.y + dy * .5) - 18;
    const base = SLASH_ANG[w2s(a.dir)];
    for (let tr = 2; tr >= 0; tr--){                          // smear: 3 posições defasadas do arco
      const trPr = Math.max(0, pr - tr * .07);
      const sweep = -.5 + ease(Math.min(1, trPr * 1.15));     // acelera e desacelera (slow in/out)
      const al = (.9 - pr * .55) * (1 - tr * .35);
      for (let j = -3; j <= 3; j++){
        const ang = base + j * .15 + sweep;
        const r = 18 - pr * 5 - tr * 2;
        P(cxp + Math.cos(ang) * r - 1, cyp + Math.sin(ang) * r * .55 - 1,
          3 - (Math.abs(j) > 2 ? 1 : 0), 2,
          tr === 0 ? `rgba(240,246,252,${al})` : `rgba(200,212,228,${al})`);
      }
    }
  }
}

/* ---- ecos do olhar: o vermelho dos ratos fica pairando no caminho ---- */
const eyeEchoes = [];
function drawDashEchoes(dt){
  for (let i = eyeEchoes.length - 1; i >= 0; i--){
    const e2 = eyeEchoes[i];
    e2.t += dt;
    if (e2.t >= .7){ eyeEchoes.splice(i, 1); continue; }
    const al = (1 - e2.t / .7) * .45;
    const xl = e2.flip ? e2.x - 6 : e2.x - 3, xr = e2.flip ? e2.x : e2.x + 3;
    g.save();
    g.globalCompositeOperation = 'lighter';
    blurFx((.5 + e2.t * 2.4).toFixed(1));                    // o eco dissolve no ar
    g.fillStyle = `rgba(255,70,50,${al.toFixed(3)})`;
    g.fillRect(xl, e2.y - e2.t * 3, 3, 2); g.fillRect(xr, e2.y - e2.t * 3, 3, 2);
    g.restore();
  }
}

/* ---- rastro do rato: só o brilho suave, esvanece rápido ---- */
const trail = [];
let redSmokeTick = 0;
function trailAdd(x, y){
  const e2 = trail.find(t2 => t2.x === x && t2.y === y);
  if (e2){ e2.t = 0; e2.g = stamT > 0; }
  else trail.push({ x, y, t: 0, g: stamT > 0 });              // g = pisada com stamina → neon verde
}

/* ---------------- PARTÍCULAS ---------------- */
const dust = [];
const fct = [];                                              // números de dano flutuantes
function dmgNum(tx, ty, n, c, crit){
  const sc = crit ? 2 : 1;
  fct.push({
    x: gX(tx, ty) - ('' + n).length * 2 * sc, y: gY(tx, ty) - 46, n: '' + n, c, t: 0, sc,
    vx: (hash(('' + n).length * 7 + tx, (performance.now() | 0) % 89) - .5) * 26,   // deriva lateral: sobe em arco
  });
}
function missNum(tx, ty){ dmgNum(tx, ty, 'MISS', 'miss'); }   // golpe aparado: a palavra na cara do inimigo
function soilCols(){                                          // terra revolvida na cor do andar
  if (current.ice) return ['#3d5f86', '#54789f', '#8fc0e0'];
  if (current.sewer) return ['#3a4a30', '#4e6040', '#7fa060'];
  if (current.witch) return ['#2e1c3c', '#40284f', '#6e4088'];
  if (current.wood) return ['#5a4530', '#6f563c', '#a8845c'];
  if (current.dark) return ['#1b1b23', '#26262e', '#4a4a58'];
  return ['#333a46', '#434b59', '#6a7484'];
}
function soilBurst(x, y, n){                                  // torrões saltando da escavação
  const cs = soilCols();
  for (let i = 0; i < n; i++)
    dust.push({
      x: x + (hash(i, dust.length) - .5) * 18, y: y - 2,
      vx: (hash(i, 71) - .5) * 95, vy: -28 - hash(i, 72) * 58,
      life: .3 + hash(i, 73) * .24, kind: 'soil',
      ci: cs[(hash(i, 74) * 3) | 0], sz: hash(i, 75) > .62 ? 3 : 2,
    });
}
function drawMound(x, y, k, ph){                              // montinho de terra correndo pelo chão
  const [c0, c1, c2] = soilCols();
  const wob = Math.sin(ph * 17) * .13;                        // a lombada ondula enquanto avança
  const w = Math.max(4, Math.round((8 + k * 9) * (1 + wob)));
  const h = Math.max(2, Math.round((4 + k * 5) * pitch * 1.5 * (1 - wob * .6)));
  E(x, y + 1, w + 2, h + 1, OUT);
  E(x, y, w, h, c0);
  E(x - 2, y - 1, Math.round(w * .55), Math.max(1, h - 2), c1);
  P(x - w + 3, y - 1, 2, 1, c2); P(x + w - 5, y, 2, 1, c2);
  P(x + Math.round(Math.sin(ph * 11) * (w * .4)), y - h, 2, 2, c2);   // torrão saltando na crista
}
const tileHops = [];                                          // tremor local: o chão salta e volta
function tileQuake(tx, ty){
  [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([ox, oy], i) => {
    const x = tx + ox, y = ty + oy;
    if (!current.free(x, y)) return;                          // parede não salta
    tileHops.push({ x, y, t: -i * .045 });                    // defasagem: a onda percorre os quatro
  });
}
const HOP_T = .55;
function hopOffset(h){                                        // oscilação amortecida do tile solto
  const q = h.t / HOP_T, damp = Math.exp(-q * 3.2);
  return [Math.round(Math.cos(q * Math.PI * 5.4) * 2.4 * damp),           // treme de lado
          Math.round(Math.sin(q * Math.PI * 2.7) * 18 * damp)];           // sobe, passa do ponto, afunda, assenta
}
function tileHopAt(tx, ty){                                   // quanto ESTE tile está deslocado agora (ou null)
  for (const h of tileHops) if (h.x === tx && h.y === ty && h.t >= 0) return hopOffset(h);
  return null;
}
function drawTileHops(dt){
  const th2 = TT();
  for (let i = tileHops.length - 1; i >= 0; i--){
    const h = tileHops[i];
    h.t += dt;
    const T = HOP_T;
    if (h.t >= T){ tileHops.splice(i, 1); continue; }
    if (h.t < 0) continue;
    const q = h.t / T;
    const damp = Math.exp(-q * 3.2);
    const [jx, lift] = hopOffset(h);
    if (!lift && !jx) continue;
    const [x, yT] = tvTop(h.x, h.y);
    g.fillStyle = `rgba(5,7,12,${(.55 * damp).toFixed(2)})`;              // o vão escuro em volta do tile solto
    g.beginPath();
    g.moveTo(x, yT + 2); g.lineTo(x + TW / 2 - 2, yT + th2);
    g.lineTo(x, yT + th2 * 2 - 2); g.lineTo(x - TW / 2 + 2, yT + th2);
    g.closePath(); g.fill();
    // Se o tile que saltou for TÁBUA DE PONTE, quem pula é a madeira — antes subia um tile de pedra
    // no meio da travessia. O desenho é o mesmo da assadura do cenário, só que solto e no ar.
    const naPonte = current.bridge && current.bridge.has(h.x + ',' + h.y);
    let img = floorTile((hash(h.x, h.y) * 4) | 0);
    if (naPonte){
      const [vi, vj] = rotXY(h.x, h.y);
      const r0 = rotXY(0, 0), r1 = rotXY(1, 0);
      const eixoP = Math.abs(r1[0] - r0[0]) > Math.abs(r1[1] - r0[1]);
      const pi = (vx, vy) => { const [a2, b2] = invRot(vx, vy); return current.bridge.has(a2 + ',' + b2) ? 1 : 0; };
      const viz = eixoP ? (pi(vi, vj - 1) | pi(vi, vj + 1) * 2) : (pi(vi - 1, vj) | pi(vi + 1, vj) * 2);
      img = bridgeTile(eixoP, (current.abismo && current.abismo.seed) || 0, viz, (h.x + h.y) & 3);
    }
    g.drawImage(img, Math.round(x - TW / 2 + jx), Math.round(yT - lift));
    if (lift > 6 && !h.p){                                                // no ponto mais alto, a poeira sai
      h.p = 1;
      if (naPonte) puff(x, yT + th2, 5);                                  // tábua solta pó, não torrão de terra
      else soilBurst(x, yT + th2, 5);
    }
  }
}
const furrow = [];                                            // sulco aberto por onde o túnel passou
function drawFurrow(dt){
  const [c0, c1] = soilCols();
  for (let i = furrow.length - 1; i >= 0; i--){
    const f = furrow[i];
    f.t += dt;
    if (f.t >= 1.3){ furrow.splice(i, 1); continue; }
    const al = 1 - f.t / 1.3;
    const x = gX(f.x, f.y), y = gY(f.x, f.y);
    const w = Math.round(9 * (1 - f.t * .25));
    E(x, y, w, Math.max(1, Math.round(w * pitch * .7)), `rgba(10,12,18,${(al * .5).toFixed(2)})`);
    P(x - w, y - 1, 3, 2, `rgba(${hexRgb(c1)},${(al * .55).toFixed(2)})`);   // terra empurrada pros lados
    P(x + w - 3, y, 3, 2, `rgba(${hexRgb(c0)},${(al * .5).toFixed(2)})`);
  }
}
const hexRgb = h => {                                         // '#rrggbb' → 'r,g,b'
  const n = parseInt(h.slice(1), 16);
  return `${n >> 16},${(n >> 8) & 255},${n & 255}`;
};
function puff(x, y, n){
  for (let i = 0; i < n; i++)
    dust.push({ x: x + (hash(i, dust.length) - .5) * 16, y: y + 1, vy: -10 - hash(i, 3) * 12, life: .5, kind: 'dust' });
}
const CONF_COLS = ['rgb(224,90,90)', 'rgb(242,193,78)', 'rgb(90,192,106)', 'rgb(74,154,224)', 'rgb(201,123,224)', 'rgb(240,138,176)'];
function confettiBurst(){                                    // festa: confetes invadem pelas laterais
  for (let i = 0; i < 80; i++){
    const left = i % 2 === 0;
    dust.push({
      x: cam.x + (left ? -1 : 1) * (VW / 2 + 8),
      y: cam.y - VH / 2 + hash(i, 55) * VH,
      vx: (left ? 1 : -1) * (70 + hash(i, 56) * 110),
      vy: -40 + hash(i, 57) * 80,
      life: 1.1 + hash(i, 58) * .9, kind: 'conf',
      ci: (hash(i, 59) * 6) | 0, ph: hash(i, 60) * 6.3,
    });
  }
}
function heartRain(n){                                       // 1 coração por queijo entregue, pelas laterais
  for (let i = 0; i < n; i++){
    const left = i % 2 === 0;
    dust.push({
      x: cam.x + (left ? -1 : 1) * (VW / 2 + 6),
      y: cam.y - VH / 3 + hash(i, 91) * VH * .7,
      vx: (left ? 1 : -1) * (34 + hash(i, 92) * 44),
      vy: -6 - hash(i, 93) * 18,
      life: 1.1 + hash(i, 94) * .5, kind: 'heart',
    });
  }
}
/* coração antigo no tabuleiro: corações vermelho/rosa flutuando pelas laterais (estilo pong) */
let heartAmbT = 0, heartSideN = 0;
function heartSide(){
  const left = (heartSideN++ % 2) === 0;
  dust.push({
    x: cam.x + (left ? -1 : 1) * (VW / 2 - 8 - hash(heartSideN, 71) * 30),
    y: cam.y + VH / 2 + 8,
    vx: (left ? 1 : -1) * (4 + hash(heartSideN, 72) * 10),
    vy: -20 - hash(heartSideN, 73) * 26,
    life: 1.7 + hash(heartSideN, 74) * .9, kind: 'heartR',
    ci: heartSideN % 2, ph: hash(heartSideN, 75) * 6.3,
  });
}
function heartBurst(){                                       // pegou o coração: flashes + chuva pelas laterais
  const fx = document.getElementById('heartFx');
  fx.style.opacity = '';
  fx.classList.remove('play'); void fx.offsetWidth; fx.classList.add('play');
  setTimeout(() => fx.classList.remove('play'), 1700);
  for (let i = 0; i < 26; i++){
    const left = i % 2 === 0;
    dust.push({
      x: cam.x + (left ? -1 : 1) * (VW / 2 + 8),
      y: cam.y - VH / 2 + hash(i, 81) * VH,
      vx: (left ? 1 : -1) * (60 + hash(i, 82) * 100),
      vy: -30 + hash(i, 83) * 60,
      life: 1 + hash(i, 84) * .7, kind: 'heartR',
      ci: i % 2, ph: hash(i, 85) * 6.3,
    });
  }
  shake(3, .3);
}
/* debuffs na pele: bolas de fogo e estilhaços de gelo invadindo pelas laterais */
let burnSideT = 0, frostSideT = 0, poisSideT = 0, dbfSideN = 0;
let dbfBeatT = 0, ladoCorAtual = '';                          // trava da batida e memória do CSS var
function burnSide(){
  const left = (dbfSideN++ % 2) === 0;
  dust.push({
    x: cam.x + (left ? -1 : 1) * (VW / 2 + 4),
    y: cam.y - VH / 2 + hash(dbfSideN, 61) * VH,
    vx: (left ? 1 : -1) * (30 + hash(dbfSideN, 62) * 60),
    vy: -14 - hash(dbfSideN, 63) * 20,
    life: .5 + hash(dbfSideN, 64) * .4, kind: 'fireS', ph: hash(dbfSideN, 65) * 6.3,
  });
}
function gooSide(){                                           // bolha de lodo subindo pela lateral
  const left = (dbfSideN++ % 2) === 0;
  dust.push({
    x: cam.x + (left ? -1 : 1) * (VW / 2 + 4),
    y: cam.y + VH / 2 - hash(dbfSideN, 71) * VH * .8,
    vx: (left ? 1 : -1) * (24 + hash(dbfSideN, 72) * 54),
    vy: -22 - hash(dbfSideN, 73) * 26,                        // bolha SOBE: é lodo, não estilhaço
    life: .9 + hash(dbfSideN, 74) * .6, kind: 'gooS',
    sz: 2 + ((hash(dbfSideN, 75) * 3) | 0), ph: hash(dbfSideN, 76) * 6.3,
  });
}
function frostSide(){
  const left = (dbfSideN++ % 2) === 0;
  dust.push({
    x: cam.x + (left ? -1 : 1) * (VW / 2 + 4),
    y: cam.y - VH / 2 + hash(dbfSideN, 66) * VH,
    vx: (left ? 1 : -1) * (40 + hash(dbfSideN, 67) * 70),    // invade até o centro da tela
    vy: (hash(dbfSideN, 68) - .5) * 24,
    life: .7 + hash(dbfSideN, 69) * .5, kind: 'iceS', ph: hash(dbfSideN, 70) * 6.3,
  });
}
function dangerSide(k){                                       // flares vermelhos riscando as beiradas
  for (let n = 0; n < 2; n++){                                // dois de cada vez: o excesso é o recado
    const left = (dbfSideN++ % 2) === 0;
    const sp = 78 + hash(dbfSideN, 72) * 96 * (.7 + k);       // calmo: risca a beirada sem cruzar a sala
    dust.push({
      x: cam.x + (left ? -1 : 1) * (VW / 2 + 6),
      y: cam.y - VH / 2 + hash(dbfSideN, 71) * VH,
      vx: (left ? 1 : -1) * sp,
      vy: (hash(dbfSideN, 73) - .5) * 22,
      life: .3 + hash(dbfSideN, 74) * .2, kind: 'dngS',
      sz: hash(dbfSideN, 75) > .6 ? 3 : 2,
    });
  }
}
/* chips de status: ícone + barrinha do tempo restante do debuff */
const DBF_MAX = { burn: 7.5, frost: 4, pois: 6, stam: 5, rage: 10, leech: 10, aegis: 5, quake: 10, drill: 10, ice2: 8, edge: 10 };
let dbfKey = '';
function renderDebuffs(){
  const act = [];
  if (burnT > 0) act.push(['burn', '🔥', burnT]);
  if (frozT > 0) act.push(['frost', '❄️', frozT]);
  if (poisT > 0) act.push(['pois', '☠️', poisT]);
  if (stamT > 0) act.push(['stam', '⚡', stamT]);             // buffs também ganham barrinha de tempo
  if (rageT > 0) act.push(['rage', '😡', rageT]);
  if (leechT > 0) act.push(['leech', '🩸', leechT]);
  if (aegisT > 0) act.push(['aegis', '🛡️', aegisT]);
  if (quakeT > 0) act.push(['quake', '💥', quakeT]);
  if (drillT > 0) act.push(['drill', '🕳️', drillT]);
  if (iceTrailT > 0) act.push(['ice2', '🧊', iceTrailT]);
  if (edgeT > 0) act.push(['edge', '✨', edgeT]);
  const key = act.map(a2 => a2[0]).join(',');
  if (key !== dbfKey){
    dbfKey = key;
    document.getElementById('debuffs').innerHTML = act.map(([k, ic]) =>
      `<div class="dbf ${k}"><span>${emojify(ic)}</span><div class="bar"><i id="dbf_${k}"></i></div></div>`).join('');
  }
  act.forEach(([k, , t2]) => {
    const el = document.getElementById('dbf_' + k);
    if (el) el.style.transform = `scaleX(${Math.min(1, t2 / DBF_MAX[k])})`;
  });
}
const bigHearts = [];                                        // o coração grande (e o beijo) da waifu
function drawBigHearts(dt){
  for (let i = bigHearts.length - 1; i >= 0; i--){
    const h2 = bigHearts[i];
    h2.t += dt;
    const pr = h2.t / 1.7;
    if (pr >= 1){ bigHearts.splice(i, 1); continue; }
    if (h2.kiss){                                             // beijinho: boquinha subindo com um chuac
      const s = pr < .16 ? .6 + ease(pr / .16) * 2.4 : 3 + Math.sin((pr - .16) * 8) * .16;
      const voa = h2.tx != null;                              // com destino, ele ATRAVESSA a tela até lá
      const rise = ease(pr) * (voa ? 24 : 44);
      const bx2 = voa ? h2.x + (h2.tx - h2.x) * ease(pr) : h2.x;
      const by2 = voa ? h2.y + (h2.ty - h2.y) * ease(pr) : h2.y;
      const kx = bx2 + Math.sin(h2.t * 6) * 1.5, ky = by2 - rise;
      const al = pr < .5 ? 1 : 1 - (pr - .5) / .5;
      const q = (x2, y2, w2, hh2, c) => P(kx + x2 * s, ky + y2 * s, Math.max(1, w2 * s), Math.max(1, hh2 * s), c);
      q(-4, -2, 3, 2, `rgba(224,74,106,${al})`); q(1, -2, 3, 2, `rgba(224,74,106,${al})`);   // lábio de cima
      q(-1, -1, 2, 1, `rgba(160,44,70,${al})`);
      q(-3, 0, 6, 2, `rgba(201,58,90,${al})`);                // lábio de baixo
      q(-2, 2, 4, 1, `rgba(160,44,70,${al * .8})`);
      q(-3, -2, 1, 1, `rgba(255,190,205,${al})`);             // brilho
      continue;
    }
    const s = pr < .18 ? .6 + ease(pr / .18) * 2.6 : 3.2 + Math.sin((pr - .18) * 9) * .18;  // pop com overshoot
    const rise = ease(pr) * 52;
    const hx = h2.x + Math.sin(h2.t * 5) * 2, hy = h2.y - rise;
    const al = pr < .45 ? 1 : 1 - (pr - .45) / .55;          // esvanece enquanto sobe
    const q = (x2, y2, w2, hh2, c) => P(hx + x2 * s, hy + y2 * s, Math.max(1, w2 * s), Math.max(1, hh2 * s), c);
    q(-3, -4, 2, 1, `rgba(201,90,110,${al})`); q(1, -4, 2, 1, `rgba(201,90,110,${al})`);
    q(-4, -3, 8, 2, `rgba(226,110,140,${al})`);
    q(-4, -1, 8, 2, `rgba(226,110,140,${al})`);
    q(-3, 1, 6, 1, `rgba(201,90,110,${al})`);
    q(-2, 2, 4, 1, `rgba(201,90,110,${al})`);
    q(-1, 3, 2, 1, `rgba(160,60,84,${al})`);
    q(-3, -3, 2, 2, `rgba(255,190,205,${al})`);              // brilho
  }
}
function hearts(x, y){
  for (let i = 0; i < 16; i++){                              // explosão de corações
    const ang = i / 16 * Math.PI * 2 + hash(i, 4) * .5;
    const spd = 22 + hash(i, 77) * 34;
    dust.push({
      x: x, y: y - 34,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd * .6 - 16,
      life: .9 + hash(i, 8) * .6, kind: 'heart',
    });
  }
}

/* ---------------- MÓVEIS (biblioteca) ---------------- */
function propCheese(i, j){ return () => {                     // rodas de queijo da amada, sobre a toalhinha
  const wheel = (x, y, a, h, cT, cS) => {
    E(x, y, a + 1, Math.round((a + 1) * .5), OUT);
    P(x - a, y - h, a * 2, h, cS); E(x, y, a, Math.round(a * .5), cS);
    P(x - a - 1, y - h, 1, h, OUT); P(x + a, y - h, 1, h, OUT);
    E(x, y - h, a + 1, Math.round((a + 1) * .5), OUT);
    E(x, y - h, a, Math.round(a * .5), cT);
    E(x - (a >> 2), y - h, 3, 2, cS); E(x + (a >> 2), y - h - 1, 2, 1, cS);
  };
  const x = gX(i + .5, j), y = gY(i + .5, j) + 4;
  shadowE(x, y + 1, 46);
  wheel(x - 17, y, 20, 13, '#d9a234', '#a87a24');             // a pilha clássica de sempre
  wheel(x + 18, y + 2, 15, 11, '#c9a23c', '#977222');
  wheel(x - 5, y - 13, 14, 10, '#d9a234', '#a87a24');
}; }
function propDresser(i, j){ return () => {                    // cômoda c/ abajur aceso e cinzeiro
  const [x, y] = pb(i, j);
  const t = performance.now() / 1000;
  shadowE(x, y - 16, 24);
  tboxO(x, y - 4, 12, 12, 12, '#6b5636', '#33281a', '#42331f');   // pegada de 12 → base em gY+12
  // GAVETAS: as faces do móvel são INCLINADAS. Como retângulo de y fixo elas escorriam pra fora e
  // as puxadoras ficavam boiando embaixo da cômoda. Agora acompanham a inclinação da face.
  const faceL = (c0, w2, d0, h2, c) => {                      // face esquerda
    for (let c2 = c0; c2 < c0 + w2; c2++) P(x - c2, y - 16 - (c2 >> 1) + d0, 1, h2, c);
  };
  const faceR = (c0, w2, d0, h2, c) => {                      // face direita
    for (let c2 = c0; c2 < c0 + w2; c2++) P(x + c2, y - 16 - (c2 >> 1) + d0, 1, h2, c);
  };
  faceL(4, 15, 2, 4, '#3d3020'); faceL(4, 15, 2, 1, '#24190e'); faceL(9, 5, 4, 1, '#8a929b');
  faceL(4, 15, 8, 4, '#3d3020'); faceL(4, 15, 8, 1, '#24190e'); faceL(9, 5, 10, 1, '#8a929b');
  faceR(3, 15, 2, 4, '#4c3c26'); faceR(3, 15, 2, 1, '#2c2114'); faceR(8, 5, 4, 1, '#8a929b');
  faceR(3, 15, 8, 4, '#4c3c26'); faceR(3, 15, 8, 1, '#2c2114'); faceR(8, 5, 10, 1, '#8a929b');
  const TY = y - 4 - 12;                                      // TAMPO da cômoda (base + altura)
  const pt = (dA, dB) => [x + 2 * dA - 2 * dB, TY - dA - dB];  // ponto no plano do tampo
  const [lx, ly] = pt(3, 8);                                  // ABAJUR no fundo-esquerda do tampo
  tboxO(lx, ly + 2, 3, 3, 2, '#3a4049', '#20242b', '#2c313b');   // pé do abajur: caixinha, não mancha
  P(lx - 1, ly - 9, 2, 9, '#232833');                        // haste, encostando no pé
  for (let r = 0; r < 7; r++)                                // cúpula
    P(lx - 3 - r, ly - 16 + r, 6 + r * 2, 1, r % 2 ? '#c9a23c' : '#d9b45a');
  P(lx - 9, ly - 9, 18, 1, '#8a6c22');                       // aro da cúpula, do tamanho DELA (20 sobrava pros lados)
  P(lx - 1, ly - 11 + (((t * 8) | 0) % 2), 2, 2, '#faf0c8'); // lâmpada tremeluzindo
  glowAt(lx, ly - 11, 26, '240,190,90', .38);                 // luz quente do abajur
  const [ax, ay] = pt(7, 4);                                  // CINZEIRO no tampo, com folga da beirada
  tboxO(ax, ay, 3.5, 3.5, 2, '#6a7280', '#39404d', '#525a66');   // pratinho raso, assentado no tampo
  isoTop(ax, ay - 2, 2.6, 2.6, '#2a2d34');                    // cavidade
  P(ax - 2, ay - 6, 4, 1, '#4a5260');                         // cinza no fundo
  for (let c = 0; c < 9; c++)                                 // cigarro atravessado, na inclinação do tampo
    P(ax - 6 + c, ay - 5 - (c >> 1), 1, 1, c > 6 ? '#e8963c' : c % 2 ? '#e8e4da' : '#d8d4ca');
  P(ax + 3, ay - 9, 1, 1, ((t * 6) | 0) % 2 ? '#e05a3a' : '#8a3a2a');      // brasa
  for (let k2 = 0; k2 < 4; k2++)                             // fumaça fina subindo
    P(ax + 3 + Math.round(Math.sin(t * 1.5 + k2) * (1 + k2 * .5)), ay - 11 - k2 * 3, 1, 1,
      `rgba(170,180,195,${(.36 - k2 * .07).toFixed(2)})`);
}; }
function propWardrobe(i, j){ return () => {                   // guarda-roupa na ESCALA do tile (~46px de base)
  const [x, y0] = pb(i, j), y = y0 + 2;                       // pegada de 22 → base em gY+11, centro do losango
  const t = performance.now() / 1000;
  E(x, y - 18, 22, 8, 'rgba(4,5,10,.4)');                     // sombra CENTRADA no tile, não jogada pra frente
  isoTop(x, y - 7, 11, 11, '#4d3c26');                        // base em iso rasa: assenta no meio do tile
  P(x - 19, y - 11, 4, 6, '#33281a'); P(x + 15, y - 11, 4, 6, '#33281a');  // pés nas arestas
  P(x - 2, y - 5, 4, 5, '#33281a');
  P(x - 22, y - 52, 44, 45, OUT);                             // corpo frontal
  P(x - 21, y - 51, 42, 43, '#6b5636');
  P(x - 24, y - 57, 48, 5, '#8a7448'); P(x - 24, y - 57, 48, 1, '#a08850');// cornija larga
  P(x - 23, y - 52, 46, 1, '#5c4a30');
  // porta esquerda ABERTA: varal com 4 roupinhas penduradas
  P(x - 20, y - 50, 19, 39, '#221a10');
  P(x - 20, y - 44, 19, 2, '#8a7448');
  const CLT = [['#c94a5a', 12], ['#4a7ac0', 14], ['#5f8f57', 10], ['#c9a23c', 13]];
  CLT.forEach(([cc, hh], k2) => {
    const cx2 = x - 18 + k2 * 5;
    P(cx2 + 1, y - 45, 1, 3, '#c9d2dc');                      // gancho do cabide
    P(cx2, y - 42, 4, hh, cc);
    P(cx2, y - 42, 1, hh, 'rgba(0,0,0,.25)');
  });
  P(x - 20, y - 15, 19, 6, '#181209');                        // fundo da base
  P(x - 31, y - 54, 9, 46, OUT);                              // porta batente aberta
  P(x - 30, y - 53, 7, 44, '#5c4a30');
  P(x - 30, y - 53, 7, 2, '#6b5636');
  P(x - 30, y - 32, 2, 11, 'rgba(20,14,8,.3)');
  P(x - 25, y - 32, 2, 5, '#c9a23c');
  P(x + 1, y - 50, 19, 39, '#5c4a30');                        // porta direita com espelho alto
  P(x + 2, y - 49, 17, 37, '#6b5636');
  P(x + 4, y - 47, 12, 27, '#1a222c');
  P(x + 5, y - 46, 1, 25, '#aebfd8');
  P(x + 7 + (((t * 2) | 0) % 5), y - 43, 1, 7, 'rgba(220,232,248,.5)');    // brilho passeando
  P(x + 2, y - 32, 2, 5, '#c9a23c');
  P(x + 2, y - 17, 17, 6, '#4d3c26'); P(x + 6, y - 15, 8, 1, '#8a929b');   // gavetão
  P(x - 1, y - 50, 2, 39, 'rgba(20,14,8,.5)');                // vão central
}; }
function propRug(i, j){ return () => {                        // TAPETE XADREZ: quadrado de 9 tiles no centro
  const [bx, by] = pb(i, j);                                  // vértice sul do tile do meio
  const at = (a2, b2) => {                                    // posição do tile JÁ com o tremor da escavação
    const [px, py] = pb(i + a2, j + b2);
    const hp = tileHopAt(i + a2, j + b2);                     // o tapete salta junto com o chão
    return hp ? [px + hp[0], py - hp[1]] : [px, py];
  };
  // 1ª passada desenha os losangos MAIORES: o excesso some sob os vizinhos e só a borda do bloco sobrevive
  for (let pass = 0; pass < 2; pass++)
    for (let a2 = -1; a2 <= 1; a2++)
      for (let b2 = -1; b2 <= 1; b2++){
        const [x, y] = at(a2, b2);
        if (pass === 0){
          isoTop(x, y + 1.6, 17.6, 17.6, OUT);                // contorno preto do tapete inteiro
          isoTop(x, y + .8, 16.8, 16.8, '#4e4856');           // debrum de tecido cinza
          continue;
        }
        const dark = ((i + a2 + j + b2) & 1) === 0;           // xadrez preso às coordenadas do tile
        isoTop(x, y, 16, 16, dark ? '#191a22' : '#ddd8cc');
        const wear = dark ? '#24252f' : '#c9c3b5';            // trama gasta: tira o ar de adesivo
        for (let k = 0; k < 5; k++){
          const hx = (hash(i + a2 + k * 7, j + b2 + 3) - .5) * 40;
          const hy = (hash(i + a2 + 5, j + b2 + k * 11) - .5) * 16;
          P(x + hx, y - 16 + hy, 2, 1, wear);
        }
        if (!dark) P(x - 12, y - 22, 8, 1, 'rgba(255,255,255,.4)');   // brilho do pelo no quadrado claro
        else P(x - 10, y - 22, 7, 1, 'rgba(255,255,255,.06)');
      }
}; }
function propShelf(i, j){ return () => {                      // estante de poções do laboratório
  const [x, y0] = pb(i, j);
  const y = y0 - 8;
  shadowE(x, y0 - 6, 15);
  P(x - 13, y - 40, 26, 42, OUT);
  P(x - 12, y - 39, 24, 40, '#4a3320');
  P(x - 12, y - 39, 24, 2, '#5f4429');
  for (let p2 = 0; p2 < 3; p2++){                            // três prateleiras carregadas
    const sy = y - 33 + p2 * 12;
    P(x - 12, sy + 8, 24, 2, '#6b4a28');
    P(x - 12, sy + 8, 24, 1, '#84603a');
    for (let f = 0; f < 4; f++){
      const fx = x - 10 + f * 6, cor = ['#8ae05a', '#c86af8', '#f2c14e', '#e8607a'][(f + p2) % 4];
      const alt = 5 + ((f + p2) % 3);
      P(fx, sy + 8 - alt, 4, alt, OUT);
      P(fx + 1, sy + 9 - alt, 2, alt - 1, cor);
      P(fx + 1, sy + 9 - alt, 2, 1, 'rgba(255,255,255,.45)');
      glowAt(fx + 2, sy + 6 - alt, 7, cor === '#8ae05a' ? '140,230,90' : cor === '#c86af8' ? '200,110,250' : '242,193,78', .2);
    }
  }
}; }
function propSofa(i, j){ return () => {                       // SOFÁ de 2 tiles: braços do chão, assento ENTRE eles
  const [x, y] = pb(i + 1, j);
  const A = 11, B = 27, H = 8, AR = 5;                        // B − A = 16 centra a pegada nos dois tiles · AR = braço
  const SY = y - 5;                                           // âncora da pegada no chão
  const base = (dA, dB) => [x + 2 * dA - 2 * dB, SY - dA - dB];        // ponto no CHÃO
  const top = (dA, dB) => [x + 2 * dA - 2 * dB, SY - H - dA - dB];     // ponto no plano do assento
  const CT = '#c93a3a', CL = '#6e1f1f', CR = '#a82e2e';
  shadowE(x - 16, y - 22, 42);
  const arm = (dB) => {                                       // braço: painel inteiro, do chão até acima do assento
    const [ax2, ay2] = base(0, dB);
    // 8 acima do assento: 7 deixava o encosto passar 1px do braço e sobrava um espeto vermelho
    tboxO(ax2, ay2, A, AR, H + 8, CT, CL, CR);
    for (let c = 1; c < A * 2 - 1; c++)                       // luz CONTÍNUA na quina de cima do braço
      P(ax2 + c, ay2 - (c >> 1) - H - 8, 1, 1, '#e05a5a');
  };
  arm(B - AR);                                                // braço do fundo (atrás de tudo)
  { const [sx2, sy2] = base(0, AR);                           // ASSENTO, só o vão entre os braços
    tboxO(sx2, sy2, A, B - AR * 2, H, '#a82e2e', '#5e1a1a', '#8a2424'); }
  { const [bx2, by2] = top(A - 4, AR);                        // ENCOSTO, na aresta de trás do assento
    tboxO(bx2, by2, 4, B - AR * 2, 13, CT, CL, CR);
    for (let c = 3; c < (B - AR * 2) * 2 - 2; c += 7)         // capitonê acompanhando o tecido
      P(bx2 - c, by2 - (c >> 1) - 11, 1, 8, 'rgba(90,20,20,.35)'); }
  // ALMOFADAS: vão de 17 unidades entre os braços vira folga 1 + 7 + folga 1 + 7 + folga 1.
  // Ordem do FUNDO pra FRENTE — invertida, a almofada de trás pintava por cima da da frente.
  for (const dB of [AR + 9, AR + 1]){
    const [cx2, cy2] = top(.5, dB);
    tboxO(cx2, cy2, 6.5, 7, 3, CT, '#7d2020', CR);
    P(cx2 - 7, cy2 - 5, 6, 1, 'rgba(255,180,180,.22)'); }
  arm(0);                                                     // braço da frente, por último: fica na frente mesmo
  // o "remendo" de tecido saiu: era desenhado com y fixo numa face INCLINADA e ficava boiando
  // fora do estofado, parecendo um pixel perdido.
}; }
/* ---- CANAL DA ESPONJA: o desenho favorito do ratinho, passando na tevê de tubo.
   Cabe numa tela de 19x14 — então é homenagem em pixel, não retrato. ---- */
let tvCanal = 0;                                              // 0 = chuvisco · 1 = a esponja
const TV_CANAIS = ['chuvisco', 'a esponja do fundo do mar'];
function canalEsponja(TX, TY, fr){
  const AM = '#f2e04a', AM2 = '#c9b62c', AM3 = '#fff6a8', MAR = '#1e6a9e', MAR2 = '#2e86bd';
  P(TX, TY, 19, 14, MAR);                                     // fundo do mar
  P(TX, TY, 19, 4, MAR2);
  for (let b2 = 0; b2 < 4; b2++){                             // bolhinhas subindo
    const bx = TX + 1 + ((hash(b2, 7) * 17) | 0);
    const by = TY + 12 - (((fr * .5 + b2 * 9) | 0) % 13);
    P(bx, by, 1, 1, 'rgba(200,240,255,.75)');
  }
  P(TX, TY + 12, 19, 2, '#c9a86a');                           // areia
  P(TX, TY + 12, 19, 1, '#e0c890');
  const bob = ((fr / 6) | 0) % 2;                             // ele balança de leve
  const bx0 = TX + 4, by0 = TY + 1 + bob;
  P(bx0 - 1, by0 - 1, 12, 11, '#8a7a1a');                     // contorno
  P(bx0, by0, 10, 9, AM);                                     // o corpo esponjoso
  P(bx0, by0, 10, 1, AM3);
  [[1, 1], [7, 2], [3, 5], [8, 6], [2, 7], [6, 4]].forEach(([ox, oy]) =>
    P(bx0 + ox, by0 + oy, 1, 1, AM2));                        // os furinhos
  const piscou = (((fr / 9) | 0) % 11) === 0;
  P(bx0 + 1, by0 + 2, 3, 3, '#ffffff'); P(bx0 + 6, by0 + 2, 3, 3, '#ffffff');   // olhões
  if (piscou){ P(bx0 + 1, by0 + 3, 3, 1, '#3a3a1a'); P(bx0 + 6, by0 + 3, 3, 1, '#3a3a1a'); }
  else {
    P(bx0 + 2, by0 + 3, 1, 2, '#2e86bd'); P(bx0 + 7, by0 + 3, 1, 2, '#2e86bd');
    P(bx0 + 2, by0 + 3, 1, 1, '#14151a'); P(bx0 + 7, by0 + 3, 1, 1, '#14151a');
  }
  P(bx0 + 2, by0 + 6, 6, 1, '#8a5a2a');                       // o sorrisão
  P(bx0 + 3, by0 + 7, 4, 1, '#8a5a2a');
  P(bx0 + 4, by0 + 7, 1, 1, '#ffffff'); P(bx0 + 5, by0 + 7, 1, 1, '#ffffff');   // os dois dentes
  P(bx0 + 1, by0 + 5, 1, 1, '#e88a8a'); P(bx0 + 8, by0 + 5, 1, 1, '#e88a8a');   // bochechas
  P(bx0, by0 + 9, 10, 1, '#ffffff');                          // colarinho
  P(bx0 + 4, by0 + 9, 2, 3, '#c93a3a');                       // gravatinha vermelha
  P(bx0 + 1, by0 + 10, 8, 2, '#6a4a2a');                      // calça marrom
  P(bx0 + 2, by0 + 12, 2, 1, '#ffffff'); P(bx0 + 6, by0 + 12, 2, 1, '#ffffff');
  P(TX + 16, TY + 8, 2, 4, '#2e7a4a'); P(TX + 15, TY + 6, 1, 3, '#2e7a4a');     // uma alga no canto
}
function propTV(i, j){ return () => {                         // televisão de tubo achada no lixo
  const x = gX(i, j), y = gY(i, j) + 8;                       // base em gY+8: pegada de 17 assentada no meio do tile
  shadowE(x, y + 2, 20);
  P(x - 17, y - 6, 34, 7, OUT);                              // móvel baixo
  P(x - 16, y - 5, 32, 5, '#4a3a28'); P(x - 16, y - 5, 32, 1, '#5c4a30');
  P(x - 15, y - 29, 30, 24, OUT);                            // caixa
  P(x - 14, y - 28, 28, 22, '#3a3d45');
  P(x - 14, y - 28, 28, 2, '#4a5262');
  const TX = x - 11, TY = y - 25;                             // canto da tela (19x14)
  const fr = (performance.now() / 90) | 0;
  if (tvCanal === 1) canalEsponja(TX, TY, fr);                // o canal da esponja
  else {
    P(TX, TY, 19, 14, '#0d1420');                            // tela com estática
    for (let s = 0; s < 26; s++){
      const sx = TX + ((hash(s, fr % 97) * 19) | 0);
      const sy = TY + ((hash(s + 40, fr % 89) * 14) | 0);
      P(sx, sy, 1, 1, hash(s, fr % 83) > .5 ? '#8aa2c8' : '#2a3a52');
    }
  }
  P(TX, TY, 19, 1, 'rgba(174,191,216,.3)');
  if (tvCanal === 1 && !LOWFX)                                // a luz da tela pinta o canto da sala
    glowAt(x, y - 18, 40, '120,200,240', .12 + Math.sin(performance.now() / 260) * .04);
  P(x + 10, y - 24, 3, 3, '#22262e'); P(x + 11, y - 23, 1, 1, '#8a929b'); // botões
  P(x + 10, y - 18, 3, 3, '#22262e'); P(x + 11, y - 17, 1, 1, '#8a929b');
  for (let k2 = 0; k2 < 7; k2++){                            // antena em V
    P(x - 3 - k2, y - 31 - k2, 1, 1, '#8a929b');
    P(x + 1 + k2, y - 31 - k2, 1, 1, '#8a929b');
  }
  P(x - 2, y - 31, 3, 2, '#22262e');
  // Nintendo 64 acoplado, na frente do móvel
  const nx = x + 16, ny = y + 4;
  E(nx, ny + 1, 10, 4, 'rgba(4,5,10,.35)');
  P(nx - 9, ny - 6, 18, 6, OUT);
  P(nx - 8, ny - 5, 16, 4, '#33363e');
  P(nx - 8, ny - 5, 16, 1, '#4a4e58');
  P(nx - 3, ny - 9, 6, 4, OUT); P(nx - 2, ny - 8, 4, 3, '#33363e');  // torre do cartucho
  P(nx - 1, ny - 10, 2, 2, '#8a6c22'); P(nx - 1, ny - 10, 2, 1, GOLD); // fita "Rats 64"
  P(nx + 5, ny - 4, 1, 1, '#e05a3a');                        // LED ligado
  for (let k2 = 0; k2 < 8; k2++)                             // cabo espiralado
    P(nx - 10 - k2 * 2, ny - 1 + (k2 % 2 ? 1 : 0), 2, 1, '#22262e');
  P(nx - 30, ny - 3, 9, 5, OUT); P(nx - 29, ny - 2, 7, 3, '#4a4e58');  // controle trident
  P(nx - 28, ny - 1, 1, 1, '#4a9ae0'); P(nx - 26, ny - 1, 1, 1, '#e0d84a');
  P(nx - 27, ny - 2, 1, 1, '#e05a5a'); P(nx - 24, ny - 1, 1, 1, '#5ac06a');
  for (let k2 = 0; k2 < 5; k2++) P(nx - 7 + k2, ny - 7 - k2, 1, 1, '#22262e');  // fio até a TV
}; }
const lanAvatar = {};                                         // canvas por usuário: assa uma vez, carimba sempre
function avatarLan(u){
  if (lanAvatar[u.id]) return lanAvatar[u.id];
  const skin = {
    fur: u.fur, furD: u.furD, furHi: u.furHi, rim: '#8a7a5e',
    tail1: '#584b46', tail2: '#7d6a62', glint: '#c99a4a', nose: '#9a5a5a',
    cape: true, capeCols: u.capa, nick: false, brow: true, lashes: false, apron: false, bow: false,
    acc: Object.assign({ hat: u.hat, hatHue: null, cape: 'x', fant: 'none' }, u.acc),
  };
  const pose = { crouch: 1, stretch: 0, earY: 0, tail: 0, blink: false, air: 0, lean: 0, capeLag: 0, flash: 0, armP: -1 };
  drawRatSprite(false, pose, skin, 0);
  const c = document.createElement('canvas'); c.width = 64; c.height = 66;
  c.getContext('2d').drawImage(RS, 0, 0);
  lanAvatar[u.id] = c;
  return c;
}
function propPC(i, j, idx){ return () => {                    // estação da lan house
  const x = gX(i, j), y = gY(i, j) + TT() - 2;
  const t = performance.now() / 1000;
  const u = LAN_USERS[idx];
  shadowE(x, y + 2, 18);
  /* O DONO — sentado AO LADO da mesinha, não dentro dela. Antes ele ficava atrás do monitor e a
     tela caía no meio do peito: parecia um rato acoplado ao computador, o que é assustador. */
  if (u){
    const av = avatarLan(u);
    const bob = Math.round(Math.sin(t * 4 + idx) * .5);       // respirando na cadeira
    const lado = (idx % 2 ? 1 : -1) * 15;                     // um pra cada lado: a fileira não fica enfileirada
    P(x + lado - 6, y - 9, 12, 8, OUT);                       // banquinho
    P(x + lado - 5, y - 8, 10, 6, '#4a3a24'); P(x + lado - 5, y - 8, 10, 1, '#6a5436');
    g.save();
    if (!lanStatus[idx]) g.globalAlpha = .62;                 // porta muda: ele está aí, mas de bobeira
    g.drawImage(av, Math.round(x + lado - 32), Math.round(y - 62 + bob));
    g.restore();
  }
  P(x - 13, y - 12, 26, 4, OUT); P(x - 12, y - 11, 24, 2, '#5c4a30');       // mesa
  P(x - 11, y - 8, 3, 9, '#33281a'); P(x + 8, y - 8, 3, 9, '#33281a');
  P(x - 9, y - 27, 18, 16, OUT);                              // monitor CRT
  P(x - 8, y - 26, 16, 14, '#3a3d45'); P(x - 8, y - 26, 16, 2, '#4a5262');
  P(x - 6, y - 24, 12, 9, '#0d1a12');
  const on = !!lanStatus[idx];
  if (on){                                                    // terminal verde rodando
    for (let r = 0; r < 3; r++)
      P(x - 5, y - 23 + r * 2, 4 + ((hash(r + idx * 7, ((t * 3) | 0) % 53) * 7) | 0), 1, '#3fae5a');
    P(x - 5 + (((t * 7 + idx) | 0) % 9), y - 17, 2, 1, '#7ae08a');
  } else {                                                    // protetor de tela vagando
    P(x - 1 + Math.round(Math.sin(t + idx) * 3), y - 21 + Math.round(Math.cos(t * .7 + idx) * 2), 2, 2, '#22303a');
  }
  P(x - 7, y - 14, 14, 3, '#22262e');                         // teclado
  if (u){
    const bob = ((t * 5 + idx) | 0) % 2;
    const ledc = u.capa ? u.capa[0] : '#5ac06a';              // LED do headset na cor da capa do dono
    const lado = (idx % 2 ? 1 : -1) * 15;
    const hx = x + lado, hy = y - 42;                         // cabeça do avatar, já no lugar novo
    g.save();
    if (!lanStatus[idx]) g.globalAlpha = .62;
    P(hx - 8, hy - 9, 16, 2, '#181a20');                      // HEADSET: arco por cima do chapéu
    P(hx - 9, hy - 8, 2, 3, '#181a20'); P(hx + 7, hy - 8, 2, 3, '#181a20');
    P(hx - 11, hy - 5, 4, 8, '#22262e'); P(hx + 7, hy - 5, 4, 8, '#22262e');   // conchas nas orelhas
    P(hx - 11, hy - 3, 1, 4, ledc); P(hx + 10, hy - 3, 1, 4, ledc);
    P(hx + 10, hy + 3, 3, 1, '#181a20'); P(hx + 12, hy + 4, 1, 3, '#181a20');  // hastezinha do microfone
    if (on){                                                  // braço esticado até o teclado, digitando
      const bx2 = lado > 0 ? x - 4 : x + 2;
      P(bx2, y - 16 - bob, 3, 2, u.fur);
      P(bx2 + (lado > 0 ? 3 : -3), y - 15 + bob, 3, 2, u.furD);
    }
    g.restore();
  }
}; }
function propMousetrap(i, j){ return () => {                  // ratoeira "de decoração" (ninguém confia)
  const x = gX(i, j), y = gY(i, j) + 6;                       // pegada pequena: base em gY+6
  E(x, y + 1, 13, 4, 'rgba(4,5,10,.3)');
  P(x - 12, y - 5, 24, 7, OUT);
  P(x - 11, y - 4, 22, 5, '#a8854c');                        // base de madeira
  P(x - 11, y - 4, 22, 1, '#c9a668');
  for (let k2 = 0; k2 < 4; k2++) P(x - 9 + k2 * 2, y - 6 - (k2 % 2), 2, 2, '#6a7280');  // mola
  P(x + 2, y - 6, 8, 2, '#8a929b');                          // barra do gatilho
  P(x + 8, y - 9, 2, 5, '#8a929b');
  P(x - 3, y - 7, 5, 3, '#e8bc50'); P(x - 3, y - 7, 5, 1, '#f2d06a');    // isca
}; }
function secretLoot(x, y){                                    // achadinho: queijo em DOBRO, sem festa pesada
  current.pickups.push({ x, y, kind: 'cheese' });
  const viz = DIRV.map(([ox, oy]) => [x + ox, y + oy]).find(([a2, b2]) => current.free(a2, b2));
  if (viz) current.pickups.push({ x: viz[0], y: viz[1], kind: 'cheese' });
  rings.push({ x: gX(x, y), y: gY(x, y), t: 0, gold: true });
  SFX.item();
  for (let i2 = 0; i2 < 8; i2++){                             // 8 fagulhas baratas: não trava o quadro
    const an = i2 / 8 * 6.2832;
    dust.push({ x: gX(x, y), y: gY(x, y) - 10, vx: Math.cos(an) * 50, vy: Math.sin(an) * 28 - 30,
      gv: 170, life: .35, kind: 'hit' });
  }
  toast('🧀 achadinho: queijo em dobro');
}
function propBarrel(i, j){ return () => {
  const x = gX(i, j), y = gY(i, j) + 12;                      // base em gY+8: o barril repousa no meio do losango
  shadowE(x, y, 24);
  E(x, y - 4, 17, 8, OUT);                                    // contorno da base
  for (let r = 0; r < 26; r++){
    const bulge = Math.round(Math.sin(r / 25 * Math.PI) * 4);
    let c = r > 22 ? '#3c2f1e' : '#4a3a28';
    if (r === 6 || r === 7 || r === 18 || r === 19) c = '#232833';   // aros
    P(x - 16 - bulge, y - r - 4, (16 + bulge) * 2, 1, OUT);   // contorno lateral
    P(x - 15 - bulge, y - r - 4, (15 + bulge) * 2, 1, c);
    P(x - 15 - bulge, y - r - 4, 2, 1, '#2e2418');
    P(x + 13 + bulge, y - r - 4, 2, 1, '#5c4a30');
  }
  E(x, y - 30, 16, 7, OUT); E(x, y - 30, 15, 6, '#5c4a30');
  E(x, y - 30, 11, 4, '#3c2f1e');
}; }
function propChest(i, j, bau){ return () => {                 // BAÚ DO TESOURO: caixa ISOMÉTRICA no meio do tile
  if (bau && bau.aberto) return;                              // aberto some: o prêmio (ou o castigo) já saiu
  const x = gX(i, j), y = gY(i, j) + 11;                      // vértice sul da PEGADA (22 de meia-largura)
  const t = performance.now() / 1000;
  if (bau){                                                   // o da dungeon respira ouro pra puxar o olho
    const pu = .5 + Math.sin(t * 2.1 + i) * .5;
    glowOval(x, y - 4, 22, 10, '246,206,90', .16 + pu * .1);
    glowAt(x, y - 22, 26, '246,206,90', .1 + pu * .08);
  }
  const A = 11, H = 12, LA = A + 1.5;                         // pegada · altura do corpo · abas da tampa
  // detalhe colado numa face: o pixel na lateral c fica em (x±c, y-(c>>1)) — mesma conta do tbox
  const faceR = (u, v, w, h2, c) => { for (let k = 0; k < w; k++) P(x + u + k, y - ((u + k) >> 1) - v - h2 + 1, 1, h2, c); };
  const faceL = (u, v, w, h2, c) => { for (let k = 0; k < w; k++) P(x - u - k, y - ((u + k) >> 1) - v - h2 + 1, 1, h2, c); };
  shadowE(x, y - 3, 26);
  tboxO(x, y, A, A, H, '#3c2712', '#33210e', '#54381f');      // CORPO assentado no losango
  for (const u of [8, 15])                                    // juntas das tábuas nas duas faces
    { faceR(u, 1, 1, H - 2, 'rgba(18,10,4,.45)'); faceL(u, 1, 1, H - 2, 'rgba(18,10,4,.45)'); }
  faceR(0, H - 2, A * 2, 1, '#6b4a2a'); faceL(0, H - 2, A * 2, 1, '#43301a');   // luz raspando a aresta de cima
  tboxO(x, y - H + 2, LA, LA, 4, '#5f4224', '#3f2b15', '#6b4a2a');   // TAMPA: aba saliente sobre o corpo
  const C0 = y - H - 2 - LA;                                  // centro do tampo da aba = base da cúpula
  isoTop(x, C0 - .2 + LA, LA + .5, LA + .5, OUT);             // silhueta só na base da cúpula: nada de degrau
  for (let r = 1; r <= 5; r++){                               // CÚPULA baixinha: o tampo abaula sem escadinha
    const Ar = LA * Math.cos(r / 6.6 * 1.5708), Cr = C0 - r * 1.1;
    isoTop(x, Cr + Ar, Ar, Ar, r < 3 ? '#654626' : r < 5 ? '#75522e' : '#835c34');
  }
  { const Ar = LA * Math.cos(5 / 6.6 * 1.5708), Cr = C0 - 5.5;
    P(x - Ar * 1.4, Cr + 2, Ar, 1, 'rgba(255,236,190,.14)'); }   // um fio de luz no alto da tampa
  for (const u of [4, 17]){                                   // 2 cintas finas de ferro descendo pelas faces
    faceR(u, 0, 2, H, '#a8842e'); faceR(u, 0, 1, H, '#c9a23c');
    faceL(u, 0, 2, H, '#7d6122'); faceL(u, 0, 1, H, '#a8842e');
    faceR(u, H + 1, 2, 3, '#a8842e'); faceL(u, H + 1, 2, 3, '#7d6122');
    faceR(u, 2, 1, 1, '#f2d98a'); faceR(u, H - 4, 1, 1, '#f2d98a');   // rebites pegando a luz
  }
  const gl = .5 + Math.sin(t * 2.2) * .3;                     // a FRESTA DO TESOURO respira
  faceR(1, H - 1, A * 2 - 2, 1, `rgba(246,206,90,${(.28 + gl * .45).toFixed(2)})`);
  faceL(1, H - 1, A * 2 - 2, 1, `rgba(246,206,90,${(.16 + gl * .26).toFixed(2)})`);
  g.save();
  g.globalCompositeOperation = 'lighter';
  blurFx(2);
  lote(() => faceR(3, H - 3, A * 2 - 6, 3, `rgba(246,206,90,${(.07 + gl * .1).toFixed(2)})`));
  g.restore();
  faceR(8, 2, 7, 8, OUT);                                     // FECHADURA no meio da face iluminada
  faceR(9, 3, 5, 6, GOLD);
  faceR(9, 8, 5, 1, '#f2d98a');
  faceR(9, 3, 5, 1, '#8a6c22');
  faceR(11, 5, 1, 2, '#14151a');                              // buraco de chave
  faceR(10, 6, 3, 1, '#14151a');
  faceR(9, 7, 1, 1, '#fff4cc');
  faceR(9, H, 5, 2, OUT);                                     // ferrolho descendo da tampa até a placa
  faceR(10, H, 3, 1, '#c9a23c');
}; }
function propSacks(i, j){ return () => {
  const x = gX(i, j), y = gY(i, j) + 9;                       // idem: assentado no centro, não recuado
  shadowE(x, y, 24);
  E(x - 8, y - 8, 12, 10, OUT); E(x - 8, y - 9, 11, 9, '#6b5a44');
  E(x - 8, y - 13, 8, 5, '#7d6a50');
  P(x - 11, y - 20, 6, 4, '#5c4c38');
  E(x + 10, y - 5, 9, 7, OUT); E(x + 10, y - 6, 8, 6, '#5c4c38');
  P(x + 7, y - 13, 5, 3, '#4a3c2c');
  for (let s = 0; s < 6; s++) P(x - 14 + hash(s, 8) * 30, y - 2 + hash(s, 9) * 3, 2, 1, '#8a7442');
}; }
function propPillar(i, j){ return () => {                     // pilastra assentada no tile
  const [x, y] = pb(i, j);
  shadowE(x, y - 15, 24);
  tboxO(x, y - 1, 11, 11, 44, '#434b59', '#282d38', '#39404d');
  isoTopO(x, y - 47, 13, 13, '#4a5262');                      // capitel
  isoTop(x, y - 49, 13, 13, '#434b59');
  P(x - 2, y - 34, 5, 1, '#22262e'); P(x + 5, y - 22, 6, 1, '#22262e');  // rachaduras
  P(x - 11, y - 7, 4, 2, '#46543f');                          // musgo na base
}; }
function propWallStump(i, j, falsa){ return () => {           // muro baixo de pedra (divisórias)
  const [x, y] = pb(i, j);
  tboxO(x, y - 1, 14, 14, 20, '#434b59', '#282d38', '#39404d');
  isoTopO(x, y - 22, 14, 14, '#4a5262');
  P(x - 4, y - 14, 6, 1, '#22262e'); P(x + 3, y - 8, 5, 1, '#22262e');   // juntas
  P(x - 10, y - 4, 3, 2, '#46543f');                          // musgo
  if (!falsa) return;
  // PAREDE FALSA: a rachadura é o único aviso. Discreta de propósito — quem repara, acha.
  const t = performance.now() / 1000;
  for (let k = 0; k < 7; k++) P(x - 6 + k, y - 17 + ((k * 5) % 4) - 1, 1, 2, '#1b1f27');
  P(x + 1, y - 12, 1, 5, '#1b1f27'); P(x + 2, y - 8, 1, 3, '#1b1f27');
  if (!LOWFX) P(x - 5 + (((t * 3) | 0) % 7), y - 17 + ((((t * 3) | 0) % 7) * 5 % 4) - 1, 1, 1,
    'rgba(242,193,78,' + (.12 + Math.sin(t * 2.2) * .1).toFixed(2) + ')');   // um fiapo de luz vazando
}; }
function propBones(i, j){ return () => {
  const x = gX(i, j), y = gY(i, j) + 2;
  P(x - 8, y - 3, 8, 2, '#c9c2b2'); P(x - 10, y - 4, 3, 3, '#c9c2b2'); P(x - 1, y - 4, 3, 3, '#c9c2b2');
  P(x + 4, y - 8, 6, 5, '#c9c2b2'); P(x + 5, y - 6, 1, 2, OUT); P(x + 8, y - 6, 1, 2, OUT); // crânio
  P(x + 5, y - 3, 4, 1, '#a8a294');
}; }
function propRubble(i, j){ return () => {
  const x = gX(i, j), y = gY(i, j) + 2;
  E(x - 6, y - 3, 6, 3, '#39404d'); E(x + 5, y - 2, 5, 3, '#434b59'); E(x, y - 6, 4, 2, '#4a5262');
}; }

// encolher um retângulo iso por dentro: k unidades em cada lado = mesma origem x, y-2k, a-2k, b-2k
function propBed(i, j){ return () => {                        // CAMA DE CASAL: 2x2 tiles
  /* Toda peça é posicionada em COORDENADAS DA CAMA, não no olho. O estrado é um losango: um
     ponto dele é (s,t) — s anda pro LESTE (a LARGURA), t anda pro OESTE (o COMPRIMENTO) — e
     `nivel(s,t,alt)` devolve a âncora de uma peça apoiada ali, `alt` acima do estrado. Recuar um
     losango SEM subir a âncora empurra ele pro canto sul; foi esse o bug original.
     Um tile tem 16 meias-diagonais, então os 2x2 dão 32x32. A cama NÃO é 32x32: cama quadrada
     lê como sofá, não como cama. Ela é 20 de largura por 30 de comprimento — proporção de móvel
     de verdade — e fica CENTRADA no quadrado (+6 na largura, +1 no comprimento).
     E a cabeceira é BAIXA: antes ela tinha quase a altura do comprimento da cama e o conjunto
     virava um trono. Cabeceira 14, postes 18, pé 8 — o olho lê cama na hora.                  */
  const [x, y] = pb(i + 1, j);
  const WT = '#8a6a44', WL = '#5e472c', WR = '#705236', WH = '#a58156';   // madeira
  const PT = '#6b5133', PL = '#402f1c', PR = '#553e26';                   // madeira escura
  const VM = '#a83a3a', VMD = '#5f1c1c', VMR = '#8c2c2c', VMH = '#d06a60';  // manta
  const A = 20, B = 30, OS = 6, OT = 1, AY = y - 4, FH = 6;
  const nivel = (s2, t2, alt) => [x + 2 * (s2 + OS) - 2 * (t2 + OT),
    AY - (s2 + OS) - (t2 + OT) - alt];
  const rail = (X, Y2, w, h2, c) => { for (let k = 0; k < w; k++) P(X + k, Y2 - (k >> 1) - h2 + 1, 1, h2, c); };
  const peca = (s2, t2, a2, b2, h2, alt, cT, cL, cR) => {
    const [px, py] = nivel(s2, t2, alt);
    tboxO(px, py, a2, b2, h2, cT, cL, cR);
    return [px, py];
  };
  shadowE(x - 28, y - 30, 70);

  // PÉS: quatro tocos curtos — sem eles a cama boia na sombra
  [[1, 1], [A - 5, 1], [1, B - 5], [A - 5, B - 5]].forEach(([s2, t2]) =>
    peca(s2, t2, 4, 4, 6, -FH, PT, PL, PR));

  // CABECEIRA: painel BAIXO atravessando a largura, e dois postes só um pouco mais altos
  { const [hx, hy] = peca(0, B - 3, A, 3, 14, 14, WT, WL, WR);
    rail(hx + 1, hy - 1, A * 2 - 2, 1, WH);
    rail(hx + 3, hy + 6, A * 2 - 6, 1, 'rgba(30,20,10,.32)');
    peca(0, B - 4, 4, 4, 18, 18, PT, PL, PR);
    peca(A - 4, B - 4, 4, 4, 18, 18, PT, PL, PR); }

  // ESTRADO
  { tboxO(x + 2 * OS - 2 * OT, AY - OS - OT, A, B, FH, WT, WL, WR);
    rail(x + 2 * OS - 2 * OT + 1, AY - OS - OT - FH + 1, A * 2 - 2, 1, WH); }

  // COLCHÃO: recuado 2 e indo ATÉ a cabeceira — a tira de estrado nu lia como buraco
  { const [mx, my] = peca(2, 2, A - 4, B - 5, 7, 7, '#ded4bf', '#a2957a', '#c6ba9f');
    for (let t2 = 5; t2 < B - 12; t2 += 7)
      rail(mx - t2 * 2 + 2, my - t2, (A - 4) * 2 - 4, 1, '#cdc2ab'); }

  // MANTA: transborda o colchão e pendura pelos lados — é o que faz virar cama
  { const MB = B - 14;
    const [dx2, dy2] = peca(0, 0, A, MB, 5, 12, VM, VMD, VMR);
    rail(dx2 + 1, dy2 - 1, A * 2 - 2, 1, VMH);
    rail(dx2 - MB * 2 + 3, dy2 - MB + 1, A * 2 - 6, 1, VMH);
    rail(dx2 - MB + 2, dy2 - MB / 2, A * 2 - 6, 1, VMD); }

  // LENÇOL: só a DOBRA branca virada por cima da manta
  { const [lx, ly] = peca(1, B - 14, A - 2, 2, 3, 14, '#faf7ef', '#c1b7a2', '#e4dbc8');
    rail(lx + 1, ly - 1, (A - 2) * 2 - 2, 1, '#ffffff'); }

  // TRAVESSEIROS: dois, lado a lado na largura, encostados na cabeceira
  [2, 11].forEach(s2 => {
    const [px, py] = peca(s2, B - 10, 7, 6, 5, 12, '#f6f2e6', '#bdb39c', '#ded5c0');
    rail(px + 1, py - 1, 7 * 2 - 2, 1, '#ffffff');
    rail(px - 12 + 2, py - 6, 7 * 2 - 4, 1, 'rgba(120,110,90,.22)');
  });

  // PÉ DA CAMA: tábua baixa — a cabeceira é que manda na silhueta
  { const [fx, fy] = peca(0, 0, A, 3, 8, 8, WT, WL, WR);
    rail(fx + 1, fy - 1, A * 2 - 2, 1, WH); }
}; }
function propCauldron(i, j){ return () => {                   // caldeirão de bruxa (segredinho da waifu…)
  const [x, y0] = pb(i, j);
  const y = y0 - 9;                                           // massa centrada no losango, não no vértice sul
  const t = performance.now() / 1000;
  E(x, y0 - 9, 19, 9, 'rgba(4,5,10,.42)');                    // sombra no meio do tile
  glowAt(x, y - 18, 30, '110,230,110', .28 + Math.sin(t * 2.6) * .08);   // aura verde perigosa
  P(x - 10, y - 4, 20, 3, '#2e1e10');                         // lenha e brasas verdes
  for (let k2 = 0; k2 < 5; k2++)
    P(x - 8 + k2 * 4, y - 5, 2, 2, ((t * 6 + k2) | 0) % 2 ? '#3aa04a' : '#1e5a2a');
  const fl = ((t * 8) | 0) % 3;
  P(x - 5, y - 8, 3, 4, '#3aa04a'); P(x + 2, y - 9 + fl, 3, 4, '#7ae08a');
  P(x - 1, y - 11 + (fl === 2 ? 2 : 0), 2, 4, '#b8ffc8');     // língua de fogo clara
  P(x - 9, y - 6, 3, 6, OUT); P(x + 6, y - 6, 3, 6, OUT);     // pés de ferro
  P(x - 1, y - 4, 3, 5, OUT);
  E(x, y - 14, 15, 10, OUT);                                  // panzão preto
  E(x, y - 14, 14, 9, '#1f2126');
  E(x - 5, y - 17, 5, 3, '#3a3d45');                          // brilho do ferro
  P(x - 14, y - 23, 28, 4, OUT);                              // borda grossa
  P(x - 13, y - 22, 26, 2, '#33363e');
  E(x, y - 23, 12, 3, OUT);                                   // boca
  E(x, y - 23, 11, 2, '#2a5a24');                             // caldo verde girando
  E(x - 3 + Math.round(Math.sin(t * 2) * 3), y - 23, 4, 1, '#4a9a3a');
  E(x + 4 - Math.round(Math.sin(t * 1.6) * 3), y - 24, 3, 1, '#7ae08a');
  if (((t * .5) | 0) % 3 === 0){                              // caveirinha boiando de vez em quando
    const kx = x + Math.round(Math.sin(t * 1.2) * 5);
    P(kx - 2, y - 26, 4, 3, '#e8e4da');
    P(kx - 1, y - 25, 1, 1, OUT); P(kx + 1, y - 25, 1, 1, OUT);
  }
  for (let b2 = 0; b2 < 4; b2++){                             // bolhas verdes: sobem e EXPLODEM no ar
    const ph = (t * (.5 + b2 * .13) + b2 * .77) % 1;
    const bx2 = x - 8 + b2 * 5 + Math.round(Math.sin(t * 2 + b2 * 2.4) * 3);
    const by2 = y - 25 - Math.round(ph * 27);
    if (ph < .8){                                             // subindo e inchando
      const r2 = 1 + Math.round(ph * 3);
      E(bx2, by2, r2 + 1, r2 + 1, 'rgba(30,90,42,.5)');
      E(bx2, by2, r2, r2, ((t * 5 + b2) | 0) % 2 ? '#4a9a3a' : '#5ab04a');
      P(bx2 - 1, by2 - r2 + 1, 1, 1, '#b8ffc8');
    } else {                                                  // POP! estilhaços verdes
      const pr2 = (ph - .8) / .2;
      for (let s2 = 0; s2 < 6; s2++){
        const an = s2 * Math.PI / 3 + b2;
        P(bx2 + Math.round(Math.cos(an) * (3 + pr2 * 6)),
          by2 + Math.round(Math.sin(an) * (3 + pr2 * 6)), 2, 2, `rgba(122,224,138,${(1 - pr2) * .9})`);
      }
    }
  }
  const vx2 = x + 15;                                         // vassoura encostada, DENTRO do losango
  for (let s2 = 0; s2 < 15; s2++)
    P(vx2 - Math.round(s2 * .55), y - 6 - s2 * 2, 2, 3, s2 % 3 ? '#8a6c3a' : '#755a30');
  P(vx2 - 9, y - 37, 3, 3, '#5c4a30');                        // ponta do cabo
  P(vx2 - 1, y - 7, 5, 3, '#8a3038');                         // amarração
  for (let s2 = 0; s2 < 6; s2++)                              // palha descendo
    P(vx2 - 1 + (s2 % 3), y - 5 + s2, 4 - (s2 > 3 ? 1 : 0), 2, s2 % 2 ? '#c9a668' : '#a8854c');
}; }
function propApple(i, j){ return () => {                      // maçã mordida GIGANTE — coisa de humano
  const x = gX(i, j), y = gY(i, j) + 11;                      // vértice sul da PEGADA (22 de meia-largura)
  const t = performance.now() / 1000;
  shadowE(x, y - 3, 22);                                      // sombra do tamanho do contato, não maior
  const cy = y - 20;                                          // meia-altura 20: a base encosta exatamente em y
  E(x, cy, 22, 20, OUT);
  E(x, cy, 21, 19, '#b23030');                                // corpão vermelho
  E(x - 5, cy - 3, 13, 13, '#c94a3a');
  E(x - 9, cy - 7, 6, 6, '#e0705a');                          // brilho
  P(x - 12, cy - 11, 3, 3, '#f0a890');
  E(x + 14, cy - 4, 8, 10, '#f0e2c0');                        // mordida: polpa exposta
  E(x + 16, cy - 4, 6, 8, '#f8eed4');
  for (let k2 = 0; k2 < 4; k2++)                              // marcas dos dentes
    E(x + 10 + (k2 % 2) * 3, cy - 12 + k2 * 5, 3, 2, '#f0e2c0');
  P(x + 15, cy - 2, 2, 3, '#5c4a30');                         // semente
  P(x - 1, cy - 23, 3, 6, '#5c4a30'); P(x, cy - 25, 2, 3, '#42331f');      // talo
  E(x + 7, cy - 24, 6, 3, '#5f8f57'); E(x + 8, cy - 24, 4, 2, '#7aa86a');  // folha
  const fx2 = x + Math.round(Math.cos(t * 2.2) * 14), fy2 = cy - 14 + Math.round(Math.sin(t * 3.1) * 5);
  P(fx2, fy2, 1, 1, '#22262e'); P(fx2 - 1, fy2 - 1, 1, 1, 'rgba(60,60,70,.6)');   // mosquinha rondando
}; }
function propArmchair(i, j){ return () => {                   // poltrona: mini-sofá de 1 tile (padrão que funciona)
  const [x, y] = pb(i, j);
  shadowE(x, y - 10, 22);
  tbox(x, y - 1, 12, 12, 8, '#a82e2e', '#5e1a1a', '#8a2424'); // assento
  isoTop(x - 2, y - 11, 8, 9, '#e8bc50');                     // almofada amarela
  isoTop(x - 4, y - 13, 5, 6, '#f2d06a');
  tbox(x + 9, y - 8, 4, 12, 14, '#c93a3a', '#6e1f1f', '#a82e2e');    // encosto rente ao fundo
  isoTop(x + 9, y - 23, 4, 12, '#e8bc50');                    // friso amarelo no topo
  tbox(x - 9, y - 6, 3, 9, 7, '#c93a3a', '#6e1f1f', '#a82e2e');      // braço
  isoTop(x - 9, y - 14, 3, 9, '#e8bc50');
  P(x + 2, y - 4, 4, 3, '#e8bc50'); P(x + 2, y - 4, 4, 1, '#f2d06a');// remendo amarelo na frente
}; }
function propPlant(i, j){ return () => {                      // vasinho de flor pra alegrar
  const [x, y] = pb(i, j);
  shadowE(x, y - 2, 12);
  P(x - 6, y - 10, 12, 2, '#a87048');                         // boca larga em cima
  P(x - 5, y - 8, 10, 4, '#8a5a3a');
  P(x - 4, y - 4, 8, 2, '#6e462c');                           // afunila pra baixo
  P(x - 1, y - 15, 2, 6, '#4a7a34');
  P(x - 4, y - 13, 3, 2, '#5f8f57'); P(x + 2, y - 14, 3, 2, '#5f8f57');
  E(x, y - 18, 3, 2, '#e08ab0'); P(x - 1, y - 19, 2, 2, '#f2c14e');
}; }

/* ---------------- CENAS ---------------- */
function makeWorld(w, h, safe){
  return {
    w, h, safe, blocked: new Set(), holes: new Set(), props: [], actors: [], pickups: [], doors: {},
    traps: [], lava: [], slick: [], secrets: [], placas: [], baus: [], bridge: new Set(), cleared: false, level: 0, pw: 0, exit: null, entry: null,
    free(x, y){ return x >= 0 && y >= 0 && x < w && y < h && !this.blocked.has(x + ',' + y); },
    // o FOSSO fecha a passagem mas não fecha a linha: golpe, tiro e escavação atravessam por cima/por baixo
    over(x, y){ return x >= 0 && y >= 0 && x < w && y < h && (!this.blocked.has(x + ',' + y) || this.holes.has(x + ',' + y)); },
    block(x, y){ this.blocked.add(x + ',' + y); },
    dig(x, y){ this.blocked.add(x + ',' + y); this.holes.add(x + ',' + y); },
    addProp(depth, tiles, draw){ tiles.forEach(([a, b]) => this.block(a, b)); this.props.push({ depth, tiles, draw }); },
    decor(){}, lights(){ return []; },
  };
}

const home = makeWorld(11, 8, true);
home.wood = true;                                             // covil: tábuas rústicas em vez de pedra
/* tudo encostado nas paredes — centro da casa livre pra circular */
home.addProp(5.4, [[5, 0]], propDresser(5, 0));              // cômoda c/ abajur e cinzeiro, colada no sofá
home.addProp(9.5, [[8, 1], [9, 1]], propCheese(8, 1));
home.addProp(.3, [[0, 0]], propTV(0, 0));                    // TV no canto
home.addProp(2.4, [[2, 0]], propWardrobe(2, 0));             // guarda-roupa do salão
home.addProp(3.5, [[3, 0], [4, 0]], propSofa(3, 0));         // sofá na parede do fundo
home.addProp(-1, [], propRug(5, 3));                         // tapete xadrez 3×3 no centro (é chão: desenha antes)
home.addProp(15.4, [[10, 5]], propMousetrap(10, 5));
home.addProp(6.3, [[0, 6]], propChest(0, 6));                // baú na parede esquerda
home.addProp(10.35, [[10, 0]], propCauldron(10, 0));         // caldeirão borbulhante no canto direito
home.addProp(9.3, [[3, 6]], propApple(3, 6));                // maçã GIGANTE, um tile mais longe do baú
home.addProp(16.3, [[10, 6]], propBarrel(10, 6));
home.addProp(17.3, [[10, 7]], propSacks(10, 7));
home.doors['0,4'] = { to: 'dungeon', spawn: [1, 5] };
home.doors['0,2'] = { to: 'lanroom', spawn: [1, 2] };        // porta da sala anexa (lan house)
const waifu = makeActor(7, 1, SKIN_WAIFU, { npc: true, dir: 1 });
home.actors.push(waifu);
home.block(7, 1);
/* A SAPINHA: com um jogador 2 em campo ela aparece do lado da ratinha, e é ELA quem recebe o queijo
   do sapo e escolhe os presentes dele — cada um com a sua amada, cada um com a sua conta. */
const sapinha = makeActor(5, 1, SKIN_SAPINHA, { npc: true, dir: 1 });
function sapinhaVem(){                                        // uma vez por quadro: entra/sai com o jogador 2
  const i = home.actors.indexOf(sapinha);
  if (p2On && i < 0){ home.actors.push(sapinha); home.block(5, 1); }
  else if (!p2On && i >= 0){ home.actors.splice(i, 1); home.blocked.delete('5,1'); }
}
const amadaDe = sapo => sapo && p2On ? sapinha : waifu;
home.decor = (time) => {
  // janelões de dia: contemplar a vista e ser feliz
  drawDayWindow(false, 6.5, 15, time, true);                  // janelão da parede esquerda, com sol
  drawDayWindow(true, 1.3, 11, time, false);                  // parede do fundo (no lugar da galeria)
  drawDayWindow(true, 9.7, 11, time, false);
  drawVine(true, .7, 13, time);                               // jardim suspenso: vinhas + samambaias
  drawVine(true, 4.7, 14, time);
  drawVine(true, 6.9, 12, time);
  drawVine(false, 3.2, 13, time);
  drawVine(false, 7.7, 14, time);
  drawFern(true, 3.5, time);
  drawFern(true, 8.85, time);
  drawFern(false, 5.5, time);
  // estandarte — pano acompanha a parede do fundo
  { const th = TT(), sx = gX(2.4, 0);
    const yT = c => Math.round((sx + c) * th / (TW / 2)) - WALLH() + 6;
    for (let c = -6; c <= 6; c++){
      const x = sx + c, t0 = yT(c);
      P(x, t0, 1, 2, '#3a3226');                             // haste
      const fray = (c + 6) % 4 === 0 ? 3 : 0;                // pontas esfarrapadas
      P(x, t0 + 2, 1, 20 - fray, Math.abs(c) > 4 ? CAPEDD : CAPED);
    }
    P(sx - 2, yT(-2) + 9, 6, 5, GOLD); P(sx - 2, yT(-2) + 9, 6, 1, '#e0bc50'); }
  // lareira de pedra na parede do fundo, crepitando
  { const th = TT(), sx = gX(6.5, 0);
    const yB = c => Math.round((sx + c) * th / (TW / 2));     // base da parede naquela coluna
    for (let c = -16; c <= 16; c++){
      const x2 = sx + c, b = yB(c), abs = Math.abs(c);
      P(x2, b - 33, 1, 3, '#4a5262');                         // prateleira/cornija
      if (abs > 12){ P(x2, b - 30, 1, 30, (c + 40) % 3 ? '#434b59' : '#39404d'); continue; }   // ombreiras de pedra
      const arch = abs > 7 ? Math.round(5 - 5 * Math.sqrt(Math.max(0, 1 - ((abs - 7) / 6) ** 2))) : 0;
      P(x2, b - 30, 1, 6 + arch, '#3e4552');                  // verga
      P(x2, b - 24 + arch, 1, 24 - arch, '#140f0a');          // boca escura
    }
    P(sx - 8, yB(-8) - 4, 16, 3, '#3a2214');                  // toras empilhadas
    P(sx - 6, yB(-6) - 7, 12, 3, '#4a2c18');
    const ff = ((time * 9) | 0) % 3;                          // chamas em 3 quadros
    P(sx - 5, yB(-5) - 13, 4, 7, '#c96a28');
    P(sx + 1, yB(1) - 15 + ff, 4, 8, '#e8963c');
    P(sx - 2, yB(-2) - 18 + (ff === 2 ? 2 : 0), 3, 9, '#f2c14e');
    P(sx - 1, yB(-1) - 10, 2, 4, '#faf0c8');
    g.save();                                                 // calor emanando da boca
    g.globalCompositeOperation = 'lighter';
    blurFx(3);
    const fg = g.createRadialGradient(sx, yB(0) - 11, 2, sx, yB(0) - 11, 30);
    fg.addColorStop(0, `rgba(240,150,60,${.38 + Math.sin(time * 8) * .1})`);
    fg.addColorStop(1, 'rgba(240,150,60,0)');
    g.fillStyle = fg; g.fillRect(sx - 34, yB(0) - 45, 68, 68);
    g.restore();
    P(sx + 8, yB(8) - 37, 3, 4, '#e8e0c4');                   // velinha na prateleira
    P(sx + 9, yB(9) - 39, 1, 2, ((time * 6) | 0) % 2 ? '#f2c14e' : '#e8963c');
  }
  // armarinho de poções e ervas pendurado no canto da bruxaria
  { const th = TT(), sx = gX(10.6, 0);
    const yb2 = c => Math.round((sx + c) * th / (TW / 2)) - Math.round(WALLH() * .5);
    for (let c = -12; c <= 12; c++){                          // caixa de madeira seguindo a parede
      const x2 = sx + c, b = yb2(c);
      if (Math.abs(c) === 12){ P(x2, b - 23, 1, 25, '#4d3c26'); continue; }
      P(x2, b - 23, 1, 2, '#6b5636'); P(x2, b, 1, 2, '#6b5636');
      P(x2, b - 21, 1, 21, '#2b2114');                        // fundo escuro
      P(x2, b - 11, 1, 2, '#5c4a30');                         // prateleira do meio
    }
    [[-8, '#7ae08a'], [-3, '#b06ae0'], [2, '#e05a5a'], [7, '#4a9ae0']].forEach(([o, cc]) => {
      const b = yb2(o);                                       // frascos coloridos na prateleira de cima
      P(sx + o - 1, b - 18, 3, 5, cc);
      P(sx + o, b - 20, 1, 2, '#8a6c3a');
      P(sx + o - 1, b - 18, 1, 2, 'rgba(255,255,255,.5)');
    });
    { const b = yb2(-7);                                      // prateleira de baixo: caveirinha…
      P(sx - 9, b - 8, 5, 4, '#e8e4da'); P(sx - 8, b - 7, 1, 1, OUT); P(sx - 6, b - 7, 1, 1, OUT); }
    { const b = yb2(0);                                       // …grimório roxo…
      P(sx - 2, b - 8, 6, 4, '#5d3a7a'); P(sx - 2, b - 8, 6, 1, '#7a5ab2'); }
    { const b = yb2(6);                                       // …e potinho de barro
      P(sx + 5, b - 8, 4, 5, '#8a5a3a'); P(sx + 5, b - 9, 4, 1, '#a87048'); }
    [[-9, 5], [-1, 6], [7, 5]].forEach(([o, len]) => {        // ervas secas penduradas por baixo
      const b = yb2(o) + 2;
      P(sx + o, b, 1, 2, '#8a6c3a');
      for (let s2 = 0; s2 < len; s2++)
        P(sx + o - 1 + (s2 % 2), b + 2 + s2 * 2, 3, 2, s2 % 2 ? '#4a7a34' : '#3f6b3a');
      P(sx + o - 1, b + 2 + len * 2, 3, 2, '#5c8a44');
    });
  }
  drawPainting(false, 1.4, 8, 9, ART_SUN);                    // quadro que sobrou da galeria
  // bueiro (arco de escoamento) — vão e aduelas coluna a coluna na base da parede
  { const th = TT(), sx = gX(8, 0);
    const yB = c => Math.round((sx + c) * th / (TW / 2));
    for (let c = -20; c <= 20; c++){
      const hol = Math.round(22 * Math.sqrt(Math.max(0, 1 - (c / 21) ** 2)));
      if (hol <= 0) continue;
      const x = sx + c, b = yB(c);
      P(x, b - hol, 1, hol, '#0a0c11');                      // vão escuro
      P(x, b - hol - 4, 1, 4, hash(c, 3) > .5 ? '#4a5262' : '#3e4552');  // aduelas
      if ((c + 20) % 7 === 0) P(x, b - hol + 3, 1, hol - 3, '#232833');  // grade vertical
    }
    for (let c = -14; c <= 14; c++) P(sx + c, yB(c) - 9, 1, 1, '#232833');  // travessa da grade
    if (bueiroT > 0){                                        // ALGUÉM ESPIANDO: dois olhos vermelhos lá no fundo
      const bx = sx + bueiroX, ey = yB(bueiroX) - 13;
      const pisca = ((time * 2.1) | 0) % 9 === 0;
      const al = Math.min(1, bueiroT / .7) * (.6 + Math.sin(time * 3.2) * .18);
      if (!pisca){
        glowAt(bx, ey + 1, 13, '255,50,40', al * .45);
        P(bx - 5, ey, 3, 2, `rgba(238,58,48,${al.toFixed(2)})`);
        P(bx + 2, ey, 3, 2, `rgba(238,58,48,${al.toFixed(2)})`);
        P(bx - 4, ey, 1, 1, `rgba(255,190,180,${al.toFixed(2)})`);
        P(bx + 3, ey, 1, 1, `rgba(255,190,180,${al.toFixed(2)})`);
      }
    }
  }
  drawDoor(4, false);
  // par de sapatinhos pendurados ao lado da porta da dungeon
  { const th = TT(), sx = gX(0, 3.7);
    const wy = Math.round(-sx * th / (TW / 2)) - Math.round(WALLH() * .52);
    const sw2 = Math.round(Math.sin(time * 1.4) * 1);         // balanço sutil
    P(sx - 1, wy - 2, 2, 2, '#8a929b');                       // preguinho
    for (let s = 0; s < 5; s++){                              // cadarços amarrados descendo
      P(sx - 2 + sw2 + (s % 2), wy + s * 2, 1, 2, '#e8e0c4');
      P(sx + 1 + sw2 - (s % 2), wy + s * 2, 1, 2, '#d8cfae');
    }
    const shoe = (ox, flip2) => {
      const bx2 = sx + ox + sw2, by2 = wy + 10;
      P(bx2 - 2, by2, 5, 6, OUT);                             // cano
      P(bx2 - 1, by2 + 1, 3, 4, '#c93a4a');
      P(bx2 - 1, by2 + 1, 3, 1, '#e05a5a');
      P(bx2 - 2 - (flip2 ? 3 : 0), by2 + 5, 8, 4, OUT);       // bico (um pra cada lado)
      P(bx2 - 1 - (flip2 ? 3 : 0), by2 + 6, 6, 2, '#c93a4a');
      P(bx2 - 1 - (flip2 ? 3 : 0), by2 + 8, 6, 1, '#e8e0c4'); // solinha clara
      P(bx2, by2 + 3, 1, 1, '#f2e2b0');                       // ilhós
    };
    shoe(-5, true); shoe(4, false);
  }
  drawDoor(2, true);                                          // porta da lan house (luz acesa)
  // neon VERDE vazando por baixo da porta da lan: ali dentro tem algo especial
  { const th = TT(), cx0 = gX(0, 2.5);
    const yB = c => Math.round(-(cx0 + c) * th / (TW / 2)) + 1;
    const pu = .55 + Math.sin(time * 3.1) * .2;
    g.save();
    g.globalCompositeOperation = 'lighter';
    blurFx(3);
    g.save();                                                 // poça de luz esparramada no chão
    g.translate(cx0, yB(0));
    g.rotate(Math.atan2(-th, TW / 2));
    g.scale(2, .8);
    const dg = g.createRadialGradient(0, 0, 2, 0, 0, 28);
    dg.addColorStop(0, `rgba(70,240,130,${pu * .55})`);
    dg.addColorStop(1, 'rgba(70,240,130,0)');
    g.fillStyle = dg; g.fillRect(-32, -32, 64, 64);
    g.restore();
    g.filter = 'none';
    for (let c = -11; c <= 11; c++)                           // fresta verde coluna a coluna
      P(cx0 + c, yB(c), 1, 2, `rgba(110,255,150,${.4 + pu * .35})`);
    g.restore();
  }
  // a porta da dungeon arde em vermelho — efeito preso à inclinação isométrica da parede
  { const th = TT(), cx0 = gX(0, 4.5);
    const yB = c => Math.round(-(cx0 + c) * th / (TW / 2)) + 1;   // base da porta naquela coluna
    const pu = .5 + Math.sin(time * 2.4) * .22;
    g.save();
    g.globalCompositeOperation = 'lighter';
    blurFx(3);
    g.save();                                                 // halo alongado, girado no ângulo da base
    g.translate(cx0, yB(0));
    g.rotate(Math.atan2(-th, TW / 2));
    g.scale(1.9, .8);
    const dg = g.createRadialGradient(0, 0, 2, 0, 0, 30);
    dg.addColorStop(0, `rgba(224,60,40,${pu * .6})`);
    dg.addColorStop(1, 'rgba(224,60,40,0)');
    g.fillStyle = dg; g.fillRect(-34, -34, 68, 68);
    g.restore();
    g.filter = 'none';
    for (let c = -11; c <= 11; c++)                           // fresta ardente coluna a coluna
      P(cx0 + c, yB(c), 1, 2, `rgba(255,90,50,${.45 + pu * .3})`);
    g.restore();
    if (((time * 5) | 0) !== redSmokeTick){                   // fumaça nasce na linha inclinada
      redSmokeTick = (time * 5) | 0;
      const c = -10 + hash(redSmokeTick, 3) * 20;
      dust.push({
        x: cx0 + c, y: yB(c) - 1,
        vx: 7 + hash(redSmokeTick, 5) * 8,                    // deriva pra dentro da sala (SE)
        vy: -4 - hash(redSmokeTick, 7) * 6,
        life: 1.3, kind: 'redSm',
      });
    }
  }
};
home.lights = () => [
  { x: gX(6.5, 0), y: 6.5 * TT() - 12, r: TW * 2.8, a: .95, warm: .34 },                       // lareira crepitando
  { x: gX(5, 0) - 5, y: 7 * TT() - 27, r: TW * 1.5, a: .75, warm: .2 },                        // abajur da cômoda
  { x: gX(0, 0), y: gY(0, 0) - 4, r: TW * 1.5, a: .55, moon: true },                           // brilho frio da TV
  { x: gX(0, 6.5) + 22, y: 6.5 * TT() - WALLH() * .5 + 34, r: TW * 2.8, a: .85, day: true },   // luz do dia entrando
  { x: gX(0, 6.5) + 40, y: 6.5 * TT() + 10, r: TW * 1.7, a: .55, day: true },                  // poça de sol no chão
  { x: gX(10, 0), y: gY(10, 0) - 12, r: TW * 1.4, a: .5, neon: '110,230,110' },                // caldeirão verde
  { x: gX(1.3, 0), y: 1.3 * TT() - WALLH() * .42 - 4, r: TW * 2.2, a: .7, day: true },         // janelão do fundo 1
  { x: gX(9.7, 0), y: 9.7 * TT() - WALLH() * .42 - 4, r: TW * 2.2, a: .7, day: true },         // janelão do fundo 2
  { x: gX(0, 4.5) + 14, y: 4.5 * TT() + 4, r: TW * .9, a: .3, moon: true },                    // porta da dungeon
  { x: gX(0, 2.5) + 16, y: 2.5 * TT() + 6, r: TW * 1.2, a: .45, neon: '70,240,130' },          // vazamento verde da lan
];

/* ---------------- DUNGEONS PROCEDURAIS (roguelike, nv 1–10) ---------------- */
const FOES = [
  { min: 1, skin: SKIN_ENEMY,   hp: 2, dmg: 1, hopS: .3,  atkS: .52, range: 5, pw: 2,  rat: true },  // ladrão
  { min: 3, skin: SKIN_SOLDIER, hp: 5, dmg: 1, hopS: .25, atkS: .44, range: 7, pw: 6,  rat: true },  // soldado
  { min: 5, skin: SKIN_ARMORED, hp: 8, dmg: 2, hopS: .38, atkS: .6,  range: 6, pw: 12, rat: true },  // couraçado
  { min: 7, skin: SKIN_SHADOW,  hp: 5, dmg: 2, hopS: .2,  atkS: .38, range: 9, pw: 15, rat: true, card: 'cshadow' },  // sombrio
  { min: 2, max: 10, skin: SKIN_SLIME, hp: 8, dmg: 1, hopS: .5,  atkS: .7,  range: 6, pw: 7, card: 'cslime' },   // gosma do arco-íris
  { min: 5, max: 10, skin: SKIN_BAT,   hp: 3, dmg: 1, hopS: .22, atkS: .42, range: 7, pw: 11, card: 'cbat' },  // morcego flamejante
  { min: 1, max: 10, skin: SKIN_EYE,   hp: 3, dmg: 1, hopS: .36, atkS: .52, range: 6, pw: 3, card: 'ceye' },   // observador
  { min: 3, max: 10, skin: SKIN_WISP, hp: 4, dmg: 1, hopS: .28, atkS: .48, range: 7, pw: 6 },  // fogo-fátuo: luz de pântano, só na pedra
  { min: 6, skin: SKIN_PLAGUE, hp: 18, dmg: 2, hopS: .2, atkS: .4, range: 11, pw: 22, card: 'cplague' },  // plague doctor: rápido e enxerga longe
  { min: 6, skin: SKIN_RATKING, hp: 24, dmg: 2, hopS: .4, atkS: .58, range: 9, pw: 22 },  // nó de ratos (rat king): morre de vez, sem se desfazer
  { min: 11, max: 20, skin: SKIN_ICECUBE,   hp: 8,  dmg: 1, hopS: .5,  atkS: .68, range: 5, pw: 9,  frost: true, card: 'ccube' },  // cubo vivo
  { min: 11, max: 20, skin: SKIN_FROSTMOTH, hp: 4,  dmg: 1, hopS: .24, atkS: .44, range: 8, pw: 12, frost: true },  // mariposa boreal
  { min: 13, max: 20, skin: SKIN_YETI,      hp: 14, dmg: 2, hopS: .42, atkS: .62, range: 6, pw: 16, card: 'cyeti' },               // yeti filhote
  { min: 21, max: 30, skin: SKIN_TOAD,  hp: 12, dmg: 2, hopS: .5,  atkS: .6,  range: 6, pw: 15, venom: true, card: 'ctoad' },  // sapo do lodo
  { min: 21, max: 30, skin: SKIN_MOSQ,  hp: 4,  dmg: 1, hopS: .2,  atkS: .4,  range: 9, pw: 13, venom: true, card: 'cmosq' },  // mosquito do pântano
  { min: 23, max: 30, skin: SKIN_LEECH, hp: 9,  dmg: 2, hopS: .3,  atkS: .5,  range: 7, pw: 17, venom: true, card: 'cleech' },  // sanguessuga real
  // SABÁ DAS BRUXAS (31–40)
  { min: 31, skin: SKIN_JACK,  hp: 15, dmg: 2, hopS: .26, atkS: .44, range: 7,  pw: 23, card: 'cjack' },   // abóbora saltitante
  { min: 31, skin: SKIN_CROW,  hp: 9,  dmg: 2, hopS: .17, atkS: .36, range: 12, pw: 25, card: 'ccrow' },   // corvo bruxo
  { min: 33, skin: SKIN_SCARE, hp: 28, dmg: 3, hopS: .48, atkS: .64, range: 7,  pw: 32, card: 'cscare' },  // espantalho
  { min: 35, skin: SKIN_CAULD, hp: 20, dmg: 2, hopS: .52, atkS: .58, range: 6,  pw: 27, venom: true, card: 'ccauld' },   // caldeirão vivo
];
// andar de estreia de cada poder — e a partir dele o poder entra no sorteio dos andares seguintes
const POWER_DEBUT_BASE = {
  2: 'spin', 4: 'thrust', 5: 'shock', 6: 'edge', 7: 'heal', 8: 'rage', 9: 'quake',
  12: 'nova', 13: 'icetrail', 15: 'shards', 16: 'aegis', 18: 'drill',
  22: 'bomb', 23: 'miasma', 26: 'bubble', 28: 'leech',
  32: 'hex', 34: 'lantern', 37: 'coven',
};
// CADA RUN TEM A SUA ORDEM. O calendário continua o mesmo (mesma quantidade de poderes, nos
// mesmos andares, dentro do mesmo estrato) — o que muda é QUAL cai primeiro. Antes o giro de
// lâminas era sempre o primeiro do jogo e a corrida começava idêntica toda vez.
let POWER_DEBUT = { ...POWER_DEBUT_BASE };
let runSeed = 1;
function sortearPoderes(seed){
  const novo = {};
  [[1, 10], [11, 20], [21, 30], [31, 40]].forEach(([lo, hi], bi) => {
    const niveis = Object.keys(POWER_DEBUT_BASE).map(Number).filter(l => l >= lo && l <= hi).sort((a, b) => a - b);
    const pool = niveis.map(l => POWER_DEBUT_BASE[l]);
    for (let i = pool.length - 1; i > 0; i--){                // embaralha DENTRO do estrato: o sabor do andar fica
      const j2 = (hash(seed + bi * 37 + i * 11, 23 + i) * (i + 1)) | 0;
      const tmp = pool[i]; pool[i] = pool[j2]; pool[j2] = tmp;
    }
    niveis.forEach((l, i) => { novo[l] = pool[i]; });
  });
  POWER_DEBUT = novo;
}
sortearPoderes(((performance.now() | 0) * 7919) % 99991);
let genN = 0;
const poca = d2 => d2.sewer ? d2.goo : d2.lava;   // a poça perigosa de cada reino

function genDungeon(lv, cursed, semente){
  // o Reino do Gelo estava nascendo já no teto de tamanho: sala enorme com o mesmo punhado de
  // bichos, todo mundo isolado num descampado. Lá a sala é menor de propósito — briga mais junta.
  const gelo = lv >= 11 && lv <= 20;
  const w = Math.min(10 + lv, gelo ? 13 : 18), h = Math.min(8 + ((lv - 1) >> 1), gelo ? 9 : 13);
  const d = makeWorld(w, h, false);
  d.level = lv;
  d.cursed = !!cursed;                                        // andar maldito: bicho mais duro, queda dobrada
  d.ice = lv >= 11 && lv <= 20;                               // andares 11–20: o Reino do Gelo
  d.sewer = lv >= 21 && lv <= 30;                             // andares 21–30: o Esgoto Real
  d.witch = lv >= 31;                                         // andares 31–39: o SABÁ DAS BRUXAS
  d.lab = lv >= 40;                                           // o laboratório da ratinha: fim de linha, sem chefe
  d.goo = [];                                                 // poças de lodo venenoso (esgoto)
  d.slick = [];                                               // placas de gelo polido: o escorregão VISÍVEL
  let s = 0;                                                  // semente nova a cada geração: nunca repete
  // com SEMENTE, dois aparelhos geram o MESMO andar — é o que faz o online funcionar sem
  // mandar o mapa inteiro pela rede: vai só o número.
  const seed = semente != null ? (semente >>> 0) % 99991
    : (((performance.now() | 0) + (++genN) * 104729 + lv * 7919) >>> 0) % 99991;
  const rnd = () => hash(lv * 131 + (++s) * 7, seed + s * 13);
  const ey = 2 + ((rnd() * (h - 4)) | 0);
  d.doors['0,' + ey] = { to: 'home', spawn: [1, 4] };
  d.entry = [1, ey];
  const taken = new Set(['1,' + ey, '0,' + ey, '2,' + ey]);
  const spot = (minX) => {
    for (let t = 0; t < 50; t++){
      const x = minX + ((rnd() * (w - minX - 1)) | 0), y = 1 + ((rnd() * (h - 2)) | 0);
      const k = x + ',' + y;
      if (!taken.has(k) && d.free(x, y)){ taken.add(k); return [x, y]; }
    }
    return null;
  };
  // ---- ANDAR 50: LABORATÓRIO DE BRUXARIA. Sem chefe, sem bicho, sem escada: só ela. ----
  if (d.lab){
    const cx3 = (w / 2) | 0, cy3 = (h / 2) | 0;
    d.cleared = true;                                         // já nasce limpo: nada de fanfarra de sala vazia
    d.exit = null;
    for (const [px2, py2] of [[cx3 - 5, 1], [cx3 - 2, 1], [cx3 + 2, 1], [cx3 + 5, 1],
                              [cx3 - 5, h - 2], [cx3 + 5, h - 2], [2, cy3 - 1], [w - 3, cy3 + 1]])
      if (d.free(px2, py2)) d.addProp(px2 + py2 + .3, [[px2, py2]], propShelf(px2, py2));
    for (const [px2, py2] of [[cx3 - 4, cy3 + 3], [cx3 + 4, cy3 - 3], [cx3 - 4, cy3 - 3], [cx3 + 4, cy3 + 3]])
      if (d.free(px2, py2)) d.addProp(px2 + py2 + .3, [[px2, py2]], propCauldron(px2, py2));
    const wf = makeActor(cx3, cy3, SKIN_WAIFU, { npc: true, dir: 1, bruxa: true });
    d.actors.push(wf);
    d.bloqueiaTile = true;
    d.labWaifu = wf;
    const tX2 = [];
    for (let i = 2; i < w - 1; i += 3) tX2.push(i + .5);
    d.decor = (time) => {
      tX2.forEach(t2 => drawTorch(gX(t2, 0), Math.round(t2 * TT() - WALLH() * .42), time));
      // CÍRCULO DE INVOCAÇÃO no chão, em volta dela
      const cxp = gX(cx3, cy3), cyp = gY(cx3, cy3);
      const pu = .5 + Math.sin(time * 1.5) * .5;
      isoRing(cxp, cyp, 62, 'rgba(200,120,250,' + (.2 + pu * .16).toFixed(2) + ')', 2);
      isoRing(cxp, cyp, 44, 'rgba(242,193,78,' + (.14 + pu * .1).toFixed(2) + ')', 1);
      for (let i = 0; i < 5; i++){                            // pentagrama de giz girando devagar
        const a2 = time * .12 + i * 4 * Math.PI / 5, b2 = time * .12 + (i + 1) * 4 * Math.PI / 5;
        for (let k2 = 0; k2 <= 14; k2++){
          const u2 = k2 / 14;
          const ax2 = Math.cos(a2) * (1 - u2) + Math.cos(b2) * u2, ay2 = Math.sin(a2) * (1 - u2) + Math.sin(b2) * u2;
          P(cxp + Math.round(ax2 * 52), cyp + Math.round(ay2 * 52 * pitch * .62), 2, 2,
            'rgba(214,150,255,' + (.34 + pu * .2).toFixed(2) + ')');
        }
      }
      for (let i = 0; i < 9; i++){                            // faíscas mágicas subindo
        const ph = ((time * .35 + i * .11) % 1);
        P(cxp - 44 + ((hash(i, 71) * 88) | 0), cyp - 6 - Math.round(ph * 70), 2, 2,
          'rgba(' + (i % 3 === 0 ? '242,193,78' : '200,120,250') + ',' + ((1 - ph) * .7).toFixed(2) + ')');
      }
      glowAt(cxp, cyp - 30, 70, '180,100,240', .18 + pu * .08);
    };
    d.lights = () => [{ x: gX(cx3, cy3), y: gY(cx3, cy3), r: TW * 3.6, a: .95 }];
    return d;
  }
  // arquétipo do andar — cada dungeon tem uma cara
  // lago só na pedra (lava) e no esgoto (lodo); abismo cabe em qualquer estrato com sala larga
  const podeAbismo = lv % 10 !== 0 && w >= 13 && h >= 7;
  let arch = lv % 10 === 0 ? 0 : d.ice ? (rnd() * 3) | 0 : (rnd() * 4) | 0;
  if (podeAbismo && rnd() < .2) arch = 4;
  if (arch === 1){                                            // salão de pilares em grade
    const ox = 3 + ((rnd() * 2) | 0), oy = 2 + ((rnd() * 2) | 0);
    for (let px2 = ox; px2 < w - 1; px2 += 3)
      for (let py2 = oy; py2 < h - 1; py2 += 3){
        if (Math.abs(py2 - ey) < 2 && px2 < 5) continue;      // não fecha a entrada
        if (rnd() < .25) continue;                            // falhas na grade
        const k = px2 + ',' + py2;
        if (taken.has(k)) continue;
        taken.add(k);
        d.addProp(px2 + py2 + .3, [[px2, py2]], propPillar(px2, py2));
      }
  } else if (arch === 2){                                     // muros divisores com passagens
    for (let m2 = 0, nW = 1 + ((rnd() * 2) | 0); m2 < nW; m2++){
      const wx = 4 + ((rnd() * (w - 7)) | 0);
      const g1 = 1 + ((rnd() * (h - 3)) | 0), g2 = 1 + ((rnd() * (h - 3)) | 0);
      for (let py2 = 1; py2 < h - 1; py2++){
        if (Math.abs(py2 - g1) <= 1 || Math.abs(py2 - g2) <= 1) continue;   // passagens
        const k = wx + ',' + py2;
        if (taken.has(k)) continue;
        taken.add(k);
        d.addProp(wx + py2 + .3, [[wx, py2]], propWallStump(wx, py2));
      }
    }
  } else if (arch === 4){                                     // ABISMO: a sala parte em duas, ligadas por uma ponte
    const wd = w >= 16 ? 3 : 2;                               // largura do vão
    const meio = ((w - wd) / 2) | 0;
    const cx2 = Math.max(4, Math.min(w - 5 - wd, meio + ((rnd() * 3) | 0) - 1));
    const bw = rnd() < .35 ? 2 : 1;                           // algumas pontes são largas, a maioria não
    const bp = 2 + ((rnd() * Math.max(1, h - 4 - bw)) | 0);   // a única travessia
    for (let x = cx2; x < cx2 + wd; x++)
      for (let y = 0; y < h; y++){
        const k = x + ',' + y;
        if (y >= bp && y < bp + bw){ d.bridge.add(k); taken.add(k); continue; }   // a tábua passa por cima do vão
        if (taken.has(k)) continue;
        taken.add(k); d.dig(x, y);
      }
    for (let y = bp; y < bp + bw; y++){                       // cabeceiras limpas
      taken.add((cx2 - 1) + ',' + y); taken.add((cx2 + wd) + ',' + y);
    }
    d.abismo = { x: cx2, wd, y: bp, bw, seed: (rnd() * 5) | 0 };
  } else if (arch === 3){                                     // lago central: lava · pântano · lodo
    const cx2 = (w / 2) | 0, cy2 = (h / 2) | 0;
    for (let px2 = cx2 - 3; px2 <= cx2 + 3; px2++)
      for (let py2 = cy2 - 2; py2 <= cy2 + 2; py2++){
        if (px2 < 2 || py2 < 1 || px2 > w - 2 || py2 > h - 2) continue;
        const dist2 = Math.abs(px2 - cx2) + Math.abs(py2 - cy2);
        if (dist2 > 3 || (dist2 === 2 && rnd() < .3)) continue;             // borda irregular
        const k = px2 + ',' + py2;
        if (taken.has(k)) continue;
        taken.add(k);
        poca(d).push({ x: px2, y: py2 });
      }
  }
  // RECORTE DA SALA: o retângulo pelado ganha um FOSSO no miolo. Muda a planta de todo combate
  // sem sair da arena: nada anda em cima, mas se vê, se atira e se escava por baixo.
  // o anel de fora nunca é cavado — e mesmo assim o mapa é conferido antes de valer.
  const alcance = () => {                                     // quantos tiles a pata alcança saindo da entrada
    const vis = new Set([d.entry[0] + ',' + d.entry[1]]), fila = [d.entry];
    while (fila.length){
      const [cx3, cy3] = fila.pop();
      for (const [ox, oy] of DIRV){
        const nx = cx3 + ox, ny = cy3 + oy, k = nx + ',' + ny;
        if (vis.has(k) || !d.free(nx, ny)) continue;
        vis.add(k); fila.push([nx, ny]);
      }
    }
    return vis.size;
  };
  const X0 = 3, X1 = w - 4, Y0 = 1, Y1 = h - 3;               // fora daqui é anel de segurança: nunca vira buraco
  if (lv % 10 !== 0 && arch !== 3 && arch !== 4 && X1 - X0 >= 2 && Y1 - Y0 >= 1 && rnd() < .6){
    const antes = alcance(), cova = [];
    const box = (ax, ay, bx, by) => {
      for (let x = Math.max(X0, ax); x <= Math.min(X1, bx); x++)
        for (let y = Math.max(Y0, ay); y <= Math.min(Y1, by); y++){
          const k = x + ',' + y;
          if (taken.has(k) || !d.free(x, y)) continue;        // pilar, muro e lago já plantados ficam de pé
          taken.add(k); cova.push([x, y]); d.dig(x, y);
        }
    };
    // buracos COMPACTOS e separados: um 3x3, ou um 2x2, ou dois deles longe um do outro.
    // nada de rachadura comprida — poço quadrado lê melhor e dá volta por qualquer lado.
    const blocos = [];
    const cabe = (ax, ay, n2) => {
      if (ax < X0 || ay < Y0 || ax + n2 - 1 > X1 || ay + n2 - 1 > Y1) return false;
      for (const [bx, by, bn] of blocos)                      // um tile de folga: os poços não se encostam
        if (ax <= bx + bn && bx <= ax + n2 && ay <= by + bn && by <= ay + n2) return false;
      for (let x = ax; x < ax + n2; x++)
        for (let y = ay; y < ay + n2; y++)
          if (taken.has(x + ',' + y) || !d.free(x, y)) return false;   // pilar, muro e lago já plantados ficam de pé
      return true;
    };
    for (let b2 = 0, nB = rnd() < .34 ? 2 : 1; b2 < nB; b2++)
      for (let tent = 0; tent < 24; tent++){
        const n2 = rnd() < .4 ? 3 : 2;
        const ax = X0 + ((rnd() * Math.max(1, X1 - X0 - n2 + 2)) | 0);
        const ay = Y0 + ((rnd() * Math.max(1, Y1 - Y0 - n2 + 2)) | 0);
        if (!cabe(ax, ay, n2)) continue;
        blocos.push([ax, ay, n2]);
        for (let x = ax; x < ax + n2; x++)
          for (let y = ay; y < ay + n2; y++){ taken.add(x + ',' + y); cova.push([x, y]); d.dig(x, y); }
        break;
      }
    if (cova.length && alcance() !== antes - cova.length)     // isolou um pedaço da sala: desfaz tudo
      cova.forEach(([x, y]) => {
        const k = x + ',' + y;
        d.holes.delete(k); d.blocked.delete(k); taken.delete(k);
      });
  }
  // entulho espalhado (pouco)
  const PROPS = [propBarrel, propBones, propRubble, propSacks];
  for (let i = 0, n = 2 + ((rnd() * 3) | 0); i < n; i++){
    const sp = spot(2); if (!sp) break;
    const pi = (rnd() * PROPS.length) | 0;
    d.addProp(sp[0] + sp[1] + .3, pi === 0 ? [[sp[0], sp[1]]] : [], PROPS[pi](sp[0], sp[1]));
    if (pi === 0) d.props[d.props.length - 1].bust = [sp[0], sp[1]];   // barril: quebra no golpe
  }
  // espinhos (quantidade sorteada)
  if (lv >= 2)
    for (let i = 0, n = 1 + ((rnd() * 2) | 0) + ((lv / 3) | 0); i < n; i++){
      const sp = spot(3); if (sp) d.traps.push({ x: sp[0], y: sp[1] });
    }
  // poças avulsas: lava na pedra, lodo no esgoto (só o gelo é seco)
  if (lv >= 3 && !d.ice && arch !== 3)
    for (let i = 0, n = 1 + ((rnd() * 2) | 0); i < n; i++){
      const sp = spot(2); if (sp) poca(d).push({ x: sp[0], y: sp[1] });
    }
  // PLACAS DE GELO POLIDO. Antes o Reino do Gelo INTEIRO escorregava, com 30% de chance por
  // quadro: o ratinho derrapava sem aviso, em qualquer tile, e não dava pra culpar ninguém.
  // Agora o escorregão mora em placas CONTADAS e VISÍVEIS — você vê o brilho, pisa sabendo
  // e desliza. Bem menos escorregão, e todo ele merecido.
  // 4 a 7 placas numa sala de 13x9 era escorregão demais: somado ao enxame, o Reino do Gelo
  // virava o trecho chato do jogo. 3 a 5 mantêm o perigo sem transformar andar em pista de patinação.
  if (d.ice)
    for (let i = 0, n = 3 + ((rnd() * 3) | 0); i < n; i++){
      const sp = spot(3); if (sp) d.slick.push({ x: sp[0], y: sp[1] });
    }
  // SEGREDO: RARO de propósito. Um tile de terra remexida que paga queijo em dobro — achado
  // gostoso de encontrar e pequeno o bastante pra não mexer na progressão.
  if (lv >= 3 && rnd() < .16){
    const sp = spot(3);
    if (sp) d.secrets.push({ x: sp[0], y: sp[1], taken: false });
  }
  // PLACA DE PRESSÃO: você VÊ a placa. Pisar arma os dardos, que voam pela fileira 0,4s depois —
  // dá tempo de sair, e quem estiver na linha (inclusive bicho) leva.
  if (lv >= 4 && arch !== 4){
    let giro = rnd() < .5 ? 0 : 1;                            // alterna: quem tem duas placas vê os DOIS sentidos
    for (let i = 0, n = rnd() < .34 ? 2 : 1; i < n && rnd() < .62; i++){
      const sp = spot(3);
      if (!sp) break;
      const cruz = lv >= 8 && rnd() < .24;                    // a CRUZADA varre os dois eixos de uma vez
      d.placas.push({ x: sp[0], y: sp[1], eixo: cruz ? 2 : giro, t: 0, cd: 0 });
      giro = 1 - giro;
    }
  }
  // BAÚ: metade paga, metade cobra. É aposta declarada — o baú fica à vista e você decide pisar.
  if (lv >= 5 && lv % 10 !== 0 && rnd() < .34){
    const sp = spot(4);
    if (sp){
      const bu = { x: sp[0], y: sp[1], ruim: rnd() < .5, aberto: false, castigo: (rnd() * 3) | 0 };
      d.baus.push(bu);
      // entra na fila de profundidade como qualquer móvel, MAS sem bloquear o tile:
      // é pisando nele que a aposta acontece
      d.props.push({ depth: sp[0] + sp[1] + .3, tiles: [[sp[0], sp[1]]], draw: propChest(sp[0], sp[1], bu) });
    }
  }
  // PAREDE FALSA: um toco de muro igualzinho aos outros — só uma rachadura denuncia. Quebra no
  // golpe e abre um nicho com tesouro atrás.
  if (lv >= 6 && rnd() < .28){
    const sp = spot(3);
    if (sp){
      d.addProp(sp[0] + sp[1] + .3, [[sp[0], sp[1]]], propWallStump(sp[0], sp[1], true));
      const pr = d.props[d.props.length - 1];
      pr.bust = [sp[0], sp[1]];
      pr.nicho = true;
    }
  }
  // escada de descida (aparece quando a dungeon é limpa)
  const ex = spot(Math.max(3, w - 4)) || [w - 2, h - 2];
  d.exit = { x: ex[0], y: ex[1] };
  /* ECONOMIA DO ANDAR — o jogo era uma questão de paciência: dava pra chegar no fundo com a
     mochila cheia de poção e todo poder já na mão. Aqui a torneira fecha de verdade. A ESTREIA
     de um poder novo deixou de ser garantida (58%): se escapar, ele volta pelo sorteio dos já
     liberados — nada se perde pra sempre, mas nenhuma run tem tudo.                            */
  /* CURA POR ANDAR — a conta que faltava: um andar do fundo custa 12 a 19 de vida e devolvia 6.
     Do nv 12 pra baixo TODO andar fechava no vermelho e a run só se sustentava correndo pro covil
     a cada dois andares. Agora o andar devolve perto do que cobra; o fundo ainda sangra, mas
     pouco — quem joga bem fecha no zero.                                                        */
  for (let i = 0, n2 = 1 + (rnd() < .6 ? 1 : 0); i < n2; i++){   // queijo: 1,6 por andar
    const sp = spot(Math.max(3, w - 6));
    if (sp) d.pickups.push({ x: sp[0], y: sp[1], kind: 'cheese' });
  }
  for (let i = 0, n2 = (lv >= 2 ? 1 : 0) + (lv >= 8 && rnd() < .35 ? 1 : 0); i < n2; i++){
    const sp = spot(2);                                       // poção: 1 garantida do nv 2, e às vezes 2
    if (sp) d.pickups.push({ x: sp[0], y: sp[1], kind: 'potion' });
  }
  if (lv >= 4 && lv % 2 === 0 && rnd() < .6){                  // coração: de 2 em 2 andares de novo
    const sp = spot(3); if (sp) d.pickups.push({ x: sp[0], y: sp[1], kind: 'heartmax' });
  }
  const wDrop = WEAPON_BY_LEVEL[lv];
  if (wDrop){ const sp = spot(3); if (sp) d.pickups.push({ x: sp[0], y: sp[1], kind: wDrop }); }
  const pDrop = POWER_DEBUT[lv];
  if (pDrop && !poderJaCaiu.has(pDrop) && !temPoder(pDrop) && rnd() < .5){   // a ESTREIA, se for inédito
    const sp = spot(3); if (sp) d.pickups.push({ x: sp[0], y: sp[1], kind: pDrop });
  } else if (lv >= 2 && rnd() < .07){                        // ou um dos que escaparam da estreia
    const pool = poderesDisponiveis(lv);
    const sp = spot(3);
    if (sp && pool.length) d.pickups.push({ x: sp[0], y: sp[1], kind: pool[(rnd() * pool.length) | 0] });
  }
  // inimigos — o poder da dungeon é a soma das ameaças
  // salas de chefe: SÓ o chefe — um gigante 2×2 brutalmente mais forte
  const BOSS_CARD = { 10: 'ccat', 20: 'cyetiB', 30: 'ctoadB' };   // cada chefe tem o SEU brasão
  const BOSS_DEFS = {
    10: { skin: SKIN_CAT,      hp: 160, dmg: 4, hopS: .3,  atkS: .48, name: '🐈 O GATO',     pw: 160 },
    20: { skin: SKIN_YETIBOSS, hp: 320, dmg: 5, hopS: .32, atkS: .5,  name: '❄️ YETI ANCIÃO', pw: 320, frost: true },
    30: { skin: SKIN_TOADBOSS, hp: 460, dmg: 6, hopS: .34, atkS: .48, name: '🐸 SAPO REAL',   pw: 460, venom: true },
  };
  const bd = BOSS_DEFS[lv];
  if (bd){
    const sp = spot(5) || [w - 3, (h / 2) | 0];
    const bx2 = Math.max(3, Math.min(sp[0], w - 3)), by2 = Math.max(1, Math.min(sp[1], h - 3));
    taken.add((bx2 + 1) + ',' + by2); taken.add(bx2 + ',' + (by2 + 1)); taken.add((bx2 + 1) + ',' + (by2 + 1));
    d.actors.push(makeActor(bx2, by2, bd.skin, {
      hostile: true, hp: bd.hp, maxHp: bd.hp, dmg: bd.dmg, hopS: bd.hopS, atkS: bd.atkS,
      range: 14, boss: true, big2: true, bossCd: .9, dir: 2,
      name: bd.name, frost: !!bd.frost, venom: !!bd.venom, card: BOSS_CARD[lv] || null,
    }));
    d.pw += bd.pw;
  }
  // inimigos: variedade garantida (um de cada tipo primeiro) + sorteio + elites
  const pool = FOES.filter(f => f.min <= lv && lv <= (f.max || 99));
  const order = pool.slice();
  for (let i = order.length - 1; i > 0; i--){                 // embaralha
    const j2 = (rnd() * (i + 1)) | 0;
    const tmp = order[i]; order[i] = order[j2]; order[j2] = tmp;
  }
  /* QUANTOS BICHOS — por REINO, não por reta.
     A conta antiga subia .55 por andar e encostava num teto de 10–12. Do Reino do Gelo pra baixo
     TODO andar nascia no teto, e como a sala do gelo é a MENOR do jogo (13x9) o resultado era
     formigueiro: dez bichos numa arena curta, o andar inteiro convergindo no ratinho no primeiro
     passo. E o pior nem era a dificuldade — era que o 12, o 15 e o 19 viravam o MESMO andar, e
     com todo andar igual não sobra sensação de ter conquistado nenhum.
     Agora cada reino tem a SUA lotação e a SUA rampa, e quem ficou é mais gordo em vez de mais
     numeroso (a rampa de vida/velocidade continua igualzinha). O gelo é o que mais emagrece: lá
     o bicho já é duro — cubo, yeti, mariposa — e a sala é curta. */
  const ESTRATOS = [
    { de: 1,  base: 3.4, passo: .30, teto: 7 },               // masmorra: a escola, enche devagar
    { de: 11, base: 4.2, passo: .16, teto: 6 },               // gelo: menos corpo, sala curta, briga junta
    { de: 21, base: 4.6, passo: .18, teto: 7 },               // esgoto: respira um pouco mais
    { de: 31, base: 5.0, passo: .20, teto: 8 },               // sabá: o auge — e ainda longe dos 12 de antes
  ];
  const est = ESTRATOS.filter(e3 => lv >= e3.de).pop() || ESTRATOS[0];
  const nE = lv % 10 === 0 ? 0
    : Math.min(est.teto, Math.round(est.base + (lv - est.de) * est.passo) + (rnd() < .45 ? 1 : 0));
  /* ONDE eles nascem. Espalhados um a um, o andar virava um chiqueirinho uniforme: bicho em toda
     parte, canto nenhum seguro e nada que pareça um POSTO a ser tomado. Agora nascem em GRUPOS
     de 1 a 3, e nenhum grupo encosta na entrada: você chega, respira, AVANÇA e encontra um bando.
     É o que devolve o ritmo de avançar-e-tomar no lugar do cerco imediato. */
  const FOLGA = w >= 14 ? 6 : 5;                              // raio de silêncio em volta da porta
  const longeDaPorta = (x, y) => Math.abs(x - d.entry[0]) + Math.abs(y - d.entry[1]) >= FOLGA;
  const posto = () => {                                       // âncora de um bando, longe da entrada
    for (let t2 = 0; t2 < 40; t2++){
      const sp = spot(3);
      if (!sp) return null;
      if (longeDaPorta(sp[0], sp[1])) return sp;
      taken.delete(sp[0] + ',' + sp[1]);                      // perto demais: devolve o tile e tenta de novo
    }
    return spot(3);                                           // sala apertada: aceita o que tiver
  };
  const aoLado = (ax, ay) => {                                // companheiro coladinho no posto
    const viz = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    const giro = (rnd() * viz.length) | 0;
    for (let k2 = 0; k2 < viz.length; k2++){
      const [ox, oy] = viz[(k2 + giro) % viz.length];
      const nx = ax + ox, ny = ay + oy, kk = nx + ',' + ny;
      if (!taken.has(kk) && d.free(nx, ny) && longeDaPorta(nx, ny)){ taken.add(kk); return [nx, ny]; }
    }
    return null;
  };
  let ancora = null, faltaNoPosto = 0;
  for (let i = 0; i < nE; i++){
    let sp;
    if (faltaNoPosto > 0 && ancora){                          // ainda montando o bando deste posto
      sp = aoLado(ancora[0], ancora[1]);
      faltaNoPosto--;
    }
    if (!sp){                                                 // posto novo: 1 a 3 bichos juntos
      ancora = posto();
      sp = ancora;
      faltaNoPosto = (rnd() * 2.6) | 0;
    }
    if (!sp) break;
    let f = i < order.length ? order[i] : pool[(rnd() * pool.length) | 0];
    if (f.rat && rnd() < .55) f = pool[(rnd() * pool.length) | 0];   // menos ratos: rerola se cair rato
    const elite = lv >= 6 && rnd() < .07 + lv * .006;         // elite: dobro de vida, +1 de dano — mais raro e só mais fundo
    // a rampa: antes a vida só começava a subir do 11 pra baixo e a agilidade nunca subia —
    // do 4 ao 10 o jogo empacava enquanto o rato só ganhava coração, arma e poder.
    // agora endurece cedo e devagar, e no fundo o bicho fica um tico mais rápido.
    // .04 ➡️ .055 por andar: no nv 10 quase não muda (+38% x +28%), no 40 pesa de verdade
    // (+203% x +148%). O começo continua acolhedor e o fundo é que morde.
    // A reta de .055 por andar não parava nunca: no 32 o bicho tinha 2,6x de vida, eram 13 deles
    // e cada um batia 3 — o andar custava a barra INTEIRA e não dava pra passar. Depois do 26 a
    // rampa deita: continua subindo, mas em .022, e o fundo vira difícil em vez de impossível.
    const rampa2 = Math.min(23, Math.max(0, lv - 3)) * .055 + Math.max(0, lv - 26) * .022;
    const hpMul = (1 + rampa2) * (cursed ? 1.5 : 1);          // fundo endurece · maldição endurece mais
    const vel = Math.max(.82, 1 - Math.max(0, lv - 5) * .006);            // hopS/atkS são segundos: menor = mais ágil
    const ehp = Math.round(f.hp * hpMul) * (elite ? 2 : 1);
    d.actors.push(makeActor(sp[0], sp[1], f.skin, {
      hostile: true, hp: ehp, maxHp: ehp,
      dmg: f.dmg + (elite ? 1 : 0),                          // o +1 geral do nv 25 era o degrau que matava
      hopS: f.hopS * vel, atkS: f.atkS * vel, range: f.range, dir: (i % 4),
      frost: !!f.frost, venom: !!f.venom, card: f.card || null,
    }));
    d.pw += f.pw * (elite ? 2 : 1);
  }
  d.foesMax = d.actors.filter(a2 => a2.hostile).length;       // a régua da barra do placar
  // decoração e luzes
  const tX = [];
  for (let i = 2; i < w - 1; i += 4) tX.push(i + .5);
  d.decor = (time) => {
    tX.forEach(t => drawTorch(gX(t, 0), Math.round(t * TT() - WALLH() * .42), time));
    drawDoor(ey, true);
  };
  d.lights = () => {
    const ls = tX.map(t => ({ x: gX(t, 0), y: t * TT() - WALLH() * .42 - 6, r: TW * 2.4, a: .95, warm: .3 }));
    ls.push({ x: gX(0, ey + .5) + 14, y: (ey + .5) * TT() + 4, r: TW * .9, a: .4, warm: .2 });
    d.lava.forEach((lt, i) => { if (i % 4 === 0) ls.push({ x: gX(lt.x, lt.y), y: gY(lt.x, lt.y), r: TW * 1.5, a: .5, warm: .12 }); });
    d.goo.forEach((lt, i) => { if (i % 4 === 0) ls.push({ x: gX(lt.x, lt.y), y: gY(lt.x, lt.y), r: TW * 1.2, a: .45, warm: .08 }); });
    if (d.cleared) ls.push({ x: gX(d.exit.x, d.exit.y), y: gY(d.exit.x, d.exit.y), r: TW * 2.2, a: .85, moon: true });
    return ls;
  };
  // NINGUÉM PODE FICAR PLANTADO EM TILE BLOQUEADO. Acontecia (raro, ~2 em 12000 salas) de um móvel
  // cair no mesmo tile de um bicho — e se fosse o CHEFE, o andar não fechava nunca, porque não dava
  // pra alcançar ele. Aqui todo mundo que estiver em cima de coisa bloqueada anda pro chão livre
  // mais perto (o chefe 2x2 precisa dos quatro).
  {
    const cabe = (a2, x, y) => (a2.big2 ? [[0, 0], [1, 0], [0, 1], [1, 1]] : [[0, 0]])
      .every(([ox, oy]) => d.free(x + ox, y + oy));
    const acha = a2 => {
      for (let r = 1; r <= 7; r++)
        for (let ox = -r; ox <= r; ox++)
          for (let oy = -r; oy <= r; oy++)
            if (Math.max(Math.abs(ox), Math.abs(oy)) === r && cabe(a2, a2.tx + ox, a2.ty + oy))
              return [a2.tx + ox, a2.ty + oy];
      return null;
    };
    d.actors.forEach(a2 => {
      if (cabe(a2, a2.tx, a2.ty)) return;
      const p3 = acha(a2);
      if (p3){ a2.tx = a2.x = p3[0]; a2.ty = a2.y = p3[1]; }
    });
    for (let k = d.pickups.length - 1; k >= 0; k--){          // item dentro de parede some: ninguém pegaria
      const pk = d.pickups[k];
      if (!d.free(pk.x, pk.y)) d.pickups.splice(k, 1);
    }
  }

  // CONFERE A SALA INTEIRA no fim. O fosso já se desfazia quando isolava um pedaço, mas isso
  // acontecia ANTES dos móveis — e um barril largado na boca de um beco selava o beco. Aqui,
  // se sobrou tile ilhado, o MÓVEL que fechou a passagem é retirado (muro e pilar ficam: são planta).
  for (let tent = 0; tent < 6; tent++){
    const vis2 = new Set([d.entry[0] + ',' + d.entry[1]]), fila2 = [[d.entry[0], d.entry[1]]];
    while (fila2.length){
      const [cx3, cy3] = fila2.pop();
      for (const [ox, oy] of DIRV){
        const nx = cx3 + ox, ny = cy3 + oy, k = nx + ',' + ny;
        if (vis2.has(k) || !d.free(nx, ny)) continue;
        vis2.add(k); fila2.push([nx, ny]);
      }
    }
    const ilha = [];
    for (let x = 0; x < w; x++)
      for (let y = 0; y < h; y++)
        if (d.free(x, y) && !vis2.has(x + ',' + y)) ilha.push([x, y]);
    if (!ilha.length) break;
    let tirou = false;
    for (const [x, y] of ilha)
      for (const [ox, oy] of DIRV){
        const nx = x + ox, ny = y + oy, k = nx + ',' + ny;
        if (!d.blocked.has(k) || d.holes.has(k)) continue;
        const pi = d.props.findIndex(pr => (pr.tiles || []).some(t2 => t2[0] === nx && t2[1] === ny));
        if (pi < 0) continue;                                 // não é móvel: é a planta da sala, fica
        d.props.splice(pi, 1);
        d.blocked.delete(k);
        taken.delete(k);
        tirou = true;
      }
    if (!tirou) break;
  }

  return d;
}

/* ---- sala anexa: LAN house — um ratinho por usuário do WSL do Marcos ----
   Cada máquina tem o dono sentado nela. O visual de cada um é um SKIN próprio (pelo, capa,
   chapéu, adereço) assado UMA vez num canvas e depois só carimbado — sete `drawRatSprite`
   por quadro seria desperdício num cenário que nem tem combate.                              */
const LAN_USERS = [
  { id: 'marcos',  nome: 'marcos',  bio: 'o dono da casa · sessão do Claude Code',
    fur: '#7d848f', furD: '#565c66', furHi: '#9aa0a8', capa: ['#c9a23c', '#8a6c22', '#5c4715'],
    hat: 'crown', acc: { chain: true } },
  { id: 'mariana', nome: 'mariana', bio: 'estação 2',
    fur: '#c2a2ad', furD: '#96798a', furHi: '#dcc2ca', capa: ['#d0508a', '#8f2f5e', '#5e1c3c'],
    hat: 'wig', acc: { earring: true, makeup: true } },
  { id: 'nasa',    nome: 'nasa',    bio: 'estação 3',
    fur: '#8f96a8', furD: '#636a7d', furHi: '#aeb5c6', capa: ['#3a86c8', '#245a8a', '#143a5c'],
    hat: 'wizard', acc: { monocle: true } },
  { id: 'rebello', nome: 'rebello', bio: 'estação 4',
    fur: '#93887a', furD: '#6a6055', furHi: '#b0a596', capa: ['#4f9440', '#356628', '#20421a'],
    hat: 'straw', acc: { bowtie: true } },
  { id: 'kaplan',  nome: 'kaplan',  bio: 'estação 5',
    fur: '#6f7684', furD: '#4c525e', furHi: '#8c93a1', capa: ['#8a6ac8', '#5c4590', '#38285e'],
    hat: 'tophat', acc: { monocle: true, tie: true } },
  { id: 'andre',   nome: 'andre',   bio: 'estação 6',
    fur: '#a08a72', furD: '#75634f', furHi: '#bfa88d', capa: ['#e0642c', '#a5401a', '#6c2810'],
    hat: 'shroom', acc: { mustache: true } },
  { id: 'cohen',   nome: 'cohen',   bio: 'estação 7',
    fur: '#7a8a80', furD: '#54615a', furHi: '#98a89d', capa: ['#2ea8a8', '#1c7070', '#0f4646'],
    hat: 'nutshell', acc: { shades: true, chain: true } },
];
const LAN_TILES = [[2, 1], [4, 1], [6, 1], [2, 3], [4, 3], [6, 3], [4, 5]];
const lanroom = makeWorld(8, 6, true);
lanroom.dark = true;                                          // sala gamer: paredes pretas + neon
lanroom.doors['0,2'] = { to: 'home', spawn: [1, 2] };
LAN_TILES.forEach(([px2, py2], idx) =>
  lanroom.addProp(px2 + py2 + .3, [[px2, py2]], propPC(px2, py2, idx)));
lanroom.decor = (time) => {
  drawDayWindow(true, 1.5, 8, time, false);                   // janelinha pro dia lá fora
  drawDoor(2, true);
  // tubos de NEON na parede preta (rosa e ciano), tremeluzindo como neon de verdade
  { const th = TT();
    const tube = (i0, i1, hgt, rgb, ph) => {
      const y0 = c => Math.round(c * th / (TW / 2)) - Math.round(WALLH() * hgt);
      const x0 = Math.round(gX(i0, 0)), x1 = Math.round(gX(i1, 0));
      const fl = .75 + Math.sin(time * 7 + ph) * .12 + (Math.sin(time * 31 + ph) > .93 ? -.45 : 0);
      g.save();
      g.globalCompositeOperation = 'lighter';
      blurFx(3);
      lote(() => { for (let x = x0; x <= x1; x += 2) P(x, y0(x) - 1, 2, 4, `rgba(${rgb},${.45 * fl})`); });
      g.restore();
      for (let x = x0; x <= x1; x++) P(x, y0(x), 1, 1, `rgba(255,255,255,${.85 * fl})`);
      P(x0 - 2, y0(x0) - 2, 2, 4, '#22262e'); P(x1 + 1, y0(x1) - 2, 2, 4, '#22262e');   // suportes
    };
    tube(2.5, 4.5, .84, '240,70,170', 0);                     // rosa, sobre o letreiro
    tube(4.9, 7.4, .58, '60,220,240', 2.2);                   // ciano
    }
  // letreiro LAN neon na parede do fundo
  { const sx = gX(3.5, 0), sy = Math.round(3.5 * TT() - WALLH() * .72);
    P(sx - 11, sy - 1, 22, 11, OUT); P(sx - 10, sy, 20, 9, '#14251a');
    const gl = ((time * 3) | 0) % 2 ? '#4ade6a' : '#2f8a44';
    ['100100100100111', '010101111101101', '101111101101101'].forEach((pat, li) => {
      for (let k2 = 0; k2 < 15; k2++)
        if (pat[k2] === '1') P(sx - 7 + li * 5 + (k2 % 3), sy + 2 + ((k2 / 3) | 0), 1, 1, gl);
    }); }
  // cabos de rede correndo pelo rodapé
  for (let k2 = 0; k2 < 30; k2++)
    P(gX(0, 5.6) + k2 * 6, Math.round(5.6 * TT()) + (k2 % 2), 4, 1, '#22262e');
};
lanroom.lights = () => {
  const ls = [
    { x: gX(3.5, 0), y: 3.5 * TT() - WALLH() * .84, r: TW * 2.1, a: .6, neon: '240,70,170' },  // neon rosa
    { x: gX(6.1, 0), y: 6.1 * TT() - WALLH() * .58, r: TW * 2, a: .55, neon: '60,220,240' },   // neon ciano
    { x: gX(0, 2.5) + 14, y: 2.5 * TT() + 4, r: TW * .9, a: .35, warm: .2 },
    { x: gX(1.5, 0), y: 1.5 * TT() - WALLH() * .42 - 4, r: TW * 1.6, a: .5, day: true },       // janelinha
  ];
  LAN_TILES.forEach(([px2, py2], idx) => {
    if (lanStatus[idx]) ls.push({ x: gX(px2, py2), y: gY(px2, py2) - 8, r: TW * .9, a: .5, moon: true });
  });
  return ls;
};

const SCENES = { home, dungeon: null, lanroom };
let current = home;

/* ---------------- RPG: INVENTÁRIO / HUD ---------------- */
let quickSlot = 0;                                           // espaço da mochila que fica “na mão” (botão Y / tecla R)
// alguma janela aberta? serve pro frame E pra quem é chamado de fora dele (controle, teclado)
let onOpen = false;                                          // painel do modo online (declarado aqui: o anyPanel lê)
const anyPanel = () => invOpen || askOpen || upOpen || charOpen || hellOpen || liftOpen || onOpen;
const BAG_MAX = 8;                                           // teto de espaços da mochila (5 base + 3 presentes)
let bagUps = 0;                                              // presentes da waifu trocados por espaço
const invMax = () => Math.min(BAG_MAX, 5 + bagUps);
const inv = new Array(BAG_MAX).fill(null);
const invN = new Array(BAG_MAX).fill(0);                     // quantidade por slot (consumíveis empilham)
const STACKS = { potion: 1 };                                // só a poção empilha
const chestItems = new Array(30).fill(null);
const chestN = new Array(30).fill(0);                        // consumíveis também empilham no baú
let weapon = 'dagger', stash = 0, dungeonLevel = 0, power = null, chestOpen = false;
let cheeseN = 0;                                             // queijos empilhados no slot único

/* ---------------- FICHA DO SAPO (jogador 2) ----------------
   Ele tem ARMA, PODER, MOCHILA, stamina e buffs PRÓPRIOS. O único bolso compartilhado é o do
   QUEIJO — é a moeda do casal, e é com ela que a ratinha decide os presentes dos dois.
   Os buffs do rato continuam nas globais antigas (rageT, edgeT…) e os do sapo moram no B2:
   este par poeBuf/leBuf é a única ponte, e é o que deixa UM doSpecial servir aos dois. */
let arma2 = 'dagger', poder2 = null;
const inv2 = new Array(BAG_MAX).fill(null);
const invN2 = new Array(BAG_MAX).fill(0);
let bagUps2 = 0, hpUps2 = 0, stamUps2 = 0, critUps2 = 0;
let cdPoder2 = {}, stamT2 = 0, stamCd2 = 0, dashCd2 = 0, leechHits2 = 0;
let p2BurnT = 0, p2BurnTk = 0, p2FrostT = 0, p2PoisT = 0, p2PoisTk = 0;   // status do sapo, igual aos do rato
const B2 = { rage: 0, edge: 0, leech: 0, aegis: 0, quake: 0, drill: 0, iceTrail: 0 };
const invMax2 = () => Math.min(BAG_MAX, 5 + bagUps2);
const critBase2 = () => Math.min(70, 5 + critUps2 * 4);
const critPct2 = () => Math.min(70, critBase2() + (B2.edge > 0 ? 25 : 0) + (cartaDe(player2, 'cshadow') ? 8 : 0));
const stamCdMax2 = () => Math.max(10, 30 - stamUps2 * 4);
function sapoDmg(){                                           // dano de UM golpe do sapo, com os buffs dele
  const base = (WEAPONS[arma2] ? WEAPONS[arma2].dmg : 1) + (stamT2 > 0 ? 1 : 0) + (cartaDe(player2, 'ccat') ? 2 : 0);
  return Math.max(1, base) * (B2.rage > 0 ? 2 : 1);
}
function poeBuf(eu, k, v){
  if (eu === player2){ B2[k] = v; return; }
  if (k === 'rage') rageT = v;
  else if (k === 'edge') edgeT = v;
  else if (k === 'leech') leechT = v;
  else if (k === 'aegis') aegisT = v;
  else if (k === 'quake') quakeT = v;
  else if (k === 'drill') drillT = v;
  else if (k === 'iceTrail') iceTrailT = v;
}
function leBuf(eu, k){
  if (eu === player2) return B2[k];
  return k === 'rage' ? rageT : k === 'edge' ? edgeT : k === 'leech' ? leechT
    : k === 'aegis' ? aegisT : k === 'quake' ? quakeT
    : k === 'drill' ? drillT : iceTrailT;
}
const armaDe = eu => eu === player2 ? arma2 : weapon;
const poderDe = eu => eu === player2 ? poder2 : power;
const cdDe = eu => eu === player2 ? cdPoder2 : powerCd;
const invDe = eu => eu === player2 ? inv2 : inv;
const invNDe = eu => eu === player2 ? invN2 : invN;
const maxInvDe = eu => eu === player2 ? invMax2() : invMax();
const critDe = eu => eu === player2 ? critPct2() : critPct();
const danoDe = eu => eu === player2 ? sapoDmg() : baseDmg();
const caidoDe = eu => eu === player2 ? p2KO() : pDead();
const cartaDe = (eu, k) => (eu === player2 ? cardSlot2[arma2] : cardSlot[weapon]) === k;   // cada um lê a SUA lâmina
/* A DEFESA saiu do jogo. Era uma barra invisível que absorvia dano antes da vida e reenchia de
   graça no covil — tirava o peso de cada golpe e ainda dava um aviso sem sentido no beijo da
   ratinha. Agora o queijo serve a UMA coisa só: comprar os presentes dela.                     */
/* stamina: corrida de 5s a 1.5x — recarga enorme (30s), reduzível pela waifu */
let stamT = 0, stamCd = 0, stamUps = 0;
const stamCdMax = () => Math.max(10, 30 - stamUps * 4);
/* presentes da waifu: 1º custa 10 queijos, 2º 15, 3º 20... (total acumulado) */
let upsDone = 0, upPend = 0, upGoal = 10, upDismissed = false, upDismissed2 = false;
let upReadyN = 0, callT = null;                              // último aviso mostrado: só comemora quando SOBE
/* DUAS CONTAS DE PRESENTE: a da ratinha (rato) e a da sapinha (sapo). O código do presente lê as
   globais de sempre (stash, upGoal…); `conta(q)` só troca qual das duas está nelas. */
let contaAtiva = 'rato';
const contaGuardada = { stash: 0, upGoal: 10, upPend: 0, upsDone: 0, cenaVista: false };
function conta(q){
  if (q === contaAtiva) return;
  const k = contaGuardada;
  [stash, k.stash] = [k.stash, stash];
  [upGoal, k.upGoal] = [k.upGoal, upGoal];
  [upPend, k.upPend] = [k.upPend, upPend];
  [upsDone, k.upsDone] = [k.upsDone, upsDone];
  [cenaVista, k.cenaVista] = [k.cenaVista, cenaVista];
  contaAtiva = q;
}
const contaDe = q => q === contaAtiva ? [stash, upGoal, upPend, upsDone] : [contaGuardada.stash, contaGuardada.upGoal, contaGuardada.upPend, contaGuardada.upsDone];
function readyUps(q){                                         // presentes a que o ratinho (ou o sapo) já tem direito
  /* SÓ LÊ: quem lê não pode trocar a conta ativa — o updateHUD chama isto no MEIO do depósito do
     sapo, e uma troca aqui fazia o resto do depósito ler os números do rato. */
  const [st, g0, pend, feitos] = contaDe(q || 'rato');
  let n2 = pend, goal = g0;                                  // conta o queijo na mão também: o aviso é pra ir lá
  const tot = st + cheeseN;
  while (tot >= goal){ n2++; goal += 10 + 5 * (feitos + n2); }   // mesma progressão do depósito
  return n2;
}
let critUps = 0, hpUps = 0, leechHits = 0;                                  // presentes trocados por sorte no golpe e por vida
const critBase = () => Math.min(70, 5 + critUps * 4);        // sorte PERMANENTE: 5% base · +4% por presente
const critPct = () => Math.min(70, critBase() + (edgeT > 0 ? 25 : 0) + (hasCard('cshadow') ? 8 : 0));   // +25% do Fio Afiado · +8% da carta

/* uma arma mais poderosa como recompensa em cada nível da dungeon */
const WEAPONS = {
  dagger:   { name: 'Punhal',               dmg: 1,  blade: '#c9d2dc', bladeHi: '#e8eef4', hilt: GOLD,      long: false },
  silver:   { name: 'Adaga de Prata',       dmg: 2,  blade: '#cfe2f4', bladeHi: '#f0f8ff', hilt: '#8aa2c8', long: false },
  spike:    { name: 'Espinho de Ferro',     dmg: 3,  blade: '#8a929b', bladeHi: '#b8c2cc', hilt: '#3a414d', long: false },
  sword:    { name: 'Espada Curta',         dmg: 4,  blade: '#c9d2dc', bladeHi: '#e8eef4', hilt: '#b23a3a', long: true },
  cleaver:  { name: 'Cutelo do Cozinheiro', dmg: 5,  blade: '#aab4be', bladeHi: '#d4dce4', hilt: '#5c4a30', long: true },
  rapier:   { name: 'Florete do Duelista',  dmg: 6,  blade: '#dce8f0', bladeHi: '#ffffff', hilt: '#c9a23c', long: true },
  runeaxe:  { name: 'Machadinha Rúnica',    dmg: 7,  blade: '#7aa89a', bladeHi: '#a8d8c4', hilt: '#2c4f2b', long: true },
  star:     { name: 'Maça Estrela',         dmg: 8,  blade: '#b8a888', bladeHi: '#e0d0a8', hilt: '#232833', long: true },
  flame:    { name: 'Lâmina Flamejante',    dmg: 9,  blade: '#e8963c', bladeHi: '#f2c14e', hilt: '#5e2626', long: true },
  moon:     { name: 'Foice da Lua',         dmg: 10, blade: '#aebfd8', bladeHi: '#e8f0ff', hilt: '#22344e', long: true },
  fang:     { name: 'Presa Real',           dmg: 11, blade: '#f2d98a', bladeHi: '#faecc0', hilt: '#7a5ab2', long: true },
  /* --- gelo (11–19) --- */
  frost:    { name: 'Adaga de Geada',       dmg: 12, blade: '#bfe4f8', bladeHi: '#eefaff', hilt: '#4a7a9e', long: false },
  boreal:   { name: 'Lâmina Boreal',        dmg: 13, blade: '#a8d0ec', bladeHi: '#e0f4ff', hilt: '#2c4a66', long: true },
  glacial:  { name: 'Montante Glacial',     dmg: 14, blade: '#8ec4e8', bladeHi: '#d4f0ff', hilt: '#1e3a52', long: true },
  aurora2:  { name: 'Alfanje da Aurora',    dmg: 15, blade: '#b8ecd8', bladeHi: '#eafff6', hilt: '#7a5ab2', long: true },
  yetifang: { name: 'Presa do Yeti',        dmg: 16, blade: '#e8f4fa', bladeHi: '#ffffff', hilt: '#3a5a74', long: true },
  /* --- esgoto (21–29) --- */
  rusty:    { name: 'Cano Enferrujado',     dmg: 17, blade: '#8a7a52', bladeHi: '#b0a070', hilt: '#4a5a3a', long: false },
  trident:  { name: 'Tridente do Esgoto',   dmg: 18, blade: '#7a9a6a', bladeHi: '#a8cc90', hilt: '#3a4a2c', long: true },
  sludge:   { name: 'Clava de Lodo',        dmg: 19, blade: '#6aa04a', bladeHi: '#94d070', hilt: '#2e3e22', long: true },
  stinger:  { name: 'Ferrão Peçonhento',    dmg: 20, blade: '#b8d05a', bladeHi: '#e0f090', hilt: '#4a5a1e', long: true },
  toadking: { name: 'Gládio do Sapo Real',  dmg: 21, blade: '#c9de8a', bladeHi: '#f0ffc0', hilt: GOLD,      long: true },
};
const WEAPON_BY_LEVEL = {
  1: 'silver', 2: 'spike', 3: 'sword', 4: 'cleaver', 5: 'rapier',
  6: 'runeaxe', 7: 'star', 8: 'flame', 9: 'moon', 10: 'fang',
  11: 'frost', 13: 'boreal', 15: 'glacial', 17: 'aurora2', 19: 'yetifang',
  21: 'rusty', 23: 'trident', 25: 'sludge', 27: 'stinger', 29: 'toadking',
};
const POWERS = {                                             // cooldown maior = poder mais forte
  hex:     { name: 'Praga da Bruxa',    desc: 'amaldiçoa tudo a até 4 tiles por 8s: enquanto durar, o alvo leva DANO EM DOBRO', cd: 18 },
  lantern: { name: 'Lanterna Maldita',  desc: 'planta uma abóbora que estoura: 7 de dano a até 2 tiles e põe fogo em quem sobrar', cd: 15 },
  coven:   { name: 'Revoada de Corvos', desc: 'o bando cruza o andar inteiro: 4 de dano em TODO inimigo da sala, onde quer que esteja', cd: 26 },
  spin:  { name: 'Rodopio de Lâminas', desc: 'gira a lâmina em volta: DANO EM DOBRO em tudo que estiver nas 8 casas vizinhas, inclusive nas diagonais', cd: 6 },
  shock: { name: 'Guincho Sônico',     desc: 'onda sônica que arremessa pra bem longe tudo a até 3 tiles — sem dano', cd: 10 },
  rage:  { name: 'Fúria Rateira',      desc: 'dano em dobro por 10 segundos',                    cd: 20 },
  nova:  { name: 'Nova Glacial',       desc: 'congela inimigos a até 3 tiles por 4s e causa 2 de dano', cd: 14 },
  aegis: { name: 'Casaco de Gelo',     desc: '5 segundos de invencibilidade total',              cd: 18 },
  bomb:  { name: 'Bomba de Lodo',      desc: 'explosão pegajosa: 5 de dano em tudo a até 2 tiles', cd: 15 },
  leech: { name: 'Beijo da Sanguessuga', desc: 'por 10s, cada golpe seu rouba 1 de vida',         cd: 22 },
  quake: { name: 'Terremoto',          desc: 'por 10s, a Escavação DETONA os 8 tiles em volta ao mergulhar (3 de dano) e ao irromper (5). Ativar já bate o pé no chão', cd: 20 },
  drill: { name: 'Broca Rateira',      desc: 'por 10s, a Escavação atravessa 4 tiles, recarrega na hora e fere 3 quem passar por cima do túnel', cd: 22 },
  /* --- pedra --- */
  thrust: { name: 'Estocada Profunda', desc: 'a lâmina fura a fileira: acerta até 3 tiles em linha reta à frente com o dano da arma +1', cd: 8 },
  edge:  { name: 'Fio Afiado',         desc: 'por 10s a lâmina fica sedenta: +25% de chance de crítico e o crítico passa a causar 3× em vez de 2×', cd: 20 },
  heal:  { name: 'Queijo de Emergência', desc: 'devora a reserva secreta e recupera 4 de vida na hora',  cd: 30 },
  /* --- gelo --- */
  icetrail: { name: 'Trilha Congelada', desc: 'por 8s, cada tile pisado vira gelo: quem pisar nele congela 2s e leva 1', cd: 16 },
  shards: { name: 'Estilhaços',        desc: 'três lascas em leque até 4 tiles: 3 de dano e 1,5s de congelamento no primeiro alvo de cada uma', cd: 10 },
  /* --- esgoto --- */
  miasma: { name: 'Névoa Tóxica',      desc: 'nuvem no seu tile e nos vizinhos por 6s: 1 de dano a cada 1,2s em quem respirar dentro', cd: 18 },
  bubble: { name: 'Bolha de Lodo',     desc: 'engarrafa o inimigo mais perto (até 4 tiles) por 3s e causa 2 de dano', cd: 14 },
};
let powerCd = {}, rageT = 0;                                 // recargas em andamento
let burnT = 0, burnTk = 0;                                   // status de queimadura
let frozT = 0;                                               // status de congelamento: −25% de velocidade
let poisT = 0, poisTk = 0;                                   // veneno: NÃO tira vida — emperra as recargas
const venenoDe = eu => (eu === player2 ? p2PoisT : poisT) > 0;
const CD_VENENO = 3;                                          // +3s em toda recarga enquanto durar
let leechT = 0;                                              // Beijo da Sanguessuga ativo
let quakeT = 0, drillT = 0;                                  // Terremoto / Broca: turbinam a Escavação
let iceTrailT = 0, edgeT = 0;                                // Trilha Congelada / Fio Afiado
const iceTiles = [], clouds = [];                            // gelo no chão · névoa tóxica
let miasmaTk = 0;
let aegisT = 0;                                              // Casaco de Gelo: invencibilidade total

// CARTAS DE MONSTRO: caem raro do próprio bicho e encaixam no slot único da arma.
// Cada efeito é a assinatura de combate do monstro que a largou.
const CARDS = {
  cbat:    { name: 'Carta do Morcego Flamejante', col: '#e8963c', hi: '#f8c880', bg: '#3a1c10',
             desc: 'seus golpes INCENDEIAM: 1 de dano por segundo durante 4s' },
  ccube:   { name: 'Carta do Cubo Vivo',          col: '#8ad4f0', hi: '#d8f4ff', bg: '#132a38',
             desc: 'a casca de gelo apara: todo dano recebido cai 1 (nunca abaixo de 1)' },
  cshadow: { name: 'Carta do Rato Sombrio',       col: '#9a6ae0', hi: '#c8a8f8', bg: '#1e1430',
             desc: 'o bote das sombras: +8% de chance de golpe crítico' },
  cyeti:   { name: 'Carta do Yeti',               col: '#cfe8f8', hi: '#ffffff', bg: '#1b2a38',
             desc: 'pelo do norte: imune a congelamento' },
  ctoad:   { name: 'Carta do Sapo do Lodo',       col: '#7ac06a', hi: '#b8e8a0', bg: '#152a16',
             desc: 'couro do esgoto: imune a veneno' },
  cleech:  { name: 'Carta da Sanguessuga Real',   col: '#d0508a', hi: '#f8a0c8', bg: '#2e0f22',
             desc: 'a cada 3 golpes certeiros, rouba 1 de vida' },
  cjack:   { name: 'Carta da Abóbora Saltitante', col: '#ef8b2c', hi: '#ffe14a', bg: '#2a1206',
             desc: 'brasa da abóbora: todo inimigo que você derruba ESTOURA e leva 3 de dano em quem estiver ao lado' },
  ccrow:   { name: 'Carta do Corvo Bruxo',        col: '#8a6ad0', hi: '#d8c0ff', bg: '#170f26',
             desc: 'asa de corvo: o ratinho anda 20% mais rápido' },
  cscare:  { name: 'Carta do Espantalho',         col: '#c9ad62', hi: '#f0dda0', bg: '#241a2e',
             desc: 'cara de espantalho: os bichos te enxergam 3 tiles mais tarde' },
  ccauld:  { name: 'Carta do Caldeirão Vivo',     col: '#8ae05a', hi: '#dcffc0', bg: '#0f2410',
             desc: 'caldo da bruxa: cada poção cura 6 em vez de 3' },
  cmosq:   { name: 'Carta do Mosquito',           col: '#9ab86a', hi: '#d0e8a0', bg: '#1e2612',
             desc: 'zumbido inquieto: você anda 15% mais rápido' },
  ceye:    { name: 'Carta do Observador',         col: '#e070d0', hi: '#f8b8f0', bg: '#2a1030',
             desc: 'passo furtivo: os inimigos só te avistam 2 tiles mais perto' },
  cslime:  { name: 'Carta da Gosma do Arco-íris', col: '#e0a850', hi: '#f8d8a0', bg: '#2e2214',
             desc: 'estômago de gosma: cada queijo do chão cura 3 em vez de 1' },
  cplague: { name: 'Carta do Plague Doctor',      col: '#9ed88a', hi: '#e2ffd2', bg: '#10241a',
             desc: 'névoa alquímica: 15% de chance de um golpe atravessar a fumaça sem te tocar' },
  ccat:    { name: 'Carta do GATO',               col: '#8a90a0', hi: '#d8dce8', bg: '#191c26',
             desc: 'garra do predador: +2 de dano em todo golpe' },
  cyetiB:  { name: 'Carta do YETI ANCIÃO',        col: '#a8dcf8', hi: '#ffffff', bg: '#101f2c',
             desc: 'sopro do norte: 20% dos seus golpes CONGELAM o bicho por 2s' },
  ctoadB:  { name: 'Carta do SAPO REAL',          col: '#6ec24e', hi: '#c8f0a0', bg: '#0f2412',
             desc: 'salto real: a escavação recarrega na METADE do tempo' },
};
const CARD_KEYS = Object.keys(CARDS);
const CARD_ART = {}, CARD_C = {};
let cardSlot = {};                                            // um único slot POR ARMA: cardSlot[arma] = carta
let cardSlot2 = {};                                           // ...e o sapo tem o dele: mesma regra, outra lâmina
let cartaDono = null;                                         // quem deu o último golpe: é dele o brasão que cair
const slotDe = eu => eu === player2 ? cardSlot2 : cardSlot;
const cardOn = () => cardSlot[weapon] || null;
const cardOnDe = eu => slotDe(eu)[armaDe(eu)] || null;        // a carta encaixada na lâmina DAQUELE jogador
const hasCard = k => cardSlot[weapon] === k;
function makeIcon(kind){
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const t = c.getContext('2d');
  const p2 = (x, y, w, h, col) => { t.fillStyle = col; t.fillRect(x, y, w, h); };
  const wd = WEAPONS[kind];
  if (wd){
    const L = wd.long ? 10 : 7, x0 = wd.long ? 13 : 10;
    for (let i = 0; i < L; i++) p2(x0 - i, 1 + i, 3, 1, i % 2 ? wd.blade : wd.bladeHi);
    p2(x0 - L + 1, L - 1, 2, 2, '#8a929b');
    p2(x0 - L - 1, L, 5, 2, wd.hilt);
    p2(x0 - L - 2, L + 2, 3, 3, '#5c4a30'); p2(x0 - L - 3, L + 4, 2, 2, wd.hilt);
  } else if (kind === 'cheese'){
    p2(2, 6, 12, 7, '#d9a234');
    p2(2, 6, 12, 2, '#e8bc50');
    p2(3, 4, 10, 2, '#e8bc50');
    p2(5, 8, 2, 2, '#a87a24'); p2(10, 10, 2, 2, '#a87a24'); p2(8, 6, 1, 1, '#a87a24');
  } else if (kind === 'arcoiris'){                            // PEDRA ARCO-ÍRIS: losango lapidado em faixas
    p2(7, 1, 2, 1, '#14151a'); p2(5, 2, 6, 1, '#14151a'); p2(3, 3, 10, 1, '#14151a');
    p2(2, 4, 12, 6, '#14151a'); p2(3, 10, 10, 1, '#14151a'); p2(5, 11, 6, 1, '#14151a'); p2(7, 12, 2, 2, '#14151a');
    const F = ['#ff5a6e', '#ffa040', '#ffe060', '#6ee07a', '#5ab4ff', '#9a72ff'];
    p2(7, 2, 2, 1, F[0]); p2(5, 3, 6, 1, F[0]); p2(3, 4, 10, 1, F[1]); p2(3, 5, 10, 1, F[1]);
    p2(3, 6, 10, 1, F[2]); p2(3, 7, 10, 1, F[3]); p2(3, 8, 10, 1, F[4]); p2(3, 9, 10, 1, F[4]);
    p2(5, 10, 6, 1, F[5]); p2(7, 11, 2, 1, F[5]);
    p2(5, 4, 2, 2, '#ffffff'); p2(4, 5, 1, 1, '#ffffff');      // brilho da lapidação
    p2(10, 7, 2, 1, 'rgba(255,255,255,.55)'); p2(8, 2, 1, 9, 'rgba(255,255,255,.18)');
  } else if (kind === 'potion'){
    p2(6, 1, 4, 2, '#5c4a30'); p2(6, 3, 4, 2, '#9fb2c8');
    p2(4, 5, 8, 9, '#5e2626'); p2(5, 6, 6, 7, '#b23a3a'); p2(6, 7, 2, 2, '#e88a8a');
  } else if (kind === 'heartmax'){
    p2(3, 3, 4, 3, '#c94a5a'); p2(9, 3, 4, 3, '#c94a5a');
    p2(2, 5, 12, 4, '#c94a5a'); p2(4, 9, 8, 2, '#c94a5a'); p2(6, 11, 4, 2, '#c94a5a'); p2(7, 13, 2, 1, '#8a2e3a');
    p2(3, 3, 4, 1, '#c9a23c'); p2(9, 3, 4, 1, '#c9a23c');     // ourela dourada por DENTRO da silhueta
    p2(2, 5, 1, 4, '#c9a23c'); p2(13, 5, 1, 4, '#c9a23c');
    p2(4, 9, 1, 2, '#c9a23c'); p2(11, 9, 1, 2, '#c9a23c');
    p2(6, 11, 1, 2, '#c9a23c'); p2(9, 11, 1, 2, '#c9a23c');
    p2(7, 13, 2, 1, '#c9a23c');
    p2(4, 4, 2, 2, '#e88a98'); p2(3, 3, 2, 1, '#e8d090');
  } else if (kind === 'spin'){
    p2(6, 6, 4, 4, '#8a6c22'); p2(7, 7, 2, 2, GOLD);         // punho no meio do rodopio
    for (const [sx, sy] of [[1, -1], [1, 1], [-1, 1], [-1, -1]])   // 4 lâminas saindo em diagonal
      for (let i2 = 0; i2 < 4; i2++)
        p2(7 + sx * (3 + i2), 7 + sy * (3 + i2), 2, 2, i2 % 2 ? '#c9d2dc' : '#e8eef4');
    p2(0, 7, 2, 2, 'rgba(200,212,228,.45)'); p2(14, 7, 2, 2, 'rgba(200,212,228,.45)');
    p2(7, 0, 2, 2, 'rgba(200,212,228,.3)'); p2(7, 14, 2, 2, 'rgba(200,212,228,.3)');
  } else if (kind === 'shock'){
    /* GUINCHO — a cabeça inteira de perfil com arcos calculados em volta virava um borrão de
       coisas de 1px. Agora é uma boquinha escancarada e TRÊS crescentes limpos, abrindo e
       apagando: perto pequeno e branco, longe grande e roxo. Lê num relance. */
    const PL = '#f4ecff', PL2 = '#c8b0f0', PL3 = '#8a6ac8', CT = '#22262e';
    p2(0, 5, 5, 6, CT);                                      // focinho de perfil, minúsculo
    p2(1, 6, 3, 4, '#8a929b');
    p2(1, 6, 3, 1, '#b8c2cc');
    p2(1, 6, 1, 1, '#14151a');                               // olhinho apertado
    p2(3, 7, 3, 3, '#2a1219');                               // bocarra escancarada
    p2(3, 7, 3, 1, '#ffffff'); p2(3, 9, 3, 1, '#e8e0d0');    // dentinhos
    // CRESCENTE: corpo de 1px e as pontas curvando pra trás. Barra de 2px cheia virava megafone.
    const arco = (x2, alt, cor) => {
      p2(x2, 8 - alt, 1, alt * 2, cor);
      p2(x2 - 1, 8 - alt, 1, 2, cor); p2(x2 - 1, 6 + alt, 1, 2, cor);
      p2(x2 - 2, 9 - alt, 1, 2, cor); p2(x2 - 2, 5 + alt, 1, 2, cor);
    };
    arco(7, 3, PL); arco(11, 5, PL2); arco(15, 7, PL3);      // perto claro e curtinho, longe fundo e largo
  } else if (kind === 'knife'){
    for (let i = 0; i < 6; i++) p2(11 - i, 2 + i, 3, 1, i % 2 ? '#c9d2dc' : '#e8eef4');  // faca em voo
    p2(6, 7, 2, 2, '#8a929b'); p2(4, 8, 4, 2, GOLD); p2(3, 10, 3, 3, '#5c4a30');
    p2(2, 2, 5, 1, 'rgba(200,212,228,.6)'); p2(1, 5, 4, 1, 'rgba(200,212,228,.4)');      // linhas de vento
  } else if (kind === 'thrust'){
    /* ESTOCADA — eram três tracinhos soltos e uma lâmina na diagonal, sem dizer o que fazia.
       Agora a espada aponta pra frente, com rastro atrás e TRÊS marcas de acerto em cima:
       o poder fura três tiles em linha, e o ícone conta isso. */
    const AC = '#eef4ff', AC2 = '#c8d8e8', AC3 = '#7a838f', CB = '#5c4a30', CB2 = '#7a6244';
    p2(0, 7, 3, 2, 'rgba(200,212,228,.5)');                  // rastro do impulso
    p2(0, 4, 3, 1, 'rgba(200,212,228,.3)'); p2(0, 11, 3, 1, 'rgba(200,212,228,.3)');
    p2(2, 6, 3, 4, CB); p2(2, 6, 3, 1, CB2);                 // cabo
    p2(5, 4, 2, 8, GOLD); p2(5, 4, 2, 1, '#f2d886');         // guarda
    p2(7, 6, 6, 4, AC3);                                     // lâmina
    p2(7, 7, 6, 2, AC); p2(7, 8, 6, 1, AC2);
    p2(13, 6, 2, 4, AC3); p2(13, 7, 2, 2, AC);
    p2(15, 7, 1, 2, '#ffffff');                              // o clarão da ponta
    [8, 11, 14].forEach((x2, i2) => {                        // os 3 tiles furados, marcados por cima
      p2(x2, 3, 1, 1, '#9ad0ee'); p2(x2, 4, 1, 1, 'rgba(154,208,238,.5)');
      p2(x2, 11, 1, 1, 'rgba(154,208,238,.5)');
    });
  } else if (kind === 'rage'){
    p2(7, 0, 2, 3, '#fff0b0');                               // a chama da fúria, de verdade
    p2(6, 2, 4, 3, '#f8e07a');
    p2(5, 4, 6, 4, '#f0a83c');
    p2(4, 7, 8, 4, '#e8663c');
    p2(3, 10, 10, 3, '#d2381f');
    p2(4, 13, 8, 2, '#8a2418');
    p2(6, 5, 4, 6, '#f8c84a'); p2(7, 7, 2, 4, '#fff0b0');    // núcleo quente
    p2(2, 8, 2, 3, '#e8663c'); p2(12, 7, 2, 4, '#e8663c');   // línguas laterais
    p2(1, 11, 2, 2, '#d2381f'); p2(13, 10, 2, 3, '#d2381f');
  } else if (kind === 'bag'){
    p2(3, 5, 10, 9, '#5c4a30'); p2(3, 5, 10, 2, '#6b5636');  // mochila
    p2(5, 2, 6, 4, '#42331f'); p2(6, 3, 4, 2, '#141821');
    p2(6, 9, 4, 3, GOLD); p2(7, 10, 2, 1, '#8a6c22');
  } else if (kind === 'nova'){                               // nova glacial: cristal de verdade, com ramos em V
    const AZ = '#5a9ac8', AZ2 = '#a8d8f0', CL = '#dff2ff', BR = '#ffffff';
    p2(7, 1, 2, 14, AZ2); p2(1, 7, 14, 2, AZ2);              // as quatro hastes
    p2(7, 1, 2, 2, CL); p2(7, 13, 2, 2, CL);                 // pontas mais claras
    p2(1, 7, 2, 2, CL); p2(13, 7, 2, 2, CL);
    const ramo = (x2, y2, dx, dy) => {                       // ramo saindo da haste em diagonal de 1px
      for (let i2 = 0; i2 < 3; i2++) p2(x2 + dx * i2, y2 + dy * i2, 1, 1, i2 === 2 ? AZ : AZ2);
    };
    ramo(6, 3, -1, -1); ramo(9, 3, 1, -1);                   // dois ramos por haste, sempre em V
    ramo(6, 12, -1, 1); ramo(9, 12, 1, 1);
    ramo(3, 6, -1, -1); ramo(3, 9, -1, 1);
    ramo(12, 6, 1, -1); ramo(12, 9, 1, 1);
    p2(6, 5, 4, 6, CL); p2(5, 6, 6, 4, CL);                  // núcleo em losango, pequeno: as hastes continuam lendo
    p2(6, 6, 4, 4, CL); p2(7, 7, 2, 2, BR);
  } else if (kind === 'aegis'){                              // casaco de gelo: broquel de cristal, nada atravessa
    const ES = '#1e3a52', GE = '#5a9ac8', GE2 = '#8ac4e8', CL = '#cfe8fa', BR = '#ffffff';
    const R = [[0, 1, 15], [1, 1, 15], [2, 1, 15], [3, 1, 15], [4, 1, 15], [5, 1, 15], [6, 1, 15],
               [7, 2, 14], [8, 2, 14], [9, 3, 13], [10, 4, 12], [11, 5, 11], [12, 6, 10], [13, 6, 10], [14, 7, 9]];
    R.forEach(([y2, a2, b2]) => p2(a2, y2, b2 - a2, 1, GE));  // lado reto em cima, curva só no bico: é escudo, não funil
    p2(2, 2, 3, 8, CL); p2(6, 3, 3, 9, GE2); p2(10, 3, 3, 6, CL);   // facetas do gelo
    p2(3, 1, 2, 2, BR);
    R.forEach(([y2, a2, b2]) => { p2(a2, y2, 1, 1, ES); p2(b2 - 1, y2, 1, 1, ES); });   // contorno
    p2(1, 0, 14, 1, ES); p2(2, 1, 12, 1, CL);                 // aro de cima e o brilho da aresta
  } else if (kind === 'bomb'){
    p2(4, 5, 8, 8, '#3a5a2c'); p2(5, 6, 6, 6, '#5a8a3a');    // bomba de lodo
    p2(6, 7, 2, 2, '#94d070'); p2(7, 3, 2, 3, '#2a3a1e');
    p2(8, 1, 2, 2, '#e0d84a');
  } else if (kind === 'leech'){
    p2(3, 3, 10, 4, '#c93a5a'); p2(4, 2, 8, 2, '#e05a7a');   // o beijo que drena
    p2(3, 8, 10, 4, '#a02848'); p2(4, 11, 8, 2, '#c93a5a');
    p2(5, 6, 6, 3, '#5c1428');
    p2(4, 3, 3, 1, '#f08aa0'); p2(9, 9, 3, 1, '#e05a7a');
    p2(7, 13, 2, 2, '#c93a4a'); p2(6, 14, 4, 2, '#c93a4a');  // gota de sangue caindo
  } else if (kind === 'stop'){
    p2(3, 0, 10, 2, '#c9a23c'); p2(3, 14, 10, 2, '#c9a23c'); // ampulheta parada
    p2(4, 2, 8, 2, '#e8dcc0'); p2(5, 4, 6, 2, '#e8dcc0');
    p2(6, 6, 4, 4, '#e8dcc0');
    p2(5, 10, 6, 2, '#e8dcc0'); p2(4, 12, 8, 2, '#e8dcc0');
    p2(5, 2, 6, 2, '#f2d98a');                               // areia parada em cima
    p2(7, 6, 2, 4, '#f2d98a');
    p2(5, 11, 6, 3, '#f2d98a');
    p2(4, 2, 1, 12, '#8a6c22'); p2(11, 2, 1, 12, '#8a6c22');
  } else if (kind === 'gears'){
    p2(6, 0, 4, 3, '#e0bc50'); p2(6, 13, 4, 3, '#e0bc50');   // engrenagem com dentes de verdade
    p2(0, 6, 3, 4, '#e0bc50'); p2(13, 6, 3, 4, '#e0bc50');
    p2(2, 2, 3, 3, '#e0bc50'); p2(11, 2, 3, 3, '#e0bc50');
    p2(2, 11, 3, 3, '#e0bc50'); p2(11, 11, 3, 3, '#e0bc50');
    p2(3, 3, 10, 10, '#c9a23c'); p2(4, 4, 8, 8, '#e0bc50');
    p2(4, 4, 8, 1, '#f8ecb8');
    p2(5, 5, 6, 6, '#8a6c22'); p2(6, 6, 4, 4, '#3c2f18');
  } else if (kind === 'edge'){                               // fio afiado: gume soltando faísca
    for (let i2 = 0; i2 < 9; i2++) p2(12 - i2, 2 + i2, 3, 1, i2 % 2 ? '#c8d8e8' : '#eef4ff');
    p2(2, 11, 3, 3, '#5c4a30'); p2(1, 13, 4, 2, '#7a6244');
    p2(13, 0, 2, 3, '#f2c14e'); p2(12, 1, 4, 1, '#f2c14e');   // fagulha na ponta
    p2(9, 3, 1, 2, '#ffe27a'); p2(6, 6, 1, 2, '#ffe27a');
    p2(14, 6, 2, 2, '#f2c14e'); p2(11, 9, 2, 2, '#c9a23c');
  } else if (kind === 'heal'){                                // queijo de emergência
    p2(2, 6, 12, 7, '#d9a234'); p2(2, 6, 12, 2, '#e8bc50');
    p2(3, 4, 10, 2, '#e8bc50');
    p2(4, 9, 2, 2, '#a87a24'); p2(10, 10, 2, 2, '#a87a24');
    p2(11, 1, 4, 2, '#e04a5a'); p2(12, 0, 2, 5, '#e04a5a');   // cruzinha vermelha
    p2(11, 1, 4, 1, '#f06a7a');
  } else if (kind === 'icetrail'){
    /* TRILHA CONGELADA — era UMA placa de gelo tomando o ícone inteiro com uma pegada cravada:
       lia "pegada", não "trilha". Agora são TRÊS pegadas em placas que vão diminuindo na
       diagonal: dá pra ver o caminho que ficou congelado pra trás. */
    const G0 = '#16303f', G1 = '#3f7a9e', G2 = '#8fc9e8', G3 = '#e2f4ff', BR = '#ffffff';
    const passo = (x2, y2, s2, dedos) => {
      p2(x2, y2, s2, s2, G2);                                 // a plaquinha de gelo
      p2(x2, y2, s2, 1, G3); p2(x2, y2 + s2 - 1, s2, 1, G1);
      p2(x2, y2, 1, s2, G3); p2(x2 + s2 - 1, y2, 1, s2, G1);
      const cx2 = x2 + ((s2 - 1) >> 1);
      p2(cx2 - 1, y2 + s2 - 3, 3, 2, G0);                     // coxim
      if (dedos >= 2){ p2(cx2 - 2, y2 + 2, 1, 2, G0); p2(cx2 + 2, y2 + 2, 1, 2, G0); }
      if (dedos >= 3){ p2(cx2 - 1, y2 + 1, 1, 2, G0); p2(cx2 + 1, y2 + 1, 1, 2, G0); }
    };
    passo(0, 9, 7, 3);                                        // a mais perto, inteira
    passo(6, 5, 6, 2);
    passo(11, 1, 5, 1);                                       // a mais longe, quase sumindo
    p2(4, 6, 1, 1, BR); p2(10, 3, 1, 1, BR); p2(14, 8, 1, 1, BR);   // lasquinhas no ar
  } else if (kind === 'shards'){                              // estilhaços: três lascas afiadas abrindo em leque
    const G0 = '#2c5a7a', G1 = '#6aa8d0', G2 = '#bfe4f8', BR = '#ffffff';
    const LASCAS = [                                          // as três saem do MESMO ponto, lá embaixo, e abrem o leque
      [[12, 7, 9], [11, 7, 9], [10, 7, 9], [9, 7, 9], [8, 7, 9], [7, 7, 8], [6, 7, 8], [5, 7, 8], [4, 8, 8], [3, 8, 8], [2, 8, 8]],
      [[12, 6, 7], [11, 6, 7], [10, 5, 6], [9, 4, 6], [8, 4, 5], [7, 3, 4], [6, 2, 4], [5, 2, 3], [4, 1, 2]],
      [[12, 9, 10], [11, 9, 10], [10, 10, 11], [9, 10, 12], [8, 11, 12], [7, 12, 13], [6, 12, 14], [5, 13, 14], [4, 14, 15]],
    ];
    const tomLasca = y2 => y2 >= 10 ? G0 : y2 >= 7 ? G1 : y2 >= 4 ? G2 : BR;   // escurece na base, acende na ponta
    LASCAS.forEach(rs => rs.forEach(([y2, a2, b2]) => p2(a2, y2, b2 - a2 + 1, 1, tomLasca(y2))));
    p2(6, 13, 5, 1, G0); p2(7, 14, 3, 1, G0);                 // o estouro rente ao chão
    p2(7, 12, 3, 1, G1);
  } else if (kind === 'miasma'){                              // névoa tóxica
    p2(4, 1, 3, 3, '#5f9a48'); p2(9, 0, 3, 3, '#4a7a38');    // vapor subindo
    p2(4, 4, 8, 3, '#7ab85e');
    p2(2, 6, 12, 4, '#5f9a48');
    p2(1, 9, 14, 4, '#4a7a38');
    p2(2, 12, 12, 3, '#3a5c2a');
    p2(4, 7, 2, 2, '#a8e07a'); p2(9, 5, 2, 2, '#a8e07a');    // bolhas de veneno
    p2(11, 10, 2, 2, '#a8e07a'); p2(6, 11, 2, 2, '#8ac862');
  } else if (kind === 'bubble'){                              // bolha de lodo
    p2(4, 2, 8, 2, '#7ac04a'); p2(2, 4, 12, 8, '#7ac04a');
    p2(4, 12, 8, 2, '#7ac04a');
    p2(4, 6, 8, 6, '#4a8a2a'); p2(5, 5, 6, 2, '#94d070');
    p2(4, 4, 3, 3, '#dff8c0'); p2(5, 5, 1, 1, '#ffffff');
    p2(6, 8, 4, 3, '#2a4a16');
  } else if (kind === 'bait'){                               // ISCA: um NACO de queijo com pavio aceso
    const QJ = '#d9a234', QJ2 = '#f0c25a', QJD = '#a87a24', CT = '#3a2a12', PV = '#5c4a30';
    const R = [[5, 7, 11], [6, 5, 12], [7, 4, 13], [8, 3, 14], [9, 2, 15],
               [10, 2, 15], [11, 2, 15], [12, 2, 15], [13, 3, 14]];
    R.forEach(([y2, a2, b2]) => p2(a2 - 1, y2, b2 - a2 + 2, 1, CT));   // contorno primeiro
    R.forEach(([y2, a2, b2]) => p2(a2, y2, b2 - a2, 1, y2 < 8 ? QJ2 : QJ));
    p2(3, 13, 11, 1, QJD);                                   // sombra da base
    p2(5, 9, 3, 3, QJD); p2(10, 10, 2, 3, QJD); p2(8, 6, 2, 2, QJD);   // os furos do queijo
    p2(5, 9, 3, 1, '#8a5f18'); p2(10, 10, 2, 1, '#8a5f18');
    p2(9, 1, 2, 4, PV);                                      // pavio saindo de cima
    p2(8, 0, 4, 2, '#f2c14e'); p2(9, 0, 2, 1, '#fff0b0');     // faísca acesa
    p2(13, 1, 2, 1, '#f2c14e'); p2(6, 2, 1, 2, '#f2c14e');
  } else if (kind === 'hex'){                                // PRAGA: crânio de bode num pentagrama roxo
    p2(1, 1, 14, 14, '#1a0f24');
    for (let i = 0; i < 5; i++){                              // estrela de cinco pontas em giz
      const a2 = -Math.PI / 2 + i * 4 * Math.PI / 5, b2 = -Math.PI / 2 + (i + 1) * 4 * Math.PI / 5;
      for (let s2 = 0; s2 <= 8; s2++)
        p2(8 + Math.round((Math.cos(a2) * (1 - s2 / 8) + Math.cos(b2) * (s2 / 8)) * 6.5),
           8 + Math.round((Math.sin(a2) * (1 - s2 / 8) + Math.sin(b2) * (s2 / 8)) * 6.5), 1, 1, '#c86af8');
    }
    p2(5, 5, 6, 5, '#e8e0d0'); p2(6, 10, 4, 2, '#e8e0d0');    // caveirinha no meio
    p2(6, 6, 2, 2, '#1a0f24'); p2(9, 6, 2, 2, '#1a0f24');
    p2(3, 3, 3, 2, '#c9b088'); p2(11, 3, 3, 2, '#c9b088');    // chifres
  } else if (kind === 'lantern'){                            // LANTERNA MALDITA: abóbora com pavio aceso
    p2(7, 0, 2, 3, '#4a6a2c'); p2(8, 0, 2, 2, '#f2c14e');
    p2(2, 4, 12, 11, '#141018');
    p2(3, 5, 10, 9, '#d9701c');
    p2(4, 5, 2, 9, '#ef8b2c'); p2(10, 5, 2, 9, '#ef8b2c');
    p2(3, 5, 10, 1, '#f7b45c');
    p2(4, 7, 3, 3, '#2a0d06'); p2(9, 7, 3, 3, '#2a0d06');
    p2(5, 7, 2, 2, '#ffe14a'); p2(9, 7, 2, 2, '#ffe14a');
    p2(4, 11, 8, 3, '#2a0d06'); p2(5, 11, 2, 2, '#ffe14a'); p2(9, 11, 2, 2, '#ffe14a');
  } else if (kind === 'coven'){                              // REVOADA: três corvos cruzando a lua
    p2(3, 2, 10, 10, '#2a1a3e');
    p2(4, 3, 8, 8, '#e8dcb0'); p2(6, 3, 6, 8, '#f6ecd0');    // lua minguante
    p2(8, 4, 5, 6, '#2a1a3e');
    for (const [ox, oy, sc] of [[1, 9, 1], [7, 12, 1], [11, 7, 0]]){
      p2(ox, oy + 1, 3, 1, '#14101c'); p2(ox + 3, oy, 2, 1, '#14101c'); p2(ox + 5, oy + 1, 3, 1, '#14101c');
      if (sc) p2(ox + 3, oy + 1, 2, 1, '#3a2d52');
    }
  } else if (kind === 'crit'){                               // estrela do golpe crítico
    p2(7, 0, 2, 5, '#e8a832'); p2(7, 11, 2, 5, '#e8a832');
    p2(0, 7, 5, 2, '#e8a832'); p2(11, 7, 5, 2, '#e8a832');
    p2(6, 3, 4, 10, '#f2c14e'); p2(3, 6, 10, 4, '#f2c14e');
    p2(5, 5, 6, 6, '#f2c14e');
    p2(6, 6, 4, 4, '#fff0b0');
    p2(3, 3, 2, 2, '#c9a23c'); p2(11, 11, 2, 2, '#c9a23c');
    p2(11, 3, 2, 2, '#c9a23c'); p2(3, 11, 2, 2, '#c9a23c');
    p2(6, 6, 2, 2, '#ffffff');
  } else if (kind === 'quake'){                              // terremoto: o baque racha o chão e cospe pedra pro alto
    const TR = '#4a3626', TR2 = '#7a5c3e', LZ = '#a5814f', LZ2 = '#c09a68', PT = '#120c08', PO = '#f0dcb0';
    p2(0, 0, 16, 16, TR);                                             // a terra, vista de cima
    [[1, 3, 4, 1], [12, 1, 3, 1], [2, 9, 3, 1], [13, 12, 2, 1], [4, 14, 3, 1], [10, 6, 3, 1]]
      .forEach(([x2, y2, w2, h2]) => p2(x2, y2, w2, h2, '#463322'));  // mancha de terra revolvida
    const FEN = [[0, 7, 10], [1, 7, 10], [2, 6, 9], [3, 6, 9], [4, 5, 9], [5, 6, 10], [6, 7, 11], [7, 7, 11],
                 [8, 6, 10], [9, 6, 10], [10, 5, 9], [11, 5, 9], [12, 6, 10], [13, 7, 11], [14, 7, 11], [15, 8, 11]];
    FEN.forEach(([y2, a2, b2]) => p2(a2 - 1, y2, b2 - a2 + 2, 1, LZ));  // a borda erguida pega luz
    FEN.forEach(([y2, a2, b2]) => p2(a2, y2, b2 - a2, 1, PT));          // e o vão fica preto
    p2(1, 4, 5, 1, LZ); p2(11, 9, 4, 1, LZ);                            // fendas menores saindo pros lados
    p2(1, 5, 5, 1, PT); p2(11, 10, 4, 1, PT);
    p2(2, 1, 2, 1, PO); p2(13, 6, 2, 1, PO); p2(4, 11, 2, 1, PO);      // lascas ainda acesas de poeira
    p2(6, 3, 1, 1, LZ2); p2(10, 12, 1, 1, LZ2);
  } else if (kind === 'drill'){                              // broca: cone estriado girando na terra
    p2(6, 1, 4, 2, '#9fb2c8'); p2(5, 3, 6, 2, '#c8d8e8');
    p2(4, 5, 8, 2, '#9fb2c8'); p2(5, 7, 6, 2, '#c8d8e8');
    p2(6, 9, 4, 2, '#9fb2c8'); p2(7, 11, 2, 2, '#e8f0f8');
    p2(6, 3, 1, 2, '#5c6a7a'); p2(9, 5, 1, 2, '#5c6a7a'); p2(7, 7, 1, 2, '#5c6a7a');
    p2(1, 12, 5, 3, '#4a4438'); p2(10, 12, 5, 3, '#4a4438'); // terra revolvida embaixo
    p2(1, 12, 5, 1, '#6a6152'); p2(10, 12, 5, 1, '#6a6152');
  } else if (kind === 'stam'){                               // raio de stamina verde
    p2(8, 1, 5, 2, '#bff8cc'); p2(7, 3, 4, 2, '#8af0a0');
    p2(6, 5, 4, 2, '#6ade8a'); p2(5, 7, 8, 2, '#8af0a0');
    p2(6, 9, 4, 2, '#6ade8a'); p2(5, 11, 3, 2, '#4ac06a');
    p2(4, 13, 2, 2, '#2e8a4a');
  } else if (kind === 'rotr' || kind === 'rotl'){            // girar o mapa (fontes do sistema não têm ⟲⟳)
    const fl = kind === 'rotl';
    const px = (x2, y2, w2, h2, c2) => p2(fl ? 16 - x2 - w2 : x2, y2, w2, h2, c2);
    px(3, 3, 7, 2, '#c8d4e4'); px(2, 4, 2, 8, '#c8d4e4');    // arco
    px(3, 11, 8, 2, '#c8d4e4'); px(11, 9, 2, 3, '#c8d4e4');
    px(10, 2, 2, 6, '#eef4ff'); px(12, 4, 2, 2, '#eef4ff');  // ponta de seta
    px(14, 5, 1, 1, '#eef4ff');
  } else if (kind === 'plaguehead'){                         // plague doctor v4: capuz pontudo preto, máscara de osso com bico
    [[0, 4, 7], [1, 3, 9], [2, 2, 11], [3, 1, 13], [4, 0, 14], [5, 0, 14], [6, 0, 14], [7, 0, 14], [8, 0, 14], [9, 0, 14], [10, 0, 14],
      [11, 1, 13], [12, 2, 12], [13, 3, 11], [14, 4, 10]].forEach(([y, x0, x1]) => p2(x0, y, x1 - x0 + 1, 1, '#4a4f5e'));   // rebordo claro
    [[0, 5, 6], [1, 4, 8], [2, 3, 10], [3, 2, 12], [4, 1, 13], [5, 1, 13], [6, 1, 13], [7, 1, 13], [8, 1, 13], [9, 1, 13], [10, 1, 13],
      [11, 2, 12], [12, 3, 11], [13, 4, 10]].forEach(([y, x0, x1]) => p2(x0, y, x1 - x0 + 1, 1, y < 2 ? '#383c49' : y > 11 ? '#191b21' : '#262933'));
    p2(5, 3, 6, 1, '#191b21'); p2(4, 4, 8, 6, '#191b21'); p2(5, 10, 7, 1, '#191b21'); p2(6, 11, 6, 1, '#191b21');   // abertura
    p2(6, 4, 4, 1, '#ffffff'); p2(5, 5, 6, 2, '#e9e5db'); p2(5, 7, 7, 1, '#e9e5db');                                  // placa dos olhos
    p2(6, 8, 8, 1, '#e9e5db'); p2(8, 9, 7, 1, '#e9e5db'); p2(10, 10, 5, 1, '#b9b3a6'); p2(12, 11, 2, 1, '#857f73');  // bico descendo pra frente
    p2(13, 8, 1, 1, '#ffffff'); p2(14, 9, 1, 1, '#ffffff'); p2(5, 5, 1, 3, '#b9b3a6');                                 // crista na luz, bochecha na sombra
    p2(6, 6, 1, 2, '#14151a'); p2(8, 6, 2, 2, '#14151a');    // dois FUROS: o de longe mais estreito
  } else if (kind === 'pad'){                                // controle de videogame
    p2(1, 5, 14, 7, '#3a4150');
    p2(2, 4, 12, 2, '#4a5262'); p2(2, 4, 12, 1, '#5a6272');
    p2(0, 7, 3, 5, '#3a4150'); p2(13, 7, 3, 5, '#3a4150');
    p2(3, 7, 2, 5, '#1c2029'); p2(2, 8, 4, 2, '#1c2029');    // direcional
    p2(10, 6, 2, 2, '#5f8f57'); p2(12, 8, 2, 2, '#c94a5a');  // botões coloridos
    p2(10, 10, 2, 2, '#4a9ae0'); p2(8, 8, 2, 2, '#e0bc50');
  } else if (kind === 'upready'){                            // a ratinha mandando um coração: dá pra melhorar
    p2(1, 2, 3, 3, '#d8a8b8'); p2(7, 2, 3, 3, '#d8a8b8');    // orelhinhas
    p2(2, 3, 1, 1, '#f0c8d4'); p2(8, 3, 1, 1, '#f0c8d4');
    p2(1, 4, 9, 9, '#e8e0d4');                               // cabecinha
    p2(1, 4, 9, 2, '#f4efe6');
    p2(3, 8, 2, 1, '#3a3026'); p2(6, 8, 2, 1, '#3a3026');    // olhinhos de carinho
    p2(5, 10, 2, 1, '#c98a9a');                              // focinho
    p2(2, 9, 1, 1, '#f0a8b8'); p2(8, 9, 1, 1, '#f0a8b8');    // blush
    p2(7, 1, 2, 2, '#c93a4a'); p2(9, 2, 2, 2, '#c93a4a');    // lacinho
    p2(11, 4, 2, 2, '#e0485e'); p2(14, 4, 2, 2, '#e0485e');  // coração voando
    p2(10, 6, 6, 3, '#e0485e');
    p2(11, 9, 4, 1, '#c03048'); p2(12, 10, 2, 1, '#c03048');
    p2(11, 4, 1, 1, '#ff9ab0');
  } else if (CARDS[kind]){                                   // CARTA: moldura dourada e o brasão do bicho
    const cd2 = CARDS[kind];
    p2(2, 1, 12, 14, '#0f1016');
    p2(3, 2, 10, 12, '#c9a23c');
    p2(4, 3, 8, 10, '#1a2030');
    p2(5, 4, 6, 8, cd2.col);
    p2(6, 5, 4, 4, cd2.hi);
    p2(6, 10, 4, 1, '#0f1016');
    p2(3, 2, 10, 1, '#e0bc50'); p2(3, 13, 10, 1, '#8a6c22');
  } else if (kind === 'nopower'){                            // sem poder: interrogação apagada
    p2(5, 2, 6, 2, '#544c62'); p2(4, 3, 2, 3, '#544c62');
    p2(10, 3, 2, 4, '#6a6080'); p2(8, 7, 3, 2, '#6a6080');
    p2(7, 9, 2, 2, '#544c62'); p2(7, 13, 2, 2, '#7a5ab2');
  }
  ICONC[kind] = c;                                            // guarda o canvas: a pose de item usa ele
  return c.toDataURL();
}
function makeWaifuKiss(){                                     // retrato 40x40 da ratinha mandando um beijo
  const c = document.createElement('canvas'); c.width = 40; c.height = 40;
  const t = c.getContext('2d');
  const q = (x, y, w, h, col) => { t.fillStyle = col; t.fillRect(x, y, w, h); };
  const FUR = '#e8e0d4', FUR2 = '#f6f2ea', SHD = '#cfc4b4', LIN = '#3a3026';
  q(3, 1, 10, 11, LIN); q(24, 1, 10, 11, LIN);                // orelhonas contornadas, bem acima da cabeça
  q(4, 2, 8, 9, FUR); q(25, 2, 8, 9, FUR);
  q(6, 4, 4, 5, '#e6a8bc'); q(27, 4, 4, 5, '#e6a8bc');
  q(7, 9, 24, 22, LIN);                                       // contorno da cabeça
  q(8, 10, 22, 20, FUR);
  q(8, 10, 22, 5, FUR2);                                      // luz no alto
  q(8, 26, 22, 4, SHD);
  q(11, 18, 5, 2, LIN); q(23, 18, 5, 2, LIN);                 // olhos fechadinhos de carinho
  q(12, 17, 3, 1, LIN); q(24, 17, 3, 1, LIN);
  q(9, 21, 4, 3, '#f0a8b8'); q(26, 21, 4, 3, '#f0a8b8');      // blush
  q(18, 22, 3, 2, '#c98a9a');                                 // focinho
  q(17, 25, 5, 3, LIN); q(18, 25, 3, 2, '#e0708a');           // boquinha soprando
  q(30, 9, 5, 5, '#8a2434'); q(34, 11, 4, 5, '#8a2434');      // lacinho na base da orelha direita
  q(31, 10, 3, 3, '#c93a4a'); q(35, 12, 2, 3, '#c93a4a');
  q(33, 12, 2, 2, '#e05a5a');
  q(10, 28, 9, 8, LIN);                                       // patinha erguida ao lado da boca
  q(11, 29, 7, 6, FUR);
  q(12, 30, 5, 2, FUR2);
  q(12, 33, 2, 2, '#e6a8bc'); q(15, 33, 2, 2, '#e6a8bc');     // coxinhas da patinha
  q(24, 20, 4, 3, '#c03048'); q(30, 20, 4, 3, '#c03048');     // coração saindo do beijo
  q(23, 22, 12, 5, '#e0485e');
  q(25, 27, 8, 2, '#c03048'); q(27, 29, 4, 2, '#c03048');
  q(24, 20, 2, 2, '#ff9ab0');
  q(21, 30, 2, 2, '#ffd0da'); q(37, 17, 2, 2, '#ffd0da');     // brilhinhos do beijo
  return c.toDataURL();
}
// ARTE DA CARTA (48x64, estilo carta de monstro): moldura dourada, retrato do bicho e plaquinha embaixo
function makeCardArt(kind){
  const c = document.createElement('canvas'); c.width = 48; c.height = 64;
  const t = c.getContext('2d');
  const q = (x, y, w, h, col) => { t.fillStyle = col; t.fillRect(x, y, w, h); };
  const cd = CARDS[kind];
  q(0, 0, 48, 64, '#0b0c10');                                 // borda externa preta
  q(1, 1, 46, 62, '#8a6c22');                                 // moldura dourada com brilho no alto
  q(1, 1, 46, 1, '#e8c96a'); q(2, 2, 44, 1, '#c9a23c');
  q(1, 62, 46, 1, '#5c4715');
  q(3, 3, 42, 58, '#12141c');
  q(4, 4, 40, 42, cd.bg || '#1c2230');                        // painel do retrato
  q(4, 4, 40, 3, cd.hi);                                      // luz no topo do painel
  q(4, 43, 40, 3, 'rgba(0,0,0,.45)');
  for (let i = 0; i < 40; i += 2) q(4 + i, 6 + (i % 4), 1, 1, 'rgba(255,255,255,.05)');   // textura de papel
  const P2 = (x, y, w, h, col) => q(4 + x, 6 + y, w, h, col);  // retrato: origem no canto do painel
  const A = cd.col, B = cd.hi, D = '#0d0f16';
  if (kind === 'cbat'){                                       // morcego flamejante
    P2(4, 12, 10, 8, D); P2(26, 12, 10, 8, D);                // asas
    P2(2, 10, 6, 5, A); P2(32, 10, 6, 5, A);
    P2(6, 18, 8, 4, '#8a3a12'); P2(26, 18, 8, 4, '#8a3a12');
    P2(14, 10, 12, 14, D); P2(15, 11, 10, 6, '#3a2418');      // corpo
    P2(15, 6, 4, 5, D); P2(21, 6, 4, 5, D);                   // orelhas
    P2(17, 14, 3, 3, '#ff4a2a'); P2(22, 14, 3, 3, '#ff4a2a'); // olhos em brasa
    P2(18, 20, 2, 3, B); P2(21, 20, 2, 3, B);                 // presinhas
  } else if (kind === 'ccube'){                               // cubo vivo
    P2(9, 8, 22, 22, D); P2(10, 9, 20, 20, A); P2(11, 10, 18, 6, B);
    P2(14, 16, 12, 8, '#2a6a8a'); P2(16, 18, 4, 3, '#f0a860'); // peixinho preso
    P2(20, 18, 4, 2, '#f0a860'); P2(17, 18, 1, 1, D);
    P2(12, 24, 4, 2, B); P2(24, 12, 3, 3, '#ffffff');
  } else if (kind === 'cshadow'){                             // rato sombrio
    P2(11, 6, 6, 6, D); P2(23, 6, 6, 6, D);                   // orelhas
    P2(9, 10, 22, 18, D); P2(11, 12, 18, 12, '#2a2036');
    P2(13, 16, 5, 3, '#ff3a3a'); P2(22, 16, 5, 3, '#ff3a3a'); // olhar vermelho
    P2(18, 22, 4, 2, '#4a3a52');
    P2(4, 24, 8, 3, A); P2(28, 24, 8, 3, A);                  // capuz esvoaçando
  } else if (kind === 'cyeti'){                               // yeti
    P2(8, 6, 24, 24, D); P2(9, 7, 22, 22, A); P2(10, 8, 20, 8, B);
    P2(6, 12, 5, 8, A); P2(29, 12, 5, 8, A);                  // tufos laterais
    P2(14, 15, 4, 4, D); P2(22, 15, 4, 4, D);                 // olhinhos
    P2(16, 22, 8, 4, D); P2(17, 23, 2, 3, B); P2(21, 23, 2, 3, B);  // presas
  } else if (kind === 'ctoad'){                               // sapo do lodo
    P2(6, 12, 28, 16, D); P2(7, 13, 26, 14, A); P2(8, 14, 24, 5, B);
    P2(9, 6, 9, 9, D); P2(22, 6, 9, 9, D);                    // olhos bojudos
    P2(10, 7, 7, 7, '#f0e8c0'); P2(23, 7, 7, 7, '#f0e8c0');
    P2(12, 9, 3, 4, D); P2(25, 9, 3, 4, D);
    P2(12, 23, 16, 2, '#2a4a1e');                             // boca larga
    P2(11, 19, 3, 2, '#4a7a3a'); P2(26, 20, 3, 2, '#4a7a3a'); // verrugas
  } else if (kind === 'cleech'){                              // sanguessuga real
    for (let k = 0; k < 5; k++) P2(8 + k * 5, 10 + (k % 2) * 3, 7, 12, k % 2 ? A : '#a03a68');
    P2(6, 8, 12, 12, D); P2(7, 9, 10, 10, A);                 // ventosa
    P2(10, 12, 4, 4, D); P2(11, 13, 2, 2, B);
    P2(30, 20, 6, 5, '#7a2a48');
  } else if (kind === 'cjack'){                               // abóbora saltitante
    P2(3, 4, 36, 30, D); P2(5, 6, 32, 26, '#d9701c');
    P2(8, 6, 6, 26, '#ef8b2c'); P2(20, 6, 6, 26, '#ef8b2c'); P2(31, 8, 5, 22, '#ef8b2c');
    P2(5, 6, 32, 3, '#f7b45c');
    P2(18, 0, 5, 6, D); P2(19, 1, 3, 5, '#4a6a2c');
    P2(9, 12, 9, 8, '#2a0d06'); P2(24, 12, 9, 8, '#2a0d06');
    P2(11, 12, 6, 5, '#ffe14a'); P2(24, 12, 6, 5, '#ffe14a');
    P2(19, 18, 4, 6, '#2a0d06'); P2(20, 20, 2, 3, '#ffe14a');
    P2(9, 25, 24, 7, '#2a0d06'); P2(9, 25, 24, 2, '#ffb02a');
    for (let i = 0; i < 4; i++) P2(11 + i * 6, 25, 3, 5, '#ffe14a');
  } else if (kind === 'ccrow'){                               // corvo bruxo
    for (const sx of [-1, 1])
      for (let f = 0; f < 4; f++)
        P2(21 + sx * (5 + f * 5) - (sx < 0 ? 6 : 0), 16 + f * 2, 7, 10 - f * 2, f % 2 ? '#1b1826' : '#2e2740');
    P2(15, 12, 13, 20, D); P2(16, 13, 11, 18, '#1b1826'); P2(18, 14, 7, 8, '#2e2740');
    P2(15, 2, 13, 12, D); P2(16, 3, 11, 10, '#1b1826'); P2(17, 3, 9, 4, '#5a3f7a');
    P2(27, 6, 10, 4, D); P2(28, 7, 9, 3, '#e8b03c'); P2(28, 7, 6, 1, '#f6cd6a');
    P2(17, 6, 4, 4, '#c86af8'); P2(23, 6, 4, 4, '#c86af8');
    P2(17, 6, 2, 2, '#f0d0ff'); P2(23, 6, 2, 2, '#f0d0ff');
  } else if (kind === 'cscare'){                              // espantalho de palha
    P2(2, 16, 40, 4, D); P2(3, 17, 38, 2, '#5e4568');
    for (let i = 0; i < 6; i++) P2(1 + (i % 2) * 38, 12 + i * 2, 5, 2, i % 2 ? '#e8cf7a' : '#c9ad62');
    P2(13, 18, 18, 16, D); P2(14, 19, 16, 14, '#41304c');
    P2(12, 2, 20, 16, D); P2(13, 3, 18, 14, '#a8925e'); P2(13, 3, 18, 4, '#c0a870');
    for (let i = 0; i < 5; i++) P2(11 + i * 5, 0, 4, 3, i % 2 ? '#e8cf7a' : '#c9ad62');
    for (const ox of [16, 24]){
      P2(ox, 7, 6, 6, '#2a2230'); P2(ox + 1, 8, 4, 4, '#b464f0'); P2(ox + 2, 9, 2, 2, '#e8c0ff');
    }
    P2(15, 15, 14, 2, '#2a2230');
    for (let i = 0; i < 6; i++) P2(16 + i * 2, 14, 1, 4, '#2a2230');
  } else if (kind === 'ccauld'){                              // caldeirão vivo
    for (const sx of [-1, 0, 1]){ P2(21 + sx * 13 - 2, 28, 5, 6, D); P2(21 + sx * 13 - 1, 29, 3, 5, '#3b3648'); }
    P2(4, 10, 34, 20, D); P2(5, 11, 32, 18, '#2a2632'); P2(5, 11, 32, 4, '#3b3648');
    P2(3, 8, 36, 5, D); P2(4, 9, 34, 3, '#3b3648'); P2(4, 9, 34, 1, '#565064');
    P2(7, 11, 28, 4, '#66d84a'); P2(7, 11, 28, 2, '#a8f26a');
    for (let i = 0; i < 5; i++) P2(9 + i * 6, 4 + (i % 3) * 3, 3 + (i % 2) * 2, 3, '#a8f26a');
    P2(12, 11, 6, 4, '#0e2a08'); P2(25, 11, 6, 4, '#0e2a08');
    P2(13, 11, 3, 3, '#e8ffd0'); P2(26, 11, 3, 3, '#e8ffd0');
    P2(14, 12, 2, 2, '#14151a'); P2(27, 12, 2, 2, '#14151a');
    P2(30, 0, 4, 14, D); P2(31, 1, 2, 13, '#6b4a28'); P2(29, 0, 7, 5, D); P2(30, 1, 5, 3, '#7c5931');
  } else if (kind === 'cmosq'){                               // mosquito do pântano
    P2(6, 6, 14, 8, 'rgba(220,240,200,.5)'); P2(20, 6, 14, 8, 'rgba(220,240,200,.5)');
    P2(15, 10, 10, 14, D); P2(16, 11, 8, 8, A);
    P2(14, 6, 12, 6, D); P2(15, 7, 10, 4, B);                 // cabeça
    P2(17, 8, 2, 2, '#ff4a4a'); P2(21, 8, 2, 2, '#ff4a4a');
    P2(19, 24, 2, 10, D); P2(19, 24, 1, 9, B);                // tromba
  } else if (kind === 'ceye'){                                // observador
    P2(8, 8, 24, 22, D); P2(9, 9, 22, 20, '#e8e0e8');
    P2(15, 13, 12, 12, D); P2(16, 14, 10, 10, A);
    P2(19, 17, 5, 5, D); P2(20, 15, 2, 2, '#ffffff');
    for (const [ox, oy] of [[4, 4], [32, 6], [6, 28], [30, 26]]) P2(ox, oy, 5, 3, A);   // veias flutuantes
  } else if (kind === 'cslime'){                              // gosma do arco-íris
    P2(7, 12, 26, 18, D);
    const RB = ['#e05a5a', '#e09a4a', '#e0d84a', '#5ac06a', '#4a9ae0', '#9a6ae0'];
    for (let k = 0; k < 6; k++) P2(8 + k * 4, 13, 4, 16, RB[k]);
    P2(8, 13, 24, 4, 'rgba(255,255,255,.35)');
    P2(13, 19, 4, 4, D); P2(24, 19, 4, 4, D);                 // olhinhos
    P2(14, 20, 2, 2, '#ffffff'); P2(25, 20, 2, 2, '#ffffff');
  } else if (kind === 'cplague'){                             // plague doctor v4: busto encapuzado, máscara de osso com bico longo
    P2(2, 31, 36, 9, D); P2(3, 32, 34, 8, '#262933'); P2(3, 32, 34, 2, '#383c49');   // ombros da capa
    P2(19, 33, 2, 7, '#191b21'); P2(21, 35, 1, 1, '#4a4f5e'); P2(21, 38, 1, 1, '#4a4f5e');   // fenda e botões
    const oval = (cx, cy, rx, ry, y0, y1, cor) => {           // fileiras de uma elipse, de y0 a y1
      for (let yy = y0; yy <= y1; yy++){
        const v = (yy - cy) / ry, hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - v * v)));
        if (hw > 0) P2(cx - hw, yy, hw * 2, 1, typeof cor === 'function' ? cor(yy) : cor);
      }
    };
    const PONTA = [[0, 9, 11], [1, 8, 13], [2, 7, 15], [3, 6, 18], [4, 6, 21]];   // ponta do capuz tombando pra trás
    PONTA.forEach(([y, x0, x1]) => P2(x0 - 1, y - 1, x1 - x0 + 3, 3, D));
    oval(20, 18, 15, 15, 3, 33, D);                           // contorno do capuz
    PONTA.forEach(([y, x0, x1]) => P2(x0, y, x1 - x0 + 1, 1, y < 2 ? '#383c49' : '#262933'));
    oval(20, 18, 14, 14, 4, 32, yy => yy < 8 ? '#383c49' : yy > 28 ? '#191b21' : '#262933');
    for (let yy = 8; yy <= 26; yy++){ P2(6, yy, 2, 1, '#191b21'); P2(32, yy, 2, 1, '#383c49'); }   // sombra à esquerda, luz à direita
    oval(21, 18, 11, 11, 7, 29, '#191b21');                   // abertura: o fundo escuro
    const MK = [[8, -5, 4], [9, -7, 6], [10, -8, 7], [11, -8, 7], [12, -8, 7], [13, -8, 7], [14, -8, 7], [15, -8, 7], [16, -8, 8],
      [17, -7, 9], [18, -6, 11], [19, -4, 13], [20, -2, 14], [21, 1, 15], [22, 4, 15], [23, 7, 14], [24, 10, 13], [25, 12, 12]];
    MK.forEach(([y, x0, x1]) => P2(22 + x0 - 1, y - 1, x1 - x0 + 3, 3, D));
    MK.forEach(([y, x0, x1]) => P2(22 + x0, y, x1 - x0 + 1, 1, y < 10 ? '#ffffff' : y > 22 ? '#b9b3a6' : '#e9e5db'));
    for (let yy = 10; yy <= 16; yy++) P2(14, yy, 1, 1, '#b9b3a6');                            // bochecha de longe na sombra
    [[17, 9], [18, 11], [19, 13], [20, 14]].forEach(([y, x1]) => P2(22 + x1 - 1, y, 2, 1, '#ffffff'));   // crista do bico na luz
    [[19, -4], [20, -2], [21, 1], [22, 4], [23, 7]].forEach(([y, x0]) => P2(22 + x0, y, 2, 1, '#857f73'));   // barriga do bico na sombra
    P2(16, 11, 3, 3, D); P2(24, 11, 4, 3, D);                 // dois FUROS pretos: o de longe mais estreito
    P2(34, 22, 1, 1, D);                                      // respiradouro
    P2(37, 19, 2, 2, B); P2(36, 15, 2, 2, B); P2(38, 11, 2, 2, B);                      // vapor da peste
  } else if (kind === 'cyetiB'){                              // YETI ANCIÃO: gelo pendurado e barba de neve
    P2(2, 0, 3, 7, B); P2(8, 0, 3, 9, B); P2(14, 0, 2, 5, B);     // estalactites, sem encostar na testa
    P2(25, 0, 2, 6, B); P2(30, 0, 3, 8, B); P2(36, 0, 3, 6, B);
    P2(6, 11, 28, 25, D); P2(7, 12, 26, 23, A); P2(8, 13, 24, 4, B);   // cabeçorra
    P2(2, 17, 5, 12, D); P2(3, 18, 3, 10, A);                 // tufos laterais
    P2(33, 17, 5, 12, D); P2(34, 18, 3, 10, A);
    P2(12, 19, 5, 6, D); P2(23, 19, 5, 6, D);                 // olhos fundos
    P2(13, 20, 3, 3, '#7fd8ff'); P2(24, 20, 3, 3, '#7fd8ff');
    P2(13, 28, 14, 6, D);                                     // bocarra
    P2(14, 28, 3, 4, B); P2(23, 28, 3, 4, B);                 // presas
    P2(9, 34, 22, 4, B); P2(12, 38, 16, 2, A);                // barba congelada
  } else if (kind === 'ctoadB'){                              // SAPO REAL: coroa entre os olhos bojudos
    P2(2, 12, 36, 26, D); P2(3, 13, 34, 24, A); P2(4, 14, 32, 5, B);   // corpanzil
    P2(10, 27, 20, 3, '#25401c');                             // boca larga de rei
    P2(11, 30, 3, 2, '#25401c'); P2(26, 30, 3, 2, '#25401c');
    P2(6, 22, 4, 3, '#3f7a34'); P2(30, 22, 4, 3, '#3f7a34');  // verrugas
    P2(3, 6, 13, 13, D); P2(24, 6, 13, 13, D);                // olhos bojudos, montados no corpo
    P2(4, 7, 11, 11, '#f7e9a8'); P2(25, 7, 11, 11, '#f7e9a8');
    P2(7, 10, 5, 7, D); P2(28, 10, 5, 7, D);                  // pupilas em pé
    P2(8, 11, 2, 2, B); P2(29, 11, 2, 2, B);
    P2(15, 0, 10, 6, D);                                      // coroa, bem no meio da testa
    P2(16, 0, 8, 4, '#e8c04a'); P2(16, 0, 8, 1, '#fff0a0');
    P2(16, 4, 2, 2, '#c9a23c'); P2(22, 4, 2, 2, '#c9a23c');
    P2(19, 1, 2, 2, '#c03048');                               // pedra vermelha no meio
  } else {                                                    // O GATO
    P2(5, 4, 9, 11, D); P2(26, 4, 9, 11, D);                  // orelhas pontudas
    P2(7, 6, 5, 7, A); P2(28, 6, 5, 7, A);
    P2(8, 8, 2, 4, '#8a4a5a'); P2(29, 8, 2, 4, '#8a4a5a');
    P2(6, 12, 28, 18, D); P2(7, 13, 26, 16, A); P2(8, 14, 24, 5, B);
    P2(11, 18, 6, 4, '#7ae06a'); P2(23, 18, 6, 4, '#7ae06a'); // olhar verde
    P2(13, 19, 2, 3, D); P2(25, 19, 2, 3, D);
    P2(17, 23, 6, 3, '#c8b0b8');
    P2(15, 26, 2, 4, '#ffffff'); P2(23, 26, 2, 4, '#ffffff'); // presas
  }
  q(4, 47, 40, 12, '#0d0f16');                                // plaquinha do rodapé
  q(4, 47, 40, 1, '#c9a23c');
  for (let i = 0; i < 5; i++) q(8 + i * 7, 51, 5, 4, i % 2 ? cd.col : cd.hi);   // faixa de cor da carta
  q(4, 58, 40, 1, '#5c4715');
  CARD_C[kind] = c;                                           // o chão desenha a própria carta, não um queijo
  return c.toDataURL();
}
const ICON = {}, ICONC = {};
Object.keys(WEAPONS).concat(['cheese', 'potion', 'arcoiris', 'heartmax', 'spin', 'shock', 'knife', 'rage', 'nova', 'aegis', 'bomb', 'leech', 'stop', 'gears', 'quake', 'drill', 'crit', 'thrust', 'edge', 'heal', 'icetrail', 'shards', 'miasma', 'bubble', 'bag', 'stam', 'nopower', 'rotl', 'rotr', 'upready', 'pad', 'plaguehead', 'hex', 'lantern', 'coven']).concat(CARD_KEYS)
  .forEach(k => ICON[k] = makeIcon(k));
CARD_KEYS.forEach(k => CARD_ART[k] = makeCardArt(k));         // a arte grande de cada carta

/* ---- pixel art original pra TODO emoji da interface (nada de fonte do sistema) ---- */
function makeEmo(k){
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const t = c.getContext('2d');
  const p2 = (x, y, w, h, col) => { t.fillStyle = col; t.fillRect(x, y, w, h); };
  if (k === 'jack'){                                          // ABÓBORA DE HALLOWEEN: sorriso maldoso aceso por dentro
    p2(6, 0, 3, 3, '#3f5a2a'); p2(7, 0, 2, 2, '#587a38');    // cabinho torto
    p2(2, 3, 12, 12, '#141018');                             // silhueta
    p2(3, 4, 10, 10, '#d9701c');
    p2(1, 5, 2, 8, '#141018'); p2(13, 5, 2, 8, '#141018');   // as bochechas transbordam a silhueta
    p2(2, 6, 1, 6, '#b8590f'); p2(13, 6, 1, 6, '#b8590f');
    p2(4, 4, 2, 10, '#ef8b2c'); p2(10, 4, 2, 10, '#ef8b2c'); // gomos claros
    p2(7, 4, 2, 10, '#f4a03e');
    p2(3, 5, 10, 1, '#f7b45c');
    p2(4, 7, 3, 3, '#2a0d06'); p2(9, 7, 3, 3, '#2a0d06');    // olhos triangulares
    p2(5, 7, 2, 2, '#ffe14a'); p2(9, 7, 2, 2, '#ffe14a');
    p2(5, 8, 1, 1, '#fff7c0'); p2(10, 8, 1, 1, '#fff7c0');
    p2(6, 9, 1, 2, '#2a0d06'); p2(9, 9, 1, 2, '#2a0d06');    // narizinho em cunha
    p2(7, 10, 2, 1, '#ffe14a');
    p2(4, 11, 8, 3, '#2a0d06');                              // bocarra rasgada
    p2(4, 11, 8, 1, '#ffb02a');
    p2(5, 12, 1, 2, '#ffe14a'); p2(8, 12, 1, 2, '#ffe14a');  // dentes acesos
    p2(10, 12, 1, 2, '#ffe14a');
    p2(6, 13, 2, 1, '#ff8c1a');
  } else if (k === 'hole'){                                   // toca escavada: montinho de terra e o vão escuro
    p2(2, 6, 12, 7, '#14151a');
    p2(3, 7, 10, 5, '#20242c');
    p2(4, 8, 8, 3, '#05070c');
    p2(1, 9, 4, 4, '#3a4250'); p2(11, 9, 4, 4, '#3a4250');    // terra revolvida nas bordas
    p2(1, 9, 4, 1, '#5a6474'); p2(11, 9, 4, 1, '#5a6474');
    p2(2, 12, 3, 2, '#2a303a'); p2(11, 12, 3, 2, '#2a303a');
    p2(6, 3, 2, 2, '#5a6474'); p2(9, 2, 2, 2, '#3a4250');      // torrões saltando
    p2(4, 4, 2, 2, '#3a4250');
  } else if (k === 'heart'){
    p2(3, 2, 4, 2, '#f06a7a'); p2(9, 2, 4, 2, '#f06a7a');
    p2(2, 4, 12, 3, '#e04a5a');
    p2(3, 7, 10, 2, '#c93a4a'); p2(4, 9, 8, 2, '#c93a4a');
    p2(5, 11, 6, 1, '#a82e3e'); p2(6, 12, 4, 1, '#a82e3e'); p2(7, 13, 2, 1, '#8a2434');
    p2(4, 3, 2, 2, '#ffb0bc');
  } else if (k === 'skull'){
    p2(4, 2, 8, 6, '#e8e4da'); p2(3, 3, 10, 5, '#e8e4da');
    p2(5, 4, 2, 3, '#14151a'); p2(9, 4, 2, 3, '#14151a');
    p2(7, 7, 2, 1, '#14151a');
    p2(5, 8, 6, 3, '#d8d2c4');
    p2(5, 9, 1, 2, '#14151a'); p2(7, 9, 1, 2, '#14151a'); p2(9, 9, 1, 2, '#14151a');
    p2(4, 2, 2, 1, '#fff');
  } else if (k === 'poison'){
    p2(2, 10, 3, 2, '#b8d890'); p2(11, 10, 3, 2, '#b8d890');  // ossos cruzados
    p2(2, 13, 3, 2, '#b8d890'); p2(11, 13, 3, 2, '#b8d890');
    p2(4, 11, 8, 1, '#a8c880'); p2(4, 13, 8, 1, '#a8c880');
    p2(4, 1, 8, 5, '#cfe0b0'); p2(3, 2, 10, 4, '#cfe0b0');    // crânio esverdeado
    p2(5, 3, 2, 2, '#1a2a14'); p2(9, 3, 2, 2, '#1a2a14');
    p2(7, 5, 2, 1, '#1a2a14');
    p2(5, 6, 6, 2, '#b8cfa0'); p2(6, 6, 1, 2, '#1a2a14'); p2(8, 6, 1, 2, '#1a2a14');
  } else if (k === 'fire'){
    p2(7, 1, 2, 3, '#e05a2a');
    p2(5, 3, 3, 3, '#e05a2a'); p2(9, 4, 3, 2, '#e05a2a');
    p2(4, 5, 9, 5, '#e8963c');
    p2(3, 8, 10, 4, '#e05a2a'); p2(5, 8, 6, 4, '#f2c14e');
    p2(6, 10, 4, 3, '#faf0c8');
  } else if (k === 'ragef'){
    p2(3, 3, 10, 10, '#d84a3a'); p2(4, 2, 8, 1, '#d84a3a'); p2(4, 13, 8, 1, '#b23a2e');
    p2(4, 5, 3, 1, '#5a1410'); p2(9, 5, 3, 1, '#5a1410');     // sobrancelhas caídas
    p2(5, 6, 2, 2, '#14151a'); p2(9, 6, 2, 2, '#14151a');
    p2(5, 10, 6, 2, '#5a1410'); p2(6, 10, 1, 2, '#f0e8e0'); p2(8, 10, 1, 2, '#f0e8e0');
    p2(4, 3, 2, 2, '#f08a6a');
  } else if (k === 'blood'){
    p2(7, 1, 2, 3, '#c94a5a');
    p2(6, 4, 4, 3, '#c94a5a');
    p2(5, 6, 6, 5, '#b23a4a'); p2(4, 8, 8, 3, '#b23a4a');
    p2(6, 11, 4, 2, '#8a2434');
    p2(6, 8, 2, 2, '#e88a96');
  } else if (k === 'shield'){
    p2(3, 2, 10, 7, '#5a6a80'); p2(4, 9, 8, 3, '#5a6a80'); p2(6, 12, 4, 2, '#46536a');
    p2(3, 2, 10, 2, GOLD);
    p2(7, 4, 2, 8, '#c9a23c'); p2(5, 6, 6, 2, '#c9a23c');
    p2(4, 4, 2, 5, '#7a8aa0');
  } else if (k === 'swords'){
    for (let i = 0; i < 8; i++){ p2(3 + i, 2 + i, 2, 2, '#c8d4e4'); p2(11 - i, 2 + i, 2, 2, '#aebccc'); }
    p2(2, 11, 4, 2, '#8a6c22'); p2(10, 11, 4, 2, '#8a6c22');
    p2(3, 13, 2, 2, '#5c4a30'); p2(11, 13, 2, 2, '#5c4a30');
  } else if (k === 'gift'){
    p2(2, 6, 12, 8, '#b23a3a'); p2(2, 6, 12, 3, '#c94a4a');
    p2(7, 4, 2, 10, '#e8bc50');
    p2(2, 8, 12, 2, '#e8bc50');
    p2(4, 2, 3, 3, '#e8bc50'); p2(9, 2, 3, 3, '#e8bc50'); p2(7, 3, 2, 2, '#c9a23c');
  } else if (k === 'house'){
    p2(2, 7, 12, 7, '#8a6a42'); p2(3, 8, 10, 5, '#a5814f');
    for (let i = 0; i < 6; i++) p2(2 + i, 6 - i, 12 - i * 2, 1, '#b23a3a');
    p2(1, 7, 14, 1, '#8a2434');
    p2(6, 9, 4, 5, '#5c4a30'); p2(7, 10, 1, 2, GOLD);
    p2(11, 9, 2, 2, '#8ad8f8');
  } else if (k === 'rathead'){
    p2(2, 3, 4, 4, '#7f8894'); p2(10, 3, 4, 4, '#7f8894');
    p2(3, 4, 2, 2, '#e8a0a8'); p2(11, 4, 2, 2, '#e8a0a8');
    p2(4, 6, 8, 7, '#9aa4b2'); p2(3, 7, 10, 5, '#9aa4b2');
    p2(5, 8, 2, 2, '#14151a'); p2(9, 8, 2, 2, '#14151a');
    p2(5, 8, 1, 1, '#fff'); p2(9, 8, 1, 1, '#fff');
    p2(7, 11, 2, 2, '#e8a0a8');
    p2(2, 11, 2, 1, '#d8dce4'); p2(12, 11, 2, 1, '#d8dce4');
  } else if (k === 'froghead'){
    p2(3, 2, 3, 3, '#5c9440'); p2(10, 2, 3, 3, '#5c9440');
    p2(4, 3, 2, 2, '#d8c840'); p2(11, 3, 2, 2, '#d8c840');
    p2(4, 3, 1, 2, '#14151a'); p2(11, 3, 1, 2, '#14151a');
    p2(2, 5, 12, 8, '#4a7a34'); p2(3, 6, 10, 5, '#5c9440');
    p2(4, 10, 8, 1, '#2a4a20');
    p2(5, 8, 2, 1, '#3a5c2a'); p2(9, 7, 2, 1, '#3a5c2a');
  } else if (k === 'cathead'){
    p2(2, 2, 3, 4, '#2c3038'); p2(11, 2, 3, 4, '#2c3038');
    p2(3, 3, 1, 2, '#e8a0a8'); p2(12, 3, 1, 2, '#e8a0a8');
    p2(3, 5, 10, 8, '#3a3f48'); p2(2, 6, 12, 6, '#3a3f48');
    p2(4, 7, 3, 2, '#e8d84a'); p2(9, 7, 3, 2, '#e8d84a');
    p2(5, 7, 1, 2, '#14151a'); p2(10, 7, 1, 2, '#14151a');
    p2(7, 10, 2, 1, '#e8a0a8');
    p2(1, 10, 3, 1, '#d8dce4'); p2(12, 10, 3, 1, '#d8dce4');
    p2(6, 11, 1, 2, '#f0f0f0'); p2(9, 11, 1, 2, '#f0f0f0');
  } else if (k === 'crown'){
    p2(2, 3, 2, 5, GOLD); p2(7, 2, 2, 6, GOLD); p2(12, 3, 2, 5, GOLD);
    p2(2, 8, 12, 4, GOLD); p2(2, 8, 12, 1, '#e8cf7a');
    p2(4, 10, 2, 2, '#c93a4a'); p2(10, 10, 2, 2, '#3a6ac9'); p2(7, 10, 2, 2, '#4a9a5a');
  } else if (k === 'sparkle'){
    p2(7, 2, 2, 10, '#f2e2b0'); p2(3, 6, 10, 2, '#f2e2b0');
    p2(6, 5, 4, 4, '#fff6d0');
    p2(12, 2, 2, 2, '#e8cf7a'); p2(2, 11, 2, 2, '#e8cf7a');
  } else if (k === 'arrow'){
    p2(2, 6, 8, 4, '#e8cf7a');
    p2(9, 3, 2, 10, '#e8cf7a'); p2(11, 5, 2, 6, '#e8cf7a'); p2(13, 7, 1, 2, '#e8cf7a');
  } else if (k === 'target'){
    p2(2, 2, 12, 12, '#c93a4a'); p2(4, 4, 8, 8, '#f0ece0'); p2(6, 6, 4, 4, '#c93a4a'); p2(7, 7, 2, 2, '#14151a');
  } else if (k === 'crate'){
    p2(2, 3, 12, 11, '#8a6a42'); p2(3, 4, 10, 9, '#a5814f');
    p2(7, 3, 2, 11, '#d9b268'); p2(2, 3, 12, 2, '#c9a23c');
    p2(3, 4, 1, 9, '#6b5636'); p2(12, 4, 1, 9, '#6b5636');
  } else if (k === 'hat'){
    p2(1, 9, 14, 3, '#d9a94a'); p2(2, 8, 12, 1, '#e8bc50');
    p2(4, 4, 8, 5, '#e8bc50'); p2(5, 3, 6, 1, '#e8bc50');
    p2(4, 7, 8, 2, '#b23a3a');
  } else if (k === 'scarf'){
    p2(3, 4, 10, 4, '#b23a3a'); p2(3, 4, 10, 1, '#c94a4a');
    p2(8, 8, 4, 5, '#b23a3a'); p2(8, 12, 4, 2, '#8a2434');
    p2(8, 8, 1, 5, '#8a2434');
    p2(8, 14, 1, 2, '#c94a4a'); p2(10, 14, 1, 2, '#c94a4a');
  } else if (k === 'ring'){
    p2(5, 6, 6, 2, GOLD); p2(4, 7, 2, 5, GOLD); p2(10, 7, 2, 5, GOLD); p2(5, 12, 6, 2, GOLD);
    p2(6, 2, 4, 4, '#8ad8f8'); p2(7, 3, 2, 2, '#e0f8ff');
  } else if (k === 'sndon'){
    p2(2, 6, 3, 4, '#8a929b'); p2(5, 4, 3, 8, '#aeb8c4');
    p2(9, 5, 1, 6, '#e8cf7a'); p2(11, 3, 1, 10, '#e8cf7a'); p2(13, 1, 1, 14, '#c9a23c');
  } else if (k === 'sndoff'){
    p2(2, 6, 3, 4, '#8a929b'); p2(5, 4, 3, 8, '#aeb8c4');
    p2(9, 5, 2, 2, '#c94a4a'); p2(11, 7, 2, 2, '#c94a4a'); p2(13, 9, 2, 2, '#c94a4a');
    p2(13, 5, 2, 2, '#c94a4a'); p2(9, 9, 2, 2, '#c94a4a');
  } else if (k === 'eye'){
    p2(3, 6, 10, 4, '#f0ece0'); p2(4, 5, 8, 6, '#f0ece0');
    p2(6, 5, 4, 6, '#4a9ac9'); p2(7, 6, 2, 4, '#14151a');
    p2(7, 6, 1, 1, '#fff');
    p2(4, 4, 8, 1, '#5a6270');
  } else if (k === 'pc'){
    p2(2, 2, 12, 9, '#22262e'); p2(3, 3, 10, 7, '#0e141c');
    p2(4, 4, 5, 1, '#4adf6a'); p2(4, 6, 7, 1, '#e03c96'); p2(4, 8, 4, 1, '#3cc8e6');
    p2(6, 11, 4, 2, '#3a4150'); p2(4, 13, 8, 1, '#4a5262');
  } else if (k === 'check'){
    p2(2, 8, 2, 2, '#4a9a5a'); p2(4, 10, 2, 2, '#4a9a5a'); p2(6, 12, 2, 2, '#5fbf6f');
    p2(8, 9, 2, 3, '#5fbf6f'); p2(10, 6, 2, 3, '#5fbf6f'); p2(12, 3, 2, 3, '#5fbf6f');
  } else if (k === 'xmark'){
    for (let i = 0; i < 5; i++){ p2(3 + i * 2, 3 + i * 2, 3, 3, '#c94a4a'); p2(3 + i * 2, 9 - i * 2, 3, 3, '#c94a4a'); }
  } else if (k === 'gust'){
    p2(2, 4, 8, 2, '#c8d4e4'); p2(10, 3, 3, 2, '#e8f0f8');
    p2(4, 8, 9, 2, '#aebccc'); p2(2, 12, 6, 2, '#c8d4e4'); p2(9, 11, 3, 2, '#e8f0f8');
  } else if (k === 'boom'){
    p2(7, 1, 2, 4, '#f2c14e'); p2(7, 11, 2, 4, '#f2c14e'); p2(1, 7, 4, 2, '#f2c14e'); p2(11, 7, 4, 2, '#f2c14e');
    p2(3, 3, 3, 3, '#e8963c'); p2(10, 3, 3, 3, '#e8963c'); p2(3, 10, 3, 3, '#e8963c'); p2(10, 10, 3, 3, '#e8963c');
    p2(5, 5, 6, 6, '#e05a2a'); p2(6, 6, 4, 4, '#f2c14e'); p2(7, 7, 2, 2, '#faf0c8');
  } else if (k === 'icecube'){
    p2(3, 3, 10, 10, '#8ac4e8'); p2(4, 4, 8, 8, '#bfe4f8');
    p2(4, 4, 3, 2, '#eefaff'); p2(9, 9, 2, 2, '#6aaad0');
    p2(7, 5, 1, 4, '#5a8cb4'); p2(8, 8, 1, 3, '#5a8cb4');
    p2(3, 14, 10, 1, '#1b2a14');
  } else if (k === 'lips'){
    p2(3, 6, 4, 2, '#c93a4a'); p2(9, 6, 4, 2, '#c93a4a');
    p2(7, 7, 2, 1, '#8a2434');
    p2(2, 8, 12, 2, '#b23a3a');
    p2(4, 10, 8, 2, '#c93a4a'); p2(6, 12, 4, 1, '#8a2434');
    p2(4, 8, 2, 1, '#f08a96');
  } else if (k === 'trash'){
    p2(6, 1, 4, 1, '#8a929b'); p2(4, 2, 8, 1, '#8a929b');
    p2(3, 3, 10, 1, '#aeb8c4');
    p2(4, 5, 8, 9, '#6a7482');
    p2(5, 6, 1, 7, '#8a929b'); p2(8, 6, 1, 7, '#8a929b'); p2(10, 6, 1, 7, '#8a929b');
  }
  return c.toDataURL();
}
const EMO = {};
const EMO_SRC = {
  '❤': 'heart', '♥': 'heart', '💀': 'skull', '☠': 'poison', '🔥': 'fire', '😡': 'ragef',
  '🩸': 'blood', '🛡': 'shield', '⚔': 'swords', '🎁': 'gift', '🏠': 'house', '🐭': 'rathead',
  '🐀': 'rathead', '🐸': 'froghead', '🐈': 'cathead', '👑': 'crown', '✨': 'sparkle', '➡': 'arrow',
  '🎯': 'target', '📦': 'crate', '👒': 'hat', '🧣': 'scarf', '💍': 'ring', '🔊': 'sndon',
  '🔇': 'sndoff', '👁': 'eye', '🖥': 'pc', '✔': 'check', '✖': 'xmark', '💨': 'gust',
  '💥': 'boom', '🧊': 'icecube', '💋': 'lips', '🗑': 'trash', '⏳': 'stop', '⏱': 'stop',
  '⚡': 'stam', '❄': 'nova', '🔪': 'knife', '⚙': 'gears',
  '🎒': 'bag', '🧀': 'cheese', '🔄': 'rotr', '🧪': 'potion', '🌈': 'arcoiris',
  '🕳': 'hole', '🫧': 'bubble', '🪨': 'quake', '🎮': 'pad', '⚗': 'plaguehead', '🎃': 'jack',
};
for (const [e, k] of Object.entries(EMO_SRC)) EMO[e] = ICON[k] || (ICON[k] = makeEmo(k));
// RETRATO DO PODER: a chave do poder é a do save e não se mexe nela, mas o desenho pode
// mudar de reino. A ampulheta e a engrenagem seguem sendo ⏳ e ⚙ nos textos de recarga.
const POWER_ICON = {};
const iconePoder = k => ICON[POWER_ICON[k] || k];
const EMO_RX = new RegExp('(' + Object.keys(EMO).join('|') + ')️?', 'gu');
function emojify(s){                                          // troca emoji por pixel art do jogo
  return String(s).replace(EMO_RX, (m, e) => `<img class="emo" src="${EMO[e]}" alt="${m}">`);
}

const slotsEl = document.getElementById('slots');
const slotDivs = [];
{
  const w = document.createElement('div');
  w.className = 'slot weapon'; w.title = 'Arma principal';
  w.onclick = () => { if (cardOn()) showCard(cardOn()); else toast(`⚔️ dano ${WEAPONS[weapon].dmg}`); };
  slotsEl.appendChild(w); slotDivs.push(w);
  const pw2 = document.createElement('div');
  pw2.className = 'slot power'; pw2.title = 'Poder especial (botão roxo / K)';
  pw2.onclick = () => toast(power ? `✨ ${POWERS[power].name}` : '✖️ sem poder');
  slotsEl.appendChild(pw2); slotDivs.push(pw2);
  for (let i = 0; i < BAG_MAX; i++){                          // cria o teto; os extras só aparecem quando conquistados
    const s = document.createElement('div');
    s.className = 'slot';
    s.onclick = () => onInvClick(i);
    slotsEl.appendChild(s); slotDivs.push(s);
  }
  const ch = document.createElement('div');                   // slot dedicado de queijo: sempre coleta
  ch.className = 'slot cheeseS';
  ch.title = 'Queijos carregados — entregue à sua amada';
  ch.onclick = () => toast(`🧀 ${cheeseN}`);
  slotsEl.appendChild(ch); slotDivs.push(ch);
}
const slots2El = document.getElementById('slots2');           // a MESMA fileira, na mochila do sapo
const slot2Divs = [];
{
  const w2 = document.createElement('div');
  w2.className = 'slot weapon'; w2.title = 'Arma do sapo';
  w2.onclick = () => { const k2 = cardSlot2[arma2]; if (k2) showCard(k2); else toast(`🐸 ⚔️ dano ${WEAPONS[arma2].dmg}`); };
  slots2El.appendChild(w2); slot2Divs.push(w2);
  const p3 = document.createElement('div');
  p3.className = 'slot power'; p3.title = 'Poder do sapo';
  p3.onclick = () => toast(poder2 ? `🐸 ✨ ${POWERS[poder2].name}` : '✖️ sem poder');
  slots2El.appendChild(p3); slot2Divs.push(p3);
  for (let i = 0; i < BAG_MAX; i++){
    const s3 = document.createElement('div');
    s3.className = 'slot';
    s3.onclick = () => onInvClick(i, player2);
    slots2El.appendChild(s3); slot2Divs.push(s3);
  }
}
/* O BOTÃO DA LÍNGUA. Ele nasceu no 2-jogadores da lan, onde o sapo é simulado aqui mesmo: ligava
   `p2WantAtk` e pronto. Numa SALA isso não vai a lugar nenhum — quem simula o sapo é o dono, e o
   sinal morria aqui, descartado em silêncio no fim do quadro. Era por isso que o parceiro batia no
   botão no celular e não acontecia nada. Agora ele passa pelo MESMO caminho do botão do rato:
   apertar segura (e carrega o giro), soltar dispara. É esse caminho que fala com o dono. */
{ const a2 = document.getElementById('b2Atk');
  a2.addEventListener('pointerdown', e => { e.preventDefault(); p2HoldAtk(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => a2.addEventListener(ev, p2ReleaseAtk)); }
document.getElementById('b2Spc').addEventListener('pointerdown', () => { p2WantSpc = true; });
document.getElementById('b2Stam').addEventListener('pointerdown', () => { p2WantStam = true; });
document.getElementById('b2Inv').onclick = () => { if (invOpen) closeInv(); else openInv(player2); };
document.getElementById('b2Atk').style.backgroundSize = '46%';
document.getElementById('b2Atk').style.backgroundPosition = 'center 32%';
document.getElementById('b2Atk').style.backgroundRepeat = 'no-repeat';
document.getElementById('bAtk').style.backgroundSize = '46%';
document.getElementById('bAtk').style.backgroundPosition = 'center 32%';
document.getElementById('bAtk').style.backgroundRepeat = 'no-repeat';

function upReadyFx(){                                         // aberração, lampejo branco e fagulhas saindo da tela
  // "ELA TE CHAMA" é um chamado: quem já está COLADO nela não precisa ser chamado. Antes o
  // letreirão caía bem em cima da entrega, tapando os dois bonecos na hora da cena.
  if (current === home && Math.abs(player.tx - waifu.tx) + Math.abs(player.ty - waifu.ty) <= 1) return;
  enfileira('r:chama', 2800, () => {                          // a ratinha no meio da tela: pela fila também
    const cu = document.getElementById('callUp');
    document.getElementById('callUpSub').textContent = current === home ? 'fale com ela pra melhorar' : 'volte ao covil pra melhorar';
    cu.classList.remove('play'); void cu.offsetWidth; cu.classList.add('play');
    clearTimeout(callT); callT = setTimeout(() => cu.classList.remove('play'), 2700);
  });
  chromaT = Math.max(chromaT, .55);
  shake(2.5, .35);
  SFX.charged();
  const fx = document.getElementById('upFx');
  fx.classList.remove('play'); void fx.offsetWidth; fx.classList.add('play');
  const px = gX(player.x, player.y), py = gY(player.x, player.y) - 22;
  for (let i = 0; i < 26; i++){                               // fagulhas brancas abrindo pra fora
    const an = i / 26 * 6.2832 + hash(i, 41) * .5;
    const sp = 70 + hash(i, 42) * 120;
    dust.push({
      x: px + Math.cos(an) * 6, y: py + Math.sin(an) * 4,
      vx: Math.cos(an) * sp, vy: Math.sin(an) * sp * .6 - 30 - hash(i, 43) * 40,
      life: .45 + hash(i, 44) * .35, kind: 'upP', sz: hash(i, 45) > .6 ? 3 : 2,
    });
  }
}
function refreshUpReady(){
  const n2 = readyUps(onlineConvidado() ? 'sapo' : 'rato');   // o aviso da tela é do MEU boneco
  const el = document.getElementById('upReady');
  if (el){
    el.classList.toggle('on', n2 > 0 && !upOpen);
    document.getElementById('upReadyN').textContent = n2 > 1 ? '×' + n2 : '';
  }
  if (n2 > upReadyN) upReadyFx();
  upReadyN = n2;
}
function updateHUD(){
  document.getElementById('hpFill').style.transform = `scaleX(${Math.max(0, player.hp / player.maxHp)})`;
  document.getElementById('hpNum').textContent = `${Math.max(0, player.hp)}/${player.maxHp}`;
  slotDivs[0].style.backgroundImage = `url(${ICON[weapon]})`;
  slotDivs[0].innerHTML = cardOn()                            // a carta encaixada fica VISÍVEL na arma
    ? `<span class="cpip" style="background-image:url(${ICON[cardOn()]})" title="${CARDS[cardOn()].name}"></span>` : '';
  slotDivs[1].style.backgroundImage = power ? `url(${iconePoder(power)})` : 'none';
  for (let i = 0; i < BAG_MAX; i++){
    const el = slotDivs[i + 2];
    el.style.display = i < invMax() ? '' : 'none';            // espaço conquistado aparece na barra
    el.classList.toggle('qs', i === quickSlot && i < invMax());   // o espaço “na mão”, no botão Y
    el.style.backgroundImage = inv[i] ? `url(${ICON[inv[i]]})` : 'none';
    el.innerHTML = invN[i] > 1 ? `<span class="n">${invN[i]}</span>` : '';
  }
  const chEl = slotDivs[BAG_MAX + 2];                         // slot dedicado de queijo
  chEl.style.backgroundImage = `url(${ICON.cheese})`;
  chEl.style.opacity = cheeseN > 0 ? 1 : .35;
  chEl.innerHTML = cheeseN > 0 ? `<span class="n">${cheeseN}</span>` : '';
  document.getElementById('bAtk').style.backgroundImage = `url(${ICON[weapon]})`;
  const bS = document.getElementById('bSpc');
  bS.style.backgroundImage = `url(${power ? iconePoder(power) : ICON.nopower})`;
  bS.classList.toggle('off', !power);
  const p2w = document.getElementById('p2wrap');               // vida e barra do sapo, só com ele em campo
  if (p2w){
    p2w.style.display = p2On ? '' : 'none';
    if (p2On){
      const larg = Math.round(190 * Math.min(1.4, player2.maxHp / Math.max(1, player.maxHp)));
      document.getElementById('p2Bar').style.width = larg + 'px';   // barra PROPORCIONAL à do rato
      document.getElementById('p2Fill').style.transform = `scaleX(${Math.max(0, player2.hp / player2.maxHp)})`;
      document.getElementById('p2Num').textContent = p2KO() ? 'KO' : `${Math.max(0, player2.hp)}/${player2.maxHp}`;
      document.getElementById('p2Bar').classList.toggle('ko', p2KO());
    }
  }
  const p2b = document.getElementById('p2bar');
  if (p2b){
    p2b.classList.toggle('on', p2On);
    p2b.classList.toggle('ko', p2KO());
    if (p2On){
      slot2Divs[0].style.backgroundImage = `url(${ICON[arma2]})`;
      slot2Divs[0].innerHTML = cardSlot2[arma2]                // a carta do sapo fica VISÍVEL na lâmina dele
        ? `<span class="cpip" style="background-image:url(${ICON[cardSlot2[arma2]]})" title="${CARDS[cardSlot2[arma2]].name}"></span>` : '';
      slot2Divs[1].style.backgroundImage = poder2 ? `url(${ICON[poder2]})` : 'none';
      for (let i = 0; i < BAG_MAX; i++){
        const el = slot2Divs[i + 2];
        el.style.display = i < invMax2() ? '' : 'none';
        el.classList.toggle('qs', i === quick2 && i < invMax2());
        el.style.backgroundImage = inv2[i] ? `url(${ICON[inv2[i]]})` : 'none';
        el.innerHTML = invN2[i] > 1 ? `<span class="n">${invN2[i]}</span>` : '';
      }
      document.getElementById('b2Atk').style.backgroundImage = `url(${ICON[arma2]})`;
      const b2S = document.getElementById('b2Spc');
      b2S.style.backgroundImage = `url(${poder2 ? ICON[poder2] : ICON.nopower})`;
      b2S.classList.toggle('off', !poder2);
    }
  }
  refreshUpReady();                                           // o aviso da ratinha acompanha o queijo
  if (chestOpen) renderChest();
}
function onInvClick(i, quem){
  const eu = quem || player;                                  // a mesma tela serve às DUAS mochilas
  const bag = invDe(eu), bagN = invNDe(eu);
  const it = bag[i];
  if (!it) return;
  const useOne = () => { if (--bagN[i] <= 0){ bag[i] = null; bagN[i] = 0; } };  // gasta 1 da pilha
  if (chestOpen && chestDono === eu){ invToChest(i); return; }
  if (cliente() && eu === player2){                           // juntos: a mochila do sapo mora no dono
    mandaCmd('inv', i);
    if (it === 'arcoiris') return;                            // a pedra é decisão do mundo de lá
  }
  if (CARDS[it]){                                             // encaixa no slot único da arma equipada
    const slot = slotDe(eu), agora = armaDe(eu);
    const old = slot[agora] || null;
    slot[agora] = it;
    bag[i] = old; bagN[i] = old ? 1 : 0;                       // a carta que estava lá volta pra mochila
    SFX.fanfare();
    toast(`${eu === player2 ? '🐸 ' : ''}🎁 ${WEAPONS[agora].name}`);
    cardFx(eu);
    updateHUD();
    return;
  }
  if (WEAPONS[it]){
    const old = armaDe(eu);
    if (eu === player2) arma2 = it; else { weapon = it; player.dmg = WEAPONS[weapon].dmg; }
    carryCard(old, eu);                                       // a carta acompanha a lâmina nova
    bag[i] = old; bagN[i] = 1;
    SFX.ui();
    toast(`${eu === player2 ? '🐸 ' : ''}⚔️ dano ${WEAPONS[armaDe(eu)].dmg}`);
  } else if (it === 'potion'){
    if (eu.hp >= eu.maxHp){ toast('❤️ cheia'); return; }
    eu.hp = Math.min(eu.maxHp, eu.hp + (cartaDe(eu, 'ccauld') ? 6 : 3)); useOne();   // Carta do Caldeirão: dobra a poção
    SFX.potion();
    toast('❤️ +3');
  } else if (POWERS[it]){
    const old = poderDe(eu);
    if (eu === player2) poder2 = it; else power = it;
    bag[i] = old; bagN[i] = 1;
    SFX.ui();
    toast(`${eu === player2 ? '🐸 ' : ''}✨ ${POWERS[poderDe(eu)].name}`);
  } else if (it === 'arcoiris'){
    if (usaPedra(eu)) useOne();
  } else if (it === 'cheese'){
    toast('🧀 ➡️ ♥️');
  }
  updateHUD();
}
function addItem(kind){
  if (kind === 'cheese'){                                    // slot dedicado: queijo SEMPRE coleta
    cheeseN++; updateHUD(); return true;
  }
  if (STACKS[kind]){                                         // consumível empilha no slot já ocupado
    const s = inv.indexOf(kind);
    if (s >= 0){ invN[s]++; updateHUD(); return true; }
  }
  const i = inv.indexOf(null);
  if (i < 0 || i >= invMax()){ toast('🎒 cheia'); return false; }
  inv[i] = kind; invN[i] = 1; updateHUD(); return true;
}

/* ---- baú do covil (30 espaços) ----
   O baú é do CASAL: o conteúdo é um só, mas a fileira de baixo mostra a mochila de quem
   está encostado nele. `chestDono` é quem abriu — o sapo mexe no baú com a bolsa dele. */
let chestDono = null;
const chestEl = document.getElementById('chestPanel');
const chestSlots = [], chestInvSlots = [];
{
  const grid = document.getElementById('chestGrid');
  for (let i = 0; i < 30; i++){
    const s = document.createElement('div'); s.className = 'cslot';
    s.onclick = () => {
      const it = chestItems[i]; if (!it) return;
      const dono = chestDono || player;
      if (onlineConvidado() && dono === player2){             // o baú do casal mora no dono
        if (!separados){ mandaCmd('bauTiraJ', i); return; }
        if (!cabe2(it)){ toast('🐸 🎒 cheia'); return; }
        mandaCmd('bauTira', i);
        return;
      }
      tiraDoBau(i, dono);
    };
    grid.appendChild(s); chestSlots.push(s);
  }
  const row = document.getElementById('chestInv');
  for (let i = 0; i < 5; i++){
    const s = document.createElement('div'); s.className = 'cslot';
    s.onclick = () => invToChest(i);
    row.appendChild(s); chestInvSlots.push(s);
  }
  document.getElementById('chestClose').onclick = () => closeChest();
}
function tiraDoBau(i, dono){
  const it = chestItems[i]; if (!it) return false;
  if (!(dono === player2 ? addItem2(it) : addItem(it))) return false;   // tira 1 unidade da pilha do baú
  if (chestN[i] > 1) chestN[i]--;
  else { chestItems[i] = null; chestN[i] = 0; }
  renderChest();
  return true;
}
function poeNoBau(it){                                        // devolve false se o baú estiver cheio
  let j = STACKS[it] ? chestItems.indexOf(it) : -1;          // consumível empilha no espaço já ocupado
  if (j < 0){
    j = chestItems.indexOf(null);
    if (j < 0){ toast('📦 cheio'); return false; }
    chestItems[j] = it; chestN[j] = 0;
  }
  chestN[j]++;
  return true;
}
const cabe2 = it => (STACKS[it] && inv2.indexOf(it) >= 0) || (inv2.indexOf(null) >= 0 && inv2.indexOf(null) < invMax2());
function invToChest(i){
  const eu = chestDono || player;
  const bag = invDe(eu), bagN = invNDe(eu);
  const it = bag[i]; if (!it) return;
  if (it === 'cheese'){ toast('🧀 ➡️ ♥️'); return; }
  if (onlineConvidado() && eu === player2){                   // o baú mora no dono
    if (!separados){ mandaCmd('bauPoeJ', i); return; }
    if (bagN[i] > 1) bagN[i]--; else { bag[i] = null; bagN[i] = 0; }   // separados: a mochila é minha
    mandaCmd('bauPoe', it);
    updateHUD(); renderChest();
    return;
  }
  if (!poeNoBau(it)) return;
  if (bagN[i] > 1) bagN[i]--;                                // move 1 da pilha por vez
  else { bag[i] = null; bagN[i] = 0; }
  updateHUD();
}
function renderChest(){
  const eu = chestDono || player;
  const bag = invDe(eu), bagN = invNDe(eu);
  for (let i = 0; i < 30; i++){
    chestSlots[i].style.backgroundImage = chestItems[i] ? `url(${ICON[chestItems[i]]})` : 'none';
    chestSlots[i].innerHTML = chestN[i] > 1 ? `<span class="n">${chestN[i]}</span>` : '';
  }
  for (let i = 0; i < 5; i++){
    chestInvSlots[i].style.backgroundImage = bag[i] ? `url(${ICON[bag[i]]})` : 'none';
    chestInvSlots[i].innerHTML = bagN[i] > 1 ? `<span class="n">${bagN[i]}</span>` : '';
  }
  const tit = document.getElementById('chestTit'), bg2 = document.getElementById('chestBag');
  if (tit) tit.innerHTML = emojify(eu === player2 ? '🐸 Baú do Covil' : 'Baú do Covil');
  if (bg2) bg2.innerHTML = emojify(eu === player2 ? 'Mochila do sapo' : 'Sua mochila');
  chestEl.classList.toggle('sapo', eu === player2);
}
function openChest(quem){
  const eu = quem || player;
  if (chestOpen && chestDono === eu) return;
  SFX.ui(); chestOpen = true; chestDono = eu;
  chestEl.classList.add('open'); renderChest();
}
function closeChest(){ chestOpen = false; chestDono = null; chestEl.classList.remove('open'); }

/* ---- LAN house: quem está logado no servidor de Marcos ---- */
let lanOpen = false;
/* A LAN é a máquina do Marcos: cada estação é um usuário DE VERDADE do WSL dele. O status vem
   de uma porta que aquele usuário costuma servir — quem está com algo no ar aparece online. */
const LAN_STATIONS = LAN_USERS.map((u, i) => ({
  name: u.nome, bio: u.bio, self: u.id === 'marcos',
  port: [null, 3000, 5173, 8123, 8080, 4200, 8000][i],
}));
const lanStatus = LAN_STATIONS.map((h, i) => i === 0);
let lanScanT = 0;
function probe(port){                                        // ping simples: servidor de pé responde
  return new Promise(res => {
    const ctl = new AbortController();
    const tm = setTimeout(() => { ctl.abort(); res(false); }, 1200);
    fetch('http://localhost:' + port + '/', { mode: 'no-cors', signal: ctl.signal })
      .then(() => { clearTimeout(tm); res(true); })
      .catch(() => { clearTimeout(tm); res(false); });
  });
}
function lanScan(){
  LAN_STATIONS.forEach((h, i) => {
    if (h.self){ lanStatus[i] = true; return; }
    probe(h.port).then(on => { lanStatus[i] = on; if (lanOpen) renderLan(); });
  });
}
function renderLan(){
  document.getElementById('lanList').innerHTML = LAN_STATIONS.map((h, i) => {
    const on = !!lanStatus[i];
    const st = on ? (h.self ? 'online — sou eu, oi!' : 'online') : 'offline';
    return `<div class="lrow ${on ? 'on' : ''}"><span class="dot"></span>${h.name}` +
      `<small>${h.bio} · ${st}${h.port ? ' · porta ' + h.port : ''}</small></div>`;
  }).join('');
}
function openLan(){
  if (lanOpen) return;
  SFX.ui();
  lanOpen = true;
  document.getElementById('lanPanel').classList.add('open');
  renderLan();
}
function closeLan(){ lanOpen = false; document.getElementById('lanPanel').classList.remove('open'); }
/* ---- painel do ONLINE ---- */
function renderOnline(){
  hudOnline();                                                // sala aberta: a tela vira de um jogador só
  const el = id => document.getElementById(id);
  const cx = el('onCaixa'), cod = el('onCod'), inp = el('onInput'), info = el('onInfo');
  const quem = el('onQuem'), dica = el('onDica');
  if (!cx) return;
  const mostra = (id, v) => { const e2 = el(id); if (e2) e2.style.display = v ? '' : 'none'; };
  if (!temServidor() || relayOk === false){                   // sem relay atrás deste endereço
    info.innerHTML = emojify(temServidor()
      ? 'Esta cópia do jogo <b>não tem sala</b>: ela roda em <b>' + location.host + '</b>, que só '
        + 'serve a página. A sala mora no <b>link da porta</b> que o Marcos abre na máquina dele — '
        + 'abra o jogo por lá e o 🎮 acende pros dois.'
      : 'Este modo precisa do jogo <b>servido por um endereço</b> — o link da porta. '
        + 'Aberto como arquivo solto não há sala. Abra pelo link e o 🎮 acende.');
    ['onCriar', 'onAbrir', 'onEntrar', 'onSair', 'onInput'].forEach(k => mostra(k, false));
    mostra('onCaixa', false); mostra('onQuem', false);
    dica.textContent = '';
    return;
  }
  if (sala){                                                  // JÁ NUMA SALA
    cod.textContent = sala.codigo;
    mostra('onCaixa', true); mostra('onQuem', true);
    mostra('onCriar', false); mostra('onAbrir', false); mostra('onEntrar', false); mostra('onInput', false);
    mostra('onSair', true);
    quem.innerHTML = emojify(sala.dono
      ? 'você é o <span class="eu">🐭 rato</span> · seu amigo é o 🐸 sapo'
      : 'você é o <span class="eu">🐸 sapo</span> · seu amigo é o 🐭 rato');
    if (parceiro){
      info.innerHTML = emojify('✔️ <b>parceiro conectado!</b> Pode fechar e jogar.')
        + '<div class="onSinc">' + emojify(remHz > 0 || rxB > 0
          ? '🎮 sincronizado · <b>' + remHz + '</b> pacotes/s · <b>' + rxB + '</b> B/s recebidos · <b>' + txB + '</b> B/s enviados' +
            (relRtt ? ' · ping <b>' + Math.round(relRtt * 1000) + '</b> ms' : '') + (onlineConvidado() && relAmostras.length ? ' · folga <b>' + Math.round(relFolga * 1000) + '</b> ms' : '')
          : '⏳ sem pacote do parceiro ainda…') + '</div>';
      dica.innerHTML = emojify('Os dois jogam no mesmo andar. Quem criou a sala manda no mapa. '
        + 'No computador o convidado joga de <b>teclado</b> ou de <b>controle</b> — o controle dele vira o do sapo.');
    } else if (sala.dono){
      info.innerHTML = emojify('<b>Pra ele entrar, faça assim:</b>')
        + '<div class="onEnd"><small>O AMIGO ABRE ESTE ENDEREÇO</small><b class="onLink">'
        + location.origin + location.pathname.replace(/index\.html$/, '') + '</b>'
        + '<button class="onCopia" id="onCopia">copiar o link</button></div>'
        + '<ol class="onPassos"><li>Ele abre no navegador — celular ou computador, tanto faz. '
        + '<b>Não precisa de conta nem de instalar nada.</b></li>'
        + emojify('<li>Toca no 🎮, escolhe 🐸 <b>entrar numa sala</b> e digita <b>' + sala.codigo + '</b>.</li></ol>');
      const bc = el('onCopia');
      if (bc) bc.onclick = () => {
        const alvo = location.origin + location.pathname.replace(/index\.html$/, '');
        try { navigator.clipboard.writeText(alvo); toast('🎮 link copiado'); }
        catch (e){ toast('🎮 ' + alvo); }
      };
      dica.innerHTML = emojify('Deixe esta tela aberta enquanto espera. O 🎮 fica <b>verde</b> quando ele chega.');
    } else {
      info.innerHTML = emojify(wsEstado === 'religando' ? '🎮 a rede caiu — <b>voltando pra sala ' + sala.codigo + '</b>…'
        : wsEstado === 'ligando' ? 'Conectando…'
        : wsEstado === 'erro' ? '✖️ este endereço não tem sala. A sala mora no <b>link da porta</b> '
            + 'que o Marcos serve — abra o jogo por lá.'
        : wsEstado === 'caiu' ? '✖️ a conexão caiu — toque em sair e entre de novo'
        : 'Procurando a sala <b>' + sala.codigo + '</b>…');
      dica.innerHTML = emojify('Peça pro seu amigo criar ou abrir a sala <b>' + sala.codigo + '</b>.');
    }
  } else {                                                    // ESCOLHENDO
    mostra('onCaixa', false); mostra('onQuem', false); mostra('onSair', false);
    mostra('onCriar', true); mostra('onAbrir', true);
    const digitando = inp.style.display !== 'none';
    mostra('onInput', digitando); mostra('onEntrar', digitando);
    info.innerHTML = emojify('Dois aparelhos, uma aventura — celular, computador, tanto faz. '
      + 'Um <b>cria a sala</b> e recebe 4 letras; o outro abre <b>o mesmo endereço</b> e entra com o código. '
      + 'Sem conta, sem cadastro: basta o link.');
    dica.innerHTML = digitando ? emojify('Digite as 4 letras que seu amigo recebeu.') : '';
  }
  const bo = el('bOn');                                       // o botão do canto conta o estado sem abrir nada
  if (bo){
    bo.classList.toggle('esperando', !!sala && !parceiro);
    bo.classList.toggle('junto', !!sala && !!parceiro);
    bo.title = sala ? (parceiro ? 'em dupla na sala ' + sala.codigo : 'sala ' + sala.codigo + ' — esperando')
      : 'jogar com um amigo pelo celular (O)';
  }
  updateHUD();
}
function openOnline(){
  if (onOpen) return;
  SFX.ui(); onOpen = true;
  sondaRelay();                                               // bate na porta antes de prometer sala
  document.getElementById('onPanel').classList.add('open');
  renderOnline();                                             // desenha JÁ: nada de painel vazio esperando rede

}
function closeOnline(){ onOpen = false; document.getElementById('onPanel').classList.remove('open'); }
document.getElementById('onClose').onclick = () => closeOnline();
document.getElementById('bOn').onclick = () => (onOpen ? closeOnline() : openOnline());
document.getElementById('onCriar').onclick = () => criarSala();
document.getElementById('onSair').onclick = () => sairSala();
document.getElementById('onAbrir').onclick = () => {          // revela o campo do código
  const inp = document.getElementById('onInput');
  inp.style.display = '';
  renderOnline();
  inp.focus();
};
document.getElementById('onEntrar').onclick = () => entrarSala(document.getElementById('onInput').value);
document.getElementById('onInput').addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.key === 'Enter') entrarSala(e.target.value);
});
document.getElementById('lanClose').onclick = () => closeLan();
lanScan();

/* ---- confirmação para sair da dungeon ---- */
let askOpen = false, askDoor = null;
function openAsk(door){ SFX.ui(); askOpen = true; askDoor = door; document.getElementById('askPanel').classList.add('open'); }
function closeAsk(){
  askOpen = false; askDoor = null; document.getElementById('askPanel').classList.remove('open');
  askDis = player.tx + ',' + player.ty + ',' + player.dir;    // não reabrir sem re-mirar a porta
}
let askDis = '', hellDis = '';
let hellOpen = false;
function openHell(){
  SFX.ui(); SFX.quake();
  hellOpen = true;
  const hrow = (e, txt) => `<div class="hrow">${emojify(e)}<span>${txt}</span></div>`;
  document.getElementById('hellRows').innerHTML =
    hrow('💀', 'bichos com <b>+50% de vida</b>') +
    hrow('🎁', '<b>toda queda dobrada</b>') +
    hrow('🧀', 'queijo, poções e <b>cartas</b>') +
    '<div class="tip">a escada normal continua ali, sem risco.</div>';
  document.getElementById('hellPanel').classList.add('open');
}
function closeHell(){
  hellOpen = false;
  document.getElementById('hellPanel').classList.remove('open');
  const eu = onlineConvidado() ? player2 : player;
  hellDis = eu.tx + ',' + eu.ty;                              // recusou: não reabre até sair do tile
}
document.getElementById('hellYes').onclick = () => {
  closeHell(); hellDis = '';
  SFX.quake(); chromaT = Math.max(chromaT, .6); shake(6, .5);
  enterDungeon(current.level + 1, true);
};
document.getElementById('hellNo').onclick = () => { closeHell(); toast('🔥 fica pra próxima'); };
function facingDoorOut(){                                     // tile verde apontado pro vão da saída?
  const [dx, dy] = DIRV[player.dir];
  return !current.free(player.tx + dx, player.ty + dy);
}

/* --------- presente da waifu: escolha de melhoria a cada meta de queijos --------- */
let upOpen = false;
let upAlvo = 'rato';                                           // com dois em campo, o casal ESCOLHE quem recebe
function openUp(){
  SFX.ui();
  upOpen = true;
  if (!p2On) upAlvo = 'rato';
  document.getElementById('upPanel').classList.add('open');
  renderUp();
  refreshUpReady();                                           // com o painel aberto o emblema some
}
function renderUp(){
  const sapo = p2On && upAlvo === 'sapo';
  conta(sapo ? 'sapo' : 'rato');                               // cada amada com a sua conta
  const eu = sapo ? player2 : player;
  const who = document.getElementById('upWho');
  who.style.display = 'none';                                 // a ratinha presenteia o rato; a sapinha, o sapo
  const tit = document.getElementById('upTit');
  if (tit) tit.innerHTML = emojify(sapo ? '🐸 Presente da sapinha' : 'Presente da sua amada');
  document.getElementById('upWhoRat').classList.toggle('on', !sapo);
  document.getElementById('upWhoFrog').classList.toggle('on', sapo);
  const stamAt = sapo ? stamCdMax2() : stamCdMax();
  const critAt = sapo ? critBase2() : critBase();
  const bagAt = sapo ? invMax2() : invMax();
  const cost = 10 + 5 * upsDone;                              // queijos trocados por ESTE presente
  const nS = Math.max(10, stamAt - 4), nC = Math.min(70, critAt + 4);
  const falta = Math.max(0, upGoal - stash);
  document.getElementById('upDesc').innerHTML = emojify(
    `🧀 <b>${cost}</b> gastos · <b>${stash}</b> entregues${upPend > 1 ? ` · 🎁 <b>×${upPend}</b>` : ''}` +
    `<small style="display:block;color:var(--ink-dim);font-size:11px">próximo presente com ${upGoal} 🧀 — faltam ${falta}</small>`);
  // ícone grande + o essencial: os números saem das MESMAS funções que aplicam o efeito
  const btn = (ico, title, from, to) =>
    `<img src="${ico}" alt=""><span class="ub"><b>${title}</b>${emojify(`<small>${from} ➡️ ${to}</small>`)}</span>`;
  document.getElementById('upHp').innerHTML =
    btn(ICON.heart, `VIDA +${HP_UP}`, eu.maxHp, `${eu.maxHp + HP_UP}`);
  document.getElementById('upStam').innerHTML =
    btn(ICON.stam, 'RECARGA −4s', `${stamAt}s`, nS === stamAt ? 'no máximo' : `${nS}s`);
  document.getElementById('upCrit').innerHTML =
    btn(ICON.crit, 'CRÍTICO +4%', `${critAt}%`, nC === critAt ? 'no máximo' : `${nC}%`);
  const nB = Math.min(BAG_MAX, bagAt + 1);
  document.getElementById('upBag').innerHTML =
    btn(ICON.bag, 'MOCHILA +1', `${bagAt} espaços`, nB === bagAt ? 'no máximo' : `${nB} espaços`);
}

function closeUp(){
  if (onlineConvidado() && upRemoto){ upRemoto = false; mandaCmd('up', null); }   // fechou sem escolher: o dono guarda
  upOpen = false; upDismissed = true; upDismissed2 = true;
  document.getElementById('upPanel').classList.remove('open');
  refreshUpReady();
}
let giftSceneT = null;
function playGiftScene(kind, sapo){                           // tela do presente: também pela fila
  enfileira('g:' + kind + (sapo ? 's' : ''), 1700, () => cenaPresente(kind, sapo));
}
function cenaPresente(kind, sapo){
  const sc = document.getElementById('giftScene');
  const quem = sapo ? '🐸 ' : '';
  if (kind === 'bag'){
    document.getElementById('gres').innerHTML =
      `<img src="${ICON.bag}" style="width:34px;height:34px;image-rendering:pixelated;vertical-align:-6px">` +
      emojify(`<small>${quem}+1 ➡️ ${sapo ? invMax2() : invMax()} espaços</small>`);
  } else
  document.getElementById('gres').innerHTML = kind === 'crit'
    ? `<img src="${ICON.crit}" style="width:34px;height:34px;image-rendering:pixelated;vertical-align:-6px">${emojify(`<small>${quem}+4% ➡️ ${sapo ? critBase2() : critBase()}% de crítico</small>`)}`
    : emojify(kind === 'hp'
      ? `❤️<small>${quem}+${HP_UP} ➡️ ${(sapo ? player2 : player).maxHp} de vida</small>`
      : `⚡<small>${quem}−4s ➡️ ${sapo ? stamCdMax2() : stamCdMax()}s</small>`);
  sc.classList.remove('open'); void sc.offsetWidth; sc.classList.add('open');
  clearTimeout(giftSceneT);
  // curto de propósito: assim que a caixa some o jogador VÊ a aura nova no ratinho
  giftSceneT = setTimeout(() => { sc.classList.remove('open'); levelUpFx(); auraPulse(kind); }, 1500);
  SFX.ui();
  setTimeout(() => {                                          // a festa começa NO estouro da caixa
    SFX.fanfare();
    confettiBurst();
    shake(3, .5);
    hearts(gX(player.x, player.y), gY(player.x, player.y));
  }, 1080);
}
let cardShowT = null;
// A CARTA FICA NA MÃO: dá pra jogá-la pro lado feito TCG e voltar pro combate na hora.
// Os quatro princípios de animação que a coisa toda apoia: ANTECIPAÇÃO (ela levanta ao ser
// pega), ARCO (pivota num eixo lá embaixo em vez de escorregar reto), CONTINUIDADE (sai
// girando e subindo, não some no lugar) e ELÁSTICO (arremesso fraco volta passando do ponto).
const cartaZera = (function cartaNaMao(){
  const el = document.getElementById('cardShow'), img = document.getElementById('cardShowImg');
  let id = null, x0 = 0, y0 = 0, dx = 0, dy = 0, vx = 0, lx = 0, lt = 0;
  const põe = (a, b, r, s) => {
    el.style.setProperty('--dx', a.toFixed(1) + 'px');
    el.style.setProperty('--dy', b.toFixed(1) + 'px');
    el.style.setProperty('--rot', r.toFixed(2) + 'deg');
    el.style.setProperty('--ry', Math.max(-24, Math.min(24, a * .11)).toFixed(2) + 'deg');
    el.style.setProperty('--sc', s.toFixed(3));
    el.style.setProperty('--txt', Math.max(0, 1 - Math.abs(a) / 240).toFixed(3));
  };
  const zera = () => { el.className = ''; el.style.display = ''; põe(0, 0, 0, 1); };
  img.addEventListener('pointerdown', e => {
    if (!el.classList.contains('play') && !el.classList.contains('arrasta')) return;
    id = e.pointerId; x0 = lx = e.clientX; y0 = e.clientY; lt = performance.now();
    dx = dy = vx = 0;
    try { img.setPointerCapture(id); } catch (err) { /* mouse sem captura: segue no mesmo alvo */ }
    clearTimeout(cardShowT);                                  // na mão do jogador, ninguém tira ela sozinho
    el.classList.remove('volta', 'voa', 'some');
    el.classList.add('arrasta');
    põe(0, 0, 0, 1.06);
    e.preventDefault(); e.stopPropagation();
  });
  img.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    dx = e.clientX - x0; dy = e.clientY - y0;
    const ag = performance.now();
    if (ag - lt > 10){ vx = (e.clientX - lx) / (ag - lt); lx = e.clientX; lt = ag; }
    põe(dx, dy * .38 + Math.abs(dx) * .05, dx * .085, 1.06);
    e.preventDefault(); e.stopPropagation();
  });
  const larga = e => {
    if (e.pointerId !== id) return;
    id = null;
    const rapido = Math.abs(vx) > .5;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6){                // toque seco: estoura pra frente e some
      el.classList.add('voa'); põe(0, -34, 0, 1.3);
      SFX.ui(); cardShowT = setTimeout(zera, 340);
    } else if (Math.abs(dx) > 64 || rapido){                  // arremesso: sai girando pela lateral
      const s2 = (rapido ? vx : dx) < 0 ? -1 : 1;
      el.classList.add('voa');
      põe(s2 * (innerWidth * .8 + 220), dy * .38 - 110, s2 * 38, .78);
      SFX.whiff(); cardShowT = setTimeout(zera, 430);
    } else {                                                  // não passou do ponto: volta batendo no lugar
      el.classList.add('volta'); põe(0, 0, 0, 1);
      cardShowT = setTimeout(() => {
        el.classList.remove('volta'); el.classList.add('some');
        cardShowT = setTimeout(zera, 300);
      }, 850);
    }
    e.preventDefault(); e.stopPropagation();
  };
  img.addEventListener('pointerup', larga);
  img.addEventListener('pointercancel', larga);
  return zera;
})();
function showCard(k){                                         // a carta grande: também pela fila
  if (!CARDS[k]) return;
  enfileira('c:' + k, 2750, () => mostraCarta(k));
}
function mostraCarta(k){
  document.getElementById('cardShowImg').src = CARD_ART[k];
  document.getElementById('cardShowName').textContent = CARDS[k].name;
  document.getElementById('cardShowDesc').textContent = CARDS[k].desc;
  const el = document.getElementById('cardShow');
  cartaZera(); void el.offsetWidth; el.classList.add('play');
  clearTimeout(cardShowT);
  cardShowT = setTimeout(cartaZera, 2600);
}
function carryCard(prev, quem){                               // trocar de arma NÃO perde a carta: ela vem junto
  const eu = quem || player, slot = slotDe(eu), agora = armaDe(eu);
  if (!prev || prev === agora || !slot[prev] || slot[agora]) return;
  slot[agora] = slot[prev];
  slot[prev] = null;
  toast(`${eu === player2 ? '🐸 ' : ''}🎁 ${CARDS[slot[agora]].name.replace('Carta d', 'd')}`);
}
function largaCartaChefe(kind, x, y){                         // a carta do CHEFE não entra sozinha: fica no chão
  // Era encaixada na hora, e com a mochila cheia sumia num toast. Sendo a recompensa do andar,
  // ela agora aparece no chão, se anuncia, e espera o jogador arrumar espaço pra buscar.
  showCard(kind);
  rings.push({ x: gX(x, y), y: gY(x, y), t: 0, gold: true, wide: true });
  rings.push({ x: gX(x, y), y: gY(x, y), t: -.08, gold: true });
  chromaT = Math.max(chromaT, .45);
  SFX.fanfare();
  toast('🎁 a carta do chefe caiu!');
}
// a carta cai na mão de QUEM DERRUBOU o bicho na hora da morte; o chão é o último caso
function grantCard(kind, x, y, quem){
  let eu = quem || player;
  if (eu === player2 && (!p2On || p2KO())) eu = player;       // sapo fora de campo: a lâmina do rato herda
  const slot = slotDe(eu), agora = armaDe(eu), sapo = eu === player2;
  const livre = !slot[agora];
  if (livre) slot[agora] = kind;
  else if (!(sapo ? addItem2(kind) : addItem(kind))){          // mochila cheia: aí sim fica esperando no chão
    current.pickups.push({ x, y, kind });
    toast(`${sapo ? '🐸 ' : ''}🎒 cheia — a carta ESPERA no chão`);
    return;
  }
  cardGetFx(kind, eu);
  showCard(kind);
  toast(`${sapo ? '🐸 ' : ''}${livre ? '🎁 carta encaixada!' : '🎁 carta na mochila'}`);
  updateHUD();
}
function cardGetFx(k, quem){                                  // achou uma carta: momento próprio, mas leve
  const eu = quem || player;
  const px = gX(eu.x, eu.y), py = gY(eu.x, eu.y);
  rings.push({ x: px, y: py, t: 0, gold: true, wide: true });
  rings.push({ x: px, y: py, t: -.08, gold: true });
  chromaT = Math.max(chromaT, .4);
  shake(3, .35);
  hitStop = Math.max(hitStop, .07);
  SFX.fanfare();
  const rgb = hexRgb(CARDS[k].col);
  for (let i = 0; i < 12; i++){                               // 12 fagulhas simples: nada de brilho por partícula
    const an = i / 12 * 6.2832;
    dust.push({ x: px, y: py - 20, vx: Math.cos(an) * 80, vy: Math.sin(an) * 42 - 34,
      gv: 150, life: .5, kind: 'auraP', ci: rgb, sz: 2 });
  }
}
function cardFx(quem){                                        // carta encaixada: a lâmina aceita o brasão
  const eu = quem || player;
  const k = cardOnDe(eu); if (!k) return;
  showCard(k);
  const px = gX(eu.x, eu.y), py = gY(eu.x, eu.y);
  rings.push({ x: px, y: py, t: 0, gold: true });
  chromaT = Math.max(chromaT, .3);
  for (let i = 0; i < 16; i++){
    const an = i / 16 * 6.2832;
    dust.push({ x: px, y: py - 20, vx: Math.cos(an) * 70, vy: Math.sin(an) * 40 - 26,
      life: .5, kind: 'auraP', ci: hexRgb(CARDS[k].col), sz: 2 });   // hexRgb já existe lá em cima
  }
}
function auraPulse(kind){                                     // a cor do presente estoura no ratinho: liga escolha e aura
  const rgb = kind === 'hp' ? '224,56,68' : kind === 'crit' ? '242,204,96' : kind === 'bag' ? '200,180,140' : '90,224,120';
  const px = gX(player.x, player.y), py = gY(player.x, player.y);
  rings.push({ x: px, y: py, t: 0, gold: kind === 'crit', ice: kind === 'stam' });
  shake(2, .3);
  for (let i = 0; i < 22; i++){
    const an = i / 22 * 6.2832 + hash(i, 64) * .4;
    dust.push({
      x: px + Math.cos(an) * 5, y: py - 18 + Math.sin(an) * 3,
      vx: Math.cos(an) * (55 + hash(i, 61) * 75), vy: Math.sin(an) * 34 - 22 - hash(i, 62) * 34,
      life: .5 + hash(i, 63) * .3, kind: 'auraP', ci: rgb, sz: hash(i, 65) > .6 ? 3 : 2,
    });
  }
}
const HP_UP = 5;                                              // presente da waifu: +5 de vida máxima
function grantUp(kind){
  if (onlineConvidado()){                                     // quem aplica é o dono; aqui é a festa
    mandaCmd('up', { k: kind, a: upAlvo });
    upRemoto = false;
    playGiftScene(kind, upAlvo === 'sapo');
    upOpen = false; upDismissed = true; upDismissed2 = true;
    document.getElementById('upPanel').classList.remove('open');
    refreshUpReady();
    return;
  }
  const sapo = p2On && upAlvo === 'sapo';
  conta(sapo ? 'sapo' : 'rato');
  const eu = sapo ? player2 : player;
  upsDone++; upPend--;
  if (kind === 'hp'){ eu.maxHp += HP_UP; eu.hp = eu.maxHp; if (sapo) hpUps2++; else hpUps++; }   // farmar coração dá +1
  else if (kind === 'crit'){ if (sapo) critUps2++; else critUps++; }        // sorte de crítico sobe 4 pontos
  else if (kind === 'bag'){                                                // um espaço a mais na mochila
    if (sapo) bagUps2 = Math.min(BAG_MAX - 5, bagUps2 + 1);
    else bagUps = Math.min(BAG_MAX - 5, bagUps + 1);
  } else { if (sapo) stamUps2++; else stamUps++; }
  if (kind === 'hp'){                                          // cada presente tem o seu estouro
    bigHearts.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 54, t: 0 });
    hearts(gX(eu.x, eu.y), gY(eu.x, eu.y));
  }
  { const waifu = amadaDe(sapo);                               // e ela SEMPRE manda um beijinho junto
    bigHearts.push({ x: gX(waifu.x, waifu.y), y: gY(waifu.x, waifu.y) - 44, t: 0,
      kiss: true, tx: gX(eu.x, eu.y), ty: gY(eu.x, eu.y) - 38 });
    SFX.kiss();
  }
  playGiftScene(kind, sapo);
  updateHUD();
  // a caixa FECHA e some. O próximo presente não se abre sozinho por cima da comemoração:
  // o jogador vê o buff entrar no ratinho e volta a falar com ela quando quiser o seguinte.
  upOpen = false; upDismissed = true; upDismissed2 = true;
  document.getElementById('upPanel').classList.remove('open');
  refreshUpReady();
}
document.getElementById('upWhoRat').onclick = () => { upAlvo = 'rato'; SFX.ui(); renderUp(); };
document.getElementById('upWhoFrog').onclick = () => { upAlvo = 'sapo'; SFX.ui(); renderUp(); };
document.getElementById('upHp').onclick = () => grantUp('hp');
document.getElementById('upStam').onclick = () => grantUp('stam');
document.getElementById('upCrit').onclick = () => grantUp('crit');
document.getElementById('upBag').onclick = () => grantUp('bag');
document.getElementById('askYes').onclick = () => { const d = askDoor; closeAsk(); if (d) goTo(d.to, d.spawn); };
document.getElementById('askNo').onclick = () => closeAsk();

/* ---- tela de mochila (pausa o jogo) ---- */
let invOpen = false, invSel = null, invDono = null, trocaModo = false;
function itemInfo(kind){
  if (kind === 'cheese') return '<b>Queijo</b> — cura +1 ao coletar e soma no slot dedicado (sem limite, sempre coletável). Entregue à sua amada no covil: é com ele que ela prepara os presentes.';
  if (kind === 'potion') return '<b>Poção de Vida</b> — consumível: recupera 3 de vida. Empilha no mesmo slot da mochila. Toque de novo pra beber.';
  if (kind === 'arcoiris') return '<b>Pedra Arco-Íris</b> — só existe no jogo em dupla, e é rara. Use com o parceiro caído e ele volta à vida <b>do seu lado, no seu andar</b> — esteja onde estiver. Se você morrer com ela na mochila, ela vai sozinha pro parceiro.';
  if (kind === 'heartmax') return '<b>Coração Antigo</b> — relíquia consumida ao pegar: +1 de vida máxima permanente.';
  if (CARDS[kind]){                                           // clicou na carta: mostra a ARTE grande
    const dono = invDono || player, eq = cardOnDe(dono) === kind;
    return `<div style="display:flex;gap:12px;align-items:flex-start;text-align:left">` +
      `<img src="${CARD_ART[kind]}" alt="" style="width:84px;height:112px;image-rendering:pixelated;flex:none;` +
      `filter:drop-shadow(0 0 12px rgba(246,206,90,.35))">` +
      `<span><b>${CARDS[kind].name}</b><br>${CARDS[kind].desc}.<br><br>` +
      (eq ? '<b>Já está encaixada.</b> Ela acompanha você quando trocar de arma.'
          : `Toque de novo pra encaixar na <b>${WEAPONS[armaDe(dono)].name}</b> — 1 slot, e ela acompanha a próxima arma.`) +
      `</span></div>`;
  }
  if (WEAPONS[kind]){
    const cIn = slotDe(invDono || player)[kind];
    return `<b>${WEAPONS[kind].name}</b> — arma, dano ${WEAPONS[kind].dmg}${cIn ? ` · carta: ${CARDS[cIn].name}` : ''}. Toque de novo pra equipar.`;
  }
  if (POWERS[kind]) return `<b>${POWERS[kind].name}</b> — poder: ${POWERS[kind].desc}. Recarga de ${POWERS[kind].cd}s entre usos. Toque de novo pra equipar.`;
  return 'Espaço vazio.';
}
function renderInv(){
  const eu = invDono || player;
  const bag = invDe(eu), bagN = invNDe(eu);
  const big = document.getElementById('invBig');
  big.innerHTML = '';
  const cells = [
    { kind: armaDe(eu), tag: 'ARMA' },
    { kind: poderDe(eu), tag: 'PODER' },
    { kind: cheeseN > 0 ? 'cheese' : null, tag: 'QUEIJO' },
    ...bag.slice(0, maxInvDe(eu)).map((it, i) => ({ kind: it, tag: '' + (i + 1), idx: i })),
  ];
  const act = document.getElementById('invAct');
  if (invSel == null) act.classList.remove('on');
  /* TROCA ENTRE JOGADORES: com o modo ligado, um toque num item já manda ele pro parceiro. */
  const tb = document.getElementById('invTroca'), temPar = p2On && (!onlineOn() || parceiro);
  if (!temPar) trocaModo = false;
  tb.disabled = !temPar;
  tb.classList.toggle('on', trocaModo);
  tb.innerHTML = emojify(!temPar ? '🎁 troca: sem parceiro em jogo'
    : trocaModo ? '✔ pronto — sair da troca' : (eu === player2 ? '🎁 trocar com o 🐭' : '🎁 trocar com o 🐸'));
  tb.onclick = () => { if (!temPar) return; trocaModo = !trocaModo; invSel = null; SFX.ui();
    document.getElementById('invInfo').innerHTML = emojify(trocaModo
      ? `Toque nos itens que quer dar — cada toque manda UM pro ${eu === player2 ? '🐭' : '🐸'}.`
      : 'Toque num item pra ver o que ele faz. Toque de novo pra usar ou equipar.');
    renderInv(); };
  document.getElementById('invPanel').classList.toggle('troca', trocaModo);
  cells.forEach((cell, ci) => {
    const d = document.createElement('div');
    d.className = 'islot' + (invSel === ci ? ' sel' : '');
    const n = cell.kind === 'cheese' ? cheeseN : (cell.idx !== undefined ? bagN[cell.idx] : 0);
    d.innerHTML = `<span class="tag">${cell.tag}</span>` + (n > 1 ? `<span class="n">${n}</span>` : '');
    if (cell.kind) d.style.backgroundImage = `url(${ICON[cell.kind]})`;
    d.onclick = () => {
      if (trocaModo){                                         // modo troca: um toque = um item pro parceiro
        if (cell.idx !== undefined && cell.kind && cell.kind !== 'cheese') darItem(cell.idx, eu);
        else toast(cell.kind === 'cheese' ? '🧀 o queijo já é do casal' : '🎁 só itens da mochila');
        renderInv(); return;
      }
      if (!cell.kind){ invSel = null; document.getElementById('invInfo').innerHTML = 'Espaço vazio.'; renderInv(); return; }
      if (invSel === ci && cell.idx !== undefined){ onInvClick(cell.idx, eu); invSel = null; renderInv(); return; }
      invSel = ci;
      document.getElementById('invInfo').innerHTML = emojify(itemInfo(cell.kind));
      if (cell.idx !== undefined && cell.kind !== 'cheese'){  // barra de ação: usar/equipar + descartar
        act.classList.add('on');
        const ub = document.getElementById('invUseBtn');
        ub.innerHTML = emojify(CARDS[cell.kind] ? '🎁 Encaixar' : WEAPONS[cell.kind] ? '⚔️ Equipar' : POWERS[cell.kind] ? '✨ Equipar' : 'Usar');
        ub.onclick = () => { onInvClick(cell.idx, eu); invSel = null; renderInv(); };
        document.getElementById('invDropBtn').onclick = () => discardItem(cell.idx, eu);
        const gb = document.getElementById('invGiveBtn');          // TROCA: o item vai pra mochila do parceiro
        gb.style.display = p2On ? '' : 'none';
        gb.innerHTML = emojify(eu === player2 ? '🎁 ➡️ 🐭' : '🎁 ➡️ 🐸');
        gb.onclick = () => { darItem(cell.idx, eu); invSel = null; renderInv(); };
      } else act.classList.remove('on');
      renderInv();
    };
    big.appendChild(d);
  });
}
function openInv(quem){
  if (invOpen) return;
  invDono = quem || player;                                   // a MESMA tela abre a mochila do rato ou a do sapo
  SFX.ui(); invOpen = true; invSel = null; trocaModo = false;
  document.getElementById('invTit').innerHTML = emojify(invDono === player2 ? '🐸 Mochila do Sapo' : '🐭 Mochila do Ratinho');
  document.getElementById('invInfo').innerHTML = 'Toque num item pra ver o que ele faz. Toque de novo pra usar ou equipar.';
  document.getElementById('invPanel').classList.toggle('sapo', invDono === player2);
  document.getElementById('invPanel').classList.add('open');
  renderInv();
}
function discardItem(i, quem){
  const eu = quem || invDono || player;
  const bag = invDe(eu), bagN = invNDe(eu);
  if (bag[i] == null) return;
  if (cliente() && eu === player2) mandaCmd('drop', i);       // senão o dono devolvia o item no próximo retrato
  bag[i] = null; bagN[i] = 0; invSel = null;
  SFX.ui();
  toast('🗑️');
  updateHUD(); renderInv();
  document.getElementById('invInfo').innerHTML = 'Item descartado — espaço livre na mochila.';
}
/* ---- guarda-roupa: customização do ratinho ---- */
const CAPE_SETS = {
  green:  ['#3f6b3a', '#2c4f2b', '#1d3a1e'],
  red:    ['#8a3038', '#66242c', '#471a20'],
  blue:   ['#2f4f7a', '#243c60', '#182a46'],
  purple: ['#5d3a7a', '#472c60', '#301e44'],
  gold:   ['#c9a23c', '#977222', '#6b5636'],
  black:  ['#3a3d45', '#2a2d33', '#1a1c22'],
};
const outfit = {
  hat: 'none', cape: 'green', fant: 'none',                   // peruca virou CHAPÉU; fantasia é seção nova
  hatHue: null, capeHue: null, fantHue: null,                 // null = a cor original da peça
  chain: false, earring: false, choker: false,
  monocle: false, bowtie: false, tie: false, shades: false, makeup: false, mustache: false,
};
try { Object.assign(outfit, JSON.parse(localStorage.getItem('ratsOutfit') || '{}')); } catch (e){}
const PECA_VALIDA = { none: 1, dragao: 1, fada: 1 };          // vestindo peça que saiu de linha? volta pro none
if (outfit.wig){ outfit.hat = 'wig'; delete outfit.wig; }     // guarda-roupa antigo: a peruca era acessório
if (!PECA_VALIDA[outfit.fant]) outfit.fant = 'none';          // guarda-roupa antigo: peça que saiu de linha
/* O SAPO tem GUARDA-ROUPA PRÓPRIO. A cor dele usa o mesmo template de capa do rato, mas é uma
   escolha separada: mexer na capa do rato não mexe no sapo, e vice-versa. */
const outfit2 = { cor: 'green', corHue: null, hat: 'none', hatHue: null, fant: 'none', fantHue: null };
try { Object.assign(outfit2, JSON.parse(localStorage.getItem('ratsOutfit2') || '{}')); } catch (e){}
outfit2.fant = 'none';
const CAPA_VIVA = ['#4fbe68', '#3a8f4e', '#276437'];          // base clara e viva pra roda de cores morder
const corSapo = () => (outfit2.corHue == null ? CAPE_SETS.green : CAPA_VIVA).map(c => tinge(c, outfit2.corHue));

/* ---- CÍRCULO CROMÁTICO: troca o MATIZ da peça mantendo o brilho e a saturação dela,
   então o desenho continua com as mesmas sombras e luzes, só que em outra cor. ---- */
function hsl2hex(h, s2, l){
  const a = s2 * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * v).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}
const tingeCache = new Map();
function tinge(c, hue){
  if (hue == null || typeof c !== 'string' || c[0] !== '#' || c.length < 7) return c;
  if (hue === 'w'){                                           // BRANCO: tira a cor e clareia, guardando o contraste
    const n2 = parseInt(c.slice(1, 7), 16);
    const lz = ((n2 >> 16) * .299 + ((n2 >> 8) & 255) * .587 + (n2 & 255) * .114) / 255;
    return hsl2hex(0, 0, Math.min(1, lz * .48 + .5));
  }
  const ch = c + '|' + hue;
  const pronto = tingeCache.get(ch);
  if (pronto) return pronto;
  const n = parseInt(c.slice(1, 7), 16);
  const r = (n >> 16) / 255, vd = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, vd, b), mn = Math.min(r, vd, b), l = (mx + mn) / 2, d = mx - mn;
  // A cor escolhida tem que sair VIBRANTE. Mantendo a saturação/brilho da peça original, uma paleta
  // base escura e lavada (a capa verde é assim) devolvia sempre um tom terroso — agora a saturação
  // é empurrada pra cima e o que é escuro demais é clareado, mantendo o degradê da peça.
  const s2 = d === 0 ? .5 : d / (1 - Math.abs(2 * l - 1));
  const s3 = Math.max(.62, Math.min(1, s2 * 1.55));
  const l3 = s2 < .45 ? Math.min(.8, .16 + l * 1.2) : l;
  const out = hsl2hex(hue, s3, l3);
  if (tingeCache.size < 900) tingeCache.set(ch, out);
  return out;
}
const HUES = [0, 20, 40, 55, 75, 100, 140, 170, 195, 220, 255, 285, 310, 335, 'w'];   // a roda de cores ('w' = branco)
let wardOpen = false, wardDono = null;                        // de quem é o guarda-roupa aberto
function applyOutfit(){
  SKIN_HERO.acc = outfit;
  SKIN_HERO.cape = outfit.cape !== 'none';
  // uma paleta BASE só; quem escolhe a cor é a roda (os quadradinhos viraram redundância).
  // Com matiz escolhido a base é a VIVA — a verde original é escura demais pra virar outra cor.
  SKIN_HERO.capeCols = (outfit.capeHue == null ? CAPE_SETS.green : CAPA_VIVA).map(c => tinge(c, outfit.capeHue));
  /* Em sala o boneco do PARCEIRO veste o que vem do aparelho dele: esse não se grava aqui. A sala
     ainda não existe na primeira chamada (zona morta do `let`), daí o try. */
  let dono = false, conv = false;
  try { dono = onlineDono(); conv = onlineConvidado(); } catch (e){}
  if (!conv) try { localStorage.setItem('ratsOutfit', JSON.stringify(outfit)); } catch (e){}
  if (!dono) try { localStorage.setItem('ratsOutfit2', JSON.stringify(outfit2)); } catch (e){}
  if (wardOpen) renderWard();
  if (dono || conv) mandaRoupa();
}
/* ícones do guarda-roupa: cada peça desenhada em pixel art 16x16 */
function wardIcon(kind){
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const t = c.getContext('2d');
  const p2 = (x, y, w, h, col) => { t.fillStyle = col; t.fillRect(x, y, w, h); };
  if (kind === 'none'){ p2(4, 7, 8, 2, '#3a4356'); }
  else if (kind === 'straw'){ p2(2, 9, 12, 2, '#c9a668'); p2(2, 11, 12, 1, '#8a7442'); p2(5, 4, 6, 5, '#d9b878'); p2(5, 4, 6, 1, '#e8d098'); p2(5, 8, 6, 1, '#8a7442'); }
  else if (kind === 'tophat'){ p2(2, 11, 12, 2, '#14151a'); p2(4, 3, 8, 8, '#1f2126'); p2(4, 3, 2, 8, '#33363e'); p2(4, 9, 8, 2, '#8a3038'); }
  else if (kind === 'wizard'){ p2(2, 11, 12, 2, '#5d3a7a'); p2(5, 6, 6, 5, '#6b4a8a'); p2(6, 2, 4, 4, '#5d3a7a'); p2(7, 8, 2, 2, GOLD); }
  else if (kind === 'crown'){ p2(3, 8, 10, 4, GOLD); p2(3, 5, 2, 3, '#e0bc50'); p2(7, 4, 2, 4, '#e0bc50'); p2(11, 5, 2, 3, '#e0bc50'); p2(7, 9, 2, 2, '#b23a3a'); }
  else if (kind === 'paperboat'){ p2(2, 9, 12, 3, '#e8e4da'); p2(2, 9, 12, 1, '#f8f4ea'); p2(4, 6, 8, 3, '#f0ece2'); p2(6, 4, 4, 2, '#f8f4ea'); p2(7, 3, 2, 1, '#fff'); p2(3, 10, 3, 1, '#8a929b'); p2(9, 10, 3, 1, '#8a929b'); }
  else if (kind === 'nutshell'){ p2(2, 10, 12, 2, '#5c4230'); p2(3, 6, 10, 4, '#7a5a3c'); p2(4, 4, 8, 2, '#8a6844'); p2(6, 3, 4, 1, '#7a5a3c'); p2(5, 4, 1, 7, '#5c4230'); p2(8, 3, 1, 8, '#5c4230'); p2(11, 4, 1, 7, '#5c4230'); p2(9, 5, 2, 1, '#a8845c'); p2(2, 10, 2, 1, '#42301f'); p2(7, 11, 3, 1, '#42301f'); }
  else if (kind === 'chain'){ p2(3, 4, 10, 1, GOLD); p2(2, 5, 1, 2, GOLD); p2(13, 5, 1, 2, GOLD); p2(6, 7, 4, 4, GOLD); p2(7, 8, 2, 2, '#8a6c22'); }
  else if (kind === 'earring'){ p2(6, 4, 4, 1, GOLD); p2(5, 5, 1, 4, GOLD); p2(10, 5, 1, 4, GOLD); p2(6, 9, 4, 1, GOLD); p2(11, 3, 1, 1, '#fff'); }
  else if (kind === 'choker'){ p2(3, 7, 10, 2, '#1a1c22'); p2(7, 7, 2, 2, '#c94a5a'); }
  else if (kind === 'monocle'){ p2(4, 3, 6, 1, GOLD); p2(4, 9, 6, 1, GOLD); p2(3, 4, 1, 5, GOLD); p2(10, 4, 1, 5, GOLD); p2(4, 4, 6, 5, 'rgba(174,191,216,.4)'); p2(11, 9, 1, 2, '#e0bc50'); p2(12, 11, 1, 2, '#e0bc50'); }
  else if (kind === 'bowtie'){ p2(2, 5, 4, 6, '#c93a4a'); p2(10, 5, 4, 6, '#c93a4a'); p2(6, 6, 4, 4, '#8a2434'); p2(3, 6, 1, 2, '#e05a6a'); }
  else if (kind === 'tie'){ p2(6, 2, 4, 3, '#4a6ac0'); p2(6, 5, 4, 7, '#3a5aa8'); p2(7, 12, 2, 2, '#2c4680'); }
  else if (kind === 'shades'){ p2(1, 6, 14, 3, '#14151a'); p2(2, 7, 2, 1, '#4a5262'); p2(9, 7, 2, 1, '#4a5262'); }
  else if (kind === 'wig'){ p2(4, 1, 8, 3, '#f0d488'); p2(2, 3, 5, 11, '#e8c46a'); p2(9, 3, 5, 11, '#e8c46a'); p2(7, 1, 2, 6, '#c9a23c'); p2(3, 5, 1, 7, '#fff6d0'); p2(12, 5, 1, 7, '#fff6d0'); p2(1, 12, 3, 3, '#f0d488'); p2(12, 12, 3, 3, '#f0d488'); }
  else if (kind === 'shroom'){ p2(2, 5, 12, 5, '#c9342c'); p2(3, 3, 10, 2, '#e8564a'); p2(5, 2, 6, 1, '#e8564a'); p2(2, 9, 12, 2, '#8a1a18'); p2(4, 4, 3, 2, '#f6efe0'); p2(9, 6, 3, 2, '#f6efe0'); p2(7, 3, 2, 1, '#f6efe0'); p2(6, 11, 4, 4, '#efe2c8'); }
  else if (kind === 'bday'){ p2(2, 12, 12, 2, '#8a2434'); p2(6, 9, 5, 3, '#e0455e'); p2(6, 6, 4, 3, '#ffd34a'); p2(7, 3, 3, 3, '#e0455e'); p2(8, 1, 2, 2, '#ffd34a'); p2(7, 0, 3, 2, '#fff3c8'); p2(4, 10, 2, 3, '#fff3c8'); }
  else if (kind === 'fnone'){ p2(4, 7, 8, 2, '#3a4356'); }
  else if (kind === 'dragao'){ p2(2, 11, 5, 3, '#4f9440'); p2(6, 9, 5, 3, '#4f9440'); p2(9, 6, 4, 4, '#4f9440'); p2(2, 11, 5, 1, '#69b855'); p2(6, 9, 5, 1, '#69b855'); p2(10, 2, 4, 4, '#f2a03c'); p2(10, 2, 4, 1, '#ffd08a'); p2(4, 9, 1, 2, '#f2a03c'); p2(8, 7, 1, 2, '#f2a03c'); }
  else if (kind === 'porco'){ p2(3, 5, 10, 9, '#f0a0b0'); p2(5, 9, 6, 4, '#ffd0d8'); p2(2, 2, 4, 4, '#e88098'); p2(10, 2, 4, 4, '#e88098'); p2(6, 6, 4, 3, '#e88098'); p2(7, 7, 1, 1, '#a05068'); p2(9, 7, 1, 1, '#a05068'); p2(13, 9, 3, 2, '#f0a0b0'); }
  else if (kind === 'caranguejo'){ p2(7, 6, 2, 6, '#a02c20'); p2(1, 5, 6, 7, '#e0503a'); p2(9, 5, 6, 7, '#e0503a'); p2(1, 5, 6, 1, '#f2755c'); p2(9, 5, 6, 1, '#f2755c'); p2(3, 8, 4, 2, '#14151a'); p2(9, 8, 4, 2, '#14151a'); p2(2, 2, 3, 3, '#e0503a'); p2(11, 2, 3, 3, '#e0503a'); }
  else if (kind === 'peixe'){ p2(6, 1, 5, 6, '#7ac0e8'); p2(7, 0, 3, 2, '#7ac0e8'); p2(8, 2, 1, 5, '#2a5e94'); p2(2, 8, 12, 5, '#7ac0e8'); p2(2, 8, 12, 1, '#a8d8f0'); p2(0, 6, 3, 9, '#7ac0e8'); p2(1, 8, 1, 6, '#2a5e94'); p2(13, 9, 3, 4, '#4a9ad8'); }
  else if (kind === 'fada'){ p2(2, 3, 5, 7, 'rgba(232,222,255,.72)'); p2(9, 3, 5, 7, 'rgba(232,222,255,.72)'); p2(3, 10, 4, 4, 'rgba(206,230,255,.6)'); p2(9, 10, 4, 4, 'rgba(206,230,255,.6)'); p2(2, 3, 5, 1, '#ffffff'); p2(9, 3, 5, 1, '#ffffff'); p2(2, 3, 1, 7, '#ffffff'); p2(13, 3, 1, 7, '#ffffff'); p2(4, 6, 2, 1, 'rgba(176,150,232,.85)'); p2(10, 6, 2, 1, 'rgba(176,150,232,.85)'); p2(7, 2, 2, 12, '#8a7ab8'); p2(0, 12, 1, 1, '#ffffff'); p2(15, 2, 1, 1, '#ffffff'); }
  else if (kind === 'ciborgue'){ p2(2, 2, 12, 6, '#8a929b'); p2(2, 2, 12, 2, '#c8d4e4'); p2(1, 8, 14, 5, '#20262e'); p2(1, 8, 14, 1, '#4a5262'); p2(2, 9, 5, 1, '#7a8ca0'); p2(0, 5, 2, 6, '#4a5262'); p2(14, 5, 2, 6, '#4a5262'); p2(6, 0, 4, 2, '#4a5262'); p2(13, 6, 2, 2, '#e03830'); }
  else if (kind === 'aranha'){ p2(3, 1, 10, 7, '#c9302c'); p2(3, 1, 10, 1, '#e8564a'); p2(3, 8, 10, 7, '#2a4a9c'); p2(3, 8, 10, 1, '#3a5ec0'); p2(1, 3, 3, 1, '#c9302c'); p2(12, 3, 3, 1, '#c9302c'); p2(4, 3, 4, 3, '#ffffff'); p2(8, 3, 4, 3, '#ffffff'); p2(7, 2, 1, 6, 'rgba(18,20,26,.8)'); p2(4, 7, 8, 1, 'rgba(18,20,26,.8)'); p2(7, 9, 2, 3, '#14151a'); p2(5, 10, 2, 1, '#14151a'); p2(9, 10, 2, 1, '#14151a'); }
  else if (kind === 'bob'){ p2(3, 4, 10, 9, '#f2d33c'); p2(3, 4, 10, 1, '#ffe98a'); p2(11, 5, 2, 8, '#c9a41e'); p2(3, 2, 10, 2, '#f4f2ea'); p2(3, 2, 10, 1, '#ffffff'); p2(7, 4, 2, 2, '#c9302c'); p2(6, 6, 4, 6, '#c9302c'); p2(6, 6, 4, 1, '#e8564a'); p2(4, 7, 2, 1, '#d9b62a'); p2(10, 10, 2, 1, '#d9b62a'); p2(3, 13, 10, 2, '#8a6a3c'); p2(3, 13, 10, 1, '#a8834a'); }
  else if (kind === 'axolote'){ p2(6, 4, 4, 8, '#f8b8c8'); [1, 6, 11].forEach(yy => { p2(4, yy, 3, 2, '#f06a90'); p2(9, yy, 3, 2, '#f06a90'); p2(1, yy - 1, 4, 4, '#ff9ab4'); p2(11, yy - 1, 4, 4, '#ff9ab4'); p2(1, yy - 1, 4, 1, '#f8d0da'); p2(11, yy - 1, 4, 1, '#f8d0da'); }); }
  else if (kind === 'makeup'){ p2(6, 2, 3, 4, '#e0455e'); p2(6, 2, 1, 4, '#ff7a92'); p2(5, 6, 5, 7, '#232833'); p2(5, 6, 5, 1, '#8a929b'); p2(12, 3, 2, 2, '#f08a9a'); }
  else if (kind === 'mustache'){ p2(2, 7, 5, 3, '#3a2c1e'); p2(9, 7, 5, 3, '#3a2c1e'); p2(1, 6, 2, 2, '#3a2c1e'); p2(13, 6, 2, 2, '#3a2c1e'); p2(7, 8, 2, 2, '#3a2c1e'); }
  return c.toDataURL();
}
const WICON = {};
const ACC_DEFS = [
  ['chain', 'Corrente'], ['earring', 'Brinco'], ['choker', 'Choker'],
  ['monocle', 'Monóculo'], ['bowtie', 'Gravata Borboleta'], ['tie', 'Gravatinha'],
  ['shades', 'Óculos Escuros'], ['makeup', 'Maquiagem de Drag'], ['mustache', 'Bigode'],
];
/* PEÇAS GRANDES — moram na mesma seção dos acessórios, mas só UMA por vez: são coisas
   que ocupam o corpo inteiro e uma por cima da outra viraria sopa. Clicar na que já está
   vestida tira ela. Os brinquinhos de rosto continuam podendo empilhar à vontade.        */
// Só o que é ACESSÓRIO de verdade fica: um pedaço pendurado no ratinho. As fantasias de
// personagem (caranguejo, homem-aranha, bob esponja) saíram do armário a pedido — o desenho
// delas continua no `drawFantasia`, pronto pra voltar, só não há mais como escolher.
const PECA_DEFS = [
  ['fnone', 'Sem peça', 'none'], ['dragao', 'Rabo de Dragão', 'dragao'],
  ['fada', 'Asas de Fada', 'fada'],
];
const HAT_DEFS = [                                            // a peruca virou CHAPÉU, junto das outras peças
  ['none', 'Sem chapéu'], ['wig', 'Peruca Longa'], ['straw', 'Chapéu de Palha'], ['tophat', 'Cartola'],
  ['wizard', 'Chapéu de Mago'], ['crown', 'Coroa'], ['shroom', 'Chapéu de Cogumelo'],
  ['bday', 'Chapéu de Aniversário'], ['paperboat', 'Barquinho de Papel'], ['nutshell', 'Chapéu de Nozes'],
];
const FANT_DEFS = [                                           // FANTASIAS: infláveis, o ratinho vai por dentro
  ['none', 'Sem fantasia'], ['dragao', 'Dragão'], ['porco', 'Porco'], ['caranguejo', 'Caranguejo'],
  ['peixe', 'Peixe'], ['fada', 'Fada'], ['ciborgue', 'Ciborgue'], ['axolote', 'Axolote'],
];
HAT_DEFS.map(a => a[0]).concat(ACC_DEFS.map(a => a[0]))
  .concat(FANT_DEFS.map(a => a[0] === 'none' ? 'fnone' : a[0]))
  .concat(PECA_DEFS.map(a => a[0]))
  .forEach(k => WICON[k] = wardIcon(k));
function rodaCor(id, chave, of){                              // a roda de matizes de uma peça
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  const m = document.createElement('button');                  // "ORIG" vem primeiro: é o estado de partida
  m.className = 'meio' + (of[chave] == null ? ' on' : '');
  m.textContent = 'ORIG';
  m.title = 'cor original da peça';
  m.onclick = () => { of[chave] = null; applyOutfit(); };
  el.appendChild(m);
  HUES.forEach(h => {
    const b = document.createElement('button');
    b.style.background = h === 'w' ? '#f4f4f4' : hsl2hex(h, .72, .55);
    if (of[chave] === h) b.classList.add('on');
    b.title = h === 'w' ? 'branco' : 'matiz ' + h + '°';
    b.onclick = () => { of[chave] = h; applyOutfit(); };
    el.appendChild(b);
  });
}
function renderWard(){
  // O MESMO armário serve aos dois: o rato tem capa e acessórios, o sapo tem a cor do corpo.
  const sapo = wardDono === player2;
  const of = sapo ? outfit2 : outfit;
  document.getElementById('wardTit').innerHTML = emojify(sapo ? '🐸 Guarda-Roupa do Sapo' : '🐭 Guarda-Roupa do Ratinho');
  const who = document.getElementById('wardWho');
  who.style.display = p2On ? '' : 'none';
  document.getElementById('wardRat').classList.toggle('on', !sapo);
  document.getElementById('wardFrog').classList.toggle('on', sapo);
  const wh = document.getElementById('wHat');
  wh.innerHTML = '';
  HAT_DEFS.forEach(([val, label]) => {
    const b = document.createElement('button');
    b.className = 'wico' + (of.hat === val ? ' on' : '');
    b.style.backgroundImage = `url(${WICON[val]})`;
    b.title = label;
    b.onclick = () => { of.hat = val; applyOutfit(); };
    wh.appendChild(b);
  });
  // A seção FANTASIA saiu do armário a pedido. O desenho (`drawFantasia`) e as tabelas continuam
  // no arquivo, prontos pra voltar — só não há mais como escolher, e nada fica vestido.
  rodaCor('rodaHat', 'hatHue', of);
  rodaCor('rodaCape', sapo ? 'corHue' : 'capeHue', of);
  document.getElementById('secCapa').textContent = sapo ? 'Cor do sapo' : 'Cor da capa';
  const wc = document.getElementById('wCape');                 // a cor vem TODA da roda; sobrou só o liga/desliga
  wc.innerHTML = '';
  if (!sapo){
    const nb = document.createElement('button');
    nb.className = 'wbtn' + (of.cape !== 'none' ? ' on' : '');
    nb.textContent = of.cape !== 'none' ? 'Com capa' : 'Sem capa';
    nb.onclick = () => { of.cape = of.cape === 'none' ? 'green' : 'none'; applyOutfit(); };
    wc.appendChild(nb);
  }
  const wa = document.getElementById('wAcc');                 // acessórios são do rosto do rato
  document.getElementById('secAcc').style.display = sapo ? 'none' : '';
  wa.style.display = sapo ? 'none' : '';
  wa.innerHTML = '';
  if (!sapo) ACC_DEFS.forEach(([k, label]) => {
    const b = document.createElement('button');
    b.className = 'wico' + (of[k] ? ' on' : '');
    b.style.backgroundImage = `url(${WICON[k]})`;
    b.title = label;
    b.onclick = () => { of[k] = !of[k]; applyOutfit(); };
    wa.appendChild(b);
  });
  const wf = document.getElementById('wFant');                // peças grandes: uma de cada vez
  wf.style.display = sapo ? 'none' : '';
  wf.innerHTML = '';
  if (!sapo) PECA_DEFS.forEach(([ico, label, val]) => {
    const b = document.createElement('button');
    b.className = 'wico' + ((of.fant || 'none') === val ? ' on' : '');
    b.style.backgroundImage = `url(${WICON[ico]})`;
    b.title = label;
    b.onclick = () => { of.fant = (of.fant === val && val !== 'none') ? 'none' : val; applyOutfit(); };
    wf.appendChild(b);
  });
}
function openWard(quem){
  if (wardOpen) return;
  wardDono = quem || wardDono || player;
  if (onlineConvidado()) wardDono = player2;                  // em sala, cada um veste o seu
  SFX.ui(); wardOpen = true;
  document.getElementById('wardPanel').classList.add('open');
  renderWard();
}
function closeWard(){ wardOpen = false; document.getElementById('wardPanel').classList.remove('open'); }
document.getElementById('wardRat').onclick = () => { if (onlineConvidado()) return; wardDono = player; SFX.ui(); renderWard(); };   // em sala cada um veste o seu
document.getElementById('wardFrog').onclick = () => { if (onlineDono()) return; wardDono = player2; SFX.ui(); renderWard(); };
document.getElementById('wardClose').onclick = () => closeWard();
applyOutfit();

function closeInv(){ invOpen = false; document.getElementById('invPanel').classList.remove('open'); }

/* --------- ficha do ratinho: stats completos, roupas e o fundo alcançado na sessão --------- */
let charOpen = false;
let bestLv = 0;                                              // fundo alcançado NESTA sessão: fechou o jogo, recomeça do 1
const HAT_NAMES = { none: '—', straw: 'Chapéu de Palha', tophat: 'Cartola', wizard: 'Chapéu de Mago', crown: 'Coroa', paperboat: 'Barquinho de Papel', nutshell: 'Chapéu de Nozes' };
const CAPE_NAMES = { green: 'Verde', red: 'Vermelha', blue: 'Azul', purple: 'Roxa', gold: 'Dourada', black: 'Negra' };
function renderChar(){                                        // ficha visual: ícones no lugar de texto
  const im = src => `<img src="${src}" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:-5px">`;
  const row = (l, v) => `<div class="crRow"><span>${l}</span><b>${v}</b></div>`;
  const accs = ACC_DEFS.filter(([k]) => outfit[k]).map(([k, label]) => `<span title="${label}">${im(WICON[k])}</span>`).join(' ') || '—';
  const cape = outfit.cape === 'none' ? '—'
    : `<i class="crCape" title="capa ${CAPE_NAMES[outfit.cape]}" style="background:${CAPE_SETS[outfit.cape][0]};width:16px;height:16px"></i>`;
  document.getElementById('charBody').innerHTML = emojify(
    row('❤️', `${player.hp} / <em>${player.maxHp}</em>`) +
    row(`⚔️ ${im(ICON[weapon])}`, `<em>${player.dmg + (stamT > 0 ? 1 : 0)}</em>${rageT > 0 ? ' ×2 😡' : ''}${stamT > 0 ? ' ⚡' : ''}`) +
    row(`✨ ${power ? im(iconePoder(power)) : ''}`, power ? `⏳ ${POWERS[power].cd}s` : '—') +
    row('⚡', `5s · 1.5x · ⚔️+1 · ⏳ <em>${stamCdMax()}s</em>`) +
    row(im(ICON.crit), `<em>${critPct()}%</em> de crítico · dano ×2`) +
    row('🕳️', `V ou toque 2x · imune sob a terra · tremor de ${Math.max(1, Math.round(player.dmg * .5))} nos 4 vizinhos`) +
    row('💥', `segurar o golpe = giro ×2 · <em>dano corta a carga</em>${player.hp >= player.maxHp ? ' · vida cheia: raio ativo' : ''}`) +
    row('💨', `inimigo erra <em>${MISS_PCT}%</em> dos golpes · você acerta sempre`) +
    row('🎁', cardOn() ? `<span title="${CARDS[cardOn()].desc}">${im(ICON[cardOn()])} ${CARDS[cardOn()].name.replace('Carta d', 'd')}</span>` : '— sem carta na arma') +
    row('👒', outfit.hat !== 'none' ? `<span title="${HAT_NAMES[outfit.hat]}">${im(WICON[outfit.hat])}</span>` : '—') +
    row('🧣', cape) +
    row('💍', accs) +
    row('🧀', `<em>${contaDe('rato')[0]}</em> ➡️ 🎁 <em>${contaDe('rato')[1]}</em>`) +
    row('🎁', `${contaDe('rato')[3]}${contaDe('rato')[2] > 0 ? ` <em>+${contaDe('rato')[2]}!</em>` : ''}`) +
    row('☠️', bestLv > 0 ? `<em>${bestLv}</em> / 40` : '—'));
}
function openChar(){ if (charOpen) return; SFX.ui(); charOpen = true; renderChar(); document.getElementById('charPanel').classList.add('open'); }
function closeChar(){ charOpen = false; document.getElementById('charPanel').classList.remove('open'); }
function toggleHelp(on){                                      // balão de ajuda: não pausa nada, só informa
  const h = document.getElementById('hint'), b = document.getElementById('bHelp');
  const open = on === undefined ? !h.classList.contains('open') : on;
  h.classList.toggle('open', open);
  b.classList.toggle('on', open);
  if (open) SFX.ui();
}
document.getElementById('bHelp').addEventListener('pointerdown', e => { e.preventDefault(); toggleHelp(); });
document.getElementById('bChar').addEventListener('pointerdown', e => { e.preventDefault(); charOpen ? closeChar() : openChar(); });
document.getElementById('charClose').onclick = closeChar;
document.getElementById('invClose').onclick = () => closeInv();
/* clicar fora de qualquer janela fecha ela */
const shadeEl = document.getElementById('shade');
shadeEl.onclick = () => {
  SFX.ui();
  closeChest(); closeLan(); closeInv(); closeAsk(); closeWard(); closeChar();
  if (upOpen) closeUp();
  shadeEl.classList.remove('open');
};
document.getElementById('bInv').addEventListener('pointerdown', e => { e.preventDefault(); invOpen ? closeInv() : openInv(); });
document.getElementById('bInv').style.backgroundImage = `url(${ICON.bag})`;
document.getElementById('bStam').style.backgroundImage = `url(${ICON.stam})`;
document.getElementById('bTu').style.backgroundImage = `url(${ICON.rotl})`;
document.getElementById('bTd').style.backgroundImage = `url(${ICON.rotr})`;
{ const h2 = document.getElementById('hint');                 // a ajuda também usa a pixel art, não o emoji do SO
  h2.innerHTML = emojify(h2.innerHTML); }
document.getElementById('bChar').innerHTML = emojify('🐭');
document.getElementById('upReadyIco').src = ICON.upready;
function makeFrogDown(){                                       // retrato 40x40 do sapo de olho fechado, pedindo socorro
  const c = document.createElement('canvas'); c.width = 40; c.height = 40;
  const t = c.getContext('2d');
  const q = (x, y, w, h, col) => { t.fillStyle = col; t.fillRect(x, y, w, h); };
  const VD = '#4f9440', VD2 = '#63ad52', TOP = '#8fd472', LIN = '#1c3a16';
  const BR = '#fbf6e8', VM = '#c9382f', VM2 = '#ef6a58', PE = '#f2c14e';
  q(2, 2, 13, 13, LIN); q(25, 2, 13, 13, LIN);                // olhões saltados
  q(3, 3, 11, 11, VD2); q(26, 3, 11, 11, VD2);
  q(3, 3, 11, 3, TOP); q(26, 3, 11, 3, TOP);
  q(6, 10, 6, 2, LIN); q(29, 10, 6, 2, LIN);                  // desmaiado: olhos fechados
  q(7, 8, 4, 2, LIN); q(30, 8, 4, 2, LIN);
  q(6, 12, 28, 18, LIN);                                      // cabeção
  q(7, 13, 26, 16, VD);
  q(7, 13, 26, 4, VD2);
  q(11, 22, 18, 3, '#15300f');                                // bocarra caída
  q(11, 22, 18, 1, '#0d2209');
  q(13, 25, 14, 1, VD2);
  q(15, 19, 3, 2, '#2a5222'); q(22, 19, 3, 2, '#2a5222');     // narinas
  q(5, 29, 30, 5, LIN); q(6, 30, 28, 3, VM);                  // a bandana, marca do jogador 2
  q(6, 30, 28, 1, VM2);
  q(0, 31, 7, 4, LIN); q(1, 32, 5, 2, VM);                    // ponta do nó
  q(9, 35, 8, 4, LIN); q(23, 35, 8, 4, LIN);                  // pezinhos amarelos
  q(10, 36, 6, 2, PE); q(24, 36, 6, 2, PE);
  q(30, 4, 3, 3, BR);                                         // brilhinho no olho
  q(15, 6, 4, 3, '#f8e0a0'); q(21, 9, 3, 2, '#f8e0a0');       // estrelinhas de tontura
  return c.toDataURL();
}
document.getElementById('callFrogImg').src = makeFrogDown();
document.getElementById('callUpImg').src = makeWaifuKiss();
document.getElementById('invDropBtn').innerHTML = emojify('🗑️');   // era o único emoji cru sobrando na tela
document.getElementById('plIcon').innerHTML = emojify('🏠');
document.getElementById('bossIco').innerHTML = emojify('💀');
document.getElementById('bossLbl').innerHTML = emojify('🎯 CHEFE DO ANDAR');
/* legenda arco-íris em PIXEL ART, estilo "invincible" do Blackhole */
/* ---------------- FONTE PIXEL DO LETREIRO ----------------
   A tipografia vetorial era o que destoava: por mais sombra dura que eu pusesse, a borda da letra
   continuava suavizada. Aqui cada letra é um BITMAP 5x7 desenhado à mão, com contorno, relevo e
   realce pintados em pixel — e as animações continuam as mesmas, porque quem anima é o <span>. */
const FONTE5 = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10101', '10011', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00000', '00100'],
  ',': ['00000', '00000', '00000', '00000', '00000', '00100', '01000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
};
const ACENTO = { ag: ['00110', '01100'], ci: ['00100', '01010'], ti: ['01101', '10110'], gr: ['01100', '00110'] };
const ACENTUADO = {
  'Á': ['A', 'ag'], 'À': ['A', 'gr'], 'Â': ['A', 'ci'], 'Ã': ['A', 'ti'],
  'É': ['E', 'ag'], 'Ê': ['E', 'ci'], 'Í': ['I', 'ag'], 'Ó': ['O', 'ag'],
  'Ô': ['O', 'ci'], 'Õ': ['O', 'ti'], 'Ú': ['U', 'ag'], 'Ç': ['C', 'ced'],
};
const TOM_LET = {                                             // mesma paleta dos --fill/--ext do CSS
  '':       { fill: '#ffd75e', hi: '#fff3c4', ext: '#a8471c', ext2: '#6e2612' },
  gelo:     { fill: '#cdeeff', hi: '#ffffff', ext: '#2f6f9e', ext2: '#193f66' },
  esgoto:   { fill: '#c6f28f', hi: '#eaffd4', ext: '#437a26', ext2: '#274d16' },
  bruxa:    { fill: '#ffc04a', hi: '#fff0c8', ext: '#7a3aa8', ext2: '#3f1560' },
  lenda:    { fill: '#ffeeb8', hi: '#ffffff', ext: '#7a3aa8', ext2: '#43195f' },
};
const GL_S = 4, GL_W = 5, GL_H = 10, GL_EXT = 3;              // escala · grade da letra · relevo
const glifoCache = new Map();
function glifo(ch, tom){
  const key = ch + '|' + tom;
  if (glifoCache.has(key)) return glifoCache.get(key);
  const [base, acc] = ACENTUADO[ch] || [ch, null];
  const bm = FONTE5[base];
  if (!bm){ glifoCache.set(key, null); return null; }
  const G = [];                                               // grade 5 x 10: 2 linhas de acento, 7 da letra, 1 de cedilha
  for (let y = 0; y < GL_H; y++) G.push(new Array(GL_W).fill(0));
  bm.forEach((lin, y) => { for (let x = 0; x < GL_W; x++) if (lin[x] === '1') G[y + 2][x] = 1; });
  if (acc === 'ced'){ G[9][2] = 1; G[9][3] = 1; }
  else if (acc) ACENTO[acc].forEach((lin, y) => { for (let x = 0; x < GL_W; x++) if (lin[x] === '1') G[y][x] = 1; });
  // APARA as colunas vazias: sem isso o "I" e o "!" carregam 4 colunas de nada e a palavra
  // fica cheia de buraco entre as letras
  let x0 = GL_W, x1 = -1;
  for (let y = 0; y < GL_H; y++) for (let x = 0; x < GL_W; x++)
    if (G[y][x]){ if (x < x0) x0 = x; if (x > x1) x1 = x; }
  if (x1 < 0){ x0 = 0; x1 = GL_W - 1; }
  const LW = x1 - x0 + 1;
  const c = document.createElement('canvas');
  c.width = (LW + 2) * GL_S; c.height = (GL_H + GL_EXT + 2) * GL_S;
  const tc = c.getContext('2d');
  const T = TOM_LET[tom] || TOM_LET[''];
  const px = (x, y, col) => { tc.fillStyle = col; tc.fillRect((x - x0 + 1) * GL_S, (y + 1) * GL_S, GL_S, GL_S); };
  const aceso = (x, y) => x >= 0 && x < GL_W && y >= 0 && y < GL_H && G[y][x];
  const corpo = (x, y) => { for (let d = 0; d <= GL_EXT; d++) if (aceso(x, y - d)) return 1; return 0; };
  for (let y = -1; y <= GL_H + GL_EXT; y++)                   // CONTORNO: dilata o corpo inteiro em 1
    for (let x = x0 - 1; x <= x1 + 1; x++){
      if (corpo(x, y)) continue;
      let viz = 0;
      for (let a = -1; a <= 1 && !viz; a++) for (let b = -1; b <= 1; b++) if (corpo(x + a, y + b)){ viz = 1; break; }
      if (viz) px(x, y, '#16070a');
    }
  for (let d = GL_EXT; d >= 1; d--)                           // RELEVO: degraus duros por baixo
    for (let y = 0; y < GL_H; y++) for (let x = 0; x < GL_W; x++)
      if (G[y][x]) px(x, y + d, d >= 2 ? T.ext2 : T.ext);
  for (let y = 0; y < GL_H; y++) for (let x = 0; x < GL_W; x++)   // CORPO: topo mais claro
    if (G[y][x]) px(x, y, y <= 3 ? T.hi : T.fill);
  const url = c.toDataURL();
  glifoCache.set(key, url);
  return url;
}
let bannerT = null, bannerT2 = null, bannerT3 = null;
const ACENTOS_LET = {                                         // acento que a fonte do letreiro não desenha
  'Á': '´', 'À': '`', 'Â': '^', 'Ã': '~', 'É': '´', 'Ê': '^', 'Í': '´',
  'Ó': '´', 'Ô': '^', 'Õ': '~', 'Ú': '´', 'Ü': '¨', 'Ç': ',',
};
/* FILA DE AVISOS — antes cada anúncio se abria por cima do anterior: o "COMPLETO!" caía em cima
   da espada recém-pega e nenhum dos dois dava pra ler. Agora tudo entra numa FILA: um aviso só
   por vez, na ordem em que aconteceu, e o seguinte só começa quando o de cima termina. Avisos
   iguais colados se fundem (dois "QUEIMANDO!" não viram dois letreiros).                       */
const avisos = [];
let avisoAte = 0;
function enfileira(chave, dur, fn){
  if (avisos.some(a => a.chave === chave)) return;             // já está esperando: não entra duas vezes
  if (avisos.length >= 4) avisos.shift();                      // enchente: o mais velho já não interessa
  avisos.push({ chave, dur, fn });
}
function passoAvisos(){
  const ag = performance.now();
  if (ag < avisoAte || !avisos.length) return;
  const a = avisos.shift();
  avisoAte = ag + a.dur;
  a.fn();
}
function bannerNaFila(text, tom, dur){                        // o letreiro sempre entra pela fila
  enfileira('b:' + text, dur || 2750, () => showBanner(text, tom));
}
function showBanner(text, tom){
  const b = document.getElementById('banner');
  b.className = tom || '';                                   // o tom pinta o estrato: gelo, esgoto, bruxa, lenda
  void b.offsetWidth;                                        // reinicia a animação
  b.innerHTML = '';
  const ch2 = [...text];
  b.style.setProperty('--sz', Math.min(1, 13 / Math.max(11, ch2.length)).toFixed(3));   // frase longa encolhe pra caber
  ch2.forEach((ch, i) => {
    const s = document.createElement('span');
    if (ch === ' '){ s.style.width = '.4em'; }
    else if (ch === '️') return;                          // seletor de emoji: já embutido no anterior
    else if (EMO[ch]) s.innerHTML = emojify(ch);
    else {
      s.textContent = ch;                                 // letra na fonte do jogo, igual ao "CRÍTICO!"
      // A fonte do jogo COME os acentos (Ê vira E, Ç vira C), mas desenha os sinais soltos.
      // Então a letra vai limpa e o acento entra por cima, como pseudo-elemento — anda junto na animação.
      const ac = ACENTOS_LET[ch.toUpperCase()];
      if (ac){ s.classList.add(ac === ',' ? 'ced' : 'ac'); s.dataset.ac = ac; }
    }
    s.style.animationDelay = (i * .055) + 's, ' + (.5 + i * .1) + 's';
    if (tom === 'arco'){ s.style.setProperty('--fill', ARCO[i % 6]); s.style.setProperty('--ext2', ARCO_ESC[i % 6]); }
    b.appendChild(s);
  });
  b.style.display = 'flex';
  b.className = (tom ? tom + ' ' : '') + 'play';
  const w = document.getElementById('winFx');                // flashes coloridos nas laterais
  w.classList.remove('play');
  void w.offsetWidth;
  w.classList.add('play');
  shake(1.2, .4);                                            // tremores leves, crescendo de leve
  clearTimeout(bannerT); clearTimeout(bannerT2); clearTimeout(bannerT3);
  bannerT2 = setTimeout(() => shake(2, .4), 900);
  bannerT3 = setTimeout(() => shake(3, .5), 1700);
  bannerT = setTimeout(() => { b.style.display = 'none'; b.className = ''; }, 2650);
}
let wpnT = null;
function announceWeapon(kind){                                // anúncio de arma nova: entra pela fila
  enfileira('w:' + kind, 2350, () => mostraArma(kind));
}
function mostraArma(kind){
  const el = document.getElementById('wpn');
  el.innerHTML = emojify(`<img src="${ICON[kind]}" alt=""><div>${WEAPONS[kind].name}</div><small>⚔️ DANO ${WEAPONS[kind].dmg}</small>`);
  el.classList.remove('play');
  void el.offsetWidth;                                        // reinicia a animação
  el.classList.add('play');
  clearTimeout(wpnT);
  wpnT = setTimeout(() => el.classList.remove('play'), 2250);
}
let toastT = null;
function toast(msg){
  const el = document.getElementById('toast');
  el.innerHTML = emojify(msg); el.style.opacity = 1;
  clearTimeout(toastT);
  toastT = setTimeout(() => el.style.opacity = 0, 1700);      // avisos curtos somem rápido
}

/* ---------------- SFX (Web Audio procedural, zero assets) ----------------
   A CADEIA, e por que cada elo existe:
     tone/noiseS ➡️ [panner] ➡️ masterG ➡️ filtro de abafamento ➡️ LIMITADOR ➡️ saída
   · LIMITADOR: um Rodopio acertando 8 bichos disparava 8 sons idênticos no mesmo instante; as
     ondas somavam, estouravam e viravam chiado. O compressor segura o pico e mantém a pancada.
   · FILTRO: com caixinha aberta o jogo abafa, como se o som viesse de outro cômodo.
   · PANNER: cada som nasce ONDE a coisa aconteceu — bicho à esquerda soa à esquerda, e o que
     está longe soa mais baixo.
   · DETUNE: dois passos seguidos nunca são o mesmo arquivo; sem isso vira metralhadora.        */
let AC = null, masterG = null, sfxOn = true, sfxFilt = null, sfxFiltAlvo = 0;
let sfxPan = 0, sfxDist = 1;
function ac(){
  if (!AC){
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e){ return null; }
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function master(){
  const c = ac(); if (!c) return null;
  if (!masterG){
    // Cada elo entra SE o navegador tiver: onde faltar, o som segue reto pra saída em vez de
    // explodir. (Sem isso, um ambiente sem DynamicsCompressor derrubava o jogo inteiro.)
    let fim = c.destination;
    if (c.createDynamicsCompressor){
      const lim = c.createDynamicsCompressor();               // segura o pico quando tudo toca junto
      lim.threshold.value = -13; lim.knee.value = 8; lim.ratio.value = 12;
      lim.attack.value = .003; lim.release.value = .18;
      lim.connect(fim); fim = lim;
    }
    if (c.createBiquadFilter){
      sfxFilt = c.createBiquadFilter();                       // abafa com painel aberto
      sfxFilt.type = 'lowpass'; sfxFilt.frequency.value = 18000; sfxFilt.Q.value = .5;
      sfxFilt.connect(fim); fim = sfxFilt;
    }
    masterG = c.createGain(); masterG.gain.value = .5; masterG.connect(fim);
  }
  return masterG;
}
function saida(c){                                            // onde o som entra: com pan, se houver
  const m = master(); if (!m) return null;
  if (!sfxPan || !c.createStereoPanner) return m;
  const pn = c.createStereoPanner();
  pn.pan.value = Math.max(-1, Math.min(1, sfxPan));
  pn.connect(m);
  return pn;
}
function panDe(x, y){                                         // tile do mundo ➡️ estéreo + distância
  const gx2 = gX(x, y), gy2 = gY(x, y);
  sfxPan = Math.max(-.85, Math.min(.85, (gx2 - cam.x) / (VW * .5)));
  const d = Math.hypot(gx2 - cam.x, (gy2 - cam.y) * 1.7) / (VW * .75);
  sfxDist = Math.max(.32, 1 - d * .6);
}
function soaEm(x, y, fn){                                     // toca UM efeito posicionado e devolve o centro
  panDe(x, y);
  try { fn(); } finally { sfxPan = 0; sfxDist = 1; }
}
function tone(freq, dur, opt = {}){
  if (!sfxOn) return;
  const c = ac(), m = saida(c); if (!c || !m) return;
  const t0 = c.currentTime + (opt.delay || 0);
  const o = c.createOscillator(), gn = c.createGain();
  o.type = opt.type || 'square';
  o.frequency.setValueAtTime(freq, t0);
  if (o.detune) o.detune.value = (Math.random() - .5) * (opt.det == null ? 24 : opt.det);   // nunca duas vezes igual
  if (opt.slide) o.frequency.exponentialRampToValueAtTime(Math.max(24, freq + opt.slide), t0 + dur);
  gn.gain.setValueAtTime(0, t0);
  gn.gain.linearRampToValueAtTime((opt.vol || .14) * sfxDist, t0 + .006);
  gn.gain.exponentialRampToValueAtTime(.001, t0 + dur);
  o.connect(gn); gn.connect(m);
  o.start(t0); o.stop(t0 + dur + .03);
}
function noiseS(dur, opt = {}){
  if (!sfxOn) return;
  const c = ac(), m = saida(c); if (!c || !m) return;
  const t0 = c.currentTime + (opt.delay || 0);
  const len = Math.max(1, (dur * c.sampleRate) | 0);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const fl = c.createBiquadFilter();
  fl.type = opt.ftype || 'lowpass';
  fl.frequency.setValueAtTime(opt.f0 || 1000, t0);
  fl.Q.value = opt.q || 1;
  if (opt.f1) fl.frequency.exponentialRampToValueAtTime(opt.f1, t0 + dur);
  fl.frequency.value *= .9 + Math.random() * .2;             // cada ruído com o seu timbre
  const gn = c.createGain();
  gn.gain.setValueAtTime((opt.vol || .18) * sfxDist, t0);
  gn.gain.exponentialRampToValueAtTime(.001, t0 + dur);
  src.connect(fl); fl.connect(gn); gn.connect(m);
  src.start(t0); src.stop(t0 + dur + .03);
}
const SFX = {
  step(){ noiseS(.06, { vol: .06, f0: 700, f1: 300 }); },
  dash(){ noiseS(.22, { vol: .2, f0: 500, f1: 3200, ftype: 'bandpass', q: 1.2 }); tone(220, .18, { type: 'sine', vol: .07, slide: 400 }); },
  swing(){ noiseS(.13, { vol: .16, f0: 2400, f1: 700, ftype: 'bandpass', q: 1.5 }); },
  hitEnemy(){ tone(160, .1, { vol: .16, slide: -80 }); noiseS(.07, { vol: .16, f0: 900, f1: 300 }); },
  hurt(){ tone(140, .22, { type: 'sawtooth', vol: .18, slide: -70 }); noiseS(.12, { vol: .13, f0: 500, f1: 150 }); },
  absorb(){ tone(320, .1, { type: 'triangle', vol: .11, slide: -60 }); },
  die(){ tone(300, .55, { type: 'sawtooth', vol: .18, slide: -270 }); },
  kill(){ noiseS(.12, { vol: .18, f0: 1200, f1: 200 }); tone(500, .12, { type: 'triangle', vol: .11, slide: -300 }); },
  cheese(){ tone(660, .09, { vol: .11 }); tone(880, .12, { vol: .11, delay: .07 }); },
  item(){ [523, 659, 784].forEach((f, i) => tone(f, .1, { type: 'triangle', vol: .11, delay: i * .07 })); },
  potion(){ [300, 240, 360, 280].forEach((f, i) => tone(f, .08, { type: 'sine', vol: .11, delay: i * .07 })); },
  deposit(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, .14, { type: 'triangle', vol: .12, delay: i * .09 })); },
  door(){ noiseS(.3, { vol: .13, f0: 300, f1: 90 }); },
  fanfare(){ [523, 523, 784, 1047].forEach((f, i) => tone(f, i === 3 ? .45 : .12, { vol: .12, delay: i * .12 })); noiseS(.5, { vol: .06, f0: 400, f1: 2400, ftype: 'bandpass' }); },
  burn(){ noiseS(.15, { vol: .11, f0: 2600, f1: 900, ftype: 'highpass' }); },
  spin(){ noiseS(.12, { vol: .16, f0: 2000, f1: 600, ftype: 'bandpass' }); noiseS(.12, { vol: .14, f0: 600, f1: 2200, ftype: 'bandpass', delay: .09 }); },
  shock(){ tone(900, .3, { type: 'sawtooth', vol: .15, slide: -750 }); },
  knife(){ noiseS(.16, { vol: .17, f0: 3200, f1: 800, ftype: 'bandpass', q: 1.6 }); tone(700, .1, { type: 'triangle', vol: .08, slide: -420 }); },
  blink(){ tone(300, .12, { vol: .11, slide: 900 }); },
  rage(){ tone(110, .4, { type: 'sawtooth', vol: .18, slide: 60 }); noiseS(.3, { vol: .09, f0: 200, f1: 600 }); },
  ui(){ tone(440, .05, { vol: .06 }); },
  dig(){                                                      // pá na terra: baque grave e areia
    noiseS(.26, { vol: .2, f0: 900, f1: 160, ftype: 'lowpass' });
    tone(150, .2, { type: 'sine', vol: .1, slide: -70 });
  },
  burst(){                                                    // irrupção: o chão estoura pra fora
    noiseS(.2, { vol: .22, f0: 300, f1: 1800, ftype: 'bandpass', q: .8 });
    tone(90, .22, { type: 'triangle', vol: .12, slide: 260 });
  },
  crit(){                                                     // pancada seca + fanfarrinha de sorte
    tone(120, .3, { type: 'sawtooth', vol: .2, slide: -60 });
    noiseS(.22, { vol: .24, f0: 2600, f1: 500, ftype: 'bandpass', q: 1.3 });
    [1319, 1760].forEach((f, i) => tone(f, .16, { type: 'triangle', vol: .13, delay: .05 + i * .07 }));
  },
  smash(){ noiseS(.2, { vol: .2, f0: 1400, f1: 260, ftype: 'bandpass', q: .9 }); tone(220, .14, { type: 'square', vol: .1, slide: -110 }); },
  beam(){ tone(1200, .16, { type: 'triangle', vol: .12, slide: -520 }); noiseS(.12, { vol: .09, f0: 2600, f1: 900, ftype: 'bandpass' }); },
  charged(){ tone(988, .1, { type: 'triangle', vol: .1 }); tone(1319, .16, { type: 'triangle', vol: .09, delay: .07 }); },
  whiff(){ noiseS(.16, { vol: .11, f0: 2200, f1: 700, ftype: 'bandpass', q: .8 }); tone(420, .1, { type: 'triangle', vol: .05, slide: -180 }); },
  fizzle(){                                                   // a carga escapando: desce e apaga
    tone(760, .18, { type: 'square', vol: .09, slide: -430 });
    noiseS(.2, { vol: .1, f0: 1800, f1: 300, ftype: 'lowpass' });
  },
  spinAtk(){                                                  // giro carregado soltando: sopro + vidro subindo
    noiseS(.34, { vol: .2, f0: 600, f1: 3200, ftype: 'bandpass', q: 1.2 });
    tone(240, .3, { type: 'sawtooth', vol: .12, slide: 480 });
    [880, 1319, 1760].forEach((f, i) => tone(f, .18, { type: 'triangle', vol: .1 - i * .02, delay: i * .05 }));
  },
  spinLand(){ tone(150, .16, { type: 'triangle', vol: .13, slide: -70 }); noiseS(.14, { vol: .12, f0: 900, f1: 200, ftype: 'lowpass' }); },
  low(){ tone(1046, .07, { type: 'square', vol: .08 }); tone(1046, .07, { type: 'square', vol: .08, delay: .12 }); },
  quake(){                                                    // trovão subterrâneo
    noiseS(.4, { vol: .24, f0: 420, f1: 60, ftype: 'lowpass' });
    tone(64, .42, { type: 'sawtooth', vol: .16, slide: -22 });
    tone(120, .22, { type: 'triangle', vol: .1, slide: -60, delay: .04 });
  },
  alert(){ tone(880, .07, { type: 'square', vol: .09 }); tone(1320, .09, { type: 'square', vol: .07, delay: .06 }); },
  levelup(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i === 4 ? .5 : .11, { type: 'triangle', vol: .12, delay: i * .09 })); },
  kiss(){                                                     // chuac! estalinho + subida doce
    noiseS(.05, { vol: .14, f0: 1600, f1: 500, ftype: 'bandpass', q: 2 });
    tone(880, .09, { type: 'sine', vol: .1, slide: 340, delay: .05 });
    tone(1320, .12, { type: 'sine', vol: .07, slide: 200, delay: .13 });
  },
  stam(){                                                     // arranque energético: subida + vento
    tone(260, .35, { type: 'square', vol: .09, slide: 620 });
    tone(520, .22, { type: 'sine', vol: .08, slide: 500, delay: .1 });
    noiseS(.4, { vol: .12, f0: 700, f1: 3400, ftype: 'bandpass', q: 1.1 });
  },
  nova(){                                                     // estalo cristalino se espalhando
    tone(1180, .3, { type: 'sine', vol: .09, slide: -700 });
    tone(1560, .22, { type: 'triangle', vol: .07, slide: -900, delay: .06 });
    noiseS(.35, { vol: .1, f0: 2400, f1: 5200, ftype: 'bandpass', q: 2 });
  },
  aegis(){                                                    // gelo se formando em camadas
    tone(320, .25, { type: 'triangle', vol: .08, slide: 240 });
    tone(640, .2, { type: 'sine', vol: .07, slide: 180, delay: .1 });
  },
  bomb(){                                                     // explosão molhada de lodo
    tone(120, .3, { type: 'square', vol: .1, slide: -70 });
    noiseS(.35, { vol: .14, f0: 300, f1: 90, ftype: 'lowpass', q: .8 });
  },
  leech(){                                                    // sucção úmida
    tone(220, .3, { type: 'sine', vol: .09, slide: -140 });
    tone(160, .2, { type: 'triangle', vol: .07, slide: 90, delay: .15 });
  },
  stop(){                                                     // a terra rasga e a raiz agarra
    noiseS(.16, { vol: .075, f0: 260, f1: 90, ftype: 'lowpass' });
    tone(140, .3, { type: 'triangle', vol: .07, slide: -60, delay: .06 });
    tone(320, .18, { type: 'sine', vol: .05, slide: -180, delay: .22 });
  },
  gears(){                                                    // a seiva sobe borbulhando
    for (let i = 0; i < 4; i++) tone(180 + i * 70, .09, { type: 'triangle', vol: .055, slide: 60, delay: i * .08 });
    noiseS(.22, { vol: .05, f0: 500, f1: 1400, ftype: 'bandpass', q: 1.4, delay: .12 });
  },
  // PASSO POR SUPERFÍCIE: tábua estala, lodo chupa, pedra é seca
  stepMad(){ tone(190, .05, { type: 'triangle', vol: .055, slide: -50 }); noiseS(.05, { vol: .05, f0: 1300, f1: 420 }); },
  stepLodo(){ noiseS(.1, { vol: .075, f0: 440, f1: 130, ftype: 'lowpass' }); },
  stepGelo(){ noiseS(.05, { vol: .05, f0: 2800, f1: 1400, ftype: 'bandpass', q: 2 }); tone(1500, .04, { type: 'sine', vol: .03, slide: -400 }); },
  // AMBIENTE: pinceladas esparsas por cima do leito, cada estrato com a sua
  ambPingo(){ tone(1300 + Math.random() * 800, .13, { type: 'sine', vol: .05, slide: -900 }); },
  ambGelo(){ noiseS(.9 + Math.random() * .5, { vol: .045, f0: 1100, f1: 2800, ftype: 'bandpass', q: .7 }); },
  ambLar(){ noiseS(.16, { vol: .04, f0: 950, f1: 240, ftype: 'lowpass' }); },
  ambEco(){ tone(84 + Math.random() * 44, .8, { type: 'sine', vol: .04, slide: -28 }); },
};
/* ANTI-METRALHADORA — o Rodopio bate em 8 bichos no MESMO quadro e disparava 8 sons iguais
   colados: soma de fase, estouro e chiado. Aqui o segundo disparo idêntico dentro da janela
   simplesmente não sai — a pancada continua inteira, sem a papa. */
const SFX_MIN = { step: .045, stepMad: .045, stepLodo: .045, stepGelo: .045, hitEnemy: .035,
  kill: .05, smash: .045, absorb: .04, whiff: .04, alert: .14, burn: .1, hurt: .06, crit: .06 };
{ const cru = {}, quando = {};
  for (const k in SFX){
    cru[k] = SFX[k];
    SFX[k] = function (){
      const lim = SFX_MIN[k];
      if (lim){
        const t = performance.now() / 1000;
        if (quando[k] && t - quando[k] < lim) return;
        quando[k] = t;
      }
      return cru[k].apply(this, arguments);
    };
  }
}
/* LEITO DE AMBIENTE — um ruído longo em loop passando por um filtro que respira. É ele que dá
   "sala" ao andar: o covil é abafado e quente, o gelo é vento fino, o esgoto é água correndo
   longe, a fábrica é maquinário. Trocar de andar faz uma transição, nunca um corte seco.      */
const AMB = {
  covil:   { ftype: 'lowpass',  f: 250, q: .7,  vol: .05 },
  dungeon: { ftype: 'lowpass',  f: 175, q: .8,  vol: .045 },
  ice:     { ftype: 'bandpass', f: 880, q: .55, vol: .05 },
  sewer:   { ftype: 'lowpass',  f: 330, q: 1.5, vol: .055 },
};
let ambSrc = null, ambG = null, ambF = null, ambKind = '', ambT = 0;
function rampa(par, v, t, tau){                               // escorrega até o valor, se o nó souber
  if (par.cancelScheduledValues) par.cancelScheduledValues(t);
  if (par.setTargetAtTime) par.setTargetAtTime(v, t, tau);
  else par.value = v;
}
function ambiente(kind){
  const c = ac(), m = master(); if (!c || !m) return;
  // o leito precisa da mesa inteira: onde faltar um nó, o jogo fica só com os efeitos
  if (!c.createBufferSource || !c.createBiquadFilter || !c.createOscillator) return;
  if (!ambSrc){
    const len = (c.sampleRate * 3) | 0;                       // 3s de ruído rosa em loop
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let v = 0;
    for (let i = 0; i < len; i++){ v = v * .96 + (Math.random() * 2 - 1) * .05; d[i] = v; }
    ambSrc = c.createBufferSource(); ambSrc.buffer = buf; ambSrc.loop = true;
    ambF = c.createBiquadFilter();
    ambG = c.createGain(); ambG.gain.value = 0;
    ambSrc.connect(ambF); ambF.connect(ambG); ambG.connect(m);
    const lfo = c.createOscillator(), lg = c.createGain();    // a sala respira: o filtro vai e vem
    lfo.frequency.value = .07; lg.gain.value = 130;
    lfo.connect(lg); lg.connect(ambF.frequency);
    lfo.start(); ambSrc.start();
  }
  if (kind === ambKind) return;
  ambKind = kind;
  const cfg = AMB[kind] || AMB.dungeon, t = c.currentTime;
  ambF.type = cfg.ftype; ambF.Q.value = cfg.q;
  rampa(ambF.frequency, cfg.f, t, .5);
  rampa(ambG.gain, sfxOn ? cfg.vol : 0, t, .8);               // troca de andar sem corte seco
}
const lugarSonoro = () => current === home ? 'covil' : current.ice ? 'ice'
  : current.sewer ? 'sewer' : 'dungeon';
function passoDoChao(x, y){                                   // tábua estala, lodo chupa, gelo trinca
  const k = x + ',' + y;
  if (current.bridge && current.bridge.has(k)) return SFX.stepMad;
  if (current.goo && current.goo.some(g2 => g2.x === x && g2.y === y)) return SFX.stepLodo;
  if (iceTiles.some(t2 => t2.x === x && t2.y === y) || current.ice) return SFX.stepGelo;
  return SFX.step;
}

/* ---------------- INPUT ---------------- */
const KEYMAP = { arrowright: 0, d: 0, arrowdown: 1, s: 1, arrowleft: 2, a: 2, arrowup: 3, w: 3 };
const held = [];
let wantAtk = false, wantSpc = false, wantStam = false;
let atkHold = false, chargeT = 0, chargeRdy = false;         // segurar o ataque carrega o giro
let chargeLock = false, chargeBreakT = 0;                    // apanhou carregando: só recarrega soltando o botão
const CHARGE_T = .45;   // carga mais curta: no 2 jogadores levava dano antes de encher
function holdAtk(){
  // No ONLINE o convidado joga de sapo: os MESMOS botões da tela mandam no boneco dele.
  if (onlineConvidado()){ p2HoldAtk(); return; }
  if (atkHold || chargeLock) return;                          // repetição de tecla não reinicia a carga
  atkHold = true; chargeT = 0; chargeRdy = false;
  wantAtk = true;
}
function breakCharge(){                                       // QUALQUER dano derruba a carga: o giro só sai limpo
  if (!atkHold && chargeT <= 0) return;
  const had = chargeRdy || chargeT > .18;                     // carga recém-começada não vale aviso
  const wasRdy = chargeRdy;
  atkHold = false; chargeT = 0; chargeRdy = false;
  chargeLock = true;                                          // tem que soltar e apertar de novo
  if (!had) return;
  SFX.fizzle();
  chargeBreakT = .34;
  if (wasRdy) toast('✖️ giro perdido!');
  const bx = gX(player.x, player.y), by = gY(player.x, player.y) - 16;
  for (let i = 0; i < 11; i++)                                // a luz reunida se desfaz em cacos que caem
    dust.push({
      x: bx + (hash(i, 91) - .5) * 20, y: by - hash(i, 92) * 14,
      vx: (hash(i, 93) - .5) * 110, vy: -30 + hash(i, 94) * 30, gv: 260,
      life: .26 + hash(i, 95) * .2, kind: 'cspP', sz: 2, ci: 0,
    });
}
function releaseAtk(){
  if (onlineConvidado()){ p2ReleaseAtk(); return; }
  chargeLock = false;
  if (!atkHold) return;
  atkHold = false;
  const rdy = chargeRdy;
  chargeT = 0; chargeRdy = false;
  if (rdy) doChargeSpin();
}
function cspinBurst(x, y){                                    // camada azul: fagulhas saindo em espiral do corpo
  for (let i = 0; i < 24; i++){
    const an = i / 24 * 6.2832 + hash(i, 51) * .6;
    const sp = 55 + hash(i, 52) * 95;
    dust.push({
      x: x + Math.cos(an) * 16, y: y - 10 - hash(i, 53) * 14,   // já nascem abertas: nada de bola de luz no peito
      vx: Math.cos(an) * sp, vy: Math.sin(an) * sp * pitch * .62 - 26 - hash(i, 54) * 44,
      gv: 150, life: .3 + hash(i, 55) * .3, kind: 'cspP',
      sz: hash(i, 56) > .55 ? 3 : 2, ci: hash(i, 57) > .68 ? 1 : 0,
    });
  }
}
function spinLandFx(a){                                       // o pouso do rodopio: pó, tranco curto e anel raso
  const x = gX(a.x, a.y), y = gY(a.x, a.y);
  shake(2.5, .16);
  hitStop = Math.max(hitStop, .03);
  SFX.spinLand();
  puff(x, y, 3);
  rings.push({ x, y, t: 0, ice: true });
  for (let i = 0; i < 9; i++)                                 // o pó sai rente ao chão, não pra cima
    dust.push({
      x: x + (hash(i, 61) - .5) * 24, y: y - 4,
      vx: (hash(i, 62) - .5) * 130, vy: -16 - hash(i, 63) * 20, gv: 200,
      life: .22 + hash(i, 64) * .18, kind: 'cspP', sz: 2, ci: 0,
    });
}
function doChargeSpin(quem){                                  // GIRO CARREGADO: pega tudo em volta (rato E sapo)
  const eu = quem || player;
  if (caidoDe(eu) || transitioning || anyPanel()) return;
  eu.atkS0 = eu.atkS0 || eu.atkS;
  eu.atkS = CSPIN_S;
  eu.spinAtk = true; eu.spinLand = false; eu.spinDir0 = eu.dir;
  eu.mode = 'attack'; eu.t = 0; eu.struck = true;
  SFX.spinAtk();
  shake(5, .34);
  hitStop = Math.max(hitStop, .08);
  chromaT = Math.max(chromaT, .26);
  powerFx('cspin', { x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) });
  rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y), t: 0, ice: true, wide: true });
  rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y), t: -.09, ice: true });   // 2º anel atrasado
  cspinBurst(gX(eu.x, eu.y), gY(eu.x, eu.y));
  cartaDono = eu;                                             // rodopio é golpe: a carta cai pra quem girou
  eu.capeVel -= 220;
  for (let d2 = 0; d2 < 4; d2++){
    slashes.push({ a: { x: eu.x, y: eu.y, dir: d2 }, t: 0 });
    const [ox, oy] = DIRV[d2];
    smashProp(eu.tx + ox, eu.ty + oy);
  }
  current.actors.filter(v => v.hostile && !v.dead).forEach(v => {
    const dx = v.tx - eu.tx, dy = v.ty - eu.ty;
    if (Math.abs(dx) + Math.abs(dy) === 1)                    // dano de golpe normal: o que muda é a ÁREA
      applyHit(v, danoDe(eu), dx === 1 ? 0 : dx === -1 ? 2 : dy === 1 ? 1 : 3);
  });
  if (eu.isPlayer && eu.hp >= eu.maxHp) for (let d2 = 0; d2 < 4; d2++) fireBeam(d2);   // vida cheia: quatro raios
}
/* O ÚLTIMO TOQUE DO COMPASSO. Dentro de um intervalo T vale a ÚLTIMA direção que o jogador deu
   — apertou, arrastou ou empurrou o analógico — mesmo que já tenha soltado antes da batida.
   Parado só fica quem não deu direção nenhuma no T inteiro. Segurar continua valendo: sem toque
   novo, a batida usa a direção que ainda está apertada. O pedido vive dois passos, no máximo:
   se o corpo estava ocupado (golpe, tranco) ele sai na batida seguinte, e depois disso morre. */
let passoQuer = null, passoQuerT = 0;                         // rato: a última direção deste T (tela)
let passoQuer2 = null, passoQuer2T = 0;                       // sapo da mesa / do convidado sozinho (tela)
let remQuer = null, remQuerT = 0;                             // sapo do parceiro, no dono (MUNDO)
let sapoQuerW = -1, toqueEm = -1;                             // ...e QUANDO, no relógio do dono                                           // convidado: o último toque, já em espaço de mundo
const QUER_T = PASSO_T * 2;
function querPasso(d){
  passoQuer = d; passoQuerT = QUER_T;
  if (!onlineConvidado() && curvaAtrasada(player, s2w(d))) passoQuer = null;   // chegou colado na batida: já valeu
}
function querP2(d){                                           // toque de direção do SAPO, venha de onde vier
  passoQuer2 = d; passoQuer2T = QUER_T;
  if (onlineConvidado()){ sapoQuerW = s2w(d); toqueSapo = (toqueSapo + 1) & 255; toqueEm = msDonoAgora(); }
  if (p2On && !onlineDono() && curvaAtrasada(player2, s2w(d))) passoQuer2 = null;   // no convidado também: o sapo é previsto aqui
}
/* CONTROLE DE SNAKE. Duas regras pra curva de última hora nunca virar parada:
   1. MOMENTO: a direção que estava apertada durante o T continua valendo na batida, mesmo que o
      dedo tenha saído da seta velha um instante antes de achar a nova (`segueMomento`). Sem isso,
      a brecha entre soltar uma tecla e apertar a outra caía na batida e o boneco perdia o passo.
   2. CURVA ATRASADA: um toque que chega até GRACA segundos DEPOIS da batida ainda vale pra ela —
      se o pulo acabou de sair, ele é redirecionado da casa de origem; se o boneco estava parado,
      sai agora, com o pulo encurtado pra pousar antes da próxima batida. */
const GRACA = .07;
function curvaAtrasada(a, w, graca){
  graca = graca || GRACA;
  if (passoAcc > graca || transitioning || anyPanel() || a.dead || a.mode === 'dead' || a.fora) return false;
  if (a.mode === 'hop' && a.from && a.passoN === passoN && a.t <= graca){
    if (w === a.dir) return false;
    const [dx, dy] = DIRV[w], nx = a.from[0] + dx, ny = a.from[1] + dy;
    if (!canWalk(nx, ny, a)) return false;
    a.tx = nx; a.ty = ny; a.to = [nx, ny]; a.dir = w;
  } else if (a.mode === 'idle' && a.passoN !== passoN){
    const bp = batePasso; batePasso = true; startStep(a, w); batePasso = bp;
    if (a.mode !== 'hop') return false;
    a.hopFit = Math.max(.12, a.hopFit - passoAcc);            // saiu atrasado: pousa a tempo da próxima batida
  } else return false;
  if (onlineDono() && !separados && parceiro) mandaPasso(false);   // o parceiro vê a curva já, não na próxima batida
  if (a === player2 && cliente()) mandaPos(a, a.mode === 'burrow' ? 1 : 0);
  return true;
}
function segueMomento(){                                      // regra 1, uma vez por quadro
  if (passoQuer === null && !onlineConvidado()){
    const v = padDir !== null ? padDir : touchDir !== null ? touchDir : held.length ? held[held.length - 1] : null;
    if (v !== null){ passoQuer = v; passoQuerT = QUER_T; }
  }
  if (passoQuer2 === null && p2On && !onlineDono()){
    const v2 = onlineConvidado() && touchDir !== null ? touchDir : p2PadDir !== null ? p2PadDir : p2Held.length ? p2Held[p2Held.length - 1] : null;
    if (v2 !== null){ passoQuer2 = v2; passoQuer2T = QUER_T; }
  }
  if (remQuer === null && onlineDono() && cmdSapo.segura && cmdSapo.d >= 0){ remQuer = cmdSapo.d; remQuerT = QUER_T; }
}
let spcBuf = 0, stamBuf = 0;                                 // e o mesmo buffer pro poder e pra stamina
let lastTapDir = -1, lastTapAt = 0, wantDash = false, dashCd = 0;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (entrega && KEYMAP[k] === undefined) pulaEntrega();      // tecla de ação PULA a cena (andar não: andar é sair)
  // o teclado NÃO entra mais de sapo: dois jogadores num teclado só é pior que jogar sozinho.
  // Com o sapo em campo as teclas dele continuam valendo — quem entrou foi o 2º controle.
  /* NA SALA, O TECLADO DAQUI É TODO DO SEU BONECO. Com o sapo em campo as setas são dele — mas
     numa sala o sapo é do parceiro, do outro lado do mundo, e as setas do dono caíam num canal
     que ninguém lê: ele ficava só com WASD e com o arrasto do dedo, sem saber por quê. */
  if (p2On && !onlineDono()){                                 // com dois em campo, as SETAS são do sapo
    if (KEY_P2[k] !== undefined){
      e.preventDefault();
      const d2 = KEY_P2[k];
      if (!e.repeat){
        const ms = performance.now();
        if (d2 === p2TapDir && ms - p2TapAt < 260) p2WantDash = true;   // duplo toque: escava igual ao rato
        p2TapDir = d2; p2TapAt = ms;
        querP2(d2);
      }
      if (!p2Held.includes(d2)) p2Held.push(d2);
      return;
    }
    if (COD_P2_ATK.indexOf(e.code) >= 0){ e.preventDefault(); if (!e.repeat) p2HoldAtk(); return; }
    if (COD_P2_DASH.indexOf(e.code) >= 0){ e.preventDefault(); p2WantDash = true; return; }
    if (COD_P2_POW.indexOf(e.code) >= 0){ e.preventDefault(); p2WantSpc = true; return; }
    if (COD_P2_STAM.indexOf(e.code) >= 0){ e.preventDefault(); p2WantStam = true; return; }
    if (COD_P2_BAG.indexOf(e.code) >= 0){ e.preventDefault(); invOpen ? closeInv() : openInv(player2); return; }
    if (e.code === 'Numpad4'){ e.preventDefault(); cycleQuick2(-1); return; }
    if (e.code === 'Numpad6'){ e.preventDefault(); cycleQuick2(1); return; }
    if (e.code === 'Numpad7' || e.code === 'Backspace'){ e.preventDefault(); useQuick2(); return; }
  }
  const d = KEYMAP[k];
  if (d !== undefined){
    e.preventDefault();
    if (onlineConvidado()){                                   // no computador o convidado anda de sapo
      if (!e.repeat){
        const nowMs = performance.now();
        if (d === p2TapDir && nowMs - p2TapAt < 260) p2WantDash = true;
        p2TapDir = d; p2TapAt = nowMs;
        querP2(d);
      }
      if (!p2Held.includes(d)) p2Held.push(d);
      return;
    }
    if (!e.repeat){
      const nowMs = performance.now();                        // duplo toque na direção = dash
      if (d === lastTapDir && nowMs - lastTapAt < 260) wantDash = true;
      lastTapDir = d; lastTapAt = nowMs;
      querPasso(d);                                           // o toque espera a batida do passo
    }
    if (!held.includes(d)) held.push(d);
    return;
  }
  if (k === ' ' || k === 'j'){ e.preventDefault(); holdAtk(); }
  if (k === 'v'){ e.preventDefault();
    if (onlineConvidado()){ p2WantDash = true; p2TapDir = player2.dir; }
    else { wantDash = true; lastTapDir = w2s(player.dir); } }   // escavar na direção encarada
  if (k === 'c' || k === 'k'){ e.preventDefault(); if (onlineConvidado()) p2WantSpc = true; else wantSpc = true; }
  if (k === 'x' || k === 'l'){ e.preventDefault(); if (onlineConvidado()) p2WantStam = true; else wantStam = true; }
  if (k === 'z' || k === 'i' || k === 'b'){ e.preventDefault(); invOpen ? closeInv() : openInv(); }
  if (k === 'r'){ e.preventDefault(); useQuick(); }            // usa o item da mão
  if (k === '[' || k === ',') cycleQuick(-1);                  // e passeia pelos espaços
  if (k === ']' || k === '.') cycleQuick(1);
  if (k >= '1' && k <= '8'){ const q2 = +k - 1; if (q2 < invMax()){ quickSlot = q2; SFX.ui(); updateHUD(); } }
  if (k === 'f'){ e.preventDefault(); charOpen ? closeChar() : openChar(); }
  if (k === 'h' || k === '?'){ e.preventDefault(); toggleHelp(); }
  if (k === 'm'){                                             // o mudo tem que calar o AMBIENTE também
    sfxOn = !sfxOn; toast(sfxOn ? '🔊' : '🔇');
    if (ambG && AC){ const cfg = AMB[ambKind] || AMB.dungeon;
      rampa(ambG.gain, sfxOn ? cfg.vol : 0, AC.currentTime, .12); }
  }
  if (k === 'escape'){ closeChest(); closeLan(); closeOnline(); closeInv(); closeAsk(); closeWard(); closeChar(); toggleHelp(false); if (upOpen) closeUp(); }
  if (k === '+' || k === '=') setZoom(zoom + 1);
  if (k === '-') setZoom(zoom - 1);
  if (k === 'p'){ e.preventDefault(); varreduraP2(true); }   // chamar o 2º jogador a qualquer momento
  if (k === 'o'){ e.preventDefault(); onOpen ? closeOnline() : openOnline(); }   // sala online
  if (k === 'q') setRot(-1);
  if (k === 'e') setRot(1);
});
addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (p2On && !onlineDono()){
    if (KEY_P2[k] !== undefined){
      const i2 = p2Held.indexOf(KEY_P2[k]);
      if (i2 >= 0) p2Held.splice(i2, 1);
      return;
    }
    if (COD_P2_ATK.indexOf(e.code) >= 0){ p2ReleaseAtk(); return; }
  }
  if (k === ' ' || k === 'j') releaseAtk();                   // soltar dispara o giro carregado
  const d = KEYMAP[k];
  if (onlineConvidado()){                                     // e solta a tecla no canal do sapo
    const j2 = p2Held.indexOf(d);
    if (j2 >= 0) p2Held.splice(j2, 1);
    return;
  }
  const i = held.indexOf(d);
  if (i >= 0) held.splice(i, 1);
});
function setZoom(z){
  zoom = Math.max(2, Math.min(6, z)); fitBuffer();
  const s = document.getElementById('zSlider');
  if (s && +s.value !== zoom) s.value = zoom;
}
document.getElementById('zSlider').addEventListener('input', e => setZoom(+e.target.value));
addEventListener('wheel', e => setZoom(zoom - Math.sign(e.deltaY)), { passive: true });
addEventListener('contextmenu', e => e.preventDefault());
let touchDir = null, tsx = 0, tsy = 0, tOn = false;
let lastPtrAt = 0, lastPtrX = 0, lastPtrY = 0;
cv.addEventListener('pointerdown', e => {
  const nowMs = performance.now();                            // toque duplo na tela = dash
  if (nowMs - lastPtrAt < 300 && Math.hypot(e.clientX - lastPtrX, e.clientY - lastPtrY) < 36){
    if (onlineConvidado()){ p2WantDash = true; p2TapDir = player2.dir; }
    else { wantDash = true; lastTapDir = w2s(player.dir); }   // dispara na direção encarada
  }
  lastPtrAt = nowMs; lastPtrX = e.clientX; lastPtrY = e.clientY;
  tOn = true; tsx = e.clientX; tsy = e.clientY; cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (!tOn) return;
  const dx = e.clientX - tsx, dy = e.clientY - tsy;
  if (Math.hypot(dx, dy) < 18){ touchDir = null; return; }
  const nd = dx >= 0 ? (dy >= 0 ? 0 : 3) : (dy >= 0 ? 1 : 2);   // as mesmas 4 do teclado e do controle
  if (nd !== touchDir){ if (onlineConvidado()) querP2(nd); else querPasso(nd); }   // mudar o arrasto é um toque
  touchDir = nd;
});
const endT = () => { tOn = false; touchDir = null; };
cv.addEventListener('pointerup', endT);
cv.addEventListener('pointercancel', endT);
// No isométrico as 4 direções do mundo aparecem como as 4 DIAGONAIS da tela:
//   0 = ↘ · 1 = ↙ · 2 = ↖ · 3 = ↗
// O passo é sempre de UM tile numa dessas quatro. Já tentamos deixar andar em diagonal
// do tabuleiro (dois eixos de uma vez, reto na tela) e o jogo perdeu a lógica: a mira e o
// golpe continuam nas 4, então o bicho andava pra um lado e batia pro outro.
const DIR4 = [[.894, .447], [-.894, .447], [-.894, -.447], [.894, -.447]];   // como cada passo aparece na tela
const nearest4 = (vx, vy) => {                                // vetor da tela → a direção mais próxima das 4
  let melhor = -Infinity, bd = 0;
  for (let d2 = 0; d2 < 4; d2++){
    const p2 = vx * DIR4[d2][0] + vy * DIR4[d2][1];
    if (p2 > melhor){ melhor = p2; bd = d2; }
  }
  return bd;
};
const heldDir = () => {
  if (onlineConvidado()) return null;                         // convidado: a tela é do sapo, não do rato
  if (passoQuer !== null) return passoQuer;                   // o último toque do T vence quem está segurado
  if (padDir !== null) return padDir;
  if (touchDir !== null) return touchDir;
  if (held.length) return held[held.length - 1];              // vale a última tecla apertada
  return null;
};

function cycleQuick(d){                                       // L1/R1 passeiam pelos espaços da mochila
  const nmax = invMax();
  quickSlot = ((quickSlot + d) % nmax + nmax) % nmax;
  SFX.ui();
  const it = inv[quickSlot];
  toast(it ? `${quickIcon(it)} ${quickName(it)}` : `🎒 espaço ${quickSlot + 1} vazio`);
  updateHUD();
}
const quickIcon = it => WEAPONS[it] ? '⚔️' : POWERS[it] ? '✨' : CARDS[it] ? '🎁' : '🧪';
const quickName = it => (WEAPONS[it] || POWERS[it] || CARDS[it] || {}).name || pickupMsg(it);
function useQuick(){                                          // aciona o item da mão sem abrir a mochila
  if (anyPanel() || transitioning || pDead()) return;          // `paused` é local do frame: não dá pra ler daqui
  if (quickSlot >= invMax()) quickSlot = 0;
  if (!inv[quickSlot]){ toast('🎒 espaço vazio'); return; }
  onInvClick(quickSlot);
  updateHUD();
}

/* ---------------- CONTROLE DE VIDEOGAME (Gamepad API, layout padrão) ----------------
   O mapeamento padrão é POSICIONAL, então serve pra Xbox e pra Nintendo de uma vez:
   botão de BAIXO (A no Xbox, B no Switch) ataca — segurar carrega o giro
   botão da DIREITA (B no Xbox / A no Switch) liga a stamina
   botão da ESQUERDA (X / Y) solta o poder
   botão de CIMA (Y / X) consome o item da mochila
   gatilhos escavam · o outro par de ombros escolhe o item · Start abre a mochila          */
const ISO_V = [[2, 1], [-2, 1], [-2, -1], [2, -1]];           // como cada direção APARECE na tela (↘ ↙ ↖ ↗)
const PAD_ATK = 0, PAD_STAM = 1, PAD_POW = 2, PAD_ITEM = 3;
const PAD_BAG = [9], PAD_DASH = [6, 7], PAD_PREV = 4, PAD_NEXT = 5;
let padUlt = null;
let padPrev = [], padOn = false, padDir = null;              // padDir: 0..3 resolvido pelo próprio controle
let panelSel = 0, panelWho = '', padNavHeld = false;         // navegação das caixinhas pelo analógico
const painelAberto = () =>                                    // só uma abre por vez; esta é a ordem de prioridade
  askOpen ? 'askPanel' : hellOpen ? 'hellPanel' : upOpen ? 'upPanel' : liftOpen ? 'liftPanel'
  : invOpen ? 'invPanel' : wardOpen ? 'wardPanel' : chestOpen ? 'chestPanel'
  : lanOpen ? 'lanPanel' : charOpen ? 'charPanel' : '';
const painelDono = () =>                                      // de QUEM é a caixinha aberta: quem abriu, manda nela
  invOpen ? (invDono || player) : wardOpen ? (wardDono || player) : chestOpen ? (chestDono || player) : player;
const itensDoPainel = pnl => {                                // tudo que dá pra clicar dentro dela
  const el = document.getElementById(pnl);
  if (!el) return [];
  return [].slice.call(el.querySelectorAll('button, .islot, .cslot'))
    .filter(b2 => b2.offsetParent !== null || b2.getBoundingClientRect === undefined);
};
const fileiraDoPainel = pnl =>                                // quantos itens cabem numa linha (pra cima/baixo pular direito)
  pnl === 'chestPanel' ? 6 : pnl === 'invPanel' ? 4 : pnl === 'wardPanel' ? 5 : 1;
function navegaPainel(pnl, gp, B, hit){                        // o controle passeia por TUDO que dá pra clicar
  const alvos2 = itensDoPainel(pnl);
  if (!alvos2.length) return;
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, db = dpadBotoes(gp, B);
  const vy2 = db[13] ? 1 : db[12] ? -1 : Math.abs(ay) > .5 ? (ay > 0 ? 1 : -1) : 0;
  const vx2 = db[15] ? 1 : db[14] ? -1 : Math.abs(ax) > .5 ? (ax > 0 ? 1 : -1) : 0;
  const passo = vx2 || (vy2 ? vy2 * fileiraDoPainel(pnl) : 0);
  if (passo && !padNavHeld){ panelSel = (panelSel + passo % alvos2.length + alvos2.length) % alvos2.length; SFX.ui(); }
  padNavHeld = !!(vx2 || vy2);
  if (panelSel >= alvos2.length) panelSel = 0;
  alvos2.forEach((b2, i2) => b2.classList.toggle('padSel', i2 === panelSel));
  if (hit(PAD_ATK) || hit(PAD_POW)) alvos2[panelSel].click();  // botão de BAIXO (A) e o do PODER (X) confirmam
  if (hit(PAD_STAM)) fecharPainelAberto();                    // botão da DIREITA (B) nega/fecha
}
function fecharPainelAberto(){
  if (askOpen) closeAsk(); else if (hellOpen) closeHell(); else if (upOpen) closeUp();
  else if (liftOpen) closeLift(); else if (invOpen) closeInv(); else if (wardOpen) closeWard();
  else if (chestOpen) closeChest(); else if (lanOpen) closeLan(); else if (charOpen) closeChar();
}
addEventListener('gamepadconnected', () => {                  // plugou o 2º no meio do jogo: já oferece
  if (!p2On && current && !current.safe) setTimeout(() => varreduraP2(), 400);
});
/* ---------------- DIRECIONAL DO CONTROLE ----------------
   O D-pad era lido como se fosse um analógico (um vetor) e jogado na direção diagonal mais perto.
   Só que as 4 direções do jogo SÃO diagonais na tela: cada seta caía num empate — ↑ virava ↖,
   → e ↓ viravam AMBAS ↘, e o ↗ não saía com seta nenhuma. Agora o direcional é o teclado:
   → ↓ ← ↑ do D-pad são D S A W, e com duas setas apertadas vale a ÚLTIMA que entrou. */
const DPAD_DIR = { 12: 3, 13: 1, 14: 2, 15: 0 };               // ↑ ↓ ← → = W S A D
function dpadBotoes(gp, B){                                    // as 4 setas, venha o direcional como vier
  const b = { 12: !!B[12], 13: !!B[13], 14: !!B[14], 15: !!B[15] };
  /* Controle genérico (mapping fora do 'standard') às vezes entrega o direcional num eixo "hat":
     −1 = ↑ e girando de 2/7 em 2/7 no sentido do relógio; parado fica FORA de [−1, 1]. */
  const h = gp.mapping !== 'standard' ? gp.axes[9] : undefined;
  if (h != null && h >= -1.01 && h <= 1.01){
    const i = Math.round((h + 1) / (2 / 7)) % 8;              // 0 ↑ · 1 ↗ · 2 → · 3 ↘ · 4 ↓ · 5 ↙ · 6 ← · 7 ↖
    if (i === 7 || i <= 1) b[12] = true;
    if (i >= 1 && i <= 3) b[15] = true;
    if (i >= 3 && i <= 5) b[13] = true;
    if (i >= 5 && i <= 7) b[14] = true;
  }
  return b;
}
function dpadDir(pilha, b){                                    // a ÚLTIMA seta apertada manda
  for (const k of [12, 13, 14, 15]){
    const j = pilha.indexOf(k);
    if (b[k] && j < 0) pilha.push(k);
    else if (!b[k] && j >= 0) pilha.splice(j, 1);
  }
  return pilha.length ? DPAD_DIR[pilha[pilha.length - 1]] : null;
}
/* O analógico em 4 SETORES de 90°, alinhados com o mesmo mapa (→ e ↘ = D, ↓ e ↙ = S, ← e ↖ = A,
   ↑ e ↗ = W): sem empate nos eixos, e as quatro direções alcançáveis. */
function stickDir(ax, ay){
  const ang = (Math.atan2(ay, ax) * 180 / Math.PI + 360 + 22.5) % 360;
  return [0, 1, 2, 3][Math.floor(ang / 90)];
}
function vibra(quem, forca){                                   // tranco no controle de quem apanhou
  const pads = padsLigados();
  const gp = quem === player ? (onlineConvidado() ? null : pads[0]) : (onlineConvidado() ? pads[0] : pads[1]);
  const va = gp && gp.vibrationActuator;
  if (!va || !va.playEffect) return;
  const f = Math.min(1, .35 + (forca || 1) * .12);
  try { va.playEffect('dual-rumble', { duration: 90 + (forca || 1) * 25, strongMagnitude: f, weakMagnitude: f * .6 }); } catch (e){}
}
let padPilha = [], padPilha2 = [];
function padsLigados(){                                        // o 1º controle é do rato, o 2º é do sapo
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
  const out = [];
  for (const g2 of navigator.getGamepads()) if (g2 && g2.connected) out.push(g2);
  return out;
}
function pollPad(){
  const gp = padsLigados()[0] || null;
  if (!gp){                                                   // desconectou: solta tudo que o controle segurava
    if (padOn){ padDir = null; padPrev = []; padPilha = []; padOn = false; releaseAtk(); }
    return;
  }
  if (!padOn){ padOn = true; toast('🎮 controle conectado'); }
  /* NA SALA DE OUTRA PESSOA o boneco dele é o SAPO. O único controle plugado aqui é o
     "primeiro", e antes ele ia inteiro pro rato — que não é dele: o sapo ficava parado e o
     dono via um parceiro imóvel. Aqui o controle inteiro passa pro `pollPad2`. */
  if (onlineConvidado()){ padDir = null; padPrev = []; return; }
  const B = gp.buttons.map(b2 => !!b2 && (b2.pressed || b2.value > .5));
  const hit = i => B[i] && !padPrev[i];
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, DZ = .38;
  // o DIRECIONAL manda (é o comando explícito, e o analógico com folga não atropela ele);
  // solto, o analógico escolhe pelo setor de 90° em que foi empurrado.
  const dp = dpadDir(padPilha, dpadBotoes(gp, B));
  padDir = dp !== null ? dp : Math.hypot(ax, ay) > DZ ? stickDir(ax, ay) : null;
  if (padDir !== null && padDir !== padUlt) querPasso(padDir);   // o analógico virou: é um toque novo
  padUlt = padDir;
  // ---- caixinha de escolha aberta: o controle só navega e confirma ----
  // ---- QUALQUER caixinha aberta é navegável no controle: mochila, guarda-roupa, baú, lan… ----
  // Não é só a de sim/não: tudo que o jogo abre tem botão ou casinha clicável, e o controle
  // passa por todos eles em ordem. Esquerda/direita anda de um em um, cima/baixo anda de fileira.
  const pnl = (painelDono() === player2 && padsLigados().length > 1) ? '' : painelAberto();   // caixinha do sapo é do 2º controle
  if (pnl !== panelWho){ panelWho = pnl; panelSel = 0; padNavHeld = false; }
  if (pnl){
    navegaPainel(pnl, gp, B, hit);
    padDir = null; padPrev = B;
    return;
  }
  if (hit(PAD_ATK)) holdAtk();                                // segurar A carrega o giro, soltar dispara
  if (!B[PAD_ATK] && padPrev[PAD_ATK]) releaseAtk();
  if (PAD_DASH.some(hit)){ wantDash = true; lastTapDir = w2s(player.dir); }   // gatilho escava
  if (hit(PAD_POW)) wantSpc = true;
  if (hit(PAD_STAM)) wantStam = true;
  if (hit(PAD_ITEM)) useQuick();                              // Y aciona o item escolhido
  if (hit(PAD_PREV)) cycleQuick(-1);                          // L1/R1 trocam o item da mão
  if (hit(PAD_NEXT)) cycleQuick(1);
  if (PAD_BAG.some(hit)) invOpen ? closeInv() : openInv();
  padPrev = B;
}

/* ---------------- JOGADOR 2: o sapo ----------------
   ENTRAR só com um SEGUNDO CONTROLE plugado — dois jogadores dividindo um teclado é pior que
   jogar sozinho, então nem se oferece. Já EM CAMPO o sapo aceita as duas coisas: o 2º controle
   ou as setas (o P1 fica com o WASD). Atacar em "/" (ou 0 do numérico), escavar em ";" (ou 1).
   Plugar o 2º controle no meio da run já dispara a varredura; a tecla P repete.                */
const KEY_P2 = { arrowright: 0, arrowdown: 1, arrowleft: 2, arrowup: 3 };
// tudo por e.code, pra valer em qualquer layout de teclado (ABNT2 incluso)
const COD_P2_ATK  = ['Slash', 'NumpadDivide', 'Numpad0', 'ShiftRight'];
const COD_P2_DASH = ['Semicolon', 'Numpad1', 'ControlRight'];
const COD_P2_POW  = ['Quote', 'Numpad2'];
const COD_P2_STAM = ['Backslash', 'Numpad3', 'NumpadAdd'];
const COD_P2_BAG  = ['Enter', 'NumpadEnter', 'Numpad5'];
let p2Held = [], p2PadUlt = null;
let p2WantAtk = false, p2WantDash = false, p2WantSpc = false, p2WantStam = false;
let quick2 = 0;                                               // o espaço "na mão" do sapo, igual ao do rato
let p2SpcBuf = 0, p2StamBuf = 0, p2TapDir = -1, p2TapAt = 0;
let p2PadDir = null, p2PadPrev = [];
const p2Dir = () => {
  if (passoQuer2 !== null) return passoQuer2;                // o último toque do T vence quem está segurado
  if (onlineConvidado() && touchDir !== null) return touchDir;   // o arrasto da tela é dele
  return p2PadDir !== null ? p2PadDir : (p2Held.length ? p2Held[p2Held.length - 1] : null);
};
let p2AtkHold = false, p2ChargeT = 0, p2ChargeRdy = false, p2ChargeLock = false, p2ChargeBreakT = 0;
function p2HoldAtk(){                                         // o sapo carrega o giro igual ao rato
  if (p2AtkHold || p2ChargeLock) return;
  /* O aperto viaja de DUAS formas, e precisa das duas. Como ESTADO (`seg`), pra carga seguir o
     dedo mesmo que um pacote se perca. E como EVENTO, porque o estado é lido uma vez por batida
     (50ms) e um toque seco de 40ms começava e terminava DENTRO da batida — o dono nunca via
     `seg` ligado e o golpe simplesmente não acontecia. Era o "botão de ataque não funciona". */
  evSapo |= EV_ATK;
  p2AtkHold = true; p2ChargeT = 0; p2ChargeRdy = false;
  p2WantAtk = true;
  preveGolpeSapo();
}
/* O GOLPE COMEÇA NA HORA, na tela de quem apertou. Medido: do toque até o sapo aparecer batendo
   passavam 233ms — o pedido subia pro dono, o mundo dele resolvia, e o golpe voltava desenhado.
   Dois terços de segundo pra cada troca é o que impede combinar ataque com o parceiro. Então a
   ANIMAÇÃO sai daqui, imediata; a VIDA do bicho continua sendo conta do dono, que é quem manda.
   Quando o golpe de verdade chega pelo fio, `golpePrevisto` já está marcado e ele não toca duas vezes. */
function preveGolpeSapo(){
  if (!cliente() || p2KO() || anyPanel() || transitioning) return;
  if (player2.mode !== 'idle' || player2.cd > 0) return;
  player2.mode = 'attack'; player2.t = 0; player2.struck = false;
  player2.golpePrevisto = true;                               // o eco do dono não repete o golpe
  SFX.swing();
}
function p2ReleaseAtk(){
  p2ChargeLock = false;
  if (!p2AtkHold) return;
  p2AtkHold = false;
  const rdy = p2ChargeRdy;
  p2ChargeT = 0; p2ChargeRdy = false;
  if (rdy && !cliente()) doChargeSpin(player2);       // o giro acontece no mundo do dono e chega desenhado
}
function cycleQuick2(d){                                      // L1/R1 do 2º controle passeiam pela mochila do sapo
  const nmax = invMax2();
  if (cliente()){ evSapo |= d > 0 ? EV_PROX : EV_ANT; SFX.ui(); return; }   // quem troca é o dono
  quick2 = ((quick2 + d) % nmax + nmax) % nmax;
  SFX.ui();
  const it = inv2[quick2];
  toast(it ? `🐸 ${quickIcon(it)} ${quickName(it)}` : `🐸 🎒 espaço ${quick2 + 1} vazio`);
  updateHUD();
}
function useQuick2(){                                         // e o botão de cima aciona o que estiver na mão
  if (anyPanel() || transitioning || p2KO()) return;
  if (quick2 >= invMax2()) quick2 = 0;
  if (!inv2[quick2]){ toast('🐸 🎒 espaço vazio'); return; }
  onInvClick(quick2, player2);
  updateHUD();
}
function pollPad2(){
  const gp = padsLigados()[onlineConvidado() ? 0 : 1];        // na sala do amigo, o 1º controle é o do sapo
  if (!gp){ p2PadDir = null; p2PadPrev = []; padPilha2 = []; return; }
  if (painelAberto()){                                        // caixinha aberta: o 2º controle só navega
    const B2b = gp.buttons.map(b2 => !!b2 && (b2.pressed || b2.value > .5));
    if (painelDono() === player2 || onlineConvidado()) navegaPainel(painelAberto(), gp, B2b, i => B2b[i] && !p2PadPrev[i]);
    p2PadDir = null; p2PadPrev = B2b;
    return;
  }
  const B = gp.buttons.map(b2 => !!b2 && (b2.pressed || b2.value > .5));
  const hit = i => B[i] && !p2PadPrev[i];
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const dp = dpadDir(padPilha2, dpadBotoes(gp, B));           // o mesmo direcional do 1º controle
  p2PadDir = dp !== null ? dp : Math.hypot(ax, ay) > .38 ? stickDir(ax, ay) : null;
  if (p2PadDir !== null && p2PadDir !== p2PadUlt) querP2(p2PadDir);
  p2PadUlt = p2PadDir;
  if (hit(PAD_ATK)) p2HoldAtk();                               // o mesmo mapa POSICIONAL do controle 1
  if (!B[PAD_ATK] && p2PadPrev[PAD_ATK]) p2ReleaseAtk();      // soltar dispara o giro carregado
  if (hit(PAD_POW)) p2WantSpc = true;
  if (hit(PAD_STAM)) p2WantStam = true;
  if (hit(PAD_ITEM)) useQuick2();                             // botão de cima: usa o item da mão
  if (hit(PAD_PREV)) cycleQuick2(-1);                         // L1/R1: escolhe qual
  if (hit(PAD_NEXT)) cycleQuick2(1);
  if (PAD_DASH.some(hit)) p2WantDash = true;
  if (PAD_BAG.some(hit)){ if (invOpen) closeInv(); else openInv(player2); }
  p2PadPrev = B;
}
const ehMesa = () => !(typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1 && innerWidth < 900);
/* A varredura só faz sentido com um SEGUNDO CONTROLE plugado. No teclado os dois dividiriam o
   mesmo teclado, o que é pior do que jogar sozinho — então nem se oferece. */
function varreduraP2(avisa){
  if (p2On || p2Scan > 0 || !ehMesa()) return;
  if (padsLigados().length < 2){
    if (avisa) toast('🎮 conecte um 2º controle pro sapo entrar');
    return;
  }
  p2Scan = 4.5;
  const el = document.getElementById('scan2');
  if (!el) return;
  el.classList.remove('achou');
  el.classList.add('on');
  document.getElementById('scanMsg').innerHTML = emojify('2º 🎮 encontrado — o sapo vem aí');
  SFX.ui();
}
function fecharVarredura(achou){
  p2Scan = 0;
  const el = document.getElementById('scan2');
  if (!el) return;
  el.classList.toggle('achou', !!achou);
  document.getElementById('scanMsg').textContent = achou ? 'jogador 2 na área!' : 'ninguém apareceu — segue sozinho';
  setTimeout(() => el.classList.remove('on'), achou ? 1600 : 1000);
}
/* TELEPORTE DO SAPO — ele muda de lugar sem andar (coleira, troca de andar, entrada em cena).
   Antes isso era um corte seco com um pufinho e o jogador não via o que aconteceu. Agora tem
   as três partes de sempre: SUMIÇO no lugar velho, RASTRO ligando um ponto ao outro (o olho
   acompanha o pulo) e CHEGADA — ele despenca do alto, estica na queda e amassa ao bater. */
const P2TP_T = .42;
let p2TpT = 0;                                                // conta a queda da chegada
function sapoSome(ax, ay){                                    // o lugar velho se fecha num anel de poeira
  rings.push({ x: ax, y: ay, t: 0 });
  puff(ax, ay, 7);
  for (let i = 0; i < 12; i++){
    const an = i / 12 * 6.2832;
    dust.push({ x: ax + Math.cos(an) * 20, y: ay - 10 + Math.sin(an) * 11,
      vx: -Math.cos(an) * 60, vy: -Math.sin(an) * 34 - 40,
      life: .34, kind: 'auraP', ci: '122,224,132', sz: 2 });
  }
}
function sapoRastro(ax, ay, bx, by){                          // pontinhos em arco: de onde saiu pra onde foi
  for (let i = 1; i < 9; i++){
    const t2 = i / 9;
    dust.push({ x: ax + (bx - ax) * t2, y: ay - 14 + (by - ay) * t2 - Math.sin(t2 * 3.1416) * 34,
      vy: -10, life: .28 + t2 * .2, kind: 'auraP', ci: '122,224,132', sz: 2 });
  }
}
function sapoAterrissa(){                                     // o baque da chegada
  const x = gX(player2.x, player2.y), y = gY(player2.x, player2.y);
  rings.push({ x, y, t: 0, soil: true });
  puff(x, y, 8);
  soilBurst(x, y, 6);
  tileQuake(player2.tx, player2.ty);
  shake(2.2, .22);
  SFX.burst();
}
function poeSapoPerto(modo){                                  // o sapo aparece num tile livre do lado do rato
  const ax = gX(player2.x, player2.y), ay = gY(player2.x, player2.y);
  const salta = modo !== 'nasce' && p2On;                     // 'nasce' = entrou em cena / trocou de andar
  const volta = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [0, 2], [-2, 0], [0, -2]];
  let posto = false;
  for (const [dx, dy] of volta){
    const x = player.tx + dx, y = player.ty + dy;
    if (current.free(x, y) && !occupied(x, y, player2)){
      player2.tx = player2.x = x; player2.ty = player2.y = y;
      posto = true;
      break;
    }
  }
  if (!posto){ player2.tx = player2.x = player.tx; player2.ty = player2.y = player.ty; }
  player2.mode = 'idle'; player2.t = 0; player2.from = null; player2.to = null;
  if (salta){
    sapoSome(ax, ay);
    sapoRastro(ax, ay, gX(player2.x, player2.y), gY(player2.x, player2.y));
    SFX.whiff();
  }
  p2TpT = P2TP_T;                                             // sempre cai do alto: a chegada é a parte que se lê
  player2.invuln = Math.max(player2.invuln, .5);
}
/* ================= ONLINE: sala de 4 letras, pelo link da porta =================
   Nada de conta, nada de cadastro: quem abrir o link do servidor entra numa sala e joga. O canal
   é um WebSocket no MESMO endereço que serviu a página (`dev/relay.py`, o mesmo relay que já
   rodava o Rainbow Pong): manda `{t:'sala', codigo}` pra entrar e o servidor repassa cru tudo o
   mais pra quem estiver na mesma sala.
   Quem CRIA é o rato e é dono do mundo — sorteia a semente do andar e manda o estado dos bichos.
   Quem ENTRA é o sapo e recebe o mundo pronto. Aberto em file:// não há servidor: o painel avisa
   e o jogo segue exatamente o de antes.                                                        */
let sala = null;                                              // { codigo, dono } quando conectado
let WS = null, wsEstado = 'desligado', parceiro = false, onlineT = 0, pingT = 0, chaoT = 0;
const onlineOn = () => !!(sala && WS && WS.readyState === 1);
const onlineDono = () => !!(sala && sala.dono);
const onlineConvidado = () => !!(sala && !sala.dono);
/* CENAS INDEPENDENTES (v1.48). Cada jogador anda por onde quiser: o rato pode estar no covil
   enquanto o sapo desce o andar 7. Na MESMA cena o dono continua mandando no mundo e o
   convidado só desenha (`cliente()`); em cenas diferentes (`separados`) cada aparelho simula a
   SUA cena com o SEU boneco, e o boneco do outro fica "fora" — sem corpo, sem alvo, sem desenho.
   O reencontro é por chave de cena: covil, lan, ou o MESMO andar (nível + semente). Quem desce
   pra um nível onde o parceiro já está reaproveita a semente dele, então cai no mesmo andar. */
let separados = false;
const cliente = () => onlineConvidado() && !separados;
const temServidor = () => location.protocol === 'http:' || location.protocol === 'https:';
const codigoNovo = () => {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';                       // sem I nem O: não confunde com 1 e 0
  let c = '';
  for (let i = 0; i < 4; i++) c += L[(Math.random() * L.length) | 0];
  return c;
};

/* ---------------- O RELÓGIO MECÂNICO ----------------------------------------------------
   Jogando sozinho, o mundo anda no tempo do QUADRO: cada tela no seu ritmo e tudo bem. Em
   sala isso é veneno — 60 quadros de um lado e 144 do outro descolam em segundos, e a mesma
   batalha vira duas. Então, dentro da sala, o mundo passa a andar em DENTES fixos de 1/60 s,
   e cada dente é CONTADO. O relógio do DONO é o soberano: ele carimba o número do dente em
   tudo que manda, e o convidado adianta ou atrasa o próprio pêndulo — no máximo um dente por
   quadro — até bater no mesmo número. O ponteiro nunca salta; ele acelera de leve e alcança.
   Quem manda no MUNDO é o dono: bicho, chão e vida saem do relógio dele. O convidado guia o
   sapo (e prevê o passo na hora, pra não ficar pesado) e desenha o resto do que chega.      */
const TICK = 1 / 60;                                          // o dente do relógio
let relTick = 0, relAcc = 0, relAlvo = -1, relAtraso = 0;
function relogio(realDt){                                     // quanto o MUNDO anda neste quadro
  if (!onlineOn()){ relAcc = 0; relAlvo = -1; relAtraso = 0; return realDt; }
  relAcc = Math.min(relAcc + realDt, TICK * 8);               // dívida velha não vira câmera lenta
  let n = Math.min(4, Math.floor(relAcc / TICK));
  relAcc -= n * TICK;
  if (cliente() && relAlvo >= 0){
    relAtraso = relAlvo - (relTick + n);
    if (relAtraso > 40 || relAtraso < -40){ relTick = relAlvo; relAcc = 0; n = 1; }   // a rede voltou: ponteiro na mão
    else if (relAtraso > 1) n++;                              // atrasado: um dente a mais, discreto
    else if (relAtraso < -1 && n > 0) n--;                    // adiantado: segura um dente
  }
  relTick += n;
  return n * TICK;
}

/* ONDE MORA A SALA — este foi O bug que fez o online não funcionar de verdade. O jogo pedia a
   sala em `/ws` na RAIZ do endereço; mas a página não vive necessariamente na raiz. No endereço
   público ela mora em `/rats/`, e ali quem responde é `/rats/ws` — `/ws` dá 404, a ligação cai,
   e o jogador vê "não funciona" sem nenhuma pista. Agora o endereço é DESCOBERTO, em ordem:
     1. do lado da própria página (`/rats/` ➡️ `/rats/ws`) — é o caso do link público;
     2. na raiz (`/ws`) — é o caso de quem abre o relay direto pela porta;
     3. no que estiver escrito em `sala.json`, que o guardião do túnel publica nesta mesma pasta.
   Só depois de alguém atender é que o painel oferece sala: prometer o que não dá pra cumprir foi
   o que tornou o defeito invisível por tanto tempo. `null` = ainda não sei.                    */
let relayOk = null, sondando = false, ENDER = null;
function candidatos(){
  const base = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const dir = location.pathname.replace(/[^/]*$/, '');        // /rats/index.html ➡️ /rats/
  const v = [base + location.host + dir + 'ws'];
  if (dir !== '/') v.push(base + location.host + '/ws');
  return v;
}
function testaWS(url, ok){                                    // bate na porta e diz se alguém atendeu
  let w, respondeu = false;
  const fim = v => { if (respondeu) return; respondeu = true; try { w.close(); } catch (e){} ok(v); };
  try { w = new WebSocket(url); } catch (e){ ok(false); return; }
  const t = setTimeout(() => fim(false), 6000);
  w.onopen = () => { clearTimeout(t); fim(true); };
  w.onerror = () => { clearTimeout(t); fim(false); };
  w.onclose = () => { clearTimeout(t); fim(false); };
}
function sondaRelay(){
  if (relayOk !== null || sondando || !temServidor()) return;
  sondando = true;
  const fila = candidatos();
  const achou = u => { sondando = false; relayOk = true; ENDER = u; renderOnline(); };
  const desisto = () => { sondando = false; relayOk = false; renderOnline(); };
  const proximo = () => {
    if (fila.length){
      const u = fila.shift();
      testaWS(u, ok => ok ? achou(u) : proximo());
      return;
    }
    fetch('./sala.json', { cache: 'no-store' })                // o guardião do túnel escreve aqui
      .then(r => r.json())
      .then(j => { if (!j || !j.ws) throw 0; testaWS(j.ws, ok => ok ? achou(j.ws) : desisto()); })
      .catch(desisto);
  };
  proximo();
}
/* RELIGAR — uma sala não pode acabar porque a rede engasgou. Wi-fi que troca de antena, celular
   que desliga a tela, um segundo de aperto: o fio cai e o certo é voltar pra MESMA sala, com o
   MESMO código, sozinho. Sair de vez só no botão "sair", ou quando nem a primeira ligação pegou
   (aí não há relay nenhum atrás deste endereço). */
let tentativa = 0, religarT = 0, deProposito = false, jaAnunciei = false, tchauEm = 0;
function ligaWS(codigo, dono){
  if (!temServidor()){ wsEstado = 'semservidor'; renderOnline(); return; }
  if (religarT){ clearTimeout(religarT); religarT = 0; }
  deProposito = false;
  try { if (WS) WS.close(); } catch (e){}
  sala = { codigo, dono };
  parceiro = false;
  wsEstado = tentativa ? 'religando' : 'ligando';
  if (!tentativa){ relTick = 0; relAcc = 0; relAlvo = -1; jaAnunciei = false;
    separados = true; ondeOutro = null; ondeMandei = ''; adotou = false; }   // cada um começa na SUA cena
  renderOnline();
  const url = ENDER || candidatos()[0];
  let w, abriu = false;
  try { w = new WebSocket(url); } catch (e){ wsEstado = 'erro'; renderOnline(); return; }
  WS = w;
  w.onopen = () => {
    abriu = true;
    tentativa = 0;                                            // voltou: zera a contagem de tentativas
    wsEstado = 'ligado';
    w.send(JSON.stringify({ t: 'sala', codigo, nome: dono ? 'rato' : 'sapo' }));
    if (!p2On) entrarP2();
    renderOnline();
  };
  /* Sala com o fio partido é uma armadilha: os controles continuam apontando pro sapo, o
     parceiro não vê nada e o jogador fica preso comandando o vazio. Caiu, sai — e o painel
     volta pros dois botões, prontos pra tentar de novo. */
  w.onclose = () => {
    if (WS !== w) return;
    parceiro = false;
    if (deProposito) return;                                  // foi o botão "sair": nada a fazer
    if (!abriu && !tentativa){                                // nem a primeira pegou: não há relay aqui
      relayOk = false;
      toast('🎮 este endereço não tem sala — abra o jogo pelo link da porta');
      sairSala();
      return;
    }
    if (tentativa === 3){ relayOk = null; ENDER = null; sondaRelay(); }   // o endereço pode ter mudado
    if (++tentativa > 8){
      toast('🎮 não consegui voltar pra sala ' + codigo);
      sairSala();
      return;
    }
    wsEstado = 'religando';
    renderOnline();
    religarT = setTimeout(() => { religarT = 0; ligaWS(codigo, dono); },
      Math.min(2500, 250 * tentativa));                       // volta rápido na primeira, com calma depois
  };
  w.onerror = () => { if (WS === w){ wsEstado = 'erro'; renderOnline(); } };
  w.binaryType = 'arraybuffer';                               // o passo viaja em bytes crus
  w.onmessage = ev => {
    if (typeof ev.data !== 'string'){ recebeBin(ev.data); return; }
    rxBytes += ev.data.length;
    let m; try { m = JSON.parse(ev.data); } catch (e){ return; }
    if (m.t === 'oi'){ parceiro = (m.n || 1) > 1; if (parceiro) oiParceiro(); renderOnline(); return; }
    if (m.t === 'par'){                                       // alguém chegou na sala
      parceiro = true;
      if (!p2On) entrarP2();
      if (!jaAnunciei){                                       // religar não vira festa toda vez
        jaAnunciei = true;
        toast('🎮 parceiro conectado!');
        bannerNaFila('EM DUPLA!', '', 2400);
      }
      renderOnline();
      oiParceiro();                                           // quem sou, onde estou — e o retrato, se for a mesma cena
      return;
    }
    if (m.t === 'tchau'){
      parceiro = false;
      separa();                                               // sem parceiro, cada aparelho segue com a sua cena
      cmdSapo = { d: -1, seg: 0, segura: 0, toque: cmdSapo.toque };   // ninguém mais segurando o botão do sapo
      /* Um tranco de rede fazia o relay mandar tchau e o aviso pipocava sem parar. O parceiro
         volta sozinho, então o aviso espera 6s: se ele voltar antes, ninguém precisa saber. */
      if (tchauEm) clearTimeout(tchauEm);
      tchauEm = setTimeout(() => { tchauEm = 0; if (!parceiro) toast('🎮 o parceiro saiu'); }, 6000);
      renderOnline();
      return;
    }
    if (m.t === 'cheia'){ toast('🎮 essa sala já tem dois'); sairSala(); return; }
    if (m.t === 'lotado'){ toast('🎮 servidor cheio'); sairSala(); return; }
    if (m.t === 'eco') return;
    remRx++;
    if (m.t === 'c') aplicaCmd(m);                             // botão apertado no celular do sapo
    if (m.t === 'cena') aplicaCena(m);                         // a porta que o dono atravessou
    if (m.t === 'e'){ if (m.ms != null && cliente()) poeNaFila(m.ms & 0xffffff, () => aplicaEstado(m), false); else aplicaEstado(m); }   // chão, mochila, status: na batida em que mudaram
    if (m.t === 'quero' && !separados) tudoDeNovo();           // o convidado pediu o retrato inteiro
    if (m.t === 'onde') recebeOnde(m);                         // em que cena o parceiro está
    if (m.t === 'cheguei') recebeCheguei(m);                   // o sapo entrou na cena do dono
    if (m.t === 'roupa') recebeRoupa(m);                       // o parceiro trocou de roupa
    if (m.t === 'abre') recebeAbre(m);                         // caixinha do sapo: presente da ratinha, baú
    if (m.t === 'dar') recebeDar(m);                           // item vindo da mochila do parceiro
    if (m.t === 'revive') recebeRevive(m);                     // a pedra arco-íris me chamou
    if (m.t === 'pi'){ mandaWS({ t: 'po', c: m.c }); return; }   // ping do parceiro: devolve na hora
    if (m.t === 'po'){ const r = performance.now() / 1000 - m.c; relRtt = relRtt ? relRtt * .8 + r * .2 : r; return; }
    if (m.t === 'festa') celebraReviveu();                    // a pedra levantou alguém aqui do lado
    if (m.t === 'sf') sapoInfo = { pe: m.pe | 0, ko: m.ko | 0 };
    if (m.t === 'q' && onlineDono()){ cheeseN += m.n | 0; updateHUD(); }   // queijo que o sapo achou sozinho
  };
}
function mandaWS(o){
  if (!onlineOn()) return;
  try { const t = JSON.stringify(o); WS.send(t); txBytes += t.length; } catch (e){}
}

/* ---------------- O FIO: UM PACOTE POR PASSO ----------------------------------------------
   O mundo só muda de casa na batida do COMPASSO (`PASSO_T`), então o fio também só fala na
   batida. Cada aparelho já guarda o andar inteiro — chão, paredes, bichos, a semente que
   gerou tudo — e o que atravessa é só o que o outro lado não tem como saber sozinho:
     · a cada passo, o dono manda a CASA de quem mudou de casa (3 bytes por corpo: x, y e um
       byte com direção, modo, morto e golpe), e a vida de quem mudou de vida. Nada mudou?
       Não sai pacote nenhum. A cada 8 passos vai a foto inteira, pra curar qualquer desvio;
     · o convidado manda o COMANDO do sapo (4 bytes) só quando ele muda — e, enquanto houver
       dedo no botão, repete de 2 em 2 passos pra o dono saber que ainda vale;
     · cena, chão, mochila e status só viajam no dia em que mudam (JSON, raros).
   Tudo binário: sem nome de campo, sem vírgula, sem aspas.                                   */
const PK_PASSO = 1, PK_CMD = 2, PK_FOTO = 3, PK_POS = 4;     // primeiro byte de cada pacote
const ID_RATO = 250, ID_SAPO = 251;                           // os dois jogadores, fora da lista do elenco
const EV_SPC = 1, EV_STAM = 2, EV_DASH = 4, EV_ANT = 8, EV_PROX = 16, EV_ATK = 32;
let evSapo = 0;                                               // eventos juntados desde o último comando
let cmdSapo = { d: -1, seg: 0, segura: 0, toque: 0 };         // o comando do sapo, como o dono o vê
let toqueSapo = 0;                                            // conta os toques de seta do sapo
const MODOS = ['idle', 'hop', 'turn', 'attack', 'hurt', 'dead', 'burrow', 'bump', 'invest'];
const codModo = m => { const i = MODOS.indexOf(m); return i < 0 ? 0 : i; };
const cenaChave = () => current === home ? 'home' : current === SCENES.lanroom ? 'lan' : 'dg';
let txBytes = 0, rxBytes = 0, txHz = 0, rxHz = 0, txB = 0, rxB = 0;   // o painel conta o que passa

function mandaBin(u8){
  if (!onlineOn()) return;
  try { WS.send(u8); txBytes += u8.length; } catch (e){}
}
/* O byte de estado: direção (2 bits) · modo (4 bits) · morto (1) · paridade do golpe (1).
   O golpe vai como PARIDADE e não como modo: um golpe de 0,3s pode começar e acabar entre
   duas batidas, e o modo 'attack' nunca seria visto. A paridade muda — e fica mudada.      */
const byteAtor = (a, morto) => (a.dir & 3) | (codModo(a.mode) << 2) | (morto ? 64 : 0) | ((a.golpes & 1) << 7);
const elenco = () => (current && current.actors) || [];
function atorPorId(i){ return i === ID_RATO ? player : i === ID_SAPO ? player2 : elenco()[i]; }

/* ---- o DONO ---- */
let ultCasa = new Map(), ultVida = new Map(), fotoN = 0;
function casaDe(i){                                           // [casa empacotada, vida] de cada corpo
  const a = atorPorId(i);
  if (i === ID_RATO) return [a.tx | a.ty << 8 | byteAtor(a, pDead()) << 16, Math.max(0, a.hp) | 0];
  if (i === ID_SAPO) return [a.tx | a.ty << 8 | byteAtor(a, p2KO()) << 16, Math.max(0, a.hp) | 0];
  return [a.tx | a.ty << 8 | byteAtor(a, a.dead) << 16, a.dead ? 0 : Math.max(0, a.hp) | 0];
}
function mandaPasso(foto){
  const ids = p2On ? [ID_RATO, ID_SAPO] : [ID_RATO];
  elenco().forEach((a, i) => ids.push(i));
  const mov = [], vid = [];
  for (const i of ids){
    const [c, hp] = casaDe(i);
    if (foto || ultCasa.get(i) !== c){ mov.push(i, c & 255, (c >> 8) & 255, (c >> 16) & 255); ultCasa.set(i, c); }
    if (foto || ultVida.get(i) !== hp){ vid.push(i, (hp >> 8) & 255, hp & 255); ultVida.set(i, hp); }
  }
  /* CARIMBO: os bytes 2 e 3 são a BATIDA do dono em que isto aconteceu. Sai um pacote por
     batida mesmo sem mudança (6 bytes): é o tique do relógio que o convidado usa pra tocar o
     mundo de T em T, sem depender de quando a rede resolve entregar. */
  const u8 = new Uint8Array(10 + mov.length + vid.length), ms = Math.floor(performance.now()) & 0xffffff;
  u8[0] = foto ? PK_FOTO : PK_PASSO;
  u8[1] = cenaSerie & 255;
  u8[2] = (passoN >> 8) & 255; u8[3] = passoN & 255;           // a batida...
  u8[4] = ms >> 16; u8[5] = (ms >> 8) & 255; u8[6] = ms & 255; // ...e o HORÁRIO real do dono, em ms
  u8[7] = sapoSeq;                                             // o último passo do sapo que o dono já engoliu
  u8[8] = mov.length / 4; u8.set(mov, 9);
  u8[9 + mov.length] = vid.length / 3; u8.set(vid, 10 + mov.length);
  mandaBin(u8);
}
/* CENA e ESTADO LENTO — JSON, mas só no dia em que mudam. */
let cenaSerie = 0, cenaUlt = '', estUlt = '', stUlt = null, stIdade = 0;
function chaveCena(){
  return cenaChave() + '|' + (cenaChave() === 'dg'
    ? (current.level || 0) + ':' + (current.semente | 0) + ':' + (current.cursed ? 1 : 0) : '');
}
function mandaCena(){
  mandaWS({ t: 'cena', sr: cenaSerie & 255, c: cenaChave(), nv: current.level || 0,
    s: (current && current.semente) || 0, cu: current.cursed ? 1 : 0, sp: [player.tx, player.ty] });
}
function empacotaChao(){                                      // o que está caído no chão: x, y, nome
  if (!current || !current.pickups) return [];
  const v = [];
  current.pickups.forEach(pk => v.push(pk.x | 0, pk.y | 0, pk.kind));
  return v;
}
function empacotaBolsa(){                                     // a ficha do sapo: o HUD do convidado tem que bater
  return [arma2, poder2 || '', quick2 | 0, cheeseN | 0]
    .concat(inv2.map(i2 => i2 || '')).concat(invN2.map(n2 => n2 | 0));
}
const statusAgora = () => [burnT, frozT, poisT, p2BurnT, p2FrostT, p2PoisT];
function empacotaExtras(){                                    // bicho que nasceu DEPOIS do andar (emboscada do baú)
  const v = [];
  elenco().forEach((a, i) => { if (a.extra != null) v.push(i, a.extra); });
  return v;
}
function mandaEstado(forca){
  const s2 = contaDe('sapo'), qj = cheeseN | 0, pr = !pDead() && inv.indexOf('arcoiris') >= 0 ? 1 : 0, rk = pDead() ? 1 : 0;
  if (separados){                                             // cenas diferentes: só o que é do casal
    const k = 's' + qj + ',' + pr + ',' + rk + ',' + s2.join();
    if (!forca && k === estUlt) return;
    estUlt = k;
    mandaWS({ t: 'e', qj, pr, rk, s2 });
    return;
  }
  /* O status anda sozinho do lado de lá (o convidado conta o próprio relógio). Só vai pelo
     fio quando foge da conta: queimou de novo, curou antes da hora, pegou gelo novo. */
  const st = statusAgora();
  let stMuda = forca || !stUlt;
  if (!stMuda) for (let k = 0; k < 6; k++)
    if (Math.abs(st[k] - Math.max(0, stUlt[k] - stIdade)) > .35) stMuda = true;
  const e = { pk: empacotaChao(), bg: empacotaBolsa(), hm: [player.maxHp | 0, player2.maxHp | 0],
    ex: empacotaExtras(), qj, pr, rk, s2, cs: cardSlot2, u2: [bagUps2, critUps2, stamUps2, hpUps2] };
  const chave = JSON.stringify(e);
  const muda = forca || chave !== estUlt;
  if (!muda && !stMuda) return;                               // nada novo: nada sai
  const o = muda ? e : {};
  if (muda) estUlt = chave;
  if (stMuda){ stUlt = st.slice(); stIdade = 0; o.st = st.map(x => Math.round(x * 10) / 10); }
  o.t = 'e'; o.ms = Math.floor(performance.now()) & 0xffffff;   // carimbo: entra na fila do convidado no instante certo
  mandaWS(o);
}
function confereCena(){                                       // atravessou a porta? a sala vai junto
  if (chaveCena() === cenaUlt) return;
  cenaUlt = chaveCena(); cenaSerie = (cenaSerie + 1) & 255;
  ultCasa.clear(); ultVida.clear();
  mandaCena();
}
function tudoDeNovo(){                                        // parceiro chegou (ou voltou): o retrato inteiro
  if (!onlineDono()) return;
  if (chaveCena() === cenaUlt) mandaCena(); else confereCena();
  mandaEstado(true); mandaPasso(true);
}

/* ---- o CONVIDADO ---- */
let ultCmd = '', cmdIdade = 0;
function mandaComando(){                                      // convidado ➡️ dono: SÓ o comando, nada de posição
  const hd2 = p2Dir();
  const d = hd2 == null ? -1 : s2w(hd2);
  const segura = (p2PadDir !== null || p2Held.length > 0 || touchDir !== null) ? 1 : 0;
  const seg = p2AtkHold ? 1 : 0;
  const chave = d + ',' + seg + ',' + segura + ',' + toqueSapo;
  const vivo = d >= 0 || seg;                                 // dedo em cima: o dono precisa ouvir que ainda vale
  if (!evSapo && chave === ultCmd && !(vivo && cmdIdade >= 2)) return;
  ultCmd = chave; cmdIdade = 0;
  const tq = relAmostras.length && toqueEm > 0 ? Math.floor(toqueEm * 1000) & 0xffffff : 0;   // QUANDO o dedo apertou, no relógio do dono
  mandaBin(new Uint8Array([PK_CMD, (d + 1) | seg << 3 | segura << 4, evSapo & 255, toqueSapo & 255, sapoQuerW + 1,
    tq >> 16, (tq >> 8) & 255, tq & 255]));
  evSapo = 0;
}
function aplicaComando(u8){
  if (!onlineDono() || u8.length < 4) return;
  const toque = u8[3];
  if (u8.length > 4 && toque !== cmdSapo.toque && u8[4] > 0){
    remQuer = u8[4] - 1; remQuerT = QUER_T;
    /* COMPENSAÇÃO DE LATÊNCIA: o carimbo diz em que instante do MEU mundo o parceiro apertou. Se
       foi antes da última batida e o pulo dela ainda é novinho, a curva vale pra ela — como se a
       rede não existisse. Até 150ms; mais que isso, vale a batida seguinte, como sempre. */
    let graca = GRACA;
    const tq = u8.length >= 8 ? u8[5] << 16 | u8[6] << 8 | u8[7] : 0;
    if (tq){
      const agoraMs = performance.now();
      let dq = (tq - (Math.floor(agoraMs) & 0xffffff)) & 0xffffff; if (dq > 0x800000) dq -= 0x1000000;
      const quando = agoraMs + dq;                             // o aperto, no MEU relógio
      if (quando <= batidaMs + 10 && agoraMs - quando < 400) graca = .15;   // apertou ANTES da minha última batida
    }
    if (!separados && curvaAtrasada(player2, remQuer, graca)) remQuer = null;
  }   // toque novo: vale na próxima batida
  cmdSapo = { d: (u8[1] & 7) - 1, seg: (u8[1] >> 3) & 1, segura: (u8[1] >> 4) & 1, toque };
  remT = cmdSapo.d >= 0 || cmdSapo.seg ? 1.2 : 0;             // sem notícia por 1,2s o sapo para
  /* Segurar/soltar o ataque viaja como ESTADO, não como evento: um pacote perdido deixaria o
     sapo carregando pra sempre (ou nunca soltando o giro). Aqui a carga simplesmente segue o
     dedo do parceiro. */
  if (cmdSapo.seg && !p2AtkHold) p2HoldAtk();
  if (!cmdSapo.seg){
    /* DEDO FORA DO BOTÃO. Zerar a trava aqui é o que salva a língua: quando o sapo apanha no
       meio da carga, o `applyHit` liga `p2ChargeLock` pra obrigar a soltar e apertar de novo —
       e quem solta é o dedo do parceiro, do outro lado do mundo. Sem esta linha a trava ficava
       ligada pra sempre no mundo do dono e o sapo NUNCA mais atacava no resto da run. */
    p2ChargeLock = false;
    if (p2AtkHold) p2ReleaseAtk();
  }
  const ev = u8[2];                                           // os apertos secos vêm somados: nenhum se perde
  if (ev & EV_ATK) p2WantAtk = true;                          // toque curto: chega como evento, não se perde
  if (ev & EV_SPC) p2WantSpc = true;
  if (ev & EV_STAM) p2WantStam = true;
  if ((ev & EV_DASH) && !posRemota){ p2WantDash = true; p2TapDir = -1; }   // com previsão, a escavação chega pronta
  if (ev & EV_ANT) cycleQuick2(-1);
  if (ev & EV_PROX) cycleQuick2(1);
}
/* A direção que o sapo do dono usa NESTA batida: o último TOQUE que chegou do parceiro neste T
   (`remQuer`, gasto quando vira passo) e, sem toque novo, a seta que ele ainda segura. */
function dirSapoRemoto(){
  if (remQuer !== null) return remQuer;
  if (cmdSapo.d >= 0 && cmdSapo.segura) return cmdSapo.d;
  return null;
}
/* ---- PREVISÃO DO SAPO ----
   Antes o sapo do convidado só andava quando o comando ia até o dono, esperava a batida dele e a
   casa nova voltava pelo fio (e pela fila de reprodução): ~580ms entre apertar e ver o próprio
   boneco sair do lugar, numa rede de celular. Agora o convidado ANDA NA HORA (na batida dele,
   alinhada com a do dono) e manda a casa: [PK_POS, x, y, dir|modo<<2, seq]. O dono aceita se o
   passo for possível no mundo dele; se não, o `ack` do pacote do passo devolve a casa certa. */
let seqSapo = 0, ackSapo = 0, sapoSeq = 0, posRemota = false;
function mandaPos(a, modo){
  seqSapo = (seqSapo + 1) & 255;
  mandaBin(new Uint8Array([PK_POS, a.tx, a.ty, (a.dir & 3) | (modo << 2), seqSapo]));
}
function aplicaPos(u8){                                       // dono: o passo que o parceiro já deu na tela dele
  if (!onlineDono() || separados || u8.length < 5) return;
  posRemota = true;
  sapoSeq = u8[4];
  ultCasa.delete(ID_SAPO);                                    // aceito ou não, a casa vai junto do ack no próximo pacote
  const a = player2, x = u8[1], y = u8[2], d = u8[3] & 3, modo = u8[3] >> 2;
  if (a.fora || p2KO() || transitioning || a.mode === 'hurt') return;   // queda/empurrão daqui vale: o ack corrige lá
  if (x === a.tx && y === a.ty){ a.dir = d; return; }
  if (a.mode === 'hop' || a.mode === 'turn' || a.mode === 'bump'){ a.x = a.tx; a.y = a.ty; a.mode = 'idle'; a.t = 0; }
  if (a.mode !== 'idle') return;
  const dx = x - a.tx, dy = y - a.ty, dist = Math.abs(dx) + Math.abs(dy);
  if (modo === 1){                                            // escavação: o mesmo mergulho, daqui
    if (dx && dy) return;
    doDash(d, a);
    return;
  }
  if (dist !== 1 || !canWalk(x, y, a)) return;
  a.dir = d; a.mode = 'hop'; a.t = 0; a.chain = false; a.passoN = passoN;
  a.from = [a.tx, a.ty]; a.to = [x, y]; a.tx = x; a.ty = y;
  const resta = PASSO_T - passoAcc - 1 / 30;                  // pousa junto da MINHA próxima batida
  a.hopFit = resta > .12 ? resta : cabeNoPasso(a.hopS);
  trailAdd(a.from[0], a.from[1]);
  if (B2.iceTrail > 0) addIce(a.from[0], a.from[1]);
  puff(gX(a.from[0], a.from[1]), gY(a.from[0], a.from[1]), 2);
}
function mandaCmd(k, v){                                      // caixinha aberta: coisa rara, vai fora da batida
  if (onlineConvidado()) mandaWS({ t: 'c', k, v });           // juntos ou separados: o que é do casal mora no dono
}
function aplicaCmd(m){
  if (!onlineDono()) return;
  const v = m.v;
  if (m.k === 'inv') onInvClick(v | 0, player2);
  else if (m.k === 'drop') discardItem(v | 0, player2);
  else if (m.k === 'dar') darItem(v | 0, player2);
  else if (m.k === 'deposita'){ upEsperando = false; checkDeposit(player2, true); }
  else if (m.k === 'up'){                                     // o sapo escolheu (ou fechou) o presente na tela dele
    upEsperando = false;
    if (v && v.k){ upAlvo = v.a === 'rato' ? 'rato' : 'sapo'; grantUp(v.k); }
    else upDismissed2 = true;
  }
  else if (m.k === 'bau') mandaBau(true);
  else if (m.k === 'bauTiraJ'){ tiraDoBau(v | 0, player2); mandaBau(false); }
  else if (m.k === 'bauTira'){                                // separados: o item atravessa o fio
    const i = v | 0, it = chestItems[i]; if (!it) return;
    if (chestN[i] > 1) chestN[i]--; else { chestItems[i] = null; chestN[i] = 0; }
    mandaWS({ t: 'dar', it, volta: 1, bau: 1 });
    if (chestOpen) renderChest();
    mandaBau(false);
  }
  else if (m.k === 'bauPoe'){
    if (!poeNoBau(v)) mandaWS({ t: 'dar', it: v, volta: 1 });
    if (chestOpen) renderChest();
    mandaBau(false);
  }
  else if (m.k === 'bauPoeJ'){ const d0 = chestDono; chestDono = player2; invToChest(v | 0); chestDono = d0; if (chestOpen) renderChest(); mandaBau(false); }
}

/* ---------------- O PASSO QUE VEIO DO FIO ----------------
   O corpo daqui não pensa: chega a casa onde ele está do lado de lá, e ele dá o MESMO pulo
   que o de lá deu — com a mesma duração encaixada no passo, poeira e som. Como o dono só
   muda casas na batida, o pulo daqui começa um atraso de rede depois e termina antes da
   próxima batida chegar: as duas telas mostram o mesmo compasso, só deslocado. */
function tomaCtl(a){                                          // o golpe que chegou pelo fio, consumido uma vez
  if (!a.remCtl || a.mode !== 'idle') return {};
  const c = a.remCtl; a.remCtl = null; return c;
}
function poeCasa(a, i, x, y, fl){
  const d = fl & 3, m = MODOS[(fl >> 2) & 15] || 'idle', morto = !!(fl & 64), golpe = (fl >> 7) & 1;
  if (a.golpeVisto == null) a.golpeVisto = golpe;
  if (golpe !== a.golpeVisto){                                // um golpe novo lá: toca aqui
    a.golpeVisto = golpe;
    if (a.golpePrevisto) a.golpePrevisto = false;             // o sapo já bateu na hora, na tela de quem apertou
    else a.remCtl = { attack: true };
  }
  if (i === ID_SAPO){                                         // sapo caído / de pé
    if (morto && player2.mode !== 'dead'){
      player2.mode = 'dead'; player2.t = 0; p2Down = 0; SFX.die(); avisoSapoCaiu();
      return;
    }
    if (!morto && player2.mode === 'dead'){ player2.mode = 'idle'; player2.t = 0; player2.dead = false; }
    /* PREVISÃO: o sapo daqui anda NA HORA, pela mão de quem joga. A casa que o dono manda só vale
       quando ele já engoliu o último passo daqui (ack = seq) e mesmo assim discorda — passo
       recusado (casa ocupada lá) ou empurrão de golpe. Aí o sapo é corrigido pra casa do dono. */
    if (ackSapo !== seqSapo) return;
    if (x === a.tx && y === a.ty) return;
    if (a.mode === 'hop' && a.passoN === passoN && a.t < .1) return;   // acabou de sair daqui: o ack é do passo de antes
  } else if (i !== ID_RATO && morto){
    if (!a.dead) matarRemoto(a);
    return;
  }
  if (x === a.tx && y === a.ty){
    if (a.mode === 'idle' && a.dir !== d) a.dir = d;
    return;
  }
  const dist = Math.abs(x - a.tx) + Math.abs(y - a.ty);
  if (dist > 4 || a.mode === 'dead'){                         // escada, teleporte, renascer: ponteiro na mão
    a.tx = a.x = x; a.ty = a.y = y; a.dir = d;
    if (a.mode !== 'dead'){ a.mode = 'idle'; a.t = 0; }
    a.from = null; a.to = null;
    return;
  }
  /* CURVA ATRASADA lá no dono: o pulo que acabou de sair muda de casa, mas continua do mesmo lugar. */
  if (a.mode === 'hop' && a.from && a.t < .15 && Math.abs(x - a.from[0]) + Math.abs(y - a.from[1]) === 1){
    a.tx = x; a.ty = y; a.to = [x, y]; a.dir = d;
    return;
  }
  /* Ainda no fim do pulo anterior? A batida nova já chegou: termina na hora e emenda. */
  a.x = a.tx; a.y = a.ty;
  a.from = [a.tx, a.ty]; a.to = [x, y];
  a.tx = x; a.ty = y; a.dir = d; a.t = 0;
  if (m === 'burrow'){ a.mode = 'burrow'; a.sink = 0; a.bhit = {}; }
  else if (m === 'invest'){ a.mode = 'invest'; a.investT = a.investT || .42; }
  else if (m === 'hurt'){ a.mode = 'hurt'; }
  /* FOLGA DE REDE: o pulo que veio pelo fio termina 60ms antes da batida. Pacote chegando um
     pouco adiantado (wi-fi oscila) não corta mais o pulo no meio — era o "tranquinho". */
  else { a.mode = 'hop'; a.chain = false; a.hopFit = dist > 1 ? .45 : Math.max(.12, cabeNoPasso(a.hopS) - .02); }
}
function vidaDe(a, i, hp){
  if (i === ID_RATO){
    if (hp <= 0 && player.mode !== 'dead' && !player.dead){ player.hp = 0; player.mode = 'dead'; player.t = 0; SFX.die(); }
    else if (hp > 0){ if (player.mode === 'dead') player.mode = 'idle'; player.dead = false; }
    player.hp = hp;
    return;
  }
  if (i === ID_SAPO){
    if (hp < player2.hp && !p2KO()) player2.flash = .16;
    player2.hp = hp;
    return;
  }
  a.hp = hp;
  if (hp <= 0 && !a.dead) matarRemoto(a);
}
let cenaVem = null, cenaOk = -1;                              // a cena que o dono mandou, e a que já está montada aqui
function aplicaPasso(u8){
  if (!cliente() || u8.length < 10) return;
  if (cenaOk !== u8[1]) return;                               // ainda atravessando a porta: a foto chega depois
  ackSapo = u8[7];
  const nm = u8[8];
  let o = 9;
  for (let k = 0; k < nm && o + 3 < u8.length; k++, o += 4){
    const i = u8[o], a = atorPorId(i);
    if (a) poeCasa(a, i, u8[o + 1], u8[o + 2], u8[o + 3]);
  }
  const nv = u8[o++] | 0;
  for (let k = 0; k < nv && o + 2 < u8.length; k++, o += 3){
    const i = u8[o], a = atorPorId(i);
    if (a) vidaDe(a, i, u8[o + 1] << 8 | u8[o + 2]);
  }
  pedeHud();
}
function aplicaCena(m){
  if (!onlineConvidado()) return;
  /* A PORTA NÃO É MAIS DO DONO: cada um atravessa a sua. A cena do dono só vale aqui se for a
     MESMA em que eu estou — aí o convidado volta a ser tela do mundo dele. */
  const dele = m.c + '|' + (m.c === 'dg' ? (m.nv | 0) + ':' + (m.s | 0) + ':' + (m.cu | 0) : '');
  if (dele !== chaveCena() || transitioning) return;
  if (separados){ separados = false; juntaT = 0; ausentes(); filaRede.length = 0; }
  cenaOk = m.sr;
}
function aplicaEstado(m){
  if (!onlineConvidado()) return;
  if (m.qj != null) cheeseN = m.qj | 0;
  if (m.rk != null) ratoInfo = { pe: m.pr | 0, ko: m.rk | 0 };
  if (Array.isArray(m.s2)){ conta('sapo'); [stash, upGoal, upPend, upsDone] = m.s2; refreshUpReady(); }   // a conta da sapinha
  if (separados){ pedeHud(); return; }                       // a mochila e o chão daqui são MEUS agora
  if (m.cs) cardSlot2 = m.cs;
  if (m.u2){ bagUps2 = m.u2[0] | 0; critUps2 = m.u2[1] | 0; stamUps2 = m.u2[2] | 0; hpUps2 = m.u2[3] | 0; }
  if (Array.isArray(m.ex)) for (let k = 0; k + 1 < m.ex.length; k += 2) criaExtra(m.ex[k], m.ex[k + 1]);
  if (Array.isArray(m.hm)){ if (m.hm[0] > 0) player.maxHp = m.hm[0]; if (m.hm[1] > 0) player2.maxHp = m.hm[1]; }
  if (Array.isArray(m.st)) aplicaStatus(m.st);
  if (Array.isArray(m.pk) && current && current.pickups) aplicaChao(m.pk);
  if (Array.isArray(m.bg)) aplicaBolsa(m.bg);
  pedeHud();
}
function criaExtra(i, f){                                     // o bicho da emboscada nasce aqui também
  const L = elenco(), F = FOES[f];
  if (!F || L[i] || i !== L.length) return;
  L.push(makeActor(0, 0, F.skin, { hostile: true, hp: F.hp, maxHp: F.hp, dmg: F.dmg,
    hopS: F.hopS, atkS: F.atkS, range: F.range, dir: 0, alerted: true, frost: !!F.frost, venom: !!F.venom }));
  L[i].extra = f;
}
let hudChave = '';
function pedeHud(){
  /* `updateHUD` reescreve a fileira inteira de espaços: só chamo quando o que ele MOSTRA mudou. */
  const chave = [player.hp, player.maxHp, player2.hp, player2.maxHp, cheeseN, estUlt.length, inv2.join(), invN2.join()].join(',');
  if (chave !== hudChave){ hudChave = chave; updateHUD(); }
}
function matarRemoto(a){                                      // o bicho cai aqui só de fachada: o espólio é do dono
  a.dead = true; a.hp = 0;
  soaEm(a.tx, a.ty, SFX.kill);
  puff(gX(a.tx, a.ty), gY(a.tx, a.ty), 8);
}
function aplicaStatus(v){                                     // fogo/gelo/veneno chegam prontos: eu só acendo o letreiro
  const antes = [burnT, frozT, poisT, p2BurnT, p2FrostT, p2PoisT];
  burnT = v[0]; frozT = v[1]; poisT = v[2];
  p2BurnT = v[3]; p2FrostT = v[4]; p2PoisT = v[5];
  if (burnT > 0 && antes[0] <= 0) bannerNaFila('QUEIMANDO!', 'fogo', 1700);
  else if (frozT > 0 && antes[1] <= 0) bannerNaFila('CONGELADO!', 'frio', 1700);
  else if (poisT > 0 && antes[2] <= 0) bannerNaFila('ENVENENADO!', 'lodo', 1700);
  if (p2BurnT > 0 && antes[3] <= 0) toast('🐸 🔥 queimando!');
  else if (p2FrostT > 0 && antes[4] <= 0) toast('🐸 ❄️ −25% · 4s');
  else if (p2PoisT > 0 && antes[5] <= 0) toast('🐸 ☠️ veneno!');
}
function aplicaChao(v){                                       // o chão é do dono, inteirinho
  current.pickups.length = 0;
  for (let i = 0; i + 2 < v.length; i += 3)
    current.pickups.push({ x: v[i], y: v[i + 1], kind: v[i + 2] });
}
function aplicaBolsa(v){                                      // a ficha do sapo vem inteira do dono
  if (v.length < 4) return;
  if (v[0]) arma2 = v[0];
  poder2 = v[1] || null;
  quick2 = v[2] | 0;
  cheeseN = v[3] | 0;
  const n = (v.length - 4) / 2 | 0;
  for (let i = 0; i < n && i < inv2.length; i++){ inv2[i] = v[4 + i] || null; invN2[i] = v[4 + n + i] | 0; }
}
function recebeBin(buf){
  const u8 = new Uint8Array(buf);
  rxBytes += u8.length; remRx++;
  if (u8[0] === PK_CMD) aplicaComando(u8);
  else if (u8[0] === PK_POS) aplicaPos(u8);
  else if (u8[0] === PK_PASSO || u8[0] === PK_FOTO){
    if (u8.length < 10) return;
    poeNaFila(u8[4] << 16 | u8[5] << 8 | u8[6], () => aplicaPasso(u8), true);
  }
}
/* ================= O RELÓGIO DO CONVIDADO: FILA DE REPRODUÇÃO =================
   O que chega do dono vem CARIMBADO com o horário dele (ms). Nada é aplicado na hora em que
   CHEGA — a rede entrega em rajadas, e aplicar na chegada fazia o mundo andar aos trancos. Cada
   coisa vai pra uma fila e é tocada no instante `carimbo + base + folga`:
     · base  = o menor (chegada − carimbo) dos últimos pacotes: diferença dos relógios + o caminho
       mais rápido da rede;
     · folga = quanto a rede costuma se atrasar além disso (p90 da oscilação + 20ms).
   O carimbo é o HORÁRIO e não o número da batida porque o mundo do dono não bate T exato em tempo
   real: o tranco do golpe (hitstop) estica a batida. Com o horário, o convidado reproduz a cadência
   EXATA do dono — de T em T, trancos inclusos — só que atrasada de um valor fixo e pequeno. */
const filaRede = [];
let relMs = -1, relAmostras = [], relBase = 0, relFolga = .08, relRtt = 0, relTarde = 0;
function msDono(raw){                                         // desenrola o carimbo de 24 bits
  if (relMs < 0) return (relMs = raw);
  let d = (raw - (relMs & 0xffffff)) & 0xffffff;
  if (d > 0x800000) d -= 0x1000000;
  const m = relMs + d;
  if (m > relMs) relMs = m;
  return m;
}
function poeNaFila(raw, fn, amostra){
  const t = msDono(raw) / 1000, agora = performance.now() / 1000;
  if (amostra){
    const off = agora - t;
    if (relAmostras.length && off - relBase > 1.5) relAmostras.length = 0;  // a rede caiu e voltou: refaz o relógio
    relAmostras.push(off);
    if (relAmostras.length > 40) relAmostras.shift();
    const ord = relAmostras.slice().sort((a, b) => a - b);
    relBase = ord[0];
    relFolga = Math.max(.03, Math.min(.25, ord[Math.floor(ord.length * .9)] - relBase + .02));
    /* A MINHA BATIDA NA BATIDA DO DONO: o pacote do passo sai na batida dele; no relógio daqui
       ela foi em t + base − meia volta. Puxo o meu compasso um quarto do erro por pacote. */
    if (relRtt > 0 && cliente()){
      const fase = ((agora - (t + relBase - relRtt / 2)) % PASSO_T + PASSO_T) % PASSO_T;
      let e = passoAcc - fase;
      if (e > PASSO_T / 2) e -= PASSO_T; else if (e < -PASSO_T / 2) e += PASSO_T;
      passoAcc = Math.max(0, passoAcc - e * .25);
    }
  }
  const k = t;
  const at = relAmostras.length ? t + relBase + relFolga : agora;
  if (at < agora - .001) relTarde++;
  let i = filaRede.length;                                    // a fila fica em ordem de carimbo
  while (i > 0 && filaRede[i - 1].k > k) i--;
  filaRede.splice(i, 0, { k, at, fn });
}
function tocaFila(){                                          // uma vez por quadro: o que já é hora, toca
  const agora = performance.now() / 1000;
  while (filaRede.length && filaRede[0].at <= agora) filaRede.shift().fn();
  if (filaRede.length > 40) filaRede.splice(0, filaRede.length - 40).forEach(x => x.fn());   // aba dormiu: não acumula
}
/* O horário do dono AGORA, no relógio daqui (s): tira a diferença dos relógios, soma meia volta do ping. */
const msDonoAgora = () => performance.now() / 1000 - relBase + relRtt / 2;
let remRx = 0, remHz = 0, remSeg = 1, remT = 0;               // pacotes que chegam por segundo
/* Chamado no FIM do quadro, depois que todo mundo andou: o que saiu na batida já está na casa nova. */
function fimDoPasso(){
  if (!onlineOn() || !batePasso) return;
  if (onlineDono()){
    if (!parceiro) return;
    if (separados){ mandaEstado(false); return; }             // cada um na sua cena: só o que é do casal
    confereCena();
    mandaEstado(false);
    mandaPasso(++fotoN % 8 === 0);
  } else if (cliente()){
    cmdIdade++;
    mandaComando();
  }
}
function passoOnline(rawDt){
  if (!onlineOn()) return;
  if (remT > 0){ remT = Math.max(0, remT - rawDt); if (remT === 0) cmdSapo = { d: -1, seg: 0, segura: 0, toque: cmdSapo.toque }; }
  stIdade += rawDt;
  passoSala(rawDt);
  if (cliente()) tocaFila(); else if (filaRede.length) filaRede.length = 0;
  /* O comando do sapo sai NA HORA em que muda (seta, toque, botão) — não espera a batida
     daqui: chega no dono o quanto antes, e ele usa o último que tiver na batida DELE. */
  if (cliente()) mandaComando();
  remSeg -= rawDt;
  if (remSeg <= 0){
    remSeg = 1; remHz = remRx; remRx = 0;
    txB = txBytes; rxB = rxBytes; txBytes = 0; rxBytes = 0;
    if (onOpen) renderOnline();                               // painel aberto: o número anda sozinho
  }
}
/* O ping NÃO pode depender do laço do jogo: aba no fundo (ou celular de tela apagada) congela o
   `requestAnimationFrame`, o ping some, e o relay expulsa como fantasma alguém que só trocou de
   app por meio minuto. `setInterval` continua batendo mesmo estrangulado pelo navegador. */
setInterval(() => { if (onlineOn()) mandaWS({ t: 'ping' }); }, 3000);
setInterval(() => { if (onlineOn() && parceiro) mandaWS({ t: 'pi', c: performance.now() / 1000 }); }, 2000);   // ping até o PARCEIRO
function hudOnline(){                                         // cada aparelho mostra UMA barra: a tela é do dono dela
  document.body.classList.toggle('onRato', !!sala && !!sala.dono);
  document.body.classList.toggle('onSapo', !!sala && !sala.dono);
}

/* ================= CENAS INDEPENDENTES · REENCONTRO · TROCA · PEDRA ARCO-ÍRIS =================
   `onde`: cada aparelho conta em que cena está, só quando muda. Juntos na mesma cena o dono
   simula tudo; separados cada um simula a sua. O REENCONTRO é pedido pelo convidado: quando a
   chave da cena dele bate com a do dono, ele manda `cheguei` com a ficha do sapo (e, se o dono
   é quem chegou depois, o retrato do andar) — o dono encaixa o sapo, e a partir dali volta a
   ser o mundo dos dois. */
let bestLvPar = 0;                                            // o andar mais fundo do PARCEIRO nesta sala
let ondeOutro = null, ondeMandei = '', ondeT = 0, juntaT = 0, adotou = false, reviveEm = null;
let sapoInfo = { pe: 0, ko: 0 }, ratoInfo = { pe: 0, ko: 0 }, sfUlt = '';
let avisouPedra = false, avisouPedra2 = false;
const PEDRA_ESPERA = 25;                                      // segundos que o caído espera o parceiro usar a pedra
const chaveDe = d => d === home ? 'home|' : d === SCENES.lanroom ? 'lan|'
  : 'dg|' + (d.level || 0) + ':' + (d.semente | 0) + ':' + (d.cursed ? 1 : 0);
function separa(){                                            // alguém atravessou uma porta sozinho
  if (separados) return;
  separados = true;
  ultCasa.clear(); ultVida.clear(); cenaUlt = ''; estUlt = '';
  remQuer = null; cmdSapo = { d: -1, seg: 0, segura: 0, toque: cmdSapo.toque };
}
function ausentes(){                                          // o boneco do parceiro, quando está noutra cena
  const rFora = onlineConvidado() && separados, sFora = onlineDono() && separados;
  if (rFora){
    if (!player.fora){ player.fora = true; player.mode = 'idle'; player.t = 0; }
    player.dead = true; player.tx = player.ty = -60;          // sem corpo: não ocupa, não é alvo
    player.x = player2.x; player.y = player2.y;               // e a luz/câmera que seguem o "rato" seguem o sapo
  } else if (player.fora){ player.fora = false; player.dead = false; player.tx = player.x | 0; player.ty = player.y | 0; }
  if (sFora){
    if (!player2.fora){ player2.fora = true; player2.mode = 'idle'; player2.t = 0; }
    player2.dead = true; player2.tx = player2.ty = -60; player2.x = player.x; player2.y = player.y;
  } else if (player2.fora){ player2.fora = false; player2.dead = false; player2.mode = 'idle'; poeSapoPerto('nasce'); }
}
function mandaOnde(){
  ondeMandei = chaveCena();
  mandaWS({ t: 'onde', c: ondeMandei, nv: current.level || 0, s: current.semente | 0, cu: current.cursed ? 1 : 0, bl: bestLv });
}
function recebeOnde(m){
  const primeiro = !ondeOutro;
  ondeOutro = m;
  if ((m.bl | 0) > bestLvPar) bestLvPar = m.bl | 0;           // o elevador da dupla: vale o que QUALQUER um desbloqueou
  if (primeiro) mandaOnde();                                  // o meu "onde" pode ter saído antes de ele chegar: responde já
  if (!separados && m.c !== chaveCena()){ separa(); updateHUD(); }   // o parceiro saiu daqui: cada um com o seu
}
function fichaSapo(){
  return { hp: player2.hp, mh: player2.maxHp, a: arma2, p: poder2 || '', q: quick2 | 0,
    i: inv2.map(x => x || ''), n: invN2.slice(), cs: cardSlot2, u: [bagUps2, critUps2, stamUps2, hpUps2],
    ko: p2KO() ? 1 : 0, d: player2.dir };
}
function aplicaFicha(f){
  if (!f) return;
  player2.maxHp = f.mh || player2.maxHp; player2.hp = f.hp;
  if (f.a) arma2 = f.a;
  poder2 = f.p || null; quick2 = f.q | 0;
  for (let k = 0; k < BAG_MAX; k++){ inv2[k] = (f.i && f.i[k]) || null; invN2[k] = (f.n && f.n[k]) | 0; }
  if (f.cs) cardSlot2 = f.cs;
  if (f.u){ bagUps2 = f.u[0] | 0; critUps2 = f.u[1] | 0; stamUps2 = f.u[2] | 0; hpUps2 = f.u[3] | 0; }
}
function mundoAqui(){                                         // o retrato do andar, pra quem chega depois
  if (current.safe) return null;
  return { at: current.actors.map(a => [a.tx, a.ty, a.dead ? 0 : Math.max(0, a.hp) | 0, a.dir & 3, a.alerted ? 1 : 0]),
    ex: empacotaExtras(), pk: empacotaChao(),
    bo: (current.baus || []).map(q => q.aberto ? 1 : 0), hl: current.hell ? [current.hell.x, current.hell.y] : null };
}
function aplicaMundo(w){
  if (!w || current.safe) return;
  const ex = w.ex || [];
  for (let k = 0; k + 1 < ex.length; k += 2) criaExtra(ex[k], ex[k + 1]);
  w.at.forEach((v, i) => {
    const a = current.actors[i]; if (!a) return;
    a.tx = a.x = v[0]; a.ty = a.y = v[1]; a.dir = v[3]; a.alerted = !!v[4];
    a.mode = 'idle'; a.t = 0; a.from = null; a.to = null;
    if (v[2] <= 0){ a.dead = true; a.hp = 0; } else { a.dead = false; a.hp = v[2]; }
  });
  if (Array.isArray(w.pk)) aplicaChao(w.pk);
  if (w.bo && current.baus) w.bo.forEach((b, i) => { if (current.baus[i]) current.baus[i].aberto = !!b; });
  if (w.hl) current.hell = { x: w.hl[0], y: w.hl[1] };
}
function pedeJunta(){                                         // convidado: estou na cena do dono? então somos um mundo só
  mandaWS({ t: 'cheguei', c: chaveCena(), sp: [player2.tx, player2.ty], f: fichaSapo(), w: mundoAqui() });
}
function recebeCheguei(m){                                    // dono: o sapo chegou (ou eu cheguei no andar dele)
  if (!onlineDono() || transitioning || m.c !== chaveCena()) return;   // não bate: ele pergunta de novo
  if (adotou && m.w) aplicaMundo(m.w);                        // fui EU que cheguei depois: vale o andar como ele deixou
  adotou = false;
  aplicaFicha(m.f);
  separados = false;
  player2.fora = false; player2.dead = false; player2.t = 0; player2.from = null; player2.to = null;
  player2.tx = player2.x = m.sp[0]; player2.ty = player2.y = m.sp[1]; player2.dir = m.f ? m.f.d | 0 : 0;
  player2.mode = m.f && m.f.ko ? 'dead' : 'idle';
  player2.invuln = Math.max(player2.invuln, .6);
  if (occupied(player2.tx, player2.ty, player2) || !current.free(player2.tx, player2.ty)) poeSapoPerto('nasce');
  ultCasa.clear(); ultVida.clear(); cenaUlt = ''; estUlt = ''; stUlt = null;
  tudoDeNovo();                                               // cena + estado + foto: o convidado vira tela de novo
  toast('🐸 o sapo está aqui!');
  updateHUD();
}
function passoSala(rawDt){                                    // o que a sala faz todo quadro, juntos ou separados
  ausentes();
  ondeT -= rawDt;                                             // separados: repete de 2 em 2s — um "onde" perdido
  if (!transitioning && (chaveCena() !== ondeMandei || (separados && parceiro && ondeT <= 0))){ mandaOnde(); ondeT = 2; }   // não pode impedir o reencontro
  remQuerT -= rawDt; if (remQuerT <= 0) remQuer = null;
  if (onlineConvidado()){
    juntaT -= rawDt;
    if (separados && parceiro && ondeOutro && !transitioning && juntaT <= 0 && ondeOutro.c === chaveCena()){
      juntaT = 1.5; pedeJunta();
    }
    const sf = (inv2.indexOf('arcoiris') >= 0 ? 1 : 0) + ',' + (p2KO() ? 1 : 0);
    if (sf !== sfUlt){ sfUlt = sf; mandaWS({ t: 'sf', pe: inv2.indexOf('arcoiris') >= 0 ? 1 : 0, ko: p2KO() ? 1 : 0 }); }
  }
}
function oiParceiro(){                                        // parceiro chegou (ou voltou): eu conto quem sou e onde estou
  mandaOnde(); mandaRoupa(true); sfUlt = '';
  if (onlineDono()){ if (!separados) tudoDeNovo(); else mandaEstado(true); }
}

/* ---- PEDRA ARCO-ÍRIS: só aparece em sala, e é rara ----
   Morreu com ela na mochila? Ela vai sozinha pra mochila do parceiro. Usada com o parceiro
   caído, ele volta à vida NO ANDAR DE QUEM USOU, do lado dela — mesmo que estivesse noutra cena. */
const temPedra = () => inv.indexOf('arcoiris') >= 0 || inv2.indexOf('arcoiris') >= 0 || sapoInfo.pe;
function poePedra(d){
  if (temPedra() || (d.pickups || []).some(p => p.kind === 'arcoiris')) return;
  const chefe = d.level % 10 === 0;
  if (Math.random() >= (chefe ? .3 : .06)) return;            // 6% por andar · 30% no andar do chefe
  for (let k = 0; k < 60; k++){
    const x = (Math.random() * d.w) | 0, y = (Math.random() * d.h) | 0;
    if (!d.free(x, y) || d.doors[x + ',' + y] || (d.exit && d.exit.x === x && d.exit.y === y)) continue;
    if (Math.abs(x - d.entry[0]) + Math.abs(y - d.entry[1]) < 4) continue;
    if (d.pickups.some(p => p.x === x && p.y === y)) continue;
    d.pickups.push({ x, y, kind: 'arcoiris' });
    return;
  }
}
const sapoTemPedra = () => onlineOn() && parceiro && p2On &&
  (separados ? !!(sapoInfo.pe && !sapoInfo.ko) : (!p2KO() && inv2.indexOf('arcoiris') >= 0));
function tiraUm(bag, bagN, it){                               // gasta UMA unidade de um item da mochila
  const i = bag.indexOf(it); if (i < 0) return false;
  if (--bagN[i] <= 0){ bag[i] = null; bagN[i] = 0; }
  return true;
}
function pedraPassa(quem){                                    // morreu com a pedra: ela pula pra mochila do outro
  if (!onlineOn() || !p2On) return;
  if (quem === player){
    if (!tiraUm(inv, invN, 'arcoiris')) return;
    if (separados) mandaWS({ t: 'dar', it: 'arcoiris', pedra: 1 });
    else if (!addItem2('arcoiris')) current.pickups.push({ x: player2.tx, y: player2.ty, kind: 'arcoiris' });
    toast('🌈 a pedra arco-íris foi pro sapo');
  } else {
    if (!tiraUm(inv2, invN2, 'arcoiris')) return;
    if (onlineConvidado()) mandaWS({ t: 'dar', it: 'arcoiris', pedra: 1 });   // o rato mora no dono
    else if (!addItem('arcoiris')) current.pickups.push({ x: player.tx, y: player.ty, kind: 'arcoiris' });
    toast('🌈 a pedra arco-íris foi pro rato');
  }
  updateHUD();
}
function usaPedra(eu){                                        // devolve true se gastou a pedra
  const sapo = eu === player2;
  if (!sapo){                                                 // o RATO usa: o sapo levanta aqui
    if (onlineOn() && separados){
      if (!sapoInfo.ko){ toast('🌈 o sapo está de pé'); return false; }
      mandaWS({ t: 'revive', c: chaveCena(), nv: current.level || 0, s: current.semente | 0, cu: current.cursed ? 1 : 0, sp: [player.tx, player.ty] });
    } else {
      if (!p2On || !p2KO() || player2.fora){ toast('🌈 ninguém caído pra reviver'); return false; }
      player2.mode = 'idle'; player2.dead = false; player2.t = 0; p2Down = 0;
      player2.hp = Math.max(1, Math.ceil(player2.maxHp / 2)); player2.invuln = 1.5;
      poeSapoPerto('nasce');
    }
    pedraFx(player, '🐸 de volta!');
    return true;
  }
  if (onlineConvidado() && separados){                        // o SAPO usa, sozinho na cena dele
    if (!ratoInfo.ko){ toast('🌈 o rato está de pé'); return false; }
    mandaWS({ t: 'revive', c: chaveCena(), nv: current.level || 0, s: current.semente | 0, cu: current.cursed ? 1 : 0, sp: [player2.tx, player2.ty] });
    pedraFx(player2, '🐭 de volta!');
    return true;
  }
  if (!pDead() || player.dead){ toast('🌈 ninguém caído pra reviver'); return false; }
  levantaRato(player2.tx, player2.ty);
  pedraFx(player2, '🐭 de volta!');
  return true;
}
function levantaRato(x, y){                                   // o rato volta à vida com metade da vida, do lado de (x,y)
  player.mode = 'idle'; player.t = 0; player.dead = false; deadT = 0;
  player.hp = Math.max(1, Math.ceil(player.maxHp / 2)); player.invuln = 1.5;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]])
    if (current.free(x + dx, y + dy) && !occupied(x + dx, y + dy, player)){ player.tx = player.x = x + dx; player.ty = player.y = y + dy; break; }
  updateHUD();
}
function pedraFx(eu, msg){
  rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y), t: 0, gold: true });
  celebraReviveu();
  if (onlineDono() && !separados && parceiro) mandaWS({ t: 'festa' });   // juntos: o parceiro comemora junto
  toast('🌈 ' + msg);
}
/* A FESTA DA PEDRA: "REVIVEU!" com cada letra numa cor do arco-íris, girando em degraus, e faixas
   de cor acendendo EM CASCATA nas duas laterais — de cima pra baixo, duas ondas. */
const ARCO = ['#ff4f6a', '#ff9a3c', '#ffe14d', '#5fe07a', '#4fb2ff', '#a873ff'];
const ARCO_ESC = ['#7a1424', '#7a3a10', '#7a6410', '#1f6a2e', '#1a4a7a', '#43207a'];
let arcoT = null;
function celebraReviveu(){
  SFX.levelup(); SFX.fanfare(); shake(5, .5);
  chromaT = Math.max(chromaT, .35);
  bannerNaFila('REVIVEU!', 'arco', 2700);
  const fx = document.getElementById('arcoFx');
  if (!fx) return;
  fx.innerHTML = '';
  for (let k = 0; k < 7; k++) for (const lado of ['e', 'd']){
    const i = document.createElement('i');
    i.className = lado;
    i.style.top = (k * 100 / 7).toFixed(2) + '%';
    i.style.setProperty('--c', ARCO[k % 6]);
    i.style.animationDelay = (k * .085).toFixed(3) + 's';      // a cascata desce a tela
    fx.appendChild(i);
  }
  fx.classList.remove('play'); void fx.offsetWidth; fx.classList.add('play');
  clearTimeout(arcoT); arcoT = setTimeout(() => { fx.classList.remove('play'); fx.innerHTML = ''; }, 2600);
}
function recebeRevive(m){                                     // a pedra foi usada do outro lado: eu levanto LÁ
  if (onlineDono()){
    if (!pDead() || player.dead) return;
    player.mode = 'idle'; player.dead = false; deadT = 0; player.t = 0;
    player.hp = Math.max(1, Math.ceil(player.maxHp / 2)); player.invuln = 2;
    vaiPraCena(m);
    celebraReviveu();
    toast('🌈 o sapo te reviveu!');
  } else {
    if (!p2KO()) return;
    player2.mode = 'idle'; player2.dead = false; player2.t = 0; p2Down = 0;
    player2.hp = Math.max(1, Math.ceil(player2.maxHp / 2)); player2.invuln = 2;
    vaiPraCena(m);
    celebraReviveu();
    toast('🌈 o rato te reviveu!');
  }
  updateHUD();
}
function vaiPraCena(m){                                       // atravessa pra cena do parceiro, pro lado dele
  reviveEm = m.sp;
  if (m.c === chaveCena()){ const meu = onlineConvidado() ? player2 : player; meu.tx = meu.x = m.sp[0]; meu.ty = meu.y = m.sp[1]; reviveEm = null; poeAoLado(meu, m.sp); return; }
  if (m.c === 'home|') goTo('home', m.sp);
  else if (m.c === 'lan|') goTo('lanroom', m.sp);
  else { enterDungeon(m.nv | 0, !!m.cu, m.s | 0); if (onlineDono()) adotou = true; }
}
function poeAoLado(a, sp){
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [0, 0]])
    if (current.free(sp[0] + dx, sp[1] + dy) && !occupied(sp[0] + dx, sp[1] + dy, a)){ a.tx = a.x = sp[0] + dx; a.ty = a.y = sp[1] + dy; return; }
}

/* ---- TROCA DE ITENS: um item por vez, pra mochila do parceiro ----
   Quem tem a mochila é quem dá. Juntos, o dono mexe nas duas; separados, o item atravessa o fio
   e, se a mochila do outro estiver cheia, volta pra de quem deu. */
function darItem(i, eu){
  const sapo = eu === player2;
  const bag = invDe(eu), bagN = invNDe(eu), it = bag[i];
  if (!it) return;
  if (!p2On){ toast('🎒 ninguém pra receber'); return; }
  if (sapo && cliente()){ mandaCmd('dar', i); return; }       // juntos: a mochila do sapo mora no dono
  const ok = sapo
    ? (onlineConvidado() ? (mandaWS({ t: 'dar', it }), true) : addItem(it))
    : (onlineDono() && separados ? (mandaWS({ t: 'dar', it }), true) : addItem2(it));
  if (!ok){ toast('🎒 a mochila do parceiro está cheia'); return; }
  if (--bagN[i] <= 0){ bag[i] = null; bagN[i] = 0; }
  SFX.item();
  toast(sapo ? '🎁 ➡️ 🐭' : '🎁 ➡️ 🐸');
  updateHUD();
}
function recebeDar(m){                                        // chegou um item do parceiro
  const ok = onlineDono() ? addItem(m.it) : addItem2(m.it);
  if (!ok){
    if (m.volta){ const a = onlineDono() ? player : player2; current.pickups.push({ x: a.tx, y: a.ty, kind: m.it }); toast('🎒 cheia — o item ficou no chão'); }
    else { mandaWS({ t: 'dar', it: m.it, volta: 1 }); toast('🎒 cheia — o item voltou'); }
    return;
  }
  SFX.item();
  if (m.bau) toast('📦 ➡️ 🎒');
  else if (m.volta) toast('🎒 a mochila do parceiro estava cheia');
  else if (m.pedra) toast(onlineDono() ? '🌈 o sapo caiu: a pedra arco-íris é sua' : '🌈 o rato caiu: a pedra arco-íris é sua');
  else toast(onlineDono() ? '🐸 ➡️ 🎁' : '🐭 ➡️ 🎁');
  updateHUD();
}

/* ---- GUARDA-ROUPA EM SALA: cada um veste o SEU boneco, e o outro vê ---- */
let roupaUlt = '';
function mandaRoupa(forca){
  if (!onlineOn()) return;
  const o = onlineDono() ? outfit : outfit2, j = JSON.stringify(o);
  if (!forca && j === roupaUlt) return;
  roupaUlt = j;
  mandaWS({ t: 'roupa', o });
}
function recebeRoupa(m){
  if (!m.o) return;
  if (onlineDono()) Object.assign(outfit2, m.o); else Object.assign(outfit, m.o);
  applyOutfit();
}
function roupaDeCasa(){                                       // saiu da sala: cada aparelho volta ao seu guarda-roupa
  try { Object.assign(outfit, JSON.parse(localStorage.getItem('ratsOutfit') || '{}')); } catch (e){}
  try { Object.assign(outfit2, JSON.parse(localStorage.getItem('ratsOutfit2') || '{}')); } catch (e){}
  applyOutfit();
}

/* ---- PAINÉIS DO SAPO: o dono pede, o aparelho do sapo mostra e escolhe ---- */
let upRemoto = false, upEsperando = false, bauRemoto = false;
function abreUpSapo(){                                        // dono: o presente do sapo abre NA TELA DELE
  if (upEsperando) return;
  upEsperando = true;
  conta('sapo');
  mandaWS({ t: 'abre', p: 'up', st: stash, ug: upGoal, up: upPend, ud: upsDone, cv: cenaVista ? 1 : 0,
    u: [bagUps2, critUps2, stamUps2, hpUps2], mh: player2.maxHp, mhR: player.maxHp,
    uR: [bagUps, critUps, stamUps, hpUps] });
}
function mandaBau(abre){
  mandaWS({ t: 'abre', p: 'bau', ci: chestItems, cn: chestN, abre: abre ? 1 : 0 });
}
function recebeAbre(m){
  if (m.p === 'up'){
    conta('sapo');
    stash = m.st; upGoal = m.ug; upPend = m.up; upsDone = m.ud; cenaVista = !!m.cv;
    [bagUps2, critUps2, stamUps2, hpUps2] = m.u; player2.maxHp = m.mh;
    if (m.mhR) player.maxHp = m.mhR;
    if (m.uR) [bagUps, critUps, stamUps, hpUps] = m.uR;
    if (upPend <= 0 || upOpen || entrega) return;
    upRemoto = true; upAlvo = 'sapo';
    if (cenaVista) openUp(); else { comecaEntrega(true); entrega.remota = true; }
  } else if (m.p === 'bau'){
    for (let k = 0; k < chestItems.length; k++){ chestItems[k] = m.ci[k] || null; chestN[k] = m.cn[k] | 0; }
    if (m.abre && current === home) openChest(player2);
    else if (chestOpen && chestDono === player2) renderChest();
  }
}
function criarSala(){ ligaWS(codigoNovo(), true); }
function entrarSala(cod){
  const c = ('' + cod).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  if (c.length !== 4){ toast('🎮 código de 4 letras'); return; }
  ligaWS(c, false);
}
function sairSala(){
  deProposito = true; tentativa = 0;
  if (religarT){ clearTimeout(religarT); religarT = 0; }
  if (tchauEm){ clearTimeout(tchauEm); tchauEm = 0; }
  try { if (WS) WS.close(); } catch (e){}
  WS = null; sala = null; parceiro = false; wsEstado = 'desligado';
  player.remCtl = null; player2.remCtl = null;
  if (current && current.actors) current.actors.forEach(a2 => { a2.remCtl = null; });
  remT = 0; evSapo = 0; ultCmd = ''; cenaUlt = ''; estUlt = ''; stUlt = null; cenaOk = -1;
  ultCasa.clear(); ultVida.clear();
  cmdSapo = { d: -1, seg: 0, segura: 0, toque: 0 }; remQuer = null;
  filaRede.length = 0; relMs = -1; relAmostras.length = 0; relRtt = 0; posRemota = false; seqSapo = 0; ackSapo = 0; sapoSeq = 0;
  separados = false; ondeOutro = null; ondeMandei = ''; adotou = false; upEsperando = false; upRemoto = false;
  ausentes();                                                 // quem estava 'fora' volta pro corpo
  roupaDeCasa();
  /* O sapo só estava em campo por causa da sala: saindo dela, ele sai junto — senão sobram as
     DUAS barras de botões na tela de quem ficou, sem ninguém pra usar a segunda. Só fica se
     houver mesmo um 2º controle plugado, que aí é a dupla local da lan. */
  if (p2On && padsLigados().length < 2){
    p2On = false; p2Scan = 0;
    player2.mode = 'idle'; player2.dead = false;
  }
  renderOnline();
  hudOnline();
  toast('🎮 saiu da sala');
}
function entrarP2(){
  if (p2On) return;
  p2On = true;
  held.length = 0;                                            // as setas trocam de dono na hora
  player2.dead = false;
  player2.maxHp = Math.max(10, player.maxHp);                   // a barra dele nasce do tamanho da do rato
  player2.hp = player2.maxHp;
  player2.invuln = 1.4;
  poeSapoPerto('nasce');
  fecharVarredura(true);
  SFX.fanfare();
  bannerNaFila('JOGADOR 2!', '', 2400);
  toast('🐸 o sapo entrou na quest');
  updateHUD();
}
function addItem2(kind){                                      // mochila DO SAPO (o queijo continua sendo do casal)
  if (!kind) return true;
  if (kind === 'cheese'){ cheeseN++; updateHUD(); return true; }
  if (STACKS[kind]){
    const s2 = inv2.indexOf(kind);
    if (s2 >= 0){ invN2[s2]++; updateHUD(); return true; }
  }
  const i = inv2.indexOf(null);
  if (i < 0 || i >= invMax2()){ toast('🐸 🎒 cheia'); return false; }
  inv2[i] = kind; invN2[i] = 1; updateHUD(); return true;
}
function tiraChao(i){                                         // some com o item do chão
  current.pickups.splice(i, 1);
}
function sapoPega(){                                          // o sapo cata item igual ao rato — na mochila DELE
  if (!current.pickups || cliente()) return;                 // juntos na sala, quem cata é o mundo do dono
  for (let i = current.pickups.length - 1; i >= 0; i--){
    const pk = current.pickups[i];
    if (pk.x !== player2.tx || pk.y !== player2.ty) continue;
    if (pk.kind === 'cheese'){                                // queijo é do casal, e ainda alimenta o sapo
      tiraChao(i);
      cheeseN++;
      if (onlineConvidado()) mandaWS({ t: 'q', n: 1 });       // o pote do casal mora no dono
      const cura2 = cartaDe(player2, 'cslime') ? 3 : 1;      // Carta da Gosma: o queijo alimenta mais
      if (player2.hp < player2.maxHp){
        const antes = player2.hp;
        player2.hp = Math.min(player2.maxHp, player2.hp + cura2);
        dmgNum(player2.tx, player2.ty, player2.hp - antes, 'green');
      }
      SFX.cheese();
      toast(`🐸 🧀 +${cura2} ❤️`);
      updateHUD();
    } else if (pk.kind === 'heartmax'){
      tiraChao(i);
      player2.maxHp++; player2.hp = player2.maxHp;
      if (!pDead()) player.hp = player.maxHp;                 // e vice-versa: quem não pegou também enche
      itemGet('heartmax', player2); SFX.item(); heartBurst();
      toast('🐸 ❤️ máx +1');
      updateHUD();
    } else if (CARDS[pk.kind]){                               // CARTA: encaixa na lâmina DELE, igual ao rato
      const livre = !cardSlot2[arma2];
      if (livre || addItem2(pk.kind)){
        tiraChao(i);
        if (livre) cardSlot2[arma2] = pk.kind;
        cardGetFx(pk.kind, player2);
        showCard(pk.kind);
        toast(livre ? '🐸 🎁 carta encaixada!' : '🐸 🎁 carta na mochila');
        updateHUD();
      } else toast('🐸 🎒 cheia — a carta ESPERA no chão');    // carta nunca se perde por falta de espaço
    } else if (WEAPONS[pk.kind]){
      if (WEAPONS[pk.kind].dmg <= WEAPONS[arma2].dmg) continue;   // arma pior fica no chão, igual ao rato
      const armaVelha = arma2;
      arma2 = pk.kind;
      carryCard(armaVelha, player2);                          // a carta muda de lâmina junto com ele
      tiraChao(i);                           // e a velha vai junto: não entulha a mochila
      itemGet(arma2, player2);
      toast(`🐸 ⚔️ ${WEAPONS[arma2].name}`);
      updateHUD();
    } else if (addItem2(pk.kind)){
      tiraChao(i);
      if (POWERS[pk.kind]) itemGet(pk.kind, player2);
      SFX.item();
      toast(`🐸 ${pickupMsg(pk.kind)}`);
      updateHUD();
    }
  }
}
function sapoPousou(){                                        // o "onPlayerLand" do sapo: item, placa, baú e ESCADA
  if (!cliente()){                                            // o MUNDO é de quem simula esta cena
    sapoPega();
    pisouNaPlaca(player2);
    const bu = current.baus && current.baus.find(q => q.x === player2.tx && q.y === player2.ty && !q.aberto);
    if (bu) abrirBau(bu, player2);
  }
  /* A DECISÃO é de quem joga de sapo. Em sala isso é o aparelho do parceiro — o dono não abre
     caixinha, não escolhe porta nem presente por ele: é a mesma agência que o rato tem. */
  if (onlineDono()) return;
  if (current === home){                                      // no covil o sapo mexe no guarda-roupa, no baú e na TV
    if (Math.abs(player2.tx - 0) + Math.abs(player2.ty - 0) === 1){
      tvCanal = (tvCanal + 1) % TV_CANAIS.length;
      SFX.ui();
      toast(`🐸 🖥 ${TV_CANAIS[tvCanal]}`);
    }
    if (Math.abs(player2.tx - 2) + player2.ty === 1) openWard(player2);
    else if (wardOpen && wardDono === player2 && (onlineConvidado() || Math.abs(player.tx - 2) + player.ty !== 1)) closeWard();
    if (Math.abs(player2.tx - 0) + Math.abs(player2.ty - 6) === 1){   // o baú também é dele
      if (onlineConvidado()) mandaCmd('bau', 0);              // o baú é do casal: o conteúdo mora no dono
      else openChest(player2);
    } else if (chestOpen && chestDono === player2) closeChest();
  }
  sapoDecide();
}
function sapoDecide(){                                        // porta, escada e fenda: o sapo vai aonde quiser
  if (transitioning) return;
  const door = current.doors && current.doors[player2.tx + ',' + player2.ty];
  if (current.safe){
    if (!door) return;
    if (door.to === 'dungeon') startRun();                    // a porta do covil: o elevador abre pra quem chegou
    else goTo(door.to, door.spawn);                           // covil ⟷ lan
    return;
  }
  if (current.cleared && current.hell &&                      // a FENDA: o sapo também pode propor a descida
      player2.tx === current.hell.x && player2.ty === current.hell.y){
    if (!hellOpen && hellDis !== player2.tx + ',' + player2.ty) openHell();
    return;
  }
  if (current.cleared && current.exit && player2.tx === current.exit.x && player2.ty === current.exit.y){
    if (current.level >= 40){ goTo('home', [5, 6]); toast('👑 LENDA ♥️'); }
    else enterDungeon(current.level + 1);                     // em sala, desce SÓ ele; na mesa, leva o rato junto
  }
}
let askDisSapo = '';
function sapoPorta(){                                         // parado na porta da dungeon, virado pra fora: pergunta
  if (!onlineConvidado() || current.safe || transitioning || p2KO() || player2.mode !== 'idle' || anyPanel()) return;
  const dkey = player2.tx + ',' + player2.ty, door = current.doors[dkey];
  if (!door){ askDisSapo = ''; return; }
  const [dx, dy] = DIRV[player2.dir];
  const akey = dkey + ',' + player2.dir;
  if (!current.free(player2.tx + dx, player2.ty + dy) && akey !== askDisSapo){ askDisSapo = akey; openAsk(door); }
}
let frogCallT = null;
function avisoSapoCaiu(){                                     // o mesmo teatro do "ela te chama", em verde
  enfileira('s:caiu', 2800, () => cenaSapoCaiu());
}
function cenaSapoCaiu(){
  const el = document.getElementById('callFrog');
  if (!el) return;
  document.getElementById('callFrogSub').textContent = 'volte ao covil pra ele levantar';
  el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
  clearTimeout(frogCallT); frogCallT = setTimeout(() => el.classList.remove('play'), 2600);
  chromaT = Math.max(chromaT, .5);
  shake(3, .35);
  SFX.charged();
}
const checkDepositSapo = () => checkDeposit(player2);
function respawnSapo(){                                       // EM SALA: o sapo caiu sozinho e volta pro covil
  const perdeu = invN2.reduce((a, b) => a + b, 0);
  for (let i = 0; i < BAG_MAX; i++){ inv2[i] = null; invN2[i] = 0; }   // roguelike: igual ao rato
  player2.mode = 'idle'; player2.dead = false; player2.t = 0; p2Down = 0;
  player2.hp = player2.maxHp; player2.invuln = 1.5; player2.pose.crouch = 0;
  sapoZera();
  goTo('home', [5, 7]);
  toast(perdeu ? `🐸 💀 −${perdeu}` : '🐸 💀 ➡️ 🏠');
  updateHUD();
}
function levantaSapo(){                                       // só no COVIL, e aí volta inteiro
  player2.mode = 'idle'; player2.t = 0;
  player2.hp = player2.maxHp;
  player2.invuln = 1.4;
  player2.pose.crouch = 0;
  poeSapoPerto('nasce');
  sapoZera();
  SFX.levelup();
  toast('🐸 de pé, vida cheia!');
  rings.push({ x: gX(player2.x, player2.y), y: gY(player2.x, player2.y), t: 0, gold: true });
  updateHUD();
}
function sapoZera(){                                          // covil/andar novo: os efeitos do sapo se renovam
  cdPoder2 = {}; stamT2 = 0; stamCd2 = 0; dashCd2 = 0;
  p2BurnT = 0; p2FrostT = 0; p2PoisT = 0;
  for (const k in B2) B2[k] = 0;
}
function passoP2(dt, rawDt, time, travado){                   // tudo do sapo cabe aqui, chamado pelo frame()
  if (p2Scan > 0){
    p2Scan -= rawDt;
    if (padsLigados().length > 1) entrarP2();
    else if (p2Scan <= 0) fecharVarredura(false);
  }
  if (!p2On) return;
  pollPad2();
  if (player2.fora) return;                                   // o sapo está noutra cena, no aparelho do parceiro
  if (!travado){                                              // relógios do sapo correm igual aos do rato
    for (const k in B2) B2[k] = Math.max(0, B2[k] - dt);
    for (const k in cdPoder2) cdPoder2[k] = Math.max(0, cdPoder2[k] - dt);
    stamCd2 = Math.max(0, stamCd2 - dt);
    if (stamT2 > 0){ stamT2 = Math.max(0, stamT2 - dt); if (stamT2 === 0) toast('🐸 ⚡ fim'); }
    dashCd2 = Math.max(0, dashCd2 - dt);
  }
  { const sc2 = document.getElementById('spc2Cd'), st2 = document.getElementById('stam2Cd');
    const cdv = poder2 ? (cdPoder2[poder2] || 0) : 0;
    if (sc2){ sc2.style.display = cdv > 0 ? 'flex' : 'none'; if (cdv > 0) sc2.textContent = Math.ceil(cdv); }
    if (st2){
      const mostra = stamT2 <= 0 && stamCd2 > 0;
      st2.style.display = mostra ? 'flex' : 'none';
      if (mostra) st2.textContent = Math.ceil(stamCd2);
      document.getElementById('b2Stam').classList.toggle('run', stamT2 > 0);
    } }
  passoQuer2T -= dt; if (passoQuer2T <= 0) passoQuer2 = null;
  if (p2AtkHold && !travado && !p2KO()){                       // segurando: a língua vai carregando o giro
    p2ChargeT += dt;
    if (!p2ChargeRdy && p2ChargeT >= CHARGE_T){
      p2ChargeRdy = true;
      SFX.charged();
      for (let k2 = 0; k2 < 8; k2++)
        dust.push({ x: gX(player2.x, player2.y) + (hash(k2, 71) - .5) * 22,
          y: gY(player2.x, player2.y) - 16 - hash(k2, 72) * 20,
          vx: (hash(k2, 73) - .5) * 60, vy: -30, life: .45, kind: 'hit' });
    }
  } else if (p2AtkHold){ p2AtkHold = false; p2ChargeT = 0; p2ChargeRdy = false; p2ChargeLock = false; }
  if (player2.mode === 'idle' && player2.hopS !== .21) player2.hopS = .21;
  if (player2.mode === 'dead'){                               // CAÍDO: o rato levanta encostando nele
    p2Down += rawDt;
    player2.flash = Math.max(0, player2.flash - rawDt);       // sem stepActor rodando, o clarão ficava aceso pra sempre
    player2.pose.flash = player2.flash;
    player2.pose.crouch = 3; player2.pose.stretch = 0; player2.pose.air = 0;
    /* O sapo caído NÃO levanta na dungeon. Encostar nele resolvia rápido demais e a dupla virava
       passeio; agora o rato tem que VOLTAR PRO COVIL — e lá ele acorda com a vida cheia. */
    if (!onlineOn() && current.safe && p2Down > .3) levantaSapo(true);
    /* EM SALA o sapo é jogador de verdade: caiu, volta pro covil sozinho (e perde a mochila,
       igual ao rato) — a não ser que o rato tenha a pedra arco-íris, que aí dá tempo de usar. */
    if (onlineConvidado()){
      const espera = ratoInfo.pe && !ratoInfo.ko;
      if (espera && !avisouPedra2){ avisouPedra2 = true; toast('🌈 o rato tem a pedra arco-íris — ele pode te reviver'); }
      if (p2Down > (espera ? PEDRA_ESPERA : 1.6)) respawnSapo();
    }
    p2WantAtk = false; p2WantDash = false; p2WantSpc = false; p2WantStam = false;
    return;
  }
  if (travado){ p2WantAtk = false; p2WantDash = false; p2WantSpc = false; p2WantStam = false; return; }
  if (cliente()){                                             // convidado: aperto vira evento da batida, e só
    /* Rede de segurança: QUALQUER caminho que peça um golpe do sapo — botão da tela, tecla,
       controle, ou algo que eu ainda nem escrevi — vira evento e chega no dono. Um pedido de
       golpe não pode mais morrer em silêncio aqui dentro. */
    if (p2WantAtk){ evSapo |= EV_ATK; p2WantAtk = false; }
    if (p2WantSpc){ evSapo |= EV_SPC; p2WantSpc = false; }
    if (p2WantStam){ evSapo |= EV_STAM; p2WantStam = false; }
    // a escavação NÃO vira evento: ela é prevista aqui (logo abaixo) e a casa nova vai pelo PK_POS
    p2SpcBuf = 0; p2StamBuf = 0;
  }
  if (p2WantSpc){ p2WantSpc = false; if (!doSpecial(player2)) p2SpcBuf = .35; }
  if (p2SpcBuf > 0){ p2SpcBuf = Math.max(0, p2SpcBuf - dt); if (p2SpcBuf > 0 && doSpecial(player2, true)) p2SpcBuf = 0; }   // relógio do MUNDO, igual ao rato
  if (!travado && !p2KO()){                                    // STATUS do sapo: queimadura, gelo e veneno
    const px3 = () => gX(player2.x, player2.y), py3 = () => gY(player2.x, player2.y);
    if (p2BurnT > 0){
      p2BurnT = Math.max(0, p2BurnT - dt);
      p2BurnTk -= dt;
      if (p2BurnTk <= 0){
        p2BurnTk = 1.5; SFX.burn();
        player2.invuln = 0; applyHit(player2, 1, player2.dir);
      }
      if (((performance.now() / 80) | 0) % 2 === 0)
        dust.push({ x: px3() + (hash((performance.now() | 0), 7) - .5) * 14,
          y: py3() - 12 - hash((performance.now() | 0), 8) * 26, vy: -24, life: .35, kind: 'fireP' });
    }
    if (p2FrostT > 0){
      p2FrostT = Math.max(0, p2FrostT - dt);
      if (((performance.now() / 110) | 0) % 3 === 0)
        dust.push({ x: px3() + (hash((performance.now() | 0), 9) - .5) * 16,
          y: py3() - 10 - hash((performance.now() | 0), 10) * 22, vy: 8, life: .4, kind: 'iceP' });
    }
    if (p2PoisT > 0){
      p2PoisT = Math.max(0, p2PoisT - dt);
      p2PoisTk -= dt;
      if (p2PoisTk <= 0){
        p2PoisTk = 2;
        player2.invuln = 0; applyHit(player2, 1, player2.dir);
      }
      if (((performance.now() / 130) | 0) % 3 === 0)
        dust.push({ x: px3() + (hash((performance.now() | 0), 15) - .5) * 14,
          y: py3() - 14, vy: -16, life: .45, kind: 'hexP' });
    }
  }
  if (stamT2 > 0 && ((performance.now() / 60) | 0) % 2 === 0)  // fagulhas verdes saindo do sapo
    dust.push({
      x: gX(player2.x, player2.y) + (hash((performance.now() | 0), 11) - .5) * 20,
      y: gY(player2.x, player2.y) - 6 - hash((performance.now() | 0), 12) * 26,
      vx: (hash((performance.now() | 0), 13) - .5) * 30, vy: -20, life: .4, kind: 'stamP',
    });
  if (p2WantStam){ p2WantStam = false; if (!doStam(player2)) p2StamBuf = .35; }
  if (p2StamBuf > 0){ p2StamBuf = Math.max(0, p2StamBuf - dt); if (p2StamBuf > 0 && doStam(player2, true)) p2StamBuf = 0; }
  if (p2WantDash && batePasso){                               // a escavação também sai na batida
    p2WantDash = false;
    if (dashCd2 <= 0 && player2.mode === 'idle') doDash(p2TapDir >= 0 ? s2w(p2TapDir) : player2.dir, player2);
  }
  const hd2 = p2Dir();
  /* SALA — a direção vem do aparelho do sapo, já em espaço de MUNDO (cada câmera gira sozinha).
     E se comando nenhum chegar (aparelho de versão velha, botão que eu não cobri, controle
     desconhecido), o sapo AINDA assim persegue a posição que o parceiro reporta: um parceiro
     imóvel na tela do dono é o pior defeito possível numa sala, então há sempre um plano B. */
  const c2 = onlineDono()
    ? { dir: posRemota ? null : dirSapoRemoto(), attack: p2WantAtk }   // o parceiro prevê e manda a casa (PK_POS); senão, pelo comando
    : cliente()
      ? { dir: hd2 == null ? null : s2w(hd2), attack: !!tomaCtl(player2).attack }   // PREVISÃO: anda já; o golpe é do dono
      : { dir: hd2 == null ? null : s2w(hd2), attack: p2WantAtk };
  p2WantAtk = false;
  stepActor(player2, dt * (stamT2 > 0 ? 1.5 : 1) * (p2FrostT > 0 ? .75 : 1) * (cartaDe(player2, 'cmosq') ? 1.15 : 1) * (cartaDe(player2, 'ccrow') ? 1.2 : 1), time, c2);
  /* POSE — DEPOIS do stepActor, senão ele reescreve tudo no mesmo quadro (era por isso que a
     antecipação da carga do sapo não aparecia: o bloco estava lá em cima e morria toda vez). */
  if (p2TpT > 0){                                             // CHEGADA do teleporte: despenca, estica e amassa
    const antes = p2TpT;
    p2TpT = Math.max(0, p2TpT - dt);
    const q = p2TpT / P2TP_T;                                 // 1 = lá em cima · 0 = no chão
    player2.pose.air = Math.max(player2.pose.air, Math.round(q * q * 56));
    if (q > .3) player2.pose.stretch = Math.max(player2.pose.stretch, 2);   // esticado na descida
    else player2.pose.crouch = Math.max(player2.pose.crouch, 3);            // amassa ao bater no chão
    if (antes > 0 && p2TpT === 0) sapoAterrissa();
  }
  if (p2ChargeT > .12 && player2.mode === 'idle'){            // antecipação da carga, igual à do rato
    const ck = Math.min(1, p2ChargeT / CHARGE_T);
    player2.pose.crouch = Math.max(player2.pose.crouch, 1 + Math.round(ck) + (p2ChargeRdy ? 1 : 0));
    if (p2ChargeRdy) player2.pose.lean = -1;                  // pronto: recolhe um passo antes de disparar
  }
  checkDepositSapo();                                          // encostou na ratinha: entrega o queijo e escolhe o presente
  if (!travado) sapoPorta();                                   // virou pra porta de saída: o sapo também pergunta
  if (!onlineOn() && Math.abs(player2.tx - player.tx) + Math.abs(player2.ty - player.ty) > 12)
    poeSapoPerto();                                           // coleira (só na mesa): o sapo não pode sumir do mapa
}

{ const ab = document.getElementById('bAtk');                 // no toque: segurar carrega, soltar gira
  ab.addEventListener('pointerdown', e => { e.preventDefault(); holdAtk(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => ab.addEventListener(ev, releaseAtk)); }
document.getElementById('bSpc').addEventListener('pointerdown', () => {
  if (onlineConvidado()) p2WantSpc = true; else wantSpc = true; });
document.getElementById('bStam').addEventListener('pointerdown', () => {
  if (onlineConvidado()) p2WantStam = true; else wantStam = true; });
document.getElementById('bTu').onclick = () => setRot(-1);
document.getElementById('bTd').onclick = () => setRot(1);

/* ---------------- TRANSIÇÃO / EVENTOS ---------------- */
let transitioning = false;
function goTo(name, spawn){
  if (transitioning) return;
  transitioning = true;
  if (onlineOn()) separa();                                   // em sala, a porta leva só quem passou por ela
  SFX.door();
  const f = document.getElementById('fade');
  f.style.opacity = 1;
  setTimeout(() => {
    current = SCENES[name];
    stageDirty();                                             // novo mapa: reassa piso e paredes
    iceTiles.length = 0; clouds.length = 0;                   // efeitos de chão não atravessam portas
    const meu = onlineConvidado() ? player2 : player;          // na tela do convidado quem atravessa é o sapo
    if (reviveEm){ spawn = reviveEm; reviveEm = null; }       // a pedra arco-íris manda pro lado de quem a usou
    meu.tx = meu.x = spawn[0];
    meu.ty = meu.y = spawn[1];
    if (meu.mode !== 'dead'){ meu.mode = 'idle'; meu.t = 0; }  // morto continua morto até renascer
    meu.from = null; meu.to = null;
    cam.init = false;
    trail.length = 0;
    chegadaT = current.safe ? 0 : 1.1;                        // um segundo de silêncio ao pisar no andar
    perigos.length = 0;                                       // marca de golpe não atravessa porta
    if (p2On && !onlineOn()){                                 // na mesa o sapo desce junto, e caído volta com metade da vida
      if (player2.mode === 'dead') player2.hp = Math.max(1, Math.round(player2.maxHp * .5));
      player2.mode = 'idle'; player2.t = 0; player2.invuln = .8; player2.pose.crouch = 0;
      poeSapoPerto('nasce');
    }
    closeChest(); closeLan(); closeWard(); closeChar();
    if (current.safe && p2On && !onlineDono()){ player2.hp = player2.maxHp; player2.mode = 'idle'; player2.t = 0; sapoZera(); }   // o covil cura o sapo também
    if (current.safe){ powerCd = {}; rageT = 0; burnT = 0; frozT = 0; poisT = 0; leechT = 0; aegisT = 0; quakeT = 0; drillT = 0; iceTrailT = 0; edgeT = 0; stamCd = 0; stamT = 0; }  // covil cura tudo
    updatePlace();
    f.style.opacity = 0;
    setTimeout(() => transitioning = false, 300);
    updateHUD();
  }, 300);
}
function levelBrief(d){                                       // o que esperar neste andar
  const lv = d.level;
  let foes;
  if (lv >= 31){
    foes = ['abóboras saltitantes 🎃', 'corvos bruxos', 'plague doctors ⚗️', 'nós de ratos 👑'];
    if (lv >= 33) foes.push('espantalhos de palha');
    if (lv >= 35) foes.push('caldeirões vivos');
    if (lv >= 40) foes = ['ninguém — só ela 🎃'];
  } else if (lv >= 21){
    foes = ['ratos ladrões', 'plague doctors ⚗️', 'nós de ratos 👑', 'sapos do lodo 🐸', 'mosquitos do pântano'];
    if (lv >= 23) foes.push('sanguessugas reais');
    if (lv === 30) foes.push('o SAPO REAL 🐸');
  } else if (lv >= 11){
    foes = ['ratos ladrões', 'plague doctors ⚗️', 'nós de ratos 👑', 'soldados', 'cubos vivos 🧊', 'mariposas boreais'];
    if (lv >= 13) foes.push('yetis filhotes');
    if (lv === 20) foes.push('o YETI ANCIÃO ❄️');
  } else {
    foes = ['ratos ladrões', 'observadores 👁️'];
    if (lv >= 2) foes.push('gosmas do arco-íris');
    if (lv >= 3) foes.push('soldados', 'fogos-fátuos');
    if (lv >= 5) foes.push('couraçados', 'morcegos flamejantes 🔥');
    if (lv >= 6) foes.push('plague doctors ⚗️', 'nós de ratos 👑');
    if (lv >= 7) foes.push('sombrios');
    if (lv === 10) foes.push('O GATO 🐈');
  }
  const loots = ['queijos'];
  if (WEAPON_BY_LEVEL[lv]) loots.push(WEAPONS[WEAPON_BY_LEVEL[lv]].name);
  const pd = POWER_DEBUT[lv];                                 // fonte única: a mesma tabela que gera a queda
  if (pd && POWERS[pd]) loots.push('poder ' + POWERS[pd].name);
  if (lv >= 2) loots.push('poções');
  if (lv >= 4 && lv % 2 === 0) loots.push('coração antigo');
  return (d.cursed ? '🔥 ANDAR MALDITO: bichos com +50% de vida e TODA queda dobrada. ' : '') +
    `☠️ poder da ameaça: ${d.pw} — inimigos: ${foes.join(', ')}. Achados: ${loots.join(', ')}.` +
    (d.sewer ? ' Bichos peçonhentos e lodo ENVENENAM: 1 de vida a cada 2s.' :
     d.ice ? ' Criaturas do gelo CONGELAM: −25% de velocidade por 4s. E as PLACAS CLARAS escorregam.' :
     lv >= 2 ? ' Cuidado com espinhos no chão.' : '') +
    (lv === 1 ? ' Mate todos para abrir o portal; a porta de entrada leva pra casa.' : '');
}
function updatePlace(){
  const pi = document.getElementById('plIcon'), pt = document.getElementById('plTxt'), pd = document.getElementById('plDetail');
  if (!current.safe){
    pi.innerHTML = emojify(current.ice ? '❄️' : current.sewer ? '🐸' : current.witch ? '🎃' : '💀');
    pt.textContent = current.level + '/' + (Math.ceil(current.level / 10) * 10);
    pd.innerHTML = emojify(levelBrief(current));
  }
  else if (current === SCENES.lanroom){ pi.innerHTML = emojify('🖥️'); pt.textContent = 'LAN'; pd.textContent = 'quem está logado no servidor do Marcos'; }
  else { pi.innerHTML = emojify('🏠'); pt.textContent = ''; pd.textContent = 'refúgio seguro'; }
}
document.getElementById('place').onclick = () =>
  document.getElementById('place').classList.toggle('exp');

const LIFT = [                                                // elevador: só ícone e nível, sem texto sobrando
  { lv: 1,  e: '💀', nome: 'Masmorra de Pedra' },
  { lv: 11, e: '❄️', nome: 'Reino do Gelo' },
  { lv: 21, e: '🐸', nome: 'Esgoto Real' },
  { lv: 31, e: '🎃', nome: 'Sabá das Bruxas' },
];
let liftOpen = false;
function openLift(tiers){
  SFX.ui();
  liftOpen = true;
  document.getElementById('liftRows').innerHTML = tiers.map(t =>
    `<button class="lrow2" data-lv="${t.lv}" title="${t.nome}">${emojify(t.e)}<span>NV ${t.lv}</span></button>`
  ).join('');
  document.getElementById('liftRows').querySelectorAll('.lrow2').forEach(b2 => {
    b2.onclick = () => { const lv = +b2.dataset.lv; closeLift(); enterDungeon(lv); };
  });
  document.getElementById('liftPanel').classList.add('open');
}
function closeLift(){ liftOpen = false; document.getElementById('liftPanel').classList.remove('open'); }
document.getElementById('liftCancel').onclick = () => { closeLift(); goTo('home', [1, 4]); };
function startRun(){                                          // cada saída de casa = uma quest nova
  powerCd = {}; rageT = 0; stamCd = 0; stamT = 0;             // recargas zeradas
  runSeed = (((performance.now() | 0) + (++genN) * 104729) >>> 0) % 99991;
  sortearPoderes(runSeed);                                    // ordem nova dos poderes a cada saída
  const fundo = Math.max(bestLv, onlineOn() ? bestLvPar : 0);   // em sala, o elevador é da dupla
  const tiers = LIFT.filter(t => fundo >= t.lv);
  if (tiers.length <= 1){ enterDungeon(1); return; }           // só a pedra liberada: desce direto
  openLift(tiers);
}
/* UM PODER POR RUN — o poder que já apareceu não aparece de novo. Perdeu, perdeu: é isso que faz
   a run ter cara própria em vez de virar catálogo completo. Zera na morte.
   O chão do andar NÃO era a única torneira: o baú bom e o nicho atrás da parede falsa plantavam
   poder por conta própria, sem consultar nem marcar nada — dava pra tirar o mesmo poder duas
   vezes na mesma run. Agora as TRÊS passam por aqui, e o que o jogador já tem também sai da mesa. */
const poderJaCaiu = new Set();
const temPoder = k => power === k || poder2 === k
  || inv.indexOf(k) >= 0 || inv2.indexOf(k) >= 0 || chestItems.indexOf(k) >= 0;
function poderesDisponiveis(lv){
  return Object.keys(POWER_DEBUT).filter(l => +l <= lv).map(l => POWER_DEBUT[l])
    .filter(k => !poderJaCaiu.has(k) && !temPoder(k));
}
function poePoder(x, y){                                      // planta UM poder ainda inédito e o risca da lista
  const pool = poderesDisponiveis(current.level);
  if (!pool.length) return false;
  const k = pool[(hash(x * 31 + y * 7, (performance.now() | 0) % 733) * pool.length) | 0];
  poderJaCaiu.add(k);
  current.pickups.push({ x, y, kind: k });
  return true;
}
function enterDungeon(lv, cursed, semente){
  if (lv > bestLv){ bestLv = lv; if (onlineOn()) ondeMandei = ''; }   // sem localStorage: o elevador é conquista da sessão (e o parceiro fica sabendo)
  if (current === home && !onlineOn()) varreduraP2();         // saiu do covil: procura um 2º jogador
  labFalou = false; suorT = 0; isca = null;
  /* O PARCEIRO JÁ ESTÁ NESTE NÍVEL? Então é o andar DELE: mesma semente, mesmo mapa — e quem
     chega por último pega o andar como ele está (bichos mortos, chão catado). */
  const o = ondeOutro;
  if (semente == null && onlineOn() && parceiro && o && o.c.indexOf('dg|') === 0 && o.nv === lv && !!o.cu === !!cursed){
    semente = o.s; if (onlineDono()) adotou = true;
  }
  if (semente == null && onlineOn()) semente = (Math.random() * 99991) | 0;   // em sala todo andar tem semente
  SCENES.dungeon = genDungeon(lv, cursed, semente);
  SCENES.dungeon.semente = semente;
  if (onlineOn() && parceiro && !adotou && !(ondeOutro && ondeOutro.c === chaveDe(SCENES.dungeon))) poePedra(SCENES.dungeon);
  SCENES.dungeon.pickups.forEach(p3 => { if (POWERS[p3.kind]) poderJaCaiu.add(p3.kind); });
  dungeonLevel = lv;
  goTo('dungeon', SCENES.dungeon.entry);
  // CADA ANDAR É UM CAPÍTULO: entrar sem nenhum anúncio fazia os dez andares de um reino
  // parecerem um corredor só. O letreiro é curto e entra pela mesma fila dos outros.
  bannerNaFila('ANDAR ' + lv, lv >= 40 ? 'lenda' : lv >= 31 ? 'bruxa' : lv >= 21 ? 'esgoto' : lv >= 11 ? 'gelo' : '', 1450);
}
function pickupMsg(kind){
  if (kind === 'cheese') return '🧀';
  if (kind === 'potion') return '🧪 poção';
  if (kind === 'arcoiris') return '🌈 pedra arco-íris!';
  if (WEAPONS[kind]) return `⚔️ ${WEAPONS[kind].name}`;
  if (POWERS[kind]) return `✨ ${POWERS[kind].name}`;
  return '✔️';
}
function collectPickups(){
  if (onlineConvidado()) return;                              // em sala, quem cata é o mundo do dono
  for (let i = current.pickups.length - 1; i >= 0; i--){
    const pk = current.pickups[i];
    if (pk.x === player.tx && pk.y === player.ty){
      if (pk.kind === 'heartmax'){
        player.maxHp++; player.hp = player.maxHp;
        if (p2On && !player2.dead) player2.hp = player2.maxHp;   // o achado enche a vida do time inteiro
        tiraChao(i);
        itemGet('heartmax');
        SFX.item();
        heartBurst();                                         // festa: flashes e corações nas laterais
        toast('❤️ máx +1');
        updateHUD();
      } else if (WEAPONS[pk.kind] && WEAPONS[pk.kind].dmg <= WEAPONS[weapon].dmg){
        // arma pior (ou igual) não vale espaço de mochila: fica no chão
      } else if (WEAPONS[pk.kind]){
        const prevW = weapon;
        weapon = pk.kind;                                     // arma melhor equipa sozinha
        player.dmg = WEAPONS[weapon].dmg;
        carryCard(prevW);                                     // a carta muda de lâmina junto com você
        tiraChao(i);                         // a antiga vai junto: sem ícone sobrando no chão
        updateHUD();
        itemGet(weapon);
        announceWeapon(weapon);
      } else if (CARDS[pk.kind]){                             // CARTA: não some na mochila em silêncio
        const livre = !cardSlot[weapon];
        if (livre || addItem(pk.kind)){
          tiraChao(i);
          if (livre) cardSlot[weapon] = pk.kind;
          cardGetFx(pk.kind);
          showCard(pk.kind);
          toast(livre ? '🎁 carta encaixada!' : '🎁 carta na mochila');
          updateHUD();
        } else toast('🎒 cheia — a carta ESPERA no chão');     // carta nunca se perde por falta de espaço
      } else if (addItem(pk.kind)){
        tiraChao(i);
        if (POWERS[pk.kind]){                                 // poder é RARO: ergue, mostra e anuncia
          itemGet(pk.kind);
          bannerNaFila('PODER RARO!', 'lenda', 2400);
        }
        if (pk.kind === 'cheese') SFX.cheese(); else SFX.item();
        if (pk.kind === 'cheese' && player.hp < player.maxHp){ // o cheiro do queijo revigora
          const cura = hasCard('cslime') ? 3 : 1;            // Carta da Gosma: o queijo alimenta mais
          player.hp = Math.min(player.maxHp, player.hp + cura);
          updateHUD();
          toast(`🧀 +${cura} ❤️`);
        } else if (WEAPONS[pk.kind]) announceWeapon(pk.kind);
        else toast(pickupMsg(pk.kind));
      }
    }
  }
}
const dardos = [];                                            // riscos dos dardos: só visual, o dano é no disparo
function pisouNaPlaca(a){                                     // placa não escolhe freguês: bicho arma igual
  if (!current.placas) return;
  const pl = current.placas.find(q => q.x === a.tx && q.y === a.ty);
  if (!pl || pl.t > 0 || pl.cd > 0) return;
  pl.t = .4;
  SFX.ui();
  shake(a.isPlayer ? 1.6 : 1, .14);
  if (a.isPlayer) toast('☠️ clique…');
}
const placaEixos = pl => (pl.eixo === 2 ? [0, 1] : [pl.eixo]);   // a CRUZADA dispara nos dois
function laneTiles(pl){                                       // a fileira que o dardo varre, até bater em parede
  const tiles = [];
  for (const ex2 of placaEixos(pl))
    for (const sgn of [-1, 1])
      for (let k = 1; k < 14; k++){
        const nx = pl.x + (ex2 ? 0 : sgn * k), ny = pl.y + (ex2 ? sgn * k : 0);
        if (!current.over(nx, ny)) break;
        tiles.push([nx, ny]);
      }
  return tiles;
}
function dispararPlaca(pl){                                   // a fileira inteira leva — bicho também
  const tiles = laneTiles(pl);
  if (!tiles.length) return;
  const dmg = 2 + (current.level >= 25 ? 1 : 0);
  const ax = gX(pl.x, pl.y), ay = gY(pl.x, pl.y) - 12;
  // um dardo por PONTA da fileira (não um por tile): assim ele atravessa em vez de piscar
  const pontas = [];
  placaEixos(pl).forEach(ex2 => [-1, 1].forEach(sg => {
    const lado = tiles.filter(([nx, ny]) => (ex2 ? (ny - pl.y) && !(nx - pl.x) : (nx - pl.x) && !(ny - pl.y))
      && (ex2 ? ny - pl.y : nx - pl.x) * sg > 0);
    if (lado.length) pontas.push(lado[lado.length - 1]);
  }));
  pontas.forEach(([fx, fy]) => {
    dardos.push({ x0: ax, y0: ay, x1: gX(fx, fy), y1: gY(fx, fy) - 12, t: 0 });
    for (let i = 0; i < 5; i++)                               // lascas saltando da parede onde ele crava
      dust.push({ x: gX(fx, fy), y: gY(fx, fy) - 12, vx: (hash(i, 55) - .5) * 90,
        vy: -40 - hash(i, 56) * 50, gv: 200, life: .34 + hash(i, 57) * .2, kind: 'hit' });
  });
  for (let i = 0; i < 9; i++)                                 // fagulhas do gatilho estalando na chapa
    dust.push({ x: ax + (hash(i, 58) - .5) * 14, y: ay + 8, vx: (hash(i, 59) - .5) * 130,
      vy: -60 - hash(i, 60) * 70, gv: 240, life: .3 + hash(i, 61) * .22, kind: 'fireP' });
  SFX.whiff(); SFX.smash();
  shake(4.2, .3);
  hitStop = Math.max(hitStop, .05);                           // meio quadro travado: o tiro dá peso
  const bate = (v) => tiles.some(([nx, ny]) => v.tx === nx && v.ty === ny);
  if (bate(player)) applyHit(player, dmg, player.dir);
  current.actors.forEach(v => { if (v.hostile && !v.dead && bate(v)) applyHit(v, dmg, v.dir); });
}
function abrirBau(bu, quem){                                  // metade paga, metade cobra — de QUEM abriu
  const eu = quem || player, sapo = eu === player2;
  bu.aberto = true;
  puff(gX(bu.x, bu.y), gY(bu.x, bu.y) - 8, 7);
  const gx2 = gX(bu.x, bu.y), gy2 = gY(bu.x, bu.y);
  shake(2.6, .3);
  if (!bu.ruim){
    rings.push({ x: gx2, y: gy2, t: 0, gold: true });
    SFX.fanfare(); confettiBurst();
    // O baú bom largava poção + CORAÇÃO + poder de uma vez: era o jackpot que resolvia o andar
    // sozinho. O coração saiu — continua valendo o risco, sem ser vida máxima de graça.
    current.pickups.push({ x: bu.x, y: bu.y, kind: 'potion' });
    const viz = DIRV.map(([ox, oy]) => [bu.x + ox, bu.y + oy]).filter(([a2, b2]) => current.free(a2, b2));
    if (viz[0] && hash(bu.y * 17 + 3, bu.x) < .55) poePoder(viz[0][0], viz[0][1]);   // nem todo baú tem poder
    toast(`${sapo ? '🐸 ' : ''}🎁 o baú era bom!`);
    return;
  }
  rings.push({ x: gx2, y: gy2, t: 0 });
  SFX.fizzle();
  if (bu.castigo === 0){                                      // EMBOSCADA: o baú era isca
    const pool = FOES.filter(f => f.min <= current.level && current.level <= (f.max || 99));
    let n2 = 0;
    DIRV.concat([[1, 1], [-1, -1]]).forEach(([ox, oy]) => {
      const nx = bu.x + ox, ny = bu.y + oy;
      if (n2 >= 2 || !current.free(nx, ny) || occupied(nx, ny, null)) return;
      const f = pool[(hash(nx * 7 + ny, n2 + 3) * pool.length) | 0] || pool[0];
      if (!f) return;
      const hp2 = Math.round(f.hp * (1 + Math.max(0, current.level - 3) * .055));   // mesma curva do andar
      current.actors.push(makeActor(nx, ny, f.skin, { hostile: true, hp: hp2, maxHp: hp2, dmg: f.dmg,
        hopS: f.hopS, atkS: f.atkS, range: f.range, dir: n2, alerted: true, frost: !!f.frost, venom: !!f.venom }));
      current.actors[current.actors.length - 1].extra = FOES.indexOf(f);   // em sala, o convidado cria igual
      n2++;
    });
    toast('☠️ era isca!');
  } else if (bu.castigo === 1){                               // BAFORADA: veneno e um tapa em QUEM abriu
    if (sapo){ if (!cartaDe(player2, 'ctoad')){ p2PoisT = 6; p2PoisTk = 2; } }
    else if (!hasCard('ctoad')){ poisT = 6; poisTk = 2; }
    eu.invuln = 0;
    applyHit(eu, 3, eu.dir);
    for (let i = 0; i < 14; i++)
      dust.push({ x: gx2 + (hash(i, 81) - .5) * 26, y: gy2 - 8 - hash(i, 82) * 24,
        vx: (hash(i, 83) - .5) * 60, vy: -34 - hash(i, 84) * 30, life: .6, kind: 'hexP' });
    toast('☠️ baforada podre!');
  } else {                                                    // FERROLHO: os poderes travam
    const cds = cdDe(eu);
    Object.keys(POWERS).forEach(k2 => { cds[k2] = Math.max(cds[k2] || 0, 12); });
    toast(`${sapo ? '🐸 ' : ''}⏱️ poderes travados 12s`);
  }
}
function onPlayerLand(){
  if (onlineConvidado()) return;                              // o rato daqui é desenho do rato de lá
  collectPickups();                                         // coleta ANTES da porta: item caído no tile da porta não fica preso
  const key = player.tx + ',' + player.ty;
  const door = current.doors[key];
  if (door){
    if (door.to === 'dungeon') startRun();
    else if (!current.safe){ if (facingDoorOut()) openAsk(door); }   // só confirma saída MIRANDO a porta
    else goTo(door.to, door.spawn);
    return;
  }
  if (!current.safe && current.cleared && current.hell &&
      player.tx === current.hell.x && player.ty === current.hell.y){
    if (!hellOpen && hellDis !== player.tx + ',' + player.ty) openHell();   // pergunta antes: é aposta
    return;
  }
  if (hellDis && hellDis !== player.tx + ',' + player.ty) hellDis = '';     // saiu do tile: pode perguntar de novo
  if (!current.safe && current.cleared && current.exit &&
      player.tx === current.exit.x && player.ty === current.exit.y){
    if (current.level >= 40){
      goTo('home', [5, 6]);
      toast('👑 LENDA ♥️');
    } else enterDungeon(current.level + 1);
    return;
  }
  pisouNaPlaca(player);
  { const bu = current.baus && current.baus.find(q => q.x === player.tx && q.y === player.ty && !q.aberto);
    if (bu) abrirBau(bu); }
  if (current === home){                                      // baú abre ao encostar
    if (player.ty <= 2 && Math.abs(player.tx - 8) <= 2 && bueiroT <= 0 && Math.random() < .45){
      bueiroT = 4.5;                                          // passou perto do bueiro: às vezes tem alguém lá dentro
      bueiroX = Math.round((Math.random() - .5) * 20);
      SFX.low();
    }
    const dTv = Math.abs(player.tx - 0) + Math.abs(player.ty - 0);   // TV no canto (0,0): encostar TROCA de canal
    if (dTv === 1){
      tvCanal = (tvCanal + 1) % TV_CANAIS.length;
      SFX.ui();
      toast(`🖥 ${TV_CANAIS[tvCanal]}`);
    }
    const dCh = Math.abs(player.tx - 0) + Math.abs(player.ty - 6);
    if (dCh === 1) openChest(player);
    else if (chestOpen && chestDono === player) closeChest();
    const dWd = Math.abs(player.tx - 2) + player.ty;          // guarda-roupa em (2,0)
    if (dWd === 1) openWard(player);
    else if (wardOpen) closeWard();
  }
  if (current === SCENES.lanroom){                            // sentou numa máquina da lan
    const near = LAN_TILES.some(([px2, py2]) => Math.abs(player.tx - px2) + Math.abs(player.ty - py2) === 1);
    if (near) openLan();
    else if (lanOpen) closeLan();
  }
}
function respawn(){
  poderJaCaiu.clear();                                        // run nova: os poderes voltam à mesa
  player.hp = player.maxHp; player.dead = false; deadT = 0;
  player.mode = 'idle'; player.t = 0; player.invuln = 1.5;
  burnT = 0; frozT = 0; poisT = 0; leechT = 0; quakeT = 0; drillT = 0; iceTrailT = 0; edgeT = 0; stamT = 0; stamCd = 0;
  const lost = invN.reduce((a, b) => a + b, 0) + cheeseN;     // roguelike: o que não foi entregue, se perde
  for (let i = 0; i < BAG_MAX; i++){ inv[i] = null; invN[i] = 0; }
  cheeseN = 0;
  goTo('home', [5, 6]);
  toast(lost ? `💀 −${lost}` : '💀 ➡️ 🏠');
  updateHUD();
}

/* ---------------- PODER ESPECIAL ---------------- */
function doDash(d, quem){                                     // A ESCAVAÇÃO: mergulha e ressurge 2 tiles à frente
  const eu = quem || player;                                  // o sapo escava igualzinho ao rato
  eu.dir = d;
  const [dx, dy] = DIRV[d];
  const reach = leBuf(eu, 'drill') > 0 ? 4 : 2;                           // Broca: túnel o dobro de longo
  for (let s2 = 1; s2 < reach; s2++)
    if (!current.over(eu.tx + dx * s2, eu.ty + dy * s2)) return;   // parede não se escava — mas o fosso se passa por baixo
  const x2 = eu.tx + dx * reach, y2 = eu.ty + dy * reach;
  if (!canWalk(x2, y2, eu)) return;                       // precisa de chão livre pra irromper
  const cdd = (leBuf(eu, 'drill') > 0 ? .12 : .8) * (cartaDe(eu, 'ctoadB') ? .5 : 1)
    + (venenoDe(eu) ? CD_VENENO : 0);   // Broca: uma emenda na outra · Sapo Real: metade · veneno: +3s
  if (eu === player2) dashCd2 = cdd; else dashCd = cdd;
  SFX.dig();
  shake(3, .25);                                              // tranco do mergulho
  { const fx = document.getElementById('dashFx');             // flash branco nas laterais
    fx.classList.remove('play'); void fx.offsetWidth; fx.classList.add('play'); }
  eu.mode = 'burrow'; eu.t = 0; eu.sink = 0; eu.bhit = {};
  eu.from = [eu.tx, eu.ty]; eu.to = [x2, y2];
  trailAdd(eu.tx, eu.ty);
  for (let s2 = 1; s2 < reach; s2++) trailAdd(eu.tx + dx * s2, eu.ty + dy * s2);
  eu.tx = x2; eu.ty = y2;
  if (eu === player2 && cliente()) mandaPos(eu, 1);           // a escavação também é prevista aqui
  eu.capeVel -= 140;
  if (leBuf(eu, 'drill') > 0) powerFx('drill', { x: gX(eu.from[0], eu.from[1]), y: gY(eu.from[0], eu.from[1]) });
  if (leBuf(eu, 'quake') > 0) quakeBlast(eu.from[0], eu.from[1], 3);   // Terremoto: o mergulho já detona
}
function quakeBlast(tx, ty, dmg){                              // o chão estoura nos 8 tiles em volta
  const x = gX(tx, ty), y = gY(tx, ty);
  SFX.quake();
  shake(5, .32);
  hitStop = Math.max(hitStop, .06);
  powerFx('quake', { x, y });
  rings.push({ x, y, t: 0, soil: true });
  for (let ox = -1; ox <= 1; ox++)
    for (let oy = -1; oy <= 1; oy++){
      if (!ox && !oy) continue;
      const nx = tx + ox, ny = ty + oy;
      if (!current.free(nx, ny)) continue;
      soilBurst(gX(nx, ny), gY(nx, ny), 4);
      smashProp(nx, ny);
      const d2 = Math.abs(ox) >= Math.abs(oy) ? (ox > 0 ? 0 : 2) : (oy > 0 ? 1 : 3);
      current.actors.forEach(v => { if (v.hostile && !v.dead && hitsAt(v, nx, ny)) applyHit(v, dmg, d2); });
    }
}
function burrowOut(a){                                         // irrupção: a terra explode e sacode quem está colado
  const x = gX(a.to[0], a.to[1]), y = gY(a.to[0], a.to[1]);
  soilBurst(x, y, 22);
  rings.push({ x, y, t: 0, soil: true });                     // a onda bate nos vizinhos
  rings.push({ x, y, t: -.06, soil: true });                   // segundo anel, meio quadro depois
  SFX.burst();
  shake(4.5, .3, a.dir);
  puff(x, y, 6);
  if (!a.isPlayer && !a.ally) return;                          // o sapo escava igual, e a irrupção dele fere igual
  cartaDono = a.ally ? player2 : player;                       // quem irrompeu leva o brasão do que cair
  { const sc = current.secrets.find(s2 => !s2.taken && s2.x === a.to[0] && s2.y === a.to[1]);
    if (sc){ sc.taken = true; secretLoot(sc.x, sc.y); } }   // cavou no lugar certo
  if (leBuf(a, 'quake') > 0) quakeBlast(a.to[0], a.to[1], 5);  // Terremoto: a irrupção detona a vizinhança
  tileQuake(a.to[0], a.to[1]);                                // o chão em volta salta e volta
  const half = Math.max(1, Math.round(danoDe(a) * .5));       // meio golpe: o chão levantado machuca
  let hitAny = 0;
  current.actors.filter(v => v.hostile && !v.dead).forEach(v => {
    const ddx = v.tx - a.to[0], ddy = v.ty - a.to[1];
    if (Math.abs(ddx) + Math.abs(ddy) !== 1) return;          // SÓ os 4 tiles que fazem fronteira
    const d2 = Math.abs(ddx) >= Math.abs(ddy) ? (ddx > 0 ? 0 : 2) : (ddy > 0 ? 1 : 3);
    const nx = v.tx + Math.sign(ddx), ny = v.ty + Math.sign(ddy);
    if (v.mode === 'idle' && canWalk(nx, ny, v)){             // e ainda são empurrados
      v.mode = 'hurt'; v.t = 0;
      v.from = [v.tx, v.ty]; v.to = [nx, ny];
      v.tx = nx; v.ty = ny;
    }
    const hp0 = v.hp;
    applyHit(v, half, d2);
    if (v.hp < hp0){                                          // reagiu de verdade: mostra isso
      hitAny++;
      recoil(v, d2, 8, 7);                                    // leva o tranco E salta com o tile
      soilBurst(gX(v.tx, v.ty), gY(v.tx, v.ty), 5);
      sparks.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty) - 20, t: 0, big: false });
    }
  });
  if (hitAny) hitStop = Math.max(hitStop, .055);              // trava o quadro: dá pra sentir a pancada
}
function doStam(quem, mudo){                                   // stamina: 5s de corrida a 1.5x (rato E sapo)
  const eu = quem || player;
  if (caidoDe(eu) || transitioning || anyPanel()) return false;
  if (eu === player2){
    if (stamT2 > 0) return false;
    if (stamCd2 > 0){ if (!mudo) toast(`⚡ ${Math.ceil(stamCd2)}s`); return false; }
    stamT2 = 5; stamCd2 = stamCdMax2() + (venenoDe(player2) ? CD_VENENO : 0);
  } else {
    if (stamT > 0) return false;
    if (stamCd > 0){ if (!mudo) toast(`⚡ ${Math.ceil(stamCd)}s`); return false; }
    stamT = 5; stamCd = stamCdMax() + (venenoDe(player) ? CD_VENENO : 0);
  }
  SFX.stam();
  shake(2, .22);
  eu.capeVel -= 120;
  puff(gX(eu.x, eu.y), gY(eu.x, eu.y), 6);
  toast(`${eu === player2 ? '🐸 ' : ''}⚡ ⚔️+1 · 5s`);
  return true;
}
const rings = [];
function doSpecial(quem, mudo){                                // vale pro RATO e pro SAPO: quem lança é o `eu`
  // devolve TRUE se o poder saiu mesmo. O frame() usa isso pra guardar o pedido por um instante:
  // apanhando um tranco no momento do aperto, o poder saía do nada — e no 2 jogadores, com o dobro
  // de bichos batendo, isso virava "o poder não funciona".
  const eu = quem || player;
  cartaDono = eu;                                             // o que o poder derrubar é carta DELE
  const pw = poderDe(eu), cds = cdDe(eu);
  const meX = () => gX(eu.x, eu.y), meY = () => gY(eu.x, eu.y);
  if (caidoDe(eu) || transitioning || anyPanel()) return false;
  if (!pw){
    // SEM PODER na mão: em vez de só reclamar, o botão de poder EQUIPA o que estiver na mochila.
    // No controle dá vontade de apertar o X (o botão do poder) pra equipar um poder, e não o Y.
    const bag = invDe(eu), qs = eu === player2 ? quick2 : quickSlot, teto = maxInvDe(eu);
    let idx = (qs < teto && POWERS[bag[qs]]) ? qs : -1;       // o da MÃO tem preferência
    if (idx < 0) for (let k = 0; k < teto; k++) if (POWERS[bag[k]]){ idx = k; break; }
    if (idx >= 0){ onInvClick(idx, eu); return true; }
    if (!mudo) toast('✖️ sem poder');
    return false;
  }
  if ((cds[pw] || 0) > 0){ if (!mudo) toast(`⏳ ${Math.ceil(cds[pw])}s`); return false; }
  if (eu.mode !== 'idle' && eu.mode !== 'turn') return false;
  // VENENO: em vez de sangrar, EMPERRA — +3s em toda recarga enquanto durar.
  cds[pw] = POWERS[pw].cd + (venenoDe(eu) ? CD_VENENO : 0);
  castCircle(CAST_COL[pw], eu);                               // círculo de invocação sob os pés
  chromaT = .38;                                              // aberração cromática no impacto do poder
  shake(3, .3);
  { const fx = document.getElementById('pwrFx');              // lampejo roxo nas laterais
    fx.classList.remove('play'); void fx.offsetWidth; fx.classList.add('play'); }
  eu.capeVel -= 150;
  const hostiles = current.actors.filter(v => v.hostile && !v.dead);
  const pf = powerFx(pw, { vd: w2s(eu.dir), x: meX(), y: meY() });         // teatro próprio de cada poder
  if (SFX[pw]) SFX[pw]();                               // som próprio de cada poder
  /* A Isca de Queijo saiu do jogo a pedido. A maquinaria dela (`isca`, `estouraIsca`, `drawIsca`
     e o desvio de alvo no `enemyCtrl`) continua no arquivo, inerte: nada mais planta uma. */
  if (pw === 'spin'){                                        // giratório: dano EM DOBRO, e pega em volta
    // Este galho estava DUPLICADO e o primeiro vinha vazio ("} else if (pw === 'spin'){  } else if
    // (pw === 'spin'){"): o poder casava com o vazio e não fazia nada desde a v1.03, quando eu
    // recortei o poder 'knife' e deixei o cabeçalho do 'spin' pra trás.
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    for (let d2 = 0; d2 < 4; d2++) slashes.push({ a: { x: eu.x, y: eu.y, dir: d2 }, t: 0 });
    const giroDmg = danoDe(eu) * 2;                          // o dobro do golpe ATUAL (arma + buffs)
    for (let d2 = 0; d2 < 4; d2++){
      const [ox, oy] = DIRV[d2];
      smashProp(eu.tx + ox, eu.ty + oy);
    }
    hostiles.forEach(v => {
      const dx = v.tx - eu.tx, dy = v.ty - eu.ty;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (!dx && !dy)) return;   // as 8 casas em volta
      const d3 = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3);
      applyHit(v, giroDmg, d3, true);
    });
  } else if (pw === 'bomb'){                               // bomba de lodo: área grande, dano alto
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 8, t: 0, goo: true });
    hostiles.forEach(v => {
      const dx = v.tx - eu.tx, dy = v.ty - eu.ty;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist >= 1 && dist <= 2)
        applyHit(v, 5, Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3));
    });
    toast('💥 5');
  } else if (pw === 'hex'){                                // PRAGA: marca os bichos e todo dano dobra neles
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 8, t: 0, hex: true });
    let n2 = 0;
    hostiles.forEach(v => {
      if (Math.abs(v.tx - eu.tx) + Math.abs(v.ty - eu.ty) > 4) return;
      v.hexT = 8; n2++;
      for (let i = 0; i < 6; i++)
        dust.push({ x: gX(v.x, v.y) + (hash(i, 91) - .5) * 16, y: gY(v.x, v.y) - 10 - hash(i, 92) * 20,
          vy: -26, life: .5, kind: 'hexP' });
    });
    toast('🎃 ×2 em ' + n2 + ' · 8s');
  } else if (pw === 'lantern'){                            // LANTERNA: abóbora que estoura e incendeia
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 8, t: 0, jack: true });
    hostiles.forEach(v => {
      const dx = v.tx - eu.tx, dy = v.ty - eu.ty;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist >= 1 && dist <= 2){
        v.burnT = 4; v.burnTk = 0;
        applyHit(v, 7, Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3));
      }
    });
    toast('🎃 7 + fogo');
  } else if (pw === 'coven'){                              // REVOADA: o bando varre a sala inteira
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 8, t: 0, wide: true, hex: true });
    hostiles.forEach(v => {
      for (let i = 0; i < 7; i++)                             // penas riscando de cima pra baixo em cada alvo
        dust.push({ x: gX(v.x, v.y) - 26 + i * 8, y: gY(v.x, v.y) - 42 - hash(i, 96) * 16,
          vx: 120 + hash(i, 97) * 70, vy: 150 + hash(i, 98) * 60, life: .34 + hash(i, 99) * .14, kind: 'crowP' });
      applyHit(v, 4, v.dir);
    });
    shake(3, .4);
    toast('🎃 4 em todos');
  } else if (pw === 'leech'){                              // beijo da sanguessuga: lifesteal temporário
    poeBuf(eu, 'leech', 10);
    pf.pts = hostiles.slice(0, 8).map(v => [gX(v.x, v.y), gY(v.x, v.y)]);   // fios saem de cada bicho
    toast('🩸 10s');
  } else if (pw === 'nova'){                               // congela o campo de batalha
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 8, t: 0, ice: true });
    hostiles.forEach(v => {
      const dx = v.tx - eu.tx, dy = v.ty - eu.ty;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist >= 1 && dist <= 3){
        v.frzT = 4;
        applyHit(v, 2, Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3));
      }
    });
    toast('❄️ 4s');
  } else if (pw === 'aegis'){                              // casaco de gelo: invencibilidade total
    poeBuf(eu, 'aegis', 5);
    for (let i = 0; i < 10; i++)
      dust.push({ x: gX(eu.x, eu.y) + (hash(i, 77) - .5) * 22, y: gY(eu.x, eu.y) - 8 - hash(i, 78) * 30, vy: -14, life: .5, kind: 'iceP' });
    toast('🛡️ 5s');
  } else if (pw === 'rocks'){                              // chuva de pedras: o teto desaba
    const alvos = [];
    for (let k = 0; k < 5; k++){
      for (let t2 = 0; t2 < 12; t2++){
        const ox = ((hash(k * 7 + t2, (performance.now() | 0) % 97) * 7) | 0) - 3;
        const oy = ((hash(k * 13 + t2, (performance.now() | 0) % 89) * 7) | 0) - 3;
        if (!ox && !oy) continue;
        if (Math.abs(ox) + Math.abs(oy) > 3) continue;
        const nx = eu.tx + ox, ny = eu.ty + oy;
        if (!current.free(nx, ny)) continue;
        alvos.push([nx, ny]);
        break;
      }
    }
    pf.pts = alvos.map(([nx, ny]) => [gX(nx, ny), gY(nx, ny)]);
    alvos.forEach(([nx, ny], k) => {
      soilBurst(gX(nx, ny), gY(nx, ny), 4);
      hostiles.forEach(v => {
        if (!hitsAt(v, nx, ny)) return;
        const dx2 = v.tx - eu.tx, dy2 = v.ty - eu.ty;
        applyHit(v, 3, Math.abs(dx2) >= Math.abs(dy2) ? (dx2 > 0 ? 0 : 2) : (dy2 > 0 ? 1 : 3));
      });
      if (k === 0) shake(4, .3);
    });
    toast('🪨 5');
  } else if (pw === 'rage'){                               // FÚRIA RATEIRA: dano em dobro por 10s
    poeBuf(eu, 'rage', 10);
    powerFx('rage', { x: meX(), y: meY() });
    SFX.charged(); shake(2.4, .3);
    for (let i = 0; i < 14; i++){                             // baforada vermelha subindo do ratinho
      const an = i / 14 * 6.2832;
      dust.push({ x: gX(eu.x, eu.y) + Math.cos(an) * 8, y: gY(eu.x, eu.y) - 12,
        vx: Math.cos(an) * 46, vy: -34 - hash(i, 71) * 40, life: .5, kind: 'auraP', ci: '232,90,90', sz: 2 });
    }
    toast('😡 ×2 · 10s');
  } else if (pw === 'edge'){                               // FIO AFIADO: a lâmina fica sedenta
    poeBuf(eu, 'edge', 10);
    powerFx('edge', { x: meX(), y: meY() });
    SFX.charged();
    for (let i = 0; i < 12; i++)                              // fagulhas douradas correndo pela lâmina
      dust.push({ x: gX(eu.x, eu.y) + (hash(i, 72) - .5) * 20, y: gY(eu.x, eu.y) - 14 - hash(i, 73) * 18,
        vx: (hash(i, 74) - .5) * 40, vy: -30 - hash(i, 75) * 30, life: .5, kind: 'auraP', ci: '246,206,90', sz: 2 });
    toast('✨ +25% crít · ×3 · 10s');
  } else if (pw === 'thrust'){                             // ESTOCADA: a lâmina fura a fileira
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    powerFx('thrust', { dir: eu.dir, x: meX(), y: meY() });
    const [tdx, tdy] = DIRV[eu.dir];
    const dano = danoDe(eu) + 1;
    let acertou = 0;
    for (let k = 1; k <= 3; k++){                             // o furo ATRAVESSA o fosso: vê-se e fura por cima
      const nx = eu.tx + tdx * k, ny = eu.ty + tdy * k;
      if (!current.over(nx, ny)) break;
      slashes.push({ a: { x: nx - tdx, y: ny - tdy, dir: eu.dir }, t: 0 });
      hostiles.filter(v => hitsAt(v, nx, ny)).forEach(v => { applyHit(v, dano, eu.dir); acertou++; });
    }
    SFX.swing();
    if (acertou) shake(2.6, .22);
    toast('⚔️ ' + dano);
  } else if (pw === 'heal'){                               // queijo de emergência
    const cura = Math.min(4, eu.maxHp - eu.hp);
    eu.hp += cura;
    dmgNum(eu.tx, eu.ty, cura, 'green');
    hearts(gX(eu.x, eu.y), gY(eu.x, eu.y));
    toast(cura ? `🧀 +${cura}` : '🧀 …');
  } else if (pw === 'icetrail'){                           // trilha congelada
    poeBuf(eu, 'iceTrail', 8);
    addIce(eu.tx, eu.ty);
    toast('🧊 8s');
  } else if (pw === 'shards'){                             // três lascas em leque
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    const dirs = [eu.dir, (eu.dir + 1) % 4, (eu.dir + 3) % 4];
    pf.pts = [];
    dirs.forEach((d3, i) => {
      const [dx3, dy3] = DIRV[d3];
      let tgt = null, reach = 0;
      for (let s3 = 1; s3 <= 4 && !tgt; s3++){
        const nx = eu.tx + dx3 * s3, ny = eu.ty + dy3 * s3;
        if (!current.over(nx, ny)) break;                     // os estilhaços voam por cima do fosso
        reach = s3;
        tgt = hostiles.find(v => hitsAt(v, nx, ny)) || null;
      }
      const ex2 = eu.tx + dx3 * Math.max(1, reach), ey2 = eu.ty + dy3 * Math.max(1, reach);
      pf.pts.push([gX(ex2, ey2), gY(ex2, ey2) - 18]);
      dust.push({
        x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 18,
        vx: (gX(ex2, ey2) - gX(eu.x, eu.y)) / .18,
        vy: (gY(ex2, ey2) - gY(eu.x, eu.y)) / .18,
        life: .18, kind: 'iceS', ph: i * 2,
      });
      if (tgt){ tgt.frzT = 1.5; applyHit(tgt, 3, d3); }
    });
    toast('❄️ ×3');
  } else if (pw === 'miasma'){                             // névoa tóxica
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([ox, oy]) => {
      const nx = eu.tx + ox, ny = eu.ty + oy;
      if (current.free(nx, ny)) clouds.push({ x: nx, y: ny, t: 6 });
    });
    miasmaTk = .4;
    toast('☠️ 6s');
  } else if (pw === 'bubble'){                             // bolha de lodo: engarrafa o mais perto
    let alvo = null, melhor = 99;
    hostiles.forEach(v => {
      const d3 = Math.abs(v.tx - eu.tx) + Math.abs(v.ty - eu.ty);
      if (d3 <= 4 && d3 < melhor){ melhor = d3; alvo = v; }
    });
    if (alvo){
      alvo.frzT = 3;
      applyHit(alvo, 2, eu.dir);
      pf.x2 = gX(alvo.x, alvo.y); pf.y2 = gY(alvo.x, alvo.y) - 16;
      toast('🫧 3s');
    } else toast('🫧 …');
  } else if (pw === 'quake'){                              // terremoto: a Escavação vira bomba
    poeBuf(eu, 'quake', 10);
    quakeBlast(eu.tx, eu.ty, 3);                      // ativar já bate o pé no chão
    toast('💥 10s');
  } else if (pw === 'drill'){                              // broca: túnel longo e recarga instantânea
    poeBuf(eu, 'drill', 10);
    dashCd = 0;
    toast('🕳️ 4 tiles · 10s');
  } else if (pw === 'shock'){                              // onda que arremessa tudo pra longe (sem dano)
    eu.mode = 'attack'; eu.t = 0; eu.struck = true;
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 8, t: 0 });
    hostiles.forEach(v => {
      const dx = v.tx - eu.tx, dy = v.ty - eu.ty;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist >= 1 && dist <= 3){
        const sx2 = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
        const sy2 = sx2 ? 0 : Math.sign(dy);
        let bx = v.tx, by = v.ty;
        for (let s2 = 0; s2 < 4; s2++){                       // desliza até 4 tiles até bater em algo
          if (!canWalk(bx + sx2, by + sy2, v)) break;
          bx += sx2; by += sy2;
        }
        if (bx !== v.tx || by !== v.ty){
          v.mode = 'hurt'; v.t = 0;
          v.from = [v.tx, v.ty]; v.to = [bx, by];
          v.tx = bx; v.ty = by;
        }
        v.flash = .16;
      }
    });
    toast('💨');
  }
  updateHUD();
  return true;
}
function drawRings(dt){
  for (let i = rings.length - 1; i >= 0; i--){
    const r = rings[i];
    r.t += dt;
    const pr = r.t / .4;
    if (pr >= 1){ rings.splice(i, 1); continue; }
    if (pr < 0) continue;                                     // anel atrasado: ainda não começou
    const rad = 8 + pr * TW * (r.wide ? 2.9 : r.ice || r.gold ? 2.2 : 1.6);
    const cA = r.ice ? '140,212,240' : r.goo ? '130,210,90' : r.gold ? '240,200,110' : r.jack ? '250,150,40' : r.soil ? '150,140,120' : '180,160,232';
    const cB = r.ice ? '224,248,255' : r.goo ? '210,250,180' : r.gold ? '255,240,200' : r.jack ? '255,225,120' : r.soil ? '215,200,175' : '232,220,255';
    g.strokeStyle = `rgba(${cA},${.7 - pr * .7})`; g.lineWidth = 2;
    g.beginPath(); g.ellipse(r.x, r.y, rad, rad * pitch * .6, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = `rgba(${cB},${.5 - pr * .5})`; g.lineWidth = 1;
    g.beginPath(); g.ellipse(r.x, r.y, rad * .7, rad * .7 * pitch * .6, 0, 0, Math.PI * 2); g.stroke();
  }
}

/* ---- círculo de invocação e pilar de nível: o teatro dos MMOs ---- */
const CAST_COL = {
  spin: '240,140,90', shock: '150,220,255', thrust: '214,232,255', rage: '232,90,90', knife: '210,222,238',
  edge: '255,220,130',
  nova: '150,225,255', aegis: '150,215,255', bomb: '150,220,110', leech: '210,90,150',
  heal: '240,205,110', icetrail: '150,225,255',
  shards: '196,238,255', miasma: '132,200,86', bubble: '150,220,120',
};
const castFx = [], levelFx = [];
function castCircle(col, eu){                                 // o sapo também lança poder: o círculo é de quem lançou
  const q = eu || player;
  castFx.push({ x: gX(q.x, q.y), y: gY(q.x, q.y), t: 0, col: col || '178,150,255' });
}
function drawCastFx(dt){
  for (let i = castFx.length - 1; i >= 0; i--){
    const c = castFx[i];
    c.t += dt;
    const T = .8, q = c.t / T;
    if (q >= 1){ castFx.splice(i, 1); continue; }
    const al = q < .16 ? q / .16 : 1 - (q - .16) / .84;
    const R = TW * (.4 + q * .3), ry = R * pitch * .62;
    const a2 = al.toFixed(2);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(${c.col},${(al * .5).toFixed(2)})`; g.lineWidth = 2;
    g.beginPath(); g.ellipse(c.x, c.y, R, ry, 0, 0, 6.2832); g.stroke();
    g.strokeStyle = `rgba(${c.col},${(al * .28).toFixed(2)})`; g.lineWidth = 1;
    g.beginPath(); g.ellipse(c.x, c.y, R * .64, ry * .64, 0, 0, 6.2832); g.stroke();
    for (let k = 0; k < 8; k++){                              // runas girando em sentidos opostos
      const an = c.t * 3.2 + k * .7854;
      P(c.x + Math.cos(an) * R - 1, c.y + Math.sin(an) * ry - 1, 3, 2, `rgba(${c.col},${a2})`);
      const bn = -c.t * 2.1 + k * .7854 + .39;
      P(c.x + Math.cos(bn) * R * .64 - 1, c.y + Math.sin(bn) * ry * .64 - 1, 2, 2, `rgba(255,255,255,${(al * .65).toFixed(2)})`);
    }
    for (let k = 0; k < 7; k++){                              // motas de mana subindo do círculo
      const ph = (q * 1.4 + k / 7) % 1, an = k * 1.9 + c.t * .8;
      P(c.x + Math.cos(an) * R * .82, c.y + Math.sin(an) * ry * .82 - ph * 36, 2, 2,
        `rgba(${c.col},${((1 - ph) * al).toFixed(2)})`);
    }
    g.restore();
  }
}
function levelUpFx(){                                         // SUBIU DE NÍVEL: pilar dourado e anéis
  levelFx.push({ x: gX(player.x, player.y), y: gY(player.x, player.y), t: 0 });
  SFX.levelup();
  shake(2, .4);
  toast('✨ SUBIU DE NÍVEL!');
}
function drawLevelFx(dt){
  for (let i = levelFx.length - 1; i >= 0; i--){
    const l = levelFx[i];
    l.t += dt;
    const T = 1.6, q = l.t / T;
    if (q >= 1){ levelFx.splice(i, 1); continue; }
    const al = q < .12 ? q / .12 : 1 - (q - .12) / .88;
    const h = 62 + q * 46, w = 13 + Math.sin(l.t * 9) * 2;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const gr = g.createLinearGradient(l.x, l.y, l.x, l.y - h);
    gr.addColorStop(0, `rgba(255,226,140,${(al * .5).toFixed(2)})`);
    gr.addColorStop(.45, `rgba(255,242,196,${(al * .26).toFixed(2)})`);
    gr.addColorStop(1, 'rgba(255,242,196,0)');
    g.fillStyle = gr; g.fillRect(l.x - w, l.y - h, w * 2, h);
    for (let k = 0; k < 3; k++){                              // feixes finos ladeando o pilar
      const off = (k + 1) * 7, hh = h * (.8 - k * .16);
      const a3 = (al * (.3 - k * .07)).toFixed(2);
      P(l.x - off, l.y - hh, 1, hh, `rgba(255,240,180,${a3})`);
      P(l.x + off, l.y - hh, 1, hh, `rgba(255,240,180,${a3})`);
    }
    for (let k = 0; k < 14; k++){                             // fagulhas douradas subindo
      const ph = (q * 1.25 + k / 14) % 1, an = k * 1.7;
      P(l.x + Math.cos(an) * (10 + ph * 14), l.y - ph * (h + 14) + Math.sin(an) * 3, 2, 2,
        `rgba(255,${210 + ((k % 3) * 15)},140,${((1 - ph) * al).toFixed(2)})`);
    }
    g.restore();
    if (!l.r1 && l.t > .04){ l.r1 = 1; rings.push({ x: l.x, y: l.y, t: 0, gold: true }); }
    if (!l.r2 && l.t > .3){ l.r2 = 1; rings.push({ x: l.x, y: l.y, t: 0, gold: true }); }
    if (!l.r3 && l.t > .58){ l.r3 = 1; rings.push({ x: l.x, y: l.y, t: 0, gold: true }); }
  }
}

/* ---- animação própria de cada poder: chão (sob os atores) e ar (sobre eles) ---- */
const pfx = [];
const PFX_T = { spin: .5, cspin: .62, shock: .55, blink: .5, rage: .95, knife: .34, nova: .85, aegis: .8,
  bomb: .75, leech: 1, quake: .75, drill: .8,
  thrust: .4, edge: .9, heal: .9, icetrail: .7, shards: .45, miasma: .9, bubble: .7 };
function powerFx(kind, o){
  const e = Object.assign({ kind, t: 0, T: PFX_T[kind] || .6, x: gX(player.x, player.y), y: gY(player.x, player.y) }, o || {});
  pfx.push(e);
  return e;
}
function updatePfx(dt){
  for (let i = pfx.length - 1; i >= 0; i--){ pfx[i].t += dt; if (pfx[i].t >= pfx[i].T) pfx.splice(i, 1); }
}
const isoRing = (x, y, r, col, lw) => {                       // anel deitado no chão isométrico
  g.strokeStyle = col; g.lineWidth = lw || 1;
  g.beginPath(); g.ellipse(x, y, r, Math.max(1, r * pitch * .62), 0, 0, 6.2832); g.stroke();
};
const PFX_GND = {
  cspin(e, q){                                                // GIRO CARREGADO: varredura azul que freia no chão
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    const an = spinTurn(q), R = 14 + q * 26;
    for (let s2 = 5; s2 >= 0; s2--){                          // ecos da lâmina raspando o piso
      const a2 = an - s2 * .4, f = s2 / 6;
      g.strokeStyle = `rgba(${s2 ? '110,196,255' : '226,248,255'},${(al * (1 - f) * .75).toFixed(2)})`;
      g.lineWidth = s2 < 2 ? 3 : 2;
      g.beginPath();
      g.ellipse(e.x, e.y, R, Math.max(1, R * pitch * .62), 0, a2, a2 + .5);
      g.stroke();
    }
    isoRing(e.x, e.y, 8 + ease(Math.min(1, q * 1.5)) * 42, `rgba(150,225,255,${(al * .45).toFixed(2)})`, 2);
    glowOval(e.x, e.y, 36, 36 * pitch * .62, '80,180,255', al * .3);
  },
  spin(e, q){                                                 // vento levantado pelo rodopio
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++)
      isoRing(e.x, e.y, 10 + q * 30 + k * 5, `rgba(226,236,255,${(al * (.3 - k * .08)).toFixed(2)})`, 2);
  },
  shock(e, q){                                                // frentes de onda avançando em cone
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    const [dx, dy] = DIRV[e.vd || 0];
    const ux = (dx - dy) * .5, uy = (dx + dy) * .25, ang = Math.atan2(uy, ux);
    for (let k = 0; k < 4; k++){
      const t2 = q * 1.35 - k * .13;
      if (t2 <= 0 || t2 > 1) continue;
      const d = t2 * TW * 2.6, rr = 12 + t2 * 26;
      g.strokeStyle = `rgba(190,235,255,${((1 - t2) * al).toFixed(2)})`;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(e.x + ux * d, e.y + uy * d, rr * .45, rr, ang, -1.15, 1.15);
      g.stroke();
    }
  },
  nova(e, q){                                                 // hexágono glacial com lascas nos vértices
    const al = 1 - q, R = 12 + q * TW * 1.5;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(200,240,255,${(al * .8).toFixed(2)})`; g.lineWidth = 2;
    g.beginPath();
    for (let k = 0; k <= 6; k++){
      const an = k * 1.047 + .3;
      const px = e.x + Math.cos(an) * R, py = e.y + Math.sin(an) * R * pitch * .62;
      k ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    const hh = Math.max(0, Math.sin(q * 3.1416) * 13);
    for (let k = 0; k < 6; k++){
      const an = k * 1.047 + .3;
      const px = e.x + Math.cos(an) * R, py = e.y + Math.sin(an) * R * pitch * .62;
      P(px - 1, py - hh, 3, hh, `rgba(190,235,255,${al.toFixed(2)})`);
      P(px, py - hh - 2, 1, 3, `rgba(255,255,255,${al.toFixed(2)})`);
    }
  },
  bomb(e, q){                                                 // lodo estourando em ondas e respingos
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++)
      isoRing(e.x, e.y, 8 + q * TW * (1.1 + k * .3),
        `rgba(${k ? '120,210,90' : '190,250,150'},${(al * (.6 - k * .16)).toFixed(2)})`, 2);
    g.globalCompositeOperation = 'source-over';
    for (let k = 0; k < 11; k++){
      const an = k * .571, d = q * 36 * (.55 + hash(k, 9) * .8);
      E(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * pitch, Math.max(1, 3 - q * 2), Math.max(1, 2 - q),
        `rgba(90,170,70,${(al * .85).toFixed(2)})`);
    }
  },
  stop(e, q){                                                 // raízes irrompendo em roda e prendendo tudo
    const al = q < .22 ? q / .22 : 1 - (q - .22) / .78;
    const R = TW * (.5 + q * .5);
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, R, `rgba(120,200,80,${(al * .6).toFixed(2)})`, 2);
    isoRing(e.x, e.y, R * .8, `rgba(90,170,60,${(al * .28).toFixed(2)})`, 1);
    const br = Math.min(1, q * 2.4) ** .4;                    // brotam rápido e travam
    for (let k = 0; k < 10; k++){                             // cada raiz sobe torta e abre em garra
      const an = k * .6283 + hash(k, 31) * .3;
      const len = R * (.55 + hash(k, 37) * .45) * br;
      const bx = e.x + Math.cos(an) * len, by = e.y + Math.sin(an) * len * pitch * .62;
      for (let s2 = 0; s2 < len; s2 += 3){
        const u = s2 / Math.max(1, len);
        P(e.x + Math.cos(an) * s2 + Math.sin(u * 9 + k) * 2,
          e.y + Math.sin(an) * s2 * pitch * .62 - u * 9,
          2, 2, `rgba(${u > .6 ? '150,220,90' : '96,150,60'},${al.toFixed(2)})`);
      }
      P(bx - 1, by - Math.round(9 * br) - 3, 3, 4, `rgba(170,235,110,${al.toFixed(2)})`);
    }
  },
  quake(e, q){                                                // rachaduras correndo pelo chão
    const al = 1 - q;
    for (let k = 0; k < 10; k++){
      const an = k * .628 + hash(k, 13) * .35;
      const len = (12 + hash(k, 17) * 28) * Math.min(1, q * 2.4);
      for (let s2 = 0; s2 < len; s2 += 3)
        P(e.x + Math.cos(an) * s2 + (hash(k * 7 + s2, 23) - .5) * 3,
          e.y + Math.sin(an) * s2 * pitch * .62, 2, 2, `rgba(12,14,20,${(al * .8).toFixed(2)})`);
    }
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, 10 + q * TW * 1.5, `rgba(214,194,152,${(al * .55).toFixed(2)})`, 3);
  },
  thrust(e, q){                                               // trilho de luz na fileira furada
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    (e.pts || []).forEach(([px, py], i2) => {
      const t2 = Math.min(1, Math.max(0, q * 3 - i2 * .18));
      if (t2 <= 0) return;
      isoRing(px, py + 18, 6 + t2 * 16, `rgba(214,232,255,${(al * .6).toFixed(2)})`, 2);
    });
  },
  rage(e, q){
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, 8 + q * 28, `rgba(255,90,70,${((1 - q) * .6).toFixed(2)})`, 2);
  },
  drill(e, q){
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, 6 + q * 24, `rgba(214,190,146,${((1 - q) * .5).toFixed(2)})`, 2);
  },
  miasma(e, q){                                               // anel do gás se espalhando
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 2; k++)
      isoRing(e.x, e.y, 10 + q * (TW * (.9 + k * .35)),
        `rgba(132,200,86,${((1 - q) * (.45 - k * .16)).toFixed(2)})`, 2);
  },
  icetrail(e, q){                                             // sopro gelado saindo dos pés
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, 8 + q * 30, `rgba(170,232,255,${((1 - q) * .55).toFixed(2)})`, 2);
    for (let k = 0; k < 8; k++){
      const an = k * .785 + q * 1.4, r = 10 + q * 26;
      P(e.x + Math.cos(an) * r, e.y + Math.sin(an) * r * pitch * .62, 2, 2,
        `rgba(226,246,255,${(1 - q).toFixed(2)})`);
    }
  },
  rewind(e, q){                                               // a semente puxa o ratinho de volta
    g.globalCompositeOperation = 'lighter';
    const al = 1 - q;
    isoRing(e.x, e.y, 8 + q * 22, `rgba(150,220,110,${(al * .5).toFixed(2)})`, 2);
    if (e.x2 == null) return;
    isoRing(e.x2, e.y2, 22 - q * 14, `rgba(200,250,150,${(al * .7).toFixed(2)})`, 2);
    for (let k = 0; k < 9; k++){                              // sementinhas correndo pelo cipó
      const u = k / 9, ph = (q * 1.5 + u) % 1;
      P(e.x + (e.x2 - e.x) * ph, e.y + (e.y2 - e.y) * ph - 14, 2, 2,
        `rgba(190,245,140,${((1 - ph) * al).toFixed(2)})`);
    }
  },
  bubble(e, q){
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, 8 + q * 20, `rgba(150,220,120,${((1 - q) * .45).toFixed(2)})`, 2);
  },
  heal(e, q){
    g.globalCompositeOperation = 'lighter';
    isoRing(e.x, e.y, 10 + q * 24, `rgba(240,205,110,${((1 - q) * .5).toFixed(2)})`, 2);
  },
};
const PFX_AIR = {
  cspin(e, q){                                                // GIRO CARREGADO: uma lâmina só, com eco longo
    const al = 1 - q * .8;
    g.globalCompositeOperation = 'lighter';
    const an = spinTurn(q);
    const r = 26 - q * 5, yy = e.y - 15 - Math.sin(q * Math.PI) * 9;   // sobe e desce junto com o corpo
    for (let s2 = 7; s2 >= 0; s2--){                          // o eco é a mesma lâmina sete quadros atrás
      const a2 = an - s2 * .28, f = s2 / 8;
      const w = s2 < 2 ? 5 : s2 < 4 ? 3 : 2;
      P(e.x + Math.cos(a2) * r - w / 2, yy + Math.sin(a2) * r * pitch * .8 - 1, w, s2 < 3 ? 2 : 1,
        `rgba(${s2 ? (s2 < 3 ? '196,238,255' : '92,176,246') : '255,255,255'},${(al * (1 - f * .88)).toFixed(2)})`);
      if (s2 < 2)                                             // o halo acompanha a PONTA da lâmina, não o corpo
        glowAt(e.x + Math.cos(a2) * r, yy + Math.sin(a2) * r * pitch * .8, 9, '120,206,255', al * .3);
    }
    for (let k = 0; k < 5; k++){                              // fagulhas subindo em espiral pelo corpo
      const ph = (q * 1.7 + k / 5) % 1;
      const a2 = ph * 9 + k * 1.25, rr = 10 + ph * 12;       // sobem ABRINDO: não empilham em cima do rato
      P(e.x + Math.cos(a2) * rr, e.y - 6 - ph * 34, 2, 2, `rgba(170,232,255,${(al * (1 - ph) * .9).toFixed(2)})`);
    }
  },
  spin(e, q){                                                 // três lâminas orbitando com rastro
    const al = 1 - q * .85;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++){
      const base = q * 13 + k * 2.094, r = 15 + k * 5, yy = e.y - 12 - k * 4;
      for (let s2 = 0; s2 < 7; s2++){
        const a2 = base - s2 * .16;
        const w = s2 < 2 ? 4 : s2 < 4 ? 3 : 2;
        P(e.x + Math.cos(a2) * r - w / 2, yy + Math.sin(a2) * r * pitch * .8 - 1, w, 2,
          `rgba(${s2 ? '212,230,252' : '255,255,255'},${(al * (1 - s2 / 8)).toFixed(2)})`);
      }
    }
  },
  thrust(e, q){                                               // a lâmina risca a fileira inteira
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    const pts = e.pts || [];
    if (!pts.length) return;
    const av = Math.min(1, q * 2.6);                          // o risco cresce até a ponta
    const last = pts[Math.min(pts.length - 1, Math.floor(av * pts.length))] || pts[0];
    g.strokeStyle = `rgba(226,242,255,${(al * .85).toFixed(2)})`;
    g.lineWidth = al * 4 + 1;
    g.beginPath(); g.moveTo(e.x, e.y - 18); g.lineTo(last[0], last[1]); g.stroke();
    pts.forEach(([px, py], i2) => {
      const t2 = Math.min(1, Math.max(0, q * 3 - i2 * .18));
      if (t2 <= 0) return;
      const r = 3 + t2 * 7;
      P(px - r, py - 1, r * 2, 2, `rgba(255,255,255,${((1 - t2) * al).toFixed(2)})`);
      P(px - 1, py - r, 2, r * 2, `rgba(214,238,255,${((1 - t2) * al * .8).toFixed(2)})`);
    });
  },
  edge(e, q){                                                 // a pedra de amolar cuspindo faísca
    const al = q < .75 ? 1 : (1 - q) / .25;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 10; k++){
      const ph = ((q * 1.6 + k / 10) % 1);
      const px = e.x - 16 + ph * 32, py = e.y - 22 - Math.sin(ph * 3.1416) * 12;
      P(px, py, 2, 2, `rgba(255,${222 - (k % 3) * 30},120,${((1 - ph) * al).toFixed(2)})`);
    }
    g.strokeStyle = `rgba(255,236,170,${(al * .55).toFixed(2)})`;
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(e.x - 15, e.y - 12); g.lineTo(e.x + 15, e.y - 30); g.stroke();
  },
  rage(e, q){                                                 // labaredas subindo em roda
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 8; k++){
      const an = k * .785 + q * .9, r = 17 * (1 - q * .5);
      const bx = e.x + Math.cos(an) * r, by = e.y + Math.sin(an) * r * pitch;
      const hh = 11 + Math.sin(q * 3.1416 + k) * 5 + q * 15;
      for (let s2 = 0; s2 < 4; s2++)
        P(bx - 1, by - s2 * (hh / 4) - 2, s2 < 2 ? 3 : 2, 3,
          s2 < 2 ? `rgba(255,${118 + s2 * 44},60,${al.toFixed(2)})` : `rgba(255,92,60,${(al * .6).toFixed(2)})`);
    }
  },
  knife(e, q){                                                // risco da lâmina cortando o ar
    if (e.x2 == null) return;
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(232,244,255,${(al * .75).toFixed(2)})`;
    g.lineWidth = al * 2 + .5;
    g.beginPath(); g.moveTo(e.x, e.y - 20); g.lineTo(e.x2, e.y2); g.stroke();
  },
  aegis(e, q){                                                // seis placas de gelo se fechando
    const al = q < .7 ? 1 : (1 - q) / .3;
    const r = 32 * (1 - Math.min(1, q * 1.5)) + 13;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++){
      const an = k * 1.047 + q * 1.3;
      const px = e.x + Math.cos(an) * r, py = e.y - 16 + Math.sin(an) * r * .7;
      P(px - 3, py - 5, 6, 10, `rgba(190,232,255,${(al * .55).toFixed(2)})`);
      P(px - 3, py - 5, 6, 2, `rgba(242,252,255,${(al * .85).toFixed(2)})`);
    }
  },
  leech(e, q){                                                // fios de vida sendo puxados dos bichos
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    (e.pts || []).forEach(([sx, sy], i) => {
      const t2 = Math.min(1, Math.max(0, q * 1.7 - i * .06));
      if (t2 <= 0) return;
      const mx = (sx + e.x) / 2, my = Math.min(sy, e.y) - 30;
      for (let s2 = 0; s2 <= 9; s2++){
        const u = s2 / 9 * t2;
        const bx = (1 - u) ** 2 * sx + 2 * (1 - u) * u * mx + u * u * e.x;
        const by = (1 - u) ** 2 * (sy - 16) + 2 * (1 - u) * u * my + u * u * (e.y - 16);
        P(bx, by, 2, 2, `rgba(${s2 % 2 ? '232,90,120' : '255,152,172'},${(al * .9).toFixed(2)})`);
      }
    });
  },
  gears(e, q){                                                // a seiva sobe fervendo pelos veios
    const al = q < .78 ? 1 : (1 - q) / .22;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++){                              // cinco veios subindo em espiral
      const an = k * 1.2566 + q * 1.6, r = 13 - q * 4;
      const bx = e.x + Math.cos(an) * r, by = e.y + Math.sin(an) * r * pitch * .62;
      for (let c = 0; c < 6; c++){
        const u = c / 6, ph = (q * 1.8 + u + k * .2) % 1;
        P(bx + Math.sin(ph * 7 + k) * 3, by - ph * 34, 2, 3,
          `rgba(${ph > .5 ? '190,250,130' : '110,190,70'},${(al * (1 - ph * .5)).toFixed(2)})`);
      }
    }
    isoRing(e.x, e.y, 10 + q * 16, `rgba(140,215,90,${(al * .45).toFixed(2)})`, 2);
  },
  drill(e, q){                                                // broca: espiral de terra subindo
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 18; k++){
      const u = k / 18, an = q * 15 + u * 9, r = 4 + u * 16;
      P(e.x + Math.cos(an) * r, e.y - 6 - u * 26 + Math.sin(an) * r * .4, 2, 2,
        `rgba(${k % 3 ? '206,186,146' : '246,232,192'},${((1 - u) * al).toFixed(2)})`);
    }
  },
  rocks(e, q){                                                // as pedras caindo do teto
    (e.pts || []).forEach(([px, py], i) => {
      const t2 = Math.min(1, Math.max(0, q * 1.9 - i * .1));
      if (t2 <= 0) return;
      if (t2 >= 1){                                           // já caiu: lasca no chão
        P(px - 4, py - 3, 8, 4, '#4c545e'); P(px - 4, py - 3, 8, 1, '#68727f');
        return;
      }
      const h = (1 - t2 * t2) * 74;                           // queda acelerada
      const sz = 6 + t2 * 3;
      P(px - sz / 2 - 1, py - h - sz / 2 - 1, sz + 2, sz + 2, OUT);
      P(px - sz / 2, py - h - sz / 2, sz, sz, '#5c6470');
      P(px - sz / 2, py - h - sz / 2, sz, 2, '#7a8494');
    });
  },
  heal(e, q){                                                 // migalhas douradas subindo
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 9; k++){
      const ph = (q * 1.3 + k / 9) % 1, an = k * 1.4;
      P(e.x + Math.cos(an) * (7 + ph * 11), e.y - 6 - ph * 34, 2, 2,
        `rgba(255,${218 + (k % 3) * 12},130,${((1 - ph) * al).toFixed(2)})`);
    }
    P(e.x - 5, e.y - 30 - q * 10, 10, 3, `rgba(255,236,170,${(al * .8).toFixed(2)})`);   // cruzinha
    P(e.x - 1, e.y - 34 - q * 10, 3, 10, `rgba(255,236,170,${(al * .8).toFixed(2)})`);
  },
  shards(e, q){                                               // três riscos de gelo
    const al = 1 - q;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(214,242,255,${(al * .8).toFixed(2)})`;
    g.lineWidth = al * 2.5 + .5;
    (e.pts || []).forEach(([px, py]) => {
      g.beginPath(); g.moveTo(e.x, e.y - 18); g.lineTo(px, py); g.stroke();
    });
  },
  bubble(e, q){                                               // a bolha inflando em volta do bicho
    if (e.x2 == null) return;
    const gr = Math.min(1, q * 2.2), al = q > .75 ? (1 - q) / .25 : 1;
    const r = 6 + gr * 15;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(150,225,120,${(al * .75).toFixed(2)})`; g.lineWidth = 2;
    g.beginPath(); g.ellipse(e.x2, e.y2, r, r * 1.15, 0, 0, 6.2832); g.stroke();
    g.fillStyle = `rgba(120,200,90,${(al * .18).toFixed(2)})`; g.fill();
    P(e.x2 - r * .5, e.y2 - r * .7, 3, 3, `rgba(240,255,220,${al.toFixed(2)})`);
  },
  springs(e, q){                                              // cipós estalando em volta
    const al = q < .8 ? 1 : (1 - q) / .2;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++){
      const an = k * 1.5708 + q * 3.2, r = 9 + q * 14;
      for (let c = 0; c < 9; c++){                            // o chicote se desenrola do centro pra fora
        const u = c / 9;
        P(e.x + Math.cos(an + u * 1.1) * r * u * 1.8,
          e.y + Math.sin(an + u * 1.1) * r * u * 1.8 * pitch * .62 - 12 - Math.sin(u * 3.1416) * 7,
          u > .7 ? 3 : 2, 2,
          `rgba(${u > .75 ? '180,240,120' : '100,170,60'},${(al * (1 - u * .35)).toFixed(2)})`);
      }
    }
  },
  quake(e, q){                                                // pedras arremessadas pra cima
    const al = 1 - q;
    for (let k = 0; k < 9; k++){
      const an = k * .698, ph = Math.min(1, q * 1.4);
      const d = ph * (14 + hash(k, 29) * 18);
      P(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * pitch - Math.sin(ph * 3.1416) * 22,
        3, 3, `rgba(120,120,110,${al.toFixed(2)})`);
    }
  },
};
function drawPfx(air){
  for (const e of pfx){
    const f = (air ? PFX_AIR : PFX_GND)[e.kind];
    if (!f) continue;
    g.save();
    f(e, Math.min(1, e.t / e.T));
    g.restore();
  }
}

/* ---------------- IA DOS INIMIGOS ---------------- */
let alertAt = 0;                                             // trava o coro de sustos simultâneos
function enemyCtrl(e2, dt){
  if (e2.mode !== 'idle') return {};
  if (e2.boss && e2.mv) return {};                            // golpe armado: quem manda é o repertório
  // com dois jogadores em campo, o bicho vai atrás de QUEM ESTIVER MAIS PERTO
  const vivos = alvos();
  if (!vivos.length) return {};
  let alvo = vivos[0], melhorD = Infinity;
  for (const v of vivos){
    const d = Math.abs(v.tx - e2.tx) + Math.abs(v.ty - e2.ty);
    if (d < melhorD){ melhorD = d; alvo = v; }
  }
  const ax = e2.big2 ? Math.max(e2.tx, Math.min(alvo.tx, e2.tx + 1)) : e2.tx;   // tile do corpo mais perto
  const ay = e2.big2 ? Math.max(e2.ty, Math.min(alvo.ty, e2.ty + 1)) : e2.ty;
  const dx = alvo.tx - ax, dy = alvo.ty - ay;
  const dist = Math.abs(dx) + Math.abs(dy);
  if (dist === 1 && e2.cd <= 0){
    const d = dx === 1 ? 0 : dx === -1 ? 2 : dy === 1 ? 1 : 3;
    if (e2.dir !== d) return { dir: d, turnOnly: true };
    if (e2.boss){                                             // CHEFE: telegrafa o golpe e abre a guarda depois
      if (e2.telled){ e2.telled = false; e2.openT = e2.rage ? .7 : 1.2; return { attack: true }; }
      if (!(e2.tellT > 0)){ e2.tellT = alinhaPasso(e2.rage ? .34 : .6); SFX.alert(); }   // o bote cai numa batida
      return {};                                              // parado, se armando: é a janela pra fugir
    }
    return { attack: true };
  }
  const alcance = (e2.range || 6) - (cartaDe(alvo, 'ceye') ? 2 : 0) - (cartaDe(alvo, 'cscare') ? 3 : 0) - (current.level >= 5 ? 1 : 0);   // o brasão esconde QUEM o carrega · fundo: menos convergência
  // ISCA DE QUEIJO: enquanto o queijo falso estiver de pé, é PRA ELE que o bicho anda.
  // Só o alvo do PASSO muda — o golpe continua exigindo estar colado em você, então quem
  // morde a isca fica girando em volta dela sem bater em ninguém.
  let mx = dx, my = dy, mdist = dist, naIsca = false;
  if (isca && isca.t > 0){
    const idx = isca.x - ax, idy = isca.y - ay, idist = Math.abs(idx) + Math.abs(idy);
    if (idist <= alcance + 3 && idist > 0){ mx = idx; my = idy; mdist = idist; naIsca = true; }
  }
  if ((naIsca || mdist <= alcance) && chegadaT > 0 && !e2.alerted && !e2.boss) return {};   // ainda não te viu chegar
  if (naIsca || mdist <= alcance){
    if (!e2.alerted){                                        // acabou de te avistar: solta o balãozinho
      e2.alerted = true; e2.alertT = 1.1;
      const nw = performance.now();
      if (nw - alertAt > 400){ alertAt = nw; soaEm(e2.tx, e2.ty, SFX.alert); }
    }
    const opts = [];
    if (Math.abs(mx) >= Math.abs(my)){
      opts.push(mx > 0 ? 0 : 2); opts.push(my > 0 ? 1 : 3);
    } else {
      opts.push(my > 0 ? 1 : 3); opts.push(mx > 0 ? 0 : 2);
    }
    for (const d of opts){
      const [vx, vy] = DIRV[d];
      if (dy === 0 && (d === 1 || d === 3)) continue;
      if (dx === 0 && (d === 0 || d === 2)) continue;
      if (canWalk(e2.tx + vx, e2.ty + vy, e2)) return { dir: d };
    }
    return {};
  }
  if (e2.alerted && dist > (e2.range || 6) + 2) e2.alerted = false;   // te perdeu de vista
  e2.aiAt -= dt;                                            // vagueia
  if (e2.aiAt < 0){
    e2.aiAt = 1.2 + hash((e2.tx * 7 + e2.ty) | 0, (performance.now() | 0) % 97) * 2;
    const d = (hash(e2.tx + 31, (performance.now() | 0) % 89) * 4) | 0;
    const [vx, vy] = DIRV[d];
    if (canWalk(e2.tx + vx, e2.ty + vy, e2)) return { dir: d };
  }
  return {};
}

/* ================= OS CHEFES: mecânica e movimentação =================
   Até aqui o chefe era um bicho comum inchado: mesma IA de andar-um-tile-e-bater, só que com
   160/320/460 de vida. Toda a "luta" era encostar nele e trocar pancada até um dos dois cair —
   e como o telegrafo dele só existia no golpe corpo a corpo, o combate não tinha NADA que o
   jogador pudesse ler, prever e responder. Chefe bom não é o que tem mais vida: é o que te
   obriga a MEXER.
   Agora cada chefe tem um REPERTÓRIO de golpes com três tempos legíveis:
     1. ARMA     — ele se recolhe e a ÁREA do golpe acende no chão. Dá pra ver onde não ficar.
     2. DISPARA  — o corpo executa: ele salta, investe, pisa, cospe. A marca fecha junto com o
                   impacto, então sair da área é sempre resposta suficiente.
     3. RESPIRA  — recarga curta em que ele volta a andar como bicho comum (e é quando se bate).
   E cada um se move do SEU jeito: o Gato salta e corre em linha reta (e se atordoa na parede),
   o Yeti pisa a arena inteira e sopra gelo, o Sapo puxa pela língua e suja o chão de lodo.
   A FÚRIA (abaixo da metade da vida) encurta a recarga e o telegrafo: o mesmo repertório fica
   mais apertado, em vez de virar outro bicho. */
const perigos = [];                                           // áreas marcadas: o golpe só cai quando a marca fecha
function marcaPerigo(tiles, T, dmg, cor, extra){
  const pg = Object.assign({ tiles, t: 0, T, dmg, cor }, extra || {});
  perigos.push(pg);
  return pg;
}
const naArea = (pg, a) => !a.dead && pg.tiles.some(([x, y]) => hitsAt(a, x, y));
function resolvePerigo(pg){
  if (pg.dono && (pg.dono.dead || pg.dono.hp <= 0)) return;   // caiu antes de acertar: o golpe morre com ele
  const dono = pg.dono;
  const vitimas = alvos().filter(v => naArea(pg, v));
  if (pg.puxa && dono){                                       // LÍNGUA: quem for laçado vem junto
    vitimas.forEach(v => {
      const ax = Math.max(dono.tx, Math.min(v.tx, dono.tx + 1));
      const ay = Math.max(dono.ty, Math.min(v.ty, dono.ty + 1));
      const [vx, vy] = DIRV[(pg.dir + 2) % 4];                // um tile ANTES do corpo, na linha da língua
      const nx = ax + vx, ny = ay + vy;
      if (canWalk(nx, ny, v)){
        v.mode = 'hurt'; v.t = 0;
        v.from = [v.tx, v.ty]; v.to = [nx, ny];
        v.tx = nx; v.ty = ny;
        puff(gX(nx, ny), gY(nx, ny), 5);
      }
    });
    if (vitimas.length) toast('🐸 laçado!');
  }
  if (pg.dmg){
    frostFrom = !!pg.frost; venomFrom = !!pg.venom;
    vitimas.forEach(v => applyHit(v, pg.dmg, pg.dir != null ? pg.dir : v.dir));
    frostFrom = false; venomFrom = false;
  }
  if (pg.ao) pg.ao(pg);
}
function passoPerigos(dt){
  for (let i = perigos.length - 1; i >= 0; i--){
    const pg = perigos[i];
    if (pg.dono && pg.dono.dead){ perigos.splice(i, 1); continue; }
    pg.t += dt;
    if (pg.t < pg.T) continue;
    perigos.splice(i, 1);
    resolvePerigo(pg);
  }
}
function drawPerigos(time){                                   // a marca no chão: acende, pisca e fecha
  for (const pg of perigos){
    const q = Math.min(1, pg.t / pg.T);
    const urg = q > .74 && ((time * 16) | 0) % 2 === 0;       // no fim ela pisca: é o último aviso
    const al = .16 + q * .4 + (urg ? .24 : 0);
    pg.tiles.forEach(([x, y]) => {
      if (!current.over(x, y)) return;
      const [lx, lys] = pb(x, y);
      isoTop(lx, lys - 1, 15, 15, `rgba(${pg.cor},${al.toFixed(2)})`);
      const r2 = Math.max(2, Math.round(15 * (1 - q)));       // losango interno ENCOLHENDO: o relógio do golpe
      isoTop(lx, lys - 2, r2, r2, `rgba(${pg.cor},${(al * .7).toFixed(2)})`);
    });
    const [bx, bys] = pb(pg.tiles[0] ? pg.tiles[0][0] : 0, pg.tiles[0] ? pg.tiles[0][1] : 0);
    if (urg) glowOn(g, bx, bys - 14, 26, 14, pg.cor, .18);
    if (pg.queda){                                            // A PEDRA DE GELO caindo: some no chão ao fechar
      const [qx, qy] = pg.queda;
      const x = gX(qx, qy), y0 = gY(qx, qy);
      const alt = Math.round((1 - q * q) * 150);              // acelera na queda, como pedra
      const r = 6 + Math.round(q * 3);
      E(x, y0 - 2, Math.max(3, 12 - alt / 14), Math.max(2, 5 - alt / 34), 'rgba(4,5,10,.4)');   // a sombra CRESCE
      P(x - r, y0 - alt - r * 2, r * 2, r * 2, OUT);
      P(x - r + 1, y0 - alt - r * 2 + 1, r * 2 - 2, r * 2 - 2, '#bfe4f8');
      P(x - r + 2, y0 - alt - r * 2 + 2, r - 1, r - 1, '#eefaff');
      P(x + 1, y0 - alt - r, r - 2, r - 2, '#8ac4e8');
    }
  }
}
/* ---- geometria do corpo 2x2: tudo que o repertório precisa saber do chefe ---- */
const corpoTiles = e => e.big2 ? [[e.tx, e.ty], [e.tx + 1, e.ty], [e.tx, e.ty + 1], [e.tx + 1, e.ty + 1]] : [[e.tx, e.ty]];
const centroX = e => e.x + (e.big2 ? .5 : 0);
const centroY = e => e.y + (e.big2 ? .5 : 0);
function distChefe(e, a){
  const ax = e.big2 ? Math.max(e.tx, Math.min(a.tx, e.tx + 1)) : e.tx;
  const ay = e.big2 ? Math.max(e.ty, Math.min(a.ty, e.ty + 1)) : e.ty;
  return Math.abs(a.tx - ax) + Math.abs(a.ty - ay);
}
function dirPara(e, a){
  const ax = e.big2 ? Math.max(e.tx, Math.min(a.tx, e.tx + 1)) : e.tx;
  const ay = e.big2 ? Math.max(e.ty, Math.min(a.ty, e.ty + 1)) : e.ty;
  const dx = a.tx - ax, dy = a.ty - ay;
  return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 0 : 2) : (dy >= 0 ? 1 : 3);
}
function faixaChefe(e, d, alc){                               // a PISTA na frente do corpo (2 de largura no 2x2)
  const [vx, vy] = DIRV[d];
  const corpo = corpoTiles(e);
  const frente = corpo.filter(([x, y]) => !corpo.some(([x2, y2]) => x2 === x + vx && y2 === y + vy));
  const tiles = [];
  for (const [fx, fy] of frente)
    for (let k = 1; k <= alc; k++){
      const nx = fx + vx * k, ny = fy + vy * k;
      if (!current.over(nx, ny)) break;
      tiles.push([nx, ny]);
    }
  return tiles;
}
function anelChefe(e, raio){                                  // tudo em volta do corpo, até `raio` tiles
  const corpo = corpoTiles(e), tiles = [], lado = e.big2 ? 1 : 0;
  for (let x = e.tx - raio; x <= e.tx + lado + raio; x++)
    for (let y = e.ty - raio; y <= e.ty + lado + raio; y++){
      if (corpo.some(([cx, cy]) => cx === x && cy === y)) continue;
      if (!current.free(x, y)) continue;
      tiles.push([x, y]);
    }
  return tiles;
}
function blocoRaio(ax, ay, lado, raio){
  const tiles = [];
  for (let x = ax - raio; x <= ax + lado + raio; x++)
    for (let y = ay - raio; y <= ay + lado + raio; y++)
      if (current.over(x, y)) tiles.push([x, y]);
  return tiles;
}
function achaFuga(e, alvo, G){                                // o salto PRA LONGE: sem teleporte, sob medida
  const [lo, hi] = (G && G.pulo) || [3, 6];
  let best = null, bd = -1;
  for (let ax = e.tx - hi; ax <= e.tx + hi; ax++)
    for (let ay = e.ty - hi; ay <= e.ty + hi; ay++){
      if (!canWalk(ax, ay, e)) continue;
      const salto = Math.abs(ax - e.tx) + Math.abs(ay - e.ty);
      if (salto < lo || salto > hi) continue;
      const d2 = Math.abs(ax + .5 - alvo.tx) + Math.abs(ay + .5 - alvo.ty);
      if (d2 > bd){ bd = d2; best = [ax, ay]; }
    }
  return best;
}
function achaPouso(e, alvo){                                  // onde o salto cabe: perto do alvo, nunca em cima
  let best = null, bd = 99;
  for (let ax = alvo.tx - 3; ax <= alvo.tx + 2; ax++)
    for (let ay = alvo.ty - 3; ay <= alvo.ty + 2; ay++){
      if (!canWalk(ax, ay, e)) continue;                      // o gigante precisa dos 4 tiles livres
      const dd = Math.abs(ax + .5 - alvo.tx) + Math.abs(ay + .5 - alvo.ty);
      if (dd < bd){ bd = dd; best = [ax, ay]; }
    }
  return best;
}
/* ---- o repertório ---- */
const GOLPES = {
  // O GATO: velocidade. Ele fecha a distância sozinho e te obriga a sair do lugar.
  patada:  { tel: .30, exec: .16, rec: .28, cd: 1.7, min: 1, max: 2,  cor: '235,80,60',  tipo: 'leque',     dmg: 3, alc: 2 },
  bote:    { tel: .50, exec: .44, rec: .42, cd: 3.0, min: 2, max: 6,  cor: '235,80,60',  tipo: 'salto',     dmg: 3, raio: 1, ar: 34 },
  corrida: { tel: .54, exec: .40, rec: .44, cd: 3.6, min: 3, max: 9,  cor: '235,80,60',  tipo: 'investida', dmg: 3, alc: 7 },
  // A ESQUIVA felina: colado em você ele só tinha patada e mordida, e o bote (que precisa de 2
  // tiles) nunca acontecia — a luta do Gato acabava virando troca de sopapo, igual à de antes.
  // Agora ele BATE E SAI, reabrindo a distância de onde ele é perigoso. Não machuca: é dança.
  esquiva: { tel: .22, exec: .32, rec: .18, cd: 2.9, min: 1, max: 2,  cor: '235,80,60',  tipo: 'salto', dmg: 0, raio: 0, ar: 30, fuga: true, pulo: [2, 5] },
  // O YETI ANCIÃO: força e área. Quem fica parado perto dele paga caro.
  pisao:   { tel: .70, exec: .28, rec: .50, cd: 2.6, min: 1, max: 4,  cor: '130,205,255', tipo: 'anel',     dmg: 5, raio: 2, gelo: true },
  sopro:   { tel: .64, exec: .32, rec: .44, cd: 2.8, min: 2, max: 7,  cor: '130,205,255', tipo: 'leque',    dmg: 4, alc: 4, frost: true },
  pedrada: { tel: .80, exec: .18, rec: .34, cd: 2.4, min: 3, max: 14, cor: '130,205,255', tipo: 'queda',    dmg: 4, raio: 1 },
  // O SAPO REAL: alcance e veneno. Ele te puxa pra perto e envenena o chão embaixo de você.
  lingua:  { tel: .48, exec: .28, rec: .50, cd: 3.0, min: 2, max: 8,  cor: '150,230,90',  tipo: 'lingua',   dmg: 2, alc: 8 },
  pulo:    { tel: .50, exec: .48, rec: .44, cd: 3.0, min: 2, max: 7,  cor: '150,230,90',  tipo: 'salto',    dmg: 4, raio: 1, ar: 40, lodo: true },
  coaxo:   { tel: .88, exec: .30, rec: .56, cd: 4.4, min: 1, max: 5,  cor: '150,230,90',  tipo: 'anel',     dmg: 3, raio: 2, lodo: true, furia: true },
  // O RECUO: colado nele a luta virava troca de mordida, que é exatamente o chefe velho. Agora,
  // no aperto, ele SALTA PRA LONGE e deixa a poça no lugar de onde saiu — quebra o corpo a corpo,
  // suja o chão e devolve a luta pro alcance, que é onde o Sapo Real é perigoso.
  recuo:   { tel: .40, exec: .46, rec: .38, cd: 2.8, min: 1, max: 2,  cor: '150,230,90',  tipo: 'salto',    dmg: 3, raio: 1, ar: 44, lodo: true, fuga: true },
};
const REPERTORIO = { cat: ['patada', 'bote', 'corrida', 'esquiva'], yeti: ['pisao', 'sopro', 'pedrada'], toad: ['lingua', 'pulo', 'coaxo', 'recuo'] };
const castaChefe = e => e.skin.cat ? 'cat' : e.skin.yeti ? 'yeti' : e.skin.toad ? 'toad' : null;
const telDe = (e, G) => G.tel * (e.rage ? .74 : 1);           // na fúria ele arma mais rápido — o mesmo golpe, apertado
function escolheGolpe(e, alvo){
  const casta = castaChefe(e);
  if (!casta) return null;
  const d = distChefe(e, alvo);
  const ax = e.tx + (e.big2 ? .5 : 0), ay = e.ty + (e.big2 ? .5 : 0);
  const cands = REPERTORIO[casta].filter(nm => {
    const G = GOLPES[nm];
    if (G.furia && !e.rage) return false;                     // guardado pra segunda fase
    if (d < G.min || d > G.max) return false;
    if (nm === e.mvUltimo) return false;                      // nunca o mesmo golpe duas vezes seguidas
    if (G.tipo === 'investida' && Math.abs(alvo.tx - ax) > 1.5 && Math.abs(alvo.ty - ay) > 1.5) return false;   // sem pista, sem corrida
    return true;
  });
  if (!cands.length) return null;
  return cands[(hash((performance.now() | 0), e.tx * 7 + e.ty) * cands.length) | 0];
}
function armaGolpe(e, nome, alvo){
  const G = GOLPES[nome];
  e.mv = nome; e.mvFase = 'tel'; e.mvT = alinhaPasso(telDe(e, G));   // o golpe sai na batida
  e.mvDir = dirPara(e, alvo); e.dir = e.mvDir;
  const extra = { frost: !!G.frost, venom: !!G.lodo, dono: e, dir: e.mvDir };
  if (G.tipo === 'leque') e.mvTiles = faixaChefe(e, e.mvDir, G.alc);
  else if (G.tipo === 'investida'){
    const [vx, vy] = DIRV[e.mvDir];
    let n = 0;
    while (n < G.alc && canWalk(e.tx + vx * (n + 1), e.ty + vy * (n + 1), e)) n++;
    if (n < 2){ e.mv = null; return false; }                  // sem corredor: escolhe outra coisa
    e.mvN = n;
    e.mvTiles = faixaChefe(e, e.mvDir, n + 1);
  } else if (G.tipo === 'salto'){
    const pouso = G.fuga ? achaFuga(e, alvo, G) : achaPouso(e, alvo);
    if (!pouso) { e.mv = null; return false; }
    e.mvTo = pouso;
    // no bote a marca é ONDE ELE CAI; na fuga é de ONDE ELE SAI (o esguicho fica pra trás)
    e.mvTiles = G.fuga ? blocoRaio(e.tx, e.ty, e.big2 ? 1 : 0, G.raio)
      : blocoRaio(pouso[0], pouso[1], e.big2 ? 1 : 0, G.raio);
  } else if (G.tipo === 'anel') e.mvTiles = anelChefe(e, G.raio);
  else if (G.tipo === 'queda'){ e.mvTiles = blocoRaio(alvo.tx, alvo.ty, 0, G.raio); extra.queda = [alvo.tx, alvo.ty]; }
  else if (G.tipo === 'lingua'){ e.mvTiles = faixaChefe(e, e.mvDir, G.alc); extra.puxa = true; }
  if (!e.mvTiles || !e.mvTiles.length){ e.mv = null; return false; }
  // marca no chão é CONTRATO DE DANO: golpe que não machuca (a esquiva) não acende nada, senão
  // o jogador aprende a fugir de mancha que não dói e para de confiar na marca.
  if (G.dmg > 0){
    e.mvPg = marcaPerigo(e.mvTiles, e.mvT + G.exec, G.dmg, G.cor, extra);   // a marca fecha NO impacto
    soaEm(e.tx, e.ty, SFX.alert);
  }
  return true;
}
function disparaGolpe(e, G){                                  // o corpo executa: é aqui que ele SE MEXE
  const cx = centroX(e), cy = centroY(e);
  if (G.tipo === 'salto'){
    if (e.hopS0 == null) e.hopS0 = e.hopS;
    e.mode = 'hop'; e.t = 0;
    e.from = [e.tx, e.ty]; e.to = e.mvTo;
    e.tx = e.mvTo[0]; e.ty = e.mvTo[1];
    e.hopS = G.exec; e.airK = G.ar || 30; e.hopFit = 0;
    soaEm(cx, cy, SFX.spin);
  } else if (G.tipo === 'investida'){
    const [vx, vy] = DIRV[e.mvDir];
    e.investT = G.exec;
    e.mode = 'invest'; e.t = 0;
    e.from = [e.tx, e.ty]; e.to = [e.tx + vx * e.mvN, e.ty + vy * e.mvN];
    e.tx = e.to[0]; e.ty = e.to[1];
    e.parede = e.mvN < G.alc;                                 // freou antes do fim: tem parede na frente
    SFX.whiff(); shake(3, .3);
  } else if (G.tipo === 'leque'){ soaEm(cx, cy, SFX.swing); e.pose.lean = 6; }
  else if (G.tipo === 'queda'){ soaEm(cx, cy, SFX.low); }
  else if (G.tipo === 'lingua'){ soaEm(cx, cy, SFX.whiff); }
  else if (G.tipo === 'anel') e.pose.crouch = 3;
}
function fimGolpe(e, G){                                      // o impacto — no MESMO instante em que a marca fecha
  const cx = centroX(e), cy = centroY(e), gx2 = gX(cx, cy), gy2 = gY(cx, cy);
  if (G.tipo === 'anel' || G.tipo === 'salto'){
    rings.push({ x: gx2, y: gy2, t: 0, wide: G.tipo === 'anel', gold: !G.gelo && !G.lodo });
    SFX.quake(); shake(G.tipo === 'anel' ? 7 : 5, .5);
    hitStop = Math.max(hitStop, .07);
    for (let i = 0; i < 18; i++){                             // terra e estilhaço saindo do baque
      const an = i / 18 * 6.2832;
      dust.push({ x: gx2, y: gy2 - 8, vx: Math.cos(an) * 120, vy: Math.sin(an) * 54 - 26,
        gv: 240, life: .5, kind: G.gelo ? 'iceP' : G.lodo ? 'hexP' : 'soil' });
    }
  }
  if (G.gelo || G.lodo){                                      // O CHÃO MUDA: o andar não volta a ser o que era
    const lista = G.gelo ? current.slick : current.goo;
    const tt = e.mvTiles || [];
    if (lista && lista.length < 26 && tt.length){
      const passo = Math.max(1, (tt.length / 3) | 0);
      const giro = (hash((performance.now() | 0), e.tx) * tt.length) | 0;
      for (let k2 = 0; k2 < 3; k2++){                          // três tiles espalhados pela área, não três vizinhos
        const [x, y] = tt[(giro + k2 * passo) % tt.length];
        if (current.free(x, y) && !lista.some(t2 => t2.x === x && t2.y === y)) lista.push({ x, y });
      }
    }
  }
  if (G.tipo === 'queda' || G.tipo === 'leque' || G.tipo === 'lingua'){
    const alvos2 = e.mvTiles || [];
    const meio = alvos2[(alvos2.length / 2) | 0];
    alvos2.forEach(([x, y], i) => { if (i % 2 === 0) puff(gX(x, y), gY(x, y), G.tipo === 'queda' ? 4 : 2); });
    if (G.tipo === 'queda' && meio){
      rings.push({ x: gX(meio[0], meio[1]), y: gY(meio[0], meio[1]), t: 0 });
      SFX.smash(); shake(5, .4);
      hitStop = Math.max(hitStop, .05);
    } else shake(2.4, .26);
    if (G.frost) alvos2.forEach(([x, y], i) => {              // o sopro deixa o ar branco por um instante
      if (i % 2) return;
      for (let k2 = 0; k2 < 2; k2++)
        dust.push({ x: gX(x, y) + (hash(k2 + i, 41) - .5) * 20, y: gY(x, y) - 10 - hash(k2, 42) * 16,
          vx: (hash(k2, 43) - .5) * 40, vy: -26, life: .45, kind: 'iceP' });
    });
  }
  if (G.tipo === 'investida'){
    e.hopS = e.hopS0 != null ? e.hopS0 : e.hopS;
    if (e.parede){                                            // BATEU NA PAREDE: a janela de ouro pra bater nele
      e.openT = e.rage ? 1.2 : 1.8;
      e.cd = Math.max(e.cd, e.openT);                         // atordoado é atordoado: nem morde durante a janela
      SFX.smash(); shake(7, .55);
      hitStop = Math.max(hitStop, .1);
      bannerNaFila('NA PAREDE!', '', 1200);
      for (let i = 0; i < 14; i++)
        dust.push({ x: gx2, y: gy2 - 14, vx: (hash(i, 31) - .5) * 150, vy: -40 - hash(i, 32) * 60,
          gv: 250, life: .5, kind: 'hit' });
    }
  }
  if (G.tipo === 'salto'){ e.hopS = e.hopS0 != null ? e.hopS0 : e.hopS; e.airK = 0; }
}
function avancaGolpe(e, dt){
  const G = GOLPES[e.mv];
  e.mvT -= dt;
  if (e.mvFase === 'tel'){
    if (e.mvT <= 0){ e.mvFase = 'exec'; e.mvT = G.exec; disparaGolpe(e, G); }
  } else if (e.mvFase === 'exec'){
    if (e.mvT <= 0){ e.mvFase = 'rec'; e.mvT = G.rec; fimGolpe(e, G); }
  } else if (e.mvT <= 0){
    e.mv = null; e.mvTiles = null; e.mvPg = null; e.airK = 0;
    e.mvCd = (G.cd + hash((performance.now() | 0), e.ty) * .9) * (e.rage ? .58 : 1);
  }
}
function passoChefe(e, dt){                                   // roda ANTES do stepActor: pode mandar o corpo andar
  if (e.dead || e.hp <= 0){ e.mv = null; return; }
  if (e.frzT > 0) return;                                     // congelado: o repertório para junto
  e.mvCd = Math.max(0, (e.mvCd || 0) - dt);
  if (e.mv){ avancaGolpe(e, dt); return; }
  if (e.mode !== 'idle' || e.mvCd > 0 || e.openT > 0 || e.tellT > 0) return;
  if (!batePasso) return;                                     // o repertório também só escolhe na batida
  const vivos = alvos();
  if (!vivos.length) return;
  let alvo = vivos[0], md = 99;
  for (const v of vivos){ const d2 = distChefe(e, v); if (d2 < md){ md = d2; alvo = v; } }
  if (md > 12) return;                                        // longe demais: ele só caminha
  const nm = escolheGolpe(e, alvo);
  if (!nm) return;
  if (armaGolpe(e, nm, alvo)) e.mvUltimo = nm;
  else e.mvCd = .35;                                          // sem espaço pro golpe: respira e tenta outro
}
function posaChefe(e){                                        // a ANTECIPAÇÃO, depois do stepActor (que zera a pose)
  if (!e.mv || e.mvFase !== 'tel') return;
  const G = GOLPES[e.mv];
  const q = Math.max(0, 1 - Math.max(0, e.mvT) / Math.max(.001, telDe(e, G)));   // o telegrafo pode ser esticado até a batida
  const p = e.pose;
  p.crouch = 1 + Math.round(q * 2);                           // ele se RECOLHE: o corpo avisa antes da marca fechar
  p.stretch = 0; p.earY = -1; p.air = 0;
  p.lean = -Math.round(q * 5);
  if (q > .45 && ((performance.now() / 70) | 0) % 2 === 0)
    dust.push({ x: gX(centroX(e), centroY(e)) + (hash((performance.now() | 0), 3) - .5) * 30,
      y: gY(centroX(e), centroY(e)) - 12, vy: -24, life: .3, kind: 'hit' });
}
function drawEngolido(){
  /* O HERÓI ENGOLIDO PELO CHEFE. O corpo 2x2 é quase o dobro da altura do ratinho e é desenhado
     POR CIMA (o +1.02 na fila de profundidade) — encostar por trás dele era sumir da tela. Isso
     sempre foi feio; agora que a luta é de esquiva, sumir é perder a luta. Quando o rato fica
     atrás do corpanzil, a silhueta dele volta por cima, azul e translúcida: dá pra se achar sem
     tirar o chefe da frente. */
  const bs = current.actors.find(a2 => a2.boss && !a2.dead);
  if (!bs) return;
  const bx = gX(bs.x + .5, bs.y + .5), by = gY(bs.x + .5, bs.y + .5);
  const dBoss = vDepth(bs.x, bs.y) + 1.02;
  for (const eu of [player, player2]){
    if (eu.dead || (eu === player2 && !p2On)) continue;
    if (vDepth(eu.x, eu.y) > dBoss) continue;                 // já está na frente: aparece sozinho
    const ex = gX(eu.x, eu.y), ey = gY(eu.x, eu.y);
    if (Math.abs(ex - bx) > 48 || Math.abs(ey - by) > 46) continue;   // longe: não tem o que desenterrar
    g.save();
    g.globalAlpha = .5;
    FLASHW = '#8ad8f8';
    drawActor(eu);
    FLASHW = null;
    g.restore();
  }
}
function drawLingua(){                                        // a LÍNGUA do Sapo Real, esticada na pista marcada
  for (const pg of perigos){
    if (!pg.puxa || !pg.dono || pg.dono.dead) continue;
    const q = Math.min(1, pg.t / pg.T);
    if (q < .68) continue;                                    // ela só sai quando a marca está fechando
    const u = Math.min(1, (q - .68) / .32);
    const e = pg.dono;
    const [vx, vy] = DIRV[pg.dir];
    const x0 = gX(centroX(e), centroY(e)), y0 = gY(centroX(e), centroY(e)) - 22;
    const alc = (pg.tiles.length / 2) * u;
    const x1 = gX(centroX(e) + vx * alc, centroY(e) + vy * alc);
    const y1 = gY(centroX(e) + vx * alc, centroY(e) + vy * alc) - 22;
    const n = 16;
    for (let i = 0; i <= n; i++){
      const t2 = i / n;
      P(x0 + (x1 - x0) * t2 - 1, y0 + (y1 - y0) * t2 - 1 + Math.sin(t2 * 3.1) * 2, 3, 3, '#b8365a');
    }
    P(x1 - 3, y1 - 3, 6, 6, OUT); P(x1 - 2, y1 - 2, 4, 4, '#e0527a');
  }
}
/* ---------------- WAIFU: balão de pensamento / entrega ---------------- */
function hasCheese(){ return cheeseN > 0; }
function drawBubble(time){
  const bx = gX(waifu.x, waifu.y) + 16, by = gY(waifu.x, waifu.y) - 74 + Math.round(Math.sin(time * 2) * 1.5);
  if (readyUps('rato') > 0) return;                                // com melhoria na fila, quem fala é o aviso da cabeça
  const cycle = (time % 9) < 4.5;
  if (!cycle && !hasCheese()) return;
  P(bx - 14, by - 9, 30, 20, OUT);
  P(bx - 13, by - 8, 28, 18, '#e8e4da');
  P(bx - 13, by - 8, 28, 3, '#f4f0e6');
  E(bx - 12, by + 14, 3, 2, '#e8e4da');
  E(bx - 16, by + 18, 2, 1, '#e8e4da');
  P(bx - 8, by - 2, 17, 9, '#d9a234');                       // queijo sonhado
  P(bx - 8, by - 4, 17, 3, '#e8bc50');
  P(bx - 4, by, 2, 2, '#a87a24'); P(bx + 3, by + 2, 3, 2, '#a87a24');
}
let bueiroT = 0, bueiroX = 0;                                 // olhos espiando do bueiro do covil
let labFalou = false;
function checkLab(){                                          // fim de linha: ela fecha a jornada
  if (!current.lab || labFalou || transitioning || !current.labWaifu || onlineConvidado()) return;
  const wf = current.labWaifu;
  if (Math.abs(player.tx - wf.tx) + Math.abs(player.ty - wf.ty) > 1) return;
  labFalou = true;
  SFX.fanfare();
  bannerNaFila('VOCÊ FOI LENDÁRIO!', 'lenda', 3000);
  bigHearts.push({ x: gX(wf.x, wf.y), y: gY(wf.x, wf.y) - 58, t: 0 });
  setTimeout(() => {                                          // a ficha cai devagar: aí vem a gota
    toast('🏠 vamos voltar pra casa');
    suorT = 2.6;
    player.pose.crouch = 2;
  }, 1500);
  setTimeout(() => { if (current.lab) goTo('home', [1, 4]); }, 4600);
}
/* ---------------- A ENTREGA: a cena do presente ----------------
   O painel de melhorias abria NO MESMO QUADRO do depósito: a chuva de corações, o beijo e a
   ratinha ficavam atrás de uma janela que já estava na tela, e a cena inteira passava sem
   ninguém ver. Agora a entrega tem TEMPO e ATUAÇÃO, em três tempos curtos (1,5s no total):
     1. A OFERTA    — os dois se viram um pro outro e o ratinho faz a mesura, entregando.
     2. ELA ACEITA  — ela pula de alegria, manda o beijo e o embrulho ESTOURA em cima dela.
     3. A PASSAGEM  — o embrulho cruza o ar num arco até a pata dele, que olha pra cima.
   Só então o painel entra. Qualquer tecla que não seja de andar PULA direto pro painel — nada de
   cutscene que prende — e sair de perto CANCELA: o presente fica guardado e o emblema UP! continua
   aceso. Da segunda vez em diante o mesmo presente abre o painel direto: cena boa é cena que não
   se repete. */
let entrega = null;                                           // { t, sapo, marco, voo }
let cenaVista = false;                                        // este presente já foi apresentado?
const ENTREGA_F = [.40, .62, .50];                            // oferta · ela aceita · a passagem
const ENTREGA_T = ENTREGA_F[0] + ENTREGA_F[1] + ENTREGA_F[2];
const entregaAtor = () => (entrega && entrega.sapo ? player2 : player);
function comecaEntrega(sapo){
  entrega = { t: 0, sapo, marco: 0, voo: 0 };
}
function fimEntrega(abrir){
  const sapo = entrega && entrega.sapo;
  entrega = null;
  if (abrir){ conta(sapo && p2On ? 'sapo' : 'rato'); cenaVista = true; openUp(); }
}
function pulaEntrega(){ if (entrega && entrega.t > .12) fimEntrega(true); }   // pressa é direito do jogador
function encara(a, b){                                        // vira o corpo pro outro: a atuação começa no olhar
  const dx = b.tx - a.tx, dy = b.ty - a.ty;
  const d = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 0 : 2) : (dy >= 0 ? 1 : 3);
  if (a.mode === 'idle') a.dir = d;
}
function passoEntrega(dt){
  if (!entrega) return;
  const eu = entregaAtor(), waifu = amadaDe(entrega.sapo);
  // desistiu no meio: o presente não se perde, só espera
  if (current !== home || transitioning || (entrega.sapo ? p2KO() : pDead())
      || (!(entrega.remota && entrega.t < .6) && Math.abs(eu.tx - waifu.tx) + Math.abs(eu.ty - waifu.ty) > 1)){ entrega = null; return; }
  /* .remota: o "abre presente" do dono sai no MESMO quadro em que o sapo pisa do lado dela, mas a
     casa nova do sapo só sai no fim daquele quadro — a mensagem chega antes da posição. Sem essa
     folga a cena começava e se cancelava sozinha na tela do parceiro. */
  entrega.t += dt;
  const t = entrega.t, [F0, F1, F2] = ENTREGA_F;
  encara(eu, waifu); encara(waifu, eu);
  const ep = eu.pose, wp = waifu.pose;
  if (t < F0){                                                // 1) A OFERTA: a mesura
    const q = ease(Math.min(1, t / F0));
    ep.crouch = 1 + Math.round(q * 2); ep.earY = 1; ep.stretch = 0;
    wp.crouch = q > .55 ? 1 : 0;                              // ela se inclina pra receber
  } else if (t < F0 + F1){                                    // 2) ELA ACEITA: o pulo e o estouro do embrulho
    const q = (t - F0) / F1;
    if (entrega.marco < 1){
      entrega.marco = 1;
      SFX.kiss();
      bigHearts.push({ x: gX(waifu.x, waifu.y), y: gY(waifu.x, waifu.y) - 58, t: 0 });
      for (let i = 0; i < 10; i++){                           // purpurina saindo do embrulho
        const an = i / 10 * 6.2832;
        dust.push({ x: gX(waifu.x, waifu.y), y: gY(waifu.x, waifu.y) - 48,
          vx: Math.cos(an) * 46, vy: Math.sin(an) * 26 - 18, life: .5, kind: 'hit' });
      }
    }
    wp.air = Math.round(Math.sin(q * Math.PI) * 9);           // o pulinho de alegria
    wp.stretch = q < .45 ? 2 : 0;
    wp.crouch = q > .88 ? 2 : 0;                              // e amassa ao pousar
    wp.earY = q < .5 ? 2 : -1;
    ep.crouch = Math.round((1 - q) * 2); ep.earY = 1;
  } else {                                                    // 3) A PASSAGEM: o embrulho cruza o ar
    const q = Math.min(1, (t - F0 - F1) / F2);
    entrega.voo = q;
    ep.earY = 2; ep.stretch = q > .45 && q < .92 ? 1 : 0;     // ele acompanha o voo com o olho
    ep.crouch = q > .92 ? 2 : 0;                              // e agacha ao receber o peso
    wp.earY = 1;
    if (q >= 1 && entrega.marco < 2){
      entrega.marco = 2;
      SFX.item();
      puff(gX(eu.x, eu.y), gY(eu.x, eu.y) - 30, 6);
      hearts(gX(eu.x, eu.y), gY(eu.x, eu.y));
      // o 💋 é a ÚLTIMA coisa da cena: chega junto com o embrulho, e não brigando com ele
      bigHearts.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 52, t: 0, kiss: true });
    }
  }
  if (t >= ENTREGA_T) fimEntrega(true);
}
function desenhaPresente(x, y, sc, time){                     // embrulho dourado com a fita DELA (rosa)
  const R = (ox, oy, w, h, c) =>
    P(x + Math.round(ox * sc), y + Math.round(oy * sc),
      Math.max(1, Math.round(w * sc)), Math.max(1, Math.round(h * sc)), c);
  glowAt(x, y + Math.round(5 * sc), Math.round(22 * sc), '255,190,120', .3);
  R(-8, -3, 16, 12, OUT);                                     // contorno: a silhueta preta do jogo
  R(-7, -2, 14, 10, '#c9a23c');                               // caixa
  R(-7, -2, 14, 3, '#e8bc50');                                // tampa na luz
  R(-7, 6, 14, 2, '#8a6c22');                                 // sombra embaixo
  R(-2, -2, 4, 10, '#ff9ab0');                                // fita de pé
  R(-7, 1, 14, 3, '#ff9ab0');                                 // fita deitada
  R(-2, -2, 4, 1, '#ffc4d2');
  R(-9, -8, 6, 6, OUT); R(3, -8, 6, 6, OUT);                  // o laço: duas alças
  R(-8, -7, 4, 4, '#ff9ab0'); R(4, -7, 4, 4, '#ff9ab0');
  R(-8, -7, 4, 1, '#ffc4d2'); R(4, -7, 4, 1, '#ffc4d2');
  R(-2, -6, 4, 4, OUT); R(-1, -5, 2, 2, '#e8bc50');           // nó
  const br = ((time * 2) % 1);                                // um lampejo correndo a tampa
  R(-7 + Math.round(br * 12), -2, 2, 3, 'rgba(255,255,255,' + ((1 - br) * .5).toFixed(2) + ')');
}
function drawEntrega(time){
  if (!entrega || entrega.t < ENTREGA_F[0]) return;
  const eu = entregaAtor(), waifu = amadaDe(entrega.sapo);
  // ALTURAS: o sprite dela é alto (a etiqueta UP! mora em -68) — a -52 o embrulho nascia DENTRO
  // do cabelo e sumia. Ele flutua acima da cabeça dos dois, com folga pra silhueta ser inteira.
  const wx = gX(waifu.x, waifu.y), wy = gY(waifu.x, waifu.y) - 86;
  const ex = gX(eu.x, eu.y), ey = gY(eu.x, eu.y) - 36;        // ele recebe NA PATA: o embrulho DESCE no fim
  let x, y, sc;
  if (entrega.t < ENTREGA_F[0] + ENTREGA_F[1]){               // em cima dela: estoura elástico e flutua
    const q = (entrega.t - ENTREGA_F[0]) / ENTREGA_F[1];
    x = wx; y = wy - Math.round(Math.sin(q * Math.PI) * 6);
    sc = q < .2 ? (q / .2) * 1.3 : 1 + Math.sin((q - .2) * 11) * .12 * (1 - q);
  } else {                                                    // e cruza o ar num ARCO ALTO até ele
    const q = entrega.voo, e2 = ease(q);
    x = wx + (ex - wx) * e2;
    y = wy + (ey - wy) * e2 - Math.sin(q * Math.PI) * 18;   // arco: alto o bastante pra ler, baixo pra não sair da tela
    sc = 1 - q * .12;
    if (((time * 60) | 0) % 3 === 0)                          // rastro de purpurina no caminho
      dust.push({ x, y: y + 4, vx: (hash((time * 97) | 0, 7) - .5) * 20, vy: 16, life: .34, kind: 'hit' });
  }
  desenhaPresente(Math.round(x), Math.round(y), sc, time);
}
let depPedido = false;
function checkDeposit(quem, forca){                            // vale pros DOIS: quem chegar nela entrega e escolhe
  const eu = quem || player;
  const sapo = eu === player2;
  if (onlineConvidado()){                                     // o pote e os presentes moram no dono
    if (!sapo || !separados || current !== home || p2KO()) return;   // juntos, o dono vê o sapo encostar
    if (Math.abs(eu.tx - sapinha.tx) + Math.abs(eu.ty - sapinha.ty) > 1){ depPedido = false; return; }
    if (!depPedido){ depPedido = true; mandaCmd('deposita', 0); }
    return;
  }
  if (!forca){
    if (current !== home) return;
    if (sapo && (!p2On || p2KO() || player2.fora)) return;
  }
  const waifu = amadaDe(sapo);                                 // o sapo entrega pra SAPINHA
  conta(sapo && p2On ? 'sapo' : 'rato');
  const d = forca ? 0 : Math.abs(eu.tx - waifu.tx) + Math.abs(eu.ty - waifu.ty);
  if (d > 1){ if (sapo){ upDismissed2 = false; upEsperando = false; } else upDismissed = false; return; }
  if (hasCheese()){
    const n = cheeseN;
    cheeseN = 0;
    stash += n;
    while (stash >= upGoal){                                  // metas: 10, 25, 45, 70... → presente
      upPend++;
      upGoal += 10 + 5 * (upsDone + upPend);
      cenaVista = false;                                      // presente novo, cena nova
    }
    // Com cena por vir, o beijo e o aviso NÃO saem aqui: sairiam no mesmo quadro do depósito e
    // atropelariam a atuação. Quem beija é ela, no tempo dela — na fase 2 da entrega.
    const teraCena = upPend > 0 && !cenaVista;
    heartRain(n);                                             // corações = queijos entregues
    SFX.deposit();
    shake(5, .5);
    if (!teraCena){
      SFX.kiss();
      bigHearts.push({ x: gX(waifu.x, waifu.y), y: gY(waifu.x, waifu.y) - 58, t: 0 });
      bigHearts.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y) - 52, t: 0, kiss: true });   // 💋 beijinho em quem entregou
    }
    hearts(gX(eu.x, eu.y), gY(eu.x, eu.y));
    if (upPend > 0){ if (!teraCena) toast('🎁 presente pronto!'); }   // com cena, a cena é o aviso
    else toast(`♥️ ${stash} 🧀 · faltam ${upGoal - stash} pro presente`);
    upDismissed = false; upDismissed2 = false;
    updateHUD();
  }
  if (sapo && onlineDono()){                                  // o presente do sapo abre NA TELA DELE
    if (upPend > 0 && (forca || !upDismissed2)){ abreUpSapo(); cenaVista = true; }
    return;
  }
  if (upPend > 0 && !upOpen && !entrega && !(sapo ? upDismissed2 : upDismissed)){
    upAlvo = sapo ? 'sapo' : 'rato';                          // quem foi falar com ela já chega escolhido
    if (cenaVista) openUp();                                  // presente já apresentado: painel direto
    else comecaEntrega(sapo);                                 // inédito: a cena roda antes da janela
  }
}
/* contador de queijos da esposa (dígitos 3x5 em pixel) */
const DIGITS = ['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001010010','111101111101111','111101111001111'];
function drawNum(x, y, n, c){
  let ox = 0;
  for (const ch of ('' + n)){
    const d = DIGITS[+ch];
    for (let i = 0; i < 15; i++) if (d[i] === '1') P(x + ox + (i % 3), y + ((i / 3) | 0), 1, 1, c);
    ox += 4;
  }
}
const LETTERS = { M: '101111111101101', I: '111010010010111', S: '111100111001111' };
function drawGlyphs(x, y, str, c, t, sc){                     // dígitos caem em cascata, um atrás do outro
  for (let i = 0; i < str.length; i++){
    const d = LETTERS[str[i]] || DIGITS[+str[i]];
    if (!d) continue;
    const lag = Math.min(1, Math.max(0, (t - i * .04) / .1));
    if (lag <= 0) continue;
    const hop = Math.round((1 - lag) * -8);                   // e assentam com um pulinho
    for (let k = 0; k < 15; k++)
      if (d[k] === '1') P(x + i * (3 * sc + sc) + (k % 3) * sc, y + hop + ((k / 3) | 0) * sc, sc, sc, c);
  }
}
function drawWaifuCounter(){
  contadorDe(waifu, contaDe('rato')[0]);
  if (p2On) contadorDe(sapinha, contaDe('sapo')[0]);
}
function contadorDe(waifu, stash){                            // o número sob cada amada: só lê a conta dela
  const x = gX(waifu.x, waifu.y), y = gY(waifu.x, waifu.y) + 5;
  const s = ('' + stash), w2 = 11 + s.length * 4;
  P(x - w2 / 2 - 2, y - 2, w2 + 4, 10, 'rgba(10,12,18,.72)');
  P(x - w2 / 2, y + 1, 7, 4, '#d9a234'); P(x - w2 / 2, y, 7, 2, '#e8bc50');
  P(x - w2 / 2 + 2, y + 3, 1, 1, '#a87a24');
  drawNum(x - w2 / 2 + 9, y, stash, '#f2e2b0');
}

/* ---------------- PICKUPS ---------------- */
const GLOWC = {};
function glowSprite(rgb){                                     // bolha de luz assada UMA vez por cor
  let c = GLOWC[rgb];
  if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64;
  const q = c.getContext('2d');
  const gr = q.createRadialGradient(32, 32, 1, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(.5, `rgba(${rgb},.34)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  q.fillStyle = gr; q.fillRect(0, 0, 64, 64);
  GLOWC[rgb] = c;
  return c;
}
function glowOn(ctx, x, y, rx, ry, rgb, a, mode){             // bolha de luz em qualquer canvas
  if (!(a > 0) || !(rx > 0) || !(ry > 0)) return;
  ctx.save();
  ctx.globalCompositeOperation = mode || 'lighter';
  ctx.globalAlpha = Math.min(1, a);
  ctx.imageSmoothingEnabled = true;                           // aqui a suavização é justamente o efeito
  ctx.drawImage(glowSprite(rgb), Math.round(x - rx), Math.round(y - ry), Math.round(rx * 2), Math.round(ry * 2));
  ctx.restore();
}
function glowAt(x, y, r, rgb, a){ glowOn(g, x, y, r, r, rgb, a); }
const glowOval = (x, y, rx, ry, rgb, a) => glowOn(g, x, y, rx, ry, rgb, a);   // poça achatada no tile
// UM item por chamada: o item entra na MESMA fila de profundidade dos móveis e dos bichos.
// Desenhado tudo de uma vez antes dessa fila, qualquer pilastra passava por cima e parecia
// que o coração tinha sido cortado ao meio.
function drawPickup(pk, time){
  {
    const bob = Math.sin(time * 3 + pk.x * 1.7 + pk.y);
    const x = gX(pk.x, pk.y), gy0 = gY(pk.x, pk.y);
    const y = gy0 - 8 + Math.round(bob * 2.5);
    E(x, gy0 + 2, 7, 3, 'rgba(4,5,10,.35)');                  // sombra suave
    const k = pk.kind;
    const tileGlow = (rgb, a) => glowOval(x, gy0 + 1, 17, 8, rgb, a * 1.15);   // poça de luz no tile
    if (WEAPONS[k]){                                          // a própria arma flutua sobre o tile
      const wd = WEAPONS[k];
      tileGlow('246,206,90', .26);
      glowAt(x, y, 19 + bob * 2, '246,206,90', .45);
      const L = wd.long ? 10 : 7;
      const x0 = x + (wd.long ? 5 : 4), y0 = y - (wd.long ? 8 : 6);
      for (let i2 = 0; i2 < L; i2++) P(x0 - i2, y0 + i2, 3, 1, i2 % 2 ? wd.blade : wd.bladeHi);
      P(x0 - L + 1, y0 + L - 1, 2, 2, '#8a929b');             // guarda
      P(x0 - L - 1, y0 + L, 5, 2, wd.hilt);
      P(x0 - L - 2, y0 + L + 2, 3, 3, '#5c4a30');             // punho
      P(x0 - L - 3, y0 + L + 4, 2, 2, wd.hilt);
      const a2 = time * 2.6 + pk.x;                           // faíscas orbitando
      P(x + Math.round(Math.cos(a2) * 11), y + Math.round(Math.sin(a2) * 5), 1, 1, '#fff3c8');
      P(x - Math.round(Math.cos(a2) * 11), y - Math.round(Math.sin(a2) * 5), 1, 1, '#fff3c8');
    } else if (POWERS[k]){                                    // bola de cristal roxa, sem contorno
      tileGlow('178,110,230', .3);
      glowAt(x, y, 18 + bob * 2, '178,110,230', .5);
      E(x, y, 7, 7, 'rgba(120,70,180,.55)');                  // halo difuso no lugar do contorno
      E(x, y, 6, 6, '#8a54c4');
      E(x, y, 5, 5, '#a86ae0');
      for (let i2 = 0; i2 < 10; i2++){                        // espiral rosada girando lá dentro
        const rr = .8 + i2 * .42, an = time * 2.4 + i2 * .62 + pk.x;
        P(x + Math.round(Math.cos(an) * rr), y + Math.round(Math.sin(an) * rr * .8), 1, 1, i2 % 2 ? '#f0a8d8' : '#ffd0ec');
      }
      P(x - 2, y - 3, 2, 1, 'rgba(255,255,255,.8)');          // reflexo vítreo
      P(x - 3, y - 2, 1, 2, 'rgba(255,255,255,.55)');
    } else if (k === 'arcoiris'){                             // PEDRA ARCO-ÍRIS: prisma girando, a luz troca de cor
      const hy = y - 7 + Math.round(bob * 1.4), hue = (time * 90) % 360;
      const rgb = hsl2hex(hue, .9, .6).slice(1).match(/../g).map(h => parseInt(h, 16)).join(',');
      tileGlow(rgb, .3 + Math.sin(time * 3) * .06);
      glowAt(x, hy, 22 + bob * 2, rgb, .55);
      const F = ['#ff5a6e', '#ffa040', '#ffe060', '#6ee07a', '#5ab4ff', '#9a72ff'];
      const wS = Math.max(.25, Math.abs(Math.cos(time * 1.8 + pk.x)));   // gira no eixo: some a largura
      for (let r = -6; r <= 6; r++){                          // losango em fileiras, uma cor por faixa
        const half = Math.round((6 - Math.abs(r)) * wS) + 1;
        P(x - half - 1, hy + r, half * 2 + 2, 1, OUT);
        P(x - half, hy + r, half * 2, 1, F[Math.min(5, ((r + 6) / 2.2) | 0)]);
      }
      P(x - Math.round(2 * wS), hy - 3, 2, 2, '#ffffff');      // brilho da lapidação
      if (((time * 4) | 0) % 3 === 0) dust.push({ x: x + (hash((time * 60) | 0, 3) - .5) * 18, y: hy - 4,
        vx: 0, vy: -14, life: .5, kind: 'hit' });
    } else if (k === 'potion'){                               // frasquinho vermelho
      glowAt(x, y, 14, '224,90,110', .35);
      P(x - 2, y - 9, 4, 2, '#8a6a4a');                       // rolha
      P(x - 1, y - 7, 2, 2, '#c9d2dc');                       // gargalo
      E(x, y - 1, 5, 5, OUT);
      E(x, y - 1, 4, 4, '#d24a64');
      P(x - 2, y - 3, 2, 1, '#f08a9a');
    } else if (k === 'heartmax'){                             // coração antigo: relíquia GRANDE girando no eixo
      const spin = Math.cos(time * 2.1 + pk.x * .7);          // escala X simula rotação em Y
      const wS = Math.max(.12, Math.abs(spin)), back = spin < 0;
      const beat = 1 + Math.max(0, Math.sin(time * 5.2)) * .07;  // batida sutil
      const hy = y - 5 + Math.round(bob * 1.2);
      tileGlow('255,70,95', .36 + Math.sin(time * 4) * .08);  // poça vermelha pulsando no tile
      glowAt(x, hy, 27 + bob * 2, '255,70,95', .6);
      const C = back ? '#a83244' : '#e0485e';                 // verso mais escuro vende o giro
      const D = back ? '#7a2434' : '#b0303f';
      const H = back ? '#c05a6a' : '#ff96a6';
      const G = back ? '#8a6c22' : '#c9a23c';                 // fio dourado discreto: relíquia, não item comum
      const gold = wS > .45;                                  // de perfil o fio some: senão o ouro engole o coração
      const q = (px, py, pw, ph, col) => P(
        x + Math.round(px * wS * beat), hy + Math.round(py * beat),
        Math.max(1, Math.round(pw * wS * beat)), Math.max(1, Math.round(ph * beat)), col);
      q(-7, -7, 6, 2, C); q(1, -7, 6, 2, C);                  // lóbulos
      q(-8, -5, 7, 2, C); q(1, -5, 7, 2, C);
      q(-9, -3, 18, 4, C);                                    // corpo
      q(-7, 1, 14, 3, C);
      q(-5, 4, 10, 2, D);                                     // ponta sombreada
      q(-3, 6, 6, 2, D);
      q(-1, 8, 2, 2, D);
      if (gold){ q(-6, -7, 3, 1, '#e8d090'); q(-9, -2, 1, 2, '#e8d090'); }   // luz raspando na ourela
      if (gold){                                              // ourela EMBUTIDA: come a fileira de fora do coração
        q(-7, -7, 6, 1, G); q(1, -7, 6, 1, G);                 // topo dos lóbulos
        q(-8, -5, 1, 2, G); q(7, -5, 1, 2, G);
        q(-9, -3, 1, 4, G); q(8, -3, 1, 4, G);                 // parte mais larga
        q(-7, 1, 1, 3, G); q(6, 1, 1, 3, G);                   // afunilando até a ponta
        q(-5, 4, 1, 2, G); q(4, 4, 1, 2, G);
        q(-3, 6, 1, 2, G); q(2, 6, 1, 2, G);
        q(-1, 9, 2, 1, G);
      }
      q(-6, -5, 3, 3, H); q(-4, -1, 2, 3, H);                 // brilho vítreo
      const a2 = time * 3 + pk.x;                             // fagulhas rosadas orbitando
      P(x + Math.round(Math.cos(a2) * 13), hy + Math.round(Math.sin(a2) * 6), 2, 2, '#ffd0da');
      P(x - Math.round(Math.cos(a2) * 13), hy - Math.round(Math.sin(a2) * 6), 1, 1, '#ff96a6');
      P(x + Math.round(Math.cos(a2 + 2.1) * 10), hy - 9 + Math.round(Math.sin(a2 * 1.3) * 3), 1, 1, '#fff0f4');
    } else if (CARDS[k]){                                     // CARTA no chão: a própria carta, nunca um queijo
      const cd2 = CARDS[k], rgb2 = hexRgb(cd2.col);
      tileGlow(rgb2, .34);
      glowAt(x, y - 4, 20 + bob * 2, rgb2, .4);
      glowAt(x, y - 4, 13, '246,206,90', .34);
      if (CARD_C[k]) g.drawImage(CARD_C[k], Math.round(x - 9), Math.round(y - 17), 18, 24);
      const a3 = time * 2.2 + pk.x;                           // fagulhas douradas rondando a relíquia
      P(x + Math.round(Math.cos(a3) * 12), y - 6 + Math.round(Math.sin(a3) * 5), 1, 1, '#f8ecb8');
      P(x - Math.round(Math.cos(a3) * 12), y - 6 - Math.round(Math.sin(a3) * 5), 1, 1, '#ffe6a0');
    } else {                                                  // queijo é queijo
      glowAt(x, y, 13, '240,200,90', .3);
      P(x - 7, y - 3, 14, 8, OUT);
      P(x - 6, y - 2, 12, 6, '#d9a234');
      P(x - 6, y - 4, 12, 3, '#e8bc50');
      P(x - 3, y, 2, 2, '#a87a24'); P(x + 2, y + 1, 2, 2, '#a87a24');
    }
  }
}

function smashProp(x, y){                                     // barril no caminho do golpe: vira lasca
  const i = current.props.findIndex(pr2 => pr2.bust && pr2.bust[0] === x && pr2.bust[1] === y);
  if (i < 0) return false;
  const pr = current.props[i];
  current.props.splice(i, 1);
  current.blocked.delete(x + ',' + y);
  const gx2 = gX(x, y), gy2 = gY(x, y);
  SFX.smash();
  shake(1.6, .16);
  for (let k = 0; k < 13; k++)
    dust.push({
      x: gx2 + (hash(k, 43) - .5) * 18, y: gy2 - 6 - hash(k, 44) * 12,
      vx: (hash(k, 45) - .5) * 85, vy: -32 - hash(k, 46) * 46,
      life: .4 + hash(k, 47) * .3, kind: 'soil',
      ci: ['#6b5138', '#8a6844', '#4a3626'][(hash(k, 48) * 3) | 0], sz: hash(k, 49) > .6 ? 3 : 2,
    });
  const r = hash(x * 29 + y * 11, (performance.now() | 0) % 811);
  if (pr && pr.nicho){                                        // NICHO: atrás da parede falsa mora um tesouro
    rings.push({ x: gx2, y: gy2, t: 0, gold: true });
    SFX.fanfare();
    current.pickups.push({ x, y, kind: 'potion' });
    const viz = DIRV.map(([ox, oy]) => [x + ox, y + oy]).filter(([a2, b2]) => current.free(a2, b2));
    if (viz[0]) current.pickups.push({ x: viz[0][0], y: viz[0][1], kind: 'cheese' });
    if (viz[1]) poePoder(viz[1][0], viz[1][1]);
    toast('🎁 nicho secreto!');
    return true;
  }
  if (r < .52) current.pickups.push({ x, y, kind: 'cheese' });
  return true;
}

/* ---------------- RAIO DA ESPADA (só com a vida cheia) ---------------- */
const beams = [];
function fireBeam(dir){
  const [dx, dy] = DIRV[dir];
  let reach = 0;
  for (let s2 = 1; s2 <= 4; s2++){
    if (!current.over(player.tx + dx * s2, player.ty + dy * s2)) break;   // o raio cruza o fosso
    reach = s2;
  }
  if (!reach) return;
  beams.push({ cx: player.tx, cy: player.ty, tx: player.tx, ty: player.ty, dx, dy, dir, reach, t: 0, hit: 0 });
  SFX.beam();
}
function updateBeams(dt){
  for (let i = beams.length - 1; i >= 0; i--){
    const b = beams[i];
    b.t += dt;
    const T = .06 * b.reach + .05, q = Math.min(1, b.t / T);
    b.cx = b.tx + b.dx * q * b.reach;
    b.cy = b.ty + b.dy * q * b.reach;
    const rx = Math.round(b.cx), ry = Math.round(b.cy);
    if (!b.hit){
      const v = current.actors.find(a2 => a2.hostile && !a2.dead && hitsAt(a2, rx, ry));
      if (v){ b.hit = 1; applyHit(v, player.dmg, b.dir); }
    }
    if (q >= 1 || b.hit){
      const x = gX(b.cx, b.cy), y = gY(b.cx, b.cy) - 18;
      sparks.push({ x, y, t: 0, big: false });
      for (let k = 0; k < 6; k++)
        dust.push({ x, y, vx: (hash(k, 63) - .5) * 90, vy: -20 - hash(k, 64) * 40, life: .3, kind: 'hit' });
      beams.splice(i, 1);
    }
  }
}
function drawBeams(){
  beams.forEach(b => {
    const x = gX(b.cx, b.cy), y = gY(b.cx, b.cy) - 18;
    const [sdx, sdy] = DIRV[w2s(b.dir)];
    const ux = (sdx - sdy) * .5, uy = (sdx + sdy) * .25;
    glowAt(x, y, 15, '255,238,170', .55);
    for (let s2 = 1; s2 <= 3; s2++)                           // rastro dourado atrás
      P(x - ux * s2 * 6 - 1, y - uy * s2 * 6 - 1, 2, 2, `rgba(255,232,150,${(.5 - s2 * .13).toFixed(2)})`);
    const ph = ((b.t * 34) | 0) % 2;                          // lâmina de luz girando
    for (let k = -4; k <= 4; k++){
      const w2 = Math.max(1, 4 - Math.abs(k) * .8);
      P(x + k * (ph ? 1 : uy * 2) - 1, y + k * (ph ? uy * 2 : -ux * 2) - 1, 2, w2, k % 2 ? '#ffe8a0' : '#fff6d0');
    }
    P(x - 1, y - 1, 3, 3, '#ffffff');
  });
}

/* ---------------- CAMPOS PERSISTENTES (gelo, névoa, fita do tempo) ---------------- */
const addIce = (x, y) => {                                    // Trilha Congelada: o passo vira gelo
  if (!current.free(x, y)) return;
  const e = iceTiles.find(t2 => t2.x === x && t2.y === y);
  if (e) e.t = 8; else iceTiles.push({ x, y, t: 8 });
};
function updateFields(dt){
  for (let i = iceTiles.length - 1; i >= 0; i--){ iceTiles[i].t -= dt; if (iceTiles[i].t <= 0) iceTiles.splice(i, 1); }
  for (let i = clouds.length - 1; i >= 0; i--){ clouds[i].t -= dt; if (clouds[i].t <= 0) clouds.splice(i, 1); }
  if (clouds.length){                                         // a névoa corrói quem respira dentro
    miasmaTk -= dt;
    if (miasmaTk <= 0){
      miasmaTk = 1.2;
      current.actors.forEach(v => {
        if (v.hostile && !v.dead && clouds.some(c => c.x === v.tx && c.y === v.ty)) applyHit(v, 1, v.dir);
      });
    }
  }
}
function drawFields(time){
  const th2 = TT();
  iceTiles.forEach(it => {                                    // placa de gelo brilhando no chão
    const [x, yT] = tvTop(it.x, it.y), al = Math.min(1, it.t / 1.2) * .5;
    g.fillStyle = `rgba(170,225,255,${(al * .5).toFixed(2)})`;
    g.beginPath();
    g.moveTo(x, yT + 2); g.lineTo(x + TW / 2 - 2, yT + th2);
    g.lineTo(x, yT + th2 * 2 - 2); g.lineTo(x - TW / 2 + 2, yT + th2);
    g.closePath(); g.fill();
    g.strokeStyle = `rgba(220,245,255,${al.toFixed(2)})`; g.lineWidth = 1;
    g.stroke();
    P(x - 6, yT + th2 - 3, 5, 1, `rgba(255,255,255,${(al * .8).toFixed(2)})`);
    P(x + 2, yT + th2 + 2, 4, 1, `rgba(255,255,255,${(al * .6).toFixed(2)})`);
  });
  clouds.forEach(c => {                                       // névoa tóxica pairando
    const x = gX(c.x, c.y), y = gY(c.x, c.y);
    const al = Math.min(1, c.t / 1.5) * .5;
    for (let k = 0; k < 3; k++){
      const ph = (time * .6 + k * .33 + c.x * .2) % 1;
      glowOn(g, x + Math.sin(time * .9 + k * 2 + c.y) * 9, y - 6 - ph * 16,
        16 - k * 3, 9 - k * 2, '120,200,80', al * (1 - ph * .6), 'source-over');
    }
  });
}

/* ---------------- GOLPE CRÍTICO ---------------- */
let slowMo = 0;                                               // câmera lenta curtinha do impacto
function starBurst(v){                                        // estrelinhas invadindo a tela
  for (let i = 0; i < 24; i++){
    const left = i % 2 === 0;
    dust.push({
      x: cam.x + (left ? -1 : 1) * (VW / 2 + 6),
      y: cam.y - VH / 2 + hash(i, 95) * VH,
      vx: (left ? 1 : -1) * (95 + hash(i, 96) * 160),
      vy: -30 + hash(i, 97) * 62,
      life: .7 + hash(i, 98) * .5, kind: 'starP',
      ph: hash(i, 99) * 6.3, ci: (hash(i, 100) * 3) | 0,
    });
  }
  const x = gX(v.tx, v.ty), y = gY(v.tx, v.ty) - 20;
  for (let i = 0; i < 14; i++)                                // e um estouro no alvo
    dust.push({
      x, y, vx: (hash(i, 101) - .5) * 170, vy: -45 - hash(i, 102) * 80,
      life: .45 + hash(i, 103) * .3, kind: 'starP', ph: hash(i, 104) * 6.3, ci: (hash(i, 105) * 3) | 0,
    });
}
function critFx(v){
  slowMo = .42;                                               // o tempo arrasta pra sentir o peso
  hitStop = Math.max(hitStop, .1);
  shake(6, .45, player.dir);
  chromaT = .5;
  SFX.crit();
  starBurst(v);
  rings.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty), t: 0, gold: true });
  sparks.push({ x: gX(v.tx, v.ty), y: gY(v.tx, v.ty) - 20, t: 0, big: true });
  ['critFx', 'critLbl'].forEach(id => {                       // clarões nas laterais + selo na tela
    const el = document.getElementById(id);
    el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
  });
}

/* ---------------- POSE DE ITEM CONQUISTADO ---------------- */
let itemGetT = 0, itemGetK = null;
const ITEMGET_T = .95;
function itemGet(kind, quem){                                  // achado: sobe da cabeça e some — o jogo não para
  if (!ICONC[kind]) return;
  enfileira('i:' + kind, 900, () => {
    const eu = quem || player;
    itemGetT = ITEMGET_T; itemGetK = kind;
    SFX.fanfare();
    rings.push({ x: gX(eu.x, eu.y), y: gY(eu.x, eu.y), t: 0, gold: true });
  });
}
const UP_AURA = [                                             // um presente aceito = uma cor permanente no ratinho
  [() => hpUps,   '224,56,68'],                               // vida: vermelho
  [() => stamUps, '90,224,120'],                              // stamina: verde
  [() => critUps, '242,204,96'],                              // crítico: amarelo
];
// desenhada DEPOIS dos props: no covil o tapete cobria o brilho quando ficava na camada do chão
function drawUpAura(time){
  if (player.dead) return;
  const tot = hpUps + stamUps + critUps;
  if (!tot) return;
  const px = gX(player.x, player.y), py = gY(player.x, player.y), ar = player.pose.air;
  // a POÇA usa a cor do presente mais escolhido: três brilhos somados viravam um branco sem leitura
  const main = UP_AURA.reduce((a2, b2) => b2[0]() > a2[0]() ? b2 : a2);
  const k0 = Math.min(5, main[0]());
  const pu0 = .72 + Math.sin(time * 1.6) * .28;
  g.save();
  g.globalCompositeOperation = 'lighter';
  glowOval(px, py - ar, 17 + k0 * 2, (17 + k0 * 2) * pitch * .62, main[1], (.16 + k0 * .03) * pu0);
  glowAt(px, py - 24 - ar, 15 + k0 * 2, main[1], (.07 + k0 * .015) * pu0);
  UP_AURA.forEach(([cnt, rgb], i2) => {                       // as FAGULHAS carregam a cor de cada presente
    const n2 = cnt();
    if (!n2) return;
    const r = 17 + i2 * 4;
    const pu = .7 + Math.sin(time * 1.7 + i2 * 2.1) * .3;
    for (let m2 = 0; m2 < Math.min(3, n2); m2++){
      const an = time * (.7 + i2 * .2) + m2 * 2.094 + i2 * .8;
      for (let e2 = 2; e2 >= 0; e2--){                        // rastrinho: dá pra ver o giro
        const a3 = an - e2 * .16;
        const mx2 = px + Math.cos(a3) * r;
        const my2 = py - 18 - ar + Math.sin(a3) * r * pitch * .62 - Math.sin(time * 2 + m2) * 2;
        if (e2){ P(mx2, my2, 2, 2, `rgba(${rgb},${(.22 * pu / e2).toFixed(2)})`); continue; }
        P(mx2 - 1, my2 - 1, 4, 4, `rgba(${rgb},${(.28 * pu).toFixed(2)})`);
        P(mx2, my2, 2, 2, `rgba(${rgb},${(.9 * pu).toFixed(2)})`);
        P(mx2, my2, 1, 1, `rgba(255,255,255,${(.55 * pu).toFixed(2)})`);
      }
    }
  });
  g.restore();
}
function quebraFx(eu, t2, cor){                               // levou dano carregando: a luz se parte e cai
  const q = 1 - t2 / .34;
  const bx = gX(eu.x, eu.y), by = gY(eu.x, eu.y) - 16 - eu.pose.air;
  g.save();
  g.globalCompositeOperation = 'lighter';
  const r0 = 6 + ease(q) * 22;
  g.strokeStyle = `rgba(${cor},${((1 - q) * .55).toFixed(2)})`;
  g.lineWidth = Math.max(1, 3 * (1 - q));
  for (let k = 0; k < 3; k++){                                // o anel quebrado: três cacos se afastando
    const a2 = k * 2.094 + q * 1.2;
    g.beginPath();
    g.ellipse(bx, by, r0, Math.max(1, r0 * .8), 0, a2, a2 + .9);
    g.stroke();
  }
  g.restore();
}
function drawChargeFx(time, dt){                              // a lâmina reunindo luz antes do giro
  if (chargeBreakT > 0){
    chargeBreakT = Math.max(0, chargeBreakT - dt);
    quebraFx(player, chargeBreakT, '150,210,255');
  }
  if (p2ChargeBreakT > 0){
    p2ChargeBreakT = Math.max(0, p2ChargeBreakT - dt);
    if (p2On) quebraFx(player2, p2ChargeBreakT, '240,160,205');
  }
  if (!player.fora) cargaFx(player, chargeT, chargeRdy, time, CARGA_RATO);
  if (p2On && !p2KO()) cargaFx(player2, p2ChargeT, p2ChargeRdy, time, CARGA_SAPO);   // o sapo carrega igual
}
// paleta da carga: frio enquanto reúne, vivo quando fica pronto. O sapo usa o rosa dele
// (o mesmo do tile de ataque) pra dar pra saber DE QUEM é a luz num relance.
const CARGA_RATO = { on: '120,168,224', rdy: '190,242,255', anel: '180,240,255' };
const CARGA_SAPO = { on: '208,120,168', rdy: '255,190,224', anel: '255,180,220' };
function cargaFx(eu, ct, rdy, time, cor){
  if (ct <= .1 || eu.dead || eu.mode === 'dead') return;
  const k = Math.min(1, ct / CHARGE_T);
  const x = gX(eu.x, eu.y), y = gY(eu.x, eu.y) - 16 - eu.pose.air;
  g.save();
  g.globalCompositeOperation = 'lighter';
  const c = rdy ? cor.rdy : cor.on;
  glowAt(x, y, 14 + k * 20, c, .3 + k * .35);
  for (let i = 0; i < 6; i++){                                // fagulhas espiralando pra dentro
    const ph = ((time * 1.9 + i / 6) % 1);
    const r = (1 - ph) * (26 - k * 8) + 5;
    const an = ph * 7 + i * 1.05;
    P(x + Math.cos(an) * r, y + Math.sin(an) * r * .7, 2, 2,
      `rgba(${c},${(k * (1 - ph * .5)).toFixed(2)})`);
  }
  if (rdy){                                                   // pronto: anel pulsando aos pés
    const pu = .6 + Math.sin(time * 12) * .4;
    isoRing(gX(eu.x, eu.y), gY(eu.x, eu.y), 15 + pu * 4,
      `rgba(${cor.anel},${(.35 + pu * .3).toFixed(2)})`, 2);
    P(x - 1, y - 1, 3, 3, `rgba(255,255,255,${(.4 + pu * .4).toFixed(2)})`);
  }
  g.restore();
}
function drawItemGet(time, dt){
  if (itemGetT <= 0) return;
  itemGetT = Math.max(0, itemGetT - dt);
  const q = 1 - itemGetT / ITEMGET_T;
  const al = q > .6 ? (1 - q) / .4 : 1;                       // fica visível e some no fim
  const rise = ease(Math.min(1, q * 1.5)) * 20;               // sobe desacelerando
  const x = gX(player.x, player.y);                           // acompanha o ratinho: dá pra andar junto
  const y = gY(player.x, player.y) - 46 - Math.round(player.pose.air) - Math.round(rise);
  const sz = 24 + Math.round(Math.min(1, q * 6) * 6);         // dá um pop e assenta
  glowAt(x, y, 16, '255,232,150', .35 * al);
  g.save();
  g.globalAlpha = al;
  g.drawImage(ICONC[itemGetK], Math.round(x - sz / 2), Math.round(y - sz / 2), sz, sz);
  g.restore();
  for (let k = 0; k < 4; k++){                                // quatro fagulhas subindo junto
    const ph = (q * 1.7 + k / 4) % 1;
    P(x + Math.cos(k * 1.5708 + q * 3) * (9 + ph * 7), y + 10 - ph * 22, 2, 2,
      `rgba(255,236,160,${((1 - ph) * al).toFixed(2)})`);
  }
}

/* ---------------- NEBLINA RASTEIRA ---------------- */
function drawFog(time){
  const w = current;
  const span = (w.w + w.h) * 32 + 160, x0 = -w.h * 32 - 80;
  const yMax = (w.w + w.h - 1) * TT();
  const A = w.safe ? .11 : (w.ice ? .12 : w.sewer ? .13 : .07);                    // ar pesado fora da pedra
  const [c1, c2, c3] = w.ice
    ? ['205,228,245', '220,238,250', '232,246,255']
    : w.sewer
    ? ['140,180,110', '160,200,130', '175,215,145']          // miasma verde rastejante
    : ['158,178,205', '178,196,220', '190,206,228'];
  const NF = LOWFX ? 8 : 14;                                  // névoa enxuta: cada sopro varre linha a linha
  for (let i = 0; i < NF; i++){
    const spd = 5 + hash(i, 3) * 9;
    const fx = x0 + ((hash(i, 7) * span + time * spd) % span);
    const fy = Math.max(TT() * 2, Math.min(yMax, hash(i, 13) * yMax + Math.sin(time * .3 + i) * 6));
    const a = 34 + hash(i, 5) * 34;
    const b2 = 6 + hash(i, 9) * 4;                            // sopros assados: antes eram ~45 fillRects cada
    glowOn(g, fx, fy, a, b2 * 1.2, c1, A * .85, 'source-over');
    glowOn(g, fx + 8, fy + 1, a * .6, 6, c2, A * .75, 'source-over');
    glowOn(g, fx - 10, fy + 2, a * .4, 4, c3, A * .6, 'source-over');
  }
}

/* ---------------- POEIRA ATMOSFÉRICA ---------------- */
// motas de poeira em espaço de tela: pairam sobre o mundo E sobre o vazio,
// com paralaxe por profundidade — a costura entre as duas atmosferas
function drawMotes(time){
  if (current.ice){ drawSnowfall(time); return; }             // no gelo, a poeira vira nevasca
  if (current.sewer){ drawSwampAir(time); return; }           // no esgoto, vira vagalumes e bolhas
  for (let i = 0, n = LOWFX ? 24 : 42; i < n; i++){
    const p = .25 + hash(i, 21) * .55;                        // profundidade (paralaxe)
    const spd = 3 + hash(i, 22) * 6;
    let mx = (hash(i, 23) * 4096 + time * spd - cam.x * p) % VW;
    if (mx < 0) mx += VW;
    let my = (hash(i, 24) * 4096 + time * (2 + hash(i, 25) * 3) - cam.y * p) % VH;
    if (my < 0) my += VH;
    mx += Math.sin(time * .6 + i) * 3;                        // deriva preguiçosa
    const tw2 = .5 + Math.sin(time * (1 + hash(i, 26)) + i * 2) * .5;   // cintilar
    const warm = hash(i, 27) > .8;                            // umas poucas douradas
    const al = (.08 + tw2 * .22) * (.5 + p * .6);
    g.fillStyle = warm ? `rgba(240,214,150,${al})` : `rgba(170,190,215,${al})`;
    g.fillRect(Math.round(mx), Math.round(my), p > .6 ? 2 : 1, p > .6 ? 2 : 1);
  }
}
function drawSnowfall(time){                                  // flocos com paralaxe, caindo de lado
  for (let i = 0, n = LOWFX ? 34 : 64; i < n; i++){
    const p = .25 + hash(i, 31) * .6;
    const fall = 14 + hash(i, 32) * 26;
    let mx = (hash(i, 33) * 4096 + time * (6 + hash(i, 34) * 8) - cam.x * p) % VW;
    if (mx < 0) mx += VW;
    let my = (hash(i, 35) * 4096 + time * fall - cam.y * p) % VH;
    if (my < 0) my += VH;
    mx += Math.sin(time * .9 + i * 1.7) * 6;                  // balanço do vento
    const al = (.2 + hash(i, 36) * .3) * (.5 + p * .6);
    const sz = p > .6 ? 2 : 1;
    g.fillStyle = `rgba(235,246,255,${al})`;
    g.fillRect(Math.round(mx), Math.round(my), sz, sz);
    if (p > .75){                                             // flocos próximos ganham cruzinha
      g.fillStyle = `rgba(235,246,255,${al * .5})`;
      g.fillRect(Math.round(mx) - 1, Math.round(my), 1, 1);
      g.fillRect(Math.round(mx) + sz, Math.round(my), 1, 1);
    }
  }
}
function drawSwampAir(time){                                  // vagalumes doentes + bolhas de gás subindo
  for (let i = 0; i < 34; i++){
    const p = .3 + hash(i, 41) * .5;
    let mx = (hash(i, 42) * 4096 - cam.x * p) % VW;
    if (mx < 0) mx += VW;
    mx += Math.sin(time * (.5 + hash(i, 43) * .8) + i * 2.3) * 14;    // zigue-zague de inseto
    let my = (hash(i, 44) * 4096 - time * (8 + hash(i, 45) * 14) - cam.y * p) % VH;   // sobe
    if (my < 0) my += VH;
    const fire = hash(i, 46) > .72;                           // uns poucos piscam como vagalumes
    const tw2 = fire ? (Math.sin(time * (2 + hash(i, 47) * 2) + i) > .3 ? 1 : .1) : .5;
    const al = (.1 + tw2 * .3) * (.4 + p * .6);
    g.fillStyle = fire ? `rgba(190,240,120,${al})` : `rgba(140,200,110,${al * .6})`;
    g.fillRect(Math.round(mx), Math.round(my), fire && p > .6 ? 2 : 1, fire && p > .6 ? 2 : 1);
  }
}
function drawAurora(time){                                    // aurora boreal ondulando no alto
  g.save();
  g.globalCompositeOperation = 'lighter';
  blurFx(6);
  const bands = [['110,230,180', .05, 0], ['120,190,245', .04, 2.1], ['190,140,235', .033, 4.2]];
  bands.forEach(([rgb, a, ph], bi) => {
    g.beginPath();
    g.moveTo(0, 0);
    for (let x = 0; x <= VW; x += 24){
      const y = 26 + bi * 14 + Math.sin(time * .5 + ph + x * .008) * 14 + Math.sin(time * .23 + x * .003) * 8;
      g.lineTo(x, y);
    }
    g.lineTo(VW, 0);
    g.closePath();
    const gr = g.createLinearGradient(0, 0, 0, 90);
    gr.addColorStop(0, `rgba(${rgb},${a * 2})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.fill();
  });
  g.restore();
}

/* ---------------- ABERRAÇÃO CROMÁTICA (disparo de poder) ---------------- */
const CH = document.createElement('canvas');
const chg = CH.getContext('2d');
let chromaT = 0;
function drawChroma(){
  if (CH.width !== VW || CH.height !== VH){ CH.width = VW; CH.height = VH; }
  const off = Math.max(1, Math.ceil(chromaT * 6));            // deslocamento em pixels do buffer
  const pass = (tint, dx) => {
    chg.clearRect(0, 0, VW, VH);
    chg.globalCompositeOperation = 'source-over';
    chg.drawImage(B, 0, 0);
    chg.globalCompositeOperation = 'multiply';                // isola o canal de cor
    chg.fillStyle = tint; chg.fillRect(0, 0, VW, VH);
    chg.globalCompositeOperation = 'destination-in';
    chg.drawImage(B, 0, 0);
    cx.drawImage(CH, dx * zoom, 0, VW * zoom, VH * zoom);
  };
  cx.save();
  cx.imageSmoothingEnabled = false;
  cx.globalCompositeOperation = 'lighter';
  cx.globalAlpha = Math.min(.6, chromaT * 1.8);
  pass('#ff0040', -off);                                      // franja vermelha à esquerda
  pass('#00e0ff', off);                                       // franja ciano à direita
  cx.restore();
}

/* ---------------- LUZ ---------------- */
const L = document.createElement('canvas');
const lg = L.getContext('2d');
const DITH = (() => {                                         // matriz de Bayer 4×4: o pontilhado do 8-bit
  const c = document.createElement('canvas'); c.width = c.height = 4;
  const q = c.getContext('2d');
  q.fillStyle = '#000';
  [[0, 0], [2, 2], [1, 3], [3, 1]].forEach(([i, j]) => q.fillRect(i, j, 1, 1));
  return c;
})();
const LSTEP = [[0, 1], [.36, 1], [.36, .74], [.58, .74], [.58, .44], [.78, .44], [.78, .18], [.92, .18], [1, 0]];
const PUNCH = (() => {                                        // o perfil em degraus assado UMA vez
  const c = document.createElement('canvas'); c.width = c.height = 192;
  const q = c.getContext('2d');
  const gr = q.createRadialGradient(96, 96, 9.6, 96, 96, 96);
  LSTEP.forEach(([p2, k]) => gr.addColorStop(p2, `rgba(0,0,0,${k})`));
  q.fillStyle = gr; q.fillRect(0, 0, 192, 192);
  return c;
})();
let dithPat = null, dithN = 0;
/* O MAPA DE LUZ A 30 Hz. Montar o breu com os furos de cada lâmpada era a parte mais cara do
   quadro no covil (3,3ms num celular). Agora ele é refeito em quadro sim, quadro não; no quadro
   do meio o mapa anterior é reaproveitado DESLOCADO exatamente o quanto a câmera andou — por isso
   ele tem LUZ_M de sobra em cada borda. Troca de cena, giro ou câmera pulando refazem na hora.
   O halo quente das tochas (no fim) continua a 60 Hz. */
const LUZ_M = 24;
let luzQ = 0, luzChave = '', luzOX = 0, luzOY = 0;
function drawLight(time){
  const chave = (current && current.level) + '|' + (current === home) + '|' + rot + '|' + VW + 'x' + VH + '|' + LOWFX + '|' + (current && current.cursed);
  const refaz = (luzQ++ & 1) === 0 || chave !== luzChave || luzCena !== current
    || Math.abs(offX - luzOX) > LUZ_M / 2 || Math.abs(offY - luzOY) > LUZ_M / 2;
  const flick = Math.sin(time * 9) * 4 + Math.sin(time * 23) * 3;
  if (refaz){ luzChave = chave; luzCena = current; luzOX = offX; luzOY = offY; montaLuz(time, flick, offX + LUZ_M, offY + LUZ_M); }   // dentro do mapa, tudo anda LUZ_M pra dentro
  g.drawImage(L, Math.round(offX - luzOX) - LUZ_M, Math.round(offY - luzOY) - LUZ_M);
  const lights = current.lights();
  const wc = current.ice ? '110,200,245' : current.sewer ? '120,230,110' : '240,150,60';
  lights.filter(li => li.warm).forEach(li =>                  // halo das chamas, na alma de cada reino
    glowAt(li.x + offX, li.y + offY, 52 + flick, wc, li.warm));
}
let luzCena = null;
function montaLuz(time, flick, offX, offY){                   // offX/offY aqui já vêm com a margem
  const LW = VW + LUZ_M * 2, LH = VH + LUZ_M * 2;
  if (L.width !== LW || L.height !== LH){ L.width = LW; L.height = LH; dithPat = null; }
  dithN = 0;
  lg.clearRect(0, 0, LW, LH);
  lg.fillStyle = current.cursed ? 'rgba(22,2,5,.62)' : current.dark ? 'rgba(3,3,10,.52)' : current.wood ? 'rgba(16,12,6,.24)' : current.safe ? 'rgba(8,10,20,.44)' : 'rgba(6,9,22,.55)';   // covil claro de dia; lan escura gamer
  lg.fillRect(0, 0, LW, LH);
  lg.globalCompositeOperation = 'destination-out';
  const punch = (x, y, r, a) => {
    lg.save();                                                // luz em degraus: um drawImage do perfil assado
    lg.globalAlpha = Math.min(1, a);
    lg.imageSmoothingEnabled = true;
    lg.drawImage(PUNCH, Math.round(x - r), Math.round(y - r), Math.round(r * 2), Math.round(r * 2));
    lg.restore();
    if (LOWFX || r < TW || ++dithN > 3) return;                // pontilhado só nas luzes grandes
    if (!dithPat) dithPat = lg.createPattern(DITH, 'repeat');
    lg.save();                                                // pontilhado nas emendas dos degraus
    lg.strokeStyle = dithPat;
    lg.globalAlpha = Math.min(1, a * .85);
    lg.lineWidth = 3;
    for (const k of [.36, .58, .78]){ lg.beginPath(); lg.arc(x, y, r * k, 0, 6.2832); lg.stroke(); }
    lg.restore();
  };
  const lights = current.lights();
  lights.forEach(li => punch(li.x + offX, li.y + offY, li.r + (li.warm ? flick : 0), li.a));
  punch(gX(player.x, player.y) + offX, gY(player.x, player.y) - 20 + offY, TW * 1.05, .35);
  lg.globalCompositeOperation = 'source-over';
  lights.filter(li => li.moon || li.day || li.neon).forEach(li =>
    glowOn(lg, li.x + offX, li.y + offY, li.r, li.r,
      li.neon || (li.day ? '255,240,190' : '150,180,230'), li.neon ? .16 : li.day ? .14 : .1, 'source-over'));
}

/* ---------------- LOOP ---------------- */
let last = performance.now(), sparkAt = 0, last2 = 0, last2fx = performance.now();
let lastFlash = -1, lastBossKey = '', lowT = 0, dngT = 0, deadT = 0, ultimoFoes = -2, ultimaSala = null;
/* O ANDAR LEVA UM INSTANTE PRA NOTAR QUE VOCÊ CHEGOU. Sem isso, a sala inteira convergia na
   porta no primeiro quadro — bicho com alcance 9, 11, 12 enxerga o mapa todo numa sala de 13x9,
   e a chegada era sempre um cerco. Este segundo de silêncio é o que dá o compasso de CHEGAR,
   olhar a planta e AVANÇAR, em vez de já nascer cercado. */
let chegadaT = 0;
const setOp = (el, v) => { const s2 = v.toFixed ? v.toFixed(3) : v; if (el._op !== s2){ el._op = s2; el.style.opacity = s2; } };                         // memória do HUD: evita reescrever DOM por quadro
function frame(now){
  /* Sozinho, o mundo anda no tempo do quadro. Em sala, o `relogio()` corta esse tempo em
     dentes fixos de 1/60 s e acerta o pêndulo pelo relógio do dono — os dois aparelhos
     batalham no mesmo compasso, mesmo com telas de 60 e de 144 quadros. */
  const rawDt = relogio(Math.min((now - last) / 1000, .05));   // tempo do MUNDO, sem hitstop nem lentidão
  let dt = rawDt;
  const time = now / 1000;
  last = now;
  fxBlurs = 0;                                                // orçamento de desfoque do quadro
  if (hitStop > 0){ hitStop = Math.max(0, hitStop - dt); dt *= .12; }  // micro-pausa no impacto
  if (slowMo > 0){ slowMo = Math.max(0, slowMo - rawDt); dt *= .42; }  // crítico: o mundo arrasta
  compasso(dt);                                               // a batida do passo: só nela alguém sai do lugar
  dmgFlash = Math.max(0, dmgFlash - dt * 2.4);
  if (bueiroT > 0) bueiroT = Math.max(0, bueiroT - rawDt);    // os olhos do bueiro somem sozinhos
  if (dmgFlash !== lastFlash){                                // só toca no DOM quando muda de verdade
    document.getElementById('dmg').style.opacity = dmgFlash;
    lastFlash = dmgFlash;
  }

  // sombra atrás de qualquer janela aberta (clicar fora fecha)
  shadeEl.classList.toggle('open', chestOpen || lanOpen || askOpen || invOpen || wardOpen || upOpen || charOpen);

  // Coração Antigo no tabuleiro: laterais pulsam em vermelho e soltam coraçõezinhos
  const hfx = document.getElementById('heartFx');
  if (!current.safe && current.pickups.some(pk2 => pk2.kind === 'heartmax')){
    if (!hfx.classList.contains('play'))
      setOp(hfx, .06 + (Math.sin(time * 2.4) + 1) * .085);
    heartAmbT -= dt;
    if (heartAmbT <= 0){ heartAmbT = .42; heartSide(); }
  } else if (!hfx.classList.contains('play')) setOp(hfx, 0);

  // debuffs bem visíveis: laterais em chamas / congeladas + chips com barrinha de tempo
  const bfx = document.getElementById('burnFx');
  if (burnT > 0 && !player.dead){
    setOp(bfx, .3 + Math.sin(time * 7) * .16 + Math.sin(time * 23) * .08);
    burnSideT -= dt;
    if (burnSideT <= 0){ burnSideT = .12; burnSide(); }
  } else setOp(bfx, 0);
  const ffx = document.getElementById('frostFx');
  if (frozT > 0 && !player.dead){
    setOp(ffx, .34 + Math.sin(time * 2.2) * .12);
    frostSideT -= dt;
    if (frostSideT <= 0){ frostSideT = .07; frostSide(); }    // mais gelo vazando pelas beiradas
  } else setOp(ffx, 0);
  const pfx = document.getElementById('poisFx');
  if (poisT > 0 && !player.dead){
    setOp(pfx, .3 + Math.sin(time * 1.7) * .12);
    poisSideT -= dt;
    if (poisSideT <= 0){ poisSideT = .16; gooSide(); }        // bolhas de lodo subindo pelas laterais
  } else setOp(pfx, 0);
  renderDebuffs();

  // jogador (mochila/diálogo abertos = jogo pausado)
  const paused = anyPanel() && player.mode !== 'dead';
  passoAvisos();                                              // um aviso por vez, na ordem em que aconteceu
  passoOnline(rawDt);                                         // manda o meu boneco e recebe o do parceiro
  /* SOM DO LUGAR — troca o leito com o andar, ABAFA com caixinha aberta (como se o jogo
     estivesse noutro cômodo) e pinta uma gota/lufada/tique de vez em quando. */
  if (AC){
    ambiente(lugarSonoro());
    if (sfxFilt){
      const alvo = paused ? 800 : 18000;
      if (alvo !== sfxFiltAlvo){
        sfxFiltAlvo = alvo;
        rampa(sfxFilt.frequency, alvo, AC.currentTime, .07);
      }
    }
    ambT -= rawDt;
    if (ambT <= 0 && !paused && sfxOn){
      const k2 = lugarSonoro();
      ambT = 2.6 + Math.random() * 3.6;
      sfxPan = (Math.random() - .5) * 1.2; sfxDist = 1;        // vem de algum canto da sala
      if (k2 === 'ice') SFX.ambGelo();
      else if (k2 === 'sewer') SFX.ambPingo();
      else if (k2 === 'covil') SFX.ambLar();
      else SFX.ambEco();
      sfxPan = 0;
    }
  }
  { const hpEl = document.getElementById('hpBar');             // VIDA CRÍTICA: 30% ou menos
    const lim = Math.max(2, Math.ceil(player.maxHp * .3));
    const danger = !current.safe && !player.dead && player.hp > 0 && player.hp <= lim;
    const dfx = document.getElementById('dangerFx');
    if (hpEl) hpEl.classList.toggle('low', danger);
    if (danger){
      const k = Math.min(1, (lim - player.hp + 1) / lim);     // 0 = beirando o limite · 1 = último coração
      const bpm = 1.6 + k * 1.6;                              // o coração acelera junto com o perigo
      const ph = (time * bpm) % 1;                            // batida dupla: tum-tum … tum-tum
      const beat = Math.max(0, 1 - ph * 5) + Math.max(0, 1 - Math.abs(ph - .24) * 6) * .78;
      setOp(dfx, Math.min(1, (.17 + k * .3) * Math.min(1.1, beat + .3)));
      if (!paused){
        dngT -= dt;
        if (dngT <= 0){ dngT = .075 - k * .04; dangerSide(k); }   // flares sem parar: dois por disparo
        lowT -= dt;
        if (lowT <= 0){ lowT = 1.2 - k * .55; SFX.low(); }
      }
    } else { setOp(dfx, 0); lowT = 0; dngT = 0; } }

  /* PULSO DOS DEBUFFS — enquanto algo estiver corroendo o ratinho, a tela inteira BATE junto:
     aberração cromática pulsando, um tranco curto de câmera nas duas batidas (tum-tum) e as abas
     laterais piscando alternadas na cor do que está pegando. É a mesma conta de batimento do
     alerta de vida crítica: quanto mais debuff empilhado, mais rápido o coração. */
  { const fogo = burnT > 0, gelo = frozT > 0, veneno = poisT > 0;
    const nD = (fogo ? 1 : 0) + (gelo ? 1 : 0) + (veneno ? 1 : 0);
    const lL = document.getElementById('ladoL'), lR = document.getElementById('ladoR');
    if (nD && !player.dead && !paused){
      const bpm = 1.45 + nD * .38;                            // 1 debuff bate devagar; 3 é taquicardia
      const ph = (time * bpm) % 1;
      const beat = Math.max(0, 1 - ph * 5) + Math.max(0, 1 - Math.abs(ph - .24) * 6) * .78;
      chromaT = Math.max(chromaT, (.05 + nD * .045) * (.3 + beat * .9));   // a visão desalinha no ritmo
      dbfBeatT = Math.max(0, dbfBeatT - rawDt);
      if (beat > .85 && dbfBeatT <= 0){                       // um tranco por batida, nunca acumulado
        dbfBeatT = .3 / bpm;
        shake(.9 + nD * .45, .2);
      }
      // gelo manda na cor quando empilha: é o mais urgente de ler
      const cor = gelo ? '150,215,255' : veneno ? '130,225,100' : '255,150,50';
      if (cor !== ladoCorAtual){
        ladoCorAtual = cor;
        document.documentElement.style.setProperty('--ladoCor', `rgba(${cor},.9)`);
      }
      // uma aba por BATIDA. Alternando duas vezes por ciclo, a virada caía sempre no vale do
      // batimento e o lado direito nunca chegava a acender.
      const alt = (((time * bpm) | 0) % 2) === 0;
      const forte = (.18 + nD * .09) * (.22 + beat * 1.05);
      setOp(lL, alt ? forte : forte * .16);
      setOp(lR, alt ? forte * .16 : forte);
    } else { setOp(lL, 0); setOp(lR, 0); dbfBeatT = 0; } }

  if (player.mode === 'dead' && !player.dead && !onlineConvidado()){   // conta em tempo real: nada atrasa o renascimento
    deadT += rawDt;
    const espera = sapoTemPedra();                            // o parceiro tem a pedra arco-íris: dá tempo dele usar
    if (espera && !avisouPedra){ avisouPedra = true; toast('🌈 o sapo tem a pedra arco-íris — ele pode te reviver'); }
    if (deadT > (espera ? PEDRA_ESPERA : 1.15)) respawn();
  }
  // parado na porta da dungeon: a caixinha abre quando o jogador VIRA pra ela (empurrão não conta)
  if (!onlineConvidado() && !current.safe && !paused && !transitioning && !player.dead && player.mode === 'idle'){
    const dkey = player.tx + ',' + player.ty;
    const door2 = current.doors[dkey];
    if (door2){
      const akey = dkey + ',' + player.dir;
      if (facingDoorOut() && akey !== askDis) openAsk(door2);
    } else askDis = '';
  }
  pollPad();                                                  // controle de videogame entra pelas mesmas filas
  segueMomento();                                             // Snake: a direção do T segue valendo na batida
  sapinhaVem();
  const hd0 = heldDir();                                      // direções chegam em espaço de TELA
  /* O passo do rato só sai na batida do compasso (o `startStep` segura até lá). Na tela do
     sapo o rato nem é daqui: é desenho do rato de lá, posto na casa que o pacote do passo mandou. */
  const ctrl = transitioning || pDead() || paused
    ? {}
    : onlineConvidado()
      ? tomaCtl(player)
      : { dir: hd0 == null ? null : s2w(hd0), attack: wantAtk && weapon != null };
  wantAtk = false;
  if (atkHold && !paused && !transitioning && !pDead()){       // segurando: a lâmina vai carregando
    chargeT += dt;
    if (!chargeRdy && chargeT >= CHARGE_T){
      chargeRdy = true;
      SFX.charged();
      for (let k = 0; k < 10; k++)
        dust.push({ x: gX(player.x, player.y) + (hash(k, 71) - .5) * 22, y: gY(player.x, player.y) - 16 - hash(k, 72) * 20,
          vx: (hash(k, 73) - .5) * 60, vy: -30, life: .45, kind: 'hit' });
    }
  } else if (atkHold && (paused || pDead())){ atkHold = false; chargeT = 0; chargeRdy = false; chargeLock = false; }
  passoQuerT -= dt; if (passoQuerT <= 0) passoQuer = null;
  dashCd = Math.max(0, dashCd - dt);
  if (wantDash && batePasso){                                 // dash de 2 tiles (duplo toque) · sai na batida
    wantDash = false;
    if (!paused && !transitioning && !pDead() && dashCd <= 0 && player.mode === 'idle')
      doDash(s2w(lastTapDir));
  }
  if (!paused){ updateBeams(dt); updateFields(dt); }          // raios, gelo, névoa e fita do tempo
  if (!paused){
    stepActor(player, dt * (stamT > 0 ? 1.5 : 1) * (frozT > 0 ? .75 : 1) * (hasCard('cmosq') ? 1.15 : 1) * (hasCard('ccrow') ? 1.2 : 1), time, ctrl);  // stamina 1.5x · congelado .75x
    if (chargeT > .12 && player.mode === 'idle'){             // ANTECIPAÇÃO: o corpo se arma enquanto carrega
      const ck = Math.min(1, chargeT / CHARGE_T), pp = player.pose;
      pp.crouch = Math.max(pp.crouch, 1 + Math.round(ck) + (chargeRdy ? 1 : 0));
      pp.earY = 1;
      if (chargeRdy) pp.lean = -1;                            // pronto: recolhe um passo antes de disparar
    }
    checkDeposit();
    checkLab();
  }
  passoP2(dt, rawDt, time, paused || transitioning);          // o jogador 2 anda no mesmo ritmo

  // PODER ESPECIAL — o aperto fica GUARDADO por um instante. Apanhando um tranco na hora exata,
  // o pedido caía no vazio; com dois jogadores em campo isso virava "o poder não funciona".
  // O buffer corre no relógio DO MUNDO (dt), não no de parede: no impacto o quadro trava em 12% e
  // no crítico arrasta em 42% — descontando tempo real, o pedido evaporava antes do corpo se soltar.
  if (wantSpc){ wantSpc = false; if (!doSpecial()) spcBuf = .35; }
  if (spcBuf > 0){ spcBuf = Math.max(0, spcBuf - dt); if (spcBuf > 0 && doSpecial(player, true)) spcBuf = 0; }
  if (!paused) for (const k in powerCd) powerCd[k] = Math.max(0, powerCd[k] - dt);
  { const cdEl = document.getElementById('spcCd');
    if (power && (powerCd[power] || 0) > 0){ cdEl.style.display = 'flex'; cdEl.textContent = Math.ceil(powerCd[power]); }
    else cdEl.style.display = 'none'; }

  // stamina: corrida verde de 5s, recarga longa
  if (wantStam){ wantStam = false; if (!doStam()) stamBuf = .35; }
  if (stamBuf > 0){ stamBuf = Math.max(0, stamBuf - dt); if (stamBuf > 0 && doStam(player, true)) stamBuf = 0; }
  if (!paused){
    stamCd = Math.max(0, stamCd - dt);
    if (stamT > 0){
      stamT = Math.max(0, stamT - dt);
      if (stamT === 0) toast('⚡ fim');
      else if (((now / 60) | 0) % 2 === 0)                    // fagulhas verdes irradiando do corpo
        dust.push({
          x: gX(player.x, player.y) + (hash((now | 0), 11) - .5) * 20,
          y: gY(player.x, player.y) - 6 - hash((now | 0), 12) * 26,
          vx: (hash((now | 0), 13) - .5) * 30,
          vy: -20, life: .4, kind: 'stamP',
        });
    }
  }
  { const sB = document.getElementById('bStam'), sC = document.getElementById('stamCd');
    sB.classList.toggle('run', stamT > 0);
    if (stamT <= 0 && stamCd > 0){ sC.style.display = 'flex'; sC.textContent = Math.ceil(stamCd); }
    else sC.style.display = 'none'; }
  if (burnT > 0 && !paused && !player.dead){                  // queimadura: 1 de vida a cada 2s, 2 no total
    burnT = Math.max(0, burnT - dt);
    burnTk -= dt;
    if (burnTk <= 0){
      burnTk = 2;
      SFX.burn();
      player.hp -= 1; player.flash = .12;
      dmgNum(player.tx, player.ty, 1, 'red');
      dmgFlash = Math.max(dmgFlash, .5);
      if (player.hp <= 0){ player.mode = 'dead'; player.t = 0; }
      updateHUD();
    }
    if (((now / 80) | 0) % 2 === 0)                          // labaredas no corpo do rato
      dust.push({
        x: gX(player.x, player.y) + (hash((now | 0), 7) - .5) * 14,
        y: gY(player.x, player.y) - 12 - hash((now | 0), 8) * 28,
        vy: -24, life: .35, kind: 'fireP',
      });
  }
  if (poisT > 0 && !paused && !player.dead){                  // VENENO: não sangra — trava o arsenal
    poisT = Math.max(0, poisT - dt);
    if (((now / 130) | 0) % 2 === 0)                          // gotas verdes escorrendo
      dust.push({
        x: gX(player.x, player.y) + (hash((now | 0), 14) - .5) * 14,
        y: gY(player.x, player.y) - 16 - hash((now | 0), 15) * 22,
        vy: 16, life: .4, kind: 'poisP',
      });
  }
  if (leechT > 0 && !paused) leechT = Math.max(0, leechT - dt);
  if (!paused){                                               // buffs da Escavação correndo
    if (quakeT > 0) quakeT = Math.max(0, quakeT - dt);
    if (drillT > 0) drillT = Math.max(0, drillT - dt);
    if (iceTrailT > 0) iceTrailT = Math.max(0, iceTrailT - dt);
    if (edgeT > 0){
      edgeT = Math.max(0, edgeT - dt);
      if (((now / 70) | 0) % 2 === 0)                         // fagulhas douradas correndo pela lâmina
        dust.push({
          x: gX(player.x, player.y) + (hash((now | 0), 41) - .5) * 22,
          y: gY(player.x, player.y) - 14 - hash((now | 0), 42) * 20,
          vx: (hash((now | 0), 43) - .5) * 26, vy: -18, life: .35, kind: 'starP',
          ph: hash((now | 0), 44) * 6.3, ci: 1,
        });
    }
  }
  player.atkS = .3;
  if (aegisT > 0 && !paused && !player.dead){                 // casaco de gelo: aura de cristais
    aegisT = Math.max(0, aegisT - dt);
    if (((now / 120) | 0) % 2 === 0)
      dust.push({
        x: gX(player.x, player.y) + (hash((now | 0), 22) - .5) * 20,
        y: gY(player.x, player.y) - 8 - hash((now | 0), 23) * 30,
        vy: -10, life: .4, kind: 'iceP',
      });
  }
  if (current.ice && !paused && !player.dead && ((now / 2600) | 0) !== ((last2 / 2600) | 0))
    dust.push({                                               // bafinho de frio do ratinho
      x: gX(player.x, player.y) + (player.dir === 1 || player.dir === 2 ? -7 : 7),
      y: gY(player.x, player.y) - 34,
      vx: player.dir === 1 || player.dir === 2 ? -8 : 8, vy: -6, life: .8, kind: 'breath',
    });
  last2 = now;
  if (frozT > 0 && !paused && !player.dead){                  // congelado: cristais se soltando do corpo
    frozT = Math.max(0, frozT - dt);
    if (((now / 110) | 0) % 2 === 0)
      dust.push({
        x: gX(player.x, player.y) + (hash((now | 0), 9) - .5) * 16,
        y: gY(player.x, player.y) - 10 - hash((now | 0), 10) * 26,
        vy: 8, life: .4, kind: 'iceP',
      });
  }
  if (chegadaT > 0 && !paused) chegadaT = Math.max(0, chegadaT - dt);
  if (!paused) passoPerigos(dt);                              // as marcas do chefe fecham sozinhas
  if (suorT > 0 && !paused) suorT = Math.max(0, suorT - dt);   // a gota escorre sozinha
  if (isca && !paused){ isca.t -= dt; if (isca.t <= 0) estouraIsca(); }
  if (!paused && current.placas) current.placas.forEach(pl => {   // a placa conta e solta os dardos
    if (pl.cd > 0) pl.cd = Math.max(0, pl.cd - dt);
    if (pl.t <= 0) return;
    pl.t -= dt;
    if (pl.t <= 0){ pl.t = 0; pl.cd = 2.6; dispararPlaca(pl); }   // rearma depois: o perigo dura o andar
  });
  for (let i = dardos.length - 1; i >= 0; i--){
    dardos[i].t += dt;
    if (dardos[i].t > .26) dardos.splice(i, 1);
  }
  if (rageT > 0 && !paused){                                  // aura da fúria
    rageT = Math.max(0, rageT - dt);
    if (((now / 90) | 0) % 2 === 0)
      dust.push({
        x: gX(player.x, player.y) + (hash((now | 0), 5) - .5) * 18,
        y: gY(player.x, player.y) - 8 - hash((now | 0), 6) * 26,
        vy: -18, life: .3, kind: 'rageP',
      });
  }

  // varredura periódica da rede enquanto estiver na lan house
  if (current === SCENES.lanroom){
    lanScanT -= dt;
    if (lanScanT <= 0){ lanScanT = 10; lanScan(); }
  }

  // dungeon limpa → escadas surgem
  if (!current.safe && !current.cleared && !transitioning &&
      current.actors.every(a => !a.hostile || a.dead)){
    current.cleared = true;
    if (current.level < 30 && hash(current.level * 17 + (performance.now() | 0) % 331, 7) < .05){   // rara de verdade
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]){   // fenda colada na escada
        const hx = current.exit.x + ox, hy = current.exit.y + oy;
        if (current.free(hx, hy) && !occupied(hx, hy, null)){ current.hell = { x: hx, y: hy }; break; }
      }
      if (current.hell){ SFX.quake(); toast('🔥 fenda maldita!'); }
    }
    SFX.fanfare();
    const lv2 = current.level;
    bannerNaFila(
      lv2 === 10 ? 'REINO DO GELO!' : lv2 === 20 ? 'ESGOTO REAL!' :
      lv2 === 30 ? 'SABÁ DAS BRUXAS!' : lv2 >= 40 ? 'LENDÁRIO!' : 'COMPLETO!',
      lv2 === 10 ? 'gelo' : lv2 === 20 ? 'esgoto' :
      lv2 === 30 ? 'bruxa' : lv2 >= 40 ? 'lenda' : '', 2750);
    toast(
      current.level === 10 ? '❄️ nv 11–20!' :
      current.level === 20 ? '🐸 nv 21–30!' :
      current.level === 30 ? '🎃 nv 31–40!' :
      current.level >= 40 ? '👑 caiu!' : `☠️ limpa ➡️ nv ${current.level + 1}`);
  }

  // inimigos e npcs (congelados pela Nova Glacial ficam parados no tempo)
  if (!paused) current.actors.forEach(a => {
    if (a.dead) return;
    if (a.frzT > 0){                                          // estátua de gelo: parada, mas continua sendo alvo
      a.frzT = Math.max(0, a.frzT - dt);
      a.invuln = Math.max(0, a.invuln - dt);                  // sem isso ela ficava imortal dentro do gelo
      a.flash = Math.max(0, a.flash - dt); a.pose.flash = a.flash;
      if (a.recT > 0) a.recT = Math.max(0, a.recT - dt);      // a estátua de gelo ainda treme no golpe
      if (a.hpBarT > 0) a.hpBarT = Math.max(0, a.hpBarT - dt);
      if (a.alertT > 0) a.alertT = Math.max(0, a.alertT - dt);
      a.cd = Math.max(0, a.cd - dt);
      if (((now / 160) | 0) % 3 === 0)
        dust.push({ x: gX(a.x, a.y) + (hash((now | 0) + a.tx, 11) - .5) * 14, y: gY(a.x, a.y) - 14, vy: 10, life: .35, kind: 'iceP' });
      return;
    }
    if (a.boss){                                              // relógios do telegrafo e da guarda aberta
      if (a.tellT > 0){ a.tellT = Math.max(0, a.tellT - dt); if (a.tellT === 0) a.telled = true; }
      if (a.openT > 0) a.openT = Math.max(0, a.openT - dt);
    }
    if (a.hostile && a.hexT > 0){                             // marca da praga: some sozinha
      a.hexT = Math.max(0, a.hexT - dt);
      if (!LOWFX && ((now * 6) | 0) % 3 === 0)
        dust.push({ x: gX(a.x, a.y) + (hash((now | 0) + a.ty, 23) - .5) * 14, y: gY(a.x, a.y) - 18,
          vy: -18, life: .4, kind: 'hexP' });
    }
    if (a.hostile && a.burnT > 0){                            // queimando: 1 de dano por segundo
      a.burnT = Math.max(0, a.burnT - dt);
      a.burnTk -= dt;
      dust.push({ x: gX(a.x, a.y) + (hash((now | 0) + a.tx, 17) - .5) * 12, y: gY(a.x, a.y) - 16,
        vy: -22, life: .3, kind: 'fireP' });
      if (a.burnTk <= 0){ a.burnTk = 1; a.invuln = 0; applyHit(a, 1, a.dir); }
      if (a.dead) return;
    }
    /* Em sala, TODO personagem do andar anda pela ordem que veio do fio — bicho, npc, tudo:
       é isso que faz as duas telas mostrarem exatamente as mesmas posições. */
    if (a.boss && !cliente()) passoChefe(a, dt);      // o repertório decide antes do corpo andar
    /* O bicho só DECIDE na batida do compasso (andar, bater, vagar) — entre uma e outra ele
       espera parado. Por isso o relógio da vadiagem anda um passo inteiro de cada vez. */
    const c3 = cliente() ? tomaCtl(a) : (a.hostile && batePasso ? enemyCtrl(a, PASSO_T) : {});
    stepActor(a, dt, time, c3);
    if (a.boss) posaChefe(a);                                 // e a antecipação vem depois: o stepActor zera a pose
  });
  fimDoPasso();                                               // todo mundo já andou: o passo atravessa o fio

  // A CENA DA ENTREGA anda DEPOIS dos atores de propósito: o stepActor zera crouch/air a cada
  // quadro no modo parado, e a atuação que eu escrevesse antes dele seria apagada no mesmo frame.
  if (!paused) passoEntrega(dt);

  /* O PLACAR DO ANDAR. Sem ele o jogador limpava a sala sem nunca saber quanto faltava, e a
     conquista do andar só existia no instante do COMPLETO!. Ele NÃO interrompe (letreiro no meio
     da tela pra cada último bicho cansa) — ele reage: soco a cada baixa, barra recuando, pulso
     dourado quando sobra um e lampejo verde ao limpar. Canto do olho, não corte de cena. */
  {
    const n2 = current.safe ? -1 : current.actors.filter(a2 => a2.hostile && !a2.dead).length;
    if (n2 !== ultimoFoes){
      const el = document.getElementById('plFoes');
      const baixa = ultimoFoes > 0 && n2 >= 0 && n2 < ultimoFoes && current === ultimaSala;   // caiu um AGORA
      ultimaSala = current;                                   // trocar de sala não é baixa: nada de soco à toa
      if (n2 < 0) el.className = 'off';
      else {
        const tot = Math.max(1, current.foesMax || n2 || 1);
        document.getElementById('plFoesIco').src = n2 > 0 ? ICON.skull : ICON.check;
        document.getElementById('plFoesN').textContent = n2 > 0 ? n2 : '';
        document.getElementById('plFoesFill').style.transform = `scaleX(${Math.max(0, Math.min(1, n2 / tot))})`;
        el.className = n2 === 1 ? 'ultimo' : n2 === 0 ? 'limpo' : '';
        if (baixa){ void el.offsetWidth; el.classList.add('soco'); }   // reinicia a animação do soco
      }
      ultimoFoes = n2;
    }
  }

  // barra do chefe: objetivo visível enquanto ele viver
  {
    const bEl = document.getElementById('bossBar');
    const bs = !current.safe && current.actors.find(a2 => a2.boss && !a2.dead);
    const bkey = bs ? (bs.name || '') + '|' + Math.max(0, bs.hp) : '';
    if (bkey !== lastBossKey){                                // o HUD do chefe só é reescrito quando algo muda
      lastBossKey = bkey;
      bEl.style.display = bs ? 'block' : 'none';
      if (bs){
        bEl.classList.toggle('ice', !!current.ice);
        bEl.classList.toggle('sewer', !!current.sewer);
        const nm = bs.name || '💀 CHEFE';
        const sp2 = nm.indexOf(' ');
        document.getElementById('bossIco').innerHTML = emojify(sp2 > 0 ? nm.slice(0, sp2) : '💀');
        document.getElementById('bossName').textContent = sp2 > 0 ? nm.slice(sp2 + 1) : nm;
        document.getElementById('bossHp').innerHTML = emojify(`${Math.max(0, bs.hp)} ♥️`);
        document.getElementById('bossFill').style.transform = `scaleX(${Math.max(0, bs.hp / bs.maxHp)})`;
      }
    }
  }

  // fagulhas de tochas
  sparkAt -= dt;
  if (sparkAt < 0){
    const ls = current.lights().filter(l => l.warm);
    if (ls.length){
      const l = ls[(hash((now | 0), 1) * ls.length) | 0];
      dust.push({ x: l.x + (hash((now | 0), 2) - .5) * 6, y: l.y - 2, vy: -14, life: .6, kind: 'spark' });
    }
    sparkAt = .4 + hash((now | 0), 3);
  }
  dust.forEach(m => {
    m.life -= dt;
    m.x += (m.vx || 0) * dt; m.y += m.vy * dt;
    if (m.gv) m.vy += m.gv * dt;                              // gota pesada: cai de verdade
    else m.vy *= .9;
    if (m.vx) m.vx *= .92;
  });
  for (let i = dust.length - 1; i >= 0; i--) if (dust[i].life <= 0) dust.splice(i, 1);

  // câmera
  /* Com dois em campo a câmera fica no meio, puxada pra quem você joga: no celular do sapo,
     quem manda no enquadramento é o sapo — senão você joga olhando as costas do parceiro. */
  const kMeu = onlineConvidado() ? .36 : .64;
  const cax = (p2On && !player2.dead) ? player.x * kMeu + player2.x * (1 - kMeu) : player.x;
  const cay = (p2On && !player2.dead) ? player.y * kMeu + player2.y * (1 - kMeu) : player.y;
  const tgx = gX(cax, cay), tgy = gY(cax, cay) - 26;
  if (!cam.init){ cam.x = tgx; cam.y = tgy; cam.init = true; }
  const kk = 1 - Math.exp(-6 * dt);
  cam.x += (tgx - cam.x) * kk; cam.y += (tgy - cam.y) * kk;
  offX = Math.round(VW / 2 - cam.x); offY = Math.round(VH / 2 - cam.y);
  if (shakeT > 0){                                            // tranco de câmera ao tomar dano
    shakeT = Math.max(0, shakeT - dt);
    const m = shakeMag * (shakeT / shakeDur);
    offX += Math.round(Math.sin(now * .09) * m + shkX * m * 1.5);
    offY += Math.round(Math.cos(now * .13) * m * .7 + shkY * m * 1.5);
  }

  // render
  g.clearRect(0, 0, VW, VH);
  g.fillStyle = '#07090e'; g.fillRect(0, 0, VW, VH);
  g.save();
  g.translate(offX, offY);

  const th2 = TT();
  const [vw2, vh2] = rot % 2 ? [current.h, current.w] : [current.w, current.h];   // mapa girado troca L×A
  g.drawImage(stageCanvas(vw2, vh2, th2), -stageOX, -stageOY);                    // paredes + piso já assados
  if (rot === 0) current.decor(time);                         // decor de parede só na vista original
  else for (const dk in current.doors){                       // girado: portas viram marcas brilhando no chão
    const [ddx, ddy] = dk.split(',').map(Number);
    const [mx2, myT] = tvTop(ddx, ddy);
    const pu2 = .45 + Math.sin(time * 3 + ddx) * .25;
    g.save();
    g.globalCompositeOperation = 'lighter';
    blurFx(2.5);
    lote(() => E(mx2, myT + th2, 14, 6, `rgba(240,180,90,${.16 + pu2 * .2})`));
    g.restore();
    g.strokeStyle = `rgba(240,190,110,${.35 + pu2 * .3})`;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(mx2, myT + 2); g.lineTo(mx2 + TW / 2 - 2, myT + th2);
    g.lineTo(mx2, myT + th2 * 2 - 2); g.lineTo(mx2 - TW / 2 + 2, myT + th2);
    g.closePath(); g.stroke();
  }

  drawTileHops(dt);                                           // tiles saltando no tremor da irrupção
  drawFurrow(dt);                                             // sulcos abertos pela Escavação
  // rastro: losango na pisada + clarão fresco, esvanece em 1.4s
  for (let i = trail.length - 1; i >= 0; i--){
    const tr = trail[i];
    tr.t += dt;
    if (tr.t >= 1.4){ trail.splice(i, 1); continue; }
    const al = 1 - tr.t / 1.4;
    const [x, yT0] = tvTop(tr.x, tr.y), yc = yT0 + th2;
    const ng = tr.g;                                          // pisada de stamina = neon verde
    const trc = ng ? '80,255,130' : current.ice ? '160,215,250' : current.sewer ? '160,230,130' : '230,205,130';
    glowOval(x, yc, TW / 2 - 2, th2 - 1, trc, al * (ng ? .5 : .4));   // pisada acesa, sem desfoque de canvas
  }

  // poças de lava borbulhando
  if (current.lava) current.lava.forEach(lt => {
    const [x, yT] = tvTop(lt.x, lt.y);
    for (let r = 1; r < th2 * 2 - 1; r++){
      const half = r < th2 ? r : th2 * 2 - r;
      const w2 = Math.round(half / th2 * (TW / 2)) - 3;
      if (w2 <= 0) continue;
      P(x - w2, yT + r, w2 * 2, 1,
        (r + ((time * 6) | 0)) % 5 === 0 ? '#e8963c' : (r % 2 ? '#c74a1e' : '#a83214'));
    }
    for (let b2 = 0; b2 < 3; b2++){                          // bolhas
      const bx = x + Math.round(Math.sin(time * 1.3 + b2 * 2.1 + lt.x * 3) * (TW / 4));
      const by = yT + th2 + Math.round(Math.cos(time * 1.7 + b2 * 1.3 + lt.y) * (th2 / 2));
      P(bx, by, 2, 2, ((time * 4 + b2) | 0) % 2 ? '#f2c14e' : '#e8963c');
    }
    const lp = .42 + Math.sin(time * 3 + lt.x + lt.y) * .16;
    glowAt(x, yT + th2, 26 + lp * 8, '248,150,55', lp * .42); // calor emanando (fraco: as poças se somam)
    for (let e2 = 0; e2 < 2; e2++){                          // fagulhas subindo do magma
      const ph = (time * .7 + e2 * .5 + lt.x * .3) % 1;
      P(x + Math.sin(time + e2 * 3 + lt.y) * 9, yT + th2 - ph * 28, 2, 2,
        `rgba(255,${150 + e2 * 50},60,${(1 - ph) * .85})`);
    }
    g.strokeStyle = `rgba(255,170,70,${lp + .15})`;          // borda quente nítida
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(x, yT + 2); g.lineTo(x + TW / 2 - 3, yT + th2);
    g.lineTo(x, yT + th2 * 2 - 2); g.lineTo(x - TW / 2 + 3, yT + th2);
    g.closePath(); g.stroke();
  });

  // PLACAS DE GELO POLIDO: o tile onde o ratinho DESLIZA. O andar do gelo é azul-escuro de
  // propósito pra que estas leiam de longe — placa quase branca, aresta acesa e um lustro
  // varrendo a superfície. Se está brilhando, você vai escorregar. É o contrato inteiro.
  if (current.slick) current.slick.forEach(st => {
    const [x, yT] = tvTop(st.x, st.y);
    for (let r = 2; r < th2 * 2 - 2; r++){
      const half = r < th2 ? r : th2 * 2 - r;
      const w2 = Math.round(half / th2 * (TW / 2)) - 4;
      if (w2 <= 0) continue;
      P(x - w2, yT + r, w2 * 2, 1, r % 2 ? '#cfe8fa' : '#b6d8f2');
    }
    const sw = ((time * .6 + st.x * .3 + st.y * .2) % 1);      // lustro varrendo a placa
    const swy = 3 + Math.round(sw * (th2 * 2 - 8));
    const halfS = swy < th2 ? swy : th2 * 2 - swy;
    const ws = Math.round(halfS / th2 * (TW / 2)) - 5;
    if (ws > 0) P(x - ws, yT + swy, ws * 2, 2, 'rgba(255,255,255,.75)');
    for (let i = 0; i < 3; i++)                                // riscos de patinação
      P(x - 9 + i * 8, yT + th2 - 3 + (i % 2) * 5, 6, 1, 'rgba(120,175,215,.6)');
    glowAt(x, yT + th2, 20, '200,235,255', .3);
    g.strokeStyle = 'rgba(240,252,255,.92)';                   // ARESTA ACESA: o aviso de longe
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, yT + 1); g.lineTo(x + TW / 2 - 2, yT + th2);
    g.lineTo(x, yT + th2 * 2 - 1); g.lineTo(x - TW / 2 + 2, yT + th2);
    g.closePath(); g.stroke();
  });

  // armadilhas de espinhos
  if (current.traps){
    const armed = !current.witch || (time % 2) < 1.1;      // no sabá o espinho pulsa
    current.secrets.forEach(sc => {                          // TILE SUSPEITO: terra remexida com um lampejo
      if (sc.taken) return;
      const [x, yT0] = tvTop(sc.x, sc.y), y = yT0 + th2;
      for (let k2 = 0; k2 < 5; k2++){                        // DISCRETO: só uns torrões, quem repara acha
        const ox2 = (hash(sc.x + k2, sc.y) - .5) * 28, oy2 = (hash(sc.x, sc.y + k2) - .5) * 12;
        P(x + ox2, y + oy2, 3, 2, 'rgba(74,58,38,.55)');
        P(x + ox2, y + oy2, 2, 1, 'rgba(112,90,60,.5)');
      }
    });
    if (current.placas) current.placas.forEach(pl => {        // PLACA DE PRESSÃO: chapa encaixada no tile
      // isoTop ancora no vértice SUL e mede em MEIAS-DIAGONAIS: a=b=13 dá 52 de largura e o
      // centro do losango fica 13 acima da âncora. Passar o centro do tile como âncora (o que eu
      // fazia) jogava a chapa pra cima de quatro tiles.
      const [x, ys] = pb(pl.x, pl.y);
      const arm = pl.t > 0, q = arm ? Math.max(0, Math.min(1, 1 - pl.t / .4)) : 0;
      const dz = arm ? 5 : 7;                                 // armada, a chapa AFUNDA no encaixe
      isoTop(x, ys - 1, 15, 15, '#12161c');                   // a cava
      isoTop(x, ys - 3, 14, 14, '#080a0e');
      const cruz = pl.eixo === 2;                             // a cruzada é de LATÃO: dá pra reconhecer de longe
      // o aço tem que ser MAIS CLARO que a laje: no tom antigo a chapa sumia no chão e só
      // sobravam os rebites e a gravação boiando
      isoTop(x, ys - dz + 2, 13, 13, arm ? '#59201a' : cruz ? '#463c26' : '#333c49');   // lateral da chapa
      isoTop(x, ys - dz - 1, 13, 13, arm ? '#d0603f' : cruz ? '#b8a165' : '#8e9cb2');   // fio de luz na aresta
      isoTop(x, ys - dz, 13, 13, arm ? '#8e3524' : cruz ? '#7e6d3e' : '#5d6a7e');       // topo
      const cxp = x, cyp = ys - dz - 13;                      // CENTRO do losango: tudo se pendura daqui
      for (const [ox, oy] of [[0, -9], [0, 9], [-18, 0], [18, 0]]){      // 4 rebites nas quinas
        P(cxp + ox - 2, cyp + oy - 2, 4, 4, '#0f1319');
        P(cxp + ox - 1, cyp + oy - 1, 2, 2, arm ? '#f6b48a' : cruz ? '#e8d08a' : '#9dabc0');
      }
      // SETA GRAVADA apontando pra onde o dardo sai — some no chão, acende ao armar.
      // A SETA ANDA NOS EIXOS DO LOSANGO: 2 em x pra 1 em y. Traçada com direção normalizada e
      // arredondamento ela saía tremida — em isométrico a linha limpa é a que segue a própria
      // inclinação do tile, com degraus de 2x1.
      const traço = (cor, cor2) => {
        placaEixos(pl).forEach(ex2 => {
          const dv = ex2 ? [0, 1] : [1, 0];
          const [rx0] = tvTop(pl.x, pl.y), [rx1] = tvTop(pl.x + dv[0], pl.y + dv[1]);
          const A2 = [rx1 >= rx0 ? 2 : -2, 1], B2 = [rx1 >= rx0 ? -2 : 2, 1];   // os dois eixos do losango
          const alc = pl.eixo === 2 ? 4 : 5;                  // na cruzada as hastes são um tico menores
          for (let k2 = -alc; k2 <= alc; k2++)                // haste, degrau a degrau
            P(cxp + k2 * A2[0] - 1, cyp + k2 * A2[1], 2, 1, k2 === 0 && cor2 ? cor2 : cor);
          for (const sg of [-1, 1])                           // duas pontas em V, nos eixos do losango
            for (let k2 = 1; k2 <= 6; k2++){                   // meio passo: com passo inteiro o V saía tracejado
              const kk = k2 * .5, hx = sg * (alc - kk);
              P(Math.round(cxp + hx * A2[0] + kk * B2[0]) - 1, Math.round(cyp + hx * A2[1] + kk * B2[1]), 2, 1, cor);
              P(Math.round(cxp + hx * A2[0] - kk * B2[0]) - 1, Math.round(cyp + hx * A2[1] - kk * B2[1]), 2, 1, cor);
            }
        });
      };
      traço(arm ? 'rgba(26,4,2,.9)' : cruz ? 'rgba(52,40,10,.85)' : 'rgba(10,13,18,.8)');   // sulco (a gravação)
      if (!arm && cruz) traço('rgba(240,208,120,.35)');       // latão: a gravação da cruzada reluz um tico
      if (arm){
        traço('rgba(255,176,90,' + (.5 + q * .5).toFixed(2) + ')', 'rgba(255,236,180,' + (.6 + q * .4).toFixed(2) + ')');
        glowAt(cxp, cyp, 24, '255,90,40', .22 + q * .4);
        laneTiles(pl).forEach(([nx, ny]) => {                 // TELEGRAFO: acende a fileira que vai ser varrida
          const [lx, lys] = pb(nx, ny);
          isoTop(lx, lys - 1, 15, 15, 'rgba(230,60,40,' + (.09 + q * .24).toFixed(2) + ')');
        });
      }
    });
    for (const d3 of dardos){                                 // DARDO: ferrão + haste + empena, com rastro
      const q = Math.min(1, d3.t / .26);
      const al = 1 - q * q;
      const u = Math.min(1, q * 1.7);
      const px2 = Math.round(d3.x0 + (d3.x1 - d3.x0) * u);
      const py2 = Math.round(d3.y0 + (d3.y1 - d3.y0) * u);
      const len = Math.hypot(d3.x1 - d3.x0, d3.y1 - d3.y0) || 1;
      const ux = (d3.x1 - d3.x0) / len, uy = (d3.y1 - d3.y0) / len;
      for (let r = 1; r <= 7; r++){                           // rastro esticado por onde passou
        const a2 = al * (1 - r / 8) * .55;
        P(Math.round(px2 - ux * r * 3) - 1, Math.round(py2 - uy * r * 3), 2, 1, 'rgba(190,206,232,' + a2.toFixed(2) + ')');
      }
      P(px2 - Math.round(ux * 7) - 1, py2 - Math.round(uy * 7) - 1, 3, 3, 'rgba(120,134,158,' + (al * .9).toFixed(2) + ')');   // empena
      P(px2 - Math.round(ux * 5) - 1, py2 - Math.round(uy * 5) - 1, 2, 2, 'rgba(90,102,124,' + (al * .9).toFixed(2) + ')');
      P(px2 - Math.round(ux * 4), py2 - Math.round(uy * 4), 5, 2, 'rgba(58,66,82,' + al.toFixed(2) + ')');                     // haste
      P(px2 - 2, py2 - 1, 4, 2, 'rgba(228,236,248,' + al.toFixed(2) + ')');                                                    // ferrão
      P(px2 + 1, py2 - 1, 2, 1, 'rgba(255,255,255,' + al.toFixed(2) + ')');
    }
    current.traps.forEach(t2 => {
      const [x, yT0] = tvTop(t2.x, t2.y), y = yT0 + th2;
      E(x, y + 2, 12, 5, 'rgba(10,12,18,.35)');
      if (armed) for (let s2 = -1; s2 <= 1; s2++){
        P(x + s2 * 8 - 1, y - 5, 2, 5, '#6a7280');
        P(x + s2 * 8 - 1, y - 7, 2, 2, '#9aa4b2');
      } else for (let s2 = -1; s2 <= 1; s2++)
        P(x + s2 * 8 - 1, y - 2, 2, 2, '#565e6a');           // pontas recolhidas espiando
      if (current.witch && armed && (time % 2) < .16)        // clique ao armar
        E(x, y, 10, 4, 'rgba(240,200,110,.35)');
    });
  }

  // poças de lodo real borbulhando peçonha
  if (current.goo) current.goo.forEach(lt => {
    const [x, yT] = tvTop(lt.x, lt.y);
    for (let r = 1; r < th2 * 2 - 1; r++){
      const half = r < th2 ? r : th2 * 2 - r;
      const w2 = Math.round(half / th2 * (TW / 2)) - 3;
      if (w2 <= 0) continue;
      P(x - w2, yT + r, w2 * 2, 1,
        (r + ((time * 3) | 0)) % 6 === 0 ? '#78b048' : (r % 2 ? '#4a7030' : '#3a5c26'));
    }
    for (let b2 = 0; b2 < 3; b2++){                          // bolhas gordas estourando devagar
      const bx = x + Math.round(Math.sin(time * .8 + b2 * 2.1 + lt.x * 3) * (TW / 4));
      const by = yT + th2 + Math.round(Math.cos(time * 1.1 + b2 * 1.3 + lt.y) * (th2 / 2));
      const bs = ((time * 1.6 + b2) % 1) < .82 ? 2 : 4;
      P(bx, by, bs, bs, ((time * 2 + b2) | 0) % 2 ? '#94d070' : '#6aa04a');
    }
    const lp = .3 + Math.sin(time * 1.6 + lt.x + lt.y) * .1;
    glowAt(x, yT + th2, 24, '120,210,90', lp * .45);          // miasma esverdeado pairando
  });

  drawPerigos(time);                                          // ÁREA DO GOLPE DO CHEFE: por cima do piso, sob os bonecos

  // buraco negro de descida (após limpar a dungeon) — cortesia do Blackhole
  if (!current.safe && current.cleared && current.hell){      // FENDA MALDITA: mesma estética da porta da dungeon
    const hl = current.hell, [x, yT0] = tvTop(hl.x, hl.y), y = yT0 + th2;
    const pu = .55 + Math.sin(time * 2.6) * .25;
    g.save();
    g.globalCompositeOperation = 'lighter';
    blurFx(3);
    glowOval(x, y - 4, 42 * (.9 + pu * .2), 24 * (.9 + pu * .2), '255,40,30', .34 + pu * .2);
    blurFx(1);
    g.fillStyle = `rgba(255,60,40,${(.16 + pu * .12).toFixed(2)})`;   // brilho rasteiro no losango
    g.beginPath();
    g.moveTo(x, y - th2 + 2); g.lineTo(x + TW / 2 - 3, y);
    g.lineTo(x, y + th2 - 2); g.lineTo(x - TW / 2 + 3, y);
    g.closePath(); g.fill();
    g.restore();
    E(x, y, 15, 8, '#0a0406');                                // o buraco
    E(x, y, 12, 6, '#1a0508');
    for (let r2 = 0; r2 < 9; r2++){                           // beirada em brasa, irregular
      const an = r2 / 9 * 6.2832 + time * .5;
      const rr = 11 + Math.sin(time * 3 + r2) * 1.5;
      P(x + Math.cos(an) * rr - 1, y + Math.sin(an) * rr * .5 - 1, 2, 2,
        r2 % 2 ? `rgba(255,90,50,${(.6 + pu * .4).toFixed(2)})` : `rgba(190,30,30,${(.5 + pu * .3).toFixed(2)})`);
    }
    if (((time * 8) | 0) % 2 === 0)                           // fumacinha maldita subindo do buraco
      dust.push({ x: x + (hash((time * 60) | 0, hl.x) - .5) * 16, y: y - 4,
        vx: (hash((time * 60) | 0, hl.y) - .5) * 10, vy: -16 - hash((time * 60) | 0, 9) * 12,
        life: .9 + hash((time * 60) | 0, 3) * .5, kind: 'hellS', sz: hash((time * 60) | 0, 5) > .5 ? 3 : 2 });
    for (let b2 = 0; b2 < 3; b2++){                           // línguas de fogo lambendo a boca da fenda
      const ph = (time * 1.3 + b2 / 3) % 1;
      P(x + Math.round(Math.sin(time * 3 + b2 * 2) * 7), y - 4 - ph * 22, 2, 3,
        `rgba(255,${(90 - ph * 60) | 0},40,${((1 - ph) * .8).toFixed(2)})`);
    }
  }
  if (!current.safe && current.cleared && current.exit){
    const ex = current.exit, [x, yT0] = tvTop(ex.x, ex.y), y = yT0 + th2;
    // aura colorida pulsante com desfoque emanando do portal
    g.save();
    g.globalCompositeOperation = 'lighter';
    blurFx(3);
    const hue = (time * 70) % 360;
    const pul = 1 + Math.sin(time * 4) * .15;
    const gr = g.createRadialGradient(x, y - 6, 2, x, y - 6, 46 * pul);
    gr.addColorStop(0, `hsla(${hue},85%,70%,.5)`);
    gr.addColorStop(.5, `hsla(${(hue + 90) % 360},80%,60%,.22)`);
    gr.addColorStop(1, 'hsla(0,0%,0%,0)');
    g.fillStyle = gr;
    g.fillRect(x - 52, y - 58, 104, 104);
    blurFx(1);                                   // brilho rasteiro no losango do tile
    g.fillStyle = `hsla(${(hue + 180) % 360},80%,72%,.28)`;
    g.beginPath();
    g.moveTo(x, y - th2 + 2); g.lineTo(x + TW / 2 - 3, y);
    g.lineTo(x, y + th2 - 2); g.lineTo(x - TW / 2 + 3, y);
    g.closePath(); g.fill();
    g.restore();
    E(x, y, 15, 8, '#05070c');
    for (let s2 = 0; s2 < 3; s2++){                           // anéis de acreção girando
      const ang = time * (1.5 + s2 * .7) + s2 * 2.1;
      const rr = 13 - s2 * 3;
      for (let q2 = 0; q2 < 7; q2++){
        const a2 = ang + q2 * Math.PI * 2 / 7;
        P(x + Math.cos(a2) * rr - 1, y + Math.sin(a2) * rr * .5 - 1, 2, 1,
          ['#9a6ae0', '#4a9ae0', '#aebfd8'][s2]);
      }
    }
    E(x, y, 5, 3, '#000');
    P(x - 1, y - 3, 3, 1, '#e8f0ff');                         // centelha no horizonte de eventos
    const RB = ['224,90,90', '224,154,74', '224,216,74', '90,192,106', '74,154,224', '154,106,224'];
    for (let bnd = 0; bnd < 6; bnd++){                        // feixe arco-íris subindo do portal
      const bx = x - 11 + bnd * 4;
      const hgt = 30 + Math.round(Math.sin(time * 3 + bnd * 1.1) * 7);
      const al = .22 + Math.sin(time * 4 + bnd) * .08;
      P(bx, y - 4 - hgt, 3, hgt, `rgba(${RB[bnd]},${al})`);
      P(bx + 1, y - 4 - hgt, 1, hgt, `rgba(${RB[bnd]},${al * .6})`);
      if (((time * 5 + bnd * 2) | 0) % 3 === 0)               // faíscas subindo
        P(bx + 1, y - 10 - ((time * 40 + bnd * 17) % hgt), 2, 2, `rgba(${RB[bnd]},.8)`);
    }
  }

  // marca do tile de quem está jogando (o sapo ganha a dele, em rosa)
  const marcaPe = (a, cor) => {
    const [cxp, cyp] = tvTop(a.tx, a.ty);
    g.strokeStyle = cor; g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cxp, cyp + 1); g.lineTo(cxp + TW / 2 - 1, cyp + th2);
    g.lineTo(cxp, cyp + th2 * 2 - 1); g.lineTo(cxp - TW / 2 + 1, cyp + th2);
    g.closePath(); g.stroke();
  };
  if (!player.fora) marcaPe(player, 'rgba(122,170,120,.30)');
  if (p2On && !p2KO()) marcaPe(player2, 'rgba(224,130,170,.30)');

  // TILE ALVO: onde o golpe acertaria agora. Verde é o rato, ROSA é o sapo — sem isso o
  // jogador 2 não enxergava pra onde estava mirando.
  const marcaAlvo = (a, dentro, borda) => {
    const [fdx, fdy] = DIRV[a.dir];
    const fx = a.tx + fdx, fy = a.ty + fdy;
    if (fx < 0 || fy < 0 || fx >= current.w || fy >= current.h) return;
    const [cxp, cyp] = tvTop(fx, fy);
    const pu = .5 + Math.sin(time * 6) * .25;                 // pulsa pra chamar o olho
    g.beginPath();
    g.moveTo(cxp, cyp + 2); g.lineTo(cxp + TW / 2 - 2, cyp + th2);
    g.lineTo(cxp, cyp + th2 * 2 - 2); g.lineTo(cxp - TW / 2 + 2, cyp + th2);
    g.closePath();
    g.fillStyle = `rgba(${dentro},${(.09 + pu * .08).toFixed(3)})`;
    g.fill();
    g.strokeStyle = `rgba(${borda},${(.4 + pu * .3).toFixed(3)})`;
    g.lineWidth = 1.5;
    g.stroke();
  };
  if (!player.fora) marcaAlvo(player, '110,220,120', '120,235,130');
  if (p2On && !p2KO()) marcaAlvo(player2, '235,130,180', '255,150,200');

  drawFields(time);                                           // gelo e névoa ficam no chão
  updatePfx(dt);
  drawCastFx(dt);                                             // círculo de invocação fica no chão
  drawPfx(false);                                             // camada de chão dos poderes
  drawIsca(time);                                             // a isca fica no chão, sob os bichos
  drawDashEchoes(dt);                                         // ecos do dash por baixo dos atores
  const items = current.props.map(pr => ({
    d: rot === 0 || !pr.tiles.length ? pr.depth : vDepth(pr.tiles[0][0], pr.tiles[0][1]) + pr.depth % 1,
    f: pr.draw,
  }));
  // .005: item no mesmo tile de um bicho fica ATRÁS dele (bicho entra com .01), e um móvel
  // do tile da frente continua passando por cima, que é o certo
  current.pickups.forEach(pk => items.push({ d: vDepth(pk.x, pk.y) + .005, f: () => drawPickup(pk, time) }));
  current.actors.forEach(a => { if (!a.dead) items.push({ d: vDepth(a.x, a.y) + (a.big2 ? 1.02 : .01), f: () => { drawActor(a); if (a.frzT > 0) drawFrozen(a); } }); });
  if (!player.fora) items.push({ d: vDepth(player.x, player.y) + .015, f: () => drawActor(player) });
  if (p2On && !player2.dead)
    items.push({ d: vDepth(player2.x, player2.y) + .012, f: () => drawActor(player2) });
  items.sort((a, b) => a.d - b.d).forEach(it => it.f());
  if (!player.fora) drawEngolido();                           // o rato não pode sumir atrás do corpanzil do chefe

  const auraStam = (eu, t2) => {                               // stamina acesa: o corpo irradia verde
    if (t2 <= 0) return;
    const px = gX(eu.x, eu.y), py = gY(eu.x, eu.y) - 12 - eu.pose.air;
    const k = Math.min(1, t2 / .8);                           // esvanece suave no fim
    const pu = .75 + Math.sin(now * .016) * .25;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const gr4 = g.createRadialGradient(px, py, 3, px, py, 34 + pu * 8);
    gr4.addColorStop(0, `rgba(130,255,160,${.34 * k * pu})`);
    gr4.addColorStop(.55, `rgba(80,230,120,${.16 * k * pu})`);
    gr4.addColorStop(1, 'rgba(80,230,120,0)');
    g.fillStyle = gr4; g.fillRect(px - 44, py - 44, 88, 88);
    g.restore();
  };
  if (!player.fora) auraStam(player, stamT);
  if (p2On && !p2KO()) auraStam(player2, stamT2);              // o sapo também acende

  drawBeams();                                                // raios da espada por cima de tudo
  drawPfx(true);                                              // camada aérea dos poderes
  drawUpAura(time);                                           // auras dos presentes, por cima do piso e dos props
  drawSlashes(dt);
  drawSparks(dt);
  drawLevelFx(dt);
  drawChargeFx(time, dt);                                     // brilho da lâmina carregando
  drawItemGet(time, dt);                                      // a pose do achado
  drawRings(dt);
  drawBigHearts(dt);
  drawLingua();                                               // a língua do Sapo Real passa por cima de tudo
  if (current === home){ drawBubble(time); drawWaifuCounter(); drawEntrega(time); }
  dust.forEach(m => {
    const al = Math.min(1, m.life * 2);
    if (m.kind === 'heart'){
      P(m.x, m.y, 2, 2, `rgba(201,123,142,${al})`);
      P(m.x - 2, m.y - 2, 2, 2, `rgba(201,123,142,${al})`);
      P(m.x + 2, m.y - 2, 2, 2, `rgba(201,123,142,${al})`);
      P(m.x, m.y - 1, 2, 2, `rgba(226,150,168,${al})`);
    }
    else if (m.kind === 'heartR'){                            // coração vermelho/rosa do Coração Antigo
      const c = m.ci ? '240,110,160' : '230,70,95';
      const hx = m.x + Math.sin(m.life * 9 + (m.ph || 0)) * 2, hy = m.y;
      P(hx - 3, hy - 2, 2, 2, `rgba(${c},${al})`); P(hx + 1, hy - 2, 2, 2, `rgba(${c},${al})`);
      P(hx - 4, hy, 8, 2, `rgba(${c},${al})`);
      P(hx - 2, hy + 2, 4, 2, `rgba(${c},${al * .85})`);
      P(hx - 1, hy + 4, 2, 1, `rgba(${c},${al * .7})`);
      P(hx - 3, hy - 1, 2, 2, `rgba(255,200,215,${al * .8})`);
    }
    else if (m.kind === 'knifeP'){                            // faca voadora riscando o ar
      const nx2 = m.vx / (Math.hypot(m.vx, m.vy) || 1), ny2 = m.vy / (Math.hypot(m.vx, m.vy) || 1);
      for (let s2 = 0; s2 < 5; s2++)
        P(m.x - nx2 * s2 * 2, m.y - ny2 * s2 * 2, 2, 2, s2 ? `rgba(200,212,228,${al * (1 - s2 * .18)})` : '#e8eef4');
      P(m.x, m.y, 2, 2, '#fff');
    }
    else if (m.kind === 'fireS'){                             // bola de fogo lateral (aceno ao Rainbow Pong)
      const fl = ((m.life * 20) | 0) % 2;
      const sz = 3 + (Math.sin(m.life * 10 + (m.ph || 0)) > 0 ? 1 : 0);
      E(m.x, m.y, sz + 2, sz + 1, `rgba(200,60,20,${al * .5})`);
      E(m.x, m.y, sz, Math.max(1, sz - 1), `rgba(232,150,60,${al})`);
      E(m.x - 1, m.y - 1, 2, 2, fl ? `rgba(242,193,78,${al})` : `rgba(250,240,200,${al})`);
    }
    else if (m.kind === 'starP'){                             // estrelinha do golpe crítico
      const c = ['255,240,170', '255,206,96', '255,255,255'][m.ci || 0];
      const tw = .55 + Math.abs(Math.sin(m.life * 13 + (m.ph || 0))) * .45;
      const r = Math.max(2, Math.round(5 * tw));
      P(m.x - 1, m.y - r, 2, r * 2, `rgba(${c},${al.toFixed(2)})`);
      P(m.x - r, m.y - 1, r * 2, 2, `rgba(${c},${al.toFixed(2)})`);
      P(m.x - 2, m.y - 2, 4, 4, `rgba(${c},${(al * .5).toFixed(2)})`);
      P(m.x - 1, m.y - 1, 2, 2, `rgba(255,255,255,${al.toFixed(2)})`);
    }
    else if (m.kind === 'dngS'){                              // flare vermelho com eco e rastro de velocidade
      const sz = m.sz || 2;
      const sc = .03;                                         // o rastro é a própria velocidade
      const nx2 = (m.vx || 0) * sc, ny2 = (m.vy || 0) * sc;
      glowAt(m.x, m.y, 8 + sz * 2, '255,40,66', al * .5);
      for (let s2 = 6; s2 >= 1; s2--){                        // ecos: cópias esmaecendo pra trás
        const f = s2 / 6;
        P(m.x - nx2 * s2, m.y - ny2 * s2, sz + (s2 < 3 ? 1 : 0), Math.max(1, sz - (s2 > 3 ? 1 : 0)),
          `rgba(${s2 < 3 ? '255,90,110' : '190,18,40'},${(al * (1 - f) * .75).toFixed(2)})`);
      }
      P(m.x, m.y, sz + 1, sz, `rgba(255,150,165,${al.toFixed(2)})`);
      P(m.x, m.y, 2, 1, `rgba(255,236,240,${al.toFixed(2)})`);
    }
    else if (m.kind === 'hellS'){                            // fumaça da fenda: escura por baixo, brasa em cima
      const sz = m.sz || 2;
      const k2 = Math.min(1, m.life / 1.2);
      P(m.x, m.y, sz + 1, sz, `rgba(${(60 + k2 * 120) | 0},${(14 + k2 * 20) | 0},14,${(al * .5).toFixed(2)})`);
      if (k2 > .7) P(m.x, m.y, 1, 1, `rgba(255,110,60,${(al * .7).toFixed(2)})`);
    }
    else if (m.kind === 'auraP'){                            // estouro na cor do presente escolhido
      const sz = m.sz || 2;
      glowAt(m.x, m.y, 6 + sz * 2, m.ci, al * .34);
      P(m.x, m.y, sz + 1, sz, `rgba(${m.ci},${al.toFixed(2)})`);
      P(m.x, m.y, 1, 1, `rgba(255,255,255,${(al * .8).toFixed(2)})`);
    }
    else if (m.kind === 'upP'){                              // fagulha branca do aviso de melhoria
      const sz = m.sz || 2;
      glowAt(m.x, m.y, 6 + sz * 2, '255,240,200', al * .3);
      P(m.x, m.y, sz + 1, sz, `rgba(255,236,190,${(al * .8).toFixed(2)})`);
      P(m.x, m.y, sz, sz - 1 || 1, `rgba(255,255,255,${al.toFixed(2)})`);
    }
    else if (m.kind === 'cspP'){                             // fagulha azul do giro: eco e rastro de velocidade
      const sz = m.sz || 2;
      const nx2 = (m.vx || 0) * .022, ny2 = (m.vy || 0) * .022;
      glowAt(m.x, m.y, 6 + sz * 2, '90,190,255', al * .2);
      for (let s2 = 4; s2 >= 1; s2--){
        const f = s2 / 4;
        P(m.x - nx2 * s2, m.y - ny2 * s2, sz, Math.max(1, sz - 1),
          `rgba(${m.ci ? '160,224,255' : '70,150,235'},${(al * (1 - f) * .7).toFixed(2)})`);
      }
      P(m.x, m.y, sz, sz, `rgba(200,240,255,${al.toFixed(2)})`);
      P(m.x, m.y, 1, 1, `rgba(255,255,255,${al.toFixed(2)})`);
    }
    else if (m.kind === 'gooS'){                              // BOLHA de lodo: anel verde com brilho em cima
      const sz = m.sz || 3, bal = Math.sin(m.ph + m.life * 7) * 2;
      E(m.x + bal, m.y, sz + 1, sz + 1, `rgba(70,140,50,${al * .7})`);
      E(m.x + bal, m.y, sz, sz, `rgba(150,220,90,${al * .5})`);
      P(m.x + bal - 1, m.y - sz, 2, 1, `rgba(210,250,170,${al})`);
    }
    else if (m.kind === 'iceS'){                              // estilhaço de gelo invadindo a tela
      const c2 = ((m.life * 12) | 0) % 2 ? '180,230,255' : '235,248,255';
      P(m.x, m.y - 2, 2, 2, `rgba(${c2},${al})`);
      P(m.x - 2, m.y, 6, 2, `rgba(${c2},${al})`);
      P(m.x, m.y + 2, 2, 2, `rgba(${c2},${al * .8})`);
      P(m.x, m.y, 2, 2, `rgba(255,255,255,${al})`);
    }
    else if (m.kind === 'hit') P(m.x, m.y, 2, 2, `rgba(255,232,180,${al})`);
    else if (m.kind === 'rageP') P(m.x, m.y, 2, 2, `rgba(224,90,90,${al})`);
    else if (m.kind === 'stamP') P(m.x, m.y, 2, 2, ((m.life * 18) | 0) % 2 ? `rgba(120,255,150,${al})` : `rgba(70,220,110,${al})`);
    else if (m.kind === 'fireP') P(m.x, m.y, 2, 2, ((m.life * 20) | 0) % 2 ? `rgba(242,193,78,${al})` : `rgba(232,150,60,${al})`);
    else if (m.kind === 'redSm'){
      const sz = 2 + Math.round((1.3 - m.life) * 3);          // a fumaça cresce ao subir
      E(m.x, m.y, sz + 1, Math.max(1, sz >> 1) + 1, `rgba(200,60,36,${al * .45})`);
      E(m.x - 1, m.y - 1, sz, Math.max(1, sz >> 1), `rgba(230,110,50,${al * .3})`);
    }
    else if (m.kind === 'soil'){                              // torrão de terra girando no ar
      const sz = m.sz || 2;
      P(m.x, m.y, sz, sz, m.ci || '#434b59');
      if (al > .55) P(m.x, m.y, 1, 1, `rgba(255,255,255,${(al * .3).toFixed(2)})`);
    }
    else if (m.kind === 'aura') P(m.x, m.y, 1, 1, `rgba(238,200,130,${(al * .5).toFixed(2)})`);
    else if (m.kind === 'spark') P(m.x, m.y, 1, 1, current.ice ? `rgba(140,220,250,${al})` : current.sewer ? `rgba(150,240,130,${al})` : `rgba(240,170,80,${al})`);
    else if (m.kind === 'poisP') P(m.x, m.y, 2, 2, ((m.life * 14) | 0) % 2 ? `rgba(150,220,90,${al})` : `rgba(90,160,60,${al})`);
    else if (m.kind === 'iceP') P(m.x, m.y, 2, 2, ((m.life * 16) | 0) % 2 ? `rgba(180,230,255,${al})` : `rgba(110,190,240,${al})`);
    else if (m.kind === 'hexP') P(m.x, m.y, 2, 2, ((m.life * 14) | 0) % 2 ? `rgba(200,120,250,${al})` : `rgba(140,70,200,${al})`);
    else if (m.kind === 'crowP'){                             // pena de corvo riscando o ar
      P(m.x, m.y, 3, 1, `rgba(40,34,58,${al})`); P(m.x + 1, m.y + 1, 2, 1, `rgba(90,63,122,${al})`);
    }
    else if (m.kind === 'breath'){
      const sz = 1 + Math.round((1 - m.life) * 3);            // bafinho de frio crescendo e sumindo
      E(m.x, m.y, sz + 1, Math.max(1, sz >> 1), `rgba(220,240,250,${al * .3})`);
    }
    else if (m.kind === 'conf'){                              // confete vibrando na festa
      const wob = Math.sin(m.life * 16 + (m.ph || 0)) * 2;
      P(m.x + wob, m.y, 2, 3, CONF_COLS[m.ci || 0].replace(')', `,${al})`).replace('rgb', 'rgba'));
    }
    else P(m.x, m.y, 1, 1, `rgba(150,160,175,${al * .8})`);
  });
  // números de dano: verde = causado, vermelho = recebido
  for (let i = fct.length - 1; i >= 0; i--){
    const f = fct[i];
    f.t += dt;
    f.y -= Math.max(4, 30 - f.t * 30) * dt;                   // sobe rápido e desacelera (slow out)
    f.x += (f.vx || 0) * (1 - f.t) * dt;                      // arco lateral esvanecendo
    if (f.t > 1){ fct.splice(i, 1); continue; }
    const al = (f.t > .6 ? (1 - f.t) / .4 : 1).toFixed(2);
    const sc = f.sc || 1;
    drawGlyphs(f.x + sc, f.y + sc, f.n, `rgba(10,12,18,${(al * .75).toFixed(2)})`, f.t, sc);
    drawGlyphs(f.x, f.y, f.n,
      f.c === 'green' ? (sc > 1 ? `rgba(255,232,130,${al})` : `rgba(110,224,140,${al})`) :
      f.c === 'red' ? `rgba(232,96,96,${al})` :
      f.c === 'miss' ? `rgba(236,240,248,${al})` : `rgba(138,162,200,${al})`, f.t, sc);
    if (sc > 1 && f.t < .5)                                   // crítico: estrelinha estourando junto
      P(f.x - 4, f.y - 3, 2, 2, `rgba(255,248,200,${al})`);
  }
  drawFog(time);
  g.restore();

  drawLight(time);
  if (current.ice) drawAurora(time);                          // o céu do Reino do Gelo dança
  drawMotes(time);                                            // poeira (ou nevasca) acima de tudo

  cx.fillStyle = '#0a0c11'; cx.fillRect(0, 0, SW, SH);
  cx.imageSmoothingEnabled = false;
  cx.drawImage(B, 0, 0, VW * zoom, VH * zoom);
  if (chromaT > 0){                                           // aberração cromática do poder
    chromaT = Math.max(0, chromaT - dt);
    if (chromaT > 0) drawChroma();
  }
  { const vf = current.safe ? 0 : current.cursed ? 3 : current.level >= 21 ? 2 : current.level >= 11 ? 1 : 0;
    if (vf !== vgFundo){ vgFundo = vf; bakeVignette(); } }    // o breu acompanha o reino
  cx.drawImage(VG, 0, 0);                                     // vinheta assada

  // termômetro do render: se muitos quadros passarem de 22ms, corta os desfoques de vez
  if (!LOWFX){
    if (++fxSamples > 24){
      if (now - last2fx > 22) fxSlow++;
      if (fxSlow > 16) LOWFX = true;                          // desiste dos enfeites mais cedo
    }
    last2fx = now;
  }

  requestAnimationFrame(frame);
}
updateHUD();
requestAnimationFrame(frame);
