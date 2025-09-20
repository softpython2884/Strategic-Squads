

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
import StrategicMapOverlay from './hud/strategic-map-overlay';
import FogOfWar from './hud/fog-of-war';
import { objectives as staticObjectives } from '@/lib/objectives';
import { MAP_WIDTH_IN_TILES, MAP_HEIGHT_IN_TILES, TILE_SIZE } from '@/lib/map-data';

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
const VISION_RADIUS = 15;

export default function GamePageContent() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    // Server state
    const [units, setUnits] = useState<Unit[]>([]);
    const [teams, setTeams] = useState<{ [key: string]: Team }>({});
    const [gameTime, setGameTime] = useState(0);
    const [pings, setPings] = useState<Ping[]>([]);
    
    // Client-side state
    const [isStrategicMapOpen, setIsStrategicMapOpen] = useState(false);
    const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
    const selectedUnitIdsRef = useRef(selectedUnitIds);
    useEffect(() => {
        selectedUnitIdsRef.current = selectedUnitIds;
    }, [selectedUnitIds]);

    const mapDimensions = { 
        width: MAP_WIDTH_IN_TILES * TILE_SIZE, 
        height: MAP_HEIGHT_IN_TILES * TILE_SIZE 
    };
    
    const [zoom, setZoom] = useState(1.0);
    const [cameraPosition, setCameraPosition] = useState({ x: mapDimensions.width / 2, y: mapDimensions.height / 2 });

    const ws = useRef<WebSocket | null>(null);
    const panIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPanDirection = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (ws.current) return;

        const wsUrl = `ws://${window.location.hostname}:8080`;
        const webSocket = new WebSocket(wsUrl);
        ws.current = webSocket;

        webSocket.onopen = () => console.log('GamePage WebSocket connected');

        webSocket.onmessage = (event) => {
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

        webSocket.onclose = () => console.log('GamePage WebSocket disconnected');
        webSocket.onerror = (error) => console.error('GamePage WebSocket error:', error);

        return () => {
            if (webSocket.readyState === WebSocket.OPEN || webSocket.readyState === WebSocket.CONNECTING) {
              webSocket.close();
            }
            ws.current = null;
        };
    }, []); 

    const centerCameraOnPosition = useCallback((pos: {x: number, y: number}) => {
        const worldX = (pos.x / 100) * mapDimensions.width;
        const worldY = (pos.y / 100) * mapDimensions.height;
        setCameraPosition({ x: worldX, y: worldY });
    }, [mapDimensions]);

    const centerCameraOnSquad = useCallback(() => {
        const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
        if (playerUnits.length > 0) {
            const avgX = playerUnits.reduce((sum, u) => sum + u.position.x, 0) / playerUnits.length;
            const avgY = playerUnits.reduce((sum, u) => sum + u.position.y, 0) / playerUnits.length;
            centerCameraOnPosition({ x: avgX, y: avgY });
        }
    }, [units, pseudo, centerCameraOnPosition]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ',') {
                e.preventDefault();
                setIsStrategicMapOpen(prev => !prev);
            }
             if (e.key === 'Escape' && isStrategicMapOpen) {
                setIsStrategicMapOpen(false);
            }
            if (e.key === ' ' || e.key.toLowerCase() === 'tab') {
                e.preventDefault();
                centerCameraOnSquad();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStrategicMapOpen, centerCameraOnSquad]);

    useEffect(() => {
        const startPanning = (x: number, y: number) => {
            if (panIntervalRef.current) return; // Already panning
            lastPanDirection.current = { x, y };
            panIntervalRef.current = setInterval(() => {
                setCameraPosition(prev => ({
                    x: Math.max(0, Math.min(mapDimensions.width, prev.x + lastPanDirection.current.x)),
                    y: Math.max(0, Math.min(mapDimensions.height, prev.y + lastPanDirection.current.y))
                }));
            }, 16);
        };

        const stopPanning = () => {
            if (panIntervalRef.current) {
                clearInterval(panIntervalRef.current);
                panIntervalRef.current = null;
            }
            lastPanDirection.current = { x: 0, y: 0 };
        };

        const handleMouseMove = (e: MouseEvent) => {
            const edgeSize = 30;
            const panSpeed = 15;
            
            let panX = 0;
            let panY = 0;

            if (e.clientX < edgeSize) panX = -panSpeed;
            else if (e.clientX > window.innerWidth - edgeSize) panX = panSpeed;

            if (e.clientY < edgeSize) panY = -panSpeed;
            else if (e.clientY > window.innerHeight - edgeSize) panY = panSpeed;
            
            if (panX !== 0 || panY !== 0) {
                 if (!panIntervalRef.current || panX !== lastPanDirection.current.x || panY !== lastPanDirection.current.y) {
                    stopPanning();
                    startPanning(panX, panY);
                }
            } else {
                stopPanning();
            }
        };
        
        const handleMouseLeave = () => {
            stopPanning();
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            stopPanning();
        };
    }, [mapDimensions]);

    const sendWsMessage = useCallback((type: string, payload: any) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        ws.current.send(JSON.stringify({ type, payload }));
    }, []);

    const handlePing = useCallback((coords: { x: number, y: number }) => {
        if (!pseudo) return;
        sendWsMessage('ping', {
            id: `${pseudo}-${Date.now()}`,
            x: coords.x,
            y: coords.y,
            playerId: pseudo,
        });
    }, [pseudo, sendWsMessage]);

    const handleMove = useCallback((coords: { x: number, y: number }) => {
        if (!pseudo || selectedUnitIdsRef.current.size === 0) return;
        sendWsMessage('move', {
            playerId: pseudo,
            unitIds: Array.from(selectedUnitIdsRef.current),
            position: coords,
        });
    }, [pseudo, sendWsMessage]);

    const handleAttack = useCallback((target: Unit | null, coords: { x: number, y: number }) => {
        if (!pseudo || selectedUnitIdsRef.current.size === 0) return;
        sendWsMessage('attack', {
            playerId: pseudo,
            unitIds: Array.from(selectedUnitIdsRef.current),
            targetId: target?.id || null,
            position: coords
        });
    }, [pseudo, sendWsMessage]);
    
    const handleUseSkill = useCallback((unitId: string, skillId: string) => {
        if (!pseudo) return;
        const caster = units.find(u => u.id === unitId);
        if (!caster) return;

        sendWsMessage('useSkill', {
            playerId: pseudo,
            unitId,
            skillId,
            targetId: caster.control.focus,
        });
    }, [pseudo, units, sendWsMessage]);

    const handleSelectUnit = useCallback((unitId: string | null, isShiftHeld: boolean) => {
        setSelectedUnitIds(prev => {
            const newSelection = new Set(prev);
            
            if (isShiftHeld) {
                if (unitId) {
                    if (newSelection.has(unitId)) {
                        newSelection.delete(unitId);
                    } else {
                        newSelection.add(unitId);
                    }
                }
            } else {
                newSelection.clear();
                if (unitId) {
                    newSelection.add(unitId);
                }
            }
            return newSelection;
        });
    }, []);
    
    const handleSelectUnits = useCallback((unitIds: string[], isShiftHeld: boolean) => {
        setSelectedUnitIds(prev => {
            const newSelection = new Set(prev);
            if (isShiftHeld) {
                unitIds.forEach(id => newSelection.add(id));
            } else {
                newSelection.clear();
                unitIds.forEach(id => newSelection.add(id));
            }
            return newSelection;
        });
    }, []);

    const handleSelectAndCenter = useCallback((unitId: string) => {
        handleSelectUnit(unitId, false);
        const unit = units.find(u => u.id === unitId);
        if (unit) {
            centerCameraOnPosition(unit.position);
        }
    }, [units, handleSelectUnit, centerCameraOnPosition]);

    const playerUnits = pseudo ? units.filter(u => u.control.controllerPlayerId === pseudo) : [];
    const playerTeamId = playerUnits[0]?.teamId;
    
    const visionSources = playerTeamId ? units.filter(u => u.teamId === playerTeamId && u.combat.status === 'alive').map(u => u.position) : [];
    
    const alliedObjectives = staticObjectives.filter(obj => obj.teamId === playerTeamId);
    visionSources.push(...alliedObjectives.map(o => o.position));

    const isVisible = useCallback((unitPos: {x: number, y: number}) => {
        for (const source of visionSources) {
            const dx = unitPos.x - source.x;
            const dy = unitPos.y - source.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < VISION_RADIUS) {
                return true;
            }
        }
        return false;
    }, [visionSources]);
    
    const allPlayerTeamUnits = playerTeamId ? units.filter(u => u.teamId === playerTeamId) : [];
    const currentPlayerTeam = playerTeamId ? teams[playerTeamId] : null;

    const visibleUnits = [...allPlayerTeamUnits, ...units.filter(u => u.teamId !== playerTeamId && isVisible(u.position))];
    
    const selectedPlayerUnits = playerUnits.filter(u => selectedUnitIds.has(u.id));
    const unitsForSkillBar = selectedUnitIds.size > 0 ? selectedPlayerUnits : playerUnits;
    
    return (
        <main className="relative flex-1 w-full h-full overflow-hidden bg-black">
            <Suspense fallback={<GameMapLoading />}>
                <GameMap 
                    units={visibleUnits}
                    playerUnits={playerUnits}
                    teams={teams}
                    pings={pings}
                    zoom={zoom}
                    cameraPosition={cameraPosition}
                    selectedUnitIds={selectedUnitIds}
                    onZoomChange={setZoom}
                    onCameraPan={setCameraPosition}
                    onPing={handlePing}
                    onMove={handleMove}
                    onAttack={handleAttack}
                    onSelectUnit={handleSelectUnit}
                    onSelectUnits={handleSelectUnits}
                    mapDimensions={mapDimensions}
                />
            </Suspense>
            
            <div className="absolute inset-0 z-10 pointer-events-none">
                <FogOfWar 
                    visionSources={visionSources} 
                    visionRadius={VISION_RADIUS}
                    mapDimensions={mapDimensions}
                    zoom={zoom}
                    cameraPosition={cameraPosition}
                />
                <GameTimer remainingTime={gameTime} />
                <TeamPanel 
                    teamUnits={allPlayerTeamUnits} 
                    currentPlayerId={pseudo} 
                    onUnitSelect={handleSelectAndCenter} 
                />
                <ObjectivesPanel squadComposition={playerUnits[0]?.composition} />
                <MiniMap 
                    units={visibleUnits}
                    teams={teams} 
                    currentPlayerId={pseudo} 
                    pings={pings}
                    onPing={handlePing}
                    playerTeam={currentPlayerTeam}
                />
                <SkillBar playerUnits={unitsForSkillBar} onUseSkill={handleUseSkill} />
            </div>

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
