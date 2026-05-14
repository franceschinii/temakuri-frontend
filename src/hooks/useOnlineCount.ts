import { useState } from 'react';
import { useSocketEvent } from './useSocket';

/**
 * Numero total de jogadores online (usuarios unicos com pelo menos uma
 * conexao ativa). Backend envia 'presence:count' no handshake e a cada
 * mudanca (throttled em 1s).
 */
export function useOnlineCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useSocketEvent<{ online: number }>('presence:count', ({ online }) => {
    setCount(online);
  });
  return count;
}
