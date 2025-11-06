import { tool, type Tool } from "ai";
import { mcpManager } from "@aiter/core";
import { z } from "zod";


const getMCPToolDetailsInputSchema = z.object({
  toolName: z.string(),
});

const getMCPToolDetailsOutputSchema = z.object({
  description: z.string(),
  inputSchema: z.string(),
  outputSchema: z.string(),
});

export const get_mcp_tool_details = tool({
  name: 'get_mcp_tool_details',
  description: 'Get details of an MCP tool',
  inputSchema: getMCPToolDetailsInputSchema,
  outputSchema: getMCPToolDetailsOutputSchema,
  execute: async ({ toolName }) => {
    const tool: Tool = mcpManager.tools[toolName] as Tool;
    return {
      description: tool.description,
      inputSchema: JSON.stringify(tool.inputSchema),
      outputSchema: tool.outputSchema?JSON.stringify(tool.outputSchema):undefined,
    };
  }
});