
'use server';

import { WebSocketServer, WebSocket } from 'ws';
import { gameEngine } from '@/server/instance';
import type { JoinGameInput } from '@/app/actions';

const WS_PORT = 8080;
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

type PingPayload = {
    id: string;
    x: number;
    y: number;
    playerId: string;
}

type ServerAction =
    | { type: 'joinGame', payload: JoinGameInput }
    | { type: 'move', payload: { playerId: string, unitIds: string[], position: { x: number, y: number } } }
    | { type: 'useSkill', payload: { playerId: string, unitId: string, skillId: string, targetId?: string } }
    | { type: 'attack', payload: { playerId: string, unitIds: string[], targetId: string | null, position: { x: number, y: number } } }
    | { type: 'startGame' }
    | { type: 'ping', payload: PingPayload };


// This function now handles actions sent directly from clients via WebSocket
async function handleClientAction(action: ServerAction, ws: WebSocket) {
    switch (action.type) {
        case 'joinGame':
            console.log(`[Game Server] Handling joinGame for ${action.payload.pseudo}`);
            if (gameEngine.isGameStarted) {
                console.log(`[Game Server] Denying joinGame for ${action.payload.pseudo}, game already started.`);
                ws.send(JSON.stringify({ type: 'join-failed', reason: 'La partie a déjà commencé.' }));
            } else {
                gameEngine.addPlayerSquad(action.payload);
                ws.send(JSON.stringify({ type: 'join-success' }));
                await broadcastGameState();
            }
            break;
        case 'move':
            console.log(`[Game Server] Handling move for player ${action.payload.playerId}`);
            gameEngine.setPlayerMoveTarget(action.payload.unitIds, action.payload.position);
            break;
        case 'attack':
            console.log(`[Game Server] Handling attack for player ${action.payload.playerId}`);
            gameEngine.setPlayerAttackFocus(action.payload.unitIds, action.payload.targetId, action.payload.position);
            break;
        case 'useSkill':
            console.log(`[Game Server] Handling useSkill for ${action.payload.unitId} from player ${action.payload.playerId}`);
            const skillUnit = gameEngine.units.find(u => u.id === action.payload.unitId);
            if (skillUnit && skillUnit.control.controllerPlayerId === action.payload.playerId) {
                gameEngine.useSkill(action.payload.unitId, action.payload.skillId, action.payload.targetId);
            } else {
                console.log(`[Game Server] Invalid useSkill request for unit ${action.payload.unitId} by player ${action.payload.playerId}`);
            }
            break;
        case 'startGame':
            console.log('[Game Server] Handling startGame');
            if (!gameEngine.isGameStarted) {
                gameEngine.startGame();
                await broadcastGameStart();
            }
            break;
        case 'ping':
            console.log(`[Game Server] Handling ping from ${action.payload.playerId}`);
            await broadcastPing(action.payload);
            break;
    }
}


export async function startWebSocketServer() {
    if (wss) {
        console.log('WebSocket server is already running.');
        return;
    }

    wss = new WebSocketServer({ port: WS_PORT });

    wss.on('listening', () => {
        console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);
    });

    wss.on('connection', (ws) => {
        console.log('Client connected to WebSocket server.');
        clients.add(ws);

        try {
            const initialState = {
                type: 'full-state',
                payload: {
                    units: gameEngine.units,
                    teams: gameEngine.teams,
                    gameTime: gameEngine.gameTime,
                    gameStarted: gameEngine.isGameStarted,
                }
            }
            ws.send(JSON.stringify(initialState));
        } catch (e) {
            console.error('Failed to send initial state:', e);
        }

        ws.on('message', (message) => {
            try {
                const action = JSON.parse(message.toString()) as ServerAction;
                handleClientAction(action, ws);
            } catch (error) {
                console.error("Failed to parse message from client:", error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected.');
            clients.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    wss.on('error', (error) => {
        console.error('WebSocket Server error:', error);
    });
}

export async function broadcastGameState() {
    if (!wss || clients.size === 0) return;

    // Units are serialized automatically by JSON.stringify via their properties
    const currentState = {
        type: 'update-state',
        payload: {
            units: gameEngine.units,
            teams: gameEngine.teams,
            gameTime: gameEngine.gameTime,
            gameStarted: gameEngine.isGameStarted,
        }
    };
    const message = JSON.stringify(currentState);

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
            } catch (e) {
                console.error('Failed to send message to client:', e);
            }
        }
    });
}

async function broadcastGameStart() {
    if (!wss || clients.size === 0) return;

    const message = JSON.stringify({ type: 'game-started' });
    console.log('Broadcasting game-started to all clients.');
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

async function broadcastPing(payload: PingPayload) {
    if (!wss || clients.size === 0) return;

    const message = JSON.stringify({ type: 'ping-broadcast', payload });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

export async function broadcastActionToServer(action: ServerAction) {
    const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

    ws.on('open', () => {
        console.log('[Server Action Client] Connected to WS, sending action.');
        ws.send(JSON.stringify(action));
        ws.close();
    });

    ws.on('error', (err) => {
        console.error('[Server Action Client] Failed to connect or send action to WS:', err);
    });
}
