"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 32px ghost icon button — the kit's `<IconButton name label />`, ported to take
 * a lucide component directly. Renders `.btn-icon` from the scoped apps theme.
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  className,
  style,
}: {
  icon: LucideIcon
  label: string
  onClick?: (e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <button
      type="button"
      className={cn("btn-icon", className)}
      aria-label={label}
      title={label}
      onClick={onClick}
      style={style}
    >
      <Icon className="lucide" />
    </button>
  )
}
