import { convertToModelMessages, streamText, createUIMessageStream, generateId, stepCountIs } from 'ai';
import type { StreamFunctionOptionsType } from '@aiter/core';
import {openrouter} from '@openrouter/ai-sdk-provider';
import { mcpManager, ToolContextSchema, getPrompt, updateChatMessages } from '@aiter/core';
import { z } from 'zod';
import * as localTools from './tools';



export default async function streamFunction(chatId: string, agent: string, options: StreamFunctionOptionsType) {
  const mcpTools = mcpManager.tools; // Access MCP tools directly (initialization handled at app level)
  const tools = {
    ...mcpTools, 
    ...localTools
  };
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: openrouter(process.env.MAIN_AGENT_MODEL!),
        system: getPrompt(`src/ai/agents/${agent}/system-prompts/main.md`),
        tools: tools,
        messages: convertToModelMessages(options.messages, {tools: tools, ignoreIncompleteToolCalls: true}),
        stopWhen: [stepCountIs(10)],
        experimental_context: {
          chatId: chatId,
          writer: writer,
          agent: agent,
          messages: options.messages,
        } satisfies z.infer<typeof ToolContextSchema>
      });
      writer.merge(result.toUIMessageStream({
        originalMessages: options.messages,
        generateMessageId: generateId,
        onFinish: async ({messages}) => {
          updateChatMessages(chatId, messages)
          const finishReason = await result.finishReason;
          if (finishReason==='tool-calls'){
            await mcpManager.cleanup();
            process.exit(0);
          }
        }
      }));
    }
  })
  return stream;
}