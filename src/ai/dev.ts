import { config } from 'dotenv';
config();

import '@/ai/flows/implement-ai-unit-behaviors.ts';
import '@/ai/flows/summarize-game-events.ts';
import { startWebSocketServer } from '@/server/websocket-server';

// Start the WebSocket server
startWebSocketServer();
