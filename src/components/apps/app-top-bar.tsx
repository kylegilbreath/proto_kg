"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  AppWindow,
  ChevronDown,
  ChevronLeft,
  MoreHorizontal,
  Moon,
  PanelLeft,
  Search,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GenieIcon } from "./genie-icon"
import { BrickworkMark } from "./brickwork-mark"
import { ProductSwitcher } from "./product-switcher"
import { KitDropdown, KitDropdownItem } from "./primitives"

/* ── Theme switcher (next-themes; kit shows sun while dark) ── */
export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"
  const IconCmp = isDark ? Sun : Moon
  return (
    <button
      type="button"
      className="btn-icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <IconCmp className="lucide" />
    </button>
  )
}

export function GenieTopButton({ open, onToggle }: { open?: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      className={cn("topbar-genie", open && "active")}
      aria-label="Genie Code"
      aria-pressed={open}
      onClick={onToggle}
    >
      <GenieIcon size={16} />
    </button>
  )
}

/* ── Breadcrumb switcher (searchable app/space switcher on a crumb) ── */
export interface SwitcherItem {
  id: string
  name: string
  sub?: string
  icon?: LucideIcon
}

export interface SwitcherAction {
  id: string
  label: string
  icon: LucideIcon
  onClick?: () => void
  primary?: boolean
  inline?: boolean
  danger?: boolean
}

export interface CrumbSwitcher {
  placeholder: string
  items: SwitcherItem[]
  currentId?: string
  onSelect?: (id: string) => void
  actions?: SwitcherAction[]
}

export interface CrumbDef {
  label: string
  leaf?: boolean
  onClick?: () => void
  paren?: string
  switcher?: CrumbSwitcher
}

function BreadcrumbSwitcher({ sw }: { sw: CrumbSwitcher }) {
  const [q, setQ] = React.useState("")
  const current = sw.items.find((it) => it.id === sw.currentId)
  const rest = sw.items.filter((it) => {
    if (it.id === sw.currentId) return false
    const s = q.trim().toLowerCase()
    if (!s) return true
    return it.name.toLowerCase().includes(s) || (it.sub || "").toLowerCase().includes(s)
  })
  const actions = sw.actions || []
  const primary = actions.filter((a) => a.primary)
  const inline = actions.filter((a) => a.inline && !a.primary)
  const overflow = actions.filter((a) => !a.primary && !a.inline)
  const CurrentIcon = current?.icon || AppWindow

  return (
    <>
      {current && (
        <div className="app-switch-current" onClick={(e) => e.stopPropagation()}>
          <div className="app-switch-current-head">
            <CurrentIcon className="lucide" />
            <span className="app-switch-text">
              <span className="app-switch-name truncate">{current.name}</span>
              {current.sub && <span className="app-switch-space truncate">{current.sub}</span>}
            </span>
            <span className="app-switch-current-tag">Current</span>
          </div>
          {actions.length > 0 && (
            <div className="app-switch-actions">
              {primary.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="app-switch-action primary"
                  onClick={() => a.onClick?.()}
                >
                  <a.icon className="lucide" />
                  {a.label}
                </button>
              ))}
              {inline.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="app-switch-action"
                  onClick={() => a.onClick?.()}
                >
                  <a.icon className="lucide" />
                  {a.label}
                </button>
              ))}
              {overflow.length > 0 && (
                <KitDropdown
                  align="end"
                  width={180}
                  trigger={
                    <button
                      type="button"
                      className="app-switch-action app-switch-more"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="lucide" />
                    </button>
                  }
                >
                  {overflow.map((a) => (
                    <KitDropdownItem key={a.id} icon={a.icon} danger={a.danger} onClick={() => a.onClick?.()}>
                      {a.label}
                    </KitDropdownItem>
                  ))}
                </KitDropdown>
              )}
            </div>
          )}
        </div>
      )}

      <div className="app-switch-sep-label">Switch to another app</div>
      <div className="app-switch-search" onClick={(e) => e.stopPropagation()}>
        <Search className="lucide" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={sw.placeholder}
          aria-label={sw.placeholder}
          autoFocus
        />
      </div>
      <div className="app-switch-list">
        {rest.map((it) => {
          const ItemIcon = it.icon || AppWindow
          return (
            <button
              key={it.id}
              type="button"
              className="app-switch-item"
              onClick={() => sw.onSelect?.(it.id)}
            >
              <ItemIcon className="lucide" />
              <span className="app-switch-text">
                <span className="app-switch-name truncate">{it.name}</span>
                {it.sub && <span className="app-switch-space truncate">{it.sub}</span>}
              </span>
            </button>
          )
        })}
        {rest.length === 0 && <div className="app-switch-empty">No matches</div>}
      </div>
    </>
  )
}

function Crumb({ crumb, lead }: { crumb: CrumbDef; lead: boolean }) {
  const inner = (
    <>
      {lead && <ChevronLeft className="lucide" />}
      <span className="truncate">{crumb.label}</span>
      {crumb.paren && <span className="tb-paren">({crumb.paren})</span>}
      {crumb.switcher && <ChevronDown className="lucide" />}
    </>
  )
  const cls = cn("tb-crumb", crumb.leaf && "leaf", lead && "tb-back")
  if (crumb.switcher) {
    return (
      <KitDropdown
        align="start"
        width={300}
        closeOnClick
        trigger={
          <button type="button" className={cls}>
            {inner}
          </button>
        }
      >
        <BreadcrumbSwitcher sw={crumb.switcher} />
      </KitDropdown>
    )
  }
  if (crumb.leaf && !lead) return <span className={cls}>{inner}</span>
  return (
    <button type="button" className={cls} onClick={crumb.onClick}>
      {inner}
    </button>
  )
}

export function KitBreadcrumb({ crumbs }: { crumbs: CrumbDef[] }) {
  const multi = crumbs.length > 1
  return (
    <nav className="tb-crumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="tb-sep">/</span>}
          <Crumb crumb={c} lead={i === 0 && multi} />
        </React.Fragment>
      ))}
    </nav>
  )
}

/* ── Global controls (present on every apps page) ────────── */
export function GlobalControls({
  env = true,
  genie = false,
  genieOpen,
  onToggleGenie,
}: {
  env?: boolean
  genie?: boolean
  genieOpen?: boolean
  onToggleGenie?: () => void
}) {
  return (
    <>
      {env && (
        <button type="button" className="topbar-ws">
          <span>Production</span>
          <ChevronDown className="lucide" />
        </button>
      )}
      {genie && <GenieTopButton open={genieOpen} onToggle={onToggleGenie} />}
      <ProductSwitcher />
      <ThemeSwitcher />
      <button type="button" className="topbar-avatar" aria-label="User menu">
        W
      </button>
    </>
  )
}

/* ── App top bar (48px, shared across shell/detail/space pages) ── */
export function AppTopBar({
  toggle = true,
  onToggleSidebar,
  logo = true,
  crumbs,
  actions,
  env = true,
  genie = false,
  genieOpen,
  onToggleGenie,
}: {
  toggle?: boolean
  onToggleSidebar?: () => void
  logo?: boolean
  crumbs: CrumbDef[]
  actions?: React.ReactNode
  env?: boolean
  genie?: boolean
  genieOpen?: boolean
  onToggleGenie?: () => void
}) {
  return (
    <header className="topbar">
      <div className="tb-left">
        {toggle && (
          <button type="button" className="btn-icon" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
            <PanelLeft className="lucide" />
          </button>
        )}
        {logo && <BrickworkMark height={18} />}
        <KitBreadcrumb crumbs={crumbs} />
      </div>
      <div style={{ flex: 1 }} />
      <div className="topbar-right">
        {actions}
        <GlobalControls env={env} genie={genie} genieOpen={genieOpen} onToggleGenie={onToggleGenie} />
      </div>
    </header>
  )
}
