
'use client'

import GameMap from "@/components/player/game-map";
import { gameState } from "@/server/game-state";
import { useSearchParams } from "next/navigation";

export default function GamePage() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    const units = gameState.getUnits();
    const teams = gameState.getTeams();
    
    // Filter units for the current player
    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    // Get all other units (enemies and teammates)
    const otherUnits = pseudo ? units.filter(u => u.control.controllerPlayerId !== pseudo) : units;


    return (
        <main className="flex flex-col items-center justify-center flex-1 p-4">
            <h1 className="mb-4 text-2xl font-bold">Partie en cours</h1>
            <div className="w-full max-w-4xl border-2 rounded-lg border-primary">
                <GameMap 
                    initialPlayerUnits={playerUnits}
                    initialOtherUnits={otherUnits}
                    teams={teams}
                />
            </div>
            {/* HUD elements will go here */}
        </main>
    );
}
