import 'dotenv/config';
import { render, useKeyboard } from '@opentui/react';
import { 
  ChatContainerWrapper, 
  ChatSchema, 
  initializeMCP, 
  cleanup, 
  initializeChat,
  createAgentResolver,
  type Agent
} from '@aiter/core';
import { z } from 'zod';
import { processedArgs } from './utils/yargs';
import * as customComponents from './components'



interface AppProps {
  args: typeof processedArgs;
  chat: z.infer<typeof ChatSchema> | null;
  agent: Agent;
}


function App({ args, chat, agent }: AppProps) {
  useKeyboard((key) => {
    if (key.name==='c' && key.ctrl) {
      cleanup();
      process.exit(0);
    }
  });
  if (chat) {
    return (
      <ChatContainerWrapper 
        chat={chat} 
        prompt={args.prompt} 
        agent={agent}
        customComponents={customComponents}
      />
    )
  }
  return null;
}


async function main(args: typeof processedArgs){
  const agent = await createAgentResolver().getAgent(args.agent);
  const chat = await initializeChat(args.chatId, args.agent, agent.dataSchema);
  await initializeMCP(agent.mcpConfig);
  try {
    await render(
      <App 
        args={args} 
        chat={chat} 
        agent={agent}
      />, 
      {exitOnCtrlC: false, enableMouseMovement: true}
    );
  } catch (error) {
    await cleanup();
    console.error('Error:', error);
    process.exit(1);
  }
}
await main(processedArgs);