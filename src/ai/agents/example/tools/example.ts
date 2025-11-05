import { tool } from "ai";
import { z } from "zod";



const exampleToolInputSchema = z.object({
});


const exampleToolOutputSchema = z.object({
  response: z.string(),
});


export const example = tool({
  name: 'example',
  description: `Example tool`,
  inputSchema: exampleToolInputSchema,
  outputSchema: exampleToolOutputSchema,
  execute: async ({}) => {
    return {
      response: 'Example tool executed!',
    };
  }
});