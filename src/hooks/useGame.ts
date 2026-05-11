import { useCallback } from 'react';
import { emitSocketEvent } from '../lib/socket';
import { useGameStore } from '../stores/gameStore';

export function useGame(roomCode: string) {
  const selectedIndices = useGameStore(s => s.selectedIndices);
  const myHand = useGameStore(s => s.myHand);
  const pile = useGameStore(s => s.pile);
  const phase = useGameStore(s => s.phase);
  const currentTurnUserId = useGameStore(s => s.currentTurnUserId);
  const clearSelection = useGameStore(s => s.clearSelection);

  const playSelectedCards = useCallback(() => {
    if (selectedIndices.length === 0) return;
    emitSocketEvent('game:play_cards', { roomCode, cardIndices: selectedIndices });
    clearSelection();
  }, [roomCode, selectedIndices, clearSelection]);

  const drawCard = useCallback(() => {
    emitSocketEvent('game:draw_card', { roomCode });
  }, [roomCode]);

  const insertDrawnCard = useCallback((insertAtIndex: number) => {
    emitSocketEvent('game:insert_drawn_card', { roomCode, insertAtIndex });
  }, [roomCode]);

  const swapWithMarket = useCallback((handIndex: number, marketIndex: number) => {
    emitSocketEvent('game:market_swap', { roomCode, handIndex, marketIndex });
  }, [roomCode]);

  const sendReaction = useCallback((emoji: string) => {
    emitSocketEvent('game:send_reaction', { roomCode, emoji });
  }, [roomCode]);

  const requestState = useCallback(() => {
    emitSocketEvent('game:request_state', { roomCode });
  }, [roomCode]);

  return { playSelectedCards, drawCard, insertDrawnCard, swapWithMarket, sendReaction, requestState };
}
