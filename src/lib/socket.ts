let socket: WebSocket | null = null;
let currentToken: string | null = null;
let intentionalClose = false;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let heartbeatPendingPong = false;

const listeners = new Map<string, Set<(data: unknown) => void>>();
const outbox: string[] = [];

const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL_MS = 25_000;
const HEARTBEAT_TIMEOUT_MS = 5_000;

function clearTimers() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
}

function startHeartbeat() {
  clearTimers();
  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    heartbeatPendingPong = true;
    emitSocketEvent('ping', {});
    setTimeout(() => {
      if (heartbeatPendingPong && !intentionalClose) {
        socket?.close();
        scheduleReconnect();
      }
    }, HEARTBEAT_TIMEOUT_MS);
  }, HEARTBEAT_INTERVAL_MS);
}

function scheduleReconnect() {
  if (intentionalClose || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS || !currentToken) return;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 16_000);
  reconnectAttempts++;
  reconnectTimer = setTimeout(() => {
    if (!intentionalClose && currentToken) connectSocket(currentToken);
  }, delay);
}

export function isSocketConnected(): boolean {
  return socket !== null && socket.readyState === WebSocket.OPEN;
}

export function getSocket(): WebSocket | null {
  return socket;
}

export function reconnectSocket(token: string) {
  currentToken = token;
  reconnectAttempts = 0;
  intentionalClose = false;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    socket.close();
    socket = null;
  }
  connectSocket(token);
}

export function connectSocket(token: string): WebSocket {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  currentToken = token;
  intentionalClose = false;

  const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/ws';
  socket = new WebSocket(`${wsUrl}?token=${token}`);

  socket.addEventListener('open', () => {
    reconnectAttempts = 0;
    startHeartbeat();
    const ws = socket;
    if (!ws) return;
    while (outbox.length > 0) {
      const payload = outbox.shift()!;
      ws.send(payload);
    }
  });

  socket.addEventListener('message', (event) => {
    try {
      const { event: eventName, data } = JSON.parse(event.data as string);
      if (eventName === 'pong') { heartbeatPendingPong = false; return; }
      const handlers = listeners.get(eventName);
      if (handlers) handlers.forEach(fn => fn(data));
    } catch {
      // ignore malformed messages
    }
  });

  socket.addEventListener('error', () => {
    // silent — close event will handle reconnect
  });

  socket.addEventListener('close', () => {
    clearTimers();
    socket = null;
    if (!intentionalClose) scheduleReconnect();
  });

  return socket;
}

export function disconnectSocket(intentional = true) {
  intentionalClose = intentional;
  clearTimers();
  socket?.close();
  socket = null;
  outbox.length = 0;
  if (intentional) listeners.clear();
}

export function onSocketEvent<T = unknown>(event: string, handler: (data: T) => void): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler as (data: unknown) => void);
  return () => listeners.get(event)?.delete(handler as (data: unknown) => void);
}

export function emitSocketEvent(event: string, data: unknown) {
  const payload = JSON.stringify({ event, data });
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(payload);
  } else {
    outbox.push(payload);
  }
}
