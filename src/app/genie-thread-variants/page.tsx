// ─── Genie thread variants ──────────────────────────────────────────────────
// Standalone comparison page (no AppShell chrome, full-bleed) for exploring how
// a Genie CODE THREAD renders its reasoning and steps while it streams.
//
//   • Transport = Restart · Play/Pause · speed · scrubber. The thread replays on
//     a real clock: every thought / tool / prose line has a duration (ms), text
//     streams in character by character, and tools spin until they resolve.
//   • Left rail = Proposal Playground — props that apply to EVERY card: tool UI mode,
//     step density (flat vs one at a time; Proposed only, Today is always flat),
//     thoughts / status visibility,
//     repeated-tool grouping, and the Proposed loader's escalation thresholds.
//     Rail state is mirrored into URL params so a setup can be shared as a link;
//     the Summary block at the top of the rail describes it in words.
//   • Right = Option cards, differing only in how REASONING renders:
//       - Today       faithful to universe NativeThinking: the active thought
//                     streams inline under "Thinking…", then auto-collapses to
//                     "Thoughts: <first line>".
//       - Proposed    thoughts collapsed by default; while thinking, a loader
//                     whose label escalates (Thinking → Still thinking → Taking
//                     longer) plus a live timer; "Thought" when done.
//     Runs of steps fold into "N steps" once prose follows them (FoldedToolCalls).
//
// Linked from the Prototype Hub home page (PROTOTYPES array in src/app/page.tsx).

"use client"

import { Suspense, useState, useEffect, useRef, useId, useMemo, createContext, useContext } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Link2,
  Check,
} from "lucide-react"
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  NotebookIcon,
  CatalogIcon,
  DangerIcon,
  CalendarClockIcon,
  DecimalIcon,
  HashIcon,
  CopyIcon,
  DownloadIcon,
} from "@/components/icons"
import { DbIcon } from "@/components/ui/db-icon"
import { Button } from "@/components/ui/button"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Playground props ─────────────────────────────────────────────────────────
// One state object styles the steps in every card. Reasoning treatment is the
// only thing intrinsic to each option (see Options).

// combined = every run of steps (thoughts + tools) shares one card, one row per
// step with dividers between; repeated tools expand in place as indented rows.
type ToolMode = "minimal" | "contained" | "mix" | "combined"

// flat  = every revealed step of a streaming run shows, as a flat list.
// focus = only the live (newest) step shows; finished steps roll up behind an
//         expandable "N steps" header above it.
type Density = "flat" | "focus"

type PlaygroundProps = {
  toolMode: ToolMode
  density: Density
  showThoughts: boolean
  // Master status toggle + independent success / failure children. When
  // showStatus is off, neither glyph shows regardless of the child flags.
  showStatus: boolean
  showSuccess: boolean
  showFailure: boolean
  // Count finished steps in the focus roll-up header ("3 steps" vs "Previous steps").
  showCompletedCount: boolean
  // Collapse consecutive same-title tool calls into one "×N" expandable row.
  groupRepeatedTools: boolean
  // Live elapsed-seconds readout left of a running tool's spinner.
  showToolTimer: boolean
  // Expanded step lists ("N steps", "×N") sit in an indented left-rule
  // container. Proposed only; Today is always flush.
  indentSteps: boolean
  // Proposed loader escalation thresholds, in seconds of thinking.
  stillThinkingAfter: number
  takingLongerAfter: number
}

const DEFAULT_PROPS: PlaygroundProps = {
  toolMode: "minimal",
  density: "flat",
  showThoughts: true,
  showStatus: true,
  showSuccess: true,
  showFailure: true,
  showCompletedCount: true,
  groupRepeatedTools: true,
  showToolTimer: true,
  indentSteps: true,
  stillThinkingAfter: 5,
  takingLongerAfter: 15,
}

const TOOL_MODE_LABEL: Record<ToolMode, string> = {
  minimal: "Minimal",
  contained: "Contained",
  mix: "Mix",
  combined: "Combined",
}

// ─── Options ──────────────────────────────────────────────────────────────────

type Variant = "today" | "proposed"

type OptionDef = { variant: Variant; name: string; caption: string }

const OPTIONS: OptionDef[] = [
  {
    variant: "today",
    name: "Today",
    caption: "Current. The active thought streams inline, then collapses to a one-line preview.",
  },
  {
    variant: "proposed",
    name: "Proposed",
    caption: "Thoughts collapsed by default. Escalating loader and live timer while thinking.",
  },
]

// ─── URL state ────────────────────────────────────────────────────────────────
// Rail props + hidden cards round-trip through short query params so a setup
// can be shared as a link. Only values that differ from the defaults are written.

const PARAM_KEYS: Record<keyof PlaygroundProps, string> = {
  toolMode: "tool",
  density: "density",
  showThoughts: "thoughts",
  showStatus: "status",
  showSuccess: "success",
  showFailure: "failure",
  showCompletedCount: "count",
  groupRepeatedTools: "group",
  showToolTimer: "timer",
  indentSteps: "indent",
  stillThinkingAfter: "still",
  takingLongerAfter: "longer",
}

const PROP_KEYS = Object.keys(PARAM_KEYS) as (keyof PlaygroundProps)[]

function encodeState(props: PlaygroundProps, hidden: Variant[]): string {
  const q = new URLSearchParams()
  for (const key of PROP_KEYS) {
    const v = props[key]
    if (v === DEFAULT_PROPS[key]) continue
    q.set(PARAM_KEYS[key], typeof v === "boolean" ? (v ? "1" : "0") : String(v))
  }
  if (hidden.length) q.set("hide", hidden.join(","))
  return q.toString()
}

function decodeState(search: string): { props: PlaygroundProps; hidden: Variant[] } {
  const q = new URLSearchParams(search)
  const out: Record<string, unknown> = { ...DEFAULT_PROPS }
  for (const key of PROP_KEYS) {
    const raw = q.get(PARAM_KEYS[key])
    if (raw === null) continue
    const fallback = DEFAULT_PROPS[key]
    if (typeof fallback === "boolean") out[key] = raw === "1"
    else if (typeof fallback === "number") {
      const n = Number(raw)
      if (Number.isFinite(n) && n > 0) out[key] = n
    } else out[key] = raw
  }
  const props = out as PlaygroundProps
  if (!(props.toolMode in TOOL_MODE_LABEL)) props.toolMode = DEFAULT_PROPS.toolMode
  if (props.density !== "flat" && props.density !== "focus") props.density = DEFAULT_PROPS.density
  const hidden = (q.get("hide") ?? "")
    .split(",")
    .filter((v): v is Variant => OPTIONS.some((o) => o.variant === v))
  return { props, hidden }
}

// ─── Setup summary ────────────────────────────────────────────────────────────
// Plain-language readout of the combined rail state. Rows that differ from the
// defaults are flagged so a shared link reads at a glance.

function statusSummary(p: PlaygroundProps): string {
  if (!p.showStatus) return "Hidden"
  if (p.showSuccess && p.showFailure) return "Success + failure"
  if (p.showSuccess) return "Success only"
  if (p.showFailure) return "Failure only"
  return "Running only"
}

type SummaryRow = { label: string; value: string; changed: boolean }

function summarize(p: PlaygroundProps): SummaryRow[] {
  const d = DEFAULT_PROPS
  const rows: SummaryRow[] = [
    { label: "Tool UI", value: TOOL_MODE_LABEL[p.toolMode], changed: p.toolMode !== d.toolMode },
    {
      label: "Density",
      value: p.density === "flat" ? "Flat" : "One at a time",
      changed: p.density !== d.density,
    },
  ]
  if (p.density === "focus")
    rows.push({
      label: "Roll-up count",
      value: p.showCompletedCount ? "On" : "Off",
      changed: p.showCompletedCount !== d.showCompletedCount,
    })
  rows.push(
    { label: "Thoughts", value: p.showThoughts ? "Shown" : "Hidden", changed: p.showThoughts !== d.showThoughts },
    { label: "Status", value: statusSummary(p), changed: statusSummary(p) !== statusSummary(d) },
    {
      label: "Repeated tools",
      value: p.groupRepeatedTools ? "Grouped" : "Separate",
      changed: p.groupRepeatedTools !== d.groupRepeatedTools,
    },
    { label: "Tool timer", value: p.showToolTimer ? "On" : "Off", changed: p.showToolTimer !== d.showToolTimer },
    { label: "Step indent", value: p.indentSteps ? "Indented" : "Flush", changed: p.indentSteps !== d.indentSteps },
    {
      label: "Proposed loader",
      value: `${p.stillThinkingAfter}s / ${p.takingLongerAfter}s`,
      changed:
        p.stillThinkingAfter !== d.stillThinkingAfter || p.takingLongerAfter !== d.takingLongerAfter,
    },
  )
  return rows
}

// ─── Thread model ─────────────────────────────────────────────────────────────
// A close replica of the NYC-taxi EDA thread: a run header, interleaved Thoughts,
// tool actions with real statuses, step runs, prose summaries, and asset chips.
// `ms` is how long each atom takes on the replay clock (thoughts and prose
// stream over it; tools spin for it). A few thoughts run past 15s on purpose so
// the Proposed loader escalates all the way.

type ToolStatus = "success" | "running" | "pendingOutput" | "failure" | "skipped"

// Matches the icon shape DbIcon accepts (Lucide + DuBois SVG components).
type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number | string; ariaLabel?: string }
>

type AssetRef = { label: string; icon: IconComponent }

// Expandable body of a query tool: the SQL it ran, plus its result on success
// or an error line on failure. Tools without a detail have nothing to expand.
type ColumnType = "timestamp" | "double" | "int"
type QueryResult = { columns: { name: string; type: ColumnType }[]; rows: string[][] }
type ToolDetail = { sql: string; result?: QueryResult; error?: string }

// A step run's children are only thoughts and tools.
type StepChild =
  | { kind: "thoughts"; text: string; ms: number }
  | {
      kind: "tool"
      title: string
      asset?: AssetRef
      status: ToolStatus
      ms: number
      detail?: ToolDetail
    }

type ThreadItem =
  | { kind: "runHeader"; title: string; icon: IconComponent }
  | { kind: "userPrompt"; text: string; asset?: AssetRef }
  | StepChild
  // A run of steps between prose lines. Folds into "N steps" once prose follows.
  | { kind: "stepGroup"; children: StepChild[] }
  | { kind: "prose"; text: string; ms: number }

const TRIPS: AssetRef = { label: "trips", icon: CatalogIcon }
const NB: AssetRef = { label: "New Notebook 2026-08-27…", icon: NotebookIcon }

const SAMPLE_SORTED_SQL = `SELECT
  *
FROM
  samples.nyctaxi.trips
ORDER BY
  tpep_pickup_datetime DESC
LIMIT 10`

const SAMPLE_SQL = `SELECT
  *
FROM
  samples.nyctaxi.trips
LIMIT 10`

const SAMPLE_RESULT: QueryResult = {
  columns: [
    { name: "tpep_pickup_datetime", type: "timestamp" },
    { name: "tpep_dropoff_datetime", type: "timestamp" },
    { name: "trip_distance", type: "double" },
    { name: "fare_amount", type: "double" },
    { name: "pickup_zip", type: "int" },
    { name: "dropoff_zip", type: "int" },
  ],
  rows: [
    ["2016-02-16T22:40:45.000+00:00", "2016-02-16T22:59:25.000+00:00", "5.35", "18.5", "10003", "11238"],
    ["2016-02-05T16:06:44.000+00:00", "2016-02-05T16:26:03.000+00:00", "6.5", "21.5", "10282", "10001"],
    ["2016-02-08T07:39:25.000+00:00", "2016-02-08T07:44:14.000+00:00", "0.9", "5.5", "10119", "10003"],
    ["2016-02-29T22:25:33.000+00:00", "2016-02-29T22:38:09.000+00:00", "3.5", "13.5", "10001", "11222"],
    ["2016-02-03T17:21:02.000+00:00", "2016-02-03T17:23:24.000+00:00", "0.3", "3.5", "10028", "10028"],
    ["2016-02-19T12:48:30.000+00:00", "2016-02-19T13:04:41.000+00:00", "2.1", "11.0", "10016", "10022"],
    ["2016-02-11T08:15:12.000+00:00", "2016-02-11T08:33:50.000+00:00", "4.2", "16.0", "10025", "10011"],
    ["2016-02-24T19:02:57.000+00:00", "2016-02-24T19:09:36.000+00:00", "1.1", "6.5", "10014", "10012"],
    ["2016-02-06T01:37:18.000+00:00", "2016-02-06T01:58:02.000+00:00", "8.7", "26.0", "10036", "11211"],
    ["2016-02-13T14:22:40.000+00:00", "2016-02-13T14:31:15.000+00:00", "1.6", "8.0", "10065", "10021"],
  ],
}

const THREAD: ThreadItem[] = [
  { kind: "runHeader", title: "NFL Combine Exploration", icon: NotebookIcon },
  { kind: "userPrompt", text: "Perform exploratory data analysis on", asset: TRIPS },
  {
    kind: "stepGroup",
    children: [
      {
        kind: "thoughts",
        ms: 18000,
        text: "The user wants to perform exploratory data analysis on the samples.nyctaxi.trips table.\nBefore I touch the data I should check whether there's a relevant skill that governs how EDA on a trips table ought to be done — column conventions, date scoping, and any performance caveats for large Delta shares. Let me read the available skills first so I follow the established pattern rather than improvising queries that might time out or miss required temporal validation.",
      },
      { kind: "tool", title: "Read skill", status: "success", ms: 3000 },
      {
        kind: "thoughts",
        ms: 6000,
        text: "The skill says I need to load temporal-validation.md since EDA on a trips table needs date scoping.\nWithout it I'd risk scanning the full history of the share on every query.",
      },
      { kind: "tool", title: "Loaded skill details", status: "success", ms: 2500 },
      { kind: "thoughts", ms: 4000, text: "Now let me get the table schema and a sample of the data simultaneously." },
      { kind: "tool", title: "Read table structure", asset: TRIPS, status: "success", ms: 3500 },
      {
        kind: "tool",
        title: "Sample NYC taxi trips data",
        status: "failure",
        ms: 6000,
        detail: { sql: SAMPLE_SORTED_SQL, error: "Query timed out. No rows returned." },
      },
      {
        kind: "thoughts",
        ms: 7000,
        text: "The order by clause caused a timeout on a sample. I should try without sorting.\nSorting forces a full shuffle before any rows come back, which is expensive on a table this size.",
      },
      {
        kind: "tool",
        title: "Sample NYC taxi trips without sort",
        status: "success",
        ms: 17000,
        detail: { sql: SAMPLE_SQL, result: SAMPLE_RESULT },
      },
      {
        kind: "thoughts",
        ms: 16000,
        text: "The unsorted sample came back, so the ORDER BY was the problem. This looks like a large Delta share.\nIf the table is shared from another metastore, a sort forces a full scan over the wire with no local data skipping, while a plain LIMIT can stop early. I have the schema and real sample rows now, so I'll build date-scoped queries into the notebook so each cell only touches a narrow window.",
      },
    ],
  },
  {
    kind: "prose",
    ms: 4000,
    text: "The table is a large Delta Shared dataset. I have the schema — 6 columns: timestamps, trip distance, fare amount, and zip codes. I'll build the EDA notebook now with date-scoped queries for performance.",
  },
  {
    kind: "stepGroup",
    children: [
      { kind: "tool", title: "Created New Notebook 2026-08-27", asset: NB, status: "success", ms: 3000 },
      {
        kind: "thoughts",
        ms: 8000,
        text: "I'll add cells for schema, volume, temporal coverage, fare/distance distributions, and top routes.\nEach query gets an explicit pickup-date filter so it stays inside the validated window.",
      },
      { kind: "tool", title: "Edited", asset: NB, status: "failure", ms: 3000 },
      { kind: "tool", title: "Edited", asset: NB, status: "success", ms: 2500 },
      { kind: "tool", title: "Edited", asset: NB, status: "success", ms: 2500 },
    ],
  },
  {
    kind: "prose",
    ms: 3000,
    text: "Now I'll run all code cells. I'll run the first few cells concurrently to warm up compute:",
  },
  {
    kind: "stepGroup",
    children: [
      { kind: "tool", title: "Edited", asset: NB, status: "success", ms: 2500 },
      { kind: "tool", title: "Edited", asset: NB, status: "success", ms: 2500 },
    ],
  },
  {
    kind: "prose",
    ms: 3500,
    text: "The table has 21,932 trips (Jan–Feb 2016), 128 pickup zips, 0 null distance/fare. Now running the remaining analysis cells:",
  },
  {
    kind: "stepGroup",
    children: [
      { kind: "tool", title: "Ran 9 cells", asset: NB, status: "success", ms: 9000 },
      { kind: "thoughts", ms: 5000, text: "All cells returned. Let me verify the outputs look right before summarizing." },
    ],
  },
  { kind: "prose", ms: 2500, text: "All cells ran successfully. Now renaming the notebook:" },
  {
    kind: "tool",
    title: "Renamed \"NFL Combine Exploration\" to \"NYC Taxi Trips EDA\"",
    status: "success",
    ms: 2000,
  },
  {
    kind: "prose",
    ms: 3000,
    text: "All 9 analysis cells are built and executed. Here's a summary of findings from NYC Taxi Trips EDA:",
  },
]

// ─── Timeline ─────────────────────────────────────────────────────────────────
// Every revealable atom (each top-level item, and each child of a step run) gets
// a start/end on one shared clock, in playback order. A thought stays "active"
// (the live Thinking state) until the next atom starts, like NativeThinking's
// "no following content yet". Hidden thoughts are skipped entirely so they cost
// no time.

const GAP_MS = 500 // pause between atoms
const PROMPT_MS = 1000 // beat after the user prompt before Genie starts

function topKey(i: number) {
  return String(i)
}
function childKey(parent: number, child: number) {
  return `${parent}.${child}`
}

type Atom = { start: number; end: number; activeEnd: number }
type Timeline = { atoms: Record<string, Atom>; total: number }

function buildTimeline(showThoughts: boolean): Timeline {
  const atoms: Record<string, Atom> = {}
  const order: string[] = []
  let t = 0
  const add = (key: string, ms: number) => {
    atoms[key] = { start: t, end: t + ms, activeEnd: t + ms }
    order.push(key)
    if (ms) t += ms + GAP_MS
  }
  THREAD.forEach((item, i) => {
    if (item.kind === "stepGroup") {
      item.children.forEach((child, c) => {
        if (showThoughts || child.kind !== "thoughts") add(childKey(i, c), child.ms)
      })
      return
    }
    if (item.kind === "thoughts" && !showThoughts) return
    add(topKey(i), item.kind === "runHeader" ? 0 : item.kind === "userPrompt" ? PROMPT_MS : item.ms)
  })
  order.forEach((key, n) => {
    const next = order[n + 1]
    if (next) atoms[key].activeEnd = atoms[next].start
  })
  return { atoms, total: t }
}

type TimelineState = { now: number; atoms: Record<string, Atom> }

const TimelineContext = createContext<TimelineState>({ now: Infinity, atoms: {} })
const useTimeline = () => useContext(TimelineContext)

// Atoms without an entry (containers) are always visible / settled.
function isVisible(tl: TimelineState, key: string): boolean {
  const a = tl.atoms[key]
  return !a || tl.now >= a.start
}

// A tool has finished running and can show its final status.
function isSettled(tl: TimelineState, key: string): boolean {
  const a = tl.atoms[key]
  return !a || tl.now >= a.end
}

// A thought is the live Thinking state.
function isActive(tl: TimelineState, key: string): boolean {
  const a = tl.atoms[key]
  return !!a && tl.now >= a.start && tl.now < a.activeEnd
}

// The portion of `text` streamed so far.
function streamedText(tl: TimelineState, key: string, text: string): string {
  const a = tl.atoms[key]
  if (!a || a.end <= a.start) return text
  const f = Math.min(1, Math.max(0, (tl.now - a.start) / (a.end - a.start)))
  return text.slice(0, Math.floor(f * text.length))
}

function elapsedSec(tl: TimelineState, key: string): number {
  const a = tl.atoms[key]
  return a ? Math.max(0, (tl.now - a.start) / 1000) : 0
}

// ─── Playback ─────────────────────────────────────────────────────────────────
// A requestAnimationFrame clock over the timeline. Plays on load, stops at the
// end (so the settled thread stays put; `playing` is derived, so reaching the
// end halts the loop), and pauses its own advance while the scrubber is held. `runId` bumps on Restart so cards remount with fresh
// expand/collapse state.

const SPEEDS = [1, 2, 4, 8] as const

function usePlayback(total: number) {
  const [now, setNow] = useState(0)
  const [wantPlaying, setWantPlaying] = useState(true)
  const playing = wantPlaying && now < total
  const [speed, setSpeed] = useState(1)
  const [runId, setRunId] = useState(0)
  const scrubbing = useRef(false)

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const step = (ts: number) => {
      const dt = ts - last
      last = ts
      if (!scrubbing.current) setNow((n) => Math.min(total, n + dt * speed))
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, total])

  const restart = () => {
    setNow(0)
    setRunId((r) => r + 1)
    setWantPlaying(true)
  }
  const toggle = () => {
    if (now >= total) restart()
    else setWantPlaying(!playing)
  }
  const seek = (ms: number) => setNow(Math.min(total, Math.max(0, ms)))
  const setScrubbing = (v: boolean) => {
    scrubbing.current = v
  }

  return { now: Math.min(now, total), playing, speed, runId, setSpeed, restart, toggle, seek, setScrubbing }
}

// ─── Genie mark ───────────────────────────────────────────────────────────────
// Port of universe's GenieCodeAnimatingIcon (notebook/common/assistant) — the
// Genie Code lamp glyph in the AI gradient. `animated` spins the star around its
// center (8,5) at 2.4s linear, matching the ThinkingState / NativeThinking loader.

const LAMP_BODY =
  "M0 8.5V7.75586C0.000200565 6.78621 0.786214 6.0002 1.75586 6H2.85645C3.22823 6 3.56811 6.21043 3.73438 6.54297L4.3291 7.73145C5.02432 9.1218 6.44551 10 8 10C9.55449 10 10.9757 9.1218 11.6709 7.73145L12.2656 6.54297L12.335 6.42383C12.5165 6.16072 12.8182 6 13.1436 6H16V7.5H13.4639L13.0127 8.40234C12.0634 10.3009 10.1226 11.5 8 11.5C5.87735 11.5 3.93661 10.3009 2.9873 8.40234L2.53613 7.5H1.75586C1.61464 7.5002 1.5002 7.61464 1.5 7.75586V8.5C1.5 8.77614 1.72386 9 2 9V10.5C0.89543 10.5 0 9.60457 0 8.5Z"
const LAMP_BASE = "M10.5 12.5V14H5.5V12.5H10.5Z"
const LAMP_STAR =
  "M7.77345 3.55265L8 2.25L8.22655 3.55265C8.33504 4.17646 8.82354 4.66496 9.44735 4.77345L10.75 5L9.44735 5.22655C8.82354 5.33504 8.33504 5.82354 8.22655 6.44735L8 7.75L7.77345 6.44735C7.66496 5.82354 7.17646 5.33504 6.55265 5.22655L5.25 5L6.55265 4.77345C7.17646 4.66496 7.66496 4.17646 7.77345 3.55265Z"
const LAMP_STAR_OUTLINE =
  "M8 1.5C8.36452 1.5 8.67665 1.76202 8.73926 2.12109L8.96582 3.42383C9.02006 3.73573 9.26427 3.97994 9.57617 4.03418L10.8789 4.26074C11.238 4.32335 11.5 4.63548 11.5 5C11.5 5.36452 11.238 5.67665 10.8789 5.73926L9.57617 5.96582C9.26427 6.02006 9.02006 6.26427 8.96582 6.57617L8.73926 7.87891C8.67665 8.23798 8.36452 8.5 8 8.5C7.63548 8.5 7.32335 8.23798 7.26074 7.87891L7.03418 6.57617C6.97994 6.26427 6.73573 6.02006 6.42383 5.96582L5.12109 5.73926C4.76202 5.67665 4.5 5.36452 4.5 5C4.5 4.63548 4.76202 4.32335 5.12109 4.26074L6.42383 4.03418C6.73573 3.97994 6.97994 3.73573 7.03418 3.42383L7.26074 2.12109L7.2959 1.99121C7.40253 1.70057 7.6811 1.5 8 1.5ZM8 4.76367C7.92717 4.8482 7.8482 4.92717 7.76367 5C7.84802 5.07267 7.9273 5.15103 8 5.23535C8.07254 5.15122 8.15122 5.07254 8.23535 5C8.15103 4.9273 8.07267 4.84802 8 4.76367Z"

function GenieLamp({
  size = 16,
  animated = false,
  className,
}: {
  size?: number
  animated?: boolean
  className?: string
}) {
  // Unique per instance so multiple lamps on the page don't share one gradient.
  const gradientId = `genie-ai-gradient-${useId().replace(/:/g, "")}`
  const fill = `url(#${gradientId})`
  const starClass = animated ? "genie-lamp-star" : undefined
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {animated && (
        <style>{`
          @keyframes genie-lamp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .genie-lamp-star { transform-origin: 8px 5px; animation: genie-lamp-spin 2.4s linear infinite; }
          @media (prefers-reduced-motion: reduce) { .genie-lamp-star { animation: none; } }
        `}</style>
      )}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="20.5%" stopColor="#4299E0" />
          <stop offset="46.91%" stopColor="#CA42E0" />
          <stop offset="79.5%" stopColor="#FF5F46" />
        </linearGradient>
      </defs>
      <path fill={fill} d={LAMP_BODY} />
      <path fill={fill} d={LAMP_BASE} />
      <path className={starClass} fill={fill} d={LAMP_STAR} />
      <path className={starClass} fill={fill} d={LAMP_STAR_OUTLINE} />
    </svg>
  )
}

// ─── Genie spinner ────────────────────────────────────────────────────────────
// The "working" indicator: the lamp with its star spinning.

function GenieSpinner({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0" style={{ width: size, height: size }} aria-label="Working">
      <GenieLamp size={size} animated />
    </span>
  )
}

// ─── Status glyph ─────────────────────────────────────────────────────────────
// Mirrors the real Tool action states: success ✓, running/pendingOutput = Genie
// spinner, failure = DuBois DangerIcon in secondary color (quiet), skipped redo.

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
      <DbIcon icon={DangerIcon} size={size} className="shrink-0 text-muted-foreground" ariaLabel="Failed" />
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
    <span className="inline-flex max-w-full min-w-0 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 align-middle text-xs text-foreground">
      <DbIcon icon={asset.icon} size={12} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate">{asset.label}</span>
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

// Trailing cluster on a tool row: optional running timer, then the status glyph.
// `after` renders last (the minimal row's expand chevron).
function ToolTrailing({
  status,
  elapsed,
  showGlyph,
  props,
  after,
}: {
  status: ToolStatus
  elapsed?: number
  showGlyph: boolean
  props: PlaygroundProps
  after?: React.ReactNode
}) {
  const showTimer = props.showToolTimer && status === "running" && elapsed !== undefined
  if (!showGlyph && !showTimer && !after) return null
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5">
      {showTimer && (
        <span className="text-hint tabular-nums text-muted-foreground">{formatElapsed(elapsed)}</span>
      )}
      {showGlyph && <StatusGlyph status={status} size={16} />}
      {after}
    </span>
  )
}

// ─── Tool detail ──────────────────────────────────────────────────────────────
// The expanded body of a query tool, as in Genie Code: a grey block with a
// status line ("Running… Tasks ▰▰▰" while live; "✓ 2:48 PM (17s)" + copy when
// done), the highlighted SQL, then the result grid + row count on success or
// an error line on failure.

// Wall-clock time the replay "starts", so finished tools can stamp a time.
const RUN_STARTED_AT = new Date(2026, 8, 25, 14, 46, 0).getTime()

function clockLabel(offsetMs: number): string {
  return new Date(RUN_STARTED_AT + offsetMs).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

type ToolTiming = { clock: string; seconds: number }

const SQL_KEYWORDS = new Set(["SELECT", "FROM", "WHERE", "ORDER", "BY", "ASC", "DESC", "LIMIT"])

// Minimal SQL highlighter: keywords, numbers, and catalog/schema qualifiers
// (any identifier followed by a dot).
function highlightSql(sql: string): React.ReactNode[] {
  const tokens = sql.match(/\s+|\w+|[^\w\s]/g) ?? []
  return tokens.map((tok, i) => {
    let cls = ""
    if (/^[A-Za-z]+$/.test(tok) && SQL_KEYWORDS.has(tok.toUpperCase())) cls = "text-primary"
    else if (/^\d+$/.test(tok)) cls = "text-green-600"
    else if (/^\w+$/.test(tok) && tokens[i + 1] === ".") cls = "text-brown-500"
    else if (tok === "*" || tok === ".") cls = "text-muted-foreground"
    return cls ? (
      <span key={i} className={cls}>
        {tok}
      </span>
    ) : (
      tok
    )
  })
}

// Indeterminate striped bar shown next to "Tasks" while a query runs.
function StripedProgress() {
  return (
    <span className="tool-progress inline-block h-2 w-[200px] min-w-0 shrink rounded-full" aria-hidden="true">
      <style>{`
        @keyframes tool-progress-slide { to { background-position: 16px 0; } }
        .tool-progress {
          background-color: var(--color-blue-600);
          background-image: linear-gradient(-45deg, var(--color-blue-800) 25%, transparent 25%,
            transparent 50%, var(--color-blue-800) 50%, var(--color-blue-800) 75%, transparent 75%);
          background-size: 16px 16px;
          animation: tool-progress-slide .8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) { .tool-progress { animation: none; } }
      `}</style>
    </span>
  )
}

const COLUMN_TYPE_ICON: Record<ColumnType, IconComponent> = {
  timestamp: CalendarClockIcon,
  double: DecimalIcon,
  int: HashIcon,
}

function ResultGrid({ result }: { result: QueryResult }) {
  return (
    <div className="border-t border-border bg-background">
      {/* ~5 rows tall; scrolls both ways like the notebook result grid */}
      <div className="max-h-[216px] overflow-y-auto">
        <Table className="w-max min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 border-r border-border" />
              {result.columns.map((c) => (
                <TableHead
                  key={c.name}
                  className="border-r border-border font-semibold whitespace-nowrap text-foreground"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <DbIcon icon={COLUMN_TYPE_ICON[c.type]} size={16} className="text-muted-foreground" />
                    {c.name}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((row, r) => (
              <TableRow key={r}>
                <TableCell className="border-r border-border text-center tabular-nums text-muted-foreground">
                  {r + 1}
                </TableCell>
                {row.map((v, c) => (
                  <TableCell
                    key={c}
                    className="border-r border-border whitespace-nowrap tabular-nums text-foreground"
                  >
                    {v}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2 border-t border-border px-2 py-1.5">
        <Button variant="ghost" size="icon-xs" aria-label="Download results" className="text-muted-foreground">
          <DbIcon icon={DownloadIcon} size={16} />
        </Button>
        <span className="text-sm text-foreground">{result.rows.length} rows</span>
      </div>
    </div>
  )
}

// `flush` = rendered inside a contained tool card: fills the card edge to edge
// (no radius, no side borders, just a divider under the card header).
function ToolDetailBlock({
  detail,
  status,
  timing,
  flush = false,
}: {
  detail: ToolDetail
  status: ToolStatus
  timing?: ToolTiming
  flush?: boolean
}) {
  const running = status === "running"
  const copy = () => {
    navigator.clipboard?.writeText(detail.sql).catch(() => {})
  }
  return (
    <div
      className={cn(
        "overflow-hidden bg-secondary",
        flush ? "border-t border-border" : "rounded-md border border-border",
      )}
    >
      <div className="flex flex-col gap-1 px-3 py-2.5">
        <div className="flex min-h-6 items-center gap-2 text-sm text-muted-foreground">
          {running ? (
            <>
              <span>Running…</span>
              <span>Tasks</span>
              <StripedProgress />
            </>
          ) : (
            <>
              <StatusGlyph status={status} size={16} />
              {timing && (
                <span className="tabular-nums">
                  {timing.clock} ({timing.seconds}s)
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={copy}
                aria-label="Copy query"
                className="ml-auto text-muted-foreground"
              >
                <DbIcon icon={CopyIcon} size={16} />
              </Button>
            </>
          )}
        </div>
        <pre className="overflow-x-auto font-mono text-sm leading-5 text-foreground">
          {/* Block code: drop the global inline-code chip (bg, padding, radius). */}
          <code className="rounded-none bg-transparent p-0 font-normal">{highlightSql(detail.sql)}</code>
        </pre>
      </div>
      {!running && status === "success" && detail.result && <ResultGrid result={detail.result} />}
      {!running && status === "failure" && detail.error && (
        <div className="border-t border-border bg-background px-3 py-2 text-sm text-foreground">
          {detail.error}
        </div>
      )}
    </div>
  )
}

// Whether a tool renders as a contained card in the current Tool UI mode. In
// "mix", only expandable tools get the card; the rest stay minimal.
function isContained(props: PlaygroundProps, expandable: boolean): boolean {
  return (
    props.toolMode === "contained" ||
    props.toolMode === "combined" ||
    (props.toolMode === "mix" && expandable)
  )
}

// A run's shared card (combined mode, and stacked repeated-tool groups).
const STACK_CARD = "flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-background"
// Padding for a non-tool row (a thought) sitting inside a STACK_CARD.
const STACK_ROW = "px-2.5 py-1.5"

function ToolAction({
  title,
  asset,
  status,
  elapsed,
  detail,
  timing,
  stacked = false,
  props,
}: {
  title: string
  asset?: AssetRef
  status: ToolStatus
  // Seconds the tool has been running; shown left of the spinner while it runs.
  elapsed?: number
  // Expandable body. Only tools with a detail get a chevron and a click target.
  detail?: ToolDetail
  timing?: ToolTiming
  // Row inside a stacked group card: the group owns the border and dividers.
  stacked?: boolean
  props: PlaygroundProps
}) {
  const [open, setOpen] = useState(false)
  const expandable = detail !== undefined
  const contained = isContained(props, expandable)
  const running = status === "running"
  // Once expanded, a finished tool's status moves into the detail header.
  const showGlyph = glyphVisible(status, props) && !(open && !running)
  const chevron = (
    <ChevronRightIcon
      size={14}
      className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
    />
  )
  const body = (flush: boolean) =>
    open &&
    detail && <ToolDetailBlock detail={detail} status={status} timing={timing} flush={flush} />

  if (!contained) {
    // Minimal: flat grey inline line; trailing timer / glyph, then the chevron
    // (hidden while running — the spinner holds that spot).
    const trailing = (
      <ToolTrailing
        status={status}
        elapsed={elapsed}
        showGlyph={showGlyph}
        props={props}
        after={expandable && !running ? chevron : undefined}
      />
    )
    if (!expandable) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="min-w-0 truncate">{title}</span>
          {asset && <AssetChip asset={asset} />}
          {trailing}
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(ROW_BUTTON, "w-full gap-2 py-0")}
        >
          <span className="min-w-0 truncate">{title}</span>
          {asset && <AssetChip asset={asset} />}
          {trailing}
        </Button>
        {body(false)}
      </div>
    )
  }

  // Contained: bordered "Tool action" card — leading chevron (expandable tools
  // only), title, trailing status. The detail renders inside the same card.
  const header = (
    <>
      {expandable && chevron}
      <span className="min-w-0 truncate text-foreground">{title}</span>
      {asset && <AssetChip asset={asset} />}
      <ToolTrailing status={status} elapsed={elapsed} showGlyph={showGlyph} props={props} />
    </>
  )
  return (
    <div
      className={cn(
        "bg-background text-sm",
        !stacked && "overflow-hidden rounded-md border border-border",
      )}
    >
      {expandable ? (
        <Button
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          // Whole header takes the DuBois action hover; the card's overflow-hidden
          // rounds its top corners.
          className="h-auto w-full justify-start gap-2 rounded-none px-2.5 py-1.5 text-sm font-normal hover:bg-[var(--action-default-bg-hover)] has-[>svg]:px-2.5 dark:hover:bg-[var(--action-default-bg-hover)]"
        >
          {header}
        </Button>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1.5">{header}</div>
      )}
      {body(true)}
    </div>
  )
}

// ─── Thinking dots ────────────────────────────────────────────────────────────
// The trailing "…" on a live Thinking label: three dots blinking in sequence.

function ThinkingDots() {
  return (
    <span className="thinking-dots ml-0.5 inline-block w-4 text-left tracking-[1px]" aria-hidden="true">
      <style>{`
        @keyframes thinking-dot { 0%, 80%, 100% { opacity: .3; } 40% { opacity: 1; } }
        .thinking-dots > span { opacity: .3; animation: thinking-dot 1.4s infinite both; }
        .thinking-dots > span:nth-of-type(2) { animation-delay: .2s; }
        .thinking-dots > span:nth-of-type(3) { animation-delay: .4s; }
        @media (prefers-reduced-motion: reduce) {
          .thinking-dots > span { animation: none; opacity: .7; }
        }
      `}</style>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  )
}

// Shared class for the grey, borderless clickable header rows in the thread.
const ROW_BUTTON =
  "h-auto justify-start gap-1.5 px-0 py-0.5 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground has-[>svg]:px-0"

// Container for an expanded step list. Today mirrors production: flush, no rule.
// Proposed follows props.indentSteps.
function nestedStepsClass(props: PlaygroundProps, variant: Variant): string {
  return variant === "proposed" && props.indentSteps ? "ml-2 border-l border-border pl-3" : ""
}

// Proposed loader label, escalating with how long the thought has run.
function thinkingLabel(sec: number, props: PlaygroundProps): string {
  if (sec >= props.takingLongerAfter) return "Taking longer"
  if (sec >= props.stillThinkingAfter) return "Still thinking"
  return "Thinking"
}

function formatElapsed(sec: number): string {
  const s = Math.floor(sec)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

// ─── Thoughts block ───────────────────────────────────────────────────────────
// One reasoning atom, rendered per option:
//   Today    — live: lamp + "Thinking…", body open and streaming. Done: auto-
//              collapses to "Thoughts: <first line> ›"; expanded "› Thoughts".
//   Proposed — live: lamp + escalating label + timer ›, body closed. Done:
//              "Thought ›". Expand any time to watch or read the reasoning.

function ThoughtBlock({
  text,
  revealKey,
  variant,
  props,
  stacked = false,
}: {
  text: string
  revealKey: string
  variant: Variant
  props: PlaygroundProps
  // Row inside a combined card: takes row padding; the card owns borders.
  stacked?: boolean
}) {
  const tl = useTimeline()
  const active = isActive(tl, revealKey)
  const [override, setOverride] = useState<boolean | null>(null)
  const [wasActive, setWasActive] = useState(active)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Today auto-collapses once the thought finishes (NativeThinking), dropping any
  // toggle made while it streamed. Proposed keeps whatever the user chose.
  if (wasActive !== active) {
    setWasActive(active)
    if (!active && variant === "today") setOverride(null)
  }

  const open = override ?? (variant === "today" && active)
  const shown = active ? streamedText(tl, revealKey, text) : text

  // Keep the newest streamed line in view while the body is open.
  useEffect(() => {
    if (active && open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [active, open, shown])

  const sec = elapsedSec(tl, revealKey)
  const firstLine = text.split("\n")[0].trim()
  const chevron = (
    <ChevronRightIcon size={14} className={cn("shrink-0 transition-transform", open && "rotate-90")} />
  )

  let header: React.ReactNode
  if (active && variant === "today") {
    header = (
      <>
        <GenieSpinner size={16} />
        <span>
          Thinking
          <ThinkingDots />
        </span>
      </>
    )
  } else if (active) {
    header = (
      <>
        <GenieSpinner size={16} />
        <span>
          {thinkingLabel(sec, props)}
          <ThinkingDots />
        </span>
        <span className="tabular-nums">· {formatElapsed(sec)}</span>
        {chevron}
      </>
    )
  } else if (variant === "today") {
    header = open ? (
      <>
        {chevron}
        <span>Thoughts</span>
      </>
    ) : (
      <>
        <span className="min-w-0 truncate">Thoughts: {firstLine}</span>
        {chevron}
      </>
    )
  } else {
    header = (
      <>
        <span>Thought</span>
        {chevron}
      </>
    )
  }

  return (
    <div className={cn("flex min-w-0 flex-col", stacked && STACK_ROW)}>
      <Button
        variant="ghost"
        onClick={() => setOverride(!open)}
        aria-expanded={open}
        className={cn(ROW_BUTTON, "w-full min-w-0")}
      >
        {header}
      </Button>
      {open && (
        <div
          ref={bodyRef}
          className="mt-1 max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words text-hint text-muted-foreground [scrollbar-width:none]"
        >
          {shown}
        </div>
      )}
    </div>
  )
}

// ─── Tool run group ───────────────────────────────────────────────────────────
// Collapses a run of consecutive same-title tool calls into one "title ×N ›" row
// (gated by props.groupRepeatedTools). Collapsed shows the run's title, the count,
// and the LAST call's status glyph. Expanded lists the individual calls in order,
// each a normal ToolAction. Only used for runs of length ≥ 2.

function ToolRunGroup({
  parent,
  indices,
  steps,
  props,
  variant,
}: {
  parent: number
  indices: number[]
  steps: StepChild[]
  props: PlaygroundProps
  variant: Variant
}) {
  const tl = useTimeline()
  const [open, setOpen] = useState(false)

  const first = steps[indices[0]]
  const title = first.kind === "tool" ? first.title : ""
  const lastIdx = indices[indices.length - 1]
  const last = steps[lastIdx]
  // "Last wins": the row glyph is the last call's effective status.
  const lastStatus: ToolStatus =
    last.kind === "tool"
      ? isSettled(tl, childKey(parent, lastIdx))
        ? last.status
        : "running"
      : "success"
  const showGlyph = glyphVisible(lastStatus, props)
  const lastElapsed =
    lastStatus === "running" ? elapsedSec(tl, childKey(parent, lastIdx)) : undefined
  // When every call renders as a card, stack them into one card with dividers
  // so the run reads as a single tool with line items.
  const stacked = indices.every((c) => {
    const step = steps[c]
    return step.kind === "tool" && isContained(props, step.detail !== undefined)
  })

  const header = (
    <>
      <span className="min-w-0 truncate">{title}</span>
      <span className="shrink-0 text-muted-foreground">×{indices.length}</span>
      <ChevronRightIcon size={14} className={cn("shrink-0 transition-transform", open && "rotate-90")} />
      <ToolTrailing status={lastStatus} elapsed={lastElapsed} showGlyph={showGlyph} props={props} />
    </>
  )

  // Combined: the group is a row in the run's card; expanding adds the calls as
  // indented rows directly below it, in the same card with the same dividers.
  if (props.toolMode === "combined") {
    return (
      <div className="flex flex-col divide-y divide-border">
        <Button
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="h-auto w-full justify-start gap-2 rounded-none px-2.5 py-1.5 text-sm font-normal text-foreground hover:bg-[var(--action-default-bg-hover)] hover:text-foreground has-[>svg]:px-2.5 dark:hover:bg-[var(--action-default-bg-hover)]"
        >
          {header}
        </Button>
        {open &&
          indices.map((c) => (
            <div key={c} className="pl-5">
              <ThreadItemView
                item={steps[c]}
                revealKey={childKey(parent, c)}
                props={props}
                variant={variant}
                stacked
              />
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className={cn(ROW_BUTTON, "w-full gap-2 py-0")}
      >
        {header}
      </Button>
      {open && (
        <div className={nestedStepsClass(props, variant)}>
          <div
            className={cn(
              "flex flex-col",
              stacked ? STACK_CARD : "gap-2.5",
            )}
          >
            {indices.map((c) => (
              <ThreadItemView
                key={c}
                item={steps[c]}
                revealKey={childKey(parent, c)}
                props={props}
                variant={variant}
                stacked={stacked}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Segment a list of child indices into runs: each entry is either a single index
// (non-tool, or a lone tool) or a run of ≥2 consecutive same-title tools.
function segmentSteps(indices: number[], steps: StepChild[]): number[][] {
  const segments: number[][] = []
  let run: number[] = []
  const flush = () => {
    if (run.length) segments.push(run)
    run = []
  }
  for (const c of indices) {
    const item = steps[c]
    if (item.kind === "tool" && run.length && steps[run[0]].kind === "tool") {
      const prev = steps[run[0]] as Extract<StepChild, { kind: "tool" }>
      if (prev.title === item.title) {
        run.push(c)
        continue
      }
    }
    flush()
    run = [c]
  }
  flush()
  return segments
}

function stepsLabel(n: number) {
  return `${n} step${n === 1 ? "" : "s"}`
}

// ─── Step group ───────────────────────────────────────────────────────────────
// A run of thoughts/tools between prose lines. `parent` is its THREAD index.
//
// Sealed (the next prose line has appeared): ≥2 steps fold into "N steps ›",
// collapsed by default (FoldedToolCalls); a lone step renders as itself.
//
// Streaming, by props.density:
//   • flat  — every revealed step shows, flat.
//   • focus — only the live (newest) step shows; finished steps roll up behind
//             the same "N steps ›" header above it, so sealing is seamless.

function StepGroup({
  parent,
  steps,
  props,
  variant,
}: {
  parent: number
  steps: StepChild[]
  props: PlaygroundProps
  variant: Variant
}) {
  const tl = useTimeline()
  const [open, setOpen] = useState(false)

  // Children with an atom (hidden thoughts have none) that have started.
  const revealed = steps
    .map((_, c) => c)
    .filter((c) => childKey(parent, c) in tl.atoms && isVisible(tl, childKey(parent, c)))
  const liveIdx = revealed.length ? revealed[revealed.length - 1] : -1

  const nextKey = topKey(parent + 1)
  const sealed =
    nextKey in tl.atoms
      ? isVisible(tl, nextKey)
      : liveIdx >= 0 && isSettled(tl, childKey(parent, liveIdx))

  // Plain helper, not a component — avoids remounting children and resetting
  // their local state. `nested` = inside an expanded fold.
  const stepList = (indices: number[], nested: boolean) => {
    // Combined: the whole list is one card, one row per step — except a thought
    // that is still thinking, which is never contained: it renders inline below
    // the card and joins it as a row once it finishes.
    const combined = props.toolMode === "combined"
    const lastIdx = indices[indices.length - 1]
    const liveThought =
      combined &&
      lastIdx !== undefined &&
      steps[lastIdx].kind === "thoughts" &&
      isActive(tl, childKey(parent, lastIdx))
    const cardIndices = liveThought ? indices.slice(0, -1) : indices
    const segments = props.groupRepeatedTools
      ? segmentSteps(cardIndices, steps)
      : cardIndices.map((c) => [c])
    const card = (
      <div className={combined ? STACK_CARD : "flex flex-col gap-2.5"}>
        {segments.map((seg) =>
          seg.length > 1 ? (
            <ToolRunGroup
              key={seg[0]}
              parent={parent}
              indices={seg}
              steps={steps}
              props={props}
              variant={variant}
            />
          ) : (
            <ThreadItemView
              key={seg[0]}
              item={steps[seg[0]]}
              revealKey={childKey(parent, seg[0])}
              props={props}
              variant={variant}
              stacked={combined}
            />
          )
        )}
      </div>
    )
    const list = liveThought ? (
      <div className="flex flex-col gap-2.5">
        {cardIndices.length > 0 && card}
        <ThreadItemView
          item={steps[lastIdx]}
          revealKey={childKey(parent, lastIdx)}
          props={props}
          variant={variant}
        />
      </div>
    ) : (
      card
    )
    return nested ? <div className={nestedStepsClass(props, variant)}>{list}</div> : list
  }

  const foldHeader = (label: string) => (
    <Button
      variant="ghost"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className={cn(ROW_BUTTON, "w-fit")}
    >
      {label}
      <ChevronRightIcon size={14} className={cn("transition-transform", open && "rotate-90")} />
    </Button>
  )

  if (sealed) {
    if (revealed.length < 2) return stepList(revealed, false)
    return (
      <div className="flex flex-col gap-2.5">
        {foldHeader(stepsLabel(revealed.length))}
        {open && stepList(revealed, true)}
      </div>
    )
  }

  // Today always renders flat — it mirrors production, which has no focus mode.
  if (props.density === "flat" || variant === "today") return stepList(revealed, false)

  const completed = revealed.filter((c) => c !== liveIdx)
  return (
    <div className="flex flex-col gap-2.5">
      {completed.length > 0 &&
        foldHeader(props.showCompletedCount ? stepsLabel(completed.length) : "Previous steps")}
      {open && completed.length > 0 && stepList(completed, true)}
      {liveIdx >= 0 && stepList([liveIdx], false)}
    </div>
  )
}

// ─── Thread renderer ──────────────────────────────────────────────────────────
// `revealKey` is the item's timeline key. Visibility of the item itself is
// decided by the parent (Thread / StepGroup).

function ThreadItemView({
  item,
  revealKey,
  props,
  variant,
  stacked = false,
}: {
  item: ThreadItem
  revealKey: string
  props: PlaygroundProps
  variant: Variant
  // Row inside a shared card (combined runs, stacked ToolRunGroups).
  stacked?: boolean
}) {
  const tl = useTimeline()
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
        <ThoughtBlock
          text={item.text}
          revealKey={revealKey}
          variant={variant}
          props={props}
          stacked={stacked}
        />
      )
    case "tool": {
      // Spin until the clock passes this tool's end.
      const settled = isSettled(tl, revealKey)
      const atom = tl.atoms[revealKey]
      return (
        <ToolAction
          title={item.title}
          asset={item.asset}
          status={settled ? item.status : "running"}
          elapsed={settled ? undefined : elapsedSec(tl, revealKey)}
          detail={item.detail}
          stacked={stacked}
          timing={
            atom
              ? { clock: clockLabel(atom.end), seconds: Math.round((atom.end - atom.start) / 1000) }
              : undefined
          }
          props={props}
        />
      )
    }
    case "stepGroup":
      return (
        <StepGroup parent={Number(revealKey)} steps={item.children} props={props} variant={variant} />
      )
    case "prose":
      return (
        <p className="text-sm leading-5 text-foreground">{streamedText(tl, revealKey, item.text)}</p>
      )
  }
}

// Every THREAD item, gated on the clock. A step run shows once its first
// (non-hidden) child has started.
function Thread({ props, variant }: { props: PlaygroundProps; variant: Variant }) {
  const tl = useTimeline()
  return (
    <div className="flex flex-col gap-2.5">
      {THREAD.map((item, i) => {
        const shown =
          item.kind === "stepGroup"
            ? item.children.some((_, c) => childKey(i, c) in tl.atoms && isVisible(tl, childKey(i, c)))
            : isVisible(tl, topKey(i))
        if (!shown) return null
        return (
          <ThreadItemView key={i} item={item} revealKey={topKey(i)} props={props} variant={variant} />
        )
      })}
    </div>
  )
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
// Same thread + shared playground props; reasoning treatment is per option.
// Thread scrolls; the composer stays pinned at the bottom.

function OptionCard({
  option,
  props,
  following,
  onHide,
  canHide,
}: {
  option: OptionDef
  props: PlaygroundProps
  following: boolean
  onHide: () => void
  canHide: boolean
}) {
  const tl = useTimeline()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Follow the newest streamed line while playing.
  useEffect(() => {
    if (following && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [following, tl.now])

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{option.name}</span>
          <span className="text-hint text-muted-foreground">{option.caption}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onHide}
          disabled={!canHide}
          aria-label={`Hide ${option.name}`}
          title={canHide ? `Hide ${option.name}` : "Keep at least one option visible"}
          className="shrink-0 text-muted-foreground"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-md border border-border bg-background p-4">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="mx-auto w-full max-w-[680px]">
            <Thread props={props} variant={option.variant} />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[680px]">
          <ThreadComposer />
        </div>
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

// A whole-seconds field. Keeps a local draft so the field can be cleared while
// typing; only positive numbers are committed.
function SecondsRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setDraft(String(value))
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm font-normal text-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          type="number"
          min={1}
          max={120}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            const n = Number(e.target.value)
            if (e.target.value !== "" && Number.isFinite(n) && n > 0) onChange(n)
          }}
          onBlur={() => setDraft(String(value))}
          className="h-8 w-14 text-right tabular-nums"
        />
        <span className="text-hint text-muted-foreground">s</span>
      </div>
    </div>
  )
}

function SetupSummary({ props, onReset }: { props: PlaygroundProps; onReset: () => void }) {
  const [copied, setCopied] = useState(false)
  const rows = summarize(props)
  const isDefault = rows.every((r) => !r.changed)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; the URL bar still holds the same link.
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</span>
        {!isDefault && (
          <Button variant="link" size="xs" onClick={onReset} className="h-auto px-0">
            Reset
          </Button>
        )}
      </div>
      <dl className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 text-hint">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className={cn("text-right text-foreground", r.changed && "font-semibold")}>
              {r.changed && <span className="mr-1 text-primary">•</span>}
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <span className="text-hint text-muted-foreground">
        {isDefault ? "All defaults." : "• changed from default."} The link carries this setup.
      </span>
      <Button variant="default" size="xs" onClick={copy} className="gap-1.5">
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Link copied" : "Copy link"}
      </Button>
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
    <aside className="flex w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-secondary/40 px-5 py-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">Proposal Playground</span>
        <span className="text-hint text-muted-foreground">
          Styles steps in both options. Step density applies to Proposed only; Today stays flat.
        </span>
      </div>

      <SetupSummary props={props} onReset={() => setProps(DEFAULT_PROPS)} />

      {/* Tool UI mode */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tool UI</span>
        {/* A dropdown, not a segmented control: four modes don't fit the rail. */}
        <Select
          value={props.toolMode}
          onValueChange={(v) => setProps({ ...props, toolMode: v as ToolMode })}
        >
          <SelectTrigger className="h-8 w-full" aria-label="Tool UI">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TOOL_MODE_LABEL) as ToolMode[]).map((m) => (
              <SelectItem key={m} value={m}>
                {TOOL_MODE_LABEL[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-hint text-muted-foreground">
          {props.toolMode === "minimal" && "Flat inline step lines."}
          {props.toolMode === "contained" && "Every tool in its own container."}
          {props.toolMode === "mix" && "Expandable tools contained, the rest inline."}
          {props.toolMode === "combined" && "Each run of steps shares one container, one row per step."}
        </span>
      </div>

      {/* Step density */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step density
        </span>
        <SegmentedControl
          value={props.density}
          onValueChange={(v) => setProps({ ...props, density: v as Density })}
        >
          <SegmentedItem value="flat">Flat</SegmentedItem>
          <SegmentedItem value="focus">One at a time</SegmentedItem>
        </SegmentedControl>
        <span className="text-hint text-muted-foreground">
          {props.density === "flat"
            ? "Every step shows while a run streams, like Today."
            : "Only the live step shows; finished steps roll up above it."}
        </span>
        <ToggleRow
          id="indent-steps"
          label="Indent expanded steps"
          checked={props.indentSteps}
          onChange={(v) => setProps({ ...props, indentSteps: v })}
        />
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
        <ToggleRow
          id="show-completed-count"
          label="# in roll-up header"
          checked={props.showCompletedCount}
          onChange={(v) => setProps({ ...props, showCompletedCount: v })}
          disabled={props.density !== "focus"}
        />
        <ToggleRow
          id="group-repeated-tools"
          label="Group repeated tools"
          checked={props.groupRepeatedTools}
          onChange={(v) => setProps({ ...props, groupRepeatedTools: v })}
        />
        <ToggleRow
          id="show-tool-timer"
          label="Tool timers"
          checked={props.showToolTimer}
          onChange={(v) => setProps({ ...props, showToolTimer: v })}
        />
      </div>

      {/* Proposed loader escalation */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Thinking label (Proposed)
        </span>
        <SecondsRow
          id="still-thinking-after"
          label="“Still thinking” at"
          value={props.stillThinkingAfter}
          onChange={(v) => setProps({ ...props, stillThinkingAfter: v })}
        />
        <SecondsRow
          id="taking-longer-after"
          label="“Taking longer” at"
          value={props.takingLongerAfter}
          onChange={(v) => setProps({ ...props, takingLongerAfter: v })}
        />
      </div>
    </aside>
  )
}

// ─── Transport ────────────────────────────────────────────────────────────────

function Transport({ playback, total }: { playback: ReturnType<typeof usePlayback>; total: number }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Button variant="default" size="sm" onClick={playback.restart} className="gap-1.5">
        <RotateCcw className="h-4 w-4" />
        Restart
      </Button>
      <Button size="sm" onClick={playback.toggle} className="w-[84px] gap-1.5">
        {playback.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playback.playing ? "Pause" : "Play"}
      </Button>
      <SegmentedControl
        value={String(playback.speed)}
        onValueChange={(v) => playback.setSpeed(Number(v))}
      >
        {SPEEDS.map((s) => (
          <SegmentedItem key={s} value={String(s)}>
            {s}×
          </SegmentedItem>
        ))}
      </SegmentedControl>
      <Slider
        value={[playback.now]}
        min={0}
        max={total}
        step={100}
        onValueChange={([v]) => {
          playback.setScrubbing(true)
          playback.seek(v)
        }}
        onValueCommit={() => playback.setScrubbing(false)}
        aria-label="Timeline"
        className="min-w-0 flex-1"
      />
      <span className="w-[92px] shrink-0 text-right text-hint tabular-nums text-muted-foreground">
        {(playback.now / 1000).toFixed(1)}s / {Math.round(total / 1000)}s
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// useSearchParams needs a Suspense boundary so static prerender can bail out to
// the client instead of failing the build.
export default function GenieThreadVariantsPage() {
  return (
    <Suspense>
      <GenieThreadVariants />
    </Suspense>
  )
}

function GenieThreadVariants() {
  // The setup is seeded from the URL on first render, so a shared link opens
  // exactly as it was configured.
  const searchParams = useSearchParams()
  const [initial] = useState(() => decodeState(searchParams.toString()))
  const [props, setProps] = useState<PlaygroundProps>(initial.props)
  // Which options are hidden. Hidden ones collapse out; visible ones widen.
  // A link that hides every option falls back to showing all of them.
  const [hidden, setHidden] = useState<Record<Variant, boolean>>(() => {
    const all = initial.hidden.length >= OPTIONS.length
    return {
      today: !all && initial.hidden.includes("today"),
      proposed: !all && initial.hidden.includes("proposed"),
    }
  })

  // Mirror the setup back into the URL. replaceState, so tweaking controls
  // doesn't pile up history entries.
  useEffect(() => {
    const q = encodeState(
      props,
      OPTIONS.filter((o) => hidden[o.variant]).map((o) => o.variant),
    )
    window.history.replaceState(null, "", q ? `${window.location.pathname}?${q}` : window.location.pathname)
  }, [props, hidden])

  const timeline = useMemo(() => buildTimeline(props.showThoughts), [props.showThoughts])
  const playback = usePlayback(timeline.total)
  const tl = useMemo<TimelineState>(
    () => ({ now: playback.now, atoms: timeline.atoms }),
    [playback.now, timeline.atoms],
  )

  const visible = OPTIONS.filter((o) => !hidden[o.variant])
  const hiddenOptions = OPTIONS.filter((o) => hidden[o.variant])
  const show = (v: Variant) => setHidden((h) => ({ ...h, [v]: false }))
  const hide = (v: Variant) => setHidden((h) => ({ ...h, [v]: true }))
  // Grid columns follow the visible count so cards fill the width.
  const gridCols = visible.length === 1 ? "lg:grid-cols-1" : "lg:grid-cols-2"

  return (
    <TimelineContext.Provider value={tl}>
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
            <span className="text-sm text-muted-foreground">Genie thread — reasoning & steps</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 overflow-hidden">
          <PlaygroundRail props={props} setProps={setProps} />

          <main className="flex-1 overflow-hidden px-8 py-6">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
              <div className="flex shrink-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    The same EDA thread streaming at a realistic pace. Today is what ships now; Proposed is the
                    proposed reasoning treatment. Tools, prose and step folds are identical.
                  </p>
                  {/* Restore chips for any hidden options */}
                  <div className="flex shrink-0 items-center gap-2">
                    {hiddenOptions.map((o) => (
                      <Button
                        key={o.variant}
                        variant="default"
                        size="sm"
                        onClick={() => show(o.variant)}
                        className="gap-1.5 text-muted-foreground"
                      >
                        <Eye className="h-4 w-4" />
                        Show {o.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <Transport playback={playback} total={timeline.total} />
              </div>
              <div className={cn("grid min-h-0 flex-1 grid-cols-1 gap-8", gridCols)}>
                {visible.map((o) => (
                  <OptionCard
                    key={`${o.variant}-${playback.runId}`}
                    option={o}
                    props={props}
                    following={playback.playing}
                    onHide={() => hide(o.variant)}
                    canHide={visible.length > 1}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </TimelineContext.Provider>
  )
}
