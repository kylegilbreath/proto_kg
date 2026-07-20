"use client"

// BrickSport Command — layout primitives + charts (ported from bs-charts.jsx).
import * as React from "react"
import { BS } from "./bs-data"
import type { BSFilter } from "./bs-data"
import { useBsWidth } from "./bs-map"
import { Icon } from "./bs-icon"
import { GenieIcon } from "@/components/apps/genie-icon"

const { useState, useMemo, useId } = React

// ── helpers ──────────────────────────────────────────────────────────────────
interface Scale { (v: number): number; invert: (p: number) => number }
export function bsScaleLinear(d0: number, d1: number, r0: number, r1: number): Scale {
  const fn = ((v: number) => r0 + ((v - d0) / (d1 - d0 || 1e-9)) * (r1 - r0)) as Scale
  fn.invert = (p: number) => d0 + ((p - r0) / (r1 - r0 || 1e-9)) * (d1 - d0)
  return fn
}
export function bsMonotone(pts: number[][]): string {
  const n = pts.length
  if (n < 2) return n ? "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1) : ""
  const dx: number[] = [], m: number[] = []
  for (let i = 0; i < n - 1; i++) { dx.push(pts[i + 1][0] - pts[i][0]); m.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1e-9)) }
  const t = [m[0]]
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) t.push(0)
    else { const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1]; t.push((w1 + w2) / (w1 / m[i - 1] + w2 / m[i])) }
  }
  t.push(m[n - 2])
  let d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1)
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += "C" + (pts[i][0] + h).toFixed(1) + "," + (pts[i][1] + h * t[i]).toFixed(1) + " " + (pts[i + 1][0] - h).toFixed(1) + "," + (pts[i + 1][1] - h * t[i + 1]).toFixed(1) + " " + pts[i + 1][0].toFixed(1) + "," + pts[i + 1][1].toFixed(1)
  }
  return d
}
export function bsMonotoneBand(upper: number[][], lower: number[][]): string {
  if (!upper.length || !lower.length) return ""
  const last = lower[lower.length - 1]
  return bsMonotone(upper) + " L" + last[0].toFixed(1) + "," + last[1].toFixed(1) + " " + bsMonotone(lower.slice().reverse()).replace(/^M[^C]*/, "") + " Z"
}

// ── layout primitives ──────────────────────────────────────────────────────
export function BSCard({ title, caption, right, children, padded, style, cmp }: {
  title?: string; caption?: string; right?: React.ReactNode; children?: React.ReactNode
  padded?: boolean; style?: React.CSSProperties; cmp?: string
}) {
  if (padded == null) padded = true
  return (
    <div data-cmp={cmp} style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)", borderRadius: "var(--ins-radius)", padding: padded ? "16px 18px" : 0, height: "100%", ...style }}>
      {(title || right) && (
        <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: padded ? 14 : 0, padding: padded ? 0 : "16px 16px 12px" }}>
          <div>
            {title && <div className="font-title" style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.004em", color: "var(--text-primary)" }}>{title}</div>}
            {caption && <div className="font-ui" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.35, marginTop: 2 }}>{caption}</div>}
          </div>
          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function BSSectionRule({ title, caption, right }: { title?: string; caption?: string; right?: React.ReactNode }) {
  return (
    <div style={{ marginTop: 44, marginBottom: 20, borderTop: "0.5px solid var(--ins-hairline)", paddingTop: 26 }}>
      <div className="flex items-end justify-between" style={{ gap: 12 }}>
        <div>
          {title && <div className="font-title" style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.15, color: "var(--text-primary)" }}>{title}</div>}
          {caption && <div className="font-ui" style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.4, marginTop: 4 }}>{caption}</div>}
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
    </div>
  )
}

export function BSStatTile({ label, value, suffix, valueColor, deltaText, deltaTone, deltaDirection }: {
  label: string; value: string; suffix?: string; valueColor?: string
  deltaText?: string; deltaTone?: "good" | "bad" | "neutral"; deltaDirection?: "up" | "down"
}) {
  const toneColor = deltaTone === "good" ? "var(--ins-green)" : deltaTone === "bad" ? "var(--ins-red)" : "var(--text-secondary)"
  return (
    <BSCard>
      <div className="font-ui" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{label}</div>
      <div className="flex items-baseline" style={{ gap: 4, marginTop: 6 }}>
        <span className="font-mono" style={{ fontSize: "29px", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.01em", color: valueColor || "var(--text-primary)" }}>{value}</span>
        {suffix && <span className="font-mono" style={{ fontSize: "16px", fontWeight: 500, color: valueColor || "var(--text-secondary)", opacity: valueColor ? 0.75 : 1 }}>{suffix}</span>}
      </div>
      {deltaText && (
        <div className="font-ui flex items-center" style={{ fontSize: "13px", color: toneColor, gap: 2, marginTop: 6 }}>
          {deltaDirection === "up" && <Icon name="arrow-up-right" size={13} style={{ strokeWidth: 2.4 }} />}
          {deltaDirection === "down" && <Icon name="arrow-down-right" size={13} style={{ strokeWidth: 2.4 }} />}
          {deltaText}
        </div>
      )}
    </BSCard>
  )
}

export function BSLeverBadge({ lever }: { lever: string }) {
  const badge = BS.LEVER_BADGE[lever]
  return (
    <span className="font-ui inline-flex items-center justify-center" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", color: badge.fg, background: badge.bg, padding: "2px 0", width: 84, textAlign: "center", borderRadius: 5 }}>
      {BS.LEVER_LABEL[lever]}
    </span>
  )
}

export function BSAskGenie() {
  const [hover, setHover] = useState(false)
  return (
    <button type="button" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="font-ui inline-flex items-center"
      style={{ gap: 7, fontSize: "13px", fontWeight: 600, padding: "5px 11px", borderRadius: 999, whiteSpace: "nowrap", color: "var(--text-primary)", background: hover ? "var(--bg-surface)" : "var(--bg-elevated)", border: "1px solid var(--border)", cursor: "pointer", transition: "background 0.16s ease" }}>
      <GenieIcon size={15} /> Ask Genie
    </button>
  )
}

// ── shared tooltip ─────────────────────────────────────────────────────────
interface TipRow { swatch: string; label: string; value: string }
export function BSTip({ x, y, header, rows }: { x: number | null; y: number; header?: string; rows: TipRow[] }) {
  if (x == null) return null
  return (
    <div className="font-ui" style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, calc(-100% - 10px))", pointerEvents: "none", zIndex: 30, background: "var(--bg-elevated)", border: "0.5px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-soft)", padding: "8px 10px", minWidth: 130, whiteSpace: "nowrap" }}>
      {header && <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 5 }}>{header}</div>}
      {rows.map((r, i) => (
        <div key={i} className="flex items-center" style={{ gap: 7, fontSize: 12, marginTop: i ? 3 : 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: r.swatch, flexShrink: 0, opacity: r.swatch === "transparent" ? 0 : 1 }} />
          <span style={{ color: "var(--text-secondary)", flex: 1 }}>{r.label}</span>
          <span className="font-mono" style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: 14 }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Demand change (dumbbell) ──────────────────────────────────────────────────
const BS_LOG_MIN = Math.log2(0.22), BS_LOG_MAX = Math.log2(3.6)
const bsXp = (v: number) => ((Math.log2(Math.max(0.22, Math.min(3.6, v))) - BS_LOG_MIN) / (BS_LOG_MAX - BS_LOG_MIN)) * 100
const BS_AXIS_TICKS = [0.25, 0.5, 1, 2, 3]
const BS_LIST_H = 392

function BSRowShell({ label, track, value, onClick, hoverable, active }: {
  label: React.ReactNode; track: React.ReactNode; value: React.ReactNode
  onClick?: () => void; hoverable?: boolean; active?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} className="flex items-center"
      style={{ gap: 12, padding: "4px 6px", borderRadius: "var(--ins-radius-sm)", cursor: onClick ? "pointer" : "default", background: active || (hoverable && hov) ? "var(--bg-surface)" : "transparent", transition: "background 160ms ease" }}
      onMouseEnter={() => hoverable && setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ width: 104, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0 }}>{track}</div>
      <div style={{ width: 58, flexShrink: 0, textAlign: "right" }}>{value}</div>
    </div>
  )
}
function BSTrack({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ position: "relative", height: 24 }}>
      {BS_AXIS_TICKS.map((t) => (
        <span key={t} style={{ position: "absolute", left: bsXp(t) + "%", top: 2, bottom: 2, width: 1, background: t === 1 ? "var(--ins-tile-sep)" : "var(--ins-grid)", opacity: t === 1 ? 1 : 0.55 }} />
      ))}
      {children}
    </div>
  )
}
function BSDumbbellRow({ row, onClick, active }: { row: import("./bs-data").DemandRow; onClick?: () => void; active?: boolean }) {
  const UP = BS.COVER_COLOR.under.dot, DOWN = BS.COVER_COLOR.over.dot
  const color = row.mult >= 1.12 ? UP : row.mult <= 0.88 ? DOWN : "var(--text-muted)"
  const left = Math.min(bsXp(row.mult), bsXp(1))
  const width = Math.abs(bsXp(row.mult) - bsXp(1))
  return (
    <BSRowShell onClick={onClick} hoverable active={active}
      label={<span className="font-ui inline-flex items-center" style={{ gap: 7, fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}><span>{row.flag}</span><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span></span>}
      value={<span className="inline-flex flex-col items-end"><span className="font-mono" style={{ fontSize: "14px", fontWeight: 600, color: color, lineHeight: 1.25 }}>×{row.mult.toFixed(1)}</span><span className="font-mono" style={{ fontSize: "9.5px", color: "var(--text-muted)", lineHeight: 1.2 }}>{row.lo.toFixed(1)}–{row.hi.toFixed(1)}</span></span>}
      track={<BSTrack>
        <span style={{ position: "absolute", left: bsXp(row.lo) + "%", width: Math.max(1.5, bsXp(row.hi) - bsXp(row.lo)) + "%", top: "50%", height: 3, transform: "translateY(-50%)", borderRadius: 2, background: color, opacity: 0.3 }} />
        <span style={{ position: "absolute", left: left + "%", width: width + "%", top: "50%", height: 1.5, transform: "translateY(-50%)", background: color, opacity: 0.55 }} />
        <span style={{ position: "absolute", left: bsXp(1) + "%", top: "50%", width: 7, height: 7, transform: "translate(-50%, -50%)", borderRadius: 999, border: "1.5px solid var(--text-muted)", background: "var(--bg-elevated)" }} />
        <span style={{ position: "absolute", left: bsXp(row.mult) + "%", top: "50%", width: 8, height: 8, transform: "translate(-50%, -50%)", borderRadius: 999, background: color }} />
      </BSTrack>} />
  )
}
export function BSDemandChange({ filter, setTeams }: { filter: BSFilter; setTeams: (ids: string[]) => void }) {
  const allTeamIds = BS.ALL_TEAM_IDS
  const { rows } = BS.selectDemandChange(filter)
  const teams = filter.teams
  const toggleTeam = (id: string) => { if (teams.length === 1 && teams[0] === id) setTeams(allTeamIds); else setTeams([id]) }
  return (
    <BSCard cmp="Demand change" title="Demand change" caption="Predicted vs plan · next 14 days" right={<BSAskGenie />}>
      {rows.length === 0 ? (
        <div className="font-ui" style={{ fontSize: "14px", color: "var(--text-muted)", padding: "12px 0" }}>No collections in this scope.</div>
      ) : (
        <div>
          <BSRowShell label={null} value={null} track={
            <div style={{ position: "relative", height: 14 }}>
              {BS_AXIS_TICKS.map((t) => <span key={t} className="font-mono" style={{ position: "absolute", left: bsXp(t) + "%", transform: "translateX(-50%)", fontSize: "9.5px", color: t === 1 ? "var(--text-secondary)" : "var(--text-muted)" }}>×{t}</span>)}
            </div>} />
          <div style={{ position: "relative" }}>
            <div className="ins-tile-scroll" style={{ height: BS_LIST_H, overflowY: "auto", paddingBottom: 22 }}>
              {rows.map((r) => <BSDumbbellRow key={r.id} row={r} onClick={() => toggleTeam(r.id)} active={teams.length === 1 && teams[0] === r.id} />)}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26, pointerEvents: "none", background: "linear-gradient(to bottom, transparent, var(--bg-elevated))" }} />
          </div>
        </div>
      )}
    </BSCard>
  )
}

// ── Demand index (curve) ──────────────────────────────────────────────────────
const BS_CURVE_H = 392, BS_CURVE_PAD = { top: 14, right: 58, bottom: 26, left: 38 }
export function BSDemandCurve({ filter }: { filter: BSFilter }) {
  const COVER_COLOR = BS.COVER_COLOR, FUT = BS.FUT, NEXT = BS.NEXT_MATCH_DAYS
  const ENV_MAX = COVER_COLOR.under.dot, ENV_MIN = COVER_COLOR.over.dot
  const { ref, width } = useBsWidth(560)
  const uid = useId().replace(/:/g, "")
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const view = useMemo(() => BS.selectIndexCurve(filter), [filter])
  const innerW = Math.max(0, width - BS_CURVE_PAD.left - BS_CURVE_PAD.right)
  const innerH = BS_CURVE_H - BS_CURVE_PAD.top - BS_CURVE_PAD.bottom
  const x = useMemo(() => bsScaleLinear(-3, FUT, 0, innerW), [innerW, FUT])
  const yRange = useMemo(() => {
    const all = view.tail.concat(view.lo, view.hi, view.envMax ? view.envMax.path : [], view.envMin ? view.envMin.path : [], [100])
    const hi = Math.max(...all)
    return [0, hi + (hi - 100) * 0.06 + 4]
  }, [view])
  const y = useMemo(() => bsScaleLinear(yRange[0], yRange[1], innerH, 0), [innerH, yRange])
  const paths = useMemo(() => {
    const pts = (days: number[], vals: number[]) => vals.map((v, i) => [x(days[i]), y(v)])
    return {
      tail: bsMonotone(pts(view.tailDays, view.tail)),
      avg: bsMonotone(pts(view.days, view.avg)),
      band: bsMonotoneBand(pts(view.days, view.hi), pts(view.days, view.lo)),
      envMax: view.envMax ? bsMonotone(pts(view.days, view.envMax.path)) : null,
      envMin: view.envMin ? bsMonotone(pts(view.days, view.envMin.path)) : null,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, innerW, yRange, x, y])
  const yTicks = useMemo(() => {
    const span = yRange[1] - yRange[0], step = span > 260 ? 100 : span > 130 ? 50 : 25, out: number[] = []
    for (let v = Math.ceil(yRange[0] / step) * step; v <= yRange[1]; v += step) out.push(v)
    return out
  }, [yRange])
  const xTicks = [-3, 0, 7, 14]
  const dayLabel = (d: number) => (d === 0 ? "Now" : d < 0 ? d + "d" : "+" + d + "d")
  const MATCH_DAYS = BS.MATCH_DAYS, MATCH_LABELS = BS.MATCH_LABELS
  function handleMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect()
    const day = Math.max(-3, Math.min(FUT, Math.round(x.invert(e.clientX - rect.left))))
    setHoverDay(day)
  }
  const tip = useMemo(() => {
    if (hoverDay == null) return null
    const d = hoverDay
    const tx = BS_CURVE_PAD.left + x(d)
    if (d < 0) return { x: tx, y: BS_CURVE_PAD.top + y(view.tail[d + 3]), header: dayLabel(d), rows: [{ swatch: "var(--text-primary)", label: "Actual", value: "" + Math.round(view.tail[d + 3]) }] }
    const rows: TipRow[] = [
      { swatch: "var(--ins-indigo)", label: "Average", value: "" + Math.round(view.avg[d]) },
      { swatch: "var(--ins-indigo-soft)", label: "Interval", value: Math.round(view.lo[d]) + "–" + Math.round(view.hi[d]) },
    ]
    if (view.envMax) rows.push({ swatch: ENV_MAX, label: view.envMax.id, value: "" + Math.round(view.envMax.path[d]) })
    if (view.envMin) rows.push({ swatch: ENV_MIN, label: view.envMin.id, value: "" + Math.round(view.envMin.path[d]) })
    return { x: tx, y: BS_CURVE_PAD.top + y(view.avg[d]), header: dayLabel(d), rows }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverDay, view, x, y])
  return (
    <BSCard cmp="Demand index" title="Demand index" caption="Scope vs plan = 100 · next 14 days" right={<BSAskGenie />}>
      <div ref={ref} className="w-full" style={{ position: "relative" }}>
        <svg width={width} height={BS_CURVE_H} style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id={uid + "-band"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ins-indigo)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--ins-indigo)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <g transform={"translate(" + BS_CURVE_PAD.left + "," + BS_CURVE_PAD.top + ")"}>
            <rect x={x(0)} y={0} width={x(NEXT) - x(0)} height={innerH} fill="var(--ins-indigo)" opacity={0.045} />
            <text x={(x(0) + x(NEXT)) / 2} y={innerH - 8} textAnchor="middle" className="font-ui" fill="var(--ins-axis)" fontSize={9} opacity={0.9}>Action window</text>
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={0} x2={innerW} y1={y(v)} y2={y(v)} stroke={v === 100 ? "var(--ins-tile-sep)" : "var(--ins-grid)"} strokeWidth={v === 100 ? 1 : 0.5} />
                <text x={-8} y={y(v) + 4} textAnchor="end" className="font-mono" fill={v === 100 ? "var(--text-secondary)" : "var(--ins-axis)"} fontSize={10.5}>{v}</text>
              </g>
            ))}
            <line x1={x(0)} x2={x(0)} y1={-2} y2={innerH} stroke="var(--text-secondary)" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />
            <text x={x(0)} y={-6} textAnchor="middle" className="font-ui" fill="var(--text-muted)" fontSize={9.5} fontWeight={600}>Now</text>
            {MATCH_DAYS.map((d, i) => (
              <g key={d}>
                <line x1={x(d)} x2={x(d)} y1={-2} y2={innerH} stroke="var(--text-muted)" strokeWidth={0.8} strokeDasharray="2 4" opacity={0.55} />
                <text x={x(d)} y={-6} textAnchor="middle" className="font-ui" fill="var(--text-muted)" fontSize={9.5} fontWeight={600}>{MATCH_LABELS[i]}</text>
              </g>
            ))}
            {hoverDay != null && <line x1={x(hoverDay)} x2={x(hoverDay)} y1={-2} y2={innerH} stroke="var(--ins-axis)" strokeWidth={1} opacity={0.35} />}
            <path d={paths.band} fill={"url(#" + uid + "-band)"} stroke="none" />
            {paths.envMax && <path d={paths.envMax} fill="none" stroke={ENV_MAX} strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />}
            {paths.envMin && <path d={paths.envMin} fill="none" stroke={ENV_MIN} strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />}
            <path d={paths.tail} fill="none" stroke="var(--text-primary)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            <path d={paths.avg} fill="none" stroke="var(--ins-indigo)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={x(0)} cy={y(view.avg[0])} r={3} fill="var(--bg-elevated)" stroke="var(--ins-indigo)" strokeWidth={1.8} />
            {view.envMax && <text x={innerW + 6} y={y(view.envMax.path[FUT]) + 3} className="font-mono" fill={ENV_MAX} fontSize={9}>{view.envMax.id}</text>}
            {view.envMin && <text x={innerW + 6} y={y(view.envMin.path[FUT]) + 3} className="font-mono" fill={ENV_MIN} fontSize={9}>{view.envMin.id}</text>}
            {hoverDay != null && hoverDay < 0 && <circle cx={x(hoverDay)} cy={y(view.tail[hoverDay + 3])} r={3.5} fill="var(--bg-elevated)" stroke="var(--text-primary)" strokeWidth={2} />}
            {hoverDay != null && hoverDay >= 0 && <circle cx={x(hoverDay)} cy={y(view.avg[hoverDay])} r={3.5} fill="var(--bg-elevated)" stroke="var(--ins-indigo)" strokeWidth={2} />}
            {xTicks.map((d) => <text key={d} x={x(d)} y={innerH + 18} textAnchor="middle" className="font-mono" fill={d === 0 ? "var(--text-secondary)" : "var(--ins-axis)"} fontSize={10.5}>{dayLabel(d)}</text>)}
            {MATCH_DAYS.map((d) => <text key={d} x={x(d)} y={innerH + 18} textAnchor="middle" className="font-mono" fill="var(--ins-axis)" fontSize={10.5}>+{d}d</text>)}
            <rect x={0} y={-BS_CURVE_PAD.top} width={innerW} height={BS_CURVE_H} fill="transparent" onMouseMove={handleMove} onMouseLeave={() => setHoverDay(null)} />
          </g>
        </svg>
        {tip && <BSTip x={tip.x} y={tip.y} header={tip.header} rows={tip.rows} />}
        <div className="flex items-center" style={{ flexWrap: "wrap", columnGap: 16, rowGap: 6, marginTop: 8, paddingLeft: BS_CURVE_PAD.left }}>
          <BSLegend swatch="var(--text-primary)" label="Actual" />
          <BSLegend swatch="var(--ins-indigo)" label="Average" />
          <BSLegend swatch="var(--ins-indigo)" label="Interval" band />
          {view.envMax && <BSLegend swatch={ENV_MAX} label={view.envMax.id} dashed />}
          {view.envMin && <BSLegend swatch={ENV_MIN} label={view.envMin.id} dashed />}
        </div>
      </div>
    </BSCard>
  )
}
function BSLegend({ swatch, label, dashed, band }: { swatch: string; label: string; dashed?: boolean; band?: boolean }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 6 }}>
      {band ? <span style={{ width: 14, height: 9, borderRadius: 2, background: swatch, opacity: 0.18 }} />
        : <span style={{ width: 14, height: 0, borderTop: "2.5px " + (dashed ? "dashed" : "solid") + " " + swatch }} />}
      <span className="font-ui" style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>{label}</span>
    </span>
  )
}

// ── Exposure stats ─────────────────────────────────────────────────────────
export function BSExposureStats({ filter }: { filter: BSFilter }) {
  const usd = BS.usd
  const decay = useMemo(() => BS.selectOptionDecay(filter), [filter])
  const moves = useMemo(() => BS.selectRecommendations(filter).filter((r) => r.impactUsd > 0).length, [filter])
  const meta = decay.meta
  const pct = meta.grossUsd > 0 ? Math.round((meta.recoveredUsd / meta.grossUsd) * 100) : 0
  const wait24 = Math.max(0, decay.nowUsd - decay.in24Usd)
  return (
    <div className="bs-tilerow" data-cmp="Exposure summary">
      <BSStatTile label="Gross exposure" value={usd(meta.grossUsd)} deltaText={"Lost sales " + usd(meta.lostSalesUsd) + " · markdown " + usd(meta.markdownUsd) + " · est."} deltaTone="neutral" />
      <BSStatTile label="Recoverable now" value={usd(meta.recoveredUsd)} valueColor="var(--ins-teal)" deltaText={pct + "% of gross · " + moves + (moves === 1 ? " move" : " moves")} deltaTone="good" />
      <BSStatTile label="Cost of waiting 24h" value={"−" + usd(wait24)} valueColor="var(--ins-red)" deltaText={usd(decay.in24Usd) + " still recoverable d+1"} deltaTone="bad" deltaDirection="down" />
    </div>
  )
}

// ── Recovery waterfall ─────────────────────────────────────────────────────
const BS_WF_H = 320, BS_WF_PAD = { top: 26, right: 12, bottom: 38, left: 48 }, BS_WF_GAP = 0.42
export function BSRecoveryWaterfall({ filter }: { filter: BSFilter }) {
  const usd = BS.usd, COVER_COLOR = BS.COVER_COLOR
  const { ref, width } = useBsWidth(420)
  const [hoverBand, setHoverBand] = useState<number | null>(null)
  const bridge = useMemo(() => BS.selectBridge(filter), [filter])
  const bars = bridge.steps, meta = bridge.meta
  const computed = useMemo(() => {
    const arr: { bar: import("./bs-data").BridgeStep; top: number; bottom: number; color: string }[] = []; let running = 0
    for (const bar of bars) {
      if (bar.kind === "total") {
        const isResidual = bar.label.toLowerCase().indexOf("residual") >= 0
        arr.push({ bar, top: bar.usd, bottom: 0, color: isResidual ? "var(--text-muted)" : "var(--ins-red)" })
        running = bar.usd
      } else { const top = running, bottom = running + bar.usd; arr.push({ bar, top, bottom, color: "var(--ins-teal)" }); running = bottom }
    }
    return arr
  }, [bars])
  const innerW = Math.max(0, width - BS_WF_PAD.left - BS_WF_PAD.right)
  const innerH = BS_WF_H - BS_WF_PAD.top - BS_WF_PAD.bottom
  const maxV = Math.max(1, ...computed.map((c) => c.top))
  const y = (v: number) => innerH - (v / maxV) * innerH
  const n = computed.length, slot = innerW / Math.max(1, n), barW = Math.min(72, slot * (1 - BS_WF_GAP))
  const yTicks = [0, 1, 2, 3].map((i) => Math.round((maxV / 3) * i))
  function handleMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect()
    const b = Math.floor((e.clientX - rect.left) / Math.max(1, slot))
    if (b < 0 || b >= computed.length) { setHoverBand(null); return }
    setHoverBand(b)
  }
  const tip = useMemo(() => {
    if (hoverBand == null || !computed[hoverBand]) return null
    const c = computed[hoverBand], bar = c.bar
    const tx = BS_WF_PAD.left + hoverBand * slot + slot / 2, ty = BS_WF_PAD.top + y(c.top)
    let rows: TipRow[]
    if (bar.key === "gross") rows = [
      { swatch: COVER_COLOR.under.dot, label: "Lost sales", value: usd(meta.lostSalesUsd) },
      { swatch: COVER_COLOR.over.dot, label: "Markdown liability", value: usd(meta.markdownUsd) },
      { swatch: "var(--ins-red)", label: "Gross exposure", value: usd(bar.usd) },
    ]
    else if (bar.kind === "recovery") { rows = [{ swatch: "var(--ins-teal)", label: "Recovers", value: usd(Math.abs(bar.usd)) }, { swatch: "var(--text-muted)", label: "Residual after", value: usd(bar.afterUsd) }]; if (bar.recIds && bar.recIds.length) rows.push({ swatch: "transparent", label: "Moves", value: bar.recIds.join(" · ") }) }
    else rows = [{ swatch: "var(--text-muted)", label: "Unrecovered exposure", value: usd(bar.usd) }]
    return { x: tx, y: ty, header: bar.label, rows }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverBand, computed, meta, slot])
  return (
    <BSCard cmp="Recovery waterfall" title="Recovery" caption="Gross → levers → residual · est." right={<BSAskGenie />}>
      <div ref={ref} className="w-full" style={{ position: "relative" }}>
        <svg width={width} height={BS_WF_H} style={{ display: "block", overflow: "visible" }}>
          <g transform={"translate(" + BS_WF_PAD.left + "," + BS_WF_PAD.top + ")"}>
            {yTicks.map((v) => (
              <g key={v}><line x1={0} x2={innerW} y1={y(v)} y2={y(v)} stroke="var(--ins-grid)" strokeWidth={0.5} /><text x={-8} y={y(v) + 4} textAnchor="end" className="font-mono" fill="var(--ins-axis)" fontSize={10.5}>{usd(v)}</text></g>
            ))}
            {computed.map((c, i) => {
              const cx = i * slot + (slot - barW) / 2, yTop = y(c.top), h = Math.max(2, y(c.bottom) - y(c.top))
              const isStep = c.bar.kind === "recovery", dim = hoverBand != null && hoverBand !== i
              let connY: number | null = null
              if (i > 0) { const prev = computed[i - 1]; connY = y(prev.bar.kind === "total" ? prev.top : prev.bottom) }
              return (
                <g key={c.bar.label + "-" + i} style={{ opacity: dim ? 0.32 : 1, transition: "opacity 120ms ease" }}>
                  {hoverBand === i && <rect x={i * slot} y={0} width={slot} height={innerH} rx={4} fill="var(--ins-axis)" opacity={0.06} />}
                  {i > 0 && <line x1={(i - 1) * slot + (slot - barW) / 2 + barW} x2={cx} y1={connY as number} y2={connY as number} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="2 3" opacity={dim ? 0.25 : 0.6} />}
                  <rect x={cx} y={yTop} width={barW} height={h} rx={3} fill={c.color} opacity={isStep ? 0.92 : 1} />
                  <text x={cx + barW / 2} y={yTop - 8} textAnchor="middle" className="font-mono" fill={isStep ? "var(--ins-teal)" : "var(--text-primary)"} fontSize={12} fontWeight={700}>{usd(c.bar.usd)}</text>
                  <text x={cx + barW / 2} y={innerH + 20} textAnchor="middle" className="font-ui" fill="var(--text-primary)" fontSize={12} fontWeight={600}>{c.bar.label}</text>
                </g>
              )
            })}
            <rect x={0} y={0} width={innerW} height={innerH} fill="transparent" onMouseMove={handleMove} onMouseLeave={() => setHoverBand(null)} />
          </g>
        </svg>
        {tip && <BSTip x={tip.x} y={tip.y} header={tip.header} rows={tip.rows} />}
      </div>
    </BSCard>
  )
}

// ── Option decay (staircase) ──────────────────────────────────────────────────
const BS_OD_H = 320, BS_OD_PAD = { top: 26, right: 14, bottom: 30, left: 48 }
export function BSOptionDecay({ filter }: { filter: BSFilter }) {
  const usd = BS.usd
  const { ref, width } = useBsWidth(420)
  const uid = useId().replace(/:/g, "")
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const view = useMemo(() => BS.selectOptionDecay(filter), [filter])
  const innerW = Math.max(0, width - BS_OD_PAD.left - BS_OD_PAD.right)
  const innerH = BS_OD_H - BS_OD_PAD.top - BS_OD_PAD.bottom
  const x = useMemo(() => bsScaleLinear(0, view.horizonH, 0, innerW), [innerW, view.horizonH])
  const yMax = Math.max(1, view.nowUsd) * 1.06
  const y = useMemo(() => bsScaleLinear(0, yMax, innerH, 0), [innerH, yMax])
  const built = useMemo(() => {
    const pts: number[][] = [[0, view.nowUsd]]; let v = view.nowUsd; const lv: { step: import("./bs-data").DecayStep; before: number; after: number }[] = []
    for (const s of view.steps) { pts.push([s.atHours, v]); lv.push({ step: s, before: v, after: v - s.lostUsd }); v -= s.lostUsd; pts.push([s.atHours, v]) }
    pts.push([view.horizonH, v])
    const d = pts.map(([px, pv], i) => (i === 0 ? "M" : "L") + x(px).toFixed(1) + "," + y(pv).toFixed(1)).join(" ")
    const area = d + " L" + x(view.horizonH).toFixed(1) + "," + y(0).toFixed(1) + " L" + x(0).toFixed(1) + "," + y(0).toFixed(1) + " Z"
    return { linePath: d, areaPath: area, levels: lv }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, innerW, yMax, x, y])
  const levels = built.levels
  const yTicks = useMemo(() => {
    const step = yMax > 320000 ? 100000 : yMax > 160000 ? 50000 : 25000, out: number[] = []
    for (let v = 0; v <= yMax; v += step) out.push(v)
    return out
  }, [yMax])
  const xTicks = [0, 12, 24, 48, 72]
  const hourLabel = (h: number) => (h === 0 ? "Now" : h < 24 ? "+" + h + "h" : "+" + h / 24 + "d")
  function handleMove(e: React.MouseEvent) {
    if (!levels.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const h = x.invert(e.clientX - rect.left)
    let best = 0
    for (let i = 1; i < levels.length; i++) if (Math.abs(levels[i].step.atHours - h) < Math.abs(levels[best].step.atHours - h)) best = i
    setHoverIdx(best)
  }
  const labelled = useMemo(() => {
    const out: { x: number; y: number; text: string }[] = []; let lastX = -Infinity
    for (const lv of levels) { const px = x(lv.step.atHours); if (px - lastX < 30) continue; lastX = px; out.push({ x: px + 4, y: (y(lv.before) + y(lv.after)) / 2 + 3, text: lv.step.ids.join("·") }) }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, innerW, yMax, x, y])
  const tip = useMemo(() => {
    if (hoverIdx == null || !levels[hoverIdx]) return null
    const lv = levels[hoverIdx]
    return { x: BS_OD_PAD.left + x(lv.step.atHours), y: BS_OD_PAD.top + y(lv.before), header: hourLabel(Math.round(lv.step.atHours)),
      rows: [{ swatch: "var(--ins-red)", label: "Expires", value: lv.step.ids.join(" · ") }, { swatch: "var(--ins-red)", label: "Value lost", value: "−" + usd(lv.step.lostUsd) }, { swatch: "var(--ins-teal)", label: "Still recoverable", value: usd(lv.after) }] as TipRow[] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverIdx, levels, x, y])
  return (
    <BSCard cmp="Recoverable value" title="Recoverable value" caption="By decision time · options expire · est." right={<BSAskGenie />}>
      <div ref={ref} className="w-full" style={{ position: "relative" }}>
        <svg width={width} height={BS_OD_H} style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id={uid + "-area"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ins-teal)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--ins-teal)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <g transform={"translate(" + BS_OD_PAD.left + "," + BS_OD_PAD.top + ")"}>
            {yTicks.map((v) => (
              <g key={v}><line x1={0} x2={innerW} y1={y(v)} y2={y(v)} stroke="var(--ins-grid)" strokeWidth={0.5} /><text x={-8} y={y(v) + 4} textAnchor="end" className="font-mono" fill="var(--ins-axis)" fontSize={10.5}>{v === 0 ? "$0" : usd(v)}</text></g>
            ))}
            <path d={built.areaPath} fill={"url(#" + uid + "-area)"} stroke="none" />
            <path d={built.linePath} fill="none" stroke="var(--ins-teal)" strokeWidth={1.8} strokeLinejoin="round" />
            <circle cx={x(0)} cy={y(view.nowUsd)} r={3.5} fill="var(--bg-elevated)" stroke="var(--ins-teal)" strokeWidth={2} />
            {levels.map((lv, i) => <circle key={lv.step.atHours} cx={x(lv.step.atHours)} cy={y(lv.before)} r={hoverIdx === i ? 3.5 : 2.5} fill="var(--bg-elevated)" stroke="var(--ins-teal)" strokeWidth={1.6} />)}
            {labelled.map((l) => <text key={l.text + l.x} x={l.x} y={l.y} className="font-mono" fill="var(--text-muted)" fontSize={9}>{l.text}</text>)}
            <text x={x(0)} y={y(view.nowUsd) - 10} className="font-mono" fill="var(--ins-teal)" fontSize={11} fontWeight={700}>{usd(view.nowUsd)}</text>
            <text x={innerW} y={y(view.endUsd) - 8} textAnchor="end" className="font-mono" fill="var(--text-muted)" fontSize={10.5} fontWeight={600}>{usd(view.endUsd)}</text>
            {hoverIdx != null && levels[hoverIdx] && <line x1={x(levels[hoverIdx].step.atHours)} x2={x(levels[hoverIdx].step.atHours)} y1={-2} y2={innerH} stroke="var(--ins-axis)" strokeWidth={1} opacity={0.35} />}
            {xTicks.map((h) => <text key={h} x={x(h)} y={innerH + 18} textAnchor={h === 0 ? "start" : "middle"} className="font-mono" fill={h === 0 ? "var(--text-secondary)" : "var(--ins-axis)"} fontSize={10.5}>{hourLabel(h)}</text>)}
            <rect x={0} y={0} width={innerW} height={innerH} fill="transparent" onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)} />
          </g>
        </svg>
        {tip && <BSTip x={tip.x} y={tip.y} header={tip.header} rows={tip.rows} />}
      </div>
    </BSCard>
  )
}

// ── Option decay — empty state (data point gated on an un-approved table) ──
export function BSOptionDecayEmpty({ pending }: { pending?: boolean }) {
  return (
    <BSCard cmp="Recoverable value" title="Recoverable value" caption="By decision time · options expire · est." right={<BSAskGenie />}>
      <div className="flex flex-col items-center justify-center" style={{ height: BS_OD_H, textAlign: "center", gap: 11 }}>
        <div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 999, background: "var(--bg-surface)", color: "var(--text-muted)" }}>
          <Icon name="lock" size={18} />
        </div>
        <div className="font-ui" style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-secondary)" }}>No data access yet</div>
        <div className="font-mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>main.supply_chain.supplier_lead_times</div>
        {pending ? (
          <span className="font-ui inline-flex items-center" style={{ gap: 6, fontSize: "11.5px", fontWeight: 600, color: "var(--ins-amber)", background: "var(--ins-amber-soft)", padding: "3px 10px", borderRadius: 999 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--ins-amber)" }} />Access request pending
          </span>
        ) : (
          <span className="font-ui inline-flex items-center" style={{ gap: 6, fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-surface)", padding: "3px 10px", borderRadius: 999 }}>
            <Icon name="lock" size={11} />Requires table access
          </span>
        )}
      </div>
    </BSCard>
  )
}
