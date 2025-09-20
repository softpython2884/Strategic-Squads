
'use client';

import React from 'react';
import type { Unit, Team } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TowerControl } from 'lucide-react';

type MiniMapProps = {
  units: Unit[];
  teams: { [key: string]: Team };
  currentPlayerId: string | null;
};

// Static objectives for now
const objectives = [
  { id: 'tower-n', name: "Tour Nord", position: { x: 20, y: 20 }, teamId: 'red' },
  { id: 'tower-s', name: "Tour Sud", position: { x: 80, y: 80 }, teamId: 'blue' },
  { id: 'idol-n', name: "Idole Nord", position: { x: 15, y: 15 }, teamId: 'red' },
  { id: 'idol-s', name: "Idole Sud", position: { x: 85, y: 85 }, teamId: 'blue' },
];


const MiniMap = ({ units, teams, currentPlayerId }: MiniMapProps) => {
    return (
        <div className="absolute bottom-4 right-4 w-64 h-64 bg-black/70 border-2 border-white/20 rounded-md pointer-events-auto overflow-hidden">
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
                    const isPlayer = unit.control.controllerPlayerId === currentPlayerId;
                    const isAlly = !isPlayer && unit.teamId === teams[currentPlayerId?.split('-')[0] as 'blue' | 'red']?.name.toLowerCase().split(' ')[1];
                    let dotColor = teams[unit.teamId]?.color || '#ffffff';
                    if (isPlayer) dotColor = '#00ffff'; // Cyan for player's units

                    return (
                        <div
                            key={unit.id}
                            className={cn(
                                "absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2",
                                isPlayer ? "z-10" : "z-0"
                            )}
                            style={{
                                left: `${unit.position.x}%`,
                                top: `${unit.position.y}%`,
                                backgroundColor: dotColor,
                                boxShadow: isPlayer ? `0 0 4px 1px ${dotColor}`: 'none',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MiniMap;
