// abre o jogo de verdade num Chromium, entra numa dungeon e tira fotos.
// precisa do puppeteer instalado (aqui ou em qualquer pasta, via NODE_PATH):
//   npm i puppeteer && node dev/shot.js /tmp/rats 4
// serve pra OLHAR o jogo: erro de página, texto corrompido, efeito estourado.
let puppeteer;
try { puppeteer = require('puppeteer'); }
catch (e){ console.error('instale o puppeteer: npm i puppeteer (ou aponte NODE_PATH pra onde ele está)'); process.exit(2); }
const path = process.argv[2] || '/tmp/rats';
const LV = +(process.argv[3] || 4);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 760 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto('http://localhost:8123/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path + '-covil.png' });

  // entra numa dungeon com lava garantida (arquétipo 3) tentando alguns andares
  const info = await page.evaluate(async lv => {
    for (let t = 0; t < 14; t++){
      enterDungeon(lv);
      await new Promise(r => setTimeout(r, 800));
      if ((current.lava || []).length > 4) break;
    }
    player.hp = player.maxHp;
    return { lv: current.level, lava: (current.lava || []).length, foes: current.actors.filter(a => a.hostile && !a.dead).length };
  }, LV);
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: path + '-dungeon.png' });

  // cola o jogador numa poça de lava pra ver a área quente de perto
  await page.evaluate(() => {
    const lt = (current.lava || [])[0];
    if (lt){ player.tx = player.x = Math.max(1, lt.x - 2); player.ty = player.y = lt.y; cam.init = false; }
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path + '-lava.png' });

  // e um quadro com vida baixa (o cenário que travava)
  await page.evaluate(() => { player.hp = 3; updateHUD(); });
  await new Promise(r => setTimeout(r, 900));
  const alive = await page.evaluate(() => ({ hp: player.hp, mode: player.mode, frames: window.__fr || null }));
  await page.screenshot({ path: path + '-vida3.png' });

  console.log(JSON.stringify({ info, alive, errs }, null, 1));
  await browser.close();
})();
