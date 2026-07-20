"use client"

import * as React from "react"
import { AppTopBar } from "@/components/apps/app-top-bar"
import { GeniePanel } from "@/components/apps/genie-panel"
import { AppsSidebar } from "./AppsSidebar"
import { cn } from "@/lib/utils"

interface AppsShellProps {
  children: React.ReactNode
  className?: string
  mainClassName?: string
  /** Render children directly (no bordered main card). */
  bare?: boolean
}

export function AppsShell({ children, className, mainClassName, bare }: AppsShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [genieOpen, setGenieOpen] = React.useState(false)

  return (
    <div className={cn("shell", className)}>
      <AppTopBar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        crumbs={[{ label: "Databricks Apps", leaf: true }]}
        env
        genie
        genieOpen={genieOpen}
        onToggleGenie={() => setGenieOpen((v) => !v)}
      />
      <div className="shell-body">
        <AppsSidebar open={sidebarOpen} />
        {bare ? (
          children
        ) : (
          <main className={cn("shell-main", mainClassName)} style={{ marginLeft: sidebarOpen ? 0 : 8 }}>
            {children}
          </main>
        )}
        {genieOpen && <GeniePanel onClose={() => setGenieOpen(false)} />}
      </div>
    </div>
  )
}
