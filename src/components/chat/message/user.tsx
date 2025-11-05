import { type UIMessage } from 'ai'
import { colors } from '@aiter/core'

export interface UserMessageProps {
  message: UIMessage
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <box
      backgroundColor={colors.background.primary}
      padding={1}
      paddingLeft={2}
      paddingRight={2}
    >
      {message.parts?.map((part, index) => {
        switch (part.type) {
          case 'text':
            return (
              <text fg={colors.text.gray}>{part.text}</text>
            )
          default:
            return null
        }
      })}
    </box>
  )
}