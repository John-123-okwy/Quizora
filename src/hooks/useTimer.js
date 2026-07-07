import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds, onExpire, isActive = true) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  const intervalRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Only set the real starting time once, the moment the timer becomes active
  useEffect(() => {
    if (isActive && !initializedRef.current && initialSeconds > 0) {
      setSecondsLeft(initialSeconds);
      initializedRef.current = true;
    }
  }, [isActive, initialSeconds]);

  useEffect(() => {
    if (!isActive) return undefined;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  return { secondsLeft, stopTimer };
}