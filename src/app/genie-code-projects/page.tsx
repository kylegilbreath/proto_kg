// ─── Genie Code Projects ──────────────────────────────────────────────────────
// Full-screen Genie Code experience: threads panel (left) + chat area (right),
// inside the app shell. Reached from the "Genie Code" left-nav item.

"use client"

import * as React from "react"
import { AppShell, GenieThreadsPanel } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import { SuggestionPill } from "@/components/ui/suggestion-pill"
import { GeniePrompt, type GenieTag } from "@/components/ai-elements/genie-prompt"
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageToolbar,
} from "@/components/ai-elements/message"
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import {
  GenieCodeIcon,
  SidebarCollapseIcon,
  FolderIcon,
  SchemaIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@/components/icons"
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon } from "lucide-react"

// ─── Chat state ───────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
}

const SUGGESTIONS = [
  "What can Genie Code do?",
  "Find some data",
  "Analyze some data",
  "Schedule a task",
]

const MOCK_RESPONSE = {
  thinking: "Reviewing the request and checking available data and skills…",
  answer:
    "I can help with that. I'll break this into steps, run the code, and share the results along with any assets I create. Want me to start now?",
}

let msgCounter = 0
const uid = () => `msg-${++msgCounter}`

export default function GenieCodeProjects() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [tags, setTags] = React.useState<GenieTag[]>([])
  const [isThinking, setIsThinking] = React.useState(false)
  const [activeThreadId, setActiveThreadId] = React.useState<string>()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isThinking])

  const handleSubmit = (value: string) => {
    const text = value.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: uid(), role: "user", content: text }])
    setInput("")
    setTags([])
    setIsThinking(true)
    setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: MOCK_RESPONSE.answer, thinking: MOCK_RESPONSE.thinking },
      ])
    }, 1600)
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
    setTags([])
    setIsThinking(false)
    setActiveThreadId(undefined)
  }

  const isEmpty = messages.length === 0 && !isThinking

  return (
    <AppShell
      activeItem="genie-code"
      workspace="E2 Dogfood"
      userInitial="K"
      mainClassName="!m-0 flex overflow-hidden rounded-none border-0 bg-secondary"
    >
      {/* Threads panel */}
      <GenieThreadsPanel
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewChat={handleNewChat}
      />

      {/* Chat area — white card */}
      <div className="relative m-2 flex flex-1 overflow-hidden rounded-md border border-border bg-background">
        {/* Conversation column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto">
            {isEmpty ? (
              /* Empty state — centered */
              <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-6 px-6">
                <DbIcon icon={GenieCodeIcon} color="ai" size={48} />
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-xl font-semibold leading-7 text-foreground">Genie Code</h1>
                  <p className="text-sm leading-5 text-muted-foreground">Run multi-step data and AI tasks</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((label) => (
                    <SuggestionPill key={label} onClick={() => handleSubmit(label)}>
                      {label}
                    </SuggestionPill>
                  ))}
                </div>
                <ChatComposer
                  input={input}
                  setInput={setInput}
                  tags={tags}
                  setTags={setTags}
                  onSubmit={handleSubmit}
                />
              </div>
            ) : (
              /* Conversation */
              <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-6 py-6">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <Message key={msg.id} from="user">
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ) : (
                    <Message key={msg.id} from="assistant">
                      {msg.thinking && (
                        <ChainOfThought>
                          <ChainOfThoughtHeader isStreaming={false}>Thought for a moment</ChainOfThoughtHeader>
                          <ChainOfThoughtContent>
                            <ChainOfThoughtStep label={msg.thinking} />
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      <MessageContent className="pl-3">{msg.content}</MessageContent>
                      <MessageToolbar className="pl-3">
                        <MessageActions>
                          <MessageAction tooltip="Copy"><CopyIcon className="h-4 w-4" /></MessageAction>
                          <MessageAction tooltip="Helpful"><ThumbsUpIcon className="h-4 w-4" /></MessageAction>
                          <MessageAction tooltip="Not helpful"><ThumbsDownIcon className="h-4 w-4" /></MessageAction>
                        </MessageActions>
                      </MessageToolbar>
                    </Message>
                  ),
                )}
                {isThinking && (
                  <Message from="assistant">
                    <ChainOfThought>
                      <ChainOfThoughtHeader isStreaming={true}>Thinking</ChainOfThoughtHeader>
                    </ChainOfThought>
                  </Message>
                )}
              </div>
            )}
          </div>

          {/* Docked composer during a conversation */}
          {!isEmpty && (
            <div className="shrink-0 border-t border-border">
              <div className="mx-auto w-full max-w-[720px] px-6 py-4">
                <ChatComposer
                  input={input}
                  setInput={setInput}
                  tags={tags}
                  setTags={setTags}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          )}
        </div>

        {/* Far-right utility rail */}
        <div className="flex w-11 shrink-0 flex-col items-center gap-1 border-l border-border py-2">
          <Button variant="ghost" size="icon-xs" aria-label="Collapse rail">
            <SidebarCollapseIcon size={16} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Files">
            <FolderIcon size={16} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Schema">
            <SchemaIcon size={16} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Add">
            <PlusIcon size={16} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

// ─── Composer (input + folder selector + disclaimer) ────────────────────────────

function ChatComposer({
  input,
  setInput,
  tags,
  setTags,
  onSubmit,
}: {
  input: string
  setInput: (v: string) => void
  tags: GenieTag[]
  setTags: React.Dispatch<React.SetStateAction<GenieTag[]>>
  onSubmit: (v: string) => void
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <GeniePrompt
        variant="chat"
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        tags={tags}
        onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
        placeholder="@ for objects, / for commands, ↑↓ for history"
      />
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground">
          <FolderIcon size={16} />
          Home
          <ChevronDownIcon size={16} />
        </Button>
        <span className="text-hint text-muted-foreground">Only use the agent with code and data you trust</span>
      </div>
    </div>
  )
}
