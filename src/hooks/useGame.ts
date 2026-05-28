import { useCallback } from 'react';
import { emitSocketEvent } from '../lib/socket';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';

export function useGame(roomCode: string) {
  const selectedIndices = useGameStore(s => s.selectedIndices);
  const selectedPlateIndices = useGameStore(s => s.selectedPlateIndices);
  const myHand = useGameStore(s => s.myHand);
  const pile = useGameStore(s => s.pile);
  const phase = useGameStore(s => s.phase);
  const currentTurnUserId = useGameStore(s => s.currentTurnUserId);
  const clearSelection = useGameStore(s => s.clearSelection);
  const userId = useAuthStore(s => s.user?.id);

  const playSelectedCards = useCallback(() => {
    if (selectedIndices.length === 0 && selectedPlateIndices.length === 0) return;
    if (phase !== 'PLAYER_TURN') return;
    // Fix #6: guard contra race condition — se entre render e click o turno
    // virou de outro jogador, não enviar (backend rejeitaria com "Not the
    // right phase" e o toast confundiria o usuário).
    if (!userId || currentTurnUserId !== userId) return;
    const payload: { roomCode: string; cardIndices: number[]; plateIndices?: number[] } = {
      roomCode,
      cardIndices: selectedIndices,
    };
    if (selectedPlateIndices.length > 0) {
      payload.plateIndices = selectedPlateIndices;
    }
    emitSocketEvent('game:play_cards', payload);
    clearSelection();
  }, [roomCode, selectedIndices, selectedPlateIndices, phase, currentTurnUserId, userId, clearSelection]);

  const drawCard = useCallback(() => {
    if (phase !== 'PLAYER_TURN') return;
    // Fix #6: mesmo guard pra Passar (que internamente faz drawCard).
    if (!userId || currentTurnUserId !== userId) return;
    emitSocketEvent('game:draw_card', { roomCode });
  }, [roomCode, phase, currentTurnUserId, userId]);

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
