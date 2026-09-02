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
//       - A Full   every step streams visibly, flat transcript
//       - B Focus  same structure, but a streaming group shows only the single
//                  live step; finished steps roll up behind "Thinking… (N)"
//     Both render the same faithful EDA thread so the tool styling reads
//     comparably across densities.
//
// Linked from the Prototype Hub home page (PROTOTYPES array in src/app/page.tsx).

"use client"

import { useState, useEffect, useRef, createContext, useContext } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Plus, RotateCw, Eye, EyeOff } from "lucide-react"
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  NotebookIcon,
  CatalogIcon,
  DangerIcon,
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
  // Show the running "(N completed)" count in the focus "Thinking…" header.
  showCompletedCount: boolean
  // Collapse consecutive same-title tool calls into one "×N" expandable row.
  groupRepeatedTools: boolean
}

const DEFAULT_PROPS: PlaygroundProps = {
  toolMode: "minimal",
  showThoughts: true,
  showStatus: true,
  showSuccess: true,
  showFailure: true,
  showCompletedCount: true,
  groupRepeatedTools: true,
}

// ─── Density ────────────────────────────────────────────────────────────────
// Intrinsic to each option card. Never driven by the playground rail.

// full  = A: every step streams visibly, flat transcript.
// focus = B: same flat structure, but a streaming group shows only the single
//            live step; completed steps roll up behind an expandable "Thinking…"
//            header with a running completed-count.
type Density = "full" | "focus"

type OptionDef = { density: Density; label: string; caption: string }

const OPTIONS: OptionDef[] = [
  { density: "full", label: "Option A", caption: "Full — every step streams, flat" },
  {
    density: "focus",
    label: "Option B",
    caption: "One at a time — only the live step shows; finished steps roll up",
  },
]

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
      {
        kind: "thoughts",
        text: "The user wants to perform exploratory data analysis on the samples.nyctaxi.trips table. Before I touch the data I should check whether there's a relevant skill that governs how EDA on a trips table ought to be done — column conventions, date scoping, and any performance caveats for large Delta shares. Let me read the available skills first so I follow the established pattern rather than improvising queries that might time out or miss required temporal validation.",
      },
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
      { kind: "tool", title: "Edited", asset: NB, status: "failure" },
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

// ─── Reveal timeline ──────────────────────────────────────────────────────────
// Rerun replays the thread as a live stream. Every revealable atom gets a global
// reveal index in playback order: each top-level THREAD item is an atom, and a
// step-group's children are atoms right after the group header. A running tick
// counter gates visibility (index < tick) and settle (index resolves at
// index + 1, so tools show a spinner for one beat before flipping to final).

// Stable key per atom: top-level items use their THREAD index as a string;
// step-children use "parentIndex.childIndex".
function topKey(i: number) {
  return String(i)
}
function childKey(parent: number, child: number) {
  return `${parent}.${child}`
}

// Build key → reveal index in playback order.
const REVEAL_INDEX: Record<string, number> = (() => {
  const map: Record<string, number> = {}
  let n = 0
  THREAD.forEach((item, i) => {
    map[topKey(i)] = n++
    if (item.kind === "stepGroup") {
      item.children.forEach((_, c) => {
        map[childKey(i, c)] = n++
      })
    }
  })
  return map
})()

// Total beats = every atom + a trailing settle beat so the last tool flips.
const TOTAL_BEATS = Object.keys(REVEAL_INDEX).length + 2
const BEAT_MS = 2100

type RevealState = {
  active: boolean // a replay is currently playing (or was just played)
  tick: number // how many beats have elapsed; Infinity when idle/settled
}

const RevealContext = createContext<RevealState>({ active: false, tick: Infinity })
const useReveal = () => useContext(RevealContext)

// True if the atom at `key` should be shown yet.
function isVisible(reveal: RevealState, key: string): boolean {
  if (!reveal.active) return true
  const idx = REVEAL_INDEX[key]
  return idx === undefined || idx < reveal.tick
}

// True once the timeline has passed the atom's resolve beat (reveal + 1), i.e.
// a tool has finished running and can show its final status.
function isSettled(reveal: RevealState, key: string): boolean {
  if (!reveal.active) return true
  const idx = REVEAL_INDEX[key]
  return idx === undefined || idx + 1 < reveal.tick
}

// Drives the shared timeline for all cards. rerun() restarts from 0.
function useReplay() {
  const [state, setState] = useState<RevealState>({ active: false, tick: Infinity })
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }

  const rerun = () => {
    stop()
    setState({ active: true, tick: 0 })
    timer.current = setInterval(() => {
      setState((s) => {
        const next = s.tick + 1
        if (next >= TOTAL_BEATS) {
          stop()
          // Settle: keep active so nothing snaps, but reveal everything.
          return { active: true, tick: Infinity }
        }
        return { active: true, tick: next }
      })
    }, BEAT_MS)
  }

  useEffect(() => stop, [])

  return { state, rerun }
}

// ─── Genie mark ───────────────────────────────────────────────────────────────
// Static Genie lamp mark (no animation) — used as a leading icon, e.g. before the
// "Thought process" step-group label. Same geometry as GenieSpinner.

function GenieMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 3 52 52"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g transform="matrix(-0.305 0 0 0.305 23.363465 45.382455)">
        <path
          d="M24.72,6.616c0-7.308-4.772-13.232-10.659-13.232c0,0-28.122,0-28.122,0-5.887,0-10.659,5.924-10.659,13.232c0,0,49.44,0,49.44,0Z"
          fill="#FF5F46"
          strokeWidth="0"
        />
      </g>
      <g transform="matrix(0.305 0 0 0.305 24 27.5)">
        <g transform="translate(0,14.701)">
          <path
            d="M35.6,14.696c7.051-5.966,22.84-29.216,33.357-46.111c0,0-8.325,0-8.325,0-3.708,0-7.023,1.967-9.357,4.849-4.51,5.569-13.344,13.295-29.459,13.295c0,0-11.027,0-11.027,0-2.304,0-4.506,1.017-5.891,2.858-2.231,2.965-3.991,5.722-5.316,8.005-1.256,2.164-5.058,2.144-6.327-.014-1.37-2.328-3.229-5.15-5.654-8.181-1.384-1.73-3.511-2.668-5.727-2.668c0,0-29.657,0-29.657,0s0,.003,0,.003-2.504,0-2.504,0c-10.311,0-18.67,8.359-18.67,18.67s8.359,18.671,18.67,18.671c0-10.965-3.97-11.115-5.462-14.63-.278-.657-.432-1.394-.432-2.199c0-3.43,2.781-6.212,6.212-6.212c2.611.001,4.844,1.612,5.762,3.895c0-.019,0-.037,0-.055c6.482,15.638,21.087,26.543,38.065,26.543c24.236,0,34.692-10.754,41.742-16.719Z"
            fill="#fabfba"
            strokeWidth="0"
          />
        </g>
      </g>
      <g transform="matrix(0.305 0 0 0.305 24 27.5)">
        <g transform="translate(-3.306,-27.505)">
          <g transform="rotate(-90)">
            <g transform="scale(-1,1) translate(0,0)">
              <path d="M0,37.217c0-.047,0-.094,0-.142" fill="#FF5F46" strokeWidth="0" />
              <path
                d="M0,-37.217c.078,20.489,16.946,37.074,37.743,37.074C16.898,-0.142,0,16.521,0,37.075c0-20.554-16.898-37.217-37.742-37.217c20.796,0,37.665-16.586,37.742-37.075Z"
                fill="#FF5F46"
                strokeWidth="0"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

// ─── Genie spinner ────────────────────────────────────────────────────────────
// The Genie lamp mark used as the "working" indicator (replaces the generic CSS
// spinner). The sparkle rotates and the wisp pulses; keyframes are scoped to the
// gs- class names so they don't collide with anything else on the page.

function GenieSpinner({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0" style={{ width: size, height: size }} aria-label="Working">
      <style>{`
        @keyframes gs-spin { to { transform: rotate(360deg); } }
        @keyframes gs-pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .gs-sparkle { animation: gs-spin 1.6s linear infinite; transform-box: fill-box; transform-origin: center; }
        .gs-wisp { animation: gs-pulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .gs-sparkle, .gs-wisp { animation: none; }
        }
      `}</style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-2 3 52 52"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        aria-hidden="true"
      >
        <g transform="matrix(-0.305 0 0 0.305 23.363465 45.382455)">
          <path
            d="M24.72,6.616c0-7.308-4.772-13.232-10.659-13.232c0,0-28.122,0-28.122,0-5.887,0-10.659,5.924-10.659,13.232c0,0,49.44,0,49.44,0Z"
            fill="#FF5F46"
            strokeWidth="0"
          />
        </g>
        <g transform="matrix(0.305 0 0 0.305 24 27.5)">
          <g transform="translate(0,14.701)" className="gs-wisp">
            <g transform="translate(0,0)">
              <path
                d="M35.6,14.696c7.051-5.966,22.84-29.216,33.357-46.111c0,0-8.325,0-8.325,0-3.708,0-7.023,1.967-9.357,4.849-4.51,5.569-13.344,13.295-29.459,13.295c0,0-11.027,0-11.027,0-2.304,0-4.506,1.017-5.891,2.858-2.231,2.965-3.991,5.722-5.316,8.005-1.256,2.164-5.058,2.144-6.327-.014-1.37-2.328-3.229-5.15-5.654-8.181-1.384-1.73-3.511-2.668-5.727-2.668c0,0-29.657,0-29.657,0s0,.003,0,.003-2.504,0-2.504,0c-10.311,0-18.67,8.359-18.67,18.67s8.359,18.671,18.67,18.671c0-10.965-3.97-11.115-5.462-14.63-.278-.657-.432-1.394-.432-2.199c0-3.43,2.781-6.212,6.212-6.212c2.611.001,4.844,1.612,5.762,3.895c0-.019,0-.037,0-.055c6.482,15.638,21.087,26.543,38.065,26.543c24.236,0,34.692-10.754,41.742-16.719Z"
                fill="#fabfba"
                strokeWidth="0"
              />
            </g>
          </g>
        </g>
        <g transform="matrix(0.305 0 0 0.305 24 27.5)">
          <g transform="translate(-3.306,-27.505)" className="gs-sparkle">
            <g transform="rotate(-90)">
              <g transform="scale(-1,1) translate(0,0)">
                <path d="M0,37.217c0-.047,0-.094,0-.142" fill="#FF5F46" strokeWidth="0" />
                <path
                  d="M0,-37.217c.078,20.489,16.946,37.074,37.743,37.074C16.898,-0.142,0,16.521,0,37.075c0-20.554-16.898-37.217-37.742-37.217c20.796,0,37.665-16.586,37.742-37.075Z"
                  fill="#FF5F46"
                  strokeWidth="0"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
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
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm">
      <ChevronRightIcon size={14} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-foreground">{title}</span>
      {asset && <AssetChip asset={asset} />}
      {showGlyph && <span className="ml-auto shrink-0"><StatusGlyph status={status} size={16} /></span>}
    </div>
  )
}

// ─── Thoughts block ───────────────────────────────────────────────────────────
// A collapsible thought. Collapsed shows the first line of the actual thought
// text (truncated to one line with a trailing chevron); expanded shows the full
// text, wrapping. Default collapsed.

function ThoughtsBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Button
      variant="ghost"
      onClick={() => setOpen((o) => !o)}
      className="h-auto w-full items-start justify-start gap-1 whitespace-normal px-0 py-0.5 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground has-[>svg]:px-0"
    >
      <span
        className={cn(
          "min-w-0 flex-1 text-left",
          open ? "whitespace-normal break-words" : "truncate"
        )}
      >
        {text}
      </span>
      <ChevronRightIcon
        size={14}
        className={cn("mt-0.5 shrink-0 transition-transform", open && "rotate-90")}
      />
    </Button>
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
}: {
  parent: number
  indices: number[]
  steps: StepChild[]
  props: PlaygroundProps
}) {
  const reveal = useReveal()
  const [open, setOpen] = useState(false)

  const first = steps[indices[0]]
  const title = first.kind === "tool" ? first.title : ""
  const lastIdx = indices[indices.length - 1]
  const last = steps[lastIdx]
  // "Last wins": the row glyph is the last call's effective status.
  const lastStatus: ToolStatus =
    last.kind === "tool"
      ? isSettled(reveal, childKey(parent, lastIdx))
        ? last.status
        : "running"
      : "success"
  const showGlyph = glyphVisible(lastStatus, props)

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="h-auto w-full justify-start gap-2 px-0 py-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground has-[>svg]:px-0"
      >
        <span className="min-w-0 truncate">{title}</span>
        <span className="shrink-0 text-muted-foreground">×{indices.length}</span>
        <ChevronRightIcon size={14} className={cn("shrink-0 transition-transform", open && "rotate-90")} />
        {showGlyph && (
          <span className="ml-auto shrink-0">
            <StatusGlyph status={lastStatus} size={16} />
          </span>
        )}
      </Button>
      {open && (
        <div className="ml-2 flex flex-col gap-2.5 border-l border-border pl-3">
          {indices.map((c) => (
            <ThreadItemView key={c} item={steps[c]} revealKey={childKey(parent, c)} props={props} />
          ))}
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

// ─── Step group ───────────────────────────────────────────────────────────────
// Owns the thoughts/tools it hides. `parent` is the group's THREAD index.
//
// Settled/idle (both densities): collapses to "Thought process (N steps) ▸",
// expandable to all steps.
//
// Streaming header (both densities): a "Thinking… (N)" row with the Genie loader,
// N = completed steps so far, running up as steps settle. Clickable to expand.
//
// Streaming body:
//   • full  (A) — auto-expands and shows ALL revealed steps.
//   • focus (B) — shows only the single LIVE step (the newest revealed child);
//     completed steps are hidden and roll up behind the header, appearing above
//     the live step only when the header is expanded.

function StepGroup({
  parent,
  steps,
  props,
  focus = false,
}: {
  parent: number
  steps: StepChild[]
  props: PlaygroundProps
  focus?: boolean
}) {
  const reveal = useReveal()
  const [userOpen, setUserOpen] = useState(false)

  const lastChildKey = childKey(parent, steps.length - 1)
  const streaming = reveal.active && !isSettled(reveal, lastChildKey)

  // Indices of revealed children, and how many have settled (the running count).
  const revealed = steps.map((_, c) => c).filter((c) => isVisible(reveal, childKey(parent, c)))
  const completedCount = steps.filter((_, c) => isSettled(reveal, childKey(parent, c))).length
  const liveIdx = revealed.length ? revealed[revealed.length - 1] : -1

  // Auto-open while streaming (full only); focus keeps completed steps hidden
  // unless the user expands the header. Settled honors the user's toggle.
  const bodyOpen = streaming ? (focus ? userOpen : true) : userOpen

  // Render a set of child indices as an indented step list (plain helper, not a
  // component — avoids remounting the children and resetting their local state).
  // When grouping is on, consecutive same-title tool runs (≥2) collapse into a
  // ToolRunGroup; everything else renders as an individual item.
  const stepList = (indices: number[]) => {
    const segments = props.groupRepeatedTools
      ? segmentSteps(indices, steps)
      : indices.map((c) => [c])
    return (
      <div className="ml-2 flex flex-col gap-2.5 border-l border-border pl-3">
        {segments.map((seg) =>
          seg.length > 1 ? (
            <ToolRunGroup key={seg[0]} parent={parent} indices={seg} steps={steps} props={props} />
          ) : (
            <ThreadItemView
              key={seg[0]}
              item={steps[seg[0]]}
              revealKey={childKey(parent, seg[0])}
              props={props}
              focus={focus}
            />
          )
        )}
      </div>
    )
  }

  // ── Streaming ──────────────────────────────────────────────────────────────
  if (streaming) {
    // Focus: only the newest revealed child is the "live" step; the rest are
    // completed and hidden behind the header. Full: everything revealed shows.
    const completedIndices = focus ? revealed.filter((c) => c !== liveIdx) : revealed
    return (
      <div className="flex flex-col gap-2.5">
        <Button
          variant="ghost"
          onClick={() => setUserOpen((o) => !o)}
          className="-ml-[3px] h-auto w-fit justify-start gap-1.5 px-0 py-0.5 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground has-[>svg]:px-0"
        >
          <GenieSpinner size={16} />
          {/* Running count only in focus (B), gated by the global toggle, and only
              once ≥1 step has settled; plain "Thinking…" otherwise. */}
          {focus && props.showCompletedCount && completedCount > 0
            ? `Thinking… (${completedCount} completed)`
            : "Thinking…"}
          <ChevronRightIcon size={14} className={cn("transition-transform", userOpen && "rotate-90")} />
        </Button>
        {/* Completed steps: always shown in full mode; only when expanded in focus */}
        {bodyOpen && completedIndices.length > 0 && stepList(completedIndices)}
        {/* The single live step (focus only — full already rendered it above) */}
        {focus && liveIdx >= 0 && stepList([liveIdx])}
      </div>
    )
  }

  // ── Settled / idle ───────────────────────────────────────────────────────────
  const settledVisible = steps.map((_, c) => c).filter((c) => isVisible(reveal, childKey(parent, c)))
  return (
    <div className="flex flex-col gap-2.5">
      <Button
        variant="ghost"
        onClick={() => setUserOpen((o) => !o)}
        className="-ml-[3px] h-auto w-fit justify-start gap-1.5 px-0 py-0.5 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground has-[>svg]:px-0"
      >
        <GenieMark size={16} />
        Thought process ({steps.length} steps)
        <ChevronRightIcon size={14} className={cn("transition-transform", userOpen && "rotate-90")} />
      </Button>
      {userOpen && stepList(settledVisible)}
    </div>
  )
}

// ─── Thread renderer ──────────────────────────────────────────────────────────
// `revealKey` gates a tool's running→final status during replay. Visibility of
// the item itself is decided by the parent (ThreadItems / StepGroup).

function ThreadItemView({
  item,
  revealKey,
  props,
  focus = false,
}: {
  item: ThreadItem
  revealKey: string
  props: PlaygroundProps
  focus?: boolean
}) {
  const reveal = useReveal()
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
      return <ThoughtsBlock text={item.text} />
    case "tool": {
      // Show a spinner until the timeline passes this tool's resolve beat.
      const effectiveStatus: ToolStatus = isSettled(reveal, revealKey) ? item.status : "running"
      return (
        <ToolAction
          title={item.title}
          asset={item.asset}
          status={effectiveStatus}
          props={props}
        />
      )
    }
    case "stepGroup":
      return <StepGroup parent={Number(revealKey)} steps={item.children} props={props} focus={focus} />
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

// Render a contiguous slice of THREAD items, gating each on the reveal timeline.
// `focus` = Option B: streaming step-groups show only the single live step.
function ThreadItems({
  from,
  to,
  props,
  focus = false,
}: {
  from: number
  to: number
  props: PlaygroundProps
  focus?: boolean
}) {
  const reveal = useReveal()
  return (
    <div className="flex flex-col gap-2.5">
      {THREAD.slice(from, to + 1).map((item, i) => {
        const idx = from + i
        if (!isVisible(reveal, topKey(idx))) return null
        return (
          <ThreadItemView key={idx} item={item} revealKey={topKey(idx)} props={props} focus={focus} />
        )
      })}
    </div>
  )
}

// ─── Density: Full (Option A) ─────────────────────────────────────────────────
// Every step, flat. The unabridged transcript — streaming groups show all steps.

function ThreadFull({ props }: { props: PlaygroundProps }) {
  return <ThreadItems from={0} to={THREAD.length - 1} props={props} />
}

// ─── Density: Focus (Option B) ────────────────────────────────────────────────
// Same flat structure as A, but a streaming group shows only the single live
// step (see StepGroup's focus mode). Finished steps roll up behind the
// expandable "Thinking… (N)" header; completed run collapses like A.

function ThreadFocus({ props }: { props: PlaygroundProps }) {
  return <ThreadItems from={0} to={THREAD.length - 1} props={props} focus />
}

function Thread({ density, props }: { density: Density; props: PlaygroundProps }) {
  if (density === "focus") return <ThreadFocus props={props} />
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
  onHide,
  canHide,
}: {
  label: string
  caption: string
  density: Density
  props: PlaygroundProps
  onHide: () => void
  canHide: boolean
}) {
  const reveal = useReveal()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Follow the newest revealed item during a replay.
  useEffect(() => {
    if (reveal.active && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [reveal.active, reveal.tick])

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-hint text-muted-foreground">{caption}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onHide}
          disabled={!canHide}
          aria-label={`Hide ${label}`}
          title={canHide ? `Hide ${label}` : "Keep at least one option visible"}
          className="shrink-0 text-muted-foreground"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-md border border-border bg-background p-4">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="mx-auto w-full max-w-[680px]">
            <Thread density={density} props={props} />
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
        <ToggleRow
          id="show-completed-count"
          label="# of completed steps"
          checked={props.showCompletedCount}
          onChange={(v) => setProps({ ...props, showCompletedCount: v })}
        />
        <ToggleRow
          id="group-repeated-tools"
          label="Group repeated tools"
          checked={props.groupRepeatedTools}
          onChange={(v) => setProps({ ...props, groupRepeatedTools: v })}
        />
      </div>
    </aside>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GenieThreadVariants() {
  const [props, setProps] = useState<PlaygroundProps>(DEFAULT_PROPS)
  const { state: reveal, rerun } = useReplay()

  // Which options are visible. Hidden ones collapse out; visible ones widen.
  const [hidden, setHidden] = useState<Record<Density, boolean>>({
    full: false,
    focus: false,
  })
  const visible = OPTIONS.filter((o) => !hidden[o.density])
  const hiddenOptions = OPTIONS.filter((o) => hidden[o.density])
  const show = (d: Density) => setHidden((h) => ({ ...h, [d]: false }))
  const hide = (d: Density) => setHidden((h) => ({ ...h, [d]: true }))
  // Grid columns follow the visible count so cards fill the width.
  const gridCols = visible.length === 1 ? "lg:grid-cols-1" : "lg:grid-cols-2"

  return (
    <RevealContext.Provider value={reveal}>
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
            <div className="flex shrink-0 items-start justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Each card renders the same EDA thread at a different progress density. The Playground
                on the left styles the tool &amp; step items across both.
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {/* Restore chips for any hidden options */}
                {hiddenOptions.map((o) => (
                  <Button
                    key={o.density}
                    variant="default"
                    size="sm"
                    onClick={() => show(o.density)}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Eye className="h-4 w-4" />
                    Show {o.label.replace("Option ", "")}
                  </Button>
                ))}
                <Button size="sm" onClick={rerun} className="gap-1.5">
                  <RotateCw className="h-4 w-4" />
                  Rerun
                </Button>
              </div>
            </div>
            <div className={cn("grid min-h-0 flex-1 grid-cols-1 gap-8", gridCols)}>
              {visible.map((o) => (
                <OptionCard
                  key={o.density}
                  label={o.label}
                  caption={o.caption}
                  density={o.density}
                  props={props}
                  onHide={() => hide(o.density)}
                  canHide={visible.length > 1}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
    </RevealContext.Provider>
  )
}
