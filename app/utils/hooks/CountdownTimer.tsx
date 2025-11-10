"use client";
import React from "react";
import { useCountdown } from "./useCountDown";

interface CountdownProps {
  endTime: string;
}

export default function CountdownTimer({ endTime }: CountdownProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);

  if (isExpired) {
    return <div className="text-red-500">Expired</div>;
  }

  return (
    <div className="text-xs text-gray-400">
      <div className="text-white">
        {days}d {hours}h {minutes}m {seconds}s
      </div>
      <div>Time left</div>
    </div>
  );
}
