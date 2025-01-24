import { useState, useEffect, useCallback } from 'react';

export const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const calculateNextRun = useCallback((now: Date) => {
    const next = new Date(now);
    next.setUTCMinutes(0, 0, 0);
    const currentHour = next.getUTCHours();
    const nextTargetHour = (Math.floor(currentHour / 6) * 6 + 6) % 24;

    next.setUTCHours(nextTargetHour);

    if (next <= now) {
      next.setUTCHours(next.getUTCHours() + 6);
      if (next.getUTCHours() >= 24) {
        next.setUTCDate(next.getUTCDate() + 1);
        next.setUTCHours(next.getUTCHours() - 24);
      }
    }

    return next;
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const next = calculateNextRun(now);
      setTimeLeft(Math.max(0, next.getTime() - now.getTime()));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [calculateNextRun]);

  return { timeLeft };
};