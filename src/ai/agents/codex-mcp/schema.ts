import { z } from "zod";


export const SnippetSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  description: z.string(),
  content: z.string(),
});


export const DataSchema = z.object({
  snippets: z.record(z.string(), SnippetSchema),
}).default({
  snippets: {},
});