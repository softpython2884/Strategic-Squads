
"use client";

import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Unit } from "@/lib/types";

interface UnitStatusProps {
    unit: Unit | undefined;
}

export function UnitStatus({ unit }: UnitStatusProps) {
    if (!unit) return null;

    const hpPercent = (unit.stats.hp / unit.stats.maxHp) * 100;

    return (
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur p-4 rounded-xl border border-white/10 min-w-[300px]">
            <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${unit.id}`} />
                <AvatarFallback>{unit.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-bold text-white">
                    <span>{unit.name}</span>
                    <span>Lvl {unit.progression.level}</span>
                </div>
                <div className="space-y-1">
                    <div className="relative h-4 w-full bg-slate-800 rounded overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                            style={{ width: `${hpPercent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white shadow-sm">
                            {unit.stats.hp} / {unit.stats.maxHp}
                        </span>
                    </div>
                    {/* Resource Bar (Mana/Energy) */}
                    <div className="h-2 w-full bg-slate-800 rounded overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: '100%' }} // Placeholder
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
