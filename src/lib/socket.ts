let socket: WebSocket | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();

export function getSocket(): WebSocket | null {
  return socket;
}

export function connectSocket(token: string): WebSocket {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/ws';
  socket = new WebSocket(`${wsUrl}?token=${token}`);

  socket.addEventListener('message', (event) => {
    try {
      const { event: eventName, data } = JSON.parse(event.data);
      const handlers = listeners.get(eventName);
      if (handlers) handlers.forEach(fn => fn(data));
    } catch {
      // ignore malformed messages
    }
  });

  socket.addEventListener('close', () => {
    socket = null;
  });

  return socket;
}

export function disconnectSocket() {
  socket?.close();
  socket = null;
  listeners.clear();
}

export function onSocketEvent<T = unknown>(event: string, handler: (data: T) => void): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler as (data: unknown) => void);
  return () => listeners.get(event)?.delete(handler as (data: unknown) => void);
}

export function emitSocketEvent(event: string, data: unknown) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  }
}
