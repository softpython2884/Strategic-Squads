'use server';
/**
 * @fileOverview Implements AI unit behaviors such as patrol, engage, and support.
 *
 * - implementAIUnitBehaviors - A function that handles the AI unit behavior process.
 * - AIUnitBehaviorsInput - The input type for the implementAIUnitBehaviors function.
 * - AIUnitBehaviorsOutput - The return type for the implementAIUnitBehaviors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIUnitBehaviorsInputSchema = z.object({
  unitType: z.string().describe('The type of the unit (e.g., melee, ranged, support).'),
  unitHealth: z.number().describe('The current health of the unit.'),
  unitPosition: z
    .object({
      x: z.number().describe('The x-coordinate of the unit.'),
      y: z.number().describe('The y-coordinate of the unit.'),
    })
    .describe('The current position of the unit.'),
  nearbyEnemies: z
    .array(
      z.object({
        type: z.string().describe('The type of the enemy unit.'),
        health: z.number().describe('The health of the enemy unit.'),
        position: z
          .object({
            x: z.number().describe('The x-coordinate of the enemy unit.'),
            y: z.number().describe('The y-coordinate of the enemy unit.'),
          })
          .describe('The position of the enemy unit.'),
        distance: z.number().describe('The distance to the enemy unit.'),
      })
    )
    .describe('An array of nearby enemy units and their details.'),
  nearbyAllies: z
    .array(
      z.object({
        type: z.string().describe('The type of the allied unit.'),
        health: z.number().describe('The health of the allied unit.'),
        position: z
          .object({
            x: z.number().describe('The x-coordinate of the allied unit.'),
            y: z.number().describe('The y-coordinate of the allied unit.'),
          })
          .describe('The position of the allied unit.'),
        distance: z.number().describe('The distance to the allied unit.'),
      })
    )
    .describe('An array of nearby allied units and their details.'),
  objective: z.string().describe('The current objective of the unit or team.'),
});
export type AIUnitBehaviorsInput = z.infer<typeof AIUnitBehaviorsInputSchema>;

const AIUnitBehaviorsOutputSchema = z.object({
  action: z.string().describe('The action the unit should take (e.g., patrol, engage, support).'),
  target: z.string().optional().describe('The target of the action, if applicable.'),
  reasoning: z.string().describe('The reasoning behind the chosen action.'),
});
export type AIUnitBehaviorsOutput = z.infer<typeof AIUnitBehaviorsOutputSchema>;

export async function implementAIUnitBehaviors(
  input: AIUnitBehaviorsInput
): Promise<AIUnitBehaviorsOutput> {
  return implementAIUnitBehaviorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'implementAIUnitBehaviorsPrompt',
  input: {schema: AIUnitBehaviorsInputSchema},
  output: {schema: AIUnitBehaviorsOutputSchema},
  prompt: `You are an expert in real-time strategy game AI.

Given the following information about a unit, determine the best course of action for it to take.

Unit Type: {{{unitType}}}
Unit Health: {{{unitHealth}}}
Unit Position: {{{unitPosition.x}}}, {{{unitPosition.y}}}
Nearby Enemies: {{#each nearbyEnemies}}- Type: {{{type}}}, Health: {{{health}}}, Distance: {{{distance}}}, Position: {{{position.x}}}, {{{position.y}}}
{{/each}}
Nearby Allies: {{#each nearbyAllies}}- Type: {{{type}}}, Health: {{{health}}}, Distance: {{{distance}}}, Position: {{{position.x}}}, {{{position.y}}}
{{/each}}
Objective: {{{objective}}}

Consider the unit's type, health, position, the presence of nearby enemies and allies, and the current objective.
Choose one of the following actions: patrol, engage, support.
If engaging, determine the most appropriate target from the nearby enemies. Provide a brief reasoning for your decision.

Format your response as a JSON object with the following keys:
- action: The action the unit should take (patrol, engage, support).
- target: The target of the action, if applicable.  This should be the *type* of the unit to target.
- reasoning: The reasoning behind the chosen action.
`,
});

const implementAIUnitBehaviorsFlow = ai.defineFlow(
  {
    name: 'implementAIUnitBehaviorsFlow',
    inputSchema: AIUnitBehaviorsInputSchema,
    outputSchema: AIUnitBehaviorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
