
'use client'

import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Unit, Team, Ping, UnitComposition } from '@/lib/types';
import GameMap from "@/components/player/game-map";
import TeamPanel from './hud/team-panel';
import SkillBar from './hud/skill-bar';
import MiniMap from './hud/mini-map';
import ObjectivesPanel from './hud/objectives-panel';
import GameTimer from './hud/game-timer';
import { moveUnit } from '@/app/actions';
import StrategicMapOverlay from './hud/strategic-map-overlay';
import FogOfWar from './hud/fog-of-war';
import { objectives } from '@/lib/objectives';


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
const MAP_DIMENSIONS = { width: 2048, height: 2048 }; // World size in pixels
const VISION_RADIUS = 15; // Percentage of map width/height

export default function GamePageContent() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    const [units, setUnits] = useState<Unit[]>([]);
    const [teams, setTeams] = useState<{ [key: string]: Team }>({});
    const [gameTime, setGameTime] = useState(0);
    const [pings, setPings] = useState<Ping[]>([]);
    const [isStrategicMapOpen, setIsStrategicMapOpen] = useState(false);
    
    // Camera state
    const [zoom, setZoom] = useState(1.0);
    const [cameraPosition, setCameraPosition] = useState({ x: MAP_DIMENSIONS.width / 2, y: MAP_DIMENSIONS.height / 2 });

    const ws = useRef<WebSocket | null>(null);
    const panIntervalRef = useRef<number | null>(null);

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

    const centerCameraOnSquad = useCallback(() => {
        const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
        if (playerUnits.length > 0) {
            const avgX = playerUnits.reduce((sum, u) => sum + (u.position.x / 100 * MAP_DIMENSIONS.width), 0) / playerUnits.length;
            const avgY = playerUnits.reduce((sum, u) => sum + (u.position.y / 100 * MAP_DIMENSIONS.height), 0) / playerUnits.length;
            setCameraPosition({ x: avgX, y: avgY });
        }
    }, [units, pseudo]);
    
    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ',') {
                e.preventDefault();
                setIsStrategicMapOpen(prev => !prev);
            }
             if (e.key === 'Escape' && isStrategicMapOpen) {
                setIsStrategicMapOpen(false);
            }
            if (e.key === ' ' || e.key === 'Tab') {
                e.preventDefault();
                centerCameraOnSquad();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStrategicMapOpen, centerCameraOnSquad]);

    // Handle camera edge panning
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const edgeSize = 30; // pixels from the edge to start panning
            const panSpeed = 15; // pixels per frame
            
            let panX = 0;
            let panY = 0;

            if (e.clientX < edgeSize) panX = -panSpeed;
            if (e.clientX > window.innerWidth - edgeSize) panX = panSpeed;
            if (e.clientY < edgeSize) panY = -panSpeed;
            if (e.clientY > window.innerHeight - edgeSize) panY = panSpeed;

            if (panX !== 0 || panY !== 0) {
                if (!panIntervalRef.current) {
                    panIntervalRef.current = window.setInterval(() => {
                        setCameraPosition(prev => ({
                            x: Math.max(0, Math.min(MAP_DIMENSIONS.width, prev.x + panX)),
                            y: Math.max(0, Math.min(MAP_DIMENSIONS.height, prev.y + panY))
                        }));
                    }, 16); // ~60fps
                }
            } else {
                if (panIntervalRef.current) {
                    clearInterval(panIntervalRef.current);
                    panIntervalRef.current = null;
                }
            }
        };
        
        const handleMouseLeave = () => {
             if (panIntervalRef.current) {
                clearInterval(panIntervalRef.current);
                panIntervalRef.current = null;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
             if (panIntervalRef.current) {
                clearInterval(panIntervalRef.current);
            }
        };
    }, []);

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
        
        ws.current?.send(JSON.stringify({
            type: 'move',
            payload: {
                playerId: pseudo,
                position: coords,
            }
        }));
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
    
    const handleUseSkill = useCallback((unitId: string, skillId: string) => {
        if (!pseudo || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        
        console.log(`Client sending useSkill for unit ${unitId}, skill ${skillId}`);
        ws.current.send(JSON.stringify({
            type: 'useSkill',
            payload: {
                playerId: pseudo,
                unitId,
                skillId,
            }
        }));
    }, [pseudo]);

    // --- FOG OF WAR LOGIC ---
    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    const playerTeamId = playerUnits[0]?.teamId;
    
    const visionSources = playerTeamId ? units.filter(u => u.teamId === playerTeamId && u.combat.status === 'alive').map(u => u.position) : [];
    
    // Also add allied objectives to vision sources
    const alliedObjectives = objectives.filter(obj => obj.teamId === playerTeamId);
    visionSources.push(...alliedObjectives.map(o => o.position));

    const isVisible = (unitPos: {x: number, y: number}) => {
        for (const source of visionSources) {
            const dx = unitPos.x - source.x;
            const dy = unitPos.y - source.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < VISION_RADIUS) {
                return true;
            }
        }
        return false;
    };

    const visibleEnemyUnits = units.filter(u => u.teamId !== playerTeamId && isVisible(u.position));
    const alliedUnits = units.filter(u => u.teamId === playerTeamId);


    const teamMates = playerTeamId ? units.filter(u => u.teamId === playerTeamId && u.control.controllerPlayerId) : [];
    const currentPlayerTeam = playerTeamId ? teams[playerTeamId] : null;
    const squadComposition = playerUnits[0]?.composition;

    return (
        <main className="relative flex-1 w-full h-full overflow-hidden bg-black">
            <Suspense fallback={<GameMapLoading />}>
                <GameMap 
                    playerUnits={playerUnits}
                    otherUnits={[...alliedUnits.filter(u => u.control.controllerPlayerId !== pseudo), ...visibleEnemyUnits]}
                    teams={teams}
                    pings={pings}
                    zoom={zoom}
                    cameraPosition={cameraPosition}
                    onZoomChange={setZoom}
                    onCameraPan={setCameraPosition}
                    onPing={handlePing}
                    onMove={handleMove}
                    onAttack={handleAttack}
                />
            </Suspense>
            
            {/* HUD Elements */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <FogOfWar 
                    visionSources={visionSources} 
                    visionRadius={VISION_RADIUS}
                    mapDimensions={MAP_DIMENSIONS}
                    zoom={zoom}
                    cameraPosition={cameraPosition}
                />
                <GameTimer remainingTime={gameTime} />
                <TeamPanel teamMates={teamMates} teams={teams}/>
                <ObjectivesPanel squadComposition={squadComposition} />
                <MiniMap 
                    units={units} 
                    teams={teams} 
                    currentPlayerId={pseudo} 
                    pings={pings}
                    onPing={handlePing}
                    playerTeam={currentPlayerTeam}
                />
                <SkillBar playerUnits={playerUnits} onUseSkill={handleUseSkill} />
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
