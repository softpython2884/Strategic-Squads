

'use client';

import React from 'react';
import type { Unit } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type UnitPortraitProps = {
    unit: Unit;
    isPlayerUnit: boolean;
    onClick: () => void;
};

const UnitPortrait = ({ unit, isPlayerUnit, onClick }: UnitPortraitProps) => {
    
    const healthPercentage = (unit.stats.hp / unit.stats.maxHp) * 100;
    const resourcePercentage = (unit.stats.resource / unit.stats.maxResource) * 100;
    const xpPercentage = (unit.progression.xp / unit.progression.xpToNextLevel) * 100;

    return (
        <div 
            className={cn(
                "relative flex items-center gap-3 p-2 rounded-lg bg-black/60 border border-white/10 pointer-events-auto cursor-pointer hover:bg-white/10",
                isPlayerUnit && "border-primary"
            )}
            onClick={onClick}
        >
            <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-background">
                    <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${unit.heroId}`} />
                    <AvatarFallback>{unit.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <Badge variant="secondary" className="absolute bottom-0 right-0 w-6 h-6 p-0 flex items-center justify-center text-sm font-bold border-2 border-background">
                    {unit.progression.level}
                </Badge>
            </div>
            <div className="flex-1 text-white text-sm space-y-1">
                <p className="font-bold truncate">{unit.name}</p>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/20">
                    <div style={{width: `${healthPercentage}%`}} className="h-full bg-green-500"></div>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/20">
                    <div style={{width: `${resourcePercentage}%`}} className="h-full bg-blue-500"></div>
                </div>
                 <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/20">
                    <div style={{width: `${xpPercentage}%`}} className="h-full bg-yellow-400"></div>
                </div>
            </div>
        </div>
    );
};

type TeamPanelProps = {
    teamUnits: Unit[];
    currentPlayerId: string | null;
    onUnitSelect: (unitId: string) => void;
};


const TeamPanel = ({ teamUnits, currentPlayerId, onUnitSelect }: TeamPanelProps) => {
    
    // Filter out non-player units like towers
    const playerControlledUnits = teamUnits.filter(u => u.control.controllerPlayerId);

    // Separate current player's units and teammates' units
    const myUnits = playerControlledUnits.filter(u => u.control.controllerPlayerId === currentPlayerId);
    const teammateUnits = playerControlledUnits.filter(u => u.control.controllerPlayerId !== currentPlayerId);

    // Sort to keep a consistent order
    myUnits.sort((a, b) => a.id.localeCompare(b.id));
    teammateUnits.sort((a, b) => a.id.localeCompare(b.id));

    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 w-52 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {myUnits.map(unit => (
                <UnitPortrait key={unit.id} unit={unit} isPlayerUnit={true} onClick={() => onUnitSelect(unit.id)} />
            ))}
            {myUnits.length > 0 && teammateUnits.length > 0 && <hr className="border-white/20 my-1" />}
            {teammateUnits.map(unit => (
                <UnitPortrait key={unit.id} unit={unit} isPlayerUnit={false} onClick={() => onUnitSelect(unit.id)} />
            ))}
        </div>
    );
};

export default TeamPanel;
