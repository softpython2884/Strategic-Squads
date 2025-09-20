
'use server';

import { WebSocketServer, WebSocket } from 'ws';
import { gameState } from './game-state';
import type { JoinGameInput } from '@/app/actions';

const WS_PORT = 8080;
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

type ServerAction = 
    | { type: 'joinGame', payload: JoinGameInput }
    | { type: 'moveUnit', payload: { playerId: string, unitId: string, position: { x: number, y: number } } }
    | { type: 'useSkill', payload: { playerId: string, unitId: string, skillId: string } }
    | { type: 'startGame' };


// This function now handles actions sent directly from clients via WebSocket
async function handleClientAction(action: ServerAction, ws: WebSocket) {
    switch (action.type) {
        case 'joinGame':
            console.log(`[Game Server] Handling joinGame for ${action.payload.pseudo}`);
            if (gameState.isGameStarted()) {
                console.log(`[Game Server] Denying joinGame for ${action.payload.pseudo}, game already started.`);
                ws.send(JSON.stringify({ type: 'join-failed', reason: 'La partie a déjà commencé.' }));
            } else {
                gameState.addPlayerSquad(action.payload);
                ws.send(JSON.stringify({ type: 'join-success' }));
                await broadcastGameState(); 
            }
            break;
        case 'moveUnit':
            console.log(`[Game Server] Handling moveUnit for ${action.payload.unitId}`);
            const unit = gameState.getUnits().find(u => u.id === action.payload.unitId);
            if (unit && unit.control.controllerPlayerId === action.payload.playerId) {
                gameState.updateUnitPosition(action.payload.unitId, action.payload.position.x, action.payload.position.y);
                // The game loop will broadcast the state, so we don't broadcast here to avoid extra messages
            }
            break;
        case 'useSkill':
            console.log(`[Game Server] Handling useSkill for ${action.payload.unitId}`);
            const skillUnit = gameState.getUnits().find(u => u.id === action.payload.unitId);
            const hero = gameState.getUnits().find(h => h.heroId === skillUnit?.heroId);
            const skill = hero?.skills.find(s => s.id.toString() === action.payload.skillId);

            if (skillUnit && skillUnit.control.controllerPlayerId === action.payload.playerId && skill) {
                gameState.useSkill(action.payload.unitId, action.payload.skillId, skill.cooldown);
                // The game loop will broadcast the state change
            }
            break;
        case 'startGame':
            console.log('[Game Server] Handling startGame');
            if (!gameState.isGameStarted()) {
                gameState.startGame();
                await broadcastGameStart();
            }
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
                units: gameState.getUnits(),
                teams: gameState.getTeams(),
                gameTime: gameState.getGameTime(),
                gameStarted: gameState.isGameStarted(),
            }
        }
        ws.send(JSON.stringify(initialState));
    } catch(e) {
        console.error('Failed to send initial state:', e);
    }

    ws.on('message', (message) => {
      try {
        const action = JSON.parse(message.toString()) as ServerAction;
        console.log(`[Game Server] Received action from client: ${action.type}`);
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
    
    const currentState = {
        type: 'update-state',
        payload: {
            units: gameState.getUnits(),
            teams: gameState.getTeams(),
            gameTime: gameState.getGameTime(),
            gameStarted: gameState.isGameStarted(),
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


/**
 * A helper function to be called from Server Actions to pass a message
 * to the game server. THIS IS NOW DEPRECATED.
 * Clients should send messages directly via their WebSocket connection.
 */
export async function broadcastActionToServer(action: ServerAction) {
    // This is a bit of a hack for the server action to communicate with the WS server.
    // The server action will now create its own WS client to send the message.
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
