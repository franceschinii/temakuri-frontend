import { useEffect, useRef } from 'react';
import { onSocketEvent, emitSocketEvent } from '../lib/socket';

export function useSocketEvent<T = unknown>(event: string, handler: (data: T) => void) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });
  useEffect(() => {
    let mounted = true;
    const stable = (data: T) => { if (mounted) handlerRef.current(data); };
    const unsubscribe = onSocketEvent<T>(event, stable);
    return () => { mounted = false; unsubscribe(); };
  }, [event]);
}

export { emitSocketEvent };
