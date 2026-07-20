// Generates src/components/brickstore/land-grid.json — a static cloud of [lng,lat]
// land points at 2° resolution, so the Brickstore dotted globe needs no runtime
// fetch or topojson dependency.
//
// It downloads world-atlas land-110m.json, decodes the TopoJSON inline (no deps),
// then ray-casts the exact same 2° grid the kit's bs-map used (bsInRing, STEP=2,
// lat -60..84, lng -180..<180). Re-run with:  node scripts/gen-brickstore-land-grid.mjs
import { writeFileSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const SRC = "https://unpkg.com/world-atlas@2/land-110m.json"
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "brickstore", "land-grid.json")

// ── minimal TopoJSON decode (transform + delta-decoded arcs) ────────────────
function decodeArcs(topo) {
  const { scale, translate } = topo.transform
  return topo.arcs.map((arc) => {
    let x = 0, y = 0
    return arc.map(([dx, dy]) => {
      x += dx; y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
  })
}
function ringCoords(arcIndexes, decoded) {
  const coords = []
  for (let k = 0; k < arcIndexes.length; k++) {
    const idx = arcIndexes[k]
    let arc = idx < 0 ? decoded[~idx].slice().reverse() : decoded[idx]
    if (k > 0) arc = arc.slice(1)
    for (const p of arc) coords.push(p)
  }
  return coords
}
function geometryRings(geom, decoded) {
  // returns list of polygons, each polygon = list of rings, each ring = [[lng,lat],...]
  const polys = []
  if (geom.type === "Polygon") polys.push(geom.arcs.map((r) => ringCoords(r, decoded)))
  else if (geom.type === "MultiPolygon") for (const poly of geom.arcs) polys.push(poly.map((r) => ringCoords(r, decoded)))
  else if (geom.type === "GeometryCollection") for (const g of geom.geometries) polys.push(...geometryRings(g, decoded))
  return polys
}

// ── ray-cast (verbatim from bs-map.jsx) ─────────────────────────────────────
function bsInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

async function main() {
  console.log("Fetching", SRC)
  const res = await fetch(SRC)
  if (!res.ok) throw new Error("fetch failed: " + res.status)
  const topo = await res.json()
  const decoded = decodeArcs(topo)
  const polygonRings = geometryRings(topo.objects.land, decoded)

  const polys = []
  for (const rings of polygonRings) {
    const outer = rings[0]
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of outer) {
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0]
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]
    }
    polys.push({ rings, bbox: [minX, minY, maxX, maxY] })
  }
  const contains = (lng, lat) => {
    for (const poly of polys) {
      const b = poly.bbox
      if (lng < b[0] || lng > b[2] || lat < b[1] || lat > b[3]) continue
      if (!bsInRing(lng, lat, poly.rings[0])) continue
      let hole = false
      for (let h = 1; h < poly.rings.length; h++) { if (bsInRing(lng, lat, poly.rings[h])) { hole = true; break } }
      if (!hole) return true
    }
    return false
  }

  const out = []
  const STEP = 2
  for (let lat = -60; lat <= 84; lat += STEP) {
    for (let lng = -180; lng < 180; lng += STEP) {
      if (contains(lng, lat)) out.push([lng, lat])
    }
  }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(out))
  console.log("Wrote", out.length, "land points to", OUT)
}
main().catch((e) => { console.error(e); process.exit(1) })
