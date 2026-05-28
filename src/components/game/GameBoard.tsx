import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HelpCircle, History, MessageSquare } from 'lucide-react';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AccessBar } from '@/components/ui/AccessBar';
import { RulesModal } from '@/components/ui/RulesModal';
import { PlayerDetailsDialog, type PlayerSnapshot } from '@/components/ui/PlayerDetailsDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { startMusic, stopMusic } from '@/lib/music';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { onReconnect, isSocketConnected } from '@/lib/socket';
import { useGame } from '@/hooks/useGame';
import { PlayerHand } from './PlayerHand';
import { PlayArea } from './PlayArea';
import { OpponentRow } from './OpponentRow';
import { ActionBar } from './ActionBar';
import { SaborIndicator } from './SaborIndicator';
import { TurnTimer } from './TurnTimer';
import { TokenDisplay } from './TokenDisplay';
import { RoundSummary } from './RoundSummary';
import { GameOverModal } from './GameOverModal';
import { MarketRow } from './MarketRow';
import { ReactionBar } from './ReactionBar';
import { ActionHistoryPanel } from './ActionHistoryPanel';
import { ChatPanel, type PanelHandle } from './ChatPanel';
import { CardComponent } from './CardComponent';
import { TrickPickModal } from './TrickPickModal';
import { DuelPassPickModal } from './DuelPassPickModal';
import { InGameHint } from './InGameHint';
import { useInGameHint } from '@/hooks/useInGameHint';
import { SaborPopup } from '@/routes/dev/anims/SaborPopup';
import { MedalBadge } from '@/components/ui/MedalBadge';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import type { Card, ClientGameState, GameRanking, GameStats, RoomPublicState } from '@/types/game';
import { validatePlayIndicesClient } from '@/lib/gameRules';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Apenas para /dev/board: força estados locais (modais, drawers, pick mode)
 * que normalmente são acionados por eventos de socket. Não tem efeito em
 * produção — a rota de jogo nunca passa esta prop.
 */
export interface GameBoardDevForceState {
  rulesOpen?: boolean;
  pickMode?: boolean;
  drawnCard?: Card | null;
  marketSwapMode?: boolean;
  selectedHandIndexForSwap?: number | null;
  trickPickOpen?: boolean;
  trickPile?: Card[];
  duelPickOpen?: boolean;
  leaveConfirmOpen?: boolean;
  playerDialogUserId?: string | null;
  historyOpen?: boolean;
  chatOpen?: boolean;
}

export function GameBoard({ devForceState }: { devForceState?: GameBoardDevForceState } = {}) {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const {
    phase, mode, round, myHand, players, pile, market, saborActive, saborMinRequired, saborTriggeredBy,
    currentTurnUserId, consecutivePasses, selectedIndices, selectedPlateIndices, discardPile, duelPlates, myDuelPlates,
    syncState, setMyHand, applyCardsPlayed, applyTurnPassed, applyWipe, drawPileCount,
    setSaborActive, applyRoundEnd, applyGameOver, clearRoundSummary, addToDiscardPile, reset,
    roundSummaryData, gameOverData, addReaction, reactions, updateMarket, addLog,
    musicEnabled, hintsEnabled, togglePlateSelection,
  } = useGameStore();

  const { playSelectedCards, drawCard, insertDrawnCard, swapWithMarket, sendReaction, sendMessage, requestState } = useGame(roomCode!);

  const [timerMs, setTimerMs] = useState(30_000);
  const [timerKey, setTimerKey] = useState(0);
  const [timerDelay, setTimerDelay] = useState(0);
  const saborPopupStartedAtRef = useRef<number>(0);
  const [reactionCooldown, setReactionCooldown] = useState(false);
  const reactionTimestampsRef = useRef<number[]>([]);
  const [pickMode, setPickMode] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const hasSubmittedPickRef = useRef(false);
  // Timestamp do ultimo evento visual de jogada (cards_played, turn_passed, wipe).
  // Usado para segurar o currentTurnUserId por ~1.8s, dando tempo de ver a jogada
  // antes do "vez de fulano" mudar visualmente. Estilo "tempo de visualizar a acao".
  const lastActionAtRef = useRef<number>(0);
  const pendingTurnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ACTION_VIEW_DELAY = 1800;
  const [marketSwapMode, setMarketSwapMode] = useState(false);
  const [selectedHandIndexForSwap, setSelectedHandIndexForSwap] = useState<number | null>(null);

  // Handles imperativos para abrir os paineis de chat e historico. Os botoes
  // visuais ficam no canto inferior junto da ReactionBar; aqui mantemos refs
  // para eventual uso futuro (atalhos de teclado, automacao de testes).
  const chatRef = useRef<PanelHandle>(null);
  const historyRef = useRef<PanelHandle>(null);

  // Modal de regras (Como jogar) — abre via icone na navbar mobile in-game.
  const [rulesOpen, setRulesOpen] = useState(false);

  // PlayerDetailsDialog — clicar em qualquer player (oponente ou eu) abre.
  const [playerDialogUserId, setPlayerDialogUserId] = useState<string | null>(null);
  const [playerDialogSnapshot, setPlayerDialogSnapshot] = useState<PlayerSnapshot | null>(null);

  const openPlayerDialog = useCallback((snapshot: PlayerSnapshot) => {
    setPlayerDialogSnapshot(snapshot);
    setPlayerDialogUserId(snapshot.userId);
  }, []);
  const closePlayerDialog = useCallback(() => {
    setPlayerDialogUserId(null);
    setPlayerDialogSnapshot(null);
  }, []);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [turnBanner, setTurnBanner] = useState<{ name: string; isMe: boolean } | null>(null);
  const [trickPickOpen, setTrickPickOpen] = useState(false);
  const [trickPile, setTrickPile] = useState<Card[]>([]);
  const [duelPickOpen, setDuelPickOpen] = useState(false);
  const prevTurnRef = useRef<string>('');
  const [roomHostId, setRoomHostId] = useState<string | null>(null);
  const [saborPopupTrigger, setSaborPopupTrigger] = useState(0);
  // Controla a animação de deal staggered no inicio de cada rodada.
  // Ativa quando round muda; desativa após o tempo total de animacao
  // (stagger de até 9 cartas * 90ms + spring.drop ~300ms = ~1.1s).
  const [isDealAnimating, setIsDealAnimating] = useState(false);
  const prevRoundRef = useRef(0);
  const [roundWaiting, setRoundWaiting] = useState<{ readyCount: number; humanCount: number } | null>(null);
  // Trava interação imediatamente após emitir qualquer ação de jogo.
  // Liberada só quando applyTurnChange roda (turn_started após ACTION_VIEW_DELAY).
  // Impede double-play durante a janela de delay de 1800ms.
  const [actionPending, setActionPending] = useState(false);

  // Dev-only: força estados locais a partir da rota /dev/board. Não roda
  // em produção porque devForceState é undefined no fluxo normal.
  useEffect(() => {
    if (!devForceState) return;
    if (devForceState.rulesOpen !== undefined) setRulesOpen(devForceState.rulesOpen);
    if (devForceState.pickMode !== undefined) setPickMode(devForceState.pickMode);
    if (devForceState.drawnCard !== undefined) setDrawnCard(devForceState.drawnCard);
    if (devForceState.marketSwapMode !== undefined) setMarketSwapMode(devForceState.marketSwapMode);
    if (devForceState.selectedHandIndexForSwap !== undefined) setSelectedHandIndexForSwap(devForceState.selectedHandIndexForSwap);
    if (devForceState.trickPickOpen !== undefined) setTrickPickOpen(devForceState.trickPickOpen);
    if (devForceState.trickPile !== undefined) setTrickPile(devForceState.trickPile);
    if (devForceState.duelPickOpen !== undefined) setDuelPickOpen(devForceState.duelPickOpen);
    if (devForceState.leaveConfirmOpen !== undefined) setLeaveConfirmOpen(devForceState.leaveConfirmOpen);
    if (devForceState.playerDialogUserId !== undefined) setPlayerDialogUserId(devForceState.playerDialogUserId);
    if (devForceState.historyOpen) historyRef.current?.open();
    if (devForceState.chatOpen) chatRef.current?.open();
  }, [devForceState]);

  const me = players.find(p => p.userId === user?.id);
  // Quem ja zerou a mao nesta rodada (isOutOfRound) NAO pode ter botoes
  // ativos mesmo que currentTurnUserId momentaneamente aponte pra ele
  // (race entre cards_played e turn_started com ACTION_VIEW_DELAY).
  const isMyTurn = user?.id === currentTurnUserId && !me?.isOutOfRound && !actionPending && !isDealAnimating;
  const opponents = players.filter(p => p.userId !== user?.id);
  const isWipeWinner = phase === 'PLAYER_TURN' && market !== null && currentTurnUserId === user?.id && pile.length === 0 && !me?.isOutOfRound;
  const isDuel = players.filter(p => !p.isEliminated).length === 2 || duelPlates !== null;

  useEffect(() => {
    if (musicEnabled) startMusic('game');
    return () => {
      stopMusic();
      if (pendingTurnTimerRef.current) clearTimeout(pendingTurnTimerRef.current);
      reset();
    };
  }, []);

  useEffect(() => {
    if (musicEnabled) startMusic('game');
    else stopMusic();
  }, [musicEnabled]);

  useEffect(() => {
    if (roomCode) requestState();
  }, [roomCode]);

  // Ao reconectar após queda de rede, resincroniza o estado do jogo automaticamente
  useEffect(() => {
    if (!roomCode) return;
    return onReconnect(() => {
      emitSocketEvent('game:request_state', { roomCode });
    });
  }, [roomCode]);

  // Ativa animacao de deal staggered quando a rodada muda.
  // Ignora o round 0 (estado inicial antes do jogo comecar).
  useEffect(() => {
    if (round > 0 && round !== prevRoundRef.current) {
      prevRoundRef.current = round;
      setIsDealAnimating(true);
      const t = setTimeout(() => setIsDealAnimating(false), 1300);
      return () => clearTimeout(t);
    }
  }, [round]);

  // Ao voltar de alt+tab/background, verifica se o socket ainda está vivo.
  // Browsers suspendem abas em background e podem silenciosamente matar o WS
  // sem disparar o evento close — o socket fica zumbi com readyState OPEN mas morto.
  // Força um ping via request_state; se o socket estiver morto, o send falha e
  // o close event dispara normalmente iniciando a reconexão.
  useEffect(() => {
    if (!roomCode) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isSocketConnected()) {
        emitSocketEvent('game:request_state', { roomCode });
      }
      // se socket morto, onReconnect ja dispara request_state apos reconectar
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [roomCode]);

  // Turn banner + sound for own turn
  useEffect(() => {
    if (!currentTurnUserId || players.length === 0) return;
    if (isMyTurn && currentTurnUserId !== prevTurnRef.current) {
      playSound('your_turn');
    }
    if (currentTurnUserId !== prevTurnRef.current) {
      const player = players.find(p => p.userId === currentTurnUserId);
      setTurnBanner({ name: isMyTurn ? 'Seu turno!' : `${player?.username ?? ''}`, isMe: isMyTurn });
      const t = setTimeout(() => setTurnBanner(null), 1800);
      prevTurnRef.current = currentTurnUserId;
      return () => clearTimeout(t);
    }
  }, [isMyTurn, currentTurnUserId, players]);

  useSocketEvent<{ state: ClientGameState }>('game:state_sync', useCallback(({ state }) => {
    syncState(state);
    // Servidor é fonte de verdade — sempre zera refs locais e fecha UIs incompatíveis com a fase
    hasSubmittedPickRef.current = false;
    if (state.phase !== 'PASS_PICK') {
      setPickMode(false);
      setDrawnCard(null);
    }
    if (state.phase !== 'DUEL_PASS_PICK') {
      setDuelPickOpen(false);
    }
    if (state.phase !== 'TRICK_PICK') {
      setTrickPickOpen(false);
    }
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
  }, [syncState]));

  useSocketEvent<{ card: Card; drawPileCount: number }>('game:card_drawn', useCallback(({ card, drawPileCount }) => {
    hasSubmittedPickRef.current = false;
    setDrawnCard(card);
    setPickMode(true);
    useGameStore.setState({ drawPileCount });
  }, []));

  useSocketEvent<{ userId: string; timeoutMs: number }>('game:turn_started', useCallback(({ userId, timeoutMs }) => {
    // Aplica a mudanca de turno. Se houve uma jogada recente (cards_played,
    // turn_passed, wipe), segura por ACTION_VIEW_DELAY para dar tempo de ver
    // o que aconteceu antes do "vez de fulano" mudar.
    const applyTurnChange = () => {
      useGameStore.setState((s) => ({
        currentTurnUserId: userId,
        selectedIndices: [],
        selectedPlateIndices: [],
        phase: s.phase === 'GAME_OVER' ? s.phase : 'PLAYER_TURN',
      }));
      const SABOR_POPUP_MS = 1700;
      const saborElapsed = saborPopupStartedAtRef.current > 0
        ? Date.now() - saborPopupStartedAtRef.current
        : SABOR_POPUP_MS;
      const delay = saborElapsed < SABOR_POPUP_MS ? SABOR_POPUP_MS - saborElapsed : 0;
      saborPopupStartedAtRef.current = 0;
      setTimerDelay(delay);
      setTimerMs(timeoutMs);
      setTimerKey(k => k + 1);
      setPickMode(false);
      setDrawnCard(null);
      setDuelPickOpen(false);
      setActionPending(false);
      hasSubmittedPickRef.current = false;
      const { myHand, phase, players } = useGameStore.getState();
      // Se eu zerei a mao nesta rodada (isOutOfRound), minha mao DEVE estar
      // vazia — nao pedir resync. Pedir aqui causaria varios state_sync
      // desnecessarios a cada turn_started ate a rodada acabar.
      const me = players.find(p => p.userId === user?.id);
      const iAmOutOfRound = me?.isOutOfRound === true;
      if (!iAmOutOfRound && myHand.length === 0 && phase !== 'GAME_OVER' && phase !== 'ROUND_END') {
        emitSocketEvent('game:request_state', { roomCode });
      }
    };

    const elapsed = Date.now() - lastActionAtRef.current;
    const remaining = ACTION_VIEW_DELAY - elapsed;
    if (pendingTurnTimerRef.current) clearTimeout(pendingTurnTimerRef.current);
    if (remaining > 0) {
      pendingTurnTimerRef.current = setTimeout(applyTurnChange, remaining);
    } else {
      applyTurnChange();
    }
  }, [roomCode, user?.id, setActionPending, setDuelPickOpen]));

  useSocketEvent<{ userId: string; cards: Card[]; isSabor: boolean; usedPlates?: Card[]; remainingPlates?: Card[]; nextPhase?: 'TRICK_PICK' | 'PLAYER_TURN' }>('game:cards_played', useCallback(({ userId, cards, isSabor, usedPlates, remainingPlates, nextPhase }) => {
    lastActionAtRef.current = Date.now();
    applyCardsPlayed(userId, cards, isSabor, usedPlates, remainingPlates);
    // Sinaliza fase TRICK_PICK aos outros clientes: o jogador que jogou ainda precisa
    // resolver A2 (pegar/descartar pile anterior) antes do turno avancar.
    if (nextPhase === 'TRICK_PICK') {
      useGameStore.setState({ phase: 'TRICK_PICK', currentTurnUserId: userId });
    }
    // If I used plates in this play, update myDuelPlates from the server's remaining plates
    if (userId === user?.id && usedPlates && usedPlates.length > 0 && remainingPlates !== undefined) {
      useGameStore.setState({ myDuelPlates: remainingPlates });
    }
    playSound('play');
    const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
    const cardDesc = cards.length === 1
      ? `${cards[0].value}`
      : `${cards.length}×${cards[0].value}`;
    const plateNote = usedPlates && usedPlates.length > 0 ? ` (+${usedPlates.length} prato)` : '';
    addLog({
      type: 'play',
      userId,
      username: name,
      text: `${name} jogou ${cardDesc}${plateNote}${isSabor ? ' (Sabor!)' : ''}`,
    });
  }, [applyCardsPlayed, addLog, user?.id]));

  useSocketEvent<{ userId: string; drawnCard: Card | null; discardedCard: Card | null; drawPileCount: number }>('game:turn_passed', useCallback(({ userId, drawnCard, discardedCard, drawPileCount }) => {
    lastActionAtRef.current = Date.now();
    applyTurnPassed(userId, drawnCard, drawPileCount);
    if (discardedCard) addToDiscardPile([discardedCard]);
    playSound('pass');
    if (userId === user?.id) {
      setPickMode(false);
      setDrawnCard(null);
    }
    const { players: ps, duelPlates: dp } = useGameStore.getState();
    const name = ps.find(p => p.userId === userId)?.username ?? userId;
    const inDuel = dp !== null;
    addLog({
      type: 'pass',
      userId,
      username: name,
      text: inDuel
        ? `${name} passou`
        : drawnCard
          ? `${name} passou e comprou do monte`
          : `${name} passou (monte vazio)`,
    });
  }, [applyTurnPassed, addToDiscardPile, user?.id, addLog]));

  useSocketEvent<{ winnerId: string }>('game:wipe', useCallback(({ winnerId }) => {
    lastActionAtRef.current = Date.now();
    applyWipe(winnerId);
    playSound('wipe');
    const name = useGameStore.getState().players.find(p => p.userId === winnerId)?.username ?? winnerId;
    addLog({ type: 'wipe', userId: winnerId, username: name, text: `${name} ganhou a vaza` });
    const isMe = winnerId === user?.id;
    setTurnBanner({ name: isMe ? 'Você ganhou a vaza!' : `${name} ganhou a vaza`, isMe });
    setTimeout(() => setTurnBanner(null), 2200);
  }, [applyWipe, addLog, user?.id]));

  useSocketEvent<{ triggeredBy: string; minRequired: number }>('game:sabor_active', useCallback(({ triggeredBy, minRequired }) => {
    const name = players.find(p => p.userId === triggeredBy)?.username ?? triggeredBy;
    setSaborActive(true, minRequired, name);
    saborPopupStartedAtRef.current = Date.now();
    setSaborPopupTrigger(t => t + 1);
    playSound('sabor');
    addLog({ type: 'sabor', userId: triggeredBy, username: name, text: `Sabor ativo! Mínimo de ${minRequired} carta(s) por ${name}` });
  }, [setSaborActive, players, addLog]));

  useSocketEvent<{ brokenBy: string }>('game:sabor_broken', useCallback(({ brokenBy }) => {
    setSaborActive(false, 0);
    const name = useGameStore.getState().players.find(p => p.userId === brokenBy)?.username ?? brokenBy;
    addLog({ type: 'sabor', userId: brokenBy, username: name, text: `${name} quebrou o Sabor` });
  }, [setSaborActive, addLog]));

  useSocketEvent<{ loserId?: string; loserIds?: string[]; playerTokens: Record<string, number> }>('game:round_ended', useCallback(({ loserId, loserIds, playerTokens }) => {
    // Backend novo manda loserId (singular). loserIds (array) mantido por
    // compat — pega o primeiro como fallback.
    const realLoserId = loserId ?? loserIds?.[0];
    if (!realLoserId) return;
    applyRoundEnd([realLoserId], playerTokens);
    playSound('round_end');
    const allPlayers = useGameStore.getState().players;
    const loserName = allPlayers.find(p => p.userId === realLoserId)?.username ?? realLoserId;
    // Texto correto: o jogador que ficou com cartas eh quem PERDEU 1 prato.
    addLog({ type: 'round_end', text: `Rodada encerrada — ${loserName} ficou com cartas e perdeu 1 prato` });
    const isMe = user?.id === realLoserId;
    setTurnBanner({ name: isMe ? 'Você perdeu 1 prato' : `${loserName} perdeu 1 prato`, isMe });
    setTimeout(() => setTurnBanner(null), 2600);
    setTimeout(() => {
      const state = useGameStore.getState();
      if (state.roundSummaryData) {
        state.clearRoundSummary();
        emitSocketEvent('game:continue_round', { roomCode });
      }
    }, 6000);
  }, [applyRoundEnd, addLog, user?.id, roomCode]));

  useSocketEvent<{ readyCount: number; humanCount: number }>('game:waiting_for_continue', useCallback(({ readyCount, humanCount }) => {
    setRoundWaiting({ readyCount, humanCount });
  }, []));

  // Jogador zerou a mao e SAIU da rodada (escapou — nao perde prato).
  // Marca o jogador no store pra UI mudar (opacity reduzida, badge "fora").
  useSocketEvent<{ userId: string; remainingInRound: number }>('game:player_out_of_round', useCallback(({ userId, remainingInRound }) => {
    useGameStore.setState(s => ({
      players: s.players.map(p => p.userId === userId ? { ...p, isOutOfRound: true, cardCount: 0 } : p),
    }));
    const allPlayers = useGameStore.getState().players;
    const name = allPlayers.find(p => p.userId === userId)?.username ?? userId;
    const isMe = user?.id === userId;
    const remainingLabel = remainingInRound === 1
      ? '1 jogador ainda em rodada'
      : `${remainingInRound} jogadores ainda em rodada`;
    addLog({
      type: 'player_out',
      userId,
      username: name,
      text: isMe
        ? `Você esvaziou a mão — fora da rodada (${remainingLabel})`
        : `${name} esvaziou a mão — fora da rodada (${remainingLabel})`,
    });
  }, [addLog, user?.id]));

  useSocketEvent<{ round: number; drawPileCount: number; cardCounts: Record<string, number>; market: Card[] | null; duelPlates?: Record<string, Card[]> | null }>('game:round_started', useCallback(({ round, drawPileCount, cardCounts, market, duelPlates }) => {
    useGameStore.setState(s => ({
      round,
      drawPileCount,
      pile: [],
      discardPile: [],
      duelPlates: duelPlates ?? null,
      myDuelPlates: (duelPlates && user?.id) ? (duelPlates[user.id] ?? null) : null,
      saborActive: false,
      saborMinRequired: 0,
      saborTriggeredBy: null,
      consecutivePasses: 0,
      market: market ?? s.market,
      // NAO limpa roundSummaryData aqui: deixa o modal aberto ate o usuario
      // clicar Continuar ou o timeout de 6s no game:round_ended encerrar.
      players: s.players.map(p => ({
        ...p,
        cardCount: cardCounts[p.userId] ?? p.cardCount,
        // Nova rodada — limpa o estado "fora da rodada" para todos.
        isOutOfRound: false,
      })),
    }));
    // Log marcando inicio de rodada — sem isso, quem zerou na rodada anterior
    // ve a mao nova aparecer "do nada" e nao entende a sequencia.
    addLog({ type: 'system', text: `Rodada ${round} iniciada — todos receberam novas cartas` });
  }, [addLog, user?.id]));

  useSocketEvent<{ rankings: GameRanking[]; stats: GameStats }>('game:game_over', useCallback(({ rankings, stats }) => {
    applyGameOver(rankings, stats);
    playSound('game_over');
  }, [applyGameOver]));

  useSocketEvent<{ hand: Card[] }>('game:your_hand', useCallback(({ hand }) => {
    setMyHand(hand);
  }, [setMyHand]));

  // Kick por admin: mostra toast e redireciona para o lobby. A conexao
  // websocket sera fechada pelo backend logo apos receber este evento.
  useSocketEvent<{ message: string }>('admin:kicked', useCallback(({ message }) => {
    toast.error(message ?? 'Você foi removido da sala pelo admin.');
    navigate('/lobby');
  }, [navigate]));

  useSocketEvent<{ market: Card[] }>('game:market_updated', useCallback(({ market }) => {
    updateMarket(market);
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
  }, [updateMarket]));

  useSocketEvent<{ pile: Card[] }>('game:trick_pick_offer', useCallback(({ pile }) => {
    setTrickPile(pile);
    setTrickPickOpen(true);
  }, []));

  useSocketEvent<{ userId: string; action: 'take' | 'discard'; discardedCards: Card[]; takenCount?: number; nextTurnUserId?: string }>('game:trick_pick_result', useCallback(({ userId, action, discardedCards, takenCount, nextTurnUserId }) => {
    // Regra A2: o pick resolve a pile ANTERIOR. A pile atual contem a jogada nova
    // do mesmo jogador e permanece na mesa para o proximo jogador superar.
    useGameStore.setState(s => {
      const updates: Partial<typeof s> = { phase: 'PLAYER_TURN' };
      if (action === 'discard' && discardedCards.length > 0) {
        updates.discardPile = [...s.discardPile, ...discardedCards];
      }
      if (action === 'take' && takenCount != null) {
        updates.players = s.players.map(p =>
          p.userId === userId ? { ...p, cardCount: p.cardCount + takenCount } : p,
        );
      }
      // Forca atualizacao do turno mesmo se game:turn_started for perdido.
      if (nextTurnUserId) {
        updates.currentTurnUserId = nextTurnUserId;
      }
      return updates;
    });
    setTrickPickOpen(false);
  }, []));

  // Heartbeat de fase: backend reenvia phase+currentTurnUserId apos 10s em TRICK_PICK.
  // Se nosso estado local divergir, forca request_state para resync completo.
  useSocketEvent<{ phase: string; currentTurnUserId: string }>('game:phase_heartbeat', useCallback(({ phase: serverPhase, currentTurnUserId: serverTurn }) => {
    const { phase: localPhase, currentTurnUserId: localTurn } = useGameStore.getState();
    if (localPhase !== serverPhase || localTurn !== serverTurn) {
      emitSocketEvent('game:request_state', { roomCode });
    }
  }, [roomCode]));

  useSocketEvent<{ plates: Card[] }>('game:duel_pass_offer', useCallback(({ plates }) => {
    useGameStore.setState(s => ({ myDuelPlates: plates }));
    setDuelPickOpen(true);
  }, []));

  useSocketEvent<{ userId: string }>('game:player_hand_empty', useCallback(({ userId }) => {
    useGameStore.setState(s => ({
      players: s.players.map(p => p.userId === userId ? { ...p, cardCount: 0 } : p),
    }));
  }, []));

  useSocketEvent<{ userId: string; plateIndex: number; action: 'insert' | 'discard'; remainingPlates: Card[]; drawnCard: Card | null }>('game:duel_plate_used', useCallback(({ userId, action, remainingPlates }) => {
    useGameStore.setState(s => {
      const newDuelPlates = { ...(s.duelPlates ?? {}), [userId]: remainingPlates };
      const isMe = userId === user?.id;
      const players = action === 'insert'
        ? s.players.map(p => p.userId === userId ? { ...p, cardCount: p.cardCount + 1 } : p)
        : s.players;
      return {
        duelPlates: newDuelPlates,
        myDuelPlates: isMe ? remainingPlates : s.myDuelPlates,
        players,
      };
    });
    playSound('pass');
    const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
    addLog({
      type: 'pass',
      userId,
      username: name,
      text: action === 'insert'
        ? `${name} usou um Prato do Dia`
        : `${name} descartou um Prato do Dia`,
    });
  }, [user?.id, addLog]));

  useSocketEvent<{ code: string; message: string }>('game:error', useCallback(({ message }) => {
    toast.error(message);
    setActionPending(false);
    setPickMode(false);
    setDrawnCard(null);
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
    hasSubmittedPickRef.current = false;
    useGameStore.getState().clearSelection();
    emitSocketEvent('game:request_state', { roomCode });
  }, [roomCode]));

  // Disconnect/reconnect: so registra no log se a queda for confirmada (>5s) ou
  // se o usuario voltou depois de ter sido marcado como desconectado.
  // Evita spam tipo "X desconectou. X voltou. X desconectou. X voltou." em redes flutuantes.
  const disconnectTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const announcedDisconnectsRef = useRef<Set<string>>(new Set());
  useSocketEvent<{ userId: string }>('game:player_disconnected', useCallback(({ userId }) => {
    // Cancela timer existente (se houver)
    const existing = disconnectTimersRef.current.get(userId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
      addLog({ type: 'system', text: `${name} desconectou` });
      announcedDisconnectsRef.current.add(userId);
      disconnectTimersRef.current.delete(userId);
    }, 5000);
    disconnectTimersRef.current.set(userId, timer);
  }, [addLog]));

  useSocketEvent<{ userId: string }>('game:player_reconnected', useCallback(({ userId }) => {
    // Se reconectou antes do timer (5s), cancela o anuncio e nao fala nada
    const existing = disconnectTimersRef.current.get(userId);
    if (existing) {
      clearTimeout(existing);
      disconnectTimersRef.current.delete(userId);
      return;
    }
    // So anuncia "voltou" se "desconectou" ja foi anunciado
    if (announcedDisconnectsRef.current.has(userId)) {
      const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
      addLog({ type: 'system', text: `${name} voltou` });
      announcedDisconnectsRef.current.delete(userId);
    }
  }, [addLog]));

  useSocketEvent<{ userId: string; emoji: string }>('game:reaction', useCallback(({ userId, emoji }) => {
    addReaction(userId, emoji);
    if (userId !== user?.id) playSound('reaction');
  }, [addReaction, user?.id]));

  useSocketEvent<{ userId: string; username: string; text: string }>('game:message', useCallback(({ userId, username, text }) => {
    addLog({ type: 'chat', userId, username, text });
  }, [addLog]));

  // Sala foi resetada (host clicou "Jogar de novo"). Volta para o lobby da sala.
  useSocketEvent<{ roomCode: string }>('lobby:room_reset', useCallback(({ roomCode: rc }) => {
    toast.info('A sala foi resetada. Voltando ao lobby...');
    navigate(`/lobby/${rc}`, { replace: true });
  }, [navigate]));

  // Engine nao existe mais (servidor reiniciou ou sala foi destruida).
  // Se ja estamos em GAME_OVER, ignora — provavelmente é o cleanup pos-partida
  // e o GameOverModal ja esta aberto. So redireciona se for queda inesperada.
  useSocketEvent<{ roomCode: string; reason: string }>('game:room_closed', useCallback(({ reason }) => {
    const currentPhase = useGameStore.getState().phase;
    if (currentPhase === 'GAME_OVER' || gameOverData !== null) return;
    toast.error(reason);
    navigate('/lobby', { replace: true });
  }, [navigate, gameOverData]));

  useSocketEvent<{ rankings: GameRanking[]; room: RoomPublicState }>('lobby:game_over_summary', useCallback(({ room }) => {
    // Atualiza sessionWins dos jogadores a partir do estado atualizado da sala
    setRoomHostId(room.hostId);
    useGameStore.setState(s => ({
      players: s.players.map(p => {
        const roomPlayer = room.players.find(rp => rp.userId === p.userId);
        return roomPlayer ? { ...p, sessionWins: roomPlayer.sessionWins ?? 0 } : p;
      }),
    }));
  }, []));

  const handleSendMessage = useCallback((text: string) => {
    sendMessage(text);
    // Optimistic: add own message to log immediately
    addLog({ type: 'chat', userId: user?.id, username: user?.username ?? 'Você', text });
  }, [sendMessage, addLog, user]);

  const actionLog = useGameStore(s => s.gameLog).filter(e => e.type !== 'chat');
  const recentActions = actionLog.slice(-2);

  const selectedPlateCards = (myDuelPlates ?? []).filter((_, i) => selectedPlateIndices.includes(i));
  const canPlay = isMyTurn && phase === 'PLAYER_TURN' && selectedIndices.length > 0 && validatePlayIndicesClient(
    myHand, selectedIndices, pile, saborActive, saborMinRequired,
    selectedPlateCards.length > 0 ? selectedPlateCards : undefined,
  );

  const inGameHint = useInGameHint({
    phase,
    isMyTurn,
    pile,
    drawPileCount,
    saborActive,
    saborMinRequired,
    canPass: isMyTurn && phase === 'PLAYER_TURN' && !canPlay,
    isDuel,
    myDuelPlatesCount: myDuelPlates?.length ?? 0,
  });

  const handlePlayCards = useCallback(() => {
    setActionPending(true);
    playSelectedCards();
  }, [playSelectedCards]);

  const handleContinueRound = useCallback(() => {
    clearRoundSummary();
    setRoundWaiting(null);
    emitSocketEvent('game:continue_round', { roomCode });
  }, [clearRoundSummary, roomCode]);

  const handleTrickTake = (insertAtIndex: number) => {
    setTrickPickOpen(false);
    emitSocketEvent('game:trick_pick', { roomCode, action: 'take', insertAtIndex });
  };

  const handleTrickDiscard = () => {
    setTrickPickOpen(false);
    emitSocketEvent('game:trick_pick', { roomCode, action: 'discard' });
    // game:trick_pick_result will handle adding to discardPile for all players
  };

  const handleDuelPick = (plateIndex: number, action: 'insert' | 'discard', insertAtIndex?: number) => {
    setDuelPickOpen(false);
    emitSocketEvent('game:duel_pass_pick', { roomCode, plateIndex, action, insertAtIndex: insertAtIndex ?? 0 });
  };

  const handlePass = () => {
    // Se o cliente acha que nao pode passar mas o botao apareceu ativo,
    // o estado provavelmente esta dessincronizado com o servidor. Em vez
    // de falhar mudo (sintoma: "botao nao responde"), pedimos resync e
    // avisamos o jogador.
    if (!isMyTurn || phase !== 'PLAYER_TURN') {
      toast.info('Sincronizando o jogo...');
      requestState();
      return;
    }
    if (!isDuel && drawPileCount === 0) {
      toast.info('Monte esgotado — passando sem comprar');
    }
    setActionPending(true);
    drawCard();
  };

  const handleInsertAtIndex = (insertAtIndex: number) => {
    // Sem otimismo: aguarda o servidor confirmar via game:your_hand.
    // Evita acumulo de mao stale se eventos chegam fora de ordem.
    hasSubmittedPickRef.current = true;
    setDrawnCard(null);
    setPickMode(false);
    insertDrawnCard(insertAtIndex, 'insert');
  };

  const handleDiscardDrawn = () => {
    hasSubmittedPickRef.current = true;
    setPickMode(false);
    setDrawnCard(null);
    insertDrawnCard(0, 'discard');
  };

  const handleMarketSwap = (marketIndex: number) => {
    if (selectedHandIndexForSwap === null) return;
    swapWithMarket(selectedHandIndexForSwap, marketIndex);
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
  };

  const handleSendReaction = useCallback((emoji: string) => {
    if (reactionCooldown) return;
    const now = Date.now();
    // Flood: 3 reações em menos de 2 segundos = cooldown de 4 segundos
    const recent = reactionTimestampsRef.current.filter(t => now - t < 2000);
    if (recent.length >= 3) {
      setReactionCooldown(true);
      toast.info('Calma aí!');
      setTimeout(() => setReactionCooldown(false), 4000);
      return;
    }
    reactionTimestampsRef.current = [...reactionTimestampsRef.current.filter(t => now - t < 5000), now];
    sendReaction(emoji);
    addReaction(user?.id ?? '', emoji);
  }, [reactionCooldown, sendReaction, addReaction, user?.id]);

  const handleLeaveGame = () => setLeaveConfirmOpen(true);

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-base)] overflow-hidden select-none" data-testid="game-board">
      {/* Game header — usa AppNavbar com badges no slot center.
          mobileMinimal: no celular esconde extras (moedas, loja, admin, perfil...)
          deixando navbar com voltar + center + sair. Os badges Duelo/Espectador/
          contagem somem no mobile (ja sao redundantes: a borda da my area pulsa
          quando e meu turno, e o espectador sabe que esta espectando). */}
      <AppNavbar
        back={handleLeaveGame}
        mobileMinimal
        onHowToPlay={() => setRulesOpen(true)}
        mobileExtraActions={
          <>
            <button
              onClick={() => setRulesOpen(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]"
              style={{ color: 'var(--color-text-muted)' }}
              title="Como jogar"
              aria-label="Como jogar"
            >
              <HelpCircle size={16} />
            </button>
            <AccessBar />
          </>
        }
        center={
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-nowrap justify-center whitespace-nowrap">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest font-semibold shrink-0" style={{ color: 'var(--color-text-muted)' }}>{roomCode}</span>
            {round > 0 && (
              <span className="text-[10px] sm:text-xs bg-[var(--color-panel)] border border-[var(--color-border)] rounded-full px-1.5 py-0.5 sm:px-2 font-mono font-semibold shrink-0" style={{ color: 'var(--color-accent-mid)' }} title={`Rodada ${round}`}>
                R{round}
              </span>
            )}
            {isDuel && (
              <span className="hidden sm:inline-flex text-[10px] border rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider shrink-0" style={{ background: 'oklch(78% 0.18 80 / 0.15)', borderColor: 'oklch(78% 0.18 80 / 0.4)', color: 'var(--color-warning)' }}>
                Duelo
              </span>
            )}
            <div className="shrink min-w-0 w-32 sm:w-44">
              <TurnTimer key={timerKey} timeoutMs={timerMs} isMyTurn={isMyTurn} delayMs={timerDelay} />
            </div>
          </div>
        }
      />

      {/* Opponents — em mobile e em notebooks (altura < 900px) usa OpponentRow
          compact, que e horizontal e baixo (~50px de altura). Em monitores
          desktop com altura suficiente, usa o full vertical com fan de cartas. */}
      <div className="flex gap-1.5 px-2 py-1 [@media(min-height:900px)]:py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] overflow-x-auto snap-x snap-mandatory sm:justify-center [@media(min-height:900px)]:sm:flex-wrap [@media(min-height:900px)]:sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {opponents.map(p => {
          const handleClick = () => openPlayerDialog({
            userId: p.userId,
            username: p.username,
            avatarIndex: p.avatarIndex,
            level: p.level,
            pds: p.pds,
            isAdmin: p.isAdmin,
            isGuest: p.isGuest,
            isBot: p.isBot,
            sessionWins: p.sessionWins,
          });
          return (
            <div key={p.userId} className="snap-start shrink-0">
              {/* Compact: mobile e notebooks (qualquer largura mas altura < 900) */}
              <div className="[@media(min-height:900px)]:sm:hidden">
                <OpponentRow player={p} isCurrentTurn={p.userId === currentTurnUserId} compact onClick={handleClick} />
              </div>
              {/* Full: desktop com altura sobrando */}
              <div className="hidden [@media(min-height:900px)]:sm:block">
                <OpponentRow player={p} isCurrentTurn={p.userId === currentTurnUserId} onClick={handleClick} />
              </div>
            </div>
          );
        })}
        {opponents.length === 0 && (
          <span className="text-xs text-[var(--color-text-muted)] py-2 shrink-0">Aguardando adversários...</span>
        )}
      </div>

      {/* Center area — mantem layout flex, mas com altura reservada para overlays
          e sem overflow-y-auto que causava layout shift. Conteudo opcional usa
          min-h reservado em vez de entrar/sair do DOM. */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1.5 [@media(min-height:900px)]:gap-2 px-2 py-1.5 [@media(min-height:900px)]:py-3 sm:px-4">
        {/* Banner de eventos importantes (turno, sabor, etc.) — topo da area de mesa,
            altura reservada para nao empurrar a mesa quando entra/sai. */}
        <div className="h-7 [@media(min-height:900px)]:h-9 flex items-center justify-center w-full pointer-events-none">
          <AnimatePresence mode="wait">
            {turnBanner ? (
              <motion.div
                key={`turn-${turnBanner.name}`}
                initial={{ opacity: 0, y: -8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg border ${
                    turnBanner.isMe
                      ? 'bg-[var(--color-accent-strong)] border-[var(--color-accent-glow)] text-[var(--color-on-accent)]'
                      : 'bg-[var(--color-panel)] border-[var(--color-border)]'
                  }`}
                  style={!turnBanner.isMe ? { color: 'var(--color-text-primary)' } : {}}
                >
                  {turnBanner.name}
                </div>
              </motion.div>
            ) : saborActive ? (
              <motion.div
                key="sabor"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <SaborIndicator
                  active={saborActive}
                  minRequired={saborMinRequired}
                  triggeredBy={saborTriggeredBy ?? undefined}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <PlayArea
          pile={pile}
          drawPileCount={drawPileCount}
          discardPile={discardPile}
          saborActive={saborActive}
          saborMinRequired={saborMinRequired}
          consecutivePasses={consecutivePasses}
          pickMode={pickMode}
          isDuel={isDuel}
          leftPanel={duelPlates ? (
            <div className="flex flex-col gap-1.5 self-start pt-1 shrink-0">
              <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Pratos do Dia</span>
              {Object.entries(duelPlates).map(([playerId, plates]) => {
                const platePlayer = players.find(p => p.userId === playerId);
                const isMe = playerId === user?.id;
                return (
                  <div key={playerId} className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-text-muted truncate max-w-[80px]">{platePlayer?.username ?? '...'}</span>
                    <div className="flex gap-1">
                      {plates.length > 0 ? plates.map((card, i) => {
                        const isSelected = isMe && selectedPlateIndices.includes(i);
                        const canSelect = isMe && isMyTurn && phase === 'PLAYER_TURN';
                        return (
                          <button
                            key={card.id ?? i}
                            onClick={canSelect ? () => togglePlateSelection(i) : undefined}
                            disabled={!canSelect}
                            className={`transition-all rounded-lg ${canSelect ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'ring-2 ring-warning ring-offset-1 ring-offset-surface scale-105' : ''}`}
                          >
                            <CardComponent card={card} small disabled={!canSelect} />
                          </button>
                        );
                      }) : (
                        <span className="text-[9px] text-danger italic">sem pratos</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : undefined}
        />

        {/* Slot reservado para mensagem de pick: 20px mesmo quando vazio */}
        <div className="h-5 flex items-center justify-center w-full">
          {phase === 'TRICK_PICK' && currentTurnUserId !== user?.id && (
            <div className="text-xs text-center text-[var(--color-text-muted)] animate-pulse">
              {players.find(p => p.userId === currentTurnUserId)?.username ?? '...'} está decidindo a vaza...
            </div>
          )}
        </div>

        {/* Dica contextual in-game */}
        {hintsEnabled && (
          <div className="flex justify-center w-full">
            <InGameHint hint={inGameHint} />
          </div>
        )}

        {/* Duelo: hint de seleção de prato — só aparece se tiver pratos selecionáveis */}
        {isMyTurn && phase === 'PLAYER_TURN' && myDuelPlates && myDuelPlates.length > 0 && (
          <span className="text-[10px] text-[var(--color-warning)] text-center">
            Toque nos pratos (esq.) para combiná-los
          </span>
        )}

        {/* Mercado */}
        {market && market.length > 0 && (
          <MarketRow
            market={market}
            canSwap={isWipeWinner && marketSwapMode}
            onSwap={handleMarketSwap}
          />
        )}
        {isWipeWinner && !marketSwapMode && (
          <button
            onClick={() => setMarketSwapMode(true)}
            className="text-xs text-[var(--color-token-gold)] underline hover:no-underline transition-all"
          >
            Trocar carta com o mercado
          </button>
        )}
      </div>

      {/* My area — destaque visual forte quando e meu turno */}
      {/* isolate: cria stacking context separado para evitar compositing bug do
          Safari iOS quando SaborPopup usa backdrop-filter (duplica animacoes). */}
      <div
        className={`relative isolate shrink-0 border-t-2 bg-surface px-2 pt-1 pb-1.5 sm:px-4 [@media(min-height:900px)]:sm:pt-2 [@media(min-height:900px)]:sm:pb-3 flex flex-col transition-all ${
          isMyTurn && phase === 'PLAYER_TURN'
            ? 'border-t-[var(--color-accent-strong)] shadow-[0_-8px_24px_-4px_var(--color-accent-strong-translucent)]'
            : 'border-t-[var(--color-border)]'
        }`}
      >
        {/* Mini-historico — mobile only, altura reservada de 2 linhas para nao
            empurrar o resto quando ha 0/1/2 acoes recentes. */}
        <div className="sm:hidden flex flex-col gap-0.5 mb-1.5 pb-1.5 border-b border-[var(--color-border)]/40 min-h-[28px]">
          {recentActions.map(entry => (
            <span key={entry.id} className="text-[10px] text-[var(--color-text-muted)] truncate leading-tight">
              {entry.text}
            </span>
          ))}
        </div>
        {/* Info bar */}
        <div className="flex items-center justify-between mb-1 [@media(min-height:900px)]:mb-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => me && openPlayerDialog({
                userId: me.userId,
                username: me.username,
                avatarIndex: me.avatarIndex,
                level: me.level,
                pds: me.pds,
                isAdmin: me.isAdmin,
                isGuest: me.isGuest,
                isBot: me.isBot,
                sessionWins: me.sessionWins,
              })}
              className="flex items-center gap-2 rounded-lg p-1 -m-1 hover:bg-[var(--color-panel)] active:scale-[0.98] transition-colors"
              title="Ver detalhes"
              aria-label="Ver detalhes do jogador"
            >
              <div
                className={cn(
                  '[@media(min-height:900px)]:sm:hidden',
                  isMyTurn && phase === 'PLAYER_TURN' ? 'ring-2 ring-accent-strong ring-offset-2 ring-offset-surface rounded-full animate-pulse' : '',
                )}
                style={{ width: 36, height: 36, flexShrink: 0 }}
              >
                <AvatarWithBorder index={me?.avatarIndex ?? 0} level={me?.level ?? 1} size={36} />
              </div>
              <div
                className={cn(
                  'hidden [@media(min-height:900px)]:sm:block',
                  isMyTurn && phase === 'PLAYER_TURN' ? 'ring-2 ring-accent-strong ring-offset-2 ring-offset-surface rounded-full animate-pulse' : '',
                )}
                style={{ width: 52, height: 52, flexShrink: 0 }}
              >
                <AvatarWithBorder index={me?.avatarIndex ?? 0} level={me?.level ?? 1} size={52} />
              </div>
              <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {me?.username ?? 'Você'}
              </span>
              <LevelBadge level={me?.level ?? 1} size="xs" />
              <MedalBadge count={me?.sessionWins ?? 0} />
            </button>
            {isMyTurn && phase === 'PLAYER_TURN' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-strong)] text-[var(--color-on-accent)] font-bold uppercase tracking-wider shadow-[0_0_8px_var(--color-accent-strong-glow)]">
                Sua vez
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {me && <TokenDisplay tokens={me.tokensLeft} size="sm" playerId={me.userId} />}
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{myHand.length} cartas</span>
          </div>
        </div>

        {/* Drawn card prompt — overlay flutuante absoluto, nao empurra Hand/ActionBar */}
        <AnimatePresence>
          {pickMode && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-30 flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-xl bg-[var(--color-panel)] border border-[var(--color-warning)]/40 max-w-[calc(100vw-16px)] sm:w-fit shadow-lg"
            >
              {drawnCard ? (
                <>
                  <CardComponent card={drawnCard} small />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">Carta comprada</span>
                    <span className="text-[11px] sm:text-xs text-[var(--color-warning)] font-medium whitespace-nowrap">Toque numa barra ↓</span>
                  </div>
                  <button
                    onClick={handleDiscardDrawn}
                    className="px-2 py-1 text-xs rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-all shrink-0"
                  >
                    Descartar
                  </button>
                </>
              ) : (
                <span className="text-xs text-[var(--color-text-muted)]">Monte vazio — você passa sem comprar</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hand — sempre renderiza o mesmo componente para evitar remount/flick
            quando entra/sai pickMode. */}
        <div className="relative pb-1.5 pt-1 [@media(min-height:900px)]:pb-3 [@media(min-height:900px)]:pt-2 overflow-visible">
          {me?.isOutOfRound ? (
            // Quando o jogador zerou a mao, mostra um banner grande em vez
            // da area de cartas vazia. Esclarece o estado e seta expectativa.
            <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-dashed border-[var(--color-accent-soft)]/40 bg-[var(--color-accent-strong)]/5">
              <span className="text-2xl">🍣</span>
              <span className="text-sm font-semibold text-[var(--color-accent-mid)]">
                Mão zerada — você escapou!
              </span>
              <span className="text-xs text-[var(--color-text-muted)] text-center max-w-xs leading-relaxed">
                Agora é só torcer. Quem ficar com cartas vai perder 1 prato.
              </span>
            </div>
          ) : (
            <>
              <PlayerHand
                hand={myHand}
                isMyTurn={isMyTurn}
                pickMode={pickMode}
                onPickInsert={pickMode ? handleInsertAtIndex : undefined}
                dealMode={isDealAnimating}
              />
              {isMyTurn && selectedIndices.length > 0 && !canPlay && pile.length > 0 && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-3 -translate-y-full z-20">
                  <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface)]/95 backdrop-blur-sm border border-[var(--color-warning)]/50 text-[var(--color-warning)] shadow-lg whitespace-nowrap">
                    Precisa de mais cartas ou valor maior para superar
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {!pickMode && !marketSwapMode && (
          <div className="mt-1.5 flex flex-col gap-1.5">
            {/* ActionBar (jogar/passar) some quando o jogador esta out-of-round
                — ele nao tem acoes. Mas historico/reacoes/chat continuam. */}
            {!me?.isOutOfRound && (
              <ActionBar
                isMyTurn={isMyTurn}
                pile={pile}
                drawPileCount={drawPileCount}
                onPlay={handlePlayCards}
                onPass={handlePass}
                canPlay={canPlay}
                isDuel={isDuel}
                myDuelPlatesCount={myDuelPlates?.length ?? 0}
              />
            )}
            {/* Linha inferior: historico (esq) + emojis (centro) + chat (dir).
                Sempre visivel — mesmo fora da rodada o jogador interage. */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => historyRef.current?.toggle()}
                className="w-9 h-9 rounded-full bg-[var(--color-panel)] hover:bg-[var(--color-surface)] hover:scale-110 active:scale-95 transition-all border border-[var(--color-border)] flex items-center justify-center shrink-0"
                title="Histórico de jogadas"
                aria-label="Histórico de jogadas"
                data-testid="game-history-toggle"
              >
                <History size={15} className="text-[var(--color-text-muted)]" />
              </button>
              <div className="flex-1 min-w-0">
                <ReactionBar onReact={handleSendReaction} disabled={reactionCooldown} />
              </div>
              <button
                onClick={() => chatRef.current?.toggle()}
                className="w-9 h-9 rounded-full bg-[var(--color-panel)] hover:bg-[var(--color-surface)] hover:scale-110 active:scale-95 transition-all border border-[var(--color-border)] flex items-center justify-center shrink-0"
                title="Chat"
                aria-label="Chat"
                data-testid="game-chat-toggle"
              >
                <MessageSquare size={15} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
          </div>
        )}

        {/* Market swap */}
        {marketSwapMode && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-xs text-[var(--color-token-gold)]">
              {selectedHandIndexForSwap === null
                ? 'Escolha uma carta da sua mão para trocar'
                : 'Agora escolha uma carta do mercado acima'}
            </p>
            <div className="overflow-x-auto w-full">
              <PlayerHand
                hand={myHand}
                isMyTurn={true}
                swapSelectIndex={selectedHandIndexForSwap}
                onSwapSelect={setSelectedHandIndexForSwap}
              />
            </div>
            <button
              onClick={() => { setMarketSwapMode(false); setSelectedHandIndexForSwap(null); }}
              className="text-xs text-[var(--color-text-muted)] underline"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Game action history (left) + chat (right). Triggers mobile internos
          ocultos: a navbar (via mobileExtraActions) oferece os botoes equivalentes. */}
      <ActionHistoryPanel externalToggleRef={historyRef} hideTriggers />
      <ChatPanel
        onSendMessage={handleSendMessage}
        myUserId={user?.id ?? ''}
        externalToggleRef={chatRef}
        hideTriggers
      />


      {/* Reactions overlay — dedicated zone above reaction bar */}
      <div className="fixed bottom-24 right-3 sm:right-16 flex flex-col-reverse gap-1.5 z-40 pointer-events-none items-end min-w-[96px]">
        <AnimatePresence>
          {reactions.map((r) => {
            const p = players.find(pl => pl.userId === r.userId);
            const isMe = r.userId === user?.id;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.3 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="bg-[var(--color-panel)]/90 backdrop-blur-sm border border-[var(--color-border)] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <span className="text-xl">{r.emoji}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">
                    {isMe ? 'Você' : (p?.username ?? '...')}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Sabor popup — fullscreen, auto-dismiss após 1700ms */}
      <SaborPopup
        trigger={saborPopupTrigger}
        triggeredBy={saborTriggeredBy ?? undefined}
      />

      {/* Modals */}
      {roundSummaryData && !gameOverData && (
        <RoundSummary
          loserIds={roundSummaryData.loserIds}
          playerTokens={roundSummaryData.playerTokens}
          players={players}
          onClose={handleContinueRound}
          waitingCount={roundWaiting?.readyCount}
          waitingTotal={roundWaiting?.humanCount}
        />
      )}

      {gameOverData && (
        <GameOverModal
          rankings={gameOverData.rankings}
          myUserId={user?.id ?? ''}
          isHost={roomHostId === user?.id}
          onPlayAgain={roomHostId === user?.id ? () => {
            // So emite o reset. O redirect acontece pra TODOS via o
            // broadcast lobby:room_reset (inclusive pro proprio host),
            // garantindo que ninguem navegue antes da sala resetar.
            emitSocketEvent('lobby:reset_room', { roomCode });
          } : undefined}
        />
      )}

      <TrickPickModal
        open={trickPickOpen}
        pile={trickPile}
        myHand={myHand}
        onTake={handleTrickTake}
        onDiscard={handleTrickDiscard}
      />

      <DuelPassPickModal
        open={duelPickOpen}
        plates={myDuelPlates ?? []}
        myHand={myHand}
        onPick={handleDuelPick}
      />

      <Modal open={leaveConfirmOpen} onClose={() => setLeaveConfirmOpen(false)} title="Sair da partida?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Você vai abandonar a partida. Os outros jogadores continuarão sem você.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setLeaveConfirmOpen(false)}>Cancelar</Button>
            <Button
              className="bg-[var(--color-danger)] hover:opacity-90 text-white border-0"
              onClick={() => {
                emitSocketEvent('lobby:leave_room', { roomCode });
                navigate('/lobby');
              }}
            >
              Sair mesmo assim
            </Button>
          </div>
        </div>
      </Modal>

      {/* Como jogar — disparado pela navbar mobile in-game */}
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />

      {/* Player details — abre ao clicar em qualquer player na tela */}
      <PlayerDetailsDialog
        open={!!playerDialogUserId}
        onClose={closePlayerDialog}
        userId={playerDialogUserId}
        snapshot={playerDialogSnapshot}
      />
    </div>
  );
}
