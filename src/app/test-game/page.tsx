
"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TestGamePage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo') || 'TestPlayer';

    const [status, setStatus] = useState('Connecting...');
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        // WebSocket connection
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('✅ Connected!');
            setStatus('Connected');

            // Auto-join game for testing
            ws.send(JSON.stringify({
                type: 'joinGame',
                payload: {
                    pseudo: pseudo,
                    teamId: 'blue',
                    squadType: 'attaque',
                    squad: [
                        { id: 'hero_001', name: 'Rokgar', type: 'Blindé' },
                        { id: 'hero_002', name: 'Kaelith', type: 'Assassin' },
                    ]
                }
            }));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'full-state' || msg.type === 'update-state') {
                setUnits(msg.payload.units || []);
                setStatus(`Units: ${msg.payload.units?.length || 0}`);
            }
        };

        ws.onerror = (err) => {
            console.error('❌ WebSocket Error:', err);
            setStatus('Error!');
        };

        ws.onclose = () => {
            setStatus('Disconnected');
        };

        return () => ws.close();
    }, [pseudo]);

    // Render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            // Clear
            ctx.fillStyle = '#0a1a1a';
            ctx.fillRect(0, 0, 800, 600);

            // Draw units
            units.forEach(unit => {
                const x = (unit.position.x / 100) * 800;
                const y = (unit.position.y / 100) * 600;

                ctx.fillStyle = unit.teamId === 'blue' ? '#3b82f6' : '#ef4444';
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fill();

                // Name
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(unit.name, x - 20, y - 15);
            });

            requestAnimationFrame(render);
        };

        render();
    }, [units]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-2xl mb-4">Test Game - {pseudo}</h1>
            <div className="mb-2 text-green-400">{status}</div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border-2 border-gray-700"
            />
            <div className="mt-4 text-sm">
                <p>Unités à l'écran: {units.length}</p>
                <button
                    onClick={() => {
                        wsRef.current?.send(JSON.stringify({
                            type: 'move',
                            payload: {
                                playerId: pseudo,
                                unitIds: units.filter(u => u.control.controllerPlayerId === pseudo).map(u => u.id),
                                position: { x: 50, y: 50 }
                            }
                        }));
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                    Move to Center
                </button>
            </div>
        </div>
    );
}
