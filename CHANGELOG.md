# Changelog — Rats!

O código das versões antigas não foi preservado; este registro foi reconstruído a partir das conversas de desenvolvimento. Datas marcadas com "~" foram inferidas pelo horário dos pedidos; as demais constam das notas de desenvolvimento.

## v1.54 — 13/10/2026
- Previsão do sapo no aparelho do convidado: o próprio boneco responde na hora, sem esperar a volta do dono (antes eram ~580 ms de atraso em rede de celular).

## v1.52–v1.53 — 13/10/2026
- Sincronização carimbada: cada pacote leva a batida e o horário do dono; o convidado reproduz por uma fila com folga, sem engasgos.
- Ping entre os parceiros, exibido no painel da sala.
- D-pad do controle lido de verdade (antes as diagonais empatavam e uma direção era inalcançável).
- Render mais leve: mapa de luz recalculado a 30 Hz.

## v1.50–v1.51 — 13/10/2026
- Elevador da dupla: quem está na sala pode descer junto até o andar mais fundo alcançado pelo parceiro.
- Nova personagem no covil: a sapinha, ao lado da ratinha; rato e sapo têm contas de presentes separadas.
- Celebração "REVIVEU!" em letreiro arco-íris pixel art, com flashes em cascata, ao ser revivido pela pedra arco-íris.

## v1.49 — 13/10/2026
- Controle estilo Snake: dá para virar na última hora dentro do intervalo do passo, sem o personagem parar.
- Botão de troca de itens dentro da mochila.

## v1.48 — 13/10/2026
- Dentro de cada passo vale o último input direcional dado, mesmo já solto.
- Jogadores podem estar em salas e andares diferentes ao mesmo tempo (cenas independentes); o sapo não é mais teleportado para junto do rato.
- Pedra arco-íris: item raro (só com parceiro) que revive o companheiro caído.
- Troca de itens entre rato e sapo.
- Sapo caído em sala online volta sozinho para o covil.
- Desempenho: fim dos desfoques aplicados por retângulo.

## v1.47 — 13/10/2026
- O Compasso: o jogo inteiro (também offline) anda em passos de T = 0,25 s; todos os personagens se movem no mesmo instante.
- Protocolo online binário e só com mudanças: tráfego do dono caiu de ~5 KB/s para ~105 B/s.

## v1.46 — 26/09/2026
- Chefes ganharam repertório próprio de golpes em três tempos (aviso marcado no chão, disparo, respiro): leque, anel, salto, investida, queda e língua.
- Lotação de inimigos por estrato; bichos nascem em grupos longe da porta e demoram um instante para perseguir.
- Cena de entrega do presente em três tempos (oferta, aceite, passagem do embrulho) antes da janela de upgrades da ratinha.
- Marcação discreta do último inimigo da sala (aura quase invisível no lugar de anúncio).
- Removida a cama de casal do covil.

## v1.45 — 24/09/2026
- Floresta Podre removida; o jogo termina no andar 40: Masmorra 1–10, Gelo 11–20, Esgoto 21–30, Sabá das Bruxas 31–39 e laboratório no 40.
- Escada de dano das armas recomprimida; vida e dano dos chefes passam a seguir o andar.

## v1.44 — 23/09/2026
- Estrato Floresta Podre (11–20) com chefe próprio, o Carvalho Podre; a Relojoaria foi abolida.
- No gelo, o escorregão deixou de valer para o andar inteiro e virou placa.
- Revisão rigorosa de textos: painel de ajuda cerca de 68% menor.

## v1.40–v1.43 — 18/09/2026
- A kitsune saiu; entrou o Plague Doctor, inspirado no Plague Knight.
- Três redesenhos no mesmo dia: versão chibi, máscara em 3/4 com furos e, por fim, preto e branco com máscara de osso em forma de cabeça de pássaro.
- O Nó de Ratos voltou, na versão pequena e sem se desfazer em ratos.

## v1.37–v1.39 — ~10 a 11/09/2026
- Correção do online: o endereço da sala agora é descoberto ao lado da página (antes pedia na raiz e falhava); relay com lista branca.
- Ataque do sapo no celular corrigido (toques curtos se perdiam entre batidas; trava de carga ficava presa) e previsão local do golpe.
- Jogador 1 volta a andar pelas setas quando há sapo em campo.
- Cama do covil refeita mais uma vez.

## v1.31–v1.35 — ~10/09/2026
- LAN house com um ratinho para cada usuário do computador, com avatar próprio.
- Modo online para dois aparelhos com sala de código de 4 letras; painel com dois caminhos claros (criar sala como rato, entrar como sapo).
- Convidado pode jogar pelo teclado ou controle no desktop.
- Relógio mecânico: o dono da sala é a autoridade do mundo e envia batidas; o convidado manda só comandos.
- Uma barra de ação por aparelho e câmera que segue o boneco local.
- A porta é do dono: entrar na dungeon leva o parceiro junto.
- Sala com conexão partida não prende mais ninguém.

## v1.30 — ~09/09/2026
- Balanceamento por saldo de cura contra custo de vida por andar, depois de uma run difícil demais.

## v1.28–v1.29 — ~09/09/2026
- Kitsune redesenhada (três caudas em leque, olho amendoado, haori).
- Corrigido o corpo "fatiado" do rato em movimento.
- Corrigido poder repetido na mesma run, vindo de qualquer fonte.
- Cama refeita a partir das coordenadas do móvel; um pouco mais de poções.

## v1.25–v1.27 — ~08/09/2026
- Escassez real: menos poções, queijos e poderes (poção chega a 0,50 por andar).
- Fila de avisos: letreiros, armas, cartas e debuffs não se sobrepõem mais.
- Letreiros de debuff no estilo do "CRÍTICO!" (QUEIMANDO!, CONGELADO!...).
- Sapo caído só levanta no covil.
- Removidos a Defesa e o poder Isca de Queijo; um poder de cada só por run; status de fogo/gelo/veneno recalibrados.

## v1.22–v1.24 — ~08/09/2026
- Teto na armadura do queijo e curva de vida dos inimigos mais íngreme.
- Beijinho da ratinha voa até o jogador a cada presente.
- Fantasias de personagem fora do armário (ficaram rabo de dragão e asas de fada); cores numa fileira só.
- Novos ícones: Guincho Sônico, Arremesso, Trilha de Gelo.
- Tela bate em ritmo de coração sob debuff, com véu de cor por status.
- Sound design: limitador, anti-repetição, variação de timbre, pan e distância, ambiente por estrato, abafamento com painéis abertos e passos por superfície.

## v1.18–v1.21 — ~07 a 08/09/2026
- Novos acessórios: rabo de dragão, asas de fada, caranguejo, Homem-Aranha e Bob Esponja — depois refeitos em escala de acessório.
- 2º jogador só é ativado com um segundo controle conectado.
- Carta do chefe cai no chão se a mochila estiver cheia; espólio do chefe espalhado.
- Economia mais apertada (−25% em poder/poção/coração, −10% em queijo).

## v1.14–v1.17 — ~07/09/2026
- Corrigido o Rodopio de Lâminas, que estava sem efeito desde a v1.03.
- Letreiro "COMPLETO!" volta ao estilo de texto do "CRÍTICO!".
- Ponte de madeira balança com a escavação; dois bugs raros de geração corrigidos.
- Cartas de monstro do sapo equipam na arma dele.
- Teleporte do sapo visível; baú compartilhado; todos os chefes largam carta; carga do giro brilha nos dois.

## v1.11–v1.13 — ~06 a 07/09/2026
- Peruca menor e depois clássica, com risca no meio.
- Fantasias viram peças; seção Fantasia sai do armário; roda de cores vira fileira de quadradinhos.
- Marcador do item na mão sem a letra "Y".
- Botão do poder também equipa um poder quando não há nenhum.

## v1.07–v1.10 — ~06/09/2026
- Modo 2 jogadores no desktop: o sapo, com ficha, mochila, poderes e status próprios; sem fogo amigo.
- Golpes mais rápidos; capa com balanço corrigido; chapéus na altura da testa.
- Braços com arma testados e removidos na versão seguinte.
- Guarda-roupa com roda de cores vibrante (inclui branco), peruca como chapéu, chapéus novos e guarda-roupa separado para o sapo.
- Caixas de opções navegáveis pelo controle.
- Cama de casal, TV com canal de desenho e olhos vermelhos no bueiro do covil.
- Sapo escava, entrega queijo à ratinha e faz seus próprios upgrades.
- Barriguinha rosinha da waifu.

## v1.04–v1.06 — ~06/09/2026
- Ratinha com pelo branquinho.
- "COMPLETE!" vira "COMPLETO!" em fonte pixel de verdade.
- Kitsune simplificada; inimigos malditos mais legíveis.

## v0.98–v1.03 — ~05/09/2026
- Placa de pressão com dardos em um só tile, setas redesenhadas, acionada também por inimigos; placas horizontais, verticais e cruzadas.
- Baú 50/50 isométrico e ponte pendurada refinada.
- Seta de upgrade sobre a ratinha redesenhada (branca).
- Poderes sorteados por run; Lâmina Voadora sai e entra a Isca de Queijo.
- v1.03 restaurou três poderes apagados por engano, entre eles os ícones de buff do Fio Afiado e da Fúria Rateira.

## v0.95–v0.97 — ~05/09/2026
- Novo estrato Sabá das Bruxas (41–50), com 4 inimigos, 3 poderes e laboratório no andar final.
- Perigos e segredos: placa de pressão, baú 50/50 (pode trazer castigo) e parede falsa com nicho.
- Segredo de escavação mais raro e mais valioso.
- Cubo de gelo e Yeti redesenhados.
- Itens entram na ordem de profundidade (o coração não é mais cortado por pilastras).

## v0.90–v0.93 — ~05/09/2026
- Rampa de dificuldade mais progressiva e teto de inimigos por sala.
- Kitsune refeita do zero.
- Lettering do COMPLETE! melhorado; perspectiva do fosso corrigida.
- Carta de monstro arrastável para dispensar, estilo TCG.
- Versão sombria de cada inimigo na fenda maldita.
- Abismo com ponte cortando a sala; salas de gelo menores.

## v0.86–v0.89 — ~03 a 04/09/2026
- Passo diagonal com a velocidade certa e, depois, removido do teclado e do controle.
- Fossos de 2x2 e 3x3 nas salas e escuridão leve por reino.
- A Raposa Malandra vira kitsune, redesenhada menor e mais fofa.
- "?" de ajuda removido do mobile.

## v0.82–v0.85 — 03/09/2026
- Movimento em 8 direções (revertido depois); escalada de inimigos suavizada.
- Véu vermelho e preto nos inimigos da fenda maldita.
- Removidos sorvete, sopa e corda de bolso: a poção vira o único consumível.
- O Nó de Ratos sai do jogo e a Raposa Malandra entra no lugar, com carta de esquiva.

## v0.76–v0.80 — 03/09/2026
- Suporte a controle de videogame no desktop (Gamepad API), com layout por posição dos botões (Xbox e Switch).
- Item na mão: um slot da mochila acionado direto por um botão.
- Diagonais do isométrico com duas teclas e analógico por ângulo.
- HUD mobile reorganizado, mochila em duas fileiras, carta no chão com arte própria e 14 ícones de poder refeitos.

## v0.73–v0.75 — 03/09/2026
- Elevador das masmorras para estratos já alcançados, só com ícones e válido apenas na sessão atual.
- Mochila que cresce com presentes (até 8 slots).

## v0.69–v0.72 — 02/09/2026
- Cartas de monstro (inspiração Ragnarök) com arte própria, encaixe na arma e cena ao serem achadas; a carta acompanha o rato na troca de arma.
- Chefes com fases e golpes telegrafados.
- Segredos de escavação (discretos, recompensa modesta).
- Fenda maldita: portal raro (5%) para uma arena hostil com mais risco e recompensa dobrada.
- Rachaduras removidas.

## v0.64–v0.68 — 02/09/2026
- Andar dividido em salas com minimapa: testado e revertido para arena; o minimapa saiu em seguida.
- Painel de presentes da ratinha reescrito; auras permanentes por upgrade (vermelha, verde, amarela).
- Aviso "UP!" e chamada "ELA TE CHAMA" no centro da tela.
- Nenhum emoji do sistema: toda a UI em pixel art.

## v0.54–v0.63 — 02/09/2026
- Golpe carregado com giro azul próprio, cortado ao levar dano; dano igual ao golpe normal.
- MISS de 5%: testado nos dois lados e mantido só para inimigos.
- Covil redesenhado: baú isométrico, tapete xadrez, cama de madeira, maçã centrada; sofá, cômoda e guarda-roupa centrados no tile.
- Nó de Ratos morre de primeira e foi redesenhado (depois diminuído).
- Presente de vida passa de +2 para +5; Coração Antigo com borda dourada.

## v0.49–v0.53 — 02/09/2026
- Alerta de vida crítica (30%) com flares vermelhos nas laterais, ajustado várias vezes.
- Tecla V para escavar; ajuda recolhida num botão "?".
- Escavação fere só os vizinhos ao emergir, com tiles saltando e animação com antecipação e overshoot.
- Golpe crítico e recuo (knockback) restaurado.
- POWER_DEBUT: poderes passam a cair também fora do andar de estreia; 8 poderes novos.
- Poderes de lâmina (Estocada Profunda) e buff Fio Afiado; Salto Sombrio e Chuva de Pedras removidos.

## v0.45–v0.48 — 02/09/2026
- Absorção de Mina the Hollower: a Escavação substitui o dash, flash branco no impacto, hitstop e luz em degraus.
- Absorção de Ragnarök: círculo de invocação, pilar de subir de nível, números de dano estilo MMO e janelas com moldura.
- Animação própria para cada poder; poderes Terremoto e Broca.
- Elementos de Zelda: giro carregado, raio da espada com vida cheia, barris quebráveis e pose de item (que não trava o jogador). A câmara do tesouro com chave foi criada e apagada.
- Corrigidos travamentos: custo de luzes no nível 4, erro com 3 de vida, morte com painel aberto, faixa da lava sobreposta e acentuação quebrada.

## v0.41–v0.44 — 01/09/2026
- Ícones em pixel art independentes das fontes do sistema; teclas Z (mochila), X (stamina) e C (poder).
- Rebalanceamento de poderes; arma mais fraca fica no chão e armas nunca passam pela mochila.
- Porta só pergunta se o jogador estiver de frente para ela.
- Masmorra de pedra com piso limpo; Yeti novo.
- Otimização do render no desktop (cenário pré-desenhado, qualidade adaptativa).

## v0.28–v0.40 — 31/08/2026
- Covil rústico de madeira, de dia, com janelas para fora.
- Beijinho da ratinha ao entregar queijo; avisos visuais claros para queimadura e congelamento.
- Inimigo Nó de Ratos (fusão de ratos).
- Novos móveis: cama em caixinha de fósforo, maçã gigante mordida, plantas e vinhas, poltrona, sapatinhos pendurados.
- Fogão trocado por caldeirão de bruxa com bolhas verdes e vassoura.
- Chapéu de nozes; luz neon verde sob a porta da LAN house (faixa arco-íris do chão removida).
- Juice dos poderes: tremor, aberração cromática e flash roxo nas laterais.
- Animações em arco seguindo princípios de animação; chips de buff com barra de tempo.
- Regras de arte: proporção ao tile, perspectiva centrada no losango e contorno preto em todo objeto.
- Pasta de referências visuais criada.

## v0.25–v0.27.1 — ~29/08/2026
- Reino do Gelo (11–20): paleta própria, nevasca, aurora boreal, inimigos de gelo e chefe no andar 20.
- Esgoto Real (21–30) e Relojoaria (31–40), com inimigos, poderes, veneno e poças de lodo.
- Corrigido item preso no tile da porta; empilhamento de itens na mochila.
- Rastro do caminhar reduzido ao losango brilhante.

## v0.17–v0.24 — ~28 a 29/08/2026
- Presentes da waifu: a cada meta de queijos, escolha entre mais vida ou stamina.
- Botão de stamina (5 s de velocidade, recarga longa) e 4 botões alinhados embaixo.
- Ficha do ratinho com atributos, roupas e recorde de profundidade.
- Drops com visual próprio: orbe para armas, bola de cristal para poderes, frasco para poções.
- Vida inicial 10/10; arma melhor equipa sozinha; anúncio de arma nova.
- Cogumelo inimigo removido.
- Rastro do caminhar testado em várias versões.

## v0.12–v0.16 — ~27/08/2026
- Gerador de dungeon com 4 arquétipos de andar, variedade garantida de inimigos e elites.
- Rastro brilhante nos tiles, fresta vermelha com fumaça na porta da dungeon e poeira no ar.
- Tile verde indicando onde o golpe acerta; dash de 2 tiles no toque duplo.
- Guarda-roupa com chapéus, cores de capa e acessórios.
- Novos inimigos coloridos (gosma arco-íris, morcego flamejante com queimadura, observador) e menos ratos.
- Efeitos sonoros procedurais.
- Banner COMPLETE! simplificado após várias tentativas.

## v0.5–v0.11 — 27/08/2026
- Virada roguelike: covil seguro mais dungeons procedurais de 1 a 10, com escada aberta ao limpar o andar e o Rei Rato no 10.
- Uma arma melhor por nível; queijo recupera vida; poções e corações de vida máxima.
- Baú no covil e queijos num slot próprio.
- Slider lateral de zoom; inventário com pausa; poderes com cooldown.
- Sala de estar com sofá, TV com Nintendo 64, ratoeira e quadros pixel art; LAN house anexa.
- Brilho no portal e nos tiles perigosos; contador de andar; slimes brilhantes.
- Geometria isométrica dos móveis corrigida (v0.8).

## Origem — 26/08/2026
- Primeiro protótipo: ratinho que rouba queijo e leva para casa.
- Recriado em pixel art isométrica 2.5D, com movimento por tiles, zoom e leve inclinação da câmera.
- A waifu ratinha cobra o queijo com balão de pensamento; baú e porta para o ambiente externo.
- Botão de ataque ajustado para o celular; explosão de corações ao entregar queijo.
