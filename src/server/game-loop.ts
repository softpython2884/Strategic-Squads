

/**
 * @fileOverview The main game loop for the server.
 * This file handles the game's tick rate and processes game state updates.
 */
'use server';

import { gameEngine } from '@/server/instance';
import { broadcastGameState } from './websocket-server';

const TICK_RATE_MS = 250; // Update 4 times per second
let gameLoopInterval: NodeJS.Timeout | null = null;
let tickCount = 0;

async function gameTick() {
  tickCount++;

  if (tickCount % 4 === 0) { // Once per second
    gameEngine.processGameTick();
  }

  gameEngine.processCooldowns();
  gameEngine.processUnitActions();

  // Broadcast the latest state to all clients
  await broadcastGameState();
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
  gameEngine.reset();
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
