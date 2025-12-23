

"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Unit, Team } from "@/lib/types";
import { SkillBar } from "./hud/SkillBar";
import { UnitStatus } from "./hud/UnitStatus";
import { MiniMap } from "./hud/MiniMap";

// Types for Game State (simplified for client rendering)
interface GameState {
    units: Unit[];
    teams: { [key: string]: Team };
    gameTime: number;
}

export function GameRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const pseudo = searchParams.get("pseudo");

    // Game State Refs (to avoid re-renders)
    const gameStateRef = useRef<GameState>({ units: [], teams: {}, gameTime: 0 });
    const wsRef = useRef<WebSocket | null>(null);
    const frameIdRef = useRef<number>(0);

    const [isLoading, setIsLoading] = useState(true);


    // Setup WebSocket
    useEffect(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `ws://${window.location.hostname}:8080`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Game WebSocket Connected");
            setIsLoading(false);
            // Re-send join or identify if needed, but for now we listen for updates
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "full-state" || message.type === "update-state") {
                gameStateRef.current = message.payload;
            }
        };

        ws.onclose = () => {
            console.log("Game WebSocket Disconnected");
        }

        ws.onerror = (error) => {
            console.error("Game WS Error:", error);
            // Optional: Don't show toast on initial load error to avoid spam if server is waking up
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            cancelAnimationFrame(frameIdRef.current);
        };
    }, []); // Removed [toast] dependency to prevent re-runs

    // Game Loop (Rendering)
    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;

            // Fit Canvas to Container
            if (containerRef.current) {
                // Simple resize logic
                if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
                    canvas.width = containerRef.current.clientWidth;
                    canvas.height = containerRef.current.clientHeight;
                }
            }

            // 1. Clear Screen
            ctx.fillStyle = "#1a2c2c"; // Dark Teal Background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Grid/Map (Placeholder)
            ctx.strokeStyle = "#2f4f4f";
            ctx.lineWidth = 1;
            const gridSize = 50;
            // Offset logic would go here if we had camera panning
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // 3. Draw Units
            const units = gameStateRef.current.units;
            units.forEach(unit => {
                // Map Logic: Unit pos (0-100) -> Canvas pos (pixels)
                // For now, assuming map is 100x100 logical units
                const scaleX = canvas.width / 100;
                const scaleY = canvas.height / 100;

                const x = unit.position.x * scaleX;
                const y = unit.position.y * scaleY;
                const radius = 10; // Or based on unit size

                // Team Color
                ctx.fillStyle = unit.teamId === 'blue' ? '#3b82f6' : '#ef4444';

                // Highlight logic (e.g., selection)
                if (unit.control.controllerPlayerId === pseudo) {
                    ctx.shadowColor = "white";
                    ctx.shadowBlur = 10;
                } else {
                    ctx.shadowBlur = 0;
                }

                // Draw Circle (Unit)
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Draw Health Bar
                const hpPercent = unit.stats.hp / unit.stats.maxHp;
                ctx.fillStyle = "red";
                ctx.fillRect(x - 10, y - 15, 20, 4);
                ctx.fillStyle = "lime";
                ctx.fillRect(x - 10, y - 15, 20 * hpPercent, 4);
            });

            frameIdRef.current = requestAnimationFrame(render);
        };

        frameIdRef.current = requestAnimationFrame(render);
    }, [pseudo]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-medium">Entering Battlefield...</p>
                </div>
            </div>
        );
    }


    const playerUnits = gameStateRef.current.units.filter(u => u.control.controllerPlayerId === pseudo);
    const primaryUnit = playerUnits[0];

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black cursor-crosshair">
            {/* Game World (Canvas) */}
            <canvas
                ref={canvasRef}
                className="block h-full w-full"
                onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect || !wsRef.current) return;
                    const x = (e.clientX - rect.left) / (rect.width / 100);
                    const y = (e.clientY - rect.top) / (rect.height / 100);

                    if (playerUnits.length > 0) {
                        wsRef.current.send(JSON.stringify({
                            type: 'move',
                            payload: {
                                playerId: pseudo,
                                unitIds: playerUnits.map(u => u.id),
                                position: { x, y }
                            }
                        }));
                    }
                }}
            />

            {/* HUD Overlays */}

            {/* Top Center: Game Time */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-black/80 backdrop-blur border border-primary/30 rounded-full shadow-lg shadow-primary/10">
                    <span className="text-2xl font-bold font-mono text-primary-foreground tracking-widest">
                        {Math.floor(gameStateRef.current.gameTime / 60).toString().padStart(2, '0')}:
                        {(gameStateRef.current.gameTime % 60).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Bottom Left: Unit Status */}
            <div className="absolute bottom-8 left-8 transition-all hover:scale-105 origin-bottom-left">
                <UnitStatus unit={primaryUnit} />
            </div>

            {/* Bottom Center: Skills */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <SkillBar unit={primaryUnit} />
            </div>

            {/* Bottom Right: MiniMap */}
            <div className="absolute bottom-8 right-8 transition-all hover:scale-110 origin-bottom-right">
                <MiniMap units={gameStateRef.current.units} teams={gameStateRef.current.teams} />
            </div>
        </div>
    );
}
