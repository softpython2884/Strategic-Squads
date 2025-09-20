
'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Unit, Team } from '@/lib/types';
import GameMap from "@/components/player/game-map";
import TeamPanel from './hud/team-panel';
import SkillBar from './hud/skill-bar';
import MiniMap from './hud/mini-map';
import ObjectivesPanel from './hud/objectives-panel';
import GameTimer from './hud/game-timer';

function GameMapLoading() {
    return (
        <div className="flex items-center justify-center w-full h-full bg-muted">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p>Chargement de la carte de jeu...</p>
            </div>
        </div>
    );
}

export default function GamePageContent() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    const [units, setUnits] = useState<Unit[]>([]);
    const [teams, setTeams] = useState<{ [key: string]: Team }>({});

    useEffect(() => {
        const wsUrl = `ws://${window.location.hostname}:8080`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log('GamePage WebSocket connected');

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'full-state' || message.type === 'update-state') {
                    setUnits(message.payload.units);
                    setTeams(message.payload.teams);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.onclose = () => console.log('GamePage WebSocket disconnected');
        ws.onerror = (error) => console.error('GamePage WebSocket error:', error);

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
              ws.close();
            }
        };
    }, []);
    
    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    const otherUnits = pseudo ? units.filter(u => u.control.controllerPlayerId !== pseudo) : units;
    const playerTeamId = playerUnits[0]?.teamId;
    const teamMates = playerTeamId ? units.filter(u => u.teamId === playerTeamId) : [];

    return (
        <main className="relative flex-1 w-full h-full overflow-hidden bg-black">
            <Suspense fallback={<GameMapLoading />}>
                <GameMap 
                    playerUnits={playerUnits}
                    otherUnits={otherUnits}
                    teams={teams}
                />
            </Suspense>
            
            {/* HUD Elements */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <GameTimer />
                <TeamPanel teamMates={teamMates} teams={teams}/>
                <ObjectivesPanel />
                <MiniMap />
                <SkillBar />
            </div>
        </main>
    );
}
