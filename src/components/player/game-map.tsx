
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Shield, Swords, Wind, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unit, Team, UnitComposition } from '@/lib/types';
import { moveUnit } from '@/app/actions';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArmoredIcon, AssassinIcon, MageIcon, ValkyrieIcon, ArcherIcon } from './unit-icons';
import { Progress } from '@/components/ui/progress';

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
};

const UnitDisplay = ({ unit, isPlayerUnit, team }: { unit: Unit; isPlayerUnit: boolean, team: Team }) => {
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
                    isPlayerUnit ? "border-cyan-400" : team?.bgClass.replace('bg-', 'border-'),
                    glowClass
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


export default function GameMap({ playerUnits, otherUnits, teams }: GameMapProps) {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');
    const allUnits = [...playerUnits, ...otherUnits];

    const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (!pseudo || playerUnits.length === 0) return;

        const mapRect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - mapRect.left;
        const clickY = event.clientY - mapRect.top;

        const targetX = (clickX / mapRect.width) * 100;
        const targetY = (clickY / mapRect.height) * 100;

        console.log(`Map clicked at: (${targetX.toFixed(2)}%, ${targetY.toFixed(2)}%)`);

        // For now, move all player units to the clicked location.
        // Later, this will depend on which units are selected.
        try {
            const movePromises = playerUnits.map(unit => 
                moveUnit(pseudo, unit.id, { x: targetX, y: targetY })
            );
            await Promise.all(movePromises);
        } catch (error) {
            console.error("Failed to request unit move:", error);
        }
    };


    return (
        <TooltipProvider>
            <div
                className="relative w-full h-full overflow-hidden bg-muted select-none"
                onClick={handleMapClick}
            >
                <Image
                    src="https://picsum.photos/seed/map/2048/2048"
                    alt="Game Map"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-50 pointer-events-none"
                    data-ai-hint="fantasy map"
                    priority
                />

                <AnimatePresence>
                    {allUnits.map((unit) => (
                        <motion.div
                            key={unit.id}
                            layout
                            initial={{
                                left: `${unit.position.x}%`,
                                top: `${unit.position.y}%`,
                            }}
                            animate={{
                                left: `${unit.position.x}%`,
                                top: `${unit.position.y}%`,
                            }}
                            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        >
                            <UnitDisplay 
                                unit={unit} 
                                isPlayerUnit={unit.control.controllerPlayerId === pseudo} 
                                team={teams[unit.teamId]}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}
