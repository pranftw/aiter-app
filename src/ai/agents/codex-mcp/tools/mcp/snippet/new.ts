import { SnippetSchema } from '../../../schema';
import { tool, generateId } from 'ai';
import { z } from 'zod';
import { getChat, updateChat, ToolContextSchema } from '@aiter/core';


const newMCPSnippetToolInputSchema = z.object({
  description: z.string().describe('Description regarding what the code snippet does'),
  content: z.string().describe('Code content of the snippet'),
});


const newMCPSnippetToolOutputSchema = z.object({
  snippet: SnippetSchema,
  response: z.string(),
});


export const new_mcp_snippet = tool({
  name: 'new_mcp_snippet',
  description: 'Create code snippet',
  inputSchema: newMCPSnippetToolInputSchema,
  outputSchema: newMCPSnippetToolOutputSchema,
  execute: async ({description, content}, {experimental_context: context}) => {
    const {chatId} = context as z.infer<typeof ToolContextSchema>;
    const snippetId = generateId();
    const chat = getChat(chatId);
    const snippet = {
      id: snippetId,
      chatId: chatId,
      description: description,
      content: content,
    };
    chat.data.snippets[snippetId] = snippet;
    updateChat(chatId, chat);
    return {
      snippet: snippet,
      response: `Snippet created with id: ${snippetId}`,
    };
  },
  toModelOutput: (result) => {
    return {
      type: 'text',
      value: result.response
    }
  }
});

