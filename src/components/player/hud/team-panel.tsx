

'use client';

import React from 'react';
import type { Unit, Team } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArmoredIcon, AssassinIcon, MageIcon, ValkyrieIcon, ArcherIcon } from '../unit-icons';

const classIcons: { [key: string]: React.ElementType } = {
    Blindé: ArmoredIcon,
    Mage: MageIcon,
    Valkyrie: ValkyrieIcon,
    Archer: ArcherIcon,
    Assassin: AssassinIcon,
};

type PlayerGroup = {
    playerId: string;
    units: Unit[];
};

const PlayerPortrait = ({ player, team, isCurrentUser }: { player: PlayerGroup, team: Team, isCurrentUser: boolean }) => {
    const mainUnit = player.units[0];
    if (!mainUnit) return null;

    const health = player.units.reduce((acc, u) => acc + u.stats.hp, 0);
    const maxHealth = player.units.reduce((acc, u) => acc + u.stats.maxHp, 1);
    const resource = player.units.reduce((acc, u) => acc + u.stats.resource, 0);
    const maxResource = player.units.reduce((acc, u) => acc + u.stats.maxResource, 1);
    
    const healthPercentage = (health / maxHealth) * 100;
    const resourcePercentage = (resource / maxResource) * 100;

    // Calculate circumference for the circular bars
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const healthStrokeDashoffset = circumference - (healthPercentage / 100) * circumference;
    const resourceStrokeDashoffset = circumference - (resourcePercentage / 100) * circumference;

    return (
        <div className={cn(
            "relative flex items-center gap-3 p-2 rounded-lg bg-black/60 border border-white/10 pointer-events-auto cursor-pointer hover:bg-white/10",
            isCurrentUser && "border-primary"
        )}>
            <div className="relative">
                <Avatar className="w-14 h-14 border-2 border-background">
                    <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${mainUnit.control.controllerPlayerId}`} />
                    <AvatarFallback>{mainUnit.control.controllerPlayerId?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                {/* Status Ring */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rotate-[-90deg]" viewBox="0 0 36 36" style={{width: '68px', height: '68px'}}>
                    {/* Background for rings */}
                    <circle cx="18" cy="18" r={radius} className="text-black/30" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                    
                    {/* Mana Bar */}
                    <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        className="text-blue-500"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={resourceStrokeDashoffset}
                    />

                     {/* Health Bar */}
                     <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={healthStrokeDashoffset + (circumference - (circumference * 0.5))}
                        pathLength={circumference/2}
                    />
                </svg>

                <Badge className="absolute bottom-0 right-0 w-6 h-6 p-0 flex items-center justify-center text-sm font-bold border-2 border-background">
                    {mainUnit.progression.level}
                </Badge>
            </div>
            <div className="flex-1 text-white">
                <p className="font-bold truncate">{player.playerId}</p>
                <div className="flex items-center gap-1 text-xs text-white/70">
                    <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/20">
                        <div style={{width: `${(mainUnit.progression.xp / mainUnit.progression.xpToNextLevel) * 100}%`}} className="h-full bg-yellow-400"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamPanel = ({ teamMates, teams, currentPlayerId }: { teamMates: Unit[], teams: {[key: string]: Team}, currentPlayerId: string | null }) => {
    // Group units by player
    const playerGroups = teamMates.reduce((acc, unit) => {
        const playerId = unit.control.controllerPlayerId;
        if (playerId) {
            if (!acc[playerId]) {
                acc[playerId] = { playerId, units: [] };
            }
            acc[playerId].units.push(unit);
        }
        return acc;
    }, {} as { [key: string]: PlayerGroup });
    
    const players = Object.values(playerGroups);
    const teamId = players[0]?.units[0]?.teamId;
    const team = teamId ? teams[teamId] : null;

    // Add current player to the top of the list
    const currentPlayerUnits = teamMates.filter(u => u.control.controllerPlayerId === currentPlayerId);
    const allPlayersInPanel = [];

    if (currentPlayerId && currentPlayerUnits.length > 0) {
        allPlayersInPanel.push({
            playerId: currentPlayerId,
            units: currentPlayerUnits,
        });
    }

    const otherPlayers = players.filter(p => p.playerId !== currentPlayerId);
    allPlayersInPanel.push(...otherPlayers);


    // Fill with empty slots to always show 4
    while(allPlayersInPanel.length < 4) {
        allPlayersInPanel.push({playerId: ``, units: []});
    }

    if (!team) return null;

    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 w-52">
            {allPlayersInPanel.slice(0,4).map((player, index) => (
               player.units.length > 0 
                ? <PlayerPortrait key={player.playerId || index} player={player} team={team} isCurrentUser={player.playerId === currentPlayerId} />
                : <div key={index} className="h-[76px] w-full bg-black/50 rounded-lg border border-white/10"></div>
            ))}
        </div>
    );
};

export default TeamPanel;
