
'use client'

import GameMap from "@/components/player/game-map";
import { gameState as serverGameState } from "@/server/game-state";
import { Unit } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

function GameMapLoading() {
    return (
        <div className="w-full max-w-5xl border-2 rounded-lg border-primary overflow-hidden flex items-center justify-center aspect-square">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p>Chargement de la carte de jeu...</p>
            </div>
        </div>
    );
}


export default function GamePage() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    const [units, setUnits] = useState<Unit[]>([]);
    const [teams, setTeams] = useState<{[key: string]: Team}>({});

    useEffect(() => {
        // Dynamically determine the WebSocket URL based on the current hostname.
        const wsUrl = `ws://${window.location.hostname}:8080`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log('GamePage WebSocket connected');

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'full-state' || message.type === 'update-state') {
                setUnits(message.payload.units);
                setTeams(message.payload.teams);
            }
        };

        ws.onclose = () => console.log('GamePage WebSocket disconnected');
        ws.onerror = (error) => console.error('GamePage WebSocket error:', error);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
        };
    }, []);
    
    // Filter units for the current player
    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    // Get all other units (enemies and teammates)
    const otherUnits = pseudo ? units.filter(u => u.control.controllerPlayerId !== pseudo) : units;


    return (
        <main className="flex flex-col items-center justify-center flex-1 p-4">
            <h1 className="mb-4 text-2xl font-bold">Partie en cours</h1>
             <Suspense fallback={<GameMapLoading />}>
                <GameMap 
                    playerUnits={playerUnits}
                    otherUnits={otherUnits}
                    teams={teams}
                />
            </Suspense>
            {/* HUD elements will go here */}
        </main>
    );
}
