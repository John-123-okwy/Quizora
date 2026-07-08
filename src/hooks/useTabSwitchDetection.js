import { useState, useEffect, useRef, useCallback } from 'react';

export function useTabSwitchDetection(isActive = true) {
  const [switchCount, setSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const violationsRef = useRef([]); // { timestamp: number }

  useEffect(() => {
    if (!isActive) return undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationsRef.current.push({ timestamp: Date.now() });
        setSwitchCount((prev) => prev + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  const getViolations = useCallback(() => {
    return violationsRef.current.map((v) => v.timestamp);
  }, []);

  return { switchCount, showWarning, dismissWarning, getViolations };
}