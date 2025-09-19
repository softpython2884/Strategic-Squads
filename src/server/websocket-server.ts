
'use server';

import { WebSocketServer, WebSocket } from 'ws';
import { gameState } from './game-state';
import { broadcastGameState } from './game-loop';

const WS_PORT = 8080;
let wss: WebSocketServer | null = null;
export const clients = new Set<WebSocket>();

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
