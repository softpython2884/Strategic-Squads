
'use client'

import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Unit, Team, Ping } from '@/lib/types';
import GameMap from "@/components/player/game-map";
import TeamPanel from './hud/team-panel';
import SkillBar from './hud/skill-bar';
import MiniMap from './hud/mini-map';
import ObjectivesPanel from './hud/objectives-panel';
import GameTimer from './hud/game-timer';
import { moveUnit } from '@/app/actions';
import StrategicMapOverlay from './hud/strategic-map-overlay';

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

const PING_DURATION_MS = 5000;

export default function GamePageContent() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    const [units, setUnits] = useState<Unit[]>([]);
    const [teams, setTeams] = useState<{ [key: string]: Team }>({});
    const [gameTime, setGameTime] = useState(0);
    const [pings, setPings] = useState<Ping[]>([]);
    const [isStrategicMapOpen, setIsStrategicMapOpen] = useState(false);
    
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const wsUrl = `ws://${window.location.hostname}:8080`;
        const webSocket = new WebSocket(wsUrl);
        ws.current = webSocket;

        ws.current.onopen = () => console.log('GamePage WebSocket connected');

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'full-state' || message.type === 'update-state') {
                    setUnits(message.payload.units);
                    setTeams(message.payload.teams);
                    setGameTime(message.payload.gameTime);
                } else if (message.type === 'ping-broadcast') {
                    const newPing = message.payload as Ping;
                    setPings(prevPings => [...prevPings, newPing]);
                    // Remove the ping after a delay
                    setTimeout(() => {
                        setPings(prev => prev.filter(p => p.id !== newPing.id));
                    }, PING_DURATION_MS);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.current.onclose = () => console.log('GamePage WebSocket disconnected');
        ws.current.onerror = (error) => console.error('GamePage WebSocket error:', error);

        return () => {
            if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
              ws.current.close();
            }
        };
    }, []);

    // Handle strategic map toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ',') {
                e.preventDefault();
                setIsStrategicMapOpen(prev => !prev);
            }
             if (e.key === 'Escape' && isStrategicMapOpen) {
                setIsStrategicMapOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStrategicMapOpen]);

    const handlePing = useCallback((coords: { x: number, y: number }) => {
        if (!pseudo || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        
        const pingPayload = {
            id: `${pseudo}-${Date.now()}`,
            x: coords.x,
            y: coords.y,
            playerId: pseudo,
        };

        ws.current.send(JSON.stringify({
            type: 'ping',
            payload: pingPayload
        }));

    }, [pseudo]);

    const handleMove = useCallback(async (coords: { x: number, y: number }) => {
        if (!pseudo) return;
        
        const playerUnitsToMove = units.filter(u => u.control.controllerPlayerId === pseudo);
        if (playerUnitsToMove.length === 0) return;
        
        try {
            // This is a simplified move command. A real implementation might
            // calculate individual paths or formations.
            const movePromises = playerUnitsToMove.map(unit => 
                moveUnit(pseudo, unit.id, coords)
            );
            await Promise.all(movePromises);
        } catch (error) {
            console.error("Failed to request unit move:", error);
        }
    }, [pseudo, units]);

    const handleAttack = useCallback((target: Unit | null, coords: { x: number, y: number }) => {
        if (!pseudo || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        
        ws.current.send(JSON.stringify({
            type: 'attack',
            payload: {
                playerId: pseudo,
                targetId: target?.id || null,
                position: coords
            }
        }));

    }, [pseudo]);
    
    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    const otherUnits = pseudo ? units.filter(u => u.control.controllerPlayerId !== pseudo) : units;
    const playerTeamId = playerUnits[0]?.teamId;
    const teamMates = playerTeamId ? units.filter(u => u.teamId === playerTeamId && u.control.controllerPlayerId) : [];
    const currentPlayerTeam = playerTeamId ? teams[playerTeamId] : null;

    return (
        <main className="relative flex-1 w-full h-full overflow-hidden bg-black">
            <Suspense fallback={<GameMapLoading />}>
                <GameMap 
                    playerUnits={playerUnits}
                    otherUnits={otherUnits}
                    teams={teams}
                    pings={pings}
                    onPing={handlePing}
                    onMove={handleMove}
                    onAttack={handleAttack}
                />
            </Suspense>
            
            {/* HUD Elements */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <GameTimer remainingTime={gameTime} />
                <TeamPanel teamMates={teamMates} teams={teams}/>
                <ObjectivesPanel />
                <MiniMap 
                    units={units} 
                    teams={teams} 
                    currentPlayerId={pseudo} 
                    pings={pings}
                    onPing={handlePing}
                    playerTeam={currentPlayerTeam}
                />
                <SkillBar />
            </div>

            {/* Strategic Map Overlay */}
            <StrategicMapOverlay
                isOpen={isStrategicMapOpen}
                onClose={() => setIsStrategicMapOpen(false)}
                units={units}
                teams={teams}
                pings={pings}
                onPing={handlePing}
            />
        </main>
    );
}
