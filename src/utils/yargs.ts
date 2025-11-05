import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import { createAgentResolver } from '@aiter/core';
import path from 'path';

const agentResolver = createAgentResolver({
  basePath: path.join(process.cwd(), 'src/ai/agents')
});

const getAgents = () => agentResolver.getAgents();



const readStdin = (): string | null => {
  try {
    // Check if stdin is being piped (not a TTY)
    if (!process.stdin.isTTY) {
      return fs.readFileSync(0, 'utf8');
    }
  } catch (error) {
    console.error('Error reading from stdin:', error);
  }
  return null;
};


export const argv = yargs(hideBin(process.argv))
  .option('agent', {
    alias: 'a',
    type: 'string',
    choices: getAgents(),
    description: 'Agent name',
    demandOption: true,
    required: true
  })
  .option('chat', {
    alias: 'c',
    type: 'string',
    description: 'Chat session',
    default: null
  })
  .option('prompt', {
    alias: 'p',
    type: 'string',
    description: 'Prompt string',
    default: null
  })
  .help('h')
  .alias('h', 'help')
  .parseSync();


type ExtendedArguments = typeof argv & {
  chatId: string | null;
};


const processArgs = (args: typeof argv): ExtendedArguments => {
  // Check if '-' is in any positional argument
  const hasDashArg = args._.some(arg => arg?.toString() === '-');
  const hasPromptOption = args.prompt !== null;
  // Validate that both prompt and '-' are not specified together
  if (hasDashArg && hasPromptOption) {
    console.error('Error: Cannot specify both --prompt and - at the same time');
    process.exit(1);
  }
  if (hasDashArg) {
    args.prompt = readStdin();
  }
  
  const extendedArgs = {...args};
  if (args.chat) {
    const fname = args.chat.split('/').pop();
    if (fname?.endsWith('.json')) {
      extendedArgs.chatId = fname.replace('.json', '');
    }
    else {
      extendedArgs.chatId = null;
    }
  }

  return extendedArgs as ExtendedArguments;
};


export const processedArgs = processArgs(argv);