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
  reset: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: [],
  currentRoom: null,
  readyMap: {},

  setRooms: (rooms) => set({ rooms }),

  setCurrentRoom: (room) => set({ currentRoom: room, readyMap: {} }),

  updateRoom: (room) =>
    set((s) => ({
      currentRoom: s.currentRoom?.code === room.code ? room : s.currentRoom,
      rooms: s.rooms.map(r => r.code === room.code ? room : r),
    })),

  setPlayerReady: (userId, ready) =>
    set((s) => ({ readyMap: { ...s.readyMap, [userId]: ready } })),

  reset: () => set({ currentRoom: null, readyMap: {} }),
}));
