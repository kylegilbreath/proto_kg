"use client"

// BrickSport Command — dotted globe map + MiniTrend (ported from bs-map.jsx).
// The kit fetched world-atlas land-110m.json + topojson from a CDN at runtime and
// ray-cast a 2° grid. Here the grid is precomputed offline (scripts/gen-brickstore
// -land-grid.mjs) and imported statically — no runtime fetch, no topojson dep.
import * as React from "react"
import landGrid from "./land-grid.json"
import { BS } from "./bs-data"
import type { OverviewStore, CountryFocus } from "./bs-data"
import type { BSTheme, BSView } from "./bs-context"
import { Icon } from "./bs-icon"

const { useRef, useEffect, useState, useMemo, useId } = React

// Precomputed land-point cloud (array of [lng, lat]). Empty array → graceful
// bubbles-only fallback, exactly like the kit degraded when the fetch failed.
const BS_LAND_POINTS = landGrid as [number, number][]

// ── width hook (ResizeObserver) ─────────────────────────────────────────────
export function useBsWidth(initial?: number) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(initial || 600)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) { const w = e.contentRect.width; if (w > 0) setWidth(w) }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

// ── Globe constants ──────────────────────────────────────────────────────────
const BS_DEG = Math.PI / 180
const BS_RAD = 180 / Math.PI
const BS_TWO_PI = Math.PI * 2
const BS_GLOBE_FILL = 0.46, BS_GLOBE_PAD = 16
const BS_FLAT_PAD = 16, BS_FLAT_LAT_SPAN = 145
const BS_BUBBLE_BASE_MIN = 4, BS_BUBBLE_BASE_MAX = 13, BS_BUBBLE_ZOOM_EXP = 0.5, BS_BUBBLE_PX_MAX = 30
const BS_TRANS_DUR = 820, BS_EASE_CAM = 0.11, BS_MOMENTUM_DECAY = 0.9, BS_DRIFT_DEG_PER_SEC = 10
const BS_US_DEFAULT = [-98.35, 0]
const BS_OUT_OF_MARKET_DOT = "#BCC0BC"

function bsWrapLng(l: number) { let x = l; while (x > 180) x -= 360; while (x < -180) x += 360; return x }
function bsClampLat(l: number) { return Math.max(-82, Math.min(82, l)) }
function bsShortestDelta(from: number, to: number) { let d = to - from; while (d > 180) d -= 360; while (d < -180) d += 360; return d }
function bsCamFar(a: number[], b: number[]) { return Math.abs(a[0] - b[0]) > 0.05 || Math.abs(a[1] - b[1]) > 0.05 }
function bsSmoothstep(a: number, b: number, x: number) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
function bsSineInOut(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2 }
function bsNow() { return typeof performance !== "undefined" ? performance.now() : 0 }
function bsReadColors(theme?: BSTheme): { dot: string; globeOutline: string } {
  const isDark = theme === "dark"
  let mutedVar = "#585C76"
  if (typeof document !== "undefined") {
    const root = document.querySelector(".bs-root")
    if (root) {
      const v = getComputedStyle(root).getPropertyValue("--text-muted").trim()
      if (v) mutedVar = v
    }
  }
  return {
    dot: isDark ? mutedVar : "#ADB3AF",
    globeOutline: isDark ? "rgba(180, 184, 210, 0.22)" : "rgba(0, 0, 0, 0.10)",
  }
}
function bsIsFullMarket(ids: string[]) {
  const all = BS.ALL_COUNTRY_IDS
  return ids.length >= all.length && all.every((id) => ids.indexOf(id) >= 0)
}

interface BSDottedMapProps {
  stores: OverviewStore[]
  marketCountries: string[]
  width: number
  height: number
  view: BSView
  focus: CountryFocus | null
  hoveredId: string | null
  expandedId: string | null
  setHovered: (id: string | null) => void
  toggleExpanded: (id: string) => void
  theme: BSTheme
}

function BSDottedMap({ stores, marketCountries, width, height, view, focus, hoveredId, expandedId, setHovered, toggleExpanded, theme }: BSDottedMapProps) {
  const COVER_COLOR = BS.COVER_COLOR, bubbleRadius = BS.bubbleRadius
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ready] = useState<boolean>(BS_LAND_POINTS.length > 0)

  const REST = view === "flat" ? [0, 0] : BS_US_DEFAULT.slice()
  const rot = useRef(REST.slice())
  const rotTarget = useRef(REST.slice())
  const lastTick = useRef(bsNow())
  const rotFrom = useRef(REST.slice())
  const rotTo = useRef(REST.slice())
  const pan = useRef([0, 0])
  const panTarget = useRef([0, 0])
  const zoom = useRef(1)
  const zoomTarget = useRef(1)
  const trans = useRef(view === "globe" ? 1 : 0)
  const transTarget = useRef(view === "globe" ? 1 : 0)
  const transFrom = useRef(view === "globe" ? 1 : 0)
  const transStart = useRef(0)
  const vel = useRef([0, 0])
  const velMode = useRef<"pan" | "rot">("pan")
  const dragging = useRef(false)
  const hasDragged = useRef(false)
  const lastPt = useRef([0, 0])
  const focused = useRef(false)
  const rafId = useRef<number | undefined>(undefined)
  const colors = useRef(bsReadColors(theme))

  const propsRef = useRef({ stores, marketCountries, width, height, hoveredId, expandedId, view })
  propsRef.current = { stores, marketCountries, width, height, hoveredId, expandedId, view }

  const flatBaseFactor = () => {
    const w = propsRef.current.width, h = propsRef.current.height
    return Math.min((w - BS_FLAT_PAD * 2) / 360, (h - BS_FLAT_PAD * 2) / BS_FLAT_LAT_SPAN)
  }
  const globeRadius = () => {
    const short = Math.min(propsRef.current.width, propsRef.current.height)
    return Math.min(short * BS_GLOBE_FILL, short / 2 - BS_GLOBE_PAD)
  }
  const storeRadiusPx = (volume: number) => {
    const base = bubbleRadius(volume, BS_BUBBLE_BASE_MIN, BS_BUBBLE_BASE_MAX)
    const effZoom = 1 + (zoom.current - 1) * (1 - trans.current)
    return Math.min(BS_BUBBLE_PX_MAX, base * Math.pow(effZoom, BS_BUBBLE_ZOOM_EXP))
  }

  useEffect(() => {
    const tt = view === "globe" ? 1 : 0
    if (transTarget.current !== tt) {
      transFrom.current = trans.current
      transTarget.current = tt
      transStart.current = bsNow()
      rotFrom.current = rot.current.slice()
      rotTo.current = view === "flat" ? [0, 0] : (focus ? [focus.lng, rot.current[1]] : [0, 0])
    }
    if (view === "globe") {
      if (focus) { rotTarget.current = [focus.lng, rot.current[1]]; focused.current = true }
      else { rotTarget.current = rot.current.slice(); focused.current = false }
    } else { rotTarget.current = rot.current.slice(); focused.current = true }
    panTarget.current = [0, 0]; zoomTarget.current = 1; vel.current = [0, 0]
    startLoop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, focus, width, height])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { colors.current = bsReadColors(theme); startLoop() }, [theme])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { startLoop() }, [stores, marketCountries])

  function startLoop() {
    if (rafId.current != null) return
    const loop = () => { const active = tick(); draw(); rafId.current = active ? requestAnimationFrame(loop) : undefined }
    rafId.current = requestAnimationFrame(loop)
  }
  function tick() {
    let active = false
    const eps = 0.0008
    const now = bsNow()
    const dt = Math.min((now - lastTick.current) / 1000, 0.05)
    lastTick.current = now
    const morphing = trans.current !== transTarget.current
    if (morphing) {
      const p = Math.min(1, (bsNow() - transStart.current) / BS_TRANS_DUR)
      const e = bsSineInOut(p)
      if (p >= 1) { trans.current = transTarget.current; rot.current = rotTo.current.slice() }
      else {
        trans.current = transFrom.current + (transTarget.current - transFrom.current) * e
        rot.current[0] = bsWrapLng(rotFrom.current[0] + bsShortestDelta(rotFrom.current[0], rotTo.current[0]) * e)
        rot.current[1] = rotFrom.current[1] + (rotTo.current[1] - rotFrom.current[1]) * e
      }
      rotTarget.current = rot.current.slice()
      active = true
    }
    if (Math.abs(zoom.current - zoomTarget.current) > eps) { zoom.current += (zoomTarget.current - zoom.current) * 0.18; active = true }
    else zoom.current = zoomTarget.current
    const globeish = trans.current > 0.5
    if (dragging.current) active = true
    else if (!morphing) {
      const vx = vel.current[0], vy = vel.current[1]
      if (Math.abs(vx) > 0.001 || Math.abs(vy) > 0.001) {
        if (velMode.current === "rot") { rot.current[0] = bsWrapLng(rot.current[0] + vx); rot.current[1] = bsClampLat(rot.current[1] + vy); rotTarget.current = rot.current.slice() }
        else { pan.current[0] += vx; pan.current[1] += vy; clampPan(); panTarget.current = pan.current.slice() }
        vel.current = [vx * BS_MOMENTUM_DECAY, vy * BS_MOMENTUM_DECAY]
        active = true
      } else {
        if (bsCamFar(rot.current, rotTarget.current)) {
          rot.current[0] = bsWrapLng(rot.current[0] + bsShortestDelta(rot.current[0], rotTarget.current[0]) * BS_EASE_CAM)
          rot.current[1] += (rotTarget.current[1] - rot.current[1]) * BS_EASE_CAM
          active = true
        }
        if (bsCamFar(pan.current, panTarget.current)) {
          pan.current[0] += (panTarget.current[0] - pan.current[0]) * BS_EASE_CAM
          pan.current[1] += (panTarget.current[1] - pan.current[1]) * BS_EASE_CAM
          active = true
        }
        if (globeish && !focused.current) { rot.current[0] = bsWrapLng(rot.current[0] - BS_DRIFT_DEG_PER_SEC * dt); rotTarget.current = rot.current.slice(); active = true }
      }
    }
    return active
  }
  function projectLL(lng: number, lat: number) {
    const w = propsRef.current.width, h = propsRef.current.height
    const t = trans.current, z = zoom.current
    const ff = flatBaseFactor() * z
    const fx = w / 2 + pan.current[0] + ff * bsWrapLng(lng - rot.current[0])
    const fy = h / 2 + pan.current[1] - ff * (lat - rot.current[1])
    if (t < 0.001) return { x: fx, y: fy, alpha: 1, depth: 1 }
    const R = globeRadius()
    const phi = lat * BS_DEG, lam0 = rot.current[0] * BS_DEG, phi0 = rot.current[1] * BS_DEG
    const dlam = lng * BS_DEG - lam0
    const cosc = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(dlam)
    const gx = w / 2 + R * Math.cos(phi) * Math.sin(dlam)
    const gy = h / 2 - R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(dlam))
    if (cosc < 0) {
      const reveal = bsSmoothstep(0, 0.65, 1 - t)
      if (reveal <= 0) return { x: 0, y: 0, alpha: 0, depth: 1 }
      return { x: fx + (gx - fx) * t, y: fy + (gy - fy) * t, alpha: reveal, depth: 1 }
    }
    if (t > 0.999) return { x: gx, y: gy, alpha: 1, depth: cosc }
    return { x: fx + (gx - fx) * t, y: fy + (gy - fy) * t, alpha: 1, depth: cosc }
  }
  function draw() {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const w = propsRef.current.width, h = propsRef.current.height
    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const col = colors.current, t = trans.current, z = zoom.current
    const LAND = BS_LAND_POINTS || []
    if (t > 0.78) {
      const R = globeRadius()
      ctx.globalAlpha = bsSmoothstep(0.78, 1, t)
      ctx.beginPath(); ctx.arc(w / 2, h / 2, R, 0, BS_TWO_PI)
      ctx.strokeStyle = col.globeOutline; ctx.lineWidth = 1; ctx.stroke()
      ctx.globalAlpha = 1
    }
    const dotR = Math.max(1.35, (w / 390) * Math.min(z, 2))
    const baseDotAlpha = 0.34, RIM = 0.16
    const faded: { x: number; y: number; a: number }[] = []
    ctx.fillStyle = col.dot; ctx.globalAlpha = baseDotAlpha; ctx.beginPath()
    for (let i = 0; i < LAND.length; i++) {
      const p = projectLL(LAND[i][0], LAND[i][1])
      if (p.alpha <= 0) continue
      if (p.x < -6 || p.x > w + 6 || p.y < -6 || p.y > h + 6) continue
      const rimFactor = p.depth < RIM ? p.depth / RIM : 1
      const a = baseDotAlpha * p.alpha * rimFactor
      if (a >= baseDotAlpha - 1e-3) { ctx.moveTo(p.x + dotR, p.y); ctx.arc(p.x, p.y, dotR, 0, BS_TWO_PI) }
      else faded.push({ x: p.x, y: p.y, a })
    }
    ctx.fill()
    for (const d of faded) { ctx.globalAlpha = d.a; ctx.beginPath(); ctx.arc(d.x, d.y, dotR, 0, BS_TWO_PI); ctx.fill() }
    ctx.globalAlpha = 1
    const P = propsRef.current
    const narrowMarket = P.marketCountries.length > 0 && !bsIsFullMarket(P.marketCountries)
    const marketSet = narrowMarket ? new Set(P.marketCountries) : null
    const drawBubble = (s: OverviewStore, dimmed: boolean) => {
      const p = projectLL(s.lng, s.lat)
      if (p.alpha <= 0) return
      const hot = s.id === P.hoveredId || s.id === P.expandedId
      const rad = storeRadiusPx(s.salesVolumeUnitsDay) * (hot && !dimmed ? 1.45 : dimmed ? 0.95 : 1)
      const baseA = dimmed ? (hot ? 0.44 : 0.32) : hot ? 0.62 : 0.42
      ctx.globalAlpha = baseA * p.alpha
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, BS_TWO_PI)
      ctx.fillStyle = dimmed ? BS_OUT_OF_MARKET_DOT : COVER_COLOR[s.band].dot
      ctx.fill()
    }
    for (const s of P.stores) { const dimmed = marketSet != null && !marketSet.has(s.country); if (dimmed) drawBubble(s, true) }
    for (const s of P.stores) { const dimmed = marketSet != null && !marketSet.has(s.country); if (!dimmed) drawBubble(s, false) }
    ctx.globalAlpha = 1
  }
  function hitTest(mx: number, my: number) {
    let best: string | null = null, bestD = Infinity
    for (const s of propsRef.current.stores) {
      const p = projectLL(s.lng, s.lat)
      if (p.alpha < 0.5) continue
      const rad = storeRadiusPx(s.salesVolumeUnitsDay) + 5
      const d = (p.x - mx) ** 2 + (p.y - my) ** 2
      if (d <= rad * rad && d < bestD) { bestD = d; best = s.id }
    }
    return best
  }
  function clampPan() {
    if (trans.current > 0.5) return
    const w = propsRef.current.width, h = propsRef.current.height
    const ff = flatBaseFactor() * zoom.current
    const maxX = Math.max(0, ff * 180 - w / 2 + BS_FLAT_PAD)
    const maxY = Math.max(0, ff * (BS_FLAT_LAT_SPAN / 2) - h / 2 + BS_FLAT_PAD)
    pan.current[0] = Math.max(-maxX, Math.min(maxX, pan.current[0]))
    pan.current[1] = Math.max(-maxY, Math.min(maxY, pan.current[1]))
  }
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const local = (e: PointerEvent): [number, number] => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
    const onDown = (e: PointerEvent) => { dragging.current = true; hasDragged.current = false; lastPt.current = local(e); vel.current = [0, 0]; canvas.setPointerCapture(e.pointerId); startLoop() }
    const onMove = (e: PointerEvent) => {
      const pt = local(e), x = pt[0], y = pt[1]
      if (dragging.current) {
        const dx = x - lastPt.current[0], dy = y - lastPt.current[1]
        lastPt.current = [x, y]
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
        if (propsRef.current.view === "globe") {
          const R = globeRadius(), k = BS_RAD / R
          rot.current[0] = bsWrapLng(rot.current[0] - dx * k)
          rot.current[1] = bsClampLat(rot.current[1] + dy * k)
          rotTarget.current = rot.current.slice()
          vel.current = [-dx * k, dy * k]; velMode.current = "rot"; startLoop()
        }
        return
      }
      const hit = hitTest(x, y)
      if (hit !== propsRef.current.hoveredId) setHovered(hit)
      canvas.style.cursor = hit ? "pointer" : "grab"
    }
    const onUp = (e: PointerEvent) => { if (!dragging.current) return; dragging.current = false; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); startLoop() }
    const onClick = () => { if (hasDragged.current) return; const hit = hitTest(lastPt.current[0], lastPt.current[1]); if (hit) toggleExpanded(hit) }
    const onLeave = () => { if (propsRef.current.hoveredId) setHovered(null) }
    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerup", onUp)
    canvas.addEventListener("pointercancel", onUp)
    canvas.addEventListener("pointerleave", onLeave)
    canvas.addEventListener("click", onClick)
    return () => {
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("click", onClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { draw() }, [hoveredId, expandedId])
  useEffect(() => {
    startLoop()
    return () => { if (rafId.current != null) cancelAnimationFrame(rafId.current); rafId.current = undefined }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  return (
    <React.Fragment>
      <canvas ref={canvasRef} width={Math.round(width * dpr)} height={Math.round(height * dpr)}
        style={{ display: "block", width: width, height: height, touchAction: "pan-y", cursor: "grab" }} />
      {!ready && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", color: "var(--text-muted)", fontSize: 13 }} className="font-ui">
          Rendering map…
        </div>
      )}
    </React.Fragment>
  )
}

// ── StoreMap wrapper (globe/flat toggle + problems funnel) ──────────────────
const BS_OVERVIEW_MAP_H = 560
const BS_FEATHER: React.CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 6%, #000 94%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 6%, #000 94%, transparent 100%)",
  maskComposite: "intersect", WebkitMaskComposite: "source-in",
}
function BSSegmentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center" style={{ gap: 2, padding: 3, borderRadius: 999, background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))", WebkitBackdropFilter: "blur(var(--glass-blur))", border: "0.5px solid var(--border)", boxShadow: "var(--shadow-soft)" }}>
      {children}
    </div>
  )
}
function BSToggleBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active}
      className="flex items-center justify-center"
      style={{ width: 30, height: 26, borderRadius: 999, border: "none", cursor: "pointer", background: active ? "var(--bg-elevated)" : "transparent", color: active ? "var(--text-primary)" : "var(--text-muted)", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.10)" : "none", transition: "color 140ms ease, background 140ms ease" }}>
      {children}
    </button>
  )
}
interface BSStoreMapProps {
  stores: OverviewStore[]
  marketCountries: string[]
  problemCount: number
  view: BSView
  setView: (v: BSView) => void
  problemsOnly: boolean
  setProblemsOnly: (v: boolean) => void
  hoveredId: string | null
  expandedId: string | null
  setHovered: (id: string | null) => void
  toggleExpanded: (id: string) => void
  theme: BSTheme
}
export function BSStoreMap({ stores, marketCountries, problemCount, view, setView, problemsOnly, setProblemsOnly, hoveredId, expandedId, setHovered, toggleExpanded, theme }: BSStoreMapProps) {
  const COVER_COLOR = BS.COVER_COLOR
  const { ref, width } = useBsWidth(620)
  const focus = useMemo(() => {
    if (marketCountries.length !== 1) return null
    return BS.COUNTRY_FOCUS[marketCountries[0]] || null
  }, [marketCountries])
  const feathered = view === "globe" || !focus
  const funnelLabel = problemsOnly ? "Showing stores that need attention" : "Show only stores that need attention (" + problemCount + ")"
  return (
    <div ref={ref} className="relative" style={{ height: BS_OVERVIEW_MAP_H, width: "100%", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, ...(feathered ? BS_FEATHER : null) }}>
        <BSDottedMap stores={stores} marketCountries={marketCountries} width={width} height={BS_OVERVIEW_MAP_H} view={view} focus={focus}
          hoveredId={hoveredId} expandedId={expandedId} setHovered={setHovered} toggleExpanded={toggleExpanded} theme={theme} />
      </div>
      <div className="absolute flex items-center" style={{ top: 12, right: 12, gap: 8 }}>
        <div className="relative">
          <BSSegmentShell>
            <button type="button" onClick={() => setProblemsOnly(!problemsOnly)} title={funnelLabel} aria-label={funnelLabel} aria-pressed={problemsOnly}
              className="flex items-center justify-center"
              style={{ width: 30, height: 26, borderRadius: 999, border: "none", cursor: "pointer", background: problemsOnly ? "var(--bg-elevated)" : "transparent", color: problemsOnly ? "var(--text-primary)" : "var(--text-muted)", boxShadow: problemsOnly ? "0 1px 2px rgba(0,0,0,0.10)" : "none" }}>
              <Icon name="filter" size={14} style={{ fill: problemsOnly ? "currentColor" : "none" }} />
            </button>
          </BSSegmentShell>
          {problemCount > 0 && (
            <span aria-hidden className="font-mono flex items-center justify-center"
              style={{ position: "absolute", top: -5, right: -5, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: COVER_COLOR.under.dot, color: "#FFFFFF", fontSize: "9.5px", fontWeight: 700, lineHeight: 1, border: "1.5px solid var(--bg-deep)", pointerEvents: "none" }}>
              {problemCount}
            </span>
          )}
        </div>
        <BSSegmentShell>
          <BSToggleBtn active={view === "globe"} onClick={() => setView("globe")} label="Globe"><Icon name="globe-2" size={14} /></BSToggleBtn>
          <BSToggleBtn active={view === "flat"} onClick={() => setView("flat")} label="Flat map"><Icon name="map" size={14} /></BSToggleBtn>
        </BSSegmentShell>
      </div>
    </div>
  )
}

// ── MiniTrend ─────────────────────────────────────────────────────────────────
export function BSMiniTrend({ label, data, hue, format, height }: { label: string; data: number[]; hue: string; format?: (v: number) => string; height?: number }) {
  if (!format) format = (v: number) => "" + v
  if (!height) height = 96
  const { ref, width } = useBsWidth(220)
  const gid = useId().replace(/:/g, "")
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const pad = { top: 12, right: 8, bottom: 8, left: 8 }
  const calc = useMemo(() => {
    const w = Math.max(0, width - pad.left - pad.right)
    const h = Math.max(0, (height as number) - pad.top - pad.bottom)
    const n = data.length
    if (n < 2 || w <= 0) return { line: "", area: "", pts: [] as number[][], baseY: pad.top + h }
    const min = Math.min(...data), max = Math.max(...data), span = max - min || 1
    const x = (i: number) => pad.left + (i / (n - 1)) * w
    const y = (v: number) => pad.top + (1 - (v - min) / span) * h
    const p = data.map((v, i) => [x(i), y(v)])
    const linePath = p.map(([px, py], i) => (i === 0 ? "M" : "L") + px.toFixed(1) + "," + py.toFixed(1)).join(" ")
    const areaPath = linePath + " L" + p[n - 1][0].toFixed(1) + "," + (pad.top + h).toFixed(1) + " L" + p[0][0].toFixed(1) + "," + (pad.top + h).toFixed(1) + " Z"
    return { line: linePath, area: areaPath, pts: p, baseY: pad.top + h }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, width, height])
  const n = data.length
  const shownIdx = hoverIdx == null ? n - 1 : hoverIdx
  const shownVal = data[shownIdx] || 0
  const hovered = hoverIdx != null && calc.pts[hoverIdx]
  function onMove(e: React.MouseEvent) {
    if (calc.pts.length < 2) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const w = Math.max(1, width - pad.left - pad.right)
    const i = Math.round(((px - pad.left) / w) * (n - 1))
    setHoverIdx(Math.max(0, Math.min(n - 1, i)))
  }
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between" style={{ marginBottom: 5 }}>
        <span className="font-ui truncate" style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.02em", color: "var(--text-muted)", textTransform: "uppercase" }}>{label}</span>
        <span className="font-mono" aria-hidden={!hovered} style={{ fontSize: "12.5px", fontWeight: 600, color: hue, opacity: hovered ? 1 : 0, transition: "opacity 120ms ease" }}>{format(shownVal)}</span>
      </div>
      <div ref={ref} className="w-full">
        <svg width={width} height={height} style={{ display: "block", overflow: "visible", cursor: "crosshair" }} onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
          <defs>
            <linearGradient id={"fill-" + gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hue} stopOpacity={0.2} />
              <stop offset="100%" stopColor={hue} stopOpacity={0} />
            </linearGradient>
          </defs>
          {calc.area && <path d={calc.area} fill={"url(#fill-" + gid + ")"} />}
          {calc.line && <path d={calc.line} fill="none" stroke={hue} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />}
          {hovered && (
            <React.Fragment>
              <line x1={calc.pts[hoverIdx as number][0]} x2={calc.pts[hoverIdx as number][0]} y1={pad.top - 2} y2={calc.baseY} stroke={hue} strokeWidth={1} opacity={0.28} />
              <circle cx={calc.pts[hoverIdx as number][0]} cy={calc.pts[hoverIdx as number][1]} r={3} fill="var(--bg-elevated)" stroke={hue} strokeWidth={2} />
            </React.Fragment>
          )}
          {!hovered && calc.pts.length > 0 && <circle cx={calc.pts[n - 1][0]} cy={calc.pts[n - 1][1]} r={2.5} fill={hue} />}
        </svg>
      </div>
    </div>
  )
}
