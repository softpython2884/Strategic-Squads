
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import React from 'react';

const skills = [
    { shortcut: 'A', name: 'Compétence 1', cooldown: 10, remaining: 3 },
    { shortcut: 'Z', name: 'Compétence 2', cooldown: 5, remaining: 0 },
    { shortcut: 'E', name: 'Compétence 3', cooldown: 12, remaining: 0 },
    { shortcut: 'R', name: 'Compétence 4', cooldown: 8, remaining: 5 },
    { shortcut: 'T', name: 'Compétence 5', locked: true },
    { shortcut: 'Y', name: 'Compétence 6', locked: true },
    { shortcut: 'U', name: 'Compétence 7', locked: true },
    { shortcut: 'I', name: 'Compétence 8', locked: true },
];

const ultimate = {
    shortcut: 'F',
    name: 'Ultime Signature',
    cooldown: 120,
    remaining: 45
}

const SkillIcon = ({ skill }: { skill: any }) => {
    const inCooldown = !skill.locked && skill.remaining > 0;
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative w-12 h-12 bg-black/60 border-2 border-white/20 rounded-md cursor-pointer pointer-events-auto hover:border-yellow-400">
                    <div className="w-full h-full flex items-center justify-center">
                        {/* Placeholder for skill icon */}
                    </div>
                    {inCooldown && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-lg">
                            {skill.remaining}
                        </div>
                    )}
                    {skill.locked && (
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
                {!skill.locked && <p>Cooldown: {skill.cooldown}s</p>}
                {skill.locked && <p>Non débloqué</p>}
            </TooltipContent>
        </Tooltip>
    )
}

const SkillBar = () => {
    return (
        <TooltipProvider>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 rounded-t-lg">
                {skills.map(skill => <SkillIcon key={skill.shortcut} skill={skill} />)}
                <div className="w-px h-16 bg-white/20 mx-2"></div>
                <SkillIcon skill={ultimate} />
            </div>
        </TooltipProvider>
    );
};

export default SkillBar;
