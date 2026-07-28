// ─── Genie Code Projects ──────────────────────────────────────────────────────
// Full-screen Genie Code experience: threads panel + chat area + workspace canvas,
// all inside one card. Reached from the "Genie Code" left-nav item.
//
// Interactive behaviors (mocked): expandable suggestion categories, an agentic
// actions trace (Thoughts + Created/Ran/Edited steps), a human-in-the-loop tool
// approval card, and a workspace canvas pane where assets open for review.

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AppShell, GenieThreadsPanel } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { GeniePrompt, type GenieTag } from "@/components/ai-elements/genie-prompt"
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageToolbar,
} from "@/components/ai-elements/message"
import {
  GenieCodeIcon,
  SidebarCollapseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  NotebookIcon,
  DashboardIcon,
  DatabaseIcon,
  SchemaIcon,
  BarChartIcon,
  WorkflowsIcon,
  SlidersIcon,
  CalendarClockIcon,
  ChartLineIcon,
} from "@/components/icons"
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon } from "lucide-react"

// ─── Suggestion categories ──────────────────────────────────────────────────────

type Category = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  prompts: string[]
}

const CATEGORIES: Category[] = [
  {
    id: "explore",
    label: "Explore & clean data",
    icon: DatabaseIcon,
    prompts: [
      "Profile my key tables and flag data quality issues",
      "Suggest joins across my tables and explain the relationships",
      "Help me design silver and gold layers from my raw data",
      "Fix schema issues and standardize column types in this table",
      "Write and optimize a query using Unity Catalog and Delta best practices",
    ],
  },
  {
    id: "ml",
    label: "ML & analytics",
    icon: ChartLineIcon,
    prompts: [
      "Run exploratory analysis on my dataset and summarize findings",
      "Train a baseline model and report the key metrics",
      "Cluster my records into groups and describe each segment",
    ],
  },
  {
    id: "dashboards",
    label: "Dashboards & reporting",
    icon: BarChartIcon,
    prompts: [
      "Build a dashboard summarizing my key metrics",
      "Create a weekly report and schedule it to run",
    ],
  },
  {
    id: "engineering",
    label: "Engineering & ops",
    icon: WorkflowsIcon,
    prompts: [
      "Turn this notebook into a scheduled job",
      "Add data quality checks to my pipeline",
    ],
  },
  { id: "skill", label: "Create a skill", icon: SlidersIcon, prompts: [] },
  { id: "schedule", label: "Schedule a task", icon: CalendarClockIcon, prompts: [] },
]

// ─── Agentic actions (mock) ─────────────────────────────────────────────────────

type ActionStep = {
  verb: string
  asset: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
}

const MOCK = {
  thoughts:
    "I'll start by inspecting the ski_resorts table schema, then sample the data to find relevant columns before running EDA.",
  steps: [
    { verb: "Created", asset: "Ski Resort EDA", icon: NotebookIcon },
    { verb: "Ran", asset: "Ski Resort EDA", icon: NotebookIcon },
    { verb: "Created", asset: "Ski Resort Dashboard", icon: DashboardIcon },
  ] as ActionStep[],
  approvalFile: "ski_resort_eda.py",
}

// ─── Chat state ───────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  /** assistant: renders the agentic actions trace + approval card */
  agentic?: boolean
}

let msgCounter = 0
const uid = () => `msg-${++msgCounter}`

export default function GenieCodeProjects() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [tags, setTags] = React.useState<GenieTag[]>([])
  const [isThinking, setIsThinking] = React.useState(false)
  const [activeThreadId, setActiveThreadId] = React.useState<string>()
  const [awaitingApproval, setAwaitingApproval] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isThinking])

  const send = (value: string) => {
    const text = value.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: uid(), role: "user", content: text }])
    setInput("")
    setTags([])
    setIsThinking(true)
    setActiveThreadId((id) => id ?? "c1")
    setTimeout(() => {
      setIsThinking(false)
      setAwaitingApproval(true)
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: "", agentic: true },
      ])
    }, 1400)
  }

  const resolveApproval = (allowed: boolean) => {
    setAwaitingApproval(false)
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "assistant",
        content: allowed
          ? "Done. I profiled your key tables, flagged the data quality issues I found, and opened the results in the workspace canvas."
          : "No problem — I've stopped before editing that file. Let me know how you'd like to proceed.",
      },
    ])
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
    setTags([])
    setIsThinking(false)
    setAwaitingApproval(false)
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
      {/* One card holds threads + chat + canvas */}
      <div className="m-2 flex flex-1 overflow-hidden rounded-md border border-border bg-background">
        {/* Threads panel — inside the card */}
        <GenieThreadsPanel
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onNewChat={handleNewChat}
          activeStatus={awaitingApproval ? "Waiting for your approval" : undefined}
        />

        {/* Chat column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto">
            {isEmpty ? (
              <EmptyState onPick={send} input={input} setInput={setInput} tags={tags} setTags={setTags} />
            ) : (
              <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-6 py-6">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <Message key={msg.id} from="user">
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ) : msg.agentic ? (
                    <AgenticResponse
                      key={msg.id}
                      awaitingApproval={awaitingApproval}
                      onResolve={resolveApproval}
                    />
                  ) : (
                    <Message key={msg.id} from="assistant">
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
                  <p className="pl-3 text-sm italic text-muted-foreground">
                    <ThinkingDots /> Thinking
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Docked composer during a conversation */}
          {!isEmpty && (
            <div className="shrink-0 border-t border-border">
              <div className="mx-auto w-full max-w-[720px] px-6 py-4">
                <Composer input={input} setInput={setInput} tags={tags} setTags={setTags} onSubmit={send} />
                <p className="mt-2 text-center text-hint text-muted-foreground">
                  Always review the accuracy of responses.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Workspace canvas */}
        <WorkspaceCanvas />
      </div>
    </AppShell>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────────

function EmptyState({
  onPick,
  input,
  setInput,
  tags,
  setTags,
}: {
  onPick: (v: string) => void
  input: string
  setInput: (v: string) => void
  tags: GenieTag[]
  setTags: React.Dispatch<React.SetStateAction<GenieTag[]>>
}) {
  const [openCat, setOpenCat] = React.useState<string>()

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <DbIcon icon={GenieCodeIcon} color="ai" size={48} />
      <h1 className="text-2xl font-semibold leading-8 text-foreground">What can I help you build?</h1>

      <Composer input={input} setInput={setInput} tags={tags} setTags={setTags} onSubmit={onPick} className="w-full" />

      {/* Expandable category suggestions */}
      <div className="flex w-full flex-col items-center gap-2">
        {CATEGORIES.map((cat) => {
          const open = openCat === cat.id
          const expandable = cat.prompts.length > 0
          return (
            <div key={cat.id} className="w-full">
              {open ? (
                /* Expanded: category header + starter prompts */
                <div className="w-full rounded-md border border-border">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <DbIcon icon={cat.icon} size={16} className="text-muted-foreground" />
                    <span className="flex-1 text-sm font-semibold text-foreground">{cat.label}</span>
                    <Button variant="ghost" size="icon-xs" aria-label="Close" onClick={() => setOpenCat(undefined)}>
                      <CloseIcon size={16} className="text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex flex-col">
                    {cat.prompts.map((p, i) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onPick(p)}
                        className={cn(
                          "px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-[var(--action-default-bg-hover)]",
                          i === 0 && "text-primary",
                          i < cat.prompts.length - 1 && "border-b border-border",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Collapsed pill */
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => (expandable ? setOpenCat(cat.id) : onPick(cat.label))}
                    className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-[var(--action-default-bg-hover)]"
                  >
                    <DbIcon icon={cat.icon} size={16} className="text-muted-foreground" />
                    {cat.label}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agentic response (thoughts + actions trace + approval) ──────────────────────

function AgenticResponse({
  awaitingApproval,
  onResolve,
}: {
  awaitingApproval: boolean
  onResolve: (allowed: boolean) => void
}) {
  return (
    <Message from="assistant">
      <div className="flex flex-col gap-3 pl-3">
        {/* Thoughts */}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Thoughts:</span>{" "}
          <span className="italic">{MOCK.thoughts}</span>
        </p>

        {/* Collapsible actions trace */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ChevronRightIcon
              size={14}
              className="transition-transform group-data-[state=open]:rotate-90"
            />
            {MOCK.steps.length} actions
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 flex flex-col gap-1.5">
              {MOCK.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{step.verb}</span>
                  <span className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-xs text-foreground">
                    <DbIcon icon={step.icon} size={12} className="text-muted-foreground" />
                    {step.asset}
                  </span>
                  <CheckIcon size={14} className="ml-auto text-[var(--success)]" />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Approval card */}
        {awaitingApproval && (
          <div className="rounded-md border-2 border-primary/40 p-3">
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <ChevronRightIcon size={14} className="text-muted-foreground" />
              Edited <span className="font-semibold">{MOCK.approvalFile}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="default" size="sm" className="gap-1">
                Ask every time
                <ChevronDownIcon size={16} />
              </Button>
              <div className="flex-1" />
              <Button variant="default" size="sm" onClick={() => onResolve(false)}>
                Decline
              </Button>
              <Button variant="primary" size="sm" className="gap-2" onClick={() => onResolve(true)}>
                Allow
                <span className="text-xs opacity-70">⌘↵</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Message>
  )
}

// ─── Workspace canvas ────────────────────────────────────────────────────────────

function WorkspaceCanvas() {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-border">
      <div className="flex h-11 shrink-0 items-center justify-end px-2">
        <Button variant="ghost" size="icon-xs" aria-label="Collapse canvas">
          <SidebarCollapseIcon size={16} className="text-muted-foreground" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-24 w-32 items-center justify-center rounded-md border border-border bg-secondary">
          <ChartLineIcon size={40} className="text-muted-foreground/50" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-foreground">Workspace canvas</p>
          <p className="text-hint text-muted-foreground">
            As you work, the files and assets you create and edit open in this space for you to review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm">Open asset</Button>
          <Button variant="default" size="sm" className="gap-1">
            <PlusIcon size={16} />
            New
          </Button>
        </div>
      </div>
    </aside>
  )
}

// ─── Composer ────────────────────────────────────────────────────────────────────

function Composer({
  input,
  setInput,
  tags,
  setTags,
  onSubmit,
  className,
}: {
  input: string
  setInput: (v: string) => void
  tags: GenieTag[]
  setTags: React.Dispatch<React.SetStateAction<GenieTag[]>>
  onSubmit: (v: string) => void
  className?: string
}) {
  return (
    <GeniePrompt
      variant="chat"
      value={input}
      onChange={setInput}
      onSubmit={onSubmit}
      tags={tags}
      onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
      placeholder="@ for objects, / for commands, ↑↓ for history"
      modelName="Auto"
      showAtButton
      className={className}
    />
  )
}

// ─── Thinking dots ───────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="mr-1 inline-flex gap-0.5 align-middle">
      <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="size-1 animate-bounce rounded-full bg-muted-foreground" />
    </span>
  )
}
