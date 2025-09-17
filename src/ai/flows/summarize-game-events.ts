'use server';

/**
 * @fileOverview Summarizes key game events and unusual patterns for game masters.
 *
 * - summarizeGameEvents - A function that summarizes game events.
 * - SummarizeGameEventsInput - The input type for the summarizeGameEvents function.
 * - SummarizeGameEventsOutput - The return type for the summarizeGameEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeGameEventsInputSchema = z.object({
  gameEventsLog: z
    .string()
    .describe('A log of game events, including actions, player stats, and system messages.'),
});
export type SummarizeGameEventsInput = z.infer<typeof SummarizeGameEventsInputSchema>;

const SummarizeGameEventsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of key game events and unusual patterns.'),
});
export type SummarizeGameEventsOutput = z.infer<typeof SummarizeGameEventsOutputSchema>;

export async function summarizeGameEvents(
  input: SummarizeGameEventsInput
): Promise<SummarizeGameEventsOutput> {
  return summarizeGameEventsFlow(input);
}

const summarizeGameEventsPrompt = ai.definePrompt({
  name: 'summarizeGameEventsPrompt',
  input: {schema: SummarizeGameEventsInputSchema},
  output: {schema: SummarizeGameEventsOutputSchema},
  prompt: `You are a game event summarizer, tasked with creating concise summaries of game events and unusual patterns.

  Analyze the following game event log and provide a summary that highlights the critical moments and any unusual patterns.

  Game Event Log:
  {{gameEventsLog}}
  `,
});

const summarizeGameEventsFlow = ai.defineFlow(
  {
    name: 'summarizeGameEventsFlow',
    inputSchema: SummarizeGameEventsInputSchema,
    outputSchema: SummarizeGameEventsOutputSchema,
  },
  async input => {
    const {output} = await summarizeGameEventsPrompt(input);
    return output!;
  }
);
