'use server';
/**
 * @fileOverview An AI agent that provides alternative salon recommendations when a booking is rejected.
 *
 * - recommendAlternativeSalons - A function that handles the alternative salon recommendation process.
 * - AiAlternativeSalonRecommendationsInput - The input type for the recommendAlternativeSalons function.
 * - AiAlternativeSalonRecommendationsOutput - The return type for the recommendAlternativeSalons function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAlternativeSalonRecommendationsInputSchema = z.object({
  rejectedSalonName: z.string().describe('The name of the salon that rejected the booking.'),
  rejectedSalonCity: z.string().describe('The city of the salon that rejected the booking.'),
  rejectedSalonState: z.string().describe('The state of the salon that rejected the booking.'),
  rejectedService: z.string().describe('The service that was requested at the rejected salon.'),
  availableSalons: z
    .array(
      z.object({
        name: z.string().describe('The name of the salon.'),
        city: z.string().describe('The city where the salon is located.'),
        state: z.string().describe('The state where the salon is located.'),
        services: z.array(z.string()).describe('A list of services offered by the salon.'),
        landmark: z.string().describe('A notable landmark near the salon for easy navigation.'),
      })
    )
    .describe('A list of available alternative salons with their details.'),
});
export type AiAlternativeSalonRecommendationsInput = z.infer<
  typeof AiAlternativeSalonRecommendationsInputSchema
>;

const AiAlternativeSalonRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('AI-generated recommendations for alternative nearby salons.'),
});
export type AiAlternativeSalonRecommendationsOutput = z.infer<
  typeof AiAlternativeSalonRecommendationsOutputSchema
>;

export async function recommendAlternativeSalons(
  input: AiAlternativeSalonRecommendationsInput
): Promise<AiAlternativeSalonRecommendationsOutput> {
  return aiAlternativeSalonRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAlternativeSalonRecommendationsPrompt',
  input: {schema: AiAlternativeSalonRecommendationsInputSchema},
  output: {schema: AiAlternativeSalonRecommendationsOutputSchema},
  prompt: `A user's booking at '{{{rejectedSalonName}}}' in {{{rejectedSalonCity}}}, {{{rejectedSalonState}}} for '{{{rejectedService}}}' was rejected.

Here is a list of other nearby salons:

{{#each availableSalons}}
- Name: {{{name}}}, City: {{{city}}}, State: {{{state}}}, Services: {{#each services}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}, Landmark: {{{landmark}}}
{{/each}}

Based on the information provided, suggest 2-3 alternative salons from the list that might offer similar services. For each recommendation, provide the salon's name, its city, and an indication of the services it offers that are similar to the rejected service. Also, include the landmark for easy navigation. Phrase the recommendations in a helpful and encouraging tone.`,
});

const aiAlternativeSalonRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiAlternativeSalonRecommendationsFlow',
    inputSchema: AiAlternativeSalonRecommendationsInputSchema,
    outputSchema: AiAlternativeSalonRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
