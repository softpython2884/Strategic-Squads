
"use client";

import { useEffect, useRef } from "react";
import type { Unit, Team } from "@/lib/types";

interface MiniMapProps {
    units: Unit[];
    teams: { [key: string]: Team };
}

export function MiniMap({ units, teams }: MiniMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Border
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw Units
        units.forEach(unit => {
            const x = (unit.position.x / 100) * canvas.width;
            const y = (unit.position.y / 100) * canvas.height;

            ctx.fillStyle = unit.teamId === 'blue' ? '#3b82f6' : '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

    }, [units]);

    return (
        <div className="bg-black/90 border border-white/20 rounded-lg overflow-hidden w-[200px] h-[200px] shadow-lg shadow-black/50">
            <canvas ref={canvasRef} width={200} height={200} className="block w-full h-full" />
        </div>
    );
}
