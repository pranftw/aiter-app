import { tool } from 'ai';
import { z } from 'zod';
import { ToolContextSchema, updateChat } from '@aiter/core';
import { getSnippet } from '../../../utils/code';
import { getErrorStatusResponseMessage } from '../../../utils/utils';


const editMCPSnippetToolInputSchema = z.object({
  id: z.string().describe('ID of the code snippet to edit'),
  description: z.string().optional().describe('Description of the code snippet to edit'),
  strToReplace: z.string().describe('The exact literal text to replace. CRITICAL: Must uniquely identify the single instance to change. Include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. If this string matches multiple locations or does not match exactly, the tool will fail.'),
  strToReplaceWith: z.string().describe('The exact literal text to replace strToReplace with. Ensure the resulting code is correct and idiomatic.'),
});


const editMCPSnippetToolOutputSchema = z.object({
  response: z.string(),
});


export const edit_mcp_snippet = tool({
  name: 'edit_mcp_snippet',
  description: 'Edit code snippet by replacing exact literal text. This tool requires providing significant context around the change to ensure precise targeting. Always examine the snippet\'s current content before attempting a text replacement.',
  inputSchema: editMCPSnippetToolInputSchema,
  outputSchema: editMCPSnippetToolOutputSchema,
  execute: async ({id, description, strToReplace, strToReplaceWith}, {experimental_context: context}) => {
    const {chatId} = context as z.infer<typeof ToolContextSchema>;
    const {result, status: getSnippetStatus, message: getSnippetMessage} = getSnippet(chatId, id);
    if (getSnippetStatus === 'error') {
      return {
        response: getSnippetMessage,
      };
    }
    const {chat, snippet} = result;
    const snippetContent = snippet.content;
    if (snippetContent.includes(strToReplace)) {
      chat.data.snippets[id].content = snippetContent.replace(strToReplace, strToReplaceWith);
    }
    else {
      return {
        response: getErrorStatusResponseMessage('Failed to edit, could not find the string to replace. The exact text in strToReplace was not found. Ensure you\'re not escaping content incorrectly and check whitespace, indentation, and context. Include at least 3 lines of context before and after the target text.'),
      };
    }
    if (description) {
      chat.data.snippets[id].description = description;
    }
    updateChat(chatId, chat);
    return {
      response: 'Snippet edited!',
    };
  }
});

