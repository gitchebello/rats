// smoke test: stubs de DOM/canvas, executa o script do jogo + 3 frames
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
  createGain(){ return { gain: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return this; } }; }
  createOscillator(){ return { type: '', frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){} }, connect(){ return this; }, start(){}, stop(){} }; }
  createBufferSource(){ return { buffer: null, connect(){ return this; }, start(){}, stop(){} }; }
  createBuffer(ch, len, sr){ return { getChannelData(){ return new Float32Array(len); } }; }
  createBiquadFilter(){ return { type: '', Q: { value: 0 }, frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){} }, connect(){ return this; } }; }
};
global.webkitAudioContext = global.AudioContext;

try {
  new Function(src)();
  let t = 1000;
  for (let i = 0; i < 3; i++){
    const cbs = raf.splice(0);
    if (!cbs.length){ console.error('SMOKE_FAIL: nenhum frame agendado'); process.exit(1); }
    t += 16;
    cbs.forEach(cb => cb(t));
  }
  console.log('SMOKE_OK');
  process.exit(0);                                            // o jogo deixa timer/rAF pendurado: sem isso o
                                                              // smoke imprimia SMOKE_OK e ficava preso pra sempre
} catch (err){
  console.error('SMOKE_FAIL:', err.stack || err);
  process.exit(1);
}
