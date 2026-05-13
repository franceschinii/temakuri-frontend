import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AccessBar } from '@/components/ui/AccessBar';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { startMusic, stopMusic } from '@/lib/music';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { onReconnect } from '@/lib/socket';
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
import { ChatPanel } from './ChatPanel';
import { RulesDialog } from './RulesDialog';
import { CardComponent } from './CardComponent';
import { TrickPickModal } from './TrickPickModal';
import { DuelPassPickModal } from './DuelPassPickModal';
import { MedalBadge } from '@/components/ui/MedalBadge';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import type { Card, ClientGameState, GameRanking, GameStats, RoomPublicState } from '@/types/game';
import { validatePlayIndicesClient } from '@/lib/gameRules';
import { playSound } from '@/lib/sounds';
import { toast } from 'sonner';

export function GameBoard() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const {
    phase, mode, round, myHand, players, pile, market, saborActive, saborMinRequired, saborTriggeredBy,
    currentTurnUserId, consecutivePasses, selectedIndices, selectedPlateIndices, discardPile, duelPlates, myDuelPlates,
    syncState, setMyHand, applyCardsPlayed, applyTurnPassed, applyWipe, drawPileCount,
    setSaborActive, applyRoundEnd, applyGameOver, clearRoundSummary, addToDiscardPile, reset,
    roundSummaryData, gameOverData, addReaction, reactions, updateMarket, addLog,
    musicEnabled, togglePlateSelection,
  } = useGameStore();

  const { playSelectedCards, drawCard, insertDrawnCard, swapWithMarket, sendReaction, sendMessage, requestState } = useGame(roomCode!);

  const [timerMs, setTimerMs] = useState(30_000);
  const [timerKey, setTimerKey] = useState(0);
  const [reactionCooldown, setReactionCooldown] = useState(false);
  const reactionTimestampsRef = useRef<number[]>([]);
  const [pickMode, setPickMode] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const hasSubmittedPickRef = useRef(false);
  const [marketSwapMode, setMarketSwapMode] = useState(false);
  const [selectedHandIndexForSwap, setSelectedHandIndexForSwap] = useState<number | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [turnBanner, setTurnBanner] = useState<{ name: string; isMe: boolean } | null>(null);
  const [trickPickOpen, setTrickPickOpen] = useState(false);
  const [trickPile, setTrickPile] = useState<Card[]>([]);
  const [duelPickOpen, setDuelPickOpen] = useState(false);
  const prevTurnRef = useRef<string>('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [roomHostId, setRoomHostId] = useState<string | null>(null);

  const isMyTurn = user?.id === currentTurnUserId;
  const me = players.find(p => p.userId === user?.id);
  const opponents = players.filter(p => p.userId !== user?.id);
  const isWipeWinner = phase === 'PLAYER_TURN' && market !== null && currentTurnUserId === user?.id && pile.length === 0;
  const isDuel = players.filter(p => !p.isEliminated).length === 2 || duelPlates !== null;

  useEffect(() => {
    if (musicEnabled) startMusic('game');
    return () => {
      stopMusic();
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

  useSocketEvent<{ state: ClientGameState; spectatorCount?: number; isSpectator?: boolean }>('game:state_sync', useCallback(({ state, spectatorCount: sc, isSpectator: isSp }) => {
    syncState(state);
    if (sc !== undefined) setSpectatorCount(sc);
    if (isSp !== undefined) setIsSpectator(isSp);
    // Only reset pick mode if we haven't submitted yet OR the server is no longer in PASS_PICK
    if (state.phase !== 'PASS_PICK' || hasSubmittedPickRef.current) {
      setPickMode(false);
      setDrawnCard(null);
    }
    if (state.phase !== 'DUEL_PASS_PICK') {
      setDuelPickOpen(false);
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

  useSocketEvent<{ userId: string; timeoutMs: number; spectatorCount?: number }>('game:turn_started', useCallback(({ userId, timeoutMs, spectatorCount: sc }) => {
    useGameStore.setState({ currentTurnUserId: userId, selectedIndices: [] });
    setTimerMs(timeoutMs);
    setTimerKey(k => k + 1);
    setPickMode(false);
    setDrawnCard(null);
    hasSubmittedPickRef.current = false;
    if (sc !== undefined) setSpectatorCount(sc);
    // Resyncs if hand appears empty mid-game (lost game:your_hand event)
    const { myHand, phase } = useGameStore.getState();
    if (myHand.length === 0 && phase !== 'GAME_OVER' && phase !== 'ROUND_END') {
      emitSocketEvent('game:request_state', { roomCode });
    }
  }, [roomCode]));

  useSocketEvent<{ userId: string; cards: Card[]; isSabor: boolean; usedPlates?: Card[]; remainingPlates?: Card[] }>('game:cards_played', useCallback(({ userId, cards, isSabor, usedPlates, remainingPlates }) => {
    applyCardsPlayed(userId, cards, isSabor, usedPlates, remainingPlates);
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
      text: `${name} jogou ${cardDesc}${plateNote}${isSabor ? ' 🔥' : ''}`,
    });
  }, [applyCardsPlayed, addLog, user?.id]));

  useSocketEvent<{ userId: string; drawnCard: Card | null; discardedCard: Card | null; drawPileCount: number }>('game:turn_passed', useCallback(({ userId, drawnCard, discardedCard, drawPileCount }) => {
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
    applyWipe(winnerId);
    playSound('wipe');
    const name = useGameStore.getState().players.find(p => p.userId === winnerId)?.username ?? winnerId;
    addLog({ type: 'wipe', userId: winnerId, username: name, text: `${name} ganhou a vaza! 🧹` });
  }, [applyWipe, addLog]));

  useSocketEvent<{ triggeredBy: string; minRequired: number }>('game:sabor_active', useCallback(({ triggeredBy, minRequired }) => {
    const name = players.find(p => p.userId === triggeredBy)?.username ?? triggeredBy;
    setSaborActive(true, minRequired, name);
    playSound('sabor');
    addLog({ type: 'sabor', userId: triggeredBy, username: name, text: `🔥 Sabor ativo! Mínimo de ${minRequired} carta(s) por ${name}` });
  }, [setSaborActive, players, addLog]));

  useSocketEvent<{ brokenBy: string }>('game:sabor_broken', useCallback(({ brokenBy }) => {
    setSaborActive(false, 0);
    const name = useGameStore.getState().players.find(p => p.userId === brokenBy)?.username ?? brokenBy;
    addLog({ type: 'sabor', userId: brokenBy, username: name, text: `${name} quebrou o Sabor` });
  }, [setSaborActive, addLog]));

  useSocketEvent<{ loserIds: string[]; playerTokens: Record<string, number> }>('game:round_ended', useCallback(({ loserIds, playerTokens }) => {
    applyRoundEnd(loserIds, playerTokens);
    playSound('round_end');
    const allPlayers = useGameStore.getState().players;
    const loserNames = loserIds.map(id => allPlayers.find(p => p.userId === id)?.username ?? id);
    addLog({ type: 'round_end', text: `🏁 Rodada encerrada — ${loserNames.join(', ')} esvaziou a mão e ganhou a rodada` });
  }, [applyRoundEnd, addLog]));

  useSocketEvent<{ round: number; drawPileCount: number; cardCounts: Record<string, number>; market: Card[] | null }>('game:round_started', useCallback(({ round, drawPileCount, cardCounts, market }) => {
    useGameStore.setState(s => ({
      round,
      drawPileCount,
      pile: [],
      saborActive: false,
      saborMinRequired: 0,
      saborTriggeredBy: null,
      consecutivePasses: 0,
      market: market ?? s.market,
      players: s.players.map(p => ({
        ...p,
        cardCount: cardCounts[p.userId] ?? p.cardCount,
      })),
    }));
  }, []));

  useSocketEvent<{ rankings: GameRanking[]; stats: GameStats }>('game:game_over', useCallback(({ rankings, stats }) => {
    applyGameOver(rankings, stats);
    playSound('game_over');
  }, [applyGameOver]));

  useSocketEvent<{ hand: Card[] }>('game:your_hand', useCallback(({ hand }) => {
    setMyHand(hand);
  }, [setMyHand]));

  useSocketEvent<{ market: Card[] }>('game:market_updated', useCallback(({ market }) => {
    updateMarket(market);
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
  }, [updateMarket]));

  useSocketEvent<{ pile: Card[] }>('game:trick_pick_offer', useCallback(({ pile }) => {
    setTrickPile(pile);
    setTrickPickOpen(true);
  }, []));

  useSocketEvent<{ userId: string; action: 'take' | 'discard'; discardedCards: Card[]; takenCount?: number }>('game:trick_pick_result', useCallback(({ userId, action, discardedCards, takenCount }) => {
    useGameStore.setState(s => {
      const updates: Partial<typeof s> = { pile: [] };
      if (action === 'discard' && discardedCards.length > 0) {
        updates.discardPile = [...s.discardPile, ...discardedCards];
      }
      if (action === 'take' && takenCount != null) {
        updates.players = s.players.map(p =>
          p.userId === userId ? { ...p, cardCount: p.cardCount + takenCount } : p,
        );
      }
      return updates;
    });
    setTrickPickOpen(false);
  }, []));

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
      const newDuelPlates = s.duelPlates ? { ...s.duelPlates, [userId]: remainingPlates } : null;
      const isMe = userId === user?.id;
      return {
        duelPlates: newDuelPlates,
        myDuelPlates: isMe ? remainingPlates : s.myDuelPlates,
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
    emitSocketEvent('game:request_state', { roomCode });
  }, [roomCode]));

  // Disconnection/reconnection go to game log, not toast
  useSocketEvent<{ userId: string }>('game:player_disconnected', useCallback(({ userId }) => {
    const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
    addLog({ type: 'system', text: `${name} desconectou` });
  }, [addLog]));

  useSocketEvent<{ userId: string }>('game:player_reconnected', useCallback(({ userId }) => {
    const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
    addLog({ type: 'system', text: `${name} voltou` });
  }, [addLog]));

  useSocketEvent<{ userId: string; emoji: string }>('game:reaction', useCallback(({ userId, emoji }) => {
    addReaction(userId, emoji);
  }, [addReaction]));

  useSocketEvent<{ userId: string; username: string; text: string }>('game:message', useCallback(({ userId, username, text }) => {
    addLog({ type: 'chat', userId, username, text });
  }, [addLog]));

  useSocketEvent<{ roomCode: string }>('game:spectator_mode', useCallback(() => {
    setIsSpectator(true);
  }, []));

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
    if (!isMyTurn || phase !== 'PLAYER_TURN') return;
    if (!isDuel && drawPileCount === 0) {
      toast.info('Monte esgotado — passando sem comprar');
    }
    drawCard();
  };

  const handleInsertAtIndex = (insertAtIndex: number) => {
    hasSubmittedPickRef.current = true;
    if (drawnCard) {
      const optimistic = [...myHand];
      optimistic.splice(insertAtIndex, 0, drawnCard);
      setMyHand(optimistic);
    }
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
    <div className="flex flex-col h-dvh bg-[var(--color-base)] overflow-hidden select-none">
      {/* Turn banner */}
      <AnimatePresence>
        {turnBanner && (
          <motion.div
            key={turnBanner.name}
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg border ${
              turnBanner.isMe
                ? 'bg-[var(--color-accent-strong)] border-[var(--color-accent-glow)] text-white'
                : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-primary)]'
            }`}>
              {turnBanner.name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-widest">{roomCode}</span>
          {round > 0 && (
            <span className="text-[10px] bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-1.5 py-0.5 font-mono">
              R{round}
            </span>
          )}
          {isDuel && (
            <span className="text-[10px] bg-[var(--color-warning)]/15 border border-[var(--color-warning)]/40 text-[var(--color-warning)] rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider">
              Duelo
            </span>
          )}
          {isSpectator && (
            <span className="text-[10px] bg-[var(--color-accent-mid)]/15 border border-[var(--color-accent-mid)]/40 text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider">
              Espectador
            </span>
          )}
          {!isSpectator && spectatorCount > 0 && (
            <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5" title={`${spectatorCount} espectador${spectatorCount !== 1 ? 'es' : ''}`}>
              👁 {spectatorCount}
            </span>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <TurnTimer key={timerKey} timeoutMs={timerMs} isMyTurn={isMyTurn} />
        </div>
        <div className="flex items-center gap-1">
          <RulesDialog />
          <AccessBar />
          <button
            onClick={handleLeaveGame}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-panel)] transition-all"
            title="Sair da partida"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Opponents */}
      <div className="flex gap-1.5 justify-center flex-wrap px-2 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        {opponents.map(p => (
          <OpponentRow key={p.userId} player={p} isCurrentTurn={p.userId === currentTurnUserId} />
        ))}
        {opponents.length === 0 && (
          <span className="text-xs text-[var(--color-text-muted)] py-2">Aguardando oponentes...</span>
        )}
      </div>

      {/* Center area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 px-2 py-3 sm:px-4 overflow-y-auto">
        <AnimatePresence>
          {saborActive && (
            <SaborIndicator
              active={saborActive}
              minRequired={saborMinRequired}
              triggeredBy={saborTriggeredBy ?? undefined}
            />
          )}
        </AnimatePresence>

        <PlayArea
          pile={pile}
          drawPileCount={drawPileCount}
          discardPile={discardPile}
          saborActive={saborActive}
          saborMinRequired={saborMinRequired}
          consecutivePasses={consecutivePasses}
          pickMode={pickMode}
          isDuel={isDuel}
        />

        {phase === 'TRICK_PICK' && currentTurnUserId !== user?.id && (
          <div className="text-xs text-center text-[var(--color-text-muted)] animate-pulse">
            {players.find(p => p.userId === currentTurnUserId)?.username ?? '...'} está escolhendo...
          </div>
        )}

        {/* Duelo: Pratos do Dia */}
        {duelPlates && (
          <div className="flex flex-col gap-1 w-full max-w-md">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] text-center font-medium">Pratos do Dia</span>
            {isMyTurn && phase === 'PLAYER_TURN' && myDuelPlates && myDuelPlates.length > 0 && (
              <span className="text-[10px] text-[var(--color-warning)] text-center">
                Selecione pratos para combinar com cartas da mão
              </span>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              {Object.entries(duelPlates).map(([playerId, plates]) => {
                const player = players.find(p => p.userId === playerId);
                const isMe = playerId === user?.id;
                return (
                  <div key={playerId} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{player?.username ?? '...'}</span>
                    <div className="flex gap-1">
                      {plates.length > 0 ? plates.map((card, i) => {
                        const isSelected = isMe && selectedPlateIndices.includes(i);
                        const canSelect = isMe && isMyTurn && phase === 'PLAYER_TURN' && !isSpectator;
                        return (
                          <button
                            key={card.id ?? i}
                            onClick={canSelect ? () => togglePlateSelection(i) : undefined}
                            disabled={!canSelect}
                            className={`transition-all rounded-lg ${canSelect ? 'cursor-pointer' : 'cursor-default'} ${
                              isSelected
                                ? 'ring-2 ring-[var(--color-warning)] ring-offset-1 ring-offset-[var(--color-surface)] scale-105'
                                : ''
                            }`}
                          >
                            <CardComponent card={card} small disabled={!canSelect} />
                          </button>
                        );
                      }) : (
                        <span className="text-[10px] text-[var(--color-danger)] italic">sem pratos</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

      {/* My area */}
      <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 pt-1.5 pb-2 sm:px-4 sm:pt-2 sm:pb-3 flex flex-col">
        {/* Mini-histórico — mobile only, acima da info bar */}
        {recentActions.length > 0 && (
          <div className="sm:hidden flex flex-col gap-0.5 mb-1.5 pb-1.5 border-b border-[var(--color-border)]/40">
            {recentActions.map(entry => (
              <span key={entry.id} className="text-[10px] text-[var(--color-text-muted)] truncate leading-tight">
                {entry.text}
              </span>
            ))}
          </div>
        )}
        {/* Info bar */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <AvatarWithBorder index={me?.avatarIndex ?? 0} level={me?.level ?? 1} size={24} />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {me?.username ?? 'Você'}
            </span>
            <LevelBadge level={me?.level ?? 1} size="xs" />
            <MedalBadge count={me?.sessionWins ?? 0} />
            {isMyTurn && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-strong)] text-[var(--color-text-primary)] font-medium">
                Seu turno
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {me && <TokenDisplay tokens={me.tokensLeft} size="sm" />}
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{myHand.length} cartas</span>
          </div>
        </div>

        {/* Drawn card reveal + insertion prompt */}
        <AnimatePresence>
          {pickMode && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="self-center flex items-center gap-3 mb-2 px-3 py-2 rounded-xl bg-[var(--color-panel)] border border-[var(--color-warning)]/40 w-fit"
            >
              {drawnCard ? (
                <>
                  <CardComponent card={drawnCard} small />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Carta do monte</span>
                    <span className="text-xs text-[var(--color-warning)] font-medium">Clique numa barra para inserir</span>
                  </div>
                  <button
                    onClick={handleDiscardDrawn}
                    className="px-2 py-1 text-xs rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-all shrink-0"
                  >
                    Descartar
                  </button>
                </>
              ) : (
                <span className="text-xs text-[var(--color-text-muted)]">Monte vazio — passe sem comprar</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hand — oculta para espectadores */}
        {!isSpectator && (
          <div className="pb-3 pt-2 overflow-visible">
            {pickMode ? (
              <PlayerHand
                hand={myHand}
                isMyTurn={isMyTurn}
                pickMode={true}
                onPickInsert={handleInsertAtIndex}
              />
            ) : (
              <PlayerHand hand={myHand} isMyTurn={isMyTurn} />
            )}
          </div>
        )}

        {/* Actions — ocultas para espectadores */}
        {!isSpectator && !pickMode && !marketSwapMode && (
          <div className="mt-1.5 flex flex-col gap-1.5">
            <ActionBar
              isMyTurn={isMyTurn}
              pile={pile}
              drawPileCount={drawPileCount}
              onPlay={playSelectedCards}
              onPass={handlePass}
              canPlay={canPlay}
              isDuel={isDuel}
              myDuelPlatesCount={myDuelPlates?.length ?? 0}
            />
            {isMyTurn && selectedIndices.length > 0 && !canPlay && pile.length > 0 && (
              <p className="text-xs text-center text-[var(--color-warning)]">
                Jogada inválida — precisa de mais cartas ou valor maior
              </p>
            )}
            <ReactionBar onReact={handleSendReaction} disabled={reactionCooldown} />
          </div>
        )}

        {/* Market swap */}
        {marketSwapMode && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-xs text-[var(--color-token-gold)]">
              {selectedHandIndexForSwap === null
                ? 'Clique em uma carta da sua mão para selecionar'
                : 'Agora clique em uma carta do mercado acima'}
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

      {/* Game action history (left) + chat (right) */}
      <ActionHistoryPanel />
      <ChatPanel onSendMessage={handleSendMessage} myUserId={user?.id ?? ''} />

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

      {/* Modals */}
      {roundSummaryData && (
        <RoundSummary
          loserIds={roundSummaryData.loserIds}
          playerTokens={roundSummaryData.playerTokens}
          players={players}
          onClose={clearRoundSummary}
        />
      )}

      {/* Spectator notice — non-blocking, stays at bottom */}
      {isSpectator && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-accent-mid)]/40 bg-[var(--color-surface)]/90 backdrop-blur-sm shadow-lg text-xs text-[var(--color-text-muted)]">
            <span className="text-[var(--color-accent-mid)]">👁</span>
            Você está assistindo — aguardando a próxima rodada para entrar
          </div>
        </div>
      )}

      {gameOverData && (
        <GameOverModal
          rankings={gameOverData.rankings}
          myUserId={user?.id ?? ''}
          onPlayAgain={roomHostId === user?.id ? () => {
            emitSocketEvent('lobby:reset_room', { roomCode });
            navigate(`/lobby/${roomCode}`, { state: { isMatchmaking: false } });
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
            Você abandonará a partida em andamento. Os outros jogadores continuarão sem você.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setLeaveConfirmOpen(false)}>Cancelar</Button>
            <Button
              className="bg-[var(--color-danger)] hover:opacity-90 text-white border-0"
              onClick={() => navigate('/lobby')}
            >
              Sair mesmo assim
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
