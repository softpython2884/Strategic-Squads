
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Swords, Wind, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unit, Team } from '@/lib/types';
import { moveUnit } from '@/app/actions';
import { useSearchParams } from 'next/navigation';

const compositionIcons: { [key in Unit['composition']]: React.ReactNode } = {
    attaque: <Swords className="w-full h-full p-1" />,
    défense: <Shield className="w-full h-full p-1" />,
    capture: <Crosshair className="w-full h-full p-1" />,
    escarmouche: <Wind className="w-full h-full p-1" />,
};

const GRID_SIZE = 10;
const CELL_SIZE = 60; // in pixels

type GameMapProps = {
    playerUnits: Unit[];
    otherUnits: Unit[];
    teams: { [key: string]: Team };
};

export default function GameMap({ playerUnits, otherUnits, teams }: GameMapProps) {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');

    // Combine units for rendering
    const allUnits = [...playerUnits, ...otherUnits];

    // Example of client-side logic to trigger a move
    // In a real game, this would be triggered by player input (e.g., clicking on the map)
    useEffect(() => {
        if (!pseudo || playerUnits.length === 0) return;

        const unitToMove = playerUnits[0];
        
        const handleMapClick = async () => {
            const newX = Math.floor(Math.random() * GRID_SIZE) + 1;
            const newY = Math.floor(Math.random() * GRID_SIZE) + 1;

            try {
                // Call the server action to request a move
                await moveUnit(pseudo, unitToMove.id, { x: newX, y: newY });
                // Note: The client does not update its state directly.
                // It will wait for the WebSocket broadcast to receive the new state.
            } catch (error) {
                console.error("Failed to request unit move:", error);
            }
        };
        
        // Simulate a click every 3 seconds for demonstration
        const interval = setInterval(handleMapClick, 3000);

        return () => clearInterval(interval);

    }, [pseudo, playerUnits]);


    return (
        <TooltipProvider>
            <div
                className="relative bg-background"
                style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                    minWidth: GRID_SIZE * CELL_SIZE,
                    minHeight: GRID_SIZE * CELL_SIZE,
                }}
            >
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-px p-px bg-border/50">
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                        <div key={i} className="w-full h-full bg-background" />
                    ))}
                </div>

                {/* Units */}
                <AnimatePresence>
                    {allUnits.map((unit) => (
                        <motion.div
                            key={unit.id}
                            layout
                            initial={{
                                x: (unit.position.x - 1) * CELL_SIZE,
                                y: (unit.position.y - 1) * CELL_SIZE,
                            }}
                            animate={{
                                x: (unit.position.x - 1) * CELL_SIZE,
                                y: (unit.position.y - 1) * CELL_SIZE,
                            }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="absolute"
                            style={{
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                            }}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center w-full h-full p-2 cursor-pointer">
                                        <div
                                            className={cn(
                                                "flex items-center justify-center w-10 h-10 rounded-full z-10 shadow-lg",
                                                teams[unit.teamId]?.bgClass,
                                                teams[unit.teamId]?.textClass
                                            )}
                                        >
                                            {compositionIcons[unit.composition]}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{unit.name}</p>
                                    <p>Équipe: {teams[unit.teamId]?.name}</p>
                                    <p>Santé: {unit.stats.hp} / {unit.stats.maxHp}</p>
                                </TooltipContent>
                            </Tooltip>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}
