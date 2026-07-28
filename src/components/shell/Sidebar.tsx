"use client"

import * as React from "react"
import { ChevronRightIcon } from "@/components/icons"
import { DbIcon } from "@/components/ui/db-icon"
import { NewButton } from "./NewButton"
import {
  NotebookIcon,
  ClockIcon,
  CatalogIcon,
  WorkflowsIcon,
  CloudIcon,
  StorefrontIcon,
  QueryEditorIcon,
  QueryIcon,
  BarChartIcon,
  AssistantIcon,
  GenieCodeIcon,
  NotificationIcon,
  HistoryIcon,
  DatabaseIcon,
  RunIcon,
  IngestionIcon,
  PipelineIcon,
  SparkleDoubleIcon,
  BeakerIcon,
  LayerIcon,
  ModelsIcon,
  PlayCircleIcon,
} from "@/components/icons"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  iconColor?: "default" | "muted" | "primary" | "ai"
  href?: string
}

type NavSection = {
  label?: string
  items: NavItem[]
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { id: "genie-code",  label: "Genie Code",  icon: GenieCodeIcon,  iconColor: "ai", href: "/genie-code-projects" },
      { id: "workspace",   label: "Workspace",   icon: NotebookIcon,   href: "/workspace" },
      { id: "recents",     label: "Recents",     icon: ClockIcon },
      { id: "catalog",     label: "Catalog",     icon: CatalogIcon,    href: "/catalog" },
      { id: "workflows",   label: "Workflows",   icon: WorkflowsIcon,  href: "/jobs" },
      { id: "compute",     label: "Compute",     icon: CloudIcon,      href: "/compute" },
      { id: "marketplace", label: "Marketplace", icon: StorefrontIcon },
    ],
  },
  {
    label: "SQL",
    items: [
      { id: "sql-editor",     label: "SQL Editor",     icon: QueryEditorIcon, href: "/sql" },
      { id: "queries",        label: "Queries",        icon: QueryIcon },
      { id: "dashboards",     label: "Dashboards",     icon: BarChartIcon,   href: "/dashboards" },
      { id: "genie",          label: "Genie",          icon: AssistantIcon },
      { id: "alerts",         label: "Alerts",         icon: NotificationIcon },
      { id: "query-history",  label: "Query History",  icon: HistoryIcon },
      { id: "sql-warehouses", label: "SQL Warehouses", icon: DatabaseIcon },
    ],
  },
  {
    label: "Data Engineering",
    items: [
      { id: "job-runs",       label: "Job Runs",       icon: RunIcon },
      { id: "data-ingestion", label: "Data Ingestion", icon: IngestionIcon },
      { id: "pipelines",      label: "Pipelines",      icon: PipelineIcon },
    ],
  },
  {
    label: "Machine Learning",
    items: [
      { id: "playground",  label: "Playground",  icon: SparkleDoubleIcon },
      { id: "experiments", label: "Experiments", icon: BeakerIcon },
      { id: "features",    label: "Features",    icon: LayerIcon },
      { id: "models",      label: "Models",      icon: ModelsIcon },
      { id: "serving",     label: "Serving",     icon: PlayCircleIcon },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  open?: boolean
  activeItem?: string
  onNavigate?: (id: string) => void
  className?: string
}

export function Sidebar({
  open = true,
  activeItem = "workspace",
  onNavigate,
  className,
}: SidebarProps) {
  // Labelled sections are collapsible; start all expanded
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const toggleSection = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-secondary transition-all duration-200 overflow-hidden",
        open ? "w-[200px]" : "w-0",
        className
      )}
    >
      {/* New button — Figma: 8px top padding, 16px gap below before first nav item */}
      {open && <div className="px-3 pb-4"><NewButton /></div>}

      {/* Nav — scrollable */}
      <nav
        className={cn(
          "flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-2",
          // Thin, styled scrollbar
          "[&::-webkit-scrollbar]:w-[5px]",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40",
        )}
      >

        {NAV_SECTIONS.map((section, i) => {
          const isSectionCollapsed = section.label ? !!collapsed[section.label] : false

          return (
            <div key={i} className="flex flex-col gap-0.5">
              {/* Collapsible section header */}
              {section.label && open && (
                <button
                  onClick={() => toggleSection(section.label!)}
                  className="group flex h-6 w-full items-center rounded px-3 text-left transition-colors hover:bg-[var(--action-default-bg-hover)]"
                >
                  <span className="text-xs font-normal text-muted-foreground">
                    {section.label}
                  </span>
                  <ChevronRightIcon
                    size={12}
                    className={cn(
                      "ml-auto shrink-0 text-muted-foreground transition-all duration-150",
                      // Collapsed: always visible, pointing right
                      // Expanded: hidden by default, visible on hover (pointing down)
                      isSectionCollapsed
                        ? "opacity-100"
                        : "rotate-90 opacity-0 group-hover:opacity-100"
                    )}
                  />
                </button>
              )}

              {/* Items — hidden when section is collapsed */}
              {!isSectionCollapsed && section.items.map((item) => (
                <NavItemButton
                  key={item.id}
                  item={item}
                  active={activeItem === item.id}
                  sidebarCollapsed={!open}
                  onClick={() => onNavigate?.(item.id)}
                />
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

// ─── Nav item button ──────────────────────────────────────────────────────────

function NavItemButton({
  item,
  active,
  sidebarCollapsed,
  onClick,
}: {
  item: NavItem
  active: boolean
  sidebarCollapsed: boolean
  onClick: () => void
}) {
  const className = cn(
    // Figma: h-28px, px-12px, gap-8px, rounded-4px, text-13px
    "group flex h-7 w-full items-center gap-2 rounded px-3 text-left text-sm transition-colors",
    active
      ? "bg-primary/10 text-primary font-semibold"
      : "text-foreground hover:bg-[var(--action-default-bg-hover)]",
    sidebarCollapsed && "justify-center px-0"
  )

  const content = (
    <>
      <span className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
        // Active: primary (blue). Inactive: muted by default, foreground on hover.
        active
          ? "text-primary"
          : "text-muted-foreground group-hover:text-foreground"
      )}>
        <DbIcon icon={item.icon} size={16} color={item.iconColor === "ai" ? "ai" : "default"} />
      </span>
      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
    </>
  )

  if (item.href) {
    return (
      <Link href={item.href} title={sidebarCollapsed ? item.label : undefined} className={className} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} title={sidebarCollapsed ? item.label : undefined} className={className}>
      {content}
    </button>
  )
}
