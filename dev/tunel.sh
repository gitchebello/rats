#!/bin/sh
# GUARDIÃO DO TÚNEL — deixa a SALA do Rats acessível de qualquer lugar do mundo.
#
# A página já é pública: https://terminal.appscohen.com.br/rats/ serve esta pasta. O que faltava
# era a sala, que mora no relay em 127.0.0.1:8123 e não tem porta aberta pra fora. Este script
# abre um túnel reverso por SSH e publica um endereço https/wss que chega nele.
#
# A porta 7844 do cloudflared é bloqueada nesta rede; a 22 do SSH passa. E o domínio grátis do
# localhost.run muda a cada ligação — por isso NINGUÉM decora o endereço: o guardião escreve o
# atual em `sala.json`, aqui dentro da pasta servida, e a própria página vai lá perguntar.
# Link que muda deixa de ser problema quando quem precisa dele sabe onde olhar.
RAIZ=$(cd "$(dirname "$0")/.." && pwd)
LOG=/tmp/rats-tunel.log
while true; do
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
      -o ServerAliveInterval=20 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes \
      -R 80:127.0.0.1:8123 nokey@localhost.run 2>&1 \
  | while IFS= read -r linha; do
      limpa=$(printf '%s' "$linha" | sed 's/\x1b\[[0-9;]*m//g')
      printf '%s\n' "$limpa" >> "$LOG"
      u=$(printf '%s' "$limpa" | grep -oE 'https://[a-z0-9]+\.lhr\.life' | head -1)
      if [ -n "$u" ]; then
        printf '%s\n' "$u" > /tmp/rats-url.txt
        printf '{"ws":"wss://%s/ws","http":"%s","em":"%s"}\n' \
          "${u#https://}" "$u" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$RAIZ/sala.json"
        echo "SALA PUBLICADA: $u" >> "$LOG"
      fi
    done
  echo "--- caiu, religando em 5s ---" >> "$LOG"
  sleep 5
done
