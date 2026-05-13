import { create } from 'zustand';
import type { RoomPublicState } from '../types/game';

interface LobbyState {
  rooms: RoomPublicState[];
  currentRoom: RoomPublicState | null;
  readyMap: Record<string, boolean>;

  setRooms: (rooms: RoomPublicState[]) => void;
  setCurrentRoom: (room: RoomPublicState | null) => void;
  updateRoom: (room: RoomPublicState) => void;
  setPlayerReady: (userId: string, ready: boolean) => void;
  setReadySnapshot: (userIds: string[]) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: [],
  currentRoom: null,
  readyMap: {},

  setRooms: (rooms) => set({ rooms }),

  setCurrentRoom: (room) => set((s) => {
    const sameRoom = room && s.currentRoom?.code === room.code;
    const wasInProgress = s.currentRoom?.status === 'IN_PROGRESS';
    const nowWaiting = room?.status === 'WAITING';
    const keepReady = sameRoom && !(wasInProgress && nowWaiting);
    return { currentRoom: room, readyMap: keepReady ? s.readyMap : {} };
  }),

  updateRoom: (room) =>
    set((s) => {
      const isCurrent = s.currentRoom?.code === room.code;
      const wasInProgress = s.currentRoom?.status === 'IN_PROGRESS';
      const nowWaiting = room.status === 'WAITING';
      return {
        currentRoom: isCurrent ? room : s.currentRoom,
        rooms: s.rooms.map(r => r.code === room.code ? room : r),
        // Clear ready state when room resets to WAITING after a game
        readyMap: isCurrent && wasInProgress && nowWaiting ? {} : s.readyMap,
      };
    }),

  setPlayerReady: (userId, ready) =>
    set((s) => ({ readyMap: { ...s.readyMap, [userId]: ready } })),

  // Substitui o readyMap inteiro pelo snapshot do servidor (usado ao entrar em sala).
  setReadySnapshot: (userIds) =>
    set(() => {
      const map: Record<string, boolean> = {};
      for (const id of userIds) map[id] = true;
      return { readyMap: map };
    }),

  reset: () => set({ currentRoom: null, readyMap: {} }),
}));
