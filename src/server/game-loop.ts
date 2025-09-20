

/**
 * @fileOverview The main game loop for the server.
 * This file handles the game's tick rate and processes game state updates.
 */
'use server';

import { gameState } from '@/server/game-state';
import { broadcastGameState } from './websocket-server';

const TICK_RATE_MS = 250; // Update 4 times per second for smoother movement
let gameLoopInterval: NodeJS.Timeout | null = null;
let tickCount = 0;

async function gameTick() {
  tickCount++;
  // console.log(`Game Tick #${tickCount} at ${new Date().toISOString()}`);

  if (tickCount % 4 === 0) { // Only process time-based logic once per second
      // Process game time and associated logic (damage multipliers, etc.)
      gameState.processGameTick();
  }
  
  // Process cooldowns every tick for more responsive UI feedback
  gameState.processCooldowns();
  
  // Process unit actions like movement and targeting every tick
  gameState.processUnitActions();

  // Broadcast the latest state to all clients
  await broadcastGameState();

  // Future logic will go here:
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
  // This is the critical change: reset is called here, ONCE, when the loop starts.
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

