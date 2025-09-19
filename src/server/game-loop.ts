
/**
 * @fileOverview The main game loop for the server.
 * This file handles the game's tick rate and processes game state updates.
 */
'use server';

import { gameState } from '@/server/game-state';
import { clients } from './websocket-server';
import { WebSocket } from 'ws';

const TICK_RATE_MS = 250;
let gameLoopInterval: NodeJS.Timeout | null = null;
let tickCount = 0;

export async function broadcastGameState() {
    const currentState = {
        type: 'update-state',
        payload: gameState.getUnits(),
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


async function gameTick() {
  tickCount++;
  // console.log(`Game Tick #${tickCount} at ${new Date().toISOString()}`);

  // Process cooldowns for all units
  gameState.processCooldowns();
  
  // Broadcast the latest state to all clients
  await broadcastGameState();

  // Future logic will go here:
  // - Process player inputs/intents
  // - Update unit positions and states
  // - Run AI behaviors
  // - Check for win/loss conditions
}

/**
 * Starts the main game loop.
 */
export async function startGameLoop() {
  if (gameLoopInterval) {
    console.log('Game loop is already running.');
    return;
  }
  console.log(`Starting game loop with a tick rate of ${TICK_RATE_MS}ms.`);
  // Reset game state for a new game
  gameState.reset();
  tickCount = 0;
  gameLoopInterval = setInterval(gameTick, TICK_RATE_MS);
}

/**
 * Stops the main game loop.
 */
export async function stopGameLoop() {
  if (gameLoopInterval) {
    console.log('Stopping game loop.');
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  } else {
    console.log('Game loop is not running.');
  }
}
