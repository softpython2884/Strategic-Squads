
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Swords, Wind, Crosshair, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unit, Team, UnitComposition } from '@/lib/types';
import { moveUnit } from '@/app/actions';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArmoredIcon, AssassinIcon, MageIcon, ValkyrieIcon, ArcherIcon } from './unit-icons';

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

export default function GameMap({ playerUnits, otherUnits, teams }: GameMapProps) {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');
    const allUnits = [...playerUnits, ...otherUnits];

    // Example of client-side logic to trigger a move
    useEffect(() => {
        if (!pseudo || playerUnits.length === 0) return;

        const unitToMove = playerUnits[0];
        
        const handleRandomMove = async () => {
            const newX = unitToMove.position.x + (Math.random() - 0.5) * 10;
            const newY = unitToMove.position.y + (Math.random() - 0.5) * 10;

            try {
                await moveUnit(pseudo, unitToMove.id, { x: newX, y: newY });
            } catch (error) {
                console.error("Failed to request unit move:", error);
            }
        };
        
        const interval = setInterval(handleRandomMove, 3000);
        return () => clearInterval(interval);

    }, [pseudo, playerUnits]);

    const UnitIcon = ({ unit, isPlayerUnit }: { unit: Unit; isPlayerUnit: boolean }) => {
        const ClassIcon = classIcons[unit.type];
        const RoleIcon = compositionIcons[unit.composition];
        
        let glowClass = '';
        if (isPlayerUnit) {
            glowClass = 'shadow-[0_0_12px_3px_rgba(56,189,248,0.7)]'; // Light blue glow for player's own units
        } else if (unit.teamId === 'blue') {
            glowClass = 'shadow-[0_0_10px_2px_rgba(37,99,235,0.6)]'; // Blue glow
        } else {
            glowClass = 'shadow-[0_0_10px_2px_rgba(220,38,38,0.6)]'; // Red glow
        }

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative w-12 h-12 cursor-pointer group">
                        <div className={cn(
                            "absolute inset-0 rounded-full border-2 transition-all duration-300",
                            isPlayerUnit ? "border-sky-400" : teams[unit.teamId]?.bgClass.replace('bg-', 'border-'),
                            glowClass
                        )}>
                            <div className="relative flex items-center justify-center w-full h-full">
                                {ClassIcon && <ClassIcon className={cn("w-6 h-6", teams[unit.teamId]?.textClass)} />}
                            </div>
                        </div>

                         <div className="absolute flex items-center justify-center w-5 h-5 border-2 rounded-full -top-1 -right-1 bg-card border-card-foreground/50">
                            {RoleIcon && <RoleIcon className="w-3 h-3 text-foreground" />}
                        </div>
                        
                        <div className="absolute w-full mt-1 text-center -bottom-6">
                            <p className="px-2 py-0.5 text-xs rounded-full opacity-0 whitespace-nowrap bg-background/80 text-foreground group-hover:opacity-100 transition-opacity">
                                {unit.name}
                            </p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{unit.name}</p>
                    <p>Équipe: {teams[unit.teamId]?.name}</p>
                    <p>Santé: {unit.stats.hp} / {unit.stats.maxHp}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <TooltipProvider>
            <div
                className="relative overflow-hidden border-2 rounded-lg shadow-2xl border-primary bg-muted"
                style={{ width: 1200, height: 1200 }} 
            >
                <Image
                    src="https://picsum.photos/seed/map/2048/2048"
                    alt="Game Map"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-50"
                    data-ai-hint="fantasy map"
                />

                <AnimatePresence>
                    {allUnits.map((unit) => (
                        <motion.div
                            key={unit.id}
                            layout
                            initial={{
                                left: `${unit.position.x}%`,
                                top: `${unit.position.y}%`,
                                x: '-50%',
                                y: '-50%',
                            }}
                            animate={{
                                left: `${unit.position.x}%`,
                                top: `${unit.position.y}%`,
                            }}
                            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                            className="absolute"
                        >
                            <UnitIcon unit={unit} isPlayerUnit={unit.control.controllerPlayerId === pseudo} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}
