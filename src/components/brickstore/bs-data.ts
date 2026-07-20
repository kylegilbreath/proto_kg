// BrickSport Command — data layer (ported verbatim from bs-data.js; the kit's
// IIFE that assigned window.BS is now a set of module exports with types).
// Deterministic mock; every selector slices by { teams, products, countries }.

export type Cohort = "surging" | "dead" | "flat"
export type Trend = "spiky" | "rising" | "cooling" | "flat"
export type Band = "under" | "balanced" | "over"
export type TrendDir = "up" | "down" | "flat"

export interface BSFilter {
  teams: string[]
  products: string[]
  countries: string[]
}

// ── Lines ──────────────────────────────────────────────────────────────────
const LINE_WEIGHT: Record<string, number> = { jersey: 0.78, cap: 0.22 }
const ALL_LINES: string[] = ["jersey", "cap"]

const FUT = 14
const NEXT_MATCH_DAYS = 3
const STORY_TEAM_CODES = ["USA", "MAR", "KOR", "FRA", "ESP"]

// ── Teams ────────────────────────────────────────────────────────────────────
interface TeamDef {
  code: string
  name: string
  flag: string
  cohort: Cohort
  mag: number
  homeSoil?: boolean
  deadStockUsd?: number
}
const TEAM_DEFS: TeamDef[] = [
  { code: "USA", name: "United States", flag: "🇺🇸", cohort: "surging", mag: 4200, homeSoil: true },
  { code: "MAR", name: "Morocco", flag: "🇲🇦", cohort: "surging", mag: 2600 },
  { code: "KOR", name: "South Korea", flag: "🇰🇷", cohort: "surging", mag: 1500 },
  { code: "FRA", name: "France", flag: "🇫🇷", cohort: "dead", mag: 3200, deadStockUsd: 150000 },
  { code: "ESP", name: "Spain", flag: "🇪🇸", cohort: "dead", mag: 2700, deadStockUsd: 110000 },
  { code: "BRA", name: "Brazil", flag: "🇧🇷", cohort: "flat", mag: 520 },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", cohort: "flat", mag: 480 },
  { code: "GER", name: "Germany", flag: "🇩🇪", cohort: "flat", mag: 460 },
  { code: "ENG", name: "England", flag: "🇬🇧", cohort: "flat", mag: 440 },
  { code: "POR", name: "Portugal", flag: "🇵🇹", cohort: "flat", mag: 420 },
  { code: "NED", name: "Netherlands", flag: "🇳🇱", cohort: "flat", mag: 400 },
  { code: "BEL", name: "Belgium", flag: "🇧🇪", cohort: "flat", mag: 380 },
  { code: "ITA", name: "Italy", flag: "🇮🇹", cohort: "flat", mag: 360 },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", cohort: "flat", mag: 340 },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", cohort: "flat", mag: 320 },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", cohort: "flat", mag: 360 },
  { code: "JPN", name: "Japan", flag: "🇯🇵", cohort: "flat", mag: 340 },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", cohort: "flat", mag: 300 },
  { code: "SUI", name: "Switzerland", flag: "🇨🇭", cohort: "flat", mag: 280 },
  { code: "DEN", name: "Denmark", flag: "🇩🇰", cohort: "flat", mag: 260 },
  { code: "POL", name: "Poland", flag: "🇵🇱", cohort: "flat", mag: 280 },
  { code: "CAN", name: "Canada", flag: "🇨🇦", cohort: "flat", mag: 300 },
  { code: "AUS", name: "Australia", flag: "🇦🇺", cohort: "flat", mag: 240 },
  { code: "GHA", name: "Ghana", flag: "🇬🇭", cohort: "flat", mag: 220 },
  { code: "CMR", name: "Cameroon", flag: "🇨🇲", cohort: "flat", mag: 220 },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨", cohort: "flat", mag: 200 },
  { code: "SRB", name: "Serbia", flag: "🇷🇸", cohort: "flat", mag: 220 },
  { code: "QAT", name: "Qatar", flag: "🇶🇦", cohort: "flat", mag: 200 },
  { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", cohort: "flat", mag: 240 },
  { code: "TUN", name: "Tunisia", flag: "🇹🇳", cohort: "flat", mag: 200 },
  { code: "CRC", name: "Costa Rica", flag: "🇨🇷", cohort: "flat", mag: 180 },
  { code: "IRN", name: "Iran", flag: "🇮🇷", cohort: "flat", mag: 220 },
]

export interface Team {
  id: string
  code: string
  name: string
  flag: string
  cohort: Cohort
  homeSoil?: boolean
}
const TEAMS: Team[] = TEAM_DEFS.map((d) => ({
  id: "T-" + d.code, code: d.code, name: d.name, flag: d.flag, cohort: d.cohort, homeSoil: d.homeSoil,
}))
const ALL_TEAM_IDS = TEAMS.map((t) => t.id)
const TEAM_BY_ID = new Map<string, Team>(TEAMS.map((t) => [t.id, t]))
const STORY_TEAM_IDS = STORY_TEAM_CODES.map((c) => "T-" + c)

const inSel = (id: string, sel: string[]) => sel.length === 0 || sel.includes(id)

// ── Store registry ───────────────────────────────────────────────────────────
const SURGING_CODES = ["USA", "MAR", "KOR"]
const DEAD_CODES = ["FRA", "ESP"]

const COVER_UNDER = 80
const COVER_OVER = 125
function bandFromCover(pct: number): Band {
  if (pct < COVER_UNDER) return "under"
  if (pct > COVER_OVER) return "over"
  return "balanced"
}
const capFromJersey = (jc: number) => 1 + (jc - 1) * 0.55

const STORY_MIX_BY_COUNTRY: Record<string, Record<string, number>> = {
  US: { USA: 0.5, MAR: 0.1, KOR: 0.06, FRA: 0.05, ESP: 0.04 },
  MA: { USA: 0.04, MAR: 0.7, KOR: 0.03, FRA: 0.02, ESP: 0.01 },
  FR: { USA: 0.05, MAR: 0.03, KOR: 0.02, FRA: 0.62, ESP: 0.08 },
  ES: { USA: 0.05, MAR: 0.02, KOR: 0.02, FRA: 0.08, ESP: 0.61 },
  KR: { USA: 0.05, MAR: 0.03, KOR: 0.62, FRA: 0.04, ESP: 0.04 },
}
const DEFAULT_STORY_MIX: Record<string, number> = { USA: 0.16, MAR: 0.1, KOR: 0.1, FRA: 0.14, ESP: 0.12 }
function storyMix(country: string): Record<string, number> { return STORY_MIX_BY_COUNTRY[country] || DEFAULT_STORY_MIX }

interface StoreSeed {
  id: string
  metro: string
  country: string
  lat: number
  lng: number
  size: number
  surge?: number
  dead?: number
  trend: Trend
}
const US_STORE_SEEDS: StoreSeed[] = [
  { id: "NYC-S01", metro: "New York", country: "US", lat: 40.71, lng: -74.01, size: 475, surge: 0.42, trend: "spiky" },
  { id: "NYC-S02", metro: "New York", country: "US", lat: 40.74, lng: -73.98, size: 375, surge: 0.52, trend: "rising" },
  { id: "NYC-S03", metro: "New York", country: "US", lat: 40.68, lng: -74.04, size: 275, trend: "flat" },
  { id: "LA-S01", metro: "Los Angeles", country: "US", lat: 34.05, lng: -118.24, size: 425, surge: 0.92, trend: "flat" },
  { id: "LA-S02", metro: "Los Angeles", country: "US", lat: 34.08, lng: -118.2, size: 300, dead: 1.45, trend: "flat" },
  { id: "LA-S03", metro: "Los Angeles", country: "US", lat: 34.02, lng: -118.28, size: 225, trend: "flat" },
  { id: "CHI-S01", metro: "Chicago", country: "US", lat: 41.88, lng: -87.63, size: 250, dead: 1.5, trend: "flat" },
  { id: "CHI-S02", metro: "Chicago", country: "US", lat: 41.91, lng: -87.6, size: 200, surge: 1.06, trend: "flat" },
  { id: "MIA-S01", metro: "Miami", country: "US", lat: 25.76, lng: -80.19, size: 325, surge: 0.44, trend: "rising" },
  { id: "MIA-POP-S02", metro: "Miami", country: "US", lat: 25.79, lng: -80.15, size: 85, trend: "flat" },
  { id: "HOU-S01", metro: "Houston", country: "US", lat: 29.76, lng: -95.37, size: 300, surge: 0.48, trend: "spiky" },
  { id: "HOU-POP-S02", metro: "Houston", country: "US", lat: 29.79, lng: -95.33, size: 75, trend: "flat" },
  { id: "DAL-S01", metro: "Dallas", country: "US", lat: 32.78, lng: -96.8, size: 225, trend: "flat" },
  { id: "DAL-S02", metro: "Dallas", country: "US", lat: 32.81, lng: -96.76, size: 175, surge: 1.05, trend: "flat" },
  { id: "BOS-S01", metro: "Boston", country: "US", lat: 42.36, lng: -71.06, size: 290, surge: 0.55, trend: "rising" },
  { id: "BOS-POP-S02", metro: "Boston", country: "US", lat: 42.39, lng: -71.02, size: 75, trend: "flat" },
  { id: "SF-S01", metro: "San Francisco", country: "US", lat: 37.77, lng: -122.42, size: 260, surge: 0.95, trend: "flat" },
  { id: "SF-S02", metro: "San Francisco", country: "US", lat: 37.74, lng: -122.38, size: 200, trend: "flat" },
  { id: "ATL-S01", metro: "Atlanta", country: "US", lat: 33.75, lng: -84.39, size: 250, surge: 0.58, trend: "rising" },
  { id: "ATL-POP-S02", metro: "Atlanta", country: "US", lat: 33.78, lng: -84.35, size: 70, trend: "flat" },
  { id: "PHX-S01", metro: "Phoenix", country: "US", lat: 33.45, lng: -112.07, size: 175, trend: "flat" },
  { id: "SEA-S01", metro: "Seattle", country: "US", lat: 47.61, lng: -122.33, size: 150, surge: 1.12, trend: "cooling" },
  { id: "DEN-S01", metro: "Denver", country: "US", lat: 39.74, lng: -104.99, size: 165, surge: 1.05, trend: "flat" },
  { id: "MSP-S01", metro: "Minneapolis", country: "US", lat: 44.98, lng: -93.27, size: 130, surge: 1.1, trend: "flat" },
  { id: "DC-S01", metro: "Washington", country: "US", lat: 38.9, lng: -77.04, size: 270, surge: 0.5, trend: "rising" },
]
const GLOBAL_STORE_SEEDS: StoreSeed[] = [
  { id: "LON-S01", metro: "London", country: "GB", lat: 51.51, lng: -0.13, size: 175, trend: "flat" },
  { id: "MAN-S01", metro: "Manchester", country: "GB", lat: 53.48, lng: -2.24, size: 120, trend: "flat" },
  { id: "PAR-S01", metro: "Paris", country: "FR", lat: 48.86, lng: 2.35, size: 200, dead: 1.55, trend: "cooling" },
  { id: "LYO-S01", metro: "Lyon", country: "FR", lat: 45.76, lng: 4.84, size: 155, dead: 1.6, trend: "cooling" },
  { id: "BER-S01", metro: "Berlin", country: "DE", lat: 52.52, lng: 13.41, size: 140, trend: "flat" },
  { id: "MUN-S01", metro: "Munich", country: "DE", lat: 48.14, lng: 11.58, size: 120, trend: "flat" },
  { id: "SAO-S01", metro: "São Paulo", country: "BR", lat: -23.55, lng: -46.63, size: 155, trend: "flat" },
  { id: "RIO-S01", metro: "Rio", country: "BR", lat: -22.91, lng: -43.17, size: 130, trend: "flat" },
  { id: "MEX-S01", metro: "Mexico City", country: "MX", lat: 19.43, lng: -99.13, size: 160, trend: "flat" },
  { id: "MTY-S01", metro: "Monterrey", country: "MX", lat: 25.67, lng: -100.31, size: 120, trend: "flat" },
  { id: "SEL-S01", metro: "Seoul", country: "KR", lat: 37.57, lng: 126.98, size: 180, surge: 0.95, trend: "rising" },
  { id: "BUS-S01", metro: "Busan", country: "KR", lat: 35.18, lng: 129.08, size: 130, trend: "flat" },
  { id: "TOR-S01", metro: "Toronto", country: "CA", lat: 43.65, lng: -79.38, size: 140, trend: "flat" },
  { id: "MAD-S01", metro: "Madrid", country: "ES", lat: 40.42, lng: -3.7, size: 190, dead: 1.52, trend: "cooling" },
  { id: "AMS-S01", metro: "Amsterdam", country: "NL", lat: 52.37, lng: 4.9, size: 115, trend: "flat" },
  { id: "LIS-S01", metro: "Lisbon", country: "PT", lat: 38.72, lng: -9.14, size: 110, trend: "flat" },
  { id: "MIL-S01", metro: "Milan", country: "IT", lat: 45.46, lng: 9.19, size: 130, trend: "flat" },
  { id: "CAS-S01", metro: "Casablanca", country: "MA", lat: 33.57, lng: -7.59, size: 225, surge: 0.5, trend: "rising" },
  { id: "DXB-S01", metro: "Dubai", country: "AE", lat: 25.2, lng: 55.27, size: 130, trend: "flat" },
  { id: "RUH-S01", metro: "Riyadh", country: "SA", lat: 24.71, lng: 46.67, size: 115, trend: "flat" },
  { id: "TYO-S01", metro: "Tokyo", country: "JP", lat: 35.68, lng: 139.69, size: 150, trend: "flat" },
  { id: "SYD-S01", metro: "Sydney", country: "AU", lat: -33.87, lng: 151.21, size: 105, trend: "flat" },
  { id: "BOM-S01", metro: "Mumbai", country: "IN", lat: 19.08, lng: 72.88, size: 140, trend: "flat" },
  { id: "BUE-S01", metro: "Buenos Aires", country: "AR", lat: -34.6, lng: -58.38, size: 130, trend: "flat" },
  { id: "BOG-S01", metro: "Bogotá", country: "CO", lat: 4.71, lng: -74.07, size: 115, trend: "flat" },
]

export interface Store extends StoreSeed {
  surge: number
  dead: number
  mix: Record<string, number>
  restWeight: number
}
function buildStore(s: StoreSeed): Store {
  const mix = storyMix(s.country)
  const storySum = STORY_TEAM_CODES.reduce((a, c) => a + mix[c], 0)
  return Object.assign({}, s, {
    surge: s.surge == null ? 1 : s.surge,
    dead: s.dead == null ? 1 : s.dead,
    mix,
    restWeight: Math.max(0, 1 - storySum),
  })
}
const STORES: Store[] = US_STORE_SEEDS.concat(GLOBAL_STORE_SEEDS).map(buildStore)

function jerseyCoverForCode(store: Store, code: string): number {
  if (SURGING_CODES.indexOf(code) >= 0) return store.surge
  if (DEAD_CODES.indexOf(code) >= 0) return store.dead
  return 1
}

function coverNudge(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) }
  const u = (h >>> 0) / 4294967296
  const mag = 0.7 + u * 3.0
  return h & 1 ? mag : -mag
}

interface StoreMetrics { coverPct: number; band: Band; volume: number }
function storeMetrics(store: Store, teams: string[], products: string[]): StoreMetrics {
  const lines = products.length ? products : ALL_LINES
  const lineWsum = lines.reduce((a, l) => a + (LINE_WEIGHT[l] || 0), 0) || 1
  const storyCodes: string[] = []
  let includeRest = false
  if (teams.length === 0) {
    STORY_TEAM_CODES.forEach((c) => storyCodes.push(c))
    includeRest = true
  } else {
    for (const id of teams) {
      const t = TEAM_BY_ID.get(id)
      if (!t) continue
      if (STORY_TEAM_CODES.indexOf(t.code) >= 0) storyCodes.push(t.code)
      else includeRest = true
    }
  }
  const contribs: { w: number; jersey: number }[] = []
  for (const code of storyCodes) contribs.push({ w: store.mix[code], jersey: jerseyCoverForCode(store, code) })
  if (includeRest) contribs.push({ w: store.restWeight, jersey: 1 })
  let num = 0, den = 0, wsum = 0
  for (const c of contribs) {
    if (c.w <= 0) continue
    wsum += c.w
    for (const l of lines) {
      const cover = l === "jersey" ? c.jersey : capFromJersey(c.jersey)
      const dem = c.w * (LINE_WEIGHT[l] || 0)
      num += dem * cover; den += dem
    }
  }
  let coverPct = den > 0 ? (num / den) * 100 : 100
  if (Math.round(coverPct) === 100) coverPct = 100 + coverNudge(store.id)
  const volume = Math.round(store.size * Math.min(1, wsum) * lineWsum)
  return { coverPct, band: bandFromCover(coverPct), volume }
}

// ── Outlook model ──────────────────────────────────────────────────────────
const MATCH_DAYS = [4, 11]
const MATCH_LABELS = ["Match day", "Match day"]
const CAP_DAMP = 0.55
const lineDamp = (l: string) => (l === "jersey" ? 1 : CAP_DAMP)

interface OutlookTarget { mult: number; lo: number; hi: number }
const STORY_OUTLOOK: Record<string, OutlookTarget> = {
  USA: { mult: 2.9, lo: 2.6, hi: 3.2 },
  MAR: { mult: 2.4, lo: 2.1, hi: 2.7 },
  KOR: { mult: 1.6, lo: 1.4, hi: 1.9 },
  FRA: { mult: 0.4, lo: 0.3, hi: 0.5 },
  ESP: { mult: 0.3, lo: 0.2, hi: 0.4 },
}
function hash01(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967296
}
function outlookTarget(code: string): OutlookTarget {
  const t = STORY_OUTLOOK[code]
  if (t) return t
  const mult = 0.92 + hash01(code) * 0.16
  const spread = 0.06 + hash01(code + "~") * 0.05
  return { mult, lo: mult - spread, hi: mult + spread }
}
const SHAPE_RAW: Record<Cohort, number[]> = {
  surging: [1.0, 1.06, 1.16, 1.3, 1.22, 1.04, 0.92, 0.86, 0.88, 0.97, 1.12, 1.02, 0.88, 0.78, 0.72],
  dead: [0.95, 0.82, 0.7, 0.62, 0.55, 0.5, 0.46, 0.43, 0.41, 0.39, 0.38, 0.36, 0.35, 0.34, 0.33],
  flat: [1.0, 1.0, 1.02, 1.05, 1.03, 1.0, 0.99, 0.99, 1.0, 1.02, 1.04, 1.01, 0.99, 0.98, 0.98],
}
const WIDEN = [0.3, 0.38, 0.46, 0.54, 0.62, 0.92, 1.0, 1.08, 1.16, 1.25, 1.34, 1.45, 1.78, 1.92, 2.05]
const TAIL: Record<Cohort, number[]> = {
  surging: [0.98, 1.02, 2.45],
  dead: [1.03, 1.05, 0.85],
  flat: [0.99, 1.01, 1.0],
}
const winMean = (a: number[]) => a.slice(1).reduce((s, v) => s + v, 0) / (a.length - 1)
interface OutlookPath { path: number[]; lo: number[]; hi: number[]; tail: number[] }
function buildOutlook(cohort: Cohort, t: OutlookTarget): OutlookPath {
  const sm = winMean(SHAPE_RAW[cohort])
  const path = SHAPE_RAW[cohort].map((v) => (v / sm) * t.mult)
  const pm = winMean(WIDEN)
  const p = WIDEN.map((v) => v / pm)
  return {
    path,
    lo: path.map((v, d) => Math.max(0.02, v + (t.lo - t.mult) * p[d])),
    hi: path.map((v, d) => v + (t.hi - t.mult) * p[d]),
    tail: TAIL[cohort],
  }
}
const OUTLOOK = new Map<string, OutlookPath>(TEAMS.map((t) => [t.id, buildOutlook(t.cohort, outlookTarget(t.code))]))
const RESP: Record<string, number> = { spiky: 1.3, rising: 1.15, cooling: 1.15, flat: 0.95 }
const storeSwing = (s: Store) => RESP[s.trend] * (0.92 + hash01(s.id) * 0.16)
const MAG_BY_CODE = new Map<string, number>(TEAM_DEFS.map((d) => [d.code, d.mag]))
const FLAT_MAG_SUM = TEAM_DEFS.filter((d) => d.cohort === "flat").reduce((s, d) => s + d.mag, 0)
const REST_TARGET: OutlookTarget = { mult: 1, lo: 0.96, hi: 1.04 }
const REST_PATH = buildOutlook("flat", REST_TARGET)

interface ScopeCell { share: number; target: OutlookTarget; path: OutlookPath | undefined }
function scopeCells(store: Store, teams: string[]): ScopeCell[] {
  const cells: ScopeCell[] = []
  const all = teams.length === 0 || teams.length >= TEAMS.length
  if (all) {
    for (const code of STORY_TEAM_CODES) cells.push({ share: store.mix[code], target: outlookTarget(code), path: OUTLOOK.get("T-" + code) })
    if (store.restWeight > 0) cells.push({ share: store.restWeight, target: REST_TARGET, path: REST_PATH })
    return cells
  }
  for (const id of teams) {
    const t = TEAM_BY_ID.get(id)
    if (!t) continue
    if (STORY_TEAM_CODES.indexOf(t.code) >= 0) cells.push({ share: store.mix[t.code], target: outlookTarget(t.code), path: OUTLOOK.get(id) })
    else {
      const share = store.restWeight * ((MAG_BY_CODE.get(t.code) || 0) / FLAT_MAG_SUM)
      cells.push({ share, target: outlookTarget(t.code), path: OUTLOOK.get(id) })
    }
  }
  return cells
}
function dampFor(products: string[]): number {
  const lines = products.length ? products : ALL_LINES
  let w = 0, dw = 0
  for (const l of lines) { const lw = LINE_WEIGHT[l] || 0; w += lw; dw += lw * lineDamp(l) }
  return w > 0 ? dw / w : 1
}

export interface DemandRow {
  id: string; code: string; flag: string; name: string; cohort: Cohort
  mult: number; lo: number; hi: number
}
function selectDemandChange(f: BSFilter): { rows: DemandRow[] } {
  const teams = f.teams || []
  const products = f.products || []
  const damp = dampFor(products)
  const allSelected = teams.length === 0 || teams.length >= TEAMS.length
  const toRow = (t: Team): DemandRow => {
    const g = outlookTarget(t.code)
    return {
      id: t.id, code: t.code, flag: t.flag, name: t.name, cohort: t.cohort,
      mult: 1 + (g.mult - 1) * damp, lo: 1 + (g.lo - 1) * damp, hi: 1 + (g.hi - 1) * damp,
    }
  }
  const rows = (allSelected ? TEAMS.map(toRow)
    : teams.map((id) => TEAM_BY_ID.get(id)).filter((t): t is Team => Boolean(t)).map(toRow)
  ).sort((a, b) => {
    const da = Math.abs(a.mult - 1), db = Math.abs(b.mult - 1)
    return db !== da ? db - da : b.mult - a.mult
  })
  return { rows }
}

export interface IndexEnvelope { id: string; metro: string; path: number[] }
export interface IndexCurve {
  days: number[]; tailDays: number[]; tail: number[]; avg: number[]; lo: number[]; hi: number[]
  envMax: IndexEnvelope | null; envMin: IndexEnvelope | null; peakDay: number; peakIdx: number
}
function selectIndexCurve(f: BSFilter): IndexCurve {
  const teams = f.teams || []
  const products = f.products || []
  const countries = f.countries || []
  const lines = products.length ? products : ALL_LINES
  const n = FUT + 1
  const avgN = new Array(n).fill(0), loN = new Array(n).fill(0), hiN = new Array(n).fill(0)
  const tailN = new Array(3).fill(0)
  let den = 0
  const perStore: { store: Store; path: number[]; dev: number }[] = []
  for (const store of STORES) {
    if (countries.length && countries.indexOf(store.country) < 0) continue
    const swing = storeSwing(store)
    const sN = new Array(n).fill(0)
    let sDen = 0
    for (const c of scopeCells(store, teams)) {
      if (!c.path) continue
      for (const l of lines) {
        const w = store.size * c.share * (LINE_WEIGHT[l] || 0)
        if (w <= 0) continue
        const k = lineDamp(l) * swing
        for (let d = 0; d < n; d++) {
          const m = 1 + (c.path.path[d] - 1) * k
          avgN[d] += w * m
          loN[d] += w * (1 + (c.path.lo[d] - 1) * k)
          hiN[d] += w * (1 + (c.path.hi[d] - 1) * k)
          sN[d] += w * m
        }
        for (let t = 0; t < 3; t++) tailN[t] += w * (1 + (c.path.tail[t] - 1) * k)
        den += w; sDen += w
      }
    }
    if (sDen > 0) {
      const path = sN.map((v) => (v / sDen) * 100)
      const dev = winMean(path.map((v) => v - 100))
      perStore.push({ store, path, dev })
    }
  }
  const idx = (a: number[]) => a.map((v) => (den > 0 ? (v / den) * 100 : 100))
  const avg = idx(avgN), lo = idx(loN), hi = idx(hiN)
  const tail = tailN.map((v) => (den > 0 ? (v / den) * 100 : 100)).concat([avg[0]])
  perStore.sort((a, b) => b.dev - a.dev)
  const top = perStore[0], bot = perStore[perStore.length - 1]
  const env = (s: { store: Store; path: number[] } | undefined): IndexEnvelope | null => (s ? { id: s.store.id, metro: s.store.metro, path: s.path } : null)
  let peakDay = 1
  for (let d = 2; d < n; d++) if (avg[d] > avg[peakDay]) peakDay = d
  return {
    days: Array.from({ length: n }, (_, d) => d),
    tailDays: [-3, -2, -1, 0], tail, avg, lo, hi,
    envMax: env(top), envMin: perStore.length > 1 ? env(bot) : null,
    peakDay, peakIdx: avg[peakDay],
  }
}

// ── Recommendations ──────────────────────────────────────────────────────────
export interface Rec {
  id: string; lever: string; driver: string; storeId?: string; scopeLabel: string; country: string
  teamCode: string; flag: string; line: string; sku: string; action: string; units: number; impactUsd: number
  etaDays: number; etaLabel: string; expiresLabel: string; coverNowPct?: number; coverAfterPct?: number
  reason: string; constraint?: string; impactLabel?: string; statusLabel?: string; statusTone?: string
}
const RECS: Rec[] = [
  { id: "M-01", lever: "redirect", driver: "event", storeId: "NYC-S01", scopeLabel: "NYC-S01 · New York", country: "US", teamCode: "USA", flag: "🇺🇸", line: "jersey", sku: "USA home jersey", action: "WH-07 New York → NYC-S01", units: 650, impactUsd: 58000, etaDays: 0.5, etaLabel: "12h", expiresLabel: "2d", coverNowPct: 42, coverAfterPct: 67,
    reason: "USA home jersey demand re-forecast at 2.9× baseline after Tuesday’s result; at the current run rate NYC-S01 sells out in two days. WH-07 holds 1,200 uncommitted units for the metro. 650 land here, the largest expected lost-sales reduction per unit in the network. The rest of the pool holds the floor for NYC-S02 and BOS-S01.\n\nThis fill reaches 67% cover, not the 80% band. It converts a certain day-2 stockout into a thin floor through match day; the balance arrives with the WH-09 rebalance (M-05) on day 2. 100 USA caps ride the same trailer.",
    constraint: "WH-07 pool: 1,200 u, shared across 3 stores · runway 1.1d", impactLabel: "$58K revenue protected through the window · est." },
  { id: "M-02", lever: "redirect", driver: "event", storeId: "MIA-S01", scopeLabel: "MIA-S01 · Miami", country: "US", teamCode: "USA", flag: "🇺🇸", line: "jersey", sku: "USA home jersey", action: "WH-06 Atlanta → MIA-S01", units: 450, impactUsd: 40000, etaDays: 0.8, etaLabel: "19h", expiresLabel: "36h", coverNowPct: 44, coverAfterPct: 69,
    reason: "Deepest USA shortfall in the Southeast; sell-out projected day 2. WH-06 Atlanta holds 450 uncommitted units, enough to hold one store’s floor, not two. Expected lost sales per unit run 1.4× higher here than at ATL-S01 on velocity and price mix, so the full allocation lands in Miami.\n\nATL-S01 stays short this cycle and is queued for the next DC wave (T+2d).",
    constraint: "WH-06 pool: 450 u · one-store fill; MIA outranks ATL on $ per unit", impactLabel: "$40K revenue protected through the window · est." },
  { id: "M-03", lever: "redirect", driver: "event", storeId: "HOU-S01", scopeLabel: "HOU-S01 · Houston", country: "US", teamCode: "MAR", flag: "🇲🇦", line: "jersey", sku: "Morocco home jersey", action: "WH-08 Dallas → HOU-S01", units: 120, impactUsd: 11000, etaDays: 0.9, etaLabel: "22h", expiresLabel: "1d", coverNowPct: 48, coverAfterPct: 85,
    reason: "Morocco collection re-forecast at 2.4× baseline; this cell sits at 48% cover. WH-08 Dallas can release 120 units on the overnight lane without breaching its own two-day floor. That takes the cell to 85%, inside band.\n\nA larger fill would pull the Dallas runway below policy with three regional stores drawing on it.",
    constraint: "WH-08 floor policy: keep at least 2.0d runway · max release 120 u", impactLabel: "$11K revenue protected through the window · est." },
  { id: "M-04", lever: "rebalance", driver: "event", storeId: "BOS-S01", scopeLabel: "BOS-S01 · Boston", country: "US", teamCode: "USA", flag: "🇺🇸", line: "jersey", sku: "USA home jersey", action: "BOS-POP-S02 → BOS-S01", units: 60, impactUsd: 5000, etaDays: 0.17, etaLabel: "4h", expiresLabel: "18h", coverNowPct: 55, coverAfterPct: 59,
    reason: "The fastest units in the network. The Back Bay pop-up holds 75 USA home jerseys selling at 0.3× the velocity of BOS-S01; the metro lane moves 60 in about four hours, keeping doors stocked tonight. The pop-up keeps a 15-unit floor.\n\nBulk relief for Boston rides the day-2 DC wave; this move only buys the first 36 hours.",
    constraint: "Same-metro lane only · pop-up floor 15 u", impactLabel: "$5K revenue protected tonight · est." },
  { id: "M-05", lever: "rebalance", driver: "event", scopeLabel: "WH-07 · Northeast", country: "US", teamCode: "USA", flag: "🇺🇸", line: "jersey", sku: "USA home jersey", action: "WH-09 Seattle → WH-07 New York", units: 550, impactUsd: 49000, etaDays: 2.2, etaLabel: "2 days", expiresLabel: "9h",
    reason: "Second leg of the Northeast plan. WH-09 Seattle carries 5.6 days of runway against flat local demand; WH-07 is at 1.1 days serving the hottest metro. Moving 550 units lifts WH-07 to roughly two days and funds the post-match plateau behind M-01 and M-04.\n\nThe air slot closes at 18:00. Ground transit runs 4.5 days and misses the window.",
    constraint: "Air cutoff 18:00 · ground alternative 4.5d, outside window", impactLabel: "$49K plateau revenue protected · est." },
  { id: "M-11", lever: "redirect", driver: "event", scopeLabel: "E-com · US", country: "US", teamCode: "USA", flag: "🇺🇸", line: "jersey", sku: "USA home jersey", action: "WH-02 Los Angeles → e-com direct", units: 600, impactUsd: 53000, etaDays: 1, etaLabel: "1d", expiresLabel: "2d",
    reason: "Northeast doors will run thin even after the transfers land; e-commerce can capture what shelves cannot. WH-02 Los Angeles carries western surplus on a 2.4-day runway; routing 600 units to ship-direct holds the online promise at two days nationwide.\n\nThis demand books at full price and relieves store pressure without touching any metro floor.",
    constraint: "WH-02 surplus only · ship-direct promise ≤ 2 days", impactLabel: "$53K revenue captured online · est." },
  { id: "M-06", lever: "expedite", driver: "event", storeId: "DC-S01", scopeLabel: "DC-S01 · Washington", country: "US", teamCode: "USA", flag: "🇺🇸", line: "jersey", sku: "USA home jersey", action: "Production run → DC-S01", units: 375, impactUsd: 33000, etaDays: 6, etaLabel: "6 days", statusLabel: "Arrives after next match", statusTone: "warn", expiresLabel: "8h",
    reason: "Every in-window source is committed to higher-velocity stores; the remaining option is an expedited production run landing in 6 days, after the match window. It misses the peak: an estimated 220 lost sales ($20K) that no approval can recover.\n\nIt still covers the plateau through the final at standard margin, and declining leaves the store dark on this SKU for over a week. The production slot holds for 8 hours.",
    constraint: "No in-window source · production slot expires in 8h", impactLabel: "$33K plateau revenue protected, $20K peak loss unavoidable · est." },
  { id: "M-07", lever: "return", driver: "event", storeId: "CHI-S01", scopeLabel: "CHI-S01 · Chicago", country: "US", teamCode: "FRA", flag: "🇫🇷", line: "jersey", sku: "France home jersey", action: "CHI-S01 → WH-01 e-com", units: 55, impactUsd: 4000, etaDays: 0.4, etaLabel: "Tonight", expiresLabel: "12h", coverNowPct: 150, coverAfterPct: 110,
    reason: "France collection demand re-forecast at 0.4× after elimination; this cell sits at 150% cover. E-commerce clears eliminated collections at roughly 3× store velocity, so the excess works harder at the WH-01 e-com node than on this shelf.\n\n55 units ride tonight’s scheduled backhaul at zero marginal freight. The store keeps a 110% floor for residual demand; the freed backroom takes Thursday’s USA cap inbound.",
    constraint: "Backhaul departs 21:00 · zero marginal freight on the return leg", impactLabel: "$4K incremental recovery vs in-store markdown · est." },
  { id: "M-08", lever: "markdown", driver: "event", storeId: "LA-S02", scopeLabel: "LA-S02 · Los Angeles", country: "US", teamCode: "ESP", flag: "🇪🇸", line: "jersey", sku: "Spain home jersey", action: "Mark down 30% · LA-S02", units: 190, impactUsd: 6000, etaDays: 0.05, etaLabel: "Immediate", expiresLabel: "5d",
    reason: "Same overstock profile as CHI-S01, a different answer: LA-S02 is 1,900 miles from the e-com node and return freight erases the recovery, so the stock clears where it stands. A 30% markdown clears a projected 85% of the 190 on-hand within five days at current traffic.\n\nPast day 5, the elasticity model calls for 45% to move the same units. Earlier is cheaper.",
    constraint: "Return freight above e-com recovery at this distance", impactLabel: "$6K recovered vs the day-5 markdown path · est." },
  { id: "M-09", lever: "markdown", driver: "event", storeId: "PAR-S01", scopeLabel: "PAR-S01 · Paris", country: "FR", teamCode: "FRA", flag: "🇫🇷", line: "jersey", sku: "France home jersey", action: "Mark down 40% · PAR-S01", units: 750, impactUsd: 27000, etaDays: 0.05, etaLabel: "Immediate", expiresLabel: "4d",
    reason: "The largest dead-stock position in the network: 155% cover, about 750 excess units against the post-elimination forecast. In-market demand is still warm enough to clear at 40%; the elasticity model projects 80% sell-through in four days.\n\nThe e-com node is already saturated with returned France stock from the regional backhauls, so this floor clears in store.",
    constraint: "E-com clearance capacity saturated · in-store only", impactLabel: "$27K recovered vs end-of-season salvage · est." },
  { id: "M-10", lever: "replenish", driver: "routine", storeId: "DAL-S02", scopeLabel: "DAL-S02 · Dallas", country: "US", teamCode: "MEX", flag: "🇲🇽", line: "cap", sku: "Mexico cap", action: "WH-08 Dallas → DAL-S02", units: 95, impactUsd: 0, etaDays: 1, etaLabel: "1 day", expiresLabel: "7d",
    reason: "Standard weekly cycle, untouched by the reallocation. The Mexico collection is trending at 1.1× seasonal baseline in Texas; a 95-unit assortment fill holds the 98% service level.\n\nScheduled lanes keep running through the event; only the exception moves above are re-planned." },
]
function selectRecommendations(f: BSFilter): Rec[] {
  const teams = f.teams || [], products = f.products || [], countries = f.countries || []
  return RECS.filter((r) => {
    if (countries.length && countries.indexOf(r.country) < 0) return false
    if (teams.length && !inSel("T-" + r.teamCode, teams)) return false
    if (products.length && products.indexOf(r.line) < 0) return false
    return true
  })
}
function recsForStore(storeId: string, f: BSFilter): number {
  return selectRecommendations(f).filter((r) => r.storeId === storeId).length
}

const RUNWAY = [
  { wh_id: "WH-07", city: "New York", days: 1.1 }, { wh_id: "WH-03", city: "Houston", days: 1.4 },
  { wh_id: "WH-05", city: "Miami", days: 1.7 }, { wh_id: "WH-08", city: "Dallas", days: 2.0 },
  { wh_id: "WH-02", city: "Los Angeles", days: 2.4 }, { wh_id: "WH-06", city: "Atlanta", days: 2.9 },
  { wh_id: "WH-04", city: "Phoenix", days: 3.4 }, { wh_id: "WH-10", city: "Denver", days: 4.1 },
  { wh_id: "WH-01", city: "Chicago", days: 4.8 }, { wh_id: "WH-09", city: "Seattle", days: 5.6 },
]
const WAREHOUSE_IDS = RUNWAY.map((r) => r.wh_id)

// ── Exposure / financials ────────────────────────────────────────────────────
const UNIT_REV = 89
const LOST_EFF_DAYS = NEXT_MATCH_DAYS
const MARKDOWN_WRITEOFF = 0.5
const DEAD_POSITIONS = [
  { teamCode: "FRA", countries: ["US"], usd: 78000 },
  { teamCode: "ESP", countries: ["US"], usd: 56000 },
  { teamCode: "FRA", countries: ["FR", "ES", "GB", "DE", "NL", "IT", "PT"], usd: 84000 },
  { teamCode: "ESP", countries: ["ES", "FR", "GB", "DE", "NL", "IT", "PT"], usd: 61000 },
]
function lineFrac(products: string[]): number {
  const lines = products.length ? products : ALL_LINES
  return Math.min(1, lines.reduce((a, l) => a + (LINE_WEIGHT[l] || 0), 0))
}
export interface ExposureMeta {
  lostSalesUsd: number; markdownUsd: number; grossUsd: number; recoveredUsd: number; residualUsd: number
}
function selectExposure(f: BSFilter): ExposureMeta {
  const teams = f.teams || [], products = f.products || [], countries = f.countries || []
  const lines = products.length ? products : ALL_LINES
  let lostPerDay = 0, storeExcessUsd = 0
  for (const store of STORES) {
    if (countries.length && countries.indexOf(store.country) < 0) continue
    for (const code of STORY_TEAM_CODES) {
      if (teams.length && !inSel("T-" + code, teams)) continue
      const jc = jerseyCoverForCode(store, code)
      for (const l of lines) {
        const cover = l === "jersey" ? jc : capFromJersey(jc)
        const unitsDay = store.size * store.mix[code] * (LINE_WEIGHT[l] || 0)
        if (cover < COVER_UNDER / 100) lostPerDay += unitsDay * (1 - cover) * UNIT_REV
        else if (cover > COVER_OVER / 100) storeExcessUsd += unitsDay * 14 * (cover - 1) * UNIT_REV * MARKDOWN_WRITEOFF
      }
    }
  }
  const upstream = DEAD_POSITIONS.filter((p) =>
    (!countries.length || p.countries.some((c) => countries.indexOf(c) >= 0)) &&
    (!teams.length || inSel("T-" + p.teamCode, teams))
  ).reduce((s, p) => s + p.usd, 0)
  const lostSalesUsd = Math.round(lostPerDay * LOST_EFF_DAYS)
  const markdownUsd = Math.round(storeExcessUsd + upstream * lineFrac(products))
  const grossUsd = lostSalesUsd + markdownUsd
  const recoveredUsd = Math.min(grossUsd, selectRecommendations(f).reduce((s, r) => s + r.impactUsd, 0))
  return { lostSalesUsd, markdownUsd, grossUsd, recoveredUsd, residualUsd: Math.max(0, grossUsd - recoveredUsd) }
}

const BRIDGE_GROUPS = [
  { key: "redirect", label: "Redirect", levers: ["redirect", "replenish"] },
  { key: "rebalance", label: "Rebalance", levers: ["rebalance"] },
  { key: "expedite", label: "Expedite", levers: ["expedite"] },
  { key: "clearance", label: "Clearance", levers: ["markdown", "return"] },
]
export interface BridgeStep {
  key: string; label: string; usd: number; kind: "total" | "recovery"; afterUsd: number; recIds?: string[]
}
function selectBridge(f: BSFilter): { steps: BridgeStep[]; meta: ExposureMeta } {
  const meta = selectExposure(f)
  const recs = selectRecommendations(f).filter((r) => r.impactUsd > 0)
  const steps: BridgeStep[] = [{ key: "gross", label: "Gross exposure", usd: meta.grossUsd, kind: "total", afterUsd: meta.grossUsd }]
  let level = meta.grossUsd, pool = meta.recoveredUsd
  for (const g of BRIDGE_GROUPS) {
    const group = recs.filter((r) => g.levers.indexOf(r.lever) >= 0)
    if (!group.length) continue
    const v = Math.min(group.reduce((s, r) => s + r.impactUsd, 0), pool)
    if (v <= 0) continue
    pool -= v; level -= v
    steps.push({ key: g.key, label: g.label, usd: -v, kind: "recovery", afterUsd: level, recIds: group.map((r) => r.id) })
  }
  steps.push({ key: "residual", label: "Residual", usd: level, kind: "total", afterUsd: level })
  return { steps, meta }
}

export interface DecayStep { atHours: number; ids: string[]; actions: string[]; lostUsd: number }
export interface OptionDecay {
  horizonH: number; nowUsd: number; endUsd: number; in24Usd: number; in48Usd: number
  steps: DecayStep[]; meta: ExposureMeta
}
function selectOptionDecay(f: BSFilter): OptionDecay {
  const meta = selectExposure(f)
  const recs = selectRecommendations(f).filter((r) => r.impactUsd > 0)
  const sum = recs.reduce((s, r) => s + r.impactUsd, 0) || 1
  const k = meta.recoveredUsd / sum
  const horizonH = 72
  const parseH = (label: string) => {
    const m = /^([\d.]+)\s*([hd])$/.exec(label.trim())
    if (!m) return horizonH + 1
    return m[2] === "h" ? parseFloat(m[1]) : parseFloat(m[1]) * 24
  }
  const byHour = new Map<number, DecayStep>()
  for (const r of recs) {
    const h = parseH(r.expiresLabel)
    if (h > horizonH) continue
    const cur = byHour.get(h) || { atHours: h, ids: [], actions: [], lostUsd: 0 }
    cur.ids.push(r.id); cur.actions.push(r.action); cur.lostUsd += r.impactUsd * k
    byHour.set(h, cur)
  }
  const steps = Array.from(byHour.values()).sort((a, b) => a.atHours - b.atHours)
  const valueAt = (t: number) => meta.recoveredUsd - steps.filter((s) => s.atHours <= t).reduce((x, s) => x + s.lostUsd, 0)
  return { horizonH, nowUsd: meta.recoveredUsd, endUsd: valueAt(horizonH), in24Usd: valueAt(24), in48Usd: valueAt(48), steps, meta }
}

// ── Overview adapter ───────────────────────────────────────────────────────
export interface CoverColorEntry { dot: string; edge: string; fill: string; label: string }
const COVER_COLOR: Record<Band, CoverColorEntry> = {
  under: { dot: "#C97064", edge: "rgba(201,112,100,0.85)", fill: "rgba(201,112,100,0.16)", label: "Understocked" },
  balanced: { dot: "#7FA98A", edge: "rgba(127,169,138,0.72)", fill: "rgba(127,169,138,0.13)", label: "Balanced" },
  over: { dot: "#6E86B0", edge: "rgba(110,134,176,0.72)", fill: "rgba(110,134,176,0.13)", label: "Overstocked" },
}
const MAX_VOLUME = 475
function bubbleRadius(volume: number, min?: number, max?: number): number {
  if (min == null) min = 4; if (max == null) max = 13
  const t = Math.sqrt(Math.min(Math.max(volume, 0), MAX_VOLUME) / MAX_VOLUME)
  return min + t * (max - min)
}
const NET_PRICE = 55
function hashInt(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function rng(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
function smooth(a: number, b: number, x: number) { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
function trendShape(trend: Trend, u: number, phase: number): number {
  if (trend === "rising") return 0.74 + 0.26 * (0.45 * u + 0.55 * Math.pow(u, 0.8))
  if (trend === "spiky") return 0.82 + 0.08 * u + 0.1 * smooth(0.7, 1, u)
  if (trend === "cooling") return 1.26 - 0.26 * u
  return 0.97 + 0.04 * Math.sin(u * Math.PI * 2 + phase)
}
function salesSeries(end: number, trend: Trend, id: string, n?: number): number[] {
  if (n == null) n = 30
  const rand = rng(hashInt(id))
  const phase = rand() * Math.PI * 2
  const walkStep = 0.035 + rand() * 0.03
  const out: number[] = []
  let walk = 0
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1)
    walk += (rand() - 0.5) * walkStep
    walk = Math.max(-0.13, Math.min(0.13, walk))
    const grain = (rand() - 0.5) * 0.05
    const base = trendShape(trend, u, phase)
    out.push(Math.max(0, Math.round(end * base * (1 + walk + grain))))
  }
  if (out.length) out[out.length - 1] = Math.max(0, Math.round(end))
  return out
}
function trendDirFor(trend: Trend): TrendDir {
  if (trend === "rising" || trend === "spiky") return "up"
  if (trend === "cooling") return "down"
  return "flat"
}
export interface OverviewStore {
  id: string; name: string; country: string; lat: number; lng: number; atRiskUsd: number
  salesVolumeUnitsDay: number; coverPct: number; band: Band; volume: number[]; trendDir: TrendDir
}
function resolveStore(s: Store, teams: string[], products: string[]): OverviewStore {
  const m = storeMetrics(s, teams, products)
  const shortfall = m.coverPct < 100 ? (1 - m.coverPct / 100) * m.volume : 0
  return {
    id: s.id, name: s.metro, country: s.country, lat: s.lat, lng: s.lng,
    atRiskUsd: Math.round(shortfall * NEXT_MATCH_DAYS * NET_PRICE),
    salesVolumeUnitsDay: m.volume, coverPct: Math.round(m.coverPct), band: m.band,
    volume: salesSeries(m.volume, s.trend, s.id), trendDir: trendDirFor(s.trend),
  }
}
function selectOverviewStores(filter: BSFilter): OverviewStore[] {
  const teams = filter.teams, products = filter.products, countries = filter.countries
  const pool = countries.length === 0 ? STORES : STORES.filter((s) => countries.indexOf(s.country) >= 0)
  return pool.map((s) => resolveStore(s, teams, products))
}
export interface CountryFocus { lat: number; lng: number; altitude: number }
const COUNTRY_FOCUS: Record<string, CountryFocus> = {
  US: { lat: 39.5, lng: -98.35, altitude: 1.4 }, CA: { lat: 56.0, lng: -96.0, altitude: 1.3 },
  MX: { lat: 23.6, lng: -102.6, altitude: 1.2 }, BR: { lat: -10.0, lng: -53.0, altitude: 1.6 },
  AR: { lat: -34.0, lng: -64.0, altitude: 1.5 }, CO: { lat: 4.0, lng: -74.0, altitude: 1.1 },
  GB: { lat: 54.0, lng: -2.0, altitude: 0.9 }, FR: { lat: 46.6, lng: 2.4, altitude: 0.9 },
  ES: { lat: 40.0, lng: -3.7, altitude: 0.9 }, PT: { lat: 39.5, lng: -8.0, altitude: 0.9 },
  DE: { lat: 51.2, lng: 10.4, altitude: 0.9 }, NL: { lat: 52.2, lng: 5.3, altitude: 0.85 },
  IT: { lat: 42.8, lng: 12.5, altitude: 0.95 }, MA: { lat: 31.8, lng: -7.1, altitude: 0.9 },
  AE: { lat: 24.0, lng: 54.0, altitude: 0.8 }, SA: { lat: 24.0, lng: 45.0, altitude: 1.0 },
  JP: { lat: 36.2, lng: 138.3, altitude: 1.0 }, KR: { lat: 36.5, lng: 127.8, altitude: 0.95 },
  IN: { lat: 22.0, lng: 79.0, altitude: 1.4 }, AU: { lat: -25.0, lng: 133.8, altitude: 1.7 },
}

// ── Filter universe ──────────────────────────────────────────────────────────
export interface Country { id: string; name: string; flag: string }
const COUNTRIES: Country[] = [
  { id: "US", name: "United States", flag: "🇺🇸" }, { id: "CA", name: "Canada", flag: "🇨🇦" },
  { id: "MX", name: "Mexico", flag: "🇲🇽" }, { id: "BR", name: "Brazil", flag: "🇧🇷" },
  { id: "AR", name: "Argentina", flag: "🇦🇷" }, { id: "CO", name: "Colombia", flag: "🇨🇴" },
  { id: "GB", name: "United Kingdom", flag: "🇬🇧" }, { id: "FR", name: "France", flag: "🇫🇷" },
  { id: "ES", name: "Spain", flag: "🇪🇸" }, { id: "PT", name: "Portugal", flag: "🇵🇹" },
  { id: "DE", name: "Germany", flag: "🇩🇪" }, { id: "NL", name: "Netherlands", flag: "🇳🇱" },
  { id: "IT", name: "Italy", flag: "🇮🇹" }, { id: "MA", name: "Morocco", flag: "🇲🇦" },
  { id: "AE", name: "United Arab Emirates", flag: "🇦🇪" }, { id: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { id: "JP", name: "Japan", flag: "🇯🇵" }, { id: "KR", name: "South Korea", flag: "🇰🇷" },
  { id: "IN", name: "India", flag: "🇮🇳" }, { id: "AU", name: "Australia", flag: "🇦🇺" },
]
const ALL_COUNTRY_IDS = COUNTRIES.map((c) => c.id)
const PRODUCT_LABELS: Record<string, string> = { jersey: "Jerseys", cap: "Caps" }

// ── Formatters ───────────────────────────────────────────────────────────────
function usd(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? "−" : ""
  if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M"
  if (abs >= 1000) return sign + "$" + Math.round(abs / 1000) + "K"
  return sign + "$" + Math.round(abs)
}

// ── LeverBadge config ──────────────────────────────────────────────────────
const LEVER_LABEL: Record<string, string> = { redirect: "REDIRECT", rebalance: "REBALANCE", replenish: "REPLENISH", return: "RETURN", markdown: "CLEAR", expedite: "EXPEDITE" }
export interface LeverBadgeEntry { fg: string; bg: string }
const LEVER_BADGE: Record<string, LeverBadgeEntry> = {
  redirect: { fg: "var(--ins-indigo)", bg: "var(--ins-indigo-soft)" },
  rebalance: { fg: "var(--ins-indigo)", bg: "var(--ins-indigo-soft)" },
  replenish: { fg: "var(--text-secondary)", bg: "var(--bg-surface)" },
  return: { fg: "var(--ins-teal)", bg: "var(--ins-teal-soft)" },
  markdown: { fg: "var(--ins-red)", bg: "var(--ins-red-soft)" },
  expedite: { fg: "var(--ins-amber)", bg: "var(--ins-amber-soft)" },
}

export const BS = {
  LINE_WEIGHT, ALL_LINES, FUT, NEXT_MATCH_DAYS, MATCH_DAYS, MATCH_LABELS,
  TEAMS, ALL_TEAM_IDS, STORY_TEAM_IDS, STORY_TEAM_CODES,
  COVER_UNDER, COVER_OVER, COVER_COLOR, bubbleRadius,
  STORES, storeMetrics, selectDemandChange, selectIndexCurve,
  RECS, selectRecommendations, recsForStore, RUNWAY, WAREHOUSE_IDS,
  selectExposure, selectBridge, selectOptionDecay,
  selectOverviewStores, COUNTRY_FOCUS, COUNTRIES, ALL_COUNTRY_IDS, PRODUCT_LABELS,
  usd, LEVER_LABEL, LEVER_BADGE,
}
export default BS
