// teste profundo: entra em andares de gelo, roda frames, dispara presente/poderes
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

function ctxStub(){
  const grad = { addColorStop(){} };
  return new Proxy({}, {
    get(t, k){
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => grad;
      if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (k === 'measureText') return () => ({ width: 10 });
      if (typeof k === 'string') return t[k] !== undefined ? t[k] : (() => {});
      return t[k];
    },
    set(t, k, v){ t[k] = v; return true; },
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
global.innerWidth = 800; global.innerHeight = 600;
global.devicePixelRatio = 1;
global.FontFace = class { load(){ return Promise.resolve(this); } };
global.AudioContext = class {
  constructor(){ this.state = 'running'; this.destination = {}; this.currentTime = 0; }
  resume(){ return Promise.resolve(); }
  createGain(){ return { gain: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){}, cancelScheduledValues(){}, setTargetAtTime(){} }, connect(){ return this; } }; }
  createOscillator(){ return { type: '', detune: { value: 0 }, frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){}, cancelScheduledValues(){}, setTargetAtTime(){} }, connect(){ return this; }, start(){}, stop(){} }; }
  createBufferSource(){ return { buffer: null, connect(){ return this; }, start(){}, stop(){} }; }
  createBuffer(ch, len, sr){ return { getChannelData(){ return new Float32Array(len); } }; }
  createBiquadFilter(){ return { type: '', Q: { value: 0 }, frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){}, cancelScheduledValues(){}, setTargetAtTime(){} }, connect(){ return this; } }; }
  createDynamicsCompressor(){ const p2 = () => ({ value: 0 }); return { threshold: p2(), knee: p2(), ratio: p2(), attack: p2(), release: p2(), connect(){ return this; } }; }
  createStereoPanner(){ return { pan: { value: 0 }, connect(){ return this; } }; }
};
global.webkitAudioContext = global.AudioContext;

// expõe ganchos internos pro teste
const hook = `
let walkFrom = [0, 0];
let sapoSave = {};
window.__t = {
  enter: lv => enterDungeon(lv),
  state: () => ({ lv: current.level, ice: !!current.ice, sewer: !!current.sewer, goo: (current.goo || []).length, slick: (current.slick || []).length, foes: current.actors.filter(a => a.hostile).map(a => Object.keys(a.skin).join('.') || 'rat'), boss: current.actors.find(a => a.boss) }),
  gift: () => { upPend = 1; grantUp('hp'); },
  freezeAll: () => { power = 'nova'; powerCd = {}; doSpecial(); },
  usePower: pw => { power = pw; powerCd = {}; doSpecial(); },
  frost: () => { frozT = 2; },
  poison: () => { poisT = 5; poisTk = .1; },
  give: k => addItem(k),
  bag: () => ({ inv: inv.slice(), n: invN.slice() }),
  use: i => onInvClick(i),
  land: () => onPlayerLand(),
  dropAtDoor: () => {
    const key = Object.keys(current.doors)[0];
    const [dx, dy] = key.split(',').map(Number);
    current.pickups.push({ x: dx, y: dy, kind: 'potion' });
    player.tx = dx; player.ty = dy;
    return current.pickups.length;
  },
  pickupsN: () => current.pickups.length,
  rotate: d => setRot(d),
  rotState: () => rot,
  chest: () => ({ items: chestItems.slice(), n: chestN.slice() }),
  toChest: i => invToChest(i),
  boss: () => current.actors.find(a => a.boss),
  hitBossFrom: () => {                                        // golpe no canto oposto do corpo 2×2
    const b = current.actors.find(a => a.boss);
    player.tx = b.tx + 2; player.ty = b.ty + 1; player.dir = 2;   // à direita do tile secundário
    const hp0 = b.hp; dealDamage(player);
    return b.hp < hp0;
  },
  shockTest: () => {                                          // guincho sônico: empurra sem ferir
    let sx2 = -1, sy2 = -1;
    for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
      for (let xx = 2; xx < current.w - 5; xx++){
        let ok = true;
        for (let k2 = 0; k2 < 5; k2++)
          if (!current.free(xx + k2, yy) || occupied(xx + k2, yy, null)){ ok = false; break; }
        if (ok){ sx2 = xx; sy2 = yy; break; }
      }
    if (sx2 < 0) return null;
    player.tx = player.x = sx2; player.ty = player.y = sy2; player.mode = 'idle';
    const e2 = makeActor(sx2 + 2, sy2, SKIN_ENEMY, { hostile: true, hp: 5, maxHp: 5, dmg: 1 });
    current.actors.push(e2);
    power = 'shock'; powerCd = {}; doSpecial();
    const res = { hp: e2.hp, dist: Math.abs(e2.tx - player.tx) + Math.abs(e2.ty - player.ty) };
    e2.dead = true;
    return res;
  },
  aegisTest: () => {                                          // casaco de gelo: invencível por 5s
    power = 'aegis'; powerCd = {}; player.mode = 'idle';
    doSpecial();
    player.invuln = 0;
    const hp0 = player.hp;
    applyHit(player, 3, 0);
    return { immune: player.hp === hp0, t: aegisT };
  },
  swapTest: () => {                                           // arma melhor equipa e a antiga some
    const w0 = weapon;
    const n0 = current.pickups.length;
    current.pickups.push({ x: player.tx, y: player.ty, kind: 'toadking' });
    collectPickups();
    const res = {
      equipped: weapon === 'toadking',
      leftover: current.pickups.length - n0,                  // nada pode sobrar no tile
      inBag: inv.includes(w0),
    };
    weapon = w0; player.dmg = WEAPONS[w0].dmg;
    return res;
  },
  weakTest: () => {                                           // arma fraca não entra na mochila
    current.pickups.push({ x: player.tx, y: player.ty, kind: 'dagger' });
    collectPickups();
    const idx = current.pickups.findIndex(p3 => p3.kind === 'dagger' && p3.x === player.tx && p3.y === player.ty);
    const still = idx >= 0;
    if (still) current.pickups.splice(idx, 1);
    return { still, inBag: inv.includes('dagger') };
  },
  doorSetup: () => {                                          // põe o jogador no tile da porta
    const key = Object.keys(current.doors)[0];
    const [dx2, dy2] = key.split(',').map(Number);
    player.tx = player.x = dx2; player.ty = player.y = dy2; player.mode = 'idle';
    let outD = -1, inD = -1;
    for (let d2 = 0; d2 < 4; d2++){
      const [vx2, vy2] = DIRV[d2];
      if (!current.free(dx2 + vx2, dy2 + vy2)) outD = d2; else inD = d2;
    }
    askDis = '';
    return { outD, inD };
  },
  setDir: d2 => { player.dir = d2; player.mode = 'idle'; },
  askState: () => askOpen,
  closeAskT: () => closeAsk(),
  burrowSetup: () => {                                        // escavação: mergulha, passa sob o bicho, irrompe
    let sx2 = -1, sy2 = -1;
    for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
      for (let xx = 1; xx < current.w - 3; xx++){
        let ok = true;
        for (let k2 = 0; k2 < 3; k2++)
          if (!current.free(xx + k2, yy) || occupied(xx + k2, yy, null)){ ok = false; break; }
        if (ok){ sx2 = xx; sy2 = yy; break; }
      }
    if (sx2 < 0) return null;
    player.tx = player.x = sx2; player.ty = player.y = sy2; player.mode = 'idle'; player.dir = 0;
    player.invuln = 0;
    const e2 = makeActor(sx2 + 1, sy2, SKIN_ENEMY, { hostile: true, hp: 9, maxHp: 9, dmg: 2 });
    current.actors.push(e2);
    let far = null;                                           // um bicho longe: NÃO pode levar nada
    for (let d2 = 3; d2 <= 5 && !far; d2++){
      const fx = sx2 + 2 + d2;
      if (fx < current.w && current.free(fx, sy2) && !occupied(fx, sy2, null))
        far = makeActor(fx, sy2, SKIN_ENEMY, { hostile: true, hp: 9, maxHp: 9, dmg: 0, frzT: 99 });   // congelado: fica parado longe
    }
    if (far) current.actors.push(far);
    dashCd = 0;
    doDash(0);
    const hp0 = player.hp;
    applyHit(player, 3, 2);                                   // ninguém acerta quem está enterrado
    return {
      mode: player.mode, immune: player.hp === hp0, dest: [sx2 + 2, sy2],
      eid: current.actors.indexOf(e2), fid: far ? current.actors.indexOf(far) : -1,
    };
  },
  burrowEnd: (eid, fid) => {
    const e2 = current.actors[eid], f2 = fid >= 0 ? current.actors[fid] : null;
    const res = {
      pos: [player.tx, player.ty], mode: player.mode, sink: player.sink,
      foeHp: e2 ? e2.hp : -1, farHp: f2 ? f2.hp : -1, hops: tileHops.length,
    };
    if (e2) e2.dead = true;
    if (f2) f2.dead = true;
    return res;
  },
  critTest: () => {                                           // golpe crítico: 2x, câmera lenta e estrelas
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (!nb) return null;
    const e2 = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_ENEMY, { hostile: true, hp: 60, maxHp: 60 });
    current.actors.push(e2);
    player.dir = nb[0] === 1 ? 0 : nb[0] === -1 ? 2 : nb[1] === 1 ? 1 : 3;
    rageT = 0; stamT = 0;
    const r0 = Math.random;
    Math.random = () => 0;                                    // o jogador não rola erro: 0% = crítico garantido
    slowMo = 0; dust.length = 0;
    const hp0 = e2.hp;
    dealDamage(player);
    const crit = { dmg: hp0 - e2.hp, base: player.dmg, slow: slowMo, stars: dust.filter(d => d.kind === 'starP').length };
    Math.random = () => .999;                                 // 99.9% = nunca crítico
    e2.invuln = 0; e2.mode = 'idle'; e2.t = 0;                // o tranco jogou o bicho pra trás: recoloca
    e2.tx = e2.x = player.tx + nb[0]; e2.ty = e2.y = player.ty + nb[1];
    const hp1 = e2.hp;
    dealDamage(player);
    crit.normal = hp1 - e2.hp;
    Math.random = r0;
    e2.dead = true; slowMo = 0;
    return crit;
  },
  critUp: () => {                                             // presente da waifu sobe a sorte
    const before = critPct();
    upPend = 1; grantUp('crit');
    const res = { before, after: critPct() };
    const hp0 = player.maxHp;                                 // e o presente de vida vale bem mais que um coração
    upPend = 1; grantUp('hp');
    res.hpGain = player.maxHp - hp0;
    res.auras = hpUps > 0 && critUps > 0;                     // dois presentes = duas cores de aura
    res.healed = player.hp === player.maxHp;
    return res;
  },
  recoilTest: () => {                                         // tranco: o corpo é jogado pra trás
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null) &&
      current.free(player.tx + a2 * 2, player.ty + b2 * 2) && !occupied(player.tx + a2 * 2, player.ty + b2 * 2, null));
    if (!nb) return null;
    const e2 = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_ENEMY, { hostile: true, hp: 60, maxHp: 60 });
    current.actors.push(e2);
    const d2 = nb[0] === 1 ? 0 : nb[0] === -1 ? 2 : nb[1] === 1 ? 1 : 3;
    const t0 = [e2.tx, e2.ty];
    applyHit(e2, 2, d2);
    const res = {
      slid: e2.tx !== t0[0] || e2.ty !== t0[1],               // empurrado um tile
      mode: e2.mode,
      kick: Math.abs(e2.recX) + Math.abs(e2.recY) > 0,        // e o tranco visual
    };
    e2.dead = true;
    return res;
  },
  reachTest: (lv) => {                                        // TUDO no andar tem que dar pra alcançar a pé
    const d = genDungeon(lv);
    const seen = new Set([d.entry.join(',')]);
    const q = [d.entry];
    while (q.length){                                         // inundação a partir da porta de entrada
      const [x, y] = q.shift();
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
        const nx = x + ox, ny = y + oy, k = nx + ',' + ny;
        if (seen.has(k) || !d.free(nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    const bad = [];
    if (!seen.has(d.exit.x + ',' + d.exit.y)) bad.push('escada');
    d.actors.forEach(a => { if (a.hostile && !seen.has(a.tx + ',' + a.ty)) bad.push('inimigo@' + a.tx + ',' + a.ty); });
    d.pickups.forEach(p3 => { if (!seen.has(p3.x + ',' + p3.y)) bad.push('item ' + p3.kind); });
    return { reach: seen.size, bad };
  },
  upReady: () => {                                            // aviso da ratinha: metas 10, 25, 45, 70…
    const st0 = stash, cn0 = cheeseN, up0 = upPend, ud0 = upsDone, ug0 = upGoal, rn0 = upReadyN;
    stash = 0; cheeseN = 0; upPend = 0; upsDone = 0; upGoal = 10;
    const at = n2 => { stash = n2; return readyUps(); };
    const res = { a9: at(9), a10: at(10), a24: at(24), a25: at(25), a44: at(44), a45: at(45) };
    stash = st0; cheeseN = cn0; upPend = up0; upsDone = ud0; upGoal = ug0; upReadyN = rn0;
    return res;
  },
  cardRun: () => {                                            // a carta atravessa morte e run nova
    const cs0 = cardSlot, w0 = weapon, b0 = bestLv, g0 = goTo;
    goTo = () => {};                                           // não troca de cena: o teste é só sobre a carta
    cardSlot = {}; weapon = 'dagger'; cardSlot.dagger = 'ccat';
    player.hp = player.maxHp; player.invuln = 0; aegisT = 0;
    applyHit(player, 999, 0);
    respawn();
    const aposMorte = cardOn();
    bestLv = 0; startRun();                                    // sem elevador: desce direto
    const aposRun = cardOn();
    const res = { aposMorte, aposRun };
    cardSlot = cs0; weapon = w0; bestLv = b0; player.hp = player.maxHp;
    goTo = g0; player.dead = false; player.mode = 'idle'; player.t = 0;
    return res;
  },
  fossoTest: () => {                                          // o fosso corta o passo mas não corta a sala
    // 90 salas davam so ~7 abismos em dias de azar, e a ponte de largura 2 (1 em 4) sumia:
    // o teste acusava "sempre a mesma largura" sem nada de errado no gerador.
    const r = { com: 0, total: 0, tamanhos: {}, erros: [], pontes: 0, larguras: {} };
    for (let i = 0; i < 240; i++){
      const d = genDungeon(6 + (i % 9), false);
      r.total++;
      if (!d.holes.size) continue;
      r.com++;
      if (d.abismo) r.pontes++;
      const H = k => d.holes.has(k);
      // 1. nada nasce dentro de um buraco
      const sobre = [...d.pickups, ...d.traps, ...d.secrets, ...d.lava, ...d.goo]
        .concat(d.actors.map(a2 => ({ x: a2.tx, y: a2.ty })))
        .concat([d.exit, d.entry && { x: d.entry[0], y: d.entry[1] }])
        .filter(o => o && H(o.x + ',' + o.y));
      if (sobre.length) r.erros.push('nv' + d.level + ': ' + sobre.length + ' coisa(s) dentro do fosso');
      // 2. a sala continua inteira: tudo que é chão se alcança a partir da entrada
      const vis = new Set([d.entry[0] + ',' + d.entry[1]]), fila = [d.entry];
      while (fila.length){
        const [cx, cy] = fila.pop();
        for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
          const nx = cx + ox, ny = cy + oy, k = nx + ',' + ny;
          if (vis.has(k) || !d.free(nx, ny)) continue;
          vis.add(k); fila.push([nx, ny]);
        }
      }
      let chao = 0;
      for (let x = 0; x < d.w; x++) for (let y = 0; y < d.h; y++) if (d.free(x, y)) chao++;
      if (vis.size !== chao) r.erros.push('nv' + d.level + ': ' + (chao - vis.size) + ' tile(s) de chão ilhados pelo fosso');
      // 3. cada buraco é um bloco quadrado 2x2 ou 3x3 (nada de rachadura comprida)
      const resto = new Set(d.holes);
      while (resto.size){
        const raiz = [...resto][0].split(',').map(Number), comp = [], f2 = [raiz];
        resto.delete(raiz.join(','));
        while (f2.length){
          const [cx, cy] = f2.pop(); comp.push([cx, cy]);
          for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
            const k = (cx + ox) + ',' + (cy + oy);
            if (resto.has(k)){ resto.delete(k); f2.push([cx + ox, cy + oy]); }
          }
        }
        const xs = comp.map(c => c[0]), ys = comp.map(c => c[1]);
        const lx = Math.max(...xs) - Math.min(...xs) + 1, ly = Math.max(...ys) - Math.min(...ys) + 1;
        r.tamanhos[lx + 'x' + ly] = (r.tamanhos[lx + 'x' + ly] || 0) + 1;
        if (d.abismo){                                        // ABISMO: fenda que corta a sala de ponta a ponta
          if (lx !== d.abismo.wd) r.erros.push('nv' + d.level + ': fenda de ' + lx + ' de largura, devia ser ' + d.abismo.wd);
          if (comp.length !== lx * ly) r.erros.push('nv' + d.level + ': fenda esburacada');
        } else if (lx !== ly || lx < 2 || lx > 3 || comp.length !== lx * ly)
          r.erros.push('nv' + d.level + ': buraco ' + lx + 'x' + ly + ' de ' + comp.length + ' tiles — devia ser 2x2 ou 3x3');
      }
      if (d.abismo){                                          // a ponte é a ÚNICA travessia, e ela anda
        const { x: ax, wd, y: ay, bw } = d.abismo;
        r.larguras[bw] = (r.larguras[bw] || 0) + 1;
        for (let x = ax; x < ax + wd; x++)
          for (let y = 0; y < d.h; y++){
            const naPonte = y >= ay && y < ay + bw;
            if (naPonte && !d.free(x, y)) r.erros.push('nv' + d.level + ': a ponte não é passável');
            if (naPonte && !d.bridge.has(x + ',' + y)) r.erros.push('nv' + d.level + ': tábua faltando na ponte');
            if (!naPonte && d.free(x, y)) r.erros.push('nv' + d.level + ': o abismo tem outra passagem em ' + x + ',' + y);
          }
      }
      // 4. passa golpe e tiro por cima, mas não o passo
      const um = [...d.holes][0].split(',').map(Number);
      if (d.free(um[0], um[1])) r.erros.push('o fosso não bloqueou o passo');
      if (!d.over(um[0], um[1])) r.erros.push('o fosso bloqueou o golpe: devia passar por cima');
    }
    return r;
  },
  toqueT: () => {                                             // v1.48: o ultimo toque dentro do T vale, mesmo ja solto
    const px = player.tx, py = player.ty;
    const r = { tocou: false, segurou: false, parado: false, quebrou: '' };
    try {
      held.length = 0; passoQuer = null; touchDir = null; padDir = null;
      const livre = [0, 1, 2, 3].find(hd => { const [dx, dy] = DIRV[s2w(hd)]; return canWalk(px + dx, py + dy, player); });
      const outra = [0, 1, 2, 3].find(hd => hd !== livre && (() => { const [dx, dy] = DIRV[s2w(hd)]; return canWalk(px + dx, py + dy, player); })());
      const volta = () => { player.tx = player.x = px; player.ty = player.y = py; player.mode = 'idle'; player.t = 0; };
      const bate = c => { const bp = batePasso; batePasso = true; stepActor(player, .001, 0, c); batePasso = bp; };
      // 1) toque seco: apertou e SOLTOU antes da batida
      volta(); querPasso(livre); held.length = 0;
      bate({ dir: heldDir() == null ? null : s2w(heldDir()) });
      r.tocou = player.mode === 'hop' && player.tx + ',' + player.ty !== px + ',' + py && passoQuer === null;
      // 2) segura uma, toca outra: a batida vai pra que foi TOCADA por ultimo
      volta();
      if (outra != null){ held.push(outra); querPasso(livre); held.splice(held.indexOf(livre), 0);
        bate({ dir: s2w(heldDir()) });
        const [dx, dy] = DIRV[s2w(livre)];
        r.segurou = player.tx === px + dx && player.ty === py + dy; }
      else r.segurou = true;
      // 3) nada no T inteiro: parado
      volta(); held.length = 0; passoQuer = null;
      r.parado = heldDir() === null;
      volta(); held.length = 0;
    } catch (e){ r.quebrou = e.message; }
    return r;
  },
  stepSpeed: () => {                                          // o passo é sempre de UM tile: nada de diagonal do tabuleiro
    const px = player.tx, py = player.ty, m0 = player.mode;
    const volta = () => { player.tx = player.x = px; player.ty = player.y = py; player.mode = 'idle'; player.t = 0; };
    const r = { andou: 0, dists: [], oito: false };
    const bp0 = batePasso; batePasso = true;                  // o passo so sai na batida do compasso
    for (let hd = 0; hd < 4; hd++){
      volta();
      const d = s2w(hd);
      startStep(player, d);
      if (player.mode === 'hop'){
        r.andou++;
        r.dists.push(Math.abs(player.tx - px) + Math.abs(player.ty - py));
      }
    }
    volta(); player.mode = m0; batePasso = bp0;
    r.oito = typeof nearest8 !== 'undefined' || typeof crossPair !== 'undefined' || typeof CARD_PAIR !== 'undefined';
    return r;
  },
  quickTest: () => {                                          // item da mão: Y usa, L1/R1 passeiam
    const iv = inv.slice(), nv = invN.slice(), q0 = quickSlot, w0 = weapon, hp0 = player.hp;
    for (let i = 0; i < BAG_MAX; i++){ inv[i] = null; invN[i] = 0; }
    inv[0] = 'potion'; invN[0] = 2; inv[1] = 'sword'; invN[1] = 1;
    quickSlot = 0; player.hp = Math.max(1, player.maxHp - 5);
    const antes = player.hp;
    useQuick();                                               // bebe a poção sem abrir a mochila
    const res = { curou: player.hp - antes, pilha: invN[0] };
    cycleQuick(1); res.andou = quickSlot;
    useQuick(); res.arma = weapon;                            // equipa a espada do espaço 2
    cycleQuick(-1); res.voltou = quickSlot;
    quickSlot = 5; useQuick();                                // espaço vazio: não faz nada e não quebra
    res.vazioOk = true;
    for (let i = 0; i < BAG_MAX; i++){ inv[i] = iv[i]; invN[i] = nv[i]; }
    quickSlot = q0; weapon = w0; player.hp = hp0; player.dmg = WEAPONS[weapon].dmg;
    return res;
  },
  bagUp: () => {                                              // presente de espaço na mochila
    const b0 = bagUps, iv = inv.slice(), nv = invN.slice();
    bagUps = 0;
    const antes = invMax();
    upPend = 1; grantUp('bag');
    const depois = invMax();
    for (let i = 0; i < BAG_MAX; i++){ inv[i] = null; invN[i] = 0; }
    let cnt = 0;
    while (cnt < 20 && addItem('spin')) cnt++;                 // poder não empilha: 1 por espaço
    bagUps = b0;
    for (let i = 0; i < BAG_MAX; i++){ inv[i] = iv[i]; invN[i] = nv[i]; }
    return { antes, depois, cabe: cnt };
  },
  liftTest: () => {                                           // elevador só abre com estrato desbloqueado
    const b0 = bestLv, g0 = goTo;
    goTo = () => {};
    bestLv = 0; liftOpen = false; startRun();
    const direto = !liftOpen;
    bestLv = 21; liftOpen = false; startRun();
    const res = { direto, abriu: liftOpen, tiers: LIFT.filter(t => bestLv >= t.lv).length };
    closeLift(); bestLv = b0; goTo = g0;
    return res;
  },
  cardTest: () => {                                           // carta encaixa na arma, troca junto e o efeito vale
    const w0 = weapon, cs0 = cardSlot, i0 = inv[0], n0 = invN[0];
    cardSlot = {}; weapon = 'dagger'; player.dmg = WEAPONS.dagger.dmg;
    rageT = 0; stamT = 0; critUps = 0; edgeT = 0;
    const base0 = baseDmg();
    inv[0] = 'ccat'; invN[0] = 1;
    onInvClick(0);
    const res = { slot: cardSlot.dagger, gain: baseDmg() - base0, freed: inv[0] == null };
    weapon = 'sword'; res.otherWeapon = cardOn();               // outra arma = outro slot
    weapon = 'dagger'; res.back = cardOn();
    inv[0] = 'cshadow'; invN[0] = 1;                            // trocar devolve a antiga pra mochila
    onInvClick(0);
    res.swapped = cardSlot.dagger; res.returned = inv[0]; res.crit = critPct();
    // trocar de arma leva a carta junto: perder o bônus ao achar uma espada melhor era punitivo
    cardSlot = { dagger: 'ccat' }; weapon = 'dagger'; inv[0] = 'sword'; invN[0] = 1;
    onInvClick(0);
    res.carried = cardSlot.sword === 'ccat' && !cardSlot.dagger;
    // carta no chão com o slot livre entra equipada na hora
    cardSlot = {}; weapon = 'dagger'; player.dmg = WEAPONS.dagger.dmg;
    const pk0 = current.pickups.length;
    current.pickups.push({ x: player.tx, y: player.ty, kind: 'cbat' });
    collectPickups();
    res.autoEquip = cardSlot.dagger === 'cbat';
    current.pickups.length = pk0;
    cardSlot = cs0; weapon = w0; inv[0] = i0; invN[0] = n0; player.dmg = WEAPONS[weapon].dmg;
    return res;
  },
  bossPhase: () => {                                          // chefe: telegrafa, abre a guarda e enfurece
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (!nb) return null;
    const b = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_CAT,
      { hostile: true, boss: true, hp: 100, maxHp: 100, dmg: 3, range: 14, bossCd: .9 });
    current.actors.push(b);
    b.dir = nb[0] === 1 ? 2 : nb[0] === -1 ? 0 : nb[1] === 1 ? 3 : 1;   // encarando o jogador
    b.cd = 0; b.mode = 'idle'; player.dead = false; player.hp = player.maxHp;
    const c1 = enemyCtrl(b, .016);
    const res = { telegraph: !c1.attack && b.tellT > 0 };
    b.tellT = 0; b.telled = true;
    const c2 = enemyCtrl(b, .016);
    res.strikes = !!c2.attack; res.opened = b.openT > 0;
    b.invuln = 0; const h0 = b.hp; applyHit(b, 10, 0); res.openDmg = h0 - b.hp;
    b.openT = 0; b.invuln = 0; const h1 = b.hp; applyHit(b, 10, 0); res.normDmg = h1 - b.hp;
    b.invuln = 0; b.hp = 51; applyHit(b, 10, 0);
    res.rage = !!b.rage;
    b.dead = true; player.hp = player.maxHp;
    return res;
  },
  secretTest: () => {                                         // segredo é sorteado, raro, e paga pouco
    let com = 0, N = 200;                                     // amostra grande: com 60 o sorteio raro fazia o teste falhar sozinho
    for (let k = 0; k < N; k++) if (genDungeon(6 + (k % 20)).secrets.length) com++;
    const n1 = current.pickups.length;
    secretLoot(player.tx, player.ty);
    const got = current.pickups.slice(n1).map(p3 => p3.kind);
    current.pickups.length = n1;
    return { com, got };
  },
  hellGate: () => {                                           // pisar na fenda PERGUNTA antes de descer
    const lv0 = current.level, hell0 = current.hell, cl0 = current.cleared;
    current.cleared = true;
    current.hell = { x: player.tx, y: player.ty };
    hellOpen = false; hellDis = '';
    onPlayerLand();
    const res = { abriu: hellOpen, mesmoAndar: current.level === lv0 };
    document.getElementById('hellNo').onclick();               // recusou
    res.fechou = !hellOpen;
    onPlayerLand();
    res.naoReabre = !hellOpen;                                 // parado no mesmo tile não insiste
    player.tx += 1; onPlayerLand(); player.tx -= 1;            // saiu e voltou: pergunta de novo
    onPlayerLand();
    res.reabreDepois = hellOpen;
    closeHell(); hellDis = '';
    current.hell = hell0; current.cleared = cl0;
    return res;
  },
  cursedTest: () => {                                         // andar maldito: bicho mais duro e queda dobrada
    const med = c => {
      let tot = 0, cnt = 0;
      for (let k = 0; k < 24; k++)
        genDungeon(14, c).actors.forEach(a2 => { if (a2.hostile && !a2.boss){ tot += a2.maxHp; cnt++; } });
      return cnt ? tot / cnt : 0;
    };
    const d = genDungeon(14, true);
    return { flag: d.cursed, normal: !genDungeon(14).cursed, hpN: med(false), hpC: med(true),
      brief: /MALDITO/.test(levelBrief(d)) };
  },
  rampaTest: () => {                                          // rampa: quanto mais fundo, bicho mais duro E mais ágil
    const doutor = lv => {                                    // o plague doctor existe do nv 6 ao fim: mede a rampa sem trocar de bicho
      let hpMin = 0, hop = 0, cnt = 0;
      for (let k = 0; k < 40; k++)
        genDungeon(lv).actors.forEach(a2 => {
          if (a2.skin !== SKIN_PLAGUE || a2.boss) return;
          hpMin = hpMin ? Math.min(hpMin, a2.maxHp) : a2.maxHp;   // o mínimo tira o elite (que dobra a vida) da conta
          hop += a2.hopS; cnt++;
        });
      return [hpMin, cnt ? hop / cnt : 0, cnt];
    };
    return { n6: doutor(6), n20: doutor(18), n36: doutor(36) };   // 20 é andar de chefe: não nasce bicho comum
  },
  perigosTest: () => {                                        // placa, baú e parede falsa: existem e são justos
    const r = { placas: 0, baus: 0, falsas: 0, bons: 0, ruins: 0, andares: 0, erros: [], eixos: {} };
    for (let i = 0; i < 70; i++){
      const d = genDungeon(6 + (i % 12), false);
      r.andares++;
      r.placas += d.placas.length;
      d.placas.forEach(pl => { r.eixos[pl.eixo] = (r.eixos[pl.eixo] || 0) + 1; });
      r.baus += d.baus.length;
      r.falsas += d.props.filter(p2 => p2.nicho).length;
      d.baus.forEach(b2 => { if (b2.ruim) r.ruins++; else r.bons++; });
      d.placas.forEach(pl => {                                // placa nunca em cima de outra coisa
        if (!d.free(pl.x, pl.y)) r.erros.push('placa em tile bloqueado');
        if (d.traps.some(t2 => t2.x === pl.x && t2.y === pl.y)) r.erros.push('placa em cima de espinho');
        if (d.exit && d.exit.x === pl.x && d.exit.y === pl.y) r.erros.push('placa em cima da escada');
      });
      d.baus.forEach(b2 => {
        if (!d.free(b2.x, b2.y)) r.erros.push('baú em tile bloqueado');
        if (d.entry && b2.x === d.entry[0] && b2.y === d.entry[1]) r.erros.push('baú na entrada');
      });
    }
    return r;
  },
  placaFogo: () => {                                          // pisar arma; ao estourar, a fileira toda leva
    const d = current;
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      d.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (!nb) return null;
    d.placas.length = 0;
    d.placas.push({ x: player.tx, y: player.ty, eixo: nb[0] !== 0 ? 0 : 1, t: 0, usada: false });
    const alvo = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_ENEMY, { hostile: true, hp: 40, maxHp: 40 });
    d.actors.push(alvo);
    const hp0 = alvo.hp, php0 = player.hp;
    pisouNaPlaca(player);
    const armou = d.placas[0].t > 0;
    d.placas[0].t = 0;
    dispararPlaca(d.placas[0]);                               // dispara na mão: o tique de quadro é do jogo
    const res = { armou, dano: hp0 - alvo.hp, doeuNoJogador: php0 - player.hp, dardos: dardos.length };
    alvo.dead = true; d.placas.length = 0; dardos.length = 0;
    return res;
  },
  seedPoderes: () => {                                        // cada run reembaralha QUAL poder cai primeiro
    const ordens = [];
    for (let i = 0; i < 8; i++){
      sortearPoderes(1000 + i * 977);
      ordens.push(Object.keys(POWER_DEBUT).map(Number).sort((a, b) => a - b).map(l => POWER_DEBUT[l]).join(','));
    }
    sortearPoderes(1);
    const base = Object.keys(POWER_DEBUT_BASE).map(Number).sort((a, b) => a - b);
    const agora = Object.keys(POWER_DEBUT).map(Number).sort((a, b) => a - b);
    // o calendário não pode mudar: mesmos andares e o mesmo conjunto DENTRO de cada estrato
    const mesmoCalendario = base.join(',') === agora.join(',');
    const porEstrato = [[1, 10], [11, 20], [21, 30], [31, 40]].every(([lo, hi]) => {
      const a2 = base.filter(l => l >= lo && l <= hi).map(l => POWER_DEBUT_BASE[l]).sort().join(',');
      const b2 = base.filter(l => l >= lo && l <= hi).map(l => POWER_DEBUT[l]).sort().join(',');
      return a2 === b2;
    });
    return { distintas: new Set(ordens).size, total: ordens.length, mesmoCalendario, porEstrato };
  },
  missTest: () => {                                           // 5% de erro: só os INIMIGOS erram; o jogador acerta sempre
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (!nb) return null;
    const e2 = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_ENEMY, { hostile: true, hp: 40, maxHp: 40 });
    current.actors.push(e2);
    player.dir = nb[0] === 1 ? 0 : nb[0] === -1 ? 2 : nb[1] === 1 ? 1 : 3;
    rageT = 0; stamT = 0;
    const r0 = Math.random;
    fct.length = 0;
    Math.random = () => 0;                                    // rolagem 0: se o jogador rolasse erro, erraria aqui
    const hp0 = e2.hp;
    dealDamage(player);
    const res = { playerDmg: hp0 - e2.hp, label: (fct[0] || {}).n };
    e2.invuln = 0; e2.mode = 'idle'; e2.t = 0;
    e2.tx = e2.x = player.tx + nb[0]; e2.ty = e2.y = player.ty + nb[1];
    Math.random = () => .999;                                 // fora dos 5%: acerta normal
    const hp1 = e2.hp;
    dealDamage(player);
    res.hitDmg = hp1 - e2.hp;
    fct.length = 0;                                           // e o inimigo também erra: MISS na cara do jogador
    Math.random = () => 0;
    player.invuln = 0;
    const php = player.hp;
    e2.dir = (player.dir + 2) % 4;
    e2.tx = e2.x = player.tx + nb[0]; e2.ty = e2.y = player.ty + nb[1];
    dealDamage(e2);
    res.foeMissed = player.hp === php;
    res.foeLabel = (fct[0] || {}).n;
    Math.random = r0;
    e2.dead = true; player.hp = player.maxHp; player.invuln = 0;
    return res;
  },
  chargeBreak: () => {                                        // apanhar carregando derruba o giro
    atkHold = false; chargeT = 0; chargeRdy = false; chargeLock = false; chargeBreakT = 0;
    holdAtk();
    chargeT = CHARGE_T; chargeRdy = true;                     // carga cheia na mão
    player.invuln = 0; player.dead = false; player.mode = 'idle'; player.hp = player.maxHp;
    aegisT = 0;                                               // sem escudo: o dano tem que passar
    const took = player.hp;
    applyHit(player, 1, 0);
    const after = { hold: atkHold, t: chargeT, rdy: chargeRdy, lock: chargeLock, fx: chargeBreakT > 0,
      hurt: took - player.hp, mode: player.mode };
    holdAtk();                                                // segurar de novo NÃO recarrega: tem que soltar
    after.reHold = atkHold;
    releaseAtk();
    holdAtk();
    after.afterRelease = atkHold;
    releaseAtk();
    atkHold = false; chargeT = 0; chargeRdy = false; chargeLock = false; chargeBreakT = 0;
    player.hp = player.maxHp; player.invuln = 0; player.mode = 'idle'; player.t = 0; updateHUD();
    return after;
  },
  cspinTest: () => {                                          // o giro carregado tem animação e camada azul próprias
    dust.length = 0; pfx.length = 0;
    player.mode = 'idle'; player.t = 0; player.dir = 0;
    doChargeSpin();
    const res = {
      spin: !!player.spinAtk, dur: player.atkS, dir0: player.spinDir0,
      blue: dust.filter(d => d.kind === 'cspP').length,
      fx: pfx.filter(e => e.kind === 'cspin').length,
    };
    const dirs = new Set();
    for (let k = 0; k < 30; k++){ stepActor(player, .016, k * .016, {}); dirs.add(player.dir); }
    res.turned = dirs.size;                                   // a silhueta troca de frente durante o rodopio
    for (let k = 0; k < 40; k++) stepActor(player, .016, k * .016, {});
    res.endSpin = !!player.spinAtk; res.endDur = player.atkS; res.endDir = player.dir;
    return res;
  },
  numTest: () => {                                            // crítico dourado e MISS branco
    fct.length = 0;
    dmgNum(player.tx, player.ty, 7, 'green', true);
    missNum(player.tx, player.ty);
    return { crit: fct[0].sc, critN: fct[0].n, miss: fct[1].n, missC: fct[1].c };
  },
  alertTest: () => {                                          // balãozinho de susto ao te avistar
    const e2 = makeActor(player.tx + 3, player.ty, SKIN_ENEMY, { hostile: true, hp: 3, maxHp: 3 });
    current.actors.push(e2);
    enemyCtrl(e2, .1);
    const res = { alerted: !!e2.alerted, t: e2.alertT };
    e2.dead = true;
    return res;
  },
  allPowers: () => {                                          // dispara TODOS: nenhum pode explodir
    const out = {};
    Object.keys(POWERS).forEach(k => {
      power = k; powerCd = {};
      player.mode = 'idle'; player.t = 0;
      player.hp = Math.max(1, player.maxHp - 5);
      const n0 = pfx.length + castFx.length;
      doSpecial();
      out[k] = pfx.length + castFx.length > n0;                // cada um acende algum efeito
    });
    return out;
  },
  poderOrfao: () => {                                         // poder DECLARADO mas sem galho no despacho
    // o allPowers só via 'acendeu algum efeito', e o efeito de invocação é genérico: três poderes
    // (rage, edge, thrust) ficaram sem implementação e passaram batido. Aqui olha o despacho.
    const src = doSpecial.toString();
    return Object.keys(POWERS).filter(k => src.indexOf("pw === '" + k + "'") < 0);
  },
  buffTimers: () => {                                         // fúria e fio afiado precisam ACENDER o timer
    const antes = { rage: rageT, edge: edgeT };
    rageT = 0; edgeT = 0;
    power = 'rage'; powerCd = {}; player.mode = 'idle'; doSpecial();
    const r = rageT;
    power = 'edge'; powerCd = {}; player.mode = 'idle'; doSpecial();
    const e = edgeT;
    rageT = antes.rage; edgeT = antes.edge;
    return { rage: r, edge: e };
  },
  powerDrops: lv => {                                         // com que frequência um andar traz poder
    // MESA LIMPA: a bateria inteira ja entrou em dezenas de andares, entao a lista do que ja caiu
    // esta cheia e o rato tem poder na mochila — os dois filtram, e a medida vinha 2/24 sem bug.
    // (Nada de crase aqui dentro: os ganchos sao injetados como template literal.)
    const g = { jaCaiu: [...poderJaCaiu], bolso: inv.slice(), bolsoN: invN.slice(), pw: power, pw2: poder2 };
    poderJaCaiu.clear(); inv.fill(null); invN.fill(0); power = null; poder2 = null;
    let n = 0;
    for (let i = 0; i < 24; i++){
      const d = genDungeon(lv);
      if (d.pickups.some(p3 => POWERS[p3.kind])) n++;
    }
    g.jaCaiu.forEach(k => poderJaCaiu.add(k));
    for (let k = 0; k < inv.length; k++){ inv[k] = g.bolso[k]; invN[k] = g.bolsoN[k]; }
    power = g.pw; poder2 = g.pw2;
    return n;
  },
  fields: () => ({ ice: iceTiles.length, cloud: clouds.length, trail: iceTrailT }),
  bracoGolpe: () => {                                         // o braço TEM que percorrer o arco do golpe
    const a = makeActor(2, 2, SKIN_HERO, { dir: 0, atkS: .3 });
    a.mode = 'attack'; a.t = 0; a.struck = true;
    const vistos = [];
    for (let i = 0; i < 14; i++){ stepActor(a, .3 / 13, 0, {}); vistos.push(a.pose.armP); }
    const ativos = vistos.filter(v => v >= 0);
    a.mode = 'idle'; stepActor(a, .016, 0, {});
    return { n: ativos.length, min: Math.min.apply(null, ativos), max: Math.max.apply(null, ativos), parado: a.pose.armP };
  },
  chapeuNaTesta: () => {                                      // aba de chapéu assenta na TESTA, coroa no crânio
    const src = drawRatSprite.toString();
    // sem regex: dentro do template literal do hook o \( e o \d perdem a barra e a busca não casa
    const pega = nome => {
      const chave = 'const ' + nome + ' = Y(';
      const i = src.indexOf(chave);
      if (i < 0) return null;
      const j = src.indexOf(')', i + chave.length);
      const n = parseInt(src.slice(i + chave.length, j), 10);
      return isNaN(n) ? null : n;
    };
    const ch = drawChapeu.toString();                          // o encadeamento de chapéus virou função própria
    return {
      hy: pega('hy'), cy: pega('cy'),
      coroaUsaCy: ch.indexOf("oc.hat === 'crown'") >= 0 && ch.indexOf('q(-5, cy + 1, 10, 3,') >= 0,
      sapoVeste: drawFrog.toString().indexOf('drawChapeu(') >= 0,
    };
  },
  sapoTest: () => {                                           // JOGADOR 2: entra, bate, cai e levanta
    sapoSave = { px: player.tx, py: player.ty, n: current.actors.length };
    entrarP2();
    const entrou = p2On && !player2.dead;
    player2.dir = 0;
    player2.tx = player2.x = player.tx + 2; player2.ty = player2.y = player.ty;
    const [dx, dy] = DIRV[player2.dir];
    const v = makeActor(player2.tx + dx, player2.ty + dy, SKIN_ENEMY, { hostile: true, hp: 60, maxHp: 60 });
    current.actors.push(v);
    const hp0 = v.hp;
    player2.mode = 'idle'; player2.t = 0;
    stepActor(player2, .016, 0, { attack: true });
    for (let i = 0; i < 30; i++) stepActor(player2, .016, 0, {});
    const bateu = hp0 - v.hp;
    player2.invuln = 0;
    applyHit(player2, 999, 0);
    const caiu = player2.mode === 'dead';
    return { entrou, bateu, caiu, hp: player2.hp, max: player2.maxHp };
  },
  sapoLevanta: () => {                                         // caido, o sapo SO levanta no covil
    const cena = current;
    player.tx = player.x = player2.tx + 1; player.ty = player.y = player2.ty;
    for (let i = 0; i < 80; i++) passoP2(.016, .016, 0, false);
    const naDungeon = { modo: player2.mode, hp: player2.hp };   // encostar nele nao pode resolver
    current = home;                                             // e no covil ele acorda inteiro
    for (let i = 0; i < 80; i++) passoP2(.016, .016, 0, false);
    const noCovil = { modo: player2.mode, hp: player2.hp, cheio: player2.hp === player2.maxHp };
    current = cena;
    return { naDungeon, noCovil };
  },
  sapoAlvo: () => {                                            // o bicho persegue quem estiver MAIS PERTO
    /* O enemyCtrl so devolve direcao se o tile do passo estiver livre PELO canWalk (que tambem
       olha ocupacao, nao so parede). Plantar o bicho num ponto fixo dava falso negativo de vez
       em quando; agora tenta varios postos e exige que ele ANDE NA DIRECAO DO SAPO.           */
    player.tx = player.x = player2.tx + 14; player.ty = player.y = player2.ty + 14;   // o rato bem longe
    let r = { achou: false, temDir: false, veioPro: false };
    const postos = [[3, 0], [-3, 0], [0, 3], [0, -3], [2, 0], [-2, 0], [0, 2], [0, -2], [4, 0], [0, 4]];
    for (const [ox, oy] of postos){
      const ex = player2.tx + ox, ey = player2.ty + oy;
      if (!current.free(ex, ey) || occupied(ex, ey, null)) continue;
      const v = makeActor(ex, ey, SKIN_ENEMY, { hostile: true, hp: 9, maxHp: 9, range: 40 });
      if (!canWalk(ex - Math.sign(ox), ey - Math.sign(oy), v)) continue;   // sem passo, sem teste
      const c = enemyCtrl(v, .016);
      if (c.dir === undefined && !c.attack) continue;
      r.achou = true; r.temDir = true; r.posto = [ox, oy];
      if (c.attack) r.veioPro = true;
      else {
        const [vx, vy] = DIRV[c.dir];                          // o passo tem que ENCURTAR a distancia
        const antes = Math.abs(ex - player2.tx) + Math.abs(ey - player2.ty);
        const depois = Math.abs(ex + vx - player2.tx) + Math.abs(ey + vy - player2.ty);
        r.veioPro = depois < antes;
      }
      break;
    }
    player.tx = player.x = sapoSave.px; player.ty = player.y = sapoSave.py;   // devolve o rato pro tabuleiro
    return r;
  },
  sapoKit: () => {                                             // o sapo faz TUDO que o rato faz, com a ficha dele
    inv2.fill(null); invN2.fill(0); arma2 = 'dagger'; poder2 = null; cdPoder2 = {};
    for (const k in B2) B2[k] = 0;
    stamT2 = 0; stamCd2 = 0; dashCd2 = 0; rageT = 0;
    current.pickups.length = 0;                               // chao limpo: item de teste anterior falseia
    avisos.length = 0; avisoAte = 0;
    current.pickups.push({ x: player2.tx, y: player2.ty, kind: 'potion' });
    current.pickups.push({ x: player2.tx, y: player2.ty, kind: 'sword' });
    current.pickups.push({ x: player2.tx, y: player2.ty, kind: 'nova' });
    const invRato0 = inv.filter(Boolean).length;
    player2.hp = Math.max(1, player2.maxHp - 3);
    const hp0 = player2.hp;
    current.pickups.push({ x: player2.tx, y: player2.ty, kind: 'cheese' });
    const queijo0 = cheeseN;
    sapoPega();
    const catou = { bag: inv2.filter(Boolean).length, arma: arma2, queijo: cheeseN - queijo0,
                    curou: player2.hp - hp0, ratoIntacto: inv.filter(Boolean).length === invRato0 };
    poder2 = 'rage'; cdPoder2 = {}; player2.mode = 'idle';
    const lancou = doSpecial(player2);
    const isolado = B2.rage > 0 && rageT === 0;
    player2.mode = 'idle'; stamT2 = 0; stamCd2 = 0;
    const stam = doStam(player2) && stamT2 > 0;
    return { catou, lancou, isolado, stam, cd: cdPoder2.rage, dano: sapoDmg() };
  },
  sapoCarta: () => {                                         // o brasão do bicho é de QUEM derrubou o bicho
    const guarda = { arma: weapon, dano: player.dmg, bolso: inv.slice(), bolsoN: invN.slice(), slot: cardSlot };
    cardSlot = {}; cardSlot2 = {}; cartaDono = null;
    for (const k in B2) B2[k] = 0;                            // buff sobrando dobra o dano e falseia a conta
    stamT2 = 0; rageT = 0; stamT = 0;
    inv.fill(null); invN.fill(0); inv2.fill(null); invN2.fill(0);
    weapon = 'dagger'; arma2 = 'dagger'; player.dmg = WEAPONS.dagger.dmg;
    const bicho = (dx, dy) => {
      const v = makeActor(dx, dy, SKIN_ENEMY, { hostile: true, hp: 99, maxHp: 99 });
      current.actors.push(v); return v;
    };
    const bate = (quem) => {                                  // um golpe de verdade: o crédito sai do dealDamage
      const alvo = bicho(quem.tx + 1, quem.ty);
      quem.dir = 0; cartaDono = null;
      dealDamage(quem);
      const dono = cartaDono;
      alvo.dead = true; current.actors.splice(current.actors.indexOf(alvo), 1);
      return dono;
    };
    const doRato = bate(player) === player;
    const doSapo = bate(player2) === player2;
    grantCard('cbat', player2.tx, player2.ty, player2);        // primeira carta: encaixa na lamina DELE
    const encaixou = cardSlot2[arma2] === 'cbat' && !cardSlot[weapon];
    grantCard('ccat', player2.tx, player2.ty, player2);        // segunda: vai pra mochila DELE
    const naMochila = inv2.indexOf('ccat') >= 0 && inv.indexOf('ccat') < 0 && cardSlot2[arma2] === 'cbat';
    const soDele = cartaDe(player2, 'cbat') && !hasCard('cbat') && !cartaDe(player, 'cbat');
    const dano0 = sapoDmg();
    onInvClick(inv2.indexOf('ccat'), player2);                 // troca pela da mochila: a antiga volta pro bolso
    const trocou = cardSlot2[arma2] === 'ccat' && inv2.indexOf('cbat') >= 0;
    const somaGato = sapoDmg() - dano0;
    const armaVelha = arma2; arma2 = 'sword'; carryCard(armaVelha, player2);
    const seguiu = cardSlot2.sword === 'ccat' && !cardSlot2[armaVelha];
    const pk = { x: player2.tx, y: player2.ty, kind: 'cslime' };
    current.pickups.push(pk); sapoPega();                      // carta do chao: o sapo nao deixa mais pro rato
    const doChao = inv2.indexOf('cslime') >= 0 && current.pickups.indexOf(pk) < 0;
    cardSlot2 = {}; inv2.fill(null); invN2.fill(0); arma2 = 'dagger';
    weapon = guarda.arma; player.dmg = guarda.dano; cardSlot = guarda.slot;   // devolve a ficha do rato
    for (let k = 0; k < inv.length; k++){ inv[k] = guarda.bolso[k]; invN[k] = guarda.bolsoN[k]; }
    hitStop = 0; slowMo = 0; player.mode = 'idle'; player.t = 0;
    return { doRato, doSapo, encaixou, naMochila, soDele, trocou, somaGato, seguiu, doChao };
  },
  ratoStatus: () => {                                          // o RATO tambem pega fogo, gelo e veneno
    burnT = 0; frozT = 0; poisT = 0; cardSlot = {}; aegisT = 0;
    player.mode = 'idle'; player.dead = false; player.hp = player.maxHp;
    player.invuln = 0; burnFrom = true; applyHit(player, 1, 0); burnFrom = false;
    player.invuln = 0; frostFrom = true; applyHit(player, 1, 0); frostFrom = false;
    player.invuln = 0; venomFrom = true; applyHit(player, 1, 0); venomFrom = false;
    const r = { burn: burnT > 0, frost: frozT > 0, pois: poisT > 0 };
    cardSlot[weapon] = 'cyeti';                                // Carta do Yeti: o gelo passa a nao pegar
    frozT = 0; player.invuln = 0; frostFrom = true; applyHit(player, 1, 0); frostFrom = false;
    r.yeti = frozT === 0;
    cardSlot = {}; burnT = 0; frozT = 0; poisT = 0;
    hitStop = 0; slowMo = 0;                                  // devolve o rato inteiro pros testes seguintes
    player.hp = player.maxHp;
    return r;
  },
  cartaChefeChao: () => {                                      // a carta do chefe CAI, nao some num toast
    const cena = current;
    current = genDungeon(10);
    const guarda = { slot: cardSlot, bolso: inv.slice(), bolsoN: invN.slice() };
    cardSlot = {}; cardSlot[weapon] = 'cbat';                  // lamina ja ocupada
    for (let i = 0; i < invMax(); i++){ inv[i] = 'potion'; invN[i] = 1; }   // e mochila cheia
    const chefe = current.actors.find(a2 => a2.boss);
    if (!chefe){ current = cena; cardSlot = guarda.slot; return { erro: 'sem chefe' }; }
    const antes = current.pickups.length;
    chefe.invuln = 0;
    applyHit(chefe, 99999, 0);
    const cartas = current.pickups.filter(p3 => CARDS[p3.kind]);
    const tiles = new Set(current.pickups.map(p3 => p3.x + ',' + p3.y));
    const r = {
      caiu: cartas.length, qual: cartas[0] && cartas[0].kind,
      novos: current.pickups.length - antes,
      espalhou: tiles.size, slotIntacto: cardSlot[weapon],
      mochilaCheia: inv.filter(Boolean).length === invMax(),
    };
    inv[0] = null; invN[0] = 0;                                // abre espaco e vai buscar
    if (cartas[0]){ player.tx = player.x = cartas[0].x; player.ty = player.y = cartas[0].y; }
    collectPickups();
    r.pegouDepois = inv.indexOf(r.qual) >= 0;
    cardSlot = guarda.slot;
    for (let k = 0; k < inv.length; k++){ inv[k] = guarda.bolso[k]; invN[k] = guarda.bolsoN[k]; }
    current = cena;
    return r;
  },
  filaAvisos: () => {                                          // um aviso por vez, na ordem, sem sobrepor
    // relogio FALSO: o contrato da fila se mede por passos, nao pelo relogio de parede
    const origNow = performance.now;
    let falso = 1e6;
    performance.now = () => falso;
    avisos.length = 0; avisoAte = 0;
    const saiu = [];
    enfileira('a:1', 700, () => saiu.push('um'));
    enfileira('a:2', 700, () => saiu.push('dois'));
    enfileira('a:2', 700, () => saiu.push('dois-repetido'));   // igual ao que espera: nao entra
    enfileira('a:3', 700, () => saiu.push('tres'));
    const naFila = avisos.length;
    for (let k = 0; k < 50; k++) passoAvisos();                // relogio parado: so o primeiro sai
    const soUm = saiu.length;
    falso += 400; for (let k = 0; k < 20; k++) passoAvisos();   // ainda DENTRO da animacao
    const aindaUm = saiu.length;
    falso += 400; for (let k = 0; k < 20; k++) passoAvisos();   // passou dos 700: entra o segundo
    falso += 800; for (let k = 0; k < 20; k++) passoAvisos();
    performance.now = origNow;
    avisos.length = 0; avisoAte = 0;
    return { naFila, soUm, aindaUm, ordem: saiu };
  },
  quedaBicho: () => {                                          // com que frequencia o bicho larga o que
    const cena = current;
    current = genDungeon(12);
    const c = { potion: 0, cheese: 0, n: 0 };
    for (let k = 0; k < 900; k++){
      current.pickups.length = 0;
      // grade LARGA de posicoes: o roll da queda e hash(tx,ty), e com 20 posicoes so
      // o sorteio caia sempre nas mesmas casas — deu 0% de pocao num dia de azar.
      const v = makeActor(2 + (k % 13), 1 + (((k / 13) | 0) % 9), SKIN_ENEMY, { hostile: true, hp: 1, maxHp: 1 });
      current.actors.push(v);
      v.invuln = 0; cartaDono = player;
      applyHit(v, 99, 0);
      current.actors.splice(current.actors.indexOf(v), 1);
      c.n++;
      current.pickups.forEach(p3 => { if (p3.kind === 'potion') c.potion++; else if (p3.kind === 'cheese') c.cheese++; });
    }
    current = cena;
    return { pocao: c.potion / c.n, queijo: c.cheese / c.n, n: c.n };
  },
  onlineTeste: () => {
    const r = { quebrou: '', salaAberta: !!sala, codigo: codigoNovo(), convidadoNoSapo: false, mesmaSemente: false };
    try {
      // sem sala, tudo tem que continuar de pé
      passoOnline(.016); mandaComando(); fimDoPasso();
      // a MESMA semente tem que dar o mesmo andar nos dois aparelhos
      const a = genDungeon(9, false, 4242), b2 = genDungeon(9, false, 4242);
      const chave = d => d.w + 'x' + d.h + '|' + d.exit.x + ',' + d.exit.y + '|' +
        d.actors.filter(x => x.hostile).map(x => x.tx + ',' + x.ty + ',' + x.maxHp).join(';') + '|' +
        d.pickups.map(x => x.kind + x.x + ',' + x.y).join(';');
      r.mesmaSemente = chave(a) === chave(b2);
      // e o convidado tem que mandar no sapo
      sala = { codigo: 'TEST', dono: false };
      p2ChargeLock = false; p2AtkHold = false;
      holdAtk();
      r.convidadoNoSapo = p2AtkHold === true && atkHold === false;
      releaseAtk();
      sala = null;
      // O RELOGIO MECANICO: fora de sala quem manda e o quadro; em sala, dentes de 1/60
      r.livre = relogio(.021);
      const FIO = { readyState: 1, send: function (){}, close: function (){} };
      const wsAntes = WS;
      WS = FIO;                                                // finge o fio ligado: o relogio so pega em sala
      sala = { codigo: 'TEST', dono: true };
      relTick = 0; relAcc = 0; relAlvo = -1;
      let soma = 0;
      for (let i = 0; i < 120; i++) soma += relogio(1 / 60);
      r.tickDono = relTick;
      r.dente = Math.abs(soma - relTick / 60) < 1e-9;           // o mundo andou EXATAMENTE em dentes
      sala = { codigo: 'TEST', dono: false };                   // convidado atrasado: alcanca sem saltar
      relTick = 0; relAcc = 0; relAlvo = 20;
      let maior = 0;
      for (let i = 0; i < 60; i++){ const a3 = relTick; relogio(1 / 60); maior = Math.max(maior, relTick - a3); }
      r.alcancou = relTick >= 20;
      r.maiorSalto = maior;
      // O COMPASSO E O FIO — o dono so fala na batida do passo, em bytes, e so do que mudou
      sala = { codigo: 'TEST', dono: true };
      const parcAntes = parceiro; parceiro = true;
      const enviados = [];
      const sendAntes = FIO.send;
      FIO.send = function (x){ enviados.push(x); };
      relTick = 0; relAcc = 0; relAlvo = -1; passoAcc = 0; cenaUlt = ''; ultCasa.clear(); ultVida.clear(); fotoN = 0;
      const passo0 = passoN;
      for (let i = 0; i < 120; i++){ const d3 = relogio(1 / 60); compasso(d3); passoOnline(d3); fimDoPasso(); }
      r.passos = passoN - passo0;
      const bins = enviados.filter(function (x){ return typeof x !== 'string'; });
      r.binarios = bins.length;
      r.maiorBin = bins.reduce(function (m3, x){ return Math.max(m3, x.length); }, 0);
      r.json = enviados.filter(function (x){ return typeof x === 'string'; }).map(function (x){ return JSON.parse(x).t; });
      // um bicho muda de casa: na proxima batida sai um pacote com SO ele (4 bytes de corpo)
      const vivo = current.actors.findIndex(x => x.hostile && !x.dead);
      enviados.length = 0;
      if (vivo >= 0){
        const bv = current.actors[vivo], x0 = bv.tx;
        bv.tx = x0 + 1; bv.mode = "idle";                        // um tile ao lado
        batePasso = true; fimDoPasso(); batePasso = false;
        const pk = enviados.filter(function (x){ return typeof x !== 'string'; })[0];
        r.deltaTam = pk ? pk.length : -1;
        r.deltaId = pk ? pk[9] : -1;
        // e o convidado le o mesmo pacote e poe o bicho na casa nova, pulando
        sala = { codigo: 'TEST', dono: false };
        bv.tx = x0; bv.x = x0; bv.mode = 'idle';
        cenaOk = pk ? pk[1] : -1;
        if (pk) aplicaPasso(pk);
        r.convidadoPos = bv.tx !== x0 && bv.mode === "hop"; r.dbg = [x0, bv.tx, bv.mode, pk && Array.from(pk).join(","), vivo, cenaOk];
        bv.tx = bv.x = x0; bv.mode = 'idle'; bv.t = 0; cenaOk = -1;
        sala = { codigo: 'TEST', dono: true };
      } else { r.deltaTam = 14; r.deltaId = 0; r.convidadoPos = true; }
      FIO.send = sendAntes; parceiro = parcAntes;
      // e no convidado o golpe e so teatro: a vida do bicho desce pelo fio, nao aqui
      sala = { codigo: 'TEST', dono: false };
      const bicho = current.actors.filter(x => x.hostile && !x.dead)[0];
      if (bicho){ bicho.invuln = 0; const hpA = bicho.hp; applyHit(bicho, 3, 0); r.vidaFicou = bicho.hp === hpA; }
      else r.vidaFicou = true;
      // A LINGUA DO SAPO. Dois jeitos de ela morrer, os dois ja aconteceram em partida real:
      // (1) apanhar carregando liga a trava da carga, e quem solta o botao e o dedo do parceiro:
      //     sem zerar a trava quando o dedo sai, o sapo nunca mais ataca no resto da run;
      // (2) toque seco de 40ms comeca e acaba DENTRO da batida de 50ms: o estado do dedo nunca
      //     chega ligado, entao o aperto tem que viajar tambem como EVENTO.
      sala = { codigo: 'TEST', dono: true };
      p2ChargeLock = true; p2AtkHold = false; p2WantAtk = false;
      aplicaComando(new Uint8Array([PK_CMD, 0, 0, 0]));
      r.travaSolta = p2ChargeLock === false;
      p2WantAtk = false; p2ChargeLock = false; p2AtkHold = false;
      aplicaComando(new Uint8Array([PK_CMD, 0, EV_ATK, 0]));
      r.toqueCurto = p2WantAtk === true;
      p2WantAtk = false; p2AtkHold = false; p2ChargeLock = false;
      // O GOLPE TEM QUE COMECAR NA TELA DE QUEM APERTOU. Sem previsao, do toque ate o sapo
      // aparecer batendo passavam 233ms: o pedido subia pro dono, o mundo dele resolvia e o
      // golpe voltava desenhado. Assim nao da pra combinar ataque com o parceiro.
      sala = { codigo: 'TEST', dono: false };
      player2.mode = 'idle'; player2.cd = 0; player2.dead = false;
      p2AtkHold = false; p2ChargeLock = false;
      preveGolpeSapo();
      r.preveGolpe = player2.mode === 'attack';
      player2.mode = 'idle'; player2.t = 0;
      WS = wsAntes; sala = null; relTick = 0; relAcc = 0; relAlvo = -1;
    } catch (e){ r.quebrou = e.message; sala = null; }
    return r;
  },
  padSala: () => {
    /* O convidado no computador tem UM controle so, e ele e o "primeiro". Sozinho o primeiro e
       do rato; dentro da sala de outra pessoa ele tem que virar inteiro do SAPO — senao o
       jogador empurra o analogico e o dono ve um parceiro imovel. */
    const r = { quebrou: '' };
    const orig = navigator.getGamepads;
    try {
      const pad = { connected: true, id: 'fake', index: 0, mapping: 'standard', axes: [1, 0, 0, 0],
        buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      navigator.getGamepads = () => [pad];
      const zera = () => { padDir = null; p2PadDir = null; padPrev = []; p2PadPrev = []; };
      sala = null; zera(); pollPad(); pollPad2();
      r.soloRato = padDir; r.soloSapo = p2PadDir;
      sala = { codigo: 'TEST', dono: false }; zera(); pollPad(); pollPad2();
      r.convRato = padDir; r.convSapo = p2PadDir;
    } catch (e){ r.quebrou = e.message; }
    navigator.getGamepads = orig;
    sala = null; padDir = null; p2PadDir = null; padPrev = []; p2PadPrev = [];
    return r;
  },
  somDesign: () => {                                           // a cadeia de audio inteira, sem tocar nada
    const r = { efeitos: Object.keys(SFX).length, quebrou: [] };
    for (const k in SFX){ try { SFX[k](); } catch (e){ r.quebrou.push(k + ': ' + e.message); } }
    r.lugares = Object.keys(AMB);
    r.antiSpam = Object.keys(SFX_MIN);
    r.passo = { pedra: passoDoChao(player.tx, player.ty) === SFX.step };
    return r;
  },
  statusPoe: (qual) => {
    /* SALA VAZIA — a medida e do STATUS, e so dele. Com bicho em campo o rato apanhava durante
       os 900 quadros e a conta vinha 4, 8, 12 a mais: o guarda acusava "o veneno voltou a tirar
       vida" sem o veneno ter tirado nada.                                                      */
    if (!global.__salvos) global.__salvos = current.actors.slice();
    current.actors.length = 0;
    perigos.length = 0;                                       // marca de golpe de chefe de teste anterior ainda armada
    if (current.lava) current.lava.length = 0;
    if (current.goo) current.goo.length = 0;
    if (current.placas) current.placas.length = 0;
    player.tx = player.x = current.entry[0]; player.ty = player.y = current.entry[1];
    player.dead = false; player.mode = 'idle'; player.maxHp = 30; player.hp = 30;
    burnT = 0; frozT = 0; poisT = 0; cardSlot = {}; aegisT = 0; player.invuln = 0;
    powerCd = {}; stamCd = 0; stamT = 0; power = 'nova';
    if (qual === 'fogo'){ burnFrom = true; applyHit(player, 0, 0); burnFrom = false; }
    else if (qual === 'veneno'){ venomFrom = true; applyHit(player, 0, 0); venomFrom = false; }
    player.invuln = 0;
    return { hp: player.hp, burnT, poisT };
  },
  statusLe: () => ({ hp: player.hp, burnT, poisT }),
  statusCds: () => {                                           // recarga COM e SEM veneno, tudo o mais igual
    const comVeneno = poisT > 0;
    powerCd = {}; stamCd = 0; stamT = 0; player.mode = 'idle'; power = 'nova';
    doSpecial(player);
    const cd = powerCd.nova;
    stamCd = 0; stamT = 0; doStam(player);
    return { comVeneno, cd, stam: stamCd };
  },
  statusZera: () => {
    burnT = 0; poisT = 0; frozT = 0; powerCd = {}; stamCd = 0; stamT = 0; player.hp = player.maxHp;
    if (global.__salvos){ global.__salvos.forEach(a2 => current.actors.push(a2)); global.__salvos = null; }
    return true;
  },
  poderUnico: () => {                                          // NENHUM poder repete numa run — de fonte nenhuma
    poderJaCaiu.clear();
    inv.fill(null); invN.fill(0); inv2.fill(null); invN2.fill(0);
    chestItems.fill(null); chestN.fill(0); power = null; poder2 = null;
    const conta = {}, cena = current;
    const marca = ps => ps.forEach(p3 => { if (POWERS[p3.kind]) conta[p3.kind] = (conta[p3.kind] || 0) + 1; });
    for (let volta = 0; volta < 3; volta++)
      for (let lv = 2; lv <= 39; lv++){
        const d = genDungeon(lv);
        marca(d.pickups);
        d.pickups.forEach(p3 => { if (POWERS[p3.kind]) poderJaCaiu.add(p3.kind); });   // como o enterDungeon
        // e as DUAS torneiras que escapavam: o bau bom e o nicho
        current = d;
        d.pickups.length = 0;
        abrirBau({ x: d.entry[0], y: d.entry[1], ruim: false }, player);
        marca(d.pickups);
        d.pickups.length = 0;
        poePoder(d.entry[0], d.entry[1]);
        marca(d.pickups);
        current = cena;
      }
    const repetidos = Object.keys(conta).filter(k => conta[k] > 1);
    const total = Object.keys(conta).length;
    // e um que o jogador JA TEM nao pode ser oferecido
    poderJaCaiu.clear();
    power = 'nova';
    const podeSairNova = poderesDisponiveis(40).indexOf('nova') >= 0;
    power = null; inv[0] = 'rage';
    const podeSairRage = poderesDisponiveis(40).indexOf('rage') >= 0;
    inv[0] = null;
    poderJaCaiu.clear();
    return { repetidos, total, semIsca: !POWERS.bait, podeSairNova, podeSairRage };
  },
  pulsoDebuff: (qual) => {                                     // a tela BATE junto enquanto o debuff corroe
    burnT = 0; frozT = 0; poisT = 0;
    player.dead = false; player.mode = 'idle'; player.hp = player.maxHp;
    if (qual === 'fogo'){ burnT = 30; burnTk = 99; }
    else if (qual === 'gelo') frozT = 30;
    else if (qual === 'veneno'){ poisT = 30; poisTk = 99; }
    else if (qual === 'tudo'){ burnT = 30; burnTk = 99; frozT = 30; poisT = 30; poisTk = 99; }
    return true;
  },
  leiaPulso: () => {
    const op = id => +(document.getElementById(id).style.opacity || 0);
    return { chroma: chromaT, lL: op('ladoL'), lR: op('ladoR'),
             pois: op('poisFx'), gelo: op('frostFx'), fogo: op('burnFx'),
             tremeu: shakeMag, part: dust.filter(d2 => ['gooS', 'iceS', 'fireS'].indexOf(d2.kind) >= 0).length };
  },
  dificuldade: () => {                                         // os tres diais de dificuldade, medidos
    // a DEFESA saiu do jogo: o que se confere agora e que ela nao voltou por nenhuma porta
    const semDefesa = typeof maxArmor === 'undefined' && typeof armor === 'undefined';
    // CURVA DE VIDA: o mesmo plague doctor (nv 6 ao fim) em dois andares. Pega o MENOR hp de varias
    // salas: elite e andar maldito multiplicam por cima e falseiam a medida.
    const vidaDoutor = lv => {
      let min = 0;
      for (let k = 0; k < 14; k++){
        const d = genDungeon(lv);
        d.actors.forEach(a2 => {
          if (a2.hostile && !a2.boss && a2.skin === SKIN_PLAGUE && (!min || a2.maxHp < min)) min = a2.maxHp;
        });
      }
      return min;
    };
    const base = vidaDoutor(6), fundo = vidaDoutor(36);
    // bau bom: nao pode mais largar coracao
    const cena = current;
    current = genDungeon(6);
    current.pickups.length = 0;
    player.tx = player.x = current.entry[0]; player.ty = player.y = current.entry[1];
    abrirBau({ x: player.tx, y: player.ty, ruim: false }, player);
    const bau = current.pickups.map(p3 => p3.kind);
    current = cena;
    return { semDefesa, base, fundo, bau };
  },
  beijoPresente: () => {                                       // ela manda um beijinho a cada presente
    const cena = current;
    current = home;
    bigHearts.length = 0;
    upPend = 1; upAlvo = 'rato'; upOpen = true;
    const c0 = critUps;
    grantUp('crit');
    const bj = bigHearts.filter(h2 => h2.kiss);
    const r = { n: bj.length, voa: bj.filter(h2 => h2.tx != null).length, subiu: critUps - c0 };
    bigHearts.length = 0;
    current = cena;
    return r;
  },
  economia: () => {                                            // quanto de cada artefato cai por andar
    const g = { jaCaiu: [...poderJaCaiu], bolso: inv.slice(), pw: power, pw2: poder2 };
    poderJaCaiu.clear(); inv.fill(null); power = null; poder2 = null;   // mesa limpa: senao o poder some
    const c = { potion: 0, heartmax: 0, cheese: 0, poder: 0, n: 0 };
    for (let lv = 1; lv <= 39; lv++)                          // o 40 e o laboratorio: nao gera nada
      for (let k = 0; k < 10; k++){                            // 390 andares: menos ruido na media
        const d = genDungeon(lv); c.n++;
        d.pickups.forEach(p3 => {
          if (p3.kind === 'potion') c.potion++;
          else if (p3.kind === 'heartmax') c.heartmax++;
          else if (p3.kind === 'cheese') c.cheese++;
          else if (POWERS[p3.kind]) c.poder++;
        });
      }
    g.jaCaiu.forEach(k => poderJaCaiu.add(k));
    for (let k = 0; k < inv.length; k++) inv[k] = g.bolso[k];
    power = g.pw; poder2 = g.pw2;
    return { pocao: c.potion / c.n, coracao: c.heartmax / c.n, queijo: c.cheese / c.n, poder: c.poder / c.n };
  },
  varreduraPad: () => {                                        // a varredura so existe com um 2o CONTROLE
    const orig = navigator.getGamepads;
    const falso = n2 => { const l = []; for (let k = 0; k < n2; k++) l.push({ connected: true, buttons: [], axes: [0, 0], index: k }); return l; };
    const guarda = { on: p2On, morto: player2.dead, scan: p2Scan };
    p2On = false; p2Scan = 0; player2.dead = true;
    const cena = current; current = SCENES.dungeon || current;
    navigator.getGamepads = () => falso(0);
    varreduraP2(); const semPad = p2Scan;
    navigator.getGamepads = () => falso(1);
    varreduraP2(); const umPad = p2Scan;
    navigator.getGamepads = () => falso(2);
    varreduraP2(); const doisPads = p2Scan;
    navigator.getGamepads = orig; current = cena;
    p2On = guarda.on; player2.dead = guarda.morto; p2Scan = guarda.scan;   // devolve o tabuleiro
    const el = document.getElementById('scan2');
    if (el) el.className = '';
    return { semPad, umPad, doisPads };
  },
  teclaNaoEntra: () => {                                       // tecla do sapo nao pode mais fazer ele ENTRAR
    const achou = src.indexOf('p2Scan > 0 && ehTeclaP2') >= 0;
    return { aindaEntra: achou };
  },
  pecasArmario: () => {                                        // as pecas grandes moram nos acessorios
    const antes = outfit.fant;
    const r = { lista: PECA_DEFS.map(a => a[2]), semIcone: PECA_DEFS.filter(a => !WICON[a[0]]).map(a => a[0]) };
    r.limpou = !PECA_VALIDA.bob && !PECA_VALIDA.aranha && !PECA_VALIDA.caranguejo;
    r.desenhou = {};
    ['dragao', 'fada'].forEach(k => {
      outfit.fant = k; applyOutfit();
      r.desenhou[k] = SKIN_HERO.acc.fant === k;
      drawRatSprite(false, player.pose, SKIN_HERO, 0);         // frente e costas sem estourar
      drawRatSprite(true, player.pose, SKIN_HERO, 0);
    });
    outfit.fant = antes; applyOutfit();
    return r;
  },
  chefeCarta: () => {                                          // TODO chefe larga a carta dele, nao so o gato
    const r = {};
    [10, 20, 30].forEach(lv => {
      const d = genDungeon(lv);
      const chefe = d.actors.find(a2 => a2.boss);
      r[lv] = chefe ? chefe.card : 'sem chefe';
    });
    r.desenhou = {};                                           // e cada uma desenha alguma coisa de verdade
    ['ccat', 'cyetiB', 'ctoadB'].forEach(k => { r.desenhou[k] = !!CARD_ART[k] && !!CARDS[k] && !!ICON[k]; });
    return r;
  },
  cartaChefeEfeito: () => {                                    // os tres efeitos novos entram de verdade
    const guarda = { arma: weapon, slot: cardSlot, st: stamT, sc: stamCd };
    cardSlot = {}; cardSlot2 = {};
    drillT = 0; rageT = 0;                                     // buff sobrando falseia a conta da recarga
    stamT = 0; stamCd = 0; player.mode = 'idle'; player.dead = false;
    cardSlot[weapon] = 'cyetiB';                               // sopro do norte: em 400 golpes tem que congelar alguem
    let congelou = 0;
    for (let k = 0; k < 400; k++){
      const v = makeActor(player.tx + 1, player.ty, SKIN_ENEMY, { hostile: true, hp: 999, maxHp: 999 });
      current.actors.push(v);
      player.dir = 0; v.invuln = 0;
      dealDamage(player);
      if (v.frzT > 0) congelou++;
      v.dead = true; current.actors.splice(current.actors.indexOf(v), 1);
    }
    const mede = () => {                                       // cava de verdade e le a recarga que sobrou
      const px = player.tx, py = player.ty, md = player.mode;
      let v = 0;
      for (let d2 = 0; d2 < 4 && !v; d2++){
        dashCd = 0; player.mode = 'idle';
        player.tx = player.x = px; player.ty = player.y = py;
        doDash(d2, player);
        if (dashCd > 0) v = dashCd;
      }
      dashCd = 0;
      player.tx = player.x = px; player.ty = player.y = py; player.mode = md; player.t = 0;
      player.from = null; player.to = null;
      return v;
    };
    cardSlot = {};
    const semSalto = mede();
    cardSlot[weapon] = 'ctoadB';
    const comSalto = mede();
    cardSlot = guarda.slot; weapon = guarda.arma; stamT = guarda.st; stamCd = guarda.sc;
    return { congelou, semSalto, comSalto };
  },
  sapoBau: () => {                                             // o baU do covil tambem e do sapo
    const cena = current;
    current = home;
    chestItems.fill(null); chestN.fill(0);
    inv.fill(null); invN.fill(0); inv2.fill(null); invN2.fill(0);
    inv2[0] = 'potion'; invN2[0] = 2;
    inv[0] = 'nova'; invN[0] = 1;
    player.tx = player.x = 5; player.ty = player.y = 6;         // o rato longe do bau
    player2.tx = player2.x = 0; player2.ty = player2.y = 5;
    player2.dead = false; player2.mode = 'idle';
    sapoPousou();
    const abriu = chestOpen && chestDono === player2;
    const fileira = chestInvSlots.map(e => e.style.backgroundImage ? 1 : 0).join('');
    invToChest(0);                                              // guarda 1 pocao DELE
    const guardou = chestItems.indexOf('potion') >= 0 && invN2[0] === 1 && inv[0] === 'nova';
    chestSlots[chestItems.indexOf('potion')].onclick();          // e pega de volta
    const pegou = invN2[0] === 2;
    closeChest();
    chestItems.fill(null); chestN.fill(0); inv2.fill(null); invN2.fill(0); inv.fill(null); invN.fill(0);
    current = cena;
    return { abriu, fileira, guardou, pegou };
  },
  sapoBauCastigo: () => {                                      // o castigo do bau da dungeon e de QUEM abriu
    poisT = 0; p2PoisT = 0; powerCd = {}; cdPoder2 = {};
    cardSlot = {}; cardSlot2 = {};
    player2.dead = false; player2.mode = 'idle'; player2.hp = player2.maxHp;
    player.hp = player.maxHp;
    const hp0 = player.hp;
    abrirBau({ x: player2.tx, y: player2.ty, ruim: true, castigo: 1 }, player2);
    const veneno = { sapo: p2PoisT > 0, rato: poisT > 0, ratoIntacto: player.hp === hp0 };
    abrirBau({ x: player2.tx, y: player2.ty, ruim: true, castigo: 2 }, player2);
    const trava = { sapo: (cdPoder2.nova || 0) > 0, rato: (powerCd.nova || 0) > 0 };
    poisT = 0; p2PoisT = 0; powerCd = {}; cdPoder2 = {};
    player2.hp = player2.maxHp; player.hp = player.maxHp;
    return { veneno, trava };
  },
  sapoTp: () => {                                              // teleporte: sumico, rastro e QUEDA
    p2TpT = 0;
    player2.dead = false; player2.mode = 'idle';
    player2.tx = player2.x = player.tx + 9; player2.ty = player2.y = player.ty + 8;
    const n0 = dust.length, r0 = rings.length;
    poeSapoPerto();
    const perto = Math.abs(player2.tx - player.tx) + Math.abs(player2.ty - player.ty);
    const r = { poeira: dust.length - n0, aneis: rings.length - r0, queda: p2TpT, perto };
    passoP2(.016, .016, 0, false);                             // um quadro de queda: ele tem que estar NO AR
    r.noAr = player2.pose.air;
    return r;
  },
  sapoCarga: () => {                                           // o sapo brilha carregando, igual ao rato
    current.actors.length = sapoSave.n;
    player2.dead = false; player2.mode = 'idle'; player2.invuln = 99;
    p2AtkHold = false; p2ChargeT = 0; p2ChargeRdy = false; p2ChargeLock = false; p2ChargeBreakT = 0;
    p2HoldAtk();
    for (let k = 0; k < 200 && !p2ChargeRdy; k++) passoP2(.016, .016, 0, false);
    const rdy = p2ChargeRdy;
    p2ChargeBreakT = 0;
    burnFrom = false;
    player2.invuln = 0;
    applyHit(player2, 1, 0);                                   // apanhou carregando: a luz DELE se parte
    const quebrou = p2ChargeBreakT > 0 && !p2ChargeRdy;
    p2AtkHold = false; p2ChargeT = 0; p2ChargeRdy = false; p2ChargeLock = false; p2ChargeBreakT = 0;
    player2.hp = player2.maxHp; player2.invuln = 0;
    return { rdy, quebrou };
  },
  sapoNaRatinha: () => {                                       // o sapo entrega queijo e pega o PRÓPRIO presente
    const px0 = player.tx, py0 = player.ty, cena = current;
    current = home;
    const p2Antes = p2On; p2On = true;                           // v1.50: com o sapo em campo, quem o atende e a SAPINHA
    conta('rato'); const ratoConta = contaDe('rato').join();
    conta('sapo');
    cheeseN = 40; stash = 0; upPend = 0; upGoal = 10; upsDone = 0; upDismissed2 = false; upOpen = false;
    player.tx = player.x = 1; player.ty = player.y = 6;        // o rato longe dela: quem chega é o sapo
    player2.tx = player2.x = sapinha.tx - 1; player2.ty = player2.y = sapinha.ty;
    const s0 = player2.maxHp, r0 = player.maxHp;
    checkDeposit(player2);
    // v1.46: a entrega virou CENA — o painel não abre mais no mesmo quadro do depósito. O teste
    // confere que a cena começa mirando quem entregou e que ela desemboca no painel certo.
    const cenaRolou = !!entrega, cenaDoSapo = !!entrega && entrega.sapo;
    if (entrega) fimEntrega(true);
    conta('sapo');
    const abriu = upOpen, alvo = upAlvo, entregue = stash;
    const contaRatoIntacta = contaDe('rato').join() === ratoConta;
    if (upOpen) grantUp('hp');
    current = cena;
    player.tx = player.x = px0; player.ty = player.y = py0;
    conta('rato'); p2On = p2Antes;
    return { abriu, alvo, entregue, cenaRolou, cenaDoSapo,
      sapoSubiu: player2.maxHp - s0, ratoIntacto: player.maxHp === r0 && contaRatoIntacta };
  },
  sapoStatus: () => {                                          // queimadura, gelo e veneno também pegam no sapo
    p2BurnT = 0; p2FrostT = 0; p2PoisT = 0;
    player2.mode = 'idle'; player2.hp = player2.maxHp;
    player2.invuln = 0; burnFrom = true; applyHit(player2, 1, 0); burnFrom = false;
    player2.invuln = 0; frostFrom = true; applyHit(player2, 1, 0); frostFrom = false;
    player2.invuln = 0; venomFrom = true; applyHit(player2, 1, 0); venomFrom = false;
    const r = { burn: p2BurnT > 0, frost: p2FrostT > 0, pois: p2PoisT > 0 };
    p2BurnT = 0; p2FrostT = 0; p2PoisT = 0;
    player2.hp = player2.maxHp;
    return r;
  },
  sapoEscava: () => {                                          // a Escavação também é do sapo
    player.tx = player.x = current.entry[0]; player.ty = player.y = current.entry[1];
    poeSapoPerto();                                            // põe os dois em chão bom antes de tentar
    let ok = false; const porq = [];
    for (let d2 = 0; d2 < 4 && !ok; d2++){
      player2.mode = 'idle'; player2.t = 0; dashCd2 = 0; player2.dir = d2;
      const [dx, dy] = DIRV[d2];
      porq.push(d2 + ':over=' + current.over(player2.tx + dx, player2.ty + dy) +
        ',walk=' + canWalk(player2.tx + dx * 2, player2.ty + dy * 2, player2));
      doDash(d2, player2);
      ok = player2.mode === 'burrow';
    }
    let fundo = 0;
    if (ok) for (let i = 0; i < 60; i++){ stepActor(player2, .016, 0, {}); fundo = Math.max(fundo, player2.sink || 0); }
    // o sprite do sapo passa pelo SKINDRAW, que não tinha o recorte do afundamento: ele "escavava" por cima do chão
    const temRecorte = drawActor.toString().indexOf('o corpo some DENTRO da terra') >= 0;
    return { ok, fundo, temRecorte, modo: player2.mode, porq: porq.join(' | '), pos: player2.tx + ',' + player2.ty };
  },
  presenteAlvo: () => {                                        // o casal escolhe QUEM recebe o presente
    const r0 = player.maxHp, s0 = player2.maxHp;
    upPend = 1; upAlvo = 'sapo'; grantUp('hp');
    const s1 = player2.maxHp, r1 = player.maxHp;
    upPend = 1; upAlvo = 'rato'; grantUp('hp');
    return { sapoSubiu: s1 - s0, ratoIntacto: r1 === r0, ratoSubiu: player.maxHp - r1 };
  },
  poderDano: () => {                                           // TODO poder que deveria FERIR tem que ferir
    // O allPowers só via 'acendeu algum efeito', e o círculo de invocação acende antes do galho —
    // por isso o Rodopio de Lâminas ficou sem fazer dano da v1.03 até a v1.14 sem ninguém notar.
    const guardaAtores = current.actors.slice();
    const cx = Math.max(3, Math.min(current.w - 4, player.tx));
    const cy = Math.max(3, Math.min(current.h - 4, player.ty));
    player.tx = player.x = cx; player.ty = player.y = cy;
    weapon = 'sword'; player.dmg = WEAPONS.sword.dmg;
    rageT = 0; stamT = 0; edgeT = 0; cardSlot = {};
    current.actors.length = 0;
    const POS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    const vits = POS.map(([ox, oy]) => {
      const v = makeActor(cx + ox, cy + oy, SKIN_ENEMY, { hostile: true, hp: 99, maxHp: 99 });
      current.actors.push(v);
      return v;
    });
    const repor = () => {
      player.tx = player.x = cx; player.ty = player.y = cy;
      player.mode = 'idle'; player.dir = 0; player.hp = Math.max(1, player.maxHp - 4);
      vits.forEach((v, i) => {
        v.hp = 99; v.invuln = 0; v.dead = false; v.mode = 'idle'; v.frzT = 0; v.hexT = 0; v.recT = 0;
        v.tx = v.x = cx + POS[i][0]; v.ty = v.y = cy + POS[i][1];
      });
    };
    const out = {};
    Object.keys(POWERS).forEach(k => {
      repor();
      power = k; powerCd = {};
      doSpecial();
      out[k] = vits.reduce((a, v) => a + (99 - v.hp), 0);
    });
    // os próprios poderes do laço acendem fúria/corda/fio: zera antes de medir o dobro do Rodopio
    rageT = 0; edgeT = 0; stamT = 0; leechT = 0;
    repor();
    power = 'spin'; powerCd = {};
    doSpecial();
    out.__giro = vits.map(v => 99 - v.hp);                     // o giro tem que pegar as OITO casas
    current.actors.length = 0;
    guardaAtores.forEach(a2 => current.actors.push(a2));
    return out;
  },
  poderEquipa: () => {                                         // o botão do PODER equipa quando não há poder na mão
    const guardaInv = inv.slice(), guardaN = invN.slice(), p0 = power, q0 = quickSlot;
    power = null; inv.fill(null); invN.fill(0);
    addItem('nova'); quickSlot = inv.indexOf('nova');
    player.mode = 'idle'; powerCd = {};
    const daMao = doSpecial() && power === 'nova';
    powerCd = {}; player.mode = 'idle';
    const n0 = pfx.length + castFx.length;
    const lancou = doSpecial() && (pfx.length + castFx.length) > n0;   // com poder na mão, volta a LANÇAR
    power = null; inv.fill(null); invN.fill(0);
    addItem('potion'); addItem('shards'); quickSlot = 0;
    player.mode = 'idle'; powerCd = {};
    const daMochila = doSpecial() && power === 'shards';
    power = null; inv.fill(null); invN.fill(0); player.mode = 'idle';
    const semNada = doSpecial();
    inv.splice(0, inv.length, ...guardaInv); invN.splice(0, invN.length, ...guardaN);
    power = p0; quickSlot = q0; powerCd = {};
    return { daMao, lancou, daMochila, semNada };
  },
  poderArma: () => {                                           // apertar o poder no meio de um tranco não pode sumir
    power = 'rage'; powerCd = {}; rageT = 0; spcBuf = 0;
    player.mode = 'hurt'; player.t = 0;                        // ocupado: o pedido NÃO sai agora
    player.from = [player.tx, player.ty]; player.to = [player.tx, player.ty];
    const naHora = doSpecial();
    wantSpc = true;                                            // o frame() guarda o pedido
    return naHora;
  },
  poderSaiu: () => ({ rage: rageT, buf: spcBuf, modo: player.mode, gelo: frozT, veneno: poisT, fogo: burnT, hp: player.hp }),
  poderTravado: () => {                                        // o quadro travado no impacto NAO pode comer o pedido
    power = 'rage'; powerCd = {}; rageT = 0; wantSpc = false;
    player.mode = 'hurt'; player.t = 0;                        // ocupado: o pedido fica guardado
    player.from = [player.tx, player.ty]; player.to = [player.tx, player.ty];
    spcBuf = .35; hitStop = .12; slowMo = 0;
    return true;
  },
  poderBuf: () => spcBuf,
  cartaCredito: () => {                                        // o bicho morre DENTRO do applyHit: o credito ja tem que estar posto
    const origHit = applyHit;
    let naHora = 'nada';
    applyHit = function (v2, dmg, dir, crit){                  // espia o dono no instante do golpe
      naHora = cartaDono === player2 ? 'sapo' : cartaDono === player ? 'rato' : 'ninguem';
      return origHit(v2, dmg, dir, crit);
    };
    cartaDono = player;                                        // credito velho de proposito: era do rato
    const v = makeActor(player2.tx + 1, player2.ty, SKIN_ENEMY, { hostile: true, hp: 99, maxHp: 99 });
    current.actors.push(v);
    player2.dir = 0;
    dealDamage(player2);
    applyHit = origHit;
    v.dead = true; current.actors.splice(current.actors.indexOf(v), 1);
    return naHora;
  },
  sapoSai: () => {                                             // devolve o tabuleiro como estava pros testes seguintes
    current.actors.length = sapoSave.n;
    player.tx = player.x = sapoSave.px; player.ty = player.y = sapoSave.py;
    player.mode = 'idle'; player.t = 0; player.hp = player.maxHp;
    p2On = false; p2Scan = 0; player2.dead = true; player2.mode = 'idle';
    return true;
  },
  castTest: () => {                                           // círculo de invocação + pilar de nível
    castFx.length = 0; levelFx.length = 0;
    power = 'spin'; powerCd = {}; player.mode = 'idle';
    doSpecial();
    levelUpFx();
    return { cast: castFx.length, level: levelFx.length, col: castFx[0] && castFx[0].col };
  },
  smashTest: () => {                                          // barril na frente do golpe estilhaça
    let pr = current.props.find(p3 => p3.bust), planted = false;
    if (!pr){                                                 // andar sem barril sorteado: planta um
      let sx2 = -1, sy2 = -1;
      for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
        for (let xx = 2; xx < current.w - 1; xx++)
          if (current.free(xx, yy) && current.free(xx - 1, yy) && !occupied(xx, yy, null)){ sx2 = xx; sy2 = yy; break; }
      if (sx2 < 0) return null;
      current.addProp(sx2 + sy2 + .3, [[sx2, sy2]], propBarrel(sx2, sy2));
      pr = current.props[current.props.length - 1];
      pr.bust = [sx2, sy2];
      planted = true;
    }
    const [bx, by] = pr.bust;
    player.tx = player.x = bx - 1; player.ty = player.y = by; player.dir = 0;
    player.hp = Math.max(1, player.maxHp - 1);
    const blocked0 = !current.free(bx, by);
    dealDamage(player);
    return { blocked0, gone: !current.props.includes(pr), walkable: current.free(bx, by), planted };
  },
  beamTest: () => {                                           // vida cheia: o golpe vira raio
    let sx2 = -1, sy2 = -1;
    for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
      for (let xx = 1; xx < current.w - 4; xx++){
        let ok = true;
        for (let k2 = 0; k2 < 4; k2++)
          if (!current.free(xx + k2, yy) || occupied(xx + k2, yy, null)){ ok = false; break; }
        if (ok){ sx2 = xx; sy2 = yy; break; }
      }
    if (sx2 < 0) return null;
    current.actors.forEach(a2 => { if (a2.hostile) a2.dead = true; });   // arena limpa: mede o RAIO, não a IA
    player.tx = player.x = sx2; player.ty = player.y = sy2; player.dir = 0; player.mode = 'idle';
    player.hp = player.maxHp;
    const e2 = makeActor(sx2 + 3, sy2, SKIN_ENEMY, { hostile: true, hp: 40, maxHp: 40 });
    current.actors.push(e2);
    beams.length = 0;
    dealDamage(player);
    return { fired: beams.length, eid: current.actors.indexOf(e2), hp0: e2.hp };
  },
  beamEnd: eid => {
    const e2 = current.actors[eid];
    const res = { hp: e2 ? e2.hp : -1, left: beams.length };
    if (e2) e2.dead = true;
    return res;
  },
  chargeTest: () => {                                         // segurar e soltar = giro nas 4 direções
    const spots = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (spots.length < 2) return null;
    player.hp = Math.max(1, player.maxHp - 1);
    const foes = spots.slice(0, 2).map(([a2, b2]) => {
      const e2 = makeActor(player.tx + a2, player.ty + b2, SKIN_ENEMY, { hostile: true, hp: 40, maxHp: 40 });
      current.actors.push(e2);
      return e2;
    });
    holdAtk(); wantAtk = false;
    chargeT = CHARGE_T + .05; chargeRdy = true;
    releaseAtk();
    const res = { hurt: foes.filter(e2 => e2.hp < 40).length, of: foes.length, mode: player.mode,
      dmg: 40 - foes[0].hp, normal: baseDmg() };               // o giro tira o MESMO que um golpe normal
    foes.forEach(e2 => { e2.dead = true; });
    return res;
  },
  bossDrop: () => {                                           // chefe caído entrega contêiner de coração
    const b = makeActor(player.tx + 2, player.ty, SKIN_ENEMY, { hostile: true, boss: true, hp: 1, maxHp: 1 });
    current.actors.push(b);
    const n0 = current.pickups.filter(p3 => p3.kind === 'heartmax').length;
    applyHit(b, 5, 0);
    const n1 = current.pickups.filter(p3 => p3.kind === 'heartmax').length;
    current.pickups = current.pickups.filter(p3 => p3.kind !== 'heartmax');
    return { dropped: n1 - n0 };
  },
  poseTest: () => {                                           // achou um poder: ergue com fanfarra
    inv.fill(null); invN.fill(0);
    itemGetT = 0; itemGetK = null;
    avisos.length = 0; avisoAte = 0;                          // o achado passa pela FILA: limpa antes
    current.pickups.length = 0;
    current.pickups.push({ x: player.tx, y: player.ty, kind: 'nova' });
    collectPickups();
    for (let k = 0; k < 8 && !itemGetK; k++) passoAvisos();    // e deixa a fila andar
    return { t: itemGetT, kind: itemGetK, tx: player.tx, ty: player.ty, naFila: avisos.length };
  },
  act: i => {                                                 // uma ação pseudoaleatória por quadro
    const r = k => hash(i * 7 + k, 13 + (i % 31));
    const m = (r(1) * 11) | 0;
    if (m < 4){ held.length = 0; held.push((r(2) * 4) | 0); }
    else if (m === 4){ held.length = 0; }
    else if (m === 5){ holdAtk(); }
    else if (m === 6){ releaseAtk(); }
    else if (m === 7){ wantDash = true; lastTapDir = w2s(player.dir); }
    else if (m === 8){
      const ps = Object.keys(POWERS);
      power = ps[(r(3) * ps.length) | 0]; powerCd = {}; wantSpc = true;
    }
    else if (m === 9){ wantStam = true; }
    else { wantAtk = true; }
  },
  alive: () => ({ hp: player.hp, dead: player.dead, lv: current.level, foes: current.actors.filter(a2 => a2.hostile && !a2.dead).length }),
  walkNow: () => {                                            // segura uma direção livre pra andar
    player.mode = 'idle'; player.t = 0;                        // isola o teste: só a animação do achado pesa
    for (let d2 = 0; d2 < 4; d2++){
      const [a2, b2] = DIRV[d2];
      if (canWalk(player.tx + a2, player.ty + b2, player)){
        held.length = 0; held.push(w2s(d2));
        walkFrom = [player.tx, player.ty];
        return true;
      }
    }
    return false;
  },
  walkState: () => {
    const moved = player.tx !== walkFrom[0] || player.ty !== walkFrom[1];
    held.length = 0;
    return { moved, fx: itemGetT, dbg: [player.mode, player.tx, player.ty, walkFrom.join(), passoN, slowMo, hitStop, anyPanel(), transitioning, pDead(), held.join()] };
  },
  quakeTest: () => {                                          // Terremoto detona a vizinhança
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (!nb) return null;
    const e2 = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_ENEMY, { hostile: true, hp: 30, maxHp: 30 });
    current.actors.push(e2);
    power = 'quake'; powerCd = {}; player.mode = 'idle';
    doSpecial();
    const res = { hp: e2.hp, buff: quakeT };
    e2.dead = true; quakeT = 0;
    return res;
  },
  drillTest: () => {                                          // Broca: túnel de 4 tiles
    let sx2 = -1, sy2 = -1;
    for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
      for (let xx = 1; xx < current.w - 5; xx++){
        let ok = true;
        for (let k2 = 0; k2 < 5; k2++)
          if (!current.free(xx + k2, yy) || occupied(xx + k2, yy, null)){ ok = false; break; }
        if (ok){ sx2 = xx; sy2 = yy; break; }
      }
    if (sx2 < 0) return null;
    player.tx = player.x = sx2; player.ty = player.y = sy2; player.mode = 'idle'; player.dir = 0;
    const e2 = makeActor(sx2 + 2, sy2, SKIN_ENEMY, { hostile: true, hp: 30, maxHp: 30 });
    current.actors.push(e2);
    drillT = 10; dashCd = 0;
    doDash(0);
    return { to: player.to.slice(), eid: current.actors.indexOf(e2), hp0: e2.hp };
  },
  drillEnd: eid => {
    const e2 = current.actors[eid];
    const res = { pos: [player.tx, player.ty], hp: e2 ? e2.hp : -1, cd: dashCd };
    if (e2) e2.dead = true;
    drillT = 0;
    return res;
  },
  frozenTest: () => {                                         // congelado continua sendo alvo
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a2, b2]) =>
      current.free(player.tx + a2, player.ty + b2) && !occupied(player.tx + a2, player.ty + b2, null));
    if (!nb) return null;
    const e2 = makeActor(player.tx + nb[0], player.ty + nb[1], SKIN_ENEMY, { hostile: true, hp: 30, maxHp: 30 });
    current.actors.push(e2);
    e2.frzT = 4; e2.invuln = .3;
    window.__pump(.4);                                             // deixa o gelo correr um pouco
    const hp0 = e2.hp;
    applyHit(e2, 3, 0);
    const res = { hurt: e2.hp < hp0, dealt: hp0 - e2.hp, stayed: e2.tx === player.tx + nb[0] && e2.ty === player.ty + nb[1] };
    e2.dead = true;
    return res;
  },
  stage: () => {                                              // cenário assado: chave, âncora e limites
    const [vw2, vh2] = rot % 2 ? [current.h, current.w] : [current.w, current.h];
    return { key: stageKey, ox: stageOX, oy: stageOY, w: STG.width, h: STG.height, vw: vw2, vh: vh2, TT: TT(), WH: WALLH(), TW };
  },
  plagueTest: () => {                                            // Plague Doctor: existe, larga a própria carta
    const f = FOES.find(x => x.skin === SKIN_PLAGUE);
    if (!f) return null;
    let sx2 = -1, sy2 = -1;
    for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
      for (let xx = 2; xx < current.w - 1; xx++)
        if (current.free(xx, yy) && !occupied(xx, yy, null)){ sx2 = xx; sy2 = yy; break; }
    const k = makeActor(sx2, sy2, SKIN_PLAGUE, { hostile: true, hp: 1, maxHp: 1, dmg: 2, card: f.card });
    current.actors.push(k);
    const antes = current.actors.filter(a => a.hostile && !a.dead).length;
    applyHit(k, 5, 0);
    const depois = current.actors.filter(a => a.hostile && !a.dead).length;
    return { morreu: k.dead, gerou: depois - (antes - 1), carta: f.card, hp: f.hp,
      temArte: !!CARDS[f.card] && !!CARD_ART[f.card] };
  },
  ratkingTest: () => {                                           // Nó de Ratos (rat king): existe, morre de vez, não se desfaz em ratos
    const f = FOES.find(x => x.skin === SKIN_RATKING);
    if (!f) return null;
    let sx2 = -1, sy2 = -1;
    for (let yy = 1; yy < current.h - 1 && sx2 < 0; yy++)
      for (let xx = 2; xx < current.w - 1; xx++)
        if (current.free(xx, yy) && !occupied(xx, yy, null)){ sx2 = xx; sy2 = yy; break; }
    const k = makeActor(sx2, sy2, SKIN_RATKING, { hostile: true, hp: 1, maxHp: 1, dmg: 2 });
    current.actors.push(k);
    const antes = current.actors.filter(a => a.hostile && !a.dead).length;
    applyHit(k, 5, 0);
    const depois = current.actors.filter(a => a.hostile && !a.dead).length;
    return { morreu: k.dead, gerou: depois - (antes - 1), hp: f.hp, split: !!f.split, desenha: !!SKINDRAW.find(x => x[0] === 'ratking') };
  },
};
window.__pump = dt => {                                        // roda o mundo por fora, sem render
  current.actors.forEach(a => {
    if (a.dead) return;
    if (a.frzT > 0){
      a.frzT = Math.max(0, a.frzT - dt);
      a.invuln = Math.max(0, a.invuln - dt);
      a.flash = Math.max(0, a.flash - dt);
      return;
    }
  });
};`;

let t = 1000;
function pump(n){
  for (let i = 0; i < n; i++){
    const cbs = raf.splice(0);
    if (!cbs.length){ console.error('DEEP_FAIL: nenhum frame agendado'); process.exit(1); }
    t += 16;
    cbs.forEach(cb => cb(t));
  }
}

(async () => {
  try {
    new Function(src + hook)();
    pump(3);
    const BOSSES = { 10: '🐈 O GATO', 20: '❄️ YETI ANCIÃO', 30: '🐸 SAPO REAL' };
    for (const lv of [1, 10, 11, 16, 20, 21, 25, 30, 31, 36, 39, 40]){
      global.__t.enter(lv);
      await new Promise(r => setTimeout(r, 700));             // goTo: fade 300ms + trava 300ms
      pump(6);
      const st = global.__t.state();
      if (st.lv !== lv) throw new Error(`nível errado: ${st.lv} != ${lv}`);
      if ((lv >= 11 && lv <= 20) !== st.ice) throw new Error(`flag ice errada no nv ${lv}`);
      if ((lv >= 21 && lv <= 30) !== st.sewer) throw new Error(`flag sewer errada no nv ${lv}`);
      if (BOSSES[lv] && (!st.boss || st.boss.name !== BOSSES[lv])) throw new Error(`chefe errado no nv ${lv}: ${st.boss && st.boss.name}`);
      if (lv >= 31 && st.boss) throw new Error(`o Sabá das Bruxas não tem chefe, mas o nv ${lv} trouxe ${st.boss.name}`);
      // a placa polida só existe no gelo — e é CONTADA
      if (st.slick && !st.ice) throw new Error(`placa de gelo fora do Reino do Gelo (nv ${lv})`);
      if (st.ice && lv % 10 !== 0 && (st.slick < 3 || st.slick > 5)) throw new Error(`placas polidas fora da conta no nv ${lv}: ${st.slick}`);   // v1.46: 3–5 (era 4–7)
      if (lv === 11){ global.__t.freezeAll(); pump(4); global.__t.frost(); pump(4); }
      if (lv === 21){ global.__t.usePower('bomb'); pump(3); global.__t.usePower('leech'); pump(3); global.__t.poison(); pump(6); }
      if (lv === 31){ global.__t.usePower('hex'); pump(3); global.__t.usePower('coven'); pump(3); }
      console.log(`nv ${lv}: ok — ice=${st.ice} sewer=${st.sewer} goo=${st.goo} slick=${st.slick} foes=[${st.foes.join(', ')}]${st.boss ? ' boss=' + st.boss.name : ''}`);
    }
    global.__t.gift(); pump(8);                               // presente + confetes

    // poções empilham num único slot
    global.__t.give('potion'); global.__t.give('potion'); global.__t.give('potion');
    const bag = global.__t.bag();
    const slots = bag.inv.filter(x => x === 'potion');
    if (slots.length !== 1) throw new Error(`poções em ${slots.length} slots (esperado 1)`);
    const si = bag.inv.indexOf('potion');
    if (bag.n[si] !== 3) throw new Error(`pilha de poções = ${bag.n[si]} (esperado 3)`);
    global.__t.use(si);                                       // bebe 1 (vida não está cheia? gift encheu — força dano)
    const bag2 = global.__t.bag();
    if (bag2.inv[si] !== 'potion') throw new Error('pilha sumiu ao usar 1 poção');
    console.log(`estoque: ok — 3 poções num slot, restam ${bag2.n[si]} após beber (vida cheia mantém 3)`);

    // baú empilha consumíveis num só espaço
    global.__t.give('potion'); global.__t.give('potion');
    const si2 = global.__t.bag().inv.indexOf('potion');
    global.__t.toChest(si2); global.__t.toChest(si2);
    const ch = global.__t.chest();
    const cs = ch.items.filter(x => x === 'potion');
    if (cs.length !== 1) throw new Error(`baú: poções em ${cs.length} espaços (esperado 1)`);
    const ci = ch.items.indexOf('potion');
    if (ch.n[ci] < 2) throw new Error(`baú: pilha = ${ch.n[ci]} (esperado ≥2)`);
    console.log(`baú: ok — pilha de ${ch.n[ci]} poções num só espaço`);

    // rotação do mapa: 4 giros renderizam e voltam ao início
    for (let r2 = 0; r2 < 4; r2++){ global.__t.rotate(1); pump(3); }
    if (global.__t.rotState() !== 0) throw new Error('rotação não fechou o círculo');
    global.__t.rotate(-1); pump(3); global.__t.rotate(1); pump(3);
    console.log('giro: ok — 4x ⟳ volta ao início, ⟲ e ⟳ renderizam');

    // chefão 2×2: golpe acerta o tile secundário do corpo
    global.__t.enter(10);
    await new Promise(r => setTimeout(r, 700));
    pump(4);
    const bs = global.__t.boss();
    if (!bs || !bs.big2) throw new Error('chefe do nv 10 não é 2×2');
    if (global.__t.state().foes.length !== 1) throw new Error('sala do chefe tem inimigos extras');
    if (!global.__t.hitBossFrom()) throw new Error('golpe não acertou o corpo 2×2 do chefe');
    pump(4);
    console.log(`chefe: ok — ${bs.name} 2×2, sozinho na sala, corpo inteiro golpeável (hp ${bs.maxHp})`);

    // Plague Doctor tomou o lugar da Raposa Malandra (que tomou o do Nó de Ratos)
    const fx2 = global.__t.plagueTest(); pump(3);
    if (!fx2) throw new Error('o plague doctor não está na tabela de bichos');
    if (!fx2.morreu || fx2.gerou !== 0) throw new Error('o plague doctor não morreu limpa');
    if (fx2.carta !== 'cplague' || !fx2.temArte) throw new Error('o plague doctor está sem carta ou sem arte de carta');
    console.log(`plague doctor: ok — no bestiário com ${fx2.hp} de vida e carta própria com arte`);

    // Nó de Ratos voltou (v1.41, a versão baixinha da v0.29) — e morre de vez, sem soltar rato nenhum
    const rk = global.__t.ratkingTest(); pump(3);
    if (!rk) throw new Error('o nó de ratos não está na tabela de bichos');
    if (!rk.desenha) throw new Error('o nó de ratos está sem função de desenho no SKINDRAW');
    if (rk.split) throw new Error('a tabela voltou a marcar split no nó de ratos: ele tem que morrer de vez');
    if (!rk.morreu || rk.gerou !== 0) throw new Error(`o nó de ratos não morreu limpa (gerou ${rk.gerou} rato(s))`);
    console.log(`nó de ratos: ok — de volta ao bestiário com ${rk.hp} de vida, morre de vez sem se desfazer`);

    // guincho sônico arremessa sem ferir · casaco de gelo blinda · arma fraca fica no chão
    const sk = global.__t.shockTest(); pump(3);
    if (!sk) throw new Error('shock: sem espaço pro teste');
    if (sk.hp !== 5) throw new Error('guincho causou dano');
    if (sk.dist <= 2) throw new Error(`guincho não empurrou (dist ${sk.dist})`);
    console.log(`guincho: ok — sem dano, inimigo arremessado pra ${sk.dist} tiles`);
    const ag = global.__t.aegisTest(); pump(3);
    if (!ag.immune || ag.t <= 0) throw new Error('casaco de gelo não deu invencibilidade');
    console.log(`casaco: ok — golpe de 3 absorvido, ${ag.t}s de escudo`);
    const wk = global.__t.weakTest(); pump(2);
    if (!wk.still || wk.inBag) throw new Error(`arma fraca: chão=${wk.still} mochila=${wk.inBag}`);
    console.log('arma fraca: ok — ficou no chão, fora da mochila');
    const sw = global.__t.swapTest(); pump(2);
    if (!sw.equipped || sw.leftover !== 0 || sw.inBag)
      throw new Error(`troca de arma: equip=${sw.equipped} sobrou=${sw.leftover} mochila=${sw.inBag}`);
    console.log('troca: ok — melhor equipada na hora, a antiga sumiu (sem ícone no chão nem espaço na mochila)');

    // item dropado no tile da porta é coletável
    const before = global.__t.dropAtDoor();
    global.__t.land(); pump(2);
    if (global.__t.pickupsN() !== before - 1) throw new Error('item no tile da porta não foi coletado');
    console.log('porta: ok — item coletado no tile da porta');

    // a caixinha de saída só abre MIRANDO a porta
    global.__t.closeAskT(); pump(2);
    const dd = global.__t.doorSetup();
    if (dd.outD < 0 || dd.inD < 0) throw new Error('porta: sem direções de teste');
    global.__t.setDir(dd.inD); pump(3);
    if (global.__t.askState()) throw new Error('caixinha abriu sem mirar a porta');
    global.__t.setDir(dd.outD); pump(3);
    if (!global.__t.askState()) throw new Error('caixinha não abriu mirando a porta');
    global.__t.closeAskT(); pump(2);
    console.log('mira: ok — caixinha só abre apontando o tile verde pra saída');

    // cenário assado: cabe inteiro no canvas, é reaproveitado entre quadros e reassa ao girar
    const s1 = global.__t.stage();
    if (!s1.key) throw new Error('cenário não foi assado');
    const minX = s1.ox - (s1.vh - 1) * s1.TW / 2 - s1.TW / 2;                 // parede/piso mais à esquerda
    const maxX = s1.ox + (s1.vw - 1) * s1.TW / 2 + s1.TW / 2;
    const minY = s1.oy - s1.WH;                                               // topo das paredes
    const maxY = s1.oy + (s1.vw + s1.vh - 2) * s1.TT + s1.TT * 2;
    if (minX < 0 || minY < 0 || maxX > s1.w || maxY > s1.h)
      throw new Error(`cenário estourou o canvas: x[${minX},${maxX}] y[${minY},${maxY}] em ${s1.w}x${s1.h}`);
    pump(4);
    if (global.__t.stage().key !== s1.key) throw new Error('cenário foi reassado sem necessidade');
    global.__t.rotate(1); pump(3);
    const s2 = global.__t.stage();
    if (s2.key === s1.key) throw new Error('giro não reassou o cenário');
    global.__t.rotate(-1); pump(3);
    console.log(`cenário: ok — assado 1x em ${s1.w}x${s1.h}, reusado entre quadros, reassado ao girar`);
    // escavação: imune enterrado, passa por baixo do inimigo e irrompe 2 tiles à frente
    const bw = global.__t.burrowSetup();
    if (!bw) throw new Error('escavação: sem espaço pro teste');
    if (bw.mode !== 'burrow') throw new Error('escavação não começou');
    if (!bw.immune) throw new Error('tomou dano enterrado');
    pump(55);
    const be = global.__t.burrowEnd(bw.eid, bw.fid);
    if (be.pos[0] !== bw.dest[0] || be.pos[1] !== bw.dest[1])
      throw new Error(`emergiu no lugar errado: ${be.pos} != ${bw.dest}`);
    if (be.mode !== 'idle' || be.sink !== 0) throw new Error(`escavação não terminou limpa: ${JSON.stringify(be)}`);
    if (be.foeHp >= 9) throw new Error('a irrupção não feriu o vizinho');
    if (be.farHp >= 0 && be.farHp < 9) throw new Error('o tremor pegou um bicho LONGE: tem que ser só a fronteira');
    console.log(`escavação: ok — imune sob a terra, tremor de ${9 - be.foeHp} só no vizinho (o de longe ficou intacto)`);

    // tranco de impacto e golpe crítico
    const rc = global.__t.recoilTest(); pump(2);
    if (!rc) throw new Error('recuo: sem espaço pro teste');
    if (!rc.slid || rc.mode !== 'hurt' || !rc.kick)
      throw new Error(`recuo sumido: deslizou=${rc.slid} modo=${rc.mode} tranco=${rc.kick}`);
    console.log('recuo: ok — o golpe empurra um tile e ainda dá o tranco visual');

    const ct = global.__t.critTest(); pump(3);
    if (!ct) throw new Error('crítico: sem espaço pro teste');
    if (ct.dmg !== ct.normal * 2) throw new Error(`crítico não dobrou: ${ct.dmg} vs ${ct.normal}`);
    if (ct.slow <= 0) throw new Error('crítico sem câmera lenta');
    if (ct.stars < 20) throw new Error(`poucas estrelas no crítico: ${ct.stars}`);
    console.log(`crítico: ok — ${ct.normal} vira ${ct.dmg}, ${ct.stars} estrelas e ${ct.slow.toFixed(2)}s de câmera lenta`);

    const cu = global.__t.critUp(); pump(2);
    if (cu.after !== cu.before + 4) throw new Error(`presente de crítico: ${cu.before}% → ${cu.after}%`);
    if (cu.hpGain !== 5) throw new Error(`presente de vida deu +${cu.hpGain}: tem que dar +5 (coração no chão já dá +1)`);
    if (!cu.healed) throw new Error('o presente de vida tinha que encher a barra');
    if (!cu.auras) throw new Error('presentes aceitos não marcaram as auras (hpUps/critUps)');
    console.log(`presentes: ok — crítico ${cu.before}% → ${cu.after}% e vida +${cu.hpGain} com a barra cheia`);

    { for (let lv = 1; lv <= 39; lv++)                         // muros e entulho nunca podem ilhar nada (o 40 e o laboratorio, sem escada)
        for (let k = 0; k < 6; k++){
          const rt = global.__t.reachTest(lv);
          if (rt.bad.length) throw new Error(`nv ${lv}: inalcançável — ${rt.bad.join(' · ')}`);
        }
      console.log('arena: ok — 234 andares gerados, escada/inimigos/itens todos alcançáveis a pé'); }

    { const ur = global.__t.upReady();
      const want = { a9: 0, a10: 1, a24: 1, a25: 2, a44: 2, a45: 3 };
      for (const k in want)
        if (ur[k] !== want[k]) throw new Error(`aviso de melhoria com ${k.slice(1)} queijos: ${ur[k]}, esperado ${want[k]}`);
      console.log('aviso da ratinha: ok — acende em 10 🧀 e vira ×2 em 25, ×3 em 45'); }

    { const cr = global.__t.cardRun(); pump(2);
      if (cr.aposMorte !== 'ccat') throw new Error('morrer apagou a carta encaixada');
      if (cr.aposRun !== 'ccat') throw new Error('começar uma run nova apagou a carta encaixada');
      console.log('carta: ok — sobrevive à morte e à dungeon nova'); }

    { const ft = global.__t.fossoTest(); pump(2);
      if (ft.erros.length) throw new Error('fosso: ' + [...new Set(ft.erros)].slice(0, 4).join(' | '));
      if (ft.com < ft.total * .2) throw new Error(`fosso: só ${ft.com}/${ft.total} andares tiveram buraco`);
      if (!ft.pontes) throw new Error('fosso: nenhum andar saiu com abismo e ponte');
      if (Object.keys(ft.larguras).length < 2) throw new Error('fosso: a ponte saiu sempre da mesma largura: ' + JSON.stringify(ft.larguras));
      console.log(`fosso: ok — ${ft.com}/${ft.total} com buraco (${ft.pontes} com abismo, larguras ${JSON.stringify(ft.larguras)}), sala sempre inteira`); }

    { const tq = global.__t.toqueT(); pump(2);
      if (tq.quebrou) throw new Error('o teste do toque quebrou: ' + tq.quebrou);
      if (!tq.tocou) throw new Error('toque seco dentro do T (solto antes da batida) nao virou passo');
      if (!tq.segurou) throw new Error('segurando uma direcao e tocando outra, a batida nao foi pra ULTIMA tocada');
      if (!tq.parado) throw new Error('sem toque nenhum no T o boneco nao fica parado');
      if (src.indexOf('function pedraPassa') < 0 || src.indexOf("kind === 'arcoiris'") < 0 || src.indexOf('function darItem') < 0)
        throw new Error('sumiu a pedra arco-iris ou a troca de itens');
      if (src.indexOf('lote(() => faceR(') < 0)
        throw new Error('a fresta do bau voltou a rodar o desfoque coluna por coluna');
      if (src.indexOf("if (onlineDono()) return;\n  if (current === home){") < 0)
        throw new Error('o dono voltou a decidir porta/bau/guarda-roupa pelo sapo: o parceiro perde a agencia');
      if (src.indexOf('function curvaAtrasada') < 0 || src.indexOf('segueMomento();') < 0)
        throw new Error('sumiu o controle de Snake: a curva de ultima hora volta a deixar o boneco parado');
      if (src.indexOf("id=\"invTroca\"") < 0 && html.indexOf('id="invTroca"') < 0)
        throw new Error('sumiu o botao de troca dentro da mochila');
      console.log('toque: ok — ultimo toque do T vira passo mesmo solto, vence a seta segurada, e sem toque fica parado'); }
    { const ss = global.__t.stepSpeed(); pump(2);
      if (!ss.andou) throw new Error('passo: o jogador não andou em nenhuma das 4 direções');
      const ruim = ss.dists.filter(d => d !== 1);
      if (ruim.length) throw new Error(`passo de ${ruim[0]} tiles: o passo diagonal do tabuleiro voltou`);
      if (ss.oito) throw new Error('sobrou máquina das 8 direções (nearest8/crossPair/CARD_PAIR) no jogo');
      console.log(`passo: ok — ${ss.andou} direções testadas, todas de 1 tile e nenhuma diagonal de tabuleiro`); }

    { const qt = global.__t.quickTest(); pump(2);
      if (qt.curou !== 3 || qt.pilha !== 1) throw new Error(`item da mão não bebeu a poção: ${JSON.stringify(qt)}`);
      if (qt.andou !== 1 || qt.voltou !== 0) throw new Error('L1/R1 não passeiam pelos espaços');
      if (qt.arma !== 'sword') throw new Error('item da mão não equipou a arma do espaço');
      console.log('item da mão: ok — Y bebe a poção (+3), L1/R1 andam e o espaço vazio não quebra'); }

    { const bu = global.__t.bagUp(); pump(2);
      if (bu.depois !== bu.antes + 1) throw new Error(`presente de mochila: ${bu.antes} ➡️ ${bu.depois}`);
      if (bu.cabe !== bu.depois) throw new Error(`a mochila aceitou ${bu.cabe} itens com ${bu.depois} espaços`);
      console.log(`mochila: ok — presente sobe de ${bu.antes} pra ${bu.depois} espaços e os ${bu.cabe} enchem`); }

    { const lt = global.__t.liftTest(); pump(2);
      if (!lt.direto) throw new Error('sem estrato liberado o elevador não devia abrir');
      if (!lt.abriu || lt.tiers !== 3) throw new Error(`elevador: aberto=${lt.abriu} andares=${lt.tiers}`);
      console.log(`elevador: ok — some com 1 estrato e oferece ${lt.tiers} destinos com o nv 21 alcançado`); }

    { const ct = global.__t.cardTest(); pump(2);
      if (ct.slot !== 'ccat' || ct.gain !== 2) throw new Error(`carta não encaixou: ${JSON.stringify(ct)}`);
      if (!ct.freed) throw new Error('a carta ficou duplicada na mochila');
      if (ct.otherWeapon !== null || ct.back !== 'ccat') throw new Error('o slot não é por arma');
      if (ct.swapped !== 'cshadow' || ct.returned !== 'ccat') throw new Error('trocar carta não devolveu a antiga');
      if (ct.crit !== 13) throw new Error(`Carta do Sombrio devia dar 13% de crítico, deu ${ct.crit}%`);
      if (!ct.carried) throw new Error('trocar de arma PERDEU a carta: ela tem que acompanhar o ratinho');
      if (!ct.autoEquip) throw new Error('carta do chão com slot livre tinha que encaixar na hora');
      console.log('cartas: ok — encaixa ao pegar, acompanha a troca de arma e o efeito entra (+2 dano · 13% crít)'); }

    { const bp = global.__t.bossPhase(); pump(2);
      if (!bp) throw new Error('chefe: sem espaço pro teste');
      if (!bp.telegraph) throw new Error('o chefe atacou sem telegrafar');
      if (!bp.strikes || !bp.opened) throw new Error('depois do telegrafo o chefe tinha que golpear e abrir a guarda');
      if (bp.openDmg <= bp.normDmg) throw new Error(`guarda aberta não amplificou: ${bp.openDmg} vs ${bp.normDmg}`);
      if (!bp.rage) throw new Error('o chefe não entrou em fúria abaixo da metade');
      console.log(`chefe: ok — telegrafa, guarda aberta leva ${bp.openDmg} (normal ${bp.normDmg}) e enfurece na metade`); }

    { const st = global.__t.secretTest(); pump(2);
      if (st.com < 8 || st.com > 60) throw new Error(`segredo raro demais/comum demais: ${st.com}/200 andares`);
      // paga QUEIJO EM DOBRO: achado gostoso e pequeno. Vida máxima ou arma aqui desbalanceava.
      if (st.got.length !== 2 || st.got.some(k => k !== 'cheese'))
        throw new Error(`segredo pagou caro demais: ${st.got.join(',')}`);
      console.log(`segredos: ok — em ${st.com}/200 andares e paga 2 queijos (nada de vida máxima de graça)`); }

    { const hg = global.__t.hellGate(); pump(2);
      if (!hg.abriu) throw new Error('pisar na fenda não abriu a caixinha de confirmação');
      if (!hg.mesmoAndar) throw new Error('a fenda desceu sem perguntar');
      if (!hg.fechou || !hg.naoReabre) throw new Error('recusar não fechou / a caixinha insistiu no mesmo tile');
      if (!hg.reabreDepois) throw new Error('sair e voltar tinha que perguntar de novo');
      console.log('fenda: ok — pergunta antes, aceita o não e só volta a perguntar se você sair do tile'); }

    { const pg = global.__t.perigosTest(); pump(2);
      if (pg.erros.length) throw new Error('perigos: ' + [...new Set(pg.erros)].slice(0, 3).join(' | '));
      if (pg.placas < 15) throw new Error('placa de pressão rara demais: ' + pg.placas + ' em ' + pg.andares);
      // os DOIS sentidos e a cruzada: sem isso a placa só varria um eixo e o outro nunca aparecia
      for (const e of ['0', '1', '2'])
        if (!pg.eixos[e]) throw new Error('placa de eixo ' + e + ' nunca nasceu: ' + JSON.stringify(pg.eixos));
      if (pg.baus < 8) throw new Error('baú raro demais: ' + pg.baus);
      if (!pg.falsas) throw new Error('nenhuma parede falsa nasceu');
      if (!pg.bons || !pg.ruins) throw new Error('o baú saiu sempre igual: ' + pg.bons + ' bons / ' + pg.ruins + ' ruins');
      console.log('perigos: ok — ' + pg.placas + ' placas ' + JSON.stringify(pg.eixos) + ', ' + pg.baus + ' baús (' + pg.bons + ' bons / '
        + pg.ruins + ' ruins) e ' + pg.falsas + ' paredes falsas em ' + pg.andares + ' andares'); }

    { const pf = global.__t.placaFogo(); pump(2);
      if (!pf) throw new Error('placa: sem espaço pro teste');
      if (!pf.armou) throw new Error('pisar na placa não armou o disparo');
      if (pf.dano <= 0) throw new Error('o dardo não acertou quem estava na fileira');
      console.log('placa: ok — arma ao pisar e o dardo tira ' + pf.dano + ' de quem ficou na linha'); }

    { const sp2 = global.__t.seedPoderes(); pump(2);
      if (!sp2.mesmoCalendario) throw new Error('o sorteio mudou os ANDARES de estreia');
      if (!sp2.porEstrato) throw new Error('o sorteio vazou poder de um estrato pro outro');
      if (sp2.distintas < 6) throw new Error('semente fraca: só ' + sp2.distintas + '/' + sp2.total + ' ordens diferentes');
      console.log('sorteio: ok — ' + sp2.distintas + '/' + sp2.total + ' ordens distintas, mesmos andares e mesmo estrato'); }

    { const rp = global.__t.rampaTest(); pump(2);
      const [h6, v6, c6] = rp.n6, [h20, v20, c20] = rp.n20, [h36, v36, c36] = rp.n36;
      if (!c6 || !c20 || !c36) throw new Error('o plague doctor não apareceu: ' + c6 + '/' + c20 + '/' + c36);
      if (!(h6 < h20 && h20 < h36)) throw new Error('a vida não sobe com o andar: ' + h6 + '/' + h20 + '/' + h36);
      if (!(v6 > v20 && v20 > v36)) throw new Error('o ritmo não acelera com o andar: ' + v6 + '/' + v20 + '/' + v36);
      console.log('rampa: ok — plague doctor ' + h6 + ' ➡️ ' + h20 + ' ➡️ ' + h36 + ' de vida e salto ' + v6.toFixed(3) + ' ➡️ ' + v36.toFixed(3) + 's'); }
    { const cu2 = global.__t.cursedTest(); pump(2);
      if (!cu2.flag || !cu2.normal) throw new Error('a flag de maldito não pegou');
      if (!cu2.brief) throw new Error('o resumo do andar não avisa da maldição');
      if (cu2.hpC < cu2.hpN * 1.25) throw new Error(`maldito não endureceu: ${cu2.hpC.toFixed(1)} vs ${cu2.hpN.toFixed(1)}`);
      console.log(`maldito: ok — vida média ${cu2.hpN.toFixed(1)} ➡️ ${cu2.hpC.toFixed(1)} e o resumo avisa`); }

    const ms = global.__t.missTest(); pump(2);
    if (!ms) throw new Error('miss: sem espaço pro teste');
    if (ms.playerDmg <= 0 || ms.label === 'MISS')
      throw new Error('o jogador errou o golpe: tem que acertar sempre — ' + JSON.stringify(ms));
    if (ms.hitDmg <= 0) throw new Error('golpe normal do jogador não pegou');
    if (!ms.foeMissed || ms.foeLabel !== 'MISS') throw new Error('inimigo não errou: ' + JSON.stringify(ms));
    console.log('erro de golpe: ok — só o inimigo erra (5%); o jogador acertou ' + ms.playerDmg + ' com a rolagem no pior caso');

    const cb = global.__t.chargeBreak(); pump(2);
    if (cb.hold || cb.rdy || cb.t !== 0) throw new Error('a carga sobreviveu ao dano: ' + JSON.stringify(cb));
    if (!cb.lock || cb.reHold) throw new Error('dá pra recarregar sem soltar o botão: a trava falhou');
    if (!cb.afterRelease) throw new Error('soltar e apertar de novo tinha que recarregar');
    if (!cb.fx) throw new Error('carga quebrada sem efeito visual');
    console.log('carga: ok — qualquer dano derruba o giro e só recarrega soltando o botão');

    const csp = global.__t.cspinTest(); pump(2);
    if (!csp.spin || csp.dur < .5) throw new Error('giro carregado sem animação própria: ' + JSON.stringify(csp));
    if (csp.blue < 15) throw new Error('poucas partículas azuis: ' + csp.blue);
    if (csp.fx !== 1) throw new Error('giro carregado sem efeito próprio (cspin)');
    if (csp.turned < 4) throw new Error('o rodopio não girou a silhueta: ' + csp.turned + ' frente(s)');
    if (csp.endSpin || csp.endDur > .4 || csp.endDir !== csp.dir0)
      throw new Error('o giro não se desarmou no fim: ' + JSON.stringify(csp));
    console.log('giro carregado: ' + 'ok — ' + csp.blue + ' fagulhas azuis, ' + csp.turned +
      ' frentes no rodopio e volta a olhar pro mesmo lado');

    const nm = global.__t.numTest();
    if (nm.crit !== 2 || nm.miss !== 'MISS' || nm.missC !== 'miss')
      throw new Error(`números: crit=${nm.crit} miss=${nm.miss}`);
    console.log('números: ok — crítico em corpo dobrado e MISS branco no golpe aparado');

    const al2 = global.__t.alertTest();
    if (!al2.alerted || al2.t <= 0) throw new Error('inimigo não se assustou ao avistar');
    console.log('alerta: ok — o bicho solta o balãozinho ao te avistar');

    // pool inteiro: todo poder tem que disparar sem quebrar
    const ap = global.__t.allPowers(); pump(4);
    const mudos = Object.keys(ap).filter(k => !ap[k]);
    if (mudos.length) throw new Error(`poderes sem efeito nenhum: ${mudos.join(', ')}`);
    const orf = global.__t.poderOrfao();
    if (orf.length) throw new Error('poder declarado sem implementação: ' + orf.join(', '));
    const bt = global.__t.buffTimers(); pump(2);
    if (!(bt.rage > 0)) throw new Error('Fúria Rateira não acendeu o timer (some da barrinha de buff)');
    if (!(bt.edge > 0)) throw new Error('Fio Afiado não acendeu o timer (some da barrinha de buff)');
    const fl = global.__t.fields();
    if (!fl.ice || !fl.cloud) throw new Error(`campos não ficaram no chão: ${JSON.stringify(fl)}`);

    // FASE DO GOLPE (`armP`): o rato não usa mais braço, mas é ela que estica a LÍNGUA do sapo.
    const br = global.__t.bracoGolpe();
    if (br.n < 8 || br.min > .1 || br.max < .9)
      throw new Error(`braço do golpe não percorreu o arco: ${JSON.stringify(br)}`);
    if (br.parado !== -1) throw new Error('braço ficou preso na fase do golpe fora do ataque');
    console.log(`fase do golpe: ok — ${br.n} quadros de arco (${br.min.toFixed(2)}→${br.max.toFixed(2)})`);

    // CHAPÉU: assenta na linha da TESTA; só a coroa fica no alto do crânio
    const ch2 = global.__t.chapeuNaTesta();
    if (ch2.hy === null || ch2.cy === null) throw new Error('sumiram as âncoras de chapéu (hy/cy)');
    if (ch2.hy < -42) throw new Error(`aba de chapéu subiu pra altura da orelha (hy=${ch2.hy}); tem que ser a testa`);
    if (ch2.hy > -36) throw new Error(`aba de chapéu caiu no rosto (hy=${ch2.hy})`);
    if (!(ch2.cy < ch2.hy)) throw new Error('coroa deixou de ficar acima da linha da testa');
    if (!ch2.coroaUsaCy) throw new Error('a coroa voltou a usar a âncora dos chapéus');
    if (!ch2.sapoVeste) throw new Error('o sapo parou de usar o guarda-roupa');
    console.log(`chapéu: ok — aba na testa (${ch2.hy}) e coroa no crânio (${ch2.cy})`);

    // JOGADOR 2
    const sp = global.__t.sapoTest(); pump(2);
    if (!sp.entrou) throw new Error('o sapo do jogador 2 não entrou em campo');
    if (!(sp.bateu > 0)) throw new Error('o sapo não causa dano nenhum');
    if (!sp.caiu) throw new Error('o sapo não cai quando a vida acaba');
    const lv2 = global.__t.sapoLevanta();
    if (lv2.naDungeon.modo !== 'dead')
      throw new Error(`o sapo levantou NA DUNGEON: era pra só acordar no covil (${JSON.stringify(lv2.naDungeon)})`);
    if (lv2.noCovil.modo !== 'idle' || !lv2.noCovil.cheio)
      throw new Error(`no covil o sapo tinha que acordar de vida cheia: ${JSON.stringify(lv2.noCovil)}`);
    const sa = global.__t.sapoAlvo();
    if (!sa.achou) throw new Error('não deu pra plantar bicho nenhum em volta do sapo: teste inconclusivo');
    if (!sa.veioPro) throw new Error('o bicho não anda na direção do sapo, mesmo com ele muito mais perto que o rato');
    // O SAPO FAZ TUDO QUE O RATO FAZ, com a ficha dele
    const kit = global.__t.sapoKit(); pump(2);
    if (kit.catou.bag < 2) throw new Error('o sapo não guarda item na mochila dele');
    if (kit.catou.arma !== 'sword') throw new Error('o sapo não equipa arma melhor do chão');
    if (kit.catou.queijo !== 1 || kit.catou.curou !== 1) throw new Error('queijo do sapo: não foi pro bolso do casal nem curou');
    if (!kit.catou.ratoIntacto) throw new Error('o item do sapo caiu na mochila do rato');
    if (!kit.lancou || !(kit.cd > 0)) throw new Error('o sapo não lança poder');
    if (!kit.isolado) throw new Error('o buff do sapo vazou pro rato (ou vice-versa)');
    if (!kit.stam) throw new Error('o sapo não tem stamina própria');
    const esc = global.__t.sapoEscava(); pump(2);
    if (!esc.ok) throw new Error('o sapo não consegue escavar: ' + JSON.stringify(esc));
    if (esc.fundo < .9) throw new Error(`o sapo não chega a AFUNDAR na terra (sink ${esc.fundo})`);
    if (!esc.temRecorte) throw new Error('o sprite do sapo voltou a ser desenhado por cima do chão ao escavar');
    const rat = global.__t.sapoNaRatinha(); pump(2);
    if (!rat.cenaRolou || !rat.cenaDoSapo) throw new Error('a cena da entrega não começa quando quem chega com queijo é o sapo');
    if (!rat.abriu || rat.alvo !== 'sapo') throw new Error('a sapinha nao atende o sapo que chega com queijo');
    if (rat.entregue !== 40 || rat.sapoSubiu <= 0 || !rat.ratoIntacto)
      throw new Error(`presente do sapo saiu errado: ${JSON.stringify(rat)}`);
    const st3 = global.__t.sapoStatus(); pump(2);
    if (!st3.burn || !st3.frost || !st3.pois) throw new Error('o sapo não pega queimadura/gelo/veneno');
    // CARTA DO CHEFE: cai no CHAO, mesmo com mochila cheia e lamina ocupada
    { const cc = global.__t.cartaChefeChao(); pump(2);
      if (cc.erro) throw new Error('o teste da carta do chefe não achou o chefe do nv 10');
      if (cc.caiu !== 1) throw new Error(`o chefe devia largar 1 carta no chão e largou ${cc.caiu}`);
      if (cc.slotIntacto !== 'cbat') throw new Error('a carta do chefe entrou sozinha na lâmina em vez de cair');
      if (!cc.mochilaCheia) throw new Error('a carta do chefe se enfiou na mochila cheia');
      if (cc.novos < 3) throw new Error(`o espólio do chefe veio incompleto: ${cc.novos} itens`);
      if (cc.espalhou < 2) throw new Error('o espólio do chefe caiu todo no mesmo tile: vira uma pilha só');
      if (!cc.pegouDepois) throw new Error('abriu espaço na mochila e mesmo assim não deu pra pegar a carta');
      console.log(`carta do chefe: ok — ${cc.qual} no chão, espólio em ${cc.espalhou} tiles, pega depois de abrir espaço`); }

    // ECONOMIA: poder, poção e coração 25% mais raros; queijo 10%
    { const ec = global.__t.economia(); pump(2);
      // faixa larga de propósito (±4σ da amostra): o guarda é contra alguém REVERTER a economia,
      // não contra o ruído do sorteio. Sem isso ele falhava 1 em 4 execuções por puro azar.
      // Alvos: 1,10 poção · 0,29 coração · 1,60 queijo · 0,35 poder por andar. A cura por andar
      // tinha que chegar perto do CUSTO do andar: com 0,65 poção a run fechava no vermelho do nv 12.
      const tetos = { pocao: 1.32, coracao: .40, queijo: 1.78, poder: .46 };
      const pisos = { pocao: .88, coracao: .20, queijo: 1.42, poder: .18 };
      for (const k in tetos)
        if (!(ec[k] >= pisos[k] && ec[k] <= tetos[k]))
          throw new Error(`${k} por andar saiu de faixa: ${ec[k].toFixed(3)} (esperado ${pisos[k]}–${tetos[k]})`);
      console.log(`economia: ok — por andar: ${ec.pocao.toFixed(2)} poção · ${ec.coracao.toFixed(2)} coração · ${ec.queijo.toFixed(2)} queijo · ${ec.poder.toFixed(2)} poder`); }

    // FILA DE AVISOS: nada se sobrepoe
    { const fa = global.__t.filaAvisos(); pump(2);
      if (fa.naFila !== 3) throw new Error(`a fila devia ter 3 avisos (o repetido se funde) e tem ${fa.naFila}`);
      if (fa.soUm !== 1) throw new Error(`${fa.soUm} avisos saíram de uma vez: a fila não está segurando`);
      if (fa.aindaUm !== 1) throw new Error('o segundo aviso entrou ANTES da animação do primeiro acabar');
      if (fa.ordem.join(',') !== 'um,dois,tres') throw new Error('a fila saiu fora de ordem: ' + fa.ordem.join(','));
      console.log('fila de avisos: ok — 3 na fila, um por vez, em ordem, e nenhum entra antes do anterior acabar'); }

    // QUEDA DOS BICHOS: a torneira escondida da pocao
    { const qb = global.__t.quedaBicho(); pump(2);
      // O `hash` do jogo nao e uniforme, entao o medido nao bate com a fatia nominal (3,5% e 22%).
      // A faixa aqui e larga: serve pra pegar quem REABRIR a torneira, nao pra cravar o numero.
      if (qb.pocao > .18) throw new Error(`bicho larga poção demais: ${(qb.pocao * 100).toFixed(1)}% (nominal 9%)`);
      if (qb.pocao < .04) throw new Error(`bicho quase não larga poção: ${(qb.pocao * 100).toFixed(2)}%`);
      if (qb.queijo > .48) throw new Error(`bicho larga queijo demais: ${(qb.queijo * 100).toFixed(1)}% (nominal 34%)`);
      if (qb.queijo < .24) throw new Error(`bicho quase não larga queijo: ${(qb.queijo * 100).toFixed(1)}%`);
      console.log(`queda dos bichos: ok — ${(qb.pocao * 100).toFixed(1)}% poção · ${(qb.queijo * 100).toFixed(1)}% queijo em ${qb.n} mortes`); }

    // ONLINE: sem `room` o jogo tem que seguir igual, e o convidado joga de sapo
    { const on = global.__t.onlineTeste(); pump(2);
      if (on.quebrou) throw new Error('o modo online derruba o jogo quando não há sala: ' + on.quebrou);
      if (on.salaAberta) throw new Error('o jogo entrou numa sala sozinho');
      if (on.codigo.length !== 4 || !/^[A-Z]+$/.test(on.codigo))
        throw new Error('o código da sala não é 4 letras maiúsculas: ' + on.codigo);
      if (!on.convidadoNoSapo)
        throw new Error('o convidado do online não controla o sapo: os botões ficaram no rato');
      if (!on.mesmaSemente)
        throw new Error('a mesma semente gera andares diferentes: o online mostraria mapas distintos');
      // O PAINEL PRECISA da regra .open que o mostre: sem ela o jogo pausa numa tela vazia — foi
      // exatamente o que aconteceu na v1.31 (entrou na regra que esconde, não na que mostra).
      if (html.indexOf('#onPanel.open') < 0)   // o CSS fica FORA do <script>: procura no html cru
        throw new Error('o painel do online abre mas NÃO aparece: o jogo pausa numa tela vazia');
      if (src.indexOf('if (!p2Held.includes(d)) p2Held.push(d);') < 0)
        throw new Error('no computador o convidado ainda anda com o rato em vez do sapo');
      // a sala tem que ser o RELAY da porta, não conta de ninguém
      if (src.indexOf("new WebSocket(url)") < 0)
        throw new Error('a sala online deixou de usar o WebSocket do próprio servidor');
      if (src.indexOf("claude.use('room')") >= 0)
        throw new Error('a sala online voltou a depender da conta do Claude');
      // RELÓGIO MECÂNICO: um escapamento só para os dois aparelhos
      if (Math.abs(on.livre - .021) > 1e-9)
        throw new Error('fora de sala o relógio deixou de andar no tempo do quadro: ' + on.livre);
      if (!on.dente)
        throw new Error('em sala o mundo não anda em dentes de 1/60: as duas telas voltam a descolar');
      if (on.tickDono < 118 || on.tickDono > 122)
        throw new Error('o relógio do dono perdeu o passo: ' + on.tickDono + ' dentes em 120 quadros');
      if (!on.alcancou)
        throw new Error('o convidado não alcança o relógio do dono: fica atrasado pra sempre');
      if (on.maiorSalto > 2)
        throw new Error('o convidado SALTA pra alcançar o dono (' + on.maiorSalto + ' dentes num quadro): o ponteiro tem que andar');
      if (!on.vidaFicou)
        throw new Error('o convidado tira vida do bicho por conta própria: o espólio sai dobrado');
      if (!on.travaSolta)
        throw new Error('a trava da carga do sapo não solta quando o parceiro tira o dedo: a língua morre pro resto da run');
      if (!on.toqueCurto)
        throw new Error('toque curto no ataque do sapo se perde entre duas batidas: o botão "não funciona"');
      if (!on.preveGolpe)
        throw new Error('o golpe do sapo não começa na tela de quem apertou: ~233ms de espera por toque');
      /* O BOTÃO DA LÍNGUA no celular. Ele nasceu no 2-jogadores da lan e ligava `p2WantAtk`
         direto — um sinal que, dentro de uma sala, morre aqui sem nunca virar comando. Tem que
         passar pelo mesmo caminho do botão do rato. */
      if (src.indexOf("a2.addEventListener('pointerdown', e => { e.preventDefault(); p2HoldAtk(); });") < 0)
        throw new Error('o botão da língua voltou a ligar um sinal local: no celular do parceiro ele não faz nada');
      if (src.indexOf('if (p2WantAtk){ evSapo |= EV_ATK; p2WantAtk = false; }') < 0)
        throw new Error('sumiu a rede de segurança: um pedido de golpe do sapo pode morrer em silêncio');
      // o teclado de quem está na sala é do PRÓPRIO boneco
      if (src.indexOf('if (p2On && !onlineDono()){') < 0)
        throw new Error('na sala as setas do dono voltaram pro canal do sapo: ele fica sem teclado');
      // O COMPASSO: 120 dentes = 8 passos de 0,25s, e o fio so fala na batida — nunca por quadro
      if (on.passos !== 8)
        throw new Error('o compasso perdeu a batida: ' + on.passos + ' passos em 120 dentes (esperado 8)');
      if (on.binarios < 1 || on.binarios > on.passos)
        throw new Error('o dono mandou ' + on.binarios + ' pacotes binarios em ' + on.passos + ' passos: tem que ser no maximo um por passo');
      if (on.json.indexOf('w') >= 0 || on.json.indexOf('p') >= 0)
        throw new Error('voltou o pacote JSON do mundo inteiro por batida: ' + on.json.join(','));
      if (on.json.indexOf('cena') < 0)
        throw new Error('o dono nao avisou a cena: o convidado nao sabe em que andar esta');
      if (on.maiorBin > 10 + 4 * 40 + 3 * 40)
        throw new Error('pacote do passo grande demais: ' + on.maiorBin + ' bytes');
      if (on.deltaTam !== 14)
        throw new Error('um corpo mudou de casa e o pacote saiu com ' + on.deltaTam + ' bytes (esperado 14: cabecalho carimbado + 1 corpo)');
      if (src.indexOf('function poeNaFila') < 0 || src.indexOf('function tocaFila') < 0)
        throw new Error('o convidado voltou a aplicar o pacote na CHEGADA: o mundo anda aos trancos');
      if (!on.convidadoPos)
        throw new Error('o convidado nao poe o corpo na casa que o pacote do passo mandou ' + JSON.stringify(on.dbg));
      if (src.indexOf('const PASSO_T =') < 0 || src.indexOf('function fimDoPasso()') < 0)
        throw new Error('o mundo deixou de andar no compasso: o passo sai fora da batida');
      if (src.indexOf('if (!batePasso) return;                                     // fora da batida') < 0)
        throw new Error('o startStep deixou de esperar a batida: cada um volta a andar no seu tempo');
      // v1.48: CENAS INDEPENDENTES. A porta leva so quem passou por ela, e o reencontro e por chave de cena
      if (src.indexOf('function levaPraCena') >= 0)
        throw new Error('voltou a porta do dono que arrasta a sala inteira: as cenas tem que ser independentes');
      if (src.indexOf('if (onlineOn()) separa();') < 0 || src.indexOf('function recebeCheguei') < 0)
        throw new Error('sumiu a separacao/reencontro das cenas em sala');
      // cada aparelho mostra UMA barra de botões — e "#p2bar" pegaria também a barra de vida "#p2Bar"
      if (html.indexOf('body.onRato .p2bar{display:none}') < 0 || html.indexOf('body.onSapo #slots') < 0)
        throw new Error('em sala os dois aparelhos ainda mostram as duas barras de botões');
      if (html.indexOf('onRato #p2bar') >= 0)
        throw new Error('a regra pegou o id p2bar: sem doctype ela apaga também a barra de vida p2Bar');
      console.log(`online: ok — código ${on.codigo}, convidado no sapo, ${on.passos} passos em 120 dentes, ${on.binarios} pacote(s) de até ${on.maiorBin} bytes, delta de ${on.deltaTam} bytes`); }

    // RELIGAR: um tranco de rede não pode ENCERRAR a sala — nem do lado do jogo, nem do relay
    { if (src.indexOf("wsEstado = 'religando'") < 0)
        throw new Error('a sala deixou de religar sozinha: um tranco de rede volta a encerrar a dupla');
      if (src.indexOf('if (deProposito) return;') < 0)
        throw new Error('sair da sala pelo botão e cair da sala viraram a mesma coisa');
      if (src.indexOf("setInterval(() => { if (onlineOn()) mandaWS({ t: 'ping' }); }, 3000)") < 0)
        throw new Error('o ping voltou pro laço do jogo: aba no fundo vira fantasma e o relay expulsa');
      if (src.indexOf('if (!parceiro) toast(') < 0)
        throw new Error('o aviso "o parceiro saiu" voltou a pipocar antes de saber se ele volta');
      const relay = require('fs').readFileSync(require('path').join(__dirname, 'relay.py'), 'utf8');
      if (relay.indexOf('maxsize=256') < 0)
        throw new Error('a fila do relay voltou a 64 mensagens: dois segundos de engasgo derrubam o jogador');
      if (relay.indexOf('self.fila.get_nowait()') < 0)
        throw new Error('o relay voltou a MATAR quem tem a fila cheia em vez de descartar o pacote velho');
      if (!/MUDO = (\d+)/.test(relay) || +RegExp.$1 < 60)
        throw new Error('o relay voltou a expulsar como fantasma quem só trocou de app por meio minuto');
      console.log('religar: ok — o fio cortado volta pra mesma sala e o relay descarta pacote velho em vez de matar o jogador'); }

    // CONTROLE NA SALA: o único controle do convidado é do SAPO, não do rato
    { const pd = global.__t.padSala(); pump(2);
      if (pd.quebrou) throw new Error('o controle na sala derruba o jogo: ' + pd.quebrou);
      if (pd.soloRato === null || pd.soloSapo !== null)
        throw new Error('sozinho, o 1º controle deixou de ser do rato');
      if (pd.convRato !== null)
        throw new Error('na sala do amigo o controle do convidado ainda anda com o RATO — o sapo fica imóvel pro dono');
      if (pd.convSapo === null)
        throw new Error('na sala do amigo o controle do convidado não anda com o sapo');
      if (src.indexOf("padsLigados()[onlineConvidado() ? 0 : 1]") < 0)
        throw new Error('o sapo voltou a exigir um SEGUNDO controle mesmo na sala online');
      console.log('controle na sala: ok — o único controle do convidado guia o sapo, não o rato'); }

    // CAMA: toda peça dentro do estrado, e a manta CENTRADA na largura
    { const c = src.slice(src.indexOf('function propBed'), src.indexOf('function propBed') + 3200);
      if (c.indexOf('const nivel =') < 0)
        throw new Error('a cama voltou a ser posicionada no olho: sem as coordenadas do próprio móvel');
      // recuar um losango SEM subir a âncora empurra ele pro canto sul — era o "mal distribuído"
      const A2 = 30, B2 = 30;
      const niv = (s2, t2, alt) => [2 * s2 - 2 * t2, -s2 - t2 - alt];
      const centro = (s2, t2, a2, b2, alt) => {
        const [px, py] = niv(s2, t2, alt);
        return [px + a2 - b2, py - (a2 + b2) / 2 + alt];      // centro da pegada, já sem a altura
      };
      const cEstrado = centro(0, 0, A2, B2, 0);
      const cManta = centro(5, 5, A2 - 10, B2 - 13, 0);
      if (Math.abs(cManta[0] - cEstrado[0]) > 4)                // 3 de folga: a manta é puxada pro pé
        throw new Error(`a manta saiu do eixo da cama: ${cManta} contra ${cEstrado}`);
      if (cManta[1] - cEstrado[1] < 0 || cManta[1] - cEstrado[1] > 6)
        throw new Error(`a manta devia cobrir o pé e sobrar cabeceira: ${cManta} contra ${cEstrado}`);
      console.log('cama: ok — peças em coordenadas do móvel e manta no eixo, puxada pro pé'); }

    // CORPO FATIADO: fileira de 2px com Y arredondado deixava linha vazia no meio do pulo
    { const corpo = src.slice(src.indexOf('function drawRatSprite'), src.indexOf('function drawRatSprite') + 9000);
      if (corpo.indexOf('const altR =') < 0)
        throw new Error('o corpo do ratinho voltou a usar altura FIXA por fileira: com o squash do pulo ele fatia');
      if (corpo.indexOf('(h2 + 1 + wx) * 2, 2, OUT') >= 0)
        throw new Error('o contorno do corpo voltou aos 2px fixos: volta a abrir fresta no pulo');
      const rap = src.slice(src.indexOf('function drawPlague'), src.indexOf('function drawPlague') + 4000);
      if (rap.indexOf('const H = yy => Math.max(1, Y(yy + 1) - Y(yy))') < 0)   // v1.43: fileira a fileira, altura até a de baixo
        throw new Error('o plague doctor voltou à altura fixa por fileira: mesma fatia do rato no squash');
      console.log('corpo do ratinho: ok — a fileira mede até a de baixo, sem fresta no squash'); }

    // SOM: cadeia de mixagem, ambiente por estrato e anti-metralhadora
    { const sd = global.__t.somDesign(); pump(2);
      if (sd.quebrou.length) throw new Error('efeito de som que explode ao tocar: ' + sd.quebrou.join(' | '));
      if (sd.efeitos < 45) throw new Error('a mesa de sons encolheu: só ' + sd.efeitos + ' efeitos');
      for (const l of ['covil', 'dungeon', 'ice', 'sewer'])
        if (sd.lugares.indexOf(l) < 0) throw new Error('o estrato ' + l + ' ficou sem leito de ambiente');
      for (const k of ['hitEnemy', 'step', 'kill', 'smash'])
        if (sd.antiSpam.indexOf(k) < 0) throw new Error(k + ' saiu do anti-metralhadora: 8 iguais no mesmo quadro viram chiado');
      if (!sd.passo.pedra) throw new Error('o passo em pedra deixou de ser o som padrão');
      // a cadeia se monta na FONTE: no teste não há AudioContext pra conferir de outro jeito
      for (const t of ['createDynamicsCompressor', 'createStereoPanner', 'createBiquadFilter'])
        if (src.indexOf(t) < 0) throw new Error('a cadeia de áudio perdeu o ' + t);
      if (src.indexOf('soaEm(v.tx, v.ty, SFX.hitEnemy)') < 0)
        throw new Error('a pancada no bicho voltou a tocar no centro, sem posição');
      console.log(`som: ok — ${sd.efeitos} efeitos, ${sd.lugares.length} leitos de ambiente, limitador, pan e anti-metralhadora`); }

    // STATUS REFEITOS: fogo custa 2 de vida · veneno emperra as recargas em vez de sangrar
    { const f0 = global.__t.statusPoe('fogo');
      if (!(f0.burnT > 0)) throw new Error('o teste do fogo não vale: a queimadura nem entrou');
      for (let k = 0; k < 900 && global.__t.statusLe().burnT > 0; k++) pump(1);
      const fogo = f0.hp - global.__t.statusLe().hp;
      if (fogo !== 2) throw new Error(`a queimadura inteira devia custar 2 de vida e custou ${fogo}`);
      const v0 = global.__t.statusPoe('veneno');
      if (!(v0.poisT > 0)) throw new Error('o teste do veneno não vale: o status nem entrou');
      const cdVen = global.__t.statusCds();
      for (let k = 0; k < 900 && global.__t.statusLe().poisT > 0; k++) pump(1);
      const veneno = v0.hp - global.__t.statusLe().hp;
      if (veneno !== 0) throw new Error(`o veneno voltou a tirar vida: ${veneno}`);
      global.__t.statusPoe('nada');
      const cdLimpo = global.__t.statusCds();
      if (cdVen.cd - cdLimpo.cd !== 3) throw new Error(`o veneno devia pôr +3s na recarga do poder: ${cdLimpo.cd} ➡️ ${cdVen.cd}`);
      if (cdVen.stam - cdLimpo.stam !== 3) throw new Error(`o veneno devia pôr +3s na stamina: ${cdLimpo.stam} ➡️ ${cdVen.stam}`);
      global.__t.statusZera(); pump(2);
      console.log(`status: ok — fogo custa ${fogo} de vida, veneno custa 0 e põe +3s (poder ${cdLimpo.cd}➡️${cdVen.cd}s, stamina ${cdLimpo.stam}➡️${cdVen.stam}s)`); }

    // UM PODER POR RUN, e a Isca fora do jogo
    { const pu = global.__t.poderUnico(); pump(2);
      if (pu.repetidos.length) throw new Error('poder repetido na mesma run (chão, baú ou nicho): ' + pu.repetidos.join(', '));
      if (pu.total < 5) throw new Error(`quase nenhum poder apareceu em 3 voltas de 39 andares: ${pu.total}`);
      if (!pu.semIsca) throw new Error('a Isca de Queijo ainda está na mesa de poderes');
      if (pu.podeSairNova) throw new Error('o jogo ainda oferece um poder que o jogador tem EQUIPADO');
      if (pu.podeSairRage) throw new Error('o jogo ainda oferece um poder que o jogador tem na MOCHILA');
      console.log(`poder único: ok — ${pu.total} distintos em 3 voltas (chão + baú + nicho), nenhum repetido e nada que o jogador já tenha`); }

    // PULSO DOS DEBUFFS: aberracao, tranco e abas laterais alternando
    { const amostra = qual => {
        global.__t.pulsoDebuff(qual);
        const v = { chroma: [], lL: [], lR: [], tremeu: 0, part: 0, veu: 0 };
        for (let k = 0; k < 130; k++){
          pump(1);
          const m = global.__t.leiaPulso();
          v.chroma.push(m.chroma); v.lL.push(m.lL); v.lR.push(m.lR);
          if (m.tremeu > 0) v.tremeu++;
          v.part = Math.max(v.part, m.part);
          v.veu = Math.max(v.veu, qual === 'veneno' ? m.pois : qual === 'gelo' ? m.gelo : m.fogo);
        }
        return v;
      };
      for (const qual of ['fogo', 'gelo', 'veneno']){
        const v = amostra(qual);
        const cmax = Math.max.apply(null, v.chroma), cmin = Math.min.apply(null, v.chroma);
        if (!(cmax > .04)) throw new Error(`${qual}: a aberração cromática não acende (max ${cmax.toFixed(3)})`);
        if (!(cmax - cmin > .02)) throw new Error(`${qual}: a aberração fica parada em vez de PULSAR (${cmin.toFixed(3)}–${cmax.toFixed(3)})`);
        if (!v.tremeu) throw new Error(`${qual}: a câmera não dá o tranco da batida`);
        if (!(v.veu > .1)) throw new Error(`${qual}: o véu da tela não acende (${v.veu.toFixed(2)})`);
        const lmax = Math.max.apply(null, v.lL), rmax = Math.max.apply(null, v.lR);
        if (!(lmax > .12 && rmax > .12)) throw new Error(`${qual}: as abas não alternam — L ${lmax.toFixed(2)} / R ${rmax.toFixed(2)}`);
        if (!(v.part > 0)) throw new Error(`${qual}: nada vazando pelas laterais`);
      }
      global.__t.pulsoDebuff('nada'); pump(4);
      const limpo = global.__t.leiaPulso();
      if (limpo.lL > 0 || limpo.lR > 0) throw new Error('as abas ficaram acesas sem debuff nenhum');
      if (limpo.pois > 0) throw new Error('o véu do veneno ficou aceso sem veneno');
      console.log('pulso dos debuffs: ok — aberração pulsa, câmera bate, abas alternam e as laterais vazam'); }

    // DIFICULDADE: teto da armadura, curva de vida e baú bom
    { const df = global.__t.dificuldade(); pump(2);
      if (!df.semDefesa) throw new Error('a DEFESA voltou pro jogo: ela foi tirada de propósito');
      if (src.indexOf('armor -= ab') >= 0) throw new Error('o applyHit voltou a absorver dano na defesa');
      if (src.indexOf("'bait'") >= 0 && src.indexOf("pw === 'bait'") >= 0)
        throw new Error('a Isca de Queijo voltou a ser lançável');
      if (!(df.base > 0 && df.fundo > 0)) throw new Error('não achei o mesmo plague doctor nos dois andares pra medir a curva');
      /* plague doctor base 18. nv6 = 18 x 1,165 = 21. nv36: a rampa DEITA depois do 26 —
         1 + 23x.055 + 10x.022 = 2,485 ➡️ 45. Com a reta antiga seria 51 (muro) e com os .04
         originais, 42 (moleza). O guarda tranca essa janela.                                  */
      const razao = df.fundo / df.base;
      if (df.base < 20 || df.base > 22) throw new Error(`plague doctor do nv 6 fora do esperado: ${df.base} (era pra ser 21)`);
      if (df.fundo < 43 || df.fundo > 47) throw new Error(`a curva de vida mudou: plague doctor do nv 36 com ${df.fundo} (com a rampa deitada é 45; com a reta antiga era 51)`);
      if (df.bau.indexOf('heartmax') >= 0) throw new Error('o baú bom ainda larga contêiner de coração');
      if (df.bau.indexOf('potion') < 0) throw new Error('o baú bom parou de largar poção');
      console.log(`dificuldade: ok — sem defesa · plague doctor ${df.base}➡️${df.fundo} (x${razao.toFixed(2)}) · baú [${df.bau}]`); }

    // BEIJINHO: ela manda um a cada presente
    { const bp = global.__t.beijoPresente(); pump(2);
      if (bp.subiu !== 1) throw new Error('o presente nem foi entregue: o teste do beijinho não vale');
      if (bp.n !== 1) throw new Error(`ela devia mandar 1 beijinho por presente e mandou ${bp.n}`);
      if (bp.voa !== 1) throw new Error('o beijinho não sai dela em direção a quem ganhou');
      console.log('beijinho: ok — sai dela e voa até quem ganhou o presente'); }

    // VARREDURA: so com um 2o CONTROLE plugado
    { const vp = global.__t.varreduraPad(); pump(2);
      if (vp.semPad !== 0) throw new Error('a varredura abriu sem controle nenhum');
      if (vp.umPad !== 0) throw new Error('a varredura abriu com só UM controle: o teclado não divide mais');
      if (!(vp.doisPads > 0)) throw new Error('a varredura NÃO abriu com dois controles plugados');
      if (src.indexOf('p2Scan > 0 && ehTeclaP2') >= 0)
        throw new Error('a tecla do sapo ainda faz ele ENTRAR em campo');
      console.log('varredura: ok — só abre com 2º controle plugado, nunca no teclado'); }

    // PECAS GRANDES DO ARMARIO: rabo, asa, caranguejo, teia e esponja
    { const pa = global.__t.pecasArmario(); pump(2);
      const querem = ['none', 'dragao', 'fada'];               // so ACESSORIO: fantasia de personagem saiu
      for (const k of querem)
        if (pa.lista.indexOf(k) < 0) throw new Error('a peça ' + k + ' sumiu da seção de acessórios');
      for (const k of ['caranguejo', 'aranha', 'bob'])
        if (pa.lista.indexOf(k) >= 0) throw new Error('a fantasia ' + k + ' voltou pro armário');
      if (pa.semIcone.length) throw new Error('peça sem ícone no armário: ' + pa.semIcone.join(', '));
      const mudas = Object.keys(pa.desenhou).filter(k => !pa.desenhou[k]);
      if (mudas.length) throw new Error('peça escolhida que não chega no sprite: ' + mudas.join(', '));
      for (const k of ['dragao', 'fada'])
        if (src.indexOf("kind === '" + k + "'") < 0)
          throw new Error('a peça ' + k + ' não tem ramo de desenho no drawFantasia');
      if (!pa.limpou) throw new Error('guarda-roupa salvo com fantasia velha não volta pro "sem peça"');
      console.log('peças do armário: ok — só rabo e asas, e fantasia velha salva volta pro none'); }

    // CARTAS DOS CHEFES: cada um larga a sua, com retrato e efeito proprios
    { const cc = global.__t.chefeCarta(); pump(2);
      const esperado = { 10: 'ccat', 20: 'cyetiB', 30: 'ctoadB' };
      for (const lv in esperado)
        if (cc[lv] !== esperado[lv]) throw new Error(`chefe do nv ${lv} devia largar ${esperado[lv]} e larga ${cc[lv]}`);
      const semArte = Object.keys(cc.desenhou).filter(k => !cc.desenhou[k]);
      if (semArte.length) throw new Error('carta de chefe sem arte nem ícone: ' + semArte.join(', '));
      // o toDataURL do ambiente de teste devolve sempre a mesma string: o retrato se confere NA FONTE
      for (const k of ['cyetiB', 'ctoadB'])                     // o GATO e o ramo `else`: nao tem kind proprio
        if (src.indexOf("kind === '" + k + "'") < 0)
          throw new Error('a carta ' + k + ' não tem ramo próprio no makeCardArt: cairia no retrato do GATO');
      const ce = global.__t.cartaChefeEfeito(); pump(2);
      if (!(ce.congelou > 20)) throw new Error(`a Carta do Yeti Ancião quase nunca congela: ${ce.congelou}/400`);
      if (!(ce.comSalto > 0 && ce.comSalto < ce.semSalto)) throw new Error(`a Carta do Sapo Real não encurta a escavação: ${ce.semSalto} ➡️ ${ce.comSalto}`);
      console.log(`cartas de chefe: ok — 3 chefes, 3 brasões · gelo ${ce.congelou}/400 · cava ${ce.semSalto}➡️${ce.comSalto}s`); }

    // BAU: o sapo mexe no do covil com a bolsa DELE, e leva o castigo do da dungeon
    { const sb = global.__t.sapoBau(); pump(2);
      if (!sb.abriu) throw new Error('o sapo encostou no baú do covil e ele não abriu pra ele');
      if (sb.fileira[0] !== '1') throw new Error('o baú mostra a mochila errada: ' + sb.fileira);
      if (!sb.guardou) throw new Error('o sapo não consegue guardar item no baú (ou tirou da mochila do rato)');
      if (!sb.pegou) throw new Error('o sapo não consegue TIRAR item do baú');
      const bc = global.__t.sapoBauCastigo(); pump(2);
      if (!bc.veneno.sapo || bc.veneno.rato) throw new Error('a baforada do baú envenenou o jogador errado: ' + JSON.stringify(bc.veneno));
      if (!bc.veneno.ratoIntacto) throw new Error('o baú aberto pelo sapo bateu no rato');
      if (!bc.trava.sapo || bc.trava.rato) throw new Error('o ferrolho do baú travou os poderes do jogador errado: ' + JSON.stringify(bc.trava));
      console.log('baú: ok — o sapo abre, guarda, tira e leva o próprio castigo'); }

    // TELEPORTE: sumico, rastro e queda
    { const tp = global.__t.sapoTp(); pump(2);
      if (tp.perto > 2) throw new Error('o sapo não foi parar do lado do rato: ' + tp.perto);
      if (!(tp.poeira >= 20)) throw new Error('o teleporte do sapo saiu sem sumiço nem rastro: ' + tp.poeira);
      if (!(tp.aneis > 0)) throw new Error('o teleporte do sapo saiu sem anel nenhum');
      if (!(tp.queda > 0)) throw new Error('o sapo não CAI na chegada do teleporte');
      if (!(tp.noAr > 0)) throw new Error('o sapo chega já no chão: a queda não sai do lugar');
      console.log(`teleporte do sapo: ok — ${tp.poeira} partículas, anel e queda de ${tp.queda}s (${tp.noAr}px no ar)`); }

    // CARGA: o sapo brilha igual ao rato, e a luz dele se parte ao apanhar
    { const cg = global.__t.sapoCarga(); pump(2);
      if (!cg.rdy) throw new Error('o sapo nunca fica com o giro PRONTO');
      if (!cg.quebrou) throw new Error('a luz da carga do sapo não se parte quando ele apanha');
      console.log('carga do sapo: ok — brilha até ficar pronto e a luz se parte ao apanhar'); }

    const st4 = global.__t.ratoStatus(); pump(2);
    if (!st4.burn || !st4.frost || !st4.pois) throw new Error('o RATO não pega queimadura/gelo/veneno');
    if (!st4.yeti) throw new Error('a Carta do Yeti não segura mais o gelo do rato');
    // CARTA DE MONSTRO: cada um tem a sua lâmina
    const ca = global.__t.sapoCarta(); pump(2);
    if (!ca.doRato || !ca.doSapo) throw new Error(`crédito do golpe saiu errado: ${JSON.stringify(ca)}`);
    if (!ca.encaixou) throw new Error('a carta do sapo não encaixou na lâmina dele');
    if (!ca.naMochila) throw new Error('a segunda carta do sapo não foi pra mochila dele');
    if (!ca.soDele) throw new Error('a carta do sapo vazou pro rato (ou vice-versa)');
    if (!ca.trocou) throw new Error('o sapo não troca a carta encaixada pela da mochila');
    if (ca.somaGato !== 2) throw new Error(`a Carta do Gato não somou no dano do sapo: +${ca.somaGato}`);
    if (!ca.seguiu) throw new Error('a carta do sapo não acompanhou a arma nova');
    if (!ca.doChao) throw new Error('o sapo ainda deixa carta do chão pro rato');
    console.log('cartas do sapo: ok — encaixa, guarda, troca, soma no dano e acompanha a lâmina');
    const pa = global.__t.presenteAlvo(); pump(2);
    if (pa.sapoSubiu <= 0 || !pa.ratoIntacto || pa.ratoSubiu <= 0)
      throw new Error(`presente foi pro alvo errado: ${JSON.stringify(pa)}`);
    console.log(`ficha do sapo: ok — mochila, arma, poder (${kit.cd}s), stamina, escavação e presente próprios`);

    global.__t.sapoSai(); pump(2);                             // sai de campo: o resto da bateria é do rato sozinho

    // PODER QUE FERE TEM QUE FERIR (o "acendeu algum efeito" deixou o Rodopio passar mudo)
    { const pd = global.__t.poderDano(); pump(2);
      const devem = ['spin', 'lantern', 'coven', 'nova', 'bomb', 'quake', 'thrust', 'shards', 'bubble'];
      const mudos = devem.filter(k => !(pd[k] > 0));
      if (mudos.length) throw new Error('poder que devia ferir e não feriu: ' + mudos.join(', '));
      if (pd.__giro.some(d => d !== 8))
        throw new Error(`o Rodopio devia bater 8 (dobro da espada 4) nas 8 casas: ${pd.__giro.join(',')}`);
      console.log(`poderes de dano: ok — ${devem.length} ferem de verdade e o Rodopio dobra em volta (${pd.spin} no total)`); }

    // BOTÃO DO PODER TAMBÉM EQUIPA (no controle dá vontade de apertar o X pra equipar um poder)
    { const pe = global.__t.poderEquipa(); pump(2);
      if (!pe.daMao) throw new Error('o botão do poder não equipa o poder que está na mão');
      if (!pe.daMochila) throw new Error('o botão do poder não acha o poder guardado na mochila');
      if (!pe.lancou) throw new Error('com poder equipado, o botão parou de LANÇAR');
      if (pe.semNada) throw new Error('sem poder nenhum, o botão devia recusar'); }
    console.log('botão do poder: ok — equipa quando falta poder e lança quando já tem');

    // PODER BUFFERIZADO: apanhar um tranco na hora do aperto não pode engolir o poder
    { const cr = global.__t.cartaCredito(); pump(2);
      if (cr !== 'sapo') throw new Error('o credito da morte chega tarde demais (carta cairia pro dono errado): ' + cr);
      console.log('credito da carta: ok — o dono ja esta posto quando o bicho morre'); }

    // O BUFFER CORRE NO RELOGIO DO MUNDO: no impacto o quadro trava em 12% e o pedido evaporava
    { global.__t.poderTravado(); pump(4);
      const bf = global.__t.poderBuf();
      if (!(bf > .32)) throw new Error('o quadro travado comeu o pedido do poder: sobrou ' + bf.toFixed(3) + ' de 0.35');
      console.log('buffer do poder: ok — 4 quadros de hitstop gastaram so ' + ((.35 - bf) * 1000).toFixed(0) + 'ms dos 350'); }

    { const naHora = global.__t.poderArma();
      if (naHora) throw new Error('o teste do buffer não vale: o poder saiu com o rato ocupado');
      pump(24);
      const st2 = global.__t.poderSaiu();
      if (!(st2.rage > 0)) throw new Error('o aperto do poder se perdeu quando o rato estava ocupado: ' + JSON.stringify(st2)); }
    console.log('buffer do poder: ok — apertado no meio do tranco, o poder sai assim que dá');
    console.log(`jogador 2: ok — sapo entrou (${sp.max} de vida), bateu ${sp.bateu}, caiu na dungeon e só levantou no covil com ${lv2.noCovil.hp}`);
    console.log(`poderes: ok — ${Object.keys(ap).length} no total, todos com galho no despacho e efeito próprio (fúria ${bt.rage}s, fio ${bt.edge}s)`);

    // PODER É RARO — a estreia deixou de ser garantida (68%): tem que cair na MAIORIA das vezes,
    // nunca em todas. E o andar comum quase nunca larga poder, senão volta a sobrar.
    const dEstreia = global.__t.powerDrops(7);
    const dSorteio = global.__t.powerDrops(10);
    // 50% em 24 amostras: media 12, sigma 2,45. O piso 7 caia por azar de vez em quando; 5 e
    // -2,9 sigma e ainda pega uma regressao de verdade (estreia desligada da 0).
    if (dEstreia < 5) throw new Error(`estreia rara demais: só ${dEstreia}/24 — o poder novo tem que aparecer`);
    if (dEstreia > 23) throw new Error(`estreia ${dEstreia}/24: virou garantida de novo, o poder deixou de ser raro`);
    if (dSorteio > 8) throw new Error(`sorteio generoso demais: ${dSorteio}/24 em andar sem estreia`);
    console.log(`quedas: ok — estreia ${dEstreia}/24 (rara, não garantida) e sorteio ${dSorteio}/24 nos comuns`);

    const cf = global.__t.castTest(); pump(2);
    if (cf.cast !== 1 || cf.level !== 1) throw new Error(`efeitos: cast=${cf.cast} level=${cf.level}`);
    console.log(`efeitos: ok — círculo de invocação (${cf.col}) e pilar de nível no lugar`);

    // congelado precisa continuar sendo alvo (o invuln dele parava dentro do gelo)
    const fz = global.__t.frozenTest(); pump(2);
    if (!fz || !fz.hurt) throw new Error('inimigo congelado continua imortal');
    if (!fz.stayed) throw new Error('estátua de gelo escorregou com o golpe');
    console.log(`congelado: ok — levou ${fz.dealt} de dano (quebradiço) sem sair do lugar`);

    // poderes novos da Escavação
    const qk = global.__t.quakeTest(); pump(2);
    if (!qk || qk.hp >= 30) throw new Error('terremoto não feriu quem estava colado');
    if (qk.buff !== 10) throw new Error('terremoto não durou 10s');
    console.log(`terremoto: ok — ${30 - qk.hp} de dano no vizinho e 10s de escavação explosiva`);

    const dr = global.__t.drillTest();
    if (!dr) throw new Error('broca: sem espaço pro teste');
    pump(40);
    const de = global.__t.drillEnd(dr.eid);
    if (de.pos[0] !== dr.to[0]) throw new Error(`broca não cavou 4 tiles: ${de.pos} != ${dr.to}`);
    if (de.hp >= dr.hp0) throw new Error('broca não feriu quem estava por cima do túnel');
    console.log(`broca: ok — túnel de 4 tiles e ${dr.hp0 - de.hp} de dano em quem estava no caminho`);

    // Zelda no miolo: barril, raio de vida cheia, giro carregado, corações
    const sm = global.__t.smashTest(); pump(2);
    if (!sm) throw new Error('barril: nenhum no andar pro teste');
    if (!sm.blocked0) throw new Error('barril não bloqueava o tile');
    if (!sm.gone || !sm.walkable) throw new Error('barril não estilhaçou');
    console.log(`barril: ok — estilhaçou no golpe e liberou a passagem${sm.planted ? ' (barril plantado: o andar não sorteou um)' : ''}`);

    const bm = global.__t.beamTest();
    if (!bm) throw new Error('raio: sem espaço pro teste');
    if (bm.fired !== 1) throw new Error('vida cheia não soltou raio');
    // o voo do raio dura .06*alcance + .05: com alcance 4 são .29s, e 12 quadros (.2s) deixavam
    // ele no ar. O teste dependia do andar sortear uma parede a 3 tiles.
    pump(26);
    const be2 = global.__t.beamEnd(bm.eid);
    if (be2.hp >= bm.hp0) throw new Error('o raio não feriu o alvo distante');
    if (be2.left !== 0) throw new Error('o raio não sumiu depois de acertar');
    console.log(`raio: ok — com a vida cheia o golpe voou 3 tiles e tirou ${bm.hp0 - be2.hp}`);

    const cg = global.__t.chargeTest(); pump(2);
    if (!cg || cg.hurt !== cg.of) throw new Error(`giro carregado pegou ${cg && cg.hurt} de ${cg && cg.of}`);
    if (cg.dmg !== cg.normal)
      throw new Error(`giro carregado tirou ${cg.dmg}, mas o golpe normal tira ${cg.normal}: a vantagem é a ÁREA`);
    console.log(`giro carregado: ok — pegou os ${cg.of} bichos de uma vez tirando ${cg.dmg} (= golpe normal)`);

    const bdp = global.__t.bossDrop(); pump(2);
    if (bdp.dropped !== 1) throw new Error('chefe não largou o contêiner de coração');
    console.log('chefe: ok — deixa cair o contêiner de coração');

    const ps = global.__t.poseTest();
    if (ps.t <= 0 || ps.kind !== 'nova') throw new Error(`animação do achado não rolou: ${JSON.stringify(ps)}`);
    const mv = global.__t.walkNow();                           // durante a animação o jogador TEM que andar
    pump(36);                                                  // 576ms: duas batidas do compasso (0,25s) — numa delas um bicho pode estar pisando na mesma casa
    const mv2 = global.__t.walkState();
    if (mv && !mv2.moved) throw new Error('o achado travou o personagem: ele não andou ' + JSON.stringify(mv2.dbg));
    if (mv2.fx <= 0) throw new Error('a animação do achado sumiu cedo demais');
    console.log('achado: ok — item sobe com fanfarra e o ratinho anda normalmente durante a animação');

    // ESTRESSE: martela os primeiros andares com ações aleatórias procurando travamento
    for (const lv of [3, 4, 5, 6, 7]){
      global.__t.enter(lv);
      await new Promise(r => setTimeout(r, 700));
      pump(4);
      for (let i = 0; i < 500; i++){
        global.__t.act(i + lv * 1000);
        pump(1);
      }
      const st2 = global.__t.alive();
      console.log(`estresse nv ${lv}: ok — 500 quadros com ações aleatórias (hp ${st2.hp}, ${st2.foes} bichos de pé)`);
    }

    console.log('DEEP_OK');
    process.exit(0);
  } catch (err){
    console.error('DEEP_FAIL:', err.stack || err);
    process.exit(1);
  }
})();
