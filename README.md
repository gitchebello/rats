# Rats!

Dungeon crawler multiplayer online: os ratos descem andar por andar enfrentando os inimigos de cada sala. Todos os personagens se movem no mesmo ritmo, e entre um passo e outro os controles funcionam como no *Snake*, guardando a próxima direção.

O jogo é o `index.html`; `dev/game.js` é o script dele em separado, para os testes.

## Rodar

```bash
python3 dev/relay.py       # http://localhost:8123 (jogo + salas de 4 letras na mesma porta)
python3 dev/relay.py 9000  # outra porta
```

`dev/serve.py` serve só a página, sem cache e sem salas. `dev/tunel.sh` abre um túnel SSH para deixar a sala acessível de fora da rede local.

## Testes

Os scripts em `dev/` (`check.js`, `smoke.js`, `strict.js`, `deep.js`, `shot.js`) rodam com `node` e verificam o jogo. Eles usam o `puppeteer` (`npm install puppeteer`); a pasta `node_modules` não vai para o repositório.
