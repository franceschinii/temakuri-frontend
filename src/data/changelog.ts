export interface ChangelogEntry {
  date: string; // YYYY-MM-DD
  version: string;
  title: string;
  category: 'feature' | 'fix' | 'perf' | 'qol';
  highlights: string[];
  details: string;
}

/**
 * Changelog do Temakuri. Adicionar entradas no TOPO (mais recentes primeiro).
 * Histórico inicial reflete commits reais do projeto.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-05-13',
    version: '0.4.0-beta',
    title: 'Sincronia em tempo real e layout estável',
    category: 'fix',
    highlights: [
      'Turno agora avança em tempo real sem precisar dar F5',
      'Layout do jogo não pula mais quando overlays aparecem',
      'Mesa não fica vazia ao trocar de vez',
    ],
    details: `Foram corrigidos múltiplos bugs de sincronização in-game:

• Sinalização de fase TRICK_PICK (regra A2) agora é broadcast para todos os jogadores, eliminando travamento de turno após Sabor ativar.
• Novo evento "phase heartbeat" detecta dessincronização e força resync automático.
• Layout reservou espaços fixos para overlays (SaborIndicator, drawn card prompt, mensagens), evitando flick quando entram e saem.
• Texto do nome dos jogadores corrigido (antes aparecia escuro sobre fundo escuro).
• Avatares dos oponentes aumentados de 28 para 36px, fontes mais legíveis.
• Timer de pick aumentado para 30s, dando tempo para escolher posição da carta.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0-beta',
    title: 'Matchmaking estilo LoL',
    category: 'feature',
    highlights: [
      'Janela de aceitação de 20s em Partida Rápida (era 120s)',
      'Botão Recusar cancela o match imediatamente',
      'Mínimo de 2 humanos confirmados; bots completam o resto',
    ],
    details: `O fluxo de matchmaking foi totalmente repensado:

• Reduzido o timeout de confirmação de 120s para 20s em Partida Rápida.
• Adicionado botão "Recusar" ao lado de "Confirmar" — cancela o match na hora.
• Mínimo de 2 humanos confirmando para iniciar; quem não confirmar é removido do match.
• Bots preenchem os slots vazios automaticamente após o timeout.
• Avatares dos jogadores que confirmaram ficam verdes em todas as telas (antes só você se via verde).
• Race conditions de match duplicado eliminadas via mutex no servidor.

Ranqueada mantém 120s e exige 4 humanos (sem bots) por design.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0-beta',
    title: 'Regras oficiais Nanatoridori implementadas',
    category: 'feature',
    highlights: [
      'Regra A2: escolher pegar ou descartar pilha anterior após jogar',
      'Wipe (todos passam) descarta automaticamente, sem escolha',
      'Invariante de 63 cartas únicas validado no servidor',
    ],
    details: `O engine de jogo foi alinhado com as regras oficiais do Nanatoridori:

• Após jogar uma combinação superior em cima de pilha não-vazia, jogador entra em fase TRICK_PICK e escolhe pegar a pilha anterior para a mão OU descartá-la.
• Quando todos passam em sequência, a pilha vai para o descarte automaticamente e o último que jogou inicia nova rodada com mesa vazia (sem escolha).
• Adicionado invariante de integridade: 9 cartas de cada valor 1-7, total 63 únicas. Validado em cada operação do engine.
• Cartas não somem mais entre rodadas — você pode contar cartas com segurança.`,
  },
  {
    date: '2026-05-13',
    version: '0.3.0',
    title: 'Ranked refinado',
    category: 'fix',
    highlights: [
      'Race condition no PDS corrigida (transação Prisma)',
      'Bots não entram mais em partidas ranqueadas',
      'Sistema de demoção entre tiers funciona corretamente',
    ],
    details: `O sistema de Ranked teve correções importantes:

• markFinished agora roda em transação Prisma por usuário, evitando race condition que fazia PDS calculado com streaks desatualizadas.
• Idempotência via GameResult @unique — se webhook retentar, PDS não dobra.
• clampPds reescrito: permite demoção legítima para o tier anterior (antes ficava preso no floor do tier atual).
• fillWithBots bloqueado em sala ranqueada — bots não descaracterizam partidas competitivas.
• 22 testes unitários novos cobrindo rankFromPds, clampPds e calcPdsChange.`,
  },
  {
    date: '2026-05-12',
    version: '0.3.0',
    title: 'Sala não fecha mais quando host sai',
    category: 'fix',
    highlights: [
      'Host saindo promove próximo humano automaticamente',
      'Sala não vira fantasma na listagem',
      'Cleanup automático de salas mortas',
    ],
    details: `Bugs de ciclo de vida de sala foram resolvidos:

• Quando o host sai, o próximo humano (não-bot, não-banido) vira host automaticamente. Sala só morre se não houver humano para promover.
• leaveRoom agora é atômico (transação Prisma) — previne salas fantasma quando 2 jogadores saem simultaneamente.
• Cleanup automático: salas FINISHED >24h são deletadas, salas WAITING vazias e bots/guests órfãos são removidos a cada 1h.
• Salas presas em IN_PROGRESS após restart do servidor viram FINISHED no boot do gateway.
• Espectadores não podem mais marcar "pronto" (poluía o readyMap).`,
  },
  {
    date: '2026-05-12',
    version: '0.2.0',
    title: 'Espectadores funcionando',
    category: 'feature',
    highlights: [
      'Botão Assistir entra em sala IN_PROGRESS como espectador',
      'Espectador vê o jogo em tempo real',
      'Promoção automática quando vaga abrir',
    ],
    details: `Espectadores agora têm experiência completa:

• Sala em andamento aparece com botão "Assistir" em vez de "Entrar".
• Espectador entra direto na tela do jogo, sem hand visível e com badge "Espectador".
• Vê pile, descarte, ações em tempo real.
• Quando uma vaga abre (jogador sai em WAITING), o primeiro espectador é promovido a jogador.
• Bug crítico do useEffect com deps stale corrigido — espectadores eram redirecionados de volta ao lobby.`,
  },
  {
    date: '2026-05-11',
    version: '0.2.0',
    title: 'Som, chat e reações',
    category: 'feature',
    highlights: [
      'Efeitos sonoros para todas ações principais',
      'Chat in-game e lobby com som',
      'Sistema de reações com emojis',
    ],
    details: `Áudio e comunicação chegaram ao jogo:

• Sons: play, pass, wipe, sabor, round_end, game_over, your_turn, countdown, ready/unready, chat send/receive, player join/leave, reaction.
• Chat in-game com painel deslizante, preview de mensagem, e indicador de não-lidas.
• Chat de lobby antes da partida começar.
• Sistema de reações (emojis flutuantes) com cooldown anti-spam (3 em 2s = 4s lockout).
• Mute persiste em localStorage.`,
  },
  {
    date: '2026-05-10',
    version: '0.2.0',
    title: 'Resiliência de conexão',
    category: 'fix',
    highlights: [
      'Ping/pong client-side detecta socket zombie',
      'Reconexão automática com state resync',
      'Listeners não vazam mais entre reconexões',
    ],
    details: `Conexão WebSocket muito mais robusta:

• Ping a cada 15s do cliente; se 45s sem resposta, força reconexão.
• visibilitychange dispara request_state ao voltar de aba em segundo plano (alt+tab não quebra mais).
• disconnectSocket sempre limpa listeners (antes acumulava em reconexões).
• hasJoinedRef/navigatedRef resetam ao trocar de sala — bug de não conseguir entrar em segunda sala resolvido.
• Cleanup do countdownInterval no unmount.`,
  },
  {
    date: '2026-05-09',
    version: '0.1.0',
    title: 'Modos de jogo',
    category: 'feature',
    highlights: [
      'Tradicional, Duelo (2P), Mercado, Rodízio',
      'Modos pagos desbloqueáveis na loja',
      'Sistema de Sabor (combo de mesmo naipe)',
    ],
    details: `Lançamento dos modos de jogo:

• TRADICIONAL: 3-6 jogadores, regras clássicas Nanatoridori.
• DUELO: 2 jogadores, 11 cartas + 2 Pratos do Dia. Combine pratos com a mão. 3 passes = derrota.
• MERCADO: o wiper troca uma carta da mão com o mercado (3 cartas viradas).
• RODÍZIO: mãos rotacionam entre jogadores ao fim de cada rodada.
• Sabor: jogar 2+ cartas da mesma categoria ativa o Sabor — próximas jogadas precisam superar o número mínimo.
• Modos pagos (Mercado, Rodízio, Degustação) custam moedas na loja.`,
  },
  {
    date: '2026-05-08',
    version: '0.1.0',
    title: 'Sistema de progressão',
    category: 'feature',
    highlights: [
      'XP, níveis e bordas de avatar',
      'Ranks de Bronze a SuperSabor (ranqueada)',
      'Loja de avatares e modos com moedas',
    ],
    details: `Fundação de progressão lançada:

• 100 níveis com curva de XP balanceada.
• Bordas de avatar mudam de cor a cada tier: Nível 10 (Bronze), 25 (Prata), 50 (Ouro), 75 (Platina), 100 (gradient animado).
• Ranqueada com PDS (Pontos de Skill) divididos em 7 ranks: Bronze, Prata, Ouro, Platina, Diamante, Esmeralda, SuperSabor.
• Loja com avatares (8 disponíveis), modos pagos.
• XP e moedas ganhos no fim de cada partida proporcional à colocação.`,
  },
];

export const CATEGORY_LABELS: Record<ChangelogEntry['category'], { label: string; color: string }> = {
  feature: { label: 'Novidade', color: 'oklch(68% 0.15 145)' },
  fix: { label: 'Correção', color: 'oklch(78% 0.18 80)' },
  perf: { label: 'Performance', color: 'oklch(72% 0.2 240)' },
  qol: { label: 'Qualidade de vida', color: 'oklch(70% 0.15 280)' },
};
