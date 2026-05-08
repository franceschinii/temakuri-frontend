import { useEffect } from 'react';
import { onSocketEvent, emitSocketEvent } from '../lib/socket';

export function useSocketEvent<T = unknown>(event: string, handler: (data: T) => void) {
  useEffect(() => {
    const unsubscribe = onSocketEvent<T>(event, handler);
    return unsubscribe;
  }, [event, handler]);
}

export { emitSocketEvent };
