import { useState, useEffect, useCallback } from 'react';

/**
 * Countdown hook. Takes a target timestamp (ms).
 * Returns { days, hours, minutes, seconds, isExpired, isReady }.
 */
export function useCountdown(targetTimestamp) {
  const [timeLeft, setTimeLeft] = useState(null);

  const calculate = useCallback(() => {
    if (!targetTimestamp) return null;

    const now = Date.now();
    const diff = targetTimestamp - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
    };
  }, [targetTimestamp]);

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(calculate());
    const interval = setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, calculate]);

  return {
    ...(timeLeft || { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false }),
    isReady: timeLeft !== null,
  };
}

export default useCountdown;
