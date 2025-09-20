
'use client'

import React, { Suspense } from 'react';
import GamePageContent from '@/components/player/game-page-content';
import { Loader2 } from 'lucide-react';

function GamePageLoading() {
    return (
        <main className="flex flex-col items-center justify-center flex-1 w-full h-screen bg-background">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h1 className="text-2xl font-bold">Chargement de la partie...</h1>
                <p>Connexion au serveur de jeu en cours.</p>
            </div>
        </main>
    );
}

export default function GamePage() {
    return (
        <div className="w-screen h-screen overflow-hidden">
            <Suspense fallback={<GamePageLoading />}>
                <GamePageContent />
            </Suspense>
        </div>
    );
}
