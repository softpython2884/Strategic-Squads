
"use server";

import { implementAIUnitBehaviors, type AIUnitBehaviorsInput, type AIUnitBehaviorsOutput } from "@/ai/flows/implement-ai-unit-behaviors";
import { summarizeGameEvents, type SummarizeGameEventsInput, type SummarizeGameEventsOutput } from "@/ai/flows/summarize-game-events";
import { gameState } from "@/server/game-state";
import type { Unit, UnitComposition } from "@/lib/types";
import { broadcastGameState } from "@/server/game-loop";

export type SquadUnit = Pick<Unit, 'id' | 'name' | 'type'>;

export interface JoinGameInput {
  pseudo: string;
  teamId: 'blue' | 'red';
  squadType: UnitComposition;
  squad: SquadUnit[];
}

export async function joinGame(input: JoinGameInput): Promise<void> {
  try {
    gameState.addPlayerSquad(input);
    // After updating the state, broadcast it to all clients
    broadcastGameState();
  } catch (error) {
    console.error("Error in joinGame:", error);
    throw new Error("Failed to join the game on the server.");
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

export async function useSkill(playerId: string, unitId: string, skillId: string): Promise<boolean> {
  try {
    const unit = gameState.getUnits().find(u => u.id === unitId);
    if (!unit || unit.control.controllerPlayerId !== playerId) {
      // Basic authorization: ensure the player controls the unit
      throw new Error("Player does not control this unit.");
    }
    
    const FIVE_SECONDS_IN_TICKS = 5 * (1000 / 250); // 20 ticks
    const result = gameState.useSkill(unitId, skillId, FIVE_SECONDS_IN_TICKS);
    
    return result;

  } catch (error: any) {
    console.error("Error in useSkill:", error.message);
    // In a real app, you might not want to throw the raw error to the client
    throw new Error(`Failed to use skill: ${error.message}`);
  }
}

export async function moveUnit(playerId: string, unitId: string, position: { x: number, y: number }): Promise<Unit | null> {
    try {
        const unit = gameState.getUnits().find(u => u.id === unitId);
        if (!unit || unit.control.controllerPlayerId !== playerId) {
            throw new Error("Player does not control this unit.");
        }
        
        console.log(`Moving unit ${unitId} to ${position.x}, ${position.y} for player ${playerId}`);
        const updatedUnit = gameState.updateUnitPosition(unitId, position.x, position.y);
        
        // Broadcast the new state to all clients
        broadcastGameState();
        
        return updatedUnit || null;

    } catch (error: any) {
        console.error("Error in moveUnit:", error.message);
        throw new Error(`Failed to move unit: ${error.message}`);
    }
}
