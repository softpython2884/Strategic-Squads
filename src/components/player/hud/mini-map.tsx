
'use client';

import React from 'react';
import type { Unit, Team, Ping } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TowerControl } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


type MiniMapProps = {
  units: Unit[];
  teams: { [key: string]: Team };
  currentPlayerId: string | null;
  pings: Ping[];
  onPing: (coords: { x: number, y: number }) => void;
  playerTeam: Team | null;
};

// Static objectives for now
const objectives = [
  { id: 'tower-n', name: "Tour Nord", position: { x: 20, y: 20 }, teamId: 'red' },
  { id: 'tower-s', name: "Tour Sud", position: { x: 80, y: 80 }, teamId: 'blue' },
  { id: 'idol-n', name: "Idole Nord", position: { x: 15, y: 15 }, teamId: 'red' },
  { id: 'idol-s', name: "Idole Sud", position: { x: 85, y: 85 }, teamId: 'blue' },
];

const MiniPingDisplay = ({ x, y }: { x: number, y: number }) => {
    return (
        <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-10 h-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        >
            <div className="relative w-full h-full">
                <div className="absolute inset-0 border-yellow-400 border rounded-full" />
            </div>
        </motion.div>
    );
};


const MiniMap = ({ units, teams, currentPlayerId, pings, onPing, playerTeam }: MiniMapProps) => {

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.altKey) {
            const mapRect = event.currentTarget.getBoundingClientRect();
            const clickX = event.clientX - mapRect.left;
            const clickY = event.clientY - mapRect.top;

            const targetX = (clickX / mapRect.width) * 100;
            const targetY = (clickY / mapRect.height) * 100;

            onPing({ x: targetX, y: targetY });
        }
        // Could also handle direct movement clicks on minimap here in the future
    };

    return (
        <div 
            className="absolute bottom-4 right-4 w-64 h-64 bg-black/70 border-2 border-white/20 rounded-md pointer-events-auto overflow-hidden"
            onClick={handleMapClick}
        >
            {/* Placeholder for map generated from Tiled data */}
            <div className="relative w-full h-full bg-gray-800/50">
                {/* Display objectives */}
                {objectives.map(obj => (
                    <div
                        key={obj.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${obj.position.x}%`, top: `${obj.position.y}%` }}
                    >
                        <TowerControl className={cn(
                            "w-4 h-4",
                            obj.teamId === 'blue' ? 'text-blue-500' : 'text-red-500'
                        )} />
                    </div>
                ))}


                {/* Display units */}
                {units.map(unit => {
                    const isPlayerUnit = unit.control.controllerPlayerId === currentPlayerId;
                    const isAlly = !isPlayerUnit && playerTeam && unit.teamId === (playerTeam.name === "Équipe Bleue" ? 'blue' : 'red');

                    let dotColor = teams[unit.teamId]?.color || '#ffffff';
                    if (isPlayerUnit) dotColor = '#00ffff'; // Cyan for player's own units
                    else if (isAlly) dotColor = teams[unit.teamId]?.color;
                    else dotColor = teams[unit.teamId]?.color; // Could be different for enemies if needed
                    

                    return (
                        <div
                            key={unit.id}
                            className={cn(
                                "absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2",
                                isPlayerUnit ? "z-10" : "z-0"
                            )}
                            style={{
                                left: `${unit.position.x}%`,
                                top: `${unit.position.y}%`,
                                backgroundColor: dotColor,
                                boxShadow: isPlayerUnit ? `0 0 4px 1px ${dotColor}`: 'none',
                            }}
                        />
                    );
                })}
                
                <AnimatePresence>
                    {pings.map((ping) => (
                        <MiniPingDisplay key={ping.id} x={ping.x} y={ping.y} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MiniMap;
