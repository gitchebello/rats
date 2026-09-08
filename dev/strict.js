// caça-travamento: roda o jogo com um canvas que RECLAMA igual ao do browser.
// o stub do smoke/deep aceita qualquer coisa; o Canvas de verdade joga IndexSizeError
// em raio negativo, TypeError em drawImage(undefined) e engole NaN silenciosamente.
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const bad = v => typeof v !== 'number' || !isFinite(v);
const NUM = {                                                 // método → quantos argumentos numéricos
  fillRect: 4, strokeRect: 4, clearRect: 4, rect: 4, moveTo: 2, lineTo: 2,
  translate: 2, scale: 2, rotate: 1, setTransform: 6, quadraticCurveTo: 4, bezierCurveTo: 6,
};
const RAD = { arc: [2], ellipse: [2, 3], createRadialGradient: [2, 5], arcTo: [4] };
const warns = [];
const M = { blur: 0, grad: 0, fill: 0, img: 0, path: 0 };      // contadores do quadro
const DEPTH = { n: 0, max: 0 };                                // pilha save/restore: restore a mais destrói a câmera

function ctxStub(name){
  const grad = {
    addColorStop(o, c){
      if (bad(o)) throw new Error(`addColorStop(${o}) inválido`);
      if (typeof c !== 'string' || /NaN|undefined|Infinity/.test(c)) throw new Error(`cor inválida no gradiente: ${c}`);
    },
  };
  const t = {};
  const check = (k, args) => {
    const n = NUM[k];
    if (n) for (let i = 0; i < n; i++) if (bad(args[i])) throw new Error(`${k}: argumento ${i} = ${args[i]}`);
    if (RAD[k]) for (const i of RAD[k]){
      if (bad(args[i])) throw new Error(`${k}: raio ${i} = ${args[i]}`);
      if (args[i] < 0) throw new Error(`${k}: raio negativo (${args[i]}) — o browser joga IndexSizeError aqui`);
    }
    if (k === 'drawImage'){
      if (!args[0] || typeof args[0] !== 'object') throw new Error(`drawImage com imagem ${args[0]}`);
      for (let i = 1; i < args.length; i++) if (bad(args[i])) throw new Error(`drawImage: argumento ${i} = ${args[i]}`);
    }
  };
  return new Proxy(t, {
    get(o, k){
      if (k === 'createRadialGradient' || k === 'createLinearGradient')
        return (...a) => { check(k, a); M.grad++; return grad; };
      if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(0, w * h * 4)) });
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'createPattern') return () => ({});
      if (typeof k === 'string'){
        if (o[k] !== undefined) return o[k];
        return (...a) => {
          check(k, a);
          if (k === 'save'){ DEPTH.n++; if (DEPTH.n > DEPTH.max) DEPTH.max = DEPTH.n; }
          else if (k === 'restore'){
            if (DEPTH.n <= 0) throw new Error('restore() sem save(): a pilha do canvas estourou — isso apaga a câmera e embaralha a tela');
            DEPTH.n--;
          }
          if (k === 'fillRect' || k === 'strokeRect') M.fill++;
          else if (k === 'drawImage') M.img++;
          else if (k === 'stroke' || k === 'fill' || k === 'ellipse' || k === 'arc') M.path++;
        };
      }
      return o[k];
    },
    set(o, k, v){
      // cor/estilo inválido: o browser ignora em silêncio, então vira aviso (bug de desenho, não travamento)
      if ((k === 'fillStyle' || k === 'strokeStyle') && typeof v === 'string' && /NaN|undefined|Infinity/.test(v))
        warns.push(`${k} = ${v}`);
      if (k === 'lineWidth' && bad(v)) warns.push(`lineWidth = ${v}`);
      if (k === 'globalAlpha' && bad(v)) throw new Error(`globalAlpha = ${v}`);
      if (k === 'filter' && typeof v === 'string' && v.startsWith('blur')) M.blur++;
      o[k] = v;
      return true;
    },
  });
}
function el(tag){
  const e = {
    tag, style: { setProperty(k, v){ this[k] = v; }, getPropertyValue(k){ return this[k] || ''; } }, dataset: {}, children: [],
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(){}, removeEventListener(){},
    appendChild(c){ e.children.push(c); return c; }, removeChild(){},
    setAttribute(){}, getContext: ctxStub, toDataURL(){ return 'data:,'; },
    setPointerCapture(){}, releasePointerCapture(){},
    focus(){}, click(){}, querySelector(){ return el('div'); }, querySelectorAll(){ return []; },
    getBoundingClientRect(){ return { left: 0, top: 0, width: 800, height: 600 }; },
    offsetWidth: 800, offsetHeight: 600, clientWidth: 800, clientHeight: 600,
    width: 800, height: 600, value: '3', textContent: '', innerHTML: '', title: '',
    onclick: null, remove(){},
  };
  return e;
}
const els = {};
const raf = [];
global.window = global;
global.document = {
  getElementById(id){ return els[id] || (els[id] = el('div')); },
  createElement(t){ return el(t); },
  body: el('body'), documentElement: el('html'),
  addEventListener(){}, fonts: { add(){}, ready: Promise.resolve() },
};
global.addEventListener = () => {};
global.removeEventListener = () => {};
global.requestAnimationFrame = cb => { raf.push(cb); return raf.length; };
global.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
global.fetch = () => Promise.resolve({ ok: true });
global.innerWidth = 1920; global.innerHeight = 1080;           // tela de desktop: mais luz e mais efeito
global.devicePixelRatio = 1;
global.FontFace = class { load(){ return Promise.resolve(this); } };
global.AudioContext = class {
  constructor(){ this.state = 'running'; this.destination = {}; this.currentTime = 0; }
  resume(){ return Promise.resolve(); }
  createGain(){ return { gain: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return this; } }; }
  createOscillator(){ return { type: '', frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){} }, connect(){ return this; }, start(){}, stop(){} }; }
  createBufferSource(){ return { buffer: null, connect(){ return this; }, start(){}, stop(){} }; }
  createBuffer(ch, len, sr){ return { getChannelData(){ return new Float32Array(len); } }; }
  createBiquadFilter(){ return { type: '', Q: { value: 0 }, frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){} }, connect(){ return this; } }; }
};
global.webkitAudioContext = global.AudioContext;

const hook = `
window.__s = {
  enter: lv => enterDungeon(lv),
  lv: () => current.level,
  act: i => {                                                 // uma ação pseudoaleatória por quadro
    const r = k => hash(i * 7 + k, 13 + (i % 31));
    const m = (r(1) * 12) | 0;
    if (m < 4){ held.length = 0; held.push((r(2) * 4) | 0); }
    else if (m === 4){ held.length = 0; }
    else if (m === 5){ holdAtk(); }
    else if (m === 6){ releaseAtk(); }
    else if (m === 7){ wantDash = true; lastTapDir = w2s(player.dir); }
    else if (m === 8){ const ps = Object.keys(POWERS); power = ps[(r(3) * ps.length) | 0]; powerCd = {}; wantSpc = true; }
    else if (m === 9){ wantStam = true; }
    else if (m === 10){ setRot(r(4) > .5 ? 1 : -1); }
    else { wantAtk = true; }
  },
  god: () => { player.hp = player.maxHp; player.invuln = 0; },  // não morrer no meio do teste
  hurt: n => { player.hp = n; player.invuln = 0; aegisT = 0; updateHUD(); },
  kill: () => { player.invuln = 0; aegisT = 0; applyHit(player, 99, 0); },
  who: () => ({ hp: player.hp, mode: player.mode, dead: player.dead, t: +player.t.toFixed(2),
    scene: current === home ? 'covil' : 'dungeon', lv: current.level,
    paused: [invOpen, askOpen, upOpen, charOpen].join(','), trans: transitioning }),
  counts: () => ({
    dust: dust.length, fct: fct.length, pfx: pfx.length, beams: beams.length, sparks: sparks.length,
    rings: rings.length, trail: trail.length, echoes: eyeEchoes.length, slashes: slashes.length,
    cast: castFx.length, level: levelFx.length, hearts: bigHearts.length,
    actors: current.actors.length, props: current.props.length, pickups: current.pickups.length,
  }),
};`;

let t = 1000;
function pump(n){
  for (let i = 0; i < n; i++){
    const cbs = raf.splice(0);
    if (!cbs.length) throw new Error('nenhum frame agendado — o loop morreu');
    t += 16;
    cbs.forEach(cb => cb(t));
  }
}

(async () => {
  try {
    new Function(src + hook)();
    pump(3);
    let worst = {};
    for (const lv of [1, 3, 4, 5, 6, 7, 8, 12, 22, 33]){
      global.__s.enter(lv);
      await new Promise(r => setTimeout(r, 700));
      pump(4);
      const acc = { blur: 0, grad: 0, fill: 0, img: 0, path: 0 }, peak = { blur: 0, grad: 0, fill: 0 };
      for (let i = 0; i < (lv === 4 ? 1500 : 400); i++){   // nv 4 leva soak longo: foi onde travava
        global.__s.act(i + lv * 977);
        if (i % 40 === 0) global.__s.god();
        for (const k in M) M[k] = 0;
        DEPTH.n = 0;
        pump(1);
        if (DEPTH.n !== 0) throw new Error(`o quadro terminou com ${DEPTH.n} save() sem restore()`);
        for (const k in acc) acc[k] += M[k];
        for (const k in peak) if (M[k] > peak[k]) peak[k] = M[k];
      }
      const c = global.__s.counts();
      for (const k in c) if (c[k] > (worst[k] || 0)) worst[k] = c[k];
      const md = k => Math.round(acc[k] / (lv === 4 ? 1500 : 400));
      console.log(`nv ${lv}: ok — por quadro: blur ${md('blur')} (pico ${peak.blur}) · gradiente ${md('grad')} (pico ${peak.grad}) · fillRect ${md('fill')} · drawImage ${md('img')} · path ${md('path')}`);
    }
    // FASE DA MORTE: vida baixa (o aviso liga em 3), morrer e renascer várias vezes
    global.__s.enter(4);
    await new Promise(r => setTimeout(r, 800));
    pump(4);
    for (let round = 0; round < 4; round++){
      global.__s.hurt(3);
      for (let i = 0; i < 250; i++){ global.__s.act(i + round * 313); pump(1); }
      global.__s.kill();
      for (let k = 0; k < 10; k++){                           // morte → renascimento passa por setTimeout de verdade
        pump(12);
        await new Promise(r => setTimeout(r, 130));
      }
      const w = global.__s.who();
      if (w.hp <= 0 || w.mode === 'dead')
        throw new Error(`ficou morto: renascimento travado (${JSON.stringify(w)})`);
      console.log(`morte ${round + 1}: ok — 250 quadros com 3 de vida, morreu e renasceu com ${w.hp} no ${w.scene}`);
      global.__s.enter(4);
      await new Promise(r => setTimeout(r, 800));
      pump(4);
    }

    console.log('pico de listas:', JSON.stringify(worst));
    if (warns.length){
      const uniq = [...new Set(warns)].slice(0, 12);
      console.log(`AVISOS de estilo inválido (${warns.length}): ${uniq.join(' | ')}`);
    }
    console.log('STRICT_OK');
    process.exit(0);
  } catch (err){
    console.error('STRICT_FAIL:', err.stack || err);
    if (warns.length) console.error('avisos antes de falhar:', [...new Set(warns)].slice(0, 8).join(' | '));
    process.exit(1);
  }
})();
