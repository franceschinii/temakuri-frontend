import { useEffect, useState } from 'react';
import { useSocketEvent } from './useSocket';
import api from '@/lib/api';

/**
 * Numero total de jogadores online (usuarios unicos com pelo menos uma
 * conexao ativa). Backend envia 'presence:count' no handshake e a cada
 * mudanca (throttled em 1s). Se o componente monta depois do handshake
 * o valor inicial vem do REST GET /presence/online.
 */
export function useOnlineCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/presence/online')
      .then(({ data }) => { if (!cancelled) setCount(data?.online ?? null); })
      .catch(() => { /* silently ignore — socket pode entregar depois */ });
    return () => { cancelled = true; };
  }, []);

  useSocketEvent<{ online: number }>('presence:count', ({ online }) => {
    setCount(online);
  });
  return count;
}
