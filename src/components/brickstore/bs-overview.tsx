"use client"

// BrickSport Command — Overview (store table + map) and Recommended actions
// (ported from bs-overview.jsx). window.BSCtx → React context (useBSCtx);
// window.* component globals → ES imports; ReactDOM.createPortal → createPortal.
import * as React from "react"
import { createPortal } from "react-dom"
import { BS } from "./bs-data"
import type { OverviewStore, Rec } from "./bs-data"
import { BSCard, BSLeverBadge, BSAskGenie } from "./bs-charts"
import { BSMiniTrend, BSStoreMap } from "./bs-map"
import { Icon } from "./bs-icon"
import { useBSCtx, BSPortalContext } from "./bs-context"

const { useState, useEffect, useRef, useMemo, useContext } = React

export function bsScrollToId(container: HTMLElement | null, id: string) {
  if (!container) return
  const el = container.querySelector("#" + CSS.escape(id))
  if (!el) return
  const cRect = container.getBoundingClientRect()
  const eRect = el.getBoundingClientRect()
  const top = eRect.top - cRect.top + container.scrollTop - 16
  container.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
}

// ── Store table ───────────────────────────────────────────────────────────
const BS_BAND_RANK: Record<string, number> = { under: 0, balanced: 1, over: 2 }
const BS_ROW_GRID = "10px 1fr 64px 16px"

function bsTrendHue(dir: string) { return dir === "up" ? "var(--ins-green)" : dir === "down" ? "var(--ins-red)" : "var(--text-muted)" }

function BSStoreTable({ stores }: { stores: OverviewStore[] }) {
  const ctx = useBSCtx()
  const COVER_COLOR = BS.COVER_COLOR
  const rows = useMemo(() => stores.slice().sort((a, b) =>
    a.coverPct - b.coverPct || BS_BAND_RANK[a.band] - BS_BAND_RANK[b.band] || b.salesVolumeUnitsDay - a.salesVolumeUnitsDay
  ), [stores])
  return (
    <div data-cmp="Store cover table" style={{ overflow: "hidden" }}>
      <div className="grid items-center" style={{ gridTemplateColumns: BS_ROW_GRID, gap: 10, padding: "0 0 10px" }}>
        <span />
        <span className="font-ui" style={bsHStyle}>Store</span>
        <span className="font-ui inline-flex items-center justify-end" style={{ ...bsHStyle, gap: 4 }}>Cover</span>
        <span />
      </div>
      <div className="ins-tile-scroll" style={{ maxHeight: 40 * 10 + 8, overflowY: "auto" }}>
        {rows.map((s) => {
          const open = ctx.expandedId === s.id, hot = ctx.hoveredId === s.id, c = COVER_COLOR[s.band]
          return (
            <div key={s.id}>
              <button type="button" onClick={() => ctx.toggleExpanded(s.id)} onMouseEnter={() => ctx.setHovered(s.id)} onMouseLeave={() => ctx.setHovered(null)}
                className="w-full grid items-center text-left"
                style={{ gridTemplateColumns: BS_ROW_GRID, gap: 10, padding: "10px 0", border: "none", borderTop: "0.5px solid var(--ins-hairline)", background: hot || open ? "var(--bg-surface)" : "transparent", cursor: "pointer", transition: "background 140ms ease" }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: c.dot, justifySelf: "center", boxShadow: hot ? "0 0 0 3px " + c.fill : "none", transition: "box-shadow 140ms ease" }} />
                <span className="font-ui truncate min-w-0" style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{s.id}</span>
                <span className="font-mono" style={{ textAlign: "right", fontSize: "12.5px", fontWeight: 600, color: s.band === "balanced" ? "var(--text-primary)" : c.dot }}>{s.coverPct}%</span>
                <Icon name="chevron-right" size={13} style={{ color: "var(--text-muted)", transition: "transform 180ms ease", transform: open ? "rotate(90deg)" : "none" }} />
              </button>
              {open && (
                <div style={{ overflow: "hidden", background: "var(--bg-surface)" }}>
                  <div style={{ padding: "6px 12px 14px 20px" }}>
                    <BSMiniTrend label="Sales volume · past 30 days" data={s.volume} hue={bsTrendHue(s.trendDir)} format={(v) => Math.round(v).toLocaleString()} />
                    <BSPendingPill count={BS.recsForStore(s.id, ctx.filter)} onClick={() => { ctx.setLinkedStore(s.id); requestAnimationFrame(() => ctx.scrollToSection("sec-actions")) }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
function BSPendingPill({ count, onClick }: { count: number; onClick: () => void }) {
  if (count <= 0) return <div className="font-ui" style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: 10 }}>No action needed</div>
  const label = count === 1 ? "1 pending action" : count + " pending recommendations"
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick() }} className="font-ui inline-flex items-center"
      style={{ marginTop: 10, gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: "11.5px", fontWeight: 600, color: "var(--ins-red)", background: "var(--bg-surface)", border: "0.5px solid var(--ins-hairline)", cursor: "pointer" }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--ins-red)" }} />{label}
      <Icon name="chevron-right" size={12} style={{ color: "var(--text-muted)" }} />
    </button>
  )
}
const bsHStyle: React.CSSProperties = { fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }

// ── Overview section ─────────────────────────────────────────────────────────
export function BSOverviewSection() {
  const ctx = useBSCtx()
  const f = ctx.filter
  const tableAll = useMemo(() => BS.selectOverviewStores({ teams: f.teams, products: f.products, countries: f.countries }), [f.teams, f.products, f.countries])
  const mapAll = useMemo(() => BS.selectOverviewStores({ teams: f.teams, products: f.products, countries: [] }), [f.teams, f.products])
  const problemCount = useMemo(() => tableAll.filter((s) => s.band !== "balanced").length, [tableAll])
  const tableStores = ctx.problemsOnly ? tableAll.filter((s) => s.band !== "balanced") : tableAll
  const mapStores = ctx.problemsOnly ? mapAll.filter((s) => s.band !== "balanced") : mapAll
  return (
    <div className="bs-overview-grid">
      <div style={{ flex: "0 0 260px", maxWidth: 280, minWidth: 0 }}>
        <BSStoreTable stores={tableStores} />
      </div>
      <div data-cmp="Store map" style={{ flex: 1, minWidth: 0 }}>
        <BSStoreMap stores={mapStores} marketCountries={f.countries} problemCount={problemCount}
          view={ctx.view} setView={ctx.setView} problemsOnly={ctx.problemsOnly} setProblemsOnly={ctx.setProblemsOnly}
          hoveredId={ctx.hoveredId} expandedId={ctx.expandedId} setHovered={ctx.setHovered} toggleExpanded={ctx.toggleExpanded} theme={ctx.theme} />
      </div>
    </div>
  )
}

// ── Recommended actions ───────────────────────────────────────────────────
const BS_TONE_PILL: Record<string, { fg: string; bg: string }> = {
  good: { fg: "var(--ins-teal)", bg: "var(--ins-teal-soft)" },
  warn: { fg: "var(--ins-amber)", bg: "var(--ins-amber-soft)" },
  neutral: { fg: "var(--text-secondary)", bg: "var(--bg-surface)" },
}
const BS_COMPACT_H = 302, BS_EXPANDED_H = BS_COMPACT_H + 5 * 50

export function BSRecommendedActions() {
  const ctx = useBSCtx()
  const f = ctx.filter
  const recs = BS.selectRecommendations(f)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<Rec | null>(null)
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => { setExpanded(false) }, [f.teams, f.products, f.countries])
  useEffect(() => {
    if (!ctx.linkedStoreId || !scrollRef.current) return
    const row = scrollRef.current.querySelector('tr[data-store="' + ctx.linkedStoreId + '"]') as HTMLElement | null
    if (row) scrollRef.current.scrollTo({ top: Math.max(0, row.offsetTop - 34), behavior: "smooth" })
  }, [ctx.linkedStoreId])
  const openReview = (r: Rec) => { ctx.setLinkedStore(null); setReviewing(r) }
  return (
    <BSCard title="Recommended actions">
      <div style={{ position: "relative" }}>
        <div ref={scrollRef} className="ins-tile-scroll" style={{ height: expanded ? BS_EXPANDED_H : BS_COMPACT_H, overflowY: "auto", overflowX: "auto", transition: "height 260ms cubic-bezier(0.16,1,0.3,1)" }}>
          {recs.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: "100%" }}><span className="font-ui" style={{ fontSize: "14px", color: "var(--text-muted)" }}>No recommendations in this scope.</span></div>
          ) : (
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead><tr>
                <BSTh>Type</BSTh><BSTh>Action</BSTh><BSTh>Product</BSTh><BSTh>Units</BSTh><BSTh>Lead time</BSTh><BSTh>Expires in</BSTh><BSTh align="center">Decision</BSTh>
              </tr></thead>
              <tbody>
                {recs.map((r, i) => {
                  const linked = r.storeId != null && r.storeId === ctx.linkedStoreId, hot = hoverId === r.id
                  return (
                    <tr key={r.id} data-store={r.storeId} onMouseEnter={() => setHoverId(r.id)} onMouseLeave={() => setHoverId(null)}
                      style={{ background: linked || hot ? "var(--bg-surface)" : "transparent", transition: "background 160ms ease" }}>
                      <BSTd divider={i > 0}><BSLeverBadge lever={r.lever} /></BSTd>
                      <BSTd divider={i > 0}><span className="font-ui" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.35 }}>{r.action}</span></BSTd>
                      <BSTd divider={i > 0}><span className="font-ui inline-flex items-center" style={{ fontSize: "12.5px", color: "var(--text-secondary)", gap: 5, whiteSpace: "nowrap" }}><span>{r.flag}</span>{r.sku}</span></BSTd>
                      <BSTd divider={i > 0}><span className="font-mono" style={{ fontSize: "12.5px", color: "var(--text-primary)" }}>{r.units.toLocaleString()}</span></BSTd>
                      <BSTd divider={i > 0}><div className="flex flex-col" style={{ gap: 3 }}><span className="font-mono" style={{ fontSize: "12.5px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{r.etaLabel}</span>{r.statusLabel && r.statusTone && <BSStatePill label={r.statusLabel} tone={r.statusTone} />}</div></BSTd>
                      <BSTd divider={i > 0}><span className="font-mono" style={{ fontSize: "12.5px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{r.expiresLabel}</span></BSTd>
                      <BSTd divider={i > 0} align="center"><BSDecisionButton approved={ctx.approved.has(r.id)} onReview={() => openReview(r)} onUndo={() => ctx.undo(r.id)} /></BSTd>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {recs.length > 0 && <div style={{ height: 18 }} />}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 22, pointerEvents: "none", background: "linear-gradient(to bottom, transparent, var(--bg-elevated))" }} />
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 12, paddingTop: 12, borderTop: "0.5px solid var(--ins-hairline)" }}>
        <span className="font-ui" style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{recs.length} {recs.length === 1 ? "recommendation" : "recommendations"} · {ctx.approved.size} approved</span>
        {recs.length > 5 && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="font-ui inline-flex items-center" style={{ gap: 4, fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
            {expanded ? "Collapse" : "Show all · " + recs.length}
            <Icon name="chevron-down" size={13} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
          </button>
        )}
      </div>
      <BSReviewPanel rec={reviewing} approved={reviewing ? ctx.approved.has(reviewing.id) : false}
        onApprove={() => { if (reviewing) ctx.approve(reviewing.id); setReviewing(null) }}
        onUndo={() => { if (reviewing) ctx.undo(reviewing.id); setReviewing(null) }}
        onClose={() => setReviewing(null)} />
    </BSCard>
  )
}
function BSStatePill({ label, tone }: { label: string; tone: string }) {
  const c = BS_TONE_PILL[tone]
  return <span className="font-ui inline-flex items-center" style={{ width: "fit-content", fontSize: "11px", fontWeight: 600, color: c.fg, background: c.bg, padding: "1.5px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>{label}</span>
}
function BSDecisionButton({ approved, onReview, onUndo }: { approved: boolean; onReview: () => void; onUndo: () => void }) {
  const [hover, setHover] = useState(false)
  if (approved) return (
    <button type="button" onClick={onUndo} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="font-ui inline-flex items-center justify-center"
      style={{ gap: 6, fontSize: "11.5px", fontWeight: 600, minWidth: 104, padding: "5px 11px", borderRadius: 999, cursor: "pointer", color: hover ? "var(--text-muted)" : "var(--ins-teal)", background: hover ? "transparent" : "var(--ins-teal-soft)", border: "1px solid " + (hover ? "var(--border)" : "var(--ins-teal)"), transition: "all 0.16s ease" }}>
      <Icon name={hover ? "rotate-ccw" : "check"} size={13} />{hover ? "Undo" : "Approved"}
    </button>
  )
  return (
    <button type="button" onClick={onReview} className="font-ui inline-flex items-center justify-center"
      style={{ gap: 6, fontSize: "11.5px", fontWeight: 600, minWidth: 104, padding: "5px 11px", borderRadius: 999, whiteSpace: "nowrap", cursor: "pointer", color: "var(--text-secondary)", background: "transparent", border: "1px solid var(--border)", transition: "all 0.16s ease" }}>
      <Icon name="scan-search" size={14} />Review
    </button>
  )
}
function BSTh({ children, align }: { children?: React.ReactNode; align?: "left" | "center" | "right" }) {
  return <th className="font-ui" style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--bg-elevated)", textAlign: align || "left", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", padding: "0 12px 8px 0", boxShadow: "inset 0 -0.5px 0 var(--ins-hairline)", whiteSpace: "nowrap" }}>{children}</th>
}
function BSTd({ children, align, divider }: { children?: React.ReactNode; align?: "left" | "center" | "right"; divider?: boolean }) {
  return <td style={{ textAlign: align || "left", padding: "10px 12px 10px 0", verticalAlign: "middle", boxShadow: divider ? "inset 0 0.5px 0 var(--ins-hairline)" : "none" }}>{children}</td>
}

// ── Review side panel (portal into the preview pane, else the .bs-root) ─────
const BS_COVER_MAX = 160
const bsPos = (v: number) => Math.min(100, (v / BS_COVER_MAX) * 100) + "%"
function BSCoverDelta({ now, after, sku }: { now: number; after: number; sku: string }) {
  const COVER_COLOR = BS.COVER_COLOR
  const lo = Math.min(now, after), hi = Math.max(now, after)
  return (
    <div style={{ marginTop: 18 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
        <BSSectionLabel>Demand cover · {sku}</BSSectionLabel>
        <span className="font-mono" style={{ fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap" }}><span style={{ color: "var(--text-muted)" }}>{now}% → </span>{after}%</span>
      </div>
      <div style={{ position: "relative", height: 8, marginTop: 10 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: bsPos(80), background: COVER_COLOR.under.fill }} />
          <div style={{ width: "calc(" + bsPos(125) + " - " + bsPos(80) + ")", background: COVER_COLOR.balanced.fill }} />
          <div style={{ flex: 1, background: COVER_COLOR.over.fill }} />
        </div>
        <div style={{ position: "absolute", top: 2, left: bsPos(lo), width: "calc(" + bsPos(hi) + " - " + bsPos(lo) + ")", height: 4, borderRadius: 2, background: "var(--ins-indigo)", opacity: 0.85 }} />
        <span style={{ position: "absolute", left: bsPos(now), transform: "translateX(-50%)", top: 0, width: 8, height: 8, borderRadius: 999, border: "1.5px solid var(--text-muted)", background: "var(--bg-elevated)" }} />
        <span style={{ position: "absolute", left: bsPos(after), transform: "translateX(-50%)", top: 0, width: 8, height: 8, borderRadius: 999, background: "var(--ins-indigo)" }} />
      </div>
      <div className="font-mono" style={{ position: "relative", height: 14, marginTop: 4, fontSize: "9.5px", color: "var(--text-muted)" }}>
        <span style={{ position: "absolute", left: 0 }}>0%</span>
        <span style={{ position: "absolute", left: bsPos(80), transform: "translateX(-50%)" }}>80%</span>
        <span style={{ position: "absolute", left: bsPos(125), transform: "translateX(-50%)" }}>125%</span>
        <span style={{ position: "absolute", right: 0 }}>160%</span>
      </div>
    </div>
  )
}
function BSSectionLabel({ children }: { children?: React.ReactNode }) {
  return <div className="font-ui" style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>{children}</div>
}
function BSPanelStat({ label, value }: { label: string; value: string }) {
  return <div><BSSectionLabel>{label}</BSSectionLabel><div className="font-mono" style={{ fontSize: "14px", color: "var(--text-primary)", marginTop: 4 }}>{value}</div></div>
}
function BSReviewPanel({ rec, approved, onApprove, onUndo, onClose }: {
  rec: Rec | null; approved: boolean; onApprove: () => void; onUndo: () => void; onClose: () => void
}) {
  const ctx = useBSCtx()
  const portalTarget = useContext(BSPortalContext)
  useEffect(() => {
    if (!rec) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [rec, onClose])
  if (!rec) return null
  const target = portalTarget || ctx.scrollEl
  if (!target) return null
  const panel = (
    <div style={{ position: "absolute", inset: 0, zIndex: 50 }} className="bs-root" data-surface="insights" data-theme={ctx.theme}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "transparent" }} />
      <aside role="dialog" aria-modal="true" className="flex flex-col" style={{ position: "absolute", top: 14, right: 14, bottom: 14, width: "min(440px, calc(100% - 28px))", background: "var(--bg-elevated)", border: "0.5px solid var(--border)", borderRadius: "var(--ins-radius)", boxShadow: "var(--shadow-soft)", overflow: "hidden", animation: "bs-slide 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ padding: "20px 22px 0" }}>
          <div className="flex items-center justify-between" style={{ gap: 12 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <BSLeverBadge lever={rec.lever} />
              {rec.driver === "routine" && <span className="font-ui" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-muted)", border: "0.5px solid var(--border)", padding: "1.5px 8px", borderRadius: 999 }}>ROUTINE</span>}
            </div>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{rec.id}</span>
              <button type="button" onClick={onClose} aria-label="Close" className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}><Icon name="x" size={16} /></button>
            </div>
          </div>
          <div className="flex items-center justify-between" style={{ gap: 12, marginTop: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div className="font-title" style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-primary)" }}>{rec.flag} {rec.sku}</div>
              <div className="font-ui" style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: 3 }}>{rec.action} · {rec.scopeLabel}</div>
            </div>
            <BSAskGenie />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 18px" }} className="ins-tile-scroll">
          <div className="flex" style={{ gap: 24, marginTop: 18, paddingTop: 16, borderTop: "0.5px solid var(--ins-hairline)" }}>
            <BSPanelStat label="Units" value={rec.units.toLocaleString()} />
            <BSPanelStat label="Lead time" value={rec.etaLabel} />
            <BSPanelStat label="Expires in" value={rec.expiresLabel} />
          </div>
          {rec.coverNowPct != null && rec.coverAfterPct != null && <BSCoverDelta now={rec.coverNowPct} after={rec.coverAfterPct} sku={rec.sku} />}
          <div style={{ marginTop: 18 }}>
            <BSSectionLabel>Why this move</BSSectionLabel>
            {rec.reason.split("\n\n").map((p, i) => <p key={i} className="font-ui" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)", marginTop: i === 0 ? 8 : 10 }}>{p}</p>)}
          </div>
          {rec.constraint && <div style={{ marginTop: 16 }}><BSSectionLabel>Binding constraint</BSSectionLabel><div className="font-mono" style={{ fontSize: "11.5px", lineHeight: 1.55, color: "var(--text-secondary)", background: "var(--bg-surface)", borderRadius: "var(--ins-radius-sm)", padding: "9px 12px", marginTop: 8 }}>{rec.constraint}</div></div>}
          {rec.impactLabel && <div style={{ marginTop: 16 }}><BSSectionLabel>Estimated impact</BSSectionLabel><div className="font-mono" style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)", marginTop: 8 }}>{rec.impactLabel}</div></div>}
        </div>
        <div className="flex items-center justify-end" style={{ padding: "14px 22px", borderTop: "0.5px solid var(--ins-hairline)", gap: 10 }}>
          {approved ? (
            <React.Fragment>
              <span className="font-ui inline-flex items-center" style={{ gap: 6, fontSize: "12.5px", fontWeight: 600, padding: "7px 14px", borderRadius: 999, color: "var(--ins-teal)", background: "var(--ins-teal-soft)" }}><Icon name="check" size={14} />Approved</span>
              <button type="button" onClick={onUndo} className="font-ui inline-flex items-center" style={{ gap: 6, fontSize: "12.5px", fontWeight: 600, padding: "7px 14px", borderRadius: 999, color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}><Icon name="rotate-ccw" size={14} />Undo</button>
            </React.Fragment>
          ) : (
            <button type="button" onClick={onApprove} className="font-ui inline-flex items-center" style={{ fontSize: "12.5px", fontWeight: 600, padding: "8px 20px", borderRadius: 999, color: "var(--bg-elevated)", background: "var(--text-primary)", border: "none", cursor: "pointer" }}>Approve move</button>
          )}
        </div>
      </aside>
    </div>
  )
  return createPortal(panel, target)
}
