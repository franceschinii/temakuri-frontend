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
import type { Card, ClientGameState, GameRanking, GameStats } from '@/types/game';
import { validatePlayIndicesClient } from '@/lib/gameRules';
import { playSound } from '@/lib/sounds';

export function GameBoard() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const {
    phase, round, myHand, players, pile, market, saborActive, saborMinRequired, saborTriggeredBy,
    currentTurnUserId, consecutivePasses, selectedIndices,
    syncState, setMyHand, applyCardsPlayed, applyTurnPassed, applyWipe, drawPileCount,
    setSaborActive, applyRoundEnd, applyGameOver, clearRoundSummary,
    roundSummaryData, gameOverData, addReaction, reactions, updateMarket,
  } = useGameStore();

  const { playSelectedCards, passTurn, swapWithMarket, sendReaction, requestState } = useGame(roomCode!);

  const [timerMs, setTimerMs] = useState(30_000);
  const [pickMode, setPickMode] = useState(false);
  const [marketSwapMode, setMarketSwapMode] = useState(false);
  const [selectedHandIndexForSwap, setSelectedHandIndexForSwap] = useState<number | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [turnBanner, setTurnBanner] = useState<{ name: string; isMe: boolean } | null>(null);
  const prevTurnRef = useRef<string>('');

  const isMyTurn = user?.id === currentTurnUserId;
  const me = players.find(p => p.userId === user?.id);
  const opponents = players.filter(p => p.userId !== user?.id);
  const isWipeWinner = phase === 'PLAYER_TURN' && market !== null && currentTurnUserId === user?.id && pile.length === 0;

  useEffect(() => {
    startMusic('game');
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (roomCode) requestState();
  }, [roomCode]);

  // Notifica meu turno + banner de turno
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
    setPickMode(false);
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
  }, [syncState]));

  useSocketEvent<{ userId: string; timeoutMs: number }>('game:turn_started', useCallback(({ userId, timeoutMs }) => {
    useGameStore.setState({ currentTurnUserId: userId });
    setTimerMs(timeoutMs);
    setPickMode(false);
  }, []));

  useSocketEvent<{ userId: string; cards: Card[]; isSabor: boolean }>('game:cards_played', useCallback(({ userId, cards, isSabor }) => {
    applyCardsPlayed(userId, cards, isSabor);
    playSound('play');
  }, [applyCardsPlayed]));

  useSocketEvent<{ userId: string; drawnCard: Card | null; drawPileCount: number }>('game:turn_passed', useCallback(({ userId, drawnCard, drawPileCount }) => {
    applyTurnPassed(userId, drawnCard, drawPileCount);
    playSound('pass');
    if (userId === user?.id) setPickMode(false);
  }, [applyTurnPassed, user?.id]));

  useSocketEvent<{ winnerId: string }>('game:wipe', useCallback(({ winnerId }) => {
    applyWipe(winnerId);
    playSound('wipe');
  }, [applyWipe]));

  useSocketEvent<{ triggeredBy: string; minRequired: number }>('game:sabor_active', useCallback(({ triggeredBy, minRequired }) => {
    const name = players.find(p => p.userId === triggeredBy)?.username ?? triggeredBy;
    setSaborActive(true, minRequired, name);
    playSound('sabor');
  }, [setSaborActive, players]));

  useSocketEvent<{ brokenBy: string }>('game:sabor_broken', useCallback(() => {
    setSaborActive(false, 0);
  }, [setSaborActive]));

  useSocketEvent<{ loserIds: string[]; playerTokens: Record<string, number> }>('game:round_ended', useCallback(({ loserIds, playerTokens }) => {
    applyRoundEnd(loserIds, playerTokens);
    playSound('round_end');
  }, [applyRoundEnd]));

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

  useSocketEvent<{ userId: string; emoji: string }>('game:reaction', useCallback(({ userId, emoji }) => {
    addReaction(userId, emoji);
  }, [addReaction]));

  const canPlay = isMyTurn && selectedIndices.length > 0 && validatePlayIndicesClient(
    myHand, selectedIndices, pile, saborActive, saborMinRequired,
  );

  const handlePass = () => {
    setPickMode(true);
  };

  const handleInsertAtIndex = (insertAtIndex: number) => {
    passTurn(insertAtIndex);
    setPickMode(false);
  };

  const handleMarketSwap = (marketIndex: number) => {
    if (selectedHandIndexForSwap === null) return;
    swapWithMarket(selectedHandIndexForSwap, marketIndex);
    setMarketSwapMode(false);
    setSelectedHandIndexForSwap(null);
  };

  const handleLeaveGame = () => setLeaveConfirmOpen(true);

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-base)] overflow-hidden select-none">
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-widest">{roomCode}</span>
          {round > 0 && (
            <span className="text-[10px] bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-1.5 py-0.5 font-mono">
              R{round}
            </span>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <TurnTimer timeoutMs={timerMs} isMyTurn={isMyTurn} />
        </div>
        <div className="flex items-center gap-1">
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
          saborActive={saborActive}
          saborMinRequired={saborMinRequired}
          consecutivePasses={consecutivePasses}
          pickMode={pickMode}
        />

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
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4">
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

        {/* Hand — pt-4 gives room for selected cards that rise via -translate-y */}
        <div className="pb-1 pt-4">
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

        {/* Cancel pick mode */}
        {pickMode && (
          <div className="mt-2 flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => setPickMode(false)}>
              Cancelar
            </Button>
          </div>
        )}

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
            {isMyTurn && (
              <ReactionBar onReact={sendReaction} />
            )}
          </div>
        )}

        {/* Market swap: select hand card */}
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

      {/* Reactions overlay — float above center play area */}
      <AnimatePresence>
        {reactions.map((r) => {
          const p = players.find(pl => pl.userId === r.userId);
          // stable hash from reaction id to avoid jumps as others expire
          const hash = r.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const xOff = ((hash % 3) - 1) * 15; // spread -15vw, 0, +15vw
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.3, y: 30 }}
              animate={{ opacity: 1, scale: 1.2, y: -30 }}
              exit={{ opacity: 0, scale: 0.6, y: -80 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="fixed top-[38%] pointer-events-none z-30"
              style={{ left: `calc(50% + ${xOff}vw)`, transform: 'translateX(-50%)' }}
            >
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
                <span className="text-2xl">{r.emoji}</span>
                {p && <span className="text-xs text-[var(--color-text-muted)]">{p.username}</span>}
              </div>
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
