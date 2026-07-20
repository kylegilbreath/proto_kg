"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Kit app card: 16/9 gradient preview, optional status tag pinned top-left,
 * info row (icon + name + sub), and either an always-visible `trailing`
 * element or hover-revealed `actions` (overflow menu).
 */
export function AppCard({
  gradient,
  previewContent,
  tag,
  icon,
  name,
  sub,
  trailing,
  actions,
  onClick,
  className,
}: {
  gradient: string
  previewContent?: React.ReactNode
  tag?: React.ReactNode
  icon?: React.ReactNode
  name: string
  sub?: string
  trailing?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={cn("app-card", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className="preview" style={{ position: "relative", background: gradient }}>
        {previewContent}
      </div>
      {tag && <div className="card-tag">{tag}</div>}
      <div className="info">
        {icon}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="name truncate">{name}</div>
          {sub && <div className="owner truncate">{sub}</div>}
        </div>
        {trailing}
        {actions && <div className="card-actions">{actions}</div>}
      </div>
    </div>
  )
}
