import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { AccessBar } from '@/components/ui/AccessBar';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { startMusic, stopMusic } from '@/lib/music';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
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
import type { Card, ClientGameState, GameRanking, GameStats } from '@/types/game';
import { validatePlayIndicesClient } from '@/lib/gameRules';
import { playSound } from '@/lib/sounds';
import { toast } from 'sonner';

export function GameBoard() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const {
    phase, round, myHand, players, pile, market, saborActive, saborMinRequired, saborTriggeredBy,
    currentTurnUserId, consecutivePasses, selectedIndices, discardPile, duelPlates, myDuelPlates,
    syncState, setMyHand, applyCardsPlayed, applyTurnPassed, applyWipe, drawPileCount,
    setSaborActive, applyRoundEnd, applyGameOver, clearRoundSummary, addToDiscardPile, reset,
    roundSummaryData, gameOverData, addReaction, reactions, updateMarket, addLog,
    musicEnabled,
  } = useGameStore();

  const { playSelectedCards, drawCard, insertDrawnCard, swapWithMarket, sendReaction, sendMessage, requestState } = useGame(roomCode!);

  const [timerMs, setTimerMs] = useState(30_000);
  const [timerKey, setTimerKey] = useState(0);
  const [reactionCooldown, setReactionCooldown] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
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

  const isMyTurn = user?.id === currentTurnUserId;
  const me = players.find(p => p.userId === user?.id);
  const opponents = players.filter(p => p.userId !== user?.id);
  const isWipeWinner = phase === 'PLAYER_TURN' && market !== null && currentTurnUserId === user?.id && pile.length === 0;

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
    // Only reset pick mode if we haven't submitted yet OR the server is no longer in PASS_PICK
    if (state.phase !== 'PASS_PICK' || hasSubmittedPickRef.current) {
      setPickMode(false);
      setDrawnCard(null);
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
    useGameStore.setState({ currentTurnUserId: userId });
    setTimerMs(timeoutMs);
    setTimerKey(k => k + 1);
    setPickMode(false);
    setDrawnCard(null);
    // Não fechar o TrickPickModal aqui — ele fecha quando o jogador confirma a ação
    // para evitar que o modal desapareça antes de o jogador escolher a posição
    hasSubmittedPickRef.current = false;
    // Resyncs if hand appears empty mid-game (lost game:your_hand event)
    const { myHand, phase } = useGameStore.getState();
    if (myHand.length === 0 && phase !== 'GAME_OVER' && phase !== 'ROUND_END') {
      emitSocketEvent('game:request_state', { roomCode });
    }
  }, [roomCode]));

  useSocketEvent<{ userId: string; cards: Card[]; isSabor: boolean }>('game:cards_played', useCallback(({ userId, cards, isSabor }) => {
    applyCardsPlayed(userId, cards, isSabor);
    playSound('play');
    const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
    const cardDesc = cards.length === 1
      ? `${cards[0].value}`
      : `${cards.length}×${cards[0].value}`;
    addLog({
      type: 'play',
      userId,
      username: name,
      text: `${name} jogou ${cardDesc}${isSabor ? ' 🔥' : ''}`,
    });
  }, [applyCardsPlayed, addLog]));

  useSocketEvent<{ userId: string; drawnCard: Card | null; discardedCard: Card | null; drawPileCount: number }>('game:turn_passed', useCallback(({ userId, drawnCard, discardedCard, drawPileCount }) => {
    applyTurnPassed(userId, drawnCard, drawPileCount);
    if (discardedCard) addToDiscardPile([discardedCard]);
    playSound('pass');
    if (userId === user?.id) {
      setPickMode(false);
      setDrawnCard(null);
    }
    const name = useGameStore.getState().players.find(p => p.userId === userId)?.username ?? userId;
    addLog({
      type: 'pass',
      userId,
      username: name,
      text: drawnCard ? `${name} passou e comprou do monte` : `${name} passou (monte vazio)`,
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
    addLog({ type: 'round_end', text: `🏁 Rodada encerrada — ${loserNames.join(', ')} perde${loserIds.length === 1 ? '' : 'm'} 1 Prato` });
  }, [applyRoundEnd, addLog]));

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
    if (action === 'discard' && discardedCards.length > 0) {
      addToDiscardPile(discardedCards);
    }
    if (action === 'take' && takenCount != null) {
      useGameStore.setState(s => ({
        players: s.players.map(p =>
          p.userId === userId ? { ...p, cardCount: p.cardCount + takenCount } : p,
        ),
      }));
    }
    setTrickPickOpen(false);
  }, [addToDiscardPile]));

  useSocketEvent<{ plates: Card[] }>('game:duel_pass_offer', useCallback(({ plates }) => {
    useGameStore.setState(s => ({ myDuelPlates: plates }));
    setDuelPickOpen(true);
  }, []));

  useSocketEvent<{ userId: string }>('game:player_hand_empty', useCallback(({ userId }) => {
    useGameStore.setState(s => ({
      players: s.players.map(p => p.userId === userId ? { ...p, cardCount: 0 } : p),
    }));
  }, []));

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

  const handleSendMessage = useCallback((text: string) => {
    sendMessage(text);
    // Optimistic: add own message to log immediately
    addLog({ type: 'chat', userId: user?.id, username: user?.username ?? 'Você', text });
  }, [sendMessage, addLog, user]);

  const canPlay = isMyTurn && selectedIndices.length > 0 && validatePlayIndicesClient(
    myHand, selectedIndices, pile, saborActive, saborMinRequired,
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
    if (drawPileCount === 0) {
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
    sendReaction(emoji);
    addReaction(user?.id ?? '', emoji);

    const newCount = reactionCount + 1;
    if (newCount >= 5) {
      setReactionCooldown(true);
      setReactionCount(0);
      setTimeout(() => setReactionCooldown(false), 3000);
    } else {
      setReactionCount(newCount);
    }
  }, [reactionCooldown, reactionCount, sendReaction, addReaction, user?.id]);

  const handleLeaveGame = () => setLeaveConfirmOpen(true);

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-[var(--color-base)] overflow-hidden select-none">
      {/* Turn banner */}
      <AnimatePresence>
        {turnBanner && (
          <motion.div
            key={turnBanner.name}
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
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
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-2 py-3 sm:px-4">
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
            <div className="flex gap-3 justify-center flex-wrap">
              {Object.entries(duelPlates).map(([playerId, plates]) => {
                const player = players.find(p => p.userId === playerId);
                return (
                  <div key={playerId} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{player?.username ?? '...'}</span>
                    <div className="flex gap-1">
                      {plates.length > 0 ? plates.map((card, i) => (
                        <CardComponent key={card.id ?? i} card={card} small disabled />
                      )) : (
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
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4 flex flex-col">
        {/* Info bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {me?.username ?? 'Você'}
            </span>
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
              <button
                onClick={handleDiscardDrawn}
                className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors shrink-0"
              >
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hand */}
        <div className="pb-1 pt-4 overflow-hidden">
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

        {/* Actions */}
        {!pickMode && !marketSwapMode && (
          <div className="mt-2 flex flex-col gap-2">
            <ActionBar
              isMyTurn={isMyTurn}
              pile={pile}
              drawPileCount={drawPileCount}
              onPlay={playSelectedCards}
              onPass={handlePass}
              canPlay={canPlay}
            />
            {isMyTurn && selectedIndices.length > 0 && !canPlay && pile.length > 0 && (
              <p className="text-xs text-center text-[var(--color-warning)]">
                Jogada inválida — precisa de mais cartas ou valor maior
              </p>
            )}
            <ReactionBar onReact={handleSendReaction} disabled={reactionCooldown} usesLeft={5 - reactionCount} />
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
      <div className="fixed bottom-28 right-16 flex flex-col-reverse gap-1.5 z-40 pointer-events-none items-end min-w-[96px]">
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

      {gameOverData && (
        <GameOverModal
          rankings={gameOverData.rankings}
          myUserId={user?.id ?? ''}
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
