"use client"

import * as React from "react"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  CircleHelp,
  ExternalLink,
  FilePenLine,
  FilePlus,
  Flag,
  Link as LinkIcon,
  Lock,
  Rocket,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Terminal,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { GenieIcon } from "@/components/apps"
import type { ChatMessage, ConnectReportData, SuggestionOption, Tool } from "../types"
import { QUESTIONS_ANSWERED, SHARE_PEOPLE, TOOL_ICON_COLOR, DEFAULT_REPORT } from "./chat-data"
import { renderWithPills } from "./pills"

const TOOL_ICON: Record<Tool["variant"], LucideIcon> = {
  "file-create": FilePlus,
  "file-edit": FilePenLine,
  command: Terminal,
  search: Search,
}

// The gradient "reply" glyph used by suggestion pills that don't set an icon.
function ReplyGlyph() {
  const id = React.useId()
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0.205" stopColor="#4299E0" />
          <stop offset="0.4691" stopColor="#CA42E0" />
          <stop offset="0.795" stopColor="#FF5F46" />
        </linearGradient>
      </defs>
      <polyline points="15 10 20 15 15 20" />
      <path d="M4 4v7a4 4 0 0 0 4 4h12" />
    </svg>
  )
}

export function UserBubble({ text }: { text?: string }) {
  return (
    <div className="bubble-user-row">
      <div className="bubble-user">{renderWithPills(text)}</div>
    </div>
  )
}

export function AITextStream({ text = "", stream }: { text?: string; stream?: boolean }) {
  const [shown, setShown] = React.useState(stream ? "" : text)
  const [done, setDone] = React.useState(!stream)
  React.useEffect(() => {
    if (!stream) return
    let i = 0
    let cancelled = false
    const iv = setInterval(() => {
      if (cancelled) return
      i += 2
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(iv)
        setDone(true)
      }
    }, 16)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
  }, [stream, text])
  return (
    <div className="ai-text">
      {shown}
      {!done && <span className="ai-caret" />}
    </div>
  )
}

export function ThinkingBlock({
  active,
  label,
  duration,
  reasoning,
}: {
  active?: boolean
  label?: string
  duration?: number
  reasoning?: string[]
}) {
  const [open, setOpen] = React.useState(false)
  if (active) {
    return (
      <div className="thinking">
        <div className="thinking-live">
          <span className="thinking-dot">●</span>
          <span>{label || "Thinking"}</span>
          <span className="bounce-dots">
            <span style={{ animationDelay: "0ms" }} />
            <span style={{ animationDelay: "150ms" }} />
            <span style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    )
  }
  return (
    <div className="thinking">
      <button className={`thinking-trigger${open ? " open" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className="thinking-dot">●</span>
        <span>Thought for {duration}s</span>
        <ChevronRight className="lucide chev" style={{ width: 12, height: 12 }} />
      </button>
      {open && (
        <ul className="thinking-reason">
          {(reasoning || []).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ToolGroup({ tools = [] }: { tools?: Tool[] }) {
  const [open, setOpen] = React.useState(false)
  if (tools.length === 0) return null
  const running = tools.some((t) => t.status === "running")
  const fileCount = tools.filter((t) => t.variant.startsWith("file")).length
  const hasCmd = tools.some((t) => t.variant === "command")
  const parts: string[] = []
  if (fileCount) parts.push(`${fileCount} file${fileCount > 1 ? "s" : ""}`)
  if (hasCmd) parts.push("commands")
  const label = (parts.length ? `Edited ${parts.join(" and ")}` : "Actions") + (running ? "…" : "")
  return (
    <div className="tool-group">
      <button className={`tool-trigger${open ? " open" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        {running && (
          <span
            className="spinner"
            style={{ width: 12, height: 12, borderColor: "var(--n7)", borderTopColor: "transparent" }}
          />
        )}
        <ChevronDown className="lucide chev" style={{ width: 12, height: 12 }} />
      </button>
      {open && (
        <div className="tool-list">
          {tools.map((t) => {
            const IconCmp = TOOL_ICON[t.variant]
            return (
              <div key={t.id} className="tool-row">
                <IconCmp className="lucide" style={{ width: 14, height: 14, color: TOOL_ICON_COLOR[t.variant] }} />
                <span className="label">{t.label}</span>
                {t.status === "running" ? (
                  <span
                    className="spinner"
                    style={{ width: 12, height: 12, borderColor: "var(--n7)", borderTopColor: "transparent" }}
                  />
                ) : (
                  <Check className="lucide" style={{ width: 12, height: 12, color: "var(--success-fg)" }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Checkpoint({ label, onRestore }: { label?: string; onRestore: () => void }) {
  return (
    <div className="checkpoint">
      <div className="checkpoint-inner">
        <Flag className="lucide" style={{ width: 12, height: 12, color: "var(--n7)" }} />
        <span className="label" title={label}>
          {label}
        </span>
        <button className="checkpoint-restore" onClick={onRestore}>
          <RotateCcw className="lucide" style={{ width: 12, height: 12 }} />
          Restore
        </button>
      </div>
    </div>
  )
}

export function DeployNote({ url = "", time, onOpenApp }: { url?: string; time?: string; onOpenApp?: () => void }) {
  return (
    <div className="deploy-note">
      <div className="deploy-note-head">
        <Rocket className="lucide" style={{ width: 14, height: 14, color: "var(--success-fg)" }} />
        <span>Deployed to production{time ? " · " + time : ""}</span>
      </div>
      <a
        className="deploy-note-url"
        href={url}
        onClick={(e) => {
          e.preventDefault()
          onOpenApp?.()
        }}
      >
        <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
        <ExternalLink className="lucide" style={{ width: 12, height: 12 }} />
      </a>
    </div>
  )
}

export function ShareCard() {
  const [people, setPeople] = React.useState(SHARE_PEOPLE)
  const [draft, setDraft] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const add = () => {
    const v = draft.trim()
    if (!v) return
    setPeople((p) => [...p, { name: v, detail: v.includes("@") ? v : v + " (group)", role: "Can use", you: false }])
    setDraft("")
  }
  const copy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="share-card">
      <div className="share-gov">
        <ShieldCheck className="lucide" style={{ width: 14, height: 14, color: "var(--n8)", flexShrink: 0, marginTop: 1 }} />
        <span>
          You can only share with people and groups your <b>Space Admin</b> has allowed for this App Space.{" "}
          <a className="share-gov-link" href="#" onClick={(e) => e.preventDefault()}>
            Request more
          </a>
        </span>
      </div>
      <div className="share-add">
        <div className="share-input">
          <UserPlus className="lucide" style={{ width: 14, height: 14, color: "var(--n8)" }} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add()
            }}
            placeholder="Add allowed people or groups"
          />
        </div>
        <button className="btn btn-secondary" onClick={add}>
          Add
        </button>
      </div>
      <div className="share-people">
        {people.map((p) => (
          <div className="share-person" key={p.name + p.detail}>
            <span className="share-avatar">{p.name.charAt(0)}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span className="share-name truncate">
                {p.name}
                {p.you && <span className="share-you"> (you)</span>}
              </span>
              <span className="share-detail truncate">{p.detail}</span>
            </span>
            {p.role === "Owner" ? (
              <span className="share-role-static">Owner</span>
            ) : (
              <span className="share-role">
                {p.role}
                <ChevronDown className="lucide" style={{ width: 12, height: 12, color: "var(--n8)" }} />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="share-foot">
        <span className="share-access">
          <Lock className="lucide" style={{ width: 12, height: 12, color: "var(--n8)" }} />
          Viewers inherit Unity Catalog permissions
        </span>
        <button className="share-copy" onClick={copy}>
          {copied ? (
            <Check className="lucide" style={{ width: 13, height: 13 }} />
          ) : (
            <LinkIcon className="lucide" style={{ width: 13, height: 13 }} />
          )}
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  )
}

export function PolicyBlock({ cap, policy }: { cap?: string; policy?: string }) {
  const [requested, setRequested] = React.useState(false)
  return (
    <div className="policy-block">
      <div className="policy-block-head">
        <CircleAlert className="lucide" style={{ width: 16, height: 16, color: "var(--danger-fg)", flexShrink: 0 }} />
        <span>Action blocked by admin</span>
        <span className="policy-block-badge">Restricted</span>
      </div>
      <div className="policy-block-body">
        Your workspace admin restricts {cap} in this App Space, so I can&apos;t make that change.
      </div>
      <div className="policy-block-policy">
        <Lock className="lucide" style={{ width: 11, height: 11 }} />
        {policy}
      </div>
      <div className="policy-block-actions">
        {requested ? (
          <span className="policy-requested">
            <Check className="lucide" style={{ width: 12, height: 12, color: "var(--success-fg)" }} />
            Exception requested
          </span>
        ) : (
          <button className="fix-btn" onClick={() => setRequested(true)}>
            <Send className="lucide" style={{ width: 12, height: 12, color: "var(--n9)" }} />
            Request an exception
          </button>
        )}
      </div>
    </div>
  )
}

export function GenieInputBlock({ status, answers }: { status?: string; answers?: [string, string][] }) {
  const answered = status === "answered"
  return (
    <>
      {!answered && (
        <div className="ai-text">
          I need a few details to tailor this. I&apos;ve added a short form on the right — fill it in and I&apos;ll draft
          the app with mock data.
        </div>
      )}
      <div className="q-pill">
        {answered ? (
          <CircleCheckBig className="lucide" style={{ width: 15, height: 15, color: "var(--success-fg)" }} />
        ) : (
          <CircleHelp className="lucide" style={{ width: 15, height: 15, color: "var(--n9)" }} />
        )}
        <span className="q-txt">{answered ? "Genie reviewed your answers" : "Genie needs your input"}</span>
        <ArrowRight className="lucide" style={{ width: 14, height: 14, color: "var(--n9)" }} />
      </div>
      {answered && (
        <div className="q-summary">
          <div className="lead">Questions answered</div>
          {(answers || QUESTIONS_ANSWERED).map(([k, v]) => (
            <div key={k}>
              <b>{k}:</b> {v}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export function Suggestions({
  options = [],
  disabled,
  onPick,
}: {
  options?: SuggestionOption[]
  disabled?: boolean
  onPick: (action: string) => void
}) {
  return (
    <div className="suggestions">
      {options.map((o) => {
        const IconCmp = o.icon
        return (
          <button key={o.action} className="suggestion" disabled={disabled} onClick={() => onPick(o.action)}>
            {IconCmp ? (
              <IconCmp className="lucide" style={{ width: 14, height: 14, color: "var(--n9)", flexShrink: 0 }} />
            ) : (
              <ReplyGlyph />
            )}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function CGroup({
  title,
  count,
  tone,
  defaultOpen,
  children,
}: {
  title: string
  count: string
  tone: "ok" | "bad"
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(!!defaultOpen)
  const c = tone === "ok" ? "var(--success-fg)" : "var(--danger-fg)"
  return (
    <div className="cgroup">
      <button className={`cgroup-head${open ? " open" : ""}`} onClick={() => setOpen((v) => !v)}>
        {tone === "ok" ? (
          <CircleCheckBig className="lucide" style={{ width: 15, height: 15, color: c }} />
        ) : (
          <CircleAlert className="lucide" style={{ width: 15, height: 15, color: c }} />
        )}
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, textAlign: "left" }}>{title}</span>
        <span
          className="count-pill"
          style={{
            background: tone === "ok" ? "rgba(48,160,80,0.12)" : "rgba(196,64,64,0.12)",
            color: c,
          }}
        >
          {count}
        </span>
        <ChevronDown className="lucide chev" style={{ width: 14, height: 14, color: "var(--n8)" }} />
      </button>
      {open && <div className="cgroup-body">{children}</div>}
    </div>
  )
}

export function ConnectReport({
  onAction,
  requested,
  data,
}: {
  onAction: (a: ConnectReportData["attention"][number]) => void
  requested?: Record<string, boolean>
  data?: ConnectReportData
}) {
  const d = data || DEFAULT_REPORT
  return (
    <div className="creport">
      <div className="creport-meter">
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 23, fontWeight: 500, color: "var(--n12)", fontFeatureSettings: '"tnum"' }}>
            {d.count}
          </span>
          <span style={{ fontSize: 13, color: "var(--n9)" }}>
            of {d.total} {d.total === 4 ? "inputs" : "metrics"} connected
          </span>
        </div>
        <div className="creport-bar" style={{ marginBottom: 8 }}>
          {Array.from({ length: d.total }).map((_, i) => (
            <i key={i} style={{ background: i < d.count ? "var(--success-fg)" : "rgba(var(--overlay),0.10)" }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--n9)" }}>{d.note}</div>
      </div>

      <CGroup title="Confirmed possible" count={String(d.confirmed.length)} tone="ok" defaultOpen>
        {d.confirmed.map((c) => (
          <div key={c.name} className="crow">
            <span style={{ minWidth: 0, flex: 1, color: "var(--n10)" }} className="truncate">
              {c.name}
            </span>
            <span className="chip-table">{c.table}</span>
          </div>
        ))}
      </CGroup>

      <CGroup title="Needs attention" count={String(d.attention.length)} tone="bad" defaultOpen>
        {d.attention.map((a) => {
          const IconCmp = a.icon
          return (
            <div key={a.name} className="crow-attn">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, color: "var(--n11)" }}>{a.name}</span>
                {requested && requested[a.name] ? (
                  <span
                    className="count-pill"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      height: 22,
                      padding: "0 8px",
                      background: "rgba(48,160,80,0.12)",
                      color: "var(--success-fg)",
                    }}
                  >
                    <Check className="lucide" style={{ width: 12, height: 12, color: "var(--success-fg)" }} />
                    Request sent
                  </span>
                ) : (
                  <button className="fix-btn" onClick={() => onAction(a)}>
                    <IconCmp className="lucide" style={{ width: 12, height: 12, color: "var(--n9)" }} />
                    {a.action}
                  </button>
                )}
              </div>
              <div style={{ color: "var(--n9)", fontSize: 12, marginTop: 2 }}>{a.reason}</div>
            </div>
          )
        })}
      </CGroup>
    </div>
  )
}

// Chat empty state (builder opened without a prompt).
export function ChatEmpty({ onPick, existing }: { onPick: (s: string) => void; existing?: boolean }) {
  const title = existing ? "What do you want to change?" : "What do you want to build?"
  const desc = existing
    ? "Describe a change and Genie updates your app live."
    : "Describe an app and Genie drafts it live with mock data."
  const starters = existing
    ? ["Add an exposure section", "Show only stores that need attention", "Add a date range filter"]
    : [
        "Build a capacity planning app",
        "Build a sales dashboard from Unity Catalog",
        "Build an AI chatbot over my docs",
      ]
  return (
    <div className="chat-empty">
      <GenieIcon size={28} />
      <div className="chat-empty-title">{title}</div>
      <div className="chat-empty-desc">{desc}</div>
      <div className="chat-empty-prompts">
        {starters.slice(0, 3).map((s) => (
          <button key={s} className="suggestion" onClick={() => onPick(s)}>
            <ReplyGlyph />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export function renderMessage(
  m: ChatMessage,
  ctx: {
    liveIds: Set<string>
    generating: boolean
    onSuggestion: (action: string) => void
    onFixAction: (a: ConnectReportData["attention"][number]) => void
    requested: Record<string, boolean>
    onRestore: () => void
    onOpenApp?: () => void
  },
) {
  switch (m.kind) {
    case "user":
      return <UserBubble key={m.id} text={m.text} />
    case "genie-input":
      return <GenieInputBlock key={m.id} status={m.status} answers={m.answers} />
    case "thinking":
      return (
        <ThinkingBlock key={m.id} active={m.active} label={m.label} duration={m.duration} reasoning={m.reasoning} />
      )
    case "ai-text":
      return <AITextStream key={m.id} text={m.text} stream={ctx.liveIds.has(m.id)} />
    case "suggestions":
      return <Suggestions key={m.id} options={m.options} disabled={ctx.generating} onPick={ctx.onSuggestion} />
    case "connect-report":
      return <ConnectReport key={m.id} onAction={ctx.onFixAction} requested={ctx.requested} data={m.data} />
    case "tool-group":
      return <ToolGroup key={m.id} tools={m.tools} />
    case "checkpoint":
      return <Checkpoint key={m.id} label={m.label} onRestore={ctx.onRestore} />
    case "deploy-note":
      return <DeployNote key={m.id} url={m.url} time={m.time} onOpenApp={ctx.onOpenApp} />
    case "share-card":
      return <ShareCard key={m.id} />
    case "policy-block":
      return <PolicyBlock key={m.id} cap={m.cap} policy={m.policy} />
    default:
      return null
  }
}
