let socket: WebSocket | null = null;
let currentToken: string | null = null;
let intentionalClose = false;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Map<string, Set<(data: unknown) => void>>();
const reconnectCallbacks = new Set<() => void>();

// Outbox limitado: descarta eventos antigos se acumular demais durante queda
const MAX_OUTBOX = 20;
const outbox: string[] = [];

// Sem limite de tentativas — reconecta indefinidamente com backoff máximo de 30s
function scheduleReconnect() {
  if (intentionalClose || !currentToken) return;
  if (reconnectTimer) return; // já agendado
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30_000);
  reconnectAttempts++;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (!intentionalClose && currentToken) connectSocket(currentToken);
  }, delay);
}

function clearReconnectTimer() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

export function isSocketConnected(): boolean {
  return socket !== null && socket.readyState === WebSocket.OPEN;
}

export function getSocket(): WebSocket | null {
  return socket;
}

// Callback chamado toda vez que o socket reconecta com sucesso
export function onReconnect(cb: () => void): () => void {
  reconnectCallbacks.add(cb);
  return () => reconnectCallbacks.delete(cb);
}

export function reconnectSocket(token: string) {
  currentToken = token;
  reconnectAttempts = 0;
  intentionalClose = true;
  clearReconnectTimer();
  if (socket) { socket.close(); socket = null; }
  outbox.length = 0;
  intentionalClose = false;
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
    clearReconnectTimer();

    // Drena o outbox na reconexão
    const ws = socket;
    if (!ws) return;
    while (outbox.length > 0) {
      ws.send(outbox.shift()!);
    }

    // Notifica listeners de reconexão (ex: game:request_state)
    reconnectCallbacks.forEach(cb => cb());
  });

  socket.addEventListener('message', (event) => {
    try {
      const { event: eventName, data } = JSON.parse(event.data as string);
      const handlers = listeners.get(eventName);
      if (handlers) handlers.forEach(fn => fn(data));
    } catch {
      // ignora mensagens malformadas
    }
  });

  socket.addEventListener('error', () => {
    // close event cuida da reconexão
  });

  socket.addEventListener('close', () => {
    socket = null;
    if (!intentionalClose) scheduleReconnect();
  });

  return socket;
}

export function disconnectSocket(intentional = true) {
  intentionalClose = intentional;
  clearReconnectTimer();
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
    // Descarta os mais antigos se o outbox estiver cheio
    if (outbox.length >= MAX_OUTBOX) outbox.shift();
    outbox.push(payload);
  }
}
