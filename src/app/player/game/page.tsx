
'use client'

import GameMap from "@/components/player/game-map";
import { gameState as serverGameState } from "@/server/game-state";
import { Unit } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamePage() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    const [units, setUnits] = useState<Unit[]>([]);
    const teams = serverGameState.getTeams(); // Team data is static

    useEffect(() => {
        // Dynamically determine the WebSocket URL based on the current hostname.
        const wsUrl = `ws://${window.location.hostname}:8080`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log('GamePage WebSocket connected');

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'full-state' || message.type === 'update-state') {
                setUnits(message.payload);
            }
        };

        ws.onclose = () => console.log('GamePage WebSocket disconnected');
        ws.onerror = (error) => console.error('GamePage WebSocket error:', error);

        return () => {
            ws.close();
        };
    }, []);
    
    // Filter units for the current player
    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    // Get all other units (enemies and teammates)
    const otherUnits = pseudo ? units.filter(u => u.control.controllerPlayerId !== pseudo) : units;


    return (
        <main className="flex flex-col items-center justify-center flex-1 p-4">
            <h1 className="mb-4 text-2xl font-bold">Partie en cours</h1>
            <div className="w-full max-w-5xl border-2 rounded-lg border-primary overflow-hidden">
                <GameMap 
                    playerUnits={playerUnits}
                    otherUnits={otherUnits}
                    teams={teams}
                />
            </div>
            {/* HUD elements will go here */}
        </main>
    );
}
