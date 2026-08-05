"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronsLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import { SuggestionPill } from "@/components/ui/suggestion-pill"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  GenieCodeIcon,
  PlusIcon,
  OverflowIcon,
  CloseIcon,
  FolderIcon,
} from "@/components/icons"
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
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon } from "lucide-react"

interface GenieCodePanelProps {
  open: boolean
  onClose: () => void
  className?: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
}

type PanelProject = { id: string; name: string }

const PANEL_PROJECTS: PanelProject[] = [
  { id: "p1", name: "Lakeflow Designer Adoption" },
  { id: "p2", name: "Customer Support Agent Reboot" },
  { id: "p4", name: "Q3 Reviews Analytics" },
]

const SUGGESTION_CHIPS = [
  "Create automation",
  "What automation is best for my data?",
  "View latest automation",
]

const MOCK_RESPONSES: Record<string, { thinking: string; answer: string }> = {
  default: {
    thinking: "Analyzing the request and checking available data pipelines...",
    answer:
      "I can help with that. Based on your current workspace, you have 3 active pipelines and 2 scheduled workflows. Would you like me to walk you through the options or create a new automation?",
  },
}

let msgCounter = 0
function uid() {
  return `msg-${++msgCounter}`
}

let projectCounter = 0

export function GenieCodePanel({ open, onClose, className }: GenieCodePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [tags, setTags] = useState<GenieTag[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [projects, setProjects] = useState<PanelProject[]>(PANEL_PROJECTS)
  const [assignedProject, setAssignedProject] = useState<PanelProject>()
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  const handleSubmit = (value: string) => {
    const text = value.trim()
    if (!text) return

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTags([])
    setIsThinking(true)

    const response = MOCK_RESPONSES.default
    setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: response.answer,
          thinking: response.thinking,
        },
      ])
    }, 1800)
  }

  const handleSuggestion = (label: string) => {
    handleSubmit(label)
  }

  const handleNewConversation = () => {
    setMessages([])
    setInput("")
    setTags([])
    setIsThinking(false)
    setAssignedProject(undefined)
  }

  const createProject = () => {
    const project: PanelProject = {
      id: `panel-p-${++projectCounter}`,
      name: `Untitled project ${projectCounter}`,
    }
    setProjects((current) => [project, ...current])
    setAssignedProject(project)
    setProjectPopoverOpen(false)
  }

  const isEmpty = messages.length === 0 && !isThinking

  return (
    <div
      className={cn(
        "flex flex-col shrink-0 bg-background overflow-hidden",
        open ? "w-[360px]" : "w-0",
        className
      )}
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <ChevronsLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-5 text-foreground">
                  Genie Code
                </span>
                {assignedProject && (
                  <span className="flex items-center gap-1 truncate text-hint text-muted-foreground">
                    <FolderIcon size={12} className="shrink-0 text-[var(--warning)]" />
                    <span className="truncate">{assignedProject.name}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" aria-label="New conversation" onClick={handleNewConversation}>
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="More options">
                <OverflowIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="Close Genie Code" onClick={onClose}>
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-3 pt-3">
            {isEmpty ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="flex w-full flex-col items-center gap-4 px-6">
                  <DbIcon icon={GenieCodeIcon} color="ai" size={48} />
                  <div className="flex w-full flex-col items-center gap-2 text-center">
                    <p className="text-xl font-semibold leading-7 text-foreground">
                      Genie Code
                    </p>
                    <p className="text-[13px] leading-5 text-muted-foreground">
                      Run multi-step data and AI tasks
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap justify-center gap-2">
                    {SUGGESTION_CHIPS.map((label) => (
                      <SuggestionPill key={label} onClick={() => handleSuggestion(label)}>
                        {label}
                      </SuggestionPill>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat thread */
              <div className="flex flex-col gap-4 pb-3">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <Message key={msg.id} from="user">
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ) : (
                    <Message key={msg.id} from="assistant">
                      {msg.thinking && (
                        <ChainOfThought>
                          <ChainOfThoughtHeader isStreaming={false}>
                            Thought for a moment
                          </ChainOfThoughtHeader>
                          <ChainOfThoughtContent>
                            <ChainOfThoughtStep label={msg.thinking} />
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      <MessageContent className="pl-3">{msg.content}</MessageContent>
                      <MessageToolbar className="pl-3">
                        <MessageActions>
                          <MessageAction tooltip="Copy">
                            <CopyIcon className="h-4 w-4" />
                          </MessageAction>
                          <MessageAction tooltip="Helpful">
                            <ThumbsUpIcon className="h-4 w-4" />
                          </MessageAction>
                          <MessageAction tooltip="Not helpful">
                            <ThumbsDownIcon className="h-4 w-4" />
                          </MessageAction>
                        </MessageActions>
                      </MessageToolbar>
                    </Message>
                  )
                )}

                {isThinking && (
                  <Message from="assistant">
                    <ChainOfThought>
                      <ChainOfThoughtHeader isStreaming={true}>
                        Thinking
                      </ChainOfThoughtHeader>
                    </ChainOfThought>
                  </Message>
                )}
              </div>
            )}
          </div>

          {/* Compose area — Add to project lives on the prompt action bar */}
          <div className="shrink-0 p-3">
            {assignedProject ? (
              <div className="w-full">
                <GeniePrompt
                  variant="chat"
                  size="small"
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  tags={tags}
                  onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
                  placeholder="Ask Genie Code..."
                  projectLabel={assignedProject.name}
                />
              </div>
            ) : (
              <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="w-full">
                    <GeniePrompt
                      variant="chat"
                      size="small"
                      value={input}
                      onChange={setInput}
                      onSubmit={handleSubmit}
                      tags={tags}
                      onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
                      placeholder="Ask Genie Code..."
                      projectLabel={true}
                      onChooseProject={() => setProjectPopoverOpen((v) => !v)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent align="start" side="top" className="w-[280px] p-1">
                  <p className="px-2 py-1.5 text-hint text-muted-foreground">Add to project</p>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setAssignedProject(p)
                        setProjectPopoverOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <FolderIcon size={16} className="shrink-0 text-[var(--warning)]" />
                      <span className="flex-1 truncate">{p.name}</span>
                    </button>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={createProject}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <PlusIcon size={16} className="shrink-0 text-muted-foreground" />
                    <span>Create new project</span>
                  </button>
                </PopoverContent>
              </Popover>
            )}
            <p className="mt-2 text-center text-[12px] leading-4 text-muted-foreground">
              Only use the agent with code and data you trust
            </p>
          </div>
        </>
      )}
    </div>
  )
}
