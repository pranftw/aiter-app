import { type UIMessage, type ToolUIPart, type DynamicToolUIPart } from 'ai'
import { StatusIndicator, SubagentToolCallStatusSchema, colors } from '@aiter/core'
import React from 'react'
import { z } from 'zod'



interface ToolCallDisplayProps {
  name: string
  status: 'in-progress' | 'output-available' | 'error' | 'input-streaming' | 'input-available' | 'output-error'
  input: unknown
  marginLeft?: number
  children?: React.ReactNode
}

function ToolCallDisplay({ name, status, input, marginLeft, children }: ToolCallDisplayProps) {
  return (
    <box flexDirection='column' gap={1}>
      <box flexDirection='row' gap={1} marginLeft={marginLeft} flexWrap='wrap'>
        <StatusIndicator name={name} status={status} />
        <text fg={colors.text.gray}><i>{JSON.stringify(input)}</i></text>
      </box>
      {status === 'output-available' && children}
    </box>
  )
}



export interface AIMessageProps {
  message: UIMessage
}

export function AIMessage({ message }: AIMessageProps) {
  return (
    <box flexDirection='column' gap={1}>
      {message.parts?.map((part, index) => {
        switch (part.type) {
          case 'text':
            return <text>{part.text}</text>
          default:
            if (part.type.startsWith('tool')) {
              const toolPart = part as ToolUIPart
              return (
                <ToolCallDisplay
                  name={part.type}
                  status={toolPart.state}
                  input={toolPart.input}
                >
                  {(() => {
                    switch (toolPart.type) {
                      default:
                        return null
                    }
                  })()}
                </ToolCallDisplay>
              )
            }
            else if (part.type.startsWith('dynamic-tool')) {
              const dynamicToolPart = part as DynamicToolUIPart
              return (
                <ToolCallDisplay
                  name={`tool-${dynamicToolPart.toolName}`}
                  status={dynamicToolPart.state}
                  input={dynamicToolPart.input}
                >
                  {(() => {
                    switch (dynamicToolPart.type) {
                      default:
                        return null
                    }
                  })()}
                </ToolCallDisplay>
              )
            }
            else if (part.type === 'data-subagent-tool-call') {
              const subagentToolCallPart = part.data as z.infer<typeof SubagentToolCallStatusSchema>
              return (
                <ToolCallDisplay
                  name={subagentToolCallPart.toolName}
                  status='output-available'
                  input={subagentToolCallPart.toolInput}
                  marginLeft={2}
                />
              )
            }
            return null
        }
      })}
    </box>
  )
}
