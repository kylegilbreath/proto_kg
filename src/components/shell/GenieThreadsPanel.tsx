"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DbIcon } from "@/components/ui/db-icon"
import { cn } from "@/lib/utils"
import {
  SidebarCollapseIcon,
  OverflowIcon,
  NewChatIcon,
  SlidersIcon,
  CalendarClockIcon,
  SyncIcon,
  SearchIcon,
  CheckIcon,
  ChevronRightIcon,
  FolderIcon,
} from "@/components/icons"

// ─── Types ────────────────────────────────────────────────────────────────────

type Thread = {
  id: string
  title: string
  preview: string
  time: string
  /** completed run — shows a green check before the title */
  done?: boolean
  /** e.g. "+8 · 2 assets" shown after the preview */
  meta?: string
  /** transient status shown instead of the preview (e.g. awaiting approval) */
  status?: string
}

type ThreadGroup = {
  label: string
  threads: Thread[]
}

// ─── Action rows ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ACTIONS: { id: string; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
  { id: "new-chat", label: "New chat", icon: NewChatIcon },
  { id: "schedules", label: "Schedules", icon: CalendarClockIcon },
  { id: "customizations", label: "Settings", icon: SlidersIcon },
  { id: "projects", label: "Projects", icon: FolderIcon },
  { id: "inbox", label: "ZeroOps Inbox", icon: SyncIcon, badge: 5 },
]

// ─── Mock data ────────────────────────────────────────────────────────────────

const GROUPS: ThreadGroup[] = [
  {
    label: "Pinned",
    threads: [
      {
        id: "p1",
        title: "Ontology and Knowledge Snippets Search",
        preview: "Search finds NFL ontology knowledge snippets",
        time: "Jun 23",
        done: true,
      },
    ],
  },
  {
    label: "Scheduled",
    threads: [],
  },
  {
    label: "Chats",
    threads: [
      { id: "c1", title: "Databricks Support for NFL Data Analysis", preview: "How can I get support for NFL data", time: "10h" },
      { id: "c2", title: "Execute SQL Query in Python and Print", preview: "can you executeCode with a sample python c…", time: "11h" },
      { id: "c3", title: "Python code example for SQL like query", preview: "can you executeCode with a sam…", time: "11h", meta: "+3 · 1 asset" },
      { id: "c4", title: "Importing and running a Fibonacci fu…", preview: "Created fib function file and tes…", time: "3d", meta: "+8 · 2 assets" },
      { id: "c5", title: "Create and run a Fibonacci function v…", preview: "create a test fib function in a fi…", time: "3d", done: true, meta: "+28 · 2 assets" },
      { id: "c6", title: "Searching for Ontology and Knowled…", preview: "find ontology/knowledge snippets", time: "3d" },
      { id: "c7", title: "NFL Data Exploration Plan Review an…", preview: "can you do some EDA on my nfl tables and sh…", time: "4d", done: true },
      { id: "c8", title: "Exploring NFL Fantasy Football Data I…", preview: "can you do some EDA on my nfl tables and sh…", time: "4d", done: true },
      { id: "c9", title: "Fantasy Football Analysis and Modeli…", preview: "What can you help me do? Discuss example t…", time: "4d", done: true },
      { id: "c10", title: "Notebook not found — source path d…", preview: "", time: "4d" },
      { id: "c11", title: "Create skill: test-skill", preview: "Created test skill with basic set…", time: "4d", done: true, meta: "+11 · 2 assets" },
      { id: "c12", title: "Example of askUserQuestions Tool wi…", preview: "", time: "4d" },
      { id: "c13", title: "Churn Prediction Demo Planning and …", preview: "can you show me an example plan", time: "5d" },
    ],
  },
]

// ─── Exported lookups (so the page can render a selected thread) ────────────────

export type GenieThread = Thread

/** Flat id → thread lookup across all groups. */
export const GENIE_THREADS: Record<string, GenieThread> = Object.fromEntries(
  GROUPS.flatMap((g) => g.threads).map((t) => [t.id, t]),
)

/** Parse a thread's "meta" (e.g. "+8 · 2 assets") into an asset count, or 0. */
export function threadAssetCount(thread: GenieThread | undefined): number {
  if (!thread?.meta) return 0
  const m = thread.meta.match(/(\d+)\s+assets?/)
  return m ? Number(m[1]) : 0
}

// ─── Thread row ───────────────────────────────────────────────────────────────

function ThreadRow({
  thread,
  active,
  onClick,
}: {
  thread: Thread
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-0.5 rounded px-2 py-1.5 text-left transition-colors",
        active ? "bg-primary/10" : "hover:bg-[var(--action-default-bg-hover)]",
      )}
    >
      <div className="flex items-center gap-1.5">
        {thread.done && (
          <CheckIcon size={12} className="shrink-0 text-[var(--success)]" />
        )}
        <span className={cn("flex-1 truncate text-sm", active ? "text-primary font-semibold" : "text-foreground")}>
          {thread.title}
        </span>
        {thread.status ? (
          <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
        ) : (
          <span className="shrink-0 text-hint text-muted-foreground">{thread.time}</span>
        )}
      </div>
      {thread.status ? (
        <span className="truncate text-hint text-primary">{thread.status}</span>
      ) : (
        thread.preview && (
          <div className="flex items-center gap-1 pl-0">
            <span className="truncate text-hint text-muted-foreground">{thread.preview}</span>
            {thread.meta && (
              <span className="shrink-0 text-hint text-[var(--success)]">{thread.meta}</span>
            )}
          </div>
        )
      )}
    </button>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface GenieThreadsPanelProps {
  activeThreadId?: string
  onSelectThread?: (id: string) => void
  onNewChat?: () => void
  /** Fired when an action row (schedules, customizations, projects, inbox) is clicked */
  onSelectAction?: (id: string) => void
  /** Highlight the action row with this id as active (e.g. "projects") */
  activeAction?: string
  /** Status label shown on the active thread (e.g. "Waiting for your approval") */
  activeStatus?: string
  className?: string
}

export function GenieThreadsPanel({
  activeThreadId,
  onSelectThread,
  onNewChat,
  onSelectAction,
  activeAction,
  activeStatus,
  className,
}: GenieThreadsPanelProps) {
  const [search, setSearch] = React.useState("")
  // Group headers (Pinned / Scheduled / Chats) are collapsible; start expanded.
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside className={cn("flex w-[280px] shrink-0 flex-col border-r border-border", className)}>
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center gap-2 px-3">
        <span className="flex-1 text-sm font-semibold text-foreground">Genie Code</span>
        <Button variant="ghost" size="icon-xs" aria-label="Collapse panel">
          <SidebarCollapseIcon size={16} className="text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label="More options">
          <OverflowIcon size={16} className="text-muted-foreground" />
        </Button>
      </div>

      {/* Action rows */}
      <div className="flex flex-col gap-0.5 px-3 pb-2">
        {ACTIONS.map((action) => {
          const active = activeAction === action.id
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.id === "new-chat" ? onNewChat : () => onSelectAction?.(action.id)}
              className={cn(
                "group flex h-8 items-center gap-2 rounded px-2 text-left text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-[var(--action-default-bg-hover)]",
              )}
            >
              <DbIcon icon={action.icon} size={16} className={active ? "text-primary" : "text-muted-foreground"} />
              <span className="flex-1 truncate">{action.label}</span>
              {action.badge != null && (
                <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground">
                  {action.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="h-8 bg-secondary pl-8"
          />
        </div>
      </div>

      {/* Thread groups — scrollable */}
      <div
        className={cn(
          "flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3",
          "[&::-webkit-scrollbar]:w-[5px]",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40",
        )}
      >
        {GROUPS.map((group) => {
          const threads = search
            ? group.threads.filter(
                (t) =>
                  t.title.toLowerCase().includes(search.toLowerCase()) ||
                  t.preview.toLowerCase().includes(search.toLowerCase()),
              )
            : group.threads
          if (search && threads.length === 0) return null
          // Search forces groups open so results are always visible.
          const isCollapsed = !search && !!collapsed[group.label]
          return (
            <div key={group.label} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="group/header flex h-6 w-full items-center rounded px-2 text-left transition-colors hover:bg-[var(--action-default-bg-hover)]"
              >
                <span className="text-xs font-normal text-muted-foreground">{group.label}</span>
                <ChevronRightIcon
                  size={12}
                  className={cn(
                    "ml-auto shrink-0 text-muted-foreground transition-all duration-150",
                    // Collapsed: always visible, points right.
                    // Expanded: hidden until hover, points down.
                    isCollapsed
                      ? "opacity-100"
                      : "rotate-90 opacity-0 group-hover/header:opacity-100",
                  )}
                />
              </button>
              {!isCollapsed &&
                (threads.length === 0 ? (
                  <span className="px-2 py-1 text-hint text-muted-foreground/70">None</span>
                ) : (
                  threads.map((thread) => {
                    const active = activeThreadId === thread.id
                    return (
                      <ThreadRow
                        key={thread.id}
                        thread={active && activeStatus ? { ...thread, status: activeStatus } : thread}
                        active={active}
                        onClick={() => onSelectThread?.(thread.id)}
                      />
                    )
                  })
                ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
