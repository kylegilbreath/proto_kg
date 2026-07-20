"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  X,
  Lock,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ScanSearch,
  RotateCcw,
  LayoutGrid,
  Sun,
  Moon,
  Bell,
  Filter,
  Earth,
  Map as MapIcon,
  type LucideIcon,
} from "lucide-react"

// The kit referenced lucide icons by kebab-case name via a global `Icon` helper.
// This maps those names to lucide-react components (kebab → Pascal).
const ICONS: Record<string, LucideIcon> = {
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  search: Search,
  check: Check,
  x: X,
  lock: Lock,
  "sliders-horizontal": SlidersHorizontal,
  "arrow-up-right": ArrowUpRight,
  "arrow-down-right": ArrowDownRight,
  "scan-search": ScanSearch,
  "rotate-ccw": RotateCcw,
  "layout-grid": LayoutGrid,
  sun: Sun,
  moon: Moon,
  bell: Bell,
  filter: Filter,
  "globe-2": Earth,
  map: MapIcon,
}

export function Icon({
  name,
  size = 14,
  style,
  className,
  strokeWidth,
}: {
  name: string
  size?: number
  style?: React.CSSProperties
  className?: string
  strokeWidth?: number
}) {
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp size={size} style={style} className={className} strokeWidth={strokeWidth} />
}
