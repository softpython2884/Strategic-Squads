
'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import type { Unit, Skill as SkillData } from '@/lib/types';
import { HEROES_DATA } from '@/lib/heroes';

type SkillBarProps = {
    playerUnits: Unit[];
    onUseSkill: (unitId: string, skillId: string) => void;
};

const SKILL_SHORTCUTS = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I'];

const SkillIcon = ({ unit, skill, shortcut, onUse, cooldown }: { unit: Unit, skill: SkillData, shortcut: string, onUse: () => void, cooldown: number }) => {
    const isUnlocked = unit.progression.level >= (skill.level || 1);
    const inCooldown = isUnlocked && cooldown > 0;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div 
                    className={cn(
                        "relative w-12 h-12 bg-black/60 border-2 border-white/20 rounded-md cursor-pointer pointer-events-auto hover:border-yellow-400 transition-all",
                        (!isUnlocked || inCooldown) && "cursor-not-allowed hover:border-white/20"
                    )}
                    onClick={() => {
                        if (isUnlocked && !inCooldown) {
                            onUse();
                        }
                    }}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        {/* Placeholder for skill icon */}
                    </div>
                    {inCooldown && (
                        <>
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-lg font-headline">
                                {Math.ceil(cooldown)}
                            </div>
                        </>
                    )}
                    {!isUnlocked && (
                         <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white/50">
                            <Lock className="w-6 h-6"/>
                        </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-gray-800 border border-gray-600 text-white text-xs font-bold flex items-center justify-center rounded-sm">
                        {shortcut}
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="font-bold">{skill.name}</p>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
                {isUnlocked ? (
                    <p className="text-sm text-muted-foreground mt-1">Cooldown: {skill.cooldown}s</p>
                ) : (
                    <p className="text-sm text-amber-400 mt-1">Débloqué au niveau {skill.level || 1}</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
};

const SkillBar = ({ playerUnits, onUseSkill }: SkillBarProps) => {
    const skillsToDisplay: { unit: Unit, skill: SkillData }[] = [];
    const totalSlots = 8;
    
    if (playerUnits.length > 0) {
        const skillsPerUnit = Math.floor(totalSlots / playerUnits.length);
        let remainder = totalSlots % playerUnits.length;

        for (const unit of playerUnits) {
            const heroData = HEROES_DATA.find(h => h.id === unit.heroId);
            if (heroData) {
                const skillsToAddCount = skillsPerUnit + (remainder > 0 ? 1 : 0);
                const unitSkills = heroData.skills.filter(s => s.id !== 4).slice(0, skillsToAddCount);
                
                unitSkills.forEach(skill => {
                    skillsToDisplay.push({ unit, skill });
                });

                if (remainder > 0) {
                    remainder--;
                }
            }
        }
    }
    
    const mainHeroUnit = playerUnits[0];
    const ultimate = mainHeroUnit ? HEROES_DATA.find(h => h.id === mainHeroUnit.heroId)?.skills.find(s => s.id === 4) : null;


    return (
        <TooltipProvider>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 rounded-t-lg">
                {skillsToDisplay.slice(0, 8).map(({ unit, skill }, index) => (
                    <SkillIcon 
                        key={`${unit.id}-${skill.id}`} 
                        unit={unit}
                        skill={skill} 
                        shortcut={SKILL_SHORTCUTS[index] || ''}
                        onUse={() => onUseSkill(unit.id, skill.id.toString())}
                        cooldown={unit.combat.cooldowns[skill.id] || 0}
                    />
                ))}
                
                {mainHeroUnit && ultimate && (
                    <>
                        <div className="w-px h-16 bg-white/20 mx-2"></div>
                        <div className="relative">
                            <div className="w-16 h-16">
                                <SkillIcon
                                    unit={mainHeroUnit}
                                    skill={ultimate}
                                    shortcut="F"
                                    onUse={() => onUseSkill(mainHeroUnit.id, ultimate.id.toString())}
                                    cooldown={mainHeroUnit.combat.cooldowns[ultimate.id] || 0}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
};

export default SkillBar;
