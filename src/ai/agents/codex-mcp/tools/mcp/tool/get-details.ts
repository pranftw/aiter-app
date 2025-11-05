import { tool } from "ai";
import { mcpManager } from "@aiter/core";
import { z } from "zod";


const getMCPToolDetailsInputSchema = z.object({
  toolName: z.string(),
});

const getMCPToolDetailsOutputSchema = z.object({
  description: z.string(),
  inputSchema: z.string()
});

export const get_mcp_tool_details = tool({
  name: 'get_mcp_tool_details',
  description: 'Get details of an MCP tool',
  inputSchema: getMCPToolDetailsInputSchema,
  outputSchema: getMCPToolDetailsOutputSchema,
  execute: async ({ toolName }) => {
    return {
      description: mcpManager.tools[toolName].description,
      inputSchema: mcpManager.tools[toolName].inputSchema,
    };
  }
});