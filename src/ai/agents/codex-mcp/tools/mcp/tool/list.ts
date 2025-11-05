import { tool } from "ai";
import { mcpManager } from "@aiter/core";
import { z } from "zod";


const listMCPToolsInputSchema = z.object({
});

const listMCPToolsOutputSchema = z.object({
  tools: z.array(z.string()),
});

export const list_mcp_tools = tool({
  name: 'list_mcp_tools',
  description: 'List all MCP tools',
  inputSchema: listMCPToolsInputSchema,
  outputSchema: listMCPToolsOutputSchema,
  execute: async ({}) => {
    return {
      tools: Object.keys(mcpManager.tools),
    };
  }
});