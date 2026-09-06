// extrai o <script> do index.html e roda node --check
const fs = require('fs'), cp = require('child_process');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m){ console.error('script não encontrado'); process.exit(1); }
fs.writeFileSync(__dirname + '/game.js', m[1]);
const r = cp.spawnSync('node', ['--check', __dirname + '/game.js'], { encoding: 'utf8' });
if (r.status !== 0){ console.error(r.stderr); process.exit(1); }

// zona morta temporal: ler um const/let ANTES da linha que o declara não é erro de sintaxe,
// mas explode em tempo de execução e mata o requestAnimationFrame (foi assim que o jogo
// travava ao chegar em 3 de vida — o bloco do aviso lia `paused` cedo demais).
const src = m[1];
const bad = [];
for (const fn of ['frame', 'stepActor', 'drawActor', 'doSpecial', 'applyHit', 'collectPickups']){
  const i = src.indexOf(`function ${fn}(`);
  if (i < 0) continue;
  let depth = 0, j = i;
  for (;; j++){
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) break;
  }
  const lines = src.slice(i, j + 1).split('\n');
  const decl = [];
  lines.forEach((l, n) => {
    const d = l.match(/^  (?:const|let) (\w+)/);
    if (d) decl.push([d[1], n]);
  });
  for (const [name, dl] of decl)
    for (let n = 0; n < dl; n++){
      const code = lines[n].split('//')[0];
      if (new RegExp('\\b' + name + '\\b').test(code)){
        bad.push(`${fn}(): "${name}" é usado na linha ${n + 1} mas só é declarado na ${dl + 1}`);
        break;
      }
    }
}
if (bad.length){ console.error('TDZ:\n  ' + bad.join('\n  ')); process.exit(1); }

// LINT DE EMOJI: nada de emoji do sistema na tela — tudo tem que virar pixel art via emojify().
// Um emoji fora do EMO_SRC atravessa o emojify() intacto e o SO desenha o dele, quebrando a arte.
{
  const body = html.split('\n').slice(10).join('\n');        // pula as fontes em base64
  const map = body.match(/const EMO_SRC = \{[\s\S]*?\n\};/);
  if (!map) throw new Error('EMO_SRC não encontrado');
  const known = new Set([...map[0].matchAll(/'([^']+)':/g)].map(m => m[1]));
  const rx = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  const loose = new Map();
  for (const m of body.matchAll(rx)){
    const ch = m[0];
    if (known.has(ch)) continue;
    if (!loose.has(ch)) loose.set(ch, body.slice(0, m.index).split('\n').length + 10);
  }
  if (loose.size){
    console.error('EMOJI SEM PIXEL ART (adicione ao EMO_SRC ou troque por um já mapeado):');
    for (const [ch, line] of loose) console.error(`  ${ch}  linha ${line}`);
    process.exit(1);
  }
}
// SKINDRAW aponta pra funções por referência: se uma sumir (recorte de bloco que levou o vizinho
// junto), o arquivo continua com sintaxe válida e só quebra na hora de desenhar o bicho.
{
  const nomes = [...(src.match(/\['[a-z0-9]+',\s*(draw[A-Za-z]+)\]/g) || [])]
    .map(m => m.replace(/.*,\s*/, '').replace(']', ''));
  const faltando = [...new Set(nomes)].filter(n => !new RegExp('function\\s+' + n + '\\s*\\(').test(src));
  if (faltando.length){
    console.error('SPRITE SEM FUNÇÃO (o SKINDRAW aponta pra algo que não existe):');
    faltando.forEach(n => console.error('  ' + n));
    process.exit(1);
  }
}
console.log('SYNTAX_OK');
