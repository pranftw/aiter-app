import { type UIMessage } from 'ai'
import { AIMessage } from '@/components/chat/message/ai'
import { UserMessage } from '@/components/chat/message/user'


export interface ChatMessagesProps {
  messages: UIMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <box flexDirection='column' gap={1}>
      {messages.map((message: UIMessage, index) => 
        message.role === 'user' ? (
          <UserMessage message={message} />
        ) : (
          <AIMessage message={message} />
        )
      )}
    </box>
  )
}