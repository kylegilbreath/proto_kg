"use client"

import * as React from "react"
import type { BSFilter } from "./bs-data"

export type BSTheme = "light" | "dark"
export type BSView = "globe" | "flat"

// Replaces the kit's `window.BSCtx`. Shared filter + interaction state for the
// whole Brickstore app, provided by BrickstoreApp in bs-app.tsx.
export interface BSContextValue {
  filter: BSFilter
  setTeams: (ids: string[]) => void
  toggleTeam: (id: string) => void
  setProducts: (ids: string[]) => void
  toggleProduct: (id: string) => void
  setCountries: (ids: string[]) => void
  toggleCountry: (id: string) => void
  view: BSView
  setView: (v: BSView) => void
  problemsOnly: boolean
  setProblemsOnly: (v: boolean) => void
  hoveredId: string | null
  setHovered: (id: string | null) => void
  expandedId: string | null
  toggleExpanded: (id: string) => void
  linkedStoreId: string | null
  setLinkedStore: (id: string | null) => void
  approved: Set<string>
  approve: (id: string) => void
  undo: (id: string) => void
  theme: BSTheme
  scrollEl: HTMLElement | null
  scrollToSection: (id: string) => void
}

export const BSCtx = React.createContext<BSContextValue | null>(null)

export function useBSCtx(): BSContextValue {
  const ctx = React.useContext(BSCtx)
  if (!ctx) throw new Error("useBSCtx must be used within a BrickstoreApp")
  return ctx
}

// Where BSSectionRail / BSReviewPanel portal to. The builder's preview panel
// will provide its `.pv-preview` element here; when null (the standalone
// preview route), they fall back to portaling into the .bs-root element itself
// (which is position: relative), via BSContextValue.scrollEl.
export const BSPortalContext = React.createContext<HTMLElement | null>(null)
