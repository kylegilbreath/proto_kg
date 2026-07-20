"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppWindow, Folders, LayoutGrid } from "lucide-react"
import { GenieIcon } from "@/components/apps/genie-icon"
import { cn } from "@/lib/utils"

const QUICK_ACCESS = ["cost-insight-app", "db-chatbot-dev-joy", "fiscal-overview"]

interface AppsSidebarProps {
  open?: boolean
  className?: string
}

export function AppsSidebar({ open = true, className }: AppsSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const activeId = React.useMemo(() => {
    if (pathname.startsWith("/apps/list")) return "apps"
    if (pathname.startsWith("/apps/spaces")) return "app-spaces"
    return "build"
  }, [pathname])

  const nav = [
    { id: "build", label: "Build", href: "/apps", icon: null },
    { id: "apps", label: "Apps", href: "/apps/list", icon: LayoutGrid },
    { id: "app-spaces", label: "App Spaces", href: "/apps/spaces", icon: Folders },
  ]

  return (
    <aside className={cn("sidebar", !open && "collapsed", className)}>
      <nav className="sidebar-nav">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn("nav-item", activeId === item.id && "active")}
            onClick={() => router.push(item.href)}
          >
            {item.icon ? (
              <item.icon className="lucide" />
            ) : (
              <GenieIcon size={14} fill="currentColor" />
            )}
            <span className="truncate">{item.label}</span>
          </button>
        ))}

        <div className="nav-section">Quick access</div>
        {QUICK_ACCESS.map((id) => (
          <div key={id} className="qa-row">
            <button
              type="button"
              className="nav-item qa-name"
              onClick={() => router.push(`/apps/${id}`)}
            >
              <AppWindow className="lucide" />
              <span className="truncate">{id}</span>
            </button>
            <button
              type="button"
              className="qa-build"
              aria-label={`Open ${id} in builder`}
              title="Open in builder"
              onClick={() => router.push(`/apps/${id}/builder`)}
            >
              <GenieIcon size={13} fill="currentColor" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  )
}
