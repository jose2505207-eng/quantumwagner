"use client";
import { useState, useEffect } from "react";

export function useCountdown(targetDate: string) {
  const target = new Date(targetDate).getTime();

  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = target - Date.now();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(() => {
        const diff = target - Date.now();
        return diff > 0 ? diff : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: timeLeft === 0 };
}
