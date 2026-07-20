"use client"

import * as React from "react"
import {
  ClipboardList,
  Code2,
  ExternalLink,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Monitor,
  MousePointerClick,
  Plus,
  RefreshCw,
  Smartphone,
  Tablet,
  Terminal,
  X,
  type LucideIcon,
} from "lucide-react"
import { GenieIcon } from "@/components/apps"
import { BrickstoreApp, BSPortalContext } from "@/components/brickstore"
import { IconButton } from "../icon-button"
import type { PreviewApi, QuestionnaireAnswers } from "../types"
import { ADDABLE, CATALOG_TREE, DATABASE_TREE, FILE_CONTENTS, FILE_TREE } from "./preview-data"
import { TreeRows } from "./tree-rows"
import { DataPanel, AgentsPanel } from "./schema-view"
import { Questionnaire } from "./questionnaire"
import { SpecSummary } from "./spec-summary"

type Device = "laptop" | "tablet" | "mobile"
const DEVICE_W: Record<Device, number | null> = { laptop: null, tablet: 768, mobile: 390 }
const DEVICE_ICON: Record<Device, LucideIcon> = { laptop: Monitor, tablet: Tablet, mobile: Smartphone }
const DEVICE_ORDER: Device[] = ["laptop", "tablet", "mobile"]

interface PreviewPanelProps {
  appId: string
  isDone: boolean
  needsInput: boolean
  spec: QuestionnaireAnswers | null
  todos: string[]
  extras: string[]
  threshold: number | null
  apiRef: React.MutableRefObject<PreviewApi | null>
  onSubmitInput: (answers: QuestionnaireAnswers) => void
  onSendToChat: (label: string, text: string) => void
  onTip: (t: string) => void
}

export function PreviewPanel({
  appId,
  isDone,
  needsInput,
  spec,
  todos,
  extras,
  apiRef,
  onSubmitInput,
  onSendToChat,
}: PreviewPanelProps) {
  const [tab, setTab] = React.useState("preview")
  const [added, setAdded] = React.useState<string[]>([])
  const [addOpen, setAddOpen] = React.useState(false)
  const [activeFile, setActiveFile] = React.useState("src/app/page.tsx")
  const [openFiles, setOpenFiles] = React.useState([{ id: "src/app/page.tsx", name: "page.tsx" }])
  const [catId, setCatId] = React.useState("main/analytics/users")
  const [dbId, setDbId] = React.useState("prod/public/users")
  const [agentId, setAgentId] = React.useState("summarizer")
  const [consoleOpen, setConsoleOpen] = React.useState(false)
  const [consoleTab, setConsoleTab] = React.useState("console")
  const [device, setDevice] = React.useState<Device>("laptop")
  const [refreshKey, setRefreshKey] = React.useState(0)

  // ── Inline editing (select a preview component → comment or send to Genie) ──
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const [canvasEl, setCanvasEl] = React.useState<HTMLDivElement | null>(null)
  const setCanvas = React.useCallback((el: HTMLDivElement | null) => {
    canvasRef.current = el
    setCanvasEl(el)
  }, [])
  const [selecting, setSelecting] = React.useState(false)
  const [hoverLabel, setHoverLabel] = React.useState<string | null>(null)
  const [sel, setSel] = React.useState<{ label: string } | null>(null)
  const [draft, setDraft] = React.useState("")
  const [comments] = React.useState<Record<string, string>>({})
  const [, bumpTick] = React.useState(0)
  const bump = React.useCallback(() => bumpTick((n) => n + 1), [])

  React.useEffect(() => {
    if (tab !== "preview") {
      setSelecting(false)
      setSel(null)
      setHoverLabel(null)
    }
  }, [tab])
  React.useEffect(() => {
    if (needsInput) setTab("questions")
    else setTab((t) => (t === "questions" ? "preview" : t))
  }, [needsInput])
  React.useEffect(() => {
    if (!selecting && !sel && Object.keys(comments).length === 0) return
    const c = canvasEl
    if (!c) return
    c.addEventListener("scroll", bump, true)
    window.addEventListener("resize", bump)
    return () => {
      c.removeEventListener("scroll", bump, true)
      window.removeEventListener("resize", bump)
    }
  }, [selecting, sel, comments, bump, canvasEl])

  const rectFor = (label: string) => {
    const c = canvasEl
    if (!c) return null
    const el = c.querySelector('[data-cmp="' + label + '"]')
    if (!el) return null
    const cr = c.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { left: r.left - cr.left, top: r.top - cr.top, width: r.width, height: r.height }
  }
  const onCanvasMove = (e: React.MouseEvent) => {
    if (!selecting) return
    const el = (e.target as HTMLElement).closest("[data-cmp]")
    setHoverLabel(el ? el.getAttribute("data-cmp") : null)
  }
  const onCanvasClick = (e: React.MouseEvent) => {
    if (!selecting) return
    const el = (e.target as HTMLElement).closest("[data-cmp]")
    if (el) {
      e.preventDefault()
      e.stopPropagation()
      const label = el.getAttribute("data-cmp") as string
      setSel({ label })
      setDraft(comments[label] || "")
    }
  }
  const closeEditor = () => {
    setSel(null)
    setDraft("")
  }
  const sendToGenie = () => {
    if (!sel) return
    onSendToChat(sel.label, draft.trim())
    setSelecting(false)
    closeEditor()
  }

  // Open the running app in a new tab (real Next route — no Blob-URL snapshot).
  const openPreview = React.useCallback(() => {
    if (typeof window === "undefined") return
    const qs = extras.length ? `?extras=${extras.join(",")}` : ""
    window.open(`/apps/${appId}/preview${qs}`, "_blank")
  }, [appId, extras])

  // Exposed so the chat panel + top bar can drive the preview.
  React.useEffect(() => {
    apiRef.current = {
      startSelect: () => {
        setTab("preview")
        setSel(null)
        setHoverLabel(null)
        setSelecting(true)
      },
      openPreview,
      gotoPreview: () => {
        setTab("preview")
        setTimeout(() => {
          const c = canvasRef.current
          if (!c) return
          const scroller = c.querySelector(".dash") as HTMLElement | null
          const el =
            (c.querySelector("#sec-money") as HTMLElement | null) ||
            (c.querySelector('[data-cmp="Low-stock reorder alerts"]') as HTMLElement | null)
          if (scroller && el) scroller.scrollTo({ top: Math.max(0, el.offsetTop - 80), behavior: "smooth" })
        }, 160)
      },
    }
  })

  const available = ADDABLE.filter((t) => !added.includes(t.id))
  const openFile = (id: string) => {
    const name = id.split("/").pop() as string
    setOpenFiles((p) => (p.find((t) => t.id === id) ? p : [...p, { id, name }]))
    setActiveFile(id)
  }
  const closeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenFiles((p) => {
      const n = p.filter((t) => t.id !== id)
      if (activeFile === id && n.length) setActiveFile(n[n.length - 1].id)
      return n
    })
  }

  const deviceW = DEVICE_W[device]

  return (
    <div className="preview-panel">
      <div className="pv-toolbar">
        <div className="pv-tabgroup">
          {([
            ["preview", Monitor, "Preview"],
            ["code", Code2, "Code"],
          ] as [string, LucideIcon, string][]).map(([id, IconCmp, title]) => (
            <button key={id} className={`pv-tab${tab === id ? " active" : ""}`} title={title} onClick={() => setTab(id)}>
              <IconCmp className="lucide" />
            </button>
          ))}
          <button className={`pv-tab${tab === "questions" ? " active" : ""}`} title="Plan" onClick={() => setTab("questions")}>
            <ListChecks className="lucide" />
          </button>
          {added.map((id) => {
            const t = ADDABLE.find((a) => a.id === id)
            if (!t) return null
            const IconCmp = t.icon
            return (
              <button key={id} className={`pv-tab${tab === id ? " active" : ""}`} title={t.label} onClick={() => setTab(id)}>
                <IconCmp className="lucide" />
                <span
                  className="close-badge"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAdded((p) => p.filter((x) => x !== id))
                    if (tab === id) setTab("preview")
                  }}
                >
                  <X className="lucide" style={{ width: 10, height: 10 }} />
                </span>
              </button>
            )
          })}
          {available.length > 0 && (
            <div style={{ position: "relative" }}>
              <button className="pv-tab" title="Add panel" onClick={() => setAddOpen((v) => !v)} style={{ color: "var(--n7)" }}>
                <Plus className="lucide" />
              </button>
              {addOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAddOpen(false)} />
                  <div className="pv-addmenu">
                    {available.map((t) => {
                      const IconCmp = t.icon
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setAdded((p) => [...p, t.id])
                            setTab(t.id)
                            setAddOpen(false)
                          }}
                        >
                          <IconCmp className="lucide" />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {tab === "code" && openFiles.length > 0 ? (
          <>
            <div className="pv-divider" />
            <div className="pv-detailtabs">
              {openFiles.map((f) => (
                <button
                  key={f.id}
                  className={`pv-detailtab${activeFile === f.id ? " active" : ""}`}
                  onClick={() => setActiveFile(f.id)}
                >
                  <span>{f.name}</span>
                  <span className="x" onClick={(e) => closeFile(f.id, e)}>
                    <X className="lucide" style={{ width: 10, height: 10 }} />
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : tab === "preview" ? (
          <>
            <div className="pv-divider" />
            <div className="pv-pathbox">
              <button className="pv-path-btn" title="Refresh" onClick={() => setRefreshKey((k) => k + 1)}>
                <RefreshCw className="lucide" style={{ width: 13, height: 13 }} />
              </button>
              <button
                className="pv-path-btn"
                title={"Device: " + device + " — click to cycle"}
                onClick={() => setDevice((d) => DEVICE_ORDER[(DEVICE_ORDER.indexOf(d) + 1) % DEVICE_ORDER.length])}
              >
                {React.createElement(DEVICE_ICON[device], { className: "lucide", style: { width: 13, height: 13 } })}
              </button>
              <span className="pv-path-url">/</span>
              <span style={{ flex: 1 }} />
              <button className="pv-path-btn" title="Open in new tab" onClick={openPreview}>
                <ExternalLink className="lucide" style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {tab === "preview" && (
          <IconButton
            icon={MousePointerClick}
            label={selecting ? "Exit selection" : "Select a component to edit"}
            onClick={() => {
              setSelecting((s) => !s)
              setSel(null)
              setHoverLabel(null)
            }}
            style={selecting ? { background: "rgba(var(--overlay),0.08)", color: "var(--n11)" } : undefined}
          />
        )}
        {(tab === "preview" || tab === "code") && (
          <IconButton
            icon={Terminal}
            label="Toggle console"
            onClick={() => setConsoleOpen((v) => !v)}
            style={consoleOpen ? { background: "rgba(var(--overlay),0.08)", color: "var(--n11)" } : undefined}
          />
        )}
      </div>

      <div className="pv-canvas">
        {tab === "preview" && (
          <div
            className={"pv-preview" + (selecting ? " pv-selecting" : "") + (device !== "laptop" ? " pv-deviced" : "")}
            ref={setCanvas}
            style={{ position: "relative", display: "flex", flex: 1, overflow: "auto" }}
            onMouseMove={onCanvasMove}
            onClick={onCanvasClick}
            onMouseLeave={() => setHoverLabel(null)}
          >
            {isDone ? (
              <div
                className="pv-device-frame"
                style={deviceW ? { width: deviceW, maxWidth: "100%", margin: "0 auto", flexShrink: 0 } : { width: "100%" }}
              >
                <BSPortalContext.Provider value={canvasEl}>
                  <BrickstoreApp key={refreshKey} extras={extras} narrow={device !== "laptop"} />
                </BSPortalContext.Provider>
              </div>
            ) : (
              <div className="pv-empty">
                <div className="pv-empty-icon">
                  <LayoutDashboard className="lucide" style={{ width: 22, height: 22 }} />
                </div>
                <div className="pv-empty-title">Your app preview will appear here</div>
                <div className="pv-empty-desc">
                  Genie builds it live from your prompt. Describe what you want in the chat to get started.
                </div>
              </div>
            )}

            {isDone &&
              hoverLabel &&
              (!sel || sel.label !== hoverLabel) &&
              (() => {
                const r = rectFor(hoverLabel)
                return r ? (
                  <div className="cmp-outline hover" style={{ left: r.left, top: r.top, width: r.width, height: r.height }} />
                ) : null
              })()}
            {isDone &&
              sel &&
              (() => {
                const r = rectFor(sel.label)
                return r ? (
                  <div className="cmp-outline sel" style={{ left: r.left, top: r.top, width: r.width, height: r.height }} />
                ) : null
              })()}

            {isDone &&
              Object.keys(comments).map((label) => {
                const r = rectFor(label)
                if (!r) return null
                return (
                  <button
                    key={label}
                    className="cmp-pin"
                    style={{ left: r.left + r.width - 10, top: r.top - 10 }}
                    title={comments[label]}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSel({ label })
                      setDraft(comments[label])
                    }}
                  >
                    <MessageSquare className="lucide" style={{ width: 11, height: 11 }} />
                  </button>
                )
              })}

            {isDone &&
              sel &&
              (() => {
                const r = rectFor(sel.label)
                if (!r) return null
                const cw = canvasEl ? canvasEl.clientWidth : 800
                const ch = canvasEl ? canvasEl.clientHeight : 600
                const top = Math.max(8, Math.min(r.top + r.height + 8, ch - 168))
                const left = Math.min(Math.max(8, r.left), cw - 272)
                return (
                  <div className="edit-popover" style={{ left, top }} onClick={(e) => e.stopPropagation()}>
                    <div className="edit-pop-head">
                      <span className="edit-pop-label">{sel.label}</span>
                      <button className="btn-icon" onClick={closeEditor} aria-label="Close">
                        <X className="lucide" />
                      </button>
                    </div>
                    <textarea
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendToGenie()
                        }
                      }}
                      placeholder="Describe a change…"
                      rows={3}
                    />
                    <div className="edit-pop-actions">
                      <button className="btn btn-primary" style={{ width: "100%" }} onClick={sendToGenie}>
                        <GenieIcon size={13} fill="currentColor" />
                        Send to Genie
                      </button>
                    </div>
                  </div>
                )
              })()}

            {isDone && selecting && !sel && <div className="select-hint">Click a component to edit or comment</div>}
          </div>
        )}
        {tab === "code" && (
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div className="tree-pane">
              <TreeRows nodes={FILE_TREE} depth={0} activeId={activeFile} onSelect={openFile} />
            </div>
            <div className="code-editor">
              <pre>
                <code>{FILE_CONTENTS[activeFile] || "Select a file to view"}</code>
              </pre>
            </div>
          </div>
        )}
        {tab === "questions" &&
          (needsInput ? (
            <Questionnaire onSubmit={onSubmitInput} />
          ) : spec ? (
            <SpecSummary spec={spec} todos={todos || []} />
          ) : (
            <div className="pv-empty">
              <div className="pv-empty-icon">
                <ClipboardList className="lucide" style={{ width: 22, height: 22 }} />
              </div>
              <div className="pv-empty-title">No plan yet</div>
              <div className="pv-empty-desc">Describe an app in the chat and Genie generates a spec here.</div>
            </div>
          ))}
        {tab === "catalog" && <DataPanel tree={CATALOG_TREE} activeId={catId} onSelect={setCatId} />}
        {tab === "database" && <DataPanel tree={DATABASE_TREE} activeId={dbId} onSelect={setDbId} />}
        {tab === "agents" && <AgentsPanel activeId={agentId} onSelect={setAgentId} />}

        {consoleOpen && (tab === "preview" || tab === "code") && (
          <div className="console-panel">
            <div className="console-head">
              <div style={{ display: "flex", gap: 4 }}>
                {["console", "devserver"].map((id) => (
                  <button
                    key={id}
                    className={`console-tab${consoleTab === id ? " active" : ""}`}
                    onClick={() => setConsoleTab(id)}
                  >
                    {id === "devserver" ? "Dev server" : "Console"}
                  </button>
                ))}
              </div>
              <IconButton icon={X} label="Close console" onClick={() => setConsoleOpen(false)} />
            </div>
            <div className="console-body">
              {consoleTab === "console" ? (
                <>
                  <p>
                    <span style={{ color: "var(--success-fg)" }}>✓</span> Compiled successfully in 1.2s
                  </p>
                  <p>
                    <span style={{ color: "var(--n7)" }}>›</span> Ready on http://localhost:3000
                  </p>
                  <p>
                    <span style={{ color: "var(--n7)" }}>›</span> GET / 200 in 45ms
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span style={{ color: "var(--success-fg)" }}>✓</span> next dev
                  </p>
                  <p>
                    <span style={{ color: "var(--n7)" }}>›</span> Starting development server…
                  </p>
                  <p>
                    <span style={{ color: "var(--n7)" }}>›</span> Local: http://localhost:3000
                  </p>
                  <p>
                    <span style={{ color: "var(--success-fg)" }}>✓</span> Ready in 842ms
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
