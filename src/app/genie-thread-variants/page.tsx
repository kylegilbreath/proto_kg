// ─── Genie thread variants ──────────────────────────────────────────────────
// Standalone comparison page (no AppShell chrome, full-bleed) for exploring how
// a Genie CODE THREAD renders its steps.
//
// Two independent axes:
//   • Left rail = Playground — global props that style the TOOL/STEP ITEMS inside
//     every thread. They do NOT touch density or collapse. Props:
//       - Tool UI mode: Minimal (flat inline line) · Contained (bordered card) ·
//         Mix (prose/thoughts inline, tools contained)
//       - Show Thoughts        — whether Thoughts lines appear
//       - Show status glyphs   — whether the trailing ✓/⚠/spinner shows
//   • Right = Option cards, differing by PROGRESS DENSITY (intrinsic per option,
//     never driven by the rail; each owns its own local expand/collapse state):
//       - A Full      every step, flat transcript
//       - B Phased    4 semantic collapsible phases
//       - C Summary   one live line, expand for the full transcript
//     All three render the same faithful EDA thread so the tool styling reads
//     comparably across densities.
//
// Linked from the Prototype Hub home page (PROTOTYPES array in src/app/page.tsx).

"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  NotebookIcon,
  CatalogIcon,
  SparkleDoubleFillIcon,
} from "@/components/icons"
import { DbIcon } from "@/components/ui/db-icon"
import { Button } from "@/components/ui/button"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { cn } from "@/lib/utils"

// ─── Playground props ─────────────────────────────────────────────────────────
// One state object styles the tool/step items in every card. These props DO NOT
// affect density or collapse — that is intrinsic to each option (see Density).

type ToolMode = "minimal" | "contained" | "mix"

type PlaygroundProps = {
  toolMode: ToolMode
  showThoughts: boolean
  // Master status toggle + independent success / failure children. When
  // showStatus is off, neither glyph shows regardless of the child flags.
  showStatus: boolean
  showSuccess: boolean
  showFailure: boolean
}

const DEFAULT_PROPS: PlaygroundProps = {
  toolMode: "minimal",
  showThoughts: true,
  showStatus: true,
  showSuccess: true,
  showFailure: true,
}

// ─── Density ────────────────────────────────────────────────────────────────
// Intrinsic to each option card. Never driven by the playground rail.

type Density = "full" | "phased" | "summary"

// ─── Thread model ─────────────────────────────────────────────────────────────
// A close replica of the NYC-taxi EDA thread in the screenshots: a run header,
// interleaved Thoughts lines, tool actions with real statuses, "N steps" group
// collapsers, prose summaries, and an asset disclosure.

type ToolStatus = "success" | "running" | "pendingOutput" | "failure" | "skipped"

// Matches the icon shape DbIcon accepts (Lucide + DuBois SVG components).
type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number | string; ariaLabel?: string }
>

type AssetRef = { label: string; icon: IconComponent }

// A step-group's hidden children are only thoughts and tools.
type StepChild =
  | { kind: "thoughts"; text: string }
  | { kind: "tool"; title: string; asset?: AssetRef; status: ToolStatus }

type ThreadItem =
  | { kind: "runHeader"; title: string; icon: IconComponent }
  | { kind: "userPrompt"; text: string; asset?: AssetRef }
  | { kind: "thoughts"; text: string }
  | { kind: "tool"; title: string; asset?: AssetRef; status: ToolStatus }
  // A step-group OWNS the thoughts/tools it hides. Collapsed → "N steps ▸".
  // Expanded → "N steps ▾" + children rendered inline. count === children.length.
  | { kind: "stepGroup"; children: StepChild[] }
  | { kind: "prose"; text: string }
  | { kind: "thinking" }

const TRIPS: AssetRef = { label: "trips", icon: CatalogIcon }
const NB: AssetRef = { label: "New Notebook 2026-08-27…", icon: NotebookIcon }

const THREAD: ThreadItem[] = [
  { kind: "runHeader", title: "NFL Combine Exploration", icon: NotebookIcon },
  { kind: "userPrompt", text: "Perform exploratory data analysis on", asset: TRIPS },
  {
    kind: "stepGroup",
    children: [
      { kind: "thoughts", text: "The user wants to perform exploratory data analysis on the samples.nyctaxi.trips table." },
      { kind: "tool", title: "Read skill", status: "success" },
      { kind: "thoughts", text: "The skill says I need to load temporal-validation.md since EDA on a trips table needs date scoping." },
      { kind: "tool", title: "Loaded skill details", status: "success" },
      { kind: "thoughts", text: "Now let me get the table schema and a sample of the data simultaneously." },
      { kind: "tool", title: "Read table structure", asset: TRIPS, status: "success" },
      { kind: "tool", title: "Sample NYC taxi trips data", status: "failure" },
      { kind: "thoughts", text: "The order by clause caused a timeout on a sample. I should try without sorting." },
      { kind: "tool", title: "Sample NYC taxi trips without sort", status: "failure" },
      { kind: "thoughts", text: "Interesting — even the simplest sample query is timing out. This might be a large Delta share." },
    ],
  },
  {
    kind: "prose",
    text: "The table is a large Delta Shared dataset. I have the schema — 6 columns: timestamps, trip distance, fare amount, and zip codes. I'll build the EDA notebook now with date-scoped queries for performance.",
  },
  {
    kind: "stepGroup",
    children: [
      { kind: "tool", title: "Created New Notebook 2026-08-27", asset: NB, status: "success" },
      { kind: "thoughts", text: "I'll add cells for schema, volume, temporal coverage, fare/distance distributions, and top routes." },
      { kind: "tool", title: "Edited", asset: NB, status: "success" },
      { kind: "tool", title: "Edited", asset: NB, status: "success" },
      { kind: "tool", title: "Edited", asset: NB, status: "success" },
    ],
  },
  { kind: "prose", text: "Now I'll run all code cells. I'll run the first few cells concurrently to warm up compute:" },
  {
    kind: "stepGroup",
    children: [
      { kind: "tool", title: "Edited", asset: NB, status: "success" },
      { kind: "tool", title: "Edited", asset: NB, status: "success" },
    ],
  },
  {
    kind: "prose",
    text: "The table has 21,932 trips (Jan–Feb 2016), 128 pickup zips, 0 null distance/fare. Now running the remaining analysis cells:",
  },
  {
    kind: "stepGroup",
    children: [
      { kind: "tool", title: "Ran 9 cells", asset: NB, status: "success" },
      { kind: "thoughts", text: "All cells returned. Let me verify the outputs look right before summarizing." },
    ],
  },
  { kind: "prose", text: "All cells ran successfully. Now renaming the notebook:" },
  { kind: "tool", title: "Renamed \"NFL Combine Exploration\" to \"NYC Taxi Trips EDA\"", status: "success" },
  {
    kind: "prose",
    text: "All 9 analysis cells are built and executed. Here's a summary of findings from NYC Taxi Trips EDA:",
  },
]

// ─── Phases (Option B) ────────────────────────────────────────────────────────
// Hand-authored semantic grouping of THREAD. runHeader (0) + userPrompt (1) sit
// above the phases; each phase is a [start, end] inclusive index range into
// THREAD. `steps` is the human-facing count shown in the header.

const PHASE_INTRO_COUNT = 2 // runHeader + userPrompt render above phases

type Phase = { label: string; start: number; end: number; steps: number }

const PHASES: Phase[] = [
  { label: "Understanding the table", start: 2, end: 3, steps: 10 },
  { label: "Building the EDA notebook", start: 4, end: 5, steps: 5 },
  { label: "Running analysis cells", start: 6, end: 9, steps: 4 },
  { label: "Finishing up", start: 10, end: 11, steps: 2 },
]

// ─── Status glyph ─────────────────────────────────────────────────────────────
// Mirrors the real Tool action states: success ✓, running/pendingOutput spinner,
// failure ⚠, skipped redo. Colors use DuBois tokens.

function StatusGlyph({ status, size = 16 }: { status: ToolStatus; size?: number }) {
  if (status === "success") return <CheckIcon size={size} className="text-[var(--success)]" />
  if (status === "running" || status === "pendingOutput")
    return (
      <span
        className="inline-block shrink-0 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
        style={{ width: size, height: size }}
        aria-label="Running"
      />
    )
  if (status === "failure")
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--warning)] text-[var(--warning)]"
        style={{ width: size, height: size, fontSize: size * 0.72 }}
        aria-label="Warning"
      >
        !
      </span>
    )
  // skipped
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center text-[var(--warning)]"
      style={{ width: size, height: size, fontSize: size * 0.9 }}
      aria-label="Skipped"
    >
      ↻
    </span>
  )
}

function AssetChip({ asset }: { asset: AssetRef }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground align-middle">
      <DbIcon icon={asset.icon} size={12} className="text-muted-foreground" />
      {asset.label}
    </span>
  )
}

// ─── Tool action renderer ─────────────────────────────────────────────────────
// The heart of the exploration. One tool item, rendered in the current mode.

// Whether a given status's glyph should show, given the master + child toggles.
// success/skipped → gated by showSuccess; failure → gated by showFailure;
// running/pendingOutput are progress, shown whenever the master is on.
function glyphVisible(status: ToolStatus, props: PlaygroundProps): boolean {
  if (!props.showStatus) return false
  if (status === "failure") return props.showFailure
  if (status === "success" || status === "skipped") return props.showSuccess
  return true // running / pendingOutput
}

function ToolAction({
  title,
  asset,
  status,
  props,
}: {
  title: string
  asset?: AssetRef
  status: ToolStatus
  props: PlaygroundProps
}) {
  // In "mix", tool actions render as contained cards (prose/thoughts stay inline).
  const contained = props.toolMode === "contained" || props.toolMode === "mix"
  const showGlyph = glyphVisible(status, props)

  if (!contained) {
    // Minimal: flat grey inline line + trailing status glyph
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="min-w-0 truncate">{title}</span>
        {asset && <AssetChip asset={asset} />}
        {showGlyph && <span className="ml-auto shrink-0"><StatusGlyph status={status} size={16} /></span>}
      </div>
    )
  }

  // Contained: bordered "Tool action" card — leading chevron, title, trailing status
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2.5 text-sm">
      <ChevronRightIcon size={14} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-foreground">{title}</span>
      {asset && <AssetChip asset={asset} />}
      {showGlyph && <span className="ml-auto shrink-0"><StatusGlyph status={status} size={16} /></span>}
    </div>
  )
}

// ─── Step group ───────────────────────────────────────────────────────────────
// Owns the thoughts/tools it hides. Collapsed → "N steps ▸". Expanded → "N steps
// ▾" + children rendered inline, indented under a hairline. Default collapsed.

function StepGroup({
  steps,
  props,
}: {
  steps: StepChild[]
  props: PlaygroundProps
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-2.5">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="h-auto w-fit justify-start gap-1 px-1 py-0.5 text-sm font-normal text-muted-foreground hover:text-foreground"
      >
        {steps.length} steps
        <ChevronRightIcon size={14} className={cn("transition-transform", open && "rotate-90")} />
      </Button>
      {open && (
        <div className="ml-2 flex flex-col gap-2.5 border-l border-border pl-3">
          {steps.map((child, i) => (
            <ThreadItemView key={i} item={child} props={props} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Thread renderer ──────────────────────────────────────────────────────────

function ThreadItemView({ item, props }: { item: ThreadItem; props: PlaygroundProps }) {
  switch (item.kind) {
    case "runHeader":
      return (
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-border" />
          <span className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-sm text-foreground">
            <DbIcon icon={item.icon} size={14} className="text-muted-foreground" />
            {item.title}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
      )
    case "userPrompt":
      return (
        <div className="flex justify-end">
          <span className="max-w-[85%] rounded-md bg-primary/10 px-3 py-2 text-sm text-foreground">
            {item.text} {item.asset && <AssetChip asset={item.asset} />}
          </span>
        </div>
      )
    case "thoughts":
      if (!props.showThoughts) return null
      return (
        <div className="flex items-start gap-1 text-sm text-muted-foreground">
          <span className="min-w-0 truncate">
            <span className="font-semibold">Thoughts:</span> {item.text}
          </span>
          <ChevronRightIcon size={14} className="mt-0.5 shrink-0" />
        </div>
      )
    case "tool":
      return (
        <ToolAction
          title={item.title}
          asset={item.asset}
          status={item.status}
          props={props}
        />
      )
    case "stepGroup":
      return <StepGroup steps={item.children} props={props} />
    case "prose":
      return <p className="text-sm leading-5 text-foreground">{item.text}</p>
    case "thinking":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DbIcon icon={SparkleDoubleFillIcon} color="ai" size={16} />
          Thinking …
        </div>
      )
  }
}

// Render a contiguous slice of THREAD items.
function ThreadItems({
  from,
  to,
  props,
}: {
  from: number
  to: number
  props: PlaygroundProps
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {THREAD.slice(from, to + 1).map((item, i) => (
        <ThreadItemView key={from + i} item={item} props={props} />
      ))}
    </div>
  )
}

// ─── Density: Full (Option A) ─────────────────────────────────────────────────
// Every step, flat. The unabridged transcript.

function ThreadFull({ props }: { props: PlaygroundProps }) {
  return <ThreadItems from={0} to={THREAD.length - 1} props={props} />
}

// ─── Density: Phased (Option B) ───────────────────────────────────────────────
// runHeader + userPrompt render above; the rest collapses into 4 named phases,
// each expandable in place. Each card owns its own open/closed state.

function ThreadPhased({ props }: { props: PlaygroundProps }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <div className="flex flex-col gap-2.5">
      <ThreadItems from={0} to={PHASE_INTRO_COUNT - 1} props={props} />
      {PHASES.map((phase, i) => {
        const isOpen = open[i] ?? false
        return (
          <div key={phase.label} className="flex flex-col gap-2.5">
            <Button
              variant="ghost"
              onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
              className="h-auto w-full justify-start gap-2 px-1 py-1 text-sm font-normal text-foreground"
            >
              <ChevronRightIcon
                size={14}
                className={cn("shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")}
              />
              <span className="min-w-0 truncate">{phase.label}</span>
              <span className="ml-auto shrink-0 text-hint text-muted-foreground">{phase.steps} steps</span>
            </Button>
            {isOpen && (
              <div className="ml-2 border-l border-border pl-3">
                <ThreadItems from={phase.start} to={phase.end} props={props} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Density: Summary (Option C) ──────────────────────────────────────────────
// One live line + "show steps" disclosure. Expanded → the full transcript.

function ThreadSummary({ props }: { props: PlaygroundProps }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex flex-col gap-2.5">
      <ThreadItems from={0} to={PHASE_INTRO_COUNT - 1} props={props} />
      <div className="flex items-center gap-2 text-sm text-foreground">
        <StatusGlyph status="running" size={16} />
        <span className="min-w-0 truncate">Analyzing trips — building the EDA notebook…</span>
      </div>
      <Button
        variant="ghost"
        onClick={() => setExpanded((e) => !e)}
        className="h-auto w-fit justify-start gap-1 px-1 py-0.5 text-sm font-normal text-muted-foreground hover:text-foreground"
      >
        {expanded ? "Hide steps" : "Show steps"}
        <ChevronRightIcon
          size={14}
          className={cn("transition-transform", expanded && "rotate-90")}
        />
      </Button>
      {expanded && (
        <div className="border-t border-border pt-2.5">
          <ThreadItems from={PHASE_INTRO_COUNT} to={THREAD.length - 1} props={props} />
        </div>
      )}
    </div>
  )
}

function Thread({ density, props }: { density: Density; props: PlaygroundProps }) {
  if (density === "phased") return <ThreadPhased props={props} />
  if (density === "summary") return <ThreadSummary props={props} />
  return <ThreadFull props={props} />
}

// ─── Composer ─────────────────────────────────────────────────────────────────
// Pinned to the bottom of every option card. Faithful to the real Genie code
// composer: leading +, placeholder hint, trailing model selector + send. Non-
// functional (a prototype affordance), so the field is a static styled shell.

function ThreadComposer() {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="rounded-md border border-border bg-background px-3 pb-2 pt-2.5">
        <div className="text-sm text-muted-foreground">
          @ for objects, / for commands, ↑↓ for history
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Button variant="ghost" size="icon-xs" aria-label="Add context">
            <Plus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 px-2 text-sm font-normal text-muted-foreground"
            >
              Auto
              <ChevronDownIcon size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Send"
              className="rounded-full bg-muted text-muted-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <p className="text-center text-hint text-muted-foreground">
        Always review the accuracy of responses.
      </p>
    </div>
  )
}

// ─── Option card ──────────────────────────────────────────────────────────────
// Same thread + shared tool-styling props; density is intrinsic per option.
// Thread scrolls; the composer stays pinned at the bottom.

function OptionCard({
  label,
  caption,
  density,
  props,
}: {
  label: string
  caption: string
  density: Density
  props: PlaygroundProps
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-hint text-muted-foreground">{caption}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-md border border-border bg-background p-4">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <Thread density={density} props={props} />
        </div>
        <ThreadComposer />
      </div>
    </div>
  )
}

// ─── Playground rail ──────────────────────────────────────────────────────────

function ToggleRow({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", disabled && "opacity-50")}>
      <Label htmlFor={id} className="text-sm font-normal text-foreground">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

function PlaygroundRail({
  props,
  setProps,
}: {
  props: PlaygroundProps
  setProps: (p: PlaygroundProps) => void
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-secondary/40 px-5 py-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">Playground</span>
        <span className="text-hint text-muted-foreground">
          Styles the tool &amp; step items in all options. Density is fixed per option.
        </span>
      </div>

      {/* Tool UI mode */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tool UI</span>
        <SegmentedControl
          value={props.toolMode}
          onValueChange={(v) => setProps({ ...props, toolMode: v as ToolMode })}
        >
          <SegmentedItem value="minimal">Minimal</SegmentedItem>
          <SegmentedItem value="contained">Contained</SegmentedItem>
          <SegmentedItem value="mix">Mix</SegmentedItem>
        </SegmentedControl>
        <span className="text-hint text-muted-foreground">
          {props.toolMode === "minimal" && "Flat inline step lines."}
          {props.toolMode === "contained" && "Every tool in its own container."}
          {props.toolMode === "mix" && "Prose inline, tools contained."}
        </span>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Options</span>
        <ToggleRow
          id="show-thoughts"
          label="Show Thoughts"
          checked={props.showThoughts}
          onChange={(v) => setProps({ ...props, showThoughts: v })}
        />
        <ToggleRow
          id="show-status"
          label="Show status glyphs"
          checked={props.showStatus}
          onChange={(v) => setProps({ ...props, showStatus: v })}
        />
        {/* Child toggles — indented under the master; disabled when master off */}
        <div className="ml-3 flex flex-col gap-3 border-l border-border pl-3">
          <ToggleRow
            id="show-success"
            label="Successes"
            checked={props.showSuccess}
            onChange={(v) => setProps({ ...props, showSuccess: v })}
            disabled={!props.showStatus}
          />
          <ToggleRow
            id="show-failure"
            label="Failures & warnings"
            checked={props.showFailure}
            onChange={(v) => setProps({ ...props, showFailure: v })}
            disabled={!props.showStatus}
          />
        </div>
      </div>
    </aside>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GenieThreadVariants() {
  const [props, setProps] = useState<PlaygroundProps>(DEFAULT_PROPS)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-1 text-hint text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Hub
          </Link>
          <span className="text-muted-foreground/40 select-none">|</span>
          <DatabricksLogo height={16} />
          <span className="text-muted-foreground/40 select-none">|</span>
          <span className="text-sm text-muted-foreground">Genie thread — steps & progress</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <PlaygroundRail props={props} setProps={setProps} />

        <main className="flex-1 overflow-hidden px-8 py-8">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
            <p className="shrink-0 text-sm text-muted-foreground">
              Each card renders the same EDA thread at a different progress density. The Playground
              on the left styles the tool &amp; step items across all three.
            </p>
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-3">
              <OptionCard label="Option A" caption="Full — every step, flat" density="full" props={props} />
              <OptionCard label="Option B" caption="Phased — 4 collapsible phases" density="phased" props={props} />
              <OptionCard label="Option C" caption="Summary — one line, expand for detail" density="summary" props={props} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
