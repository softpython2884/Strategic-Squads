
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Swords, Wind, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unit, Team, UnitComposition, Ping } from '@/lib/types';
import Image from 'next/image';
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
    playerUnits: Unit[];
    otherUnits: Unit[];
    teams: { [key: string]: Team };
    pings: Ping[];
    zoom: number;
    cameraPosition: { x: number, y: number };
    onZoomChange: (zoom: number) => void;
    onCameraPan: (pan: { x: number, y: number }) => void;
    onPing: (coords: { x: number, y: number }) => void;
    onMove: (coords: { x: number, y: number }) => void;
    onAttack: (target: Unit | null, coords: { x: number, y: number }) => void;
};

const UnitDisplay = ({ unit, isPlayerUnit, team, isTargeted }: { unit: Unit; isPlayerUnit: boolean, team: Team, isTargeted: boolean }) => {
    const ClassIcon = classIcons[unit.type];
    const RoleIcon = compositionIcons[unit.composition];
    
    let glowClass = '';
    if (isPlayerUnit) {
        glowClass = 'shadow-[0_0_12px_3px_rgba(107,225,255,0.8)]'; // Bright Green/Cyan glow for player's own units
    } else if (unit.teamId === 'blue') {
        glowClass = 'shadow-[0_0_10px_2px_rgba(37,99,235,0.6)]'; // Blue glow
    } else {
        glowClass = 'shadow-[0_0_10px_2px_rgba(220,38,38,0.6)]'; // Red glow
    }

    const healthPercentage = (unit.stats.hp / unit.stats.maxHp) * 100;
    const resourcePercentage = (unit.stats.resource / unit.stats.maxResource) * 100;

    return (
        <div className="relative flex flex-col items-center w-16">
            {/* Unit Icon */}
            <div className="relative w-12 h-12 cursor-pointer group">
                 <div className={cn(
                    "absolute inset-0 rounded-full border-2 transition-all duration-300",
                    isPlayerUnit ? "border-cyan-400" : (team?.bgClass ? team.bgClass.replace('bg-', 'border-') : 'border-gray-500'),
                    glowClass,
                    isTargeted && "border-red-500 animate-pulse border-4" // Visual feedback for attack command
                )}>
                    <div className="relative flex items-center justify-center w-full h-full">
                        {ClassIcon && <ClassIcon className={cn("w-6 h-6", team?.textClass)} />}
                    </div>
                </div>
                 <div className="absolute flex items-center justify-center w-5 h-5 border-2 rounded-full -top-1 -right-1 bg-card border-card-foreground/50">
                    {RoleIcon && <RoleIcon className="w-3 h-3 text-foreground" />}
                </div>
            </div>

            {/* Name and Health/Mana Bars */}
            <div className="flex flex-col items-center w-full mt-2">
                 <p className="px-2 py-0.5 text-xs font-bold rounded-full whitespace-nowrap bg-background/80 text-foreground">
                    {unit.name}
                </p>
                <div className="w-full h-3 mt-1 overflow-hidden border rounded-full border-foreground/50 bg-black/50">
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
}


export default function GameMap({ playerUnits, otherUnits, teams, pings, zoom, cameraPosition, onZoomChange, onCameraPan, onPing, onMove, onAttack }: GameMapProps) {
    const allUnits = [...playerUnits, ...otherUnits];
    const [targetedUnitId, setTargetedUnitId] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const handleInteraction = (event: React.MouseEvent<HTMLDivElement>, isContextMenu: boolean) => {
        event.preventDefault(); // Prevent default for both clicks
        
        const mapRect = mapContainerRef.current?.getBoundingClientRect();
        if (!mapRect) return;
        
        const viewX = event.clientX - mapRect.left;
        const viewY = event.clientY - mapRect.top;

        // Account for camera pan and zoom to get world coordinates
        const worldX = (viewX / zoom) + (cameraPosition.x - mapRect.width / (2 * zoom));
        const worldY = (viewY / zoom) + (cameraPosition.y - mapRect.height / (2 * zoom));

        const targetX = (worldX / (mapRect.width)) * 100;
        const targetY = (worldY / (mapRect.height)) * 100;
        
        const clickedUnit = allUnits.find(unit => {
            const unitScreenX = (unit.position.x / 100) * 2048; // Using world dimensions (2048)
            const unitScreenY = (unit.position.y / 100) * 2048;
            const distance = Math.sqrt(Math.pow(worldX - unitScreenX, 2) + Math.pow(worldY - unitScreenY, 2));
            return distance < 32; // Click radius in world units (was 20, increased for easier clicking)
        });

        if (event.altKey) {
            onPing({ x: targetX, y: targetY });
            return;
        }

        if (isContextMenu) { // Right-click for attack
            onAttack(clickedUnit || null, { x: targetX, y: targetY });
            if (clickedUnit && !playerUnits.find(u => u.id === clickedUnit.id)) {
                 setTargetedUnitId(clickedUnit.id);
                 setTimeout(() => setTargetedUnitId(null), 500); // Visual feedback for 0.5s
            }
        } else { // Left-click for move
            if (!clickedUnit) { // Only move if clicking on the ground
                onMove({ x: targetX, y: targetY });
            }
            // Logic for selecting units would go here
        }
    };
    
     const handleWheel = (event: React.WheelEvent) => {
        event.preventDefault();
        const newZoom = zoom - event.deltaY * 0.001;
        // Clamp zoom between 0.8 (min zoom) and 2.5 (max zoom)
        onZoomChange(Math.max(0.8, Math.min(2.5, newZoom)));
    };


    return (
        <TooltipProvider>
            <div
                ref={mapContainerRef}
                className="relative w-full h-full overflow-hidden select-none bg-muted cursor-crosshair"
                onContextMenu={(e) => e.preventDefault()} // Prevent context menu on the entire map container
                onWheel={handleWheel}
                onClick={(e) => handleInteraction(e, false)}
                onContextMenu={(e) => handleInteraction(e, true)}
            >
                <motion.div
                    className="relative w-[2048px] h-[2048px] origin-top-left"
                     animate={{
                        scale: zoom,
                        x: -cameraPosition.x * zoom + (mapContainerRef.current?.clientWidth ?? 0) / 2,
                        y: -cameraPosition.y * zoom + (mapContainerRef.current?.clientHeight ?? 0) / 2,
                    }}
                    transition={{ duration: 0.2, ease: "linear" }}
                >
                    <Image
                        src="https://picsum.photos/seed/map/2048/2048"
                        alt="Game Map"
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0 object-cover opacity-50 pointer-events-none"
                        data-ai-hint="fantasy map"
                        priority
                    />

                    <AnimatePresence>
                        {allUnits.map((unit) => (
                            <motion.div
                                key={unit.id}
                                layout
                                initial={{
                                    left: `${unit.position.x / 100 * 2048}px`,
                                    top: `${unit.position.y / 100 * 2048}px`,
                                }}
                                animate={{
                                    left: `calc(${unit.position.x / 100 * 2048}px)`,
                                    top: `calc(${unit.position.y / 100 * 2048}px)`,
                                }}
                                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            >
                                <UnitDisplay 
                                    unit={unit} 
                                    isPlayerUnit={playerUnits.some(p => p.id === unit.id)} 
                                    team={teams[unit.teamId]}
                                    isTargeted={unit.id === targetedUnitId}
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
                                    left: `calc(${ping.x / 100 * 2048}px)`,
                                    top: `calc(${ping.y / 100 * 2048}px)`,
                                }}
                            >
                                <PingDisplay />
                            </div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </TooltipProvider>
    );
}
