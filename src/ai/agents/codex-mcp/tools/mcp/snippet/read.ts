import { tool } from 'ai';
import { z } from 'zod';
import { SnippetSchema } from '../../../schema';
import { ToolContextSchema } from '@aiter/core';
import { getSnippet } from '../../../utils/code';
import { addLineNumbersToCode, cropCode } from '../../../utils/code';


const readMCPSnippetToolInputSchema = z.object({
  id: z.string().describe('ID of the code snippet to retrieve'),
  startLine: z.number().optional().default(0).describe('Start line of the code snippet to read'),
  numLines: z.number().optional().default(25).describe('Number of lines of the code snippet to read'),
  readFull: z.boolean().optional().default(false).describe('Set to true to read the full snippet. Use this only if you find that it is necessary to get the context of the full snippet.'),
});


const readMCPSnippetToolOutputSchema = z.object({
  snippet: SnippetSchema.nullable(),
  response: z.string()
});


export const read_mcp_snippet = tool({
  name: 'read_mcp_snippet',
  description: 'Read code snippet (includes line numbers)',
  inputSchema: readMCPSnippetToolInputSchema,
  outputSchema: readMCPSnippetToolOutputSchema,
  execute: async ({id, startLine, numLines, readFull}, {experimental_context: context}) => {
    const {chatId} = context as z.infer<typeof ToolContextSchema>;
    const {result, status: getSnippetStatus, message: getSnippetMessage} = getSnippet(chatId, id);
    if (getSnippetStatus === 'error') {
      return {
        snippet: null,
        response: getSnippetMessage,
      }
    }
    const snippet = result.snippet;
    if (!readFull) {
      snippet.content = cropCode(snippet.content, startLine, numLines);
    }
    snippet.content = addLineNumbersToCode(snippet.content, startLine);
    return {
      snippet: snippet,
      response: snippet.content.startsWith('ERROR:') ? snippet.content : getSnippetMessage,
    }
  }
});

