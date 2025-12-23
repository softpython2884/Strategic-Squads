
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Unit } from "@/lib/types";
import { Swords, Shield, Zap, Wind } from "lucide-react";

interface SkillBarProps {
    unit: Unit | undefined;
}

export function SkillBar({ unit }: SkillBarProps) {
    if (!unit) return null;

    // Placeholder skills based on class (In reality, fetch from HEROES_DATA)
    const skills = [
        { id: "q", icon: Swords, label: "Q", color: "bg-red-500" },
        { id: "w", icon: Shield, label: "W", color: "bg-blue-500" },
        { id: "e", icon: Zap, label: "E", color: "bg-yellow-500" },
        { id: "r", icon: Wind, label: "R", color: "bg-purple-500" },
    ];

    return (
        <div className="flex gap-4 p-4 bg-black/60 backdrop-blur border border-white/10 rounded-xl">
            {skills.map((skill) => {
                // const cooldown = unit.combat.cooldowns[skill.id] || 0;
                const cooldown = 0; // consistent placeholder for now

                return (
                    <div key={skill.id} className="relative group">
                        <div className={cn(
                            "w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold border-2 border-transparent transition-all",
                            skill.color,
                            "opacity-80 group-hover:opacity-100 group-hover:scale-105 group-hover:border-white"
                        )}>
                            <skill.icon className="w-8 h-8" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-0.5 rounded border border-white/20">
                            {skill.label}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
