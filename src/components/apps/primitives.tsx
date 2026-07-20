"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TagVariant } from "@/lib/apps-data"

/* ── Tag ─────────────────────────────────────────────────── */
export function Tag({
  variant = "default",
  size,
  style,
  className,
  children,
}: {
  variant?: TagVariant
  size?: "sm"
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn("tag", `tag-${variant}`, size === "sm" && "tag-sm", className)} style={style}>
      {children}
    </span>
  )
}

/* ── Segmented (kit style: inverse fill active) ──────────── */
export interface SegmentedOption {
  value: string
  label: string
  icon?: LucideIcon
}

export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: SegmentedOption[]
}) {
  return (
    <div className="segmented">
      {options.map((o) => {
        const IconCmp = o.icon
        return (
          <button
            key={o.value}
            type="button"
            className={cn("seg-item", value === o.value && "active")}
            onClick={() => onChange(o.value)}
            aria-label={o.label}
            aria-pressed={value === o.value}
          >
            {IconCmp ? <IconCmp className="lucide" /> : o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Dropdown (kit behavior: click-outside, auto-flip, closes on item click) ── */
export function KitDropdown({
  trigger,
  children,
  align = "end",
  width = 180,
  closeOnClick = true,
}: {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "start" | "end"
  width?: number
  closeOnClick?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [up, setUp] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect()
      setUp(window.innerHeight - r.bottom < 180)
    }
    setOpen((o) => !o)
  }

  return (
    <div style={{ position: "relative" }} ref={ref}>
      {/* clicks bubble up from the trigger element */}
      <div style={{ display: "contents" }} onClick={toggle}>
        {trigger}
      </div>
      {open && (
        <div
          className="dropdown"
          style={{
            position: "absolute",
            [up ? "bottom" : "top"]: "calc(100% + 4px)",
            ...(align === "start" ? { left: 0 } : { right: 0 }),
            width,
            zIndex: 70,
          }}
          onClick={closeOnClick ? () => setOpen(false) : undefined}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function KitDropdownItem({
  icon: IconCmp,
  danger,
  children,
  className,
  ...props
}: {
  icon?: LucideIcon
  danger?: boolean
  children: React.ReactNode
} & React.ComponentProps<"button">) {
  return (
    <button type="button" className={cn("dropdown-item", danger && "danger", className)} {...props}>
      {IconCmp && <IconCmp className="lucide" />}
      {children}
    </button>
  )
}

export function KitDropdownSep() {
  return <div className="dropdown-sep" />
}

/* ── Modal (kit: scrim + 420px surface, Escape closes) ───── */
export function KitModal({
  onClose,
  children,
  width,
}: {
  onClose: () => void
  children: React.ReactNode
  width?: number
}) {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Sparkline ───────────────────────────────────────────── */
export function Sparkline({
  data,
  color = "var(--success)",
  height = 48,
}: {
  data: number[]
  color?: string
  height?: number
}) {
  const w = 200
  const h = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h * 0.75 - h * 0.1
      return `${x},${y}`
    })
    .join(" ")
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ── Metric tile (label + sparkline + value/change) ──────── */
export function Metric({
  label,
  data,
  color,
  value,
  change,
}: {
  label: string
  data: number[]
  color?: string
  value: string
  change?: string
}) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <Sparkline data={data} color={color} />
      <div className="metric-value">
        <span className="v">{value}</span>
        {change && <span className="c">{change}</span>}
      </div>
    </div>
  )
}

/* ── Page header (kit style: 20px/500 title) ─────────────── */
export function KitPageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div style={{ minWidth: 0 }}>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}
