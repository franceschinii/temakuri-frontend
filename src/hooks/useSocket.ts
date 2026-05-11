import { useEffect, useRef } from 'react';
import { onSocketEvent, emitSocketEvent } from '../lib/socket';

export function useSocketEvent<T = unknown>(event: string, handler: (data: T) => void) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    const stable = (data: T) => handlerRef.current(data);
    return onSocketEvent<T>(event, stable);
  }, [event]);
}

export { emitSocketEvent };
