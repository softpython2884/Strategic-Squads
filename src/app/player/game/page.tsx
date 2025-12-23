
import { Suspense } from 'react';
import { GameRenderer } from '@/components/game/GameRenderer';

export default function GamePage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>}>
            <GameRenderer />
        </Suspense>
    );
}
