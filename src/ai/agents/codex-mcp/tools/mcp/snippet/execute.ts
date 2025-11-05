import { tool } from 'ai';
import { z } from 'zod';
import { ToolContextSchema } from '@aiter/core';
import { getSnippet, executeTypescriptSnippet } from '../../../utils/code';


const executeMCPSnippetToolInputSchema = z.object({
  id: z.string().describe('ID of the code snippet to execute'),
  args: z.string().optional().default('').describe('Command line arguments to pass while executing. For example, specify **--arg1 foo --arg2 bar** to pass arguments.'),
});


const executeMCPSnippetToolOutputSchema = z.object({
  response: z.string(),
});


export const execute_mcp_snippet = tool({
  name: 'execute_mcp_snippet',
  description: 'Execute code snippet',
  inputSchema: executeMCPSnippetToolInputSchema,
  outputSchema: executeMCPSnippetToolOutputSchema,
  execute: async ({id, args}, {experimental_context: context}) => {
    const {chatId} = context as z.infer<typeof ToolContextSchema>;
    const {result, status: getSnippetStatus, message: getSnippetMessage} = getSnippet(chatId, id);
    if (getSnippetStatus === 'error') {
      return {
        response: getSnippetMessage,
      };
    }
    const {snippet} = result;
    try {
      const executionResult = await executeTypescriptSnippet(snippet, args);
    return {
      response: executionResult,
    };
    } catch (error) {
      return {
        response: `Execution error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

