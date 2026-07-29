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
import { AppShell, GenieThreadsPanel, GENIE_THREADS, threadAssetCount, threadProject } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import { Input } from "@/components/ui/input"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
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
  SidebarExpandIcon,
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
  SpeechBubbleIcon,
  NewChatIcon,
  SearchIcon,
  ArrowLeftIcon,
  OverflowIcon,
  LockIcon,
  ShareIcon,
  FileDocumentIcon,
  FolderOpenIcon,
  CatalogIcon,
  TableIcon,
  UploadIcon,
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
    label: "Dashboards",
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
  const [canvasOpen, setCanvasOpen] = React.useState(false)
  const [view, setView] = React.useState<"chat" | "projects" | "detail">("chat")
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>()
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
          activeThreadId={view === "chat" ? activeThreadId : undefined}
          onSelectThread={(id) => { setView("chat"); setActiveThreadId(id) }}
          onNewChat={() => { setView("chat"); handleNewChat() }}
          onSelectAction={(id) => setView(id === "projects" ? "projects" : "chat")}
          activeAction={view === "projects" || view === "detail" ? "projects" : undefined}
          activeStatus={awaitingApproval ? "Waiting for your approval" : undefined}
        />

        {view === "projects" ? (
          <ProjectsView
            onOpenProject={(id) => { setSelectedProjectId(id); setView("detail") }}
          />
        ) : view === "detail" ? (
          <ProjectDetail
            project={PROJECTS.find((p) => p.id === selectedProjectId) ?? PROJECTS[0]}
            onBack={() => setView("projects")}
            onOpenThread={(id) => { setView("chat"); setActiveThreadId(id) }}
          />
        ) : activeThreadId && messages.length === 0 && !isThinking ? (
          /* Selected an existing thread — show its transcript */
          <ThreadView
            threadId={activeThreadId}
            input={input}
            setInput={setInput}
            tags={tags}
            setTags={setTags}
            onSubmit={send}
            onOpenProject={(id) => { setSelectedProjectId(id); setView("detail") }}
          />
        ) : (
        /* Chat column — new chat / live conversation */
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
        )}

        {/* Workspace canvas — collapsed by default; hidden in projects view */}
        {view === "chat" && (
          <WorkspaceCanvas open={canvasOpen} onToggle={() => setCanvasOpen((v) => !v)} />
        )}
      </div>
    </AppShell>
  )
}

// ─── Thread view (existing thread transcript) ─────────────────────────────────────

type ThreadTurn = { role: "user" | "assistant"; content: string }

// A few hand-written example transcripts, keyed by thread id.
const THREAD_TRANSCRIPTS: Record<string, ThreadTurn[]> = {
  c1: [
    { role: "user", content: "How can I get support for NFL data analysis in Databricks?" },
    { role: "assistant", content: "A few good paths: use a Genie space over your NFL tables for natural-language Q&A, spin up a notebook for deeper EDA, or open a support ticket for platform issues. Want me to set up a starter notebook against your play-by-play tables?" },
  ],
  c2: [
    { role: "user", content: "can you executeCode with a sample python cell that runs a SQL query and prints the result?" },
    { role: "assistant", content: "Sure — here's a cell that runs the query with spark.sql and prints the first rows:\n\nspark.sql(\"SELECT team, SUM(points) AS pts FROM scores GROUP BY team ORDER BY pts DESC\").show(10)" },
  ],
  c3: [
    { role: "user", content: "can you executeCode with a sample python cell for a SQL-like query over my reviews table?" },
    { role: "assistant", content: "Done. I wrote a small helper and saved it as an asset you can reuse — it wraps the query and returns a tidy DataFrame." },
  ],
  c4: [
    { role: "user", content: "Create a fib function file and a notebook that imports and runs it." },
    { role: "assistant", content: "Created fib.py and a notebook that imports it and prints the first 10 Fibonacci numbers. Both are attached below." },
  ],
}

const GENERIC_TRANSCRIPT: ThreadTurn[] = [
  { role: "user", content: "Can you help me pick up where this thread left off?" },
  { role: "assistant", content: "Absolutely — here's a quick recap of what we covered, and I'm ready to continue whenever you are." },
]

function ThreadView({
  threadId,
  input,
  setInput,
  tags,
  setTags,
  onSubmit,
  onOpenProject,
}: {
  threadId: string
  input: string
  setInput: (v: string) => void
  tags: GenieTag[]
  setTags: React.Dispatch<React.SetStateAction<GenieTag[]>>
  onSubmit: (v: string) => void
  onOpenProject?: (id: string) => void
}) {
  const thread = GENIE_THREADS[threadId]
  const turns = THREAD_TRANSCRIPTS[threadId] ?? GENERIC_TRANSCRIPT
  const assetCount = threadAssetCount(thread)
  const project = threadProject(threadId)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Thread title — "Project / Thread" when the thread lives in a project */}
      <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border px-6">
        {project && (
          <>
            <button
              type="button"
              onClick={() => onOpenProject?.(project.id)}
              className="max-w-[240px] truncate text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {project.name}
            </button>
            <span className="text-muted-foreground/50" aria-hidden>/</span>
          </>
        )}
        <span className="truncate text-sm font-semibold text-foreground">
          {thread?.title ?? "Untitled chat"}
        </span>
      </div>

      {/* Transcript */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-6 py-6">
          {turns.map((turn, i) =>
            turn.role === "user" ? (
              <Message key={i} from="user">
                <MessageContent>{turn.content}</MessageContent>
              </Message>
            ) : (
              <Message key={i} from="assistant">
                <MessageContent className="whitespace-pre-wrap pl-3">{turn.content}</MessageContent>
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
        </div>
      </div>

      {/* Composer + assets container */}
      <div className="shrink-0 border-t border-border">
        <div className="mx-auto w-full max-w-[720px] px-6 py-4">
          {assetCount > 0 && (
            <button
              type="button"
              className="mb-3 flex w-full items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <FolderIcon size={16} className="shrink-0 text-[var(--warning)]" />
              <span className="flex-1 text-sm text-foreground">
                {assetCount} {assetCount === 1 ? "asset" : "assets"} in this chat
              </span>
              <ChevronRightIcon size={14} className="shrink-0 text-muted-foreground" />
            </button>
          )}
          <Composer input={input} setInput={setInput} tags={tags} setTags={setTags} onSubmit={onSubmit} />
          <p className="mt-2 text-center text-hint text-muted-foreground">
            Always review the accuracy of responses.
          </p>
        </div>
      </div>
    </div>
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
  const [projectName, setProjectName] = React.useState<string>()
  const [projectPopoverOpen, setProjectPopoverOpen] = React.useState(false)

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <DbIcon icon={GenieCodeIcon} color="ai" size={48} />
      <h1 className="text-center text-2xl font-semibold leading-8 text-foreground">What can I help you build?</h1>

      <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
        {/* Anchor the popover on the composer; the project button toggles it */}
        <PopoverTrigger asChild>
          <div className="w-full">
            <Composer
              input={input}
              setInput={setInput}
              tags={tags}
              setTags={setTags}
              onSubmit={onPick}
              className="w-full"
              showProject
              projectName={projectName}
              onChooseProject={() => setProjectPopoverOpen((v) => !v)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[280px] p-1">
          <p className="px-2 py-1.5 text-hint text-muted-foreground">Add to project</p>
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setProjectName(p.name); setProjectPopoverOpen(false) }}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                projectName === p.name ? "text-primary" : "text-foreground",
              )}
            >
              <FolderIcon size={16} className="shrink-0 text-[var(--warning)]" />
              <span className="flex-1 truncate">{p.name}</span>
              {projectName === p.name && <CheckIcon size={14} className="shrink-0 text-primary" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Expandable category suggestions — pills wrap into as many rows as needed */}
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const expandable = cat.prompts.length > 0
            const active = openCat === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => (expandable ? setOpenCat(active ? undefined : cat.id) : onPick(cat.label))}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:bg-[var(--action-default-bg-hover)]",
                )}
              >
                <DbIcon icon={cat.icon} size={16} className={active ? "text-primary" : "text-muted-foreground"} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Expanded category — starter prompts, full width below the pills */}
        {openCat &&
          (() => {
            const cat = CATEGORIES.find((c) => c.id === openCat)
            if (!cat || cat.prompts.length === 0) return null
            return (
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
            )
          })()}
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

// ─── Projects view ───────────────────────────────────────────────────────────────

type Project = {
  id: string
  name: string
  desc: string
  time: string
  chats: number
  scope: "yours" | "org" | "shared"
}

const PROJECTS: Project[] = [
  { id: "p1", name: "Lakeflow Designer Adoption", desc: "Track how teams adopt Lakeflow Designer across the org. Feeds the Q3 exec review.", time: "2h ago", chats: 3, scope: "yours" },
  { id: "p2", name: "Customer Support Agent Reboot", desc: "Reboot the review-and-product-docs agent so it actually calls the right tool.", time: "yesterday", chats: 5, scope: "yours" },
  { id: "p3", name: "Bronze → Silver Reviews Pipeline", desc: "Source → bronze → silver → gold. One project spanning every notebook in the flow.", time: "3d ago", chats: 4, scope: "org" },
  { id: "p4", name: "Q3 Reviews Analytics", desc: "Quarterly deep-dive on review sentiment and product mentions.", time: "5d ago", chats: 3, scope: "shared" },
]

const PROJECT_TABS = [
  { value: "yours", label: "Your projects" },
  { value: "org", label: "Workspace" },
  { value: "shared", label: "Shared with you" },
] as const

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } }}
      className="flex cursor-pointer flex-col gap-3 rounded-md border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
    >
      <div className="flex items-start gap-2">
        <FolderIcon size={16} className="mt-0.5 shrink-0 text-[var(--warning)]" />
        <span className="flex-1 truncate text-sm font-semibold text-foreground">{project.name}</span>
        <span className="shrink-0 text-hint text-muted-foreground">{project.time}</span>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{project.desc}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-hint text-muted-foreground">
          <SpeechBubbleIcon size={14} />
          {project.chats} chats
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="New chat"
              onClick={(e) => e.stopPropagation()}
            >
              <NewChatIcon size={16} className="text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New chat</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function ProjectsView({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [tab, setTab] = React.useState<string>("yours")
  const [search, setSearch] = React.useState("")

  const projects = PROJECTS.filter(
    (p) => p.scope === tab && (!search || p.name.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-8 py-8">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-semibold leading-7 text-foreground">Projects</h2>
          <Button size="sm" className="shrink-0 gap-1">
            <PlusIcon size={16} />
            New project
          </Button>
        </div>

        {/* Tabs + search */}
        <div className="flex items-center gap-4">
          <SegmentedControl value={tab} onValueChange={setTab}>
            {PROJECT_TABS.map((t) => (
              <SegmentedItem key={t.value} value={t.value}>{t.label}</SegmentedItem>
            ))}
          </SegmentedControl>
          <div className="flex-1" />
          <div className="relative shrink-0">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects"
              className="h-8 w-48 pl-8"
            />
          </div>
        </div>

        {/* Card grid */}
        {projects.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">No projects here yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => onOpenProject(project.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Project detail ──────────────────────────────────────────────────────────────

const PROJECT_DETAIL_TABS = [
  { value: "chats", label: "Chats" },
  { value: "assets", label: "Assets" },
  { value: "instructions", label: "Instructions" },
] as const

// Thread ids each project owns (matches the panel's PANEL_PROJECTS mapping),
// so the detail Chats list renders real threads that open their transcripts.
const PROJECT_CHAT_IDS: Record<string, string[]> = {
  p1: ["c4", "c5"],
  p2: ["c2", "c3"],
  p4: ["c7", "c8", "c9"],
}

function ProjectDetail({
  project,
  onBack,
  onOpenThread,
}: {
  project: Project
  onBack: () => void
  onOpenThread?: (id: string) => void
}) {
  const [input, setInput] = React.useState("")
  const [tags, setTags] = React.useState<GenieTag[]>([])
  const [tab, setTab] = React.useState<string>("chats")
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState("recent")
  const [addAssetOpen, setAddAssetOpen] = React.useState(false)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon size={16} />
          All projects
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[22px] font-semibold leading-7 text-foreground">{project.name}</h2>
            <div className="flex items-center gap-1.5 text-hint text-muted-foreground">
              Created by you
              <span aria-hidden>·</span>
              <LockIcon size={12} />
              Private
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon-xs" aria-label="More options">
              <OverflowIcon size={16} className="text-muted-foreground" />
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <ShareIcon size={16} />
              Share
            </Button>
          </div>
        </div>

        {/* Composer */}
        <GeniePrompt
          variant="chat"
          value={input}
          onChange={setInput}
          onSubmit={() => setInput("")}
          tags={tags}
          onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
          placeholder="How can I help you today?"
          modelName="Sonnet 5"
        />

        {/* Tabs + search + sort */}
        <div className="flex items-center gap-2">
          <SegmentedControl value={tab} onValueChange={setTab}>
            {PROJECT_DETAIL_TABS.map((t) => (
              <SegmentedItem key={t.value} value={t.value}>{t.label}</SegmentedItem>
            ))}
          </SegmentedControl>
          <div className="flex-1" />
          {/* Search + sort — only on the Chats tab */}
          {tab === "chats" && (
            <>
              {searchOpen ? (
                <div className="relative">
                  <SearchIcon
                    size={16}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => { if (!search) setSearchOpen(false) }}
                    placeholder="Search chats"
                    className="h-8 w-48 pl-8"
                  />
                </div>
              ) : (
                <Button variant="ghost" size="icon-sm" aria-label="Search chats" onClick={() => setSearchOpen(true)}>
                  <SearchIcon size={16} className="text-muted-foreground" />
                </Button>
              )}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 w-[150px]" aria-label="Sort chats">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Tab content */}
        {tab === "chats" && (
          <div className="flex flex-col gap-0.5">
            {(PROJECT_CHAT_IDS[project.id] ?? []).map((tid) => {
              const thread = GENIE_THREADS[tid]
              if (!thread) return null
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => onOpenThread?.(tid)}
                  className="flex flex-col gap-0.5 rounded px-2 py-2 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <SpeechBubbleIcon size={16} className="shrink-0 text-muted-foreground" />
                    {thread.done && <CheckIcon size={12} className="shrink-0 text-[var(--success)]" />}
                    <span className="flex-1 truncate text-sm text-foreground">{thread.title}</span>
                    <span className="shrink-0 text-hint text-muted-foreground">{thread.time}</span>
                  </div>
                  {thread.preview && (
                    <div className="flex items-center gap-1 pl-6">
                      <span className="truncate text-hint text-muted-foreground">{thread.preview}</span>
                      {thread.meta && (
                        <span className="shrink-0 text-hint text-[var(--success)]">{thread.meta}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {tab === "assets" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-[560px] text-sm text-muted-foreground">
                Assets keep their workspace folder structure — attach a folder or an individual notebook, and
                it appears here right where it lives in your workspace.
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="shrink-0 gap-1">
                    <PlusIcon size={16} />
                    Add asset
                    <ChevronDownIcon size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setAddAssetOpen(true)}>
                    <FolderOpenIcon size={16} className="text-muted-foreground" />
                    From workspace
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CatalogIcon size={16} className="text-muted-foreground" />
                    From Unity Catalog
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UploadIcon size={16} className="text-muted-foreground" />
                    Upload file
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Workspace */}
            <div className="rounded-md border border-border">
              <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Workspace <span className="mx-1 font-normal">·</span> 3 notebooks
                <span className="mx-1 font-normal">·</span> 1 dashboards
                <span className="mx-1 font-normal">·</span> 1 files
              </div>
              <AssetTree />
            </div>

            {/* Unity Catalog */}
            <div className="rounded-md border border-border">
              <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Unity Catalog <span className="mx-1 font-normal">·</span> 2 tables
                <span className="mx-1 font-normal">·</span> 1 schema
                <span className="mx-1 font-normal">·</span> 1 volume
              </div>
              <div className="flex flex-col py-1">
                {UC_ASSETS.map((a) => (
                  <div key={a.name} className="flex items-center gap-2 px-3 py-1.5">
                    <DbIcon icon={a.icon} size={16} className="shrink-0 text-primary" />
                    <span className="truncate text-sm text-foreground">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Local / uploaded files */}
            <div className="rounded-md border border-border">
              <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Local files
              </div>
              <div className="p-4">
                <button
                  type="button"
                  className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-8 text-center transition-colors hover:bg-muted"
                >
                  <UploadIcon size={24} className="text-muted-foreground/50" />
                  <span className="text-sm font-semibold text-foreground">Upload a file</span>
                  <span className="text-hint text-muted-foreground">
                    Drop a PDF, CSV, or other file, or click to browse.
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions — shown on the Instructions tab */}
        {tab === "instructions" && (
          <div className="flex flex-col gap-4">
            <p className="max-w-[560px] text-sm text-muted-foreground">
              Instructions and agent memories tailor how Genie responds in this project — preferred tables,
              response tone, what you&apos;re working on.{" "}
              <a href="#" className="text-primary hover:underline">Learn more</a>
            </p>
            <InstructionsDoc />
          </div>
        )}
      </div>

      <AddAssetDialog open={addAssetOpen} onOpenChange={setAddAssetOpen} />
    </div>
  )
}

// ─── Assets tree + Add asset dialog ────────────────────────────────────────────

type AssetItem = {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  color: string
}

const ASSET_ITEMS: AssetItem[] = [
  { name: "adoption_overview", icon: NotebookIcon, color: "text-primary" },
  { name: "cohort_segmentation", icon: NotebookIcon, color: "text-primary" },
  { name: "retention_signals", icon: NotebookIcon, color: "text-primary" },
  { name: "Adoption Dashboard", icon: DashboardIcon, color: "text-[var(--success)]" },
  { name: "exec_readout.md", icon: FileDocumentIcon, color: "text-muted-foreground" },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UC_ASSETS: { name: string; icon: React.ComponentType<any> }[] = [
  { name: "main.lakeflow.adoption_events", icon: TableIcon },
  { name: "main.lakeflow.team_rollup", icon: TableIcon },
  { name: "main.lakeflow", icon: SchemaIcon },
  { name: "main.lakeflow.exports", icon: DatabaseIcon },
]

function AssetTree() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted"
      >
        <ChevronRightIcon
          size={14}
          className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        <FolderOpenIcon size={16} className="shrink-0 text-[var(--warning)]" />
        <span className="flex-1 truncate text-sm text-foreground">Users/tanvi/lakeflow</span>
        <span className="shrink-0 text-hint text-muted-foreground">5</span>
      </button>
      {open &&
        ASSET_ITEMS.map((item) => (
          <div key={item.name} className="flex items-center gap-2 py-1.5 pl-11 pr-3">
            <DbIcon icon={item.icon} size={16} className={cn("shrink-0", item.color)} />
            <span className="truncate text-sm text-foreground">{item.name}</span>
          </div>
        ))}
    </div>
  )
}

type WsNode = { id: string; name: string; count: number; children?: WsNode[] }

const WORKSPACE_TREE: WsNode[] = [
  {
    id: "users",
    name: "Users",
    count: 17,
    children: [{ id: "tanvi", name: "tanvi", count: 17 }],
  },
]

function WorkspaceRow({ node, depth }: { node: WsNode; depth: number }) {
  const [open, setOpen] = React.useState(depth === 0)
  const hasChildren = !!node.children?.length
  return (
    <>
      <div className="flex items-center gap-2 py-1.5" style={{ paddingLeft: depth * 24 }}>
        <button
          type="button"
          onClick={() => hasChildren && setOpen((v) => !v)}
          aria-label={open ? "Collapse" : "Expand"}
          className={cn("shrink-0 text-muted-foreground", !hasChildren && "invisible")}
        >
          <ChevronRightIcon size={14} className={cn("transition-transform", open && "rotate-90")} />
        </button>
        <Checkbox />
        <FolderOpenIcon size={16} className="shrink-0 text-[var(--warning)]" />
        <span className="flex-1 truncate text-sm text-foreground">{node.name}</span>
        <span className="shrink-0 text-hint text-muted-foreground">{node.count}</span>
      </div>
      {open && node.children?.map((child) => <WorkspaceRow key={child.id} node={child} depth={depth + 1} />)}
    </>
  )
}

function AddAssetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [search, setSearch] = React.useState("")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add assets to project</DialogTitle>
          <DialogDescription>
            Browse your workspace and check folders or individual items — folder checks pull in everything inside.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notebooks, dashboards, files..."
              className="h-8 pl-8"
            />
          </div>
          <div className="rounded-md border border-border">
            <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Workspace <span className="font-normal">›</span> Users{" "}
              <span className="font-normal">›</span> tanvi.shanbhag@databricks.com
            </div>
            <div className="px-3 py-1">
              {WORKSPACE_TREE.map((node) => (
                <WorkspaceRow key={node.id} node={node} depth={0} />
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="items-center">
          <span className="mr-auto text-hint text-muted-foreground">Nothing selected</span>
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Instructions document ─────────────────────────────────────────────────────

const INSTRUCTION_RULES = [
  "When creating datasets from main.jason_messer.craigslist_vehicles, exclude the url column from the SELECT statement to keep the dataset clean and focused on relevant vehicle data.",
]

const AGENT_MEMORIES = [
  "NFL combine project: training table is kyle_gilbreath.nfl_combine_data.2025_nfl_combine (RAS, Ranking, Production as targets); scoring table is kyle_gilbreath.nfl_combine_data.2026_nfl_combine. Predicted rankings saved to kyle_gilbreath.nfl_combine_data.2026_predicted_rankings.",
  "MLflow experiment for this project lives at /Users/kyle.gilbreath@databricks.com/NFL Combine RAS Predictor.",
  "ML notebook: NFL Combine ML — Predict Top 2027 Prospects. RandomForestRegressor trained on RAS target, MAE ~0.875, R² ~0.559. Top 2026 prospect: Kenyon Sadiq (Oregon, 9.87 predicted RAS).",
  "NFL fantasy football: strength-of-schedule table saved at kyle_gilbreath.nfl_fantasy_football.strength_of_schedule, one row per team and position, where schedule_percentile is 0–1 (higher means an easier schedule).",
]

const INSTRUCTIONS_MARKDOWN =
  `# Something\n\n- ${INSTRUCTION_RULES.join("\n- ")}\n\n# Agent Memories\n\n- ${AGENT_MEMORIES.join("\n- ")}`

function InstructionsDoc() {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(INSTRUCTIONS_MARKDOWN)

  return (
    <div className="rounded-md border border-border">
      {/* Header: filename + edit/save/cancel */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-2">
        <span className="flex-1 font-mono text-sm text-foreground">.assistant_instructions.md</span>
        {editing ? (
          <>
            <Button variant="default" size="sm" onClick={() => { setDraft(INSTRUCTIONS_MARKDOWN); setEditing(false) }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing(false)}>
              Save
            </Button>
          </>
        ) : (
          <Button variant="default" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[280px] w-full resize-none bg-transparent font-mono text-sm text-foreground outline-none"
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Something</h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-foreground">
                {INSTRUCTION_RULES.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Agent Memories</h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-foreground">
                {AGENT_MEMORIES.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WorkspaceCanvas({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  // Collapsed: slim rail with an expand button so the panel can be reopened.
  if (!open) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center border-l border-border py-2">
        <Button variant="ghost" size="icon-xs" aria-label="Open canvas" onClick={onToggle}>
          <SidebarExpandIcon size={16} className="text-muted-foreground" />
        </Button>
      </aside>
    )
  }

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-border bg-secondary">
      <div className="flex h-11 shrink-0 items-center justify-end px-2">
        <Button variant="ghost" size="icon-xs" aria-label="Collapse canvas" onClick={onToggle}>
          <SidebarCollapseIcon size={16} className="text-muted-foreground" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-24 w-32 items-center justify-center rounded-md border border-border bg-background">
          <ChartLineIcon size={40} className="text-muted-foreground/50" />
        </div>
        <div className="flex flex-col gap-1.5">
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
  showProject = false,
  projectName,
  onChooseProject,
}: {
  input: string
  setInput: (v: string) => void
  tags: GenieTag[]
  setTags: React.Dispatch<React.SetStateAction<GenieTag[]>>
  onSubmit: (v: string) => void
  className?: string
  /** Show the "Choose project" selector — only before a chat has started */
  showProject?: boolean
  /** Selected project name shown on the selector (defaults to "Choose project") */
  projectName?: string
  onChooseProject?: () => void
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
      projectLabel={showProject ? (projectName ?? true) : false}
      onChooseProject={onChooseProject}
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
