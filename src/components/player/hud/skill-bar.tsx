
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import React from 'react';

// NOTE: These are dummy skills for layout and styling purposes.
// They will be replaced with real data from the selected unit.
const skills = [
    { shortcut: 'Q', name: 'Frappe Puissante', cooldown: 10, remaining: 0, unlocked: true },
    { shortcut: 'W', name: 'Charge Bestiale', cooldown: 12, remaining: 8, unlocked: true },
    { shortcut: 'E', name: 'Cri de Fureur', cooldown: 15, remaining: 0, unlocked: true },
    { shortcut: 'R', name: 'Impact Dévastateur', cooldown: 0, remaining: 0, unlocked: false },
];

const ultimate = {
    shortcut: 'F',
    name: 'Ultime Signature',
    cooldown: 120,
    remaining: 45,
    unlocked: true,
}

const SkillIcon = ({ skill }: { skill: any }) => {
    const inCooldown = skill.unlocked && skill.remaining > 0;
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn(
                    "relative w-12 h-12 bg-black/60 border-2 border-white/20 rounded-md cursor-pointer pointer-events-auto hover:border-yellow-400 transition-all",
                    !skill.unlocked && "cursor-not-allowed hover:border-white/20"
                )}>
                    <div className="w-full h-full flex items-center justify-center">
                        {/* Placeholder for skill icon */}
                    </div>
                    {inCooldown && (
                        <>
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-lg font-headline">
                                {skill.remaining}
                            </div>
                            <div className="absolute inset-0 bg-black/70"></div>
                        </>

                    )}
                    {!skill.unlocked && (
                         <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white/50">
                            <Lock className="w-6 h-6"/>
                        </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-gray-800 border border-gray-600 text-white text-xs font-bold flex items-center justify-center rounded-sm">
                        {skill.shortcut}
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="font-bold">{skill.name}</p>
                {skill.unlocked ? (
                    <p className="text-sm text-muted-foreground">Cooldown: {skill.cooldown}s</p>
                ) : (
                    <p className="text-sm text-amber-400">Non débloqué</p>
                )}
            </TooltipContent>
        </Tooltip>
    )
}

const SkillBar = () => {
    // For now, we just show 4 skills + 1 ultimate.
    // This could be expanded based on the selected unit later.
    return (
        <TooltipProvider>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 rounded-t-lg">
                {skills.map(skill => <SkillIcon key={skill.shortcut} skill={skill} />)}
                <div className="w-px h-16 bg-white/20 mx-2"></div>
                <div className="relative">
                    {/* Make the ultimate icon bigger */}
                    <div className="w-16 h-16">
                         <SkillIcon skill={ultimate} />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default SkillBar;
