import { getChat, mcpManager } from '@aiter/core';
import { getErrorStatusResponseMessage, StatusResponse } from './utils';
import { SnippetSchema } from '../schema';
import { z } from 'zod';
import { generateText, Output, type ModelMessage, type ToolSet, type StopCondition, type Tool, stepCountIs } from 'ai';
import {openrouter} from '@openrouter/ai-sdk-provider';


export function getSnippet(chatId: string, snippetId: string){
  const chat = getChat(chatId);
  if (!chat.data.snippets[snippetId]) {
    return StatusResponse(null, 'error', 'Snippet not found!');
  }
  return StatusResponse({
    chat: chat, 
    snippet: chat.data.snippets[snippetId]
  }, 
  'success', 'Snippet found!');
}


const callMCPTool = async (toolName: string, params: any) => {
  const tool = mcpManager.tools[toolName];
  if (!tool) {
    return getErrorStatusResponseMessage(`Tool '${toolName}' not found.`);
  }
  return await tool.execute(params);
};


const callLLM = async (system: string, messages: ModelMessage[], tools?: ToolSet, stopWhen?: StopCondition<any>[], outputSchema?: z.ZodSchema)=>{
  const result = await generateText({
    model: openrouter(process.env.CODE_LLM_MODEL!),
    system: system,
    messages: messages,
    tools: tools,
    stopWhen: stopWhen?stopWhen:[stepCountIs(20)],
    experimental_output: outputSchema?Output.object({schema: outputSchema}):undefined,
  })
  return result;
}


export async function executeTypescriptSnippet(
  snippet: z.infer<typeof SnippetSchema>, 
  args: string
): Promise<string> {
  const mockProcess = {
    argv: ['bun', 'snippet', ...args.split(' ').filter(Boolean)]
  };
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  const fn = new AsyncFunction('callMCPTool', 'callLLM', 'process', snippet.content);
  
  try {
    const result = await fn(callMCPTool, callLLM, mockProcess);
    if (result !== undefined) {
      return typeof result === 'string' ? result : JSON.stringify(result);
    }
    return '';
  } catch (error) {
    return getErrorStatusResponseMessage(error instanceof Error ? error.message : String(error));
  }
}


export function cropCode(code: string, startLine: number=0, numLines: number=25){
  const splitCode = code.split('\n');
  if (startLine > splitCode.length){
    return getErrorStatusResponseMessage(`Start line is greater than the number of lines in the code!`);
  }
  if (startLine + numLines > splitCode.length){
    numLines = splitCode.length - startLine;
  }
  const croppedCode = splitCode.slice(startLine, startLine + numLines);
  return croppedCode.join('\n');
}


export function addLineNumbersToCode(code: string, startLine: number=0){
  const splitCode = code.split('\n');
  if (splitCode.length === 0 && code.startsWith('ERROR:')){
    return code;
  }
  return splitCode.map((line, index) => `${startLine + index}: ${line}`).join('\n');
}