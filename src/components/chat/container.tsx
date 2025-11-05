import { CustomChatTransport, type Agent, ChatSchema, colors, useTriggerSystem, triggerUIRegistry, ErrorOverlay } from '@aiter/core';
import { useChat } from '@ai-sdk/react';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { ScrollBoxRenderable } from '@opentui/core';
import { ChatBox } from '@/components/chat/box';
import { ChatMessages } from '@/components/chat/messages';

const prepareChat = (
  prompt: string | null,
  hasSentPrompt: { current: boolean },
  sendMessage: (message: { text: string }) => void
) => {
  if (prompt && !hasSentPrompt.current) {
    hasSentPrompt.current = true;
    sendMessage({ text: prompt });
  }
};

export interface ChatContainerProps {
  chat: z.infer<typeof ChatSchema>;
  prompt: string | null;
  agent: Agent;
}

export function ChatContainer({ chat, prompt, agent }: ChatContainerProps) {
  const hasSentPrompt = useRef(false);
  const chatHook = useChat({
    id: chat.id,
    transport: new CustomChatTransport(agent.streamFunction, [chat.id, chat.agent]),
    messages: chat.messages
  });
  const { messages, sendMessage } = chatHook;
  
  let scroll: ScrollBoxRenderable;
  const toBottom = () => {
    setTimeout(() => {
      if (scroll) {
        scroll.scrollTo(scroll.scrollHeight);
      }
    }, 0);
  };

  // Use the trigger system hook
  const { message, setMessage, handleSubmit, activeTriggerUI } = useTriggerSystem({
    chatHook,
    agent: chat.agent,
    agentCommands: agent.commands,
    onSubmitCallback: toBottom,
  });
  
  useEffect(() => {
    prepareChat(prompt, hasSentPrompt, sendMessage);
    toBottom();
  }, []);
  
  return (
    <box position='relative' flexDirection='column' gap={1} paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1}>
      <ascii-font text="aiter" flexShrink={0}/>
      {/* Header */}
      <box flexDirection='row' gap={2} flexWrap='wrap' flexShrink={0}>
        <text fg={colors.text.gray}><strong>CHAT</strong> {chat.id}</text>
        <text fg={colors.text.gray}><strong>AGENT</strong> {chat.agent}</text>
      </box>
      
      {/* Messages area */}
      <scrollbox 
        ref={(r) => { if (r) scroll = r; }} 
        stickyScroll={true} 
        stickyStart='bottom'
        flexGrow={1}
      >
        <ChatMessages messages={messages} />
      </scrollbox>

      {/* Render active trigger UI or error overlay */}
      {activeTriggerUI && (
        <box position='absolute' bottom={4} left={2} right={2}>
          {activeTriggerUI.error ? (
            <ErrorOverlay message={activeTriggerUI.error} onClose={activeTriggerUI.onClose} />
          ) : (
            triggerUIRegistry[activeTriggerUI.trigger.pattern]?.(activeTriggerUI)
          )}
        </box>
      )}

      {/* Generic ChatBox */}
      <box flexShrink={0}>
        <ChatBox 
          message={message}
          setMessage={setMessage}
          onSubmit={handleSubmit}
        />
      </box>
    </box>
  );
}
