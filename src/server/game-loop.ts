/**
 * @fileOverview The main game loop for the server.
 * This file handles the game's tick rate and processes game state updates.
 */
'use server';

import { gameState } from '@/lib/data';

const TICK_RATE_MS = 250;
let gameLoopInterval: NodeJS.Timeout | null = null;
let tickCount = 0;

function gameTick() {
  tickCount++;
  console.log(`Game Tick #${tickCount} at ${new Date().toISOString()}`);

  // Future logic will go here:
  // - Process player inputs/intents
  // - Update unit positions and states
  // - Run AI behaviors
  // - Check for win/loss conditions
  // - Broadcast state changes to clients
}

/**
 * Starts the main game loop.
 */
export function startGameLoop() {
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
export function stopGameLoop() {
  if (gameLoopInterval) {
    console.log('Stopping game loop.');
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  } else {
    console.log('Game loop is not running.');
  }
}
