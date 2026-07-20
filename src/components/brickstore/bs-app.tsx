"use client"

// BrickSport Command — app shell: FilterSelect, TopBar, SectionRail, AppHeader,
// BrickstoreApp (ported from bs-app.jsx). window.BS / window.BSCtx globals →
// module imports + React context; the kit's data-theme MutationObserver →
// next-themes useTheme(); ReactDOM.createPortal → createPortal.
import * as React from "react"
import { createPortal } from "react-dom"
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google"
import { useTheme } from "next-themes"
import { BS } from "./bs-data"
import { BSCtx, BSPortalContext, useBSCtx } from "./bs-context"
import type { BSContextValue, BSTheme, BSView } from "./bs-context"
import { Icon } from "./bs-icon"
import { GenieIcon } from "@/components/apps/genie-icon"
import {
  BSSectionRule, BSDemandChange, BSDemandCurve,
  BSExposureStats, BSRecoveryWaterfall, BSOptionDecayEmpty,
} from "./bs-charts"
import { BSOverviewSection, BSRecommendedActions, bsScrollToId } from "./bs-overview"
import "./brickstore.css"

// The kit loaded DM Sans + Plus Jakarta Sans via a Google Fonts @import inside
// brickstore.css. Here they come from next/font (no runtime network fetch); the
// CSS references --font-bs-dm / --font-bs-jakarta with a system fallback.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-bs-dm" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-bs-jakarta" })

// Re-export the contexts so the public contract (BrickstoreApp + BSPortalContext
// from bs-app) holds; they live in bs-context to avoid an import cycle.
export { BSCtx, BSPortalContext } from "./bs-context"
export type { BSContextValue } from "./bs-context"

const { useState, useEffect, useRef, useMemo, useContext } = React

function bsSameSet(a: string[], b: string[]) { if (a.length !== b.length) return false; const s = new Set(a); return b.every((id) => s.has(id)) }

interface FilterOption { id: string; label: string; prefix?: string; hint?: string }

// ── FilterSelect ─────────────────────────────────────────────────────────────
function BSFilterSelect({ label, options, selected, onToggle, onSelectAll, onClear, onResetAll, resetDisabled, width, searchable }: {
  label: string; options: FilterOption[]; selected: string[]
  onToggle: (id: string) => void; onSelectAll: () => void; onClear: () => void; onResetAll: () => void
  resetDisabled: boolean; width?: number; searchable?: boolean
}) {
  if (!width) width = 220
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [hover, setHover] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!open) { setQuery(""); return }
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey) }
  }, [open])
  useEffect(() => { if (open && searchable && searchRef.current) searchRef.current.focus() }, [open, searchable])
  const summary = useMemo(() => {
    const count = selected.length
    if (count === 0 || count === options.length) return "All"
    if (count === 1) { const o = options.find((o) => o.id === selected[0]); return o ? o.label : "1" }
    return "" + count
  }, [selected, options])
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter((o) => o.label.toLowerCase().indexOf(q) >= 0 || (o.hint ? o.hint.toLowerCase().indexOf(q) >= 0 : false))
  }, [options, query, searchable])
  const seam = open ? "var(--text-muted)" : hover ? "var(--ins-tile-sep)" : "transparent"
  const all = selected.length === options.length, clearDisabled = selected.length === 0
  return (
    <div className="relative" ref={ref} style={{ width }}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="font-ui inline-flex items-center justify-between w-full"
        style={{ gap: 8, fontSize: "14px", fontWeight: 500, padding: "7px 2px", border: "none", borderBottom: "1px solid " + seam, background: "transparent", color: "var(--text-secondary)", cursor: "pointer", transition: "border-color 160ms ease" }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <span className="inline-flex items-baseline truncate" style={{ gap: 6 }}>
          <span style={{ color: "var(--text-muted)" }}>{label}</span>
          <span className="truncate" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{summary}</span>
        </span>
        <Icon name="chevron-down" size={14} style={{ opacity: 0.6, flexShrink: 0, transition: "transform 180ms ease", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="bs-menu-panel absolute" style={{ left: 0, top: "100%", width, zIndex: 50, boxShadow: "var(--shadow-menu)" }} role="listbox">
          <div className="flex items-center justify-between" style={{ padding: "8px 12px", borderBottom: "0.5px solid var(--border)" }}>
            <button type="button" onClick={onSelectAll} disabled={all} className="font-ui" style={{ fontSize: "11.5px", fontWeight: 600, color: all ? "var(--text-muted)" : "var(--text-primary)", cursor: all ? "default" : "pointer", background: "none", border: "none" }}>Select all</button>
            <div className="flex items-center" style={{ gap: 2 }}>
              <BSIconAction icon="eraser" label="Clear this filter" onClick={onClear} disabled={clearDisabled} />
              <BSIconAction icon="rotate-ccw" label="Reset all filters to All" onClick={onResetAll} disabled={resetDisabled} />
            </div>
          </div>
          {searchable && (
            <div className="flex items-center" style={{ gap: 8, padding: "8px 12px", borderBottom: "0.5px solid var(--border)" }}>
              <Icon name="search" size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="font-ui" style={{ width: "100%", background: "transparent", outline: "none", border: "none", fontSize: "12.5px", color: "var(--text-primary)" }} />
            </div>
          )}
          <div className="ins-tile-scroll" style={{ maxHeight: 300, overflowY: "auto", padding: 5 }}>
            {filtered.length === 0 ? (
              <div className="font-ui" style={{ padding: "10px 9px", fontSize: "12.5px", color: "var(--text-muted)" }}>No matches</div>
            ) : filtered.map((o) => {
              const on = selected.indexOf(o.id) >= 0
              return (
                <button key={o.id} type="button" onClick={() => onToggle(o.id)} className="w-full flex items-center text-left bs-opt"
                  style={{ gap: 10, padding: "7px 9px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "none" }}>
                  <span className="flex items-center justify-center" style={{ width: 16, height: 16, flexShrink: 0, borderRadius: 5, border: on ? "none" : "1px solid var(--border)", background: on ? "var(--ins-indigo)" : "transparent" }}>{on && <Icon name="check" size={11} style={{ color: "#fff", strokeWidth: 3 }} />}</span>
                  {o.prefix && <span style={{ fontSize: "15px", flexShrink: 0 }}>{o.prefix}</span>}
                  <span className="font-ui truncate" style={{ flex: 1, fontSize: "14px", fontWeight: on ? 600 : 500, color: "var(--text-primary)" }}>{o.label}</span>
                  {o.hint && <span className="font-ui" style={{ flexShrink: 0, fontSize: "12px", color: "var(--text-muted)" }}>{o.hint}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
function BSIconAction({ icon, label, onClick, disabled }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} disabled={disabled} className="flex items-center justify-center bs-iconact"
      style={{ width: 32, height: 32, borderRadius: 6, border: "none", background: "transparent", color: disabled ? "var(--ins-tile-sep)" : "var(--text-muted)", cursor: disabled ? "default" : "pointer" }}>
      <Icon name={icon} size={13} />
    </button>
  )
}

// ── TopBar (filter strip) ─────────────────────────────────────────────────
function BSTopBar() {
  const ctx = useBSCtx()
  const f = ctx.filter
  const teamOptions: FilterOption[] = BS.TEAMS.map((t) => ({ id: t.id, label: t.code, prefix: t.flag }))
  const productOptions: FilterOption[] = BS.ALL_LINES.map((l) => ({ id: l, label: BS.PRODUCT_LABELS[l] }))
  const countryOptions: FilterOption[] = BS.COUNTRIES.map((c) => ({ id: c.id, label: c.name, prefix: c.flag, hint: c.id }))
  const teamSel = f.teams.length === 0 ? BS.ALL_TEAM_IDS : f.teams // empty == all for the control
  const prodSel = f.products.length === 0 ? BS.ALL_LINES : f.products
  const resetAll = () => { ctx.setCountries(BS.ALL_COUNTRY_IDS); ctx.setTeams(BS.ALL_TEAM_IDS); ctx.setProducts(BS.ALL_LINES) }
  const allSelected = bsSameSet(f.countries, BS.ALL_COUNTRY_IDS) && (f.teams.length === 0 || bsSameSet(f.teams, BS.ALL_TEAM_IDS)) && bsSameSet(prodSel, BS.ALL_LINES)
  return (
    <div className="sticky" data-cmp="Filter bar" style={{ top: "var(--header-height)", zIndex: 20, background: "var(--bg-deep)", paddingTop: 18, marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4 }}>
      <div className="flex items-center bs-filterstrip" style={{ gap: 26 }}>
        <Icon name="sliders-horizontal" size={15} style={{ color: "var(--text-muted)", flexShrink: 0, marginRight: 2 }} />
        <BSFilterSelect label="Market" options={countryOptions} selected={f.countries} onToggle={ctx.toggleCountry} onSelectAll={() => ctx.setCountries(BS.ALL_COUNTRY_IDS)} onClear={() => ctx.setCountries([])} onResetAll={resetAll} resetDisabled={allSelected} searchable width={210} />
        <BSFilterSelect label="Team collection" options={teamOptions} selected={teamSel} onToggle={ctx.toggleTeam} onSelectAll={() => ctx.setTeams(BS.ALL_TEAM_IDS)} onClear={() => ctx.setTeams([])} onResetAll={resetAll} resetDisabled={allSelected} searchable width={210} />
        <BSFilterSelect label="Product lines" options={productOptions} selected={prodSel} onToggle={ctx.toggleProduct} onSelectAll={() => ctx.setProducts(BS.ALL_LINES)} onClear={() => ctx.setProducts([])} onResetAll={resetAll} resetDisabled={allSelected} width={170} />
      </div>
      <div style={{ borderTop: "0.5px solid var(--ins-hairline)", marginTop: 16 }} />
    </div>
  )
}

// ── Section rail (portal to the preview pane, else the .bs-root) ────────────
interface Section { id: string; label: string }
function BSSectionRail({ sections }: { sections: Section[] }) {
  const ctx = useBSCtx()
  const portalTarget = useContext(BSPortalContext)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const root = ctx.scrollEl
    const els = sections.map((s) => root && root.querySelector("#" + CSS.escape(s.id))).filter(Boolean) as Element[]
    if (!els.length || !root) return
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis.length) { const idx = sections.findIndex((s) => "#" + s.id === "#" + vis[0].target.id); if (idx >= 0) setActive(idx) }
    }, { root, rootMargin: "-45% 0px -45% 0px", threshold: 0 })
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [sections, ctx.scrollEl])
  const target = portalTarget || ctx.scrollEl
  if (!target) return null
  const rail = (
    <div className="bs-root" data-surface="insights" data-theme={ctx.theme} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 25 }}>
      <div className="bs-rail flex flex-col items-center" aria-label="Section navigation">
        {sections.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center">
            {i > 0 && <span aria-hidden style={{ width: 1, height: 24, background: "var(--border)" }} />}
            <button type="button" onClick={() => ctx.scrollToSection(s.id)} title={s.label} aria-label={s.label} className="bs-raildot flex items-center justify-center" style={{ width: 22, height: 22, cursor: "pointer", background: "none", border: "none", position: "relative" }}>
              <span style={{ display: "block", borderRadius: 999, transition: "all 260ms cubic-bezier(0.16,1,0.3,1)", width: active === i ? 9 : 6, height: active === i ? 9 : 6, background: active === i ? "var(--text-primary)" : "var(--text-muted)", opacity: active === i ? 1 : 0.5 }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
  return createPortal(rail, target)
}

// ── App header ────────────────────────────────────────────────────────────
function BSAppHeader() {
  const ctx = useBSCtx()
  const { resolvedTheme, setTheme } = useTheme()
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
  return (
    <header className="bs-nav-feather flex items-center justify-between" data-cmp="App header" style={{ height: "var(--header-height)", background: "var(--bg-deep)", boxShadow: "inset 0 1px 0 var(--nav-edge-highlight)", paddingLeft: 22, paddingRight: 18, position: "sticky", top: 0, zIndex: 31, flexShrink: 0 }}>
      <div className="font-title flex items-baseline" style={{ gap: "0.34em" }}>
        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.012em", color: "var(--text-primary)" }}>BrickSport</span>
        <span aria-hidden style={{ color: "var(--accent)", fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>·</span>
        <span style={{ fontSize: "18px", fontWeight: 500, letterSpacing: "0.005em", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Inventory Command Center</span>
      </div>
      <div className="flex items-center" style={{ gap: 6 }}>
        <nav className="flex items-center" style={{ gap: 2 }}>
          <span className="bs-headbtn flex items-center justify-center" style={{ height: 36, width: 36, borderRadius: 999, color: "var(--text-primary)", background: "var(--bg-surface)" }}><Icon name="layout-grid" size={18} strokeWidth={1.7} /></span>
          <button className="bs-headbtn flex items-center justify-center" style={{ height: 36, width: 36, borderRadius: 999, background: "transparent", border: "none", cursor: "pointer" }} title="Ask Genie" aria-label="Ask Genie"><GenieIcon size={17} /></button>
        </nav>
        <span aria-hidden style={{ width: 1, height: 22, background: "var(--border)", margin: "0 8px" }} />
        <button className="bs-headbtn flex items-center justify-center" title="Toggle theme" onClick={toggleTheme} style={{ height: 36, width: 36, borderRadius: 999, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}><Icon name={ctx.theme === "dark" ? "sun" : "moon"} size={17} strokeWidth={1.7} /></button>
        <button className="bs-headbtn flex items-center justify-center" title="Notifications" style={{ height: 36, width: 36, borderRadius: 999, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}><Icon name="bell" size={17} strokeWidth={1.7} /></button>
        <span className="flex items-center justify-center font-ui" style={{ height: 28, width: 28, borderRadius: 999, background: "var(--ins-indigo)", color: "#fff", fontSize: 12, fontWeight: 700, marginLeft: 2 }}>AM</span>
      </div>
    </header>
  )
}

// ── Main app ────────────────────────────────────────────────────────────────
const BS_SECTIONS_BASE: Section[] = [
  { id: "sec-now", label: "Network" },
  { id: "sec-actions", label: "Actions" },
  { id: "sec-coming", label: "Outlook" },
]
const BS_EXPOSURE_SECTION: Section = { id: "sec-money", label: "Exposure" }

export function BrickstoreApp({ extras, narrow }: { extras?: string[]; narrow?: boolean }): React.JSX.Element {
  // The Exposure section is NOT in the app by default — Genie adds it on request
  // (extras includes "exposure") so the builder demo can show a section appearing live.
  const showExposure = (extras || []).indexOf("exposure") >= 0
  // The recoverable-value-decay chart depends on an un-approved table, so it renders
  // as an empty/gated placeholder by default (matching the "4 of 5 connected" report).
  // The demo can drop it ("exposure-no-decay"); requesting access flips the pill to pending.
  const decayRemoved = (extras || []).indexOf("exposure-no-decay") >= 0
  const accessPending = (extras || []).indexOf("exposure-access-requested") >= 0
  const sections = showExposure ? BS_SECTIONS_BASE.concat([BS_EXPOSURE_SECTION]) : BS_SECTIONS_BASE

  const [teams, setTeamsRaw] = useState<string[]>([]) // [] == all
  const [products, setProductsRaw] = useState<string[]>(BS.ALL_LINES.slice())
  const [countries, setCountriesRaw] = useState<string[]>(BS.ALL_COUNTRY_IDS.slice())
  const [view, setView] = useState<BSView>("globe")
  const [problemsOnly, setProblemsOnly] = useState(false)
  const [hoveredId, setHovered] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [linkedStoreId, setLinkedStore] = useState<string | null>(null)
  const [approved, setApproved] = useState<Set<string>>(() => new Set())
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)

  // Theme — next-themes is the single source of truth (replaces the kit's
  // data-theme MutationObserver). resolvedTheme is undefined until mounted, so
  // the SSR/first-client render is "light" (matching the CSS default); the
  // data-theme attribute is only written post-mount to avoid a flash / mismatch.
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const theme: BSTheme = mounted && resolvedTheme === "dark" ? "dark" : "light"

  useEffect(() => { setScrollEl(scrollRef.current) }, [])

  // normalize team/product selection: full set -> [] (== all in selectors)
  const setTeams = (ids: string[]) => setTeamsRaw(ids.length >= BS.TEAMS.length ? [] : ids)
  const toggleTeam = (id: string) => setTeamsRaw((prev) => {
    const cur = prev.length === 0 ? BS.ALL_TEAM_IDS.slice() : prev.slice()
    const next = cur.indexOf(id) >= 0 ? cur.filter((x) => x !== id) : cur.concat([id])
    return next.length >= BS.TEAMS.length ? [] : next
  })
  const setProducts = (ids: string[]) => setProductsRaw(ids.slice())
  const toggleProduct = (id: string) => setProductsRaw((prev) => prev.indexOf(id) >= 0 ? prev.filter((x) => x !== id) : prev.concat([id]))
  const setCountries = (ids: string[]) => setCountriesRaw(ids.slice())
  const toggleCountry = (id: string) => setCountriesRaw((prev) => prev.indexOf(id) >= 0 ? prev.filter((x) => x !== id) : prev.concat([id]))
  const toggleExpanded = (id: string) => setExpandedId((cur) => (cur === id ? null : id))
  const approve = (id: string) => setApproved((s) => { const n = new Set(s); n.add(id); return n })
  const undo = (id: string) => setApproved((s) => { const n = new Set(s); n.delete(id); return n })
  const scrollToSection = (id: string) => bsScrollToId(scrollRef.current, id)

  const filter = useMemo(() => ({ teams, products: products.length ? products : [], countries }), [teams, products, countries])

  const ctxVal: BSContextValue = {
    filter, setTeams, toggleTeam, setProducts, toggleProduct, setCountries, toggleCountry,
    view, setView, problemsOnly, setProblemsOnly, hoveredId, setHovered, expandedId, toggleExpanded,
    linkedStoreId, setLinkedStore, approved, approve, undo, theme, scrollEl, scrollToSection,
  }

  return (
    <BSCtx.Provider value={ctxVal}>
      <div ref={scrollRef} className={"dash bs-host bs-root " + dmSans.variable + " " + jakarta.variable + (narrow ? " bs-narrow" : "")}
        data-surface="insights" data-theme={mounted ? theme : undefined} style={{ position: "relative" }}>
        <BSAppHeader />
        <div className="bs-page">
          <BSTopBar />
          <div id="sec-now" data-cmp="Store network" style={{ scrollMarginTop: 96, marginTop: 22 }}>
            <BSOverviewSection />
          </div>
          <div id="sec-actions" data-cmp="Recommended actions" style={{ scrollMarginTop: 96, marginTop: 28 }}>
            <BSRecommendedActions />
          </div>
          <div id="sec-coming" data-cmp="Demand outlook" style={{ scrollMarginTop: 96 }}>
            <BSSectionRule title="Demand outlook" caption="Predicted change vs plan · next 14 days" />
            <div className="bs-split">
              <div className="bs-split-l" style={{ flex: "40 1 0%", minWidth: 0 }}><BSDemandChange filter={filter} setTeams={setTeams} /></div>
              <div className="bs-split-r" style={{ flex: "60 1 0%", minWidth: 0 }}><BSDemandCurve filter={filter} /></div>
            </div>
          </div>
          {showExposure && (
            <div id="sec-money" data-cmp="Exposure" style={{ scrollMarginTop: 96 }}>
              <BSSectionRule title="Exposure" caption="Next 14 days · estimated" />
              <div style={{ marginTop: 16 }}><BSExposureStats filter={filter} /></div>
              <div className="bs-split" style={{ marginTop: 16 }}>
                <div style={{ flex: decayRemoved ? "1 1 0%" : "58 1 0%", minWidth: 0 }}><BSRecoveryWaterfall filter={filter} /></div>
                {!decayRemoved && (
                  <div style={{ flex: "42 1 0%", minWidth: 0 }}>
                    <BSOptionDecayEmpty pending={accessPending} />
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ height: 60 }} />
        </div>
        <BSSectionRail sections={sections} />
      </div>
    </BSCtx.Provider>
  )
}
