import { tool } from 'ai';
import { z } from 'zod';
import { ToolContextSchema, updateChat } from '@aiter/core';
import { getSnippet } from '../../../utils/code';


const deleteMCPSnippetToolInputSchema = z.object({
  id: z.string().describe('ID of the code snippet to delete'),
});


const deleteMCPSnippetToolOutputSchema = z.object({
  response: z.string(),
});


export const delete_mcp_snippet = tool({
  name: 'delete_mcp_snippet',
  description: 'Delete code snippet',
  inputSchema: deleteMCPSnippetToolInputSchema,
  outputSchema: deleteMCPSnippetToolOutputSchema,
  execute: async ({id}, {experimental_context: context}) => {
    const {chatId} = context as z.infer<typeof ToolContextSchema>;
    const {result, status: getSnippetStatus, message: getSnippetMessage} = getSnippet(chatId, id);
    if (getSnippetStatus === 'error') {
      return {
        response: getSnippetMessage,
      };
    }
    const {chat} = result;
    delete chat.data.snippets[id];
    updateChat(chatId, chat);
    return {
      response: 'Snippet deleted!',
    };
  }
});

