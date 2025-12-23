
import { config } from 'dotenv';
config();

import '@/ai/flows/implement-ai-unit-behaviors.ts';
import '@/ai/flows/summarize-game-events.ts';
import { startWebSocketServer } from '@/server/websocket-server';
import { startGameLoop } from '@/server/game-loop';

// Start the WebSocket server and game loop
(async () => {
    console.log('🚀 Starting Strategic Squads Server...');
    await startWebSocketServer();
    await startGameLoop();
    console.log('✅ Server ready!');
})();
