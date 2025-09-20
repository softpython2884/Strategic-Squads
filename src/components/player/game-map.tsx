

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Swords, Wind, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unit, Team, UnitComposition, Ping } from '@/lib/types';
import { ArmoredIcon, AssassinIcon, MageIcon, ValkyrieIcon, ArcherIcon } from './unit-icons';
import PingDisplay from './hud/ping-display';


const classIcons: { [key: string]: React.ElementType } = {
  Blindé: ArmoredIcon,
  Mage: MageIcon,
  Valkyrie: ValkyrieIcon,
  Archer: ArcherIcon,
  Assassin: AssassinIcon,
};

const compositionIcons: { [key in UnitComposition]: React.ElementType } = {
    attaque: Swords,
    défense: Shield,
    capture: Crosshair,
    escarmouche: Wind,
};

type GameMapProps = {
    units: Unit[];
    playerUnits: Unit[];
    teams: { [key: string]: Team };
    pings: Ping[];
    zoom: number;
    cameraPosition: { x: number, y: number };
    selectedUnitIds: Set<string>;
    onZoomChange: (zoom: number) => void;
    onCameraPan: (pan: { x: number, y: number }) => void;
    onPing: (coords: { x: number, y: number }) => void;
    onMove: (coords: { x: number, y: number }) => void;
    onAttack: (target: Unit | null, coords: { x: number, y: number }) => void;
    onSelectUnit: (unitId: string | null, isShiftHeld: boolean) => void;
    onSelectUnits: (unitIds: string[], isShiftHeld: boolean) => void;
    mapDimensions: { width: number, height: number };
};

const UnitDisplay = React.memo(({ unit, isPlayerUnit, team, isTargeted, isSelected, onSelect }: { unit: Unit; isPlayerUnit: boolean, team: Team, isTargeted: boolean, isSelected: boolean, onSelect: (e: React.MouseEvent) => void }) => {
    const ClassIcon = classIcons[unit.type];
    const RoleIcon = compositionIcons[unit.composition];
    
    let glowClass = '';
    if (isPlayerUnit) {
        glowClass = 'shadow-[0_0_8px_2px_rgba(107,225,255,0.7)]';
    } else if (unit.teamId === 'blue') {
        glowClass = 'shadow-[0_0_6px_1px_rgba(37,99,235,0.5)]'; // Blue glow
    } else {
        glowClass = 'shadow-[0_0_6px_1px_rgba(220,38,38,0.5)]'; // Red glow
    }

    if (isSelected) {
        glowClass = 'shadow-[0_0_12px_3px_rgba(255,255,255,0.9)]'; // Bright white glow for selected
    }


    const healthPercentage = (unit.stats.hp / unit.stats.maxHp) * 100;
    const resourcePercentage = (unit.stats.resource / unit.stats.maxResource) * 100;

    return (
        <div className="relative flex flex-col items-center w-8" onClick={onSelect}>
            {/* Unit Icon */}
            <div className="relative w-8 h-8 cursor-pointer group">
                 <div className={cn(
                    "absolute inset-0 rounded-full border-2 transition-all duration-300",
                    isSelected ? "border-white border-2" : (isPlayerUnit ? "border-cyan-400" : (team?.bgClass ? team.bgClass.replace('bg-', 'border-') : 'border-gray-500')),
                    glowClass,
                    isTargeted && "border-red-500 animate-pulse border-2"
                )}>
                    <div className="relative flex items-center justify-center w-full h-full">
                        {ClassIcon && <ClassIcon className={cn("w-4 h-4", team?.textClass)} />}
                    </div>
                </div>
                 <div className="absolute flex items-center justify-center w-4 h-4 border rounded-full -top-1 -right-1 bg-card border-card-foreground/50">
                    {RoleIcon && <RoleIcon className="w-2 h-2 text-foreground" />}
                </div>
            </div>

            {/* Name and Health/Mana Bars */}
            <div className="flex flex-col items-center w-full mt-1">
                 <p className="px-1 py-0 text-[8px] font-bold rounded-full whitespace-nowrap bg-background/80 text-foreground scale-90">
                    {unit.name}
                </p>
                <div className="w-full h-2 mt-0.5 overflow-hidden border rounded-full border-foreground/50 bg-black/50">
                    <div className="h-1/2">
                         <div className="h-full bg-green-500" style={{ width: `${healthPercentage}%` }} />
                    </div>
                     <div className="h-1/2">
                        <div className="h-full bg-blue-500" style={{ width: `${resourcePercentage}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
});
UnitDisplay.displayName = 'UnitDisplay';


export default function GameMap({ 
    units,
    playerUnits, 
    teams, 
    pings, 
    zoom, 
    cameraPosition, 
    selectedUnitIds,
    onZoomChange, 
    onCameraPan, 
    onPing, 
    onMove, 
    onAttack,
    onSelectUnit,
    onSelectUnits,
    mapDimensions
}: GameMapProps) {
    const [targetedUnitId, setTargetedUnitId] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [isBoxSelecting, setIsBoxSelecting] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
    const isInteractingRef = useRef(false);

    const [isPanning, setIsPanning] = useState(false);
    const lastMousePosition = useRef({ x: 0, y: 0 });

    const handleInteraction = useCallback((event: React.MouseEvent<HTMLDivElement>, isContextMenu: boolean) => {
        if (isBoxSelecting || isInteractingRef.current || isPanning) return;
        isInteractingRef.current = true;

        const mapRect = mapContainerRef.current?.getBoundingClientRect();
        if (!mapRect) {
            isInteractingRef.current = false;
            return;
        }
        
        const viewX = event.clientX - mapRect.left;
        const viewY = event.clientY - mapRect.top;

        const worldX = (viewX / zoom) + (cameraPosition.x - (mapRect.width / 2) / zoom);
        const worldY = (viewY / zoom) + (cameraPosition.y - (mapRect.height / 2) / zoom);
        
        const targetX = (worldX / mapDimensions.width) * 100;
        const targetY = (worldY / mapDimensions.height) * 100;

        const clickedUnit = units.find(unit => {
            const unitWorldX = (unit.position.x / 100) * mapDimensions.width;
            const unitWorldY = (unit.position.y / 100) * mapDimensions.height;
            const distance = Math.sqrt(Math.pow(worldX - unitWorldX, 2) + Math.pow(worldY - unitWorldY, 2));
            return distance < 16; 
        });

        if (event.altKey) {
            onPing({ x: targetX, y: targetY });
        } else if (isContextMenu) {
            event.preventDefault();
            onAttack(clickedUnit || null, { x: targetX, y: targetY });
            if (clickedUnit && !playerUnits.find(u => u.id === clickedUnit.id)) {
                 setTargetedUnitId(clickedUnit.id);
                 setTimeout(() => setTargetedUnitId(null), 500);
            }
        } else if (!clickedUnit) {
            onMove({ x: targetX, y: targetY });
        }
        
        setTimeout(() => { isInteractingRef.current = false; }, 100);

    }, [isBoxSelecting, zoom, cameraPosition, mapDimensions, units, onPing, onAttack, onMove, playerUnits, isPanning]);

    // Manual event listener for wheel to set passive: false
    useEffect(() => {
        const mapEl = mapContainerRef.current;
        if (!mapEl) return;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            const newZoom = zoom - event.deltaY * 0.001;
            onZoomChange(Math.max(0.8, Math.min(2.5, newZoom)));
        };

        mapEl.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            mapEl.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, onZoomChange]);
    

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Middle mouse button for panning
        if (e.button === 1) {
            e.preventDefault();
            setIsPanning(true);
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
            return;
        }

        // Left mouse button for selection
        if (e.button !== 0) return; 
        
        isInteractingRef.current = true;
        const mapRect = mapContainerRef.current?.getBoundingClientRect();
        if (!mapRect) return;

        const startPos = { x: e.clientX - mapRect.left, y: e.clientY - mapRect.top };
        setDragStart(startPos);
        setDragEnd(startPos);
        
        setTimeout(() => {
            if (isInteractingRef.current) setIsBoxSelecting(true);
        }, 150);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePosition.current.x;
            const dy = e.clientY - lastMousePosition.current.y;
            onCameraPan({ x: -dx / zoom, y: -dy / zoom });
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
            return;
        }
        
        if (!isInteractingRef.current || !isBoxSelecting) return;

        const mapRect = mapContainerRef.current?.getBoundingClientRect();
        if (!mapRect) return;
        setDragEnd({ x: e.clientX - mapRect.left, y: e.clientY - mapRect.top });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning && e.button === 1) {
            setIsPanning(false);
            return;
        }
        
        if (e.button !== 0) return;

        if (isBoxSelecting) {
            const mapRect = mapContainerRef.current?.getBoundingClientRect();
            if (!mapRect) return;
            
            const startX = Math.min(dragStart.x, dragEnd.x);
            const startY = Math.min(dragStart.y, dragEnd.y);
            const endX = Math.max(dragStart.x, dragEnd.x);
            const endY = Math.max(dragStart.y, dragEnd.y);
            
            // If the box is too small, treat it as a click
            if (Math.abs(dragStart.x - dragEnd.x) < 10 && Math.abs(dragStart.y - dragEnd.y) < 10) {
                 handleInteraction(e, false);
            } else {
                const selectedIds: string[] = [];
                playerUnits.forEach(unit => {
                    const unitWorldX = (unit.position.x / 100) * mapDimensions.width;
                    const unitWorldY = (unit.position.y / 100) * mapDimensions.height;
                    
                    const unitScreenX = (unitWorldX - cameraPosition.x) * zoom + (mapRect.width / 2);
                    const unitScreenY = (unitWorldY - cameraPosition.y) * zoom + (mapRect.height / 2);

                    if (unitScreenX >= startX && unitScreenX <= endX && unitScreenY >= startY && unitScreenY <= endY) {
                        selectedIds.push(unit.id);
                    }
                });
                onSelectUnits(selectedIds, e.shiftKey);
            }
        }
        
        isInteractingRef.current = false;
        setIsBoxSelecting(false);
    };

    const SelectionBox = () => {
        if (!isBoxSelecting) return null;
        const x = Math.min(dragStart.x, dragEnd.x);
        const y = Math.min(dragStart.y, dragEnd.y);
        const width = Math.abs(dragStart.x - dragEnd.x);
        const height = Math.abs(dragStart.y - dragEnd.y);

        if (width < 10 && height < 10) return null;

        return (
            <div 
                className="absolute border-2 border-dashed border-cyan-400 bg-cyan-400/20 pointer-events-none"
                style={{ left: x, top: y, width, height }}
            />
        );
    };


    return (
        <TooltipProvider>
            <div
                ref={mapContainerRef}
                className={cn(
                    "relative w-full h-full overflow-hidden select-none bg-gray-800",
                    isPanning ? "cursor-grabbing" : "cursor-crosshair"
                )}
                onContextMenu={(e) => handleInteraction(e, true)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                    isInteractingRef.current = false;
                    setIsBoxSelecting(false);
                    setIsPanning(false);
                }}
            >
                <motion.div
                    className="relative origin-top-left bg-gray-800"
                    style={{
                        width: mapDimensions.width,
                        height: mapDimensions.height,
                    }}
                     animate={{
                        scale: zoom,
                        x: -cameraPosition.x * zoom + (mapContainerRef.current?.clientWidth ?? 0) / 2,
                        y: -cameraPosition.y * zoom + (mapContainerRef.current?.clientHeight ?? 0) / 2,
                    }}
                    transition={{ duration: 0, ease: "linear" }}
                >
                    <AnimatePresence>
                        {units.map((unit) => (
                            <motion.div
                                key={unit.id}
                                layoutId={unit.id}
                                initial={false} // Prevents initial animation on first render
                                animate={{
                                    left: `${unit.position.x}%`,
                                    top: `${unit.position.y}%`,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute"
                                style={{
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <UnitDisplay 
                                    unit={unit} 
                                    isPlayerUnit={playerUnits.some(p => p.id === unit.id)} 
                                    team={teams[unit.teamId]}
                                    isTargeted={unit.id === targetedUnitId}
                                    isSelected={selectedUnitIds.has(unit.id)}
                                    onSelect={(e) => {
                                        e.stopPropagation(); // Prevent map click from firing
                                        if (playerUnits.some(p => p.id === unit.id)) {
                                            onSelectUnit(unit.id, e.shiftKey);
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <AnimatePresence>
                        {pings.map((ping) => (
                             <div 
                                key={ping.id} 
                                className="absolute"
                                style={{
                                    left: `${ping.x}%`,
                                    top: `${ping.y}%`,
                                }}
                            >
                                <PingDisplay />
                            </div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                <SelectionBox />
            </div>
        </TooltipProvider>
    );
}
