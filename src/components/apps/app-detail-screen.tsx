"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AppWindow,
  BarChart2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleCheckBig,
  Clock,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileText,
  GitCommitHorizontal,
  Info,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { statusTag, type DemoApp } from "@/lib/apps-data"
import { useApps } from "@/app/apps/apps-provider"
import { AppTopBar, type SwitcherAction } from "./app-top-bar"
import { GenieIcon } from "./genie-icon"
import { GeniePanel } from "./genie-panel"
import { KitDropdown, KitDropdownItem, KitDropdownSep, KitModal, KitPageHeader, Metric, Tag } from "./primitives"
import { SettingsPanel } from "./settings-panel"

const DETAIL_NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "authorization", label: "Authorization", icon: Shield },
  { id: "deployments", label: "Deployments", icon: Rocket },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "environment", label: "Environment", icon: Database },
  { id: "insights", label: "Insights", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
]

const DEPLOY_EVENTS = [
  "Stopped app successfully",
  "Source code downloaded",
  "App spec loaded",
  "Packages installed",
  "Built successfully",
]
const USAGE = [3, 5, 4, 7, 6, 8, 5, 9, 7, 10, 8, 11, 9, 10, 8, 12, 9, 11, 10, 13]
const LATENCY = [80, 72, 68, 75, 70, 65, 60, 58, 62, 55, 50, 48, 52, 47, 45, 43, 46, 44, 42, 45]
const COLDSTART = [130, 125, 122, 128, 120, 118, 122, 119, 121, 120, 118, 122, 120, 119, 121, 120, 118, 120, 119, 120]

type DeployRef = React.MutableRefObject<(() => void) | null>

function DetailNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <aside className="detail-nav">
      <nav role="tablist">
        {DETAIL_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            className={`nav-item${active === item.id ? " active" : ""}`}
            onClick={() => onSelect(item.id)}
          >
            <item.icon className="lucide" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 256,
        gap: 8,
        color: "var(--n9)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-lg)",
          background: "var(--n2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FileText className="lucide" style={{ width: 20, height: 20, color: "var(--n8)" }} />
      </div>
      <p style={{ fontSize: 13, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 12, color: "var(--n8)", margin: 0 }}>Coming soon</p>
    </div>
  )
}

/* ── Logs ─────────────────────────────────────────────────── */
const LOG_ROWS: [string, "info" | "warn" | "error", string][] = [
  ["12:04:19.882", "info", "Starting container for app dais-cup-inventory"],
  ["12:04:20.114", "info", "Installing dependencies from requirements.txt"],
  ["12:04:22.507", "info", "Collected 24 packages"],
  ["12:04:24.930", "warn", "Pin your dependencies — 'databricks-sdk' is unpinned"],
  ["12:04:25.661", "info", "Starting uvicorn on 0.0.0.0:8000"],
  ["12:04:25.998", "error", "Traceback (most recent call last): app.py line 42"],
  ["12:04:25.999", "error", "KeyError: 'DATABRICKS_WAREHOUSE_ID' is not set in the environment"],
  ["12:04:26.001", "error", "Application startup failed — worker exited with code 3"],
  ["12:04:31.204", "info", "Restarting worker (attempt 1 of 3)"],
  ["12:04:31.540", "error", "KeyError: 'DATABRICKS_WAREHOUSE_ID' is not set in the environment"],
]
const LOG_LEVEL_COLOR: Record<string, string> = {
  info: "var(--n8)",
  warn: "var(--warning-fg)",
  error: "var(--danger-fg)",
}

function LogsPanel({ deployRef }: { deployRef: DeployRef }) {
  const [level, setLevel] = React.useState("all")
  const [q, setQ] = React.useState("")
  const [phase, setPhase] = React.useState<"idle" | "fixing" | "fixed">("idle")
  const [fixEvents, setFixEvents] = React.useState<string[]>([])
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const rows = LOG_ROWS.filter(
    (r) => (level === "all" || r[1] === level) && (!q || r[2].toLowerCase().includes(q.toLowerCase())),
  )
  const errorCount = LOG_ROWS.filter((r) => r[1] === "error").length

  const fixWithGenie = () => {
    setPhase("fixing")
    setFixEvents([])
    const steps = [
      "Reading the last 200 log lines…",
      "Found: DATABRICKS_WAREHOUSE_ID missing from the environment",
      "Added DATABRICKS_WAREHOUSE_ID to Environment variables",
      "Patched app.py to fail gracefully when unset",
    ]
    steps.forEach((s, i) => timers.current.push(setTimeout(() => setFixEvents((p) => [...p, s]), 500 + i * 750)))
    timers.current.push(setTimeout(() => setPhase("fixed"), 500 + steps.length * 750 + 400))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div className="search-input" style={{ width: 240 }}>
          <Search className="lucide" />
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter logs" />
        </div>
        <div className="segmented">
          {["all", "info", "warn", "error"].map((l) => (
            <button
              key={l}
              type="button"
              className={`seg-item${level === l ? " active" : ""}`}
              onClick={() => setLevel(l)}
              style={{ textTransform: "capitalize" }}
            >
              {l}
              {l === "error" ? ` (${errorCount})` : ""}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn btn-outline" style={{ height: 28 }}>
          <Download className="lucide" />
          Download
        </button>
        <button type="button" className="btn btn-outline" style={{ height: 28 }}>
          <RefreshCw className="lucide" />
          Live tail
        </button>
      </div>

      {/* Error banner + Fix with Genie */}
      {errorCount > 0 && phase !== "fixed" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            background: "rgba(196,64,64,0.10)",
            border: "1px solid rgba(196,64,64,0.24)",
          }}
        >
          <CircleAlert className="lucide" style={{ width: 16, height: 16, color: "var(--danger-fg)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--n11)", flex: 1 }}>
            {errorCount} errors detected — app startup is failing on a missing environment variable.
          </span>
          <button
            type="button"
            className="btn"
            style={{ background: "rgba(var(--overlay),0.08)", color: "var(--n11)", height: 26 }}
            onClick={fixWithGenie}
            disabled={phase === "fixing"}
          >
            <GenieIcon size={14} />
            {phase === "fixing" ? "Fixing…" : "Fix with Genie"}
          </button>
        </div>
      )}

      {/* Genie fix progress */}
      {phase === "fixing" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--n1)",
          }}
        >
          {fixEvents.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--n10)" }}>
              <Check className="lucide" style={{ width: 13, height: 13, color: "var(--success-fg)" }} />
              {e}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--n9)" }}>
            <span className="spinner" style={{ width: 12, height: 12 }} />
            Working…
          </div>
        </div>
      )}

      {/* Fixed → suggest Deploy */}
      {phase === "fixed" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            background: "rgba(48,160,80,0.10)",
            border: "1px solid rgba(48,160,80,0.24)",
          }}
        >
          <CircleCheckBig className="lucide" style={{ width: 16, height: 16, color: "var(--success-fg)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--n11)", flex: 1 }}>
            Genie fixed the missing variable and patched startup. Deploy to apply the fix.
          </span>
          <div className="btn-split">
            <button type="button" className="btn btn-primary" style={{ height: 26 }} onClick={() => deployRef.current?.()}>
              Deploy
            </button>
            <span className="divider" />
            <button type="button" className="btn btn-primary" style={{ padding: "0 6px", height: 26 }}>
              <ChevronDown className="lucide" />
            </button>
          </div>
        </div>
      )}

      {/* Log list */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--n1)" }}>
        {rows.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", fontSize: 12, color: "var(--n9)" }}>No matching log lines</div>
        ) : (
          rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "5px 12px",
                borderTop: i ? "1px solid rgba(var(--overlay),0.05)" : "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                lineHeight: "17px",
                background: r[1] === "error" ? "rgba(196,64,64,0.05)" : "transparent",
              }}
            >
              <span style={{ color: "var(--n7)", flexShrink: 0 }}>{r[0]}</span>
              <span
                style={{
                  color: LOG_LEVEL_COLOR[r[1]],
                  flexShrink: 0,
                  width: 38,
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                {r[1]}
              </span>
              <span style={{ color: r[1] === "error" ? "var(--n11)" : "var(--n9)", minWidth: 0 }}>{r[2]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ── Overview (status card + deploy simulation + metrics) ── */
function Overview({ app, deployRef }: { app: DemoApp; deployRef: DeployRef }) {
  const [deploying, setDeploying] = React.useState(false)
  const [progress, setProgress] = React.useState(100)
  const [events, setEvents] = React.useState<string[]>(DEPLOY_EVENTS)
  const [elapsed, setElapsed] = React.useState(154)
  const [copied, setCopied] = React.useState(false)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const url = `${app.name}.databricksapps.com`

  React.useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearInterval)
  }, [])

  const deploy = React.useCallback(() => {
    setDeploying(true)
    setProgress(0)
    setEvents([])
    setElapsed(0)
    const total = 6000
    let tick = 0
    const pt = setInterval(() => {
      tick += 100
      setProgress(Math.min(100, (tick / total) * 100))
      if (tick >= total) clearInterval(pt)
    }, 100)
    const et = setInterval(() => setElapsed((e) => e + 1), 1000)
    timers.current.push(pt, et)
    ;[300, 1400, 2700, 4100, 5400].forEach((d, i) =>
      timers.current.push(setTimeout(() => setEvents((p) => [...p, DEPLOY_EVENTS[i]]), d)),
    )
    timers.current.push(
      setTimeout(() => {
        setDeploying(false)
        setProgress(100)
        clearInterval(et)
      }, 6200),
    )
  }, [])

  // Register the deploy trigger so the top bar / logs tab can start it.
  React.useEffect(() => {
    deployRef.current = deploy
    return () => {
      deployRef.current = null
    }
  }, [deploy, deployRef])

  const copy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Status card */}
      <div className="kit-card" style={{ display: "flex", minHeight: 140 }}>
        <div style={{ width: 240, flexShrink: 0, alignSelf: "stretch", background: app.gradient }} />
        <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--n9)", margin: 0 }}>App status</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {deploying ? (
                <Tag variant="warning">
                  <span className="dot dot-pulse" style={{ background: "var(--warning)" }} />
                  Deploying
                </Tag>
              ) : (
                <Tag variant="success">
                  <span className="dot" style={{ background: "var(--success)" }} />
                  Running
                </Tag>
              )}
              <span style={{ fontSize: 13, color: "var(--n9)" }} className="truncate">
                https://{url}
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                <button type="button" className="btn-icon" aria-label="Copy URL" onClick={copy}>
                  {copied ? <CheckCircle2 className="lucide" /> : <Copy className="lucide" />}
                </button>
                <button type="button" className="btn-icon" aria-label="Open in new tab">
                  <ExternalLink className="lucide" />
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--n9)", margin: 0 }}>Source</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--n9)" }} className="truncate">
                github.com/org/{app.name}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--n9)" }}>
                <GitCommitHorizontal className="lucide" style={{ width: 12, height: 12 }} />
                main
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment card */}
      <div className="kit-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 16px 10px",
            borderBottom: "1px solid rgba(var(--overlay),0.08)",
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>Deployment</h3>
          <Info className="lucide" style={{ color: "var(--n9)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontSize: 13 }}>
          {deploying ? (
            <span className="spinner" />
          ) : (
            <CheckCircle2 className="lucide" style={{ color: "var(--success-fg)" }} />
          )}
          <code className="inline">...9c7a3f</code>
          <Tag variant="secondary">Production</Tag>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--n9)" }}>
            <GitCommitHorizontal className="lucide" style={{ width: 12, height: 12 }} />
            main · ...9c7a3f
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "var(--n9)" }}>2 min ago</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--n9)" }} className="num">
            <Clock className="lucide" style={{ width: 12, height: 12 }} />
            {Math.floor(elapsed / 60)}m {elapsed % 60}s
          </span>
        </div>
        <div style={{ height: 2, background: "var(--n2)" }}>
          <div style={{ height: "100%", background: "var(--success)", width: `${progress}%`, transition: "width 400ms linear" }} />
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {events.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--n9)", margin: 0 }}>Starting deployment…</p>
          ) : (
            events.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
                <CheckCircle2 className="lucide" style={{ color: "var(--success-fg)" }} />
                <span style={{ color: "var(--n11)" }}>{e}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Metrics */}
      {!deploying && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <Metric label="Usage" value="72" change="+0.3" data={USAGE} color="var(--success)" />
          <Metric label="P99 Latency" value="45ms" change="-2ms" data={LATENCY} color="var(--danger)" />
          <Metric label="Cold start" value="120ms" change="+0.3" data={COLDSTART} color="var(--n7)" />
        </div>
      )}
    </div>
  )
}

function MetadataPanel() {
  const [copied, setCopied] = React.useState(false)
  return (
    <aside style={{ width: 240, flexShrink: 0, overflowY: "auto" }}>
      <section style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>About the app</p>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 12, rowGap: 6, fontSize: 13 }}>
          <span style={{ color: "var(--n9)" }}>Creator</span>
          <span style={{ color: "var(--n11)" }} className="truncate">
            user@example.com
          </span>
          <span style={{ color: "var(--n9)" }}>Created</span>
          <span style={{ color: "var(--n11)" }}>Just now</span>
          <span style={{ color: "var(--n9)" }}>Updated</span>
          <span style={{ color: "var(--n11)" }}>Just now</span>
          <span style={{ color: "var(--n9)" }}>App ID</span>
          <span style={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
            <span className="mono truncate" style={{ fontSize: 12, color: "var(--n11)" }}>
              5e9b9b9b-6b1a…
            </span>
            <button
              type="button"
              className="btn-icon"
              aria-label="Copy App ID"
              onClick={() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
            >
              {copied ? <CheckCircle2 className="lucide" /> : <Copy className="lucide" />}
            </button>
          </span>
        </div>
      </section>
      <div style={{ height: 1, background: "rgba(var(--overlay),0.08)", margin: "0 16px" }} />
      <section style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>Compute</p>
        <p style={{ fontSize: 13, color: "var(--n9)", margin: 0 }}>Medium (2 vCPUs, 6 GB memory)</p>
      </section>
      <div style={{ height: 1, background: "rgba(var(--overlay),0.08)", margin: "0 16px" }} />
      <section style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>Tags</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Tag variant="default" size="sm">
            key: value
          </Tag>
          <Tag variant="default" size="sm">
            production
          </Tag>
        </div>
      </section>
    </aside>
  )
}

/* ── Full-screen app detail ───────────────────────────────── */
export function AppDetailScreen({ appId }: { appId: string }) {
  const router = useRouter()
  const { apps, getApp, deleteApp } = useApps()
  const app = getApp(appId)

  const [tab, setTab] = React.useState("overview")
  const [navOpen, setNavOpen] = React.useState(true)
  const [del, setDel] = React.useState(false)
  const [share, setShare] = React.useState(false)
  const [genieOpen, setGenieOpen] = React.useState(false)
  const deployRef = React.useRef<(() => void) | null>(null)
  const retryTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (!app) router.replace("/apps/list")
  }, [app, router])
  React.useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current)
  }, [])

  if (!app) return null

  const tabLabel = DETAIL_NAV.find((n) => n.id === tab)?.label ?? "Overview"
  const onBack = () => router.push("/apps/list")
  const onOpenBuilder = () => router.push(`/apps/${app.id}/builder`)

  const triggerDeploy = () => {
    if (tab !== "overview") setTab("overview")
    // wait for Overview to mount and register the deploy trigger
    const run = (n = 0) => {
      if (deployRef.current) deployRef.current()
      else if (n < 20) retryTimer.current = setTimeout(() => run(n + 1), 30)
    }
    run()
  }

  const switcherActions: SwitcherAction[] = [
    { id: "deploy", label: "Deploy", icon: Rocket, primary: true, onClick: triggerDeploy },
    { id: "share", label: "Share", icon: Share2, inline: true, onClick: () => setShare(true) },
    { id: "open", label: "Open app", icon: ExternalLink, onClick: () => window.open(`/apps/${app.id}/preview`, "_blank") },
    { id: "edit", label: "Edit", icon: Pencil },
    ...(app.status === "building"
      ? [{ id: "builder", label: "Open in builder", icon: Sparkles, onClick: onOpenBuilder } as SwitcherAction]
      : []),
    { id: "delete", label: "Delete", icon: Trash2, danger: true, onClick: () => setDel(true) },
  ]

  return (
    <div className="shell">
      <AppTopBar
        onToggleSidebar={() => setNavOpen((v) => !v)}
        crumbs={[
          { label: "Apps", onClick: onBack },
          {
            label: app.name,
            leaf: true,
            switcher: {
              placeholder: "Find an app",
              items: apps.map((a) => ({ id: a.id, name: a.name, sub: a.space, icon: AppWindow })),
              currentId: app.id,
              onSelect: (id) => router.push(`/apps/${id}`),
              actions: switcherActions,
            },
          },
        ]}
        env
        genie
        genieOpen={genieOpen}
        onToggleGenie={() => setGenieOpen((v) => !v)}
      />

      <div className="shell-body">
        {navOpen && <DetailNav active={tab} onSelect={setTab} />}
        <main
          className="shell-main"
          style={{ marginLeft: navOpen ? 0 : 8, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <div style={{ padding: "16px 24px", flexShrink: 0, borderBottom: "1px solid rgba(var(--overlay),0.08)" }}>
            <KitPageHeader
              title={tabLabel}
              actions={
                tab === "overview" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <KitDropdown
                      align="end"
                      trigger={
                        <button type="button" className="btn-icon" aria-label="More actions">
                          <MoreHorizontal className="lucide" />
                        </button>
                      }
                    >
                      <KitDropdownItem>Edit</KitDropdownItem>
                      <KitDropdownSep />
                      <KitDropdownItem icon={Trash2} danger onClick={() => setDel(true)}>
                        Delete
                      </KitDropdownItem>
                    </KitDropdown>
                    <Button variant="ghost" size="sm" onClick={() => setShare(true)}>
                      <Share2 />
                      Share
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(`/apps/${app.id}/preview`, "_blank")}
                    >
                      <ExternalLink />
                      Open app
                    </Button>
                    {app.status === "building" && (
                      <button
                        type="button"
                        className="btn"
                        style={{ background: "rgba(var(--overlay),0.08)", color: "var(--n11)" }}
                        onClick={onOpenBuilder}
                      >
                        <GenieIcon size={14} />
                        Open in builder
                      </button>
                    )}
                    <div className="btn-split">
                      <button type="button" className="btn btn-primary" onClick={() => deployRef.current?.()}>
                        Deploy
                      </button>
                      <span className="divider" />
                      <button type="button" className="btn btn-primary" style={{ padding: "0 6px" }}>
                        <ChevronDown className="lucide" />
                      </button>
                    </div>
                  </div>
                ) : null
              }
            />
          </div>
          <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: tab === "settings" ? 0 : "16px 24px 24px" }}>
              {tab === "overview" ? (
                <Overview app={app} deployRef={deployRef} />
              ) : tab === "logs" ? (
                <LogsPanel deployRef={deployRef} />
              ) : tab === "settings" ? (
                <SettingsPanel app={app} />
              ) : (
                <Placeholder label={tabLabel} />
              )}
            </div>
            {tab === "overview" && <MetadataPanel />}
          </div>
        </main>
        {genieOpen && <GeniePanel onClose={() => setGenieOpen(false)} />}
      </div>

      {del && (
        <KitModal onClose={() => setDel(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>Delete app?</h2>
              <p style={{ fontSize: 13, color: "var(--n9)", margin: 0 }}>
                <span style={{ fontWeight: 500, color: "var(--n11)" }}>{app.name}</span> will be permanently deleted.
                This cannot be undone.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => setDel(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteApp(app.id)
                  onBack()
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </KitModal>
      )}
      {share && (
        <KitModal onClose={() => setShare(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--n11)", margin: 0 }}>Share</h2>
            <input className="input" placeholder="Add users, groups, or service principals" />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="input" style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <span className="mono truncate" style={{ color: "var(--n9)" }}>
                  https://{app.name}.databricksapps.com
                </span>
              </div>
              <Button variant="default" size="sm">
                <Copy />
                Copy link
              </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="ghost" size="sm" onClick={() => setShare(false)}>
                Done
              </Button>
            </div>
          </div>
        </KitModal>
      )}
    </div>
  )
}
