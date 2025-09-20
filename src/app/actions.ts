
"use server";

import { implementAIUnitBehaviors, type AIUnitBehaviorsInput, type AIUnitBehaviorsOutput } from "@/ai/flows/implement-ai-unit-behaviors";
import { summarizeGameEvents, type SummarizeGameEventsInput, type SummarizeGameEventsOutput } from "@/ai/flows/summarize-game-events";
import { gameState } from "@/server/game-state";
import type { Unit, UnitComposition } from "@/lib/types";
import { broadcastActionToServer, broadcastGameState } from "@/server/websocket-server";

export type SquadUnit = Pick<Unit, 'id' | 'name' | 'type'>;

export interface JoinGameInput {
  pseudo: string;
  teamId: 'blue' | 'red';
  squadType: UnitComposition;
  squad: SquadUnit[];
}


// This action is now handled directly by the WebSocket server.
// The client will send a 'joinGame' message over WebSocket.
export async function joinGame(input: JoinGameInput): Promise<void> {
  try {
    // Instead of modifying the state directly or using the emitter,
    // we now expect the client to handle this via WebSocket.
    // This server action can be deprecated or kept for other potential HTTP-based interactions.
    // For now, we'll log that it was called, but the real work is on the client/ws-server.
    console.log(`joinGame server action called for ${input.pseudo}, but this should be handled by WebSocket now.`);

  } catch (error) {
    console.error("Error in joinGame action:", error);
    throw new Error("Failed to process joinGame action.");
  }
}

export async function runAIUnitBehaviors(input: AIUnitBehaviorsInput): Promise<AIUnitBehaviorsOutput> {
  try {
    const result = await implementAIUnitBehaviors(input);
    return result;
  } catch (error) {
    console.error("Error in runAIUnitBehaviors:", error);
    throw new Error("Failed to get AI behavior from the server.");
  }
}

export async function runSummarizeGameEvents(input: SummarizeGameEventsInput): Promise<SummarizeGameEventsOutput> {
  try {
    const result = await summarizeGameEvents(input);
    return result;
  } catch (error) {
    console.error("Error in runSummarizeGameEvents:", error);
    throw new Error("Failed to get game summary from the server.");
  }
}

// This is now handled by WebSocket directly from the client in skill-bar.tsx
export async function useSkill(playerId: string, unitId: string, skillId: string): Promise<boolean> {
  try {
     // This function is becoming a passthrough to the WebSocket server,
     // but the client should ideally send the message directly.
     await broadcastActionToServer({
        type: 'useSkill',
        payload: { playerId, unitId, skillId },
     });
     return true; // Assume success, the server will broadcast the result
  } catch (error: any) {
    console.error("Error in useSkill action:", error.message);
    throw new Error(`Failed to send useSkill action: ${error.message}`);
  }
}


// Server actions to safely access game state from client components
export async function getGameEventsLog(): Promise<string> {
    return gameState.getGameEventsLog();
}

export async function getTeamResourceData(): Promise<any[]> {
    return gameState.getTeamResourceData();
}

export async function getUnitCompositionData(): Promise<any[]> {
    return gameState.getUnitCompositionData();
}
