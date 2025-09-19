
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


// A simple message bus for communication between the web server process and the game server process.
// This is a workaround for the fact that we have two separate node processes in production.
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

  // Subscribe to actions emitted from the web server process
  actionEmitter.subscribe((action) => {
    console.log(`[Game Server] Received action: ${action.type}`);
    handleServerAction(action);
  });

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
            }
        }
        ws.send(JSON.stringify(initialState));
    } catch(e) {
        console.error('Failed to send initial state:', e);
    }


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

function handleServerAction(action: ServerAction) {
    switch (action.type) {
        case 'joinGame':
            console.log(`[Game Server] Handling joinGame for ${action.payload.pseudo}`);
            gameState.addPlayerSquad(action.payload);
            broadcastGameState();
            break;
        case 'moveUnit':
            console.log(`[Game Server] Handling moveUnit for ${action.payload.unitId}`);
            const unit = gameState.getUnits().find(u => u.id === action.payload.unitId);
            if (unit && unit.control.controllerPlayerId === action.payload.playerId) {
                gameState.updateUnitPosition(action.payload.unitId, action.payload.position.x, action.payload.position.y);
                broadcastGameState();
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
    }
}


export async function broadcastGameState() {
    if (!wss && clients.size === 0) return; 
    
    const currentState = {
        type: 'update-state',
        payload: {
            units: gameState.getUnits(),
            teams: gameState.getTeams(),
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

/**
 * Broadcasts an action from the web server process to the game server process.
 */
export async function broadcastActionToServer(action: ServerAction) {
    actionEmitter.emit(action);
}
