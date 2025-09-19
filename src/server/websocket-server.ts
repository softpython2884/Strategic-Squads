
'use server';

import { WebSocketServer, WebSocket } from 'ws';
import { gameState } from './game-state';

const WS_PORT = 8080;
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function startWebSocketServer() {
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
            payload: gameState.getUnits(),
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

export function broadcastGameState() {
    if (!wss) {
        console.warn("Attempted to broadcast, but WebSocket server is not running.");
        return;
    }

    const currentState = {
        type: 'update-state',
        payload: gameState.getUnits(),
    };
    const message = JSON.stringify(currentState);

    console.log(`Broadcasting game state to ${clients.size} clients.`);
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
