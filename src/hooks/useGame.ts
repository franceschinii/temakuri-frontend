import { useCallback } from 'react';
import { emitSocketEvent } from '../lib/socket';
import { useGameStore } from '../stores/gameStore';

export function useGame(roomCode: string) {
  const selectedIndices = useGameStore(s => s.selectedIndices);
  const selectedPlateIndices = useGameStore(s => s.selectedPlateIndices);
  const myHand = useGameStore(s => s.myHand);
  const pile = useGameStore(s => s.pile);
  const phase = useGameStore(s => s.phase);
  const currentTurnUserId = useGameStore(s => s.currentTurnUserId);
  const clearSelection = useGameStore(s => s.clearSelection);

  const playSelectedCards = useCallback(() => {
    if (selectedIndices.length === 0) return;
    if (phase !== 'PLAYER_TURN') return;
    const payload: { roomCode: string; cardIndices: number[]; plateIndices?: number[] } = {
      roomCode,
      cardIndices: selectedIndices,
    };
    if (selectedPlateIndices.length > 0) {
      payload.plateIndices = selectedPlateIndices;
    }
    emitSocketEvent('game:play_cards', payload);
    clearSelection();
  }, [roomCode, selectedIndices, selectedPlateIndices, phase, clearSelection]);

  const drawCard = useCallback(() => {
    if (phase !== 'PLAYER_TURN') return;
    emitSocketEvent('game:draw_card', { roomCode });
  }, [roomCode, phase]);

  const insertDrawnCard = useCallback((insertAtIndex: number, action: 'insert' | 'discard' = 'insert') => {
    emitSocketEvent('game:insert_drawn_card', { roomCode, insertAtIndex, action });
  }, [roomCode]);

  const swapWithMarket = useCallback((handIndex: number, marketIndex: number) => {
    emitSocketEvent('game:market_swap', { roomCode, handIndex, marketIndex });
  }, [roomCode]);

  const sendReaction = useCallback((emoji: string) => {
    emitSocketEvent('game:send_reaction', { roomCode, emoji });
  }, [roomCode]);

  const sendMessage = useCallback((text: string) => {
    emitSocketEvent('game:send_message', { roomCode, text });
  }, [roomCode]);

  const requestState = useCallback(() => {
    emitSocketEvent('game:request_state', { roomCode });
  }, [roomCode]);

  return { playSelectedCards, drawCard, insertDrawnCard, swapWithMarket, sendReaction, sendMessage, requestState };
}
