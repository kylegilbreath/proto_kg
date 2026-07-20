"use client"

import * as React from "react"
import { ArrowUp, MousePointerClick, Paperclip, SquarePen, Users } from "lucide-react"
import { GenieIcon, KitModal } from "@/components/apps"
import { IconButton } from "../icon-button"
import {
  uid,
  type AttentionItem,
  type ChatApi,
  type ChatMessage,
  type QuestionnaireAnswers,
  type Tool,
} from "../types"
import { renderMessage, ChatEmpty } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { ChatHistoryMenu } from "./chat-history-menu"
import { QuestionCard } from "./question-card"
import {
  ACCESS_DESTINATIONS,
  ADD_ALERTS_DONE_MSG,
  ADD_ALERTS_MSG,
  ADD_EXPOSURE_DONE_MSG,
  ADD_EXPOSURE_MSG,
  AFTER_REQUEST_MSG,
  ALERTS_CONNECT_MSG,
  ALERTS_LABEL_RE,
  ALERTS_REPORT,
  ALERTS_RE,
  CLARIFY_MSG,
  CONNECT_MSG,
  EMPTY_MSG,
  EXPOSURE_AFTER_REQUEST_MSG,
  EXPOSURE_CONNECT_MSG,
  EXPOSURE_REPORT,
  EXPOSURE_RE,
  FOLLOWUPS,
  KEEP_DECAY_DONE_MSG,
  KEEP_DECAY_MSG,
  LAYOUT_MSG,
  PREVIEW_MSG,
  Q_STEPS,
  Q_STEPS_ITERATE,
  REMOVE_DECAY_DONE_MSG,
  REMOVE_DECAY_MSG,
  REMOVE_MSG,
  RESTORE_DECAY_TODO,
  RESTYLE_ALERTS_DONE_MSG,
  RESTYLE_ALERTS_MSG,
  RESTYLE_RE,
  SEED_HISTORY,
  SHARE_MSG,
  SHARE_PROMPT_MSG,
  SPEC_TODOS,
  THRESHOLD_RE,
  THRESH_DONE,
  isComplexChange,
  restrictedRule,
} from "./chat-data"

interface ChatPanelProps {
  prompt: string
  existing: boolean
  onDone?: () => void
  onRequestInput?: () => void
  onRequestDeploy?: () => void
  onStartSelect?: () => void
  onAddComponent?: (k: string) => void
  onDefineThreshold?: (n: number) => void
  onAddTodos?: (t: string[]) => void
  onAnswers?: (a: QuestionnaireAnswers) => void
  onOpenApp?: () => void
  apiRef: React.MutableRefObject<ChatApi | null>
}

interface Scheduler {
  go: (fn: () => void, d: number) => void
  cancel: () => void
}

export function ChatPanel({
  prompt,
  existing,
  onDone,
  onRequestDeploy,
  onStartSelect,
  onAddComponent,
  onDefineThreshold,
  onAddTodos,
  onAnswers,
  onOpenApp,
  apiRef,
}: ChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => (existing ? SEED_HISTORY() : []))
  const [input, setInput] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [asking, setAsking] = React.useState(false)
  const [askMode, setAskMode] = React.useState<"build" | "clarify">("build")
  const [accessModal, setAccessModal] = React.useState<AttentionItem | null>(null)
  const [requested, setRequested] = React.useState<Record<string, boolean>>({})

  const pendingText = React.useRef<string | null>(null)
  const liveIds = React.useRef<Set<string>>(new Set())
  const cancelRef = React.useRef<(() => void) | null>(null)
  const followIdx = React.useRef(0)
  const logRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLDivElement | null>(null)
  const autoSent = React.useRef(false)
  const inputMsgId = React.useRef<string | null>(null)

  const fillInput = (t: string) => {
    setInput((p) => (p ? p + "\n" : "") + t)
    // After the contenteditable rebuilds, focus it and drop the caret at the end.
    setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      const r = document.createRange()
      r.selectNodeContents(el)
      r.collapse(false)
      const sel = window.getSelection()
      if (!sel) return
      sel.removeAllRanges()
      sel.addRange(r)
    }, 40)
  }

  const handleFixAction = (a: AttentionItem) => {
    if (a.action === "Request access") setAccessModal(a)
    else fillInput(a.fill)
  }

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  })

  const push = (m: ChatMessage) => {
    if (m.kind === "ai-text") liveIds.current.add(m.id)
    setMessages((p) => [...p, m])
  }
  const upd = (id: string, patch: Partial<ChatMessage>) =>
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  const addTool = (gid: string, tool: Tool) =>
    setMessages((p) => p.map((m) => (m.id === gid ? { ...m, tools: [...(m.tools || []), tool] } : m)))
  const updTool = (gid: string, tid: string, status: Tool["status"]) =>
    setMessages((p) =>
      p.map((m) =>
        m.id === gid ? { ...m, tools: (m.tools || []).map((t) => (t.id === tid ? { ...t, status } : t)) } : m,
      ),
    )
  const scheduler = (): Scheduler => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    return {
      go: (fn, d) => {
        const id = setTimeout(() => {
          if (!cancelled) fn()
        }, d)
        timers.push(id)
      },
      cancel: () => {
        cancelled = true
        timers.forEach(clearTimeout)
      },
    }
  }

  // Initial: a new chat — Genie collects a few details via the inline card.
  const runInitial = (userText: string) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    pendingText.current = null
    go(() => {
      setGenerating(true)
      if (userText) push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => {
      setGenerating(false)
      setAskMode("build")
      setAsking(true)
    }, 450)
  }

  // Complex change on an existing app → ask a couple clarifying questions first.
  const startClarify = (userText: string) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    pendingText.current = userText
    const aiId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: aiId, kind: "ai-text", text: CLARIFY_MSG }), 350)
    go(() => {
      setGenerating(false)
      setAskMode("clarify")
      setAsking(true)
    }, 350 + CLARIFY_MSG.length * 16 + 200)
  }

  // Clarifying card finished → record answers, then run the change.
  const finishClarify = (answers: Record<string, string>) => {
    setAsking(false)
    const rows: [string, string][] = [
      ["Scope", answers.scope],
      ["Data", answers.sources],
      ["Priorities", answers.priorities],
      ["Others", answers.others],
    ]
    const text = pendingText.current
    pendingText.current = null
    cancelRef.current?.()
    setMessages((p) => [...p, { id: uid(), kind: "genie-input", status: "answered", answers: rows }])
    setTimeout(() => {
      if (text && ALERTS_RE.test(text)) runAddAlerts(text, true)
      else runFollowup(text || "", true)
    }, 30)
  }

  // The inline build card was completed (or skipped) → review + mock-data preview.
  const finishQuestions = (answers: Record<string, string>) => {
    setAsking(false)
    const rows: [string, string][] = [
      ["Target audiences", answers.audiences],
      ["Data sources", answers.sources],
      ["Key features", answers.features],
      ["Others", answers.others],
    ]
    onAnswers?.(answers as unknown as QuestionnaireAnswers)
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "genie-input", status: "answered", answers: rows })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true }), 400)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 12,
          reasoning: [
            "Parsed your prompt and questionnaire answers.",
            "Mapped the requested sections to a dashboard layout.",
            "Generated mock data so you can see the structure immediately.",
            "Flagged which parts will need real data connections.",
          ],
        }),
      2200,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: PREVIEW_MSG }), 2400)
    const STREAM = 2400 + PREVIEW_MSG.length * 16 + 200
    go(
      () =>
        push({
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Search and connect to data", action: "connect" },
            { label: "Adjust layout", action: "layout" },
          ],
        }),
      STREAM,
    )
    go(() => {
      setGenerating(false)
      onDone?.()
    }, STREAM + 100)
  }

  // After the preview form is submitted: review answers → mock-data preview.
  const runReview = (answers: QuestionnaireAnswers) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    const rows: [string, string][] = [
      ["Target audiences", answers.audiences],
      ["Data sources", answers.sources],
      ["Key features", answers.features],
      ["Others", answers.others],
    ]
    go(() => {
      setGenerating(true)
      if (inputMsgId.current) upd(inputMsgId.current, { status: "answered", answers: rows })
      else push({ id: uid(), kind: "genie-input", status: "answered", answers: rows })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true }), 400)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 12,
          reasoning: [
            "Parsed your prompt and questionnaire answers.",
            "Mapped the requested sections to a dashboard layout.",
            "Generated mock data so you can see the structure immediately.",
            "Flagged which parts will need real data connections.",
          ],
        }),
      2200,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: PREVIEW_MSG }), 2400)
    const STREAM = 2400 + PREVIEW_MSG.length * 16 + 200
    go(
      () =>
        push({
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Search and connect to data", action: "connect" },
            { label: "Adjust layout", action: "layout" },
          ],
        }),
      STREAM,
    )
    go(() => {
      setGenerating(false)
      onDone?.()
    }, STREAM + 100)
  }

  // "Search and connect to data" → readiness report.
  const runConnect = () => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: "Search and connect to data" })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Connecting your real data" }), 300)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 3,
          reasoning: [
            "Scanned the tables available in your App Space.",
            "Checked your access against each required field.",
            "Matched draft metrics to real columns.",
            "Listed gaps that need a connection or definition.",
          ],
        }),
      1900,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: CONNECT_MSG }), 2100)
    const STREAM = 2100 + CONNECT_MSG.length * 16 + 200
    go(() => push({ id: uid(), kind: "connect-report" }), STREAM)
    go(() => setGenerating(false), STREAM + 100)
  }

  const runLayout = () => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: "Adjust layout" })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true }), 300)
    go(() => upd(thinkId, { active: false, duration: 1, reasoning: ["Reviewed the current section order."] }), 1100)
    go(() => push({ id: uid(), kind: "ai-text", text: LAYOUT_MSG }), 1300)
    go(() => setGenerating(false), 1300 + LAYOUT_MSG.length * 16 + 200)
  }

  // Add low-stock reorder alerts → build the panel, then show its data report.
  const runAddAlerts = (userText: string, skipUser?: boolean) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      if (!skipUser) push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Adding reorder alerts" }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 2,
          reasoning: [
            "Reused the inventory and sales tables already in the app.",
            "Designed a reorder-alerts panel keyed on each SKU's reorder point.",
            "Checked which inputs are available vs. still need setup.",
          ],
        }),
      1300,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: ADD_ALERTS_MSG }), 1500)
    const STREAM = 1500 + ADD_ALERTS_MSG.length * 16 + 200
    const tools: { variant: Tool["variant"]; label: string }[] = [
      { variant: "file-create", label: "src/components/ReorderAlerts.tsx" },
      { variant: "file-edit", label: "src/components/Dashboard.tsx" },
      { variant: "file-edit", label: "src/app/page.tsx" },
    ]
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    tools.forEach((tool, i) => {
      const tid = uid()
      go(() => addTool(groupId, { id: tid, ...tool, status: "done" }), STREAM + 100 + i * 320)
    })
    const TOOLS = STREAM + 100 + tools.length * 320 + 200
    go(() => onAddComponent?.("lowstock"), TOOLS)
    go(() => push({ id: uid(), kind: "ai-text", text: ALERTS_CONNECT_MSG }), TOOLS + 250)
    const STREAM2 = TOOLS + 250 + ALERTS_CONNECT_MSG.length * 16 + 200
    go(() => push({ id: uid(), kind: "connect-report", data: ALERTS_REPORT }), STREAM2)
    go(() => push({ id: uid(), kind: "ai-text", text: ADD_ALERTS_DONE_MSG }), STREAM2 + 200)
    const DONE = STREAM2 + 200 + ADD_ALERTS_DONE_MSG.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [
        ...p,
        { id: uid(), kind: "checkpoint", label: "Add low-stock reorder alerts" },
        {
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Deploy app", action: "deploy" },
            { label: "Edit a component", action: "iterate", icon: MousePointerClick },
          ],
        },
      ])
    }, DONE)
  }

  // Add an Exposure section → build it, then show the financial-inputs report.
  const runAddExposure = (userText: string, skipUser?: boolean) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      if (!skipUser) push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Adding exposure section" }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 2,
          reasoning: [
            "Reused the store cover, sales, and recommendations already in the app.",
            "Designed gross exposure → recovery levers → residual as a waterfall.",
            "Added an option-decay chart for how recoverable value erodes over 72h.",
            "Checked which inputs are available vs. still need setup.",
          ],
        }),
      1400,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: ADD_EXPOSURE_MSG }), 1600)
    const STREAM = 1600 + ADD_EXPOSURE_MSG.length * 16 + 200
    const tools: { variant: Tool["variant"]; label: string }[] = [
      { variant: "file-create", label: "src/components/insights/Exposure.tsx" },
      { variant: "file-create", label: "src/components/insights/RecoveryWaterfall.tsx" },
      { variant: "file-create", label: "src/components/insights/OptionDecay.tsx" },
      { variant: "file-edit", label: "src/pages/InsightsPage.tsx" },
    ]
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    tools.forEach((tool, i) => {
      const tid = uid()
      go(() => addTool(groupId, { id: tid, ...tool, status: "done" }), STREAM + 100 + i * 300)
    })
    const TOOLS = STREAM + 100 + tools.length * 300 + 200
    go(() => onAddComponent?.("exposure"), TOOLS)
    go(() => push({ id: uid(), kind: "ai-text", text: EXPOSURE_CONNECT_MSG }), TOOLS + 250)
    const STREAM2 = TOOLS + 250 + EXPOSURE_CONNECT_MSG.length * 16 + 200
    go(() => push({ id: uid(), kind: "connect-report", data: EXPOSURE_REPORT }), STREAM2)
    go(() => push({ id: uid(), kind: "ai-text", text: ADD_EXPOSURE_DONE_MSG }), STREAM2 + 200)
    const DONE = STREAM2 + 200 + ADD_EXPOSURE_DONE_MSG.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [
        ...p,
        { id: uid(), kind: "checkpoint", label: "Add an exposure section" },
        {
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Deploy app", action: "deploy" },
            { label: "Edit a component", action: "iterate", icon: MousePointerClick },
          ],
        },
      ])
    }, DONE)
  }

  const runRemoveDecayDeploy = () => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: "Remove the decay chart and deploy" })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Removing the decay chart" }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 1,
          reasoning: [
            "Dropped the chart that depends on the un-approved table.",
            "Widened the recovery waterfall to fill the row.",
            "Logged a TODO to restore it once access is approved.",
          ],
        }),
      1000,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: REMOVE_DECAY_MSG }), 1200)
    const STREAM = 1200 + REMOVE_DECAY_MSG.length * 16 + 200
    const tools: { variant: Tool["variant"]; label: string }[] = [
      { variant: "file-edit", label: "src/pages/InsightsPage.tsx" },
      { variant: "file-edit", label: "src/components/insights/Exposure.tsx" },
    ]
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    tools.forEach((tool, i) => {
      const tid = uid()
      go(() => addTool(groupId, { id: tid, ...tool, status: "done" }), STREAM + 100 + i * 300)
    })
    const TOOLS = STREAM + 100 + tools.length * 300 + 200
    go(() => {
      onAddComponent?.("exposure-no-decay")
      onAddTodos?.([RESTORE_DECAY_TODO])
    }, TOOLS)
    go(() => push({ id: uid(), kind: "ai-text", text: REMOVE_DECAY_DONE_MSG }), TOOLS + 250)
    const DONE = TOOLS + 250 + REMOVE_DECAY_DONE_MSG.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [...p, { id: uid(), kind: "checkpoint", label: "Remove decay chart and deploy" }])
      onRequestDeploy?.()
    }, DONE)
  }

  const runKeepDecayDeploy = () => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: "Keep the placeholder and deploy" })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Keeping the placeholder" }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 1,
          reasoning: [
            "Left the gated chart as a pending-access placeholder.",
            "Logged a TODO to restore it once access lands.",
          ],
        }),
      900,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: KEEP_DECAY_MSG }), 1100)
    const STREAM = 1100 + KEEP_DECAY_MSG.length * 16 + 200
    const tools: { variant: Tool["variant"]; label: string }[] = [
      { variant: "file-edit", label: "src/components/insights/OptionDecay.tsx" },
    ]
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    tools.forEach((tool, i) => {
      const tid = uid()
      go(() => addTool(groupId, { id: tid, ...tool, status: "done" }), STREAM + 100 + i * 300)
    })
    const TOOLS = STREAM + 100 + tools.length * 300 + 200
    go(() => onAddTodos?.([RESTORE_DECAY_TODO]), TOOLS)
    go(() => push({ id: uid(), kind: "ai-text", text: KEEP_DECAY_DONE_MSG }), TOOLS + 250)
    const DONE = TOOLS + 250 + KEEP_DECAY_DONE_MSG.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [...p, { id: uid(), kind: "checkpoint", label: "Keep placeholder and deploy" }])
      onRequestDeploy?.()
    }, DONE)
  }

  // Inline-edit restyle of the alerts panel → swap yellow for the default style.
  const runRestyleAlerts = (userText: string, skipUser?: boolean) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      if (!skipUser) push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Updating styles" }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 1,
          reasoning: [
            "Located the reorder alerts panel.",
            "Replaced the warning surface with the default card tokens.",
          ],
        }),
      1000,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: RESTYLE_ALERTS_MSG }), 1200)
    const STREAM = 1200 + RESTYLE_ALERTS_MSG.length * 16 + 200
    const tools: { variant: Tool["variant"]; label: string }[] = [
      { variant: "file-edit", label: "src/components/ReorderAlerts.tsx" },
    ]
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    tools.forEach((tool, i) => {
      const tid = uid()
      go(() => addTool(groupId, { id: tid, ...tool, status: "done" }), STREAM + 100 + i * 320)
    })
    const TOOLS = STREAM + 100 + tools.length * 320 + 200
    go(() => onAddComponent?.("lowstock-plain"), TOOLS)
    go(() => push({ id: uid(), kind: "ai-text", text: RESTYLE_ALERTS_DONE_MSG }), TOOLS + 250)
    const DONE = TOOLS + 250 + RESTYLE_ALERTS_DONE_MSG.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [
        ...p,
        { id: uid(), kind: "checkpoint", label: "Restyle reorder alerts" },
        {
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Deploy app", action: "deploy" },
            { label: "Edit a component", action: "iterate", icon: MousePointerClick },
          ],
        },
      ])
    }, DONE)
  }

  // Define reorder threshold → update the reorder numbers only (no data report).
  const runDefineThreshold = (userText: string, skipUser?: boolean) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const n = parseInt((userText.match(/(\d[\d,]*)/) || [])[1]?.replace(/,/g, "") ?? "", 10) || 300
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      if (!skipUser) push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Updating reorder logic" }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 1,
          reasoning: [
            `Set the per-SKU reorder point to ${n}.`,
            "Recomputed suggested reorder quantities from current stock.",
          ],
        }),
      1000,
    )
    const aiId = uid()
    const msg = `I'll set the reorder point to ${n} units per SKU and recompute the suggested reorder quantities.`
    go(() => push({ id: aiId, kind: "ai-text", text: msg }), 1200)
    const STREAM = 1200 + msg.length * 16 + 200
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    go(
      () => addTool(groupId, { id: uid(), variant: "file-edit", label: "src/components/ReorderAlerts.tsx", status: "done" }),
      STREAM + 100,
    )
    const TOOLS = STREAM + 100 + 320 + 100
    go(() => onDefineThreshold?.(n), TOOLS)
    const done = THRESH_DONE(n)
    go(() => push({ id: uid(), kind: "ai-text", text: done }), TOOLS + 200)
    const DONE = TOOLS + 200 + done.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [
        ...p,
        { id: uid(), kind: "checkpoint", label: `Set reorder point to ${n}` },
        {
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Deploy app", action: "deploy" },
            { label: "Edit a component", action: "iterate", icon: MousePointerClick },
          ],
        },
      ])
    }, DONE)
  }

  // Generic typed follow-up (with tool calls).
  const runFollowup = (userText: string, skipUser?: boolean) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const v = FOLLOWUPS[followIdx.current % FOLLOWUPS.length]
    followIdx.current++
    const thinkId = uid()
    const groupId = uid()
    go(() => {
      setGenerating(true)
      if (!skipUser) push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true }), 150)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 1,
          reasoning: ["Located the relevant files.", "Planned the minimal edit needed."],
        }),
      1100,
    )
    const aiId = uid()
    go(() => push({ id: aiId, kind: "ai-text", text: v.text }), 1300)
    const STREAM = 1300 + v.text.length * 16 + 200
    go(() => push({ id: groupId, kind: "tool-group", tools: [] }), STREAM)
    v.tools.forEach((tool, i) => {
      const tid = uid()
      const isCmd = tool.variant === "command"
      go(() => {
        addTool(groupId, { id: tid, ...tool, status: isCmd ? "running" : "done" })
        if (isCmd) go(() => updTool(groupId, tid, "done"), 600)
      }, STREAM + 100 + i * 320)
    })
    const TOOLS = STREAM + 100 + v.tools.length * 320 + 600
    go(() => push({ id: uid(), kind: "ai-text", text: v.summary }), TOOLS + 200)
    const DONE = TOOLS + 200 + v.summary.length * 16 + 200
    go(() => {
      setGenerating(false)
      setMessages((p) => [
        ...p,
        { id: uid(), kind: "checkpoint", label: userText.slice(0, 60) || "Follow-up" },
        {
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Deploy app", action: "deploy" },
            { label: "Edit a component", action: "iterate", icon: MousePointerClick },
          ],
        },
      ])
    }, DONE)
  }

  // A restricted request → explain it's disallowed by the App Space admin.
  const runBlocked = (userText: string, rule: { cap: string; policy: string }) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true, label: "Checking App Space policy" }), 250)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 1,
          reasoning: [
            "Checked this App Space's governance policy.",
            "This action is restricted by your workspace admin.",
          ],
        }),
      1250,
    )
    go(() => push({ id: uid(), kind: "policy-block", cap: rule.cap, policy: rule.policy }), 1450)
    go(() => setGenerating(false), 1650)
  }

  const runReply = (userText: string, replyText: string) => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    const thinkId = uid()
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: userText })
    }, 0)
    go(() => push({ id: thinkId, kind: "thinking", active: true }), 200)
    go(
      () =>
        upd(thinkId, {
          active: false,
          duration: 2,
          reasoning: ["Updated the affected components.", "Recorded follow-ups in the app spec."],
        }),
      1300,
    )
    go(() => push({ id: uid(), kind: "ai-text", text: replyText }), 1500)
    go(() => setGenerating(false), 1500 + replyText.length * 16 + 200)
  }

  // Share flow — post a share card into the chat.
  const runShare = () => {
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: "Share with your team" })
    }, 0)
    go(() => push({ id: uid(), kind: "ai-text", text: SHARE_MSG }), 300)
    const STREAM = 300 + SHARE_MSG.length * 16 + 200
    go(() => {
      push({ id: uid(), kind: "share-card" })
      setGenerating(false)
    }, STREAM)
  }

  // After an access request is submitted — offer to remove or empty the charts.
  const runAfterRequest = (item: AttentionItem) => {
    const object = item.object || ""
    const isExposureDecay = !!item.exposureDecay
    cancelRef.current?.()
    const { go, cancel } = scheduler()
    cancelRef.current = cancel
    setMessages((p) => p.filter((m) => m.kind !== "suggestions"))
    go(() => {
      setGenerating(true)
      push({ id: uid(), kind: "user", text: "Request access to " + object })
    }, 0)
    const aiId = uid()
    if (isExposureDecay) {
      go(() => onAddComponent?.("exposure-access-requested"), 200)
      go(() => push({ id: aiId, kind: "ai-text", text: EXPOSURE_AFTER_REQUEST_MSG }), 400)
      const STREAM = 400 + EXPOSURE_AFTER_REQUEST_MSG.length * 16 + 200
      go(
        () =>
          push({
            id: uid(),
            kind: "suggestions",
            options: [
              { label: "Remove the chart and deploy", action: "remove-decay-deploy" },
              { label: "Keep the placeholder and deploy", action: "keep-decay-deploy" },
            ],
          }),
        STREAM,
      )
      go(() => setGenerating(false), STREAM + 100)
      return
    }
    go(() => push({ id: aiId, kind: "ai-text", text: AFTER_REQUEST_MSG }), 400)
    const STREAM = 400 + AFTER_REQUEST_MSG.length * 16 + 200
    go(
      () =>
        push({
          id: uid(),
          kind: "suggestions",
          options: [
            { label: "Remove mocked data charts and add todos to spec", action: "remove" },
            { label: "Show charts empty state (no data access)", action: "empty" },
          ],
        }),
      STREAM,
    )
    go(() => setGenerating(false), STREAM + 100)
  }

  const handleSuggestion = (action: string) => {
    if (generating) return
    setMessages((p) => p.filter((m) => m.kind !== "suggestions"))
    if (action === "connect") runConnect()
    else if (action === "remove") {
      onAddTodos?.(SPEC_TODOS)
      runReply("Remove mocked data charts and add todos to spec", REMOVE_MSG)
    } else if (action === "empty") runReply("Show charts empty state (no data access)", EMPTY_MSG)
    else if (action === "remove-decay-deploy") runRemoveDecayDeploy()
    else if (action === "keep-decay-deploy") runKeepDecayDeploy()
    else if (action === "deploy") onRequestDeploy?.()
    else if (action === "share") runShare()
    else if (action === "iterate") onStartSelect?.()
    else runLayout()
  }

  // Post a deploy confirmation into the chat (called by the top-bar popover).
  const noteDeployed = (url: string, time: string) => {
    setMessages((p) => [
      ...p.filter((m) => m.kind !== "suggestions"),
      { id: uid(), kind: "deploy-note", url, time },
      { id: uid(), kind: "ai-text", text: SHARE_PROMPT_MSG },
      {
        id: uid(),
        kind: "suggestions",
        options: [
          { label: "Share with your team", action: "share", icon: Users },
          { label: "Keep iterating", action: "iterate", icon: MousePointerClick },
        ],
      },
    ])
  }

  // Route a message through the flow logic (submit + preview "Send to Genie").
  const routeMessage = (t: string) => {
    setMessages((p) => p.filter((m) => m.kind !== "suggestions"))
    const r = restrictedRule(t)
    if (r) {
      runBlocked(t, r)
      return
    }
    if (!existing && messages.length === 0) runInitial(t)
    else if (isComplexChange(t)) startClarify(t)
    else if (ALERTS_LABEL_RE.test(t) && RESTYLE_RE.test(t)) runRestyleAlerts(t)
    else if (THRESHOLD_RE.test(t)) runDefineThreshold(t)
    else if (EXPOSURE_RE.test(t)) runAddExposure(t)
    else if (ALERTS_RE.test(t)) runAddAlerts(t)
    else runFollowup(t)
  }
  const sendDirect = (t: string) => {
    const s = (t || "").trim()
    if (!s || generating || asking) return
    routeMessage(s)
  }
  // Starter picks / restricted checks for the empty-state buttons.
  const startWith = (text: string) => {
    if (generating) return
    const r = restrictedRule(text)
    if (r) {
      runBlocked(text, r)
      return
    }
    if (!existing) runInitial(text)
    else if (isComplexChange(text)) startClarify(text)
    else if (ALERTS_LABEL_RE.test(text) && RESTYLE_RE.test(text)) runRestyleAlerts(text)
    else if (THRESHOLD_RE.test(text)) runDefineThreshold(text)
    else if (EXPOSURE_RE.test(text)) runAddExposure(text)
    else if (ALERTS_RE.test(text)) runAddAlerts(text)
    else runFollowup(text)
  }

  const newSession = () => {
    cancelRef.current?.()
    setGenerating(false)
    setAsking(false)
    setAskMode("build")
    pendingText.current = null
    setMessages([])
    setInput("")
    followIdx.current = 0
    liveIds.current.clear()
    inputMsgId.current = null
    autoSent.current = true
  }

  // Expose the imperative API to the builder + preview panel (render-safe: the
  // ref is written after commit so it always points at the latest closures).
  React.useEffect(() => {
    apiRef.current = { fill: fillInput, send: sendDirect, review: runReview, noteDeployed }
  })

  // Initial prompt (guarded against React StrictMode double-mount via autoSent).
  React.useEffect(() => {
    if (existing) {
      onDone?.()
      return () => cancelRef.current?.()
    }
    if (prompt && !autoSent.current) {
      autoSent.current = true
      runInitial(prompt)
    }
    return () => {
      // StrictMode's simulated unmount cancels the scheduled flow before any
      // timer fires — reset the guard so the real mount re-runs the autosend.
      cancelRef.current?.()
      autoSent.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = () => {
    const t = input.trim()
    if (!t || generating || asking) return
    setInput("")
    routeMessage(t)
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="ttl" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <GenieIcon size={16} />
          Genie app builder
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ChatHistoryMenu />
          <IconButton icon={SquarePen} label="New session" onClick={newSession} />
        </div>
      </div>
      <div className="chat-log" ref={logRef}>
        {messages.map((m) =>
          renderMessage(m, {
            liveIds: liveIds.current,
            generating,
            onSuggestion: handleSuggestion,
            onFixAction: handleFixAction,
            requested,
            onRestore: newSession,
            onOpenApp,
          }),
        )}
        {!generating && messages.length === 0 && <ChatEmpty onPick={startWith} existing={existing} />}
        {generating && messages.length === 0 && (
          <div className="thinking">
            <div className="thinking-live">
              <span className="bounce-dots">
                <span />
                <span style={{ animationDelay: "150ms" }} />
                <span style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        {asking &&
          (askMode === "clarify" ? (
            <QuestionCard
              steps={Q_STEPS_ITERATE}
              finishLabel="Apply"
              onComplete={finishClarify}
              onSkip={() =>
                finishClarify(
                  Q_STEPS_ITERATE.reduce<Record<string, string>>(
                    (a, s) => ((a[s.key] = s.def.join(", ")), a),
                    { others: "—" },
                  ),
                )
              }
            />
          ) : (
            <QuestionCard
              onComplete={finishQuestions}
              onSkip={() =>
                finishQuestions(
                  Q_STEPS.reduce<Record<string, string>>(
                    (a, s) => ((a[s.key] = s.def.join(", ")), a),
                    { others: "—" },
                  ),
                )
              }
            />
          ))}
        <div className="chat-input-box">
          <ChatInput
            inputRef={textareaRef}
            value={input}
            onChange={setInput}
            onSubmit={submit}
            disabled={generating}
            placeholder={
              generating
                ? "Generating…"
                : "Ask Genie to build or change something… use [Object name] to reference data"
            }
          />
          <div className="chat-input-toolbar">
            <IconButton icon={Paperclip} label="Attach file" />
            <div style={{ flex: 1 }} />
            <button className="chat-send" disabled={!input.trim() || generating} onClick={submit} aria-label="Submit">
              <ArrowUp className="lucide" />
            </button>
          </div>
        </div>
        <p className="chat-disclaimer">Always review AI-generated content before deploying.</p>
      </div>

      {accessModal && (
        <KitModal onClose={() => setAccessModal(null)}>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 className="dbx-title" style={{ margin: 0 }}>
                Request access on {accessModal.object?.split(".").pop()}
              </h2>
              <p className="mono" style={{ margin: "4px 0 0", fontSize: 12, color: "var(--n9)" }}>
                {accessModal.object}
              </p>
            </div>
            <div style={{ height: 1, background: "rgba(var(--overlay),0.08)" }} />
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: "var(--n9)" }}>Privileges</p>
              <span className="chip">SELECT</span>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: "var(--n9)" }}>
                Access request destinations
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {ACCESS_DESTINATIONS.map((e) => (
                  <li key={e} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--n11)" }}>
                    <span className="dot" style={{ background: "var(--n7)", width: 4, height: 4 }} />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: "var(--n9)" }}>Message</p>
              <textarea
                defaultValue="Please grant me access."
                rows={3}
                style={{
                  width: "100%",
                  resize: "none",
                  padding: "8px 10px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  lineHeight: "18px",
                  color: "var(--n11)",
                  background: "var(--n3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  outline: "none",
                }}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", height: 28 }}
              onClick={() => {
                const item = accessModal
                setRequested((r) => ({ ...r, [item.name]: true }))
                setAccessModal(null)
                runAfterRequest(item)
              }}
            >
              Submit access request
            </button>
          </div>
        </KitModal>
      )}
    </div>
  )
}
