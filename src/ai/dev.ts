
import { config } from 'dotenv';
config();

import '@/ai/flows/implement-ai-unit-behaviors.ts';
import '@/ai/flows/summarize-game-events.ts';
import { startWebSocketServer } from '@/server/websocket-server';
import { startGameLoop } from '@/server/game-loop';

// Start the WebSocket server
startWebSocketServer();
// Start the main game loop
startGameLoop();
