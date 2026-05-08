import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import type { Card, ClientGameState, GameRanking, GameStats } from '@/types/game';
import { validatePlayIndicesClient } from '@/lib/gameRules';

export function GameBoard() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const {
    phase, myHand, players, pile, market, saborActive, saborMinRequired,
    currentTurnUserId, consecutivePasses, selectedIndices,
    syncState, setMyHand, applyCardsPlayed, applyTurnPassed, applyWipe,
    setSaborActive, applyRoundEnd, applyGameOver, clearRoundSummary,
    roundSummaryData, gameOverData, addReaction, reactions, updateMarket,
  } = useGameStore();

  const { playSelectedCards, passTurn, requestState } = useGame(roomCode!);

  const [timerMs, setTimerMs] = useState(30_000);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPileIndex, setPickedPileIndex] = useState<number | null>(null);

  const isMyTurn = user?.id === currentTurnUserId;
  const me = players.find(p => p.userId === user?.id);
  const opponents = players.filter(p => p.userId !== user?.id);

  useEffect(() => {
    if (roomCode) requestState();
  }, [roomCode]);

  useSocketEvent<{ state: ClientGameState }>('game:state_sync', useCallback(({ state }) => {
    syncState(state);
    setPickMode(false);
    setPickedPileIndex(null);
  }, [syncState]));

  useSocketEvent<{ userId: string; timeoutMs: number }>('game:turn_started', useCallback(({ userId, timeoutMs }) => {
    useGameStore.setState({ currentTurnUserId: userId });
    setTimerMs(timeoutMs);
    setPickMode(false);
    setPickedPileIndex(null);
  }, []));

  useSocketEvent<{ userId: string; cards: Card[]; isSabor: boolean }>('game:cards_played', useCallback(({ userId, cards, isSabor }) => {
    applyCardsPlayed(userId, cards, isSabor);
  }, [applyCardsPlayed]));

  useSocketEvent<{ userId: string; pickedCard: Card }>('game:turn_passed', useCallback(({ userId, pickedCard }) => {
    applyTurnPassed(userId, pickedCard);
    if (userId === user?.id) setPickMode(false);
  }, [applyTurnPassed, user?.id]));

  useSocketEvent<{ winnerId: string }>('game:wipe', useCallback(({ winnerId }) => {
    applyWipe(winnerId);
  }, [applyWipe]));

  useSocketEvent<{ triggeredBy: string; minRequired: number }>('game:sabor_active', useCallback(({ minRequired }) => {
    setSaborActive(true, minRequired);
  }, [setSaborActive]));

  useSocketEvent<{ brokenBy: string }>('game:sabor_broken', useCallback(() => {
    setSaborActive(false, 0);
  }, [setSaborActive]));

  useSocketEvent<{ loserIds: string[]; playerTokens: Record<string, number> }>('game:round_ended', useCallback(({ loserIds, playerTokens }) => {
    applyRoundEnd(loserIds, playerTokens);
  }, [applyRoundEnd]));

  useSocketEvent<{ rankings: GameRanking[]; stats: GameStats }>('game:game_over', useCallback(({ rankings, stats }) => {
    applyGameOver(rankings, stats);
  }, [applyGameOver]));

  useSocketEvent<{ hand: Card[] }>('game:your_hand', useCallback(({ hand }) => {
    setMyHand(hand);
  }, [setMyHand]));

  useSocketEvent<{ market: Card[] }>('game:market_updated', useCallback(({ market }) => {
    updateMarket(market);
  }, [updateMarket]));

  useSocketEvent<{ userId: string; emoji: string }>('game:reaction', useCallback(({ userId, emoji }) => {
    addReaction(userId, emoji);
  }, [addReaction]));

  const canPlay = isMyTurn && selectedIndices.length > 0 && validatePlayIndicesClient(
    myHand, selectedIndices, pile, saborActive, saborMinRequired,
  );

  const handlePass = () => {
    if (pile.length === 0) return;
    setPickMode(true);
    setPickedPileIndex(null);
  };

  const handlePickPileCard = (index: number) => {
    setPickedPileIndex(index);
  };

  const handleInsertAtIndex = (insertAtIndex: number) => {
    if (pickedPileIndex === null) return;
    passTurn(pickedPileIndex, insertAtIndex);
    setPickMode(false);
    setPickedPileIndex(null);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-base)] overflow-hidden">
      {/* Opponents */}
      <div className="flex gap-3 justify-center flex-wrap p-3 border-b border-[var(--color-border)]">
        {opponents.map(p => (
          <OpponentRow key={p.userId} player={p} isCurrentTurn={p.userId === currentTurnUserId} />
        ))}
      </div>

      {/* Center area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <SaborIndicator
          active={saborActive}
          minRequired={saborMinRequired}
          triggeredBy={players.find(p => p.userId === currentTurnUserId)?.username}
        />

        {isMyTurn && (
          <TurnTimer timeoutMs={timerMs} isMyTurn={isMyTurn} />
        )}

        <PlayArea
          pile={pile}
          saborActive={saborActive}
          saborMinRequired={saborMinRequired}
          consecutivePasses={consecutivePasses}
          pickMode={pickMode}
          pickedIndex={pickedPileIndex}
          onPickCard={handlePickPileCard}
        />
      </div>

      {/* My info bar */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {me?.username ?? 'Você'}
          </span>
          {me && <TokenDisplay tokens={me.tokensLeft} size="sm" />}
          <span className="text-xs text-[var(--color-text-muted)]">{myHand.length} cartas</span>
        </div>

        {/* Hand */}
        <div className="overflow-x-auto pb-1">
          {pickMode ? (
            <PlayerHand
              hand={myHand}
              isMyTurn={isMyTurn}
              pickMode={true}
              pileToPickFrom={pile}
              pickedPileIndex={pickedPileIndex}
              onPickInsert={handleInsertAtIndex}
            />
          ) : (
            <PlayerHand hand={myHand} isMyTurn={isMyTurn} />
          )}
        </div>

        {/* Action bar */}
        {!pickMode && (
          <div className="mt-2">
            <ActionBar
              isMyTurn={isMyTurn}
              pile={pile}
              onPlay={playSelectedCards}
              onPass={handlePass}
              canPlay={canPlay}
            />
          </div>
        )}
      </div>

      {/* Reactions overlay */}
      <AnimatePresence>
        {reactions.map(r => {
          const p = players.find(pl => pl.userId === r.userId);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -60 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[var(--color-panel)] px-3 py-1.5 rounded-full text-lg shadow-lg pointer-events-none"
            >
              {r.emoji} <span className="text-xs text-[var(--color-text-muted)]">{p?.username}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>

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
    </div>
  );
}
