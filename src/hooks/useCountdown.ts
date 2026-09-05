"use client";

import { useState, useCallback, useRef } from "react";

interface UseCountdownReturn {
  count: number | null;
  isRunning: boolean;
  start: (from: number, onComplete: () => void) => void;
  cancel: () => void;
}

export function useCountdown(): UseCountdownReturn {
  const [count, setCount] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCount(null);
    setIsRunning(false);
  }, []);

  const start = useCallback(
    (from: number, onComplete: () => void) => {
      cancel();
      setIsRunning(true);
      setCount(from);

      let current = from;
      timerRef.current = setInterval(() => {
        current -= 1;
        if (current <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setCount(null);
          setIsRunning(false);
          onComplete();
        } else {
          setCount(current);
        }
      }, 1000);
    },
    [cancel]
  );

  return { count, isRunning, start, cancel };
}
