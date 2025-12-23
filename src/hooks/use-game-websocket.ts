
"use client";

import { useEffect, useRef, useState } from 'react';

interface GameState {
    units: any[];
    teams: { [key: string]: any };
    gameTime: number;
    gameStarted?: boolean;
}

interface UseGameWebSocketOptions {
    onGameStart?: () => void;
    onError?: (error: Event) => void;
}

export function useGameWebSocket(options?: UseGameWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        units: [],
        teams: {},
        gameTime: 0,
        gameStarted: false
    });
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Prevent multiple connections
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        const wsUrl = `ws://${window.location.hostname}:8080`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[useGameWebSocket] Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'full-state' || message.type === 'update-state') {
                    setGameState(message.payload);
                } else if (message.type === 'game-started') {
                    options?.onGameStart?.();
                }
            } catch (error) {
                console.error('[useGameWebSocket] Failed to parse message:', error);
            }
        };

        ws.onclose = () => {
            console.log('[useGameWebSocket] Disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('[useGameWebSocket] Error:', error);
            options?.onError?.(error);
            setIsConnected(false);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, []); // No dependencies to prevent re-runs

    const sendMessage = (message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('[useGameWebSocket] Cannot send message, not connected');
        }
    };

    return {
        gameState,
        isConnected,
        sendMessage,
        ws: wsRef.current
    };
}
