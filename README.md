# aiter

A powerful terminal-based AI chat interface built with OpenTUI and React, featuring a modular agent system with Model Context Protocol (MCP) integration.

Built on top of the **[Vercel AI SDK](https://github.com/vercel/ai)** and **[OpenTUI](https://github.com/sst/opentui)**, combining provider-agnostic AI tooling with a modern terminal UI framework.

## Why aiter?

While tools like Claude Code and other CLI AI agents offer powerful AI assistance, aiter gives you something different: **complete control over how you interact with AI**.

### Built on Three Principles

**Controllability**: Own the entire agentic loop — decide iteration limits, control tool execution flow, and customize streaming behavior. Build AI workflows that match your mental model, not a vendor's.

**Extensibility**: Run any model via Vercel AI SDK. Configure MCP servers easily. Define custom tools and commands. Create specialized agents for different tasks. No black boxes, no proprietary abstractions.

**Customizability**: Terminal-first means scriptable, pipeable, and CI/CD-ready. Modify the UI with React. Inspect and edit conversation JSON directly. Full local control with no telemetry.

**For developers who want to build with AI, not just use it.** Perfect for experimentation, MCP testing, custom workflows, and understanding how AI interactions actually work.

## Features

### Core Capabilities
- **Terminal User Interface (TUI)**: Beautiful, interactive chat interface powered by OpenTUI
- **Multi-Agent System**: Create and switch between custom AI agents with different configurations
- **Persistent Chat Sessions**: All conversations are saved as JSON files for easy resumption
- **MCP Integration**: Connect to external tools and services via Model Context Protocol
  - Supports stdio, SSE, and HTTP transport types
  - Dynamic tool loading from MCP servers
  - Easy configuration per agent

### Extensibility
- **File-System Based Agent Organization**: Next.js-like convention-based structure — agents organized by directory with standardized folders (commands/, tools/, mcps/, system-prompts/)
- **Custom Slash Commands**: Define agent-specific or global slash commands with yargs-style argument parsing
- **Custom AI Tools**: Add local tools that the AI can use during conversations
- **Flexible System Prompts**: Customize AI behavior with markdown-based system prompts
- **Custom Data Schema**: Define typed data structures for agent-specific state management
- **Stdin Support**: Pipe prompts directly from shell commands or scripts

## Installation
```bash
git clone https://github.com/pranftw/aiter.git
cd aiter
mkdir chats
bun install
cp .env.template .env # add the envvars
```

## Example Usage

### Basic Usage
```bash
# Start a new chat with the default agent
bun run src/index.tsx
# Start with a specific agent
bun run src/index.tsx --agent example
# Resume an existing chat session
bun run src/index.tsx --chat chats/abc123.json
# Start with an initial prompt
bun run src/index.tsx --prompt "Hello, how are you?"
# Pipe prompt from stdin
echo "Explain TypeScript generics" | bun run src/index.tsx -
# Combine options
bun run src/index.tsx -a example -p "Let's discuss React patterns"
```

## Customization

### Creating a Custom Agent
```bash
# Copy the template to create a new agent
cp -r src/ai/agents/template src/ai/agents/<AGENT_NAME>
```

Each agent directory contains:
```
src/ai/agents/<AGENT_NAME>/
├── commands/           # Custom slash commands
│   └── index.ts       # Export all commands
├── mcps/              # MCP server configurations
│   └── main.json      # MCP servers for this agent
├── system-prompts/    # System prompts
│   └── main.md        # Main system prompt
├── tools/             # Custom AI tools
│   └── index.ts       # Export all tools
├── schema.ts          # Data schema for agent state
└── stream-function.ts # Custom stream processing logic
```

### Adding Custom Tools
Create tools in `src/ai/agents/<AGENT_NAME>/tools/` using the AI SDK's `tool()` function. Refer to `src/ai/agents/template` for the basic structure and `src/ai/agents/example` for implementation examples.

### Adding Custom Slash Commands
Create commands in `src/ai/agents/<AGENT_NAME>/commands/` implementing the `SlashCommand` interface with yargs-style options. Refer to `src/ai/agents/template` for the basic structure and `src/ai/agents/example` for implementation examples.

### Configuring MCP Servers
```bash
cp src/ai/agents/<AGENT_NAME>/mcps/templates/main.json.template src/ai/agents/<AGENT_NAME>/mcps/main.json
```
Edit `src/ai/agents/<AGENT_NAME>/mcps/main.json`:
```json
{
  "mcpServers": {
    "server0": {
      "type": "stdio",
      "command": "npx",
      "args": ["path/to/server.js"],
      "env": {}
    },
    "server1": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer token"
      }
    },
    "server2": {
      "type": "sse",
      "url": "https://api.example.com/stream",
      "headers": {}
    }
  }
}
```

### Customizing System Prompts
Edit `src/ai/agents/<AGENT_NAME>/system-prompts/main.md` to define the AI's behavior and personality.

### Custom Data Schema
Edit `src/ai/agents/<AGENT_NAME>/schema.ts` to define typed data structures for agent-specific state using Zod schemas.

## Options

### Command-line Arguments

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--agent` | `-a` | string | `example` | Specify which agent to use (must exist in `src/ai/agents/`) |
| `--chat` | `-c` | string | `null` | Path to an existing chat session file to resume |
| `--prompt` | `-p` | string | `null` | Initial prompt to send when starting the chat |
| `--help` | `-h` | - | - | Display help information |

### Special Input
- **Stdin**: Use `-` as a positional argument to read the prompt from stdin
  ```bash
  echo "My question" | bun run src/index.tsx -
  ```
  Note: Cannot be combined with `--prompt`

### Usage Examples
```bash
# Start with specific agent
bun run src/index.tsx --agent my-custom-agent
# Resume a chat
bun run src/index.tsx --chat ./chats/xyz789.json
# Quick one-off question
bun run src/index.tsx -p "What is TypeScript?"
# Pipe from command output
cat question.txt | bun run src/index.tsx -
# Combine agent and prompt
bun run src/index.tsx -a example -p "Hello"
# Get help
bun run src/index.tsx --help
```

## Architecture

### Key Components
- **Chat Container**: Main UI component managing the chat interface
- **Trigger System**: Extensible input processing (commands, context, etc.)
- **MCP Manager**: Singleton managing Model Context Protocol clients and tools
- **Command Registry**: Dynamic loading of builtin and agent-specific commands
- **Custom Transport**: Bridge between UI and AI streaming

### Agent System
Each agent is isolated with its own:
- Tool set (MCP tools + local tools)
- Command registry (builtin + agent-specific)
- System prompts and configuration
- Message rendering logic
- State schema

### File Structure
```
src/
├── ai/
│   ├── agents/          # Agent definitions
│   ├── custom-chat-transport.ts
│   └── tools/           # Global tools (currently empty)
├── components/
│   ├── chat/           # Chat UI components
│   └── triggers/       # Trigger UI components
├── hooks/              # Custom React hooks
├── lib/                # Shared schemas and utilities
├── triggers/           # Trigger system
│   ├── commands/       # Command trigger implementation
│   └── core/           # Core trigger framework
└── utils/              # Utility functions
    ├── ai.ts           # AI/MCP utilities
    ├── chat.ts         # Chat management
    ├── mcp-manager.ts  # MCP client manager
    └── yargs.ts        # CLI argument parsing
```

## Contributing

Feel free to submit issues and enhancement requests!