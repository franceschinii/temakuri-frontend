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
 * Linguagem para o jogador — sem termos técnicos.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-05-14',
    version: '0.6.0',
    title: 'Diamantes 💎, novos avatares, temas de mesa e mais',
    category: 'feature',
    highlights: [
      'Saldo de diamantes aparece no topo da tela',
      '6 avatares novos e 3 temas de mesa pra escolher',
      'Botão "Como jogar" agora aparece em todas as telas no PC',
    ],
    details: `Várias novidades chegaram:

• Agora tem uma moeda nova chamada **diamantes 💎**. Em breve você poderá comprar e usar pra desbloquear coisas legais — por enquanto fica como prévia.
• Seis avatares novos disponíveis: Yokai, Kitsune (raposa de 9 caudas), Tanuki (texugo com folha), Geisha, Samurai (capacete com chifres dourados) e Dragão Dourado.
• Três temas de mesa: Bambu Verde, Sakura e Oni. Aplicam um fundo bonito enquanto você joga.
• O botão "Como jogar" agora aparece em todas as telas pelo computador, não só no lobby.
• Algumas correções importantes:
  - As cartas não embaralham mais durante uma jogada com mão grande.
  - Quando o admin remove alguém da sala, a pessoa é desconectada de verdade.
  - O diálogo de fim de rodada não fecha mais sozinho no celular.`,
  },
  {
    date: '2026-05-14',
    version: '0.5.5',
    title: 'Ajustes de visual no celular e no PC',
    category: 'fix',
    highlights: [
      'Avatares voltam a aparecer com fundo no PC',
      'Avatares maiores na partida pelo PC',
      'Carta selecionada no celular não corta mais no topo',
    ],
    details: `Várias correções visuais:

• Os avatares no PC estavam ficando sem fundo quando dois ou mais jogadores usavam o mesmo. Resolvido.
• Os avatares dos jogadores na partida ficaram maiores no PC, mais fáceis de ver.
• No celular, ao escolher uma carta da mão ela não sobe mais — antes ela cortava no topo da área. O brilho e a borda continuam indicando a seleção.
• O balão de mensagem nova do chat parou de cobrir as cartas no celular — agora aparece no topo da tela.
• A caixinha "Carta do monte / Clique numa barra" estava espremida em 4 linhas no celular. Layout ajustado.`,
  },
  {
    date: '2026-05-14',
    version: '0.5.4',
    title: 'Correções rápidas na partida',
    category: 'fix',
    highlights: [
      'Número das cartas voltou a ficar legível',
      'Botão de chat duplicado removido',
      'Contador de vazas e sabores agora funciona',
    ],
    details: `Algumas correções importantes:

• Os números das cartas ficaram bem visíveis de novo, com letrinha branca destacada.
• Tinha um botão de chat sobrando no canto direito — foi removido. O acesso continua pelo botão na linha dos emojis.
• O código da sala e o tempo do turno pararam de vazar pra fora da barra de cima.
• O contador de vazas ganhas e sabores ativados estava sempre em zero — agora salva direitinho ao fim de cada partida.`,
  },
  {
    date: '2026-05-14',
    version: '0.5.3',
    title: 'Avatares mais bonitos e novo Udon Gold',
    category: 'feature',
    highlights: [
      'Os avatares ficaram mais caprichados',
      'Novo Udon Gold dourado disponível na loja',
    ],
    details: `Demos uma caprichada nos rostinhos das comidas — eles ficaram mais expressivos, com mais cores e detalhes. As boquinhas agora aparecem direitinho.

Tem um novo avatar à venda: o **Udon Gold**, com a tigela toda dourada.`,
  },
  {
    date: '2026-05-14',
    version: '0.5.2',
    title: 'Polimento da partida e correção da economia',
    category: 'fix',
    highlights: [
      'Cartas legíveis mesmo fora do turno',
      'Compra na loja agora exige confirmação clara',
      'Quem abandona partida não ganha mais moedas',
    ],
    details: `Várias correções e ajustes:

• As cartas da sua mão ficavam apagadas demais quando não era seu turno. Agora seguem legíveis (número, emoji e nome visíveis); o cursor e o efeito de hover é que mudam para indicar que você não pode jogar.
• No PC, o código da sala, rodada e tempo da partida agora ficam centralizados de verdade na tela, e o contador de segundos está maior.
• Botões flutuantes do chat e histórico voltaram a aparecer no PC — o feed lateral do histórico e o painel de chat com prévia de novas mensagens continuam onde sempre estiveram.
• O modal do histórico agora abre já rolado até a jogada mais recente e segue acompanhando enquanto chegam novas. Se você rolar para cima para reler algo, o auto-scroll pausa; volta automaticamente quando você voltar perto do final.
• Loja: comprar avatar ou modo agora abre uma confirmação dedicada com preço, saldo atual e saldo após a compra. Mais difícil de errar.
• Admin: a aba "Salas" separa Ativas (esperando ou em andamento) de Inativas (finalizadas). Filtros de busca, aba e tipo de usuário ficam salvos no navegador — sobrevivem ao F5.
• Correção crítica: quem saía no meio de uma partida ainda recebia XP e moedas como se tivesse jogado até o fim. Agora só quem está na sala quando o jogo termina recebe recompensas.`,
  },
  {
    date: '2026-05-14',
    version: '0.5.1',
    title: 'Detalhes de jogadores + skeletons em toda a interface',
    category: 'feature',
    highlights: [
      'Clique em qualquer jogador para ver perfil e estatísticas',
      'Chat e histórico voltaram pro canto inferior, junto dos emojis',
      'Skeletons no lugar de telas em branco enquanto carrega',
    ],
    details: `Várias melhorias para deixar a interface mais informativa e responsiva:

• Toque/clique no avatar ou nome de qualquer jogador (oponentes na partida, lista de salas, sala de espera, painel de admin) abre um diálogo com nível, rank, partidas jogadas, vitórias, sabores ativados, vazas e tempo de jogador.
• Chat e histórico de jogadas saíram da navbar e voltaram para o canto inferior da tela, na mesma linha dos emojis de reação. Histórico à esquerda, chat à direita.
• Adicionado emoji 😂 nas reações.
• Na navbar mobile durante a partida, agora aparecem o botão "Como jogar" e o controle de som/música — sem precisar sair do jogo pra ajustar.
• Skeletons substituem os retângulos pulsantes em todo o sistema: lobby, ranking, admin, loja e diálogos. Carregamento fica mais fluido visualmente.`,
  },
  {
    date: '2026-05-13',
    version: '0.5.0',
    title: 'Celular jogável: tela do jogo refeita pra tela pequena',
    category: 'feature',
    highlights: [
      'Cartas menores no celular para mesa e mão caberem sem sobrepor',
      'Barra do topo enxuta durante a partida — só o essencial',
      'Sair da conta agora pede confirmação (e ficou vermelho)',
    ],
    details: `Uma rodada inteira de ajustes pensando em quem joga no celular. No PC nada muda — toda a melhoria entra automaticamente em telas pequenas:

• Durante a partida, a barra de cima passa a mostrar só voltar, código da sala, rodada, tempo e sair. Moedas, loja, perfil e admin foram pro modo desktop — no celular elas só atrapalhavam.
• As cartas da sua mão e da mesa ficam pequenas no celular automaticamente. No PC continuam grandonas como antes. Resultado: mão de 8 cartas e a mesa convivem sem sobrepor.
• Avatares dos oponentes encolhem no celular pra três caberem confortavelmente em telas estreitas.
• Lobby reorganizado no celular: linha 1 com código + entrar, linha 2 com Criar / Buscar / Ranking ocupando largura total. No desktop tudo continua numa linha só.
• Painel do Admin: aba "Salas" foi refeita com card limpo, lista de jogadores expansível, botão de remover sala em largura total. A aba alterna Usuários/Salas ficou acima da busca, com tamanho cheio no celular.
• Botão Admin agora aparece no celular (antes ficava só no desktop) — ícone amarelo no celular, ícone + texto no PC.
• Sair da conta virou ação destrutiva: ícone vermelho em todas as telas, com diálogo "Sair da conta?" antes de deslogar. Acaba o risco de tocar sem querer e cair pra tela inicial.
• Barra do topo da tela de Perfil agora fica fixa quando rolagem — antes a barra ia embora junto com a página.
• No diálogo de criar sala, no celular, o controle "Privada" agora aparece numa linha própria ao invés de ser empurrado pra fora da viewport.
• "Como jogar" agora abre ao lado do logo no lobby, com mais espaço.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.1',
    title: 'Menu de topo agora é igual em todas as telas',
    category: 'qol',
    highlights: [
      'Moedas, loja e ajuda acessíveis de qualquer tela',
      'Avisos de quem ganhou rodada e vaza no topo da mesa',
      'Logos maiores nas telas de login/cadastro',
    ],
    details: `Vários ajustes de navegação e visual:

• A barra superior do jogo agora é a mesma em todas as telas (lobby, sala, partida, perfil, ranqueada, admin). Você tem acesso direto a moedas, loja, ajuda, perfil, configurações de som e sair de qualquer lugar.
• Banner de eventos importantes (vez de fulano, ganhou a vaza, venceu a rodada, Sabor ativo) agora aparece no topo da área da mesa, em destaque. Antes ficava em cima dos avatares dos jogadores.
• Notificações de "fulano desconectou / fulano voltou" agora só aparecem se a queda for real (>5 segundos). Pequenas instabilidades de rede não geram mais spam.
• Logos das telas de login/cadastro maiores e mais bonitos.
• Notícias e Changelog do lobby ficaram numa coluna lateral mais larga, dando destaque às salas no centro.
• Tela "Como funciona" (ranks, moedas, bordas, ícones) com SVGs reais dos ranks e ícones consistentes. Recompensas de moedas mostradas com os valores corretos por modo de jogo.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0',
    title: 'Partida mais clara e fluida',
    category: 'qol',
    highlights: [
      'Pausa de 1,8 segundo para ver cada jogada',
      'Cartas maiores e mais legíveis',
      '"SUA VEZ" agora aparece bem destacado',
    ],
    details: `Várias melhorias na experiência durante a partida:

• Agora há uma pequena pausa entre as jogadas — dá tempo de ver o que aconteceu antes de já passar a vez. Chega de "teleporte" de turno.
• As cartas ficaram maiores na mesa, na sua mão e no descarte. Mais fácil de ler os valores.
• Quando é a sua vez, o aviso ficou bem visível: borda verde brilhante embaixo, contorno pulsante no seu avatar e badge "SUA VEZ" em destaque.
• Avatares dos oponentes maiores também — fica mais fácil identificar quem é quem.
• Nome dos jogadores agora aparece com cor legível (antes tava muito escuro).
• Recompensas no fim da partida com destaque grande pro XP e moedas ganhos.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0',
    title: 'Quem ganha a partida não é mais expulso na hora',
    category: 'fix',
    highlights: [
      'Vencedor consegue ficar e jogar de novo na mesma sala',
      'Sala continua aberta por 5 minutos após o fim',
    ],
    details: `Um bug chato: quem ganhava a partida era expulso da sala instantaneamente, sem chance de jogar de novo.

Agora a sala fica disponível por 5 minutos após o fim do jogo. Tempo suficiente para todos verem o placar, conversarem no chat, e o anfitrião clicar "Jogar de novo" pra reiniciar a partida com a mesma galera.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0',
    title: 'Sala não fica fantasma quando o dono sai',
    category: 'fix',
    highlights: [
      'Quando o anfitrião sai, outro jogador assume',
      'Sala só fecha quando não houver mais ninguém',
    ],
    details: `Antes, se o dono da sala saísse, ela ficava aparecendo no lobby com "4/4 jogadores" e ninguém conseguia entrar.

Agora: quando o anfitrião sai e ainda tem outras pessoas na sala, alguém assume automaticamente como novo anfitrião. A sala continua aberta normalmente. Só fecha quando o último humano sair.

Também limpamos automaticamente salas abandonadas e finalizadas para o lobby não ficar poluído.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0',
    title: 'Busca rápida de partida totalmente nova',
    category: 'feature',
    highlights: [
      'Tempo de aceitar reduzido para 20 segundos',
      'Botão "Recusar" cancela o match na hora',
      'Verde aparece pra todo mundo que confirmou',
    ],
    details: `O fluxo de busca de partida foi todo repensado:

• Quando encontramos um match, você tem 20 segundos para aceitar (era 2 minutos). Mais ágil.
• Adicionamos o botão "Recusar" ao lado do "Confirmar". Se você não quiser jogar com aquele grupo, recusa e o match é cancelado para todos.
• Quando alguém confirma, o avatar dele fica verde — e isso aparece em todas as telas, não só na dele. Antes você não via os outros aceitarem.
• Mínimo de 2 pessoas confirmando para a partida começar. Se faltar gente, completamos com bots automaticamente.`,
  },
  {
    date: '2026-05-13',
    version: '0.4.0',
    title: 'Mesa de jogo sincronizada corretamente',
    category: 'fix',
    highlights: [
      'Turno avança em tempo real, sem precisar atualizar a página',
      'Mesa não fica vazia quando muda a vez',
      'Cartas não somem do jogo',
    ],
    details: `Vários problemas chatos de sincronização foram corrigidos:

• Quando alguém ativava o "Sabor" (combo especial), o turno às vezes travava na tela e a única forma de ver quem era a próxima vez era recarregar a página. Resolvido.
• A mesa às vezes mostrava "vazia" no meio de uma jogada quando trocava de vez. Resolvido.
• A pilha de cartas agora vai certinho para o descarte quando alguém joga em cima — ninguém perde mais o controle de quais cartas já saíram.
• Adicionamos uma verificação automática: as 63 cartas únicas do baralho ficam sempre rastreadas, sem nenhuma sumir.`,
  },
  {
    date: '2026-05-12',
    version: '0.3.0',
    title: 'Ranqueada mais justa',
    category: 'fix',
    highlights: [
      'PDS calculado corretamente em partidas seguidas',
      'Só humanos jogam ranqueada (sem bots)',
      'Você consegue descer de rank quando merecer',
    ],
    details: `O sistema de Ranqueada teve vários ajustes:

• PDS (Pontos de Skill) era calculado errado se você terminasse duas partidas muito próximas no tempo. Agora cada vitória/derrota é processada certinho.
• Partidas ranqueadas agora exigem 4 pessoas reais. Sem bots completando.
• Quando você perde muito, agora desce de rank corretamente para o tier anterior. Antes ficava preso no mínimo do tier atual.
• Pontos não duplicam mais se houver instabilidade de conexão.`,
  },
  {
    date: '2026-05-12',
    version: '0.2.0',
    title: 'Espectadores assistindo de verdade',
    category: 'feature',
    highlights: [
      'Botão "Assistir" em salas que já começaram',
      'Você vê a partida em tempo real',
      'Quando alguém sair, você pode virar jogador',
    ],
    details: `Agora você pode acompanhar uma partida que já começou:

• No lobby, salas em andamento têm botão "Assistir" no lugar do "Entrar".
• Você entra direto na tela de jogo, vê a mesa, as ações, o placar — só não joga.
• Se um dos jogadores sair, você é automaticamente promovido a jogador e entra na próxima rodada.`,
  },
  {
    date: '2026-05-11',
    version: '0.2.0',
    title: 'Som, chat e emojis',
    category: 'feature',
    highlights: [
      'Efeitos sonoros pra cada ação',
      'Chat dentro da partida e no lobby',
      'Reações com emojis flutuantes',
    ],
    details: `O jogo ganhou áudio e canais de comunicação:

• Sons para tudo: jogar carta, passar a vez, ativar Sabor, ganhar a vaza, fim de rodada, fim de jogo, sua vez de jogar, contagem regressiva, chat enviado/recebido, alguém entra/sai da sala.
• Chat in-game com painel lateral. Bolinha de notificação quando tem mensagem nova.
• Chat também funciona no lobby antes da partida começar.
• Reações: clique nos emojis pra mandar pra galera. Tem cooldown anti-spam.
• Tudo isso pode ser silenciado nas configurações.`,
  },
  {
    date: '2026-05-10',
    version: '0.2.0',
    title: 'Conexão mais resistente',
    category: 'fix',
    highlights: [
      'Mudar de aba não derruba mais seu jogo',
      'Reconexão automática se cair internet',
      'Estado da partida recupera sozinho',
    ],
    details: `Várias melhorias nos bastidores para o jogo aguentar instabilidade:

• Antes, alt+tab por alguns segundos podia te derrubar da partida. Agora a conexão é mantida em segundo plano.
• Se sua internet cair, o jogo tenta reconectar automaticamente. Quando voltar, ele se sincroniza com o estado real da partida.
• Não precisa mais recarregar a página depois de uma queda — o jogo se recupera sozinho.`,
  },
  {
    date: '2026-05-09',
    version: '0.1.0',
    title: 'Modos de jogo',
    category: 'feature',
    highlights: [
      'Tradicional, Duelo, Mercado, Rodízio',
      'Combo "Sabor" para jogadas especiais',
    ],
    details: `Quatro jeitos diferentes de jogar:

• **Tradicional**: 3 a 6 jogadores, regras clássicas. Receba 8 cartas, jogue conjuntos do mesmo valor, ganhe vazas, perca pratos.
• **Duelo**: só para 2 pessoas. Cada um recebe 11 cartas + 2 cartas viradas pra cima. Combine cartas da mão com as cartas viradas pra fazer jogadas mais fortes. Passou 3 vezes? Perdeu.
• **Mercado**: igual ao tradicional, mas quem ganhar a vaza pode trocar uma carta da mão com o mercado central.
• **Rodízio**: a cada rodada, as mãos rotacionam entre os jogadores. Você precisa se adaptar rápido.

E o **Sabor**: se você jogar 2 ou mais cartas da mesma categoria (todas sushi, todas ramen, etc.), ativa o combo. Próximas jogadas precisam ter no mínimo aquele número de cartas, ou alguém quebra o combo com categorias misturadas.

Modos Mercado, Rodízio e Degustação são desbloqueáveis com moedas na loja.`,
  },
  {
    date: '2026-05-08',
    version: '0.1.0',
    title: 'Progressão: XP, níveis e ranks',
    category: 'feature',
    highlights: [
      'Suba de nível jogando partidas',
      '7 ranks na ranqueada, do Bronze ao SuperSabor',
      'Loja com avatares e modos desbloqueáveis',
    ],
    details: `Sistema completo de evolução de jogador:

• Toda partida finalizada dá XP e moedas, baseado na sua colocação. Acumule XP para subir de nível (até 100).
• Sua borda de avatar muda conforme você sobe: nível 10 vira Bronze, 25 vira Prata, 50 vira Ouro, 75 vira Platina, e 100 desbloqueia uma borda lendária animada.
• Ranqueada usa PDS (Pontos de Skill) — vence ganha, perde tira. Sobe de rank conforme acumula: Bronze, Prata, Ouro, Platina, Diamante, Esmeralda e SuperSabor (4000+ PDS).
• Loja com avatares iniciais e modos pagos. Tudo pode ser comprado com moedas ganhas no jogo.`,
  },
];

export const CATEGORY_LABELS: Record<ChangelogEntry['category'], { label: string; color: string }> = {
  feature: { label: 'Novidade', color: 'oklch(68% 0.15 145)' },
  fix: { label: 'Correção', color: 'oklch(78% 0.18 80)' },
  perf: { label: 'Performance', color: 'oklch(72% 0.2 240)' },
  qol: { label: 'Melhoria', color: 'oklch(70% 0.15 280)' },
};
