
'use client';

import React from 'react';

type GameTimerProps = {
  remainingTime: number; // in seconds
};

const GameTimer = ({ remainingTime }: GameTimerProps) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSecs = String(secs).padStart(2, '0');
        return `${paddedMinutes}:${paddedSecs}`;
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white font-headline text-2xl px-4 py-1 rounded-md pointer-events-auto">
            {formatTime(remainingTime)}
        </div>
    );
};

export default GameTimer;
