import { tool } from 'ai';
import { z } from 'zod';
import { SnippetSchema } from '../../../schema';
import { ToolContextSchema, getChat } from '@aiter/core';


const MCPSnippetPreviewSchema = z.object({
  id: z.string(),
  description: z.string(),
});


const previewAllMCPSnippetsToolInputSchema = z.object({});


const previewAllMCPSnippetsToolOutputSchema = z.object({
  snippets: z.array(MCPSnippetPreviewSchema),
});


export const preview_all_mcp_snippets = tool({
  name: 'preview_all_mcp_snippets',
  description: 'Get preview of all snippets for the current chat. Use this when you need clarity on:\n- What snippets have been created during exploration\n- Which snippets are available to use\n- Overview of all snippet functionality before reading full content\n- Avoiding duplicate snippet creation',
  inputSchema: previewAllMCPSnippetsToolInputSchema,
  outputSchema: previewAllMCPSnippetsToolOutputSchema,
  execute: async ({}, {experimental_context: context}) => {
    const {chatId} = context as z.infer<typeof ToolContextSchema>;
    const chat = getChat(chatId);
    const snippets = (Object.values(chat.data.snippets) as z.infer<typeof SnippetSchema>[]).map(snippet => ({
      id: snippet.id,
      description: snippet.description,
    }));
    return {
      snippets: snippets,
    };
  }
});

