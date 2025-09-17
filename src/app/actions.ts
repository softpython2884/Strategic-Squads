"use server";

import { implementAIUnitBehaviors, type AIUnitBehaviorsInput, type AIUnitBehaviorsOutput } from "@/ai/flows/implement-ai-unit-behaviors";
import { summarizeGameEvents, type SummarizeGameEventsInput, type SummarizeGameEventsOutput } from "@/ai/flows/summarize-game-events";

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
