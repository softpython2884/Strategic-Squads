
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


// This emitter is no longer needed for cross-process communication.
// It can be removed or kept for intra-process communication if needed later.
const actionEmitter = {
    listeners: [] as ((action: ServerAction) => void)[],
    subscribe(listener: (action: ServerAction) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },
    emit(action: ServerAction) {
        console.log(`[ActionEmitter] Emitting action: ${action.type}`);
        this.listeners.forEach(listener => listener(action));
    }
};


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

    // Send the initial full game state to the newly connected client
    try {
        const initialState = {
            type: 'full-state',
            payload: {
                units: gameState.getUnits(),
                teams: gameState.getTeams(),
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
        // Pass the WebSocket instance to the handler to allow direct responses
        handleServerAction(action, ws);
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

function handleServerAction(action: ServerAction, ws: WebSocket) {
    switch (action.type) {
        case 'joinGame':
            console.log(`[Game Server] Handling joinGame for ${action.payload.pseudo}`);
            if (gameState.isGameStarted()) {
                console.log(`[Game Server] Denying joinGame for ${action.payload.pseudo}, game already started.`);
                ws.send(JSON.stringify({ type: 'join-failed', reason: 'La partie a déjà commencé.' }));
            } else {
                gameState.addPlayerSquad(action.payload);
                ws.send(JSON.stringify({ type: 'join-success' }));
                // The state change will be broadcasted to all clients.
                broadcastGameState(); 
            }
            break;
        case 'moveUnit':
            console.log(`[Game Server] Handling moveUnit for ${action.payload.unitId}`);
            const unit = gameState.getUnits().find(u => u.id === action.payload.unitId);
            if (unit && unit.control.controllerPlayerId === action.payload.playerId) {
                gameState.updateUnitPosition(action.payload.unitId, action.payload.position.x, action.payload.position.y);
                // No need to broadcast here, the game loop does it
            }
            break;
        case 'useSkill':
            console.log(`[Game Server] Handling useSkill for ${action.payload.unitId}`);
            const skillUnit = gameState.getUnits().find(u => u.id === action.payload.unitId);
            if (skillUnit && skillUnit.control.controllerPlayerId === action.payload.playerId) {
                const FIVE_SECONDS_IN_TICKS = 5 * (1000 / 250);
                gameState.useSkill(action.payload.unitId, action.payload.skillId, FIVE_SECONDS_IN_TICKS);
                // The game loop will broadcast the state change
            }
            break;
        case 'startGame':
            console.log('[Game Server] Handling startGame');
            gameState.startGame();
            broadcastGameStart();
            break;
    }
}


export async function broadcastGameState() {
    if (!wss && clients.size === 0) return; 
    
    const currentState = {
        type: 'update-state',
        payload: {
            units: gameState.getUnits(),
            teams: gameState.getTeams(),
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
    if (!wss && clients.size === 0) return;

    const message = JSON.stringify({ type: 'game-started' });
    console.log('Broadcasting game-started to all clients.');
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}


/**
 * Broadcasts an action from the web server process to the game server process.
 * This is now DEPRECATED in favor of client->server WebSocket messages.
 */
export async function broadcastActionToServer(action: ServerAction) {
    // This function is now a no-op as the architecture has changed.
    // The client sends messages directly to the WebSocket server.
    console.warn(`broadcastActionToServer is deprecated. Action '${action.type}' should be sent from client via WebSocket.`);
}
